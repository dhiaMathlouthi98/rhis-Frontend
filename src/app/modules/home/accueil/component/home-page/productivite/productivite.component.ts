import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import * as moment from 'moment';

@Component({
  selector: 'rhis-productivite',
  templateUrl: './productivite.component.html',
  styleUrls: ['./productivite.component.scss']
})
export class ProductiviteComponent implements OnInit {

  public FILTER_JOUR = 1;
  public FILTER_WEEK = 2;
  public FILTER_MONTH = 3;

  public productiviteReel = -1;
  public productivitePrev = -1;
  public loading = false;

  @Input()
  set initProductiviteReel(productiviteReel: number) {
    this.productiviteReel = productiviteReel;
  }

  @Input()
  set initProductivitePrev(productivitePrev: number) {
    this.productivitePrev = productivitePrev;
  }

  @Input()
  set loadingProd(loadingProd: boolean) {
    this.loading = loadingProd;
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

  public getIcon(): string {
    if (this.productiviteReel > this.productivitePrev) {
      return 'icon_arrow_top_right.png';
    } else if (this.productiviteReel < this.productivitePrev) {
      return 'icon_arrow_buttom_right.png';
    } else {
      return 'icon_equals.png';
    }
  }

  public setFilter(filter: number) {
    this.filter = filter;
    this.getValueByFilterEvent.emit(this.filter);
  }
}
