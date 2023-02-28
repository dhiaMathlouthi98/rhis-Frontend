import {NgModule} from '@angular/core';
import {ResizeDirective} from './directive/resize.directive';
import {ChartsModule} from 'ng2-charts';
import {CheckboxModule} from 'primeng/checkbox';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {AccordionModule} from 'primeng/accordion';
import {DialogModule} from 'primeng/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ResizableModule} from 'angular-resizable-element';
import {WidthOnResizeDirective} from './directive/width-on-resize.directive';
import {ProgressBarComponent} from './component/progress-bar/progress-bar.component';
import {InfosTooltipComponent} from './component/infos-tooltip/infos-tooltip.component';
import {ClickOutsideTooltipDirective} from './directive/click-outside-tooltip.directive';
import {ClickOutsideDirective} from './directive/click-outside.directive';
import {ListboxModule} from 'primeng/listbox';
import {ToastModule} from 'primeng/toast';
import {MemoizePipe} from './pipe/memoize.pipe';
import {RhisCalendarComponent} from './component/rhis-calendar/rhis-calendar.component';
import {
    CalendarModule,
    ConfirmDialogModule,
    MenuModule,
    MultiSelectModule,
    RadioButtonModule,
    TabViewModule,
    TooltipModule
} from 'primeng/primeng';
import {PopUpComponent} from './component/pop-up/pop-up.component';
import {StyleFormDirective} from './directive/style-form.directive';
import {TwoDigitDecimaNumberDirective} from './directive/two-digit-decima-number.directive';
import {IntegerNumbersDirective} from './directive/integer-numbers.directive';
import {PopUpReportComponent} from './component/pop-up-report/pop-up-report.component';
import {EditModeDirective} from './directive/edit-mode.directive';
import {ViewModeDirective} from './directive/view-mode.directive';
import {PanelMenuModule} from 'primeng/panelmenu';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {SidebarModule} from 'primeng/sidebar';
import {EnterTabDirective} from './directive/enter.tab.directive';
import {HeightScrollableSectionDirective} from './directive/height-scrollable-section.directive';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {BlockUIModule} from 'primeng/blockui';
import {HighlightEmployeeDirective} from './directive/highlight-employee.directive';
import {NoCommaPipe} from './pipe/noComma.pipe';
import {FormatTimeDirective} from './directive/format-time.directive';
import {LangFirstWeekDayCalendarDirective} from './directive/lang-first-week-day-calendar.directive';
import {NoDoubleClickDirective} from './directive/no-double-click.directive';
import {RegexValidatorDirective} from './directive/regex-validator.directive';
import {SpaceAfterThousandsPipe} from './pipe/space-after-thousands.pipe';
import {ParamsModule} from './module/params/params.module';
import {PopUpGestionParcComponent} from './component/pop-up-gestion-parc/pop-up-gestion-parc.component';

@NgModule({
    imports: [
        MenuModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ChartsModule,
        CheckboxModule,
        CalendarModule,
        CommonModule,
        AccordionModule,
        DialogModule,
        TranslateModule,
        ResizableModule,
        RadioButtonModule,
        PanelMenuModule,
        TieredMenuModule,
        SidebarModule,
        ProgressSpinnerModule,
        BlockUIModule,
        DropdownModule,
        MultiSelectModule,
        TooltipModule
    ],
  declarations: [ResizeDirective,
    WidthOnResizeDirective,
    ProgressBarComponent,
    InfosTooltipComponent,
    ClickOutsideTooltipDirective,
    ClickOutsideDirective,
    MemoizePipe,
    RhisCalendarComponent,
    PopUpComponent,
    StyleFormDirective,
    PopUpReportComponent,
    TwoDigitDecimaNumberDirective,
    IntegerNumbersDirective,
    EditModeDirective,
    ViewModeDirective,
    EnterTabDirective,
    HeightScrollableSectionDirective,
    HighlightEmployeeDirective,
    NoCommaPipe,
    FormatTimeDirective,
    NoDoubleClickDirective,
    LangFirstWeekDayCalendarDirective,
    RegexValidatorDirective,
    SpaceAfterThousandsPipe,
    PopUpGestionParcComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ResizeDirective,
    ProgressBarComponent,
    ChartsModule,
    CheckboxModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    AccordionModule,
    DialogModule,
    TranslateModule,
    ResizableModule,
    ProgressSpinnerModule,
    BlockUIModule,
    WidthOnResizeDirective,
    InfosTooltipComponent,
    ClickOutsideTooltipDirective, ListboxModule, MemoizePipe, ConfirmDialogModule,
    ClickOutsideDirective,
    ToastModule,
    RhisCalendarComponent,
    PopUpComponent,
    StyleFormDirective,
    RadioButtonModule,
    TwoDigitDecimaNumberDirective,
    IntegerNumbersDirective,
    FormatTimeDirective,
    LangFirstWeekDayCalendarDirective,
    PopUpReportComponent,
    EditModeDirective,
    ViewModeDirective,
    MenuModule,
    PanelMenuModule,
    TieredMenuModule,
    SidebarModule,
    EnterTabDirective,
    HeightScrollableSectionDirective,
    HighlightEmployeeDirective,
    NoCommaPipe,
    NoDoubleClickDirective, RegexValidatorDirective,
    SpaceAfterThousandsPipe,
    TabViewModule,
    PopUpGestionParcComponent,
    ParamsModule
  ]
})
export class SharedModule {
}
