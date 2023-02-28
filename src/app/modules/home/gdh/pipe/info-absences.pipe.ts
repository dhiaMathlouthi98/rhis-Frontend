import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'infoAbsences'
})
export class InfoAbsencesPipe implements PipeTransform {

  transform(journee: any): string {
    let textAbsence = '';
    for (let i = 0; i < journee.shifts.length; i++) {
      let sh = journee.shifts[i];
      if (sh.pointage === null) {
        textAbsence = sh.dateJournee + ' ' + sh.typeAbsence;
        break;
      }
    }
    return textAbsence;
  }

}
