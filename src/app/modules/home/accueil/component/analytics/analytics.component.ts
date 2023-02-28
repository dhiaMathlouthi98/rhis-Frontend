import {Component} from '@angular/core';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent {
  private ecran = 'ANP';

  public heightInterface: any;

  displayDashboardView = true;
  displayPerformanceView = false;

  constructor(private domControlService: DomControlService) {}

  public goToDashboard(): void {
    this.displayDashboardView = true;
    this.displayPerformanceView = false;
  }

  public goToPerformance(): void {
    if (this.canAcess()) {
      this.displayDashboardView = false;
      this.displayPerformanceView = true;
    }
  }

  public canAcess(): boolean {
    return this.domControlService.showControl(this.ecran);
  }
}
