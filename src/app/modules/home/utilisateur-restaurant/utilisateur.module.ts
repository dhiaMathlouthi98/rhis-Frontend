import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UtilisateurRoutingModule} from './utilisateur-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {OverlayPanelModule, PasswordModule, ScrollPanelModule, TabViewModule} from 'primeng/primeng';
import {ListUtilisateurRestaurantComponent} from './component/list-utilisateur-restaurant/list-utilisateur-restaurant.component';
import {AffecterUtilisateurComponent} from './component/list-utilisateur-restaurant/affecter-utilisateur/affecter-utilisateur.component';
import {ListUtilisateurMobileComponent} from './component/list-utilisateur-mobile/list-utilisateur-mobile.component';

@NgModule({
  declarations: [AffecterUtilisateurComponent, ListUtilisateurRestaurantComponent, ListUtilisateurMobileComponent],
  imports: [
    CommonModule,
    UtilisateurRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PasswordModule,
    OverlayPanelModule,
    ScrollPanelModule,
    TabViewModule
  ]
})
export class UtilisateurModule {
}
