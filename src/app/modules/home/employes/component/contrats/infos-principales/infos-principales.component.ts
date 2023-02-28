import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {ContratPrimaryModel} from '../../../../../../shared/model/contrat.primary.model';
import * as moment from 'moment';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {ContratService} from '../../../service/contrat.service';
import {GroupeTravailModel} from '../../../../../../shared/model/groupeTravail.model';
import {TypeContratModel} from '../../../../../../shared/model/type.contrat.model';

/**
 * the infos-principales component
 */
@Component({
  selector: 'rhis-infos-principales',
  templateUrl: './infos-principales.component.html',
  styleUrls: ['./infos-principales.component.scss']
})
export class InfosPrincipalesComponent implements OnInit, OnChanges {
  // pour afficher la section info principal
  @Input() contratInfoPrimary;
  // pour recuperer le contrat principal de l'avenant
  @Input() contratPrincipal;
  @Input() listGroupTravail;
  @Input() dateFinPeriodEssai;
  public hiddenDateFinPeriodeEssai;
  @Input() listTypeContrat;
  @Input() hidenGroupTravail;
  @Input() hidenTypeContrat;
  @Input() contratExist;
  @Input() dateConstraints;
  @Input() contratId;
  @Input() contratUuid;
  @Input() avenantId;
  @Input() contratUpdateId;
  @Input() avenantUpdateId;
  @Input() disablGroupTravail;
  @Input() setValueContrat;
  // pour l'avenat n' est pas depassé la date de son contrat
  @Input() minDateEffectifAvenant;
  @Input() maxDateFinAvenant;
  @Input() maxDateEffectiveAvenant;
  @Input() listmotifSorties;
  @Input() duplicateContrat;
  @Input() presenceDirecteur;
  @Output() public getPresentConratHasGroupeTravailDirecteur = new EventEmitter();
  @Output() public setPresenceDirecteurToFalse = new EventEmitter();
  public groupeTravailSelected: string;
  @Output()
  public resetErrorMessagesDateEffectifEvent = new EventEmitter();
  @Output()
  public resetErrorMessagesDateFinEvent = new EventEmitter();
  @Output()
  public saveInfoPrimarysetValue = new EventEmitter();
  @Output()
  public confirmUpdateInfoPrimarysetValue = new EventEmitter();
  @Output()
  public openPopupListMotifSortie = new EventEmitter();
  @Output() activeDesactiveContrat = new EventEmitter();
  @Output() disactiveContratCDIHasMotifSortie = new EventEmitter();

  @Output()
  public sendTxHoraireOfGroupeTravailToTxHoraireOfContrat = new EventEmitter();
  @Input() activateContrat;
  public Employee: EmployeeModel;
  public minDatefinContrat: Date;
  public setValueOfstatut = false;
  public hiddenMotifSortie = true;
  public dateFinPeriodEssaiDisplay;
  public listGroupTravailDisplay: GroupeTravailModel[] = [];
  public listTypeContratDisplay: TypeContratModel[] = [];
  public selectors = {
    calendarSelector: '.ui-inputtext.ui-widget',
    dropDownSelector: '.ui-dropdown',
    checkboxSelector: '.ui-chkbox-box.ui-widget '
  };
  public formGroup = new FormGroup(
    {
      groupeTravail: new FormControl('', [Validators.required]),
      level: new FormControl('', this.customMaxLengthValidator(10)),
      echelon: new FormControl('', this.customMaxLengthValidator(10)),
      coefficient: new FormControl('', this.customMaxLengthValidator(10)),
      typeContrat: new FormControl('', [Validators.required]),
      dateEffective: new FormControl('', [Validators.required]),
      datefin: new FormControl(''),
      actif: new FormControl(''),
      motifSortie: new FormControl({value: '', disabled: true}),
    }
  );

  constructor(private  contratServices: ContratService) {
  }

  /**
   *   it launches first after constructor
   */
  ngOnInit() {
    this.dateEffective.valueChanges.subscribe(
      value => this.resetErrorMessagesDateEffectif()
    );
    this.datefin.valueChanges.subscribe(
      value => {
        this.resetErrorMessagesDateFin();
      }
    );

    ['groupeTravail', 'level', 'echelon', 'coefficient', 'typeContrat', 'dateEffective', 'datefin'].forEach((key: string) => this.formGroup.get(key).valueChanges.subscribe(val => {
      this.updateContractInfosInChange();
    }));
  }

  private updateContractInfosInChange() {
    if (this.setValueContrat) {
      if (!this.contratId) {
        this.saveInfoPrimarysetValue.emit({InfoValue: this.formGroup.getRawValue(), idContrat: this.contratId});
      } else {
        if (this.contratId !== this.contratUpdateId) {
          this.confirmUpdateInfoPrimarysetValue.emit({
            InfoValue: this.formGroup.getRawValue(),
            idContrat: this.contratId,
            repartition: false,
            hebdo: false,
            info: true,
            statut: true
          });
        } else {
          this.saveInfoPrimarysetValue.emit({InfoValue: this.formGroup.getRawValue(), idContrat: this.contratId});
        }
      }
    }
  }

  private customMaxLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regExp = /[^A-Za-z0-9]/g;
      const notAccepted = regExp.test(control.value);
      return (control.value && (control.value.length > length)) || notAccepted ? {max: true} : null;
    };
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {

    if (changes.hidenGroupContrat) {
      this.hidenGroupTravail = changes.hidenGroupTravail.currentValue;
    }
    if (changes.hidenTypeContrat) {
      this.hidenTypeContrat = changes.hidenTypeContrat.currentValue;
    }
    if (changes.listmotifSorties) {
      this.listmotifSorties = changes.listmotifSorties.currentValue;
    }
    if (changes.dateConstraints) {
      this.dateConstraints = changes.dateConstraints.currentValue;
      if (!this.dateConstraints) {
        Object.values(this.formGroup.controls).forEach(control => {
          control.markAsTouched();
        });
      }
    }
    if (changes.listTypeContrat) {
      this.listTypeContrat = changes.listTypeContrat.currentValue;
    }
    if (changes.listGroupTravail) {
      this.listGroupTravail = changes.listGroupTravail.currentValue;
    }
    if (changes.contratInfoPrimary) {
      this.contratInfoPrimary = changes.contratInfoPrimary.currentValue;
      this.formGroup.get('actif').disable();

      if (this.contratInfoPrimary) {
        this.displayContrat(this.contratInfoPrimary);
        if (this.setValueContrat && this.contratInfoPrimary.actif) {
          this.formGroup.get('actif').enable();
        }
      }
    }
    if (changes.contratExist) {
      this.contratExist = changes.contratExist.currentValue;
    }
    if (changes.disablGroupTravail) {
      this.disablGroupTravail = changes.disablGroupTravail.currentValue;
      // date fin est tjr enabl pour un avenant
      if (this.disablGroupTravail) {
        this.formGroup.controls['datefin'].setValidators([Validators.required]);
        this.formGroup.get('datefin').enable();
      }
    }
    if (changes.dateFinPeriodEssai) {
      this.hiddenDateFinPeriodeEssai = true;
      this.dateFinPeriodEssai = changes.dateFinPeriodEssai.currentValue;
      if (this.dateFinPeriodEssai) {
        this.dateFinPeriodEssaiDisplay = this.dateFinPeriodEssai;
        this.hiddenDateFinPeriodeEssai = false;
      }
    }
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }
    if (changes.contratUpdateId) {
      this.contratUpdateId = changes.contratUpdateId.currentValue;
      if (!this.contratUpdateId) {
        this.contratUpdateId = this.contratId;
      }
    }
    if (changes.contratPrincipal) {
      this.contratPrincipal = changes.contratPrincipal.currentValue;
      this.formGroup.get('groupeTravail').enable();
      // desable groupe de travail pour l'avenant qui est non pas encore enregistrer
      if (!this.contratPrincipal && this.disablGroupTravail) {
        this.formGroup.get('groupeTravail').disable();
      }

    }
    if (changes.avenantId) {
      this.avenantId = changes.avenantId.currentValue;
    }
    if (changes.avenantUpdateId) {
      this.avenantUpdateId = changes.avenantUpdateId.currentValue;
      if (!this.avenantUpdateId) {
        this.avenantUpdateId = this.avenantId;
      }
    }

    if (changes.setValueContrat) {
      this.setValueContrat = changes.setValueContrat.currentValue;
    }
    if (changes.duplicateContrat) {
      this.duplicateContrat = changes.duplicateContrat.currentValue;
    }
    if (changes.presenceDirecteur) {
      this.presenceDirecteur = changes.presenceDirecteur.currentValue;
    }
    if (changes.minDateEffectifAvenant && !this.setValueContrat) {
      this.minDateEffectifAvenant = changes.minDateEffectifAvenant.currentValue;
    }
    if (changes.maxDateFinAvenant && !this.setValueContrat) {
      this.maxDateFinAvenant = changes.maxDateFinAvenant.currentValue;
    }
    if (changes.maxDateEffectiveAvenant && !this.setValueContrat) {
      this.maxDateEffectiveAvenant = changes.maxDateEffectiveAvenant.currentValue;
    }
    if ((changes.contratPrincipal || changes.disablGroupTravail || changes.contratInfoPrimary) &&
        (!this.contratPrincipal && !this.disablGroupTravail && this.contratInfoPrimary && !this.contratInfoPrimary.idContrat)) {
      this.formGroup.controls['level'].setValue(this.contratInfoPrimary.groupeTravail.level);
      this.formGroup.controls['echelon'].setValue(this.contratInfoPrimary.groupeTravail.echelon);
      this.formGroup.controls['coefficient'].setValue(this.contratInfoPrimary.groupeTravail.coefficient);
      this.updateContractInfosInChange();
    }
  }

  /**
   * Reset the form when opening the pop-up
   */
  private resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
  }

  /**
   *  set date fin enable or disable selon le type de contrat
   */
  private activateOrDisactivateDateFin() {
    this.formGroup.get('datefin').disable();
    if (this.typeContrat.value.dureeDetermine && this.dateEffective.value) {

      this.formGroup.get('datefin').enable();
    }
  }

  /**
   * Display the infos of a 'contrat'
   * @param :contrat
   */
  private displayContrat(contrat: ContratPrimaryModel): void {
    this.formGroup.get('datefin').disable();
    this.addTypeContratOrGroupeTravailToListDislayed(contrat);
    if (contrat) {
      if (contrat.datefin) {
        contrat.datefin = new Date(contrat.datefin);
      }
      contrat.dateEffective = new Date(contrat.dateEffective);
      if (!this.setValueContrat && !contrat.datefin) {
        contrat.datefin = moment(contrat.dateEffective).add(1, 'days').toDate();
        this.formGroup.controls['datefin'].setValue(contrat.datefin);
      } else {
        this.formGroup.controls['datefin'].setValue(contrat.datefin);
      }
      this.formGroup.controls['dateEffective'].setValue(contrat.dateEffective);
      this.formGroup.controls['typeContrat'].setValue(contrat.typeContrat);
      this.formGroup.controls['groupeTravail'].setValue(contrat.groupeTravail);
      this.formGroup.controls['actif'].setValue(contrat.actif);
      this.formGroup.controls['level'].setValue(contrat.level);
      this.formGroup.controls['echelon'].setValue(contrat.echelon);
      this.formGroup.controls['coefficient'].setValue(contrat.coefficient);
      this.formGroup.get('dateEffective').enable();
      if (this.typeContrat.value) {
        // si  un contrat de type cdd ou cdi (avec un motif sortie)
        if (this.dateEffective.value && (this.typeContrat.value.dureeDetermine || (!this.typeContrat.value.dureeDetermine && contrat.motifSortie))) {

          this.formGroup.get('datefin').enable();
          this.formGroup.controls['datefin'].setValidators([Validators.required]);
        }
      }
      if (this.setValueContrat) {
        this.hiddenMotifSortie = true;
        if (moment(new Date).isAfter(this.setTimeNull(contrat.datefin)) ||
          (moment(this.setTimeNull(new Date())).isSame(this.setTimeNull(contrat.datefin)) && moment(this.setTimeNull(contrat.dateEffective)).isSame(this.setTimeNull(contrat.datefin))) ||
          (!contrat.typeContrat.dureeDetermine && moment(this.setTimeNull(new Date())).isBefore(this.setTimeNull(contrat.datefin)) && moment(this.setTimeNull(contrat.dateEffective)).isBefore(this.setTimeNull(new Date())))) {
          if (contrat.motifSortie) {
            this.hiddenMotifSortie = false;
            this.formGroup.controls['motifSortie'].setValue(contrat.motifSortie.libelle);
          }
        }
      }
      if (this.duplicateContrat) {
        this.formGroup.get('dateEffective').disable();
      }
    } else {
      this.resetForm();
    }
  }

  /**
   *La désactivation d’un groupe de travail (ou toute autre objet) ne rien changé dans l’existant
   *on doit toujours voir l’employé avec son groupe de travail et il peut toujours être planifié  mais on ne peux pas mettre
   *se groupe de travail sur un employé (lors de la création et lors de la modification)
   * @param :contrat
   */
  private addTypeContratOrGroupeTravailToListDislayed(contrat: ContratPrimaryModel): void {
    let idGroupTravail;
    let idTypeContrat;
    if (contrat.typeContrat) {
      idTypeContrat = contrat.typeContrat.idTypeContrat;
      if (!idTypeContrat) {
        idTypeContrat = contrat.typeContrat.uuid;
      }
    }
    if (contrat.groupeTravail) {
      idGroupTravail = contrat.groupeTravail.idGroupeTravail;
      if (!idGroupTravail) {
        idGroupTravail = contrat.groupeTravail.idGroupeTravail.uuid;
      }
    }
    this.listGroupTravailDisplay = JSON.parse(JSON.stringify(this.listGroupTravail));
    this.listTypeContratDisplay = JSON.parse(JSON.stringify(this.listTypeContrat));
    if (this.listGroupTravailDisplay && !this.listGroupTravailDisplay.find((groupe: GroupeTravailModel) => groupe.idGroupeTravail === idGroupTravail)) {
      this.listGroupTravailDisplay.push(contrat.groupeTravail);
    }
    if (this.listTypeContratDisplay && !this.listTypeContratDisplay.find((type: TypeContratModel) => type.idTypeContrat === idTypeContrat)) {
      this.listTypeContratDisplay.push(contrat.typeContrat);
    }
  }

  /**
   * get position travail
   */
  get groupeTravail(): AbstractControl {
    return this.formGroup.get('groupeTravail');
  }

  /**
   * get typer contrat
   */
  get typeContrat(): AbstractControl {
    return this.formGroup.get('typeContrat');
  }

  /**
   * get typer effectif
   */
  get dateEffective(): AbstractControl {
    return this.formGroup.get('dateEffective');
  }

  /**
   * get date fin
   */
  get datefin(): AbstractControl {
    return this.formGroup.get('datefin');
  }

  /**
   * get actif
   */
  get actif(): AbstractControl {
    return this.formGroup.get('actif');
  }

  /**
   * lors de la select type de contrat
   * si cdi date fin est desable
   * si cdd date fin est enable
   * si cdi avec motif sortie -> date fin enable
   */
  public onSelectTypeContrat() {
    // pour vérifier que la date de fin doit etre sup a la date effective
    if (this.dateEffective.value) {
      let minDateFin = JSON.parse(JSON.stringify(this.dateEffective.value));
      minDateFin = new Date(Date.parse(minDateFin));
      minDateFin.setDate(minDateFin.getDate() + 1);
      this.minDatefinContrat = minDateFin;
      if (!this.datefin.value) {
        this.formGroup.controls['datefin'].setValue(new Date(minDateFin));
      }
    }
    this.formGroup.get('datefin').disable();

    const typeContrat = this.typeContrat.value;
    if (typeContrat) {
      if (typeContrat.dureeDetermine || (!typeContrat.dureeDetermine && this.contratInfoPrimary.motifSortie)) {
        this.formGroup.controls['datefin'].setValidators([Validators.required]);
        this.formGroup.get('datefin').enable();
      } else if (!typeContrat.dureeDetermine && !this.contratInfoPrimary.motifSortie) {
        this.formGroup.controls['datefin'].setValue(null);
      }
      this.onSelectGroupeTravail();
    }
  }

  /**
   * reset message contrat existe
   */
  private resetErrorMessagesDateEffectif() {
    if (this.contratExist) {
      this.resetErrorMessagesDateEffectifEvent.emit(this.contratId);
    }
  }

  /**
   * reset message contrat existe
   */
  private resetErrorMessagesDateFin() {
    if (this.contratExist) {
      this.resetErrorMessagesDateFinEvent.emit(this.contratId);
    }
  }

  /**
   * la date fin du contrat soit disable ou enable
   * lors de la select de la  date effective et selon le type de contrat
   */
  public onSelectDateEffective() {
    let minDateFin;
    if (this.datefin.value && this.dateEffective.value) {
      this.datefin.setValue(this.setTimeNull(this.datefin.value));
      this.dateEffective.setValue(this.setTimeNull(this.dateEffective.value));
      if (moment(this.datefin.value).isSameOrBefore(this.dateEffective.value)) {
        minDateFin = JSON.parse(JSON.stringify(this.dateEffective.value));
        minDateFin = new Date(Date.parse(minDateFin));
        minDateFin.setDate(minDateFin.getDate() + 1);
        this.formGroup.controls['datefin'].setValue(new Date(minDateFin));

      }
    }
    if (this.dateEffective.value) {
      minDateFin = JSON.parse(JSON.stringify(this.dateEffective.value));
      minDateFin = new Date(Date.parse(minDateFin));
      minDateFin.setDate(minDateFin.getDate() + 1);
      this.minDatefinContrat = minDateFin;

      if (this.setValueContrat) {
        this.formGroup.get('datefin').disable();
        if ((this.typeContrat.value.dureeDetermine && this.dateEffective.value) || this.minDateEffectifAvenant || (!this.typeContrat.value.dureeDetermine && this.contratInfoPrimary.motifSortie)) {

          this.formGroup.get('datefin').enable();
          if (!this.datefin.value) {
            this.formGroup.controls['datefin'].setValue(new Date(minDateFin));
          }
        }

      }
      this.onSelectGroupeTravail();
      this.valueChangesOfAvenant();
    }
  }

  /**
   * la date fin du contrat soit disable ou enable
   * lors de la select de la  date effective et selon le type de contrat
   */
  public onSelectDateFin() {
    let minDateFin;
    if (this.typeContrat.value.dureeDetermine) {
      this.formGroup.controls['datefin'].setValidators([Validators.required]);
      this.formGroup.get('datefin').enable();
    }
    if ((this.typeContrat.value.dureeDetermine || (!this.typeContrat.value.dureeDetermine && this.dateEffective.value)) &&
      this.dateEffective.value) {
      minDateFin = JSON.parse(JSON.stringify(this.dateEffective.value));
      minDateFin = new Date(Date.parse(minDateFin));
      minDateFin.setDate(minDateFin.getDate() + 1);
      this.minDatefinContrat = minDateFin;
      if (moment(this.datefin.value).isSameOrBefore(this.dateEffective.value)) {
        this.formGroup.controls['datefin'].setValue(new Date(minDateFin));

      }
      this.onSelectGroupeTravail();
    }

    this.valueChangesOfAvenant();
  }

  // converture la date time en date selement
  private setTimeNull(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  /**
   * detecter la changement
   */
  public valueChangesOfAvenant() {
    if (!this.setValueContrat) {
      if (!this.avenantId) {
        this.saveInfoPrimarysetValue.emit({InfoValue: this.formGroup.getRawValue(), avenantId: this.avenantId});
      } else {
        if (this.avenantId !== this.avenantUpdateId) {
          this.confirmUpdateInfoPrimarysetValue.emit({
            InfoValue: this.formGroup.getRawValue(),
            idAvenant: this.avenantId,
            repartition: false,
            hebdo: false,
            info: true
          });
        } else {
          this.saveInfoPrimarysetValue.emit({InfoValue: this.formGroup.getRawValue(), idAvenant: this.avenantId});
        }
      }
    }
  }

  /**
   * open popup motif sorti pour desactiver un contrat
   */
  public openPopupMotifSortie() {
    this.setValueOfstatut = false;
    if (this.formGroup.get('actif')) {
      this.formGroup.controls['actif'].setValue(1);
      this.openPopupListMotifSortie.emit({contratId: this.contratId, openPopup: true});
    }

  }

  /**
   * activer ou desactiver contrat par chek box actif
   * @param :contratId
   */
  public activeDesactiveContratwithChekbox(contratId: number) {
    if (this.contratUpdateId) {
      if (this.contratInfoPrimary.actif) {
        this.openPopupMotifSortie();

        this.setValueOfstatut = true;

      } else if (moment(this.setTimeNull(this.dateEffective.value)).isSameOrBefore(this.setTimeNull(new Date()))) {
        this.activeDesactiveContrat.emit({contratId: this.contratId, openPopup: true});

      }
    }
  }

  /**
   * lors de selaction le cdrop down groupe travail
   */
  public onSelectGroupeTravail() {
    let groupeTravailSelected;
    if (this.setValueContrat) {
      if (this.groupeTravail.value) {
        this.formGroup.get('level').setValue(this.groupeTravail.value.level);
        this.formGroup.get('echelon').setValue(this.groupeTravail.value.echelon);
        this.formGroup.get('coefficient').setValue(this.groupeTravail.value.coefficient);
        groupeTravailSelected = this.groupeTravail.value;
        this.sendTxHoraireOfGroupeTravailToTxHoraireOfContrat.emit({
          InfoValue: groupeTravailSelected.tauxhoraire,
          idContrat: this.contratId
        });
        if (groupeTravailSelected.directeur && this.typeContrat.value) {
          if ((this.typeContrat.value.dureeDetermine && this.dateEffective.value && this.datefin.value) ||
            (!this.typeContrat.value.dureeDetermine && this.dateEffective.value)) {
            this.getPresentConratHasGroupeTravailDirecteur.emit({
              InfoValue: this.formGroup.getRawValue(),
              idContrat: this.contratId,
              uuid: this.contratUuid
            });
            this.groupeTravailSelected = ' ' + this.groupeTravail.value.libelle;

          }
        }
        if (!groupeTravailSelected.directeur) {
          this.presenceDirecteur = false;
          this.setPresenceDirecteurToFalse.emit(this.contratId);
        }
      }
    }
  }

}
