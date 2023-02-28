import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractValueAccessor, MakeProvider} from '../../../../class/abstract-value.accessor';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../validator/trim-validators';

@Component({
  selector: 'rhis-add-form-societe',
  templateUrl: './add-form-societe.component.html',
  styleUrls: ['./add-form-societe.component.scss'],
  providers: [...MakeProvider(AddFormSocieteComponent)]
})
export class AddFormSocieteComponent extends AbstractValueAccessor implements OnInit, OnChanges {
  @Input()
  public isFormSubmitted;
  @Input()
  public listPays;
  @Input()
  public currentLanguage: string;

  public heightInterface: any;

  constructor() {
    super();
  }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Create company form
   */
  private initForm() {
    this.formGroup = new FormGroup({
      societeName: new FormControl(null,
        [
          Validators.required,
          Validators.maxLength(255),
          TrimValidators.trimValidator
        ]
      ),
      formeJuridique: new FormControl(null, Validators.maxLength(10)),
      pays: new FormControl(null, Validators.required),
      numSiren: new FormControl(null,
        [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]
      ),
      villeRCS: new FormControl(null, Validators.maxLength(255)),
      capital: new FormControl(null, Validators.min(0)),
      adresse1: new FormControl(null, Validators.maxLength(255)),
      ville: new FormControl(null, Validators.maxLength(255)),
      codePostal: new FormControl(null, Validators.min(0)),
      telephone1: new FormControl(null, [Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$'), Validators.maxLength(20)]),

    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isFormSubmitted) {
      this.isFormSubmitted = changes.isFormSubmitted.currentValue;
    }
  }

}
