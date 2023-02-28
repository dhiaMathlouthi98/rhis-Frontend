import {NgModule} from '@angular/core';

import {ConfigurationRoutingModule} from './configuration-routing.module';
import {TypeContratComponent} from './component/type-contrat/type-contrat.component';
import {SharedModule} from '../../../shared/shared.module';
import {AddTypeContratComponent} from './component/type-contrat/add-type-contrat/add-type-contrat.component';
import {BadgeStatusPipe} from './pipe/badge-status.pipe';
import {InputSwitchModule} from 'primeng/primeng';
import {GestionBadgeComponent} from './component/gestion-badge/gestion-badge.component';
import {UpdateBadgeComponent} from './component/gestion-badge/update-badge/update-badge.component';
import {PeriodePaieComponent} from './component/periode-paie/periode-paie.component';
import {EditableOnEnterDirective} from './directive/editable-on-enter.directive';
import {EditableComponent} from './component/config-list/editable/editable.component';
import {TypeSanctionComponent} from './component/type-sanction/type-sanction.component';
import {ConfigListComponent} from './component/config-list/config-list.component';
import {MotifSortieComponent} from './component/motif-sortie/motif-sortie.component';
import {TypePointageComponent} from './component/type-pointage/type-pointage.component';
import {MoyenTransportComponent} from './component/moyen-transport/moyen-transport.component';
import {PeriodiciteComponent} from './component/periodicite/periodicite.component';
import {ProcedureComponent} from './component/procedure/procedure.component';
import {EditableOnClickDirective} from './directive/editable-on-click.directive';
import {PosteTravailComponent} from './component/poste-travail/poste-travail.component';
import {GestionPosteTravailComponent} from './component/poste-travail/gestion-poste-travail/gestion-poste-travail.component';
import {GroupementPosteTravailComponent} from './component/poste-travail/groupement-poste-travail/groupement-poste-travail.component';
import {AddUpdatePositionTravailComponent} from './component/poste-travail/gestion-poste-travail/add-update-position-travail/add-update-position-travail.component';
import {GroupTravailComponent} from './component/group-travail/group-travail.component';
import {AddGroupTravailComponent} from './component/group-travail/add-group-travail/add-group-travail.component';
import {TypeEvenementComponent} from './component/type-evenement/type-evenement.component';
import {AddTypeEvenementComponent} from './component/type-evenement/add-type-evenement/add-type-evenement.component';
import {AddListFormationComponent} from './component/list-formation/add-list-formation/add-list-formation.component';
import {ListFormationComponent} from './component/list-formation/list-formation.component';
import {AddUpdateGroupementPositionTravailComponent} from './component/poste-travail/groupement-poste-travail/add-update-groupement-position-travail/add-update-groupement-position-travail.component';
import {GestionNationaliteComponent} from './component/gestion-nationalite/gestion-nationalite.component';
import {ModeVenteComponent} from './component/mode-vente/mode-vente.component';
import {AddModeVenteComponent} from './component/mode-vente/add-mode-vente/add-mode-vente.component';

@NgModule({
  imports: [
    SharedModule,
    ConfigurationRoutingModule,
    InputSwitchModule
  ],
  declarations: [
    BadgeStatusPipe,
    TypeContratComponent,
    AddTypeContratComponent,
    GestionBadgeComponent,
    UpdateBadgeComponent,
    PeriodePaieComponent,
    EditableOnEnterDirective,
    EditableComponent,
    TypeSanctionComponent,
    ConfigListComponent,
    MotifSortieComponent,
    TypePointageComponent,
    MoyenTransportComponent,
    PeriodiciteComponent,
    ProcedureComponent,
    EditableOnClickDirective,
    PosteTravailComponent,
    GestionPosteTravailComponent,
    GroupementPosteTravailComponent,
    AddUpdatePositionTravailComponent,
    GroupTravailComponent,
    AddGroupTravailComponent,
    EditableOnClickDirective,
    TypeEvenementComponent,
    AddTypeEvenementComponent,
    AddListFormationComponent,
    ListFormationComponent,
    AddUpdateGroupementPositionTravailComponent,
    GestionNationaliteComponent,
    ModeVenteComponent,
    AddModeVenteComponent
  ]
})
export class ConfigurationModule {
}
