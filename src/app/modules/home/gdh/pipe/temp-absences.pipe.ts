import {Pipe, PipeTransform} from '@angular/core';
import {GuiAbsenceGdh} from 'src/app/shared/model/gui/vue-jour.model';
import {CentiemeTimePipe} from './centieme-time.pipe';

@Pipe({
  name: 'tempAbsences'
})
export class TempAbsencesPipe implements PipeTransform {
  private centiemeTimePipe: CentiemeTimePipe = new CentiemeTimePipe();

  transform(tempsAbsences: number, absences: GuiAbsenceGdh[], isHourlyView: boolean): string {
    if (tempsAbsences >= 0 && absences.length) {
      // We get absence type of the first absence happened chronologically
      // absences are sorted chronologically
      const typeEvenement = absences && absences.length && absences[0].typeEvenement ? absences[0].typeEvenement.codeGdh : '';
      const hours: number = Math.floor(tempsAbsences / 60);
      const htmlTime = isHourlyView ? hours.toString().padStart(2, '0') + ':' +
        (tempsAbsences - hours * 60).toString().padStart(2, '0') : this.centiemeTimePipe.transform(tempsAbsences);
      return '<span class="time-red">' + htmlTime + '<br/>[' + typeEvenement + ']</span>';
    } else {
      return '-';
    }
  }

}
