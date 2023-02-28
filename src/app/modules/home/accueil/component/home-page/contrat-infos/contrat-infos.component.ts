import {Component, Input} from '@angular/core';

@Component({
  selector: 'rhis-contrat-infos',
  templateUrl: './contrat-infos.component.html',
  styleUrls: ['./contrat-infos.component.scss']
})
export class ContratInfosComponent {

  @Input() color: string;

  @Input()
  data: {
    total: number,
    label: string,
    description: string
  };
}
