import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParcRoutingModule} from './parc.routing.module';
import {OngletEnvoiRapportComponent} from './generation-rapport-parc/onglet-envoi-rapport/onglet-envoi-rapport.component';
import {
  AutoCompleteModule, FieldsetModule,
  InputSwitchModule,
  InputTextareaModule,
  InputTextModule,
  MultiSelectModule, OverlayPanelModule,
  PaginatorModule,
  RadioButtonModule, TooltipModule
} from 'primeng/primeng';
import {SharedModule} from '../../shared/shared.module';
import {OngletParametresComponent} from './generation-rapport-parc/onglet-parametres/onglet-parametres.component';
import {GenerationRapportParcComponent} from './generation-rapport-parc/generation-rapport-parc.component';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {PerformanceReportModule} from '../../shared/module/performance-report/performance-report.module';
import {ParamNationauxModule} from 'src/app/shared/module/params/param-nationaux/param-nationaux.module';
import {JourFeriesModule} from '../../shared/module/params/jours-feries/jourFeries.module';
import {ParamPlanningModule} from '../../shared/module/params/param-planning/param-planning.module';
import {GestionAlerteModule} from '../../shared/module/configuration/component/gestion-alerte/gestion-alerte.module';
import {RapportRhModule} from 'src/app/shared/module/rapports-rh/rapport-rh-list/rapport-rh.module';
import {EditDocRhModule} from 'src/app/shared/module/rapports-rh/edit-doc-rh/edit-doc-rh.module';
import { AnalysePerformanceReportComponent } from './generation-rapport-parc/analyse-performance-report/analyse-performance-report.component';
import { GestionPaieComponent } from './gestion-paie/gestion-paie.component';
import { GdhService } from '../home/gdh/service/gdh.service';
import {DownloadComponent} from "./gestion-paie/download/download.component";
import {EnvoiComponent} from './gestion-paie/envoi/envoi.component'
import {ValidationComponent} from "./gestion-paie/validation/validation.component";
import {ParametreValidationPaieComponent} from './gestion-paie/parametre-validation-paie/parametre-validation-paie.component';
import {ParametrePlaceholderComponent} from './gestion-paie/parametre-validation-paie/parametre-placeholder/parametre-placeholder.component';
import {PosteTravailReportComponent} from './generation-rapport-parc/poste-travail-report/poste-travail-report.component';
@NgModule({
  declarations: [
    OngletEnvoiRapportComponent,
    OngletParametresComponent,
    GenerationRapportParcComponent,
    AnalysePerformanceReportComponent,
    GestionPaieComponent,
    DownloadComponent,
    ValidationComponent,
    EnvoiComponent,
    ParametreValidationPaieComponent,
    ParametrePlaceholderComponent,
    PosteTravailReportComponent
  ],
  imports: [
    CommonModule,
    ParcRoutingModule,
    RadioButtonModule,
    AutoCompleteModule,
    InputTextModule,
    InputTextareaModule,
    SharedModule,
    InputSwitchModule,
    MultiSelectModule,
    NgxExtendedPdfViewerModule,
    PdfViewerModule,
    PaginatorModule,
    PerformanceReportModule,
    JourFeriesModule,
    ParamNationauxModule,
    ParamPlanningModule,
    GestionAlerteModule,
    ParamPlanningModule,
    RapportRhModule,
    EditDocRhModule,
    FieldsetModule,
    TooltipModule,
    OverlayPanelModule
  ],
  providers: [
    GdhService
  ]
})
export class ParcModule {
}
