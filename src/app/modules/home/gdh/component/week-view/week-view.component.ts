import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {GdhService} from '../../service/gdh.service';
import {DatePipe} from '@angular/common';
import {Subscription} from 'rxjs';
import {WeekQueue} from './week.queue';
import {DateService} from 'src/app/shared/service/date.service';
import {
  GuiContratPeriodVueInfo,
  GuiDay24Coordination,
  GuiEmployeePeriodView,
  GuiVueSemaineTotalInfoGdh,
  VuePeriodModel
} from 'src/app/shared/model/gui/gdh-period-model';
import {PeriodViewGeneral} from '../../class/period-view-general';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SharedEmployeeService} from '../../../employes/service/sharedEmployee.service';
import {RepasService} from '../../service/repas.service';
import {RepasModel} from '../../../../../shared/model/repas.model';
import {GuiAbsenceGdh, GuiGdh} from '../../../../../shared/model/gui/vue-jour.model';
import {FirstLastNameFilterQueue} from '../../service/first-last-name-filter-queue.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {OverlayPanel} from 'primeng/primeng';
import {GlobalSettingsService} from '../../../../../shared/service/global-settings.service';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';
import {DecoupageHoraireService} from '../../../planning/configuration/service/decoupage.horaire.service';
import {BlockGdhService} from '../../service/block-gdh.service';


@Component({
  selector: 'rhis-week-view',
  templateUrl: '../period-template/period-view.component.html',
  styleUrls: ['../period-template/period-view.component.scss']

})
export class WeekViewComponent extends PeriodViewGeneral implements OnInit, OnDestroy {

  @Input()
  public isHourlyView: boolean;
  @Output()
  public lunchSortByOrder = new EventEmitter();
  public subscription: Subscription = null;
  public gdhViewData: any = {};
  public viewDay = false;
  public viewPaye = false;
  public periode = 'week';
  private selectedWeekFrom: Date;
  private selectedWeekTo: Date;
  public heightInterface: any;
  private weekCoordinations = [];

  constructor(
    protected rhisTranslateService: RhisTranslateService,
    protected router: Router,
    protected weekQueue: WeekQueue,
    protected datePipe: DatePipe,
    protected dateService: DateService,
    protected gdhPointageService: GdhService,
    public rhisRouter: RhisRoutingService,
    protected sharedEmployee: SharedEmployeeService,
    protected repasService: RepasService,
    protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
    protected notificationService: NotificationService,
    protected globalSettingsService: GlobalSettingsService,
    protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
    protected decoupageHoraireService: DecoupageHoraireService,
    protected blockGdhService: BlockGdhService) {
    super(rhisTranslateService, dateService, rhisRouter, sharedEmployee, repasService,
        firstLastNameFilterQueue, notificationService, globalSettingsService, limitDecoupageFulldayService, blockGdhService);
    this.setUpFirstLastNameSearch();
    this.sortByOrder();
  }

  public async ngOnInit() {
    this.setGdhModificationState();
    this.checkMenuSate();
    this.headerBuilder();
    this.limitDecoupageFulldayService.decoupageHoraireFinEtDebutActivity = {
      debutJournee: await this.decoupageHoraireService.getDebutJourneePhase().toPromise(),
      finJournee: await this.decoupageHoraireService.getFinJourneePhase().toPromise()
    };
    this.subscription = this.weekQueue.getWeekAsObservable().subscribe(async newdata => {
      this.selectedWeekFrom = newdata.selectedWeekFrom;
      this.selectedWeekTo = newdata.selectedWeekTo;
      this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
      this.filter.order = this.firstLastNameFilterQueue.order;
      await this.updateHeaderDays();
      this.getDataByPage();
      this.getTotalGdh();
      this.columnsFn();
    });
  }

  public onPopoverShown(overlayPanel: OverlayPanel): void {
    this.closeAbsenceDayPopup();
    this.lastOverlayPanel = overlayPanel;
  }

  /**
   * Verifier si liste des absences ou pointages vide
   */
  public isEmpty(date: any, list: any[]): boolean {
    return list.filter(item => (item.dateJournee === date && item.totalMinutes !== 0)).length === 0;
  }

  public isEmptyAbsence(date: any, employee: any): boolean {
    const noEmptyAbsencesInThatDay = employee.absences.filter(item => (item.dateJournee === date && item.totalMinutes === 0)).length === 0;
    const noAbsenceInThatDay = employee.pointages.filter(item => (item.dateJournee === date && item.cumulAbsence > 0)).length === 0;
    return noAbsenceInThatDay && noEmptyAbsencesInThatDay;
  }

  private async updateHeaderDays(): Promise<void> {
    // using selectedWeekFrom and selectedWeekTo
    this.headerDays = [];
    const weekdays = this.dateService.getDaysKeysByCode('SHORT_WEEK_DAYS').map((day: string) => {
      return day.charAt(0).toUpperCase() + day.substring(1);
    });
    for (const date = new Date(this.selectedWeekFrom); date <= this.selectedWeekTo; date.setDate(date.getDate() + 1)) {
      const dateInYearMonthDayForm = this.datePipe.transform(date, 'yyyy-MM-dd');
      this.headerDays.push({
        title: weekdays[date.getDay()] + ' ' + this.datePipe.transform(date, 'dd.MM'),
        field: weekdays[date.getDay()],
        date: dateInYearMonthDayForm,
        isDay: true,
        isFirstDay: date.getDate() === this.selectedWeekFrom.getDate(),
        isLastDay: date.getDate() === this.selectedWeekTo.getDate()
      });
      this.weekCoordinations.push(await this.getDayCoordination(dateInYearMonthDayForm));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }

  protected async saveRepasAndGetCorrectNumber(repas: RepasModel): Promise<number> {
    this.formatWeekFilterDates();
    return await this.repasService.setRepasForEmployeeForPeriodBetweenTowDates(repas.nbrRepas, repas.employee.uuid, this.filter.weekStartDate.toString(), this.filter.weekEndDate.toString()).toPromise();
  }

  public async getAbsenceOf(absences: GuiAbsenceGdh[], day: string): Promise<GuiAbsenceGdh[]> {
    if (!absences) {
      return [];
    }
    const {
      previousDay,
      guiDay24Coordination
    } = this.weekCoordinations.find(coordinationDay => coordinationDay.guiDay24Coordination.dateJournee === day);
    return absences.filter((absence: GuiAbsenceGdh) =>
      this.isAbsenceIncludedInDay(absence, previousDay, guiDay24Coordination));
  }

  private isAbsenceIncludedInDay(absence: GuiGdh, previousDay: Date, guiDay24Coordination: GuiDay24Coordination): boolean {
    const absenceEndHour = this.dateService.getDateFromDateIntervalFor(absence, 'heureFin');
    const absenceDay = new Date(absence.dateJournee);
    if (absence.dateJournee === guiDay24Coordination.dateJournee) {
      return true;
    } else if (this.dateService.isSameDateOn(previousDay, absenceDay, 'day') && (this.modeAffichage === 2) &&
        guiDay24Coordination.is24WithPreviousDay && this.dateService.isAfter(absenceEndHour, guiDay24Coordination.withPreviousDayCoordination.endCurrentDayAsDate)) {
      return true;
    }
    return false;
  }

  public popoverShown(employe: GuiEmployeePeriodView): void {
    this.gdhPointageService.getContratInfoViewWeek(employe.uuid, this.filter)
      .subscribe((resultat: GuiContratPeriodVueInfo[]) => {
        this.formatListContrat(resultat);
      }, err => {
        console.log(err);
      });
  }

  // custom sort for employee column

  /**
   * Récupère la liste des employés par page
   */
  protected getDataByPage(): void {
    this.formatWeekFilterDates();
    this.gdhPointageService.getPageViewWeek(this.filter, this.paginationArgs).subscribe((resultat: VuePeriodModel) => {
      this.isEmptyDataWhenSearchingByFirstLastFirstName(resultat.totalElements);
      this.calculCumulPointageAbsence(resultat.employees);
      this.gdhViewData = resultat;
      this.totalRecords = resultat.totalElements;
      this.isRepasOnEditionMode = new Array<boolean>(this.gdhViewData.pageSize);
      this.isRepasOnEditionMode.fill(false);
    }, err => {
      console.log(err);
    });
  }

  private formatWeekFilterDates(): void {
    this.filter.weekEndDate = this.dateService.formatDateToScoreDelimiter(this.selectedWeekTo);
    this.filter.weekStartDate = this.dateService.formatDateToScoreDelimiter(this.selectedWeekFrom);
  }

  private sortAbsence(listAbsences: any[]): void {
    listAbsences.sort((absence1: any, absence2: any) => {
      if (absence1.totalMinutes < absence2.totalMinutes) {
        return 1;
      } else if (absence1.totalMinutes > absence2.totalMinutes) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Calculer cumul du temps pointé et temps d'absence pour chaque journée
   */
  private async calculCumulPointageAbsence(listEmploye: any[]): Promise<void> {
    for (const employe of listEmploye) {
      this.sortAbsence(employe.absences);
      if (employe.absences.length) {
        employe.codeGdh = [...employe.absences].sort((absence1: any, absence2: any) => {
          if (this.dateService.isSameOrBeforeByDayTimeAndIsNight(absence1, absence2)) {
            return -1;
          } else {
            return 1;
          }
        }).shift().typeEvenement.codeGdh;
      }
      for (const pointage of employe.pointages) {
        const sum = await this.calculateCumulAbsence(pointage.dateJournee, employe);
        pointage.cumulAbsence = sum;
        pointage.cumulPointageAbsence = sum + pointage.totalMinutes;
      }
    }
  }

  private async calculateCumulAbsence(dateJournee: string, employe) {
    let sum = 0;
    const {
      previousDay,
      guiDay24Coordination
    } = this.weekCoordinations.find(coordinationDay => coordinationDay.guiDay24Coordination.dateJournee === dateJournee);
    employe.absences.forEach((absence: any) => {
      absence.jour = this.dateService.getJourSemaineFromInteger(new Date(absence.dateJournee).getDay()).slice(0, 3) + '. ' + this.datePipe.transform(new Date(absence.dateJournee), 'dd/MM/yy');
      sum += this.calculateTotalAbsence(absence, previousDay, guiDay24Coordination);
    });
    return sum;
  }

  private calculateTotalAbsence(absence: GuiGdh, previousDay: Date, guiDay24Coordination: GuiDay24Coordination): number {
    let sum = 0;
    const absenceEndHour = this.dateService.getDateFromDateIntervalFor(absence, 'heureFin');
    const absenceStartHour = this.dateService.getDateFromDateIntervalFor(absence, 'heureDebut');
    const absenceDay = new Date(absence.dateJournee);
    if (absence.dateJournee === guiDay24Coordination.dateJournee) {
      if (guiDay24Coordination.is24WithNextDay && (this.modeAffichage === 2) &&
          this.dateService.isAfter(absenceEndHour, guiDay24Coordination.withNextDay24Coordination.endCurrentDayAsDate)) {
        sum = this.dateService.getDiffOn(guiDay24Coordination.withNextDay24Coordination.endCurrentDayAsDate, absenceStartHour);
      } else {
        sum = absence.totalMinutes;
      }
    } else if (this.dateService.isSameDateOn(previousDay, absenceDay, 'day') &&
        guiDay24Coordination.is24WithPreviousDay && (this.modeAffichage === 2) &&
        this.dateService.isAfter(absenceEndHour, guiDay24Coordination.withPreviousDayCoordination.endCurrentDayAsDate)) {
      sum = this.dateService.getDiffOn(absenceEndHour, guiDay24Coordination.withPreviousDayCoordination.startNextDayAsDate);
    }
    return sum;
  }

  private sortEmployeeByName(): void {
    if (this.gdhViewData.employees) {
      this.gdhViewData.employees.sort((a: GuiEmployeePeriodView, b: GuiEmployeePeriodView) => {
        if (a.nom > b.nom) {
          return 1;
        } else if (a.nom < b.nom) {
          return -1;
        } else {
          if (a.prenom > b.prenom) {
            return 1;
          } else if (a.prenom < b.prenom) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    }
  }

  protected getTotalGdh(): void {
    this.total = null;
    this.gdhPointageService.getTotalGdhWeekView(this.filter).subscribe((total: GuiVueSemaineTotalInfoGdh) => {
      const totalGdhHeader = this.frozenLines.pop();
      totalGdhHeader.title = this.rhisTranslateService.translate('PLANNING_MANAGER.SEMAINE_LABEL') + ' ' + total.weekNbr;
      this.setPeriodTotalGdhInfos(total, totalGdhHeader);
      this.frozenLines.push(totalGdhHeader);
    });
  }

  protected getTotalRepas(): void {
    this.gdhPointageService.getTotalRepasForPeriod(this.filter).subscribe((repas: number) => this.total.repas = repas);
  }

  public sortList(): void {
    this.lunchSortByOrder.emit();
  }
}

