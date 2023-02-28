import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AlerteModel} from '../../../../../../model/alerte.model';
import {SelectItem} from 'primeng/api';
import {NiveauAccessEnumeration} from '../../../../../../enumeration/niveau.access.enumeration';

@Component({
  selector: 'rhis-update-alerte',
  templateUrl: './update-alerte.component.html',
  styleUrls: ['./update-alerte.component.scss']
})
export class UpdateAlerteComponent implements OnInit {

  public selectedAlerte: AlerteModel;
  public valeurParamErrorMessage = false;
  public prefixFichierErrorMessage = false;
  @Output()
  public closeEvent = new EventEmitter();
  @Output()
  public updateAlerteEvent = new EventEmitter();
  niveauAccessItem: SelectItem[] = [
    {label: 'Superviseur', value: NiveauAccessEnumeration.Superviseur},
    {label: 'Directeur', value: NiveauAccessEnumeration.Directeur},
    {label: 'Franchise', value: NiveauAccessEnumeration.Franchise},
    {label: 'Manager', value: NiveauAccessEnumeration.Manager}
  ];

  constructor() {
  }

  @Input()
  set initAlerte(alerte: AlerteModel) {
    this.selectedAlerte = alerte;
  }

  ngOnInit() {
  }

  public updateAlerte(): void {
    if (this.canSave()) {
      this.updateAlerteEvent.emit(this.selectedAlerte);
    }
  }

  private canSave(): boolean {
    this.valeurParamErrorMessage = this.selectedAlerte.valeurParam.trim() === '';
    this.prefixFichierErrorMessage = this.selectedAlerte.prefixFichier.trim() === '';

    return !(this.valeurParamErrorMessage || this.prefixFichierErrorMessage);
  }
}
