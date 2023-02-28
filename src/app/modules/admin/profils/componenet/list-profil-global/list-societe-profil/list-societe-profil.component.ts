import {Component, Input, OnInit} from '@angular/core';
import {AffectationModel} from '../../../../../../shared/model/affectation.model';

@Component({
  selector: 'rhis-list-societe-profil',
  templateUrl: './list-societe-profil.component.html',
  styleUrls: ['./list-societe-profil.component.scss']
})
export class ListSocieteProfilComponent implements OnInit {
  @Input()
  public affectations: AffectationModel[];

  constructor() {
  }

  ngOnInit() {
  }
}
