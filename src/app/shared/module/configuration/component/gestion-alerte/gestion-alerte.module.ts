import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GestionAlerteRoutingModule} from './gestion-alerte-routing.module';
import {GestionAlerteComponent} from './gestion-alerte/gestion-alerte.component';
import {SharedModule} from '../../../../shared.module';
import {AccueilModule} from '../../../../../modules/home/accueil/accueil.module';

@NgModule({
  declarations: [
    GestionAlerteComponent
  ],
  imports: [
    CommonModule,
    GestionAlerteRoutingModule,
    SharedModule,
    AccueilModule
  ],
  exports: [
    GestionAlerteComponent
  ]
})
export class GestionAlerteModule {
}
