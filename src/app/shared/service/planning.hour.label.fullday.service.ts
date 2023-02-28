import {Injectable} from '@angular/core';
import {ShiftModel} from '../model/shift.model';

/**
 */
@Injectable({
  providedIn: 'root'
})
export class PlanningHourLabelFulldayService {

  public getTimeLabelValue(shift: ShiftModel, modeAffichage?: number): string {
    if (shift.acheval) {
      return shift.heureDebutCheval.toTimeString().slice(0, 5) + ' - ' + shift.heureFinCheval.toTimeString().slice(0, 5);
    } else {
      return shift.heureDebut.toTimeString().slice(0, 5) + ' - ' + shift.heureFin.toTimeString().slice(0, 5);
    }
  }

  public getShiftLabelValue(shift: ShiftModel, modeAffichage?: number): string {
    if (shift.acheval) {
      if (shift.modifiable) {
        return shift.positionTravail.libelle.toUpperCase() + ' ->';
      } else {
        return '<- ' + shift.positionTravail.libelle.toUpperCase();
      }
    } else {
      return shift.positionTravail.libelle.toUpperCase();
    }
  }
}
