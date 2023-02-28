import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {MoyenTransportModel} from '../../../../../shared/model/moyenTransport.model';
import {MoyenTransportService} from '../../service/moyenTransport.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-moyen-transport',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class MoyenTransportComponent extends ConfigListComponent<MoyenTransportModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: MoyenTransportService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'idMoyenTransport';
    this.title = 'MENU.RESTAURANT.SUB_MENU.TYPE_TRANSPORT';
    this.addErrorMessage = 'NOTIFICATION_GENERIQUE.ECHEC_CREATE';
    this.DESACTIVATION_CODE = 'RHIS_MOYEN_TRANSPORT_IS_USED';
    this.desactivationMessage = 'NOTIFICATION_GENERIQUE.DISACTIVER';
  }


}
