import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {PeriodiciteModel} from '../../../../../shared/model/periodicite.model';
import {PeriodiciteService} from '../../service/periodicite.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-periodicite',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class PeriodiciteComponent extends ConfigListComponent<PeriodiciteModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: PeriodiciteService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'idPeriodicite';
    this.title = 'MENU.RESTAURANT.SUB_MENU.PERIODICITE';
    this.addErrorMessage = 'NOTIFICATION_GENERIQUE.ECHEC_CREATE';
  }

}
