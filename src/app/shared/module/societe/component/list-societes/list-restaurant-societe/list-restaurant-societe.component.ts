import {Component, Input} from '@angular/core';
import {RhisRoutingService} from '../../../../../service/rhis.routing.service';

@Component({
  selector: 'rhis-list-restaurant-societe',
  templateUrl: './list-restaurant-societe.component.html',
  styleUrls: ['./list-restaurant-societe.component.scss']
})

export class ListRestaurantSocieteComponent {

  @Input() societeName: string;
  @Input() societeUuid: string;
  @Input() restaurants: string[];

  constructor(
    public rhisRouter: RhisRoutingService) {
  }
}
