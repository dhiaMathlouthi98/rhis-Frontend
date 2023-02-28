import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {UtilisateurRoutingModule} from './utilisateur-routing.module';
import {ListUtilisateurComponent} from './component/list-utilisateur/list-utilisateur.component';
import {SharedModule} from '../../../shared/shared.module';
import {AddUtilisateurComponent} from './component/list-utilisateur/add-utilisateur/add-utilisateur.component';
import {PasswordModule} from 'primeng/password';
import {OverlayPanelModule} from 'primeng/overlaypanel';

import {ScrollPanelModule} from 'primeng/scrollpanel';
import {SuppressionUtilisateurComponent} from './component/list-utilisateur/suppression-utilisateur/suppression-utilisateur.component';

@NgModule({
  declarations: [ListUtilisateurComponent, AddUtilisateurComponent, SuppressionUtilisateurComponent],
  imports: [
    CommonModule,
    UtilisateurRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PasswordModule,
    OverlayPanelModule,
    ScrollPanelModule

  ]
})
export class UtilisateurModule {
}
