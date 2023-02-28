import {Injectable} from '@angular/core';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {DateService} from 'src/app/shared/service/date.service';
import {DatePipe} from '@angular/common';
import {WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {ShiftService} from './shift.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import * as rfdc from 'rfdc';
import {VerificationContraintePlanningEquipierService} from './verification-contrainte-planning-equipier.service';
import {PlgEquipierHelperService} from './plg-equipier-helper.service';


@Injectable({
  providedIn: 'root'
})
export class MethodeUsefulToPlgEquipierService {
  public clone = rfdc();

  constructor(private dateService: DateService, private datePipe: DatePipe,
              private shiftService: ShiftService,
              private plgEquipierHelperService: PlgEquipierHelperService,
              private helperService: HelperService,
              private verificationContraintePlanningEquipierService: VerificationContraintePlanningEquipierService) {
  }

  /**
   * ajouter des shifts dans employeeWeekShiftCS pour la verification des contraintes sociales
   * @param newActiveEmployees
   * @param actifEmployeeToUpdate
   */
  public setEmployeeWeekShiftCS(newActiveEmployees: EmployeeModel[], actifEmployeeToUpdate: number): EmployeeModel[] {
    newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS = [];
    if (newActiveEmployees[actifEmployeeToUpdate] && newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings) {
      newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        if (wdp.shifts.length) {
          newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS = newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.concat(JSON.parse(JSON.stringify(wdp.shifts)));
          newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.forEach((element: ShiftModel) => {
            element.heureFin = new Date(Date.parse(element.heureFin));
            element.heureDebut = new Date(Date.parse(element.heureDebut));
            element.heureDebutCheval = new Date(Date.parse(element.heureDebutCheval));
            element.heureFinCheval = new Date(Date.parse(element.heureFinCheval));
            this.dateService.setCorrectTimeToDisplayForShift(element);
          });
        }
      });
    }
    return newActiveEmployees;
  }

  /**
   * Modifier list de shift apres sauvegarde
   */
  public setListShiftAfterSave(currentPlanning: any, data: ShiftModel[], weeklyDetailsPlanning: WeekDetailsPlanning[], newActiveEmployees: EmployeeModel[], listShiftToUpdate: ShiftModel[], listShift: ShiftModel[], selectedEmployee: EmployeeModel, frConfig: any, decoupageHoraireFinEtDebutActivity: any, selectedDate: Date, modeAffichage: number): any {
    data.forEach((sh: ShiftModel) => {
      let index = listShift.findIndex((value: ShiftModel) => value.idShift === sh.idShift);
      if (index !== -1) {
        listShift[index].acheval = sh.acheval;
        listShift[index].modifiable = (this.datePipe.transform(selectedDate, 'yyyy-MM-dd') === this.datePipe.transform(sh.dateJournee, 'yyyy-MM-dd'));
      }

      index = listShiftToUpdate.findIndex((value: ShiftModel) => value.idShift === sh.idShift);
      if (index !== -1) {
        sh.acheval = listShiftToUpdate[index].acheval;
        sh.modifiable = listShiftToUpdate[index].modifiable;
        sh.idDefaultEmploye = listShiftToUpdate[index].idDefaultEmploye;
      }
    });
    // data = this.shiftService.filterShifts(data.filter(sh => !sh.fromPlanningManager), this.frConfig, this.decoupageHoraireFinEtDebutActivity);
    let employeesToUpdate = [];

    listShift.forEach((item: ShiftModel) => {
      if (item.acheval && !item.modifiable) {
        item.heureDebutIsNight = false;
        item.heureFinIsNight = false;
      }
    });

    if (data.length > 0) {
      data.forEach(item => {
        this.dateService.setCorrectTimeToDisplayForShift(item);
        item.totalHeureACheval = this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
        if (modeAffichage !== 0) {
          this.plgEquipierHelperService.setAChevalValues(item);
        }
        if (this.datePipe.transform(selectedDate, 'yyyy-MM-dd') === this.datePipe.transform(item.dateJournee, 'yyyy-MM-dd')) {
          item.modifiable = true;
          const indexShift = listShift.findIndex((val: ShiftModel) => val.idShift === item.idShift);
          if (indexShift !== -1) {
            listShift.splice(indexShift, 1);
            listShift.push(item);
          } else {
            listShift.push(item);
          }
        }
        //Update list shift affichée de la semaine
        if (weeklyDetailsPlanning.length) {
          if (!item.heureDebutCheval) {
            item.heureDebutCheval = item.heureDebut;
          }
          if (!item.heureFinCheval) {
            item.heureFinCheval = item.heureFin;
          }
          weeklyDetailsPlanning.forEach((wdp: any) => {
            for (let i = 0; i < wdp.shifts.length; i++) {
              if ((isNaN(Number(wdp.shifts[i].idShift))) || (wdp.shifts[i].idShift === 0)) {
                wdp.shifts.splice(i, 1);
                i--;
              }
            }
            const indexShift = wdp.shifts.findIndex((val: ShiftModel) => val.idShift === item.idShift && item.employee && val.employee.idEmployee === item.employee.idEmployee);
            if (indexShift !== -1) {
              wdp.shifts.splice(indexShift, 1);
              wdp.shifts.push(item);
            } else if (this.datePipe.transform(wdp.dateJour, 'yyyy-MM-dd') === this.datePipe.transform(item.dateJournee, 'yyyy-MM-dd')
              && item.employee && selectedEmployee.idEmployee === item.employee.idEmployee) {
              wdp.shifts.push(item);
            }
          });
        }
        weeklyDetailsPlanning = [...weeklyDetailsPlanning];
        //update weekly list shift
        if (item.employee) {
          const indexEmploye = newActiveEmployees.findIndex((employe: EmployeeModel) => employe.idEmployee === item.employee.idEmployee);
          if (indexEmploye !== -1) {
            const weeklyDetailsToRemoveFrom = newActiveEmployees[indexEmploye].weekDetailsPlannings.find((wdp: WeekDetailsPlanning) => wdp.dateJour === this.datePipe.transform(item.dateJournee, 'yyyy-MM-dd'));
            if(weeklyDetailsToRemoveFrom ) {
              weeklyDetailsToRemoveFrom.shifts.push(item);
            }
            if(!currentPlanning){
              weeklyDetailsToRemoveFrom.shifts = weeklyDetailsToRemoveFrom.shifts.filter((wsh: ShiftModel)=> (wsh.fromShiftFix && wsh.oldShiftFixId) || !wsh.fromShiftFix);
            }
              employeesToUpdate.push(item.employee.idEmployee);
          }
        }
      });
      data = this.shiftService.filterShifts(data.filter(sh => !sh.fromPlanningManager), frConfig, decoupageHoraireFinEtDebutActivity);

    }
    if (employeesToUpdate.length > 0) {
      employeesToUpdate.forEach((employeId: number) => {
        const indexEmploye = newActiveEmployees.findIndex((employe: EmployeeModel) => employe.idEmployee === employeId);
        if (indexEmploye !== -1) {
          listShift.forEach((shift: ShiftModel) => {
            this.verificationContraintePlanningEquipierService.addShiftToEmployeeWeekContrainteSociale(newActiveEmployees[indexEmploye], shift);
          });
          if (weeklyDetailsPlanning.length) {
            weeklyDetailsPlanning.forEach((wdp: any) => {
              wdp.shifts.forEach((shift: ShiftModel) => {
                this.verificationContraintePlanningEquipierService.addShiftToEmployeeWeekContrainteSociale(newActiveEmployees[indexEmploye], shift);
              });
            });
          }
          newActiveEmployees[indexEmploye].weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
            for (let i = 0; i < wdp.shifts.length; i++) {
              if ((isNaN(Number(wdp.shifts[i].idShift))) || (wdp.shifts[i].idShift === 0)) {
                wdp.shifts.splice(i, 1);
                i--;
              }
            }
          });
          newActiveEmployees[indexEmploye].weekDetailsPlannings.forEach((wdp: any) => {
            const weekShiftSet = new Set();
            wdp.shifts = wdp.shifts.filter((shift: ShiftModel) => {
              const duplicate = weekShiftSet.has(shift.idShift);
              weekShiftSet.add(shift.idShift);
              return !duplicate;
            });
          });
        }
        newActiveEmployees = this.setEmployeeWeekShiftCS(newActiveEmployees, indexEmploye);
      });
    }

    for (let i = 0; i < listShift.length; i++) {
      if ((isNaN(Number(listShift[i].idShift))) || (listShift[i].idShift === 0)) {
        listShift.splice(i, 1);
        i--;
      }
    }
    if (weeklyDetailsPlanning.length) {
      weeklyDetailsPlanning.forEach((wdp: any) => {
        const weekShiftSet = new Set();
        wdp.shifts = wdp.shifts.filter(shift => {
          const duplicate = weekShiftSet.has(shift.idShift);
          weekShiftSet.add(shift.idShift);
          return !duplicate;
        });
      });

    }
    const shiftSet = new Set();
    listShift = listShift.filter(shift => {

      const duplicate = shiftSet.has(shift.idShift);
      shiftSet.add(shift.idShift);
      return !duplicate;
    });
    data = this.shiftService.filterShifts(data.filter(sh => !sh.fromPlanningManager), frConfig, decoupageHoraireFinEtDebutActivity);
    return {newActiveEmployees: newActiveEmployees, listShiftToUpdate: listShiftToUpdate, listShift: listShift, data: data, weeklyDetailsPlanning: weeklyDetailsPlanning};

  }

}

