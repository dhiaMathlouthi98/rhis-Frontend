import {Component} from '@angular/core';
import {ConfigListComponent} from '../config-list/config-list.component';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {MotifSortieModel} from '../../../../../shared/model/motifSortie.model';
import {MotifSortieService} from '../../service/motifSortie.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-motif-sortie',
  templateUrl: '../config-list/config-list.component.html',
  styleUrls: ['../config-list/config-list.component.scss']
})
export class MotifSortieComponent extends ConfigListComponent<MotifSortieModel> {

  constructor(public rhisTranslateService: RhisTranslateService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService,
              public service: MotifSortieService) {
    super(rhisTranslateService, notificationService, confirmationService, service);
    this.idName = 'idMotifSortie';
    this.title = 'MENU.RESTAURANT.SUB_MENU.MOTIFS_SORTIE';
    this.addErrorMessage = 'NOTIFICATION_GENERIQUE.ECHEC_CREATE';
    this.DESACTIVATION_CODE = 'RHIS_MOTIF_SORTIE_IS_USED';
    this.desactivationMessage = 'NOTIFICATION_GENERIQUE.DESACTIVATED';
  }

}
