import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Chart, ChartData, ChartOptions, ChartTooltipItem} from 'chart.js';
import {Color, Label} from 'ng2-charts';

@Component({
  selector: 'rhis-chart-evolution',
  templateUrl: './chart-evolution.component.html',
  styleUrls: ['./chart-evolution.component.scss']
})
export class ChartEvolutionComponent implements OnInit {
  public lineChartColors: Color[];
  public options: ChartOptions;
  public headerParams;
  public title;

  @Output()
  public getChiffreAffaireByFilter = new EventEmitter();

  @Input()
  set headerConfig(settings) {
    this.headerParams = settings;
  }

  @Input()
  set initTitle(title: String) {
    this.title = title;
  }

  public index = -1;

  public lineChartData = [
    100, 20, 159, 5, 250, 5, 90];
  public lineChartLabels: Label[] = ['2016', '2017', '2018', '2019', '2020', '2021', '2022'];
  public lineChartType = 'line';

  @Input()
  set chartConfig(settings) {
    this.lineChartColors = [
      {
        backgroundColor: 'transparent',
        borderColor: settings.borderColor,
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: settings.pointBorderColor,
        pointBorderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: settings.pointHoverBackgroundColor,
        pointHoverBorderColor: settings.pointHoverBorderColor,
      }];
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: false,
      title: {
        display: true
      },
      legend: {
        display: false
      },
      tooltips: {
        mode: 'nearest',
        custom: function (tooltip) {
          tooltip.displayColors = false;
        },
        callbacks: {
          title: function (tooltipItems, data) {
            return '';
          },
          label: function (tooltipItem: ChartTooltipItem, data: ChartData) {
            const label = data.labels[tooltipItem.index];
            return '    ' + data.datasets[0].data[tooltipItem.index].toString();
          }
        },
        backgroundColor: settings.tooltip.backgroundColor,
        bodyFontColor: settings.tooltip.bodyFontColor,
        bodyFontFamily: 'TT Wellingtons DemiBold',
        borderColor: settings.tooltip.borderColor,
        borderWidth: 1,
        bodyFontSize: 11,
        cornerRadius: 5,
        xPadding: 9,
        yPadding: 9
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            fontColor: settings.scales.xAxes.ticks.fontColor,
            fontFamily: 'TT Wellingtons Light',
            fontStyle: '500',
            fontSize: 14,
            padding: 30
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            offsetGridLines: true,
            color: settings.scales.yAxes.gridLines.color,
            drawBorder: true
          },
          ticks: {
            fontSize: 16,
            beginAtZero: true,
            callback: function (value: string) {
              let returnedValue = value;
              if ((+value) >= 1000) {
                returnedValue = ((+value) / 1000).toFixed(0) + 'K';
              }
              if ((+value) >= 1000000) {
                returnedValue = ((+value) / 1000000).toFixed(0) + 'M';
              }
              return returnedValue;
            }
          }
        }]
      },
      animation: {
        duration: 0,
        onComplete: (chart) => {
          const chartInstance = chart.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.textBaseline = 'bottom';
          chartInstance.config.data.datasets.forEach((dataset, i) => {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              let data = dataset.data[index];
              if ((+data) >= 1000) {
                data = this.index === 1 ? ((+data) / 1000).toFixed(2) + 'K' : ((+data) / 1000).toFixed(0) + 'K';
              }
              if ((+data) >= 1000000) {
                data = ((+data) / 1000000).toFixed(0) + 'M';
              }
              ctx.fillStyle = settings.scales.xAxes.ticks.fontColor;
              ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
          });
        }
      }
    };
  }

  @Input()
  set initIndexValue(index: number) {
    this.index = index;
  }

  @Input()
  set initChartData(charteData: any) {
    this.lineChartData = charteData;
  }

  @Input()
  set initChartLabel(charteLabel: Label[]) {
    this.lineChartLabels = charteLabel;
  }

  constructor() {
  }

  public setIndex(i: number): void {
    if (this.index !== i) {
      this.getChiffreAffaireByFilter.emit(i);
    }
    this.index = i;
  }

  getBorderStyle(i): string {
    if (this.headerParams) {
      return this.index === i ? this.headerParams.selectedPeriodBorderStyle : '';
    }
  }

  ngOnInit() {
    this.getChiffreAffaireByFilter.emit(this.index);
  }
}
