import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'rhis-hundredth-time',
  templateUrl: './hundredth-time.component.html',
  styleUrls: ['./hundredth-time.component.scss']
})
export class HundredthTimeComponent {

  @Output()
  private selectHourState = new EventEmitter<boolean>();
  @Input()
  public isHourlyView: boolean;

  public onSelectHourView(state: boolean): void {
    this.selectHourState.emit(state);
  }
}
