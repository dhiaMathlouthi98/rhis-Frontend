import {Injectable} from '@angular/core';
import {ENJourSemaine, JourSemaine, Mois} from '../enumeration/jour.semaine';
import {DatePipe} from '@angular/common';
import {RhisTranslateService} from './rhis-translate.service';
import * as moment from 'moment';
import {DateInterval} from '../model/gui/date-interval';
import {ShiftModel} from '../model/shift.model';
import * as rfdc from 'rfdc';
import Diff = moment.unitOfTime.Diff;
import DurationConstructor = moment.unitOfTime.DurationConstructor;
import StartOf = moment.unitOfTime.StartOf;

@Injectable({
  providedIn: 'root'
})
export class DateService {
  public clone = rfdc();
  public frenshDayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  constructor(private rhisTranslateService: RhisTranslateService) {
  }

  // calcule la difference heure de fin et heure de debut
  getDiffHeure(heureFin: Date, heureDebut: Date): number {
    this.resetSecondsAndMilliseconds(heureFin);
    this.resetSecondsAndMilliseconds(heureDebut);
    let heureDebutDisplay = this.clone(heureDebut);
    if (moment(heureDebutDisplay).isAfter(heureFin)) {
      heureDebutDisplay = moment(heureDebutDisplay).subtract(1, 'days').toDate();
    }
    return moment(heureFin).diff(heureDebutDisplay, 'minutes');
  }

  public getDiffOn(endDate: Date, startDate: Date, unitOfTime: DurationConstructor = 'minutes'): number {
    return moment(endDate).diff(startDate, unitOfTime);
  }

  public resetSecondsAndMilliseconds(date: Date): void {
    if (date instanceof Date) {
      date.setSeconds(0);
      date.setMilliseconds(0);
    }
  }

  public getFormattedDateWithLocale(date: Date, format: moment.LongDateFormatKey, locale: string): string {
    const dateMoment = moment(date).locale(locale);
    return dateMoment.format(dateMoment.localeData().longDateFormat(format));
  }

  public getFormattedDate(date: Date, format: string, locale: string): string {
    const dateMoment = moment(date).locale(locale);
    return dateMoment.format(dateMoment.localeData().postformat(format));
  }

  // conversion number to time
  convertNumberToTime(minutesCumule) {
    let diffAsString = '';
    const hours = Math.floor(minutesCumule / 60);
    diffAsString = diffAsString.concat(hours.toString());
    diffAsString = diffAsString.concat('.');
    const minutes = minutesCumule - (hours * 60);
    if (minutes < 10) {
      diffAsString = diffAsString.concat('0');
      diffAsString = diffAsString.concat(minutes.toString());
    } else {
      diffAsString = diffAsString.concat(minutes.toString());
    }
    return diffAsString;
  }

  // conversion number to time
  public convertNumberToTimeWithPattern(minutesCumule: number, pattern: string): string {
    let diffAsString = '';
    const hours = Math.floor(minutesCumule / 60);
    diffAsString = diffAsString.concat(hours.toString());
    diffAsString = diffAsString.concat(pattern);
    const minutes = minutesCumule - (hours * 60);
    if (minutes < 10) {
      diffAsString = diffAsString.concat('0');
      diffAsString = diffAsString.concat(minutes.toString());
    } else {
      diffAsString = diffAsString.concat(minutes.toString());
    }
    return diffAsString;
  }

  // conversion time to number
  timeStringToNumber(time) {
    const hoursMinutes = time.split(/[.:]/);
    const hours = parseInt(hoursMinutes[0], 10);
    const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return (hours * 60) + minutes;
  }

  // conversion la date time en date selement
  public setTimeNull(date): Date {
    if (date) {
      date = new Date(date);
    } else {
      date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    return date;

  }

  public getFistWeekDayDate(restaurantFirstWeekDay: JourSemaine, currentDateJournee: string | Date): Date {
    const comparedDay = this.getJourSemaineFromInteger(new Date(currentDateJournee).getDay());
    const weekDays = Object.values(JourSemaine);
    const comparedDayIndex = weekDays.findIndex((day: JourSemaine) => day === comparedDay);
    const firstRestaurantWeekDayIndex = weekDays.findIndex((day: JourSemaine) => day === restaurantFirstWeekDay);
    let difference = comparedDayIndex - firstRestaurantWeekDayIndex;
    difference = difference >= 0 ? difference : (difference + 7);
    return moment(currentDateJournee).subtract(difference, 'days').toDate();
  }

  setMllisecondeNull(date): Date {
    if (date) {
      date = new Date(date);
    } else {
      date = new Date();
    }
    date.setMilliseconds(0);
    return date;

  }

  public getDateFromIsNight(date: Date, isNight: boolean): Date {
    return moment(date).add(isNight ? 1 : 0, 'days').toDate();
  }

  public getIntersectionOfTowDatesInterval(firstBlockOfDates: [Date, Date], secondBlockOfDates: [Date, Date]): [Date, Date] {
    if ((firstBlockOfDates[0] >= secondBlockOfDates[1]) || (secondBlockOfDates[0] >= firstBlockOfDates[1])) {
      return [null, null];
    } else {
      const start: Date = firstBlockOfDates[0] > secondBlockOfDates[0] ? firstBlockOfDates[0] : secondBlockOfDates [0];
      const end: Date = firstBlockOfDates[1] < secondBlockOfDates[1] ? firstBlockOfDates[1] : secondBlockOfDates [1];
      return [start, end];
    }
  }

  public isTheSameDates(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSame(secondDate, 'minutes');
  }

  public isSameOrAfter(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSameOrAfter(secondDate, 'minutes');
  }

  public isAfter(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isAfter(secondDate, 'minutes');
  }

  public isAfterOn(firstDate: Date, secondDate: Date, granularity: StartOf): boolean {
    return moment(firstDate).isAfter(secondDate, granularity);
  }

  public isBeforeOn(firstDate: Date, secondDate: Date, granularity: StartOf): boolean {
    return moment(firstDate).isAfter(secondDate, granularity);
  }

  public isSameOrBefore(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSameOrBefore(secondDate, 'minutes');
  }

  public isBefore(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isBefore(secondDate, 'minutes');
  }

  public getDateFromSubstractDateWithNumberOf(date: Date, nb: number, unit: moment.DurationInputArg2): Date {
    return moment(date).subtract(nb, unit).toDate();
  }

  public getDateFromAddNumberOfToDate(nb: number, unit: moment.DurationInputArg2, date: Date): Date {
    return moment(date).add(nb, unit).toDate();
  }

  /**
   * Permet de saisir la date correctement, permet d eviter le probleme de decalage horaire
   * @param : data
   */
  setCorrectDate(data: Date): Date {
    if (data) {
        data.setHours(12);
    }

    return data;
  }

  public setTimeFormatHHMM(param, isheureNight?: boolean): Date {
    if (param && !(param instanceof Date)) {
      const dateParser = new Date();
      if (isheureNight) {
        dateParser.setDate(dateParser.getDate() + 1);
      }
      dateParser.setMinutes(+(param.substr(3, 2)));
      dateParser.setHours(+(param.substr(0, 2)));
      dateParser.setSeconds(0, 0);
      param = dateParser;
    }
    return param;
  }

  public formatDateTo(date, format: string): string {
    const momentDate = moment(date);
    return momentDate.format(format);
  }

  /**
   * Permet d enregistrer l heure correctement
   * @param: data
   */
  setCorrectTime(data: any): any {
    if (data instanceof Date) {
      data = moment.parseZone(data).format('YYYY-MM-DDTHH:mm:ss.SSS');
    }
    return data;
  }


  /**
   * Permet de creer un string HH:MM
   */
  setStringFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  public isTimeValue(value: string): boolean {
    const timePattern = new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$');
    return timePattern.test(value.toString());
  }

  public isDateValue(value: string): boolean {
    const datePattern = new RegExp('^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$');
    return datePattern.test(value.toString());
  }

  /**
   * Cette methode permet de retourner le jourSemaine d'une date passer en param
   * @param: jour
   */
  getJourSemaine(jour: Date): JourSemaine {
    jour = new Date(jour);
    return this.getJourSemaineFromInteger(jour.getDay());
  }

  /**
   * Cette methode permet de retourner le jourSemaine d'un integer en param
   * @param: jour
   */
  getJourSemaineFromInteger(jour: number): JourSemaine {
    let jourSemaine: JourSemaine;
    switch (jour) {
      case 0: {
        jourSemaine = JourSemaine.DIMANCHE;
        break;
      }
      case 1: {
        jourSemaine = JourSemaine.LUNDI;
        break;
      }
      case 2: {
        jourSemaine = JourSemaine.MARDI;
        break;
      }
      case 3: {
        jourSemaine = JourSemaine.MERCREDI;
        break;
      }
      case 4: {
        jourSemaine = JourSemaine.JEUDI;
        break;
      }
      case 5: {
        jourSemaine = JourSemaine.VENDREDI;
        break;
      }
      case 6: {
        jourSemaine = JourSemaine.SAMEDI;
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return jourSemaine;
  }

  public getJourSemaineFromIntegerToTranslate(jour: number): string {
    let jourSemaine = '';
    switch (jour) {
      case 0: {
        jourSemaine = 'SUNDAY';
        break;
      }
      case 1: {
        jourSemaine = 'MONDAY';
        break;
      }
      case 2: {
        jourSemaine = 'TUESDAY';
        break;
      }
      case 3: {
        jourSemaine = 'WEDNESDAY';
        break;
      }
      case 4: {
        jourSemaine = 'THURSDAY';
        break;
      }
      case 5: {
        jourSemaine = 'FRIDAY';
        break;
      }
      case 6: {
        jourSemaine = 'SATURDAY';
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return jourSemaine;
  }

  /**
   * transforme date to dd/mm/yyyy
   * @param: value
   */
  public formatDate(value: string) {
    const datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  /**
   * transformer date pour passer en url
   * @param: dateChosit
   */
  public formatDateToScoreDelimiter(dateChosit: Date) {
    dateChosit = this.setCorrectDate(dateChosit);
    const dateFinMonth = dateChosit.getMonth() + 1;
    let stringDateChoisit: string;
    let stringDateChoisitDay: string;
    let stringDateChoisitMonth: string;
    if (dateChosit.getDate() < 10) {
      stringDateChoisitDay = '0' + dateChosit.getDate();
    } else {
      stringDateChoisitDay = dateChosit.getDate().toString();
    }
    if (dateChosit.getMonth() + 1 < 10) {
      stringDateChoisitMonth = '0' + dateFinMonth;
    } else {
      stringDateChoisitMonth = dateFinMonth.toString();
    }
    stringDateChoisit = stringDateChoisitDay + '-' + stringDateChoisitMonth + '-' + dateChosit.getFullYear();
    return stringDateChoisit;
  }

  /**
   * Cette methode permet de retourner la jourSemaine en integer
   * @param: jour
   */
  getIntegerValueFromJourSemaine(jour: JourSemaine): number {
    let jourSemaineAsInteger: number;
    switch (jour) {
      case JourSemaine.DIMANCHE: {
        jourSemaineAsInteger = 0;
        break;
      }
      case JourSemaine.LUNDI: {
        jourSemaineAsInteger = 1;
        break;
      }
      case JourSemaine.MARDI: {
        jourSemaineAsInteger = 2;
        break;
      }
      case JourSemaine.MERCREDI: {
        jourSemaineAsInteger = 3;
        break;
      }
      case JourSemaine.JEUDI: {
        jourSemaineAsInteger = 4;
        break;
      }
      case JourSemaine.VENDREDI: {
        jourSemaineAsInteger = 5;
        break;
      }
      case JourSemaine.SAMEDI: {
        jourSemaineAsInteger = 6;
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return jourSemaineAsInteger;
  }

  /**
   * Pour formatter la date recuperer depuis la base sous la forme DD:HH:MM
   * @param: param
   */
  setTimeFormatDDHHMM(param, dateParser: Date) {
    if (param && dateParser) {
      dateParser.setMinutes(+(param.substr(3, 2)));
      dateParser.setHours(+(param.substr(0, 2)));
      dateParser.setSeconds(0);
      dateParser.setMilliseconds(0);
      param = dateParser;
    }
    return param;
  }

  createDateFromStringAndOffset(str, offset: number) {
    let date = new Date();
    if (str) {
      date.setMinutes(+(str.substr(3, 2)));
      date.setHours(+(str.substr(0, 2)));
      date.setSeconds(0);
      date.setMilliseconds(0);
      date.setDate(date.getDate() + offset);
      return date;
    }
  }

  /**
   * recuperer la date du jour de semain
   * @param: jour
   */
  public getDateOfEnumertionJour(jour): Date {
    const curr = new Date;
    let jourSemaine: Date;

    for (let i = 0; i <= 6; i++) {
      const first = curr.getDate() - curr.getDay() + i;
      const day = new Date(curr.setDate(first));
      switch (i) {
        case 0: {
          if (jour === JourSemaine.DIMANCHE) {
            jourSemaine = day;
          }
          break;
        }
        case 1: {
          if (jour === JourSemaine.LUNDI) {
            jourSemaine = day;
          }
          break;
        }
        case 2: {
          if (jour === JourSemaine.MARDI) {
            jourSemaine = day;
          }
          break;
        }
        case 3: {
          if (jour === JourSemaine.MERCREDI) {
            jourSemaine = day;
          }
          break;
        }
        case 4: {
          if (jour === JourSemaine.JEUDI) {
            jourSemaine = day;
          }
          break;
        }
        case 5: {
          if (jour === JourSemaine.VENDREDI) {
            jourSemaine = day;
          }
          break;
        }
        case 6: {
          if (jour === JourSemaine.SAMEDI) {
            jourSemaine = day;
          }
          break;
        }
        default: {
          // statements;
          break;
        }
      }
    }

    return jourSemaine;
  }

  public formatDateInAmAndPm(dt) {
    dt = new Date(dt);
    // const nameDay = this.weekday[dt.getDay()];
    // return nameDay + ', ' + dt.getDate() + ' ' + this.monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
    const normalizeHour = dt.getHours() >= 13 ? dt.getHours() - 12 : dt.getHours();
    return dt.getHours() >= 13 ? 'PM' : 'AM';
  }

  /**
   * Cette methode permet de retourner le 'Code' du mois utilisé pour la traduction dans les fichiers fr.json et en.json
   * @param: monthNumber
   */
  public getMonthAsStringFromNumber(monthNumber: number): string {
    switch (monthNumber) {
      case 0: {
        return 'JAN';
      }
      case 1: {
        return 'FEV';
      }
      case 2: {
        return 'MARS';
      }
      case 3: {
        return 'AVRIL';
      }
      case 4: {
        return 'MAI';
      }
      case 5: {
        return 'JUIN';
      }
      case 6: {
        return 'JUL';
      }
      case 7: {
        return 'AOUT';
      }
      case 8: {
        return 'SEP';
      }
      case 9: {
        return 'OCT';
      }
      case 10: {
        return 'NOV';
      }
      case 11: {
        return 'DEC';
      }
      default: {
        // statements;
        return '';
      }
    }
  }

  public formatToShortDate(date: Date | string, seperator: string = '-'): string {
    const dateToFormat = new Date(date);
    return ('0' + dateToFormat.getDate()).slice(-2) + seperator + ('0' + (dateToFormat.getMonth() + 1)).slice(-2) + seperator + dateToFormat.getFullYear();
  }

  public getRestaurantWeekDays(firstWeekDayRank): { day: string, val: JourSemaine }[] {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push({
        day: this.rhisTranslateService.translate('DAYS.' + this.getJourSemaineFromInteger((+firstWeekDayRank + i) % 7)),
        val: this.getJourSemaineFromInteger((+firstWeekDayRank + i) % 7)
      });
    }
    return days;
  }

  getCalendarConfig(firsDayOfWeek) {
    return {
      firstDayOfWeek: firsDayOfWeek,
      dayNames: this.getCalendarConfigNames('DAYS', ENJourSemaine),
      dayNamesShort: this.getCalendarConfigNames('SHORT_WEEK_DAYS', ENJourSemaine),
      dayNamesMin: this.getCalendarConfigNames('MIN_WEEK_DAYS', ENJourSemaine),
      monthNames: this.getCalendarConfigNames('MOIS', Mois),
      monthNamesShort: this.getCalendarConfigNames('SHOR_MOIS', Mois)
    };
  }

  public getDaysKeysByCode(code: 'DAYS' | 'SHORT_WEEK_DAYS' | 'MIN_WEEK_DAYS'): string[] {
    return this.getCalendarConfigNames(code, ENJourSemaine);
  }

  private getCalendarConfigNames(key, list): string[] {
    const values = [];
    for (const item in list) {
      if (isNaN(Number(item)) && list.hasOwnProperty(item)) {
        values.push(this.rhisTranslateService.translate(`${key}.${item}`));
      }
    }
    return values;
  }

  // convertire la seconde et miil seconde  time en date seulement
  public setSecondAndMilliSecondsToNull(date) {
    date = new Date(date);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  /**
   * Cette methode permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  public setCorrectTimeToDisplay(item) {
    item.heureDebut = this.setTimeFormatHHMM(item.heureDebut);
    if (item.heureDebutIsNight) {
      item.heureDebut.setDate(item.heureDebut.getDate() + 1);
    }
    item.heureFin = this.setTimeFormatHHMM(item.heureFin);
    if (item.heureFinIsNight) {
      item.heureFin.setDate(item.heureFin.getDate() + 1);
    }
    if (item.dateJournee) {
      item.dateJournee = new Date(item.dateJournee);
      item.dateJournee = this.setCorrectDate(item.dateJournee);
    }

  }

  public setCorrectFormat(item: any) {
    if (item.heureDebut) {
      item.heureDebut = this.setStringFromDate(item.heureDebut);
    }

    if (item.heureFin) {
      item.heureFin = this.setStringFromDate(item.heureFin);
    }

    if (item.heureDebutCheval) {
      item.heureDebutCheval = this.setStringFromDate(item.heureDebutCheval);
    }

    if (item.heureFinCheval) {
      item.heureFinCheval = this.setStringFromDate(item.heureFinCheval);
    }
  }

  public getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(firstInterval: DateInterval, secondInterval: DateInterval): [Date, Date] {
    return this.getIntersectionOfTowDatesInterval(
      [
        this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
        this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      ],
      [
        this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight),
        this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight),
      ]
    );
  }

  public isIncluded(firstInterval: DateInterval, secondInterval: DateInterval): boolean {
    const isSameOrAfter = this.isSameOrAfter(
      this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
      this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight)
    );
    const isSameOrBefore = this.isSameOrBefore(
      this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight)
    );
    return isSameOrAfter && isSameOrBefore;
  }

  public getTotalMinutes(dateInterval: DateInterval): number {
    return this.getDiffOn(
      this.getDateFromIsNight(new Date(`${dateInterval.dateJournee} ${dateInterval.heureFin}`), dateInterval.heureFinIsNight),
      this.getDateFromIsNight(new Date(`${dateInterval.dateJournee} ${dateInterval.heureDebut}`), dateInterval.heureDebutIsNight)
    );
  }

  public getDiffInMinutesForStartHours(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffOn(
      this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
      this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight)
    );
  }

  public getDiffInMinuteForEndHours(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffOn(
      this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight)
    );
  }

  public getDiffInMinuteInBetween(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffOn(
      this.getDateFromIsNight(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight),
      this.getDateFromIsNight(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight)
    );
  }

  public isSameOrBeforeByDayTimeAndIsNight(firstDateInterval: DateInterval, secondDateInterval: DateInterval): boolean {
    return this.isSameOrBefore(
      this.getDateFromIsNight(new Date(`${firstDateInterval.dateJournee} ${firstDateInterval.heureDebut}`), firstDateInterval.heureDebutIsNight),
      this.getDateFromIsNight(new Date(`${secondDateInterval.dateJournee} ${secondDateInterval.heureDebut}`), secondDateInterval.heureDebutIsNight)
    );
  }

  public getDateFromDateIntervalFor(interval: DateInterval, hour: string): Date {
    return this.getDateFromIsNight(new Date(`${interval.dateJournee} ${interval[hour]}`), interval[`${hour}IsNight`]);
  }

  /**
   * Permet de transformer heure en format 00h00
   */
  public formatHours(valueToFormat: any): string {
    if (valueToFormat % 1) {
      const minutesValue = Math.trunc(valueToFormat % 1 * 60);
      const valueToFormatAsString = valueToFormat.toString();
      return (valueToFormatAsString.substring(0, valueToFormatAsString.indexOf('.')) + 'h' + minutesValue);
    } else {
      return valueToFormat.toString() + 'h';
    }

  }

// format total minutes to hours hh:mm
  public formatMinutesToHours(minutes: any): string {
    let hours: number = Math.floor(minutes / 60);
    hours = Number((hours).toFixed(0));
    return hours.toString().padStart(2, '0') + ':' +
      (minutes - hours * 60).toString().padStart(2, '0');
  }

  /**
   * calculer la différence en nombre de jours entre deux dates
   * @param :dateDebut
   * @param :dateFin
   */
  public getDiffDatesOnDays(dateDebut: Date, dateFin: Date): number {
// our custom function with two parameters, each for a selected date
    const diffc = dateFin.getTime() - dateDebut.getTime();
    // getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
    const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    return days;
  }

  public createDateFromStringPattern(date: string, patter: string): Date {
    return moment(date, patter).toDate();
  }

  public isValidDateFromStringPattern(date: string, patter: string): boolean {
    return moment(date, patter).isValid();
  }

  public createDateFromHourString(hourAsString: string): Date {
    const date = new Date();
    const hours = +hourAsString.substring(0, 2);
    const minutes = +hourAsString.substring(3, 5);
    date.setHours(hours, minutes);
    return date;
  }

  public sortDates(d1: Date, d2: Date): -1 | 1 | 0 {
    if (moment(d1).isSame(d2, 'minute')) {
      return 0;
    }
    return moment(d1).isBefore(d2, 'minute') ? 1 : -1;
  }

  public isSameDateOn(d1: Date | string, d2: Date | string, unit: Diff): boolean {
    return moment(d1).isSame(d2, unit);
  }

  public calculerPartieCommune(dateDebut1: Date, dateFin1: Date, dateDebut2: Date, dateFin2: Date): number {
    let minDate: Date;
    if (dateFin1 < dateFin2) {
      minDate = dateFin1;
    } else {
      minDate = dateFin2;
    }

    let maxDate: Date;
    if (dateDebut2 > dateDebut1) {
      maxDate = dateDebut2;
    } else {
      maxDate = dateDebut1;
    }
    if (minDate > maxDate) {
      return Math.floor((Math.abs((maxDate.getTime() - minDate.getTime())) / 1000) / 60);
    } else {
      return 0;
    }
  }


  /**
   * Cette methode permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non pour la shift
   * @param: item
   */
  public setCorrectTimeToDisplayForShift(item: any, optDate?: any) {
    if (item.dateJournee instanceof Date) {
      item.dateJournee.setHours(0, 0, 0, 0);
    }
    if (item.dateJournee) {
      const rawDate = new Date(item.dateJournee);
      const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
      if (userTimezoneOffset > 0) {
        item.dateJournee = new Date(rawDate.getTime() + userTimezoneOffset);
      } else {
        item.dateJournee = rawDate;
      }
      item.dateJournee = new Date(item.dateJournee);
    } else {
      item.dateJournee = new Date();
    }
    if (optDate) {
      const dateJournee = JSON.parse(JSON.stringify(optDate));
      item.dateJournee = new Date(dateJournee);
    }
    if (item.heureDebutIsNight !== undefined && item.heureFinIsNight !== undefined) {

      item.heureDebut = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureDebut), item.heureDebutIsNight);
      this.resetSecondsAndMilliseconds(item.heureDebut);
      if (item.acheval && !item.modifiable && item.heureFinIsNight) {
        item.heureFin = this.getDateFromIsNight(this.getTimeWithouSecond(new Date(item.dateJournee.getTime() + (24 * 60 * 60 * 1000)), item.heureFin), item.heureFinIsNight);
        if (!item.heureDebutIsNight) {
          item.heureDebut = this.getDateFromIsNight(this.getTimeWithouSecond(new Date(item.heureFin.getTime() - (24 * 60 * 60 * 1000)), item.heureDebut), item.heureDebutIsNight);
        } else {
          item.heureDebut = this.getDateFromIsNight(this.getTimeWithouSecond(new Date(item.heureFin.getTime()), item.heureDebut), item.heureDebutIsNight);
        }
      } else {
        item.heureFin = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureFin), item.heureFinIsNight);
      }

      this.resetSecondsAndMilliseconds(item.heureFin);

      if (item.heureDebutCheval) {
        if (item.acheval && !item.modifiable) {
          if (moment(item.dateJournee).format('DD-MM-YYYY') === moment(item.heureDebutCheval).format('DD-MM-YYYY')) {
            item.heureDebutChevalIsNight = false;
          }
        }
        item.heureDebutCheval = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureDebutCheval), item.heureDebutChevalIsNight);
        this.resetSecondsAndMilliseconds(item.heureDebutCheval);
      }

      if (item.heureFinCheval) {
        if (item.acheval && !item.modifiable) {
          if (moment(item.dateJournee).format('DD-MM-YYYY') === moment(item.heureFinCheval).format('DD-MM-YYYY')) {
            item.heureFinChevalIsNight = false;
          }
        }
        item.heureFinCheval = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureFinCheval), item.heureFinChevalIsNight);
        this.resetSecondsAndMilliseconds(item.heureFinCheval);
      }
      // traitement spéciphique pour le shift fixe
    } else if (item.dateDebutIsNight !== undefined && item.dateFinIsNight !== undefined) {
      item.heureDebut = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureDebut), item.dateDebutIsNight);
      this.resetSecondsAndMilliseconds(item.heureDebut);

      item.heureFin = this.getDateFromIsNight(this.getTimeWithouSecond(item.dateJournee, item.heureFin), item.dateFinIsNight);
      this.resetSecondsAndMilliseconds(item.heureFin);
    }
    item.dateJournee = this.setTimeNull(item.dateJournee);
  }

  /**
   * recuperer l'heure en formatm hh:mm
   * @param: time, date
   */
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

  /**
   * transforme les heures en date
   * @param valeur
   */
  public getNombreHeureTravaille(valeur: number): any {
    const returnedDate: Date = new Date();
    returnedDate.setHours(valeur / 60);
    const hours = Math.floor(valeur);
    let minute = valeur - hours;
    minute = Math.round((minute + Number.EPSILON) * 100) / 100;
    returnedDate.setHours(hours);
    returnedDate.setMinutes(minute * 100);
    returnedDate.setSeconds(0, 0);
    return returnedDate;
  }

  /**
   * Set Correct date format of added or updated shift to list
   * @param shift shift
   */
  public formatNewOrUpdatedShiftDate(shift: ShiftModel): void {
    if (!(shift.heureDebut instanceof Date)) {
      this.setCorrectTimeToDisplayForShift(shift);
    }
    if (!(shift.heureFin instanceof Date)) {
      this.setCorrectTimeToDisplayForShift(shift);
    }
    shift.heureDebut = this.setStringFromDate(shift.heureDebut);
    shift.heureFin = this.setStringFromDate(shift.heureFin);
    this.setCorrectTimeToDisplayForShift(shift);
    this.resetSecondsAndMilliseconds(shift.heureDebut);
  }

  /**
   * Check if tow date intervals intersect or not
   * @param: firstInterval
   * @param: secondInterval
   */
  public isIntersect(date: Date, dateInterval: [Date, Date]): boolean {
    return (date >= dateInterval[0] && date <= dateInterval[1]);

  }

  /**
   * permet de routner la liste des dates entre date debut et date fin
   * @param startDate
   * @param stopDate
   */
  public getDatesBetweenTwoDates(startDate: Date, stopDate: Date): Date[] {
    const dateArray = new Array();
    let currentDate: Date = new Date(startDate);
    while (currentDate <= stopDate) {
      dateArray.push(new Date(currentDate));
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return dateArray;
  }

  public dateToShortForm(dateJournee: Date): string {
    return dateJournee.getFullYear() + '-' + (dateJournee.getMonth() + 1).toString().padStart(2, '0') + '-' + dateJournee.getDate().toString().padStart(2, '0');
  }

  public delay(milliSeconds: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, milliSeconds);
    });
  }

  public convertDayNames(dayIndex: number): string {
    return this.frenshDayNames[dayIndex];
  }

  public mapEnglishDayNames(dayName: string): string {
    switch (dayName) {
      case 'SUNDAY':
        return 'DIMANCHE';
      case 'MONDAY':
        return 'LUNDI';
      case 'TUESDAY':
        return 'MARDI';
      case 'WEDNESDAY':
        return 'MERCREDI';
      case 'THURSDAY':
        return 'JEUDI';
      case 'FRIDAY':
        return 'VENDREDI';
      case 'SATURDAY':
        return 'SAMEDI';
      default: {
        break;
      }
    }
  }

  public correctTimeZoneDifference(date: any): Date {
    const rawDate = new Date(date);
    const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
    date = new Date(rawDate.getTime() - userTimezoneOffset);
    return date;
  }

  /**
   * etude de chevauchement entre les heures
   * @param shiftDislpay
   * @param shift
   */
  public  isIntervalConfondues( shiftDislpay: ShiftModel, shift: ShiftModel): boolean {

  return !((moment(shiftDislpay.heureDebut).isBefore(shift.heureDebut) && moment(shiftDislpay.heureFin).isSameOrBefore(shift.heureDebut)) ||
(moment(shiftDislpay.heureDebut).isSameOrAfter(shift.heureFin)  &&  moment(shiftDislpay.heureFin).isAfter(shift.heureFin)));
}
}
