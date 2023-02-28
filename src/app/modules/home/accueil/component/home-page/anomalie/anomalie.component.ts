import {Component, Input, OnInit} from '@angular/core';
import {AnomalieModel} from '../../../../../../shared/model/anomalie.model';

@Component({
  selector: 'rhis-anomalie',
  templateUrl: './anomalie.component.html',
  styleUrls: ['./anomalie.component.scss']
})
export class AnomalieComponent implements OnInit {
  @Input() anomalie: {code: string, label: string, nbr: number, value: string, icon: string};
  constructor() { }

  ngOnInit() {
  }

}
