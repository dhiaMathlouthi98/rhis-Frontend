import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'rhis-data-gridster-item',
  templateUrl: './data-gridster-item.component.html',
  styleUrls: ['./data-gridster-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridsterItemComponent implements OnInit {
  @Input() item;
  @Input() lockState;
  @Input() minimalDisplay;
  @Input() tooltipStyleRight;
  @Input() tooltipStyle;
  @Input() enableDragAndResize;
  @Input() canDelete;
  @Input() canUpdate;
  @Input() isSmallShiftHover;

  @Output() onOpenUpdateShiftForm = new EventEmitter();
  @Output() onShowConfirmDeleteShift = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  openUpdateShiftForm() {
    this.onOpenUpdateShiftForm.emit();
  }

  showConfirmDeleteShift(event, item) {
    this.onShowConfirmDeleteShift.emit({event, item});
  }
}
