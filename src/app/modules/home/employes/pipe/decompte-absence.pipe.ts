import {Pipe, PipeTransform} from '@angular/core';
import {DecompteAbsenceParms} from '../../../../shared/model/gui/decompte-absence-parms';
import {JourFeriesModel} from '../../../../shared/model/jourFeries.model';
import * as moment from 'moment';

@Pipe({
  name: 'decompteConge'
})
export class DecompteAbsencePipe implements PipeTransform {

  /**
   * Cette methode permet de calculer la différence entre date de début et date de fin en jours
   */
  public transform(dateDebut: Date, dateFin: Date, code: string, absenceParam: DecompteAbsenceParms, listJourFeries: JourFeriesModel[]): number {
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    if (startDate > endDate) {
      return null;
    } else {
      const nbrDays = moment(endDate).diff(startDate, 'days') + 1;
      if (absenceParam && code && ['CP', 'RT', 'CS'].includes(code.toUpperCase()) && absenceParam.calculCP === 1) {

        const multi = Math.floor(nbrDays / 7);
        let rest = nbrDays % 7;
        if (listJourFeries && listJourFeries.length) {
          const nbrJourFeries = listJourFeries.filter((jourFeries: JourFeriesModel) => moment(jourFeries.dateFeries).isSameOrAfter(startDate, 'days') && moment(jourFeries.dateFeries).isSameOrBefore(endDate, 'days')).length;
          rest -= nbrJourFeries;
        }
        const nbrAbsencesInWeek = absenceParam.isOuvrable ? 6 : 5;
        return (nbrAbsencesInWeek * multi) + rest;
      }
      return nbrDays;
    }
  }
}
