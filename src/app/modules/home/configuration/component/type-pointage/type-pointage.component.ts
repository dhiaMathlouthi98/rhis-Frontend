import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {TypePointageModel} from '../../../../../shared/model/type-pointage.model';
import {TypePointageService} from '../../service/type-pointage.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-type-pointage',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class TypePointageComponent extends ConfigListComponent<TypePointageModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: TypePointageService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'id';
    this.title = 'MENU.RESTAURANT.SUB_MENU.POINTAGE';
    this.addErrorMessage = 'NOTIFICATION_GENERIQUE.ECHEC_CREATE';
  }
}
