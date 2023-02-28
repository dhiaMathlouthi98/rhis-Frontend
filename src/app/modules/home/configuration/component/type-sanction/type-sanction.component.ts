import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {TypeSanctionModel} from '../../../../../shared/model/type-sanction.model';
import {TypeSanctionService} from '../../service/type-sanction.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-type-sanction',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class TypeSanctionComponent extends ConfigListComponent<TypeSanctionModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: TypeSanctionService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'idTypeSanction';
    this.title = 'MENU.RESTAURANT.SUB_MENU.SANCTIONS';
    this.addErrorMessage = 'TYPE_SANCTION.EXIST';
    this.DESACTIVATION_CODE = 'RHIS_TYPE_SANCTION_EXISTS';
    this.desactivationMessage = 'TYPE_SANCTION.DESACTIVATED';
  }
}
