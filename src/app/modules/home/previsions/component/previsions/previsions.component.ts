import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PrevisionsPlannedDays, RepartitionMensuelleCa, VenteJournaliere} from '../../../../../shared/model/previsions.model';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import * as moment from 'moment';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {PrevisionsService} from '../../service/previsions.service';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {PaginationArgs, PaginationPage} from '../../../../../shared/model/pagination.args';
import {ModeVenteModel} from '../../../../../shared/model/modeVente.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {LazyLoadEvent} from 'primeng/api';
import {RhisRoutingService} from '../../../../../shared/service/rhis.routing.service';
import {FileUpload} from 'primeng/fileupload';
import {concat, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DateService} from '../../../../../shared/service/date.service';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {RestaurantService} from '../../../../../shared/service/restaurant.service';
import {ParametreModel} from '../../../../../shared/model/parametre.model';
import {SystemCaisseModeVenteEnum} from '../../../../../shared/enumeration/system.caisse.mode.vente.enum';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {InterfaceCaisseService} from '../../service/interface.caisse.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {LanguageStorageService} from 'src/app/shared/service/language-storage.service';

@Component({
  selector: 'rhis-previsions',
  templateUrl: './previsions.component.html',
  styleUrls: ['./previsions.component.scss'],
})
export class PrevisionsComponent implements OnInit, AfterViewChecked, AfterViewInit {
  public repartitionMensuelleCa = {} as RepartitionMensuelleCa;
  public modesDeVente: ModeVenteModel[] = [];
  public percentages = [];
  public chartType: ChartType = 'pie';
  public chartOptions: ChartOptions = {
    elements: {
      arc: {
        borderWidth: 0
      }
    },
    legend: {
      display: false
    },
    responsive: false,
  };
  public chartLabels: Label[];
  public chartLabelsToDisplay: Label[];
  public chartDatasets: ChartDataSets[] = [];
  public chartDatasetsToDisplay: ChartDataSets[] = [];
  public chartColours: string[] = [];
  public datesPlanifies: string[];
  public startSelectedWeekDate: Date;
  public monthNumber: number;
  public defaultDate: Date;
  public yearNumber: number = moment().year();
  public selectedWeekNumber: number;
  public ventesJournalieres: VenteJournaliere[] = [];
  public venteJournaliereToBeValidate: VenteJournaliere[] = [];
  public titles: string[] = [];
  public refCheckList: { label: string, value: string }[];
  public selectedRefDays: any[] = [];
  public isPrevisionSectionReady = true;
  public droped: VenteJournaliere[] = [];

  public dragedJourRef = null;

  public joursDeReference: VenteJournaliere[] = [];
  public refClicked: VenteJournaliere;
  public clickedDayOfWeek: JourSemaine;
  public newDayVentesValue: number;
  public monthName: string;
  public monthNameToDisplay: string;
  public startOfMonth: string;
  public endOfMonth: string;
  public hasMonthChanged = false;
  private caWeek: number;
  private minJourRef: number;
  public rows = 5;
  public first = 0;
  public totalRecords: number;
  public rowsPerPageOptions = [5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 5};
  public currentPage: VenteJournaliere[] = [];
  public currentCalendarDates = [];
  public displaySpinner = false;
  public statusAreShown = false;
  public statutOptions;
  public realStatut = false;
  public previsionStatut = false;
  private lastYearsCode = 'LAST_YEARS';
  private state: any;
  public importPopUpSaleIsShown = false;
  public files: File[];
  public importProgressionLabel: string;
  public selectionFileMode = true;
  public nbrSuccessImport = 0;
  public importProgressionRate = 0;
  public popUpTitle = '';
  private firstWeekSelectedDate: Date;
  @ViewChild(FileUpload)
  private fileUploader: FileUpload;
  private weeksPerMonth = [];

  public hasSystemCaisse = false;
  private systemCaisse = '';
  public wrongDateFormatFileIndexes: boolean[] = [];
  private SYSTEM_CAISSE_CODE_NAME = 'SYSTEMECAISSE';
  private SYSTEM_CAISSE_DATE_FORMAT_CODE_NAME = 'FORMATDATE';
  public popUpNCRUploadTitle = this.rhisTranslateService.translate('PREVISION.IMPORT_CAISSE_POP_UP_TITLE');
  public acceptableDateFormat: string;
  public hasAutoSystemCaisse = false;
  public hasMaitreDSystemCaisse = false;
  public displayAutoImportPopup = false;
  public correctNCRDateError = false;
  private ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public dateDebutNCR = new Date(new Date().getTime() - this.ONE_DAY_IN_MILLISECONDS);
  public dateFinNCR = new Date(new Date().getTime() - this.ONE_DAY_IN_MILLISECONDS);
  public heightInterface: any;
  // Masquer le bouton next s'il n y a plus de données à afficher
  public displayNextButton = true;
  // Masquer le bouton previous si on est au tout début des données à afficher
  public displayPreviousButton = false;
  public maxDataToDisplay = 5;
  public pageModeVente = 0;
  private lastIndex = 0;
  private ecran = 'GDP';
  public modeVenteColors: string[] = ['#5180CD',
    '#F2A16A',
    '#BFBFBF',
    '#92D050',
    '#FFD966',
    '#5B9BD5',
    '#ED7D31',
    '#7F7F7F',
    '#70AD47',
    '#FFC000',
    '#7497F8',
    '#F9D6BF',
    '#BBB1B3',
    '#65B965',
    '#EAF27E'];

  public popUpStyle = {
    width: 300
  };

  public dateNow = new Date();
  public applyTextStyle = false;

  /**
   * class constructor
   * @param rhisTranslateService translation service
   * @param router Angular router
   * @param previsionsService PrevisionsService
   * @param notificationService NotificationService
   * @param cdRef ChangeDetectorRef
   * @param dateService DateService
   * @param rhisRouter RhisRoutingService
   * @param sharedRestaurantService sharedRestaurantService
   */
  constructor(
    private rhisTranslateService: RhisTranslateService,
    private router: Router,
    private previsionsService: PrevisionsService,
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef,
    private dateService: DateService,
    private sharedRestaurantService: SharedRestaurantService,
    private restaurantService: RestaurantService,
    private parametreService: ParametreGlobalService,
    private interfaceCaisseService: InterfaceCaisseService,
    private rhisRouter: RhisRoutingService,
    private domControlService: DomControlService,
    private languageStorageService: LanguageStorageService) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation.extras.state) {
      this.state = navigation.extras.state;
    }
  }

  private getLanguage(): void {
    if (this.languageStorageService.getLanguageSettings() && this.languageStorageService.getLanguageSettings().value === 'de') {
      this.applyTextStyle = true;
    }
  }

  public updateDateNow(): void {
    if (this.systemCaisse === 'CASHPAD') {
      this.dateNow = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    }
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  async ngOnInit(): Promise<void> {
    this.previsionsService.getMinJoursRef().subscribe((minJourRef: string) => this.minJourRef = +minJourRef);
    this.statutOptions = [
      {label: this.rhisTranslateService.translate('PREVISION.PREV_STATUT_ALL'), status: null},
      {label: this.rhisTranslateService.translate('PREVISION.PREV_STATUT_REAL'), status: true},
      {label: this.rhisTranslateService.translate('PREVISION.PREV_STATUT_PREVISIONS'), status: false}
    ];
    await this.getRestaurantSystemCaisse();
    await this.getRestaurantSystemCaisseDateFormat();
    this.getLanguage();
  }

  ngAfterViewInit() {
    this.state ? this.getStateData() : this.getDefaultData();
  }

  /**
   * Définit le comportement attendu lors du click sur les flèches suivant et précédent du calendrier
   * @param event évènement déclenché par PrimeNG
   */
  public loadMonthData(event: any): void {
    this.pageModeVente = 0;
    this.lastIndex = 0;
    this.displayPreviousButton = false;
    this.displayNextButton = true;
    this.currentCalendarDates = [];
    this.hasMonthChanged = true;
    this.monthNumber = event.month;
    this.yearNumber = event.year;
    this.getPlanification(event);
    this.getWeeksByMonthByRestaurant(new Date(event.year, +(event.month) - 1));
  }

  private getDefaultData() {
    this.previsionsService.getDefaultPrevisions()
      .then((value: PrevisionsPlannedDays) => {
        this.defaultDate = new Date(value.date);
        this.defaultDate.setHours(0, 0, 0, 0);
        // monthNumber refers to the real rank of the month and not returned value of moment.js
        this.monthNumber = this.defaultDate.getMonth() + 1;
        this.yearNumber = this.defaultDate.getFullYear();
        this.displayMonthName(value);
        this.getMonthVentePerModeVente(this.monthNumber, this.defaultDate.getFullYear());
        // set ref check list here
        this.setDayRefList();
        this.getWeeksByMonthByRestaurant(this.defaultDate);
        setTimeout(_ => {
          this.configCalendarWeeksAndDefaultVenteJournalieres();
        }, 300);
      });
  }

  private getWeeksByMonthByRestaurant(selectedDate: Date): void {
    const selectedDateAsString = this.dateService.formatToShortDate(selectedDate);
    this.restaurantService.getListWeekFromMonthByRestaurant(selectedDateAsString).subscribe((weeksPerMonth: any) => {
      this.weeksPerMonth = weeksPerMonth;
      this.updateWeekStatus();
    }, () => {
    });
  }

  /**
   * Get prevision state for a given date and week number
   */
  private getStateData() {
    this.previsionsService.setSharedRestaurantAndFirstWeekDay().then(() => {
      this.defaultDate = new Date(this.state.date);
      this.defaultDate.setHours(0, 0, 0, 0);
      this.monthNumber = this.defaultDate.getMonth() + 1;
      this.yearNumber = this.defaultDate.getFullYear();
      this.loadMonthData({month: this.monthNumber, year: this.yearNumber});
      this.setDayRefList();
      setTimeout(_ => {
        this.configCalendarWeeksAndDefaultVenteJournalieres();
      }, 500);
    });
  }

  /**
   * Get day references list
   */
  private setDayRefList() {
    this.refCheckList = this.previsionsService.weekOrderedDays.map(jour => {
      return {
        label: jour.day,
        value: jour.val
      };
    });
    this.refCheckList.push({
      label: this.rhisTranslateService.translate('PREVISION.PREVIOUS_YEARS'),
      value: this.lastYearsCode
    });
  }

  /**
   *  on recupere la liste des ventes journalieres selon le statut reel ou previsions
   */
  OnChangeStatut(event) {
    if (event.value.status === false) {
      this.realStatut = false;
      this.previsionStatut = true;
    }
    if (event.value.status === true) {
      this.realStatut = true;
      this.previsionStatut = false;
    }
    if (event.value.status === null) {
      this.realStatut = false;
      this.previsionStatut = false;
    }
    this.statusAreShown = !this.statusAreShown;
    this.first = 0;
    this.rows = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.onLazyLoad({first: this.first, rows: this.rows});
  }

  /**
   * Fetch a specific reference page
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.setFilterAndFetchJoursRef();
  }

  public loadNextData(): void {
    this.lastIndex += this.maxDataToDisplay;

    this.chartLabelsToDisplay = this.chartLabels.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay);
    this.chartDatasetsToDisplay = [{
      data: this.percentages.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
      backgroundColor: this.chartColours.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
    }];
    if (this.lastIndex + this.maxDataToDisplay >= this.modesDeVente.length) {
      this.displayNextButton = false;
    }
    this.displayPreviousButton = true;
    this.pageModeVente++;
  }

  private updatePlanifiedRealVente(month: number, year: number): void {
    this.previsionsService.getMonthPlanifiedVente({month: month, year: year}).subscribe((data: any) => {
      this.repartitionMensuelleCa.CAPlanifie = data.estimatedVente;
      this.repartitionMensuelleCa.CAReel = data.realVente;
    });
  }

  public loadPreviousData(): void {
    this.lastIndex -= this.maxDataToDisplay;

    this.chartLabelsToDisplay = this.chartLabels.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay);
    this.chartDatasetsToDisplay = [{
      data: this.percentages.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
      backgroundColor: this.chartColours.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
    }];
    if (this.lastIndex <= 0) {
      this.displayPreviousButton = false;
    }
    this.displayNextButton = true;
    this.pageModeVente--;
  }

  /**
   * Set listeners to weeks clicks and get default 'ventes journalieres'
   */
  private configCalendarWeeksAndDefaultVenteJournalieres() {
    // Après l'initialisation de la vue, le semaine courante est entourée en gris et les ventes sont récupérées
    const weeks = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksArray = Array.from(weeks);
    const i: number = this.currentCalendarDates.findIndex(date => moment(date).isSame(this.defaultDate));
    weeksArray.forEach((e, index) => {
      if (i !== -1) {
        const modeIndex = parseInt((i / 7).toString(), 10);
        if (index === modeIndex) {
          this.selectedWeekNumber = +e.innerHTML;
          this.startSelectedWeekDate = this.currentCalendarDates[modeIndex * 7];
          e.classList.add('selected-week');
        }
      }
    });
    this.clickedDayOfWeek = this.previsionsService.weekOrderedDays[0].val;
    this.selectedRefDays = [this.clickedDayOfWeek];
    this.initWeekClickEvent();
    this.cdRef.detectChanges();
    this.getVentesJournalieresByWeek();
  }

  /**
   * Display selected months
   * @param: value
   */
  private displayMonthName(value: PrevisionsPlannedDays) {
    this.datesPlanifies = value.days ? value.days : [];
    this.monthName = moment(value.date).month(this.monthNumber - 1).locale('fr').format('MMMM');
    this.monthName = this.monthName[0].toUpperCase() + this.monthName.slice(1);
    const monthFortranslta = 'MOIS_COMPLET.' + this.monthName.replace(/é/g, 'e').replace(/û/g, 'u').toUpperCase();
    this.monthNameToDisplay = this.rhisTranslateService.translate(monthFortranslta);
    this.startOfMonth = moment(value.date).startOf('month').format('DD/MM');
    this.endOfMonth = moment(value.date).endOf('month').format('DD/MM');
  }

  ngAfterViewChecked() {
    if (this.hasMonthChanged) {
      // Ajouter la possibilité de cliquer sur un numéro de semaine. Par défaut, ce comportement n'existe pas dans PrimeNG
      this.initWeekClickEvent();
    }
    this.cdRef.detectChanges();
  }

  /**
   * Récupére les dates plaifiés à afficher en vert sur le calendrier pour un mois donné
   * @param: date
   */
  private getPlanification(date: { month: number, year: number }) {
    this.previsionsService.getPrevisions(date).subscribe((value: PrevisionsPlannedDays) => {
      this.displayMonthName(value);
    });
    this.getMonthVentePerModeVente(date.month, date.year);
  }

  private getCurrentCalendarDates(date) {
    const calendarDate = new Date(date.year, date.month, date.day);
    calendarDate.setHours(0, 0, 0, 0);
    const isExist = this.currentCalendarDates.some(d => moment(d).isSame(calendarDate));
    // 42 ( 6 * 7) || 35 (5 * 7): max of days that the calendar can holds
    if (!isExist && this.currentCalendarDates.length < 42) {
      this.currentCalendarDates.push(calendarDate);
    }
    // TODO  verify this condition with monthNumber
    if (
      ((this.currentCalendarDates.length === 42) || (this.currentCalendarDates.length === 35)
        || (((this.currentCalendarDates.length === 28 || this.currentCalendarDates.length === 29) && (this.monthNumber === 2)))) &&
      !this.currentCalendarDates.some(d => moment(d).isSame(calendarDate))
    ) {
      this.currentCalendarDates = [];
      this.currentCalendarDates.push(calendarDate);
    }
  }

  /**
   * Permet à PrimeNG de déterminer les dates qui seront affichées en vert et celles qui seront affichées en orange
   * @param date Date affiché sur le calendreir
   */
  public checkDate(date: any): boolean {
    this.getCurrentCalendarDates(date);
    const planifiedDaysForCurrentMonth: Number[] = [];
    const planifiedDaysForLastMonth: Number[] = [];
    const planifiedDaysForNextMonth: Number[] = [];
    if (this.datesPlanifies) {
      this.datesPlanifies.forEach((dp: string) => {
        const dpMonth: number = Number(dp.split('/')[1]);
        if (dpMonth > this.monthNumber) {
          planifiedDaysForNextMonth.push(Number(dp.split('/')[0]));
        } else if (dpMonth < this.monthNumber) {
          planifiedDaysForLastMonth.push(Number(dp.split('/')[0]));
        } else {
          planifiedDaysForCurrentMonth.push(Number(dp.split('/')[0]));
        }
      });
      const calendarDate = new Date(date.year, date.month, date.day);
      calendarDate.setHours(0, 0, 0, 0);
      const calendarDay = calendarDate.getDate();
      // En javascript, les index des mois dans l'objet Date commence à 0, on rajoute donc 1
      const calendarMonth = calendarDate.getMonth() + 1;
      if (calendarMonth < this.monthNumber) {
        return planifiedDaysForLastMonth.includes(calendarDay);
      } else if (calendarMonth > this.monthNumber) {
        return planifiedDaysForNextMonth.includes(calendarDay);
      } else {
        return planifiedDaysForCurrentMonth.includes(calendarDay);
      }
    }
    return false;
  }

  /**
   * Définit le comportement attendu suite à un click sur le numéro de la semaine
   */
  private initWeekClickEvent() {
    const weeks = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksArray = Array.from(weeks);
    this.caWeek = this.caWeek || 0;
    this.newDayVentesValue = 0;
    weeksArray.forEach((e, index) => {
      const weekNumber = +e.innerHTML;
      e.addEventListener('click', event => {
        this.isPrevisionSectionReady = false;
        weeksArray.forEach(week => week.classList.remove('selected-week'));
        this.selectedWeekNumber = +e.innerHTML;
        this.hilightSelectedWeekAndInitializeForFirstDay(e, index);
        this.getVentesJournalieresByWeek();
      });
    });
    this.hasMonthChanged = false;
  }

  private hilightSelectedWeekAndInitializeForFirstDay(e, index) {
    this.startSelectedWeekDate = this.currentCalendarDates[index * 7];
    e.classList.add('selected-week');
    this.venteJournaliereToBeValidate = [];
    this.joursDeReference = [];
    this.clickedDayOfWeek = this.previsionsService.weekOrderedDays[0].val;
  }

  private updateWeekStatus(): void {
    const weeksElements = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksElementsArray = Array.from(weeksElements);
    weeksElementsArray.forEach((element: any, index: number) => {
      element.parentElement.parentElement.classList.remove('calculated-week');
      element.parentElement.parentElement.classList.remove('non-calculated-week');
      element.innerHTML = this.weeksPerMonth[index].weekNumber;
    });
  }

  /**
   * Définit le comportement attendu au début du drag d'une référence
   * @param e évènement
   * @param c jour déplacé
   */
  public dragStart(e, c: VenteJournaliere) {
    this.dragedJourRef = c;
  }

  /**
   * Définit le comportement attendu lors du drop d'une référence
   * @param e évènement
   */
  public drop(e) {
    if (this.dragedJourRef && this.addButtonControl()) {
      this.droped.push(this.dragedJourRef);
      const index: number = this.joursDeReference
        .findIndex(jdr => jdr.idVenteJournaliere === this.dragedJourRef.idVenteJournaliere);
      this.joursDeReference = this.joursDeReference.filter((val, i) => i !== index);
      this.dragedJourRef = null;
      this.refClicked = null;
    }
    e.target.classList.remove('grid-right-elements-drop-enter');
  }

  /**
   * Permet de changer la bordure de la zone de drag quand la référence à dropper entre dans la zone de drop
   * @param e évènement
   */
  public dragEnter(e) {
    e.target.classList.add('grid-right-elements-drop-enter');
  }

  /**
   * Permet à partir de la vente journalière sélectionnée de récupérer les jours de référence
   * @param venteJournaliere vente journalière sélectionné
   */
  public getJoursDeReference(day: JourSemaine, index: number) {
    this.droped = [];
    this.clickedDayOfWeek = day;
    this.selectedRefDays = [this.clickedDayOfWeek];
    this.fetchJoursRefs([day], index);
  }

  /**
   * @param days: Vente journalieres filter refences days
   * @param index: rank of day
   */
  public fetchJoursRefs(days: JourSemaine[], index = 0) {
    const selectedDayDate = this.previsionsService.getDateFormat(
      new Date(this.startSelectedWeekDate.getTime() + (index * 24 * 60 * 60 * 1000)));
    this.previsionsService.getJoursDeReference(days, {
      realStatut: this.realStatut,
      previonsStatut: this.previsionStatut
    }, selectedDayDate, this.paginationArgs)
      .subscribe((joursRefsPage: PaginationPage<VenteJournaliere>) => {
        this.currentPage = joursRefsPage.content;
        this.joursDeReference = joursRefsPage.content.filter(
          vj => this.droped.every(dropedVJ => dropedVJ.idVenteJournaliere !== vj.idVenteJournaliere)
        );
        this.totalRecords = joursRefsPage.totalElements;
      });
  }

  public getDayToValidate(): string {
    const weekDay = this.previsionsService.weekOrderedDays.find(day => day.val === this.clickedDayOfWeek);
    return weekDay ? weekDay.day.toUpperCase() : '';
  }

  /**
   * Permet de supprimer une journée de référence sélectionnée lors du click sur le bouton (x)
   * @param day journée de référence sélectionnée
   */
  public removeRefDay(day: VenteJournaliere) {
    const isAbsentInDisplayedRefs = this.joursDeReference.every(vj => vj.idVenteJournaliere !== day.idVenteJournaliere);
    const isPresentInCurrentPage = this.currentPage.some(vj => vj.idVenteJournaliere === day.idVenteJournaliere);
    if (isAbsentInDisplayedRefs && isPresentInCurrentPage) {
      this.joursDeReference.push(day);
    }
    const index: number = this.droped
      .findIndex(jdr => jdr.idVenteJournaliere === day.idVenteJournaliere);
    this.droped = this.droped.filter((val, i) => i !== index);
  }

  /**
   * Définit le comportement attendu lors d'un click sur une référence
   * @param day jour de référence
   */
  public onRefClick(day) {
    this.refClicked = day;
  }

  /**
   * Déplace une référence lors du click sur le bouton ajouter (+)
   */
  public addSelectedRef() {
    if (this.refClicked) {
      this.droped.push(this.refClicked);
      const index: number = this.joursDeReference
        .findIndex(jdr => jdr.idVenteJournaliere === this.refClicked.idVenteJournaliere);
      this.joursDeReference = this.joursDeReference.filter((val, i) => i !== index);
      this.refClicked = null;
    }
  }

  /**
   * Récupère toutes les ventes journalière de la semaine sélectionnée
   */
  public getVentesJournalieresByWeek() {
    this.ventesJournalieres = [];
    this.previsionsService.getWeekPlanifiedVente(this.startSelectedWeekDate).subscribe((ventesJournalieres: VenteJournaliere[]) => {
      this.ventesJournalieres = ventesJournalieres ? ventesJournalieres : [];
      this.caWeek = this.ventesJournalieres.reduce((accumulator: number, currentValue: VenteJournaliere) => {
        return accumulator + currentValue.ventes;
      }, 0);
      this.isPrevisionSectionReady = true;
      this.droped = [];
      this.fetchJoursRefs([this.clickedDayOfWeek]);
    });
  }

  public goToVenteHoraire(day: JourSemaine, index: number, refClicked?: VenteJournaliere) {
    const vj = this.ventesJournalieres.find(venteJournaliere => venteJournaliere.jour === day);
    const date = this.previsionsService.getDateFormat(
      new Date(this.startSelectedWeekDate).setDate(this.startSelectedWeekDate.getDate() + index)
    );
    if (vj) {
      this.router.navigate([`home/previsions/vente-horaire/${date}/${vj.uuid}/false`]);
    } else {
      this.router.navigate([`home/previsions/vente-horaire/${date}/0/false`]);
    }
  }

  /**
   * Récupére les pourcentage de mode de vente à afficher pour les référence
   * @param jour jour de référence
   * @param mode mode de vente
   */
  public getVentesPercentageByMode(jour: VenteJournaliere, idModeVente: number): number {
    const venteJournaliereModeVente = jour.venteJournaliereModeVentes.find(x => x.venteJournaliereModeVentePK.idModeVente === idModeVente);
    return venteJournaliereModeVente ? venteJournaliereModeVente.pourcentage : 0;
  }

  /**
   * Récupère la valeur de ventes pour une vente journalière
   * @param day vente journalière
   */
  public getVentesByDay(day: JourSemaine): number {
    const vj = this.ventesJournalieres.find(venteJournaliere => venteJournaliere.jour === day);
    return vj ? vj.ventes : 0;
  }

  /**
   * Détermine si la vente journalière est valide ou non
   * @param day vente journalière
   */
  public isDayValide(day: JourSemaine): boolean {
    const vj = this.ventesJournalieres.find(venteJournaliere => venteJournaliere.jour === day);
    return !!vj;
  }

  /**
   * Permet de valider les modifications effectuées pour la journée sélectionnée
   */
  public validateDay() {
    if (this.droped && this.droped.length >= this.minJourRef) {
      const vjIndex = this.venteJournaliereToBeValidate.findIndex(venteJournaliere => venteJournaliere.jour === this.clickedDayOfWeek);
      const vjExistedIndex = this.ventesJournalieres.findIndex(venteJournaliere => venteJournaliere.jour === this.clickedDayOfWeek);
      let dayPrevisionToValidate: VenteJournaliere;
      if (vjIndex !== -1) {
        dayPrevisionToValidate = this.venteJournaliereToBeValidate[vjIndex];
      } else if (vjExistedIndex !== -1) {
        dayPrevisionToValidate = this.ventesJournalieres[vjExistedIndex];
        delete dayPrevisionToValidate.idVenteJournaliere;
      }
      if (((vjIndex !== -1) || (vjExistedIndex !== -1)) && dayPrevisionToValidate.ventes > 0) {
        this.sendDayToBeValidate(dayPrevisionToValidate, vjIndex, vjExistedIndex);
      } else {
        this.notificationService.showErrorMessage('PREVISION.NULL_VENTE_ERROR');
      }
    } else {
      this.notificationService.showErrorMessageWithExtraOption('PREVISION.MIN_REF_DAYS_ERROR', this.minJourRef);
    }
  }

  private correctVenteJournaliereLists(venteJournaliereValidated, vjIndex, vjExistedIndex) {
    if ((vjIndex !== -1) && (vjExistedIndex !== -1)) {
      this.ventesJournalieres.splice(vjExistedIndex, 1);
    } else if ((vjIndex !== -1) && (vjExistedIndex === -1)) {
      this.venteJournaliereToBeValidate.splice(vjIndex, 1);
      this.datesPlanifies.push(this.previsionsService.getDateWithBackslashFormat(venteJournaliereValidated.dateVente));
    }
    this.ventesJournalieres.push(venteJournaliereValidated);
  }

  private sendDayToBeValidate(dayPrevisionToValidate, vjIndex, vjExistedIndex) {
    dayPrevisionToValidate.jourDeReference = this.droped;
    this.displaySpinner = true;
    this.previsionsService.add(dayPrevisionToValidate).subscribe((venteJournaliereValidated: VenteJournaliere) => {
      this.correctVenteJournaliereLists(venteJournaliereValidated, vjIndex, vjExistedIndex);
      this.droped = this.joursDeReference = [];
      this.displaySpinner = false;
      this.goNext();
    }, error => {
      // TODO
      this.displaySpinner = false;
      console.log(error);
    });
  }

  private goNext() {
    const currentSelectedDayIndex = this.previsionsService.weekOrderedDays.findIndex(v => v.val === this.clickedDayOfWeek);
    if (currentSelectedDayIndex === 6) {
      this.goToNextWeek();
    } else {
      this.getMonthVentePerModeVente(this.monthNumber, this.yearNumber);
      this.clickedDayOfWeek = this.previsionsService.weekOrderedDays[currentSelectedDayIndex + 1].val;
      this.getJoursDeReference(this.clickedDayOfWeek, currentSelectedDayIndex + 1);
    }
  }

  private goToNextWeek() {
    this.defaultDate = new Date(this.startSelectedWeekDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    this.selectedWeekNumber++;
    this.loadMonthData({year: this.defaultDate.getFullYear(), month: this.defaultDate.getMonth() + 1});
    setTimeout(_ => {
      const weeks = document.querySelectorAll('.ui-datepicker-weeknumber span');
      const weeksArray = Array.from(weeks);
      this.caWeek = 0;
      this.newDayVentesValue = 0;
      weeksArray.forEach((e, index) => {
        if (+e.innerHTML === this.selectedWeekNumber) {
          this.isPrevisionSectionReady = false;
          weeksArray.forEach(week => week.classList.remove('selected-week'));
          this.currentCalendarDates.sort((date1, date2) => {
            if (moment(date1).isAfter(date2)) {
              return 1;
            } else if (moment(date1).isBefore(date2)) {
              return -1;
            }
            return 0;
          });
          this.hilightSelectedWeekAndInitializeForFirstDay(e, index);
          this.selectedRefDays = [this.previsionsService.weekOrderedDays[0].val];
          this.getVentesJournalieresByWeek();
          this.hasMonthChanged = false;
        }
      });
      this.initWeekClickEvent();
    }, 300);
  }

  /**
   * Récupère la valeur de CA saisie pour une vente journalière
   * @param event évènement
   */
  public getNewVentesValue(event, day: JourSemaine, index: number) {
    if (event.target.textContent !== '') {
      this.newDayVentesValue = event.target.textContent || 0;


      const vjIndex = this.venteJournaliereToBeValidate.findIndex(venteJournaliere => venteJournaliere.jour === day);
      const vjValidatedIndex = this.ventesJournalieres.findIndex(venteJournaliere => venteJournaliere.jour === day);
      if (vjIndex !== -1) {
        this.venteJournaliereToBeValidate[vjIndex].ventes = +event.target.textContent || 0;
      } else if (vjValidatedIndex !== -1) {
        this.venteJournaliereToBeValidate.push({
          ...this.ventesJournalieres[vjValidatedIndex],
          ventes: +event.target.textContent
        });
      } else {
        const newVenteJournaliere = new VenteJournaliere();
        newVenteJournaliere.jour = day;
        newVenteJournaliere.dateVente = new Date(this.startSelectedWeekDate.getTime() + (index * 60 * 60 * 1000 * 24));
        newVenteJournaliere.dateVente.setHours(12);
        newVenteJournaliere.ventes = +event.target.textContent;
        this.venteJournaliereToBeValidate.push(newVenteJournaliere);
      }
      const reestimatedVenteJournaliereIds: number [] = this.venteJournaliereToBeValidate.filter(vj => vj.idVenteJournaliere != null).map(vj => vj.idVenteJournaliere);
      const notReestimatedValidatedVenteJournaliere: VenteJournaliere[] = this.ventesJournalieres.filter(vjValidated => reestimatedVenteJournaliereIds.every(id => id !== vjValidated.idVenteJournaliere));
      this.caWeek = notReestimatedValidatedVenteJournaliere
        .concat(this.venteJournaliereToBeValidate)
        .reduce((accumulator: number, currentValue: VenteJournaliere) => accumulator + currentValue.ventes, 0);
    }
    if (+event.target.textContent <= 0) {
      event.target.textContent = 0;
    }
  }

  /**
   * Récupère la nouvelle liste de jours de référence suite à la modification de la sélection dans la liste déroulante
   */
  public updateRefSelection(event) {
    const addedRefOperation: string = this.selectedRefDays.find((ref: string) => ref === event.itemValue);
    if (addedRefOperation) {
      if (event.itemValue === this.lastYearsCode) {
        this.selectedRefDays = [this.lastYearsCode];
      } else {
        const pastYearRefIndex = this.selectedRefDays.findIndex((ref: string) => ref === this.lastYearsCode);
        if (pastYearRefIndex !== -1) {
          this.selectedRefDays.splice(pastYearRefIndex, 1);
        }
      }
    }
    this.paginationArgs.pageNumber = 0;
    this.setFilterAndFetchJoursRef();
  }

  private setFilterAndFetchJoursRef() {
    const index = this.previsionsService.weekOrderedDays.findIndex(weekDay => weekDay.val === this.clickedDayOfWeek);
    this.fetchJoursRefs(this.selectedRefDays, index);
  }

  /**
   * Empêche le retour à la ligne, la saisie de valeur non numérique et la saisie de valeur négative
   * @param event évenement
   */
  public controlNewValue(event) {
    // la valeur 13 correspond au keycode de la touche entrée
    // les keycode entre 48 et 57 correspondent au chiffres entre 0 et 9
    if (event.which === 13 || event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
    if (event.which === 13) {
      event.target.blur();
    }
  }

  public scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  /**
   *Ouvrir detail des ventes journée de reference
   *
   * ouvrir la page des détails des ventes au quart d’heure.
   * @param : refClicked
   */
  public goToVenteHorairerefClicked(refClicked?: VenteJournaliere) {
    const date = this.previsionsService.getDateFormat(new Date(refClicked.dateVente));
    const realVentes = String(refClicked.realVentes);
    this.router.navigate([`home/previsions/vente-horaire/${date}/${refClicked.uuid}/${realVentes}`]);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.refClicked && event.keyCode === 13) {
      this.goToVenteHorairerefClicked(this.refClicked);
    }
  }

  public async selectWeekendByClickingDate(date: Date): Promise<void> {
    const premierJourDeLaSemaine = await this.sharedRestaurantService.getWeekFirstDay();
    const selectedDate = this.dateService.getFistWeekDayDate(premierJourDeLaSemaine, date);
    this.firstWeekSelectedDate = selectedDate;
    this.state = {date: date};
    this.getStateData();
  }

  /**
   * ************************************** Import Real sales **************************************************
   */

  public afterSelectingRealSaleFiles(): void {
    this.files = this.fileUploader.files;
    this.importPopUpSaleIsShown = true;
    this.popUpTitle = this.rhisTranslateService.translate('PREVISION.FILE_TO_BE_UPLOADED_TITLE');
    this.wrongDateFormatFileIndexes = [];
  }

  public removeFile(index: number): void {
    this.files.splice(index, 1);
    this.wrongDateFormatFileIndexes.splice(index, 1);
    if (!this.files.length) {
      this.importPopUpSaleIsShown = false;
    }
  }

  public uploadFiles(): void {
    this.popUpTitle = this.rhisTranslateService.translate('PREVISION.IMPORT_POP_UP_TITLE');
    this.selectionFileMode = false;
    this.importProgressionLabel = this.rhisTranslateService.translate(`PREVISION.IN_PROGRESS_IMPORT`);
    let nbrLeftFilesToBeImported = this.files.length;
    this.nbrSuccessImport = 0;
    const source = this.files.map((file: File) => this.previsionsService.importRealSales(file).pipe(
      catchError(err => of('NOT_IMPORTED'))
    ));
    concat(...source)
      .subscribe(val => {
        if (val !== 'NOT_IMPORTED') {
          this.nbrSuccessImport++;
        }
        nbrLeftFilesToBeImported = this.setImportConfig(nbrLeftFilesToBeImported);
        if ((nbrLeftFilesToBeImported === 0) && (this.nbrSuccessImport === 0)) {
          const element: Element = document.querySelectorAll('.ui-progressbar .ui-progressbar-value')[0];
          (element as HTMLElement).style.setProperty('background-color', 'red', 'important');
        } else {
          this.updatePlanifiedRealVente(this.monthNumber, this.defaultDate.getFullYear());
        }
      });
  }

  public checkCaisseFilesToBeUpload(): void {
    if (this.validateCaissFiles()) {
      this.uploadCaisseFiles();
    }
  }

  public checkNCRCaisseFilesToBeUpload(): void {
    if (this.dateDebutNCR <= this.dateFinNCR) {
      this.notificationService.startLoader();
      this.correctNCRDateError = false;
      this.popUpTitle = this.rhisTranslateService.translate('PREVISION.IMPORT_CAISSE_POP_UP_TITLE');
      this.selectionFileMode = false;
      this.importProgressionLabel = this.rhisTranslateService.translate(`PREVISION.IN_PROGRESS_IMPORT`);
      this.nbrSuccessImport = 0;
      let importFilesService = null;
      switch (this.systemCaisse) {
        case 'NCR': {
          importFilesService = this.interfaceCaisseService.importInterfaceNCRCaisseFiles(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'MICROS': {
          importFilesService = this.interfaceCaisseService.importInterfaceCaisseMICROSFiles(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'BOH': {
          importFilesService = this.interfaceCaisseService.importInterfaceBOHCaisseFiles(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'MAITRED': {
          importFilesService = this.interfaceCaisseService.importInterfaceMAITREDCaisseFiles(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'REBOOT': {
          importFilesService = this.interfaceCaisseService.importInterfaceREBOOTCaisse(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'ZELTY': {
          importFilesService = this.interfaceCaisseService.importInterfaceZeltyCaisse(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'CASHPAD': {
          importFilesService = this.interfaceCaisseService.importInterfaceCashPadCaisse(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'ADDITION': {
          importFilesService = this.interfaceCaisseService.importInterfaceAdditionCaisse(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
        case 'IMPORT_FICHIER': {
          importFilesService = this.interfaceCaisseService.importInterfaceIMPORT_FICHIERCaisseFiles(this.dateDebutNCR, this.dateFinNCR);
          break;
        }
      }
      if (importFilesService) {
        importFilesService.subscribe(data => {
          this.notificationService.stopLoader();
          this.updatePlanifiedRealVente(this.monthNumber, this.defaultDate.getFullYear());
          this.setFilterAndFetchJoursRef();
          this.displayAutoImportPopup = false;
          this.showSuccessMessage(data);
        }, (response) => {
          if (response.error === 'RHIS_ICAISSE_NO_FILE_UPLOADED') {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.NO_FILE_UPLOADED'));
          } else if (response.error === 'RHIS_ICAISSE_NCR_NO_FILE_IMPORTED') {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.NO_FILE_UPLOADED'));
          } else if (response.error.includes('BOH')) {
            this.gestionBOHErrorCode(response.error);
          } else if (this.systemCaisse === 'REBOOT') {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_MICROS_UPLOAD'));
          } else if (this.systemCaisse === 'CASHPAD') {
            this.gestionCahspadErrorCode(response.error);
          } else if (this.systemCaisse === 'ADDITION') {
            this.gestionAdditionErrorCode(response.error);
          } else {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
          }
          this.displayAutoImportPopup = false;
          this.notificationService.stopLoader();
        });
      } else {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
        this.notificationService.stopLoader();
      }
    } else {
      this.correctNCRDateError = true;
    }

  }

  private showSuccessMessage(data: any): void {
    if (typeof data === 'number' && data !== 0) {
      this.notificationService.showSuccessMessage(data + ' ' + this.rhisTranslateService.translate('PREVISION.SUCCESS_NCR_UPLOAD'));
    } else {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PREVISION.SUCCESS_NCR_UPLOAD'));
    }
  }

  /**
   * Set progression rate bar, libel to indicate start and end import
   * and how many files left to be imported
   * @param: filesLeftToBeImported file left to be imported
   */
  private setImportConfig(filesLeftToBeImported: number): number {
    this.importProgressionRate += 100 / this.files.length;
    filesLeftToBeImported--;
    if (filesLeftToBeImported === 0) {
      this.importProgressionLabel = this.rhisTranslateService.translate(`PREVISION.END_IMPORT`);
    }
    return filesLeftToBeImported;
  }

  public closePopUpAndClearFiles(): void {
    this.importPopUpSaleIsShown = false;
    this.displayAutoImportPopup = false;
    this.correctNCRDateError = false;
    this.selectionFileMode = true;
    this.popUpTitle = '';
    this.fileUploader.clear();
  }

  public selectFiles(): void {
    if (this.hasAutoSystemCaisse) {
      this.displayAutoImportPopup = true;
    } else {
      this.fileUploader.basicFileInput.nativeElement.click();
    }
  }

  private async getRestaurantSystemCaisse(): Promise<void> {
    this.parametreService.getParameterByRestaurantIdAndCodeParameter(this.SYSTEM_CAISSE_CODE_NAME).subscribe((param: ParametreModel) => {
      this.hasSystemCaisse = param.valeur.trim().length && this.acceptedSystemCaisse(param.valeur);
      this.systemCaisse = param.valeur.trim().length ? param.valeur.trim().toUpperCase() : '';
      this.updateDateNow();
      this.popUpNCRUploadTitle = `${this.popUpNCRUploadTitle} ${this.systemCaisse}`;
      this.hasAutoSystemCaisse = param.valeur.trim().length &&
        (
          param.valeur.trim().toUpperCase() === 'NCR' ||
          param.valeur.trim().toUpperCase() === 'MICROS' ||
          param.valeur.trim().toUpperCase() === 'BOH' ||
          param.valeur.trim().toUpperCase() === 'MAITRED' ||
          param.valeur.trim().toUpperCase() === 'REBOOT' ||
          param.valeur.trim().toUpperCase() === 'ZELTY' ||
          param.valeur.trim().toUpperCase() === 'CASHPAD' ||
          param.valeur.trim().toUpperCase() === 'ADDITION'
        );
    });
  }

  private acceptedSystemCaisse(systemCaisse: string): boolean {
    return Object.keys(SystemCaisseModeVenteEnum).some(acceptedSystemCaisse => acceptedSystemCaisse.toUpperCase() === systemCaisse.toUpperCase());
  }

  private async getRestaurantSystemCaisseDateFormat(): Promise<void> {
    this.parametreService.getParameterByRestaurantIdAndCodeParameter(this.SYSTEM_CAISSE_DATE_FORMAT_CODE_NAME).subscribe((param: ParametreModel) => {
      this.acceptableDateFormat = param.valeur;
    });
  }

  private uploadCaisseFiles(): void {
    this.popUpTitle = this.rhisTranslateService.translate('PREVISION.IMPORT_CAISSE_POP_UP_TITLE');
    this.selectionFileMode = false;
    this.importProgressionLabel = this.rhisTranslateService.translate(`PREVISION.IN_PROGRESS_IMPORT`);
    let nbrLeftFilesToBeImported = this.files.length;
    this.nbrSuccessImport = 0;
    const source = this.files.map((file: File) => this.interfaceCaisseService.importInterfaceCaisseFiles(file).pipe(
      catchError(err => of('NOT_IMPORTED'))
    ));
    concat(...source)
      .subscribe(val => {
        if (val !== 'NOT_IMPORTED') {
          this.nbrSuccessImport++;
        }
        nbrLeftFilesToBeImported = this.setImportConfig(nbrLeftFilesToBeImported);
        if ((nbrLeftFilesToBeImported === 0) && (this.nbrSuccessImport === 0)) {
          const element: Element = document.querySelectorAll('.ui-progressbar .ui-progressbar-value')[0];
          (element as HTMLElement).style.setProperty('background-color', 'red', 'important');
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
        } else {
          this.updatePlanifiedRealVente(this.monthNumber, this.defaultDate.getFullYear());
          this.setFilterAndFetchJoursRef();
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PREVISION.SUCCESS_NCR_UPLOAD'));
        }
      });
  }

  private validateCaissFiles(): boolean {
    let validFile = true;
    this.wrongDateFormatFileIndexes = [];
    this.files.forEach((item: File) => {
      let valid = false;
      for (let i = 0; i < item.name.length - (this.acceptableDateFormat.length + 3); i++) {
        const dateToBeTested = item.name.substr(i, this.acceptableDateFormat.length);
        valid = valid || moment(dateToBeTested, this.acceptableDateFormat.toUpperCase(), true).isValid();
      }
      this.wrongDateFormatFileIndexes.push(!valid);
      validFile = validFile && valid;
    });
    return validFile;
  }

  private getMonthVentePerModeVente(month: number, year: number): void {
    this.previsionsService.getMonthPlanifiedVente({month: month, year: year}).subscribe((data: any) => {
      data.modeVentepercentages.sort((a, b) => b.percentage - a.percentage);
      this.repartitionMensuelleCa.CAPlanifie = data.estimatedVente;
      this.repartitionMensuelleCa.CAReel = data.realVente;
      data.modeVentepercentages.sort((mvp1, mvp2) => mvp1.modeVente.libelle >= mvp2.modeVente.libelle ? 1 : -1);
      this.percentages = data.modeVentepercentages.map(pourcentageModeVente => pourcentageModeVente.percentage.toFixed(2));
      this.modesDeVente = data.modeVentepercentages.map(pourcentageModeVente => pourcentageModeVente.modeVente);
      this.chartLabels = data.modeVentepercentages.map(pourcentageModeVente => pourcentageModeVente.modeVente.libelle);
      this.setModeVenteColors();
      this.chartLabelsToDisplay = this.chartLabels.slice(0, this.lastIndex + this.maxDataToDisplay);
      this.chartDatasets = [{
        data: this.percentages,
        backgroundColor: this.chartColours,
      }];
      this.chartDatasetsToDisplay = [{
        data: this.percentages.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
        backgroundColor: this.chartColours.slice(this.lastIndex, this.lastIndex + this.maxDataToDisplay),
      }];
      if (this.modesDeVente.length <= this.maxDataToDisplay) {
        this.displayNextButton = false;
      }
      this.setTitles();
    });
  }

  private setTitles(): void {
    const configLibelles = [
      this.rhisTranslateService.translate('PREVISION.STATUS'),
      this.rhisTranslateService.translate('PREVISION.SALE')
    ];

    this.titles = configLibelles;
    this.titles = configLibelles.slice(1, this.titles.length);
  }

  private setModeVenteColors(): void {
    this.modesDeVente.forEach((item: any, index: number) => {
      this.chartColours.push(this.modeVenteColors[index % 15]);
    });
  }

  private gestionBOHErrorCode(error: string) {
    switch (error) {
      case 'RHIS_ICAISSE_BOH_NOT_FOUND_OR_ABSENT': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NOT_BOH_SYSTEM'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_FILE_NAME_NOT_FOUND_OR_ABSENT': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_NO_FILE_NAME_FOUND'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_LAST_FILE_DATE_NOT_FOUND_OR_ABSENT': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_NO_LAST_DATE_FOUND'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_PARAMS_NOT_FOUND_OR_ABSENT': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_NO_PARAMS_FOUND'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_NO_VENTE_FOUND': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_NO_VENTE_JOURNALIERE_FOUND'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_WRONG_STORE_ID': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_WRONG_STORE_ID'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_ERROR_IMPORTING_FILE': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_WRONG_STORE_ID_FORMAT': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_WRONG_STORE_ID_FORMAT'));
        break;
      }
      default : {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
      }
    }
  }

  private gestionCahspadErrorCode(error: string) {
    switch (error) {
      case 'RHIS_CASHPAD_NO_TRANSACTIONS': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_CASHPAD_NO_TRANSACTRIONS'));
        break;
      }
      case 'RHIS_ICAISSE_BOH_WRONG_STORE_ID': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_WRONG_STORE_ID'));
        break;
      }
      default : {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
      }
    }
  }

  private gestionAdditionErrorCode(error: string) {
    switch (error) {
      case 'RHIS_ADDITION_NO_TRANSACTIONS': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_CASHPAD_NO_TRANSACTRIONS'));
        break;
      }
      case 'RHIS_ICAISSE_ADDITION_WRONG_STORE_ID': {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_BOH_WRONG_STORE_ID'));
        break;
      }
      default : {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PREVISION.ERROR_NCR_UPLOAD'));
      }
    }
  }
}

