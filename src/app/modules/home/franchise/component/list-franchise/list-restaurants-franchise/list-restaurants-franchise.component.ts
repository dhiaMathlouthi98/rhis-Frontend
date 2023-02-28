import { Component, Input, OnInit } from '@angular/core';
import { RhisRoutingService } from 'src/app/shared/service/rhis.routing.service';

@Component({
  selector: 'rhis-list-restaurants-franchise',
  templateUrl: './list-restaurants-franchise.component.html',
  styleUrls: ['./list-restaurants-franchise.component.scss']
})
export class ListRestaurantsFranchiseComponent implements OnInit {
  @Input() franchiseName: string;
  @Input() franchiseUuid: string;
  @Input() restaurants: string[];

  constructor(public rhisRouter: RhisRoutingService) { }

  ngOnInit() {
  }

 
}
