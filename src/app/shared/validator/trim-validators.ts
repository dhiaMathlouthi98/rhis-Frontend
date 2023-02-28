import {AbstractControl} from '@angular/forms';

export class TrimValidators {

  static trimValidator(control: AbstractControl): { [key: string]: boolean } | null {

    if (control.value === undefined || (control === null) || (control.value === null) || (control.value.toString().trim() === '')) {
      return {'trimValidator': true};
    }
    return null;
  }
}
