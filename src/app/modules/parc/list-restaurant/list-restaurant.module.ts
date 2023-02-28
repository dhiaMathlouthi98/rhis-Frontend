import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ListRestaurantRoutingModule} from './list-restaurant-routing.module';
import {ListRestaurantsTableComponent} from './list-restaurants-table/list-restaurants.component';
import {ListRestaurantCardComponent} from './list-restaurant-card/list-restaurant-card.component';
import {ActionsRestaurantComponent} from './list-restaurants-table/actions-restaurant/actions-restaurant.component';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  declarations: [
    ListRestaurantCardComponent,
    ListRestaurantsTableComponent,
    ActionsRestaurantComponent
  ],
  imports: [
    CommonModule,
    ListRestaurantRoutingModule,
    SharedModule
  ]
})
export class ListRestaurantModule {
}
