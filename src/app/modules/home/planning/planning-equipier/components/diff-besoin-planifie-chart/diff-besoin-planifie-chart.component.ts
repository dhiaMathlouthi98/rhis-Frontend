import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {PlanningEquipierService} from '../../service/planning-equipier.service';
import {ShiftModel} from '../../../../../../shared/model/shift.model';
import {SynchroPlanningEquipierService} from '../../service/synchro-planning-equipier.service';
import {
  DecoupagePlanningEquipier,
  DiffBesoinChartColorEnum,
  WorkingPositionNbr
} from '../../../../../../shared/model/gui/planning.equipier.model';
import {DateService} from '../../../../../../shared/service/date.service';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {ReferenceShiftService} from '../../service/reference-shift.service';
import {ReferenceShiftModel} from '../../../../../../shared/model/reference-shift.model';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'rhis-diff-besoin-planifie-chart',
  templateUrl: './diff-besoin-planifie-chart.component.html',
  styleUrls: ['./diff-besoin-planifie-chart.component.scss']
})
export class DiffBesoinPlanifieChartComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output()
  public openDetailTempsPaye = new EventEmitter();
  public menuState: boolean;
  public nbrOfQuarterForAnHour = 4;
  public dataIsLoading = false;
  public levels = Array.from({length: 11}, (v, k) => k);
  public dataset = [{
    data: [],
    backgroundColor: [],
    borderWidth: 0,
    hoverBackgroundColor: [],
    hoverBorderColor: []
  }];
  public hours = [];
  public labels = [];
  public options: ChartOptions = {
    legend: {
      display: false
    },
    title: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        gridLines: {
          display: false,
          drawBorder: false,
          lineWidth: 0.5,
          borderDash: [8, 4, 2, 4],
          color: 'rgba(95,95,95,0.42)'
        },
        ticks: {
          display: false,
          autoSkip: false
        }
      }],
      yAxes: [{
        display: true,
        gridLines: {
          display: false,
          drawBorder: false,
          lineWidth: 1,
          color: '#242424FF',
          zeroLineColor: '#000000',
          zeroLineWidth: 2
        },
        ticks: {
          display: false,
          min: -5,
          max: 5,
          stepSize: 1
        }
      }]
    },
    layout: {
      padding: {
        left: -9,
        right: 1,
        bottom: -7,
        top: 1
      }
    },
    tooltips: {
      // Disable the on-canvas tooltip
      enabled: false,
      custom: function (tooltipModel) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');
        // Create element on first render
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.innerHTML = '<table></table>';
          tooltipEl.style.backgroundColor = '#FFFFFF';
          tooltipEl.style.borderColor = '#000000';
          tooltipEl.style.borderWidth = 'thin';
          tooltipEl.style.borderStyle = 'solid';
          document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = '0';
          return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
          tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }
        // Set Text
        let bodyLines = [];
        let totalNbr = 0;
        const index = tooltipModel.dataPoints[0].index;
        const data = this._data.datasets[0].data;
        let tableRoot: HTMLElement;
        if (tooltipModel.body) {
          const positionsNbr: WorkingPositionNbr[] = data[index]['extra'];
          bodyLines = positionsNbr.filter(positionNbr => positionNbr.nbr !== 0).map(
            positionNbr => positionNbr.position.libelle + ': ' + (positionNbr.nbr >= 0 ? '+' : '') + positionNbr.nbr);
          if (!bodyLines.length) {
            return;
          }
          totalNbr = positionsNbr.reduce((previousValue, currentValue) => previousValue + currentValue.nbr, 0);
          let innerHtml = '<thead>';
          innerHtml += '</thead><tbody>';
          bodyLines.forEach(function (body, i) {
            innerHtml += '<tr><td>' + body + '</td></tr>';
          });
          innerHtml += '</tbody>';
          tableRoot = tooltipEl.querySelector('table');
          tableRoot.innerHTML = innerHtml;
        }

        // `this` will be the overall tooltip
        const position = this._chart.canvas.getBoundingClientRect();
        const flipTooltip = index >= data.length - 12;
        // Display, position, and set styles for font
        tooltipEl.style.opacity = '1';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = position.left - (flipTooltip ? (tableRoot.clientWidth) : 0) + window.pageXOffset + tooltipModel.caretX + 'px';
        tooltipEl.style.top = (position.top + window.pageYOffset - ((bodyLines.length === 1 ? 0 : bodyLines.length) * 16 + (totalNbr < 0 ? -40 : 0))) + 'px';
        tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.fontFamily = 'TT Wellingtons Medium';
        tooltipEl.style.fontSize = '9px';
        tooltipEl.style.color = '#414141';
        tooltipEl.style.fontWeight = 'bold';
        tooltipEl.style.letterSpacing = '1px';
        tooltipEl.style.lineHeight = '14px';
        tooltipEl.style.textAlign = 'center';
        tooltipEl.style.border = '1px solid rgba(120, 121, 147, 0.3);';
        tooltipEl.style.borderRadius = '5px';
      }
    }
  };
  public chartWidth: string;
  private isReferenceShiftsImmutable = false;
  private displayedShifts: ShiftModel[] = [];
  private referenceShifts: ReferenceShiftModel[] = [];
  private referenceShiftsToBeSaved: ReferenceShiftModel[] = [];
  private startHour: Date;
  private endHour: Date;
  private today: Date;
  private destroy: Subject<boolean> = new Subject<boolean>();

  constructor(private rhisTranslateService: RhisTranslateService,
              private planningEquipierService: PlanningEquipierService,
              private synchroPlanningEquipierService: SynchroPlanningEquipierService,
              private referenceShiftService: ReferenceShiftService,
              private dateService: DateService,
              private globalSettings: GlobalSettingsService) {
  }

  ngOnInit() {
    this.getMenuState();
    this.listenToDisplayedShiftsUpdate();
    this.listenToDecoupageUpdate();
    this.listenToWeekAndDayLoading();
    this.listenToEquipierGlobalSave();
  }

  ngAfterViewInit() {
    this.setChartWidth();
  }

  public showMoreData(): void {
    this.openDetailTempsPaye.emit();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  private listenToEquipierGlobalSave(): void {
    this.synchroPlanningEquipierService.onEquipierGlobalSave().pipe(takeUntil(this.destroy)).subscribe(_ => {
      if (this.referenceShiftsToBeSaved.length) {
        this.referenceShiftService.saveReferenceShifts(this.referenceShiftsToBeSaved).pipe(takeUntil(this.destroy))
          .subscribe(() => this.referenceShiftsToBeSaved = []);
      }
    });
  }

  private listenToWeekAndDayLoading(): void {
    this.synchroPlanningEquipierService.getWeakLoading().pipe(takeUntil(this.destroy)).subscribe((isWeekLoaded: boolean) => {
      if (!this.isReferenceShiftsImmutable) {
        if (isWeekLoaded) {
          this.referenceShifts = [];
          this.generateWeekReferenceShifts(this.today);
          this.isReferenceShiftsImmutable = true;
        } else if (this.referenceShifts.length === 0) {
          this.referenceShifts = [];
          this.generateDayReferenceShifts(this.today);
        }
      }
    });
  }

  private getMenuState(): void {
    this.menuState = this.globalSettings.menuIsOpen;
    this.globalSettings.onToggleMenu().pipe(takeUntil(this.destroy)).subscribe(menuState => {
      this.menuState = menuState;
      this.setChartWidth();
    });
  }

  private listenToDecoupageUpdate(): void {
    this.dataIsLoading = true;
    this.synchroPlanningEquipierService.getDecoupage().pipe(takeUntil(this.destroy)).subscribe((decoupage: DecoupagePlanningEquipier) => {
      [this.startHour, this.endHour] = this.getStartEndHoursDates(decoupage);
      this.today = decoupage.date;
      this.referenceShiftsToBeSaved = [];
      this.getReferenceShifts(this.today);
      this.setChart(this.startHour, this.endHour);
      this.dataIsLoading = false;
      this.setChartWidth();
    });
  }

  private getReferenceShifts(today: Date): void {
    const day = this.dateService.formatToShortDate(today);
    this.referenceShiftService.getAll(day).pipe(takeUntil(this.destroy)).subscribe(((referenceShifts: ReferenceShiftModel[]) => {
      this.referenceShifts = referenceShifts;
      this.isReferenceShiftsImmutable = referenceShifts.length > 0;
      this.updateDataset(this.referenceShifts, this.displayedShifts, this.startHour, this.endHour, this.today);
    }));
  }

  private generateWeekReferenceShifts(today: Date): void {
    const day = this.dateService.formatToShortDate(today);
    this.dataIsLoading = true;
    this.referenceShiftService.generateWeekReferenceShifts(day).pipe(takeUntil(this.destroy)).subscribe(((referenceShifts: ReferenceShiftModel[]) => {
      const dayKey = day.split('-').reverse().join('-');
      this.referenceShifts = referenceShifts.filter(referenceShift => referenceShift.dateJournee === dayKey);
      this.referenceShiftsToBeSaved = referenceShifts;
      this.updateDataset(this.referenceShifts, this.displayedShifts, this.startHour, this.endHour, this.today);
      this.dataIsLoading = false;
    }));
  }

  private generateDayReferenceShifts(today: Date): void {
    const day = this.dateService.formatToShortDate(today);
    this.dataIsLoading = true;
    this.referenceShiftService.generateDayReferenceShifts(day).pipe(takeUntil(this.destroy)).subscribe(((referenceShifts: ReferenceShiftModel[]) => {
      this.referenceShifts = referenceShifts;
      this.referenceShiftsToBeSaved = referenceShifts;
      this.updateDataset(this.referenceShifts, this.displayedShifts, this.startHour, this.endHour, this.today);
      this.dataIsLoading = false;
    }));
  }

  private listenToDisplayedShiftsUpdate(): void {
    this.planningEquipierService.currentShiftList.pipe(takeUntil(this.destroy)).subscribe((listShift: ShiftModel[]) => {
      this.displayedShifts = listShift.filter((value: ShiftModel) => !value.fromPlanningManager && !value.fromPlanningLeader && value.modifiable);
      this.updateDataset(this.referenceShifts, this.displayedShifts, this.startHour, this.endHour, this.today);
    });
  }

  private setChart(startHour: Date, endHour: Date): void {
    const nbrOfQuarterHour = this.dateService.getDiffHeure(endHour, startHour) / 15;
    this.hours = Array.from({length: nbrOfQuarterHour + 1}, (k, v) => v);
    this.labels = Array.from({length: nbrOfQuarterHour}, (k, v) => v);
  }

  private updateDataset(referenceShifts: ReferenceShiftModel[], displayedShifts: ShiftModel[],
                        startHour: Date, endHour: Date, today: Date): void {
    this.initializeDataset();
    if (startHour && endHour) {
      for (let i = startHour; i <= endHour; i = this.dateService.getDateFromAddNumberOfToDate(15, 'minutes', i)) {
        const startQuarter = i;
        const endQuarter = this.dateService.getDateFromAddNumberOfToDate(15, 'minutes', startQuarter);
        const intersectionWithDisplayedShifts = this.getIntersectionWithListShifts(displayedShifts, startQuarter, endQuarter);
        const intersectionWithRefShifts = this.getIntersectionWithListReferenceShifts(referenceShifts, startQuarter, endQuarter, today);
        const workingPositionNbrInDisplayedShift = this.getWorkingPositionNbrFromDisplayedShifts(intersectionWithDisplayedShifts);
        const workingPositionNbrInRefShift = this.getWorkingPositionNbrFromReferenceShifts(intersectionWithRefShifts);
        const finalWorkingPositionNbr = this.getFinalWorkingnPositionNbr(workingPositionNbrInRefShift, workingPositionNbrInDisplayedShift);
        const totalNbr = finalWorkingPositionNbr.reduce((accumulate, workingPosition) => accumulate + workingPosition.nbr, 0);
        const backgroundColor = Math.abs(totalNbr) >= 5 ? DiffBesoinChartColorEnum.RED :
          (Math.abs(totalNbr) === 4 ? DiffBesoinChartColorEnum.PINK :
            (Math.abs(totalNbr) === 3 ? DiffBesoinChartColorEnum.ORANGE :
              (Math.abs(totalNbr) === 2 ? DiffBesoinChartColorEnum.YELLOW :
                (Math.abs(totalNbr) === 1 ? DiffBesoinChartColorEnum.GREEN : DiffBesoinChartColorEnum.TRANSPARENT))));
        this.addToDataset(totalNbr, finalWorkingPositionNbr, backgroundColor);
      }
    }
  }

  private addToDataset(totalNbr: number, finalWorkingPositionNbr: WorkingPositionNbr[], color: DiffBesoinChartColorEnum): void {
    this.dataset[0].data.push(
      {
        y: totalNbr,
        extra: finalWorkingPositionNbr
      }
    );
    this.dataset[0].backgroundColor.push(color);
    this.dataset[0].hoverBorderColor.push(color);
    this.dataset[0].hoverBackgroundColor.push(color);
  }

  private initializeDataset(): void {
    this.dataset[0].data = [];
    this.dataset[0].backgroundColor = [];
    this.dataset[0].hoverBorderColor = [];
    this.dataset[0].hoverBackgroundColor = [];
  }

  private getFinalWorkingnPositionNbr(workingPositionNbrInRefShift: WorkingPositionNbr[],
                                      workingPositionNbrInDisplayedShift: WorkingPositionNbr[]): WorkingPositionNbr[] {
    const finalWorkingPositionNbrDiff: WorkingPositionNbr[] = [];
    workingPositionNbrInRefShift.forEach(refPositionNbr => {
      const index = workingPositionNbrInDisplayedShift.findIndex(displayedPositionNbr =>
        refPositionNbr.position.idPositionTravail === displayedPositionNbr.position.idPositionTravail);
      finalWorkingPositionNbrDiff.push({
        position: refPositionNbr.position,
        nbr: (index !== -1 ? workingPositionNbrInDisplayedShift[index].nbr : 0) - refPositionNbr.nbr
      });
    });
    const workingPositionIds: number[] = finalWorkingPositionNbrDiff.map(positionNbr => positionNbr.position.idPositionTravail);
    return finalWorkingPositionNbrDiff.concat(
      workingPositionNbrInDisplayedShift.filter(
        displayedPositionNbr => !workingPositionIds.includes(displayedPositionNbr.position.idPositionTravail)
      )
    );
  }

  private getWorkingPositionNbrFromDisplayedShifts(shifts: ShiftModel[]): WorkingPositionNbr[] {
    const workingPositionNbr: WorkingPositionNbr[] = [];
    shifts.forEach((shift: ShiftModel) => {
      this.collectWorkingPositionNbr(workingPositionNbr, shift.positionTravail);
    });
    return workingPositionNbr;
  }

  private getWorkingPositionNbrFromReferenceShifts(referenceShifts: ReferenceShiftModel[]): WorkingPositionNbr[] {
    const workingPositionNbr: WorkingPositionNbr[] = [];
    referenceShifts.forEach((referenceShiftModel: ReferenceShiftModel) => {
      this.collectWorkingPositionNbr(workingPositionNbr, referenceShiftModel.positionTravail);
    });
    return workingPositionNbr;
  }

  private collectWorkingPositionNbr(workingPositionNbr: WorkingPositionNbr[], positionTravail: PositionTravailModel): void {
    const index = workingPositionNbr.findIndex((positionNbr) =>
      positionNbr.position.idPositionTravail === positionTravail.idPositionTravail);
    if (index !== -1) {
      workingPositionNbr[index].nbr += 1;
    } else {
      workingPositionNbr.push({position: positionTravail, nbr: 1});
    }
  }

  private getIntersectionWithListShifts(displayedShifts: ShiftModel[], startQuarter: Date, endQuarter: Date): ShiftModel[] {
    return displayedShifts.filter((shift: ShiftModel) => {
      let intersection: [Date, Date];
      if (shift.acheval) {
        intersection = this.dateService.getIntersectionOfTowDatesInterval([startQuarter, endQuarter], [shift.heureDebutCheval, shift.heureFinCheval]);
      } else {
        intersection = this.dateService.getIntersectionOfTowDatesInterval([startQuarter, endQuarter], [shift.heureDebut, shift.heureFin]);
      }
      return (intersection[0] !== null) && (intersection[1] !== null) && !this.dateService.isTheSameDates(...intersection);
    });
  }

  private getIntersectionWithListReferenceShifts(displayedShifts: ReferenceShiftModel[],
                                                 startQuarter: Date, endQuarter: Date, today: Date): ReferenceShiftModel[] {
    return displayedShifts.filter((shift: ReferenceShiftModel) => {
      const {startShift, endShift} = this.getReferenceShiftStartEndDates(shift, today);
      const intersection = this.dateService.getIntersectionOfTowDatesInterval([startQuarter, endQuarter], [startShift, endShift]);
      return (intersection[0] !== null) && (intersection[1] !== null) && !this.dateService.isTheSameDates(...intersection);
    });
  }

  private getShiftStartEndDates(heureDebut: Date,
                                heureDebutIsNight: boolean,
                                heureFin: Date,
                                heureFinIsNight: boolean): { startShift: Date, endShift: Date } {
    const startShift = this.dateService.getDateFromIsNight(heureDebut, heureDebutIsNight);
    startShift.setSeconds(0, 0);
    const endShift = this.dateService.getDateFromIsNight(heureFin, heureFinIsNight);
    endShift.setSeconds(0, 0);
    return {startShift, endShift};
  }

  private getReferenceShiftStartEndDates(referenceShift: ReferenceShiftModel, date: Date): { startShift: Date, endShift: Date } {
    const startShift = this.dateService.getDateFromIsNight(date, referenceShift.heureDebutIsNight);
    startShift.setHours(+referenceShift.heureDebut.substr(0, 2), +referenceShift.heureDebut.substr(3, 2), 0, 0);
    const endShift = this.dateService.getDateFromIsNight(date, referenceShift.heureFinIsNight);
    endShift.setHours(+referenceShift.heureFin.substr(0, 2), +referenceShift.heureFin.substr(3, 2), 0, 0);
    return {startShift, endShift};
  }

  private getStartEndHoursDates(decoupage: DecoupagePlanningEquipier): Date[] {
    const startHour = this.dateService.getDateFromIsNight(decoupage.date, decoupage.start.night);
    startHour.setHours(+decoupage.start.value.substr(0, 2), 0, 0, 0);
    const endHour = this.dateService.getDateFromIsNight(decoupage.date, decoupage.end.night);
    endHour.setHours(+decoupage.end.value.substr(0, 2), +decoupage.end.value.substr(3, 2), 0, 0);
    const quarterHourRest = endHour.getMinutes() % 15;
    if (endHour.getMinutes() !== 0 && (quarterHourRest !== 0)) {
      endHour.setMinutes(endHour.getMinutes() + (15 - quarterHourRest));
    }
    return [startHour, endHour];
  }

  private async setChartWidth(): Promise<void> {
    await this.dateService.delay(1700);
    const chartContainerSimilarWidth = document.getElementsByClassName('gridster-row')[0];
    if (chartContainerSimilarWidth) {
      this.chartWidth = window.getComputedStyle(chartContainerSimilarWidth).width;
    }
  }

}
