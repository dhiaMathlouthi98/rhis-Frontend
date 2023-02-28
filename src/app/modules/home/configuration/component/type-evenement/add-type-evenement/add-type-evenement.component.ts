import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {TypeEvenementModel} from '../../../../../../shared/model/type.evenement.model';
import { SessionService } from 'src/app/shared/service/session.service';

@Component({
  selector: 'rhis-add-type-evenement',
  templateUrl: './add-type-evenement.component.html',
  styleUrls: ['./add-type-evenement.component.scss']
})
export class AddTypeEvenementComponent implements OnInit {
  public isSubmitted = false;
  public isNameUnique = true;
  public typeEventsNames: string[];
  public selectedTypeEvenemetLibelle: string;
  @Input()
  public set typeEvents(typeEvents: TypeEvenementModel[]) {
    this.typeEventsNames = typeEvents.map(typeEvent => typeEvent.libelle);
  }

  @Input()
  public set selectedTypeEvenemet(typeEvent: TypeEvenementModel) {
    if (typeEvent) {
      this.selectedTypeEvenemetLibelle = typeEvent.libelle;
      this.formGroup.patchValue({...typeEvent});
      if(this.sessioService.getProfil()!=='superviseur'){
        this.formGroup.controls['code'].disable();
      }
    }
  }
  @Input()
  public buttonLabel: string;

  @Output()
  public saveTypeEvenement = new EventEmitter<TypeEvenementModel>();
  public formGroup = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      code: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      codeGdh: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      codePaye: new FormControl(''),
      payer: new FormControl(false),
      travaille: new FormControl(false),
      previsible: new FormControl(false),
      valorise:new FormControl(false)

    });

  constructor(private sessioService: SessionService) {
  }

  ngOnInit() {
    this.handleNameUniquenessErrorMessage();
  }

  /**
   * Enable / disable the error message of type event uniqueness
   */
  private handleNameUniquenessErrorMessage() {
    this.formGroup.get('libelle').valueChanges.subscribe(libelle => {
      if (!this.nameExist() && !this.isNameUnique && this.isSubmitted) {
        this.isNameUnique = true;
      }
    });
  }

  /**
   * Check if the name of type evenement exist or not
   */
  private nameExist(): boolean {
    const filtredList = this.typeEventsNames
      .filter(eventName =>
        eventName.toLocaleLowerCase().trim() === this.formGroup.get('libelle').value.toString().trim().toLocaleLowerCase());
    if (filtredList.length) {
      if (filtredList[0] === this.selectedTypeEvenemetLibelle) {
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Check if type event name input has required error
   */
  public get libelleHasError() {
    return this.formGroup.get('libelle').hasError('required') ||
      this.formGroup.get('libelle').hasError('trimValidator');
  }

  /**
   * Check if code input has required error
   */
  public get codeHasError() {
    return this.formGroup.get('code').hasError('required') ||
      this.formGroup.get('code').hasError('trimValidator');
  }

  /**
   * Check if code gdh input has required error
   */
  public get codeGDHHasError() {
    return this.formGroup.get('codeGdh').hasError('required') ||
      this.formGroup.get('codeGdh').hasError('trimValidator');
  }

  /**
   * Prepare type evenement to be saved
   * @param :typeEvenement
   */
  private prepareTypeEvenementBeforeSave(typeEvenement: TypeEvenementModel): TypeEvenementModel {
    for (let key of Object.keys(typeEvenement)) {
      const libelle = typeEvenement[key];
      if (libelle && (typeof libelle === 'string')) {
        typeEvenement[key] = libelle.toString().trim();
      }
    }
    return typeEvenement;
  }

  /**
   * Submit the edit/add value to save it
   */
  public onSubmit(): void {
    this.isSubmitted = true;
    const typeEvent: TypeEvenementModel = this.formGroup.value;
    if (!this.nameExist()) {
      if (this.formGroup.valid) {
        this.saveTypeEvenement.emit(this.prepareTypeEvenementBeforeSave(typeEvent));
        this.selectedTypeEvenemetLibelle = null;
        this.isSubmitted = false;
      }
    } else {
      this.isNameUnique = false;
    }
  }
}
