import {Injectable} from '@angular/core';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class PrevisionsHelperService {

  constructor(private rhisTranslateService: RhisTranslateService,
              private dateService: DateService) {
  }

  /**
   * Cette metohde permet de retourner comme string la valeur de la date exp '07/10/2019' retourne 'Lundi 07 Octobre 2019'
   * @param: dateJournee
   */
  public setFullDateAsString(dateJournee: Date): string {
    const dayOfWeek = this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaine(dateJournee));
    const dayOfMonth = dateJournee.getDate();
    const month = this.rhisTranslateService.translate('MOIS.' + this.dateService.getMonthAsStringFromNumber(dateJournee.getMonth()));
    const year = dateJournee.getFullYear();

    return dayOfWeek + ' ' + dayOfMonth + ' ' + month + ' ' + year;
  }
}
