import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanningFixesContainerComponent} from './component/planning-fixes-container/planning-fixes-container.component';
import {SavingDataGuard} from '../../../../shared/service/saving-data.guard';
import {PlanningBesoinImposeContainerComponent} from './component/planning-besoin-impose-container/planning-besoin-impose-container.component';
import {PlanningHomeComponent} from './component/planning-home/planning-home.component';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PlanningHomeComponent, canActivate: [AuthGuard], data: {name: 'PlanningHomeComponent'}
  }, {
    path: 'plannings-fixes',
    component: PlanningFixesContainerComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'PlanningFixesContainerComponent'}
  }, {
    path: 'besoin-impose',
    component: PlanningBesoinImposeContainerComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'PlanningBesoinImposeContainerComponent'}
  }, {
    path: 'planning-manager',
    loadChildren: '../planning-manager/planning-manager.module#PlanningManagerModule'
  }, {
    path: 'planning-leader',
    loadChildren: '../planning-manager/planning-manager.module#PlanningManagerModule'
  }, {
    path: 'planning-equipier',
    loadChildren: '../planning-equipier/planning-equipier.module#PlanningEquipierModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShiftImposeRoutingModule {
}
