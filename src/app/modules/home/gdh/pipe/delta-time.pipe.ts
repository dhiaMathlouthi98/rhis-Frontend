import {Pipe, PipeTransform} from '@angular/core';
import {CentiemeTimePipe} from './centieme-time.pipe';

@Pipe({
  name: 'deltaTime'
})
export class DeltaTimePipe implements PipeTransform {
  private centiemePipe: CentiemeTimePipe = new CentiemeTimePipe();

  transform(tempsContrat: number, tempsPointes: number, isCentieme: boolean, delta: number): string {
    if (tempsContrat == null || tempsPointes == null || delta === undefined) {
      return '';
    } else {
      let deltaAffiche = delta;
      let hours: number;
      let returnedValue = '';
      if (deltaAffiche === 0) {
        return '=';
      }
      const deltaCentieme = this.centiemePipe.transform(deltaAffiche);
      deltaAffiche = Math.abs(deltaAffiche);
      hours = Math.floor(deltaAffiche / 60);
      hours = Number((hours).toFixed(0));
      returnedValue = hours.toString().padStart(2, '0') + ':' +
        (deltaAffiche - hours * 60).toString().padStart(2, '0');
      if (isCentieme) {
        return (delta > 0) ? '+' + deltaCentieme : deltaCentieme;
      } else {
        return (delta > 0) ? '+' + returnedValue : '-' + returnedValue;
      }

    }
  }

}
