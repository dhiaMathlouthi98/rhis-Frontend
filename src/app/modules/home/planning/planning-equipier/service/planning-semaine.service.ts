import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlanningSemaineService {

  /**
   * transformer l'heure de début d'un shift à une position sur la grille
   * @param startTime heure de début d'un shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   * @param startDayHour
   */
  public convertStartTimeToPosition(startTime: string, isStartTimeAtNight: boolean, startDayHour: number): number {
    let position: number;
    const startTimeHours = +startTime.slice(0, 2);
    const startTimeMinutes = +startTime.slice(3, 5);
    if (!isStartTimeAtNight) {
      position = (startTimeHours - startDayHour) * 4;
    } else if (isStartTimeAtNight) {
      position = ((24 - startDayHour) * 4) + (startTimeHours * 4);
    }
    if (startTimeMinutes >= 15 && startTimeMinutes < 30) {
      position = position + 1;
    } else if (startTimeMinutes >= 30 && startTimeMinutes < 45) {
      position = position + 2;
    } else if (startTimeMinutes >= 45 && startTimeMinutes <= 59) {
      position = position + 3;
    } 
    return position;
  }

  /**
   * convertir la durée d'un shift en nombre de colonnes de la grille
   * @param startTime heure de début du shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   * @param endTime heure de fin du shift
   * @param isEndTimeAtNight l'heure de fin du shift fait elle partie de la journée actuelle ou la journée suivante
   */
  public convertDurationToColsNumber(startTime: string, isStartTimeAtNight: boolean, endTime: string, isEndTimeAtNight: boolean) {
    let colsNumber: number;
    const startTimeHours = +startTime.slice(0, 2);
    const startTimeMinutes = +startTime.slice(3, 5);
    const endTimeHours = +endTime.slice(0, 2);
    const endTimeMinutes = +endTime.slice(3, 5);
    if ((!isStartTimeAtNight && !isEndTimeAtNight) || (isStartTimeAtNight && isEndTimeAtNight)) {
      colsNumber = (endTimeHours - startTimeHours) * 4;
    } else {
      colsNumber = ((24 - startTimeHours) * 4) + (endTimeHours * 4);
    }
    switch (endTimeMinutes) {
      case 15:
        colsNumber = colsNumber + 1;
        break;
      case 30:
        colsNumber = colsNumber + 2;
        break;
      case 45:
        colsNumber = colsNumber + 3;
        break;
    }
    switch (startTimeMinutes) {
      case 15:
        colsNumber = colsNumber - 1;
        break;
      case 30:
        colsNumber = colsNumber - 2;
        break;
      case 45:
        colsNumber = colsNumber - 3;
        break;
    }
    return colsNumber;
  }

  /**
   * Convertir des minutes en temps sous forme hh:mm
   * @param minutes minutes
   */
  public convertMinutesToTime(minutes: number): string {
    let hour = (Math.floor(minutes / 60)).toString();
    let min = (minutes % 60).toString();
    if (+hour < 10) {
      hour = '0' + hour;
    }
    if (+min < 10) {
      min = min + '0';
    }
    return hour + ':' + min;
  }

  /**
   * Convertir le temps sous forme hh:mm en minutes
   * @param time temps
   */
  public convertTimeToMinutes(time: string): number {
    const timeArray = time.split(':');
    const hour = +timeArray[0];
    const minutes = +timeArray[1];
    const totalMinutes = (hour * 60) + minutes;
    return totalMinutes;
  }

}
