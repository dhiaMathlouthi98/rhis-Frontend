import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'rhis-data-gridster-semaine-item',
  templateUrl: './data-gridster-semaine-item.component.html',
  styleUrls: ['./data-gridster-semaine-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridsterSemaineItemComponent implements OnInit {

  @Input() item;
  @Input() tooltipStyleRight;
  @Input() tooltipStyle;
  @Input() canDelete;
  @Input() canUpdate;
  @Input() isSmallShiftHover;

  @Output() onRemoveItem = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  removeItem(event) {
    this.onRemoveItem.emit(event);
  }
}
