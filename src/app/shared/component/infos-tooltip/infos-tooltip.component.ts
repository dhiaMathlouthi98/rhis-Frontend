import {Component, Input} from '@angular/core';

@Component({
  selector: 'rhis-infos-tooltip',
  templateUrl: './infos-tooltip.component.html',
  styleUrls: ['./infos-tooltip.component.scss']
})
export class InfosTooltipComponent {
  @Input()
  private set top(top: number) {
    this.toolTipStyle.top = top + 'px';
  }

  @Input()
  private set buttom(bottom: number) {
    this.toolTipStyle.bottom = bottom + 'px';
  }

  @Input()
  private set right(right: number) {
    this.toolTipStyle.right = right + 'px';
  }
  @Input() caretPositionFromRight = 33;
  toolTipStyle = {top: '33px', right: '13px', bottom: '10'};

  @Input() isFlagTop = true;

}
