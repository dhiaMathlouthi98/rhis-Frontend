import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TypeContratComponent} from './component/type-contrat/type-contrat.component';
import {GestionBadgeComponent} from './component/gestion-badge/gestion-badge.component';
import {PeriodePaieComponent} from './component/periode-paie/periode-paie.component';
import {TypeSanctionComponent} from './component/type-sanction/type-sanction.component';
import {MotifSortieComponent} from './component/motif-sortie/motif-sortie.component';
import {MoyenTransportComponent} from './component/moyen-transport/moyen-transport.component';
import {PeriodiciteComponent} from './component/periodicite/periodicite.component';
import {ProcedureComponent} from './component/procedure/procedure.component';
import {TypePointageComponent} from './component/type-pointage/type-pointage.component';
import {GroupTravailComponent} from './component/group-travail/group-travail.component';
import {ListFormationComponent} from './component/list-formation/list-formation.component';
import {TypeEvenementComponent} from './component/type-evenement/type-evenement.component';
import {PosteTravailComponent} from './component/poste-travail/poste-travail.component';
import {GestionNationaliteComponent} from './component/gestion-nationalite/gestion-nationalite.component';
import {SavingDataGuard} from '../../../shared/service/saving-data.guard';
import {ModeVenteComponent} from './component/mode-vente/mode-vente.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'type-contrat',
    component: TypeContratComponent, canActivate: [AuthGuard], data: {name: 'TypeContratComponent'}
  },
  {
    path: 'badge',
    component: GestionBadgeComponent, canActivate: [AuthGuard], data: {name: 'GestionBadgeComponent'}
  },
  {
    path: 'periode-paie',
    component: PeriodePaieComponent, canActivate: [AuthGuard], data: {name: 'PeriodePaieComponent'}
  },
  {
    path: 'type-sanction',
    component: TypeSanctionComponent, canActivate: [AuthGuard], data: {name: 'TypeSanctionComponent'}
  },
  {
    path: 'motif-sortie',
    component: MotifSortieComponent, canActivate: [AuthGuard], data: {name: 'MotifSortieComponent'}
  },
  {
    path: 'moyen-transport',
    component: MoyenTransportComponent, canActivate: [AuthGuard], data: {name: 'MoyenTransportComponent'}
  },
  {
    path: 'periodicite',
    component: PeriodiciteComponent, canActivate: [AuthGuard], data: {name: 'PeriodiciteComponent'}
  },
  {
    path: 'procedure',
    component: ProcedureComponent, canActivate: [AuthGuard], data: {name: 'ProcedureComponent'}
  },
  {
    path: 'type-pointage',
    component: TypePointageComponent, canActivate: [AuthGuard], data: {name: 'TypePointageComponent'}
  }, 
  {path: 'param-restaurant',
   loadChildren: '../../../shared/module/params/param-nationaux/param-nationaux.module#ParamNationauxModule'},
  {
    path: 'poste-travail',
    component: PosteTravailComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'PosteTravailComponent'}
  }, {
    path: 'group-travail',
    component: GroupTravailComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'GroupTravailComponent'}
  },
  {
    path: 'type-evenement',
    component: TypeEvenementComponent, canActivate: [AuthGuard], data: {name: 'TypeEvenementComponent'}
  }, {
    path: 'list-formation',
    component: ListFormationComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'ListFormationComponent'}
  }
  , {
    path: 'jours-feries',
    loadChildren: '../../../shared/module/params/jours-feries/jourFeries.module#JourFeriesModule'
  },
  {
    path: 'nationalite',
    component: GestionNationaliteComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'GestionNationaliteComponent'}
  },
  {
    path: 'mode-vente',
    component: ModeVenteComponent, canActivate: [AuthGuard], data: {name: 'ModeVenteComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
