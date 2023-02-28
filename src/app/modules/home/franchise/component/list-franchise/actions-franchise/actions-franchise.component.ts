import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'rhis-actions-franchise',
  templateUrl: './actions-franchise.component.html',
  styleUrls: ['./actions-franchise.component.scss']
})
export class ActionsFranchiseComponent implements OnInit {
  public isShownInfos = false;
  @Input()
  public franchiseName: string;
  @Input()
  public franchiseUuid: string;
  @Input()
  public listRestaurants: string[];
  @Output()
  public getRestaurants = new EventEmitter();
  @Input() index: number;
  @Input() totalElement: number;
  @Input() numberElementPerPage: number;
  public offsetTop = 30;

  constructor() { }

  ngOnInit() {
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
