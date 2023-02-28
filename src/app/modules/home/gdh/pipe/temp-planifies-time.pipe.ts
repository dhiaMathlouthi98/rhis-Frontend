import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tempPlanifiesTime'
})
export class TempPlanifiesTimePipe implements PipeTransform {

  transform(planifiesMinutes: number): string {
    if (planifiesMinutes === null) {
      return '';
    } else {
      let planifieHours: number;
      if (planifiesMinutes < 0) {
        planifieHours = 0;
        planifiesMinutes = 0;
      } else {
        planifieHours = Math.floor(planifiesMinutes / 60);
      }
      planifieHours = Number((planifieHours).toFixed(0));
      return planifieHours.toString().padStart(2, '0') + ':' +
        ((planifiesMinutes - planifieHours * 60).toFixed(0)).toString().padStart(2, '0');
    }

  }
}


