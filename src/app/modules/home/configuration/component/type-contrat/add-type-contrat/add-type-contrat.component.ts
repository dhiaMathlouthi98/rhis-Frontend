import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {TypeContratModel} from '../../../../../../shared/model/type.contrat.model';

@Component({
  selector: 'rhis-add-type-contrat',
  templateUrl: './add-type-contrat.component.html',
  styleUrls: ['./add-type-contrat.component.scss']
})
export class AddTypeContratComponent implements OnInit {

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdateTypeContratEvent = new EventEmitter();

  @Output()
  public resetErrorMessagesEvent = new EventEmitter();

  // type contrat to add or to update
  @Input()
  public set typeContrat(typeContrat: TypeContratModel) {
    if (typeContrat) {
      this.typeContratform.setValue({
        libelle: typeContrat.libelle,
        dureeDetermine: typeContrat.dureeDetermine,
        activeTypeContrat: typeContrat.activeTypeContrat,
        idTypeContrat: typeContrat.idTypeContrat
      });
    } else {
      if (this.typeContratform) {
        this.typeContratform.reset();
      }
    }
  }

  public buttonTitle = '';

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  public set existentTypeContrat(errMessage: string) {
    this.existentTypeContratMesssage = errMessage;
  }

  public existentTypeContratMesssage: string;

  public isSubmitted = false;

  public typeContratform = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      dureeDetermine: new FormControl(''),
      activeTypeContrat: new FormControl(''),
      idTypeContrat: new FormControl('')
    }
  );

  ngOnInit(): void {
    this.libelle.valueChanges.subscribe(
      value => this.resetErrorMessages()
    );
  }

  addOrUpdateTypeContrat() {
    this.isSubmitted = true;
    if (this.typeContratform.valid) {
      this.addOrUpdateTypeContratEvent.emit(this.typeContratform.value);
    }
  }

  get libelle() {
    return this.typeContratform.get('libelle');
  }

  resetErrorMessages() {
    if (this.existentTypeContratMesssage) {
      this.resetErrorMessagesEvent.emit();
    }
  }
}
