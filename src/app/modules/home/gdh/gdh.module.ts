import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {GdhRoutingModule} from './gdh-routing.module';
import {DayViewComponent} from './component/day-view/day-view.component';
import {OWL_DATE_TIME_FORMATS, OwlDateTimeModule} from 'ng-pick-datetime';
import {GdhComponent} from './gdh.component';
import {WeekViewComponent} from './component/week-view/week-view.component';
import {PayeViewComponent} from './component/paye-view/paye-view.component';
import {FilterPopupComponent} from './component/filter-popup/filter-popup.component';
import {CommentairePopupComponent} from './component/commentaire-popup/commentaire-popup.component';
import {DayHourlyViewComponent} from './component/day-hourly-view/day-hourly-view.component';
import {User2LettrePipe} from './pipe/user-2-lettre.pipe';
import {UserUpperFirstLetterPipe} from './pipe/user-UpperFirstLetter.pipe';
import {ColorPointageTimePipe} from './pipe/color-pointage-time.pipe';
import {TempPlanifiesTimePipe} from './pipe/temp-planifies-time.pipe';
import {TempPointesTimePipe} from './pipe/temp-pointes-time.pipe';
import {TempAbsencesPipe} from './pipe/temp-absences.pipe';
import {DeltaTimePipe} from './pipe/delta-time.pipe';
import {HeureComplSuppPipe} from './pipe/heure-compl-supp.pipe';
import {CentiemeTimePipe} from './pipe/centieme-time.pipe';
import {InfoAbsencesPipe} from './pipe/info-absences.pipe';
import {ResizableModule} from 'angular-resizable-element';
import {HoursDivComponent} from './component/hours-div/hours-div.component';
import {PopoverModule} from 'ngx-smart-popover';
import {GdhService} from './service/gdh.service';
import {AddPointageAbsenceFormComponent} from './component/add-pointage-absence-form/add-pointage-absence-form.component';
import {CentiemeSuppCompHoursPipe} from './pipe/centieme-supp-comp-hours.pipe';
import {GdhDayNoteService} from './service/gdh-day-note.service';
import {EmployeeInfoPopoverComponent} from './component/employee-info-popover/employee-info-popover.component';
import {OwlMomentDateTimeModule} from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time.module';
import {ListboxModule, OverlayPanelModule, TabViewModule, InputSwitchModule} from 'primeng/primeng';
import {OngletVariablePaieComponent} from './component/onglet-variable-paie/onglet-variable-paie.component';
import {PayFileStructureComponent} from './component/pay-file-structure/pay-file-structure.component';
import {PaySchemaGeneratorComponent} from './component/pay-schema-generator/pay-schema-generator.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlexLayoutModule} from '@angular/flex-layout';
import { PrintVoucherComponent } from './component/print-voucher/print-voucher.component';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import {FirstLastNameFilterQueue} from './service/first-last-name-filter-queue.service';
import { HundredthTimeComponent } from './component/hundredth-time/hundredth-time.component';
import { OngletValidationComponent } from './component/onglet-validation/onglet-validation.component';

export const MY_MOMENT_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'ddd DD MMM YYYY',
  datePickerInput: 'ddd DD MMM YYYY',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  imports: [
    CommonModule,
    GdhRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlMomentDateTimeModule,
    ResizableModule,
    PopoverModule,
    TabViewModule,
    DragDropModule,
    FlexLayoutModule,
    ListboxModule,
    OverlayPanelModule,
    InputSwitchModule
  ],
  exports: [
    DeltaTimePipe
  ],
  declarations: [
    GdhComponent,
    DayViewComponent,
    DayHourlyViewComponent,
    WeekViewComponent,
    PayeViewComponent,
    FilterPopupComponent,
    CommentairePopupComponent,
    HoursDivComponent,
    TempPlanifiesTimePipe,
    TempPointesTimePipe,
    TempAbsencesPipe,
    DeltaTimePipe,
    HeureComplSuppPipe,
    CentiemeTimePipe,
    User2LettrePipe,
    UserUpperFirstLetterPipe,
    ColorPointageTimePipe,
    InfoAbsencesPipe,
    AddPointageAbsenceFormComponent,
    CentiemeSuppCompHoursPipe,
    EmployeeInfoPopoverComponent,
    OngletVariablePaieComponent,
    PayFileStructureComponent,
    PaySchemaGeneratorComponent,
    PrintVoucherComponent,
    SearchFilterComponent,
    HundredthTimeComponent,
    OngletValidationComponent
  ],
  providers: [
    GdhService,
    GdhDayNoteService,
    FirstLastNameFilterQueue,
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS},
  ]
})
export class GdhModule {
}
