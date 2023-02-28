import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListRestaurantCardComponent} from './list-restaurant-card/list-restaurant-card.component';

const routes: Routes = [
  {path: 'restaurantList', component: ListRestaurantCardComponent},
  {path: 'restaurantList/:uuidFranchise', component: ListRestaurantCardComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListRestaurantRoutingModule {
}
