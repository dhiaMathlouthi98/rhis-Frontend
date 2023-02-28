import {NgModule} from '@angular/core';
import {EmployesRoutingModule} from './employes-routing.module';
import {ListEmployesComponent} from './component/list-employes/list-employes.component';
import {ActionsEmployeComponent} from './component/list-employes/actions-employe/actions-employe.component';
import {DetailEmployeComponent} from './component/detail-employe/detail-employe.component';
import {SharedModule} from '../../../shared/shared.module';
import {InfosPersonnellesComponent} from './component/infos-personnelles/infos-personnelles.component';
import {InfosPrincipalesComponent} from './component/contrats/infos-principales/infos-principales.component';
import {ContratsComponent} from './component/contrats/contrats.component';
import {HeuresRepartitionComponent} from './component/contrats/heures-repartition/heures-repartition.component';
import {ContratFieldsetComponent} from './component/contrats/contrat-fieldset/contrat-fieldset.component';
import {AbsencesCongesComponent} from './component/absence-conge-visite-medicale/absences-conges/absences-conges.component';
import {CoordonneesComponent} from './component/infos-personnelles/coordonnees/coordonnees.component';
import {InfosBancairesComponent} from './component/infos-personnelles/infos-bancaires/infos-bancaires.component';
import {SanteComponent} from './component/infos-personnelles/sante/sante.component';
import {DiversComponent} from './component/infos-personnelles/divers/divers.component';
import {AddCongeAbsenceComponent} from './component/absence-conge-visite-medicale/absences-conges/add-conge-absence/add-conge-absence.component';
import {QualificationsComponent} from './component/qualifications/qualifications.component';
import {CompetenceComponent} from './component/qualifications/competence/competence.component';
import {DisponibiliteCongeComponent} from './component/list-employes/disponibilite-conge/disponibilite-conge.component';
import {AddNewQualificationComponent} from './component/qualifications/add-new-qualification/add-new-qualification.component';
import {DisciplineComponent} from './component/discipline/discipline.component';
import {SanctionComponent} from './component/discipline/sanction/sanction.component';
import {AddNewFormationEmployeeComponent} from './component/qualifications/add-new-formation-employee/add-new-formation-employee.component';
import {SanctionFormComponent} from './component/discipline/sanction-form/sanction-form.component';
import {ListVisiteMedicalComponent} from './component/absence-conge-visite-medicale/visite-medical/list-visite-medical.component';
import {AddVisiteMedicalComponent} from './component/absence-conge-visite-medicale/visite-medical/add-visite-medical/add-visite-medical.component';
import {JourReposFormComponent} from './component/jourRepos/jour-repos-form/jour-repos-form.component';
import {JourReposComponent} from './component/jourRepos/jour-repos.component';
import {AbsenceCongeVisiteMedicaleComponent} from './component/absence-conge-visite-medicale/absence-conge-visite-medicale.component';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxPrintModule} from 'ngx-print';
import {ValideRefuseCongeAbsenceComponent} from './component/absence-conge-visite-medicale/absences-conges/valide-refuse-conge-absence/valide-refuse-conge-absence.component';
import {AvenantsComponent} from './component/contrats/avenants/avenants.component';
import {AddContratComponent} from './component/contrats/add-contrat/add-contrat.component';
import {ContratFieldsetNbHeureComponent} from './component/contrats/contrat-fieldset/contrat-fieldset-nb-heure/contrat-fieldset-nb-heure.component';
import {ContratFieldsetTotalHebdoComponent} from './component/contrats/contrat-fieldset/contrat-fieldset-total-hebdo/contrat-fieldset-total-hebdo.component';
import {ContratUtilitiesService} from './service/contrat-utilities.service';
import {DisponibiliteContainerComponent} from './component/contrats/disponibilite-container/disponibilite-container.component';
import {DisponibiliteContratComponent} from './component/contrats/disponibilite-container/disponibilite-contrat/disponibilite-contrat.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MotifSortieComponent} from './component/list-employes/motif-sortie/motif-sortie.component';
import {FileUploadModule, TooltipModule} from 'primeng/primeng';
import {DecompteAbsencePipe} from './pipe/decompte-absence.pipe';
import {RadioButtonModule} from 'primeng/radiobutton';
import {EmployeeFieldsCheckboxComponent} from './component/employee-fields-checkbox/employee-fields-checkbox.component';
import {RapportRhModule} from 'src/app/shared/module/rapports-rh/rapport-rh-list/rapport-rh.module';
import {InputMaskModule} from 'primeng/inputmask';
import { DpaePopupComponent } from './component/infos-personnelles/dpae-popup/dpae-popup.component';

@NgModule({
  imports: [
    EmployesRoutingModule,
    SharedModule,
    PdfViewerModule,
    NgxPrintModule,
    OverlayPanelModule,
    FileUploadModule,
    RadioButtonModule,
    RapportRhModule,
    InputMaskModule,
    TooltipModule
  ],
  declarations: [
    ListEmployesComponent,
    ActionsEmployeComponent,
    DetailEmployeComponent,
    InfosPersonnellesComponent,
    InfosPrincipalesComponent,
    ContratsComponent,
    HeuresRepartitionComponent,
    DisponibiliteContratComponent,
    ContratFieldsetComponent,
    AbsencesCongesComponent,
    CoordonneesComponent,
    InfosBancairesComponent,
    SanteComponent,
    DiversComponent,
    AddCongeAbsenceComponent,
    QualificationsComponent,
    CompetenceComponent,
    DisponibiliteCongeComponent,
    AddNewQualificationComponent,
    DisciplineComponent,
    SanctionComponent,
    SanctionFormComponent,
    AddNewFormationEmployeeComponent,
    AddVisiteMedicalComponent,
    ListVisiteMedicalComponent,
    JourReposFormComponent,
    JourReposComponent,
    AbsenceCongeVisiteMedicaleComponent,
    ValideRefuseCongeAbsenceComponent,
    AvenantsComponent,
    AddContratComponent,
    ContratFieldsetNbHeureComponent,
    ContratFieldsetTotalHebdoComponent,
    DisponibiliteContainerComponent,
    MotifSortieComponent,
    DecompteAbsencePipe,
    EmployeeFieldsCheckboxComponent,
    DpaePopupComponent
  ],
  providers: [ContratUtilitiesService]
})
export class EmployesModule {
}
