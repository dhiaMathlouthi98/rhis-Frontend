import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
    selector: 'rhis-performance-table',
    templateUrl: './performance-table.component.html',
    styleUrls: ['./performance-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceTableComponent implements OnChanges{


    @Input() header: string[];
    @Input() filter: string;
    @Input() performanceValues: any;
    @Input() ecart: any;
    @Input() endDate: any;
    @Input() tableTitle: string;
    @Input() applyStyle: boolean;
    @Input() DISPLAY_YEAR;
    @Input() typePeriode: string;
    @Input() spMode: 0 | 1;
    public periodWidth = '';

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.typePeriode && changes.typePeriode.currentValue){
        this.typePeriode = changes.typePeriode.currentValue;
        if(this.typePeriode === 'mois'){
          this.periodWidth = '165%';
        } else {
          this.periodWidth = '110%';
        }
      }
    }
  public getColumns(): string {
    let gridColumnsTemplate = '20%';
    let valueColumn = 0;
    if (this.performanceValues && this.performanceValues.caPrevisionnel) {
      valueColumn = Math.trunc((80 / (this.performanceValues.caPrevisionnel.length)));
      for (let i = 0; i < this.performanceValues.caPrevisionnel.length - 1; i++) {
        gridColumnsTemplate = gridColumnsTemplate.concat(valueColumn.toString()).concat('% ');
      }
        gridColumnsTemplate = gridColumnsTemplate.concat((100 - (valueColumn * (this.performanceValues.caPrevisionnel.length - 1)) - 20)
            .toString()).concat('%');
    }
    return gridColumnsTemplate;
  }


  public getColumnsParc(): string {
    let gridColumnsTemplate = '10%';
        let valueColumn = 0;
        if (this.performanceValues && this.performanceValues.caPrevisionnel) {
          valueColumn = Math.trunc((95 / (this.performanceValues.caPrevisionnel.length)));
            for (let i = 0; i < this.performanceValues.caPrevisionnel.length - 1; i++) {
                gridColumnsTemplate = gridColumnsTemplate.concat(valueColumn.toString()).concat('% ');
            }
        }
    let increment = 0;
    if(this.typePeriode === 'mois'){
      increment = 1;
    }
      if (this.performanceValues && this.performanceValues.caPrevisionnel) {
          gridColumnsTemplate = gridColumnsTemplate.concat((100 - (valueColumn * (this.performanceValues.caPrevisionnel.length - 1)) - 10 + increment)
              .toString()).concat('%');
      }
        return gridColumnsTemplate;
    }

    public getFormattedHeuresSuppComp(value: number): string {
        if (value !== null) {
            return (value / 60).toFixed(2);
        }
        return null;
    }

    public getPaliers(performanceValues: any, mode: 0 | 1): string[] {
        if (performanceValues) {
            return mode === 1 ? ['sp10', 'sp20'] : ['sp25'];
        }
        return [];
    }
}
