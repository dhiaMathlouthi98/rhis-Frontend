import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PositionTravailModel} from '../../../../../../../shared/model/position.travail.model';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'rhis-add-update-groupement-position-travail',
  templateUrl: './add-update-groupement-position-travail.component.html',
  styleUrls: ['./add-update-groupement-position-travail.component.scss']
})
export class AddUpdateGroupementPositionTravailComponent {

  public listeActivePositionTravail: PositionTravailModel[] = [];
  public listeGroupement: PositionTravailModel[] = [];
  public selectedPositionTravail: PositionTravailModel;
  public positionTravailToAdd: PositionTravailModel;

  public positionTravailItemList: SelectItem[] = [];
  public filtredPositionTravailItemList: SelectItem[] = [];

  public listeElementsToUpdate: any = [];

  public buttonTitle: string;
  public updateAction = false;

  @Input()
  public set initListActivePositionTravail(listePositionTravail: PositionTravailModel[]) {
    this.positionTravailItemList = [];
    this.listeActivePositionTravail = listePositionTravail;
    listePositionTravail.forEach(item => {
      this.positionTravailItemList.push({
        label: item.libelle, value: item
      });
    });
  }

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  public set selectedGroupement(positionTravail: PositionTravailModel) {
    if (positionTravail) {
      this.updateAction = true;
    } else {
      this.updateAction = false;
    }
    this.selectedPositionTravail = positionTravail;
    this.getGroupementFromSelectecPositionTravail();
  }

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdateGroupementPositionTravailEvent = new EventEmitter();


  public getGroupementFromSelectecPositionTravail() {
    this.filtredPositionTravailItemList = [];
    if (this.selectedPositionTravail) {
      this.listeGroupement = this.selectedPositionTravail.groupement;
      if (this.selectedPositionTravail.prod) {
        this.setFiltredPositionTravailItemList(false);
      } else {
        this.setFiltredPositionTravailItemList(true);
      }
    }
  }

  public deleteGroupement(positionTravail: PositionTravailModel) {
    // remove element from groupement list
    const index = this.listeGroupement.findIndex(posTrav => posTrav.idPositionTravail === positionTravail.idPositionTravail);
    this.selectedPositionTravail.groupement.splice(index, 1);
    this.getGroupementFromSelectecPositionTravail();
  }

  private setFiltredPositionTravailItemList(prod: boolean) {
    let found: boolean;
    this.listeActivePositionTravail.forEach(activePositionTravail => {
      found = false;
      this.listeGroupement.forEach(itemGroupement => {
        if (itemGroupement.idPositionTravail === activePositionTravail.idPositionTravail || activePositionTravail.idPositionTravail === this.selectedPositionTravail.idPositionTravail) {
          found = found || true;
        }
      });
      if (!found && (activePositionTravail.prod === prod)) {
        this.filtredPositionTravailItemList.push({
          label: activePositionTravail.libelle, value: activePositionTravail
        });
      }
    });
  }

  public setRemainingGroupement(postTravail: PositionTravailModel) {
    this.filtredPositionTravailItemList = [];
    this.filtredPositionTravailItemList.push({
      label: postTravail.libelle, value: postTravail
    });
    this.setFiltredPositionTravailItemList(!this.selectedPositionTravail.prod);
  }

  /**
   * Methode permet d'enregister le groupement et de fermer la popup
   */
  public saveChangesAndClose() {
    if (this.selectedPositionTravail && this.positionTravailToAdd) {
      // emit changes event
      this.addOrUpdateGroupementPositionTravailEvent.emit({
        first_element: this.selectedPositionTravail,
        second_element: this.positionTravailToAdd,
        add_continue: false,
        action: 'Add'
      });
      this.positionTravailToAdd = undefined;
      // close popup
      this.closeEvent.emit();
    }
  }

  /**
   * Methode permet d'enregister le groupement et laisser l'utilisateur-restaurant le choix de continuer à ajouter de plus
   */
  public saveChangesAndContinue() {
    if (this.selectedPositionTravail && this.positionTravailToAdd) {
      // emit changes event
      this.addOrUpdateGroupementPositionTravailEvent.emit({
        first_element: this.selectedPositionTravail,
        second_element: this.positionTravailToAdd,
        add_continue: true,
        action: 'Add'
      });
      this.selectedPositionTravail.groupement.push(this.positionTravailToAdd);
      this.positionTravailToAdd.groupement.push(this.selectedPositionTravail);
      this.positionTravailToAdd = undefined;
      this.getGroupementFromSelectecPositionTravail();
    }
  }

  public updateGroupement(event, ancienneValeur: PositionTravailModel) {

    this.listeElementsToUpdate.push({
      previous_element: ancienneValeur.idPositionTravail,
      new_element: event.value.idPositionTravail,
    });
  }

  public saveUpdatesAndClose() {
    // emit changes event
    this.addOrUpdateGroupementPositionTravailEvent.emit({
      first_element: this.selectedPositionTravail,
      second_element: this.listeElementsToUpdate,
      add_continue: false,
      action: 'Update'
    });
    this.positionTravailToAdd = undefined;
    // close popup
    this.closeEvent.emit();
  }
}
