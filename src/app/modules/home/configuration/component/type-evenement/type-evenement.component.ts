import {Component, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {TypeEvenementService} from '../../service/type.evenement.service';
import {TypeEvenementModel} from '../../../../../shared/model/type.evenement.model';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-type-evenement',
  templateUrl: './type-evenement.component.html',
  styleUrls: ['./type-evenement.component.scss']
})
export class TypeEvenementComponent implements OnInit {
  public headerCode = ['TYPE', 'PAYE', 'TRAVAILLE', 'PREVISIBLE', 'CODE', 'CODE_GDH', 'CODE_PAYE', 'VALORISER', 'STATUT'];
  public typeEvents = [];
  public actionTitle: string;
  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 550
  };
  public showPopUp = false;
  public operationName: string;
  public selectedTypEvenement: TypeEvenementModel;

  public heightInterface: any;
  private ecran = 'GTE';

  constructor(
    private rhisTranslateService: RhisTranslateService,
    private sharedRestaurantService: SharedRestaurantService,
    private typeEvenementService: TypeEvenementService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
    private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getTypesEvenement();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Show PpoUp for add a type evenement
   */
  public addTypeEvenement() {
    this.actionTitle = this.rhisTranslateService.translate('TYPE_EVENT.ADD_BUTTON');
    this.selectedTypEvenement = null;
    this.operationName = 'addition';
    this.showPopUp = true;
  }

  /**
   * Show PopUp for edit a type evenement
   * @param: typEvenement
   */
  public editTypeEvenement(typEvenement: TypeEvenementModel) {
    if (typEvenement.statut && this.domControlService.updateListControl(this.ecran)) {
      this.selectedTypEvenement = typEvenement;
      this.actionTitle = this.rhisTranslateService.translate('TYPE_EVENT.EDIT_BUTTON');
      this.operationName = 'edition';
      this.showPopUp = true;
    }
  }

  /**
   * Get all type evenement
   */
  private getTypesEvenement(): void {
    this.typeEvenementService.getAllTypeEvenementByRestaurant().subscribe(
      (typesEvenement: TypeEvenementModel[]) => this.typeEvents = this.sortTypesEvenement(typesEvenement),
      _ => console.log
    );
  }

  /**
   * Sort Type Evenement to active and inactivef
   * @param: typesEvenement
   */
  private sortTypesEvenement(typesEvenement: TypeEvenementModel[]): TypeEvenementModel[] {
    return typesEvenement.sort((a: any, b: any) => b['statut'] - a['statut']);
  }

  /**
   * Delegate add/edit operation to dedicated functions based on operation name
   * @param: typeEvenementModel
   */
  public getEntity(typeEvenementModel: TypeEvenementModel): void {
    if (this.operationName === 'addition') {
      this.save(typeEvenementModel);
    } else if (this.operationName === 'edition') {
      const typeEventToUpdate = {
        idTypeEvenement: this.selectedTypEvenement.idTypeEvenement,
        statut: this.selectedTypEvenement.statut,
        uuid: this.selectedTypEvenement.uuid,
        ...typeEvenementModel
      };
      this.edit(typeEventToUpdate);
    }
  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDelete(uuid: string): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.delete(uuid);
      },
      reject: () => {
      }
    });
  }

  /**
   * Edit a typeEvenement
   * @param: typeEvenementModel
   */
  private edit(typeEvenementModel: TypeEvenementModel) {
    this.typeEvenementService.update(typeEvenementModel).subscribe(
      {
        next: value => this.updateList(typeEvenementModel),
        complete: () => {
          this.selectedTypEvenement = null;
          this.showPopUp = false;
          this.notificationService.showMessageWithoutTranslateService('success',
            typeEvenementModel.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIE'));
        }
      }
    );
  }

  /**
   * Save typeEvenement
   * @param: typeEvenement
   */
  private save(typeEvenement: TypeEvenementModel) {
    this.typeEvenementService.add({statut: true, ...typeEvenement}).subscribe((data: TypeEvenementModel) =>
        this.typeEvents = this.sortTypesEvenement([...this.typeEvents, {
          ...data
        }]),
      error => this.notificationService.showErrorMessage('TYPE_EVENT.TYPE_UNIQUE'),
      () => {
        this.notificationService.showMessageWithoutTranslateService('success',
          typeEvenement.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATE_SUCCESS'));
        this.showPopUp = false;
      });
  }

  /**
   * Delete type evenement by id
   * @param: idà voir !!!
   */
  private delete(uuid: string) {
    const index = this.typeEvents.findIndex(item => item.uuid === uuid);
    if (index !== -1) {
      this.typeEvenementService.remove(uuid).subscribe({
          next: (value: any) => {
            if (value === 'RHIS_TYPE_EVENT_IS_USED') {
              this.desactivateTypeEvenement(index);
            } else {
              this.notificationService.showMessageWithoutTranslateService('success',
                this.typeEvents[index].libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DELETE_SUCESS'));
              this.typeEvents.splice(index, 1);
            }
          },
          error: console.error
        }
      );
    }
  }

  /**
   * Activate an inactive type evenement
   * @param: typeEvnement
   */
  private activateTypeEvenement(typeEvnement: TypeEvenementModel) {
    this.typeEvenementService.update({...typeEvnement, statut: true}).subscribe({
      next: resp => {
        typeEvnement.statut = true;
        this.sortTypesEvenement(this.typeEvents);
      },
      complete: () =>
        this.notificationService.showMessageWithoutTranslateService('success',
          typeEvnement.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'))
    });
  }

  /**
   * Update the edited type event in the list tpyeEvents
   * @param: typeEvenement
   */
  private updateList(typeEvenement: TypeEvenementModel): void {
    const index = this.typeEvents.findIndex(
      (typeEvent: TypeEvenementModel) => typeEvent.idTypeEvenement === typeEvenement.idTypeEvenement);
    this.typeEvents[index] = typeEvenement;
  }

  /**
   * Desactivate attatched type evenement instead of delete
   * @param: id
   */
  private desactivateTypeEvenement(index: number) {
    if (index !== -1) {
      this.typeEvents[index]['statut'] = false;
      this.sortTypesEvenement(this.typeEvents);
    }

    this.notificationService.showMessageWithoutTranslateService('success',
      this.typeEvents[index].libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));
  }

  /**
   * Show confirmation Popup for activation
   * @param: typeEvenement
   */
  public showConfirmActivation(typeEvenement: TypeEvenementModel): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.ACTIVATION_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.ACTIVATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.activateTypeEvenement(typeEvenement);
      },
      reject: () => {
      }
    });
  }

}
