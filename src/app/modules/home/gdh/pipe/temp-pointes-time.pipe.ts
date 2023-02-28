import {Pipe, PipeTransform} from '@angular/core';
import {CentiemeTimePipe} from './centieme-time.pipe';

@Pipe({
  name: 'tempPointesTime'
})
export class TempPointesTimePipe implements PipeTransform {
  private centiemeTimePipe: CentiemeTimePipe = new CentiemeTimePipe();

  transform(tempsPointes: number, tempsPlanifies: number, tempsAbsences: number, isHourlyView: boolean): string {
    const hours: number = Math.floor(tempsPointes / 60);
    const htmlTime = isHourlyView ? hours.toString().padStart(2, '0') + ':' +
      (tempsPointes - hours * 60).toString().padStart(2, '0') : this.centiemeTimePipe.transform(tempsPointes);

    let cssClass = '';

    if ((tempsPointes === 0) && (tempsAbsences !== 0)) {
      return '<span class="time-red"><b>Abs.</b></span>';
    } else {
      if ((tempsPointes === 0) && (tempsAbsences === 0)) {
        return '<span> - </span>';
      } else if (tempsPointes > tempsPlanifies) {
        cssClass = 'time-orange';
      } else if (tempsPointes < tempsPlanifies) {
        cssClass = 'time-red';
      } else if (tempsPointes === tempsPlanifies) {
        cssClass = 'time-green';
      }
      return '<span class="' + cssClass + '">' + htmlTime + '</span>';
    }
  }

}
