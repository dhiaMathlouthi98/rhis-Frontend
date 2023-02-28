import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ConfigurationRoutingModule} from './configuration-routing.module';
import {AfficherDecoupageHoraireComponent} from './component/decoupage-horaire/afficher-decoupage-horaire/afficher-decoupage-horaire.component';
import {DecoupageHoraireComponent} from './component/decoupage-horaire/decoupage-horaire.component';
import {ModifierDecoupageHoraireComponent} from './component/decoupage-horaire/modifier-decoupage-horaire/modifier-decoupage-horaire.component';
import {EditableDecoupageHoraireComponent} from './component/decoupage-horaire/editable-decoupage-horaire/editable-decoupage-horaire.component';
import {GestionAbsenteismeComponent} from './component/gestion-absenteisme/gestion-absenteisme.component';
import {CharteDecoupageComponent} from './component/charte-decoupage/charte-decoupage.component';
import {CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent} from './component/charte-decoupage-absenteisme-productivite-decoupage-horaire/charte-decoupage-absenteisme-productivite-decoupage-horaire.component';
import {GestionProductiviteComponent} from './component/gestion-productivite/gestion-productivite.component';
import {ModeVenteParPhaseComponent} from './component/mode-vente-par-phase/mode-vente-par-phase.component';
import {SharedModule} from '../../../../shared/shared.module';
import {FieldsetModule} from 'primeng/primeng';

@NgModule({
  declarations: [AfficherDecoupageHoraireComponent,
    DecoupageHoraireComponent,
    ModifierDecoupageHoraireComponent,
    EditableDecoupageHoraireComponent,
    GestionAbsenteismeComponent,
    CharteDecoupageComponent,
    CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent,
    GestionProductiviteComponent,
    ModeVenteParPhaseComponent],
  imports: [
    SharedModule,
    FieldsetModule,
    CommonModule,
    ConfigurationRoutingModule
  ]
})
export class ConfigurationModule {
}
