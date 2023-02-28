import {Injectable} from '@angular/core';
import {ContratModel} from '../../../../shared/model/contrat.model';
import {JourDisponibiliteModel} from '../../../../shared/model/jourDisponibilite.model';
import * as moment from 'moment';
import {Subject} from 'rxjs';

@Injectable()
export class ContratUtilitiesService {
  private avenantParam: Subject<any> = new Subject<any>();

  public setAvenantParam(value: any): void {
    this.avenantParam.next(value);
  }

  public getAvenantParam() {
    return this.avenantParam.asObservable();
  }
  /**
   * Check Disponibilite periode with hebdo, it should be greater or equal at least to be accepted
   * @param: hebdo
   */
  public isTotalDispoCorrect(contrat: ContratModel): boolean {
    const hebdo = +contrat.hebdo;
    if ((contrat.disponibilite.jourDisponibilites === null) || (!contrat.disponibilite.jourDisponibilites.length)) {
      return false;
    }
    const oddJourDisponibilites = contrat.disponibilite.jourDisponibilites.filter((jourDispo: JourDisponibiliteModel) => jourDispo.odd);
    const pairJourDisponibilites = contrat.disponibilite.jourDisponibilites.filter((jourDispo: JourDisponibiliteModel) => !jourDispo.odd);
    const isTotalOddDispoGreaterOrEqualHebdo = oddJourDisponibilites.length ? this.isSubJourDisponibiliteGreatOrEqualHebdo(oddJourDisponibilites, hebdo) : true;
    const isTotalPairDispoGreaterOrEqualHebdo = pairJourDisponibilites.length ? this.isSubJourDisponibiliteGreatOrEqualHebdo(pairJourDisponibilites, hebdo) : true;
    return isTotalOddDispoGreaterOrEqualHebdo && isTotalPairDispoGreaterOrEqualHebdo;
  }

  public isTotalDispoDayAndWeekCorrect(contrat: ContratModel, maxDispoDay: number, maxDispoWeek: number): boolean {
    if (contrat.tempsPartiel) {
      if ((contrat.disponibilite.jourDisponibilites === null) || (!contrat.disponibilite.jourDisponibilites.length)) {
        return false;
      }
      const oddJourDisponibilites = contrat.disponibilite.jourDisponibilites.filter((jourDispo: JourDisponibiliteModel) => jourDispo.odd);
      const pairJourDisponibilites = contrat.disponibilite.jourDisponibilites.filter((jourDispo: JourDisponibiliteModel) => !jourDispo.odd);
      const isTotalOddDispoGreaterOrEqualHebdo = oddJourDisponibilites.length ? this.isSubJourDisponibiliteHasValidMaxTimeDispo(oddJourDisponibilites, maxDispoDay, maxDispoWeek) : true;
      const isTotalPairDispoGreaterOrEqualHebdo = pairJourDisponibilites.length ? this.isSubJourDisponibiliteHasValidMaxTimeDispo(pairJourDisponibilites, maxDispoDay, maxDispoWeek) : true;
      return isTotalOddDispoGreaterOrEqualHebdo && isTotalPairDispoGreaterOrEqualHebdo;
    }
    return true;
  }

  /**
   * Calculate if sub availability days (odd/pair ones) is greater or equal contract hebdo
   * @param: jourDispo
   * @param: hebdo
   */
  private isSubJourDisponibiliteGreatOrEqualHebdo(jourDispo: JourDisponibiliteModel[], hebdo: number): boolean {
    const totalDispo = this.getTotalDispoHebdo(jourDispo);
    return hebdo <= totalDispo;
  }

  private isSubJourDisponibiliteHasValidMaxTimeDispo(dispoDays: JourDisponibiliteModel[], maxDispoDay: number, maxDispoWeek: number): boolean {
    let totalDispo = 0;
    for (let i = 0; i < dispoDays.length; i++) {
      const j = dispoDays[i];
      let dayDispo = 0;
      [1, 2, 3].forEach((index: number) => {
        dayDispo += this.getTotalDispo(j, index);
      });
      if (dayDispo > maxDispoDay) {
        return false;
      }
      totalDispo += dayDispo;
      if (totalDispo > maxDispoWeek) {
        return false;
      }
    }
    return true;
  }

  public getTotalDispoHebdo(jourDispo: JourDisponibiliteModel[]): number {
    let totalDispo = 0;
    jourDispo.forEach((j: JourDisponibiliteModel) => {
      [1, 2, 3].forEach((index: number) => {
        totalDispo += this.getTotalDispo(j, index);
      });
    });
    return +totalDispo.toFixed(2);
  }

  public getTotalDispoPerDay(jourDispo: JourDisponibiliteModel[]): {day: string, value: number}[] {
    const dispoPerDay = [];
    jourDispo.forEach((j: JourDisponibiliteModel) => {
      let totalDispo = 0;
      [1, 2, 3].forEach((index: number) => {
        totalDispo += this.getTotalDispo(j, index);
      });
      dispoPerDay.push({day: j.jourSemain, value: +totalDispo.toFixed(2)});
    });
    return dispoPerDay;
  }

  /**
   * Créer une date à partir d'une chanie de caractère
   * @param: dispoDate
   * @param: separator
   */
  public getDispoHour(dispoDate: string, separator: string): Date {
    const date = new Date();
    const timeparts = dispoDate.split(separator);
    date.setHours(+timeparts[0], +timeparts[1], 0, 0);
    return date;
  }

  /**
   * Calculter le total de disponibilite des joursdisponibilite
   * @param: jourDispo
   * @param: index
   */
  private getTotalDispo(jourDispo: JourDisponibiliteModel, index: number): number {
    if (jourDispo['debut' + index] && jourDispo['fin' + index]) {
      if ((!new Date(jourDispo['debut' + index]).getDate()) || (!new Date(jourDispo['fin' + index]).getDate())) {
        jourDispo['debut' + index] = this.getDispoHour(jourDispo['debut' + index], ':');
        jourDispo['fin' + index] = this.getDispoHour(jourDispo['fin' + index], ':');
        if (jourDispo['heureDebut' + index + 'IsNight']) {
          jourDispo['debut' + index].setDate(jourDispo['debut' + index].getDate() + 1);
        }
        if (jourDispo['heureFin' + index + 'IsNight']) {
          jourDispo['fin' + index].setDate(jourDispo['fin' + index].getDate() + 1);
        }
      }
      const fin = moment(jourDispo['fin' + index]);
      const debut = moment(jourDispo['debut' + index]);
      return fin.diff(debut, 'minutes') / 60;
    } else {
      return 0;
    }
  }

  /**
   * Check of date interval is greater or equal of the condition value
   * @param: hours
   * @param: minShiftInHour
   */
  public isMinShifRespected(hours: [Date, Date], minShiftInHour): boolean {
    const fin = moment(hours[1]);
    const debut = moment(hours[0]);
    return fin.diff(debut, 'hours') >= minShiftInHour;
  }

  /**
   * Update locally the contract to be updated in availabilities
   * @param: contrat
   * @param: joursDisponibilites
   * @param: alternate
   */
  public updateDisponibilite(contrat: ContratModel, joursDisponibilites: JourDisponibiliteModel[], alternate: boolean): ContratModel {
    contrat = {...contrat, disponibilite: {...contrat.disponibilite, jourDisponibilites: [...joursDisponibilites]}};
    contrat.disponibilite.alternate = alternate;
    return contrat;
  }

  /**
   * Update alternate property in new or modified contract
   * @param: contrat
   * @param: alternate
   */
  public updateAlternateProperty(contrat: ContratModel, alternate: boolean, disponibiliteConfig): ContratModel {
    contrat = {
      ...contrat,
      disponibilite: {
        ...contrat.disponibilite,
        alternate: alternate
      }
    };
    if (!alternate) {
      const pairDisponibilite = contrat.disponibilite.jourDisponibilites
        .filter((jourDisponibilite: JourDisponibiliteModel) => !jourDisponibilite.odd);
      contrat = {
        ...contrat,
        disponibilite: {
          ...contrat.disponibilite,
          jourDisponibilites: pairDisponibilite
        }
      };
    } else if (alternate && (contrat.disponibilite.jourDisponibilites.length === 7)) {
      const oddDisponibilite = [];
      disponibiliteConfig.weekDays.forEach((dayConfig: { day: string, val: string }) => {
        const jourDisponibilite = new JourDisponibiliteModel();
        jourDisponibilite.odd = true;
        jourDisponibilite.jourSemain = dayConfig.val;
        oddDisponibilite.push(jourDisponibilite);
      });
      contrat = {
        ...contrat,
        disponibilite: {
          ...contrat.disponibilite,
          jourDisponibilites: [...oddDisponibilite, ...contrat.disponibilite.jourDisponibilites]
        }
      };
    }
    return contrat;
  }

  /**
   * Check level, echelon and coefficient validity for contrat
   * @param contrat the contract to check it's three variables cited above
   */
  public validEchelonLevelCoefficient(contrat: ContratModel): boolean {
    let valid = true;
    const regExp = /[^A-Za-z0-9]/g;
    [contrat.level, contrat.echelon, contrat.coefficient].forEach(code => {
      const notAccepted = regExp.test(code);
      valid = valid && (!((code && (code.length > 10)) || notAccepted));
    });
    return valid;
  }

}
