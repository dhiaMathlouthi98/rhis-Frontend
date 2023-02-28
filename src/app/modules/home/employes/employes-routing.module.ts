import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListEmployesComponent} from './component/list-employes/list-employes.component';
import {DetailEmployeComponent} from './component/detail-employe/detail-employe.component';
import {InfosPersonnellesComponent} from './component/infos-personnelles/infos-personnelles.component';
import {ContratsComponent} from './component/contrats/contrats.component';
import {QualificationsComponent} from './component/qualifications/qualifications.component';
import {DisciplineComponent} from './component/discipline/discipline.component';
import {JourReposComponent} from './component/jourRepos/jour-repos.component';
import {AbsenceCongeVisiteMedicaleComponent} from './component/absence-conge-visite-medicale/absence-conge-visite-medicale.component';
import {SavingDataGuard} from '../../../shared/service/saving-data.guard';
import {AuthGuard} from '../../../authentication/guards/auth.guard';
import {RapportComponent} from 'src/app/shared/module/rapports-rh/rapport-rh-list/rapport/rapport.component';

const routes: Routes = [
  {path: '', component: ListEmployesComponent, canActivate: [AuthGuard], data: {name: 'ListEmployesComponent'}},
  {
    path: ':idEmployee/detail', component: DetailEmployeComponent, canActivate: [AuthGuard],
    data: {name: 'DetailEmployeComponent'}, children: [
      {
        path: '',
        redirectTo: 'infos', canActivate: [AuthGuard]
      },
      {
        path: 'infos',
        component: InfosPersonnellesComponent,
        canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'InfosPersonnellesComponent'}
      },
      {
        path: 'contrat',
        component: ContratsComponent,
        canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'ContratsComponent'}
      },
      {
        path: 'absence-conge',
        component: AbsenceCongeVisiteMedicaleComponent,
        canActivate: [AuthGuard], data: {name: 'AbsenceCongeVisiteMedicaleComponent'}
      },
      {
        path: 'rapport',
        component: RapportComponent, canActivate: [AuthGuard], data: {name: 'RapportComponent'}
      },
      {
        path: 'discipline',
        component: DisciplineComponent,
        canActivate: [AuthGuard], data: {name: 'DisciplineComponent'}
      },
      {
        path: 'qualification',
        component: QualificationsComponent,
        canDeactivate: [SavingDataGuard],
        canActivate: [AuthGuard], data: {name: 'QualificationsComponent'}
      }
      ,
      {
        path: 'indisponibilites',
        component: JourReposComponent, canActivate: [AuthGuard], data: {name: 'JourReposComponent'}
      }
    ]
  },
  {
    path: 'add',
    component: DetailEmployeComponent, canActivate: [AuthGuard], data: {name: 'DetailEmployeComponent'}, children: [
      {
        path: '',
        component: InfosPersonnellesComponent,
        canDeactivate: [SavingDataGuard],
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployesRoutingModule {
}
