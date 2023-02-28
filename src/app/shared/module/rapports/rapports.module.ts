import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListRapportsComponent} from './components/list-rapports/list-rapports.component';
import {RapportsRoutingModule} from './rapports-routing.module';
import {PopupRapportsComponent} from './components/popup-rapports/popup-rapports.component';
import {AffichageRapportsComponent} from './components/affichage-rapports/affichage-rapports.component';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PopupPlanningJournalierComponent} from './components/popup-rapports/popup-planning-journalier/popup-planning-journalier.component';
import {InputSwitchModule} from 'primeng/components/inputswitch/inputswitch';
import {MultiSelectModule} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared.module';
import {GestionParametreEnvoiComponent} from '../../../modules/parc/generation-rapport-parc/gestion-parametre-envoi/gestion-parametre-envoi.component';


@NgModule({
  imports: [
    CommonModule,
    RapportsRoutingModule,
    PdfViewerModule,
    NgxExtendedPdfViewerModule,
    InputSwitchModule,
    MultiSelectModule,
    TableModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    PopupPlanningJournalierComponent,
    PopupRapportsComponent],
  declarations: [ListRapportsComponent, PopupRapportsComponent,
    AffichageRapportsComponent, PopupPlanningJournalierComponent,
    GestionParametreEnvoiComponent],
  providers: []
})
export class RapportsModule {
}
