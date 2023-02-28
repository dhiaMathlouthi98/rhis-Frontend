import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TypeRestaurantComponent} from './component/type-restaurant/type-restaurant.component';
import {AddRestaurantComponent} from './component/add-restaurant/add-restaurant.component';
import {EspaceSocieteComponent} from './component/espace-societe/espace-societe.component';
import {AddSocieteComponent} from './component/add-societe/add-societe.component';
import {EditSocieteComponent} from './component/edit-societe/edit-societe.component';
import {SavingDataGuard} from '../../service/saving-data.guard';
import {ListRestaurantsComponent} from './component/list-restaurants/list-restaurants.component';
import {ListSocietesComponent} from './component/list-societes/list-societes.component';
import {ListTypesRestaurantComponent} from './component/list-types-restaurant/list-types-restaurant.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'space', canActivate: [AuthGuard]
  },
  {
    path: 'space',
    component: EspaceSocieteComponent, canActivate: [AuthGuard], data: {name: 'EspaceSocieteComponent'}
  },
  {
    path: 'type-restaurant',
    component: TypeRestaurantComponent, data: {name: 'TypeRestaurantComponent'}
  },
  {
    path: 'types-restaurants',
    component: ListTypesRestaurantComponent, canActivate: [AuthGuard], data: {name: 'ListTypesRestaurantComponent'}
  },
  {
    path: 'new-restaurant',
    component: AddRestaurantComponent, canActivate: [AuthGuard], data: {name: 'AddRestaurantComponent'}
  },
  {
    path: ':uuidSociete/add-restaurant',
    component: AddRestaurantComponent, canActivate: [AuthGuard], data: {name: 'AddRestaurantComponent'}
  },
  {
    path: 'new-company',
    component: AddSocieteComponent, canActivate: [AuthGuard], data: {name: 'AddSocieteComponent'}
  },
  {
    path: 'edit-company',
    component: EditSocieteComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'EditSocieteComponent'}
  },
  {
    path: 'restaurants/:uuidRestaurant',
    component: EditSocieteComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'EditSocieteComponent'}
  },
  {
    path: 'all/:uuidSociete',
    component: EditSocieteComponent,
    canDeactivate: [SavingDataGuard], canActivate: [AuthGuard], data: {name: 'EditSocieteComponent'}
  },
  {
    path: 'restaurants',
    component: ListRestaurantsComponent, canActivate: [AuthGuard], data: {name: 'ListRestaurantsComponent'}
  },
  {
    path: ':uuidSociete/restaurants/all',
    component: ListRestaurantsComponent, canActivate: [AuthGuard], data: {name: 'ListRestaurantsComponent'}
  },
  {
    path: 'all',
    component: ListSocietesComponent, canActivate: [AuthGuard], data: {name: 'ListSocietesComponent'}
  },
  {
    path: ':uuidFranchise/restaurantsFranchise/all',
    component: ListRestaurantsComponent, canActivate: [AuthGuard], data: {name: 'ListRestaurantsComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocieteRoutingModule {
}
