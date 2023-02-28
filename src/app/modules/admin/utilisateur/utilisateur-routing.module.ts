import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListUtilisateurComponent} from './component/list-utilisateur/list-utilisateur.component';
import {AddUtilisateurComponent} from './component/list-utilisateur/add-utilisateur/add-utilisateur.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ListUtilisateurComponent, canActivate: [AuthGuard], data: {name: 'ListUtilisateurComponent'}
  },
  {
    path: 'add',
    component: AddUtilisateurComponent,
    canActivate: [AuthGuard], data: {name: 'AddUtilisateurComponent'}
  },
  {
    path: ':idUser/update',
    component: AddUtilisateurComponent,
    canActivate: [AuthGuard], data: {name: 'AddUtilisateurComponent'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilisateurRoutingModule {
}
