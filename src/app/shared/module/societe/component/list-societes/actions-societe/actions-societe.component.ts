import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'rhis-actions-societe',
  templateUrl: './actions-societe.component.html',
  styleUrls: ['./actions-societe.component.scss']
})
export class ActionsSocieteComponent implements OnInit {
  public isShownInfos = false;
  @Input()
  public societeName: string;
  @Input()
  public societeUuid: string;
  @Input()
  public listRestaurants: string[];
  @Output()
  public getRestaurants = new EventEmitter();
  @Input() index: number;
  @Input() totalElement: number;
  @Input() numberElementPerPage: number;

  public offsetTop = 30;

  ngOnInit(): void {
    this.indexInEachPerPage();
  }

  /**
   * Show/hide restaurants section
   */
  public showRestaurants(): void {
    if (!this.isShownInfos) {
      this.getRestaurants.emit();
    }
    this.isShownInfos = !this.isShownInfos;
  }

  /**
   * Return index Per Page
   */
  public indexInEachPerPage(): any {
    return ((this.index % this.numberElementPerPage));
  }

  /**
   * define the position tooltip related to top
   */
  public topTooltipPosition(): any {

    if (this.indexInEachPerPage() < 3) {
      return this.offsetTop;
    } else {
      return '';
    }
  }

  /**
   * define the position tooltip related to bottom
   */
  public buttonTooltipPosition(): any {
    if (this.indexInEachPerPage() < 3) {
      return '';
    } else {
      return 0;
    }
  }

  /**
   * define the position flag tooltip
   */
  public flagTopPosition(): any {
    if (this.indexInEachPerPage() < 3) {
      return true;
    } else {
      return false;
    }

  }
}
