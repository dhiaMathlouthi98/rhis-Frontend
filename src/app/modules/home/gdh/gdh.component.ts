import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {WeekQueue} from './component/week-view/week.queue';
import {DateService} from '../../../shared/service/date.service';
import {DateTimeAdapter} from 'ng-pick-datetime';
import {RhisTranslateService} from '../../../shared/service/rhis-translate.service';
import {SharedRestaurantService} from '../../../shared/service/shared.restaurant.service';
import * as FileSaver from 'file-saver';
import {GenerateFilesService} from '../../../shared/service/generate.files.service';
import {GDHFilter} from '../../../shared/model/gui/GDH-filter';
import {NotificationService} from '../../../shared/service/notification.service';
import {GdhService} from './service/gdh.service';
import * as moment from 'moment';
import {DomControlService} from '../../../shared/service/dom-control.service';
import {ConfirmationService, TabPanel} from 'primeng/primeng';
import {OngletVariablePaieComponent} from './component/onglet-variable-paie/onglet-variable-paie.component';
import {Observable, Subject} from 'rxjs';
import {PayFileStructureComponent} from './component/pay-file-structure/pay-file-structure.component';
import {GuiEmployeeGdh} from 'src/app/shared/model/gui/vue-jour.model';
import {EmployeeService} from '../employes/service/employee.service';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FirstLastNameFilterQueue} from './service/first-last-name-filter-queue.service';
import {GlobalSettingsService} from '../../../shared/service/global-settings.service';
import {ParametreGlobalService} from '../configuration/service/param.global.service';
import {ParametreModel} from '../../../shared/model/parametre.model';
import {BlockGdhService} from './service/block-gdh.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {EmployeDeltaNegatifDto, GdhVuePayeRapportDeltaNegatif} from '../../../shared/model/gui/GdhVuePayeRapportDeltaNegatif.model';
import {ValidationPaieService} from './service/validation-paie.service';
import {ValidationPeriodPaie} from 'src/app/shared/model/validationPeriodePaie';
import {SessionService} from 'src/app/shared/service/session.service';
import {EnvoiService} from '../../parc/services/envoi.service';
import {RapportPaieEnum} from '../../../shared/model/parametreRapport';
import * as JSZip from 'jszip';

@Component({
  selector: 'rhis-gdh',
  templateUrl: './gdh.component.html',
  styleUrls: ['./gdh.component.scss'],
  providers: [DatePipe]
})
export class GdhComponent implements OnInit {

  @ViewChild('dateCal')
  public dateCal: ElementRef;

  @ViewChild('dateCalWeek')
  public dateCalWeek: ElementRef;

  public isPlanningView: boolean;
  public isHourlyView = true;
  protected filter: GDHFilter = {};
  protected validationFilter: GDHFilter = {};
  public typeView = 'day';
  public populationType = '';
  public selectedDate: moment.Moment;
  public selectedPeriodFrom: Date;
  public selectedPeriodTo: Date;
  public selectedPeriod: string;

  public openedCommentaireopup = false;
  public firstDayOfWeek: number;
  public isPopUpImportFormatShown = false;
  public currentLangue: string;
  public ecran = 'GDH';
  public openPaiePopup = false;
  public openValidationPaiePopup = false;
  public openPrintPopup = false;
  public selectedTab = 0;
  @ViewChild('variableTab') variableTab: TabPanel;
  @ViewChild('structureTab') structureTab: TabPanel;
  @ViewChild('validationTab') validationTab: TabPanel;
  @ViewChild(OngletVariablePaieComponent) ongletVariablePaie;
  @ViewChild(PayFileStructureComponent) payFileStructureComponent;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public maxDateValue: Date;
  public employees: GuiEmployeeGdh[];
  public popUpStyle = {
    height: 700
  };
  public showVoucherPdf = false;
  public bonInfo: any;
  public voucherForm = new FormGroup(
    {
      dateJournee: new FormControl('', Validators.required),
      heureDebut: new FormControl('', Validators.required),
      heureFin: new FormControl('', Validators.required),
      typeAbsence: new FormControl(false, Validators.required),
      employee: new FormControl('', Validators.required)
    }
  );
  public isSubmitted = false;
  public errorHourMessage = '';
  public menuIsOpen: boolean;
  private readonly BLOCK_GDH_PARAM_CODE = 'GDH_BLOCK';
  public blockGdhParam: ParametreModel;
  public padLockHoverMessage: string;
  public ghdViewBlockState: { isModificationBlocked: boolean, isDateIntervalTotallyBlocked: boolean };
  public blockGdhParamDefault: any;
  public systemParam: any;
  private readonly BLOCK_GDH_PARAM_DEFAULT_CODE = 'GESTIONDEFAUT';
  private readonly NOMEDITEUR_CODE = 'NOMEDITEUR';
  private ecranSFP = 'SFP';
  private ecranVAP = 'VAP';
  private ecranVPP = 'VPP';
  public showPopupDeltaNegatif = false;
  public employeList: EmployeDeltaNegatifDto[];
  public fileList: string[];
  public employeDelteNegatifNumber: number;
  public downloadFiles = false;
  public validationPaiepopUpStyle = {width: 500, height: 500};
  public filesSelected = true;
  public paramEnvoiUuid: any;
  public chosenReports: {
    name: string,
    code: RapportPaieEnum
    disabled: boolean,
    value: boolean
  }[] = [];
  constructor(private datePipe: DatePipe,
              private dateService: DateService,
              private weekQueue: WeekQueue,
              private dateTimeAdapter: DateTimeAdapter<any>,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private generateFilesService: GenerateFilesService,
              private gdhService: GdhService,
              private sharedRestaurantService: SharedRestaurantService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService,
              private employeService: EmployeeService,
              private firstLastNameFilterQueue: FirstLastNameFilterQueue,
              private globalSettingsService: GlobalSettingsService,
              private parametreGlobalService: ParametreGlobalService,
              private blockGdhService: BlockGdhService,
              private validationPayService: ValidationPaieService,
              private sessionService: SessionService,
              private envoiParamService: EnvoiService) {
    this.currentLangue = this.rhisTranslateService.currentLang;
    dateTimeAdapter.setLocale(this.currentLangue);
    this.firstLastNameFilterQueue.firstLastNameFilter = '';
    this.firstLastNameFilterQueue.order = false;
  }

  public addControlButton(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public showOngletVAP(): boolean {
    return this.domControlService.showControl(this.ecranVAP);
  }

  public showOngletSFP(): boolean {
    return this.domControlService.showControl(this.ecranSFP);
  }

  public showOngletVPP(): boolean {
    return this.domControlService.showControl(this.ecranVPP);
  }

  async ngOnInit() {
    this.maxDateValue = new Date();
    this.firstDayOfWeek = await this.sharedRestaurantService.getWeekFirstDayRank();
    this.blockGdhParam = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.BLOCK_GDH_PARAM_CODE).toPromise();
    this.blockGdhParamDefault = (await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.BLOCK_GDH_PARAM_DEFAULT_CODE).toPromise()).valeur;
    this.getSystemParam();
    this.setDefaultDateForDayView();
    this.isPlanningView = false;
    this.checkMenuSate();
  }

  public async getSystemParam() {
    this.systemParam = (await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.NOMEDITEUR_CODE).toPromise()).valeur;
  }

  private checkMenuSate(): void {
    this.menuIsOpen = this.globalSettingsService.menuIsOpen;
    this.globalSettingsService.onToggleMenu().subscribe(async (menuState: boolean) => {
      await this.dateService.delay(180);
      this.menuIsOpen = menuState;
    });
  }

  private setDefaultDateForDayView(): void {
    if (!this.selectedDate) {
      this.selectedDate = moment(this.dateService.setCorrectDate(new Date()));
      this.selectedDate = moment(this.selectedDate).subtract(1, 'days');
      this.maxDateValue = this.selectedDate.toDate();
      this.ghdViewBlockState = this.blockGdhService.getDayViewBlockState(this.selectedDate.toDate(), this.blockGdhParam.valeur);
    }
  }

  private updateDateWeek(): void {
    let diff = this.selectedDate.toDate().getDay() - this.firstDayOfWeek;
    if (diff < 0) {
      diff = diff + 7;
    }
    this.selectedPeriodFrom = this.dateService.getDateFromSubstractDateWithNumberOf(this.selectedDate.toDate(), diff, 'days');
    this.selectedPeriodTo = this.dateService.getDateFromAddNumberOfToDate(6 - diff, 'days', this.selectedDate.toDate());

    this.selectedPeriod = this.datePipe.transform(this.selectedPeriodFrom, 'dd/MM/yy') + ' - ' + this.datePipe.transform(this.selectedPeriodTo, 'dd/MM/yy');

    this.weekQueue.nextWeekQueue({selectedWeekFrom: this.selectedPeriodFrom, selectedWeekTo: this.selectedPeriodTo});
    this.ghdViewBlockState = this.blockGdhService.getPeriodBlockState(this.selectedPeriodFrom, this.selectedPeriodTo, this.blockGdhParam.valeur);
  }

  public onSelectIsPlanning(bool: boolean): void {
    this.isPlanningView = bool;
  }

  public onSelectHourView(bool: boolean): void {
    this.isHourlyView = bool;
  }

  public onSelectType(type: string): void {
    this.setDefaultDateForDayView();
    this.typeView = type;
    if (type === 'week') {
      this.updateDateWeek();
    } else if (type === 'paye') {
      this.updateDatePaye();
    }
    if (type !== 'day') {
      this.closeCommentairePopup();
    } else {
      this.ghdViewBlockState = this.blockGdhService.getDayViewBlockState(this.selectedDate.toDate(), this.blockGdhParam.valeur);
    }
  }

  private async updateDatePaye(): Promise<void> {
    const date = this.dateService.formatDateToScoreDelimiter(this.selectedDate.toDate());
    [this.selectedPeriodFrom, this.selectedPeriodTo] = await this.gdhService.getPeriodLimits(date).toPromise();
    this.selectedPeriod = this.datePipe.transform(this.selectedPeriodFrom, 'dd/MM/yy') + ' - ' + this.datePipe.transform(this.selectedPeriodTo, 'dd/MM/yy');
    this.ghdViewBlockState = this.blockGdhService.getPeriodBlockState(this.selectedPeriodFrom, this.selectedPeriodTo, this.blockGdhParam.valeur);
  }

  public setPopulationType(type: string): void {
    this.populationType = type;
  }

  public toggleCommentairePopup(): void {
    this.openedCommentaireopup = !this.openedCommentaireopup;
  }

  public closeCommentairePopup(): void {
    this.openedCommentaireopup = false;
  }

  public onSelectDate(event): void {
    this.ghdViewBlockState = this.blockGdhService.getDayViewBlockState(this.selectedDate.toDate(), this.blockGdhParam.valeur);
    this.selectedDate = event.value;
  }

  public onSelectWeek(event): void {
    this.selectedDate = event.value;
    if (this.typeView === 'week') {
      this.updateDateWeek();
    } else if (this.typeView === 'paye') {
      this.updateDatePaye();
    }
  }

  public nextDay(): void {
    const date = new Date(this.selectedDate.toDate());
    date.setDate(date.getDate() + 1);
    this.selectedDate = moment(date);
    this.ghdViewBlockState = this.blockGdhService.getDayViewBlockState(this.selectedDate.toDate(), this.blockGdhParam.valeur);
  }

  public prevDay(): void {
    const date = new Date(this.selectedDate.toDate());
    date.setDate(date.getDate() - 1);
    this.selectedDate = moment(date);
    this.ghdViewBlockState = this.blockGdhService.getDayViewBlockState(this.selectedDate.toDate(), this.blockGdhParam.valeur);
  }

  public prevPeriod(): void {
    if (this.typeView === 'week') {
      this.prevWeek();
    } else if (this.typeView === 'paye') {
      this.prevPayePeriod();
    }
  }

  private prevWeek(): void {
    const date = new Date(this.selectedDate.toDate());
    date.setDate(date.getDate() - 7);
    this.selectedDate = moment(date);
    this.updateDateWeek();
  }

  public nextPeriod(): void {
    if (this.typeView === 'week') {
      this.nextWeek();
    } else if (this.typeView === 'paye') {
      this.nextPayePeriod();
    }
  }

  private nextWeek(): void {
    const date = new Date(this.selectedDate.toDate());
    date.setDate(date.getDate() + 7);
    this.selectedDate = moment(date);
    this.updateDateWeek();
  }

  private nextPayePeriod(): void {
    const date = new Date(this.selectedPeriodTo);
    date.setDate(date.getDate() + 1);
    this.selectedDate = moment(date);
    this.updateDatePaye();
  }

  private prevPayePeriod(): void {
    const date = new Date(this.selectedPeriodFrom);
    date.setDate(date.getDate() - 1);
    this.selectedDate = moment(date);
    this.updateDatePaye();
  }

  public runDate(): void {
    const el: HTMLElement = this.dateCal.nativeElement;
    el.click();
  }

  public runDateWeek(): void {
    const el: HTMLElement = this.dateCalWeek.nativeElement;
    el.click();
  }

  /********************************* Export **********************************/

  public generateExcelOrCSVFile(): void {
    this.getSystemParam();
    switch (this.typeView) {
      case 'day':
        this.exportCSV();
        break;
      case 'paye':
        this.isPopUpImportFormatShown = true;
        break;
      case 'week':
        this.getWeekData();
        break;
    }
  }

  public async generatePayeFile(showSuccesMsg = true): Promise<void> {
    await this.getFileByName(this.fileList[0]);
    this.isPopUpImportFormatShown = false;
    if (this.fileList[1] !== this.fileList[0]) {
      await this.getFileByName(this.fileList[1]);
      this.isPopUpImportFormatShown = false;
      if(showSuccesMsg){
        this.notificationService.showSuccessMessage('GDH.SUCCESS_CREATE_FILE');
      }
    }
  }

  public verifyDelta(): void {
    this.gdhService.createPayeViewPayeFileAndGetName(this.filter).subscribe(async (gdhVuePayeRapportDeltaNegatif: GdhVuePayeRapportDeltaNegatif) => {
      this.fileList = await await gdhVuePayeRapportDeltaNegatif.listeFileName;
      if (gdhVuePayeRapportDeltaNegatif.listEmploye.length > 0) {
        this.showPopupDeltaNegatif = true;
        this.employeDelteNegatifNumber = await gdhVuePayeRapportDeltaNegatif.listEmploye.length;
        this.employeList = await gdhVuePayeRapportDeltaNegatif.listEmploye;
      } else {
        this.generatePayeFile();
      }
    });
  }

  public async checkDelta(): Promise<void> {
    this.setFiltersAndSelectedDate();
    const gdhVuePayeRapportDeltaNegatif: GdhVuePayeRapportDeltaNegatif = await this.gdhService.checkDeltaNegatif(this.filter).toPromise();
    if (gdhVuePayeRapportDeltaNegatif.listEmploye.length > 0) {
      this.showPopupDeltaNegatif = true;
      this.employeDelteNegatifNumber = gdhVuePayeRapportDeltaNegatif.listEmploye.length;
      this.employeList = gdhVuePayeRapportDeltaNegatif.listEmploye;
    }
  }


  private getWeekData(): void {
    this.setFiltersAndSelectedDate();
    this.filter.weekStartDate = this.dateService.formatDateToScoreDelimiter(this.selectedPeriodFrom);
    this.filter.weekEndDate = this.dateService.formatDateToScoreDelimiter(this.selectedPeriodTo);
    this.generateFilesService.getCSVVueSemaine(this.currentLangue, this.isHourlyView, this.filter).subscribe(
      async (fileName: any) => {
        await this.getFileByName(fileName);
      }, (err: any) => {
        console.log(err);
      }, () => this.notificationService.showSuccessMessage('GDH.SUCCESS_CREATE_FILE')
    );
  }

  public exportCSV(): void {
    this.setFiltersAndSelectedDate();
    if (this.typeView === 'day') {
      this.generateCSVDayViewReport();
    } else {
      this.generateCSVPayeViewReport();
    }

  }

  public exportPaye(): void {
    this.setFiltersAndSelectedDate();
    this.verifyDelta();
  }

  public exportExcel(): void {
    this.setFiltersAndSelectedDate();
    this.generateExcelPayViewReport();
  }

  private generateCSVDayViewReport(): void {
    this.generateFilesService.getCSVVueJour(this.currentLangue, this.filter, this.isHourlyView).subscribe(
      async (fileName: string) => {
        await this.getFileByName(fileName);
        this.notificationService.showSuccessMessage('GDH.SUCCESS_CREATE_FILE');
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  private async getFileByName(fileName: string): Promise<void> {
    const fileContent: Blob = await this.generateFilesService.getFileByFileNameFromGDHService(fileName).toPromise();
    FileSaver.saveAs(fileContent, fileName);
  }

  private generateExcelPayViewReport(): void {
    this.gdhService.createPayeViewExcelFileAndGetName(this.currentLangue, this.filter).subscribe(async (fileName: string) => {
      await this.getFileByName(fileName);
      this.isPopUpImportFormatShown = false;
      this.notificationService.showSuccessMessage('GDH.SUCCESS_CREATE_FILE');
    });
  }

  private async generateVuePayeExcelAndCsv(): Promise<string[]> {
    const fileNames: string[] = [] ;
    this.validationFilter.onlyEmployees = true;
    this.validationFilter.onlyManagers = true;
    this.validationFilter.date =  this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');

    fileNames.push((await this.generateFilesService.getCSVVuePaye(this.currentLangue, this.isHourlyView, this.validationFilter).toPromise()).toString());
    fileNames.push((await this.gdhService.createPayeViewExcelFileAndGetName(this.currentLangue, this.validationFilter).toPromise()).toString());
     return fileNames;
  }

  private generateCSVPayeViewReport(): void {
    this.generateFilesService.getCSVVuePaye(this.currentLangue, this.isHourlyView, this.filter).subscribe(
      async (fileName: any) => {
        await this.getFileByName(fileName);
        this.isPopUpImportFormatShown = false;
      }, (err: any) => {
        console.log(err);
      }, () => this.notificationService.showSuccessMessage('GDH.SUCCESS_CREATE_FILE')
    );
  }


  private setFiltersAndSelectedDate(): void {
    this.filter.date = this.dateService.formatDateToScoreDelimiter(this.selectedDate.toDate());
    this.filter = {...this.filter, onlyEmployees: false, onlyManagers: false};
    switch (this.populationType) {
      case '':
        this.filter.onlyManagers = this.filter.onlyEmployees = true;
        break;
      case 'E':
        this.filter.onlyEmployees = true;
        break;
      case 'M':
        this.filter.onlyManagers = true;
        break;
    }
  }

  public displayPaiePopup(): void {
    if (this.showOngletVPP()) {
      this.selectedTab = 0;
    } else if (this.showOngletVAP()) {
      this.selectedTab = 1;
    } else {
      this.selectedTab = 2;
    }
    this.getActiveTab(this.selectedTab);

    this.openPaiePopup = true;
  }

  public displayPrintPopup(): void {
    this.errorHourMessage = '';
    this.openPrintPopup = true;
    this.voucherForm.reset();
    this.voucherForm.controls['typeAbsence'].setValue(false);
    this.isSubmitted = false;
  }

  public saveBeforeChangePanel(event: any): void {
    if (event.index !== this.selectedTab && this.selectedTab === 1) {
      // check changes for variables tab
      if (this.ongletVariablePaie && (!this.ongletVariablePaie.isSameList())) {
        this.variableTab.selected = true;
        this.structureTab.selected = false;
        this.validationTab.selected = false;
        this.saveContentBeforeDeactivation(event.index, true, false);
      } else {
        this.selectedTab = event.index;
      }
    } else if (event.index !== this.selectedTab && this.selectedTab === 2) {
      if (this.payFileStructureComponent && (!this.payFileStructureComponent.isSameList())) {
        this.structureTab.selected = true;
        this.variableTab.selected = false;
        this.validationTab.selected = false;
        this.saveContentBeforeDeactivation(event.index, true, false);
      } else {
        this.selectedTab = event.index;
      }
    } else {
      this.selectedTab = event.index;
      this.getActiveTab(event.index);
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(goToIndex: number, internChange: boolean, closePopup: boolean): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: async () => {
        if (this.variableTab.selected) {
          if (this.ongletVariablePaie.canUpdateListVariablePaye()) {
            this.ongletVariablePaie.updateListVariablePaye(true);
            this.checkNavigationForVariablePaie(internChange, goToIndex, closePopup);
          } else {
            this.navigateAway.next(false);
          }
        } else {
          await this.payFileStructureComponent.updateRestaurantPaySystemParams();
          this.checkNavigationForFileStructure(internChange, goToIndex, closePopup);
        }
      },
      reject: () => {
        if (this.variableTab.selected) {
          this.checkNavigationForVariablePaie(internChange, goToIndex, closePopup);
        } else if (this.structureTab.selected) {
          this.checkNavigationForFileStructure(internChange, goToIndex, closePopup);
        } else {
          this.getActiveTab(goToIndex);
        }
      }
    });
    return this.navigateAway;
  }

  private getActiveTab(newIndex: number): any {

    switch (newIndex) {
      case 0: {
        this.validationTab.selected = true;
        this.variableTab.selected = false;
        this.structureTab.selected = false;
      }
        break;
      case 1: {
        this.variableTab.selected = true;
        this.validationTab.selected = false;
        this.structureTab.selected = false;
      }
        break;
      case 2: {
        this.structureTab.selected = true;
        this.variableTab.selected = false;
        this.validationTab.selected = false;
      }
        break;
    }
  }

  private checkNavigationForVariablePaie(internChange: boolean, goToIndex: number, closePopup: boolean): void {
    if (internChange) {
      this.selectedTab = goToIndex;
      this.getActiveTab(goToIndex);
    } else {
      if (closePopup) {
        this.selectedTab = -1;
        this.openPaiePopup = false;
        this.navigateAway.next(false);
      } else {
        this.navigateAway.next(true);
      }
      this.validationTab.selected = true;
      this.variableTab.selected = false;
      this.structureTab.selected = false;
    }
  }

  private checkNavigationForFileStructure(internChange: boolean, goToIndex: number, closePopup: boolean): void {
    if (internChange) {
      this.selectedTab = goToIndex;
      this.getActiveTab(goToIndex);
    } else {
      if (closePopup) {
        this.selectedTab = -1;
        this.openPaiePopup = false;
        this.initTabs();
        this.navigateAway.next(false);
      } else {
        this.initTabs();
        this.navigateAway.next(true);
      }
    }
  }

  public canDeactivate(): boolean {
    if (this.ongletVariablePaie) {
      return this.ongletVariablePaie.isSameList();
    } else if (this.payFileStructureComponent) {
      return this.payFileStructureComponent.isSameList();
    }
  }

  public closeVariablePaiePopup(): void {
    if (this.selectedTab === 1) {
      if (this.ongletVariablePaie.isSameList()) {
        this.selectedTab = -1;
        this.openPaiePopup = false;
        this.initTabs();
      } else {
        this.saveContentBeforeDeactivation(1, false, true);
      }
    } else if (this.selectedTab === 2) {
      if (this.payFileStructureComponent.isSameList()) {
        this.selectedTab = -1;
        this.openPaiePopup = false;
        this.initTabs();
      } else {
        this.saveContentBeforeDeactivation(2, false, true);
      }
    } else {
      this.selectedTab = -1;
      this.openPaiePopup = false;
      this.initTabs();
    }
  }

  private initTabs(): void {

    this.validationTab.selected = true;
    this.variableTab.selected = true;
    this.structureTab.selected = true;
    if (this.showOngletVPP()) {
      this.validationTab.selected = false;
    }
    if (this.showOngletVAP()) {
      this.variableTab.selected = false;
    }
    if (this.showOngletSFP()) {
      this.structureTab.selected = false;
    }

  }

  public getListActifEmployee(selectedDate: any): void {
    selectedDate = this.dateService.formatToShortDate(selectedDate);
    this.employeService.findAllEmployeesInDate(selectedDate).subscribe((result: EmployeeModel[]) => {
        this.employees = result;
        this.employees.forEach((employe: EmployeeModel) => {
          employe.fullName = employe.nom + ' ' + employe.prenom;
        });
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  public printVoucher(): void {
    this.isSubmitted = true;
    this.dateService.resetSecondsAndMilliseconds(this.voucherForm.value['heureDebut']);
    this.dateService.resetSecondsAndMilliseconds(this.voucherForm.value['heureFin']);
    if (this.voucherForm.valid) {
      this.bonInfo = {
        employe: this.voucherForm.value['employee']['nom'] + ' ' + this.voucherForm.value['employee']['prenom'],
        matricule: this.voucherForm.value['employee']['matricule'],
        heureDebut: this.dateService.setStringFromDate(this.voucherForm.value['heureDebut']),
        heureFin: this.dateService.setStringFromDate(this.voucherForm.value['heureFin']),
        dateJournee: this.voucherForm.value['dateJournee'],
        absenceType: this.voucherForm.value['typeAbsence'] ? 'Départ anticipé' : 'Retard'
      };
      this.showVoucherPdf = true;
    }
  }


  public filterByFirstLastName(): void {
    this.firstLastNameFilterQueue.launchSearchByFirstLastName();
  }

  public setFilterFirstLastName(filter: string): void {
    this.firstLastNameFilterQueue.firstLastNameFilter = filter;
  }

  public sortByOrder(): void {
    this.firstLastNameFilterQueue.order = !this.firstLastNameFilterQueue.order;
    this.firstLastNameFilterQueue.launchSort();
  }

  // ******************************              BLOCK/UNBLOCK GDH              ***********************************

  public unblockPeriod(): void {
    if (this.getBlockUnblockAccess()) {
      const newLimitDate = this.dateService.getDateFromSubstractDateWithNumberOf(this.selectedPeriodFrom, 1, 'days');
      this.blockGdhParam.valeur = this.datePipe.transform(newLimitDate, 'dd/MM/yyyy');
      this.updateBlockDateLimitStateLocally(newLimitDate);
    }
  }

  private updateBlockDateLimitStateLocally(newLimitDate?: Date): void {
    this.parametreGlobalService.updateParamsByRestaurant([this.blockGdhParam]).subscribe(_ => {
      // supprimer la validation en cas de succes de deblocage
      if (newLimitDate) {
        this.deleteValidation(this.datePipe.transform(newLimitDate, 'dd-MM-yyyy'));
      }
      this.ghdViewBlockState = this.blockGdhService.getPeriodBlockState(this.selectedPeriodFrom, this.selectedPeriodTo, this.blockGdhParam.valeur);
    });
  }

  private deleteValidation(limitDate: string): void {
    this.validationPayService.deleteParamEnvoi(limitDate).subscribe((result: any) => {
    }, error => {
      console.log(error);
    });

  }

  public blockPeriod(BlockAfterValidation?: boolean): void {
    if (this.getBlockUnblockAccess() || BlockAfterValidation) {
      this.blockGdhParam.valeur = this.datePipe.transform(this.selectedPeriodTo, 'dd/MM/yyyy');
      this.updateBlockDateLimitStateLocally();
    }
  }

  public getPadlockHoverMessage(event: Event, state: 'BLOCK' | 'UNBLOCK', overlayPanel: OverlayPanel): void {
    if (state === 'BLOCK') {
      this.padLockHoverMessage = this.rhisTranslateService.translate('GDH.BLOCK.TO') + this.blockGdhParam.valeur;
    } else if (state === 'UNBLOCK') {
      this.padLockHoverMessage = this.rhisTranslateService.translate('GDH.BLOCK.IT') + this.datePipe.transform(this.selectedPeriodTo, 'dd/MM/yyyy');
    }
    overlayPanel.show(event);
  }

  public getBlockUnblockAccess(): boolean {
    return this.domControlService.duplicateControl(this.ecran);
  }

  public closePopupDeltaNegatif(): void {
    this.showPopupDeltaNegatif = false;
  }

  public checkDeltaAndValidatePaye(event: any): void {
    this.paramEnvoiUuid = event.paramEnvoiUuid;
    this.chosenReports = event.chosenReports;
    this.checkDelta();
  }

  public async downloadChosenReports(reports): Promise<void> {
    this.notificationService.startLoader();
   const files: string[] = [];
    for (const report of reports) {
      switch (report.code) {
        case RapportPaieEnum.PAYROLL_INTEGRATION:
          files.push.apply(files, (await this.downloadPayRollIntegrationFiles()).filter(value => value !== ''));
          break;
        case RapportPaieEnum.GDH_WEEK_VIEW:
          files.push( await this.downloadGDHWeekView());
          break;
        case RapportPaieEnum.ACTIF_EMPLOYEES_LIST:
          files.push(await this.generateListEmployeRapport());
          break;
        case RapportPaieEnum.GDH_PERIOD_VIEW:
          files.push.apply(files, await this.generateVuePayeExcelAndCsv());
         // await this.generateExcelPayViewReport();
          break;
      }}
    await  this.downloadFilesValidation(files);
  }

  private async generateListEmployeRapport(): Promise<string> {
    const currentLangue = this.rhisTranslateService.browserLanguage;
   return (await this.generateFilesService.generateExcelFileFromFields(currentLangue, {
      filterStatut: '',
      filterName: ''
    }, false).toPromise()).toString();
  }

  private async downloadFilesValidation(filesNames: string[]): Promise<void> {
    const startPeriod: string = this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');
    const endPeriod: string = this.datePipe.transform(this.selectedPeriodTo, 'dd-MM-yyyy');
    if (filesNames.length < 4) {
    for (const fileName of filesNames) {
      const fileContent: Blob = await this.generateFilesService.getFileByFileNameFromGDHService(fileName).toPromise();
      FileSaver.saveAs(fileContent, fileName);
    }
      this.notificationService.stopLoader();

    } else {
      const zipName = this.rhisTranslateService.translate('GDH.ZIP_VALIDATION');
      const au = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.AU');
      const zip = new JSZip();
      for (const fileName of filesNames) {
        const fileContent: Blob = await this.generateFilesService.getFileByFileNameFromGDHService(fileName).toPromise();
        zip.file(fileName, fileContent);
      }
      zip.generateAsync({type: 'blob'})
        .then(function(content) {

          saveAs(content, zipName + startPeriod + ' ' + au + ' ' + endPeriod);
        });
      this.notificationService.stopLoader();
    }



  }

  private async downloadPayRollIntegrationFiles(): Promise<string[]> {
    const startPeriod: string = this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');
    this.fileList = await this.gdhService.getPaieFilesNames({date: startPeriod, onlyEmployees: true, onlyManagers: true}).toPromise();
   return this.fileList;
  }

  private async downloadGDHWeekView(): Promise<string> {
    const startPeriod: string = this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');
    const endPeriod: string = this.datePipe.transform(this.selectedPeriodTo, 'dd-MM-yyyy');
    const fileName = await this.generateFilesService.getGdhVueSemaineFile(startPeriod, endPeriod, this.isHourlyView, this.currentLangue).toPromise();
  return fileName;
  }

  public validateGeneration(): void {
    if(this.selectedTab === 0){
      this.openValidationPaiePopup = true;
    } else {
      this.generatePayeFile();
    }
    this.closePopupDeltaNegatif();
  }

  public generateFile(): void {
    this.exportPaye();
  }


  public showMenuControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  public validerPaie(): void {
    this.closeValidationPaiePopup();
    this.addValidation();
  }

  private addValidation(): void {
    let generationTimeIsUpdated = false;
    //Mise à jour date de génération des fichiers de paie pour cette période de paie
    if(this.paramEnvoiUuid || this.downloadFiles){
      generationTimeIsUpdated = true;
    }
    const validation : ValidationPeriodPaie ={
      id : {
        startPeriod : this.datePipe.transform(this.selectedPeriodFrom, 'yyyy-MM-dd'),
        endPeriod: this.datePipe.transform(this.selectedPeriodTo, 'yyyy-MM-dd'),
        restaurant: this.sharedRestaurantService.selectedRestaurant
      },
      validatorLastFirstName : this.sessionService.getUserPrenom() + ' ' + this.sessionService.getUserNom(),
      validatorUuid: this.sessionService.getUuidUser(),
      validationTime: this.dateService.formatDateTo(new Date(),'YYYY-MM-DD[T]HH:mm:ss'),
      generationTime: null,
      validated: true,
      generated: false
    };

    // on peut valider meme si y'a pas d'envoi
    this.validationPayService.addValidationPeriodPaie(validation,  generationTimeIsUpdated).subscribe((result:ValidationPeriodPaie)=>{
      this.postValidationActions();
    }, error=>{
      console.log(error);
    });
  }
  public postValidationActions():void{
    this.closeVariablePaiePopup();
    //Blocage GDH jusqu'à date fin période
    const blockParamValue: Date = this.dateService.createDateFromStringPattern(this.blockGdhParam.valeur, 'DD/MM/YYYY');
    if (this.dateService.isBefore(blockParamValue, this.selectedPeriodTo)) {
      this.blockPeriod(true);
    }

    //Si telecharger coché,  télécharge les documents sélectionnés
    if (this.downloadFiles) {
      this.downloadChosenReports(this.chosenReports);
      // this.generateFilesAfterValidation(); //according to chosen reports to generate
    }
    //Si envoi, fichiers seront envoyés
    if (this.paramEnvoiUuid) {
      const startPeriod: string = this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');
      const endPeriod: string = this.datePipe.transform(this.selectedPeriodTo, 'dd-MM-yyyy');
      const language: string = this.rhisTranslateService.browserLanguage;
      this.envoiParamService.sendReportsAfterPeriodValidation(this.paramEnvoiUuid, startPeriod, endPeriod, language, this.isHourlyView, this.generateFilesService.getFieldsToPrint(false) ).subscribe((result: any) => {

      }, error => {
        console.log(error);
      });
    }
    this.downloadFiles = false;
  }

  public generateFilesAfterValidation(): void {
    //generate GDH vue semaine
    this.getWeekData();
    //generate GDH vue periode
    this.generateCSVPayeViewReport(); // CSV
    this.generateExcelPayViewReport(); //EXCEL

    //generate intergration de paie
    this.generatePayeFile();
    //generate liste des employés actifs (to fix add filter or change BE endpoint)
    this.generateActifEmployees();

  }

  private generateActifEmployees(): void {
    const currentLangue = this.rhisTranslateService.browserLanguage;
    this.generateFilesService.generateExcelFileFromFields(currentLangue, {
      filterStatut: '',
      filterName: ''
    }, false).subscribe((data: any) => {
      this.generateFilesService.getFileByFileNameFromEmployeeService(data).subscribe(
        (fileData: any) => {
          FileSaver.saveAs(fileData, data);
        },
        (err: any) => {
          console.log(err);
          this.notificationService.stopLoader();
          // TODO
        }, () => {
          this.notificationService.stopLoader();
          this.notificationService.showSuccessMessage('EMPLOYEE.LISTE_EMPLOYEE_SUCCESS_DOWNLOAD');
        }
      );
    }, (err: any) => {

    });
  }

  public displayValidationPaiePopup(): void {
    this.openValidationPaiePopup = true;
  }

  public closeValidationPaiePopup(): void {
    this.openValidationPaiePopup = false;
  }
}
