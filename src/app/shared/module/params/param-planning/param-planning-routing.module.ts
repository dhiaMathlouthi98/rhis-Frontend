import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ParametrePlanningComponent} from './parametre-planning/parametre-planning.component';
import {SavingDataGuard} from '../../../service/saving-data.guard';

const routes: Routes = [
  {
    path: '',
    canDeactivate: [SavingDataGuard],
    component: ParametrePlanningComponent,
    data: {name: 'ParametrePlanningComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParamPlanningRoutingModule {
}
