import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {EmployeeModel} from '../model/employee.model';
import * as moment from 'moment';
import {SharedRestaurantService} from './shared.restaurant.service';
import {RhisTranslateService} from './rhis-translate.service';
import {DateService} from './date.service';
import {PlanningManagerModel} from '../model/planningManager.model';
import {Sexe} from '../enumeration/Sexe.model';
import {VerificationContrainteModel} from '../model/verificationContrainte.model';
import {ContrainteSocialeService} from './contrainte-sociale.service';


@Injectable({
  providedIn: 'root'
})
export class ContrainteSocialeCoupureService {


  constructor(private sharedRestaurant: SharedRestaurantService,
              private rhisTranslateService: RhisTranslateService,
              private dateService: DateService,
              private datePipe: DatePipe,
              private contrainteSocialeService: ContrainteSocialeService
  ) {
  }

  public grouperShiftParJour(day: String, list: any[]): any {
    const listShiftByDay: any[] = [];
    list.forEach((shiftDisplay: any) => {
      if (this.dateService.getJourSemaine(new Date(shiftDisplay.dateJournee)) === day.toUpperCase()) {
        listShiftByDay.push(shiftDisplay);
      }
    });
    return listShiftByDay;
  }

  public getNumberOfWorkedHoursInDay(listShiftByDay: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, minBeforeCoupure: number, nbrCoupure?: number
  ): any {
    let totalInDay = 0;
    let pause = 0;
    let pauseCurrent = 0;
    listShiftByDay.forEach((shiftDisplay: any, index: number) => {
      this.sortListShift(listShiftByDay);
      pauseCurrent = 0;
      totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
      if (listShiftByDay[index + 1] && this.dateService.getJourSemaine(listShiftByDay[index + 1].dateJournee) === this.dateService.getJourSemaine(shiftDisplay.dateJournee)) {
        pauseCurrent = this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin);
        pause += this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin);
        if (pauseCurrent) {
          if (pauseCurrent > minBeforeCoupure)
            nbrCoupure++;
        }
      }


    });
    return {NumberOfHour: totalInDay, break: pause, nbrCoupure: nbrCoupure};
  }

  /**
   * Trie des shifts
   */
  public sortListShift(listPlanningMnagerOrLeader: any[]): any {
    listPlanningMnagerOrLeader.sort(function (a: any, b: any) {
      if (a.heureDebut < b.heureDebut) {
        return -1;
      }
      if (a.heureDebut > b.heureDebut) {
        return 1;
      }
      return 0;
    });
  }

  /**
   *  permet de recupere le sexe et l'age de l 'employee
   * @param :employee
   */
  public checkEmployeMineur(employee: EmployeeModel): boolean {
    let mineur = false;
    const dateNaissance = new Date(Date.parse(employee.dateNaissance));
    const dateCourante = new Date();
    const age = moment(dateCourante).diff(moment(dateNaissance), 'year');
    if (this.sharedRestaurant.selectedRestaurant && ((age >= this.sharedRestaurant.selectedRestaurant.pays.majeurMasculin && employee.sexe === Sexe.MASCULIN) ||
      (age >= this.sharedRestaurant.selectedRestaurant.pays.majeurFeminin && employee.sexe === Sexe.FEMININ))) {
      mineur = false;
    } else {
      mineur = true;
    }
    return mineur;
  }

  /**
   * contrainte nb des heures travaillés sans coupure
   */
  public verificationNbrHourWithoutCoupure(days: any, listManagerOrLeaderActif: EmployeeModel[], planningByManagerOrLeader: any, messageVerification: VerificationContrainteModel, dateDebut: Date, loiGroupeTravail: any, loiRestaurant: any, joursSemainEnum: any, vuePoste?: boolean): VerificationContrainteModel[] {
    let verificationContrainte = new VerificationContrainteModel();
    let employeHaslaw;
    let loi;
    const listContrainteMinTimeWithoutCoupure = [];

    for (const employeDisplay of listManagerOrLeaderActif) {
      let collection = [];
      if (vuePoste) {

        planningByManagerOrLeader.forEach((shiftDisplay: PlanningManagerModel) => {
          if (employeDisplay.idEmployee === shiftDisplay.managerOuLeader.idEmployee) {
            collection.push(shiftDisplay);
          }
        });
      } else {
        collection = planningByManagerOrLeader.get(employeDisplay.idEmployee);
      }
      collection = collection.filter((shiftDisplay: any) => !shiftDisplay.acheval || (shiftDisplay.acheval && shiftDisplay.modifiable));
      days.forEach((day: any) => {
        verificationContrainte = new VerificationContrainteModel();
        const listShiftByDay = this.grouperShiftParJour(day.val, collection);
        if (listShiftByDay.length > 1) {
          this.sortListShift(listShiftByDay);
          if (employeDisplay.contrats.length === 1) {
            employeHaslaw = employeDisplay;
          } else if (employeDisplay.contrats.length > 1) {
            employeHaslaw = JSON.parse(JSON.stringify(employeDisplay));
            employeHaslaw = this.contrainteSocialeService.getContratByDay(employeHaslaw, new Date(this.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)));
          }
          const employeMineur = this.checkEmployeMineur(employeHaslaw);
          if (employeHaslaw.hasLaws || (employeHaslaw.loiEmployee && employeHaslaw.loiEmployee.length)) {
            // employee laws
            loi = employeHaslaw.loiEmployee;
          } else if (employeHaslaw.contrats[0].groupeTravail.hasLaws) {
            // groupe trav laws
            loi = this.getLoiForEmployee(employeHaslaw, loiGroupeTravail);
          } else {
            // restaurant laws
            loi = loiRestaurant;
          }
          const NumberOfHourInDayAndBreak = this.getNumberOfWorkedHoursInDay(listShiftByDay, loi, employeHaslaw.contrats[0].tempsPartiel, employeMineur, 0);
          const dureeMax = this.dateService.convertNumberToTime(NumberOfHourInDayAndBreak.NumberOfHour);

          verificationContrainte = this.contrainteSocialeService.validNombreHeureMinSansCoupure(dureeMax, loi, employeHaslaw.contrats[0].tempsPartiel, employeMineur);
          if (verificationContrainte && NumberOfHourInDayAndBreak.break) {
            messageVerification.bloquante = verificationContrainte.bloquante;
            verificationContrainte.employe = employeDisplay;
            verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(new Date(JSON.parse(JSON.stringify(this.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)))), '/');

            listContrainteMinTimeWithoutCoupure.push(verificationContrainte);
          }
        }
      });
    }
    return listContrainteMinTimeWithoutCoupure;
  }

  public validNbrCoupureInWeek(days: any, employeeSearch: EmployeeModel[], listShift: any, messageVerification: VerificationContrainteModel, dateDebut: Date, loiGroupeTravail: any, loiRestaurant: any, joursSemainEnum: any, minBeforeCoupure, vuePoste?: boolean): VerificationContrainteModel[] {
    let verificationContrainteNbrCoupure = new VerificationContrainteModel();
    let employeHaslaw;
    const NbrMaxCoupureForWeek: VerificationContrainteModel[] = [];
    let nbrCoupure = 0;
    let loi;
    for (const employeDisplay of employeeSearch) {
      nbrCoupure = 0;
      employeHaslaw = null;
      let employeeMineur;
      let collection = [];
      if (vuePoste) {
        listShift.forEach((shiftDisplay: any) => {
          if (employeDisplay.idEmployee === shiftDisplay.managerOuLeader.idEmployee) {
            collection.push(shiftDisplay);
          }
        });
      } else {
        collection = listShift.get(employeDisplay.idEmployee);
      }
      collection = collection.filter((shiftDisplay: any) => !shiftDisplay.acheval || (shiftDisplay.acheval && shiftDisplay.modifiable));
      days.forEach((day: any) => {
        const listShiftByDay = this.grouperShiftParJour(day.val, collection);
        if (listShiftByDay.length > 1) {
          this.sortListShift(listShiftByDay);
          if (employeDisplay.contrats.length === 1) {
            employeHaslaw = employeDisplay;
          } else if (employeDisplay.contrats.length > 1) {
            employeHaslaw = JSON.parse(JSON.stringify(employeDisplay));
            employeHaslaw = this.contrainteSocialeService.getContratByDay(employeHaslaw, new Date(this.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)));
          }
          if (employeHaslaw.hasLaws || (employeHaslaw.loiEmployee && employeHaslaw.loiEmployee.length)) {
            // employee laws
            loi = employeHaslaw.loiEmployee;
          } else if (employeHaslaw.contrats[0].groupeTravail.hasLaws) {
            // groupe trav laws
            loi = this.getLoiForEmployee(employeHaslaw, loiGroupeTravail);
          } else {
            // restaurant laws
            loi = loiRestaurant;
          }
          employeeMineur = this.checkEmployeMineur(employeHaslaw);
          this.sortListShift(listShiftByDay);
          const numberOfHourInDayAndBreak = this.getNumberOfWorkedHoursInDay(listShiftByDay, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, minBeforeCoupure, nbrCoupure);
          nbrCoupure = numberOfHourInDayAndBreak.nbrCoupure;
        }

      });
      if (employeHaslaw && employeHaslaw.contrats) {
        const verfiContrainteCoupureSemaine = this.contrainteSocialeService.verifCSContratMinSansCoupure(employeHaslaw, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
        verificationContrainteNbrCoupure = this.contrainteSocialeService.validNombreMaxCoupureParSemaine(nbrCoupure, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, verfiContrainteCoupureSemaine);
        if (verificationContrainteNbrCoupure) {
          messageVerification.bloquante = verificationContrainteNbrCoupure.bloquante;
          verificationContrainteNbrCoupure.employe = employeHaslaw;
          NbrMaxCoupureForWeek.push(verificationContrainteNbrCoupure);
        }

      }
    }
    return NbrMaxCoupureForWeek;
  }

  /**
   * retourner loi groupe travail
   * @param: employee
   * @param :loiGroupeTravail
   */
  public getLoiForEmployee(employee: EmployeeModel, loiGroupeTravail: any): any {
    const loi = [];
    if (loiGroupeTravail && loiGroupeTravail.length) {
      loiGroupeTravail.forEach((loiGroupeTravailModel: any) => {
        if (loiGroupeTravailModel.groupeTravail && (loiGroupeTravailModel.groupeTravail.idGroupeTravail === employee.contrats[0].groupeTravail.idGroupeTravail)) {
          loi.push(loiGroupeTravailModel);
        } else if (!loiGroupeTravailModel.groupeTravail) {
          loi.push(loiGroupeTravailModel);
        }

      });
    }
    return loi;
  }

  /**
   * recuperer les jours de repos de l'employe
   ** @param :value
   */
  public setJourSemaine(value: String, dateDebut: Date, JoursSemainEnum: any): Date {
    let firstDayOfweek = JSON.parse(JSON.stringify(dateDebut));
    firstDayOfweek = new Date(firstDayOfweek);
    if (firstDayOfweek) {
      // lors de select sur  combox
      let datePlanning;
      JoursSemainEnum.forEach((jouSemaine: any, index: number) => {
        if (value === jouSemaine.label.toUpperCase()) {
          if (index === 0) {
            datePlanning = new Date(firstDayOfweek);
          }
          if (index === 1) {
            datePlanning = moment(firstDayOfweek).add(1, 'days');
          }
          if (index === 2) {
            datePlanning = moment(firstDayOfweek).add(2, 'days');
          }
          if (index === 3) {
            datePlanning = moment(firstDayOfweek).add(3, 'days');
          }
          if (index === 4) {
            datePlanning = moment(firstDayOfweek).add(4, 'days');
          }
          if (index === 5) {
            datePlanning = moment(firstDayOfweek).add(5, 'days');
          }
          if (index === 6) {
            datePlanning = moment(firstDayOfweek).add(6, 'days');

          }
          datePlanning = new Date(datePlanning);
        }
      });
      return datePlanning;
    }
  }

  /**
   * transforme les heures en date
   * @param valeur
   */
  private getNombreHeureTravaille(valeur: number): any {
    const returnedDate: Date = new Date();
    returnedDate.setHours(valeur / 60);
    const hours = Math.floor(valeur);
    let minute = valeur - hours;
    minute = Math.round((minute + Number.EPSILON) * 100) / 100;
    returnedDate.setHours(hours);
    returnedDate.setMinutes(minute * 100);
    returnedDate.setSeconds(0);
    return returnedDate;
  }
}
