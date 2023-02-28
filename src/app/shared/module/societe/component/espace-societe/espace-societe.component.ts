import {Component} from '@angular/core';
import {RhisRoutingService} from '../../../../service/rhis.routing.service';

@Component({
  templateUrl: './espace-societe.component.html',
  styleUrls: ['./espace-societe.component.scss']
})
export class EspaceSocieteComponent {

  constructor(public rhisRouter: RhisRoutingService) {

  }
}
