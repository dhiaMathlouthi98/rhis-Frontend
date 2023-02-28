import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListUtilisateurRestaurantComponent} from './component/list-utilisateur-restaurant/list-utilisateur-restaurant.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'ByRestaurant', component: ListUtilisateurRestaurantComponent,
    canActivate: [AuthGuard], data: {name: 'ListUtilisateurRestaurantComponent'}
  }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UtilisateurRoutingModule {
}
