import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: 'societe', loadChildren: '../../shared/module/societe/societe.module#SocieteModule'},
  {path: 'utilisateur', loadChildren: './utilisateur/utilisateur.module#UtilisateurModule'},
  {path: 'profil', loadChildren: './profils/profils.module#ProfilsModule'},
  {path: 'franchise', loadChildren: '../home/franchise/franchise.module#FranchiseModule'}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
