import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestComponent} from './test/test.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: './shift-impose/shift-impose.module#ShiftImposeModule'
  },
  {
    path: 'configuration',
    loadChildren: './configuration/configuration.module#ConfigurationModule'
  }, {
    path: 'test/:id/:date',
    component: TestComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule {
}
