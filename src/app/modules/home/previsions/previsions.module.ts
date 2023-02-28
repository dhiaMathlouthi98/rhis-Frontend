import {NgModule} from '@angular/core';

import {PrevisionsRoutingModule} from './previsions-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {VueTableauComponent} from './component/charte-positionnement/vue-tableau/vue-tableau.component';
import {ContainerComponent} from './component/charte-positionnement/container/container.component';
import {VueGraphiqueComponent} from './component/charte-positionnement/vue-graphique/vue-graphique.component';
import {PositionDeTravailComponent} from './component/charte-positionnement/vue-graphique/position-de-travail/position-de-travail.component';
import {AddCharteComponent} from './component/charte/add-charte/add-charte.component';
import {PrevisionsComponent} from './component/previsions/previsions.component';
import {AccueilModule} from '../accueil/accueil.module';
import {DragDropModule} from 'primeng/dragdrop';
import {MultiSelectModule} from 'primeng/multiselect';
import {VenteHoraireComponent} from './component/vente-horaire/vente-horaire.component';
import {FileUploadModule, PaginatorModule, ProgressBarModule} from 'primeng/primeng';

@NgModule({
  declarations: [
    VueTableauComponent,
    ContainerComponent,
    VueGraphiqueComponent,
    PositionDeTravailComponent,
    AddCharteComponent,
    PrevisionsComponent,
    VenteHoraireComponent
  ],
  imports: [
    SharedModule,
    PrevisionsRoutingModule,
    DragDropModule,
    MultiSelectModule,
    AccueilModule,
    PaginatorModule,
    FileUploadModule,
    ProgressBarModule
  ]
})
export class PrevisionsModule {
}
