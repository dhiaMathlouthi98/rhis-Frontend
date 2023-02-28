import {NgModule} from '@angular/core';
import {AffichageLoiRestaurantComponent} from './affichage-loi-restaurant/affichage-loi-restaurant.component';
import {ModificationLoiRestaurantComponent} from './modification-loi-restaurant/modification-loi-restaurant.component';
import {SharedModule} from '../../../shared.module';
import {LoiRestaurantRoutingModule} from './loi-restaurant-routing.module';

@NgModule({
  declarations: [AffichageLoiRestaurantComponent, ModificationLoiRestaurantComponent],
  imports: [
    SharedModule,
    LoiRestaurantRoutingModule
  ],
  exports: [AffichageLoiRestaurantComponent, ModificationLoiRestaurantComponent]
})
export class LoiRestaurantModule { }
