import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {GdhService} from '../../service/gdh.service';
import {DateService} from 'src/app/shared/service/date.service';
import {
  GuiContratPeriodVueInfo,
  GuiEmployeePayeView,
  GuiEmployeePeriodView,
  GuiItemGdh,
  GuiPointagePaye,
  GuiVuePayeTotalInfoGui,
  VuePayeModel
} from 'src/app/shared/model/gui/gdh-period-model';
import {PeriodViewGeneral} from '../../class/period-view-general';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SharedEmployeeService} from '../../../employes/service/sharedEmployee.service';
import {RepasService} from '../../service/repas.service';
import {RepasModel} from '../../../../../shared/model/repas.model';
import {Moment} from 'moment';
import {FirstLastNameFilterQueue} from '../../service/first-last-name-filter-queue.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {GlobalSettingsService} from '../../../../../shared/service/global-settings.service';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';
import {GuiAbsenceGdh, GuiGdh} from '../../../../../shared/model/gui/vue-jour.model';
import {BlockGdhService} from '../../service/block-gdh.service';

@Component({
  selector: 'rhis-paye-view',
  templateUrl: '../period-template/period-view.component.html',
  styleUrls: ['../period-template/period-view.component.scss']

})
export class PayeViewComponent extends PeriodViewGeneral implements OnInit, OnDestroy {
  @Input() selectedDate: Moment;
  @Input() isHourlyView: boolean;
  @Output()
  public lunchSortByOrder = new EventEmitter();
  public gdhViewData: VuePayeModel = {};
  public viewPaye = true;
  public viewDay = false;
  public periode = 'paye';

  constructor(protected rhisTranslateService: RhisTranslateService,
              private gdhPointageService: GdhService,
              protected dateService: DateService, public rhisRouter: RhisRoutingService,
              protected sharedEmployee: SharedEmployeeService,
              protected repasService: RepasService,
              protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
              protected notificationService: NotificationService,
              protected globalSettingsService: GlobalSettingsService,
              protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
              protected blockGdhService: BlockGdhService
  ) {
    super(rhisTranslateService, dateService, rhisRouter, sharedEmployee, repasService,
        firstLastNameFilterQueue, notificationService, globalSettingsService, limitDecoupageFulldayService, blockGdhService);
    this.setUpFirstLastNameSearch();
    this.sortByOrder();
  }

  ngOnInit() {
    this.setGdhModificationState();
    this.checkMenuSate();
    this.headerBuilder();
    this.columnsFn();
    this.filter.order = this.firstLastNameFilterQueue.order;
  }

  protected async saveRepasAndGetCorrectNumber(repas: RepasModel): Promise<number> {
    return await this.repasService.setPayVueRepasForEmployeeByDate(repas.nbrRepas, repas.employee.uuid, this.filter).toPromise();
  }

  /**
   * Verifier si liste des absences ou pointages vide
   */
  public isEmpty(date: number, list: GuiItemGdh<number, number>[] | GuiPointagePaye[]): boolean {
    return list.filter((item: GuiItemGdh<number, number> | GuiPointagePaye) => (item.name === date && item.value !== 0)).length === 0;
  }

  public isEmptyAbsence(date: any, employee: GuiEmployeePayeView): boolean {
    return employee.absences.filter((item: GuiItemGdh<number, number> | GuiPointagePaye) => (item.name === date && item.value >= 0 && !item.state)).length === 0;
  }

  public popoverShown(employe: GuiEmployeePeriodView): void {
    this.gdhPointageService.getContratInfoViewPaye(employe.uuid, this.filter)
      .subscribe((resultat: GuiContratPeriodVueInfo[]) => {
        this.formatListContrat(resultat);
      }, err => {
        console.log(err);
      });
  }

  /**
   * Récupère la liste des employés par page
   */
  protected getDataByPage(): void {
    this.gdhPointageService.getPageViewPaye(this.filter, this.paginationArgs).subscribe((resultat: VuePayeModel) => {
      this.isEmptyDataWhenSearchingByFirstLastFirstName(resultat.totalElements);
      this.calculCumulPointageAbsence(resultat.employees);
      this.gdhViewData = resultat;
      if (this.gdhViewData.employees.length) {
        this.updateHeaderPeriods();
      }
      this.totalRecords = resultat.totalElements;
      this.isRepasOnEditionMode = new Array<boolean>(this.gdhViewData.pageSize);
      this.isRepasOnEditionMode.fill(false);
    }, err => {
      console.log(err);
    });
  }

  private updateHeaderPeriods(): void {
    this.headerDays = [];
    const periodList = this.gdhViewData.employees[0].absences;
    periodList.forEach((element: GuiItemGdh<number, number>, index: number) => {
      this.headerDays.push({
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.SEMAINE') + ' ' + element.name,
        field: element.name,
        date: element.name,
        isDay: true,
        isFirstDay: index === 0,
        isLastDay: index === (periodList.length - 1)
      });
    });
    this.columnsFn();
  }

  /**
   * Calculer cumul du temps pointé et temps d'absence pour chaque journée
   */
  private calculCumulPointageAbsence(listEmploye: GuiEmployeePayeView[]): void {
    listEmploye.forEach((employe: GuiEmployeePayeView) => {
      employe.pointages.forEach((pointage: GuiPointagePaye) => {
        let sum = 0;
        employe.absences.forEach((absence: GuiItemGdh<number, number>) => {
          if (absence.name === pointage.name) {
            sum += absence.value;
          }
        });
        pointage.cumulAbsence = sum;
        pointage.cumulPointageAbsence = sum + pointage.value;
      });
    });
  }

  private sortEmployeeByName(): void {
    if (this.gdhViewData.employees) {
      this.gdhViewData.employees.sort((a: GuiEmployeePayeView, b: GuiEmployeePayeView) => {
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
    this.gdhPointageService.getTotalGdhPayView(this.filter).subscribe((total: GuiVuePayeTotalInfoGui) => {
      const totalGdhHeader = this.frozenLines.pop();
      const date = new Date();
      date.setMonth(total.monthNbr - 1);
      totalGdhHeader.title = this.rhisTranslateService.translate('GDH.PERIOD_VIEW.PERIODE_OF') + ' ' + this.dateService.getFormattedDate(date, 'MMMM', this.rhisTranslateService.currentLang);
      this.setPeriodTotalGdhInfos(total, totalGdhHeader);
      this.frozenLines.push(totalGdhHeader);
    });
  }

  protected getTotalRepas(): void {
    this.gdhPointageService.getTotalRepasPayView(this.filter).subscribe((repas: number) => this.total.repas = repas);
  }

  public async getAbsenceOf(absences: GuiAbsenceGdh[], day: string): Promise<GuiGdh[]> {
    return null;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  public sortList(): void {
    this.lunchSortByOrder.emit();
  }
}
