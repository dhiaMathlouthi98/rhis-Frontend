import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DecoupageHoraireComponent} from './component/decoupage-horaire/decoupage-horaire.component';
import {CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent} from './component/charte-decoupage-absenteisme-productivite-decoupage-horaire/charte-decoupage-absenteisme-productivite-decoupage-horaire.component';
import {SavingDataGuard} from '../../../../shared/service/saving-data.guard';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'decoupage-horaire',
    component: DecoupageHoraireComponent,
    canActivate: [AuthGuard], data: {name: 'DecoupageHoraireComponent'}
  },
  {
    path: 'gestion-decoupage-horaire',
    component: CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent,
    canDeactivate: [SavingDataGuard],
    canActivate: [AuthGuard],
    data: {name: 'CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
