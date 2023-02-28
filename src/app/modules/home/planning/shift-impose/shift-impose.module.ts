import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ShiftImposeRoutingModule} from './shift-impose-routing.module';
import {SharedModule} from '../../../../shared/shared.module';
import {InputSwitchModule} from 'primeng/primeng';
import {PlanningPosteCardComponent} from './component/planning-poste-card/planning-poste-card.component';
import {PlanningsFixesPosteRowComponent} from './component/plannings-fixes-poste-row/plannings-fixes-poste-row.component';
import {PlanningFixesShiftCardComponent} from './component/planning-fixes-shift-card/planning-fixes-shift-card.component';
import {PlanningsFixesEmployeeRowComponent} from './component/plannings-fixes-employee-row/plannings-fixes-employee-row.component';
import {PlanningFixesContainerComponent} from './component/planning-fixes-container/planning-fixes-container.component';
import {PlanningBesoinImposeContainerComponent} from './component/planning-besoin-impose-container/planning-besoin-impose-container.component';
import {PlanningHomeComponent} from './component/planning-home/planning-home.component';
import {RapportsModule} from '../../../../shared/module/rapports/rapports.module';

@NgModule({
  declarations: [
    PlanningHomeComponent,
    PlanningFixesContainerComponent,
    PlanningsFixesEmployeeRowComponent,
    PlanningFixesShiftCardComponent,
    PlanningsFixesPosteRowComponent,
    PlanningPosteCardComponent,
    PlanningBesoinImposeContainerComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ShiftImposeRoutingModule,
    InputSwitchModule,
    RapportsModule
  ]
})
export class ShiftImposeModule {
}
