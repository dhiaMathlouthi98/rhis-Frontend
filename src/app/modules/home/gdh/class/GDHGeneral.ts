import {PaginationArgs} from '../../../../shared/model/pagination.args';
import {GDHFilter} from '../../../../shared/model/gui/GDH-filter';
import {Input, ViewChild} from '@angular/core';
import {LazyLoadEvent, SortEvent} from 'primeng/api';
import {DateService} from '../../../../shared/service/date.service';
import {Table} from 'primeng/table';
import {SharedEmployeeService} from '../../employes/service/sharedEmployee.service';
import {GuiDay24Coordination, GuiEmployeePayeView, GuiEmployeePeriodView} from 'src/app/shared/model/gui/gdh-period-model';
import {GuiEmployeeGdh} from '../../../../shared/model/gui/vue-jour.model';
import {RepasModel} from '../../../../shared/model/repas.model';
import {EmployeeModel} from '../../../../shared/model/employee.model';
import {Moment} from 'moment';
import {FirstLastNameFilterQueue} from '../service/first-last-name-filter-queue.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NotificationService} from '../../../../shared/service/notification.service';
import {LimitDecoupageFulldayService} from '../../../../shared/service/limit.decoupage.fullday.service';
import {BlockGdhService} from '../service/block-gdh.service';

export abstract class GDHGeneral {
  public rows = 50;
  public first = 0;
  public totalRecords: number;
  public rowsPerPageOptions = [5, 10, 20, 50, 100];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 50};
  public gdhViewData: any;
  public isRepasOnEditionMode: Array<boolean>;
  public selectedEmployeeId: string;
  protected isSearchByFirstLastName = false;
  protected destroy: Subject<void> = new Subject<void>();
  protected filter: GDHFilter = {};
  public modeAffichage;
  public isContinuedDecoupageWithNextDay: boolean;
  public guiDay24Coordination;
  public isModificationBlocked: boolean;
  public warningPopUpLock: boolean;
  public limitBlockDate: string;
  @ViewChild(Table)
  public dataTableComponent: Table;
  @Input() set populationType(population: 'M' | 'E' | '') {
    this.setPopulationFilter(population);
    if (this.filter.date || (this.filter.weekEndDate && this.filter.weekStartDate)) {
      this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
      this.filter.order = this.firstLastNameFilterQueue.order;
      this.resetPaginationAndLoadFirstPage();
      this.getTotalGdh();
    }
  }

  @Input()
  set selectedDate(date: Moment) {
    if (date) {
      this.filter.date = this.dateService.formatDateToScoreDelimiter(date.toDate());
      this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
      this.filter.order = this.firstLastNameFilterQueue.order;
      this.resetPaginationAndLoadFirstPage();
      this.checkDecoupageHoraire();
      this.getTotalGdh();
      this.getDayCoordination(this.filter.date.split('-').reverse().join('-')).then(config24 => this.guiDay24Coordination = config24.guiDay24Coordination );
      this.limitDecoupageFulldayService.verifyIsDecoupage24(date.toDate()).then(is24 => this.isContinuedDecoupageWithNextDay = is24);
    }
  }

  protected constructor( protected dateService: DateService,
                         protected sharedEmployee: SharedEmployeeService,
                         protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
                         protected notificationService: NotificationService,
                         protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
                         protected blockGdhService: BlockGdhService) {
  }

  private resetPaginationAndLoadFirstPage(): void {
    this.resetPaginationParameters();
    this.onLazyLoad({first: this.first, rows: this.rows});
  }

  protected resetPaginationParameters() {
    this.dataTableComponent.reset();
    this.first = 0;
    this.rows = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
  }

  /**
   * Fetch gdh day view data by page
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getDataByPage();
  }

  /**
   * Set population filter among employees, managers or all of them
   */
  private setPopulationFilter(population: 'M' | 'E' | '') {
    this.filter = {...this.filter, onlyEmployees: false, onlyManagers: false};
    switch (population) {
      case '': this.filter.onlyManagers = this.filter.onlyEmployees = true; break;
      case 'E': this.filter.onlyEmployees = true; break;
      case 'M': this.filter.onlyManagers = true; break;
    }
  }
   /**
   * Sort list of day view employees list
   * @param: event: holds the field of comparison and the order
   */
  public customSortByEmpl(event: SortEvent): void {
    this.gdhViewData.employees.sort((firstEmp: any, secondEmp: any) => {
      const value1 = firstEmp[event.field];
      const value2 = secondEmp[event.field];
      let result = null;

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order * result);
    });
  }
   /**
   * Récupérer l'employé selectionné pour la redirection
   */
  public employeeInfo(employe: GuiEmployeePeriodView| GuiEmployeePayeView): void {
    this.selectedEmployeeId = employe.uuid;
    this.sharedEmployee.selectedEmployee = null;
   }

  protected setUpFirstLastNameSearch(): void {
    this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
    this.firstLastNameFilterQueue.searchByFirstLastName().pipe(takeUntil(this.destroy)).subscribe(_ => {
      this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
      this.isSearchByFirstLastName = true;
      this.resetPaginationParameters();
      this.getDataByPage();
    });
  }

  /**
   * permet de trier la liste selon l'ordre 'order' choisi par l'utilisateur
   */
  protected sortByOrder(): void {
    this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
    this.filter.order = this.firstLastNameFilterQueue.order;
    this.firstLastNameFilterQueue.searchSort().pipe(takeUntil(this.destroy)).subscribe(_ => {
      this.filter.firstLastName = this.firstLastNameFilterQueue.firstLastNameFilter;
      this.filter.order = this.firstLastNameFilterQueue.order;
      this.isSearchByFirstLastName = true;
      this.getDataByPage();
    });
  }

  protected isEmptyDataWhenSearchingByFirstLastFirstName(totalElements: number): void {
    if (this.isSearchByFirstLastName && (totalElements === 0)) {
      this.notificationService.showMessageWithToastKey('error', 'GDH.FAILED_SEARCH_FIRST_LAST_NAME', 'globalToast');
    }
    this.isSearchByFirstLastName = false;
  }

  public async saveRepas(employee: GuiEmployeeGdh, nbrRepas: string, employeeIndex: number): Promise<void> {
    if (this.isRepasOnEditionMode[employeeIndex % this.gdhViewData.size] && nbrRepas !== '') {
      const repas: RepasModel = {
        nbrRepas: +nbrRepas,
        employee: {uuid: employee.uuid} as EmployeeModel
      };
      employee.repas = await this.saveRepasAndGetCorrectNumber(repas);
    }
    this.isRepasOnEditionMode[employeeIndex % this.gdhViewData.size] = false;
    this.getTotalRepas();
  }

  protected async getDisplayMode(): Promise<void> {
    if (this.modeAffichage === undefined) {
      this.modeAffichage = await this.limitDecoupageFulldayService.getDisplayMode24H();
    }
  }

  protected async getDayCoordination(dateJournee: string): Promise<{ previousDay: Date, guiDay24Coordination: GuiDay24Coordination }> {
    const currentDate = new Date(dateJournee);
    const previousDay = this.dateService.getDateFromSubstractDateWithNumberOf(currentDate, 1, 'day');
    await this.getDisplayMode();
    const withPreviousDayCoordination = await this.limitDecoupageFulldayService.getEndCurrentDayAndStartNextDay(previousDay);
    const withNextDay24Coordination = await this.limitDecoupageFulldayService.getEndCurrentDayAndStartNextDay(currentDate);
    const is24WithPreviousDay = (withPreviousDayCoordination.endCurrentDay === withPreviousDayCoordination.startNextDay);
    const is24WithNextDay = (withNextDay24Coordination.endCurrentDay === withNextDay24Coordination.startNextDay);
    const guiDay24Coordination = {
      dateJournee,
      withPreviousDayCoordination,
      withNextDay24Coordination,
      is24WithPreviousDay,
      is24WithNextDay
    } as GuiDay24Coordination;
    return {previousDay, guiDay24Coordination};
  }

  protected setGdhModificationState(): void {
    this.isModificationBlocked = this.blockGdhService.isModificationBlocked;
    this.limitBlockDate = this.blockGdhService.limitBlockDate;
    this.blockGdhService.getGdhBlockState().subscribe((gdhModificationState: {isModificationBlocked: boolean, limitBlockDate: string}) => {
      this.isModificationBlocked = gdhModificationState.isModificationBlocked;
      this.limitBlockDate = gdhModificationState.limitBlockDate;
    });
  }

  public checkModificationState(): void {
    this.warningPopUpLock = this.isModificationBlocked;
  }

  protected abstract async saveRepasAndGetCorrectNumber(repas: RepasModel): Promise<number>;

  protected abstract getDataByPage(): void;

  protected abstract checkDecoupageHoraire(): Promise<void>;

  protected abstract getTotalGdh(): void;

  protected abstract getTotalRepas(): void;
}
