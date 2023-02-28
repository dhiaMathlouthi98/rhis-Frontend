import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges} from '@angular/core';

@Component({
  selector: 'rhis-pop-up-report',
  templateUrl: './pop-up-report.component.html',
  styleUrls: ['./pop-up-report.component.scss']
})
export class PopUpReportComponent implements  OnChanges {

  @Input() title: string;
  @Input() showPopUp = false;
  @Output() private closeEvent = new EventEmitter();
  @Output() private exportEvent = new EventEmitter();
  @Output() private printEvent = new EventEmitter();
  @Input() public height: string;
  @Input() public width: string;
  public closePopUp() {
    this.closeEvent.emit();
  }

  /**
   * download file
   */
  public export() {
    this.exportEvent.emit();
  }

  /**
   * print file
   */
  public print() {
    this.printEvent.emit();
  }
  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.absence) {
      this.title = changes.title.currentValue;

    }
    if (changes.showPopUp) {
      this.showPopUp = changes.showPopUp.currentValue;
    }
  }
}
