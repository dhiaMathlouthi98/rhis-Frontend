import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {JourDisponibiliteModel} from '../../../../../../shared/model/jourDisponibilite.model';

@Component({
  selector: 'rhis-disponibilite-container',
  templateUrl: './disponibilite-container.component.html',
  styleUrls: ['./disponibilite-container.component.scss']
})
export class DisponibiliteContainerComponent implements OnChanges {


  @Input()
  public openningHours: { day: string, value: string }[];
  @Input()
  public closureHours: { day: string, value: string }[];
  @Input()
  public id;
  @Input()
  public data: JourDisponibiliteModel[];

  @Input()
  public set isAlternate(val) {
    this.showAlternate = val;
  }

  @Input()
  public set hebdo(hebdo: number) {
    this.hebdoContrat = hebdo;
  }

  @Input()
  public set partialTime(isPartialTime: boolean) {
    this.isPartialTime = isPartialTime;
  }

  @Input()
  public disponibiliteConfig;
  @Input()
  public updatedId;
  @Output()
  public currentDispo = new EventEmitter();
  @Output()
  public confirmUpdateDispoSetValue = new EventEmitter();
  @Output()
  public saveAlternate = new EventEmitter();

  public showAlternate: boolean;
  public isOnlyPairDispo: boolean;
  public pairContext;
  public oddContext;
  private pairJourDisponibilite: JourDisponibiliteModel[];
  private oddJourDisponibilite: JourDisponibiliteModel[];
  private hebdoContrat: number;
  private isPartialTime: boolean;

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.openningHours) {
      this.openningHours = changes.openningHours.currentValue;
    }
    if (changes.closureHours) {
      this.closureHours = changes.closureHours.currentValue;
    }
    if (changes.id) {
      this.id = changes.id.currentValue;
    }
    if (changes.data && changes.data.currentValue && changes.data.isFirstChange()) {
      this.data = changes.data.currentValue;
      this.createDisponibiliteContext();
      this.isOnlyPairDispo = !this.showAlternate;
    }
    if (changes.disponibiliteConfig) {
      this.disponibiliteConfig = changes.disponibiliteConfig.currentValue;
    }
    if (changes.updatedId) {
      this.updatedId = changes.updatedId.currentValue;
      if (!this.updatedId) {
        this.updatedId = this.id;
      }
    }
    if (changes.isAlternate) {
      this.isAlternate = changes.isAlternate.currentValue;
    }
  }

  /**
   * Create availabilities contexts
   */
  private createDisponibiliteContext() {
    this.pairJourDisponibilite = this.data.filter((jourDispo: JourDisponibiliteModel) => !jourDispo.odd);
    this.oddJourDisponibilite = this.data.filter((jourDispo: JourDisponibiliteModel) => jourDispo.odd);
    this.setDisponibiliteContext();
  }

  /**
   * Set the appropriate context to each availabilities
   */
  private setDisponibiliteContext() {
    this.pairContext = {data: this.pairJourDisponibilite, isOdd: false, prefix: this.id ? 'pair-' + this.id : 'pair-uid'};
    this.oddContext = {data: this.oddJourDisponibilite, isOdd: true, prefix: this.id ? 'odd-' + this.id : 'odd-uid'};
  }

  /**
   * Send disponibilite to be saved and check the other parts modifications
   * @param: dispo
   */
  public saveDisponibilite(event) {
    event = this.setJoursDisponibilites(event);
    this.currentDispo.emit(event);
  }

  /**
   * Notify contrat to show popup for suggestion to update the previous one
   * @param: dispo
   */
  public showConfirmUpdateContrat(event) {
    event = this.setJoursDisponibilites(event);
    this.confirmUpdateDispoSetValue.emit(event);
  }

  /**
   * Set properly odd/pair disponibilite
   * @param: data
   */
  private setJoursDisponibilites(data: any): any {
    const event = {...data};
    event['dispo'] = [...event['dispo'], ...(event['isOdd'] ?
      this.setOddJoursDisponibilites(event['dispo']) : this.setPairJoursDisponibilites(event['dispo']))];
    event['alternate'] = this.showAlternate;
    return event;
  }

  /**
   * Update the local odd variable (responsible for the odd days of the odd availability) by the new odd days
   * coming from availability output event and return the pair ones to send all 14 days (pair && odd) to the contract
   * component to update the whole availabilities
   * @param: disponibilites
   */
  private setOddJoursDisponibilites(disponibilites: JourDisponibiliteModel[]): JourDisponibiliteModel[] {
    this.oddJourDisponibilite = [...disponibilites];
    if (!this.pairJourDisponibilite.length) {
      const pairDisponibilite = [];
      this.disponibiliteConfig.weekDays.forEach((dayConfig: { day: string, val: string }) => {
        const jourDisponibilite = new JourDisponibiliteModel();
        jourDisponibilite.odd = false;
        jourDisponibilite.jourSemain = dayConfig.val;
        pairDisponibilite.push(jourDisponibilite);
      });
      this.pairJourDisponibilite = pairDisponibilite;
    }
    return this.pairJourDisponibilite;
  }

  /**
   * Update the local pair variable (responsible for the pair days of the pair availability) by the new pair days
   * coming from availability output event and return the odd ones to send all 14 days (pair && odd) to the contract
   * component to update the whole availabilities
   * @param: disponibilites
   */
  private setPairJoursDisponibilites(disponibilites: JourDisponibiliteModel[]): JourDisponibiliteModel[] {
    this.pairJourDisponibilite = [...disponibilites];
    if (!this.oddJourDisponibilite.length && this.showAlternate) {
      const oddDisponibilite = [];
      this.disponibiliteConfig.weekDays.forEach((dayConfig: { day: string, val: string }) => {
        const jourDisponibilite = new JourDisponibiliteModel();
        jourDisponibilite.odd = true;
        jourDisponibilite.jourSemain = dayConfig.val;
        oddDisponibilite.push(jourDisponibilite);
      });
      this.oddJourDisponibilite = oddDisponibilite;
    }
    return this.oddJourDisponibilite;
  }

  /**
   * Alternate to pair/odd disponibilite view
   * @param: alternate
   */
  public doAlternate(alternate: boolean): void {
    if (!this.id) {
      this.saveAlternate.emit({idContrat: this.id, idAvenant: this.id, alternate: alternate});
      this.pairContext = {};
      this.oddContext = {};
      this.setDisponibiliteContext();
    } else {
      if (this.id !== this.updatedId) {
        this.confirmUpdateDispoSetValue.emit({
          alternateVal: alternate,
          alternate: true,
          idContrat: this.id,
          idAvenant: this.id
        });
      } else {
        this.saveAlternate.emit({idContrat: this.id, idAvenant: this.id, alternate: alternate});
        this.pairContext = {};
        this.oddContext = {};
        this.setDisponibiliteContext();
      }
    }
    this.isOnlyPairDispo = !alternate;
  }
}
