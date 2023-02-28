import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProfilRestaurantRoutingModule} from './profil-restaurant-routing.module';
import {ListProfilRestaurantComponent} from './list-profil-restaurant/list-profil-restaurant.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {OverlayPanelModule, PasswordModule, ScrollPanelModule} from 'primeng/primeng';
import {ListProfilMobileComponent} from './list-profil-restaurant/list-profil-mobile/list-profil-mobile.component';

@NgModule({
  declarations: [ListProfilRestaurantComponent, ListProfilMobileComponent],
  imports: [
    CommonModule,
    ProfilRestaurantRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PasswordModule,
    OverlayPanelModule,
    ScrollPanelModule
  ]
})
export class ProfilRestaurantModule { }
