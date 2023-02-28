import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DateService} from '../../../../../../shared/service/date.service';
import * as moment from 'moment';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-taux-main-oeuvre',
  templateUrl: './taux-main-oeuvre.component.html',
  styleUrls: ['./taux-main-oeuvre.component.scss']
})
export class TauxMainOeuvreComponent implements OnInit {

  public FILTER_JOUR = 1;
  public FILTER_WEEK = 2;
  public FILTER_MONTH = 3;

  public tauxMainOeuvreReel = -1;
  public tauxMainOeuvrePrev = -1;
  public loadingTx = false;

  @Input()
  set initTauxMainOeuvreReel(tauxMainOeuvreReel: number) {
    this.tauxMainOeuvreReel = tauxMainOeuvreReel;
  }

  @Input()
  set initTauxMainOeuvrePrev(tauxMainOeuvrePrev: number) {
    this.tauxMainOeuvrePrev = tauxMainOeuvrePrev;
  }

  @Input()
  set loadingTxMainOeuvre(loadingTxMainOeuvre: boolean) {
    this.loadingTx = loadingTxMainOeuvre;
  }

  @Output()
  public getValueByFilterEvent = new EventEmitter();

  @Input() position: string;
  public filter = this.FILTER_JOUR;

  constructor(private dateService: DateService, private tl: RhisTranslateService) {
  }

  ngOnInit() {
  }

  public getDateLabel(): string {
    moment.locale(this.tl.currentLang);
    switch (this.filter) {
      case this.FILTER_JOUR:
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.tl.translate('Acceuil.DU') + ' ' + this.dateService.formatDateTo(yesterday, 'DD/MM/YY');
      case this.FILTER_WEEK:
        return this.tl.translate('Acceuil.DE') + ' S' + moment().subtract(1, 'week').format('W');
      case this.FILTER_MONTH:
        return  this.tl.translate('Acceuil.DE') + ' ' + this.capitalizeFirstLetter(moment().subtract(1, 'month')
          .startOf('month').format('MMMM'));
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
    this.getValueByFilterEvent.emit(this.filter);
  }

  public getIcon(): string {
    if (this.tauxMainOeuvreReel > this.tauxMainOeuvrePrev) {
      return 'icon_arrow_top_right.png';
    } else if (this.tauxMainOeuvreReel < this.tauxMainOeuvrePrev) {
      return 'icon_arrow_buttom_right.png';
    } else {
      return 'icon_equals.png';
    }
  }
}
