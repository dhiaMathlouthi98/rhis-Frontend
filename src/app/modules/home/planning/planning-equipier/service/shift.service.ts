import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from 'src/app/shared/service/generic-crud.service';
import {PathService} from 'src/app/shared/service/path.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DateService} from 'src/app/shared/service/date.service';
import {Observable} from 'rxjs';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {ContrainteSocialeService} from '../../../../../shared/service/contrainte-sociale.service';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import * as moment from 'moment';
import {Sexe} from '../../../../../shared/enumeration/Sexe.model';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {ParametreNationauxModel} from '../../../../../shared/model/parametre.nationaux.model';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {PlanningManagerModel} from 'src/app/shared/model/planningManager.model';
import * as rfdc from 'rfdc';
import {ContrainteSocialeCoupureService} from '../../../../../shared/service/contrainte-sociale-coupure.service';
import {ShiftFixeModel} from '../../../../../shared/model/shiftFixe.model';
import {WeekDetailsPlanning} from '../../../../../shared/model/planning-semaine';
import {ListShiftUpdatedAndDeletedModel} from '../../../../../shared/model/gui/listShiftUpdatedAndDeleted.model';


@Injectable({
  providedIn: 'root'
})
export class ShiftService extends GenericCRUDRestService<ShiftModel, string> {
  public clone = rfdc();
  public debutJourneeActiviteByDay: any;
  public finJourneeActiviteByDay: any;
  public idShiftAcheval: any;
  public breakShiftAcheval: any;

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService, private contrainteSocialeService: ContrainteSocialeService, private sharedRestaurant: SharedRestaurantService,
              private contrainteSocialeCoupureService: ContrainteSocialeCoupureService) {
    super(httpClient, `${pathService.getPathPlanning()}/shift`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte d'une journée par restaurant
   */
  public getListShift(day: string | Date): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/allShifts/' + this.pathService.getUuidRestaurant() + '/' + day);
  }

  /**
   * Cette methode permet de retourner la liste de shifte d'une journée par restaurant sans les shifts d'un employe ayant une absence planifie sur la journee
   */
  public getListShiftWithoutAbsence(day: string | Date): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/report/allShifts/' + this.pathService.getUuidRestaurant() + '/' + day);
  }

  /**
   * Cette methode permet de retourner la liste de shifte d'une journée par restaurant
   */
  public getListShiftByWeek(day: string, uuidEmployee: string): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/employeesShifts' + `/${uuidEmployee}/${day}`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte de trois semaines par restaurant
   */
  public getListShiftByThreeWeek(day: string, uuidEmployee: string): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/employeesShiftsInThreeWeek' + `/${uuidEmployee}/${day}`);
  }

  /**
   * Cette methode permet de retourner la liste des shifts mensuelle d'un employé
   */
  public getEmployeeListShiftByMonth(day: string, uuidEmployee: string): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/employeesShiftsInPeriode' + `/${uuidEmployee}/${day}`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte d'une semaine par restaurant
   */
  public getListShiftByWeekForRestaurant(day: string): Observable<ShiftModel[]> {
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/restaurantShifts' + `/${this.pathService.getUuidRestaurant()}/${day}`);
  }

  /**
   * Ajouter un  shift à un employé
   * @param shift shift à ajouter
   * @param idEmployee id du l'employé
   * @param idPositionTravail id du position du travail
   */
  public addShift(entity: ShiftModel, uuidEmployee: string, uuidPositionTravail: string): Observable<ShiftModel> {
    return super.add(entity, `/${uuidEmployee}/${uuidPositionTravail}`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte  par restaurant sans les shifts d'un employe ayant une absence planifie sur la journee
   */
  public getListShiftPreviousAndNextDayByRestaurantAndDateJourneeForJournalierReport(day: string | Date): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/report/PreviousNextShift/' + this.pathService.getUuidRestaurant() + '/' + day);
  }

  public getListShiftPreviousAndNextDayByRestaurantAndDateJourneeForJournalierReportWeek(day: string | Date): Observable<ShiftModel[]> {
    day = this.dateService.formatToShortDate(day);
    return this.httpClient.get<ShiftModel[]>(this.baseUrl + '/report/PreviousNextShiftWeek/' + this.pathService.getUuidRestaurant() + '/' + day);
  }

  /**
   * Update/Create list shift
   * @param :data
   */
  public updateListShift(data: ShiftModel[]): Observable<ShiftModel[]> {
    data.forEach((item: ShiftModel) => {
      item.totalHeure = this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
      item.dateJournee = this.dateService.setCorrectDate(new Date(item.dateJournee));
      if (item.employee && !item.employee.idEmployee) {
        item.employee = null;
      }
      if (item.acheval) {
        if (!item.modifiable) {
          if (item.heureFinToDisplay) {
            item.heureFinToDisplay = new Date(item.heureFinToDisplay);
            item.dateJournee = new Date(item.heureFinToDisplay.getTime() - (24 * 60 * 60 * 1000));
          }
          if (item.heureDebutToDisplay) {
            item.heureDebutToDisplay = new Date(item.heureDebutToDisplay);
            item.dateJournee = new Date(item.heureDebutToDisplay.getTime() - (24 * 60 * 60 * 1000));
          }
          //item.dateJournee = new Date(item.dateJournee.getTime() - (24 * 60 * 60 * 1000));
          item.heureDebut = new Date(item.heureFin.getTime() - (item.totalHeureACheval * 60 * 1000));
          item.heureDebutIsNight = item.heureDebut.getDate() !== item.dateJournee.getDate();
          item.heureFinIsNight = item.heureFin.getDate() !== item.dateJournee.getDate();
        } else {
          item.heureFin = new Date(item.heureDebut.getTime() + (item.totalHeureACheval * 60 * 1000));
          item.heureDebutIsNight = item.heureDebut.getDate() !== item.dateJournee.getDate();
          item.heureFinIsNight = item.heureFin.getDate() !== item.dateJournee.getDate();
        }
      }
      this.setCorrectFormat(item);
      item.dateJournee =  this.dateService.correctTimeZoneDifference(item.dateJournee);
    });
    return this.httpClient.put<ShiftModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/updateList`, data);
  }

  public updateAndDeleteListShift(data: ListShiftUpdatedAndDeletedModel, overwriteShifsReference: number): Observable<ShiftModel[]> {
    if (data.shiftsToUpdatedOrCreated) {
      data.shiftsToUpdatedOrCreated.forEach((item: ShiftModel) => {
        if (item.employee !== null) {
          item.employee.listShiftForThreeWeek = [];
        }
        item.totalHeure = this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
        item.dateJournee = this.dateService.setCorrectDate(new Date(item.dateJournee));
        if (item.employee && !item.employee.idEmployee) {
          item.employee = null;
        }
        if (item.acheval) {
          if (!item.modifiable) {
            if (item.heureFinToDisplay) {
              item.heureFinToDisplay = new Date(item.heureFinToDisplay);
              item.dateJournee = new Date(item.heureFinToDisplay.getTime() - (24 * 60 * 60 * 1000));
            }
            if (item.heureDebutToDisplay) {
              item.heureDebutToDisplay = new Date(item.heureDebutToDisplay);
              item.dateJournee = new Date(item.heureDebutToDisplay.getTime() - (24 * 60 * 60 * 1000));
            }
            //item.dateJournee = new Date(item.dateJournee.getTime() - (24 * 60 * 60 * 1000));
            item.heureDebut = new Date(item.heureFin.getTime() - (item.totalHeureACheval * 60 * 1000));
            item.heureDebutIsNight = item.heureDebut.getDate() !== item.dateJournee.getDate();
            item.heureFinIsNight = item.heureFin.getDate() !== item.dateJournee.getDate();
          } else {
            item.heureFin = new Date(item.heureDebut.getTime() + (item.totalHeureACheval * 60 * 1000));
            item.heureDebutIsNight = item.heureDebut.getDate() !== item.dateJournee.getDate();
            item.heureFinIsNight = item.heureFin.getDate() !== item.dateJournee.getDate();
          }
        }
        this.setCorrectFormat(item);
        item.dateJournee =  this.dateService.correctTimeZoneDifference(item.dateJournee);
      });
    }
    if (data.listShiftDeleted) {

      data.listShiftDeleted.forEach(item => {
        if (item.employee !== null) {
          item.employee.listShiftForThreeWeek = [];
        }
        this.setCorrectFormat(item);
      });

    }
    return this.httpClient.put<ShiftModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/${overwriteShifsReference}/updateAndDeleteList`, data);
  }

  /**
   * Delete list shift
   * @param :data
   */
  public deleteListShift(data: ShiftModel[]): Observable<any> {
    data.forEach(item => {
      this.setCorrectFormat(item);
    });
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: data
    };
    return this.httpClient.delete<ShiftModel[]>(`${this.baseUrl}/deleteList`, options);
  }

  public filterShifts(shifts: any[], frConfig, decoupageHoraireFinEtDebutActivity, planningManager?: boolean, skipDateChange?: boolean): any[] {
    let newShiftList = [];
    newShiftList = shifts.filter((shift: any) => {
      let dateJournne = JSON.parse(JSON.stringify(shift.dateJournee));
      dateJournne = new Date(dateJournne);
      if (!skipDateChange) {
        if (shift.acheval && !shift.modifiable) {
          dateJournne = new Date(dateJournne.getTime() + (24 * 60 * 60 * 1000));
        }
      }
      let finJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dateJournne, 'fin', frConfig,
        decoupageHoraireFinEtDebutActivity);
      let debutJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dateJournne, 'debut', frConfig, decoupageHoraireFinEtDebutActivity);
      const nightValueDebut = debutJourneeActiviteRefrence.night;
      debutJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(debutJourneeActiviteRefrence.value);
      const nightValueFin = finJourneeActiviteRefrence.night;
      finJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(finJourneeActiviteRefrence.value);
      debutJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournne, debutJourneeActiviteRefrence), nightValueDebut);
      this.dateService.resetSecondsAndMilliseconds(debutJourneeActiviteRefrence);

      finJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournne, finJourneeActiviteRefrence), nightValueFin);
      this.dateService.resetSecondsAndMilliseconds(finJourneeActiviteRefrence);
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      if (shift.acheval && !shift.modifiable) {
        shift.heureDebut = shift.heureDebutCheval;
        shift.heureFin = shift.heureFinCheval;
      }
      if (moment(shift.heureFin).isAfter(shift.heureDebut)) {
        if (moment(shift.heureDebut).isSameOrAfter(debutJourneeActiviteRefrence) && moment(shift.heureFin).isSameOrBefore(finJourneeActiviteRefrence)) {
          return shift;
        } else if (!moment(shift.heureDebut).isSameOrAfter(debutJourneeActiviteRefrence) && moment(shift.heureFin).isAfter(debutJourneeActiviteRefrence)) {
          shift.heureDebutToDisplay = debutJourneeActiviteRefrence;
          shift.heureDebut = debutJourneeActiviteRefrence;
          shift.heureDebutIsNight = nightValueDebut;
          shift.heureDebutIsNightToDisplay = nightValueDebut;
          if (shift.acheval && !shift.modifiable) {
            shift.heureFinIsNight = false;
          }
          return shift;
        } else if (!moment(shift.heureFin).isSameOrBefore(finJourneeActiviteRefrence) && moment(shift.heureDebut).isBefore(finJourneeActiviteRefrence)) {
          shift.heureFinToDisplay = finJourneeActiviteRefrence;
          shift.heureFin = finJourneeActiviteRefrence;
          shift.heureFinIsNightToDisplay = nightValueFin;
          shift.heureFinIsNight = nightValueFin;
          return shift;
        }
      }
    });
    newShiftList.sort((shift1: any, shift2: any) => {
      if (moment(shift1.heureDebut).isAfter(shift2.heureDebut)) {
        return 1;
      } else if (moment(shift1.heureDebut).isBefore(shift2.heureDebut)) {
        return -1;
      } else {
        return 0;
      }
    });
    const data = [];
    newShiftList.forEach((shift: any) => {
      if (this.canAddUpdateShift(shift, data, planningManager)) {
        this.dateService.setCorrectTimeToDisplayForShift(shift);
        data.push(shift);
      }

    });
    return data;
  }

  /**
   * supprimer un shift
   * @param shiftId identifiant du shift à supprimer
   */
  public deleteShift(shiftUuid: string) {
    return super.remove(shiftUuid);
  }

  /**
   * Permet de vérifier la présence des shifts sur toute la semaine
   * @param stringAsDate
   */
  public checkIfThereIsShiftsForCurrentWeek(stringAsDate: string): Observable<boolean> {
    return this.httpClient.get<boolean>(this.baseUrl + '/shiftPresenceForWeek/' + this.pathService.getUuidRestaurant() + '/' + stringAsDate);
  }

  public deleteFromReference(stringAsDate: string): Observable<Object> {
    return this.httpClient.delete(this.baseUrl + '/deleteFromRef/' + this.pathService.getUuidRestaurant() + '/' + stringAsDate);

  }

  public getTotalEquipNonAffecteByWeek(stringAsDate: string): Observable<number> {
    return this.httpClient.get<any>(this.baseUrl + '/totalEquipNonAffecteByWeek/' + this.pathService.getUuidRestaurant() + '/' + stringAsDate);

  }

  /**
   * Calcul total hebdo d'une journée d'un employé
   * @param :listShift
   * @param :idEmployee
   */
  public calculHebdo(listShift: ShiftModel[], uuidEmployee?: string): number {
    let listShiftRefrence = [...listShift];
    let sum = 0;
    listShiftRefrence.forEach((shift: ShiftModel) => {
      if (shift.heureDebut instanceof Date) {
        shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      }
      if (shift.heureFin instanceof Date) {
        shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
      }
      this.dateService.setCorrectTimeToDisplay(shift);

      if (uuidEmployee) {
        if (shift.employee && shift.employee.idEmployee !== null && shift.employee.uuid === uuidEmployee) {
          sum += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        }
      } else {
        // sum += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        sum += shift.totalHeure;
      }
    });

    return sum;
  }

  /**
   *  calcul des temps planifiés
   *   soustraire au temps planifié la valeur du temps minimum d’un break
   *   verification MaxShift Sans Break et min break
   * @param :totalInDay
   * @param :nbrShiftInDay
   * @param :listLoi
   * @param :tempsTravailPartiel
   * @param :mineur
   * @param :pause
   */
  public verificationMaxShiftSansBreak(totalInDay: any, nbrShiftInDay: number, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, pause: number, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[]): Date {
    let dureeMaxSansBreak;
    let dureeMinBreak;
    let dureeSubtract;
    totalInDay = this.dateService.getNombreHeureTravaille(totalInDay);
    if (nbrShiftInDay === 1) {
      dureeMaxSansBreak = this.contrainteSocialeService.validDureeMaxSansBreak(totalInDay, listLoi, tempsTravailPartiel, mineur);
      if (dureeMaxSansBreak) {
        dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(listLoi, tempsTravailPartiel, mineur);
        dureeSubtract = this.calculeBreak(totalInDay, this.dateService.setTimeFormatHHMM(dureeMinBreak), listOfBreakAndShift);
      }
    }
    if (nbrShiftInDay > 1) {
      dureeMaxSansBreak = this.contrainteSocialeService.validDureeMaxSansBreak(totalInDay, listLoi, tempsTravailPartiel, mineur);

      pause = +this.dateService.convertNumberToTime(pause);
      dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(listLoi, tempsTravailPartiel, mineur, this.dateService.getNombreHeureTravaille(pause));
      if (dureeMaxSansBreak && dureeMinBreak) {
        dureeMinBreak = this.dateService.setTimeFormatHHMM(dureeMinBreak);
        dureeSubtract = this.calculeBreak(totalInDay, dureeMinBreak, listOfBreakAndShift);
      }
    }
    return dureeSubtract;
  }

  /**
   * recuperer le temps de break
   * @param totalInDay
   * @param dureeMinBreak
   */
  private calculeBreak(totalInDay: Date, dureeMinBreak: Date, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[]): Date {
    let dureeSubtract;
    if (listOfBreakAndShift[0]) {
      if (listOfBreakAndShift[0].shift > totalInDay) {
        dureeSubtract = dureeMinBreak;
      } else if (totalInDay >= listOfBreakAndShift[0].shift) {
        if (listOfBreakAndShift[0].break >= dureeMinBreak) {
          dureeSubtract = listOfBreakAndShift[0].break;
        } else {
          dureeSubtract = dureeMinBreak;
        }
      } else {
        dureeSubtract = dureeMinBreak;
      }
    } else {
      dureeSubtract = dureeMinBreak;
    }
    if (listOfBreakAndShift[1]) {
      if (listOfBreakAndShift[1].shift <= totalInDay) {
        if (listOfBreakAndShift[1].break >= dureeMinBreak) {
          dureeSubtract = listOfBreakAndShift[1].break;
        } else {
          dureeSubtract = dureeMinBreak;
        }
      }
    }
    if (listOfBreakAndShift[2]) {
      if (listOfBreakAndShift[2].shift <= totalInDay) {
        if (listOfBreakAndShift[2].break >= dureeMinBreak) {
          dureeSubtract = listOfBreakAndShift[2].break;
        } else {
          dureeSubtract = dureeMinBreak;
        }
      }
    }
    return dureeSubtract;
  }

  /**
   * Trie des shifts
   */
  public sortListShift(listShift: ShiftModel[]): void {
    listShift.sort(function (a: ShiftModel, b: ShiftModel) {
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
   * calcule les nbres des heures pour plusieurs shift
   * @param: shiftTobreak
   * @param: shift
   * @param: totalInDay
   * @param: nbreShift
   * @param :totalMinutes
   */
  public getTotalInDayForAllShiftWithBreak(shiftTobreak: any, shift: any, totalInDay: number, nbreShift: number, totalMinutes: number, employee: EmployeeModel, paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[]): any {
    let nbrHourLast = 0;
    let pause = 0;
    let totalInDaywithoutBreak = 0;
    let dureeSubtract;
    let result: any;
    if (employee.contrats.length) {
      pause = this.dateService.getDiffHeure(shift.heureDebut, shiftTobreak.heureFin);
      nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
      totalInDaywithoutBreak = totalInDay;
      if (paramNationaux.payerLeBreak) {
        totalInDay = +this.dateService.convertNumberToTime(totalInDay);
        dureeSubtract = this.verificationMaxShiftSansBreak(totalInDay, nbreShift, employee.loiEmployee, employee.contrats[0].tempsPartiel, this.identifierEmployee(employee), pause, listOfBreakAndShift);
        totalInDay = totalInDaywithoutBreak;
        if (dureeSubtract) {
          totalMinutes = +this.dateService.convertNumberToTime(totalMinutes);
          if (dureeSubtract instanceof Date) {
            totalMinutes = this.dateService.getDiffHeure(this.dateService.getNombreHeureTravaille(totalMinutes), dureeSubtract);
          } else {
            totalMinutes = this.dateService.getDiffHeure(this.dateService.getNombreHeureTravaille(totalMinutes), this.dateService.setTimeFormatHHMM(dureeSubtract));
          }
          result = {'totalMinutes': totalMinutes};
        } else {
          const dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employee.loiEmployee, employee.contrats[0].tempsPartiel, this.identifierEmployee(employee), this.dateService.getNombreHeureTravaille(pause));
          result = {'totalMinutes': totalMinutes, 'totalInDay': totalInDay};
        }
      }
    }
    return result;
  }

  /**
   * calcule les nbres des heures pour un shift
   * @param :totalMinutes
   */
  public getTotalHoursInDayForShiftWithBreak(totalMinutes: number, employee: EmployeeModel, paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[]): number {
    let totalInDaywithoutBreak = 0;
    let dureeSubtract;
    totalInDaywithoutBreak = totalMinutes;
    if (employee.contrats.length) {
      if (paramNationaux.payerLeBreak) {
        totalMinutes = +this.dateService.convertNumberToTime(totalMinutes);
        dureeSubtract = this.verificationMaxShiftSansBreak(totalMinutes, 1, employee.loiEmployee, employee.contrats[0].tempsPartiel, this.identifierEmployee(employee), 0, listOfBreakAndShift);
        if (dureeSubtract) {
          if (dureeSubtract instanceof Date) {
            totalMinutes = this.dateService.getDiffHeure(this.dateService.getNombreHeureTravaille(totalMinutes), dureeSubtract);
          } else {
            totalMinutes = this.dateService.getDiffHeure(this.dateService.getNombreHeureTravaille(totalMinutes), this.dateService.setTimeFormatHHMM(dureeSubtract));
          }
        } else {
          totalMinutes = totalInDaywithoutBreak;
        }
      }
    }
    return totalMinutes;
  }

  /**
   * permet de recupere le sexe et l'age de l 'employee
   * @param: employee
   */
  public identifierEmployee(employee: EmployeeModel): boolean {
    const dateNaissance = new Date(Date.parse(employee.dateNaissance));
    const dateCourante = new Date();
    const age = moment(dateCourante).diff(moment(dateNaissance), 'year');
    return !(this.sharedRestaurant.selectedRestaurant && ((age >= this.sharedRestaurant.selectedRestaurant.pays.majeurMasculin && employee.sexe === Sexe.MASCULIN) ||
      (age >= this.sharedRestaurant.selectedRestaurant.pays.majeurFeminin && employee.sexe === Sexe.FEMININ)));
  }

  /**
   * Cette methode permer de calculer le decalage entre la date saisie et le premier jour de la semaine du restaurant
   */
  public findDecalage(date, premierJourDeLaSemaine: String): number {
    const dateSelected = date;
    let decalage = 0;
    switch (premierJourDeLaSemaine) {
      case JourSemaine.LUNDI: {
        decalage = dateSelected.getDay() - (1 % 7);
        break;
      }
      case JourSemaine.MARDI: {
        decalage = dateSelected.getDay() - (2 % 7);
        break;
      }
      case JourSemaine.MERCREDI: {
        decalage = dateSelected.getDay() - (3 % 7);
        break;
      }
      case JourSemaine.JEUDI: {
        decalage = dateSelected.getDay() - (4 % 7);
        break;
      }
      case JourSemaine.VENDREDI: {
        decalage = dateSelected.getDay() - (5 % 7);
        break;
      }
      case JourSemaine.SAMEDI: {
        decalage = dateSelected.getDay() - (6 % 7);
        break;
      }
      case JourSemaine.DIMANCHE: {
        decalage = dateSelected.getDay() - (7 % 7);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    if (decalage < 0) {
      decalage += 7;
    }
    return decalage;
  }

  /**
   * Récupère le premier shift de chaque employé pour les trier
   */
  public filterShiftsToSort(listShift: ShiftModel[]): ShiftModel[] {
    const sortedEmployeesTemp: EmployeeModel[] = [];
    let listShiftToSort: ShiftModel[] = [];
    listShift.forEach((shift: ShiftModel) => {
      if (shift.employee && !sortedEmployeesTemp.find((employee: EmployeeModel) => shift.employee.idEmployee === employee.idEmployee)) {
        listShiftToSort.push(shift);
        sortedEmployeesTemp.push(shift.employee);
      } else if (shift.employee === null || (shift.employee && shift.employee.idEmployee === null)) {
        listShiftToSort.push(shift);
        const emptyEmployee = new EmployeeModel();
        emptyEmployee.idEmployee = null;
        emptyEmployee.nom = null;
        emptyEmployee.prenom = null;
        emptyEmployee.hebdoPlanifie = null;
        emptyEmployee.hebdoCourant = null;
        sortedEmployeesTemp.push(emptyEmployee);
      }
    });
    return listShiftToSort;
  }

  /**
   * Récupère le premier shift de chaque manager pour les trier
   */
  public filterManagerShiftsToSort(listShift: PlanningManagerModel[]): PlanningManagerModel[] {
    const sortedEmployeesTemp: EmployeeModel[] = [];
    let listShiftToSort: PlanningManagerModel[] = [];
    listShift.forEach((shift: PlanningManagerModel) => {
      if (!sortedEmployeesTemp.find((employee: EmployeeModel) => shift.managerOuLeader.idEmployee === employee.idEmployee)) {
        listShiftToSort.push(shift);
        sortedEmployeesTemp.push(shift.managerOuLeader);
      }
    });
    return listShiftToSort;
  }

  /**
   * Récupère la liste des employés à afficher après le tri
   */
  public getSortedEmployeeListFromSortedShifts(listShift: ShiftModel[]): EmployeeModel[] {
    const sortedEmployees = [];
    listShift.forEach((shift: ShiftModel) => {
      if (shift.employee) {
        sortedEmployees.push(shift.employee);
      } else if (shift.employee === null) {
        const emptyEmployee = new EmployeeModel();
        emptyEmployee.idEmployee = null;
        emptyEmployee.nom = null;
        emptyEmployee.prenom = null;
        emptyEmployee.hebdoPlanifie = null;
        emptyEmployee.hebdoCourant = null;
        sortedEmployees.push(emptyEmployee);
      }

    });

    return sortedEmployees;
  }

  /**
   * Tri des shifts dans l'ordre croissant des heures de début
   */
  public triShiftParHeureDebut(listShift: ShiftModel[]): void {
    listShift.sort((shift1: ShiftModel, shift2: ShiftModel) => {
      this.dateService.formatNewOrUpdatedShiftDate(shift1);
      this.dateService.formatNewOrUpdatedShiftDate(shift2);
      if (moment(shift1.heureDebut).isAfter(shift2.heureDebut)) {
        return 1;
      } else if (moment(shift1.heureDebut).isBefore(shift2.heureDebut)) {
        return -1;
      } else {
        if (shift1.positionTravail.priorite > shift2.positionTravail.priorite) {
          return 1;
        } else if (shift1.positionTravail.priorite < shift2.positionTravail.priorite) {
          return -1;
        } else {
          return 0;
        }
      }
    });
  }

  public getDayTotalHoursForEmployee(listShift: any, employeeHasContrat: EmployeeModel, paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], modeAffichage: number, decoupageHoraireFinEtDebutActivity: any, frConfig: any, listShiftDisplay: any, pdfEquipier: boolean, getInMinutes?: boolean): any {
    let totalInDay = 0;
    let totalMinutes = 0;
    let totalCurrent = 0;
    let totalCureentFixe = 0;
    let previousOrNextListOfShiftCurrent;
    let totalCurrentAcheval = 0;
    let totalCureentFixeAcheval = 0;
    let timeToSubstructCurrent = false;
    this.sortListShift(listShift);
    listShift.forEach((shiftDisplay: any, index: number) => {
      timeToSubstructCurrent = false;
      let shift;
      // pour calculer temps planifier pdf journalier
      if (pdfEquipier) {
        shift = shiftDisplay;
      } else {
        shift = {...shiftDisplay};

      }
      if (modeAffichage === 2 && shiftDisplay.acheval) {
        previousOrNextListOfShiftCurrent = this.getListPreviousOrLastShift(shift, listShiftDisplay);
        if (previousOrNextListOfShiftCurrent) {
          previousOrNextListOfShiftCurrent = previousOrNextListOfShiftCurrent.filter((previousOrNextShift: any) => !previousOrNextShift.acheval);
          this.sortListShift(previousOrNextListOfShiftCurrent);
        }
        if (decoupageHoraireFinEtDebutActivity) {
          this.setStatutLongerAndTimeTosubstructToShiftAcheval(shift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, previousOrNextListOfShiftCurrent, employeeHasContrat);

        }
      }
      totalMinutes += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalCurrent = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      if (shift.acheval && modeAffichage === 2) {
        totalCurrentAcheval = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        totalCureentFixeAcheval = totalCurrentAcheval;
      }
      if (paramNationaux.payerLeBreak) {
        if (listShift.length > 1) {
          let dureeMinBreak;
          let dureeMinBreakLast;
          totalCureentFixe = totalCurrent;
          if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {
            totalCurrent = this.getTotalHoursInDayForShiftWithBreak(totalCurrent, employeeHasContrat, paramNationaux, listOfBreakAndShift);
          } else if (shift.acheval && !shift.longer && modeAffichage === 2) {
            totalCureentFixeAcheval = totalCureentFixeAcheval - shift.timeToSubstruct;
            totalCurrentAcheval = this.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeeHasContrat, paramNationaux, listOfBreakAndShift);
          }
          if (listShift[index + 1]) {
            const pause = this.dateService.getDiffHeure(listShift[index + 1].heureDebut, shift.heureFin);
            dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employeeHasContrat.loiEmployee, employeeHasContrat.contrats[0].tempsPartiel, this.identifierEmployee(employeeHasContrat), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
          }
          if (listShift[index - 1]) {
            const pause = this.dateService.getDiffHeure(shift.heureDebut, listShift[index - 1].heureFin);
            dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(employeeHasContrat.loiEmployee, employeeHasContrat.contrats[0].tempsPartiel, this.identifierEmployee(employeeHasContrat), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));

          }
          // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
          if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
            totalInDay = totalInDay - totalCureentFixe;
          }
          // si le shift courant a un pause
          if ((totalCurrent < totalCureentFixe || totalCurrentAcheval < totalCureentFixeAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
            if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {

              totalInDay = totalInDay - totalCureentFixe;
              totalMinutes = totalMinutes - totalCureentFixe;
              totalMinutes = totalMinutes + totalCurrent;

            } else if (shift.acheval && totalCurrentAcheval < totalCureentFixeAcheval) {
              timeToSubstructCurrent = true;
              totalInDay -= shift.timeToSubstruct;
              totalMinutes -= shift.timeToSubstruct;
              totalInDay = totalInDay - totalCureentFixeAcheval;
              totalMinutes = totalMinutes - totalCureentFixeAcheval;
              totalMinutes = totalMinutes + totalCurrentAcheval;
            }
            if (listShift[index - 1]) {
              const shiftTobreak = {...listShift[index - 1]};
              const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
              totalInDay = totalInDay - nbrHourLast;
            }


          } else if (listShift[index - 1] && (!listShift[index + 1] || !dureeMinBreak)) {
            const shiftTobreak = {...listShift[index - 1]};
            if (shift.acheval && modeAffichage === 2) {
              timeToSubstructCurrent = true;
              totalMinutes -= shift.timeToSubstruct;
              if (totalInDay) {
                totalInDay -= shift.timeToSubstruct;
              }
            }
            totalMinutes = this.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, listShift.length, totalMinutes, employeeHasContrat, paramNationaux, listOfBreakAndShift).totalMinutes;
            totalInDay = 0;
          }
        } else if (listShift.length === 1) {
          if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {
            totalMinutes = this.getTotalHoursInDayForShiftWithBreak(totalMinutes, employeeHasContrat, paramNationaux, listOfBreakAndShift);
          } else if (shift.acheval && !shift.longer && modeAffichage === 2) {
            totalCurrentAcheval = this.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeeHasContrat, paramNationaux, listOfBreakAndShift);
            totalMinutes = totalCurrentAcheval;
            timeToSubstructCurrent = true;
          }
        }
      }
      if (shift.acheval && modeAffichage === 2 && !timeToSubstructCurrent) {
        totalMinutes -= shift.timeToSubstruct;
        if (totalInDay) {
          totalInDay -= shift.timeToSubstruct;
        }
      }

    });
    if (getInMinutes) {
      return totalMinutes;
    } else {
      return this.dateService.convertNumberToTime(totalMinutes);
    }
  }

  public getWeekTotalHours(days: any, ListShift: any, employeeHasContrat: EmployeeModel, paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], modeAffichage: number, decoupageHoraireFinEtDebutActivity: any, frConfig: any, listPlanningManagerPreviousAndNextWeek: any, filter?: string, fromPlanningEquip?: boolean): string {
    let totalInDay = 0;
    let totalRowTime = 0;
    let totalMinutes = 0;
    let listShiftByDay = [];
    totalRowTime = 0;
    days.forEach((day: any, indexDay: number) => {
      if (filter) {
        listShiftByDay = this.contrainteSocialeCoupureService.grouperShiftParJour(day.val, ListShift);

      } else {
        listShiftByDay = this.contrainteSocialeCoupureService.grouperShiftParJour(this.dateService.getJourSemaine(day), ListShift);

      }
      listShiftByDay.forEach((shift: any) => {
        this.dateService.setCorrectTimeToDisplayForShift(shift);
      });
      this.sortListShift(listShiftByDay);
      totalInDay = 0;
      totalMinutes = 0;
      let totalCurrent = 0;
      let totalCureentFixe = 0;
      let totalCurrentAcheval = 0;
      let totalCureentFixeAcheval = 0;
      let timeToSubstructCurrent = false;
      listShiftByDay.forEach((shiftDisplay: any, index: number) => {
        timeToSubstructCurrent = false;
        const shift = {...shiftDisplay};
        if (shift.modifiable && shift.acheval && modeAffichage === 2 && !fromPlanningEquip) {
          ListShift.push(this.addShiftAcheval(this.clone(shift)));
        }
        if (modeAffichage !== 2 && shift.acheval && !shift.modifiable && shift.achevalWeek) {
          return;
        }
        totalMinutes += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        if (modeAffichage === 2 && shift.acheval) {
          let nextOrPreviousShiftAcheval;
          if (indexDay === 0 || indexDay === 6) {
            nextOrPreviousShiftAcheval = this.getListPreviousOrLastShift(shiftDisplay, listPlanningManagerPreviousAndNextWeek);
          } else {
            if (shift.modifiable && days[indexDay + 1]) {
              if (fromPlanningEquip) {
                nextOrPreviousShiftAcheval = this.contrainteSocialeCoupureService.grouperShiftParJour(this.dateService.getJourSemaine(days[indexDay + 1]), ListShift);
              } else {
                nextOrPreviousShiftAcheval = this.contrainteSocialeCoupureService.grouperShiftParJour(days[indexDay + 1].val, ListShift);
              }
            } else if (days[indexDay - 1]) {
              if (fromPlanningEquip) {
                nextOrPreviousShiftAcheval = this.contrainteSocialeCoupureService.grouperShiftParJour(this.dateService.getJourSemaine(days[indexDay - 1]), ListShift);
              } else {
                nextOrPreviousShiftAcheval = this.contrainteSocialeCoupureService.grouperShiftParJour(days[indexDay - 1].val, ListShift);
              }
            }
          }
          if (nextOrPreviousShiftAcheval) {
            nextOrPreviousShiftAcheval = nextOrPreviousShiftAcheval.filter((shiftPreviousOrNext: any) => !shiftPreviousOrNext.acheval);
            this.sortListShift(nextOrPreviousShiftAcheval);
          }
          if (decoupageHoraireFinEtDebutActivity) {
            this.setStatutLongerAndTimeTosubstructToShiftAcheval(shift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, nextOrPreviousShiftAcheval, employeeHasContrat);
          }
        }
        totalCurrent = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        if (shift.acheval && modeAffichage === 2) {
          totalCurrentAcheval = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
          totalCureentFixeAcheval = totalCurrentAcheval;
        }

        if (paramNationaux.payerLeBreak) {
          if (listShiftByDay.length > 1) {
            let dureeMinBreak;
            let dureeMinBreakLast;
            totalCureentFixe = totalCurrent;
            if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {
              totalCurrent = this.getTotalHoursInDayForShiftWithBreak(totalCurrent, employeeHasContrat, paramNationaux, listOfBreakAndShift);
            } else if (shift.acheval && !shift.longer && modeAffichage === 2) {
              totalCureentFixeAcheval = totalCureentFixeAcheval - shift.timeToSubstruct;
              totalCurrentAcheval = this.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeeHasContrat, paramNationaux, listOfBreakAndShift);
            }
            if (listShiftByDay[index + 1]) {
              const pause = this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shift.heureFin);
              dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employeeHasContrat.loiEmployee, employeeHasContrat.contrats[0].tempsPartiel, this.identifierEmployee(employeeHasContrat), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
            }
            if (listShiftByDay[index - 1]) {
              const pause = this.dateService.getDiffHeure(shift.heureDebut, listShiftByDay[index - 1].heureFin);
              dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(employeeHasContrat.loiEmployee, employeeHasContrat.contrats[0].tempsPartiel, this.identifierEmployee(employeeHasContrat), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));

            }
            // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
            if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
              totalInDay = totalInDay - totalCureentFixe;
            }        // si le shift courant a un pause
            if ((totalCurrent < totalCureentFixe || totalCurrentAcheval < totalCureentFixeAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
              if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {
                totalInDay = totalInDay - totalCureentFixe;
                totalMinutes = totalMinutes - totalCureentFixe;
                totalMinutes = totalMinutes + totalCurrent;
              } else if (shift.acheval && totalCurrentAcheval < totalCureentFixeAcheval) {
                timeToSubstructCurrent = true;
                totalInDay -= shift.timeToSubstruct;
                totalMinutes -= shift.timeToSubstruct;
                totalInDay = totalInDay - totalCureentFixeAcheval;
                totalMinutes = totalMinutes - totalCureentFixeAcheval;
                totalMinutes = totalMinutes + totalCurrentAcheval;
              }
              if (listShiftByDay[index - 1]) {
                const shiftTobreak = {...listShiftByDay[index - 1]};
                const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
                totalInDay = totalInDay - nbrHourLast;
              }

            } else if (listShiftByDay[index - 1] && (!listShiftByDay[index + 1] || !dureeMinBreak)) {
              const shiftTobreak = {...listShiftByDay[index - 1]};
              if (shift.acheval && modeAffichage === 2) {
                timeToSubstructCurrent = true;
                totalMinutes -= shift.timeToSubstruct;
                if (totalInDay) {
                  totalInDay -= shift.timeToSubstruct;
                }
              }
              totalMinutes = this.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, listShiftByDay.length, totalMinutes, employeeHasContrat, paramNationaux, listOfBreakAndShift).totalMinutes;
              totalInDay = 0;
            }
          } else if (listShiftByDay.length === 1) {
            if (!shift.acheval || modeAffichage !== 2 || (shift.acheval && shift.longer && modeAffichage === 2)) {
              totalMinutes = this.getTotalHoursInDayForShiftWithBreak(totalMinutes, employeeHasContrat, paramNationaux, listOfBreakAndShift);
            } else if (shift.acheval && !shift.longer && modeAffichage === 2) {
              totalCurrentAcheval = this.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeeHasContrat, paramNationaux, listOfBreakAndShift);
              totalMinutes = totalCurrentAcheval;
              timeToSubstructCurrent = true;
            }
          }
        }
        if (shift.acheval && modeAffichage === 2 && !timeToSubstructCurrent) {
          totalMinutes -= shift.timeToSubstruct;
          if (totalInDay) {
            totalInDay -= shift.timeToSubstruct;
          }
        }
      });

      totalRowTime += totalMinutes;

    });
    return this.dateService.convertNumberToTime(totalRowTime);

  }

  /**
   * Cette méthode permet d'identifier la fin/début activité de la journée
   */
  public getDecoupageHoraireForShiftInWeek(datePlanning: Date, filter: string, frConfig: any, decoupageHoraireFinEtDebutActivity: any): any {
    const dateShift = new Date(datePlanning);
    const index = dateShift.getDay();
    const dayName = this.dateService.convertDayNames(index);
    if (filter === 'fin') {
      const filteredDecoupageFin = Object.keys(decoupageHoraireFinEtDebutActivity['finJournee']).filter(val => val.includes(dayName));

      this.finJourneeActiviteByDay = {
        value: decoupageHoraireFinEtDebutActivity.finJournee[filteredDecoupageFin[0]],
        night: decoupageHoraireFinEtDebutActivity.finJournee[filteredDecoupageFin[1]]
      };
      return this.finJourneeActiviteByDay;
    } else if (filter === 'debut') {
      const filteredDecoupage = Object.keys(decoupageHoraireFinEtDebutActivity['debutJournee']).filter(val => val.includes(dayName));

      this.debutJourneeActiviteByDay = {
        value: decoupageHoraireFinEtDebutActivity.debutJournee[filteredDecoupage[0]],
        night: decoupageHoraireFinEtDebutActivity.debutJournee[filteredDecoupage[1]]
      };
      return this.debutJourneeActiviteByDay;
    }

  }

  private setCorrectFormat(item) {
    if (isNaN(item.heureDebut)) {
      item.heureDebut = item.heureDebutCheval;
    }
    if (item.heureDebut) {
      item.heureDebut = this.dateService.setStringFromDate(item.heureDebut);
    }

    if (isNaN(item.heureFin)) {
      item.heureFin = item.heureFinCheval;
    }
    if (item.heureFin) {
      item.heureFin = this.dateService.setStringFromDate(item.heureFin);
    }

    if (item.heureDebutCheval) {
      item.heureDebutCheval = this.dateService.setStringFromDate(item.heureDebutCheval);
    }

    if (item.heureFinCheval) {
      item.heureFinCheval = this.dateService.setStringFromDate(item.heureFinCheval);
    }
  }

  /**
   Vérifier que le nouveau shift/ shift à modifier ne représente pas un chevauchement avec un shift existant
   */
  public canAddUpdateShift(shift: any, listShift: any[], copyEvent: boolean, planningManager?: boolean): boolean {
    shift.heureDebut = this.dateService.setSecondAndMilliSecondsToNull(shift.heureDebut);
    shift.heureFin = this.dateService.setSecondAndMilliSecondsToNull(shift.heureFin);
    let employeeShifts = [];
    if (planningManager) {
      if (shift.managerOuLeader && shift.managerOuLeader.idEmployee) {
        employeeShifts = listShift.filter((element: any) => element.managerOuLeader && element.managerOuLeader.idEmployee !== null && element.managerOuLeader.idEmployee === shift.managerOuLeader.idEmployee);
      }
    } else {
      if (shift.employee) {
        if (shift.employee && shift.employee.idEmployee) {
          employeeShifts = listShift.filter((element: any) => element.employee && element.employee.idEmployee !== null && element.employee.idEmployee === shift.employee.idEmployee);
        }
      } else {
        employeeShifts = listShift;
      }
    }
    if (employeeShifts.length === 0 || (!shift.employee && !copyEvent)) {
      return true;
    } else {
      let canAdd = true;
      employeeShifts.forEach((shiftDisplay: any) => {
        if ((shift.idShift !== shiftDisplay.idShift) || (planningManager && (shift.idPlanningManager !== shiftDisplay.idPlanningManager))) {
          const lastValue = shiftDisplay;
          // condition dans l'intervaele
          if ((lastValue.idShift !== shift.idShift) || (planningManager && (lastValue.idPlanningManager !== shift.idPlanningManager))) {
            if ((moment(lastValue.heureDebut).isSameOrBefore(shift.heureDebut) &&
                moment(lastValue.heureFin).isAfter(shift.heureDebut)) ||
              (moment(lastValue.heureDebut).isBefore(shift.heureFin) &&
                moment(lastValue.heureFin).isSameOrAfter(shift.heureFin)) ||
              (moment(lastValue.heureDebut).isSameOrAfter(shift.heureDebut) &&
                (moment(lastValue.heureFin).isSameOrBefore(shift.heureFin))
              )) {
              canAdd = canAdd && false;
            }
          }
        }
      });
      return canAdd;
    }
  }

// Calcul la durée des shifts en tenant compte de la CS durée maximale d'un break
  public getListShiftDurationByMaxBreak(listShiftByDay: any[], listLoi: any[], tempsPartiel: boolean, mineur: boolean): any[] {
    let dureeMaxBreak = this.contrainteSocialeService.getDureeMaxBreak(listLoi, tempsPartiel, mineur);
    if (dureeMaxBreak) {
      dureeMaxBreak = this.dateService.timeStringToNumber(dureeMaxBreak);
    }
    let listPause = [];
    let listDureeShifts = [];
    listShiftByDay.forEach((shiftDisplay: any, index: number) => {
      if (shiftDisplay.idPlanningManager) {
        this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
        if (listShiftByDay[index + 1]) {
          this.dateService.setCorrectTimeToDisplayForShift(listShiftByDay[index + 1]);
        }
      }
      this.sortListShift(listShiftByDay);
      // Case of Shift du plg equipier, manager ou leader
      if (listShiftByDay[index + 1] && shiftDisplay.idShift && this.dateService.getJourSemaine(listShiftByDay[index + 1].dateJournee) === this.dateService.getJourSemaine(shiftDisplay.dateJournee)) {
        listPause.push({
          dureePause: this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin),
          indexShift: index
        });
      }
      // Case of Shift Fixe
      if (listShiftByDay[index + 1] && shiftDisplay.idShiftFixe && (listShiftByDay[index + 1].jour === shiftDisplay.jour)) {
        listPause.push({
          dureePause: this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin),
          indexShift: index
        });
      }
      // Case of Planning Manager ou Leader
      if (listShiftByDay[index + 1] && shiftDisplay.idPlanningManager && moment(listShiftByDay[index + 1].dateJournee).isSame(moment(shiftDisplay.dateJournee), 'day')) {

        listPause.push({
          dureePause: this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin),
          indexShift: index
        });
      }
    });
    // find all pause indexes greater than duree max break
    if (listPause.length) {
      let pauseIndexes = [];
      listPause.forEach((pause: any, index: number) => {
        if (pause.dureePause > dureeMaxBreak) {
          pauseIndexes.push(index);
        }
      });
      if (pauseIndexes.length) {
        pauseIndexes.forEach((indexPause: number, index: number) => {
          let cumulShifts = 0;
          for (let i = 0; i <= (listShiftByDay.length - 1); i++) {
            if (index === 0) {
              // Danse le cas du premier index des pause
              if (i <= indexPause) {
                cumulShifts += this.dateService.getDiffHeure(listShiftByDay[i].heureFin, listShiftByDay[i].heureDebut);
              }
            } else {
              if (i <= indexPause && i > (pauseIndexes[index - 1])) {
                cumulShifts += this.dateService.getDiffHeure(listShiftByDay[i].heureFin, listShiftByDay[i].heureDebut);
              }
            }
          }
          listDureeShifts.push(cumulShifts);

          if (index === (pauseIndexes.length - 1)) {
            let cumulLastShifts = 0;
            for (let iterator = (listPause[indexPause].indexShift + 1); iterator < listShiftByDay.length; iterator++) {
              cumulLastShifts += this.dateService.getDiffHeure(listShiftByDay[iterator].heureFin, listShiftByDay[iterator].heureDebut);
            }
            listDureeShifts.push(cumulLastShifts);
          }
        });

      } else {
        //  cumul all shifts case of multiple shifts seperated with break less than duree max break
        let cumulShifts = 0;
        listShiftByDay.forEach((shiftDisplay: any) => {
          cumulShifts += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
        });
        listDureeShifts.push(cumulShifts);
      }
    }

    return listDureeShifts;
  }

  public getPauseBetwenShift(listShift: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean): any {
    this.sortListShift(listShift);
    let pause = 0;
    let verificationContrainte;

    listShift.forEach((shiftDisplay: any, index: number) => {
      const shift = {...shiftDisplay};
      if (listShift.length > 1) {
        if (listShift[index + 1]) {
          const pauseCurrent = this.dateService.getDiffHeure(listShift[index + 1].heureDebut, shift.heureFin);
          if (pauseCurrent >= pause || pause === 0) {
            pause = this.dateService.getDiffHeure(listShift[index + 1].heureDebut, shift.heureFin);
            verificationContrainte = this.contrainteSocialeService.validDureeBetweenTwoShift(listLoi, tempsTravailPartiel, mineur, this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pauseCurrent)));
          }
        }

      }
    });
    return verificationContrainte;

  }

  /**
   * Display Libelle Absence with shift
   */
  public canDisplayLibelle(y: number, x: number, cols: number, data: any[]): boolean {
    const shiftsOnLine = data.filter((element: any) => element.y === y);
    if (shiftsOnLine.length) {
      return !(shiftsOnLine.some((shift: any) => {
        return ((x + cols > shift.x && x + cols < shift.x + shift.cols)
          || (x < shift.x + shift.cols && x > shift.x)
          || (x < shift.x && x + cols > shift.x + shift.cols)
          || (x > shift.x && x + cols < shift.x + shift.cols)
          || (x + cols === shift.x + shift.cols));
      }));
    } else {
      return true;
    }
  }

  /**
   * recupere le bebut et fin d'activite de shift acheval
   * @param shift
   * @param modeAffichage
   * @param decoupageHoraireFinEtDebutActivity
   * @param frConfig
   */
  public getDebutAndFinActivite(shift: any, modeAffichage: number, decoupageHoraireFinEtDebutActivity: any, frConfig: any): any {
    let dateJournne;
    if (shift.jour && !shift.heureDebutCheval && !shift.heureFinCheval) {
      dateJournne = this.dateService.getDateOfEnumertionJour(this.clone(shift.jour));
    } else {
      dateJournne = JSON.parse(JSON.stringify(shift.dateJournee));
    }
    dateJournne = new Date(dateJournne);
    let debutJourneeActiviteRefrence;
    let finJourneeActiviteRefrence;
    if (shift.acheval && modeAffichage === 2) {
      const dataNext = this.clone(dateJournne);
      if (shift.acheval && shift.modifiable) {
        dataNext.setDate(dataNext.getDate() + 1);
      }
      if (shift.acheval && !shift.modifiable) {
        dateJournne.setDate(dateJournne.getDate() - 1);
      }
      debutJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dataNext, 'debut', frConfig, decoupageHoraireFinEtDebutActivity);
      const nightValueDebut = debutJourneeActiviteRefrence.night;
      debutJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(debutJourneeActiviteRefrence.value);
      debutJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dataNext, debutJourneeActiviteRefrence), nightValueDebut);
      this.dateService.resetSecondsAndMilliseconds(debutJourneeActiviteRefrence);
      finJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dateJournne, 'fin', frConfig,
        decoupageHoraireFinEtDebutActivity);
      const nightValueFin = finJourneeActiviteRefrence.night;
      finJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(finJourneeActiviteRefrence.value);
      finJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournne, finJourneeActiviteRefrence), nightValueFin);
      this.dateService.resetSecondsAndMilliseconds(finJourneeActiviteRefrence);
    }
    return {
      debutJourneeActiviteRefrence: debutJourneeActiviteRefrence,
      finJourneeActiviteRefrence: finJourneeActiviteRefrence
    };
  }

  /**
   *
   * @param shift
   * @param modeAffichage
   * @param decoupageHoraireFinEtDebutActivity
   * @param frConfig
   * @param listShift
   * @param employeHaslaw
   */
  public setStatutLongerAndTimeTosubstructToShiftAcheval(shift: any, modeAffichage: number, decoupageHoraireFinEtDebutActivity: any, frConfig: any, listShift: any, employeHaslaw: EmployeeModel): void {
    let hasBreak;
    if (shift.jour && !shift.heureDebutCheval && !shift.heureFinCheval) {
      shift = this.getCurrentTimeForShiftFixe(shift);
    }

    const decoupageHoraire = this.getDebutAndFinActivite(shift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig);
    let shiftRefrence : ShiftModel;
    if(shift.acheval && !shift.modifiable){
      shiftRefrence = this.clone(shift);
      shiftRefrence.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(shiftRefrence.dateJournee), shiftRefrence.heureFin), shiftRefrence.heureFinIsNight);
      shiftRefrence.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(shiftRefrence.dateJournee), shiftRefrence.heureDebut), shiftRefrence.heureDebutIsNight);
    } else {
      shiftRefrence = shift;
    }
    
    const timeSubstructForShiftAchevalModifiable = this.dateService.getDiffHeure(decoupageHoraire.finJourneeActiviteRefrence, shiftRefrence.heureDebut);
    const timeSubstructForShiftAchevalNotModifiable = this.dateService.getDiffHeure(shiftRefrence.heureFin, decoupageHoraire.debutJourneeActiviteRefrence);
    if (employeHaslaw.loiEmployee) {
      hasBreak = this.getBreakBettwenTowShift(listShift, shiftRefrence, employeHaslaw);
    }
    shiftRefrence.longer = shiftRefrence.modifiable ? timeSubstructForShiftAchevalModifiable >= timeSubstructForShiftAchevalNotModifiable && !hasBreak : timeSubstructForShiftAchevalModifiable < timeSubstructForShiftAchevalNotModifiable && !hasBreak;
    shift.timeToSubstruct = shiftRefrence.modifiable ? timeSubstructForShiftAchevalNotModifiable : timeSubstructForShiftAchevalModifiable;

  }

  private getBreakBettwenTowShift(listShift: any, shiftDisplay: any, employeHaslaw: EmployeeModel): boolean {
    let dureeMinBreak;

    if (listShift && listShift.length) {
      let shiftSaved = this.clone(shiftDisplay);
      let shiftCurrent = this.clone(listShift[0]);
      shiftCurrent = moment(shiftCurrent.heureDebut).isSame(shiftSaved.heureDebut) ? this.clone(listShift[1]) :
        this.clone(listShift[0]);
      if (shiftDisplay.acheval && !shiftDisplay.modifiable) {
        shiftCurrent = this.clone(listShift[listShift.length - 1]);
        if (listShift.length >= 2) {
          shiftCurrent = moment(shiftCurrent.heureDebut).isSame(shiftSaved.heureDebut) ? this.clone(listShift[listShift.length - 2]) : this.clone(listShift[listShift.length - 1]);
        }
      }
      if (shiftCurrent.jour && !shiftCurrent.heureDebutCheval && !shiftCurrent.heureFinCheval) {
        shiftCurrent = this.getCurrentTimeForShiftFixe(shiftCurrent);
        shiftSaved = this.getCurrentTimeForShiftFixe(shiftSaved);
      }
      let pauseValide = shiftDisplay.modifiable ? this.dateService.getDiffHeure(shiftCurrent.heureDebut, shiftSaved.heureFin) :
        this.dateService.getDiffHeure(shiftSaved.heureDebut, shiftCurrent.heureFin);
      //le premier shift de la list eest la méme shift en cour
      if (pauseValide < 0) {
        pauseValide = pauseValide * (-1);
      }
      dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, this.identifierEmployee(employeHaslaw), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pauseValide)));
    }
    return true ? dureeMinBreak : !dureeMinBreak;
  }

  private getCurrentTimeForShiftFixe(shiftToSave: ShiftFixeModel): ShiftFixeModel {
    const plannedDate = this.dateService.getDateOfEnumertionJour(shiftToSave.jour);
    shiftToSave.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureDebut), shiftToSave.dateDebutIsNight);
    shiftToSave.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureFin), shiftToSave.dateFinIsNight);
    return shiftToSave;
  }

  /**
   * recupere les listes de shift avants et apres de date de shift current
   * @param shift
   * @param listShift
   */
  public getListPreviousOrLastShift(shift: any, listShift: any): any {
    const listShiftInDay = [];
    if (listShift) {
      listShift.forEach(item => {
        let shiftDisplay = this.clone(shift);
        item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
        shiftDisplay.dateJournee = this.dateService.setTimeNull(shiftDisplay.dateJournee);
        this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
        if (shiftDisplay.modifiable && moment(item.dateJournee).isSame(shiftDisplay.dateJournee.setDate(shiftDisplay.dateJournee.getDate() + 1))) {
          this.dateService.setCorrectTimeToDisplayForShift(item);
          listShiftInDay.push(item);
        } else if (!shiftDisplay.modifiable && moment(item.dateJournee).isSame(shiftDisplay.dateJournee.setDate(shiftDisplay.dateJournee.getDate() - 1))) {
          this.dateService.setCorrectTimeToDisplayForShift(item);
          listShiftInDay.push(item);
        }
      });
    }
    return listShiftInDay;
  }

  /**
   * ajouter shift achevée
   * @param shiftAcheveToSave
   */
  public addShiftAcheval(shiftAcheveToSave: any, filter?: boolean): any {
    shiftAcheveToSave.modifiable = false;
    shiftAcheveToSave.acheval = true;
    shiftAcheveToSave.heureFinIsNight = false;
    shiftAcheveToSave.heureDebutIsNight = false;
    shiftAcheveToSave.dateJournee.setDate(shiftAcheveToSave.dateJournee.getDate() + 1);
    shiftAcheveToSave.achevalWeek = false;
    if (filter) {
      shiftAcheveToSave.shiftAchevalHidden = true;
    }
    return shiftAcheveToSave;

  }

  /**
   * ajouter shift acheval (modifiable) dans le list de shift en cours
   * @param shift
   * @param collection
   */
  public addShiftAchevalInCurrentList(shift: any, collection: any, filter?: boolean): any {
    const listShiftInDay: any[] = [];
    if (collection) {
      collection.forEach((item: any) => {
        item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
        const shiftManager = this.clone(shift);
        const dateJournee = this.clone(this.dateService.setTimeNull(shiftManager.dateJournee));
        const dateJourneeShiftManager = this.clone(this.dateService.setTimeNull(shiftManager.dateJournee));
        this.dateService.setCorrectTimeToDisplayForShift(shiftManager);
        this.dateService.setCorrectTimeToDisplayForShift(item);
        const shiftDisplay = this.clone(item);
        if ((item.acheval && item.modifiable) && moment(dateJournee.setDate(dateJournee.getDate() - 1)).isSame(item.dateJournee)) {
          listShiftInDay.push(this.addShiftAcheval(this.clone(item)));
        }
        if (filter && (shift.acheval && shift.modifiable) && moment(dateJourneeShiftManager).isSame(shiftDisplay.dateJournee.setDate(shiftDisplay.dateJournee.getDate() - 1))) {
          shiftDisplay.sameDateToShiftAcheval = true;
          shiftDisplay.dateJournee = shiftDisplay.dateJournee.setDate(shiftDisplay.dateJournee.getDate() + 1);
          listShiftInDay.push(shiftDisplay);
        }
      });
    }
    return listShiftInDay;
  }

  public canAddShiftAcheval(planning: any, listPlanningManagerPreviousAndNextWeek: any): boolean {
    let previousOrLastOfShiftInDay = this.clone(listPlanningManagerPreviousAndNextWeek);
    if (previousOrLastOfShiftInDay && previousOrLastOfShiftInDay.length) {
      previousOrLastOfShiftInDay = previousOrLastOfShiftInDay.filter((shiftPreviousOrNext: any) => shiftPreviousOrNext.managerOuLeader.idEmployee === planning.managerOuLeader.idEmployee && moment(this.dateService.setTimeNull(shiftPreviousOrNext.dateJournee)).isAfter(this.dateService.setTimeNull(planning.dateJournee)));
      if (previousOrLastOfShiftInDay && previousOrLastOfShiftInDay.length) {
        this.sortListShift(previousOrLastOfShiftInDay);
        previousOrLastOfShiftInDay[0].dateJournee = this.dateService.setTimeNull(previousOrLastOfShiftInDay[0].dateJournee);
        planning.dateJournee = this.dateService.setTimeNull(planning.dateJournee);
        if (moment(previousOrLastOfShiftInDay[0].dateJournee).isAfter(planning.dateJournee)) {
          // condition dans l'intervaele
          this.dateService.setCorrectTimeToDisplayForShift(previousOrLastOfShiftInDay[0]);
          if (previousOrLastOfShiftInDay[0].idPlanningManager !== planning.idPlanningManager) {
            if ((moment(previousOrLastOfShiftInDay[0].heureDebut).isSameOrBefore(planning.heureDebut) &&
                moment(previousOrLastOfShiftInDay[0].heureFin).isAfter(planning.heureDebut)) ||
              (moment(previousOrLastOfShiftInDay[0].heureDebut).isBefore(planning.heureFin) &&
                moment(previousOrLastOfShiftInDay[0].heureFin).isSameOrAfter(planning.heureFin)) ||
              (moment(previousOrLastOfShiftInDay[0].heureDebut).isSameOrAfter(planning.heureDebut) &&
                (moment(previousOrLastOfShiftInDay[0].heureFin).isSameOrBefore(planning.heureFin))
              )) {
              return false;
            }
          }
        }
      }

    }
    return true;
  }

  public getShiftInMode2or1(shift: ShiftModel, employeeHasContrat: EmployeeModel, weekDates: any, paramMode: number, decoupageHoraireFinEtDebutActivity: any, frConfig: any, plgWeek?: boolean): ShiftModel {
    if (employeeHasContrat && (paramMode !== 0 || shift.acheval)) {
      if (shift.heureDebutCheval && shift.acheval) {
        shift.heureDebut = shift.heureDebutCheval;
      }
      if (shift.heureFinCheval) {
        shift.heureFin = shift.heureFinCheval;
      }

      const dates = this.clone(weekDates);
      const dateDebut = new Date(dates[0]);
      const dateFin = new Date(dates[6]);
      let previousOrLastOfShiftInDay = [];
      let previousOrNextListOfShiftCurrent = [];
      if (paramMode === 2 && shift.acheval) {
        if (!plgWeek && !shift.modifiable && !moment(this.dateService.setTimeNull(shift.dateJournee)).isSame(this.dateService.setTimeNull(shift.heureFin))) {
          shift.dateJournee = moment(shift.dateJournee).add(1, 'days').toDate();

        }
        if ((moment(this.dateService.setTimeNull(shift.dateJournee)).isSame(this.dateService.setTimeNull(dateDebut))
          || moment(this.dateService.setTimeNull(shift.dateJournee)).isSame(this.dateService.setTimeNull(dateFin))) && employeeHasContrat.listShiftPreviousAndLastWekk && employeeHasContrat.listShiftPreviousAndLastWekk.length) {
          employeeHasContrat.listShiftPreviousAndLastWekk.forEach((item: ShiftModel) => {
            this.dateService.setCorrectTimeToDisplayForShift(item);
          });
          previousOrLastOfShiftInDay = this.clone(employeeHasContrat.listShiftPreviousAndLastWekk);
        } else {

          employeeHasContrat.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
            previousOrLastOfShiftInDay = previousOrLastOfShiftInDay.concat(this.clone(wdp.shifts));
            previousOrLastOfShiftInDay.forEach((shiftDisplay: ShiftModel) => {
              this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
            });
          });
        }
        previousOrNextListOfShiftCurrent = this.getListPreviousOrLastShift(shift, previousOrLastOfShiftInDay);
        if (previousOrNextListOfShiftCurrent) {
          previousOrNextListOfShiftCurrent = previousOrNextListOfShiftCurrent.filter((previousOrNextShift: any) => !previousOrNextShift.acheval);
          this.sortListShift(previousOrNextListOfShiftCurrent);
        }
        if (decoupageHoraireFinEtDebutActivity) {
          this.setStatutLongerAndTimeTosubstructToShiftAcheval(shift, paramMode, decoupageHoraireFinEtDebutActivity, frConfig, previousOrNextListOfShiftCurrent, employeeHasContrat);
        }
      }
    }
    return shift;
  }

}

