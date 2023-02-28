import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'userUpperFirstLetter'
})
export class UserUpperFirstLetterPipe implements PipeTransform {
  transform(data: string): string {
    let lettre1 = '';
    let lettre2 = "";

    lettre1 = data.charAt(0).toUpperCase();
	lettre2 = data.slice(1).toLowerCase();
	
    return lettre1 + lettre2;
  }
}