import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanningEquipierComponent} from './components/planning-equipier.component';
import {SavingDataGuard} from 'src/app/shared/service/saving-data.guard';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';
import {PlanningPdfComponent} from './components/planning-pdf/planning-pdf.component';

const routes: Routes = [
  {
    path: '',
    component: PlanningEquipierComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'PlanningEquipierComponent'}
  },
  {
    path: 'pdf/:date/:heureSeparation/:minuteSeparation/:displayWeek/:sortBy/:mode/:selectedSections',
    component: PlanningPdfComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningEquipierRoutingModule {
}
