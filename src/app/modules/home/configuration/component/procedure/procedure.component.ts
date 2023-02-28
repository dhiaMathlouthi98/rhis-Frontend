import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ProcedureModel} from '../../../../../shared/model/procedure.model';
import {ProcedureService} from '../../service/procedure.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-procedure',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class ProcedureComponent extends ConfigListComponent<ProcedureModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: ProcedureService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'idProcedure';
    this.title = 'MENU.RESTAURANT.SUB_MENU.PROCEDURES';
    this.addErrorMessage = 'NOTIFICATION_GENERIQUE.ECHEC_CREATE';
    this.DESACTIVATION_CODE = 'RHIS_PROCEDURE_IS_USED';
    this.desactivationMessage = 'NOTIFICATION_GENERIQUE.DISACTIVER';
  }

}
