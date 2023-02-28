import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss']
})
export class FilterPopupComponent implements OnInit {

  @Input() public openedAlertes = false;
  @Input() public viewDay = true;
  @Input() public showCoupuresCol = true;
  @Input() public showRepasCol = true;
  @Input() public showContratCol = true;
  @Input() public showHeuresComplCol = true;
  @Input() public showHeuresSupplCol = true;
  @Input() public showHeuresNuitCol = true;
  @Input() public showHeuresFerieCol = true;
  @Output() public closeAlertes: EventEmitter<any> = new EventEmitter();
  @Output() public toggleColumn = new EventEmitter();

  coupureCol: boolean;
  repasCol: boolean;
  contratCol: boolean;
  heuresComplCol: boolean;
  contratLabel: string;
  heuresComplLabel: string;
  heuresSupplLabel: string;
  heuresSupplCol: boolean;
  heuresNuitLabel: string;
  heuresFerieLabel: string;
  heuresNuitCol: boolean;
  heuresFerieCol: boolean;

  constructor(private translateService: RhisTranslateService) {
    this.contratLabel = this.translateService.translate('GDH.PERIOD_VIEW.TEMPS') + ' ' + this.translateService.translate('GDH.PERIOD_VIEW.CONTRAT');
    this.heuresComplLabel = this.translateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + this.translateService.translate('GDH.PERIOD_VIEW.COMPL');
    this.heuresSupplLabel = this.translateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + this.translateService.translate('GDH.PERIOD_VIEW.SUPP');
    this.heuresNuitLabel = this.translateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + this.translateService.translate('GDH.PERIOD_VIEW.NUIT');
    this.heuresFerieLabel = this.translateService.translate('GDH.PERIOD_VIEW.HEURES') + ' ' + this.translateService.translate('GDH.PERIOD_VIEW.FERIE');

  }

  ngOnInit() {
    this.coupureCol = this.showCoupuresCol;
    this.repasCol = this.showRepasCol;
    this.contratCol = this.showContratCol;
    this.heuresComplCol = this.showHeuresComplCol;
    this.heuresSupplCol = this.showHeuresSupplCol;
    this.heuresNuitCol = this.showHeuresNuitCol;
    this.heuresFerieCol = this.showHeuresFerieCol;
  }

  public hideAlertes() {
    this.closeAlertes.emit();
  }

  toggleColumnFn() {
    this.toggleColumn.emit({
      showCoupuresCol: this.coupureCol,
      showRepasCol: this.repasCol,
      showContratCol: this.contratCol,
      showHeuresComplCol: this.heuresComplCol,
      showHeuresSupplCol: this.heuresSupplCol,
      showHeuresNuitCol: this.heuresNuitCol,
      showHeuresFerieCol: this.heuresFerieCol
    });
  }
}
