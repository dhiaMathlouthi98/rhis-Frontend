import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ContratFieldsetComponent} from '../contrat-fieldset.component';
import {RepartitionTimeModel} from '../../../../../../../shared/model/repartition.time.model';

@Component({
  selector: 'rhis-contrat-fieldset-nb-heure',
  templateUrl: '../contrat-fieldset.component.html',
  styleUrls: ['../contrat-fieldset.component.scss']
})
export class ContratFieldsetNbHeureComponent extends ContratFieldsetComponent implements OnInit, OnChanges {
  @Input()
  public nbrHeuresSections;
  @Input()
  public tempsPartiel;
  @Input()
  public tempsPlein;
  @Input()
  public txHoraireGroupeTravail;
  @Input() complContrat;
  @Input() dateConstraints;
  @Input() txHoraireOfContrat;
  @Input() arrondiContratMensuel;
  @Input() paramMonthWeek;


  @Output()
  public updateTempsPartiel = new EventEmitter();
  @Output()
  public confirmUpdateHeureHebdosetValue = new EventEmitter();

  constructor() {
    super();
    this.formGroup = new FormGroup(
      {
        mens: new FormControl({value: '', disabled: true}),
        hebdo: new FormControl('', [Validators.required]),
        annee: new FormControl({value: '', disabled: true}),
        txHoraire: new FormControl('', [Validators.required]),
        salaire: new FormControl({value: '', disabled: true}),
        compt: new FormControl('', [Validators.required])
      }
    );
  }

  ngOnInit() {
    this.hebdo.valueChanges.subscribe(
      value => this.updateValeurHebdo()
    );
    this.txHoraire.valueChanges.subscribe(
      value => this.onKeyTxHoraire()
    );
    this.compt.valueChanges.subscribe(
      value => this.onKeyCompt()
    );
    this.formGroup.valueChanges.subscribe(val => {
      if (this.setValueContrat) {
        if (!this.contratId) {
          // ajouter un nouveau contrat
          this.fieldsetValue.emit({InfoValue: this.formGroup.getRawValue(), idContrat: this.contratId});
        } else {
          // lors de modifier un autre contrat sans enregistrer un contrat qui deja mis a jour
          if (this.contratId !== this.contratUpdateId) {
            this.confirmUpdateHeureHebdosetValue.emit({
              InfoValue: this.formGroup.getRawValue(),
              idContrat: this.contratId,
              repartition: false,
              hebdo: true,
              info: false,
            });
          } else {
            // modifier un contrat
            this.fieldsetValue.emit({InfoValue: this.formGroup.getRawValue(), idContrat: this.contratId});
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }
    if (changes.tempsPartiel) {
      this.tempsPartiel = changes.tempsPartiel.currentValue;
      if (this.tempsPartiel && this.hebdo.value >= 35) {
        this.formGroup.controls['hebdo'].setValue(34);
      }
    }
    if (changes.dateConstraints) {
      this.dateConstraints = changes.dateConstraints.currentValue;
      if (!this.dateConstraints) {
        Object.values(this.formGroup.controls).forEach(control => {
          control.markAsTouched();
        });
      }
    }
    if (changes.title) {
      this.title = changes.title.currentValue;
    }
    if (changes.tempsPlein) {
      this.tempsPlein = changes.tempsPlein.currentValue;
      if (this.tempsPlein && this.hebdo.value < 35) {
        this.formGroup.controls['hebdo'].setValue(35);
      }
    }

    if (changes.repartitionTime) {
      this.repartitionTime = changes.repartitionTime.currentValue;
      if (this.repartitionTime) {
        this.displayRepartitionTime(this.repartitionTime);
      }

    }

    if (changes.complContrat) {
      this.complContrat = changes.complContrat.currentValue;
      if (this.complContrat && !this.contratId) {
        this.formGroup.controls['compt'].setValue(this.complContrat);
      }
    }
    if (changes.contratUpdateId) {
      this.contratUpdateId = changes.contratUpdateId.currentValue;
      if (!this.contratUpdateId && this.contratId) {
        this.contratUpdateId = this.contratId;
      }
    }
    if (changes.txHoraireGroupeTravail) {
      this.txHoraireGroupeTravail = changes.txHoraireGroupeTravail.currentValue;
      if ((this.contratId === this.contratUpdateId) && this.setValueContrat) {
        this.formGroup.controls['txHoraire'].setValue(this.txHoraireGroupeTravail);

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
   * Display the infos of a 'contrat'
   * @param :semainRepos
   */
  private displayRepartitionTime(repartitionTime: RepartitionTimeModel): void {
    if (repartitionTime) {
      if (!repartitionTime.salaire) {
        this.formGroup.controls['salaire'].setValue(0);
      }
      this.formGroup.controls['mens'].setValue(repartitionTime.mens);
      this.formGroup.controls['txHoraire'].setValue(repartitionTime.txHoraire);
      this.formGroup.controls['compt'].setValue(repartitionTime.compt);
      this.formGroup.controls['hebdo'].setValue(repartitionTime.hebdo);
      this.formGroup.controls['annee'].setValue(repartitionTime.annee);
      this.formGroup.controls['salaire'].setValue(repartitionTime.salaire);
    } else {
      this.resetForm();
    }
  }

  /**
   * recuperer l'hebdo de contrat
   */
  get hebdo() {
    return this.formGroup.get('hebdo');
  }

  /**
   * recuperer txHoraire de contrat
   */
  get txHoraire() {
    return this.formGroup.get('txHoraire');
  }

  /**
   * recuperer mens de contrat
   */
  get mens() {
    return this.formGroup.get('mens');
  }

  /**
   * recuperer compt de contrat
   */
  get compt() {
    return this.formGroup.get('compt');
  }

  public roundContratMensuel(valeurMensuel: number): number {
    if (Math.round(valeurMensuel) < valeurMensuel) {
      return Math.round(valeurMensuel) + 1;
    } else {
      return Math.round(valeurMensuel);
    }
  }

  /**
   * modifie la valeur de hebdo il faut mettre à jour la case à cocher temps plein ou partiel
   * et fauire calcule des autre champs mens, anne, salaire
   */
  private updateValeurHebdo() {
    let mens;
    let annee;
    let salaire;
    let valeurMonthWeek = 4.33;
    this.updateTempsPartiel.emit(this.hebdo.value);
    if (!this.paramMonthWeek) {
      valeurMonthWeek = 52 / 12;
    }
    mens = (this.hebdo.value * (valeurMonthWeek)).toFixed(2);
    if (this.arrondiContratMensuel === 1 && this.hebdo.value < 35)
      mens = this.roundContratMensuel(mens);
    this.formGroup.controls['mens'].setValue(mens);
    annee = (12 * this.mens.value).toFixed(2);
    this.formGroup.controls['annee'].setValue(annee);

    if (this.txHoraire.value) {
      salaire = (this.txHoraire.value * this.mens.value).toFixed(2);
      this.formGroup.controls['salaire'].setValue(salaire);
    }

    if (this.repartitionTime) {
      this.repartitionTime.hebdo = this.hebdo.value;
      if (!this.detecteChangementOfRepartition()) {
        this.setChangeOfAvenant();
      }
    }
  }

  /**
   *   lors de saisie dans la champs TxHoraire
   */
  private onKeyTxHoraire() {
    let salaire;
    if (!this.mens.value) {
      this.formGroup.controls['mens'].setValue(0);
    }
    salaire = (this.txHoraire.value * this.mens.value).toFixed(2);
    this.formGroup.controls['salaire'].setValue(salaire);
    if (this.repartitionTime) {
      this.repartitionTime.txHoraire = this.txHoraire.value;
      if (!this.detecteChangementOfRepartition()) {
        this.setChangeOfAvenant();
      }
    }
  }

  /**
   * lors de clique sur compt
   */
  private onKeyCompt() {
    if (this.repartitionTime) {
      this.repartitionTime.compt = this.compt.value;
      if (!this.detecteChangementOfRepartition()) {
        this.setChangeOfAvenant();
      }
    }

  }

  private setChangeOfAvenant() {
    if (!this.setValueContrat) {
      this.fieldsetValue.emit(this.formGroup.getRawValue());
      if (!this.avenantId) {
        // ajouter un nouveau contrat
        this.fieldsetValue.emit({InfoValue: this.formGroup.getRawValue(), idAvenant: this.avenantId});
      } else {
        // lors de modifier un autre contrat sans enregistrer un contrat qui deja mis a jour
        if (this.avenantId !== this.avenantUpdateId) {
          this.confirmUpdateHeureHebdosetValue.emit({
            InfoValue: this.formGroup.getRawValue(),
            idAvenant: this.avenantId,
            repartition: false,
            hebdo: true,
            info: false,
          });
        } else {
          // modifier un contrat
          this.fieldsetValue.emit({InfoValue: this.formGroup.getRawValue(), idAvenant: this.avenantId});
        }
      }
    }
  }

  private detecteChangementOfRepartition(): boolean {
    return JSON.stringify(this.repartitionTimeDefault) === JSON.stringify(this.repartitionTime);
  }

}
