import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePageComponent} from './component/home-page/home-page.component';
import {DisplayAllAlerteComponent} from '../../layout/component/header/alert/display-all-alerte/display-all-alerte.component';
import {AnalyticsComponent} from './component/analytics/analytics.component';

const routes: Routes = [
  {
    path: '', component: HomePageComponent, children: [
      {path: '', component: AnalyticsComponent},
      {path: 'employee', loadChildren: '../employes/employes.module#EmployesModule'},
      {path: 'edit-doc-rh', loadChildren: '../../../shared/module/rapports-rh/edit-doc-rh/edit-doc-rh.module#EditDocRhModule'},
      {path: 'previsions', loadChildren: '../previsions/previsions.module#PrevisionsModule'},
      {path: 'configuration', loadChildren: '../configuration/configuration.module#ConfigurationModule'},
      {path: 'restaurant', loadChildren: '../../../shared/module/restaurant/restaurant.module#RestaurantModule'},
      {path: 'societe', loadChildren: '../../../shared/module/societe/societe.module#SocieteModule'},
      {path: 'franchise', loadChildren: '../franchise/franchise.module#FranchiseModule'},
      {path: 'planning', loadChildren: '../planning/planning.module#PlanningModule'},
      {path: 'gdh', loadChildren: '../gdh/gdh.module#GdhModule'},
      {path: 'utilisateur', loadChildren: '../utilisateur-restaurant/utilisateur.module#UtilisateurModule'},
      {path: 'profil', loadChildren: '../profil-restaurant/profil-restaurant.module#ProfilRestaurantModule'},
      {path: 'all-alerte', component: DisplayAllAlerteComponent},
      {path: 'rapports', loadChildren: '../../../shared/module/rapports/rapports.module#RapportsModule'},
      {
        path: 'parametre-planning',
        loadChildren: '../../../shared/module/params/param-planning/param-planning.module#ParamPlanningModule'
      },
      {
        path: 'gestion-alerte',
        loadChildren: '../../../shared/module/configuration/component/gestion-alerte/gestion-alerte.module#GestionAlerteModule'
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccueilRoutingModule {
}
