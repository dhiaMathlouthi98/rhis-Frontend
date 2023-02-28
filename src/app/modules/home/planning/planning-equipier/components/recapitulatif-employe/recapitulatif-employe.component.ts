import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {Periode} from 'src/app/shared/model/planning-semaine';
import {DateService} from 'src/app/shared/service/date.service';
import * as moment from 'moment';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';

@Component({
  selector: 'rhis-recapitulatif-employe',
  templateUrl: './recapitulatif-employe.component.html',
  styleUrls: ['./recapitulatif-employe.component.scss']
})
export class RecapitulatifEmployeComponent implements OnInit, OnChanges {
  /**
   * employée
   */
  @Input() employee: EmployeeModel;
  /**
   * Récapitulatif de la semaine
   */
  @Input() weekEmployeeSummary: Periode;
  /**
   * Récapitulatif du mois
   */
  @Input() monthEmployeeSummary: Periode;
  @Input() debutPeriode: Date;
  @Input() finPeriode: Date;
  @Input() updatetdDateJournee: any;
  // FIXME TO BE CHANGED TO PARAM VALUE WITH CODENAME = 'PALIER1_SUP'
  public PALIER1_VALUE = 35;
  public menuState = false;
  public recapEmployeeScrollable = false;
  public widthBlockLeftEmployeeMenuOpened: any;

  /**
   *
   * @param dateService
   * @param globalSettings
   */
  constructor(private dateService: DateService,
              private globalSettings: GlobalSettingsService) {
  }

  ngOnInit() {
    this.menuState = this.globalSettings.menuIsOpen;
    this.stateRecapEmployeeWidthMenu(this.menuState);
    this.recapEmployeeScrollable = this.menuState;
    this.globalSettings.onToggleMenu().subscribe(menuState => {
      this.stateRecapEmployeeWidthMenu(menuState);
    });
  }

  /**
   * calculate width of block recap employee
   * @param: menuState
   */
  public stateRecapEmployeeWidthMenu(menuState: boolean) {
    this.menuState = menuState;
    if (!this.menuState) {
      setTimeout(() => {
        this.recapEmployeeScrollable = this.menuState;
        if (this.recapEmployeeScrollable === true) {
          this.widthBlockLeftEmployeeMenuOpened = document.querySelector('.employees-list') as HTMLElement;
          this.widthBlockLeftEmployeeMenuOpened = this.widthBlockLeftEmployeeMenuOpened.offsetWidth + 38;
        }
      }, 500);
    } else {
      this.recapEmployeeScrollable = this.menuState;
      if (this.recapEmployeeScrollable === true) {
        this.widthBlockLeftEmployeeMenuOpened = document.querySelector('.employees-list') as HTMLElement;
        this.widthBlockLeftEmployeeMenuOpened = this.widthBlockLeftEmployeeMenuOpened.offsetWidth + 38;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('weekEmployeeSummary') && changes.weekEmployeeSummary.currentValue &&
      changes.hasOwnProperty('monthEmployeeSummary') && changes.monthEmployeeSummary.currentValue) {
      this.updateEmployeeSummary(0, true);
    }
  }

  /**
   * Mettre à jour le récapitulatif de l'employé
   * @param  diffCols de nombre de colonne d'un shift redimensionné
   */
  public updateEmployeeSummary(diffCols: number, getFirstEmployeeSummary?: boolean) {
    // if (diffCols !== 0) {
    this.weekEmployeeSummary.tempsPlanifie = this.calculatePlannedTime(this.weekEmployeeSummary.tempsPlanifie, diffCols);
    if(getFirstEmployeeSummary || this.updatetdDateJournee && (moment(this.dateService.setTimeNull(this.updatetdDateJournee)).isSameOrAfter(this.dateService.setTimeNull(this.debutPeriode)) && moment(this.dateService.setTimeNull(this.updatetdDateJournee)).isSameOrBefore(this.dateService.setTimeNull(this.finPeriode)))){
      this.monthEmployeeSummary.tempsPlanifie = this.calculatePlannedTime(this.monthEmployeeSummary.tempsPlanifie, diffCols);
      this.monthEmployeeSummary.periodeDivisionTempsPlanifie = this.updatePeriodeDivisionTP(this.monthEmployeeSummary.periodeDivisionTempsPlanifie, diffCols);
      this.monthEmployeeSummary.ratio = this.calculateRatio(this.monthEmployeeSummary);
      this.monthEmployeeSummary.heureSupp = this.calculateSuppHoursMonth(this.monthEmployeeSummary, this.weekEmployeeSummary, (this.PALIER1_VALUE * 60));
      this.monthEmployeeSummary.heureCompl = this.calculateCompHoursMonth(this.monthEmployeeSummary, this.weekEmployeeSummary);
    } 
    this.weekEmployeeSummary.ratio = this.calculateRatio(this.weekEmployeeSummary);
    // 2100 correspond aux 35 heures en minutes (35 * 60)
    this.weekEmployeeSummary.heureSupp = this.calculateSuppHours(this.weekEmployeeSummary, (this.PALIER1_VALUE * 60));
    this.weekEmployeeSummary.heureCompl = this.calculateCompHours(this.weekEmployeeSummary);
    // }
  }

  /**
   * calculer la nouvelle valeur du temps planifié
   * @param time ancienne valeur du temps planifié
   * @param diffCols différence de colonne entre l'ancien shift et le nouveau
   */
  public calculatePlannedTime(time: string, diffCols: number): string {
    let totalMinutes: number;
    if (typeof time === 'string') {
      totalMinutes = this.dateService.timeStringToNumber(time) + (diffCols * 15);
    } else {
      totalMinutes = time;
    }
    return this.dateService.convertNumberToTimeWithPattern(totalMinutes, ':');
  }

  /**
   * Modifier le temps planifié de la semaine selectionnée
   */
  public updatePeriodeDivisionTP(periodeDivisionTempsPlanifieList: number[], diffCols: number): number[] {
    if (periodeDivisionTempsPlanifieList.length) {
      periodeDivisionTempsPlanifieList[periodeDivisionTempsPlanifieList.length - 1] = periodeDivisionTempsPlanifieList[periodeDivisionTempsPlanifieList.length - 1] + (diffCols * 15);
    }
    return periodeDivisionTempsPlanifieList;
  }

  /**
   * Calculer le ratio
   * @param summary récapitulatif d'un employé
   */
  public calculateRatio(summary: Periode) {
    const minutesPlanifie = this.dateService.timeStringToNumber(summary.tempsPlanifie);
    let minutesContrat: number;
    if(typeof summary.tempsContrat === 'number'){
      minutesContrat = summary.tempsContrat * 60;
    } else {
      minutesContrat = this.dateService.timeStringToNumber(summary.tempsContrat);
    }
    return ((minutesPlanifie / minutesContrat) * 100).toFixed(2).toString();
  }

  /**
   * calculer le nombre d'heures supplémentaires
   * @param summary récapitulatif d'un employé
   * @param minutesRef temps limite à partir duquel les heures travaillées sont des heures supplémentaires
   */
  public calculateSuppHours(summary: Periode, minutesRef: number) {
    const tempsContratPalierDiff = this.dateService.timeStringToNumber(summary.tempsContrat) - minutesRef;
    let suppMinutes: any;
    // Si temps contrat >= 35H
    if (tempsContratPalierDiff >= 0) {
      suppMinutes = this.dateService.timeStringToNumber(summary.tempsPlanifie) - this.dateService.timeStringToNumber(summary.tempsContrat);
    } else {
      // Si temps contrat < 35H
      suppMinutes = this.dateService.timeStringToNumber(summary.tempsPlanifie) - minutesRef;
    }
    if (suppMinutes > 0) {
      return this.dateService.convertNumberToTimeWithPattern(suppMinutes, ':');
    } else {
      return '00:00';
    }
  }
 /**
   * calcule le nombre d'heures supplémentaires dans un mois
   */
 public calculateSuppHoursMonth(monthSummary: Periode, weekSummary: any, minutesRef: number): string {
   let cumulHeureSupp = 0;
   monthSummary.periodeDivisionTempsPlanifie.forEach((tp: number) => {
     const tempsContratPalierDiff = this.dateService.timeStringToNumber(weekSummary.tempsContrat) - minutesRef;
     let suppMinutes: any;
     // Si temps contrat >= 35H
     if (tempsContratPalierDiff >= 0) {
       suppMinutes = tp - this.dateService.timeStringToNumber(weekSummary.tempsContrat);
     } else {
       // Si temps contrat < 35H
       suppMinutes = tp - minutesRef;
     }
     if (suppMinutes < 0) {
       suppMinutes = 0;
     }
     cumulHeureSupp += suppMinutes;
   });
   return this.dateService.convertNumberToTimeWithPattern(cumulHeureSupp, ':');
 }
  /**
   * Calculer le nombre d'heures complémentaires
   * @param summary récapitulatif d'un employé
   */
  public calculateCompHours(summary: Periode) {
    let minutesComp: number;
    if (this.dateService.timeStringToNumber(summary.tempsContrat) < (this.PALIER1_VALUE * 60)) {
      if ((this.dateService.timeStringToNumber(summary.tempsPlanifie) > this.dateService.timeStringToNumber(summary.tempsContrat)) && (this.dateService.timeStringToNumber(summary.tempsPlanifie) <= (this.PALIER1_VALUE * 60))) {
        minutesComp = this.dateService.timeStringToNumber(summary.tempsPlanifie) - this.dateService.timeStringToNumber(summary.tempsContrat);
        return this.dateService.convertNumberToTimeWithPattern(minutesComp, ':');
      } else if (this.dateService.timeStringToNumber(summary.tempsPlanifie) > (this.PALIER1_VALUE * 60)) {
        minutesComp = Math.abs((this.PALIER1_VALUE * 60) - this.dateService.timeStringToNumber(summary.tempsContrat));
        return this.dateService.convertNumberToTimeWithPattern(minutesComp, ':');
      } else {
        return '00:00';
      }
    } else {
      return 'Indisponible';
    }
  }

  /**
   * Calculer le nombre d'heures complémentaires par mois
   */
  public calculateCompHoursMonth(monthSummary: Periode, weekSummary: Periode) {
    let cumulHeureComp = 0;
    monthSummary.periodeDivisionTempsPlanifie.forEach((tp: number) => {
      let minutesComp: number;
      if (this.dateService.timeStringToNumber(weekSummary.tempsContrat) < (this.PALIER1_VALUE * 60)) {
        if ((tp > this.dateService.timeStringToNumber(weekSummary.tempsContrat)) && (tp <= (this.PALIER1_VALUE * 60))) {
          minutesComp = tp - this.dateService.timeStringToNumber(weekSummary.tempsContrat);
        } else if (tp > (this.PALIER1_VALUE * 60)) {
          minutesComp = Math.abs((this.PALIER1_VALUE * 60) - this.dateService.timeStringToNumber(weekSummary.tempsContrat));
        } else {
          minutesComp = 0;
        }
        cumulHeureComp += minutesComp;
      }
    });
    return this.dateService.convertNumberToTimeWithPattern(cumulHeureComp, ':');

  }
}
