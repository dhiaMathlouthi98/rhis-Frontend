import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GestionAlerteComponent} from './gestion-alerte/gestion-alerte.component';
import {SavingDataGuard} from '../../../../service/saving-data.guard';


const routes: Routes = [
  {
    path: '',
    canDeactivate: [SavingDataGuard],
    component: GestionAlerteComponent,
    data: {name: 'GestionAlerteComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionAlerteRoutingModule {
}
