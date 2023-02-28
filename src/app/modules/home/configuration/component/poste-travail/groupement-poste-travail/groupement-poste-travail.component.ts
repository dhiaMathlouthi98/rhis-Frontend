import {Component, OnInit} from '@angular/core';
import {PositionTravailService} from '../../../service/position-travail.service';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {GroupementPositionTravailService} from '../../../service/groupement.position.travail.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-groupement-poste-travail',
  templateUrl: './groupement-poste-travail.component.html',
  styleUrls: ['./groupement-poste-travail.component.scss']
})
export class GroupementPosteTravailComponent implements OnInit {

  public listeActivePositionTravail: PositionTravailModel[] = [];

  public listeAfficher: PositionTravailModel[] = [];

  public selectedGroupement: PositionTravailModel;

  public popupTitle: string;

  public displayPopup = false;

  public header = [];

  public prodDisplay = false;

  private ecran = 'GGP';

  constructor(private positionTravailService: PositionTravailService,
              private groupementPositionTravailService: GroupementPositionTravailService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private rhisTranslator: RhisTranslateService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.setHeader();
    this.getListePositionTravailByRestaurant();
    this.domControlService.addControl(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  private getListePositionTravailByRestaurant() {
    this.positionTravailService.getAllPositionTravailByRestaurant().subscribe((data: PositionTravailModel[]) => {
        this.listeActivePositionTravail = data;
        this.setDefaultDisplay();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Methode permet d'ouvrir la popup
   */
  public addNewPopup() {
    this.selectedGroupement = undefined;
    this.popupTitle = this.rhisTranslator.translate('GROUPEMENT_POST_TRAVAIL.ADD_NEW');
    this.displayPopup = true;
  }

  /**
   * Methode permet de fermer la popup
   */
  public hidePopup() {
    this.displayPopup = false;
  }

  public deleteGroupement(first_element: PositionTravailModel, second_element: PositionTravailModel) {
    this.confirmationService.confirm({
      message: this.rhisTranslator.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslator.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteGroupement(first_element, second_element);
      },
      reject: () => {
      }
    });
  }

  /**
   * Methode permet de faire appel au web service reponsable de l'ajout du groupement
   */
  public addOrUpdateGroupement(groupementPositionTravail: any) {
    this.findAndPersistGroupement(groupementPositionTravail);
  }

  public switchProdAndNoProd() {
    this.prodDisplay = !this.prodDisplay;
    this.setHeader();
    this.setDefaultDisplay();
  }

  private setHeader() {
    this.header = [];
    if (this.prodDisplay) {
      this.header = [
        {title: this.rhisTranslator.translate('POST_TRAVAIL.POSTE_PROD_ASSOC'), field: 'libelle'},
        {title: ''},
        {title: this.rhisTranslator.translate('POST_TRAVAIL.POSTE_NON_PROD')},
      ];
    } else {
      this.header = [
        {title: this.rhisTranslator.translate('POST_TRAVAIL.POSTE_NON_PROD'), field: 'libelle'},
        {title: ''},
        {title: this.rhisTranslator.translate('POST_TRAVAIL.POSTE_PROD_ASSOC')},
      ];
    }
  }

  /**
   * Methode permet d'affichier les groupement non productif / productif
   */
  private setDefaultDisplay() {
    this.listeAfficher = [];
    this.listeActivePositionTravail.forEach(item => {
      if (!this.prodDisplay) {
        if (!item.prod) {
          this.listeAfficher.push(item);
        }
      } else {
        if (item.prod) {
          this.listeAfficher.push(item);
        }
      }

    });
    this.sortDisplayedList();
  }

  /**
   * Methode permet de trier les groupements et les positions de travails par ordre alhpabétique
   */
  private sortDisplayedList() {
    this.listeAfficher.sort((a, b) => a.libelle < b.libelle ? -1 : (a.libelle > b.libelle ? 1 : 0));
    this.listeAfficher.forEach(item => {
      item.groupement.sort((a, b) => a.libelle < b.libelle ? -1 : (a.libelle > b.libelle ? 1 : 0));
    });
  }

  /**
   * Methode permet de faire appel au web service reponsable de la suppression du groupement
   */
  private onConfirmDeleteGroupement(first_element: PositionTravailModel, second_element: PositionTravailModel) {
    this.groupementPositionTravailService.findAndDeleteGroupement(first_element.uuid, second_element.uuid).subscribe(
      () => {
        this.listeActivePositionTravail.forEach(item => {
          if (item.idPositionTravail === first_element.idPositionTravail) {
            // remove element from groupement list
            const index = item.groupement.findIndex(posTrav => posTrav.idPositionTravail === second_element.idPositionTravail);
            item.groupement.splice(index, 1);
          } else if (item.idPositionTravail === second_element.idPositionTravail) {
            // remove element from groupement list
            const index = item.groupement.findIndex(posTrav => posTrav.idPositionTravail === first_element.idPositionTravail);
            item.groupement.splice(index, 1);
          }
        });
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }, () => {
        // display add success message
        this.notificationService.showSuccessMessage('GROUPEMENT_POST_TRAVAIL.DELETE_SUCCES');
      }
    );
  }

  public hasGroupement(): boolean {
    let hasGroupement = false;
    this.listeAfficher.forEach(item => {
      if (item.groupement.length > 0) {
        hasGroupement = true;
      }
    });
    return hasGroupement;
  }

  private findAndPersistGroupement(groupementPositionTravail: any) {
    this.groupementPositionTravailService.findAndPersistGroupement(groupementPositionTravail.first_element.uuid, groupementPositionTravail.second_element.uuid).subscribe(
      () => {
        if (!groupementPositionTravail.add_continue) {
          this.listeActivePositionTravail.forEach(item => {
            if (item.idPositionTravail === groupementPositionTravail.first_element.idPositionTravail) {
              item.groupement.push(groupementPositionTravail.second_element);
            } else if (item.idPositionTravail === groupementPositionTravail.second_element.idPositionTravail) {
              item.groupement.push(groupementPositionTravail.first_element);
            }
          });
        }
        this.sortDisplayedList();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }, () => {
        // display add success message
        this.notificationService.showSuccessMessage('GROUPEMENT_POST_TRAVAIL.ADD_SUCCES');
      }
    );
  }


  private deleteLocalGroupement(idPositionTravail1: number, idPositionTravail2: number) {
    this.findAndDeleteLocalGroupement(idPositionTravail1, idPositionTravail2);
    this.findAndDeleteLocalGroupement(idPositionTravail2, idPositionTravail1);
  }

  private findAndDeleteLocalGroupement(idPositionTravail1: number, idPositionTravail2: number) {
    const index = this.listeActivePositionTravail.findIndex(posTrav => posTrav.idPositionTravail === idPositionTravail1);
    const indexToDelete = this.listeActivePositionTravail[index].groupement.findIndex(posTrav => posTrav.idPositionTravail === idPositionTravail2);
    this.listeActivePositionTravail[index].groupement.splice(indexToDelete, 1);
  }

  private persisLocalGroupement(idPositionTravail1: number, idPositionTravail2: number) {
    this.findAndPersistLocalGroupement(idPositionTravail1, idPositionTravail2);
    this.findAndPersistLocalGroupement(idPositionTravail2, idPositionTravail1);

  }

  private findAndPersistLocalGroupement(idPositionTravail2: number, idPositionTravail1: number) {
    const index = this.listeActivePositionTravail.findIndex(posTrav => posTrav.idPositionTravail === idPositionTravail1);
    const indexPostToAdd = this.listeActivePositionTravail.findIndex(posTrav => posTrav.idPositionTravail === idPositionTravail2);

    this.listeActivePositionTravail[index].groupement.push(this.listeActivePositionTravail[indexPostToAdd]);
  }
}

