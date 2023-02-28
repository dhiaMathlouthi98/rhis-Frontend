import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {GroupeTravailModel} from '../../../../../../shared/model/groupeTravail.model';

@Component({
  selector: 'rhis-add-group-travail',
  templateUrl: './add-group-travail.component.html',
  styleUrls: ['./add-group-travail.component.scss']
})
export class AddGroupTravailComponent implements OnInit, OnChanges {

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdateGroupTravailEvent = new EventEmitter();

  @Output()
  public resetErrorMessagesEventLabel = new EventEmitter();
  @Output()
  public resetErrorMessagesEventCode = new EventEmitter();
  @Input()
  public libelleExiste: string;
  @Input()
  public codeExiste: string;
  @Input()
  public selectedGroupTravail: GroupeTravailModel;
  @Input()
  public showAddOrUpdateGroupeTravailButtons: string;
  @Input()
  disabledCheckBoxDirecteur;
  public isSubmitted = false;
  public groupeTravailform = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      codeEmploi: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      codeGdh: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      tauxhoraire: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      dureePeriodEssai: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      plgEquip: new FormControl(''),
      plgMgr: new FormControl(''),
      plgLeader: new FormControl(''),
      plgFixe: new FormControl(''),
      mainOeuvre: new FormControl(''),
      directeur: new FormControl(''),
      pointeuse: new FormControl(''),
      level: new FormControl('', this.customMaxLengthValidator(10)),
      echelon: new FormControl('', this.customMaxLengthValidator(10)),
      coefficient: new FormControl('', this.customMaxLengthValidator(10))
    }
  );

  ngOnInit(): void {

    this.libelle.valueChanges.subscribe(
      value => this.resetErrorMessagesLabel()
    );
    this.codeEmploi.valueChanges.subscribe(
      value => this.resetErrorMessagesCodeEmploi()
    );
  }

  private customMaxLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regExp = /[^A-Za-z0-9]/g;
      const notAccepted = regExp.test(control.value);
      return control.value && ((control.value.length > length) || notAccepted ? {max: true} : null);
    };
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    const taux = 0.00;
    this.groupeTravailform.controls['tauxhoraire'].setValue(taux);
    this.groupeTravailform.controls['dureePeriodEssai'].setValue(2);

    if (changes.libelleExiste) {
      this.libelleExiste = changes.libelleExiste.currentValue;
    }
    if (changes.codeExiste) {
      this.codeExiste = changes.codeExiste.currentValue;
    }
    if (changes.showAddOrUpdateGroupeTravailButtons) {
      this.showAddOrUpdateGroupeTravailButtons = changes.showAddOrUpdateGroupeTravailButtons.currentValue;
    }
    if (changes.selectedGroupTravail) {
      this.selectedGroupTravail = changes.selectedGroupTravail.currentValue;
      if (this.selectedGroupTravail) {
        this.displayGroupeTravail(this.selectedGroupTravail);
      }
    }
    if (changes.disabledCheckBoxDirecteur) {
      this.disabledCheckBoxDirecteur = changes.disabledCheckBoxDirecteur.currentValue;

    }
    this.disableOrEnbaleCheckBoxDirecteur();
  }

  /**
   *  recuperer les valeurs de groupe de travail pour ajoute ou modifier
   */
  addOrUpdateGroupTravail() {
    this.isSubmitted = true;
    if (this.groupeTravailform.valid) {
      this.addOrUpdateGroupTravailEvent.emit(this.groupeTravailform.value);
    }
  }

  /**
   * recuperer la libelle de groupe de travail
   */
  get libelle() {
    return this.groupeTravailform.get('libelle');
  }

  /**
   * recuperer le codeEmploi de groupe de travail
   */
  get codeEmploi() {
    return this.groupeTravailform.get('codeEmploi');
  }

  /**
   * recuperer le tauxhoraire de groupe de travail
   */
  get tauxhoraire() {
    return this.groupeTravailform.get('tauxhoraire');
  }

  /**
   * recuperer le codeGdh de groupe de travail
   */
  get codeGdh() {
    return this.groupeTravailform.get('codeGdh');
  }

  get dureePeriodEssai() {
    return this.groupeTravailform.get('dureePeriodEssai');
  }

  get echelon() {
    return this.groupeTravailform.get('echelon');
  }

  /**
   * reset erreur messege de champs libelle
   */
  resetErrorMessagesLabel() {
    if (this.libelleExiste) {
      this.resetErrorMessagesEventLabel.emit();
    }
  }

  /**
   * reset erreur messege de champs code
   */
  resetErrorMessagesCodeEmploi() {
    if (this.codeExiste) {
      this.resetErrorMessagesEventCode.emit();
    }
  }

  /**
   * set group travail
   * @param : groupeTravail
   */
  public displayGroupeTravail(groupeTravail) {
    if (groupeTravail) {
      this.groupeTravailform.patchValue(groupeTravail);
    } else {
      if (this.groupeTravailform) {
        this.groupeTravailform.reset();
      }
    }
  }

  /**
   * disable plgLeader and plgMgr
   */
  public onChangePlgEquip() {
    if (this.groupeTravailform.get('plgEquip')) {
      this.groupeTravailform.controls['plgLeader'].setValue(false);
      this.groupeTravailform.controls['plgMgr'].setValue(false);

    }
  }

  /**
   * disable plgEquip and plgMgr
   */
  public onChangePlgLeader() {
    if (this.groupeTravailform.get('plgLeader')) {
      this.groupeTravailform.controls['plgEquip'].setValue(false);
      this.groupeTravailform.controls['plgMgr'].setValue(false);

    }
  }

  /**
   *  disable plgEquip and plgLeader
   */
  public onChangePlgMgr() {
    if (this.groupeTravailform.get('plgMgr')) {
      this.groupeTravailform.controls['plgLeader'].setValue(false);
      this.groupeTravailform.controls['plgEquip'].setValue(false);

    }
  }

  /**
   * disable or enable check box directeur
   */
  private disableOrEnbaleCheckBoxDirecteur() {
    if (this.selectedGroupTravail) {
      if (this.selectedGroupTravail.directeur) {
        this.groupeTravailform.get('directeur').enable();
      } else {
        this.groupeTravailform.get('directeur').disable();
      } if (!this.selectedGroupTravail.directeur && !this.disabledCheckBoxDirecteur) {
        this.groupeTravailform.get('directeur').enable();
      }
    } else {
      if (this.disabledCheckBoxDirecteur) {
        this.groupeTravailform.get('directeur').disable();
      } else if (!this.disabledCheckBoxDirecteur) {
        this.groupeTravailform.get('directeur').enable();
      }
    }
  }
}
