import {Component, OnDestroy, OnInit} from '@angular/core';
import {EcranAccueilService} from '../../../service/ecran.accueil.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {LocaleSettings} from 'primeng/primeng';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {ExcelService} from './performance-excel-export/excel.service';
import {PerformanceReportHelperService} from '../../../../../../shared/module/performance-report/service/performance-report-helper.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {PerformanceReportService} from "../../../../../parc/services/performance-report.service";
import {DatePipe} from "@angular/common";
import {RestaurantModel} from "../../../../../../shared/model/restaurant.model";
import {RestaurantService} from "../../../../../../shared/service/restaurant.service";
import {JourSemaine} from "../../../../../../shared/enumeration/jour.semaine";
import {ParametreGlobalService} from "../../../../configuration/service/param.global.service";

@Component({
  selector: 'rhis-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit, OnDestroy {

  public DISPLAY_WEEK = 'JOUR';
  public DISPLAY_MONTH = 'SEMAINE';
  public DISPLAY_YEAR = 'MOIS';
  public selectedDate: Date = new Date();
  public displayIntervall = this.DISPLAY_WEEK;
  public performanceValues: any;
  public summaryPeriodDisplay: string;
  public loading = false;
  public ecart: number[] = [];
  public formattedDates: string[] = [];
  public calendarSettings: LocaleSettings;
  private notifier = new Subject();
  private datePipe = new DatePipe('en-US');
  private premierJourDeLaSemaine: JourSemaine;
  private ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  private mode: 0 | 1;
  private readonly PALIER3_SUP_PARAM = 'PALIER3_SUP';
  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private excelService: ExcelService,
              private performanceReportService: PerformanceReportService,
              private restaurantService: RestaurantService,
              private parametreGlobalService: ParametreGlobalService,
              private performanceReportHelperService: PerformanceReportHelperService) {}


  async ngOnInit(): Promise<void> {
    this.setCalendarConfig();
    this.mode = (await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.PALIER3_SUP_PARAM).toPromise()).valeur > 0 ? 1 : 0;
    this.restaurantService.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.premierJourDeLaSemaine = data.parametreNationaux.premierJourSemaine;
          this.getPerformanceByTimeIntervall(this.DISPLAY_WEEK);
        }
    );
  }

  public setCalendarConfig(): void {
    const tr = this.rhisTranslateService;

    this.calendarSettings = {
      dayNames: [tr.translate('DAYS_WEEK.SUNDAY').toLowerCase(), tr.translate('DAYS_WEEK.MONDAY').toLowerCase()
        , tr.translate('DAYS_WEEK.TUESDAY').toLowerCase(), tr.translate('DAYS_WEEK.WEDNESDAY').toLowerCase()
        , tr.translate('DAYS_WEEK.THURSDAY').toLowerCase(), tr.translate('DAYS_WEEK.FRIDAY').toLowerCase()
        , tr.translate('DAYS_WEEK.SATURDAY').toLowerCase()]
      , dayNamesShort: [tr.translate('SHORT_WEEK_DAYS.DIMANCHE') + '.', tr.translate('SHORT_WEEK_DAYS.LUNDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.MARDI') + '.', tr.translate('SHORT_WEEK_DAYS.MERCREDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.JEUDI') + '.', tr.translate('SHORT_WEEK_DAYS.VENDREDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.SAMEDI') + '.']
      , dayNamesMin:  [tr.translate('SHORT_WEEK_DAYS.DIMANCHE') + '.', tr.translate('SHORT_WEEK_DAYS.LUNDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.MARDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.MERCREDI') + '.', tr.translate('SHORT_WEEK_DAYS.JEUDI') + '.'
        , tr.translate('SHORT_WEEK_DAYS.VENDREDI') + '.', tr.translate('SHORT_WEEK_DAYS.SAMEDI') + '.']
      , monthNames: [tr.translate('MOIS_COMPLET.JANVIER'), tr.translate('MOIS_COMPLET.FEVRIER'), tr.translate('MOIS_COMPLET.MARS')
        , tr.translate('MOIS_COMPLET.AVRIL'), tr.translate('MOIS_COMPLET.MAI'), tr.translate('MOIS_COMPLET.JUIN')
        , tr.translate('MOIS_COMPLET.JUILLET'), tr.translate('MOIS_COMPLET.AOUT'), tr.translate('MOIS_COMPLET.SEPTEMBRE')
        , tr.translate('MOIS_COMPLET.OCTOBRE'), tr.translate('MOIS_COMPLET.NOVEMBRE'), tr.translate('MOIS_COMPLET.DECEMBRE')],

      monthNamesShort: [tr.translate('SHOR_MOIS.JAN') + '.', tr.translate('SHOR_MOIS.FEV') + '.', tr.translate('SHOR_MOIS.MARS') + '.'
        , tr.translate('SHOR_MOIS.AVRIL') + '.', tr.translate('SHOR_MOIS.MAI') + '.', tr.translate('SHOR_MOIS.JUIN') + '.'
        , tr.translate('SHOR_MOIS.JUL') + '.', tr.translate('SHOR_MOIS.AOUT') + '.', tr.translate('SHOR_MOIS.SEP') + '.'
        , tr.translate('SHOR_MOIS.OCT') + '.', tr.translate('SHOR_MOIS.NOV') + '.', tr.translate('SHOR_MOIS.DEC') + '.'],
      today: 'Aujourd\'hui',
      clear: 'Fermer'
    };
  }

  public getPerformanceByTimeIntervall(intervall: string): void {
    this.notifier.next();
    this.displayIntervall = intervall;
    const [start, end] = this.getDatesLimits(this.selectedDate, this.displayIntervall, this.premierJourDeLaSemaine)
    this.loading = true;
    this.performanceReportService.getPerformanceReportWithRestaurantsUuids(start, end, this.displayIntervall, true)
        .pipe(takeUntil(this.notifier))
        .subscribe(perf => {
        this.performanceValues = perf;
        this.formattedDates = [];
        this.generateHeaderAndEcartValues();
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  private getDatesLimits(date: Date, filter: string, premierJourDeLaSemaine: JourSemaine): [string, string] {
    let start, end;
    let startDate, endDate;
    switch (filter) {
      case 'JOUR':
        const offset = this.performanceReportHelperService.findDecalage(date, premierJourDeLaSemaine);
        startDate = new Date(date.getTime() - (offset * this.ONE_DAY_IN_MILLISECONDS));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      default:
        startDate = endDate = date;
        break;
    }
    start = this.datePipe.transform(startDate, 'dd-MM-yyyy');
    end = this.datePipe.transform(endDate, 'dd-MM-yyyy');
    return [start, end];
  }

  private generateHeaderAndEcartValues(): void {
    const filter = {
      value: this.displayIntervall,
      JOUR: this.DISPLAY_WEEK,
      SEMAINE: this.DISPLAY_MONTH,
      MOIS: this.DISPLAY_YEAR
    };
    this.performanceValues.caPrevisionnel
        .forEach(cap => this.performanceReportHelperService.getPerformanceReportHeader(
            cap.name, filter, this.formattedDates));
    this.summaryPeriodDisplay = this.performanceReportHelperService.getSummaryPeriodDisplay(this.performanceValues, filter, this.selectedDate);
    this.ecart = this.performanceReportHelperService.getEcart(this.performanceValues);
  }

  public generateExcelOrCSVFile(): void {
    this.excelService.generateExcel(this.formattedDates, this.performanceValues, this.ecart);
  }

  public ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
