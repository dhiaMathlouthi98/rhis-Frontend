import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormationModel} from '../../../../../../shared/model/formation.model';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'rhis-add-new-formation-employee',
  templateUrl: './add-new-formation-employee.component.html',
  styleUrls: ['./add-new-formation-employee.component.scss']
})
export class AddNewFormationEmployeeComponent {

  @Output()
  public addNewFormationEvent = new EventEmitter();

  @Input()
  set listFormations(listFormation: FormationModel[]) {
    this.formationItemList = [];
    listFormation.forEach(item => {
      if (!item.formationSelectedForEmployee) {
        this.formationItemList.push({
          label: item.libelle, value: item
        });
      }
    });
  }

  formationItemList: SelectItem[] = [];

  selectedFormation: FormationModel;

  selectedDate: Date;

  /**
   * methode qui permet d'ajouter une foramtion a un employee (envoyer l'evenement au composant parent)
   */
  addNewFormationEmployee() {
    if (this.selectedFormation && this.selectedDate) {
      this.selectedFormation.dateFormationEmployee = this.selectedDate;
      this.addNewFormationEvent.emit(this.selectedFormation);
    } else {
      this.addNewFormationEvent.emit(this.selectedFormation);
    }
  }
}
