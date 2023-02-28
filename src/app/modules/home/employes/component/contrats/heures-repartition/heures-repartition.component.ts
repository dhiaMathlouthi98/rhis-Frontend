import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'rhis-heures-repartition',
  templateUrl: './heures-repartition.component.html',
  styleUrls: ['./heures-repartition.component.scss']
})
export class HeuresRepartitionComponent implements OnInit, OnChanges {
  @Input() public nbrHeuresTitle;
  @Input() public totalHebdoTitle;
  @Input() public repartitionTime;
  @Input() repartitionTimeDefault;
  @Input() public nbrHeuresSections;
  @Input() public RepartitionSections;
  @Input() public txHoraireGroupeTravail;
  @Input() public arrondiContratMensuel;
  @Input() public paramMonthWeek;
  @Input() contratId;
  @Input() complContrat;
  @Input() istotalHeuresEquals;
  @Input() ouvre;
  @Input() ouvrable;
  @Input() dateConstraints;
  @Input() contratUpdateId;
  @Input()setValueContrat;
  @Input()avenantId;
  @Input() avenantUpdateId;
  @Input() prefixId;
  @Output()
  public saveNbHeure = new EventEmitter();
  @Output()
  public saveTotalHebdo = new EventEmitter();
  @Output()
  public calculTotalHebdo = new EventEmitter();
  @Output()
  public confirmUpdateRepartitionsetValue = new EventEmitter();
  @Output()
  public confirmUpdateHeureHebdosetValue = new EventEmitter();
  public tempsPartiel = false;
  public tempsPlein = false;


  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.repartitionTime) {
      this.repartitionTime = changes.repartitionTime.currentValue;
      if (this.repartitionTime) {
        this.tempsPartiel = this.repartitionTime.tempsPartiel;
        this.tempsPlein = !this.repartitionTime.tempsPartiel;
      }
    }
    if (changes.txHoraireGroupeTravail) {
      this.txHoraireGroupeTravail = changes.txHoraireGroupeTravail.currentValue;
    }
    if (changes.dateConstraints) {
      this.dateConstraints = changes.dateConstraints.currentValue;
    }
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }
    if (changes.totalHebdoTitle) {
      this.totalHebdoTitle = changes.totalHebdoTitle.currentValue;
    }
    if (changes.complContrat) {
      this.complContrat = changes.complContrat.currentValue;
    }
    if (changes.istotalHeuresEquals) {
      this.istotalHeuresEquals = changes.istotalHeuresEquals.currentValue;
    }
    if (changes.contratUpdateId) {
      this.contratUpdateId = changes.contratUpdateId.currentValue;
      if (!this.contratUpdateId) {
        this.contratUpdateId = this.contratId;
      }
    }
    if (changes.setValueContrat) {
      this.setValueContrat = changes.setValueContrat.currentValue;
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
   * modifie la valeur de hebdo il faut mettre à jour la case à cocher temps plein ou partiel
   * @param :hebdo
   */
  public updateTempsPartiel(hebdo) {
    if (hebdo < 35) {
      this.onSelectTempsPartiel();
    } else {
      this.onSelectTempsPlein();

    }
  }

  /**
   * lors de select temps partiel ,deselect temps plein
   */
  public onSelectTempsPartiel() {
    this.tempsPlein = false;
    this.tempsPartiel = true;
    if (this.setValueContrat) {
      if (this.contratId) {
        if (this.contratId !== this.contratUpdateId) {
          this.confirmUpdateHeureHebdosetValue.emit({
            InfoValue: {tempsPartiel: this.tempsPartiel},
            idContrat: this.contratId,
            repartition: false,
            hebdo: false,
            info: false
          });
        } else {
          // modifier un contrat
          this.saveNbHeure.emit({InfoValue: {tempsPartiel: this.tempsPartiel}, idContrat: this.contratId});
        }
      } else {
        // save new contrat
        this.saveNbHeure.emit({InfoValue: {tempsPartiel: this.tempsPartiel}, idContrat: this.contratId});
      }
    } else {
      this.valueChangesOfAvenant();
    }
  }

  /**
   * lors de select temps plein ,deselect temps partiel et mettre la valeur de contrat à 35
   */
  public onSelectTempsPlein() {
    this.tempsPartiel = false;
    this.tempsPlein = true;
    if(this.setValueContrat) {
      if (this.contratId) {
        if (this.contratId !== this.contratUpdateId) {
          this.confirmUpdateHeureHebdosetValue.emit({
            InfoValue: {tempsPartiel: this.tempsPartiel},
            idContrat: this.contratId,
            repartition: false,
            hebdo: false,
            info: false
          });
        } else {
          // modifier un contrat
          this.saveNbHeure.emit({InfoValue: {tempsPartiel: this.tempsPartiel}, idContrat: this.contratId});
        }
      } else {
        // save new contrat
        this.saveNbHeure.emit({InfoValue: {tempsPartiel: this.tempsPartiel}, idContrat: this.contratId});
      }
    } else {
      this.valueChangesOfAvenant();
    }
  }

  public calculeTotalHebdo(event) {
    this.calculTotalHebdo.emit(event);
  }

  /**
   * Envoyer nombre d'heure vers le contrat
   * @param :nbHeure
   */
  public sendNbHeure(nbHeure) {
    nbHeure.tempsPartiel = this.tempsPartiel;
    this.saveNbHeure.emit(nbHeure);
  }

  /**
   * Envoyer total hebdo vers le contrat
   * @param :totalHebdo
   */
  public sendTotalHebdo(totalHebdo) {
    this.saveTotalHebdo.emit(totalHebdo);
  }

  /**
   *envoyer la repartition lors de modifier un autre contrat
   * @param :event
   */
  public confirmUpdateRepartition(event) {
    this.confirmUpdateRepartitionsetValue.emit(event);
  }

  /**
   *envoyer nombre d'heure lors de modifaction un autre contrat
   * @param :event
   */
  public confirmUpdateHeureHebdo(event) {
    event.tempsPartiel = this.tempsPartiel;
    this.confirmUpdateHeureHebdosetValue.emit(event);
  }
  /**
   * detecter la changement au niveau d'avenant
   */
  valueChangesOfAvenant() {
    if (this.avenantId) {
      if (this.avenantId !== this.avenantUpdateId) {
        this.confirmUpdateHeureHebdosetValue.emit({
          InfoValue: {tempsPartiel: this.tempsPartiel},
            idAvenant: this.avenantId,
          repartition: false,
          hebdo: false,
          info: false
        });
      } else {
        // modifier un contrat
        this.saveNbHeure.emit({InfoValue: {tempsPartiel: this.tempsPartiel}, idAvenant: this.avenantId});
      }
    }
  }
}
