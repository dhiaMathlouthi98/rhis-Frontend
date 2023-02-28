import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PlanningManagerRoutingModule} from './planning-manager-routing.module';
import {SharedModule} from '../../../../shared/shared.module';
import {InputSwitchModule} from 'primeng/primeng';
import {PlanningManagerContainerComponent} from './component/planning-manager-container/planning-manager-container.component';
import {PlanningManagerRowComponent} from './component/planning-manager-row/planning-manager-row.component';
import {PlanningManagerCardComponent} from './component/planning-manager-shift-card/planning-manager-card.component';
import {SplitButtonModule} from 'primeng/splitbutton';
import {PlanningManagerVuePosteContainerComponent} from './component/planning-manager-vue-poste-container/planning-manager-vue-poste-container.component';
import {RapportsModule} from '../../../../shared/module/rapports/rapports.module';


@NgModule({
  declarations: [
    PlanningManagerContainerComponent,
    PlanningManagerRowComponent,
    PlanningManagerCardComponent,
    PlanningManagerVuePosteContainerComponent


  ],
  imports: [
    SharedModule,
    CommonModule,
    PlanningManagerRoutingModule,
    InputSwitchModule,
    SplitButtonModule,
    RapportsModule
  ]
})
export class PlanningManagerModule {
}
