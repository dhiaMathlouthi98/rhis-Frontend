import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ParametreRestaurantComponent} from 'src/app/shared/module/params/param-nationaux/components/parametre-restaurant/parametre-restaurant.component';
import {SavingDataGuard} from 'src/app/shared/service/saving-data.guard';
import {GenerationRapportParcComponent} from './generation-rapport-parc/generation-rapport-parc.component';
import {OngletParametresComponent} from './generation-rapport-parc/onglet-parametres/onglet-parametres.component';
import {ListJoursFeriesComponent} from '../../shared/module/params/jours-feries/component/list-jours-feries.component';
import {OngletEnvoiRapportComponent} from './generation-rapport-parc/onglet-envoi-rapport/onglet-envoi-rapport.component';
import {AuthGuard} from '../../authentication/guards/auth.guard';
import {RapportComponent} from 'src/app/shared/module/rapports-rh/rapport-rh-list/rapport/rapport.component';
import {GestionPaieComponent} from './gestion-paie/gestion-paie.component';
import {ParametreValidationPaieComponent} from './gestion-paie/parametre-validation-paie/parametre-validation-paie.component';

const routes: Routes = [
  {path: 'List', loadChildren: './list-restaurant/list-restaurant.module#ListRestaurantModule'},
  {path: 'list-rapport', loadChildren: '../../shared/module/rapports/rapports.module#RapportsModule'},
  {path: 'loi-restaurant', loadChildren: './lois-restaurants/lois-restaurants.module#LoisRestaurantsModule'},
  {path: 'email', component: OngletParametresComponent},
  {
    path: 'list-rapport/display-rapport-parc/generation-rapport-parc', component: GenerationRapportParcComponent
  },
  {path: 'email', component: OngletEnvoiRapportComponent},
  {path: 'restaurant', loadChildren: '../../shared/module/params/param-globaux/param-globaux.module#ParamGlobauxModule'},
  {
    path: 'param-nationaux', component: ParametreRestaurantComponent,
    canDeactivate: [SavingDataGuard],
    data: {name: 'ParametreRestaurantComponent'}
  },
  {
    path: 'jours-feries', component: ListJoursFeriesComponent, canDeactivate: [SavingDataGuard], data: {name: 'ListJoursFeriesComponent'}
  },
  {
    path: 'parametre-planning',
    loadChildren: '../../shared/module/params/param-planning/param-planning.module#ParamPlanningModule'
  },
  {
    path: 'rapport',
    component: RapportComponent, canActivate: [AuthGuard], data: {name: 'RapportComponent'}
  },
  {
    path: 'gestion-alerte',
    loadChildren: '../../shared/module/configuration/component/gestion-alerte/gestion-alerte.module#GestionAlerteModule'
  },
  {path: 'edit-doc-rh', loadChildren: '../../shared/module/rapports-rh/edit-doc-rh/edit-doc-rh.module#EditDocRhModule'},
  {
    path: 'gestion-paie', component: GestionPaieComponent
  },
  {
    path: 'parametre-validation-paie',
    canDeactivate: [SavingDataGuard], component: ParametreValidationPaieComponent , data: {name: 'ParametreValidationPaieComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParcRoutingModule {
}
