import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanningManagerContainerComponent} from './component/planning-manager-container/planning-manager-container.component';
import {SavingDataGuard} from '../../../../shared/service/saving-data.guard';
import {PlanningManagerVuePosteContainerComponent} from './component/planning-manager-vue-poste-container/planning-manager-vue-poste-container.component';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PlanningManagerContainerComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'PlanningManagerContainerComponent'}
  },
  {
    path: 'vuePoste',
    component: PlanningManagerVuePosteContainerComponent,
    canDeactivate: [SavingDataGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningManagerRoutingModule {
}
