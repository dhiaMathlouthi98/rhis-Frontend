import {forwardRef} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

export function MakeProvider(type: any) {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => type),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => type),
      multi: true
    }
  ];
}

export abstract class AbstractValueAccessor implements ControlValueAccessor, Validator {
  public formGroup: FormGroup;
  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    if (val === null) {
      this.formGroup.reset();
    } else {
      this.formGroup.patchValue(val);
    }
  }

  registerOnChange(fn: any): void {
    this.formGroup.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formGroup.disable() : this.formGroup.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.formGroup.valid ? null : {invalidForm: {valid: false, message: 'formGroup fields are invalid'}};
  }

}
