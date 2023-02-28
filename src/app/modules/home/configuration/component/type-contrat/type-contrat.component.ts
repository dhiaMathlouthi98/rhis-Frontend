import {Component, OnInit} from '@angular/core';
import {PathService} from '../../../../../shared/service/path.service';
import {TypeContratService} from '../../service/type.contrat.service';
import {TypeContratModel} from '../../../../../shared/model/type.contrat.model';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-type-contrat',
  templateUrl: './type-contrat.component.html',
  styleUrls: ['./type-contrat.component.scss']
})
export class TypeContratComponent implements OnInit {

  public listTypeContrat: TypeContratModel[] = [];
  public selectedTypeContrat: TypeContratModel;
  public showAddUpdateTypeContratPopup = false;
  public showAddUpdateTypeContratPopupTitle: string;

  public existentTypeContrat: string;

  public buttonLabel: string;

  public heightInterface: any;
  private ecran = 'GTC';

  constructor(private pathService: PathService,
              private typeContratService: TypeContratService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getAllTypeContratByRestaurant();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Cette methode permet de recuperer la liste des types de contrat par restaurant
   */
  public getAllTypeContratByRestaurant() {
    this.typeContratService.getAllTypeContratByRestaurant().subscribe(
      (data: TypeContratModel[]) => {
        this.listTypeContrat = data;
        // ordonner la liste selon l'active avant
        this.listTypeContrat.sort((a, b) => (+b.activeTypeContrat) - (+a.activeTypeContrat));
      }, (err: any) => {

      }
    );
  }

  /**
   * Permet d'afficher la popup d'ajout d'un nouveau type de contrat
   */
  public addNewTypeContrat() {
    this.selectedTypeContrat = undefined;
    this.showAddUpdateTypeContratPopup = true;

    // set title to add type contrat
    this.showAddUpdateTypeContratPopupTitle = this.rhisTranslateService.translate('TYPE_CONTRAT.ADD_NEW_TYPE_CONTRAT');

    // set title to add button
    this.buttonLabel = this.rhisTranslateService.translate('TYPE_CONTRAT.ADD_NEW_TYPE_CONTRAT_BTN');
  }

  /**
   * Permet d'afficher la popup de mise à jour de type de contrat
   */
  public selectTypeContrat() {
    if (this.selectedTypeContrat.activeTypeContrat && this.domControlService.updateListControl(this.ecran)) {
      this.showAddUpdateTypeContratPopup = true;

      // set title to update type contrat
      this.showAddUpdateTypeContratPopupTitle = this.rhisTranslateService.translate('TYPE_CONTRAT.UPDATE_TYPE_CONTRAT');

      // set title to update button
      this.buttonLabel = this.rhisTranslateService.translate('TYPE_CONTRAT.UPDATE_TYPE_CONTRAT_BTN');
    }
  }

  /**
   * Cette methode permet d'afficher un message de confirmation de suppression de type restaurant
   */
  public deleteTypeContrat(uuidTypeContrat: string) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteDeleteTypeContrat(uuidTypeContrat);
      },
      reject: () => {
      }
    });
  }

  /**
   * Cette methode permet de faire appel au web service responsable à la suppression de type contrat et afficher un message d'erreur en cas de suppression d'un type contrat utilisé dans un contrat
   */
  public onConfirmDeleteDeleteTypeContrat(uuidTypeContrat: string) {
    const index = this.listTypeContrat.findIndex(typeContrat => typeContrat.uuid === uuidTypeContrat);
    if (index !== -1) {
      this.typeContratService.deleteTypeContrat(uuidTypeContrat).subscribe(
        (data: any) => {
          if (data) {
            this.listTypeContrat[index].activeTypeContrat = false;
            // display update success message

            this.notificationService.showMessageWithoutTranslateService('success', this.listTypeContrat[index].libelle + ' '
              + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));

            // ordonner la liste selon l'active avant
            this.listTypeContrat.sort((a, b) => (+b.activeTypeContrat) - (+a.activeTypeContrat));
          } else {
            // display delete success message
            this.notificationService.showMessageWithoutTranslateService('success', this.listTypeContrat[index].libelle + ' '
              + this.rhisTranslateService.translate('TYPE_CONTRAT.DELETE_SUCESS'));
            this.listTypeContrat.splice(index, 1);
          }
        }, (err: any) => {
        }
      );
    }
  }

  /**
   * Permet d'ajouter / mettre à jour type contrat
   */
  public addOrUpdateTypeContratEvent(typeContrat: TypeContratModel) {
    // add new Type Contrat
    if (this.showAddUpdateTypeContratPopupTitle === this.rhisTranslateService.translate('TYPE_CONTRAT.ADD_NEW_TYPE_CONTRAT')) {
      typeContrat.idTypeContrat = undefined;
      this.addTypeContrat(typeContrat);
    } else {
      // update type contrat
      this.updateTypeContrat(typeContrat);
    }
  }

  /**
   * Cette methode permet d'ajouter un type contrat au restaurant
   * @param: typeContrat
   */
  private addTypeContrat(typeContrat: TypeContratModel) {
    typeContrat.activeTypeContrat = true;
    this.typeContratService.addNewTypeContrat(typeContrat).subscribe(
      (data: TypeContratModel) => {
        typeContrat = data;
        this.listTypeContrat.push(typeContrat);
        this.showAddUpdateTypeContratPopup = false;
        // ordonner la liste selon l'active avant
        this.listTypeContrat.sort((a, b) => (+b.activeTypeContrat) - (+a.activeTypeContrat));
      }, (err: any) => {
        // display error message if type contrat name exists
        if (err.error === 'RHIS_TYPE_CONTRAT_NAME_EXISTS') {
          this.existentTypeContrat = this.rhisTranslateService.translate('TYPE_CONTRAT.ERR_NAME_EXIST');
        }
      }, () => {
        // display add success message

        this.notificationService.showMessageWithoutTranslateService('success', typeContrat.libelle + ' '
          + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATE_SUCCESS'));
      }
    );
  }

  /**
   * Cette methode permet de mettre à jour le type contrat
   * @param: typeContrat
   */
  private updateTypeContrat(typeContrat: TypeContratModel) {
    this.typeContratService.updateTypeContrat(typeContrat).subscribe(
      (data: number) => {
        const index = this.listTypeContrat.findIndex(TC => TC.idTypeContrat === typeContrat.idTypeContrat);
        this.listTypeContrat[index].libelle = typeContrat.libelle;
        this.listTypeContrat[index].dureeDetermine = typeContrat.dureeDetermine;
        this.showAddUpdateTypeContratPopup = false;
        // display update success message

        this.notificationService.showMessageWithoutTranslateService('success', typeContrat.libelle + ' '
          + this.rhisTranslateService.translate('TYPE_CONTRAT.TYPE_CONTRAT_UPDATED'));

      }, (err: any) => {
        // display error message if type contrat name exists
        if (err.error === 'RHIS_TYPE_CONTRAT_NAME_EXISTS') {
          this.existentTypeContrat = this.rhisTranslateService.translate('TYPE_CONTRAT.ERR_NAME_EXIST');
        }
      }
    );
  }

  public resetErrorMessagesEvent() {
    this.existentTypeContrat = undefined;
  }

  public closePopup() {
    this.showAddUpdateTypeContratPopup = false;
    this.resetErrorMessagesEvent();
  }

  public reactiveTypeContrat(typeContrat: TypeContratModel) {
    typeContrat.activeTypeContrat = true;
    this.typeContratService.updateTypeContrat(typeContrat).subscribe(
      () => {
      }, (err: any) => {
        typeContrat.activeTypeContrat = false;
      }, () => {
        // display update success message
        this.notificationService.showMessageWithoutTranslateService('success', typeContrat.libelle + ' '
          + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));

        // ordonner la liste selon l'active avant
        this.listTypeContrat.sort((a, b) => (+b.activeTypeContrat) - (+a.activeTypeContrat));
      }
    );
  }

}
