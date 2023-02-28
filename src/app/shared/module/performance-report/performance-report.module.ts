import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PerformanceTableComponent} from './component/performance-table/performance-table.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../shared.module';

@NgModule({
    declarations: [PerformanceTableComponent],
    imports: [
        CommonModule,
        TranslateModule,
        SharedModule
    ],
    exports: [PerformanceTableComponent]
})
export class PerformanceReportModule {
}
