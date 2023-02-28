import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {ModeVenteModel} from '../../../../../../shared/model/modeVente.model';
import {RhisTranslateService} from "../../../../../../shared/service/rhis-translate.service";

@Component({
  selector: 'rhis-add-mode-vente',
  templateUrl: './add-mode-vente.component.html',
  styleUrls: ['./add-mode-vente.component.scss']
})
export class AddModeVenteComponent implements OnInit {
  @Input()
  nomExist: boolean;
  @Input()
  libelleExist: boolean;
  @Output()
  public sendModeVente = new EventEmitter<ModeVenteModel>();
  @Output()
  public setUniquenessGuard = new EventEmitter();
  @Input()
  buttonLabel: string;
  submitted: boolean;
  public hasSystemCaisse: boolean;
  public hasMaitreDSystemCaisse: boolean;
  public hasZeltySystemCaisse: boolean;

  public lignesMontantError = false;
  public additionnalSpecialKeys = [';'];

  public placeholderText = this.rhisTranslateService.translate('MODE_VENTE.PLACE_HOLDER_EXAMPLE');
  public lignesTransactionError = false;
  private regexValue = '^(?!(?:1|0)$)\\d+';

  /**
   * Get selected mode vente to be updated
   * @param: modeVente
   */
  @Input()
  public set modeVente(modeVente: ModeVenteModel) {
    if (modeVente) {
      this.modeVenteFormGroup.patchValue(modeVente);
      this.selectedModeVente = modeVente;
    }
  }

  @Input()
  public set systemCaisse(hasSystemCaisse: boolean) {
    this.hasSystemCaisse = hasSystemCaisse;
  }

  @Input()
  public set maitreD(hasMaitreDSystemCaisse: boolean) {
    this.hasMaitreDSystemCaisse = hasMaitreDSystemCaisse;
  }

  @Input()
  public set zelty(hasZeltySystemCaisse: boolean) {
    this.hasZeltySystemCaisse = hasZeltySystemCaisse;
  }

  public selectedModeVente: ModeVenteModel;
  public modeVenteFormGroup: FormGroup;

  constructor(private rhisTranslateService: RhisTranslateService) {
    this.createFormGroup();
  }

  /**
   * Initialization phase
   */
  ngOnInit() {
    this.handleNameUniquenessErrorMessage();
    this.handleLibelleUniquenessErrorMessage();
  }

  /**
   * Create mode vente Form group with validators
   */
  private createFormGroup() {
    this.modeVenteFormGroup = new FormGroup({
      nom: new FormControl('',
        [
          Validators.required,
          TrimValidators.trimValidator
        ]),
      mainOeuvre: new FormControl(false),
      libelle: new FormControl('', [
        Validators.required,
        TrimValidators.trimValidator,
        Validators.maxLength(5)
      ]),
      lignesMontant: new FormControl(''),
      lignesTransaction: new FormControl(''),
      centreRevenu: new FormControl(''),
      filtre: new FormControl(''),
      codeSource: new FormControl('')
    });
  }

  /**
   * Enable / disable the existing error message of the attribute 'nom'
   */
  private handleNameUniquenessErrorMessage() {
    this.modeVenteFormGroup.get('nom').valueChanges.subscribe(value => {
      if (this.nomExist && this.submitted) {
        this.updateUiqueGuards('nomExist', false);
      }
    });
  }

  /**
   * Enable / disable the existing error message of the attribute 'libelle'
   */
  private handleLibelleUniquenessErrorMessage() {
    this.modeVenteFormGroup.get('libelle').valueChanges.subscribe(value => {
      if (this.libelleExist && this.submitted) {
        this.updateUiqueGuards('libelleExist', false);
      }
    });
  }

  /**
   * Is 'nom' attribute has 'required' or 'trim' validator error
   */
  public get nomHasError() {
    return this.modeVenteFormGroup.get('nom').hasError('required') ||
      this.modeVenteFormGroup.get('nom').hasError('trimValidator');
  }

  /**
   * Is 'libelle' attribute has 'required' or 'trim' validator error
   */
  public get libelleHasError() {
    return this.modeVenteFormGroup.get('libelle').hasError('required') ||
      this.modeVenteFormGroup.get('libelle').hasError('trimValidator');
  }

  updateUiqueGuards(guard: string, value: boolean) {
    this.setUniquenessGuard.emit({name: guard, value: value});
  }

  private applyTrim(modeVente: ModeVenteModel): Partial<ModeVenteModel> {
    return {
      nom: modeVente.nom.trim(),
      libelle: modeVente.libelle.trim(),
      mainOeuvre: modeVente.mainOeuvre,
      lignesMontant: modeVente.lignesMontant,
      lignesTransaction: modeVente.lignesTransaction,
      centreRevenu: modeVente.centreRevenu,
      filtre: modeVente.filtre,
      codeSource: modeVente.codeSource
    };
  }

  /**
   * Submit mode vente to be added/updated
   */
  public submit() {
    this.submitted = true;
    if (this.modeVenteFormGroup.valid && !this.nomExist && !this.libelleExist && this.checkValidValues()) {
      const modeVente = this.applyTrim(this.modeVenteFormGroup.value);
      this.sendModeVente.emit(modeVente as ModeVenteModel);
    }
  }

  private checkValidValues(): boolean {
    // hide error messages
    this.lignesMontantError = false;
    this.lignesTransactionError = false;
    if (!this.hasSystemCaisse) {
      return true;
    } else {
      const twoDigitDecimalNumberRegex = new RegExp(this.regexValue);
      const modeVente = this.modeVenteFormGroup.value;
      let passValidValues = true;
      const montantValues: string[] = modeVente.lignesMontant.toString().split(';');
      montantValues.forEach((item: string) => {
        if (!twoDigitDecimalNumberRegex.test(item) && item.trim().length) {
          // nok
          this.lignesMontantError = true;
          passValidValues = passValidValues && false;
        }
      });

      this.lignesMontantError = !passValidValues;

      const transactionValues: string[] = modeVente.lignesTransaction.toString().split(';');
      transactionValues.forEach((item: string) => {
        if (!twoDigitDecimalNumberRegex.test(item) && item.trim().length) {
          // nok
          this.lignesTransactionError = true;
          passValidValues = passValidValues && false;
        }
      });
      return passValidValues;
    }
  }
}
