import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParamPlanningRoutingModule} from './param-planning-routing.module';
import {ParametrePlanningComponent} from './parametre-planning/parametre-planning.component';
import {FieldsetModule} from 'primeng/primeng';
import {SharedModule} from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ParametrePlanningComponent
  ],
  imports: [
    CommonModule,
    ParamPlanningRoutingModule,
    SharedModule,
    FieldsetModule
  ],
  exports: [
    ParametrePlanningComponent
  ]
})
export class ParamPlanningModule {
}
