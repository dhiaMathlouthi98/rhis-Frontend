import {Component, Input} from '@angular/core';

@Component({
  selector: 'rhis-actions-restaurant',
  templateUrl: './actions-restaurant.component.html',
  styleUrls: ['./actions-restaurant.component.scss']
})
export class ActionsRestaurantComponent {
  public isShownInfos = false;
  @Input()
  restaurantName: string;

  /**
   * Show/hide profiles section
   */
  public showProfiles(): void {
    this.isShownInfos = !this.isShownInfos;
  }



}
