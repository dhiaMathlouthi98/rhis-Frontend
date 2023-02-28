import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ContainerComponent} from './component/charte-positionnement/container/container.component';
import {SavingDataGuard} from '../../../shared/service/saving-data.guard';
import {VenteHoraireComponent} from './component/vente-horaire/vente-horaire.component';
import {PrevisionsComponent} from './component/previsions/previsions.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PrevisionsComponent,
    canActivate: [AuthGuard], data: {name: 'PrevisionsComponent'}
  },
  {
    path: 'charte-positionnement',
    component: ContainerComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'ContainerComponent'}
  }, {
    path: 'vente-horaire/:date/:id/:realVentes',
    component: VenteHoraireComponent, canActivate: [AuthGuard], data: {name: 'VenteHoraireComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrevisionsRoutingModule {
}
