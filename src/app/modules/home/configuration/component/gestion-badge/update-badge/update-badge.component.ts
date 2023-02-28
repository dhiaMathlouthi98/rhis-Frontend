import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BadgeModel} from '../../../../../../shared/model/badge.model';
import {StatutBadgeModel} from '../../../../../../shared/enumeration/statutBadge.model';

@Component({
  selector: 'rhis-update-badge',
  templateUrl: './update-badge.component.html',
  styleUrls: ['./update-badge.component.scss']
})
export class UpdateBadgeComponent {

  public selectedBadge: BadgeModel;

  @Input()
  set initBadge(badge: BadgeModel) {
    this.selectedBadge = badge;
  }

  @Input()
  public buttonLabel: string;

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public updateBadgeEvent = new EventEmitter();


  public tmpStatutDisponible = StatutBadgeModel.Disponible;
  public tmpStatutIndisponible = StatutBadgeModel.Indisponible;
  public tmpStatutAssigne = StatutBadgeModel.Assigne;

  public tmpChoosenStatus: StatutBadgeModel;


  public createOrUpdateBadge() {
    this.updateBadgeEvent.emit(this.selectedBadge);
  }

}
