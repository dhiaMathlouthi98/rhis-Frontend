import {Component, OnInit} from '@angular/core';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {PositionTravailService} from '../../../service/position-travail.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-gestion-poste-travail',
  templateUrl: './gestion-poste-travail.component.html',
  styleUrls: ['./gestion-poste-travail.component.scss']
})
export class GestionPosteTravailComponent implements OnInit {

  public listePositionTravail: PositionTravailModel[] = [];
  public defaultListePositionTravail: PositionTravailModel[] = [];
  public listeActifPositionTravail: PositionTravailModel[] = [];
  public listeInactifPositionTravail: PositionTravailModel[] = [];
  public listePositionTravailToUpdate: PositionTravailModel[] = [];

  public selectedPosteTravail: PositionTravailModel;

  public displayPopup = false;

  public addUpdatePopupTitle = '';

  public existentPositionTravail: string;

  public buttonLabel: string;
  private selectedIndex = -1;
  private ecran = 'EPT';

  // Paramètres du popup
  public popUpStyle = {width: 750};

  constructor(private positionTravailService: PositionTravailService,
              private translator: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.getListePositionTravailByRestaurant();
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * augmenté la priorité de position de travail selectionné
   *
   * @param: position
   */
  public augmenterPriorite(position: PositionTravailModel) {
    const selectedIndex = this.listePositionTravail.indexOf(position);
    if (!(selectedIndex === 0)) {
      position.priorite--;
      this.listePositionTravail[selectedIndex - 1].priorite++;
      this.sortListPositionTravail();
    }
  }

  /**
   * Cette methode permet de detecter s'il y a un changement au niveau de la liste des positions de travail
   */
  public isSameList(): boolean {
    if (this.defaultListePositionTravail.length !== this.listePositionTravail.length) {
      return false;
    }
    let same = true;
    this.defaultListePositionTravail.forEach((item, index) => {
      if (JSON.stringify(this.listePositionTravail[index]) !== JSON.stringify(this.defaultListePositionTravail[index])) {
        same = false;
      }
    });
    return same;
  }

  /**
   * diminuer la priorité de position de travail selectionné
   *
   * @param: position
   */
  public diminuerPriorite(position: PositionTravailModel) {
    const selectedIndex = this.listePositionTravail.indexOf(position);
    if (!(selectedIndex === this.listePositionTravail.length - 1)) {
      position.priorite++;
      this.listePositionTravail[selectedIndex + 1].priorite--;
      this.sortListPositionTravail();
    }
  }

  /**
   * Permet d'ouvrir la popup d'ajout
   */
  public addNewPopup() {
    this.resetErrorMessagesEvent();
    this.addUpdatePopupTitle = this.translator.translate('POST_TRAVAIL.ADD_TITLE');
    this.buttonLabel = this.translator.translate('POST_TRAVAIL.ADD_NEW_BUTTON');
    this.displayPopup = true;
  }

  /**
   * Permet d'ouvrir la popup de modification
   */
  public updatePopup(positionTravail: PositionTravailModel, index: number): void {
    if (positionTravail.actifPositionTravail && this.domControlService.updateListControl(this.ecran)) {
      this.resetErrorMessagesEvent();
      this.addUpdatePopupTitle = this.translator.translate('POST_TRAVAIL.UPDATE_TITLE');
      this.buttonLabel = this.translator.translate('POST_TRAVAIL.UPDATE_BUTTON');
      this.displayPopup = true;
      this.selectedIndex = index;
    }
  }

  public checkPostionTravailExistance(position: PositionTravailModel): void {
    this.notificationService.startLoader();
    let addPositionTravail = false;
    if (this.addUpdatePopupTitle === this.translator.translate('POST_TRAVAIL.ADD_TITLE')) {
      position.idPositionTravail = 0;
      addPositionTravail = true;
      delete position.uuid;
    }

    const index = this.listePositionTravail.findIndex(pos => pos.libelle.toUpperCase() === position.libelle.toUpperCase() && ((pos.idPositionTravail === 0 && position.idPositionTravail === 0) || (pos.idPositionTravail !== position.idPositionTravail)));
    if (index !== -1 && index !== this.selectedIndex) {
      this.existentPositionTravail = this.translator.translate('POST_TRAVAIL.ERR_NAME_EXIST');
      this.notificationService.stopLoader();
      return;
    }
    if (position.uuid === null) {
      delete position.uuid;
    }
    this.positionTravailService.checkPositionTravailExistance(position.libelle, position.uuid).subscribe(
      () => {
        this.notificationService.stopLoader();
        this.displayPopup = false;
        if (addPositionTravail) {
          this.addPositionTravail(position);
        } else {
          this.updatePositionTravail(position);

        }
      }, (err: any) => {
        this.notificationService.stopLoader();
        if (err.error === 'RHIS_POSITION_TRAVAIL_NAME_EXISTS') {
          this.existentPositionTravail = this.translator.translate('POST_TRAVAIL.ERR_NAME_EXIST');
        }
      }
    );
  }

  /**
   * Cette methode permet d'afficher un message de confirmation de suppression de position de travail
   */
  public deletePositionTravail(position: PositionTravailModel) {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.DELETE_MESSAGE'),
      header: this.translator.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteDeletePositionTravail(position);
      },
      reject: () => {
      }
    });
  }

  public resetErrorMessagesEvent() {
    this.existentPositionTravail = undefined;
  }

  public hidePopup(): void {
    this.selectedPosteTravail = undefined;
    this.selectedIndex = -1;
    this.displayPopup = false;
  }

  public reactivePositionTravail(position: PositionTravailModel) {
    // remove element from inactive list
    const index = this.listeInactifPositionTravail.findIndex(posTrav => posTrav.idPositionTravail === position.idPositionTravail);
    this.listeInactifPositionTravail.splice(index, 1);

    // set new priorite to activated element and add it to active list
    position.priorite = this.getLastActifPriorite();
    position.actifPositionTravail = true;
    this.listeActifPositionTravail.push(position);
    this.notificationService.showMessageWithoutTranslateService('success',
      position.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));

    let diff = 0;
    this.listePositionTravailToUpdate = [];
    this.listePositionTravailToUpdate.push(position);
    // update other element in inactive list
    this.listeInactifPositionTravail.forEach(inactifElement => {
      this.listePositionTravailToUpdate.push(inactifElement);
      inactifElement.priorite = this.getLastActifPriorite() + diff;
      diff++;
    });
    // update other element in displayed list
    this.listeInactifPositionTravail.forEach(inactifElement => {
      this.listePositionTravail.forEach(item => {
        if (inactifElement.idPositionTravail === item.idPositionTravail) {
          item.priorite = inactifElement.priorite;
        }
      });
    });
    this.updatePrioriteAndActivationOnly(true, true);
  }

  public async updateAllListePositionTravail(): Promise<Object> {
    let returnedValue;
    if (!this.isSameList()) {
      returnedValue = await this.positionTravailService.updateListPositionTravail(this.listePositionTravail).toPromise();
      this.listePositionTravail = returnedValue;
    }
    this.notificationService.showSuccessMessage('POST_TRAVAIL.UPDATESUCCESS');
    this.listePositionTravailToUpdate = [];
    this.sortListPositionTravail();
    this.defaultListePositionTravail = JSON.parse(JSON.stringify(this.listePositionTravail));
    return returnedValue;
  }

  private getListePositionTravailByRestaurant() {
    this.positionTravailService.getAllPositionTravailByRestaurant().subscribe(
      (data: PositionTravailModel[]) => {
        this.listePositionTravail = data;
        this.setActifAndInactifLists();
        this.sortListPositionTravail();
        this.defaultListePositionTravail = JSON.parse(JSON.stringify(this.listePositionTravail));
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * ordonner la liste des positions de travail selon la priorite
   */
  private sortListPositionTravail() {
    this.listePositionTravail.sort((item1, item2) => item1.priorite - item2.priorite);
    this.listeActifPositionTravail.sort((item1, item2) => item1.priorite - item2.priorite);
  }

  private addPositionTravail(position: PositionTravailModel) {
    position.priorite = this.getLastActifPriorite();
    position.libelle = position.libelle.trim();
    if (!position.couleur) {
      position.couleur = '#c0c0c0';
    }
    position.actifPositionTravail = true;
    position.groupement = [];
    this.updateListAfterSave(position);
  }

  private updatePositionTravail(position: PositionTravailModel) {
    position.libelle = position.libelle.trim();
    const index = this.listePositionTravail.findIndex(posTrav => posTrav === this.selectedPosteTravail);
    this.listePositionTravail[index] = position;
    const actifIndex = this.listeActifPositionTravail.findIndex(posTrav => posTrav === this.selectedPosteTravail);
    this.listeActifPositionTravail[actifIndex] = position;
  }

  /**
   * Cette methode permet de faire appel au web service responsable à la suppression de position de travail
   */

  private onConfirmDeleteDeletePositionTravail(position: PositionTravailModel) {
    if (position.idPositionTravail === 0) {
      const index = this.listePositionTravail.findIndex(posTrav => posTrav.idPositionTravail === position.idPositionTravail);
      this.removePositionTravailAndUpdatePriorite(position, index);

    } else {

      this.positionTravailService.deletePositionTravail(position.uuid).subscribe(
        (data: any) => {
          const index = this.listePositionTravail.findIndex(posTrav => posTrav.idPositionTravail === position.idPositionTravail);
          if (data) {
            this.disablePositionTravailAndUpdatePriorite(position, index);
          } else {
            this.removePositionTravailAndUpdatePriorite(position, index);
          }
        }, (err: any) => {
          this.notificationService.showErrorMessage('POST_TRAVAIL.POSITION_IS_USED', 'POST_TRAVAIL.DELETE_NOT_ALLOWED');
        },
        () => this.defaultListePositionTravail = JSON.parse(JSON.stringify(this.listePositionTravail))
      );
    }
  }

  private removePositionTravailAndUpdatePriorite(position: PositionTravailModel, index: number) {
    this.listePositionTravail.splice(index, 1);

    this.notificationService.showMessageWithoutTranslateService('success',
      position.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.SINGLE_FEMALE_DELETE_SUCESS'));

    this.diminuePrioriteAndSetListeToUpdate(index);
    this.updateListActifPositionTravail(position);

    this.updatePrioriteAndActivationOnly(false);
  }

  private disablePositionTravailAndUpdatePriorite(position: PositionTravailModel, index: number) {
    this.listePositionTravail[index].actifPositionTravail = false;

    this.notificationService.showMessageWithoutTranslateService('success',
      position.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));

    this.diminuePrioriteAndSetListeToUpdate(index + 1);
    this.updateListActifPositionTravail(position);

    this.listePositionTravail[index].priorite = this.listePositionTravail[this.listePositionTravail.length - 1].priorite + 1;
    this.listePositionTravailToUpdate.push(this.listePositionTravail[index]);

    this.updatePrioriteAndActivationOnly(true, false);
  }

  private diminuePrioriteAndSetListeToUpdate(index: number) {
    for (let i = index; i < this.listePositionTravail.length; i++) {
      this.listePositionTravail[i].priorite = this.listePositionTravail[i].priorite - 1;
      this.listePositionTravailToUpdate.push(this.listePositionTravail[i]);
    }
  }

  private updateListActifPositionTravail(position: PositionTravailModel) {
    const index = this.listeActifPositionTravail.findIndex(posTrav => posTrav.idPositionTravail === position.idPositionTravail);
    this.listeActifPositionTravail.splice(index, 1);
    for (let i = index; i < this.listeActifPositionTravail.length; i++) {
      this.listeActifPositionTravail[i].priorite = this.listeActifPositionTravail[i].priorite - 1;
    }
  }

  private updatePrioriteAndActivationOnly(displayMessage: boolean, activated?: boolean) {
    this.positionTravailService.updateListPositionTravail(this.listePositionTravailToUpdate).subscribe(
      (data: any) => {
      }, (err: any) => {
      }, () => {
        this.listePositionTravailToUpdate = [];
        this.sortListPositionTravail();
        if (displayMessage && activated) {

        } else if (displayMessage && !activated) {

        }
      }
    );
  }

  private getLastActifPriorite(): number {
    if (this.listeActifPositionTravail.length > 0) {
      let lastPriorite = this.listeActifPositionTravail[this.listeActifPositionTravail.length - 1].priorite;
      lastPriorite += 1;
      return lastPriorite;
    } else {
      return 1;
    }
  }

  private setActifAndInactifLists() {
    this.listePositionTravail.forEach(item => {
      if (item.actifPositionTravail) {
        this.listeActifPositionTravail.push(Object.create(item));
      } else {
        this.listeInactifPositionTravail.push(item);
      }
    });
  }

  private updateListAfterSave(position: PositionTravailModel) {
    this.listePositionTravail.push(position);
    this.updateInactiveListePositionTravail();
    this.listeActifPositionTravail.push(position);
    this.sortListPositionTravail();
  }

  private updateInactiveListePositionTravail() {
    this.listePositionTravailToUpdate = [];
    this.listePositionTravail.forEach(item => {
      if (!item.actifPositionTravail) {
        item.priorite = item.priorite + 1;
        this.listePositionTravailToUpdate.push(item);
      }
    });
  }
}
