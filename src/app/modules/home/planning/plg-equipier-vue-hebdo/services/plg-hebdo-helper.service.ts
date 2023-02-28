import {Injectable} from '@angular/core';
import {DateService} from 'src/app/shared/service/date.service';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import { ShiftModel } from 'src/app/shared/model/shift.model';
import { TotalCaPerDay } from 'src/app/shared/model/details-temps-paye';
import { EmployeeModel } from 'src/app/shared/model/employee.model';


@Injectable({
  providedIn: 'root'
})
export class PlgHebdoHelperService {

  constructor(private dateService: DateService,
             private sharedRestaurant: SharedRestaurantService) {
  }
  private calculTotalPlanifeAffecte(day: any, listShift: ShiftModel[], activeEmployeesPerWeek: EmployeeModel[], listEmployeeHasShift: EmployeeModel[]): {totalAffecte: number, totalPlanifie:number}{
    let totalAffecte = 0;
    let totalPlanifie = 0;
    listShift.forEach((shift:ShiftModel)=>{
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      if(shift.employee && shift.employee.idEmployee && shift.employee.idEmployee !== 0){
        const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel)=> emp.idEmployee === shift.employee.idEmployee);
        if(indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].tempsAffecteData){
          if(!day){
            activeEmployeesPerWeek[indexEmployee].tempsAffecteData.forEach(element=> totalAffecte += element.value);
          } 
      } 
      } else {
        totalPlanifie += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      }
    });
    listEmployeeHasShift.forEach((empDisplay: EmployeeModel) => {
      const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel)=> empDisplay.idEmployee && emp.idEmployee === empDisplay.idEmployee && !empDisplay.isManagerOrLeader);
      if(indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].tempsAffecteData){
        if(day) {
          const dayIndex = activeEmployeesPerWeek[indexEmployee].tempsAffecteData.findIndex(val=> val.day === day.val);
          if(dayIndex !== -1){
            totalAffecte += activeEmployeesPerWeek[indexEmployee].tempsAffecteData[dayIndex].value;
          }
        }
    } 
    });
    totalPlanifie += totalAffecte;
    return {totalAffecte, totalPlanifie};
  }

  private calculTotalPlanifeAffecteSemaine(listShift: ShiftModel[], activeEmployeesPerWeek: EmployeeModel[], listEmployeeHasShift: EmployeeModel[]): {totalAffecte: number, totalPlanifie:number}{
    let totalAffecte = 0;
    let totalPlanifie = 0;
    listEmployeeHasShift.forEach((employe: EmployeeModel)=>{
      const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel)=> emp.idEmployee && emp.idEmployee === employe.idEmployee);
      if(indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].tempsAffecteData && !employe.isManagerOrLeader){
          activeEmployeesPerWeek[indexEmployee].tempsAffecteData.forEach(element=> {
          totalAffecte += element.value;
          });
      } 
    });
    listShift.forEach((shift:ShiftModel)=>{
      if(shift.employee && !shift.employee.idEmployee){
        totalPlanifie += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
       
      }
    });
    totalPlanifie += totalAffecte;
    return {totalAffecte, totalPlanifie};
  }
  private calculTotalAbsenceSemaine(activeEmployeesPerWeek: EmployeeModel[], listEmployeeHasShift: EmployeeModel[]): number {
    let totalAbsence = 0;
    listEmployeeHasShift.forEach((employe: EmployeeModel) => {
      const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
      if (indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].absenceConges && activeEmployeesPerWeek[indexEmployee].absenceConges.length) {
        activeEmployeesPerWeek[indexEmployee].weekDetailsPlannings.forEach((wdp: any) => {
          if(wdp.totalAbsence){
            totalAbsence += wdp.totalAbsence
          }
        });
      }
    });
    return totalAbsence;
  }
  private calculTotalAffecteML(listEmployeeHasShift: EmployeeModel[], activeEmployeesPerWeek: EmployeeModel[]): number{
    let totalManagerLeader = 0;
    listEmployeeHasShift.forEach((employe: EmployeeModel)=>{
      const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel)=> emp.idEmployee === employe.idEmployee && employe.idEmployee);
      if(indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].tempsAffecteData && employe.isManagerOrLeader){
          activeEmployeesPerWeek[indexEmployee].tempsAffecteData.forEach(element=> totalManagerLeader +=element.value);
      } 
    });

    return totalManagerLeader;
  }


  public calculTotauxSemaine(listShift: ShiftModel[], activeEmployeesList: EmployeeModel[], detailTempsPayeWeek: any, displayPlgManagers: boolean, listShiftManagerLeader: ShiftModel[], listEmployeeHasShift: EmployeeModel[]): any{
    let {totalAffecte, totalPlanifie} = this.calculTotalPlanifeAffecteSemaine(listShift, activeEmployeesList, listEmployeeHasShift);
    if (detailTempsPayeWeek.totalCA === 0) {
       detailTempsPayeWeek.tauxMOEMoyen = 0;
       if (displayPlgManagers) {
        const totalManagerLeader = this.calculTotalAffecteML(listEmployeeHasShift, activeEmployeesList);
        totalAffecte += totalManagerLeader;
        totalPlanifie += totalManagerLeader;
      }
    } else {
      //  detailTempsPayeWeek.tauxMOEMoyen = (Math.round(((this.sharedRestaurant.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (totalPlanifie / 60)) / detailTempsPayeWeek.totalCA) * 100) / 100).toFixed(2);
       detailTempsPayeWeek.tauxMOEMoyen = ((this.sharedRestaurant.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (totalPlanifie / 60)) / detailTempsPayeWeek.totalCA).toFixed(2);
       if (displayPlgManagers) {
        const totalManagerLeader = this.calculTotalAffecteML(listEmployeeHasShift, activeEmployeesList);
        totalAffecte += totalManagerLeader;
        totalPlanifie += totalManagerLeader;
        detailTempsPayeWeek.tauxMOEMoyen = (+detailTempsPayeWeek.tauxMOEMoyen + (detailTempsPayeWeek.tauxMOEMoyenManager)).toFixed(2);
        // this.totalPlanifie add total manager
      }
    }
    if (detailTempsPayeWeek.totalCA === 0 || totalPlanifie === 0) {
      detailTempsPayeWeek.prodMoyenne = '0';
    } else {
      detailTempsPayeWeek.prodMoyenne = (detailTempsPayeWeek.totalCA / (totalPlanifie / 60)).toFixed(2);
    }
    detailTempsPayeWeek.totalTempsPaye = this.dateService.formatMinutesToHours(totalAffecte);
    detailTempsPayeWeek.totalPlanifie =  this.dateService.formatMinutesToHours(totalPlanifie);
    detailTempsPayeWeek.totalTempsAbsence =  this.dateService.formatMinutesToHours(this.calculTotalAbsenceSemaine(activeEmployeesList, listEmployeeHasShift));

    return detailTempsPayeWeek;
   }



    public getDayByDayInfo(listShift: ShiftModel[], listShiftManagerLeader: ShiftModel[], days: any[], caPerDayValues: TotalCaPerDay[], displayPlgManagers: boolean, activeEmployeesPerWeek: any, listEmployeeHasShift: EmployeeModel[]): any {
        let totauxDayByDay = [];
        days.forEach((day: any) => {
            let totalManagerLeader = 0;
            let tauxMoePerDay : string;
            let prodPerDay : string;
            const shiftsByDay = this.grouperShiftParJour(day, listShift);
            let { totalAffecte, totalPlanifie } = this.calculTotalPlanifeAffecte(day, shiftsByDay, activeEmployeesPerWeek, listEmployeeHasShift);
            let ca = caPerDayValues.find((ca: TotalCaPerDay) => ca.day === day.val.toUpperCase());
            if(displayPlgManagers){
                listEmployeeHasShift.forEach((empDisplay: EmployeeModel) => {
                  const indexEmployee = activeEmployeesPerWeek.findIndex((emp: EmployeeModel)=> empDisplay.idEmployee && emp.idEmployee === empDisplay.idEmployee && empDisplay.isManagerOrLeader);
                  if(indexEmployee !== -1 && activeEmployeesPerWeek[indexEmployee].tempsAffecteData){
                      const dayIndex = activeEmployeesPerWeek[indexEmployee].tempsAffecteData.findIndex(val=> val.day === day.val);
                      if(dayIndex !== -1){
                        totalManagerLeader += activeEmployeesPerWeek[indexEmployee].tempsAffecteData[dayIndex].value;
                      }
                } 
                });
            }
            if(ca){
              tauxMoePerDay = this.calculTauxMoePerDay(totalPlanifie, ca.ca, displayPlgManagers, totalManagerLeader);
              prodPerDay = this.calculProdPerDay(totalPlanifie, ca.ca);
            } else {
              ca = new TotalCaPerDay();
              tauxMoePerDay = this.calculTauxMoePerDay(totalPlanifie, ca.ca, displayPlgManagers, totalManagerLeader);
              prodPerDay = this.calculProdPerDay(totalPlanifie, ca.ca);
            }
            totalAffecte += totalManagerLeader;
            totalPlanifie += totalManagerLeader;
            totauxDayByDay.push({ day, totalAffecte, totalPlanifie, ca, tauxMoePerDay, prodPerDay });
        });
        return totauxDayByDay;
    }



    private calculTauxMoePerDay(totalPlanifie: number, totalCA: number, displayPlgManagers: boolean, totalManagerLeader: number): string {
        if (totalCA === 0 || totalPlanifie === 0) {
            return '0';
        } else {
            let tauxMOEMoyenEquip = (Math.round(((this.sharedRestaurant.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (totalPlanifie / 60)) / totalCA) * 100) / 100);
            if (displayPlgManagers) {
             let tauxMOEMoyenML = (Math.round(((this.sharedRestaurant.selectedRestaurant.parametrePlanning.tauxMoyenManager * 100 * (totalManagerLeader / 60)) / totalCA) * 100) / 100);
             tauxMOEMoyenEquip += tauxMOEMoyenML;
            }
            return tauxMOEMoyenEquip.toFixed(2);
        }
    }



    private calculProdPerDay(totalPlanifie: number, ca: number): string{
        if (ca === 0 || totalPlanifie === 0) {
            return '0';
          } else {
            return (ca / (totalPlanifie / 60)).toFixed(2);
          }
    }
 /**
  * Permet de grouper les shift   par jour
  * @param: list
  * @param: keyGetter
  */
  public grouperShiftParJour(day: any, list: ShiftModel[]): ShiftModel[] {
    if(typeof day !== 'string'){
      day = day.val;
    }
    const listShiftByDay: ShiftModel[] = [];
    list.forEach((shiftDisplay: ShiftModel) => {
      if (shiftDisplay.jour === day.toUpperCase()) {
        listShiftByDay.push(shiftDisplay);
      }
    });
    return listShiftByDay;
  }
  public indexerShiftParJour(day: String, list: ShiftModel[]): ShiftModel[] {
    let indexShift = 0;
    list.forEach((shiftDisplay: ShiftModel) => {
      if (shiftDisplay.jour === day.toUpperCase()) {
        shiftDisplay.shiftIndexInDay = indexShift;
        indexShift++;
      }
    });
    return list;
  }
  public sortListEmployeesByFirstName(listEmployees: EmployeeModel[]): EmployeeModel[] {
    listEmployees.sort(function (a: EmployeeModel, b: EmployeeModel) {
      if (a.nom.toLowerCase() < b.nom.toLowerCase()) {
        return -1;
      }
      if (a.nom.toLowerCase() > b.nom.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return listEmployees;
  }
  public sortListEmployeesByLastName(listEmployees: EmployeeModel[]): EmployeeModel[] {
   listEmployees.sort(function (a: EmployeeModel, b: EmployeeModel) {
     if (a.prenom.toLowerCase() < b.prenom.toLowerCase()) {
       return -1;
     }
     if (a.prenom.toLowerCase() > b.prenom.toLowerCase()) {
       return 1;
     }
     return 0;
   });
   return listEmployees;
 }
}

