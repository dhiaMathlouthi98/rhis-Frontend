import {NgModule} from '@angular/core';
import {AccueilRoutingModule} from './accueil-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {HomePageComponent} from './component/home-page/home-page.component';
import {AnomaliesSocialesComponent} from './component/home-page/anomalies-sociales/anomalies-sociales.component';
import {AnomalieComponent} from './component/home-page/anomalie/anomalie.component';
import {TurnOverComponent} from './component/home-page/turn-over/turn-over.component';
import {EmployeContratInfosComponent} from './component/home-page/employe-contrat-infos/employe-contrat-infos.component';
import {ContratInfosComponent} from './component/home-page/contrat-infos/contrat-infos.component';
import {ChartEvolutionComponent} from './component/home-page/chart-evolution/chart-evolution.component';
import {IndicateurCoutEmployeComponent} from './component/home-page/indicateur-cout-employe/indicateur-cout-employe.component';
import {PercentageCercleComponent} from './component/home-page/percentage-cercle/percentage-cercle.component';
import {DashboardComponent} from './component/analytics/dashboard/dashboard.component';
import {MasseSalarialeComponent} from './component/home-page/masse-salariale/masse-salariale.component';
import {MenubarModule} from 'primeng/menubar';
import {RestaurantService} from '../../../shared/service/restaurant.service';
import {LayoutModule} from '../../layout/layout.module';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {TauxMainOeuvreComponent} from './component/home-page/taux-main-oeuvre/taux-main-oeuvre.component';
import {ProductiviteComponent} from './component/home-page/productivite/productivite.component';
import {AnalyticsComponent} from './component/analytics/analytics.component';
import {PerformanceComponent} from './component/analytics/performance/performance.component';
import {CardModule, InputSwitchModule, PanelModule, TabViewModule} from 'primeng/primeng';
import {RapportsModule} from '../../../shared/module/rapports/rapports.module';
import {PerformanceReportModule} from '../../../shared/module/performance-report/performance-report.module';
import {UpdateAlerteComponent} from '../../../shared/module/configuration/component/gestion-alerte/gestion-alerte/update-alerte/update-alerte.component';

@NgModule({
  imports: [
    SharedModule,
    AccueilRoutingModule,
    MenubarModule,
    LayoutModule,
    NgxExtendedPdfViewerModule,
    RapportsModule,
    TabViewModule,
    PanelModule,
    CardModule,
    PerformanceReportModule,
    InputSwitchModule
  ],
  declarations: [
    HomePageComponent,
    AnomaliesSocialesComponent,
    AnomalieComponent,
    TurnOverComponent,
    EmployeContratInfosComponent,
    ContratInfosComponent,
    ChartEvolutionComponent,
    IndicateurCoutEmployeComponent,
    PercentageCercleComponent,
    AnalyticsComponent,
    DashboardComponent,
    PerformanceComponent,
    MasseSalarialeComponent,
    TauxMainOeuvreComponent,
    ProductiviteComponent,
    UpdateAlerteComponent
  ],
  exports: [
    PercentageCercleComponent,
    UpdateAlerteComponent
  ],
  providers: [
    RestaurantService
  ]
})
export class AccueilModule {
}
