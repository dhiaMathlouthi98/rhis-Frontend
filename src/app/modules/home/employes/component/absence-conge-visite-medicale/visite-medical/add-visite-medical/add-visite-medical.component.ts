import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DateService} from '../../../../../../../shared/service/date.service';
import * as moment from 'moment';

@Component({
  selector: 'rhis-add-visite-medical',
  templateUrl: './add-visite-medical.component.html',
  styleUrls: ['./add-visite-medical.component.scss']
})
export class AddVisiteMedicalComponent implements OnInit, OnChanges {
  @Output()
  public closeEvent = new EventEmitter();
  @Output()
  public addOrUpdateVisiteMedicalEvent = new EventEmitter();
  @Input()
  public visiteMedical;
  @Input()
  public buttonLabel;
  constructor(public dateService: DateService) {
  }
  ngOnInit() {
  }
  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visiteMedical) {
      this.visiteMedical = changes.visiteMedical.currentValue;
      if (this.visiteMedical.idVisiteMedicale) {
        this.showUpdateVisiteMedical();
      }
    }
  }
  public close() {
    this.closeEvent.emit();
  }
  /**
   * lors de clique sur la date de visite
   */
  public setNewDateVisite() {
      if (moment(this.visiteMedical.dateExpiration).isSameOrBefore(this.visiteMedical.dateVisite)) {
        this.setMinDateExpiration();
      }
      if (this.visiteMedical.dateVisite) {
        this.setMinDateExpiration();
      }
      this.visiteMedical.valide = this.calculeDayBetweenDate();
  }
  /**
   * lors de clique sur la date d'expiration
   */
  public setNewDateExpiration() {
    if (this.visiteMedical.dateVisite && this.visiteMedical.dateExpiration) {
      this.visiteMedical.valide = this.calculeDayBetweenDate();
    }
  }
  public addOrUpdateVisiteMedical() {
    this.addOrUpdateVisiteMedicalEvent.emit(this.visiteMedical);
  }
  /**
   * Cette methode permet de calculer la différence entre date de début et date de fin en jours
   */
  private calculeDayBetweenDate(): number {
    if (this.visiteMedical.dateExpiration && this.visiteMedical.dateVisite) {
      if (this.visiteMedical.dateDebut > this.visiteMedical.dateFin) {
        return null;
      } else {
        const diff = Math.floor(this.visiteMedical.dateExpiration.getTime() - this.visiteMedical.dateVisite.getTime());
        const day = 1000 * 60 * 60 * 24;
        const days = Math.floor(diff / day);
        return days;
      }
    }
  }
  /**
   *  afficher les valeur du viste medicale sélectionné
   * @param : absenceConge
   */
  showUpdateVisiteMedical() {
    this.visiteMedical.dateVisite = new Date(this.visiteMedical.dateVisite);
    this.visiteMedical.dateExpiration = new Date(this.visiteMedical.dateExpiration);
  }

  /**
   * A la création d'une visite médical, il faut initialiser la date "expire le" a "Date de visite" +5 ans
   */
  private setMinDateExpiration() {
    let minDateFin;
    minDateFin = JSON.parse(JSON.stringify(this.visiteMedical.dateVisite));
    minDateFin = new Date(Date.parse(minDateFin));
    const  year = minDateFin.getFullYear();
    const month = minDateFin.getMonth();
    const day = minDateFin.getDate();
    minDateFin = new Date(year + 5, month, day);
    this.visiteMedical.dateExpiration = minDateFin;
  }
}
