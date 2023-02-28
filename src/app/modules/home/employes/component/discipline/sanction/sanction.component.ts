import {Component, Input} from '@angular/core';
import {TypeSanctionModel} from '../../../../../../shared/model/type-sanction.model';

@Component({
  selector: 'rhis-sanction',
  templateUrl: './sanction.component.html',
  styleUrls: ['./sanction.component.scss']
})
export class SanctionComponent {
  public faisReprochesIsShown = false;
  @Input() public sanction: TypeSanctionModel;
  @Input() public faisReproches: string;
  @Input() public tooltipStyle: {
    top: number,
    right: number
  };
}
