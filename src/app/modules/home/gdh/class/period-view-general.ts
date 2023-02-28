import {GDHGeneral} from './GDHGeneral';
import {DateService} from 'src/app/shared/service/date.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SharedEmployeeService} from '../../employes/service/sharedEmployee.service';
import {GuiAvenantPeriodVueInfo, GuiContratPeriodVueInfo, GuiVuePeriodTotalInfoGdh} from 'src/app/shared/model/gui/gdh-period-model';
import {RepasService} from '../service/repas.service';
import {FirstLastNameFilterQueue} from '../service/first-last-name-filter-queue.service';
import {NotificationService} from '../../../../shared/service/notification.service';
import {OverlayPanel} from 'primeng/primeng';
import {GlobalSettingsService} from '../../../../shared/service/global-settings.service';
import {LimitDecoupageFulldayService} from '../../../../shared/service/limit.decoupage.fullday.service';
import {GuiGdh} from '../../../../shared/model/gui/vue-jour.model';
import {BlockGdhService} from '../service/block-gdh.service';

export abstract class PeriodViewGeneral extends GDHGeneral {
  public header: any[];
  public showContratCol = true;
  public showHeuresComplCol = true;
  public showHeuresSupplCol = true;
  public showHeuresNuitCol = true;
  public showHeuresFerieCol = true;
  public showPlusDetails = false;
  public showCoupuresCol = true;
  public showRepasCol = true;
  public showRightPartButton = true;
  public showPart1 = true;
  public showPart2 = true;
  public showPart3 = false;
  public openedFilterPopup = false;
  protected headerFixedPart: any[];
  // header part1 contenant temps contrat, temps planifié et temps pointé
  protected headerPart1: any[];
  // header part 2 contenant temps d'absence, heures comp et heures supp
  protected headerPart2: any[];
  // header part 3 contenant heures de nuit, heures feries, coupures et repas
  protected headerPart3: any[];
  protected headerDays: any[];
  public contratList: GuiContratPeriodVueInfo[];
  public lastOverlayPanel: OverlayPanel;
  public clickedDay: string;
  public frozenLines = [
    {
      title: '',
      tempsContrat: 0,
      tempsPlanifies: 0,
      tempsPointes: 0,
      traits: '',
      moisDetails: '',
      tempsAbsencesSemaine: 0,
      heureCompl: 0,
      heureSupp: 0,
      empty: '',
      heureDeNuit: 0,
      heureJoursFeries: 0,
      coupuresSemaine: 0,
      repasSemaine: ''
    }
  ];
  public total: GuiVuePeriodTotalInfoGdh;
  public menuIsOpen = false;
  public heightInterface: number;
  protected popUpAbsences: Promise<GuiGdh[]>;

  protected constructor(protected rhisTranslateService: RhisTranslateService,
                        protected dateService: DateService,
                        public rhisRouter: RhisRoutingService,
                        protected sharedEmployee: SharedEmployeeService,
                        protected repasService: RepasService,
                        protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
                        protected notificationService: NotificationService,
                        protected globalSettingsService: GlobalSettingsService,
                        protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
                        protected blockGdhService: BlockGdhService
                        ) {
    super(dateService, sharedEmployee, firstLastNameFilterQueue, notificationService, limitDecoupageFulldayService, blockGdhService);
  }

  public showLeftPart(): void {
    this.showPart1 = true;
    this.showPart2 = true;
    this.showPart3 = false;
    this.columnsFn();
  }

  public getScrollHeight(heightInterface: number, header, total, ternaryColShow: [boolean, boolean, boolean], menuIsOpen: boolean): string {
    const soustractHeight = menuIsOpen ? 26 : 0;
    if (total && header) {
      const numberOfZeros = [];
      ['heureSupp', 'heureCompl', 'heureDeNuit'].forEach((field: string, index: number) => {
        if (header.some(col => col['field'] === field) && ternaryColShow[index]) {
          const values: number[] = total[field].map(item => item.value);
          numberOfZeros.push(values.filter(value => value === 0).length);
        }
      });
      if (numberOfZeros.length) {
        if (numberOfZeros.some(value => value === 0)) {
          return `${heightInterface - 33 - soustractHeight}px`;
        } else if (numberOfZeros.some(value => value === 1)) {
          return `${heightInterface - 13 - soustractHeight}px`;
        }
      }
      return `${heightInterface - soustractHeight}px`;
    }
    return `${heightInterface - 8 - soustractHeight}px`;
  }

  protected checkDecoupageHoraire(): Promise<void> {
    return undefined;
  }

  /**
   * If the menu is open, on horizontal scroll should be displayed
   */
  public checkMenuSate() {
    this.menuIsOpen = this.globalSettingsService.menuIsOpen;
    this.globalSettingsService.onToggleMenu().subscribe((menuState: boolean) => this.menuIsOpen = menuState);
  }

  public showRightPart(): void {
    this.showPart1 = false;
    this.showPart2 = true;
    this.showPart3 = true;
    // update header table for period vue
    this.columnsFn();
  }

  /**
   * Afficher les colonnes de la tables selon choix
   */
  protected columnsFn(): void {
    this.header = this.headerFixedPart;
    if (this.showPart1) {
      this.header = this.header.concat(this.headerPart1);
    }
    this.header = this.header.concat({title: 'Moins de détails', field: 'moisDetails'});
    if (this.showPlusDetails) {
      this.header = this.header.concat(this.headerDays);
    }
    if (this.showPart2) {
      this.header = this.header.concat(this.headerPart2);
    }
    if (this.showPart3) {
      this.header = this.header.concat(this.headerPart3);
    }
    this.header.push({title: '', field: 'empty'});
  }

  public closeFilterPopup(): void {
    this.openedFilterPopup = false;
  }

  public closeAbsenceDayPopup(): void {
    if (this.lastOverlayPanel) {
      this.lastOverlayPanel.hide();
    }
  }

  public openAbsenceDayPopup(day: string, absences: GuiGdh[], overlayPanel: OverlayPanel): void {
    overlayPanel.hide();
    this.clickedDay = day;
    this.popUpAbsences = this.getAbsenceOf(absences, day);
    overlayPanel.show(event);
  }

  protected abstract getAbsenceOf(absences: GuiGdh[], day): Promise<GuiGdh[]>;

  public toggleFilterPopup(): void {
    this.openedFilterPopup = !this.openedFilterPopup;
  }

  public toggleColumn(data: any): void {
    this.showCoupuresCol = data.showCoupuresCol;
    this.showRepasCol = data.showRepasCol;
    this.showContratCol = data.showContratCol;
    this.showHeuresComplCol = data.showHeuresComplCol;
    this.showHeuresSupplCol = data.showHeuresSupplCol;
    this.showHeuresNuitCol = data.showHeuresNuitCol;
    this.showHeuresFerieCol = data.showHeuresFerieCol;
    this.checkColumnsExistance();
  }

  public emptyColumns(fieldName: string): boolean {
    return ['tempsPlanifies', 'tempsPointes', 'tempsAbsencesSemaine'].includes(fieldName);
  }

  public isFilteredColumns(fieldName: string): boolean {
    return ['tempsContrat', 'repasSemaine', 'coupuresSemaine', 'heureSupp', 'heureCompl', 'heureDeNuit', 'heureJoursFeries'].includes(fieldName);
  }

  public checkFilteredColumnsExists(fieldName: string): boolean {
    return ((fieldName === 'tempsContrat' && this.showContratCol) || (fieldName === 'repasSemaine' && this.showRepasCol) || (fieldName === 'coupuresSemaine' && this.showCoupuresCol) ||
      (fieldName === 'heureSupp' && this.showHeuresSupplCol) || (fieldName === 'heureCompl' && this.showHeuresComplCol) || (fieldName === 'heureDeNuit' && this.showHeuresNuitCol) || (fieldName === 'heureJoursFeries' && this.showHeuresFerieCol));
  }

  public ternaryValuesField(fieldName: string): boolean {
    return ['heureCompl', 'heureSupp', 'heureDeNuit'].includes(fieldName);
  }

  public TogglePlusDetails(): void {
    this.showPlusDetails = !this.showPlusDetails;
    if (this.showPart1 && this.showPlusDetails) {
      this.showPart2 = false;
    }
    if (this.showPart1 && !this.showPlusDetails) {
      this.showPart2 = true;
    }
    this.checkColumnsExistance();
    this.columnsFn();
  }

  /**
   * Based on column name, we define the action when clicking on it
   * Edit number of repas for a specific employee
   * @param: employeeIndex
   * @param: columnName
   */
  public addAction(employeeIndex: number, columnName: string): void {
    if (columnName === 'repasSemaine') {
      if (!this.isModificationBlocked) {
        this.isRepasOnEditionMode[employeeIndex % this.gdhViewData.size] = true;
      }
      this.checkModificationState();
    }
  }

  /**
   * Composer les 3 parties du header du tableau
   */
  protected headerBuilder(): void {
    this.headerFixedPart = [];
    this.headerPart1 = [
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.TEMPS') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.CONTRAT') + '</b>',
        field: 'tempsContrat'
      },
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.TEMPS') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.PLANIFIE') + '</b>',
        field: 'tempsPlanifies'
      },
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.TEMPS') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.POINTE') + '</b>',
        field: 'tempsPointes'
      },
      {title: '', field: 'traits'}
    ];
    this.headerPart2 = [
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.TEMPS') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.ABSENCE') + '</b>',
        field: 'tempsAbsencesSemaine'
      }, // ok
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.COMPL') + '</b>',
        field: 'heureCompl'
      },
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.SUPP') + '</b>',
        field: 'heureSupp'
      }
    ];

    this.headerPart3 = [
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.NUIT') + '</b>',
        field: 'heureDeNuit'
      },
      {
        title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + '<br/> <b>' + this.rhisTranslateService.translate('GDH.PERIOD_VIEW.FERIE') + '</b>',
        field: 'heureJoursFeries'
      },
      {title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.COUPURES'), field: 'coupuresSemaine'},
      {title: this.rhisTranslateService.translate('GDH.PERIOD_VIEW.REAPS'), field: 'repasSemaine'}
    ];
  }

  protected checkColumnsExistance(): void {
    if (!this.showPlusDetails && (((this.showContratCol || this.showHeuresComplCol || this.showHeuresSupplCol) && !this.showHeuresNuitCol
      && !this.showHeuresFerieCol && !this.showCoupuresCol && !this.showRepasCol) || (!this.showContratCol && !this.showHeuresComplCol
      && !this.showHeuresSupplCol && !this.showHeuresNuitCol
      && !this.showHeuresFerieCol && !this.showCoupuresCol && !this.showRepasCol))) {
      this.showRightPartButton = false;
    } else {
      this.showRightPartButton = true;
    }
  }

  protected formatListContrat(contratList: GuiContratPeriodVueInfo[]): void {
    this.contratList = contratList;
    contratList.forEach((contrat: GuiContratPeriodVueInfo) => {
      contrat.hebdo = this.dateService.formatHours(contrat.hebdo);
      contrat.mens = this.dateService.formatHours(contrat.mens);
      contrat.avenants.forEach((avenant: GuiAvenantPeriodVueInfo) => {
        avenant.hebdo = this.dateService.formatHours(avenant.hebdo);
        avenant.mens = this.dateService.formatHours(avenant.mens);
      });
    });
  }

  protected setPeriodTotalGdhInfos(total: GuiVuePeriodTotalInfoGdh, totalGdhHeader: any): void {
    this.total = total;
    totalGdhHeader.coupuresSemaine = total.coupures;
    totalGdhHeader.tempsPlanifies = total.tempsPlanifies;
    totalGdhHeader.tempsPointes = total.tempsPointes;
    totalGdhHeader.tempsAbsencesSemaine = total.tempsAbsences;
    totalGdhHeader.tempsContrat = total.tempsContrat;
    totalGdhHeader.heureJoursFeries = total.heureJoursFeries;
    totalGdhHeader.heureCompl = total.heureCompl;
    totalGdhHeader.heureSupp = total.heureSupp;
    totalGdhHeader.heureDeNuit = total.heureDeNuit;
  }
}
