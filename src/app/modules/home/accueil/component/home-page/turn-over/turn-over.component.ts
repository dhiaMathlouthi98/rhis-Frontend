import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-turn-over',
  templateUrl: './turn-over.component.html',
  styleUrls: ['./turn-over.component.scss']
})
export class TurnOverComponent implements OnInit {
  @Input() position: string;
  public FILTER_WEEK = 1;
  public FILTER_MONTH = 2;
  public FILTER_YEAR = 3;


  public turnOver = -1;
  public loadingTurnOver = false;
  public filter = this.FILTER_YEAR;

  @Input()
  set initTurnOver(turnOver: number) {
    this.turnOver = turnOver;
  }

  @Input()
  set initLoadingTurnOver(loadingTurnOver: boolean) {
    this.loadingTurnOver = loadingTurnOver;
  }

  @Output()
  public getTurnOverByFilterEvent = new EventEmitter();

  constructor(private dateService: DateService, private tl: RhisTranslateService) { }

  ngOnInit() {
  }

  public getDateLabel(): string {
    moment.locale(this.tl.currentLang);
    switch (this.filter) {
      case this.FILTER_WEEK:
        return this.tl.translate('Acceuil.DE') + ' S' + moment().subtract(1, 'week').format('W');
      case this.FILTER_MONTH:
        return  this.tl.translate('Acceuil.DE') + ' ' + this.capitalizeFirstLetter(moment().subtract(1, 'month')
          .startOf('month').format('MMMM'));
      case this.FILTER_YEAR:
        return this.tl.translate('Acceuil.DE') + ' ' + moment().format('YYYY');
    }
  }

  private capitalizeFirstLetter(s: string): string {
    if (typeof s !== 'string') {
      return '';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  public setFilter(filter: number) {
    this.filter = filter;
    this.getTurnOverByFilterEvent.emit(this.filter);
  }
}
