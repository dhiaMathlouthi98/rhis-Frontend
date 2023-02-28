import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {TypeEvenementModel} from '../../../../../../../shared/model/type.evenement.model';
import {DateService} from '../../../../../../../shared/service/date.service';
import {DecompteAbsencePipe} from '../../../../pipe/decompte-absence.pipe';
import {DecompteAbsenceParms} from '../../../../../../../shared/model/gui/decompte-absence-parms';
import {AbsenceDurationStateModel, DurationModeEnum} from '../model/absence-duration-state.model';

@Component({
  selector: 'rhis-add-conge-absence',
  templateUrl: './add-conge-absence.component.html',
  styleUrls: ['./add-conge-absence.component.scss']

})
export class AddCongeAbsenceComponent implements OnChanges {
  @Output()
  public closeEvent = new EventEmitter();
  @Output()
  public addOrUpdateAbsenceEvent = new EventEmitter<AbsenceDurationStateModel>();
  @Input()
  public absence;
  @Input()
  public listJourFeries;
  @Input()
  public buttonLabel: string;
  @Input()
  public absenceParam: DecompteAbsenceParms;
  @Input()
  set listTypeEvenement(listTypeEvenement: TypeEvenementModel[]) {
    this.typeEvenementItemList = [];
    listTypeEvenement.forEach(item => {
      this.typeEvenementItemList.push({
        label: item.libelle, value: item
      });
    });
  }

  public typeEvenementItemList: SelectItem[] = [];
  public parameters: DecompteAbsenceParms;
  public readonly decompteAbsencePipe = new DecompteAbsencePipe();
  public selectedTypeEvenement;
  public modeCalc = DurationModeEnum.PLANNING_REPARTITION;
  public radioValues = {manuel: DurationModeEnum.MANUAL, plan_rep: DurationModeEnum.PLANNING_REPARTITION};
  public duration: {hours: number, minutes: number} = {hours: 0, minutes: 0};
  private readonly MAX_MINUTES_NUMBER = 59;
  public showDurationErrorMessage = false;

  constructor(public dateService: DateService) {
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.absence) {
      this.absence = changes.absence.currentValue;
      if (this.absence.idAbsenceConge) {
        this.showUpdateAbsenceConge(this.absence);
      }
    }
    if (changes.absenceParam) {
      this.parameters = changes.absenceParam.currentValue;
    }
    if (changes.listJourFeries) {
      this.listJourFeries = changes.listJourFeries.currentValue;
    }
  }

  private getAbsDayNbr(): number {
    const code = this.selectedTypeEvenement ? this.selectedTypeEvenement.code : null;
    return this.decompteAbsencePipe.transform(this.absence.dateDebut, this.absence.dateFin, code, this.parameters, this.listJourFeries);
  }

  public close(): void {
    this.closeEvent.emit();

  }

  /**
   * lors de clique sur la date de debut
   */
  public setNewDateDebut(): void {
    if (this.absence.dateFin && this.absence.dateDebut) {
      this.absence.dateFin = new Date(this.absence.dateFin.setHours(0));
      this.absence.dateDebut = new Date(this.absence.dateDebut.setHours(0));
    }
    this.showDurationErrorMessage = false;
  }

  /**
   * lors de clique la date de fin
   */
  public setNewDateFin(): void {
    if (this.absence.dateDebut && this.absence.dateFin) {
      this.absence.dateFin = new Date(this.absence.dateFin.setHours(0));
      this.absence.dateDebut = new Date(this.absence.dateDebut.setHours(0));
    }
    this.showDurationErrorMessage = false;
  }

  public addOrUpdateAbsence(): void {
    this.absence.typeEvenement = this.selectedTypeEvenement;
    this.absence.dureeJour = this.getAbsDayNbr();
    if ((this.modeCalc === DurationModeEnum.MANUAL) && this.absence.dateDebut && this.absence.dateFin) {
      const totalDurationMinutes = (this.duration.hours || 0) * 60 + (this.duration.minutes || 0);
      const totalDays = totalDurationMinutes / (24 * 60);
      const absenceTotalDays = this.dateService.getDiffDatesOnDays(this.absence.dateDebut, this.absence.dateFin) + 1;
      if (totalDays > absenceTotalDays) {
        this.showDurationErrorMessage = true;
        return;
      }
    }
    this.addOrUpdateAbsenceEvent.emit({
      absence: this.absence,
      mode: this.modeCalc,
      hours: this.duration.hours || 0,
      minutes: this.duration.minutes || 0
    });
  }

  /**
   *  Afficher les valeur du absence conge sélectionné
   * @param: absenceConge
   */
  private showUpdateAbsenceConge(absenceConge): void {
    if (absenceConge.typeEvenement.statut) {
      this.selectedTypeEvenement = absenceConge.typeEvenement;
    } else {
      this.selectedTypeEvenement = null;
    }
    this.absence.dateFin = new Date(this.absence.dateFin);
    this.absence.dateDebut = new Date(this.absence.dateDebut);
  }

  /**
   * Check minutes validity
   * @param: input
   */
  public checkMinutes(input: HTMLInputElement): void {
    if (this.duration.minutes > this.MAX_MINUTES_NUMBER) {
      input.value = this.MAX_MINUTES_NUMBER.toString();
      this.duration.minutes = this.MAX_MINUTES_NUMBER;
    }
    this.checkDurationNullity(input, 'minutes');
  }

  /**
   * Check duration parts nullity
   * @param: input
   * @param: partOfDuration
   */
  public checkDurationNullity(input: HTMLInputElement, partOfDuration: 'minutes' | 'hours'): void {
    this.showDurationErrorMessage = false;
  }

  /**
   * Select manual duration radio button whene modifying hours or minutes
   */
  public selectDurationRadioButton(): void {
    if (this.modeCalc !== DurationModeEnum.MANUAL) {
      this.modeCalc = DurationModeEnum.MANUAL;
    }
  }
}
