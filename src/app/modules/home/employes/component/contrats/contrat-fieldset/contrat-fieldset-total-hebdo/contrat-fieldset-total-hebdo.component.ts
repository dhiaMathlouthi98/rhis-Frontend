import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ContratFieldsetComponent} from '../contrat-fieldset.component';
import {RepartitionTimeModel} from '../../../../../../../shared/model/repartition.time.model';

@Component({
  selector: 'rhis-contrat-fieldset-total-hebdo',
  templateUrl: '../contrat-fieldset.component.html',
  styleUrls: ['../contrat-fieldset.component.scss']
})
export class ContratFieldsetTotalHebdoComponent extends ContratFieldsetComponent implements OnInit, OnChanges {

  @Input()
  public nbrHeuresSections;
  @Input()
  public RepartitionSections;
  @Input() complContrat;
  @Output()
  public updateTempsPartiel = new EventEmitter();
  @Output()
  public calculTotalHebdo = new EventEmitter();
  @Output()
  public confirmUpdateRepartitionsetValue = new EventEmitter();
  @Input() isSubmitted = true;
  constructor() {
    super();
    this.formGroup = new FormGroup(
      {
        valeurLundi: new FormControl(),
        valeurMardi: new FormControl(''),
        valeurMercredi: new FormControl(''),
        valeurJeudi: new FormControl(''),
        valeurVendredi: new FormControl(''),
        valeurSamedi: new FormControl(''),
        valeurDimanche: new FormControl(''),
      }
    );
  }

  ngOnInit() {
    this.valeurLundi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurMardi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurMercredi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurJeudi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurVendredi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurSamedi.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.valeurDimanche.valueChanges.subscribe(
      value => this.onCalculeValeurHebdomadaire()
    );
    this.formGroup.valueChanges.subscribe(val => {
   if (this.setValueContrat) {
     this.setChangementOfContrat();
   } else if (!this.detecteChangementOfRepartition()) {
        this.setChangementOfAvenant();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }

    if (changes.title) {
      this.title = changes.title.currentValue;
    }
    if (changes.repartitionTime) {
      this.repartitionTime = changes.repartitionTime.currentValue;
      if (this.repartitionTime) {
        this.displayRepartitionTime(this.repartitionTime);
      }
    }
    if (changes.repartitionTimeDefault) {
      this.repartitionTimeDefault = changes.repartitionTimeDefault.currentValue;
    }
    if (changes.contratUpdateId) {
      this.contratUpdateId = changes.contratUpdateId.currentValue;
      if (!this.contratUpdateId) {
        this.contratUpdateId = this.contratId;
      }
    }
    if (changes.istotalHeuresEquals) {
      this.istotalHeuresEquals = changes.istotalHeuresEquals.currentValue;
    }
    if (changes.avenantId) {
      this.avenantId = changes.avenantId.currentValue;
    }
    if (changes.avenantUpdateId) {
      this.avenantUpdateId = changes.avenantUpdateId.currentValue;
      if (!this.avenantUpdateId && this.detecteChangementOfRepartition()) {
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
    if (repartitionTime.repartition) {
      this.formGroup.controls['valeurLundi'].setValue(+repartitionTime.repartition.valeurLundi);
      this.formGroup.controls['valeurMardi'].setValue(+repartitionTime.repartition.valeurMardi);
      this.formGroup.controls['valeurMercredi'].setValue(+repartitionTime.repartition.valeurMercredi);
      this.formGroup.controls['valeurJeudi'].setValue(+repartitionTime.repartition.valeurJeudi);
      this.formGroup.controls['valeurVendredi'].setValue(+repartitionTime.repartition.valeurVendredi);
      this.formGroup.controls['valeurSamedi'].setValue(+repartitionTime.repartition.valeurSamedi);
      this.formGroup.controls['valeurDimanche'].setValue(+repartitionTime.repartition.valeurDimanche);
      this.onCalculeValeurHebdomadaire();
    } else {
      this.resetForm();
    }
  }

  /**
   *  calcule automatique de  repartition hebdomadaire et la difference entre la repartition
   * et la valeur mentionné dans le contrat lors de saisie dans les valeurs hibdomadaire
   */
  private onCalculeValeurHebdomadaire() {
    this.repartition = 0;
    if (this.valeurLundi.value) {
      if (this.repartitionTime.repartition) {
        this.repartitionTime.repartition.valeurLundi = +this.valeurLundi.value;
      }
      this.repartition += parseFloat(this.valeurLundi.value);
    }
    if (this.valeurMardi.value) {
      if (this.repartitionTime.repartition) {
        this.repartitionTime.repartition.valeurMardi = +this.valeurMardi.value;
      }
      this.repartition += parseFloat(this.valeurMardi.value);

    }
    if (this.valeurMercredi.value) {
      if (this.repartitionTime.repartition) {
        this.repartitionTime.repartition.valeurMercredi = +this.valeurMercredi.value;
      }

      this.repartition += parseFloat(this.valeurMercredi.value);
    }
    if (this.valeurJeudi.value) {
      if (this.repartitionTime.repartition) {
        this.repartitionTime.repartition.valeurJeudi = +this.valeurJeudi.value;
      }
      this.repartition += parseFloat(this.valeurJeudi.value);
    }
    if (this.valeurVendredi.value) {
      if (this.repartitionTime.repartition) {

        this.repartitionTime.repartition.valeurVendredi = +this.valeurVendredi.value;
      }
      this.repartition += parseFloat(this.valeurVendredi.value);
    }
    if (this.valeurSamedi.value) {
      if (this.repartitionTime.repartition) {
        this.repartitionTime.repartition.valeurSamedi = +this.valeurSamedi.value;
      }
      this.repartition += parseFloat(this.valeurSamedi.value);

    }
    if (this.valeurDimanche.value) {
      if (this.repartitionTime.repartition) {

        this.repartitionTime.repartition.valeurDimanche = +this.valeurDimanche.value;
      }

      this.repartition += parseFloat(this.valeurDimanche.value);
    }
    this.calculTotalHebdo.emit(this.repartition.toFixed(2));

  }

  /**
   * recuperer valeurLundi de contrat
   */
  get valeurLundi() {
    return this.formGroup.get('valeurLundi');
  }

  /**
   * recuperer valeurMardi de contrat
   */
  get valeurMardi() {
    return this.formGroup.get('valeurMardi');
  }

  /**
   * recuperer valeurMercredi de contrat
   */
  get valeurMercredi() {
    return this.formGroup.get('valeurMercredi');
  }

  /**
   * recuperer valeurJeudi de contrat
   */
  get valeurJeudi() {
    return this.formGroup.get('valeurJeudi');
  }

  /**
   * recuperer valeurVendredi de contrat
   */
  get valeurVendredi() {
    return this.formGroup.get('valeurVendredi');
  }

  /**
   * recuperer valeurSamedi de contrat
   */
  get valeurSamedi() {
    return this.formGroup.get('valeurSamedi');
  }

  /**
   * recuperer valeurDimanche de contrat
   */
  get valeurDimanche() {
    return this.formGroup.get('valeurDimanche');
  }

  /** detecter changement dfe repartition
   *
   */
  setChangementOfContrat() {
    if (!this.contratId) {
      // ajouter un nouveau contrat
      this.fieldsetValue.emit({InfoValue: this.formGroup.value, idContrat: this.contratId});
    } else {
      this.onCalculeValeurHebdomadaire();
      // lors de modifier un autre contrat sans enregistrer un contrat qui deja mis a jour
      if (this.contratId !== this.contratUpdateId) {
        this.confirmUpdateRepartitionsetValue.emit({
          InfoValue: this.formGroup.value,
          idContrat: this.contratId,
          repartition: true,
          hebdo: false,
          info: false
        });
      } else {
        // modifier un contrat
        this.fieldsetValue.emit({InfoValue: this.formGroup.value, idContrat: this.contratId});
      }
    }
}

  /** detecter changement avenant de repartition
   *
   */
  setChangementOfAvenant() {
    if (!this.avenantId) {
      // ajouter un nouveau contrat
      this.fieldsetValue.emit({InfoValue: this.formGroup.value, idAvenant: this.avenantId});
    } else {
      this.onCalculeValeurHebdomadaire();
      // lors de modifier un autre contrat sans enregistrer un contrat qui deja mis a jour
      if (this.avenantId !== this.avenantUpdateId) {
        this.confirmUpdateRepartitionsetValue.emit({
          InfoValue: this.formGroup.value,
          idAvenant: this.avenantId,
          repartition: true,
          hebdo: false,
          info: false
        });
      } else {
        // modifier un contrat
        this.fieldsetValue.emit({InfoValue: this.formGroup.value, idAvenant: this.avenantId});
      }
    }
  }

  /**
   * detecte s il y a changement dans l'avenant ou nn

   */
  private detecteChangementOfRepartition(): boolean {
    return JSON.stringify(this.repartitionTimeDefault) === JSON.stringify(this.repartitionTime);
  }

}
