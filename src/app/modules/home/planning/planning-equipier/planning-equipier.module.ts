import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenuModule} from 'primeng/menu';
import {SharedModule} from '../../../../shared/shared.module';
import {PlanningEquipierComponent} from './components/planning-equipier.component';
import {PlanningEquipierRoutingModule} from './planning-equipier-routing.module';
import {GridsterModule} from 'angular-gridster2';
import {PlanningEquipierService} from './service/planning-equipier.service';
import {AddShiftComponent} from './components/add-shift/add-shift.component';
import {PlanningJourComponent} from './components/planning-jour/planning-jour.component';
import {DetailsTempsPayeComponent} from './components/details-temps-paye/details-temps-paye.component';
import {PlanningSemaineComponent} from './components/planning-semaine/planning-semaine.component';
import {RecapitulatifEmployeComponent} from './components/recapitulatif-employe/recapitulatif-employe.component';
import {PlanningPdfComponent} from './components/planning-pdf/planning-pdf.component';
import {DiffBesoinPlanifieChartComponent} from './components/diff-besoin-planifie-chart/diff-besoin-planifie-chart.component';
import {OverlayPanelModule} from 'primeng/primeng';
import {RapportsModule} from '../../../../shared/module/rapports/rapports.module';
import { PlgHebdoContainerComponent } from '../plg-equipier-vue-hebdo/components/plg-hebdo-container/plg-hebdo-container.component';
import { PlanningsHebdoEmployeeRowComponent } from '../plg-equipier-vue-hebdo/components/plannings-hebdo-employee-row/plannings-hebdo-employee-row.component';
import { PlanningHebdoCardComponent } from '../plg-equipier-vue-hebdo/components/planning-hebdo-shift-card/planning-hebdo-shift-card.component';
import { DetailsTempsAffecteComponent } from '../plg-equipier-vue-hebdo/components/details-temps-affecte/details-temps-affecte.component';
import { EmpPlanningJourComponent } from './components/planning-jour/emp-planning-jour/emp-planning-jour/emp-planning-jour.component';
import { DataGridsterItemComponent } from './components/planning-jour/emp-planning-jour/data-gridster-item/data-gridster-item.component';
import { DataGridsterSemaineItemComponent } from './components/data-gridster-semaine-item/data-gridster-semaine-item.component';

@NgModule({
  declarations: [
    PlanningEquipierComponent,
    AddShiftComponent,
    PlanningJourComponent,
    DetailsTempsPayeComponent,
    PlanningSemaineComponent,
    RecapitulatifEmployeComponent,
    PlanningPdfComponent,
    DiffBesoinPlanifieChartComponent,
    PlgHebdoContainerComponent,
    PlanningsHebdoEmployeeRowComponent,
    PlanningHebdoCardComponent,
    DetailsTempsAffecteComponent,
    EmpPlanningJourComponent,
    DataGridsterItemComponent,
    DataGridsterSemaineItemComponent
  ],
  imports: [
    CommonModule,
    PlanningEquipierRoutingModule,
    MenuModule,
    SharedModule,
    GridsterModule,
    RapportsModule,
    OverlayPanelModule
  ],
  providers: [
    PlanningEquipierService
  ]
})
export class PlanningEquipierModule {
}
