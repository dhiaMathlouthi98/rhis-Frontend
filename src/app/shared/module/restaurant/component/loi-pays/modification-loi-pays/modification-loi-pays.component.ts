import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {PeriodiciteModel} from '../../../../../model/periodicite.model';
import {DateService} from '../../../../../service/date.service';

@Component({
  selector: 'rhis-modification-loi-pays',
  templateUrl: './modification-loi-pays.component.html',
  styleUrls: ['./modification-loi-pays.component.scss']
})
export class ModificationLoiPaysComponent {

  public numbersOnlyPattern = new RegExp('^[0-9]+$');

  public selectedLoi: any;

  public listPeriodiciteItem: SelectItem[];

  public updateLoiPopupTitle: string;

  public listPeriodicite: PeriodiciteModel[] = [];

  @Input()
  set initListePeriodicite(listPeriodicite: PeriodiciteModel[]) {
    this.listPeriodicite = listPeriodicite;
  }

  @Input()
  set initLoiPays(loi: any) {
    this.selectedLoi = JSON.parse(JSON.stringify(loi));
    if (!this.numbersOnlyPattern.test(this.selectedLoi.valeurMajeurAfficher) && (!this.selectedLoi.isTime)
      && ((this.selectedLoi.valeurMajeurAfficher !== 'true')) && ((this.selectedLoi.valeurMajeurAfficher !== 'false'))
      && (this.selectedLoi.valeurMineurAfficher !== '-') && (this.selectedLoi.valeurMajeurAfficher !== '-')) {
      this.selectedLoi.isPeriod = true;
      this.setListPeriodiciteItem();
    }

    this.setStringToBooleanValue();
    if (this.selectedLoi.valeurMajeurAfficher === '-') {
      this.selectedLoi.valeurMajeurAfficher = null;
    }
    if (this.selectedLoi.valeurMineurAfficher === '-') {
      this.selectedLoi.valeurMineurAfficher = null;
    }
  }

  @Input()
  set initTitle(title: string) {
    this.updateLoiPopupTitle = title;
  }

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public updateLoiEvent = new EventEmitter();


  constructor(private dateSevice: DateService) {
  }

  /**
   * Permet de changer le type du champ (de date vers string) pour le sauvegarde dans la base de donnees
   */
  public validTimeToDisplay(item: any) {
    if (typeof item.valeurMajeurAfficher !== 'string') {
      item.valeurMajeurAfficher = this.dateSevice.setStringFromDate(item.valeurMajeurAfficher);
    }
    if (typeof item.valeurMineurAfficher !== 'string') {
      item.valeurMineurAfficher = this.dateSevice.setStringFromDate(item.valeurMineurAfficher);
    }
  }

  public setStringToBooleanValue() {
    if (this.selectedLoi.valeurMajeurAfficher === 'true' || this.selectedLoi.valeurMajeurAfficher === 'false') {
      this.selectedLoi.majeurBooleanValue = this.selectedLoi.valeurMajeurAfficher === 'true' ? true : false;
    }
    if (this.selectedLoi.valeurMineurAfficher === 'true' || this.selectedLoi.valeurMineurAfficher === 'false') {
      this.selectedLoi.mineurBooleanValue = this.selectedLoi.valeurMineurAfficher === 'true' ? true : false;
    }

  }

  public setBooleanToStringValue(majeurValue: boolean) {
    if (majeurValue) {
      this.selectedLoi.valeurMajeurAfficher = this.selectedLoi.valeurMajeurAfficher === 'true' ? 'false' : 'true';
    } else {
      this.selectedLoi.valeurMineurAfficher = this.selectedLoi.valeurMineurAfficher === 'true' ? 'false' : 'true';
    }
  }

  private setListPeriodiciteItem() {
    this.listPeriodiciteItem = [];
    this.listPeriodicite.forEach(item => {
      console.log(item);
      this.listPeriodiciteItem.push({label: item.libelle, value: item.libelle});
    });
  }

  public updateLoiPays() {
    this.updateLoiEvent.emit(this.selectedLoi);
  }

}
