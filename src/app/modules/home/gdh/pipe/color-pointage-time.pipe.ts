import {Pipe, PipeTransform} from '@angular/core';
import {GuiShiftGdh} from '../../../../shared/model/gui/vue-jour.model';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';

@Pipe({
  name: 'colorPointageTime'
})
export class ColorPointageTimePipe implements PipeTransform {
  transform(pointageAbsence: { shift: GuiShiftGdh, first: boolean, last: boolean, data: any }, index: number , rhisTranslateService: RhisTranslateService ): string {
    let html = '';
    const i = index + 1;
   const absence =  rhisTranslateService.translate('GDH.ABSENCE');
    if (!pointageAbsence.shift) {
      // Display an absence
      html =
        '<div class="rectangle">' +
        '  <div class="oval oval-absence">' + i + '</div>' +
        '  <div class="pointage-part">' +
        '  <div class="pointage-part time-red">' + absence + ':  <small>' + pointageAbsence.data.typeEvenement.codeGdh + '</small></div>' +
        '</div>';
    } else {
      // Display a ``poinatage``
      const timeDebutPlan = new Date(pointageAbsence.shift.dateJournee + ' ' + pointageAbsence.shift.heureDebut);
      const timeDebutPointage = new Date(pointageAbsence.data.dateJournee + ' ' + pointageAbsence.data.heureDebut);
      const timeFinPlan = new Date(pointageAbsence.shift.dateJournee + ' ' + pointageAbsence.shift.heureFin);
      const timeFinPointage = new Date(pointageAbsence.data.dateJournee + ' ' + pointageAbsence.data.heureFin);

      let cssClassDebut = 'time-green';
      let cssClassFin = 'time-green';
      if (pointageAbsence.shift.id) {
        if (pointageAbsence.first) {
          // This ``pointage`` is the first one chronologically among others associated for the same shift
          // We check the respect of entry time only for it
          if (timeDebutPointage > timeDebutPlan) {
            cssClassDebut = 'time-red';
          }
          if (timeDebutPointage < timeDebutPlan) {
            cssClassDebut = 'time-orange';
          }
        }

        if (pointageAbsence.last) {
          // This ``pointage`` is the last one chronologically among others associated for the same shift
          // We check the respect of exit time only for it
          if (timeFinPointage > timeFinPlan) {
            cssClassFin = 'time-orange';
          }
          if (timeFinPointage < timeFinPlan) {
            cssClassFin = 'time-red';
          }
        }
      }
      let isModifiedSymbole = '';
      if (pointageAbsence.data.modified === 3 || pointageAbsence.data.modified === 1) {
        isModifiedSymbole = '*';
      } else if (pointageAbsence.data.modified === 2) {
        isModifiedSymbole = 'p';
      }
      const heureDebut: string = (pointageAbsence.data.acheval && !pointageAbsence.data.modifiable ) ? pointageAbsence.data.heureDebutCheval.slice(0, 5) : pointageAbsence.data.heureDebut.slice(0, 5);
      const heureFin: string = (pointageAbsence.data.acheval && pointageAbsence.data.modifiable ) ? pointageAbsence.data.heureFinCheval.slice(0, 5) : pointageAbsence.data.heureFin.slice(0, 5);
      html =
        '<div class="rectangle">' +
        '  <div class="oval oval-pointage">' + i + '</div>' +
        '  <div class="pointage-part">' +
        '  <span class="' + cssClassDebut + '"> ' + heureDebut + ' - </span> <span class="' + cssClassFin + '">' + heureFin + ' ' + isModifiedSymbole + '</span></div>' +
        '</div>';
    }
    return html;
  }
}
