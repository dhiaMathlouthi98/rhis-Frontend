import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractValueAccessor, MakeProvider} from '../../../../class/abstract-value.accessor';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'rhis-add-form-prefecture',
  templateUrl: './add-form-prefecture.component.html',
  styleUrls: ['./add-form-prefecture.component.scss'],
  providers: [...MakeProvider(AddFormPrefectureComponent)]
})
export class AddFormPrefectureComponent extends AbstractValueAccessor implements OnInit, OnChanges {

  @Input()
  public isFormSubmitted: boolean;

  public heightInterface: any;

  constructor() {
    super();
  }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Create forms for prefecture
   */
  initForm() {
    this.formGroup = new FormGroup({
      nomPrefecture: new FormControl(null, Validators.maxLength(255)),
      adressePrefecture1: new FormControl(null, Validators.maxLength(255)),
      villePrefecture: new FormControl(null, Validators.maxLength(255)),
      codePostalPrefecture: new FormControl(null, Validators.min(0)),
      telephonePrefecture1: new FormControl(null, [Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$'), Validators.maxLength(20)])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isFormSubmitted) {
      this.isFormSubmitted = changes.isFormSubmitted.currentValue;
    }
  }

}
