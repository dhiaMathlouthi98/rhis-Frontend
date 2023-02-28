import {Injectable} from '@angular/core';
import {DateService} from './date.service';
import {DecoupageHoraireModel} from '../model/decoupage.horaire.model';
import {ParametreModel} from '../model/parametre.model';
import {ParametreGlobalService} from '../../modules/home/configuration/service/param.global.service';
import {forkJoin, Observable, Subject} from 'rxjs';
import {DecoupageHoraireService} from '../../modules/home/planning/configuration/service/decoupage.horaire.service';

/**
 * Ce service permet de retourner à la fois les horaires limites d'ajout / modifier un shift dans les 3 cas (Mode 0 / 1 / 2)
 * Independamment du paramètre MODE_24H renseigné dans les paramètres il faut vérifier aussi le decoupage horaire entre les deux journées.
 * Si le journées sont a cheval on retourne la valeur du param si non on retourne 0 quelque soit la valeur renseigne dans les paramètres.
 * Les limites du découpage seront utilisées dans l'ajout / modification du shifts; on accepte les shifts dans l'interval:
 * [debutJ - finJ] dans le cas ou le param = 0
 * [debutJ - fin(J+1)] dans le cas ou le param = (1 || 2)
 * Dans le deuxieme cas il faut peut etre retourner l heure 00:00 du J+1 car même dans le mecanisme d'ajout on ne va pas dépasser cette valeur
 */
@Injectable({
  providedIn: 'root'
})
export class LimitDecoupageFulldayService {
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public decoupageHoraireFinEtDebutActivity: any;

  private isChevauched = new Subject<boolean>();
  currentChevauched = this.isChevauched.asObservable();


  public setChevevauchement(is24: boolean): void {
    this.isChevauched.next(is24);
  }



  constructor(private parametreService: ParametreGlobalService,
              private decoupageHoraireService: DecoupageHoraireService,
              private dateService: DateService) {
  }

  public setLimitDecoupageValues(decoupageHoraireFinEtDebutActivity: any, modeAffichage: number, selectedDate: Date, dateService: DateService): { debutJourneeLimit: Date, finJourneeLimit: Date, heureDebutLimit: Date, updatedModeAffichage: number } {
    const debutJournee: DecoupageHoraireModel = decoupageHoraireFinEtDebutActivity.debutJournee;
    const finJournee: DecoupageHoraireModel = decoupageHoraireFinEtDebutActivity.finJournee;

    const debutJourneeJ = debutJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(selectedDate))];
    const debutJourneeJIsNight = debutJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(selectedDate)) + 'IsNight'];
    const debutJourneeJAsDate = dateService.getDateFromIsNight(this.getTimeWithouSecond(selectedDate, debutJourneeJ), debutJourneeJIsNight);

    const finJourneeJ = finJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(selectedDate))];
    const finJourneeJIsNight = finJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(selectedDate)) + 'IsNight'];
    const finJourneeJAsDate = dateService.getDateFromIsNight(this.getTimeWithouSecond(selectedDate, finJourneeJ), finJourneeJIsNight);
    dateService.resetSecondsAndMilliseconds(finJourneeJAsDate);
    if (modeAffichage === 0) {
      return {
        debutJourneeLimit: debutJourneeJAsDate,
        finJourneeLimit: finJourneeJAsDate,
        heureDebutLimit: finJourneeJAsDate,
        updatedModeAffichage: 0
      };
    }
    const nextDate = new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000));
    const debutNextJourneeJ = debutJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(nextDate))];
    const debutNextJourneeJIsNight = debutJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(nextDate)) + 'IsNight'];
    const debutNextJourneeJAsDate = dateService.getDateFromIsNight(this.getTimeWithouSecond(nextDate, debutNextJourneeJ), debutNextJourneeJIsNight);
    dateService.resetSecondsAndMilliseconds(debutNextJourneeJAsDate);

    if (finJourneeJAsDate.getTime() === debutNextJourneeJAsDate.getTime()) {
      const finNextJourneeJ = finJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(nextDate))];
      const finNextJourneeJIsNight = finJournee['valeur' + this.convertStringToCamelCase(dateService.getJourSemaine(nextDate)) + 'IsNight'];
      const finNextJourneeJAsDate = dateService.getDateFromIsNight(this.getTimeWithouSecond(nextDate, finNextJourneeJ), finNextJourneeJIsNight);

      return {
        debutJourneeLimit: debutJourneeJAsDate,
        finJourneeLimit: finNextJourneeJAsDate,
        heureDebutLimit: finJourneeJAsDate,
        updatedModeAffichage: modeAffichage
      };
    } else {
      return {
        debutJourneeLimit: debutJourneeJAsDate,
        finJourneeLimit: finJourneeJAsDate,
        heureDebutLimit: finJourneeJAsDate,
        updatedModeAffichage: 0
      };
    }
  }

  public getTimeWithouSecond(date: Date, time): Date {
    if (time && !(time instanceof Date)) {
      const hours = +(time.substring(0, 2));
      const minutes = +(time.substring(3, 5));
      time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
    }
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  public convertStringToCamelCase(day: string): string {
    let convertedItem = day.charAt(0);
    convertedItem = convertedItem.concat(day.substring(1, day.length).toLowerCase());
    return convertedItem;
  }


  /**
   *get param PERFORM_MODE pour afficher productivité ou taux de MOE
   */
  public async getDisplayMode24H(): Promise<number> {
    const codeNamesAsArray = [this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    const paramList: ParametreModel[] = await this.parametreService.getParamRestaurantByCodeNames(codeNames).toPromise();
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      return +paramList[index].valeur;
    }
    return 0;
  }


  public async verifyIsDecoupage24(today: Date): Promise<boolean> {
    const datesLimit = await this.getEndCurrentDayAndStartNextDay(today);
    return datesLimit.endCurrentDay === datesLimit.startNextDay;
  }

  private requestDataFromMultipleSources(): Observable<{ debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }> {
    const response1 = this.decoupageHoraireService.getDebutJourneePhase();
    const response2 = this.decoupageHoraireService.getFinJourneePhase();
    return forkJoin({
      debutJournee: response1,
      finJournee: response2
    });
  }

  public async getEndCurrentDayAndStartNextDay(today: Date): Promise<{ endCurrentDay: string, endCurrentDayAsDate: Date, startNextDay: string, startNextDayAsDate: Date }> {
    if (!this.decoupageHoraireFinEtDebutActivity) {
      this.decoupageHoraireFinEtDebutActivity = await this.requestDataFromMultipleSources().toPromise();
    }
    const debutJournee: DecoupageHoraireModel = this.decoupageHoraireFinEtDebutActivity.debutJournee;
    const finJournee: DecoupageHoraireModel = this.decoupageHoraireFinEtDebutActivity.finJournee;

    const finJourneeJ: string = finJournee['valeur' + this.convertStringToCamelCase(this.dateService.getJourSemaine(today))];
    const finJourneeJIsNight = finJournee['valeur' + this.convertStringToCamelCase(this.dateService.getJourSemaine(today)) + 'IsNight'];
    const finJourneeJAsDate = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(new Date(today), finJourneeJ), finJourneeJIsNight);

    const nextDate = new Date(new Date(today).getTime() + (24 * 60 * 60 * 1000));

    const debutNextJourneeJ: string = debutJournee['valeur' + this.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate))];
    const debutNextJourneeJIsNight = debutJournee['valeur' + this.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate)) + 'IsNight'];
    const debutNextJourneeJAsDate = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(nextDate, debutNextJourneeJ), debutNextJourneeJIsNight);

    return {
      endCurrentDay: finJourneeJ,
      endCurrentDayAsDate: finJourneeJAsDate,
      startNextDay: debutNextJourneeJ,
      startNextDayAsDate: debutNextJourneeJAsDate
    };
  }

}
