import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {JourSemaine} from 'src/app/shared/enumeration/jour.semaine';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {DateService} from 'src/app/shared/service/date.service';
import {RestaurantService} from 'src/app/shared/service/restaurant.service';
import {SessionService} from 'src/app/shared/service/session.service';
import * as moment from 'moment';
import {RapportService} from 'src/app/modules/home/employes/service/rapport.service';
import {DatePipe} from '@angular/common';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {ParametreRapport} from '../../../../shared/model/parametreRapport';
import {SharedService} from '../../services/shared.service';
import {Observable} from 'rxjs';
import {RapportParcService} from '../../services/rapport-parc.service';
import * as FileSaver from 'file-saver';
import {HttpResponse} from '@angular/common/http';
import {PerformanceReportService} from '../../services/performance-report.service';
import {PerformanceReportHelperService} from '../../../../shared/module/performance-report/service/performance-report-helper.service';
import {ComparativePerformanceSheet} from 'src/app/shared/model/analysePerformanceModel';
import {ParametreGlobalService} from '../../../home/configuration/service/param.global.service';
import {PosteTravailReportService} from '../../services/poste-travail-report.service';

@Component({
  selector: 'rhis-onglet-parametres',
  templateUrl: './onglet-parametres.component.html',
  styleUrls: ['./onglet-parametres.component.scss']
})
export class OngletParametresComponent implements OnInit, OnChanges {
  @Input() public libelleRapport: string;
  @Input() public idRapport: string;
  @Input() public uuidRapport: string;
  @Input() public selectedReport: any;
  @Input() public rapportCodeName: string;
  @Input() public envoiParams: any;

  @Output() generateRapport = new EventEmitter();
  @Input() buttonExport: Observable<void>;
  @Output() buttonExportValue = new EventEmitter();
  @Output() displaySpinner = new EventEmitter();
  public initParamPage = false;
  public initCalendar = true;
  public calendar_fr: any;
  public firstDayAsInteger = 1;
  public frConfig: any;
  public values: Date[];
  public premierJourDeLaSemaine = 'LUNDI';
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public listRestaurant: any[];
  public typePeriodeCalcul = 'jour';
  public comparatifFile = true;
  public selectedRestaurants: any[] = [];
  public weeksPerMonth: any;
  public firstRestaurant: any;
  public selectedDate: Date;
  public calendarText;
  public secondCalendarValues: any;
  public selectedYear = new Date().getFullYear();
  public disableButton = true;
  public disableRadioButton = false;
  public disableListResto = false;
  public disableFirstCalendar = false;
  public disableCalculPeriod = false;
  public disableSecondCalendar = false;
  public monthModel = new Date();
  public parametreEnvoi: ParametreRapport;
  public uuidList = [];
  public selectedPage: number;
  private readonly PALIER3_SUP_PARAM = 'PALIER3_SUP';

  modeAffichageRapportPosteTravail = false;

  trancheHoraire = {label: this.translateService.translate('GESTION_PARC_RAPPORT.TRACHE_60_MINUTES'), value: '60'};
  trancheHoraireList = [
    {label: this.translateService.translate('GESTION_PARC_RAPPORT.TRACHE_15_MINUTES'), value: '15'},
    {label: this.translateService.translate('GESTION_PARC_RAPPORT.TRACHE_30_MINUTES'), value: '30'},
    {label: this.translateService.translate('GESTION_PARC_RAPPORT.TRACHE_60_MINUTES'), value: '60'}

  ];

  constructor(private dateService: DateService,
              private parametreGlobalService: ParametreGlobalService,
              private restaurantService: RestaurantService,
              private translateService: RhisTranslateService,
              private sessionService: SessionService,
              private rapportService: RapportService,
              private sharedService: SharedService,
              private rapportParcService: RapportParcService,
              private performanceReportService: PerformanceReportService,
              private posteTravailReportService: PosteTravailReportService,
              private performanceReportHelperService: PerformanceReportHelperService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedReport && changes.selectedReport.currentValue && changes.selectedReport.currentValue.page >= 0) {
      this.selectedPage = changes.selectedReport.currentValue.page;
      if (this.uuidList[this.selectedPage] && !this.comparatifFile) {
        this.getReportContent(this.uuidList[this.selectedPage]);
      } else if (this.comparatifFile) {
        this.getReportContent();
      }
    }
    if (changes.envoiParams && changes.envoiParams.currentValue) {
      this.initParamPage = true;
      this.initCalendar = false;
      this.comparatifFile = this.envoiParams.comparatifFile;
      this.typePeriodeCalcul = this.envoiParams.typePeriodeCalcul.toLowerCase();
      this.firstDayAsInteger = new Date(this.envoiParams.startDate).getDay();
      this.premierJourDeLaSemaine = this.dateService.getJourSemaineFromInteger(this.firstDayAsInteger);
      this.initCalender();
      this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    }

  }


  ngOnInit() {
    this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.' + (!this.comparatifFile ? 'DAY_PERIOD_TEXT' : 'SINGLE_DAY_PERIOD_TEXT'));
    this.sharedService.getParametreRapport().subscribe(data => {
      this.parametreEnvoi = data;
    });
    this.sharedService.tabEnvoiEmailDisabled = true;
    this.getListRestaurants();
    this.initCalender();
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    if (this.initParamPage) {
      this.initPageParametreEnvoi();
      this.initCalender();
    } else {
      this.initCalendarsWithNoSelectedResto();
    }
    this.sharedService.export.subscribe(data => {
      this.exportRapport();
    });
  }

  public initPageParametreEnvoi(): void {
    if (this.rapportCodeName !== 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
      if (this.typePeriodeCalcul === 'semaine') {
        this.secondCalendarValues = [];
        this.secondCalendarValues[0] = new Date(this.envoiParams.startDate);
        this.secondCalendarValues[1] = new Date(this.envoiParams.endDate);
      } else if (this.typePeriodeCalcul === 'jour') {
        this.secondCalendarValues = new Date(this.envoiParams.startDate);
        if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT') {
          this.trancheHoraire = this.trancheHoraireList.filter(tranche => tranche.value === this.envoiParams.decoupage)[0];
        }
      } else {
        //init month value
        this.selectedYear = +this.envoiParams.year;
      }
      if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT') {
        this.modeAffichageRapportPosteTravail = this.envoiParams.typePeriodeCalcul !== 'JOUR';
      }
    } else {
      this.values = [];
      this.values[0] = new Date(this.envoiParams.startDate);
      this.values[1] = new Date(this.envoiParams.endDate);
    }
  }

  private getListRestaurants() {
    if (this.sessionService.getUuidFranchise()) {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(this.sessionService.getUuidFranchise())
        .subscribe((restaurantPage: any) => {
          this.listRestaurant = restaurantPage.content;
          this.listRestaurant.sort((resto1: any, resto2: any) => {
            return resto1.libelleRestaurant.localeCompare(resto2.libelleRestaurant);
          });
          if (this.initParamPage) {
            this.listRestaurant.forEach((resto: any) => {
              if (this.envoiParams.listRestaurantDispaly.find((val: any) => val === resto.uuid)) {
                this.selectedRestaurants.push(resto);
                this.firstRestaurant = this.selectedRestaurants[0];
              }
            });
            this.generateReport();
            this.checkButtonStatus();
          }
        });
    } else {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVente(this.sessionService.getUuidUser()).subscribe((list: any) => {
        this.listRestaurant = list.content;
        if (this.initParamPage) {
          this.listRestaurant.forEach((resto: any) => {
            if (this.envoiParams.listRestaurantDispaly.find((val: any) => val === resto.uuid)) {
              this.selectedRestaurants.push(resto);
              this.firstRestaurant = this.selectedRestaurants[0];
            }
          });
          this.generateReport();
          this.checkButtonStatus();
        }
      });
    }
  }

  updateTypePeriode(): void {
    if (this.rapportCodeName !== 'POSTES_TRAVAIL_RAPPORT') {
      this.typePeriodeCalcul = 'jour';
      if (this.comparatifFile) {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.SINGLE_DAY_PERIOD_TEXT');
        this.secondCalendarValues = new Date();
      } else {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.DAY_PERIOD_TEXT');
        if (this.firstRestaurant) {
          this.secondCalendarValues = [];
          const currentWeekStart = moment().weekday(1).toDate();
          let start = new Date(currentWeekStart.getTime() - (this.findDecalage(currentWeekStart) * this.ONE_DAY_IN_MILLISECONDS));
          this.secondCalendarValues[0] = start;
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          this.secondCalendarValues[1] = end;
        } else {
          this.secondCalendarValues = [];
          this.secondCalendarValues[0] = moment().weekday(1).toDate();
          this.secondCalendarValues[1] = moment().weekday(7).toDate();
        }
      }
    }
  }

  updateTypePeriodePosteTravail(): void {

    if (!this.modeAffichageRapportPosteTravail) {
      this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.SINGLE_DAY_PERIOD_TEXT');
      this.secondCalendarValues = new Date();
    } else {
      this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.DAY_PERIOD_TEXT');
      if (this.firstRestaurant) {
        this.secondCalendarValues = [];
        const currentWeekStart = moment().weekday(1).toDate();
        let start = new Date(currentWeekStart.getTime() - (this.findDecalage(currentWeekStart) * this.ONE_DAY_IN_MILLISECONDS));
        this.secondCalendarValues[0] = start;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        this.secondCalendarValues[1] = end;
      } else {
        this.secondCalendarValues = [];
        this.secondCalendarValues[0] = moment().startOf('isoWeek').toDate();
        this.secondCalendarValues[1] = moment(this.secondCalendarValues[0]).add(6, 'days').toDate();
      }
    }
  }


  changeValue() {
    const datePipe = new DatePipe('en-US');
    this.uuidList = [];
    this.selectedRestaurants.sort((resto1: any, resto2: any) => {
      return resto1.libelleRestaurant.localeCompare(resto2.libelleRestaurant);
    });
    if (this.selectedRestaurants && this.selectedRestaurants.length) {
      this.selectedRestaurants.forEach((val: any) => this.uuidList.push(val.uuid));
    }
    let startDate: any;
    let endDate: any;
    if (this.rapportCodeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT' && this.values && this.values.length) {
      startDate = datePipe.transform(this.values[0], 'yyyy-MM-dd');
      endDate = datePipe.transform(this.values[1], 'yyyy-MM-dd');
    } else if (this.secondCalendarValues && this.secondCalendarValues.length) {
      startDate = datePipe.transform(this.secondCalendarValues[0], 'yyyy-MM-dd');
      endDate = datePipe.transform(this.secondCalendarValues[1], 'yyyy-MM-dd');
    } else {
      startDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      endDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
    }
    if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT') {
      this.typePeriodeCalcul = this.modeAffichageRapportPosteTravail ? 'semaine' : 'jour';
    }
    const data = {
      'comparatifFile': this.comparatifFile,
      'listRestaurantDispaly': this.uuidList,
      'typePeriodeCalcul': this.typePeriodeCalcul.toUpperCase(),
      'startDate': startDate,
      'endDate': endDate,
      'year': this.selectedYear.toString(),
      'decoupage': this.trancheHoraire.value
    };
    if (this.parametreEnvoi.comparatifFile !== data.comparatifFile
      || JSON.stringify(this.parametreEnvoi.listRestaurantDispaly) !== JSON.stringify(data.listRestaurantDispaly)
      || this.parametreEnvoi.typePeriodeCalcul !== data.typePeriodeCalcul
      || this.parametreEnvoi.startDate !== data.startDate
      || this.parametreEnvoi.endDate !== data.endDate
      || this.parametreEnvoi.year !== data.year
      || this.parametreEnvoi.decoupage !== data.decoupage
    ) {
      this.sharedService.tabEnvoiEmailDisabled = true;
    } else {
      this.sharedService.tabEnvoiEmailDisabled = false;
    }

  }

  /**
   *  Update calendar (set or remove restaurant first day) when fisrt resto selected
   */
  public updateCalendar(event: any) {
    this.checkButtonStatus();
    if (event.value.length && ((!this.firstRestaurant || (this.firstRestaurant && this.firstRestaurant.uuid !== event.value[0].uuid)) && this.initCalendar)) {
      if (this.rapportCodeName !== 'POSTES_TRAVAIL_RAPPORT') {
        this.firstRestaurant = event.value[0];
        this.getRestaurantInformation(this.firstRestaurant.uuid);
      }
    } else if (!event.value.length && this.initCalendar) {
      this.firstRestaurant = null;
      this.firstDayAsInteger = 1;
      this.premierJourDeLaSemaine = 'LUNDI';
      this.initCalendarsWithNoSelectedResto();
      this.initCalender();
    }

  }

  /**
   *  Check button status changes, if date changes
   */
  public onDateChange() {
    this.checkButtonStatus();
  }

  /**
   *  Get selected restaurant informations and init calendar according to it
   */
  getRestaurantInformation(uuid: any) {
    this.restaurantService.getRestaurantById(uuid).subscribe(
      (data: RestaurantModel) => {
        this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(data.parametreNationaux.premierJourSemaine);
        this.premierJourDeLaSemaine = data.parametreNationaux.premierJourSemaine;
        this.getWeeksByMonthByRestaurant();
      }
    );
  }


  /**
   * Change calculation period type (jou, semaine, mois)
   */
  public onSelectType(type: string): void {
    this.changeValue();
    this.typePeriodeCalcul = type;
    if (type === 'jour') {
      if (this.comparatifFile) {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.SINGLE_DAY_PERIOD_TEXT');
        this.secondCalendarValues = new Date();
      } else {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.DAY_PERIOD_TEXT');
        if (this.firstRestaurant) {
          this.secondCalendarValues = [];
          const currentWeekStart = moment().weekday(1).toDate();
          let start = new Date(currentWeekStart.getTime() - (this.findDecalage(currentWeekStart) * this.ONE_DAY_IN_MILLISECONDS));
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          this.secondCalendarValues[0] = new Date(start.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
          this.secondCalendarValues[1] = new Date(end.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
        } else {
          const currentWeekEnd = moment().weekday(7).toDate();
          const currentWeekStart = moment().weekday(1).toDate();

          this.secondCalendarValues = [];
          this.secondCalendarValues[0] = new Date(currentWeekStart.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
          this.secondCalendarValues[1] = new Date(currentWeekEnd.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
        }
      }
    } else if (type === 'semaine') {
      this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.WEEK_PERIOD_TEXT');
      if (this.firstRestaurant) {
        this.secondCalendarValues = [];
        const currentWeekStart = moment().weekday(1).toDate();

        let start = new Date(currentWeekStart.getTime() - (this.findDecalage(currentWeekStart) * this.ONE_DAY_IN_MILLISECONDS));
        this.secondCalendarValues[0] = start;

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        this.secondCalendarValues[1] = end;
      } else {
        this.secondCalendarValues = [];
        this.secondCalendarValues[0] = moment().weekday(1).toDate();
        this.secondCalendarValues[1] = moment().weekday(7).toDate();
      }
    } else {
      if (this.comparatifFile) {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.COMP_MONTH_PERIOD_TEXT');
      } else {
        this.calendarText = this.translateService.translate('GESTION_PARC_RAPPORT.MONTH_PERIOD_TEXT');
        this.selectedYear = new Date().getFullYear();
      }
    }

  }

  public yearDecrement() {
    let newYear: any;
    if (this.selectedYear > 1970) {
      let date = new Date();
      date.setFullYear(this.selectedYear);
      newYear = this.selectedYear - 1;
      this.selectedYear = newYear;
    }
  }

  public yearIncrement() {
    let newYear: any;
    if (this.selectedYear < 2055) {
      let date = new Date();
      date.setFullYear(this.selectedYear);
      newYear = this.selectedYear + 1;
      this.selectedYear = newYear;
    }
  }


  /**
   * Calculate offset between selected date and restaurant firt day of week
   */
  public findDecalage(date: any): number {
    const dateSelected = date;
    let decalage = 0;
    switch (this.premierJourDeLaSemaine) {
      case JourSemaine.LUNDI: {
        decalage = dateSelected.getDay() - (1 % 7);
        break;
      }
      case JourSemaine.MARDI: {
        decalage = dateSelected.getDay() - (2 % 7);
        break;
      }
      case JourSemaine.MERCREDI: {
        decalage = dateSelected.getDay() - (3 % 7);
        break;
      }
      case JourSemaine.JEUDI: {
        decalage = dateSelected.getDay() - (4 % 7);
        break;
      }
      case JourSemaine.VENDREDI: {
        decalage = dateSelected.getDay() - (5 % 7);
        break;
      }
      case JourSemaine.SAMEDI: {
        decalage = dateSelected.getDay() - (6 % 7);
        break;
      }
      case JourSemaine.DIMANCHE: {
        decalage = dateSelected.getDay() - (7 % 7);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    if (decalage < 0) {
      decalage += 7;
    }
    return decalage;
  }

  /**
   * Calculate previous week start/end date (REUME PLG CALENDAR)
   */
  public downWeekDate(): void {
    if (this.values) {
      const [start, end] = this.values;
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() - 7);
      this.values = [start, end];
      this.changeValue();
    }
  }

  /**
   * Calculate next week start/end date (REUME PLG CALENDAR)
   */
  public upWeekDate(): void {
    if (this.values) {
      const [start, end] = this.values;
      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);
      this.values = [start, end];
      this.changeValue();
    }
  }

  /**
   * Calculate previous week start/end date (ANALYSE PERFORMANCE CALENDAR) day and week period type
   */
  public downWeekDateSecondCalendar(): void {
    if (this.secondCalendarValues && (!this.comparatifFile || this.typePeriodeCalcul !== 'jour')) {
      const [start, end] = this.secondCalendarValues;
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() - 7);
      this.secondCalendarValues = [start, end];
    } else if (this.secondCalendarValues) {
      const date = new Date(this.secondCalendarValues);
      this.secondCalendarValues = new Date(date.setDate(date.getDate() - 1));
    }
  }

  /**
   * Calculate next week start/end date (ANALYSE PERFORMANCE CALENDAR) day and week period type
   */
  public upWeekDateSecondCalendar(): void {
    if (this.secondCalendarValues && (!this.comparatifFile || this.typePeriodeCalcul !== 'jour')) {
      const [start, end] = this.secondCalendarValues;
      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);
      this.secondCalendarValues = [start, end];
    } else if (this.secondCalendarValues) {
      const date = new Date(this.secondCalendarValues);
      this.secondCalendarValues = new Date(date.setDate(date.getDate() + 1));
    }
  }

  /**
   * initialize calendar config
   */
  private initCalender() {
    this.calendar_fr = {
      closeText: 'Fermer',
      prevText: 'Précédent',
      nextText: 'Suivant',
      currentText: 'Aujourd\'hui',
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
        'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      weekHeader: '',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }

  /**
   * Generate report for plg resume or performance analysis
   */
  public generateReport(): void {
    this.uuidList = [];
    const datePipe = new DatePipe('en-US');
    if (this.selectedRestaurants.length) {
      this.selectedRestaurants.forEach((val: any) => this.uuidList.push(val.uuid));
    }
    let startDate: any;
    let endDate: any;
    if (this.rapportCodeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT' && this.values && this.values.length) {
      startDate = datePipe.transform(this.values[0], 'yyyy-MM-dd');
      endDate = datePipe.transform(this.values[1], 'yyyy-MM-dd');
    } else if (this.secondCalendarValues && this.secondCalendarValues.length) {
      startDate = datePipe.transform(this.secondCalendarValues[0], 'yyyy-MM-dd');
      endDate = datePipe.transform(this.secondCalendarValues[1], 'yyyy-MM-dd');
    } else if (this.isPerformanceWithModeAndFilter('PERFORMANCE_RAPPORT', this.comparatifFile, 'jour')) {
      startDate = endDate = datePipe.transform(this.secondCalendarValues, 'yyyy-MM-dd');
    } else if (this.isPerformanceWithModeAndFilter('PERFORMANCE_RAPPORT', this.comparatifFile, 'mois')) {
      startDate = endDate = datePipe.transform(this.monthModel, 'yyyy-MM-dd');
    } else if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT' && this.typePeriodeCalcul === 'jour') {
      startDate = datePipe.transform(new Date(this.secondCalendarValues), 'yyyy-MM-dd');
      endDate = datePipe.transform(new Date(this.secondCalendarValues), 'yyyy-MM-dd');
    } else {
      startDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      endDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
    }
    const data = {
      'comparatifFile': this.comparatifFile,
      'listRestaurantDispaly': this.uuidList,
      'typePeriodeCalcul': this.rapportCodeName !== 'PILOTAGE_RESUME_PLANNING_RAPPORT' ? this.typePeriodeCalcul : null,
      'startDate': startDate,
      'endDate': endDate,
      'year': this.selectedYear.toString()
    };
    this.parametreEnvoi.comparatifFile = data.comparatifFile;
    this.parametreEnvoi.listRestaurantDispaly = data.listRestaurantDispaly;
    this.parametreEnvoi.typePeriodeCalcul = data.typePeriodeCalcul !== null ? data.typePeriodeCalcul.toUpperCase() : null;
    this.parametreEnvoi.startDate = data.startDate;
    this.parametreEnvoi.endDate = data.endDate;
    this.parametreEnvoi.year = data.year;
    this.parametreEnvoi.rapport = {'idRapport': this.idRapport, 'uuid': this.uuidRapport, 'libelleFile': this.libelleRapport , 'codeName': this.rapportCodeName};
    this.parametreEnvoi.uuidCreateur = this.sessionService.getUuidUser();
    this.parametreEnvoi.lastNameFirstNameCreateur = this.sessionService.getUserPrenom() + ' ' + this.sessionService.getUserNom();
    this.parametreEnvoi.decoupage = this.trancheHoraire.value;
    this.sharedService.setParametreRapport(this.parametreEnvoi);
    this.sharedService.tabEnvoiEmailDisabled = false;
    this.sharedService.listRestaurantSelectionne$.next(this.selectedRestaurants);
    this.getReportContent(this.uuidList[0]);
  }

  public getReportContent(reportUuid?: string): void {
    this.sharedService.buttonExport.next(false);
    const datePipe = new DatePipe('en-US');
    let firstGeneration: boolean;

    if (this.rapportCodeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
      if (!this.comparatifFile) {
        this.displaySpinner.emit(true);
        this.disableEnableFom(true);
        if (reportUuid === this.uuidList[0]) {
          firstGeneration = true;
        } else {
          firstGeneration = false;
        }
        this.rapportService.createRapportResumePlanning(reportUuid,
          datePipe.transform(this.values[0], 'dd-MM-yyyy'), datePipe.transform(this.values[1], 'dd-MM-yyyy'))
          .subscribe(response => {
            this.generateRapport.emit({
              resumePlgSrc: response,
              documentName: 'Rapport_résumé_planning',
              firstGeneration: firstGeneration,
              listUuids: this.uuidList
            });
            this.displaySpinner.emit(false);
            this.disableEnableFom(false);
            this.sharedService.tabEnvoiEmailDisabled = false;
          }, error => {
            console.log(error);
            this.displaySpinner.emit(false);
            this.disableEnableFom(false);
          });
      } else {
        // resume plg mode comparatif
        this.displaySpinner.emit(true);
        this.disableEnableFom(true);
        let dateDebutFin: any;
        if (reportUuid) {
          dateDebutFin = datePipe.transform(this.values[0], 'dd-MM-yyyy');
          firstGeneration = true;
        } else {
          const dateRefrence = new Date(this.values[0].getTime());
          dateDebutFin = datePipe.transform(dateRefrence.setDate((this.values[0].getDate() + this.selectedPage)), 'dd-MM-yyyy');
          firstGeneration = false;
        }
        this.rapportService.createRapportResumePlanningComparatif(this.uuidList,
          (this.uuidList.length > 1) ? dateDebutFin : datePipe.transform(this.values[0], 'dd-MM-yyyy'), (this.uuidList.length > 1) ? dateDebutFin : datePipe.transform(this.values[1], 'dd-MM-yyyy'))
          .subscribe((response: HttpResponse<any>) => {
            this.generateRapport.emit({
              resumePlgSrc: response.body,
              documentName: 'Rapport_résumé_planning_comparatif',
              firstGeneration: firstGeneration,
              restaurants: this.uuidList
            });
            this.displaySpinner.emit(false);
            this.disableEnableFom(false);
            this.sharedService.tabEnvoiEmailDisabled = false;
          }, error => {
            console.log(error);
            this.displaySpinner.emit(false);
            this.disableEnableFom(false);
          });
      }
    } else if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT') {
      if (reportUuid === this.uuidList[0]) {
        firstGeneration = true;
      } else {
        firstGeneration = false;
      }
      if (!this.comparatifFile) {
        if (this.parametreEnvoi.typePeriodeCalcul === 'JOUR') {
          this.getPosteTravailRapport(this.parametreEnvoi.listRestaurantDispaly, firstGeneration);
        } else {
          this.getPosteTravailRapport(Array.of(reportUuid), firstGeneration);
        }
      } else {
        this.getPosteTravailRapport(this.parametreEnvoi.listRestaurantDispaly, firstGeneration);
      }


      // TODO fill this fields with necessaire data
    } else if (this.rapportCodeName === 'PERFORMANCE_RAPPORT') {
      if (reportUuid === this.uuidList[0]) {
        firstGeneration = true;
      } else {
        firstGeneration = false;
      }
      if (!this.comparatifFile) {
        this.fetchPerformanceReportForRestaurant(reportUuid, datePipe, firstGeneration);
      } else {
        let restosUuids: string[];
        if (firstGeneration) {
          restosUuids = this.uuidList.slice(0, 10);
        }
        this.getComparatifReportAnalysePerf(restosUuids, datePipe, firstGeneration);
      }

    }
  }

  exportRapport(): void {
    if (this.parametreEnvoi.rapport.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT' && !this.parametreEnvoi.comparatifFile) {
      this.displaySpinner.emit(true);
      if (this.parametreEnvoi.listRestaurantDispaly.length > 5) {
        this.rapportParcService.exportPlanningNonComparatifFileZip(this.dateService.formatToShortDate(this.parametreEnvoi.startDate),
          this.dateService.formatToShortDate(this.parametreEnvoi.endDate), this.parametreEnvoi.listRestaurantDispaly).subscribe(data => {
          const fileName = decodeURIComponent(data.headers.get('rhis_file_name'));
          FileSaver.saveAs(data.body, fileName);
          this.displaySpinner.emit(false);
        }, error => {
          this.displaySpinner.emit(false);
        });
      } else {
        this.rapportParcService.exportPlanningNonComparatifFile(this.dateService.formatToShortDate(this.parametreEnvoi.startDate),
          this.dateService.formatToShortDate(this.parametreEnvoi.endDate), this.parametreEnvoi.listRestaurantDispaly).subscribe(data => {
          Object.keys(data).forEach((key, index) => {
            setTimeout(() => {
              this.download(data, key);
            }, 500 * index);
          });
          this.displaySpinner.emit(false);
        }, error => {
          this.displaySpinner.emit(false);
        });

      }

    }
    if (this.parametreEnvoi.rapport.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT' && this.parametreEnvoi.comparatifFile) {
      this.displaySpinner.emit(true);
      this.rapportService.createRapportResumePlanningComparatif(this.parametreEnvoi.listRestaurantDispaly.toString(), this.dateService.formatToShortDate(this.parametreEnvoi.startDate), this.dateService.formatToShortDate(this.parametreEnvoi.endDate)).subscribe((data: HttpResponse<any>) => {
        let fileName = data.headers.get('rhis_file_name');
        fileName = decodeURIComponent(fileName).split(moment(this.parametreEnvoi.endDate).format('YYYY-MM-DD'))[0] +
          moment(this.parametreEnvoi.endDate).format('YYYY-MM-DD') + '.pdf';
        FileSaver.saveAs(data.body, fileName);
        this.displaySpinner.emit(false);
      }, error => {
        this.displaySpinner.emit(false);
      });
    }
    if (this.parametreEnvoi.rapport.codeName === 'PERFORMANCE_RAPPORT') {
      const listResto = this.parametreEnvoi.listRestaurantDispaly;
      const startDate = this.parametreEnvoi.typePeriodeCalcul === 'MOIS' && !this.comparatifFile ? moment(this.parametreEnvoi.startDate).year(Number(this.parametreEnvoi.year)).format('DD-MM-YYYY') : this.dateService.formatToShortDate(this.parametreEnvoi.startDate);
      const endDate = this.parametreEnvoi.typePeriodeCalcul === 'MOIS' && !this.comparatifFile ? moment(this.parametreEnvoi.endDate).year(Number(this.parametreEnvoi.year)).format('DD-MM-YYYY') : this.dateService.formatToShortDate(this.parametreEnvoi.endDate);
      const lang = this.translateService.currentLang;
      const typePeriodeCalcul = this.parametreEnvoi.typePeriodeCalcul;
      if (!this.parametreEnvoi.comparatifFile) {
        this.displaySpinner.emit(true);
        this.performanceReportService.exportRapportPerformanceAvecRestaurantsUuids(startDate, endDate, typePeriodeCalcul, lang, listResto).subscribe((data: HttpResponse<any>) => {
          const fileName = data.headers.get('Content-Disposition').split('="')[1].replace('"', '');
          const newFileName = decodeURIComponent(fileName).split('-DATE')[0] + '.xlsx';
          FileSaver.saveAs(data.body, newFileName);
          this.displaySpinner.emit(false);
        }, error => {
          this.displaySpinner.emit(false);
        });
      } else {
        this.displaySpinner.emit(true);
        const lang = this.translateService.currentLang;

        let exportObservable;
        switch (typePeriodeCalcul.toUpperCase()) {
          case 'JOUR':
            exportObservable = this.performanceReportService.exportComparativeModeDayPerformanceReportForRestaurants(startDate, lang, this.uuidList);
            break;
          case 'SEMAINE':
            exportObservable = this.performanceReportService.exportComparativeModePerformanceReportForRestaurants(startDate, endDate, 'M', lang, this.uuidList);
            break;
          case 'MOIS':
            exportObservable = this.performanceReportService.exportComparativeModeMonthPerformanceReportForRestaurants(startDate, lang, this.uuidList);
            break;
        }
        exportObservable.subscribe((data: any) => {
          const fileName = data.headers.get('Content-Disposition').split('="')[1].replace('"', '');
          const newFileName = decodeURIComponent(fileName).split('-DATE')[0] + '.xlsx';
          FileSaver.saveAs(data.body, newFileName);
          this.displaySpinner.emit(false);

        }, error => {
          this.displaySpinner.emit(false);
          console.log('error', error);
        });
      }

    }
    if (this.parametreEnvoi.rapport.codeName === 'POSTES_TRAVAIL_RAPPORT') {
      const mode = this.parametreEnvoi.comparatifFile ? 1 : 2;
      this.displaySpinner.emit(true);
      if (this.parametreEnvoi.typePeriodeCalcul === 'JOUR') {
        this.rapportService.getRapportPosteTravailVueJour(this.dateService.formatToShortDate(this.parametreEnvoi.startDate),
          this.parametreEnvoi.decoupage, this.parametreEnvoi.listRestaurantDispaly, mode)
          .subscribe((data: HttpResponse<any>) => {
            const fileName = data.headers.get('rhis_file_name');
            const finalName = decodeURIComponent(fileName);
            FileSaver.saveAs(data.body, finalName);
            this.displaySpinner.emit(false);
          });

      } else if (this.parametreEnvoi.typePeriodeCalcul === 'SEMAINE') {
        this.rapportService.getRapportPosteTravailVueSemaine(this.dateService.formatToShortDate(this.parametreEnvoi.startDate),
          this.dateService.formatToShortDate(this.parametreEnvoi.endDate), this.parametreEnvoi.listRestaurantDispaly, mode)
          .subscribe((data: HttpResponse<any>) => {
            const fileName = data.headers.get('rhis_file_name');
            const finalName = decodeURIComponent(fileName);
            FileSaver.saveAs(data.body, finalName);
            this.displaySpinner.emit(false);
          });
      }
    }
  }

  private fetchPerformanceReportForRestaurant(reportUuid: string, datePipe: DatePipe, firstGeneration: boolean): void {
    this.displaySpinner.emit(true);
    this.disableEnableFom(true);

    const uuid = reportUuid ? reportUuid : this.uuidList[this.selectedReport.page];
    let startDate;
    let endDate;
    if (this.typePeriodeCalcul === 'mois') {
      const date = this.dateService.createDateFromStringPattern(this.selectedYear.toString(), 'yyyy');
      startDate = endDate = datePipe.transform(date, 'dd-MM-yyyy');
    } else {
      startDate = datePipe.transform(this.secondCalendarValues[0], 'dd-MM-yyyy');
      endDate = datePipe.transform(this.secondCalendarValues[1], 'dd-MM-yyyy');
    }
    const filter = this.typePeriodeCalcul.toUpperCase();
    let firstRestaurant = this.selectedRestaurants.find((val: any) => val.uuid === uuid);
    let restaurantName: string;
    if (firstRestaurant) {
      restaurantName = firstRestaurant.libelleRestaurant;
    }
    this.performanceReportService.getPerformanceReportWithRestaurantsUuids(
      startDate, endDate, filter, false, uuid)
      .subscribe(async response => {
        const [header, ecart] = this.performanceReportHelperService.generateHeaderAndEcartValues(response, filter);
        const mode = (await this.parametreGlobalService.getParameterByRestaurantUuIdAndCodeParameter(uuid, this.PALIER3_SUP_PARAM).toPromise()).valeur > 0 ? 1 : 0;
        this.generateRapport.emit({
          data: {
            performanceValues: response,
            header,
            ecart,
            filter,
            startDate,
            restaurantName,
            spMode: mode,
            typePeriodeCalcul: this.typePeriodeCalcul
          },
          documentName: 'Rapport_performance', firstGeneration: firstGeneration, listUuids: this.uuidList,
          comparatif: false
        });
        this.displaySpinner.emit(false);
        this.disableEnableFom(false);
      }, error => {
        console.log(error);
        this.displaySpinner.emit(false);
        this.disableEnableFom(false);
      });
  }

  private getComparatifReportAnalysePerf(restosUuids: string[], datePipe: DatePipe, firstGeneration: boolean): void {
    this.displaySpinner.emit(true);
    this.disableEnableFom(true);

    let startDate: any;
    let endDate: any;
    if (this.typePeriodeCalcul === 'mois') {
      startDate = endDate = datePipe.transform(this.monthModel.toString(), 'dd-MM-yyyy');
    } else if (this.typePeriodeCalcul === 'jour') {
      startDate = endDate = datePipe.transform(this.secondCalendarValues, 'dd-MM-yyyy');
    } else {
      startDate = datePipe.transform(this.secondCalendarValues[0], 'dd-MM-yyyy');
      endDate = datePipe.transform(this.secondCalendarValues[1], 'dd-MM-yyyy');
    }
    const lang = this.translateService.currentLang;
    let uuids: string[];
    if (restosUuids) {
      uuids = restosUuids;
    } else {
      uuids = this.uuidList.slice(this.selectedReport.page * 10, (this.selectedReport.page * 10) + 10);
    }
    let exportObservable;
    switch (this.typePeriodeCalcul) {
      case 'jour' :
        exportObservable = this.performanceReportService.latestSheetComparativeDayModePerformanceReportForRestaurants(startDate, lang, uuids);
        break;
      case 'semaine' :
        exportObservable = this.performanceReportService.latestSheetComparativeModePerformanceReportForRestaurants(startDate, endDate, 'M', 'fr', uuids);
        break;
      case 'mois' :
        exportObservable = this.performanceReportService.latestSheetComparativeMonthModePerformanceReportForRestaurants(startDate, 'fr', uuids);
        break;
    }
    exportObservable.subscribe((result: ComparativePerformanceSheet) => {
      this.generateRapport.emit({
        fileData: result
        , documentName: 'Rapport_performance',
        firstGeneration: firstGeneration,
        listUuids: this.uuidList,
        comparatif: true
      });

      this.displaySpinner.emit(false);
      this.disableEnableFom(false);
    }, error => {
      console.log('error', error);
      this.displaySpinner.emit(false);
      this.disableEnableFom(false);
    });
  }

  download(data, nomFichier): void {
    const linkSource = 'data:application/pdf;base64,' + data[nomFichier];
    FileSaver.saveAs(linkSource, nomFichier);
  }

  /**
   * Get weeks of month according to selected date
   */
  private getWeeksByMonthByRestaurant(): void {
    let selectedDate = this.dateService.formatToShortDate(new Date());
    let dateToGetCurrentWeek = new Date();
    if (this.selectedDate) {
      selectedDate = this.dateService.formatToShortDate(this.selectedDate);
      dateToGetCurrentWeek = this.selectedDate;
    }
    if (this.firstRestaurant) {
      this.restaurantService.getListWeekFromMonthByRestaurant(selectedDate, this.firstRestaurant.uuid).subscribe((weeksPerMonth: any) => {
        this.weeksPerMonth = weeksPerMonth;
        this.selectDateFirstCalendar(this.firstDayOfWeek(dateToGetCurrentWeek));
        this.selectDateSecondCalendar(
          this.isPerformanceWithModeAndFilter('PERFORMANCE_RAPPORT', this.comparatifFile, 'jour') ? new Date(this.secondCalendarValues) : this.firstDayOfWeek(dateToGetCurrentWeek)
        );
        this.initCalender();

      }, () => {
      });
    }
  }

  private isPerformanceWithModeAndFilter(reportCode: string, isComparative: boolean, filter: string): boolean {
    return isComparative && this.typePeriodeCalcul === filter && this.rapportCodeName === reportCode;
  }

  /**
   * Initialize calendars if no restaurant is selected
   */
  private initCalendarsWithNoSelectedResto(): void {
    this.values = [];
    this.values[0] = moment().weekday(1).toDate();
    this.values[1] = moment().weekday(7).toDate();
    if (this.rapportCodeName !== 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
      if (this.typePeriodeCalcul === 'jour') {
        this.secondCalendarValues = new Date();
      } else if (this.typePeriodeCalcul === 'semaine') {
        this.secondCalendarValues = [];
        let start = new Date(this.values[0].getTime() - (this.findDecalage(this.values[0]) * this.ONE_DAY_IN_MILLISECONDS));
        this.secondCalendarValues[0] = start;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        this.secondCalendarValues[1] = end;
      }
    }

  }

  /**
   * Get selected week according to selected date (RESUME PLG CALENDAR)
   */
  public selectDateFirstCalendar(date: any, fromSelectedDate?: boolean) {
    if (fromSelectedDate) {
      this.initCalendar = true;
      this.selectedDate = date;
    }

    this.changeValue();
    if (date && this.premierJourDeLaSemaine) {
      this.values = [];
      let start = new Date(date);
      start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
      this.values[0] = start;
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      this.values[1] = end;
    }
    this.checkButtonStatus();
  }

  /**
   * Get selected week according to selected date (ANALYSE PERF CALENDAR)
   */
  public selectDateSecondCalendar(date: any, fromSelectedDate?: boolean) {
    this.changeValue();
    if (fromSelectedDate) {
      this.initCalendar = true;
      this.selectedDate = date;
    }
    if (date && this.premierJourDeLaSemaine) {
      if (this.typePeriodeCalcul === 'semaine' || (this.typePeriodeCalcul === 'jour' && !this.comparatifFile)) {
        this.secondCalendarValues = [];
        let start = new Date(date);
        start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
        this.secondCalendarValues[0] = start;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        this.secondCalendarValues[1] = end;
      }

      if (this.typePeriodeCalcul === 'jour') {
        if (!fromSelectedDate && !this.comparatifFile) {
          this.secondCalendarValues = [];
          let start = new Date(date);
          start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          this.secondCalendarValues[0] = new Date(start.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
          this.secondCalendarValues[1] = new Date(end.getTime() - (7 * this.ONE_DAY_IN_MILLISECONDS));
        } else if (this.comparatifFile) {
          this.secondCalendarValues = new Date(date);
        }
      }

    }
    this.checkButtonStatus();
  }

  /**
   * Get selected week according to selected date Poste Travail
   */
  public selectDateCalendarPosteTravail(date: any, fromSelectedDate?: boolean) {
    this.changeValue();
    if (fromSelectedDate) {
      this.initCalendar = true;
      this.selectedDate = date;
    }
    if (date) {
      if (this.typePeriodeCalcul === 'semaine') {
        this.secondCalendarValues = [];
        let start = new Date(date);
        start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
        this.secondCalendarValues[0] = start;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        this.secondCalendarValues[1] = end;
      }
      if (this.typePeriodeCalcul === 'jour') {
        this.secondCalendarValues = new Date(date);
      }
    }
    this.checkButtonStatus();
  }

  /**
   * Get first week day from week list per month (for the first selected restaurant)
   */
  private firstDayOfWeek(selectedDate: any): Date {
    let date: any;
    this.weeksPerMonth.forEach((item: any) => {
      if (moment(this.dateService.setTimeNull(new Date(item.dateDebut))).isSameOrBefore(this.dateService.setTimeNull(new Date(selectedDate)))
        && moment(this.dateService.setTimeNull(new Date(item.dateFin))).isSameOrAfter(this.dateService.setTimeNull(new Date(selectedDate)))) {
        date = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      }
    });
    return date;
  }

  /**
   * enable/disable generate report button
   */
  private checkButtonStatus() {
    this.changeValue();
    if (this.rapportCodeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
      if (this.values && this.values.length && this.selectedRestaurants && this.selectedRestaurants.length) {
        this.disableButton = false;
      } else {
        this.disableButton = true;
      }
    } else if (this.selectedRestaurants && this.selectedRestaurants.length && this.typePeriodeCalcul) {
      if (((this.typePeriodeCalcul === 'jour' || this.typePeriodeCalcul === 'semaine') && this.secondCalendarValues && this.secondCalendarValues.length) ||
        (this.typePeriodeCalcul === 'mois' && this.selectedYear) || (this.typePeriodeCalcul === 'jour' && this.comparatifFile) || (this.typePeriodeCalcul === 'jour' && !this.comparatifFile)) {
        this.disableButton = false;
      } else {
        this.disableButton = true;
      }
    } else {
      this.disableButton = true;
    }
  }

  private disableEnableFom(enable: boolean): void {
    this.disableButton = enable;
    this.disableRadioButton = enable;
    this.disableListResto = enable;
    this.disableFirstCalendar = enable;
    this.disableCalculPeriod = enable;
    this.disableSecondCalendar = enable;
  }

  public checkMonthDate($event): void {
    console.log($event);
  }

  private getPosteTravailRapport(reportUuid: any, firstGeneration: boolean) {
    this.displaySpinner.emit(true);
    this.disableEnableFom(true);
    const vue = this.parametreEnvoi.typePeriodeCalcul === 'JOUR' ? 1 : 2;
    const comparatif = this.parametreEnvoi.comparatifFile;
    this.rapportService.getRapportPosteTravailData(this.dateService.formatToShortDate(this.parametreEnvoi.startDate),
      this.dateService.formatToShortDate(this.parametreEnvoi.endDate),
      this.parametreEnvoi.decoupage, reportUuid, vue)
      .subscribe((response: HttpResponse<any>) => {
        this.generateRapport.emit({
          data: response,
          documentName: 'Rapport planning par postes de travail',
          restaurants: this.uuidList,
          vue, comparatif,
          firstGeneration: firstGeneration
        });
        this.displaySpinner.emit(false);
        this.disableEnableFom(false);
        this.sharedService.tabEnvoiEmailDisabled = false;
      }, error => {
        console.log(error);
        this.displaySpinner.emit(false);
        this.disableEnableFom(false);
      });
  }

  public alignSizes(): void {
    const parent = document.getElementsByClassName('ui-dropdown ui-widget ui-state-default ui-corner-all')[0] as HTMLElement;
    const elementsByClassNameElement = document.getElementsByClassName('ui-dropdown-panel ui-widget ui-widget-content ui-corner-all')[0] as HTMLElement;
    elementsByClassNameElement.style.width = parent.offsetWidth + 'px';
  }
}
