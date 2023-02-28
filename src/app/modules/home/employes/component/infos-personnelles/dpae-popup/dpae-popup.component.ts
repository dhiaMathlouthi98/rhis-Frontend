import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DPAEStateEnum, DpaeStatut} from '../../../../../../shared/model/gui/dpae.model';
import {SharedEmployeeService} from '../../../service/sharedEmployee.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {DpaeService} from '../../../service/dpae.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-dpae-popup',
  templateUrl: './dpae-popup.component.html',
  styleUrls: ['./dpae-popup.component.scss']
})
export class DpaePopupComponent implements OnInit {
  public statutValide = true;
  public texte = '';
  public data: DpaeStatut = null;
  @Output() close = new EventEmitter();
  @Output() afterDepot = new EventEmitter();
  public showData = false;
  public ecran = 'ELE';

  @Input() set dpaeStatut(data: DpaeStatut) {
    if (data.hasOwnProperty('statut')) {
      this.showData = true;
      this.data = data;

      if (data.statut === DPAEStateEnum.NOT_YET_WITH_COMPLETE_INFOS
        || (data.statut === DPAEStateEnum.REJECTED && data.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
        this.texte = this.rhisTranslateService.translate('DPAE.CONTENU_RECAP_1') + this.sharedEmployeeService.selectedEmployee.nom + ' ' +
          this.sharedEmployeeService.selectedEmployee.prenom + this.rhisTranslateService.translate('DPAE.CONTENU_RECAP_2');
      }

      if (data.statut === DPAEStateEnum.NOT_YET_WITH_MISSED_INFOS
        || (data.statut === DPAEStateEnum.REJECTED && !data.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
        this.texte = this.rhisTranslateService.translate('DPAE.CONTENU_MANQUANT');
      }
    }

  }


  constructor(private sharedEmployeeService: SharedEmployeeService
    , private rhisTranslateService: RhisTranslateService, private dpaeService: DpaeService
    , private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {

  }

  public bloquerDebloquerButtonControl(): boolean {
    return this.domControlService.duplicateControl(this.ecran);
  }

  closePopup(): void {
    this.close.emit(false);
  }

  deposer(): void {
    this.notificationService.startLoader();
    this.dpaeService.deposerDPAE(this.sharedEmployeeService.selectedEmployee.uuid).subscribe((data: DpaeStatut) => {
      this.afterDepot.emit(data);
      this.closePopup();
      this.notificationService.stopLoader();
    });
  }

}
