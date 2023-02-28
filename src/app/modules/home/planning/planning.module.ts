import {NgModule} from '@angular/core';

import {PlanningRoutingModule} from './planning-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {FieldsetModule} from 'primeng/primeng';
import {TestComponent} from './test/test.component';


@NgModule({
  declarations: [TestComponent],
  imports: [
    SharedModule,
    PlanningRoutingModule,
    FieldsetModule
  ]
})
export class PlanningModule {
}
