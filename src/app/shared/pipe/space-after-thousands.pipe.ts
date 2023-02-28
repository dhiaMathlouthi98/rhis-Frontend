import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'spaceAfterThousands'
})
export class SpaceAfterThousandsPipe implements PipeTransform {

  transform(val: number): string {
    if (val !== undefined && val !== null) {
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } else {
      return '';
    }
  }
}
