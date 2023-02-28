import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Edges, ResizeEvent} from 'angular-resizable-element';

@Component({
  selector: 'rhis-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent implements OnInit {
  @Input()
  width: number;
  @Input()
  backColor: string;
  @Input()
  validate: Function;
  @Output()
  onResizeEndEvent = new EventEmitter<ResizeEvent>();
  @Input()
  resizeSide: string;
  @Input()
  edge: Edges;

  constructor() { }

  ngOnInit() {
  }

  public onResizeEnd(event: ResizeEvent) {
    this.onResizeEndEvent.emit(event);
  }
}
