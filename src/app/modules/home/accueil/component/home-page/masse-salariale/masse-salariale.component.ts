import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-masse-salariale',
  templateUrl: './masse-salariale.component.html',
  styleUrls: ['./masse-salariale.component.scss']
})
export class MasseSalarialeComponent implements OnInit {

  public FILTER_WEEK = 'week';
  public FILTER_MONTH = 'month';
  public FILTER_YEAR = 'year';

  public masseSalariale = -1;

  public loadingMasseSalariale = false;

  @Input()
  set initMasseSalariale(masseSalariale: number) {
    this.masseSalariale = masseSalariale;
  }

  @Input()
  set initLoadingMasseSalariale(loadingMasseSalariale: boolean) {
    this.loadingMasseSalariale = loadingMasseSalariale;
  }

  @Output()
  public getValueByFilterEvent = new EventEmitter();

  @Input() position: string;
  public filter = 'year';

  constructor(private dateService: DateService, private tl: RhisTranslateService) {
  }

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

  public setFilter(filter: string) {
    this.filter = filter;
    this.getValueByFilterEvent.emit(this.filter);
  }
}
