import {Component, OnInit} from '@angular/core';
import {GlobalSettingsService} from '../../../../shared/service/global-settings.service';
import {NotificationService} from '../../../../shared/service/notification.service';
import {Router} from '@angular/router';

@Component({
  selector: 'rhis-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  public openedMenu = false;
  public areMenuAndHeaderDisplayed;
  public verticalScrollingPlanningEquipierPdf: any;
  constructor(private globalSettings: GlobalSettingsService,
              public notificationService: NotificationService,
              private router: Router) {
    this.areMenuAndHeaderDisplayed = !router.url.toString().includes('/home/rapports/display/');
    router.events.subscribe(() => {
      this.verticalScrollingPlanningEquipierPdf = this.router.url.toString().includes('home/planning/planning-equipier/pdf');
    });
  }

  ngOnInit() {
    this.globalSettings.onToggleMenu().subscribe(_ => {
      this.openedMenu = !this.openedMenu;
    });
  }

}
