import {Component, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {FormArray, FormControl} from '@angular/forms';
import {ConfigTypeService} from '../../service/config-type.service';
import {ConfirmationService} from 'primeng/api';
import {LibelleObject} from '../../../../../shared/model/gui/LibelleObject';

@Component({
  selector: 'rhis-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: ['./config-list.component.scss']
})
export class ConfigListComponent<Model extends LibelleObject> implements OnInit {
  entities: Model[] = [];
  inputControl = new FormControl();
  protected idName: string;
  title: string;
  private controls: FormArray;
  protected addErrorMessage = '';
  protected updateErrorMessage = '';
  protected deleteErrorMessage = 'MESSAGE.SUP_ERROR';
  protected desactivationMessage = '';
  protected DESACTIVATION_CODE = '';
  public heightInterface: any;

  constructor(protected rhisTranslateService: RhisTranslateService,
              protected notificationService: NotificationService,
              protected confirmationService: ConfirmationService,
              protected service: ConfigTypeService<Model>) {
  }

  ngOnInit() {
    this.getAll();
  }

  /**
   * add an entity of type Model
   */
  public add(): void {
    const libelle = this.inputControl.value;
    if (libelle && libelle.trim()) {
      if (this.checkValueExist(libelle.trim())) {
        this.notificationService.showErrorMessage(this.addErrorMessage);
      } else {
        const entity: any = {libelle: libelle.trim(), [this.idName]: null, statut: true};
        this.service.add(entity).subscribe(
          (savedEntity: Model) => {
            this.entities = this.sortEntities([...this.entities, savedEntity]);
            this.setFormArray();
            this.inputControl.setValue('');
          },
          error => this.notificationService.showErrorMessage(this.addErrorMessage),
          () => {
            this.notificationService.showSuccessMessage(libelle + ' ' +
              this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATE_SUCCESS'));
          }
        );
      }
    }
  }

  /**
   * Edit an entity of type Model
   * @param: entity
   * @param: index
   */
  private edit(entity: Model, index: number): void {
    this.service.update(entity).subscribe(value => {
        this.entities[index]['libelle'] = entity['libelle'];
      },
      (error: any) => {
        this.setDefaultValue(index);
        this.notificationService.showErrorMessage(this.updateErrorMessage);
      },
      () => {
        const libelleToEdit: String = this.entities[index].libelle;
        this.notificationService.showSuccessMessage(libelleToEdit + ' ' +
          this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_OK'));
      }
    );
  }

  /**
   * Desactivate an entity in a specified index
   * @param: index
   */
  private desactivateEntity(index: number): void {
    const libelleToDesactivate: String = this.entities[index].libelle;
    this.entities[index]['statut'] = false;
    this.entities = this.sortEntities(this.entities);
    this.notificationService.showSuccessMessage(libelleToDesactivate + ' ' +
      this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));
  }

  /**
   * Activate an entity
   * @param: entity
   * @param: index
   */
  private activateEntity(entity: Model, index: number) {
    this.service.update({...entity, statut: true}).subscribe(value => {
        this.entities[index]['statut'] = true;
        this.entities = this.sortEntities(this.entities);
      },
      (error: any) => {
        this.notificationService.showErrorMessage(this.updateErrorMessage);
      },
      () => {
        const libelleToActivate: String = this.entities[index].libelle;
        this.notificationService.showSuccessMessage(libelleToActivate + ' ' +
          this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));
      }
    );
  }

  /**
   * Sort the entities based on statut
   * @param: entities
   */
  private sortEntities(entities: Model[]): Model[] {
    return entities.sort((a: any, b: any) => b['statut'] - a['statut']);
  }

  /**
   * Check if the given value matches one of the entities labels field;
   * @param: value
   */
  private checkValueExist(value: string): boolean {
    const siblingValeus = this.entities
      .map(entity => entity['libelle'])
      .filter((libelle: string) => libelle.toLocaleLowerCase() === value.toLocaleLowerCase());
    // transform the number to a boolean
    return !!siblingValeus.length;
  }

  /**
   * check case sensitive for a string by given an index
   * @param: value
   * @param: index
   */
  private isCaseSensitive(value: string, index: number): boolean {
    return this.entities
      .map(entity => entity['libelle'])[index].trim().toLowerCase() === value.trim().toLowerCase();
  }

  /**
   * Check the validity of the value and update the selected entity of type Model
   * @param: index
   */
  public updateField(index: number) {
    const control = this.getControl(index);
    const libelleToUpdateField: String = this.entities[index].libelle;
    if (control.valid && control.value.toString().trim()) {
      if (this.checkValueExist(control.value.toString().trim()) && !this.isCaseSensitive(control.value.toString(), index)) {
        if (!this.setDefaultValue(index)) {
          this.notificationService.showErrorMessage(libelleToUpdateField + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ECHEC_MODIFY'));
        }
      } else {
        const entity = {...this.entities[index], libelle: control.value.toString().trim()};
        this.edit(entity, index);
      }
    } else {
      this.setDefaultValue(index);
    }
  }

  /**
   * Set the control value with the index in the formArray to its original value
   * @param: index
   */
  private setDefaultValue(index: number): boolean {
    const isOriginalValue = (this.entities[index]['libelle'] === this.getControl(index).value.toString().trim());
    this.getControl(index).setValue(this.entities[index]['libelle']);
    return isOriginalValue;
  }


  /**
   * Delete an entity of type Model by id
   * @param: id
   * @param: index
   */
  private delete(id: string, index: number): void {
    this.service.remove(id).subscribe(
      (resp: any) => {
        if (resp === this.DESACTIVATION_CODE) {
          this.desactivateEntity(index);
        } else {
          this.removeFromList(index);
        }
      },
      error => this.notificationService.showErrorMessage(this.deleteErrorMessage)
    );
  }

  /**
   * Remove the entity with an index from entities list
   * @param: index
   */
  removeFromList(index: number): void {
    const libelleToDelete: String = this.entities[index].libelle;
    this.entities.splice(index, 1);
    this.setFormArray();
    this.notificationService.showSuccessMessage(libelleToDelete + ' ' +
      this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DELETE_SUCESS'));
  }

  /**
   * Fetch all entity of type Model
   */
  private getAll(): void {
    this.service.getAll().subscribe((entities: Model[]) => {
      this.entities = this.sortEntities(entities);
      this.setFormArray();
    });
  }

  /**
   * Set FormArray to control the values of all entities
   */
  private setFormArray() {
    const formArray = this.entities.map((entity: any) => {
      return new FormControl(entity.libelle);
    });
    this.controls = new FormArray(formArray);
  }

  /**
   * Get the the FormControl the an entity by its index in the entities table
   * @param: index
   */
  private getControl(index: number): FormControl {
    return this.controls.at(index) as FormControl;
  }


  /**
   * A function to track the list of entities to better perform in add/delete/edit operations
   * @param: index
   * @param: item
   */
  public trackByFn(index: number, item: Model): number {
    return item[this.idName];
  }

  /**
   * Show delete pop up confirmation
   * @param: id
   * @param: index
   */
  public showConfirmDelete(id: string, index: number) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.delete(id, index);
      },
      reject: () => {
      }
    });
  }

  /**
   * Show confirmation Popup for activation
   * @param: typeEvenement
   */
  public showConfirmActivation(entity: Model, index: number): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.ACTIVATION_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.ACTIVATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.activateEntity(entity, index);
      },
      reject: () => {
      }
    });
  }
}
