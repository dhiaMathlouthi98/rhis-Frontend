import {Injectable} from '@angular/core';
import {JourSemaine} from '../enumeration/jour.semaine';
import {DateService} from './date.service';
import {ShiftModel} from '../model/shift.model';
import {EmployeeModel} from '../model/employee.model';
import {ContrainteSocialeService} from './contrainte-sociale.service';
import {VerificationContrainteModel} from '../model/verificationContrainte.model';
import {PlanningManagerModel} from '../model/planningManager.model';
import {ContrainteSocialeCoupureService} from './contrainte-sociale-coupure.service';
import {ShiftService} from 'src/app/modules/home/planning/planning-equipier/service/shift.service';
import * as moment from 'moment';
import * as rfdc from 'rfdc';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  public clone = rfdc();
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

  constructor(private dateService: DateService, private contrainteSocialeService: ContrainteSocialeService,
              private contrainteSocialeCoupureService: ContrainteSocialeCoupureService, private shiftService: ShiftService) {
  }

  /**
   * transforme les heures en date
   * @param valeur
   */
  public getNombreHeureTravaille(valeur: number): any {
    const returnedDate: Date = new Date();
    returnedDate.setHours(valeur / 60);
    const hours = Math.floor(valeur);
    const minute = Number((valeur - hours).toPrecision(2));
    returnedDate.setHours(hours);
    returnedDate.setMinutes(minute * 100);
    returnedDate.setSeconds(0, 0);
    return returnedDate;

  }

  /**
   * nbre de jours non travaillé par employée
   * @param shift
   */
  public getNombreDeJourOffDansUneSemaine(list: ShiftModel[], shift: ShiftModel): number {
    let nombreDesJoursOffDansUneSemaine = 0;
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    if (list) {
      if(shift) {
        if (!shift.idShift && (list.findIndex((sh: ShiftModel) => sh.idShift === 0) === -1)) {
          list.push(shift);
        } else {
          const indexShiftToReplace = list.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shift.idShift);
          if (indexShiftToReplace !== -1) {
            list.splice(indexShiftToReplace, 1);
            list.push({...shift});
          } else {
            list.push({...shift});
          }
        }
      }
      list.forEach(item => {
        item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
        if (item.jour === JourSemaine.DIMANCHE) {
          isWorkingDimanche = true;
        } else if (item.jour === JourSemaine.LUNDI) {
          isWorkingLundi = true;
        } else if (item.jour === JourSemaine.MARDI) {
          isWorkingMardi = true;
        } else if (item.jour === JourSemaine.MERCREDI) {
          isWorkingMercredi = true;
        } else if (item.jour === JourSemaine.JEUDI) {
          isWorkingJeudi = true;
        } else if (item.jour === JourSemaine.VENDREDI) {
          isWorkingVendredi = true;
        } else if (item.jour === JourSemaine.SAMEDI) {
          isWorkingSamedi = true;
        }
      });
    }

    if (!isWorkingDimanche) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingLundi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingMardi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingMercredi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingJeudi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingVendredi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingSamedi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    return nombreDesJoursOffDansUneSemaine;
  }

  /**
   * recupere le jour de repos de l'employee a plannifie
   * @param :shiftFixe
   */
  public getJourRepos(list): number[] {
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    const jourRepos: number[] = [];


    list.forEach(item => {
      item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
      if (item.jour === JourSemaine.DIMANCHE) {
        isWorkingDimanche = true;
      } else if (item.jour === JourSemaine.LUNDI) {
        isWorkingLundi = true;
      } else if (item.jour === JourSemaine.MARDI) {
        isWorkingMardi = true;
      } else if (item.jour === JourSemaine.MERCREDI) {
        isWorkingMercredi = true;
      } else if (item.jour === JourSemaine.JEUDI) {
        isWorkingJeudi = true;
      } else if (item.jour === JourSemaine.VENDREDI) {
        isWorkingVendredi = true;
      } else if (item.jour === JourSemaine.SAMEDI) {
        isWorkingSamedi = true;
      }
    });

    if (!isWorkingLundi) {
      jourRepos.push(1);
    }
    if (!isWorkingMardi) {
      jourRepos.push(2);
    }
    if (!isWorkingMercredi) {
      jourRepos.push(3);
    }
    if (!isWorkingJeudi) {
      jourRepos.push(4);
    }
    if (!isWorkingVendredi) {
      jourRepos.push(5);
    }
    if (!isWorkingSamedi) {
      jourRepos.push(6);
    }
    if (!isWorkingDimanche) {
      jourRepos.push(0);
    }
    return jourRepos;
  }

  /**
   * recuperer le jour avant pour le deail shift fixe
   * @param :shiftFixe
   */
  public getLastDayValues(shift: any, list: any, previousListShift?: ShiftModel[]): ShiftModel[] {
    let lastDayDate;
    let lastShiftFixeValues: ShiftModel[] = [];
    if (shift.jour === JourSemaine.DIMANCHE) {
      lastDayDate = JourSemaine.SAMEDI;
    }
    if (shift.jour === JourSemaine.LUNDI) {
      lastDayDate = JourSemaine.DIMANCHE;
    }
    if (shift.jour === JourSemaine.MARDI) {
      lastDayDate = JourSemaine.LUNDI;
    }
    if (shift.jour === JourSemaine.MERCREDI) {
      lastDayDate = JourSemaine.MARDI;
    }
    if (shift.jour === JourSemaine.JEUDI) {
      lastDayDate = JourSemaine.MERCREDI;
    }
    if (shift.jour === JourSemaine.VENDREDI) {
      lastDayDate = JourSemaine.JEUDI;
    }
    if (shift.jour === JourSemaine.SAMEDI) {
      lastDayDate = JourSemaine.VENDREDI;
    }


    list.forEach(item => {
      if (shift && item.idShift !== shift.idShift) {
        item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
        if (item.jour === lastDayDate) {
          this.dateService.setCorrectTimeToDisplay(item);
          lastShiftFixeValues.push(item);
        }
      }

    });
    if (previousListShift && previousListShift.length && lastDayDate === this.dateService.getJourSemaineFromInteger(new Date(previousListShift[0].dateJournee).getDay())) {
      lastShiftFixeValues = previousListShift;
    }
    return lastShiftFixeValues;
  }

  /**
   *   recuperer le jour apres pour le  shift fixe
   */
  public getNextDayValues(shift, list, nextListShift?: ShiftModel[]): ShiftModel[] {
    let nextDayDate;
    if (shift.jour === JourSemaine.DIMANCHE) {
      nextDayDate = JourSemaine.LUNDI;
    }
    if (shift.jour === JourSemaine.LUNDI) {
      nextDayDate = JourSemaine.MARDI;
    }
    if (shift.jour === JourSemaine.MARDI) {
      nextDayDate = JourSemaine.MERCREDI;
    }
    if (shift.jour === JourSemaine.MERCREDI) {
      nextDayDate = JourSemaine.JEUDI;
    }
    if (shift.jour === JourSemaine.JEUDI) {
      nextDayDate = JourSemaine.VENDREDI;
    }
    if (shift.jour === JourSemaine.VENDREDI) {
      nextDayDate = JourSemaine.SAMEDI;
    }
    if (shift.jour === JourSemaine.SAMEDI) {
      nextDayDate = JourSemaine.DIMANCHE;
    }
    let nextShiftFixeValues: ShiftModel[] = [];

    list.forEach(item => {
      item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
      if (item.idShift !== shift.idShift) {

        if (item.jour === nextDayDate) {
          this.dateService.setCorrectTimeToDisplay(item);
          nextShiftFixeValues.push(item);
        }
      }

    });
    if (nextListShift && nextListShift.length && nextDayDate === this.dateService.getJourSemaineFromInteger(new Date(nextListShift[0].dateJournee).getDay())) {
      nextShiftFixeValues = nextListShift;
    }
    return nextShiftFixeValues;
  }

  /**
   * recuperer la list de shift entre le dernier jour et le premier jour de la semaine

   * @param selecteDate
   * @param premierJourDeLaSemaine
   * @param employeCs
   * @param shiftRef
   */
  public getListShiftOrBeforeLastDay(selecteDate: Date, premierJourDeLaSemaine: JourSemaine, employeCs: EmployeeModel, shiftRef: any): ShiftModel[] {
    let previousListShift: ShiftModel[] = [];
    let nextListShift: ShiftModel[] = [];
    const dateDisplay = new Date(selecteDate);
    const dateDebut = new Date(dateDisplay.getTime() - (this.shiftService.findDecalage(dateDisplay, premierJourDeLaSemaine) * this.ONE_DAY_IN_MILLISECONDS));
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + 6);
    if (employeCs.listShiftForThreeWeek && employeCs.listShiftForThreeWeek.length) {
      if (this.dateService.getJourSemaineFromInteger(new Date(dateDebut).getDay()) === this.dateService.getJourSemaineFromInteger(new Date(shiftRef.dateJournee).getDay())) {
        const dateCompared = new Date(this.clone(dateDebut));
        dateCompared.setDate(dateCompared.getDate() - 1);
        previousListShift = this.getListShiftInNextOrPreviousWeek(employeCs, dateCompared);
      } else if (this.dateService.getJourSemaineFromInteger(new Date(dateFin).getDay()) === this.dateService.getJourSemaineFromInteger(new Date(shiftRef.dateJournee).getDay())) {
        const dateCompared = new Date(this.clone(dateFin));
        dateCompared.setDate(dateCompared.getDate() + 1);
        nextListShift = this.getListShiftInNextOrPreviousWeek(employeCs, dateCompared);
      }
    }
    if (previousListShift.length) {
      return previousListShift;
    } else if (nextListShift.length) {
      return nextListShift;
    } else {
      return null;
    }
  }

  /**
   * recuperer la list de shift de la semaine precedente ou suivante
   * @param: employeCs
   * @param :dateCompared
   */
  public getListShiftInNextOrPreviousWeek(employeCs: EmployeeModel, dateCompared: Date): ShiftModel[] {
    const previousOrNextListShift: ShiftModel[] = [];
    employeCs.listShiftForThreeWeek.forEach((ShiftWeek: any) => {
      ShiftWeek.heureDebut = new Date(ShiftWeek.heureDebut);
      ShiftWeek.heureFin = new Date(ShiftWeek.heureFin);

      ShiftWeek.dateJournee = this.dateService.setTimeNull(ShiftWeek.dateJournee);
      dateCompared = this.dateService.setTimeNull(dateCompared);
      if (moment(dateCompared).isSame(ShiftWeek.dateJournee)) {
        previousOrNextListShift.push(ShiftWeek);
      }
    });
    return previousOrNextListShift;

  }


  /**
   * recupere le nbre de jour travailee pour un employee dans une semaine
   */
  public getNombreDeJourTravaillerDansUneSemaine(shift, list, premierJourDeLaSemaine): number {
    let resultingNumber = 0;
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;

    list.forEach(item => {
      item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
      // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
      if (shift && shift.idShift === item.idShift) {
        item = shift;
      }
      if (item.jour === JourSemaine.DIMANCHE) {
        isWorkingDimanche = true;
      } else if (item.jour === JourSemaine.LUNDI) {
        isWorkingLundi = true;
      } else if (item.jour === JourSemaine.MARDI) {
        isWorkingMardi = true;
      } else if (item.jour === JourSemaine.MERCREDI) {
        isWorkingMercredi = true;
      } else if (item.jour === JourSemaine.JEUDI) {
        isWorkingJeudi = true;
      } else if (item.jour === JourSemaine.VENDREDI) {
        isWorkingVendredi = true;
      } else if (item.jour === JourSemaine.SAMEDI) {
        isWorkingSamedi = true;
      }
    });

  
    if (isWorkingDimanche) {
      resultingNumber++;
    }
    if (isWorkingLundi) {
      resultingNumber++;
    }
    if (isWorkingMardi) {
      resultingNumber++;
    }
    if (isWorkingMercredi) {
      resultingNumber++;
    }
    if (isWorkingJeudi) {
      resultingNumber++;
    }
    if (isWorkingVendredi) {
      resultingNumber++;
    }
    if (isWorkingSamedi) {
      resultingNumber++;
    }
    return resultingNumber;
  }

  /**
   * recuperer le nbr de jour travailller ds deux semaine
   * @param maxLoop
   * @param shift
   */
  public getNombreDeJourTravaillerDansDeuxSemaines(listShift: ShiftModel[], premierJourDeLaSemaine: JourSemaine, employee: EmployeeModel, selectedDate: string, maxLoop: number, shift): number {
    let resultingNumber = 0;
    let isWorkingLundi: boolean;
    let isWorkingMardi: boolean;
    let isWorkingMercredi: boolean;
    let isWorkingJeudi: boolean;
    let isWorkingVendredi: boolean;
    let isWorkingSamedi: boolean;
    let isWorkingDimanche: boolean;
    let dateDebutLoop: Date;
    for (let loop = maxLoop - 2; loop < maxLoop; loop++) {
      dateDebutLoop = new Date(JSON.parse(JSON.stringify(selectedDate)));
      dateDebutLoop.setDate(dateDebutLoop.getDate() + (loop * 7));
      isWorkingLundi = false;
      isWorkingMardi = false;
      isWorkingMercredi = false;
      isWorkingJeudi = false;
      isWorkingVendredi = false;
      isWorkingSamedi = false;
      isWorkingDimanche = false;
      let collection = [];
      collection = listShift;
      if (collection) {
        collection.unshift(shift);
      } else {
        collection = [];
        collection.push();
      }
      if (collection.length) {
        collection.forEach(item => {
          if (item.employee && employee.idEmployee === item.employee.idEmployee) {
            item.dateJournee = new Date(item.dateJournee);
            if (item.dateJournee < dateDebutLoop) {
              if (item.dateJournee.getDay() === 0) {
                isWorkingDimanche = true;
              } else if (item.dateJournee.getDay() === 1) {
                isWorkingLundi = true;
              } else if (item.dateJournee.getDay() === 2) {
                isWorkingMardi = true;
              } else if (item.dateJournee.getDay() === 3) {
                isWorkingMercredi = true;
              } else if (item.dateJournee.getDay() === 4) {
                isWorkingJeudi = true;
              } else if (item.dateJournee.getDay() === 5) {
                isWorkingVendredi = true;
              } else if (item.dateJournee.getDay() === 6) {
                isWorkingSamedi = true;
              }
            }
          }
        });
        collection.splice(collection[0], 1);

      }
      if (premierJourDeLaSemaine === JourSemaine.DIMANCHE) {
        if (isWorkingDimanche) {
          resultingNumber += 64;
        }
        if (isWorkingLundi) {
          resultingNumber += 32;
        }
        if (isWorkingMardi) {
          resultingNumber += 16;
        }
        if (isWorkingMercredi) {
          resultingNumber += 8;
        }
        if (isWorkingJeudi) {
          resultingNumber += 4;
        }
        if (isWorkingVendredi) {
          resultingNumber += 2;
        }
        if (isWorkingSamedi) {
          resultingNumber += 1;
        }

      }
      if (premierJourDeLaSemaine === JourSemaine.LUNDI) {
        if (isWorkingLundi) {
          resultingNumber += 64;
        }
        if (isWorkingMardi) {
          resultingNumber += 32;
        }
        if (isWorkingMercredi) {
          resultingNumber += 16;
        }
        if (isWorkingJeudi) {
          resultingNumber += 8;
        }
        if (isWorkingVendredi) {
          resultingNumber += 4;
        }
        if (isWorkingSamedi) {
          resultingNumber += 2;
        }
        if (isWorkingDimanche) {
          resultingNumber += 1;
        }
      }
      if (premierJourDeLaSemaine === JourSemaine.MARDI) {
        if (isWorkingMardi) {
          resultingNumber += 64;
        }
        if (isWorkingMercredi) {
          resultingNumber += 32;
        }
        if (isWorkingJeudi) {
          resultingNumber += 16;
        }
        if (isWorkingVendredi) {
          resultingNumber += 8;
        }
        if (isWorkingSamedi) {
          resultingNumber += 4;
        }
        if (isWorkingDimanche) {
          resultingNumber += 2;
        }
        if (isWorkingLundi) {
          resultingNumber += 1;
        }
      }
      if (premierJourDeLaSemaine === JourSemaine.MERCREDI) {
        if (isWorkingMercredi) {
          resultingNumber += 64;
        }
        if (isWorkingJeudi) {
          resultingNumber += 32;
        }
        if (isWorkingVendredi) {
          resultingNumber += 16;
        }
        if (isWorkingSamedi) {
          resultingNumber += 8;
        }
        if (isWorkingDimanche) {
          resultingNumber += 4;
        }
        if (isWorkingLundi) {
          resultingNumber += 2;
        }
        if (isWorkingMardi) {
          resultingNumber += 1;
        }
      }
      if (premierJourDeLaSemaine === JourSemaine.JEUDI) {
        if (isWorkingJeudi) {
          resultingNumber += 64;
        }
        if (isWorkingVendredi) {
          resultingNumber += 32;
        }
        if (isWorkingSamedi) {
          resultingNumber += 16;
        }
        if (isWorkingDimanche) {
          resultingNumber += 8;
        }
        if (isWorkingLundi) {
          resultingNumber += 4;
        }
        if (isWorkingMardi) {
          resultingNumber += 2;
        }
        if (isWorkingMercredi) {
          resultingNumber += 1;
        }
      }
      if (premierJourDeLaSemaine === JourSemaine.VENDREDI) {
        if (isWorkingVendredi) {
          resultingNumber += 64;
        }
        if (isWorkingSamedi) {
          resultingNumber += 32;
        }
        if (isWorkingDimanche) {
          resultingNumber += 16;
        }
        if (isWorkingLundi) {
          resultingNumber += 8;
        }
        if (isWorkingMardi) {
          resultingNumber += 4;
        }
        if (isWorkingMercredi) {
          resultingNumber += 2;
        }
        if (isWorkingJeudi) {
          resultingNumber += 1;
        }
      }
      if (premierJourDeLaSemaine === JourSemaine.SAMEDI) {
        if (isWorkingSamedi) {
          resultingNumber += 64;
        }
        if (isWorkingDimanche) {
          resultingNumber += 32;
        }
        if (isWorkingLundi) {
          resultingNumber += 16;
        }
        if (isWorkingMardi) {
          resultingNumber += 8;
        }
        if (isWorkingMercredi) {
          resultingNumber += 4;
        }
        if (isWorkingJeudi) {
          resultingNumber += 2;
        }
        if (isWorkingVendredi) {
          resultingNumber += 1;
        }
      }
    }

    return resultingNumber;
  }

  /**
   * Cette methode permer de calculer le decalage entre la date saisie et le premier jour de la semaine du restaurant
   */
  public findDecalage(date: any, premierJourDeLaSemaine: JourSemaine): number {
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
   *  Vérification de la contrainte "Longueur maximum d’un shift sans break"
   * @param shift
   * @param listLoi
   * @param tempsTravailPartiel
   * @param mineur
   */
  public verificationContraintMaxShiftWithoutBreak(shiftToCheck: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, employeesShift: any[]): VerificationContrainteModel {
    let verificationContrainte;
    let searchedVerificationContrainte;
    let nbrHour = 0;
    if(shiftToCheck) {
       nbrHour = this.dateService.getDiffHeure(shiftToCheck.heureFin, shiftToCheck.heureDebut);
    }
    shiftToCheck.sign = false;
    verificationContrainte = this.contrainteSocialeService.validDureeMaxSansBreak(this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(nbrHour)), listLoi, tempsTravailPartiel, mineur, true);
    if (verificationContrainte) {
      shiftToCheck.sign = true;
      return verificationContrainte;
    } else {
      searchedVerificationContrainte = this.verificationContraintMaxShiftWithoutBreakInListShift(listLoi, tempsTravailPartiel, mineur, employeesShift);
    }
    return searchedVerificationContrainte;
  }

  /**
   * Vérification de la contrainte "Longueur maximum d’un shift sans brea pour plusieurs shift
   * @param listLoi
   * @param tempsTravailPartiel
   * @param mineur
   * @param employeesShift
   */
  public verificationContraintMaxShiftWithoutBreakInListShift(listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, employeesShift: any[]): VerificationContrainteModel {
    let verificationContrainte;
    let searchedVerificationContrainte;
    let nbrHourCurrent = 0;
    let nbrHour = 0;
    let i = 0;
    if (employeesShift.length && employeesShift.length === 1) {

      nbrHour = this.dateService.getDiffHeure(employeesShift[0].heureFin, employeesShift[0].heureDebut);
      employeesShift[0].sign = false;
      verificationContrainte = this.contrainteSocialeService.validDureeMaxSansBreak(this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(nbrHour)), listLoi, tempsTravailPartiel, mineur, true);
      if (verificationContrainte) {
        employeesShift[0].sign = true;
        return verificationContrainte;
      }
    } else {
      this.sortListShift(employeesShift);
      employeesShift.forEach((shiftDisplay: any, index: number) => {
        employeesShift[index].sign = false;

        shiftDisplay.totalHeure = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
        nbrHour += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
        nbrHourCurrent = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
        verificationContrainte = this.contrainteSocialeService.validDureeMaxSansBreak(this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(nbrHourCurrent)), listLoi, tempsTravailPartiel, mineur, true);
        if (verificationContrainte) {
          // si il y a un pause i doit recoit index pour identifier le signe
          employeesShift[index].sign = true;
          nbrHour = 0;
          searchedVerificationContrainte = JSON.parse(JSON.stringify(verificationContrainte));
        }
        if (index >= 1) {
          verificationContrainte = this.contrainteSocialeService.validDureeMaxSansBreak(this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(nbrHour)), listLoi, tempsTravailPartiel, mineur, true);
          const pause = this.dateService.getDiffHeure(shiftDisplay.heureDebut, employeesShift[index - 1].heureFin);
          const dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(listLoi, tempsTravailPartiel, mineur, this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
          if (!dureeMinBreak) {
            // si il y a un pause i doit recoit index pour identifier le signe
            i = index;
            nbrHour = +JSON.parse(JSON.stringify(nbrHourCurrent));
          } else if (verificationContrainte) {
            employeesShift[i].sign = true;
            for (let loop = i; loop <= index; loop++) {
              if (employeesShift[i].totalHeure < employeesShift[loop].totalHeure) {
                employeesShift[i].sign = false;
                employeesShift[loop].sign = true;
                i = loop;
              }
            }
            if (!searchedVerificationContrainte) {
              searchedVerificationContrainte = JSON.parse(JSON.stringify(verificationContrainte));
            }
          }
        }

      });
    }
    return searchedVerificationContrainte;
  }

  public addShiftToListShiftByDayWithBreak(listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, employeesShift: any[]): number {
    let nombreShiftParJour = 0;
    this.sortListShift(employeesShift);
    if (employeesShift && employeesShift.length > 1) {
      employeesShift.forEach((shiftDisplay: any, index: number) => {
        if (index >= 1) {
          const pause = this.dateService.getDiffHeure(shiftDisplay.heureDebut, employeesShift[index - 1].heureFin);
          const dureeMaxBreak = this.contrainteSocialeService.validDureeMaxBreak(listLoi, tempsTravailPartiel, mineur, this.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
          if (!dureeMaxBreak) {
            nombreShiftParJour++;
          } else if (index - 1 === 0 && nombreShiftParJour > 1) {
            nombreShiftParJour--;
          }
        } else {
          nombreShiftParJour = 1;
        }
      });
    } else {
      nombreShiftParJour = 1;
    }
    return nombreShiftParJour;
  }

  /**
   * Trie des shifts
   */
  private sortListShift(listShift: any[]): void {
    listShift.sort(function (a: any, b: any) {
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
   * Vérification de la durée minimale d'un shift lors du sauvegarde global
   */
  public verifDureeMinDesShifts(days: any, listManagerOrLeaderActif: EmployeeModel[], planningByManagerOrLeader: any, messageVerification: VerificationContrainteModel, dateDebut: Date, loiGroupeTravail: any, loiRestaurant: any, joursSemainEnum: any, vuePoste?: boolean): VerificationContrainteModel[] {
    let verificationContrainte = new VerificationContrainteModel();
    let employeHaslaw: EmployeeModel;
    const listContrainteDureeMinShift: VerificationContrainteModel[] = [];
    let loi;

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
        if (employeDisplay.contrats.length === 1) {
          employeHaslaw = employeDisplay;
        } else if (employeDisplay.contrats.length > 1) {
          const employeeNew = JSON.parse(JSON.stringify(employeDisplay));
          employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(this.contrainteSocialeCoupureService.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)));
        }
        const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);
        if (employeHaslaw.hasLaws) {
          // employee laws
          if (vuePoste) {
            loi = loiGroupeTravail;
          } else {
            loi = employeHaslaw.loiEmployee;
          }
        } else if (employeHaslaw.contrats[0].groupeTravail.hasLaws) {
          // groupe trav laws
          loi = loiGroupeTravail;
        } else {
          // restaurant laws
          loi = loiRestaurant;
        }
        // get list shift by day by employee
        const listShiftByDay = this.contrainteSocialeCoupureService.grouperShiftParJour(day.val, collection);

        if (listShiftByDay.length && listShiftByDay.length === 1) {
          const dureeShift = this.dateService.formatMinutesToHours(this.dateService.getDiffHeure(listShiftByDay[0].heureFin, listShiftByDay[0].heureDebut));
          verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
          if (verificationContrainte) {
            messageVerification.bloquante = verificationContrainte.bloquante;
            verificationContrainte.employe = employeHaslaw;
            verificationContrainte.idShift = listShiftByDay[0].idShift;
            verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(new Date(JSON.parse(JSON.stringify(this.contrainteSocialeCoupureService.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)))), '/');
            listContrainteDureeMinShift.push(verificationContrainte);

          }
        } else if (listShiftByDay.length && listShiftByDay.length > 1) {
          this.contrainteSocialeCoupureService.sortListShift(listShiftByDay);
          const listShiftDuree = this.shiftService.getListShiftDurationByMaxBreak(listShiftByDay, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
          listShiftDuree.forEach((dureeShift: any) => {
            dureeShift = this.dateService.formatMinutesToHours(dureeShift);
            verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, loi, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
            if (verificationContrainte) {
              messageVerification.bloquante = verificationContrainte.bloquante;
              verificationContrainte.employe = employeHaslaw;
              verificationContrainte.idShift = listShiftByDay[0].idShift;
              verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(new Date(JSON.parse(JSON.stringify(this.contrainteSocialeCoupureService.setJourSemaine(day.val.toUpperCase(), dateDebut, joursSemainEnum)))), '/');
              if (!listContrainteDureeMinShift.some((cs: any) => cs.dateOfAnomalie === verificationContrainte.dateOfAnomalie)) {
                listContrainteDureeMinShift.push(verificationContrainte);
              }
            }
          });

        }
      });
    }
    return listContrainteDureeMinShift;
  }
}
