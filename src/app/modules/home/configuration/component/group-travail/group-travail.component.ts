import {Component, OnInit} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {GroupeTravailModel} from '../../../../../shared/model/groupeTravail.model';
import {GroupeTravailService} from '../../service/groupe-travail.service';
import {Observable, Subject} from 'rxjs';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-group-travail',
  templateUrl: './group-travail.component.html',
  styleUrls: ['./group-travail.component.scss']
})
export class GroupTravailComponent implements OnInit {

  public listGroupTravail: GroupeTravailModel[] = [];
  public selectedGroupTravail: GroupeTravailModel;
  public defaultListGroupeTravail: GroupeTravailModel[] = [];
  public showAddUpdateGroupTravailPopup = false;
  public showAddUpdateGroupTravailPopupTitle: string;
  public niveauGroupTravailCurrent: number;
  public libelleExiste: string;
  public codeExiste: string;
  public listGrouppTravailActif: GroupeTravailModel[] = [];
  public listGroupTravailInactif: GroupeTravailModel[] = [];
  public idGroupeTravail: number;
  public uuidGroupeTravail: string;
  public disabledCheckBoxDirecteur = false;
  public showAddOrUpdateGroupeTravailButtons: string;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public header = ['LIBELLE', 'DIRECTEUR', 'POINTEUSE', 'CODE_EMPLOI', 'TAUX_HORAIRE', 'MAIN_OEUVRE', 'CODE_GDH', 'PLGEQUIP', 'PLGEMGR', 'PLGELEADER', 'PLGEFIXE', 'PERIODE_ESSAI', 'STATUT'];
  private ecran = 'EGT';
  public heightInterface: any;
  public numberOfModification = 0;
  public libeleGroupeTravail: String;
  // Paramètres du popup
  public popUpStyle = {width: 650};

  constructor(private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private groupeTravailService: GroupeTravailService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.getAllGroupTravailByRestaurant();
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Cette methode permet de recuperer la liste des groupe de trvail par restaurant
   */
  public getAllGroupTravailByRestaurant() {
    this.groupeTravailService.getAllGroupTravailByRestaurant().subscribe(
      (data: GroupeTravailModel[]) => {
        this.listGroupTravail = data;
        this.setListGroupTravailActifAndIncatif();

        this.cloneAndResetDefaultListeGroupeTravail();
      }, (err: any) => {

      }
    );
  }

  /**
   * modifier les niveua de list de groupes de trvail
   */
  public updateGroupeTravailNiveauByRestaurant() {
    if (!this.compareList()) {

      this.listGroupTravail.forEach(group => {
        if (isNaN(Number(group.idGroupeTravail))) {
          group.idGroupeTravail = 0;
        }
      });

      this.groupeTravailService.updateGroupeTravailNiveauByRestaurant(this.listGroupTravail).subscribe((data: GroupeTravailModel[]) => {
          if (this.numberOfModification > 1) {
            this.notificationService.showSuccessMessage('GROUPE_TRAVAIL.LIST_UPDATED_SUCCESS');
          } else {
            this.notificationService.showMessageWithoutTranslateService('success',
              this.libeleGroupeTravail + ' ' + this.rhisTranslateService.translate('GROUPE_TRAVAIL.SAVE_SUCESS'));
          }
          this.listGroupTravail = data;
          this.cloneAndResetDefaultListeGroupeTravail();
          this.setListGroupTravailActifAndIncatif();
          this.ordonneListGroupTravailByJour();
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
  addNewGroupTravail() {
    this.codeExiste = undefined;
    this.libelleExiste = undefined;
    this.selectedGroupTravail = undefined;
    this.showAddUpdateGroupTravailPopup = true;
    this.showAddOrUpdateGroupeTravailButtons = this.rhisTranslateService.translate('GROUPE_TRAVAIL.BUTTON_SAVE');
    this.showAddUpdateGroupTravailPopupTitle = this.rhisTranslateService.translate('GROUPE_TRAVAIL.ADD_NEW_POPUP');
  }

  /**
   * fermer le pupup
   */
  closePopup() {
    this.showAddUpdateGroupTravailPopup = false;
  }

  /**
   * niveau de groupe de travail par defualt auto increment
   */
  public incremmentNiveauOfGroupTravail() {
    const length = this.listGrouppTravailActif.length;
    // vérifier si la liste est rempli si non niveau prend la valeur du constructeur : 1
    if (length > 0 && this.listGrouppTravailActif[length - 1].niveau !== undefined) {
      this.niveauGroupTravailCurrent = this.listGrouppTravailActif[length - 1].niveau + 1;
    } else {
      this.niveauGroupTravailCurrent = 1;
    }
    if (this.listGroupTravailInactif.length > 0) {
      this.listGroupTravailInactif.forEach(groupe => {
        groupe.niveau++;
      });
    }
  }

  /**
   * Add / Update Group Travail
   * @param :groupeTravail
   */
  public addOrUpdateGroupTravail(groupeTravail: GroupeTravailModel) {
    groupeTravail.plgFixe = groupeTravail.plgEquip;
    if (this.selectedGroupTravail) {
      this.setGroupeTravailBeforeUpdate(groupeTravail);

    } else {
      this.setGroupeTravailBeforeSave(groupeTravail);

    }
    if (!this.uniciteChamps(groupeTravail)) {

      if (groupeTravail.idGroupeTravail) {
        this.updateGroupeTravail(groupeTravail);
      } else {
        this.saveGroupeTravail(groupeTravail);
      }
    }
  }

  /**
   * modifier groupe de travail
   * @param: groupeTravail
   */
  public updateGroupeTravail(groupeTravail) {
    this.setGroupeTravailAfterUpdate(groupeTravail);

  }

  /**
   * modifier  semaine repos dans la list de groupe de travail
   *
   * @param :IdSemaineRepos
   */
  public setGroupeTravailAfterUpdate(groupeTravail: GroupeTravailModel) {
    this.showAddUpdateGroupTravailPopup = false;
    this.listGroupTravail.forEach((groupe, index) => {
      if (groupe.idGroupeTravail === groupeTravail.idGroupeTravail) {
        this.listGroupTravail[index] = groupeTravail;
      }
    });
    this.setListGroupTravailActifAndIncatif();
  }

  /**
   * ajouter groupe de travail
   * @param: groupeTravail
   */
  public saveGroupeTravail(groupeTravail) {
    groupeTravail.idGroupeTravail = this.makeString();
    this.listGroupTravail.forEach(groupe => {
      if (groupe.idGroupeTravail === groupeTravail.idGroupeTravail) {
        this.saveGroupeTravail(groupeTravail);
      }
    });
    this.setGroupeTravailAfterSave(groupeTravail);
  }

  /**
   * ajouter  semaine repos dans la list de groupe de travail
   *@param: data
   * @param :groupeTravail
   */
  public setGroupeTravailAfterSave(groupeTravail: GroupeTravailModel) {
    this.showAddUpdateGroupTravailPopup = false;
    this.listGroupTravail.push(groupeTravail);
    this.setListGroupTravailActifAndIncatif();
    this.ordonneListGroupTravailByJour();
  }

  /**
   * traitement d'unicité de groupe de travail libelle ,code emploi,niveau
   * @param: groupTravail
   */
  public uniciteChamps(groupTravail) {
    let existe = false;
    for (const itemGroupTravail of this.listGroupTravail) {
      if (itemGroupTravail.idGroupeTravail !== groupTravail.idGroupeTravail) {
        this.uniciteLibelle(itemGroupTravail, groupTravail);
        this.uniciteCodeEmploi(itemGroupTravail, groupTravail);
      }
      if (this.codeExiste || this.libelleExiste) {
        existe = true;
      }
    }
    return existe;
  }

  /**
   * traitement l'unicité de libelle
   * @param : itemGroupTravail
   * @param: groupTravail
   */
  public uniciteLibelle(itemGroupTravail, groupTravail) {
    if (itemGroupTravail.libelle.toUpperCase() === groupTravail.libelle.toUpperCase()) {
      this.libelleExiste = this.rhisTranslateService.translate('GROUPE_TRAVAIL.LIBELLE_EXISTE');
    }
  }

  /**
   * traitement l'unicité de code d'emploi
   * @param : itemGroupTravail
   * @param: groupTravail
   */
  public uniciteCodeEmploi(itemGroupTravail, groupTravail) {
    if (itemGroupTravail.codeEmploi.toUpperCase() === groupTravail.codeEmploi.toUpperCase()) {
      this.codeExiste = this.rhisTranslateService.translate('GROUPE_TRAVAIL.CODE_EMPLOI_EXISTE');
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
   * ordonner  list de groupe de travail par niveau
   */
  ordonneListGroupTravailByJour(defaultListGroupeTravail?: GroupeTravailModel[]) {
    if (defaultListGroupeTravail) {
      this.listGroupTravail.sort((a, b) => a.niveau - b.niveau);
      this.defaultListGroupeTravail.sort((a, b) => a.niveau - b.niveau);
    } else {
      this.listGroupTravail.sort((a, b) =>
        a.niveau - b.niveau
      );
    }
  }

  /**
   * recupere  le groupe de travail selectionné
   * @param: groupeTravail
   */
  public showGroupeTravail(groupeTravail: GroupeTravailModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      if (groupeTravail.statut) {
        this.codeExiste = undefined;
        this.libelleExiste = undefined;
        this.showAddUpdateGroupTravailPopupTitle = this.rhisTranslateService.translate('GROUPE_TRAVAIL.UPDATE_GROUPE');
        this.showAddOrUpdateGroupeTravailButtons = this.rhisTranslateService.translate('GROUPE_TRAVAIL.UPDATE_SAVE');
        this.selectedGroupTravail = JSON.parse(JSON.stringify(groupeTravail));
        this.showAddUpdateGroupTravailPopup = true;
      } else {
        this.showAddUpdateGroupTravailPopup = false;
      }
    }
  }

  /**
   * permet de mettre a jour tous les contrats avec le bon taux horaire.
   * Les contrats concernés sont ceux actifs ou qui vont l’être.
   * @param :groupTravail
   */
  public modifierTauxHoraire(groupeTravail, event) {
    event.stopPropagation();
    if (!isNaN(Number(groupeTravail.idGroupeTravail))) {
      this.groupeTravailService.updateContratByTauxHoraireOfGroupTravail(groupeTravail).subscribe(
        (data: any) => {
          this.notificationService.showSuccessMessage('GROUPE_TRAVAIL.UPDATE_TAUX_HORAIRE', '');
        },
        (err: any) => {
        }
      );
    } else {
      this.notificationService.showSuccessMessage('GROUPE_TRAVAIL.MISE_JOUR', '');
    }
  }

  /**
   * activer groupe de travail
   * modifier le niveau
   * @param: groupTravail
   * @param:filter
   */
  public activateGroupeTravailAndUpdateNiveau(groupTravail: GroupeTravailModel, event) {
    event.stopPropagation();
    this.updateNiveauBeforeActif(groupTravail);
    this.groupeTravailService.activateGroupeTravailAndUpdateNiveau(this.listGroupTravailInactif).subscribe(
      (data: any) => {
        this.cloneAndResetDefaultListeGroupeTravail();
        this.setListGroupTravailActifAndIncatif();
        this.ordonneListGroupTravailByJour();
        this.notificationService.showMessageWithoutTranslateService('success', groupTravail.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));
      },
      (err: any) => {
      }
    );
  }

  /**
   * inserer de groupoe de travail dans deux list selon le statut
   */
  public setListGroupTravailActifAndIncatif() {
    this.disabledCheckBoxDirecteur = false;
    this.listGroupTravailInactif = [];
    this.listGrouppTravailActif = [];
    this.listGroupTravail.forEach(group => {
      if (group.directeur) {
        this.disabledCheckBoxDirecteur = true;
      }
      if (group.statut) {
        this.listGrouppTravailActif.push(group);
      } else {
        this.listGroupTravailInactif.push(group);
      }
    });
  }

  /**
   * modifier le niveau lors d'activer un groupe de travail
   * @param :groupTravail
   */
  private updateNiveauBeforeActif(groupTravail: GroupeTravailModel) {
    if (!this.compareList()) {
      this.listGroupTravail = this.defaultListGroupeTravail;
      this.setListGroupTravailActifAndIncatif();
    }
    if (this.listGroupTravailInactif.length > 0) {
      this.listGroupTravailInactif.forEach((groupe, index) => {
        if (groupe.idGroupeTravail !== groupTravail.idGroupeTravail && index !== this.listGroupTravailInactif.length - 1
          && this.listGroupTravailInactif[0].idGroupeTravail !== groupTravail.idGroupeTravail && groupe.niveau < groupTravail.niveau) {
          groupe.niveau++;
        }
      });
      this.listGroupTravailInactif.forEach((groupe) => {
        if (groupe.idGroupeTravail === groupTravail.idGroupeTravail) {
          groupe.statut = true;
          if (this.listGrouppTravailActif.length >= 1) {
            groupe.niveau = this.listGrouppTravailActif[this.listGrouppTravailActif.length - 1].niveau + 1;
          } else {
            groupe.niveau = 1;
          }
        }
      });
    }
  }

  /**
   * affichage de message de confirmation de la suppression
   * @param :groupTravail
   * @param :filter
   */
  showConfirmDeleteGroupTravail(groupTravail: GroupeTravailModel, event) {
    this.showAddUpdateGroupTravailPopup = false;
    event.stopPropagation();
    this.idGroupeTravail = groupTravail.idGroupeTravail;
    this.uuidGroupeTravail = groupTravail.uuid;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteGroupeTravail();
      },
      reject: () => {
      }
    });
  }

  /**
   * suppression de groupe de travail
   */
  onConfirmDeleteGroupeTravail() {

    if (isNaN(Number(this.idGroupeTravail))) {
      this.listGroupTravail.forEach((group, index) => {
        if (group.idGroupeTravail === this.idGroupeTravail) {
          this.deleteGroupeFromListGroupTravail();
        }
      });
    } else {
      if (!this.compareList()) {
        this.listGroupTravail = this.defaultListGroupeTravail;
        this.setListGroupTravailActifAndIncatif();
      }
      this.groupeTravailService.deleteGroupTravail(this.uuidGroupeTravail).subscribe((data: GroupeTravailModel) => {
        if (data) {
          data.directeur = false;
          this.disactiverListGroupeTravailAfterDelete(data);
        } else {
          this.updateListGroupeTravailAfterDelete();
        }
      }, err => {
        let messageShow = '';
        if (err.error === 'RHIS_GROUP_TRAVAIL_MAIN_OEUVRE_EXIST') {
          messageShow = 'GROUPE_TRAVAIL.MAIN_OEUVRE_EXIST';
          this.showConfirmdeleteGroupeTravailAfter(messageShow);
        }
        if (err.error === 'RHIS_GROUP_TRAVAIL_PLG_EQUIPIER_EXIST') {
          messageShow = 'GROUPE_TRAVAIL.PLG_EQUIPIER_EXIST';
          this.showConfirmdeleteGroupeTravailAfter(messageShow);
        }
      });
    }
  }

  /**
   * suppression groupe travail de la liste groupe de travail
   * ajouter groupe trvail avec le statut false  a la list
   */
  private disactiverListGroupeTravailAfterDelete(groupeTravail) {
    this.deleteGroupeFromListGroupTravail();
    this.listGroupTravail.push(groupeTravail);
    this.cloneAndResetDefaultListeGroupeTravail();
    this.setListGroupTravailActifAndIncatif();
    this.ordonneListGroupTravailByJour();
    this.notificationService.showMessageWithoutTranslateService('success',
      groupeTravail.libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));
  }

  /**
   * suppression groupe de travail de la list
   */
  private deleteGroupeFromListGroupTravail() {
    const index = this.listGroupTravail.findIndex(groupe => groupe.idGroupeTravail === this.idGroupeTravail);
    this.listGroupTravail.forEach(groupe => {
      if (groupe.idGroupeTravail !== this.idGroupeTravail && groupe.niveau > this.listGroupTravail[index].niveau) {
        groupe.niveau--;
      }
    });
    this.listGroupTravail.splice(index, 1);
  }

  /**
   *  delete group de travail qui n'y a plus de type d'emploi en main d'œuvre ou
   *  il n'y a plus de type d'emploi paramétré avec le planning Equipier
   */
  deleteGroupTravailMoOrPlgEquipier() {
    this.groupeTravailService.deleteGroupTravailMoOrPlgEquipier(this.uuidGroupeTravail).subscribe((data: any) => {
        this.updateListGroupeTravailAfterDelete();
      }, err => {
        console.log(err);

      }
    );
  }

  /**
   * pour con,firmer la suppression de groupe de trvail ou non
   * @param :messageShow
   */
  public showConfirmdeleteGroupeTravailAfter(messageShow) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate(messageShow),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteGroupTravailMoOrPlgEquipier();
      },
      reject: () => {
      }
    });
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
        this.updateGroupeTravailNiveauByRestaurant();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);

      }
    });
    return this.navigateAway;
  }

  /**
   * suppression groupe de tvail de la liste group d travail
   */
  public updateListGroupeTravailAfterDelete() {
    this.deleteGroupeFromListGroupTravail();
    this.cloneAndResetDefaultListeGroupeTravail();
    this.setListGroupTravailActifAndIncatif();
    this.ordonneListGroupTravailByJour();
    this.notificationService.showSuccessMessage('GROUPE_TRAVAIL.SUPP_SUCESS', 'FORMATION.SUPP');
  }


  /**
   * Cette methode permet d'augmenter le niveau de l'element selectionne
   */
  public augmenterNiveau(groupTravail: GroupeTravailModel) {
    this.showAddUpdateGroupTravailPopup = false;
    const selectedIndex = this.getIndexOfSelectedformation(groupTravail);
    if (!(selectedIndex === 0)) {
      groupTravail.niveau--;
      this.listGroupTravail[selectedIndex - 1].niveau++;
      this.ordonneListGroupTravailByJour();
    }
  }

  /**
   * Cette methode permet de diminuer le niveau de l'element selectionne
   */
  public diminuerNiveau(groupTravail: GroupeTravailModel) {
    this.showAddUpdateGroupTravailPopup = false;
    const selectedIndex = this.getIndexOfSelectedformation(groupTravail);
    if (!(selectedIndex === this.listGroupTravail.length - 1)) {
      groupTravail.niveau++;
      this.listGroupTravail[selectedIndex + 1].niveau--;
      this.ordonneListGroupTravailByJour();
    }
  }

  /**
   * Cette methode permet de recuperer l'index de l'element selectionne
   */
  private getIndexOfSelectedformation(groupTravail: GroupeTravailModel): number {
    return this.listGroupTravail.indexOf(groupTravail);
  }

  /**
   *Cette methode permet de cloner la liste des groupes de travail en une autre liste afin des le comparer
   * utilise pour savoir s'il y a eu un changement dans la liste des groupes de travail
   */
  private cloneAndResetDefaultListeGroupeTravail() {
    this.defaultListGroupeTravail = [];
    this.listGroupTravail.forEach(item => {
      this.defaultListGroupeTravail.push(JSON.parse(JSON.stringify(item)));
    });
    this.ordonneListGroupTravailByJour(this.defaultListGroupeTravail);
  }

  private setGroupeTravailBeforeUpdate(groupeTravail: GroupeTravailModel) {
    groupeTravail.idGroupeTravail = this.selectedGroupTravail.idGroupeTravail;
    groupeTravail.statut = this.selectedGroupTravail.statut;
    groupeTravail.niveau = this.selectedGroupTravail.niveau;

  }

  private setGroupeTravailBeforeSave(groupeTravail: GroupeTravailModel) {
    this.incremmentNiveauOfGroupTravail();
    groupeTravail.niveau = this.niveauGroupTravailCurrent;
    groupeTravail.statut = true;
  }

  /**
   * Cette methode permet de detecter s'il y a un changement au niveau de la liste des groupes de travail
   */
  public compareList(): boolean {
    let same = true;
    this.numberOfModification = 0;
    this.listGroupTravail.forEach((item: GroupeTravailModel, index: number) => {
      if (JSON.stringify(this.defaultListGroupeTravail[index]) !== JSON.stringify(this.listGroupTravail[index])) {
        same = false;
        this.numberOfModification++;
        this.libeleGroupeTravail = this.listGroupTravail[index].libelle;
      }
    });
    return same;
  }

  /**
   * en cas d'erruer lors d'enrgistrement le list des groupe de travail inactif revient par default
   */
  private traitementErrorAfterSaveGroupeTravail() {
    if (this.listGroupTravailInactif.length > 1) {
      this.listGroupTravailInactif.forEach(groupeTravail => {
        groupeTravail.niveau--;
      });
    }
  }

  /**
   * set value to id groupe de travail
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
