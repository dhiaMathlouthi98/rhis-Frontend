import {Component, OnInit} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {FormationService} from '../../service/formation.service';
import {FormationModel} from '../../../../../shared/model/formation.model';
import {Observable, Subject} from 'rxjs';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-list-formation',
  templateUrl: './list-formation.component.html',
  styleUrls: ['./list-formation.component.scss']
})
export class ListFormationComponent implements OnInit {

  public listFormation: FormationModel[] = [];
  public defaultListFormation: FormationModel[] = [];
  public listFormationInactif: FormationModel[] = [];
  public listFormationActif: FormationModel[] = [];
  public selectedTypeFormation: FormationModel;
  public showAddUpdateTypeFormationPopup = false;
  public showAddUpdateTypeFormationPopupTitle: string;
  public libelleExiste: string;
  public codeExiste: string;
  public idTypeFormation: number;
  public uuidTypeFormation: string;
  public prioriteCurrent: number;
  public showAddOrUpdateTypeFormationButtons: string;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  private ecran = 'ELF';

  public heightInterface: any;
  public numberOfmodification = 0;
  public libeleFormation: string;

  public popUpStyle = {
    width: 650
  };

  constructor(private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private listFormationService: FormationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.getAllListFormationByRestaurant();
  }


  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Cette methode permet de recuperer la liste des type formation par restaurant
   */
  public getAllListFormationByRestaurant() {
    this.listFormationService.getAllFormationByRestaurant().subscribe(
      (data: FormationModel[]) => {
        this.listFormation = data;
        this.cloneAndResetDefaultListeFormation();
        this.setListTypeFormationActifAndIncatif();

      }, (err: any) => {

      }
    );
  }

  /**
   * Cette methode permet de recuperer l'index de l'element selectionne
   */
  private getIndexOfSelectedformation(formation: FormationModel): number {
    return this.listFormation.indexOf(formation);
  }

  /**
   * Cette methode permet d'augmenter la priorite de l'element selectionne
   */
  public augmenterPriorite(formation: FormationModel) {
    this.showAddUpdateTypeFormationPopup = false;
    const selectedIndex = this.getIndexOfSelectedformation(formation);
    if (!(selectedIndex === 0)) {
      formation.priorite--;
      this.listFormation[selectedIndex - 1].priorite++;
      this.sortFormations();
    }
  }

  /**
   * Cette methode permet de diminuer la priorite de l'element selectionne
   */
  public diminuerPriorite(formation: FormationModel) {
    this.showAddUpdateTypeFormationPopup = false;
    const selectedIndex = this.getIndexOfSelectedformation(formation);
    if (!(selectedIndex === this.listFormation.length - 1)) {
      formation.priorite++;
      this.listFormation[selectedIndex + 1].priorite--;
      this.sortFormations();
    }
  }

  /**
   * Cette methode permet d'ordonner les alertes selon la priorite
   */
  private sortFormations(defaultListFormation?: FormationModel[]) {
    if (defaultListFormation) {
      this.listFormation.sort((a, b) => a.priorite - b.priorite);
      this.defaultListFormation.sort((a, b) => a.priorite - b.priorite);
    } else {
      this.listFormation.sort((a, b) => a.priorite - b.priorite);
    }
  }

  /**
   * fermer le pupup
   */
  closePopup() {
    this.showAddUpdateTypeFormationPopup = false;
  }


  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des formations
   */
  public compareList(): boolean {
    let same = true;
    this.numberOfmodification = 0;
    this.listFormation.forEach((item: FormationModel, index: number) => {
      if (JSON.stringify(this.defaultListFormation[index]) !== JSON.stringify(this.listFormation[index])) {
        same = false;
        this.numberOfmodification++;
        this.libeleFormation = this.listFormation[index].libelle;
      }
    });
    return same;
  }

  /**
   *Cette methode permet de cloner la liste des formations en une autre liste afin des le comparer
   * utilise pour savoir s'il y a eu un changement dans la liste des formations
   */
  private cloneAndResetDefaultListeFormation() {
    this.defaultListFormation = [];
    this.listFormation.forEach(item => {
      this.defaultListFormation.push(JSON.parse(JSON.stringify(item)));
    });
    this.sortFormations(this.defaultListFormation);
  }

  /**
   * modifier les priorites de list de formation
   */
  public updateFormationsPrioriteByRestaurant() {
    if (!this.compareList()) {
      this.listFormation.forEach(formation => {
        if (isNaN(Number(formation.idFormation))) {
          formation.idFormation = 0;
        }
      });
      this.listFormationService.updateFormationsPrioriteByRestaurant(this.listFormation).subscribe((data: FormationModel[]) => {
          if (this.numberOfmodification > 1) {
            this.notificationService.showSuccessMessage('FORMATION.LIST_UPDATED_SUCCESS');
          } else {
            this.notificationService.showMessageWithoutTranslateService('success',
              this.libeleFormation + ' ' + this.rhisTranslateService.translate('FORMATION.SAVE_SUCESS'));
          }
          this.listFormation = data;
          this.cloneAndResetDefaultListeFormation();
        },
        (err: any) => {
          console.log('error');
          console.log(err);
        });
    }
  }

  /**
   * Permet d'afficher la popup d'ajout d'un nouveau groupe de travail
   */
  addNewTypeFormation() {
    this.codeExiste = undefined;
    this.libelleExiste = undefined;
    this.selectedTypeFormation = undefined;
    this.showAddUpdateTypeFormationPopup = true;
    this.showAddOrUpdateTypeFormationButtons = this.rhisTranslateService.translate('FORMATION.BUTTON_SAVE');
    this.showAddUpdateTypeFormationPopupTitle = this.rhisTranslateService.translate('FORMATION.ADD_NEW_POPUP');
  }

  /**
   * priorite de type formation par default auto increment
   */
  public incremmentPrioriteOfTypeFormation() {
    const lentgh = this.listFormationActif.length;
    // vérifier si la liste est rempli si non priorité prend la valeur du constructeur : 1
    if (lentgh > 0 && this.listFormationActif[lentgh - 1].priorite !== undefined) {
      this.prioriteCurrent = this.listFormationActif[lentgh - 1].priorite + 1;
    } else {
      this.prioriteCurrent = 1;
    }
    if (this.listFormationInactif.length > 0) {
      this.listFormationInactif.forEach(formation => {
        formation.priorite++;
      });
    }
  }

  /**
   * Add / Update type Formation
   * @param :typeFormation
   */
  public addOrUpdateTypeFormation(typeFormation: FormationModel) {
    if (this.selectedTypeFormation) {
      this.setTypeForamtionBeforeUpdate(typeFormation);
    } else {
      this.setTypeForamtionBeforeSave(typeFormation);

    }
    if (!this.uniciteChamps(typeFormation)) {

      if (typeFormation.idFormation) {
        this.updateFormation(typeFormation);
      } else {
        this.saveTypeFormation(typeFormation);
      }
    }
  }

  /**
   * traitement d'unicité de groupe de travail libelle ,code emploi,niveau
   * @param: groupTravail
   */
  public uniciteChamps(typeFormation: FormationModel) {
    let existe = false;
    for (const itemFormation of this.listFormation) {
      if (itemFormation.idFormation !== typeFormation.idFormation) {
        this.uniciteLibelle(itemFormation, typeFormation);
        this.uniciteCode(itemFormation, typeFormation);
      }
    }
    if (this.codeExiste || this.libelleExiste) {
      existe = true;
    }
    return existe;
  }

  /**
   * traitement l'unicité de libelle
   * @param : itemFormation
   * @param: typeFormation
   */
  public uniciteLibelle(itemFormation: FormationModel, typeFormation: FormationModel) {
    if (itemFormation.libelle) {
      if (itemFormation.libelle.trim().toUpperCase() === typeFormation.libelle.trim().toUpperCase()) {
        this.libelleExiste = this.rhisTranslateService.translate('FORMATION.LIBELLE_EXISTE');
      }
    }
  }

  /**
   * traitement l'unicité de code d'emploi
   * @param : itemFormation
   * @param: itemFormation
   */
  public uniciteCode(itemFormation: FormationModel, typeFormation: FormationModel) {
    if (itemFormation.code) {
      if (itemFormation.code.trim().toUpperCase() === typeFormation.code.trim().toUpperCase()) {
        this.codeExiste = this.rhisTranslateService.translate('FORMATION.CODE_EXISTE');
      }
    }
  }

  /**
   * reset message de erreur pour la libelle
   */
  resetErrorMessagesLabelEvent() {
    this.libelleExiste = undefined;
  }

  /**
   * reset message de erreur pour code
   */
  resetErrorMessagesEventCode() {
    this.codeExiste = undefined;
  }

  /**
   * modifier formation
   * @param: typeFormation
   */
  public updateFormation(typeFormation) {
    this.setTypeFormationAfterUpdate(typeFormation);
  }

  /**
   * modifier  typeFormation dans la list de formation
   *
   * @param: IdSemaineRepos
   */
  public setTypeFormationAfterUpdate(typeFormation: FormationModel) {
    this.showAddUpdateTypeFormationPopup = false;
    this.listFormation.forEach((formation, index) => {
      if (formation.idFormation === typeFormation.idFormation) {
        this.listFormation[index] = typeFormation;
      }
    });
    this.setListTypeFormationActifAndIncatif();
    this.sortFormations();

  }

  /**
   * ajouter formation et modifier priorite de list formations inactif
   * @param : typeFormation
   */
  public saveTypeFormation(typeFormation) {
    typeFormation.idFormation = this.makeString();
    this.listFormation.forEach(formation => {
      if (formation.idFormation === typeFormation.idGroupeTravail) {
        this.saveTypeFormation(typeFormation);
      }
    });
    this.setTypeFormationAfterSave(typeFormation);
  }

  /**
   * Ajouter  type formation dans la list de formation
   * @param: typeFormation
   * @param: data
   */
  public setTypeFormationAfterSave(typeFormation: FormationModel) {
    this.showAddUpdateTypeFormationPopup = false;
    this.listFormation.push(typeFormation);
    this.setListTypeFormationActifAndIncatif();
    this.sortFormations();
  }

  /**
   * recupere  le type de formation selectionné
   * @param: typeFormation
   */
  public showFormation(typeFormation) {
    if (typeFormation.statut && this.domControlService.updateListControl(this.ecran)) {
      this.codeExiste = null;
      this.libelleExiste = null;
      this.showAddOrUpdateTypeFormationButtons = this.rhisTranslateService.translate('FORMATION.UPDATE_BUTTONS');
      this.showAddUpdateTypeFormationPopupTitle = this.rhisTranslateService.translate('FORMATION.UPDATE_TYPE_FORMATION');
      this.selectedTypeFormation = JSON.parse(JSON.stringify(typeFormation));
      this.showAddUpdateTypeFormationPopup = true;
    } else {
      this.showAddUpdateTypeFormationPopup = false;
    }
  }

  /**
   * activer type Formation
   * modifier le priorite
   * @param :typeFormation
   * @param :event
   */
  public activateFormationAndUpdatePriorite(typeFormation: FormationModel, event) {
    this.showAddUpdateTypeFormationPopup = false;
    event.stopPropagation();
    this.updatePrioriteBeforeActif(typeFormation);
    this.listFormationService.activateTypeFormationAndUpdateNiveau(this.listFormationInactif).subscribe(
      (data: any) => {
        this.sortFormations();
        this.cloneAndResetDefaultListeFormation();
        this.setListTypeFormationActifAndIncatif();
        this.notificationService.showMessageWithoutTranslateService('success',
          typeFormation.libelle + ' ' + this.rhisTranslateService.translate('FORMATION.ACTIVER_FORMATION'));
      },
      (err: any) => {
      }
    );
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :typeFormation
   * @param :event
   */
  public showConfirmDeleteFormation(typeFormation: FormationModel, event) {
    this.showAddUpdateTypeFormationPopup = false;
    event.stopPropagation();
    this.idTypeFormation = typeFormation.idFormation;
    this.uuidTypeFormation = typeFormation.uuid;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteTypeFormation();
      },
      reject: () => {
      }
    });
  }

  /**
   * suppression de groupe de travail
   */
  public onConfirmDeleteTypeFormation() {
    if (isNaN(Number(this.idTypeFormation))) {
      this.listFormation.forEach(formation => {
        if (formation.idFormation === this.idTypeFormation) {
          this.deleteFormationFromListFormation();
        }
      });
    } else {
      if (!this.compareList()) {
        this.listFormation = this.defaultListFormation;
        this.setListTypeFormationActifAndIncatif();
      }
      this.listFormationService.deleteFormation(this.uuidTypeFormation).subscribe((data: FormationModel) => {
        if (data) {
          this.notificationService.showMessageWithoutTranslateService('success',
            data.libelle + ' ' + this.rhisTranslateService.translate('FORMATION.DISACTIVER'));
          this.disactiverListFormationAfterDelete(data);
        } else {
          const index = this.listFormation.findIndex(item => item.idFormation === this.idTypeFormation);
          this.notificationService.showMessageWithoutTranslateService('success',
            this.listFormation[index].libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DELETE_SUCESS'));
          this.updateListFormationAfterDelete();
        }
      }, err => {
      });
    }
  }

  /**
   * insérer des types formations dans deux list selon le statut
   */
  private setListTypeFormationActifAndIncatif() {
    this.listFormationActif = [];
    this.listFormationInactif = [];
    this.listFormation.forEach(formation => {
      if (formation.statut) {
        this.listFormationActif.push(formation);
      } else {
        this.listFormationInactif.push(formation);
      }
    });
  }

  /**
   * modifier la priorite lors d'activation d'un type de Formation
   * @param :typeFormation
   */
  private updatePrioriteBeforeActif(typeFormation: FormationModel) {
    if (!this.compareList()) {
      this.listFormation = this.defaultListFormation;
      this.setListTypeFormationActifAndIncatif();
    }
    if (this.listFormationInactif.length > 0) {
      this.listFormationInactif.forEach((formation, index) => {
        if (formation.idFormation !== typeFormation.idFormation && index !== this.listFormationInactif.length - 1
          && this.listFormationInactif[0].idFormation !== typeFormation.idFormation && formation.priorite < typeFormation.priorite) {
          formation.priorite++;
        }
      });
      this.listFormationInactif.forEach((formation) => {
        if (formation.idFormation === typeFormation.idFormation) {
          formation.statut = true;
          if (this.listFormationActif.length >= 1) {
            formation.priorite = this.listFormationActif[this.listFormationActif.length - 1].priorite + 1;
          } else {
            formation.priorite = 1;
          }
        }
      });
    }
  }

  /**
   * ajouter de varibale à la type formation avant d'enregistrer dans la bd
   * @param: typeFormation
   */
  private setTypeForamtionBeforeSave(typeFormation: FormationModel) {
    this.incremmentPrioriteOfTypeFormation();
    typeFormation.priorite = this.prioriteCurrent;
    typeFormation.statut = true;
  }

  /**
   * en cas d'erruer lors d'enregistrement le list des formations inactif revient par default
   */
  private traitementErrorAfterSaveTypeFormation() {
    if (this.listFormationInactif.length > 1) {
      this.listFormationInactif.forEach(formation => {
        formation.priorite--;
      });
    }
  }

  /**
   * ajouter de varibale à la type formation avant de modifier  dans la bd
   * @param: typeFormation
   */
  private setTypeForamtionBeforeUpdate(typeFormation: FormationModel) {
    typeFormation.priorite = this.selectedTypeFormation.priorite;
    typeFormation.idFormation = this.selectedTypeFormation.idFormation;
    if (this.selectedTypeFormation.uuid) {
      typeFormation.uuid = this.selectedTypeFormation.uuid;
    }
    typeFormation.statut = this.selectedTypeFormation.statut;
  }

  /**
   * suppression type formation de la liste formations
   */
  private updateListFormationAfterDelete() {
    this.deleteFormationFromListFormation();
    this.sortFormations();
    this.cloneAndResetDefaultListeFormation();
    this.setListTypeFormationActifAndIncatif();
  }

  /**
   * suppression type formation de la liste formations
   * ajouter type formation avec le statut false  a la list
   */
  private disactiverListFormationAfterDelete(typeformation) {
    this.deleteFormationFromListFormation();
    this.listFormation.push(typeformation);
    this.sortFormations();
    this.cloneAndResetDefaultListeFormation();
    this.setListTypeFormationActifAndIncatif();
  }

  /**
   * suppression type formation de la list formation
   */
  private deleteFormationFromListFormation() {
    const indexOfTypeFormation = this.listFormation.findIndex(formation => formation.idFormation === this.idTypeFormation);
    this.listFormation.forEach(formation => {
      if (formation.idFormation !== this.idTypeFormation && formation.priorite > this.listFormation[indexOfTypeFormation].priorite) {
        formation.priorite--;
      }
    });
    this.listFormation.splice(indexOfTypeFormation, 1);
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    return this.compareList();
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateFormationsPrioriteByRestaurant();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);

      }
    });
    return this.navigateAway;
  }

  /**
   * set value to id formation
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }
}
