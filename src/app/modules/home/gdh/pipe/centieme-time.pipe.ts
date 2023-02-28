import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'centiemeTime'
})
export class CentiemeTimePipe implements PipeTransform {

  transform(minutes: number): string {
    if (minutes === null) {
      return '';
    } else {
      let hours: number;
      let negative = false;
      if (minutes < 0) {
        negative = true;
        minutes = (minutes * -1);
      }
      hours = Math.floor(minutes / 60);
      hours = Number((hours).toFixed(0));
      return (negative ? '-' : '') + (hours.toString().padStart(2, '0') + ',' +
        (Math.round(((minutes - hours * 60) * 100) / 60)).toString().padStart(2, '0'));
    }
  }

}
