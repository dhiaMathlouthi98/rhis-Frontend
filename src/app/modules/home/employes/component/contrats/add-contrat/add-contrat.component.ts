import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {NotificationService} from '../../../../../../shared/service/notification.service';

@Component({
  selector: 'rhis-add-contrat-form',
  templateUrl: './add-contrat.component.html',
  styleUrls: ['./add-contrat.component.scss']
})
export class AddContratComponent implements OnInit, OnChanges {
  @Input() listGroupTravail;
  @Input() listTypeContrat;
  @Input() buttonLabel;
  @Input() contratExist;
  @Input() presenceDirecteur;
  @Output()
  public addContratInfoPrimary = new EventEmitter();

  @Output()
  public resetErrorMessagesDateEffectifEvent = new EventEmitter();
  @Output()
  public resetErrorMessagesDateFinEvent = new EventEmitter();
  @Output() public getPresentConratHasGroupeTravailDirecteur = new EventEmitter();
  public isSubmitted = false;
  public minDatefinContrat: Date;
  public groupeTravailSelected: string;
  public selectors = {
    calendarSelector: '.ui-inputtext.ui-widget',
    dropDownSelector: '.ui-dropdown',
  };
  public formGroup = new FormGroup(
    {
      groupeTravail: new FormControl('', [Validators.required]),
      typeContrat: new FormControl('', [Validators.required]),
      dateEffective: new FormControl('', [Validators.required]),
      datefin: new FormControl(''),
    }
  );

  constructor(private notificationService: NotificationService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.listTypeContrat) {
      this.listTypeContrat = changes.listTypeContrat.currentValue;
    }
    if (changes.listGroupTravail) {
      this.listGroupTravail = changes.listGroupTravail.currentValue;
    }
    if (changes.contratExist) {
      this.contratExist = changes.contratExist.currentValue;
    }
    if (changes.presenceDirecteur) {
      this.presenceDirecteur = changes.presenceDirecteur.currentValue;
    }
  }

  ngOnInit(): void {
    this.formGroup.get('datefin').disable();

    this.dateEffective.valueChanges.subscribe(
      value => this.resetErrorMessagesDateEffectif()
    );
    this.datefin.valueChanges.subscribe(
      value => this.resetErrorMessagesDateFin()
    );
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
   * Submit the edit/add value to save it
   */
  public onSubmit() {
    this.isSubmitted = true;
    if (this.formGroup.valid && !this.presenceDirecteur) {
      this.isSubmitted = false;
      this.addContratInfoPrimary.emit(this.formGroup.value);
    }
  }

  /**
   * lors de la select type de contrat
   * si cdi date fin est desable
   * si cdd date fin est enable
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
      if (typeContrat.dureeDetermine) {
        this.formGroup.controls['datefin'].setValidators([Validators.required]);
        this.formGroup.get('datefin').enable();
      } else {
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
      this.resetErrorMessagesDateFinEvent.emit();
    }
  }

  /**
   * reset message contrat existe
   */
  private resetErrorMessagesDateFin() {
    if (this.contratExist) {
      this.resetErrorMessagesDateFinEvent.emit();
    }

  }

  /**
   * si on select date fin
   */
  public onSelectDateFin() {
    if (this.datefin.value) {
      this.onSelectGroupeTravail();
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
      this.formGroup.get('datefin').disable();


      if (this.typeContrat.value.dureeDetermine && this.dateEffective.value) {

        this.formGroup.get('datefin').enable();
        if (!this.datefin.value) {
          this.formGroup.controls['datefin'].setValue(new Date(minDateFin));
        }

      }
      this.onSelectGroupeTravail();
    }
  }

  /**
   * lors de selaction le cdrop down groupe travail
   */
  public onSelectGroupeTravail() {
    let groupeTravailSelected;
    if (this.groupeTravail.value) {
      groupeTravailSelected = this.groupeTravail.value;
      if (groupeTravailSelected.directeur && this.typeContrat.value) {
        if ((this.typeContrat.value.dureeDetermine && this.dateEffective.value && this.datefin.value) ||
          (!this.typeContrat.value.dureeDetermine && this.dateEffective.value)) {
          this.getPresentConratHasGroupeTravailDirecteur.emit({
            dateEffective: this.dateEffective.value,
            datefin: this.datefin.value,
            idContrat: 0
          });
          this.groupeTravailSelected = ' ' + this.groupeTravail.value.libelle;

        }
      }
      if (!groupeTravailSelected.directeur) {
        this.presenceDirecteur = false;
      }
    }
  }

  // converture la date time en date selement
  setTimeNull(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  public showTotalDispoMessageErrorExist(contratEvent) {
    this.notificationService.showErrorMessage('Un contrat est déjà actif à cette date');

  }
}
