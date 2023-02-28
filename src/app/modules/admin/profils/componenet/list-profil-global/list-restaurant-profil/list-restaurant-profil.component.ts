import {Component, Input, OnInit} from '@angular/core';
import {AffectationModel} from '../../../../../../shared/model/affectation.model';

@Component({
  selector: 'rhis-list-restaurant-profil',
  templateUrl: './list-restaurant-profil.component.html',
  styleUrls: ['./list-restaurant-profil.component.scss']
})
export class ListRestaurantProfilComponent implements OnInit {
  @Input()
  public affectations: AffectationModel[];

  constructor() {
  }

  ngOnInit() {
  }
}
