import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Column, ComparativePerformance, ComparativePerformanceSheet, Item} from 'src/app/shared/model/analysePerformanceModel';

@Component({
    selector: 'rhis-analyse-performance-report',
    templateUrl: './analyse-performance-report.component.html',
    styleUrls: ['./analyse-performance-report.component.scss']
})

export class AnalysePerformanceReportComponent implements OnInit, OnChanges {
    @Input() public data: ComparativePerformanceSheet;
    // -4 --> no sp and no cp are displayed
    // 1 --> only sp25 and sp50 are displayed
    // 2 --> only sp10, sp20 and sp50 are displayed
    // 3 --> all of sp10, sp20, sp25, sp50 are displayed
    public displayMode: number;
    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data && changes.data.currentValue) {
            this.data = changes.data.currentValue;
            this.configureDisplayMode();
        }
    }

    private configureDisplayMode(): void {
        const restaurantsModes: (1 | 2) [] = this.data.data.map(restaurantData => restaurantData.modeRestaurant);
        const maxModeValue = Math.max(...restaurantsModes);
        const minModeValue = Math.min(...restaurantsModes)
        if (maxModeValue !== minModeValue) {
            this.displayMode = 3;
        } else {
            this.displayMode = maxModeValue;
        }
    }

    ngOnInit() {
    }

    public getValueByCode(line: ComparativePerformance, column: Column): string {

        if (column.code === 'A') {
            return line.restaurantName;
        } else {
            const item = line.periodsInfos[0].items.find((val: Item<number>) => val.code === column.code);
            let itemDisplay: string;
            if (item) {
                if (this.displayMode == 3 &&
                    (   (line.modeRestaurant == 1 && ['AC', 'AD'].includes(column.code)) ||
                        (line.modeRestaurant == 2 && 'AE' === column.code)   )) {
                    itemDisplay = 'N/A';
                } else {
                    itemDisplay = this.getDecimal(item.value) + ' ' + column.unit;
                }
            }
            return itemDisplay;
        }
    }

    private getDecimal(value: number): number {
        if (value > 0 && (value / Math.trunc(value) === 1)) {
            return Math.trunc(value);
        } else {
            return value;
        }
    }

  public getRedColumnStyle(index: number): string {
    return ['J', 'Q', 'T'].includes(this.data.columns[index].code) ? 'red' : '';
  }

    public isASeparator(code: string, displayMode: number): boolean {
        if ((displayMode == 1 && code === 'AF') ||
            (displayMode == 2 && code === 'AG') ||
            (displayMode == 3 && code === 'AH')) {
            return true
        }
        return false;
    }
}
