import {Injectable} from '@angular/core';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {DateService} from 'src/app/shared/service/date.service';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {Indisponibilite, WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {ShiftService} from './shift.service';
import {ContrainteSocialeService} from 'src/app/shared/service/contrainte-sociale.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import {ContratModel} from 'src/app/shared/model/contrat.model';
import {ParametreNationauxModel} from 'src/app/shared/model/parametre.nationaux.model';
import {BreakAndShiftOfParametresNationauxModel} from 'src/app/shared/model/breakAndShiftOfParametresNationaux.model';
import {ListShiftUpdatedAndDeletedModel} from '../../../../../shared/model/gui/listShiftUpdatedAndDeleted.model';
import * as rfdc from 'rfdc';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {ContrainteSocialeCoupureService} from '../../../../../shared/service/contrainte-sociale-coupure.service';


@Injectable({
  providedIn: 'root'
})
export class PlgEquipierHelperService {
  public clone = rfdc();

  constructor(private dateService: DateService, private datePipe: DatePipe,
              private shiftService: ShiftService,
              private contrainteSocialeService: ContrainteSocialeService,
              private helperService: HelperService, private sharedRestaurant: SharedRestaurantService,
              private contrainteSocialeCoupureService: ContrainteSocialeCoupureService) {
  }

  /**
   * Calcul total des heures par list shift par journée
   */
  public getHoursInDay(ListShiftInDay: ShiftModel[]): number {
    let totalInDay = 0;
    ListShiftInDay.forEach((element: ShiftModel) => {
      totalInDay += this.dateService.getDiffHeure(element.heureFin, element.heureDebut);

    });
    return totalInDay;
  }

  /**
   * Retrouve liste employés d'une date donnée à partir de la liste shifts
   */
  public getListEmployeInSelectedDate(selectedDate: any, listEmployees: EmployeeModel[], listShift: ShiftModel[]): EmployeeModel[] {
    let employeeSearch = [];
    let dateSelected = new Date(JSON.parse(JSON.stringify(selectedDate)));
    dateSelected = this.dateService.setTimeNull(dateSelected);
    listEmployees.forEach((employeDisplay: EmployeeModel) => {
      listShift.forEach((shiftUpdate: ShiftModel) => {
        if (shiftUpdate.employee && shiftUpdate.employee.idEmployee === employeDisplay.idEmployee) {
          employeeSearch = this.addUniqueEmployee(employeeSearch, employeDisplay);
        }
      });
      employeDisplay.weekDetailsPlannings.forEach(val => {
        val.shifts.forEach((shiftDisplay: ShiftModel) => {
          let dateShift = new Date(JSON.parse(JSON.stringify(shiftDisplay.dateJournee)));
          dateShift = this.dateService.setTimeNull(dateShift);
          if (moment(dateShift).isSame(dateSelected)) {
            employeeSearch = this.addUniqueEmployee(employeeSearch, employeDisplay);
          }
        });
      });
    });
    return employeeSearch;

  }

  private addUniqueEmployee(employeeSearch: any[], employeDisplay: EmployeeModel): EmployeeModel[] {
    if (employeeSearch && employeeSearch.length) {
      // pour n est pas avois des employee en meme id
      const exists = !!employeeSearch.find((employe: EmployeeModel) => employe.idEmployee === employeDisplay.idEmployee);
      if (!exists) {
        employeeSearch.push(employeDisplay);
      }
    } else {
      employeeSearch.push(employeDisplay);
    }
    return employeeSearch;
  }

  /**
   * Vérifie si un employé donné est absent sur une date donnée
   */
  public checkEmployeAbsenceInDate(listeEmployees: EmployeeModel[], idEmploye: number, dateJournee: any): boolean {
    let employeIsAbsent = false;
    const indexActifEmployee = listeEmployees.findIndex((emp: EmployeeModel) => emp.idEmployee === idEmploye);
    if (indexActifEmployee !== -1) {
      listeEmployees[indexActifEmployee].weekDetailsPlannings.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
        if (weeklyDetailsPlg.dateJour === this.datePipe.transform(dateJournee, 'yyyy-MM-dd') && weeklyDetailsPlg.libelleAbsence !== '') {
          employeIsAbsent = true;
        }
      });
    }
    return employeIsAbsent;
  }

  /**
   * Set shifts acheval values
   */
  public setAChevalValues(shift: ShiftModel): void {
    shift.heureDebutCheval = shift.heureDebut;
    shift.heureFinCheval = shift.heureFin;
    shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
    shift.heureFinChevalIsNight = shift.heureFinIsNight;
    if (!shift.modifiable) {
      shift.heureDebutChevalIsNight = false;
      shift.heureDebutIsNight = false;
      shift.heureFinChevalIsNight = false;
      shift.heureFinIsNight = false;
    }
  }

  /**
   * retourne les shifts d'une periode jour par jour
   * @param periodListShift tableau de shifts du periode selectionnée
   */
  public getDayShifts(periodListShift: ShiftModel[]): ShiftModel[][] {
    let periodeShiftList = [];
    for (let i = 0; i <= 6; i++) {
      periodeShiftList.push(periodListShift.filter((shift: ShiftModel) => new Date(shift.dateJournee).getDay() === i));
    }
    return periodeShiftList;
  }

  /**
   * Calcul total temps planifié d'une période donnée (affiché dans le recap de la vue semaine)
   */
  public getPeriodeTotalHoursForEmployee(periodeListShift: ShiftModel[], selectedEmployee: EmployeeModel, paramNationaux: any, listOfBreakAndShift: any[]): number {
    let totalInDay = 0;
    let totalRowTime = 0;
    let totalMinutes = 0;
    periodeListShift.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
    });
    this.shiftService.sortListShift(periodeListShift);
    totalInDay = 0;
    totalMinutes = 0;
    let totalCurrent = 0;
    let totalCureentFixe = 0;
    periodeListShift.forEach((shiftDisplay: ShiftModel, index: number) => {
      const shift = {...shiftDisplay};
      totalMinutes += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalCurrent = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      if (paramNationaux.payerLeBreak) {
        if (periodeListShift.length > 1) {
          let dureeMinBreak;
          let dureeMinBreakLast;
          totalCureentFixe = totalCurrent;
          totalCurrent = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, selectedEmployee, paramNationaux, listOfBreakAndShift);
          if (periodeListShift[index + 1]) {
            const pause = this.dateService.getDiffHeure(periodeListShift[index + 1].heureDebut, shift.heureFin);
            dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(selectedEmployee.loiEmployee, selectedEmployee.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(selectedEmployee), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
          }
          if (periodeListShift[index - 1]) {
            const pause = this.dateService.getDiffHeure(shift.heureDebut, periodeListShift[index - 1].heureFin);
            dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(selectedEmployee.loiEmployee, selectedEmployee.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(selectedEmployee), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));

          }
          // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
          if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
            totalInDay = totalInDay - totalCureentFixe;
          } else if (totalCurrent < totalCureentFixe && (!dureeMinBreak && !dureeMinBreakLast)) {
            totalInDay = totalInDay - totalCureentFixe;
            totalMinutes = totalMinutes - totalCureentFixe;
            totalMinutes = totalMinutes + totalCurrent;
            if (periodeListShift[index - 1]) {
              const shiftTobreak = {...periodeListShift[index - 1]};
              const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
              totalInDay = totalInDay - nbrHourLast;
            }

          } else if (periodeListShift[index - 1] && (!periodeListShift[index + 1] || !dureeMinBreak)) {
            const shiftTobreak = {...periodeListShift[index - 1]};
            totalMinutes = this.shiftService.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, periodeListShift.length, totalMinutes, selectedEmployee, paramNationaux, listOfBreakAndShift).totalMinutes;
            totalInDay = 0;
          }
        } else if (periodeListShift.length === 1) {
          totalMinutes = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalMinutes, selectedEmployee, paramNationaux, listOfBreakAndShift);
        }
      }
    });
    totalRowTime += totalMinutes;
    return totalRowTime;
  }

  /**
   * Filtrer les employés actifs d'une date selectionnée
   */
  public filterActiveEmployeesInDay(employees: EmployeeModel[], selectedDate: any): EmployeeModel[] {
    let actifEmployees = [];
    employees.forEach((employe: EmployeeModel) => {
      if (employe.groupeTravail && employe.groupeTravail.plgEquip && employe.contrats && employe.contrats.some((contrat: ContratModel) => moment(this.dateService.setTimeNull(new Date(contrat.dateEffective))).isSameOrBefore(this.dateService.setTimeNull(new Date(selectedDate))) && (
        contrat.datefin === null || moment(this.dateService.setTimeNull(new Date(selectedDate))).isSameOrBefore(this.dateService.setTimeNull(new Date(contrat.datefin)))))) {
        actifEmployees.push(employe);
      }
    });
    return actifEmployees;
  }

  /**
   * Calcul des heures d'indisponibilité des employés, pour les hachurer sur l'affichage (vue joue et semaine)
   */
  public calculIndisponibilite(employeListWithIndispo: EmployeeModel[], listEmployee: EmployeeModel[], vueSemaineOuverte: boolean, debutJourneeActivite: any, finJourneeActivite: any, selectedDate: any, endMinutesCells: number, hours: any[]): any {
    let indisponibilities = [];
    let absences = [];
    employeListWithIndispo.forEach((employe: EmployeeModel) => {
      let employeeIndex: number;
      let position: number;
      employeeIndex = listEmployee.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);

      if (employeeIndex !== -1) {
        if (listEmployee[0].idEmployee === -1 || vueSemaineOuverte) {
          position = employeeIndex * 3;
        } else {
          if (employeeIndex === 0) {
            position = 3;
          } else {
            position = employeeIndex * 3 + 3;
          }
        }
      }

      const vueJourIndispoIndex = employe.weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp.dateJour === this.datePipe.transform(selectedDate, 'yyyy-MM-dd'));
      if (vueJourIndispoIndex !== -1) {
        let finJourneeActiviteRefrence = JSON.parse(JSON.stringify(finJourneeActivite));
        let debutJourneeActiviteRefrence = JSON.parse(JSON.stringify(debutJourneeActivite));
        const nightValueDebut = debutJourneeActiviteRefrence.night;
        debutJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(debutJourneeActiviteRefrence.value);
        const nightValueFin = finJourneeActiviteRefrence.night;
        finJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(finJourneeActiviteRefrence.value);

        debutJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(selectedDate), debutJourneeActiviteRefrence), nightValueDebut);
        this.dateService.resetSecondsAndMilliseconds(debutJourneeActiviteRefrence);


        finJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(selectedDate), finJourneeActiviteRefrence), nightValueFin);
        this.dateService.resetSecondsAndMilliseconds(finJourneeActiviteRefrence);

        employe.weekDetailsPlannings[vueJourIndispoIndex].indisponibiliteEmployees.forEach((indispo: Indisponibilite) => {
          if (indispo.fromAbsence) {
            this.dateService.setCorrectTimeToDisplayForShift(indispo);
            this.dateService.resetSecondsAndMilliseconds(indispo.heureDebut);
            this.dateService.resetSecondsAndMilliseconds(indispo.heureFin);
            const cols = this.convertDurationToColsNumber(indispo.heureDebut, indispo.heureDebutIsNight, indispo.heureFin, indispo.heureFinIsNight);
            if (cols > 0) {
              absences.push({
                cols: cols,
                rows: 2,
                y: position,
                x: this.convertStartTimeToPosition(indispo.heureDebut, indispo.heureDebutIsNight, debutJourneeActivite),
                libelleAbsence: employe.weekDetailsPlannings[vueJourIndispoIndex].libelleAbsence,
                dureeTotalAbsence: employe.weekDetailsPlannings[vueJourIndispoIndex].totalAbsence
              });
            }
          } else {
            const allDayIndispo = employe.weekDetailsPlannings[vueJourIndispoIndex].indisponibiliteEmployees.find((indispo: Indisponibilite) => (indispo.heureDebut === debutJourneeActivite.value && indispo.heureFin === finJourneeActivite.value) && (!indispo.fromAbsence && !indispo.fromJourRepos));

            if (allDayIndispo) {
              let cellesToRemove = 0;
              if (endMinutesCells) {
                cellesToRemove = 4 - endMinutesCells;
              }
              // this.dateService.setCorrectTimeToDisplayForShift(allDayIndispo);
              indisponibilities.push({
                cols: hours.length * 4 - cellesToRemove, // nombre de colonne de 15 minutes par 24 heures
                rows: 2,
                y: position,
                x: 0
              });
            } else {
              this.dateService.setCorrectTimeToDisplayForShift(indispo);
              this.dateService.resetSecondsAndMilliseconds(indispo.heureDebut);
              this.dateService.resetSecondsAndMilliseconds(indispo.heureFin);
              const cols = this.convertDurationToColsNumber(indispo.heureDebut, indispo.heureDebutIsNight, indispo.heureFin, indispo.heureFinIsNight);
              if (cols > 0) {
                indisponibilities.push({
                  cols: cols,
                  rows: 2,
                  y: position,
                  x: this.convertStartTimeToPosition(indispo.heureDebut, indispo.heureDebutIsNight, debutJourneeActivite)
                });
              }

            }

          }
        });

      }
    });

    return {indisponibilities: indisponibilities, absences: absences};
  }

  /**
   * trier la liste des employées alphabétiquement
   * @param items éléments de la liste
   */
  public sortEmployees(items: EmployeeModel[]): EmployeeModel[] {
    items.sort((a: EmployeeModel, b: EmployeeModel) => {
      if (a.nom > b.nom) {
        return 1;
      } else if (a.nom < b.nom) {
        return -1;
      } else {
        return 0;
      }
    });
    return items;
  }

  /**
   * Récupérer la liste des employés à partir de la liste shift
   */
  public getEmployeesList(employees: EmployeeModel[], listShift: ShiftModel[]): EmployeeModel[] {
    const unsortedEmployees = [];
    employees = [];
    let shiftsWithoutEmployeeNumber = 0;
    listShift.forEach(shift => {
      if (shift.employee && !unsortedEmployees.find((employee: EmployeeModel) => shift.employee.idEmployee === employee.idEmployee)) {
        unsortedEmployees.push(shift.employee);
      }
      if (shift.employee === null) {
        shiftsWithoutEmployeeNumber = shiftsWithoutEmployeeNumber + 1;
      }
    });
    employees = this.sortEmployees(unsortedEmployees);
    employees = unsortedEmployees;
    for (let i = 0; i < shiftsWithoutEmployeeNumber; i++) {
      const emptyEmployee = new EmployeeModel();
      emptyEmployee.idEmployee = null;
      emptyEmployee.hebdoPlanifie = null;
      emptyEmployee.hebdoCourant = null;
      emptyEmployee.nom = null;
      emptyEmployee.prenom = null;
      emptyEmployee.matricule = null;
      employees.unshift(emptyEmployee);
    }
    return employees;
  }


  /**
   * convertir la durée d'un shift en nombre de colonnes de la grille
   * @param startTime heure de début du shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   * @param endTime heure de fin du shift
   * @param isEndTimeAtNight l'heure de fin du shift fait elle partie de la journée actuelle ou la journée suivante
   */
  public convertDurationToColsNumber(startTime: Date, isStartTimeAtNight: boolean, endTime: Date, isEndTimeAtNight: boolean) {
    let colsNumber: number;
    const startTimeHours = startTime.getHours();
    const startTimeMinutes = startTime.getMinutes();
    const endTimeHours = endTime.getHours();
    const endTimeMinutes = endTime.getMinutes();
    if ((!isStartTimeAtNight && !isEndTimeAtNight) || (isStartTimeAtNight && isEndTimeAtNight)) {
      colsNumber = (endTimeHours - startTimeHours) * 4;
    } else {
      colsNumber = ((24 - startTimeHours) * 4) + (endTimeHours * 4);
    }


    if (endTimeMinutes >= 8 && endTimeMinutes <= 22) {
      colsNumber = colsNumber + 1;
    } else if (endTimeMinutes >= 23 && endTimeMinutes <= 37) {
      colsNumber = colsNumber + 2;
    } else if (endTimeMinutes >= 38 && endTimeMinutes <= 52) {
      colsNumber = colsNumber + 3;
    } else if (endTimeMinutes >= 53 && endTimeMinutes <= 59) {
      colsNumber = colsNumber + 4;
    }

    if (startTimeMinutes >= 8 && startTimeMinutes <= 22) {
      colsNumber = colsNumber - 1;
    } else if (startTimeMinutes >= 23 && startTimeMinutes <= 37) {
      colsNumber = colsNumber - 2;
    } else if (startTimeMinutes >= 38 && startTimeMinutes <= 52) {
      colsNumber = colsNumber - 3;
    } else if (startTimeMinutes >= 53 && startTimeMinutes <= 59) {
      colsNumber = colsNumber - 4;
    }
    if (!colsNumber) {
      colsNumber = 1;
    }
    return colsNumber;
  }

  /**
   * transformer l'heure de début d'un shift à une position sur la grille
   * @param startTime heure de début d'un shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   */
  public convertStartTimeToPosition(startTime: Date, isStartTimeAtNight: boolean, debutJourneeActivite: any, endTime?: Date, isEndTimeAtNight?: boolean): number {
    let position: number;
    let cols: number;
    if (endTime && isEndTimeAtNight) {
      cols = this.convertDurationToColsNumber(startTime, isStartTimeAtNight, endTime, isEndTimeAtNight);
    }
    const startDayHour = +debutJourneeActivite.value.slice(0, -6);
    const startTimeHours = startTime.getHours();
    const startTimeMinutes = startTime.getMinutes();
    if (!isStartTimeAtNight) {
      position = (startTimeHours - startDayHour) * 4;
    } else if (isStartTimeAtNight) {
      position = ((24 - startDayHour) * 4) + (startTimeHours * 4);
    }

    if (startTimeMinutes >= 8 && startTimeMinutes <= 22) {
      position = position + 1;
    } else if (startTimeMinutes >= 23 && startTimeMinutes <= 37) {
      position = position + 2;
    } else if (startTimeMinutes >= 38 && startTimeMinutes <= 52) {
      position = position + 3;
    } else if (startTimeMinutes >= 53 && startTimeMinutes <= 59) {
      position = position + 4;
    }
    if (cols === 1) {
      position = position - 1;
    }
    return position;
  }

  /**
   * convertir la position d'un shift en temps
   * @param x position du shift
   */
  public convertPositionToTime(x: number, debutJourneeActivite: any) {
    let time: string;
    const dayStartHour = +debutJourneeActivite.value.slice(0, -6);
    time = (dayStartHour + Math.floor(x / 4)).toString();
    if (+time >= 24) {
      time = (+time - 24).toString();
    }
    if (+time < 10) {
      time = '0' + time;
    }
    let startRemainder = x % 4;
    if (startRemainder < 0) {
      startRemainder += 4;
    }
    switch (startRemainder) {
      case 0:
        time = time + ':00';
        break;
      case 1:
        time = time + ':15';
        break;
      case 2:
        time = time + ':30';
        break;
      case 3:
        time = time + ':45';
    }
    return time;
  }

  /**
   * Calculer les heures à afficher sur l'axe du temps
   */
  public getHours(debutJourneeActivite: any, finJourneeActivite: any) {
    let hours = [];
    let endMinutesCells = 0;
    let startMinutesCells = 0;
    let minutesToSubstructFin: number;
    let gridLimit: number;
    const minutesToSubstructDebut = +debutJourneeActivite.value.slice(3, 5) % 15;
    if (minutesToSubstructDebut !== 0) {
      startMinutesCells = Math.round(+debutJourneeActivite.value.slice(3, 5) / 15);
    } else {
      startMinutesCells = +debutJourneeActivite.value.slice(3, 5) / 15;
    }
    hours.push(debutJourneeActivite.value.slice(0, 3).padEnd(5, '0'));

    const start = +debutJourneeActivite.value.slice(0, 2);

    const end = +finJourneeActivite.value.slice(0, 2);
    minutesToSubstructFin = +finJourneeActivite.value.slice(3, 5) % 15;
    if (minutesToSubstructFin !== 0) {
      endMinutesCells = (+finJourneeActivite.value.slice(3, 5) + (15 - minutesToSubstructFin)) / 15;
    } else {
      endMinutesCells = +finJourneeActivite.value.slice(3, 5) / 15;
    }
    if (!endMinutesCells) {
      gridLimit = (hours.length * 4);
    } else {
      gridLimit = ((hours.length - 1) * 4) + endMinutesCells;
    }
    if (!finJourneeActivite.night) {
      let hour = start + 1;
      while (hour < end) {
        if (hour < 10) {
          hours.push('0' + (hour).toString() + ':00');
        } else {
          hours.push((hour).toString() + ':00');
        }
        hour = hour + 1;
      }
    } else {
      for (let i = start + 1; i <= 23; i++) {
        if (i < 10) {
          hours.push('0' + i.toString() + ':00');
        } else {
          hours.push(i.toString() + ':00');
        }
      }
      for (let i = 0; i < end; i++) {
        if (i < 10) {
          hours.push('0' + i.toString() + ':00');
        } else {
          hours.push(i.toString() + ':00');
        }
      }
    }
    if (endMinutesCells) {
      hours.push((end).toString() + ':00');
    }
    let backgroundRowColor = this.getBackgroundRowColor(endMinutesCells, hours);
    return {hours, endMinutesCells, startMinutesCells, minutesToSubstructFin, gridLimit, backgroundRowColor};
  }


  // Récupère la couleur du background de la grille selon découpage horaire

  private getBackgroundRowColor(endMinutesCells: number, hours: any[]): string {
    let cellsLengthToRemove = 0;
    let backgroundRowColor: string;
    if (endMinutesCells) {
      cellsLengthToRemove = 4 - endMinutesCells;
    }
    if ((hours.length - cellsLengthToRemove) % 3 === 0) {
      backgroundRowColor = 'specific-decoupage-style1';
    } else if ((hours.length - cellsLengthToRemove) % 3 === 1) {
      backgroundRowColor = 'specific-decoupage-style2';
    } else {
      backgroundRowColor = 'specific-decoupage-style3';
    }
    return backgroundRowColor;
  }

  /**
   * Trie les shifts et leurs break de paramtres nationaux
   */
  public sortBreakInParametresNationaux(paramNationaux: ParametreNationauxModel): { paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] } {
    let listOfBreakAndShift = [];

    if (paramNationaux.dureeShift1) {
      paramNationaux.dureeShift1 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeShift1);
    }
    if (paramNationaux.dureeShift2) {
      paramNationaux.dureeShift2 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeShift2);
    }
    if (paramNationaux.dureeShift3) {
      paramNationaux.dureeShift3 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeShift3);
    }
    if (paramNationaux.dureeBreak1) {
      paramNationaux.dureeBreak1 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeBreak1);
    }
    if (paramNationaux.dureeBreak2) {
      paramNationaux.dureeBreak2 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeBreak2);
    }
    if (paramNationaux.dureeBreak3) {
      paramNationaux.dureeBreak3 = this.dateService.setTimeFormatHHMM(paramNationaux.dureeBreak3);
    }
    this.setShiftAndBreakOfParmetreNationaux(paramNationaux.dureeShift1, paramNationaux.dureeBreak1, listOfBreakAndShift);
    this.setShiftAndBreakOfParmetreNationaux(paramNationaux.dureeShift2, paramNationaux.dureeBreak2, listOfBreakAndShift);
    this.setShiftAndBreakOfParmetreNationaux(paramNationaux.dureeShift3, paramNationaux.dureeBreak3, listOfBreakAndShift);
    listOfBreakAndShift.sort(function (a: BreakAndShiftOfParametresNationauxModel, b: BreakAndShiftOfParametresNationauxModel) {
      if (a.break < b.break) {
        return -1;
      }
      if (a.break > b.break) {
        return 1;
      }
      return 0;
    });
    return {paramNationaux, listOfBreakAndShift};
  }

  /**
   * ajouter des shifts et leures break
   ** @param :shift
   * @param :breakOfParmatre
   */
  public setShiftAndBreakOfParmetreNationaux(shift: Date, breakOfParmatre: Date, listOfBreakAndShift: any[]): void {
    const breakAndShift = {} as BreakAndShiftOfParametresNationauxModel;
    if (shift) {
      breakAndShift.shift = shift;
    }
    if (breakOfParmatre) {
      breakAndShift.break = breakOfParmatre;
    }
    if (breakOfParmatre && shift) {
      listOfBreakAndShift.push(breakAndShift);
    }
  }

  /**
   * Formatter les attributs d'un gridster item to shift
   ** @param :gridsterItems
   */
  public formatGridsterItems(gridsterItems: any[]): void {
    gridsterItems.forEach((item: any) => {
      if (item.hdd) {
        item.heureDebut = item.hdd;
      }
      if (item.hdf) {
        item.heureFin = item.hdf;
      }
    });
  }

  /**
   * recuperer le listes des shifts qui ont déjà été modifiées
   * @param currentPlanning
   * @param activeEmployeesPerWeek
   * @param listShiftToUpdate
   * @param listShift
   * @param listShiftToDelete
   */
  public getListShitUpdatedAndDeleted(currentPlanning: any, activeEmployeesPerWeek: EmployeeModel[], listShiftToUpdate: ShiftModel[],
                                      listShift: ShiftModel[], listShiftToDelete: ShiftModel[]): any {
    const listShiftUpdatedAndDeleted: ListShiftUpdatedAndDeletedModel = {} as ListShiftUpdatedAndDeletedModel;
    listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated = [];
    listShiftUpdatedAndDeleted.listShiftDeleted = [];
    if (!currentPlanning) {
      activeEmployeesPerWeek.forEach((employee: EmployeeModel) => {
        employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
          wdp.shifts.forEach((sh: ShiftModel) => {
            if (listShiftToUpdate.findIndex((value: ShiftModel) => value.idShift === sh.idShift) === -1 && !sh.fromPlanningManager && !sh.fromPlanningLeader) {
              listShiftToUpdate.push(sh);
            }
          });
        });
      });
      listShift.filter((sh: ShiftModel) => !sh.employee && sh.fromShiftFix).forEach((shift: ShiftModel) => {
        const index = listShiftToUpdate.findIndex((sh: ShiftModel) => sh.idShift === shift.idShift);
        if (index === -1) {
          listShiftToUpdate.push(shift);
        }
      });
      listShiftToUpdate.filter((shift: ShiftModel) => shift.fromShiftFix).forEach((shift: ShiftModel) => {
        shift.oldShiftFixId = shift.idShift;
        shift.idShift = 0;
        const index = listShift.findIndex((sh: ShiftModel) => sh.idShift === shift.oldShiftFixId);
        if (index !== -1) {
          listShift[index].idShift = 0;
        }
      });
      listShiftToDelete = [];
    } else {
      listShiftUpdatedAndDeleted.listShiftDeleted = this.getListeShiftToDeleted(listShiftUpdatedAndDeleted.listShiftDeleted, listShiftToDelete);
    }
    listShiftToUpdate.forEach(shift => {
      if (((!shift.employee && shift.idDefaultEmploye) || (shift.employee && shift.employee.idEmployee !== shift.idDefaultEmploye)) && shift.fromShiftFix) {
        shift.fromShiftFix = false;
      }
      if (shift.employee) {
        delete shift.employee.weekDetailsPlannings;
        delete shift.employee.employeeWeekShiftCS;
      }
      if (isNaN(Number(shift.idShift))) {
        shift.idShift = 0;
        if (shift.uuid) {
          delete shift.uuid;
        }
      }
      shift.createFromReference = false;
      if (this.sharedRestaurant.selectedRestaurant) {
        shift.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
      }
      if (!shift.shiftPrincipale && shift.oldShiftData) {
        shift.shiftPrincipale = shift.oldShiftData.shiftPrincipale;
      }
    });

    if (listShiftToUpdate.length > 0) {
      listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated = listShiftToUpdate;
    }
    return {
      currentPlanning: currentPlanning, activeEmployeesPerWeek: activeEmployeesPerWeek, listShiftToUpdate: listShiftToUpdate,
      listShift: listShift, listShiftToDelete: listShiftToDelete, listShiftUpdatedAndDeleted: listShiftUpdatedAndDeleted
    };
  }

  /**
   * recuperer le liste des shifts pour supprimer de la base donnée
   * @param: shiftsToBeDeleted
   * @param: listShiftToDelete
   */
  private getListeShiftToDeleted(shiftsToBeDeleted: ShiftModel[], listShiftToDelete: ShiftModel[]): ShiftModel[] {
    shiftsToBeDeleted = [];
    listShiftToDelete = listShiftToDelete.filter((sh: ShiftModel) => !isNaN(Number(sh.idShift)));
    if (listShiftToDelete.length > 0) {
      listShiftToDelete.forEach((sh: ShiftModel) => {
        const clonedSh = this.clone(sh);
        if (sh.employee) {
          clonedSh.employee.loiEmployee = [];
          clonedSh.employee.weekDetailsPlannings = [];
        }
        shiftsToBeDeleted.push(clonedSh);
      });
    }
    return shiftsToBeDeleted;
  }

  /**
   * recuperer le shift pour le sauvegarder
   *
   */
  public getShiftToSaveOrUpdate(event: any, copyEvent: boolean, selectedDate: any): { event, shiftFormat } {
    const shifts = [];
    if (event.employee && event.employee.idEmployee !== null) {
      if (event.employee.weekDetailsPlannings && event.employee.weekDetailsPlannings.length) {
        event.employee.weekDetailsPlannings.forEach(val => {
          val.shifts.forEach(shift => shift.employee.weekDetailsPlannings = []);
        });
      }
      if (event.employee.employeeWeekShiftCS && event.employee.employeeWeekShiftCS.length) {
        event.employee.employeeWeekShiftCS.forEach(val => {
          shifts.push({...val});
          val.employee.employeeWeekShiftCS = [];
        });
      }
    }
    const employeRefrence = JSON.parse(JSON.stringify(event.employee));
    const shiftFormat =
      {
        heureDebut: copyEvent ? event.heureDebut : event.heureDeDebut.hour,
        heureFin: copyEvent ? event.heureFin : event.heureDeFin.hour,
        heureDebutIsNight: copyEvent ? event.heureDebutIsNight : event.heureDeDebut.isNightTime,
        heureFinIsNight: copyEvent ? event.heureFinIsNight : event.heureDeFin.isNightTime,
        heureDebutCheval: copyEvent ? event.heureDebut : event.heureDeDebut.hour,
        heureFinCheval: copyEvent ? event.heureFin : event.heureDeFin.hour,
        heureDebutChevalIsNight: copyEvent ? event.heureDebutIsNight : event.heureDeDebut.isNightTime,
        heureFinChevalIsNight: copyEvent ? event.heureFinIsNight : event.heureDeFin.isNightTime,
        idRestaurant: this.sharedRestaurant.selectedRestaurant.idRestaurant,
        dateJournee: this.datePipe.transform(selectedDate, 'yyyy-MM-dd'),
        employee: employeRefrence,
        positionTravail: event.positionDeTravail,
        idShift: event.idShift,
        employeePosition: event.employeePosition,
        assignedShift: event.assignedShift,
        hasAssociatedShifts: event.hasAssociatedShifts,
        dragEnabled: event.dragEnabled,
        resizeEnabled: event.resizeEnabled,
        oldShiftData: event.oldShiftData,
        acheval: event.acheval,
        modifiable: true
      };
    if (event.employee) {
      event.employee.employeeWeekShiftCS = shifts;
    }
    return {event: event, shiftFormat: shiftFormat};
  }

  /**
   * ajouter le signe de pause  à le shift le plus long pour tous les employes
   * @param activeEmployeesPerWeek
   * @param listShift
   * @param listLeaderMangerWeekShifts
   * @param frConfig
   * @param decoupageHoraireFinEtDebutActivity
   * @param selectedDate
   */
  public addSigneToListShift(activeEmployeesPerWeek: EmployeeModel[], listShift: ShiftModel[], listLeaderMangerWeekShifts: any, frConfig: any, decoupageHoraireFinEtDebutActivity: any, selectedDate: any): any {
    let employeHaslaw: any;
    activeEmployeesPerWeek.forEach((employee: EmployeeModel) => {
      employee.employeeWeekShiftCS = [];
      employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        if (wdp.libelleAbsence !== '') {
          wdp.shifts.forEach((shift: ShiftModel) => {
            this.dateService.setCorrectTimeToDisplayForShift(shift);
            if (shift.employee) {
              shift.idDefaultEmploye = this.clone(shift.employee.idEmployee);
            }
            shift.shiftFromAbsence = true;
            const indexShiftInJournee = listShift.findIndex((sh: ShiftModel) => sh.idShift === shift.idShift);
            if (indexShiftInJournee !== -1) {
              listShift[indexShiftInJournee].shiftFromAbsence = true;
              listShift[indexShiftInJournee].totalAbsence = wdp.totalAbsence;
              listShift[indexShiftInJournee].employee.isAbsent = true;
            }
          });
        } else {
          wdp.shifts.forEach((shift: ShiftModel) => {
            this.dateService.setCorrectTimeToDisplayForShift(shift);
            if (shift.employee) {
              shift.idDefaultEmploye = this.clone(shift.employee.idEmployee);
            }

          });
        }
        const listShiftManagerLeaderByWeek = this.shiftService.filterShifts(wdp.shifts.filter((sh: ShiftModel) => sh.fromPlanningManager), frConfig, decoupageHoraireFinEtDebutActivity);
        const listShiftEquipierByWeek = this.shiftService.filterShifts(wdp.shifts.filter((sh: ShiftModel) => !sh.fromPlanningManager), frConfig, decoupageHoraireFinEtDebutActivity);
        listLeaderMangerWeekShifts = listLeaderMangerWeekShifts.concat(listShiftManagerLeaderByWeek);
        wdp.shifts = listShiftManagerLeaderByWeek.concat(listShiftEquipierByWeek);
        employee.employeeWeekShiftCS = employee.employeeWeekShiftCS.concat(JSON.parse(JSON.stringify(wdp.shifts)));
        employee.employeeWeekShiftCS.forEach((element: ShiftModel) => {
          element.heureFin = new Date(Date.parse(element.heureFin));
          element.heureDebut = new Date(Date.parse(element.heureDebut));
          element.heureDebutCheval = new Date(Date.parse(element.heureDebutCheval));
          element.heureFinCheval = new Date(Date.parse(element.heureFinCheval));
          this.dateService.setCorrectTimeToDisplayForShift(element);
        });
        if (employee.contrats.length === 1) {
          employeHaslaw = employee;
        } else if (employee.contrats.length > 1) {
          const employeeNew = {contrats: employee.contrats.filter(_=> true)} as EmployeeModel;
          employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(wdp.dateJour))));
        }
        const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);

        if (employeHaslaw.contrats) {
          this.helperService.verificationContraintMaxShiftWithoutBreakInListShift(employee.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, wdp.shifts);
          const dateShift = this.dateService.setTimeNull(new Date(JSON.parse(JSON.stringify(selectedDate))));
          if (moment(new Date(JSON.parse(JSON.stringify(wdp.dateJour)))).isSame(dateShift)) {
            const listShiftByEmplyeeByDay = listShift.filter(shift => shift.employee && shift.employee.idEmployee === employeHaslaw.idEmployee);
            this.helperService.verificationContraintMaxShiftWithoutBreakInListShift(employee.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, listShiftByEmplyeeByDay);
          }
          employee.hasShift = true;
        }

      });

      if (employee.groupeTravail && (employee.groupeTravail.plgMgr || employee.groupeTravail.plgLeader)) {
        employee.isManagerOrLeader = true;
      }
    });
    return {activeEmployeesPerWeek: activeEmployeesPerWeek, listShift: listShift, listLeaderMangerWeekShifts: listLeaderMangerWeekShifts};
  }

  /**
   * modifier la list de shift
   */
  public updateListShift(indexShiftToUpdate: number, list: ShiftModel[], shiftToSave: ShiftModel, oldShift: ShiftModel, selectedDate: Date, modeAffichage: number, showEmployeeDetails: boolean, updateVueSemaine: boolean, isListShiftToUpdate?: boolean) {
    indexShiftToUpdate = list.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
    if (indexShiftToUpdate !== -1) {
      let shiftUpdate = list[indexShiftToUpdate];
      shiftToSave.idDefaultEmploye = shiftUpdate.idDefaultEmploye;
      shiftToSave.fromShiftFix = shiftUpdate.fromShiftFix;
    }
    if (modeAffichage === 0 || !shiftToSave.acheval) {
      if (!isListShiftToUpdate && indexShiftToUpdate !== -1 && this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(selectedDate, 'yyyy-MM-dd')) {
        list.splice(indexShiftToUpdate, 1);
      } else if (indexShiftToUpdate !== -1) {
        list.splice(indexShiftToUpdate, 1);
        list.push(this.clone(shiftToSave));
      } else if (this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(selectedDate, 'yyyy-MM-dd')) {
        list.push(this.clone(shiftToSave));
      }
    } else if (shiftToSave.acheval) {
      if (!shiftToSave.modifiable) {
        if (!updateVueSemaine) {
          shiftToSave.heureDebut = shiftToSave.heureDebutCheval;
          shiftToSave.heureDebutIsNight = updateVueSemaine;
          shiftToSave.heureFin = shiftToSave.heureFinCheval;
          shiftToSave.heureFinIsNight = updateVueSemaine;
        }
        if (!showEmployeeDetails && this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(selectedDate, 'yyyy-MM-dd')) {
          indexShiftToUpdate = list.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
        }
      }
      if (!isListShiftToUpdate && indexShiftToUpdate !== -1 && this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(selectedDate, 'yyyy-MM-dd')) {
        if (!shiftToSave.modifiable && updateVueSemaine) {
          list[indexShiftToUpdate].heureDebutCheval = shiftToSave.heureDebutCheval;
          list[indexShiftToUpdate].heureFinCheval = shiftToSave.heureFinCheval;
        } else {
          const item = list.splice(indexShiftToUpdate, 1);
          if (!shiftToSave.modifiable) {
            if (!oldShift || (oldShift && !oldShift.hasOwnProperty('fromUndoResize'))) {
              shiftToSave.dateJournee = new Date(shiftToSave.dateJournee.getTime() - (24 * 60 * 60 * 1000));
              shiftToSave.dateJournee.setHours(12);
            }
            list.push(this.clone(shiftToSave));
          }
          if (item.length && updateVueSemaine && this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(selectedDate, 'yyyy-MM-dd') && shiftToSave.modifiable) {
            list.push(item[0]);
          }
        }
      } else if (indexShiftToUpdate !== -1) {
        list.splice(indexShiftToUpdate, 1);
        list.push(this.clone(shiftToSave));
      } else if (this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(selectedDate, 'yyyy-MM-dd')) {
        list.push(this.clone(shiftToSave));
      }
    }
  }

}

