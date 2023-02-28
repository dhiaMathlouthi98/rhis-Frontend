import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddProfilGlobalComponent} from './componenet/add-profil-global/add-profil-global.component';
import {ListProfilGlobalComponent} from './componenet/list-profil-global/list-profil-global.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'all/add',
    component: AddProfilGlobalComponent,
    canActivate: [AuthGuard], data: {name: 'AddProfilGlobalComponent'}
  },
  {
    path: 'all/:uuidProfil/update',
    component: AddProfilGlobalComponent,
    canActivate: [AuthGuard], data: {name: 'AddProfilGlobalComponent'}
  },
  {
    path: 'all/listGlobal',
    component: ListProfilGlobalComponent,
    canActivate: [AuthGuard], data: {name: 'ListProfilGlobalComponent'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilsRoutingModule {
}
