import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListProfilRestaurantComponent} from './list-profil-restaurant/list-profil-restaurant.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [  {
  path: 'ByRestaurant',
  component: ListProfilRestaurantComponent,
  canActivate: [AuthGuard], data: {name: 'ListProfilRestaurantComponent'}
} ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilRestaurantRoutingModule { }
