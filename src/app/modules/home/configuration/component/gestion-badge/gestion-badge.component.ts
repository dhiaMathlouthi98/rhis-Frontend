import {Component, OnInit} from '@angular/core';
import {BadgeService} from '../../../employes/service/badge.service';
import {BadgeModel} from '../../../../../shared/model/badge.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {StatutBadgeModel} from '../../../../../shared/enumeration/statutBadge.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {PaginationArgs} from '../../../../../shared/model/pagination.args';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-gestion-badge',
  templateUrl: './gestion-badge.component.html',
  styleUrls: ['./gestion-badge.component.scss']
})
export class GestionBadgeComponent implements OnInit {

  public statusAreShown = false;
  public first = 0;
  public row = 10;
  public listBadge: BadgeModel[] = [];
  public listBadgesToUpdate: BadgeModel[] = [];
  public selectedBadge: BadgeModel = {} as BadgeModel;
  public calendarMinDate = new Date();
  public displayDialogUpdateBadge = false;
  private ecran = 'EGB';
  public badgeStatusItem = [{
    label: this.translator.translate('ALL'),
    value: null
  }, {
    label: this.translator.translate('GESTION_BADGE.BADGE_DISPO'),
    value: 'DISPONIBLE'
  }, {
    label: this.translator.translate('GESTION_BADGE.BADGE_INDISPO'),
    value: 'INDISPONIBLE'
  }, {
    label: this.translator.translate('GESTION_BADGE.BADGE_ASSIGNED'),
    value: 'ASSIGNE'
  }];
  public choosenBadgeStatus = '';

  public tmpStatutDisponible = StatutBadgeModel.Disponible;
  public tmpStatutIndisponible = StatutBadgeModel.Indisponible;
  public tmpStatutAssigne = StatutBadgeModel.Assigne;

  public tmpChoosenStatus: StatutBadgeModel;
  public selectedBadgeStatus: StatutBadgeModel = this.selectedBadge.statut;

  public dialogUpdateBadgeTitle = '';

  public totalRecords: number;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];

  public heightInterface: any;

  constructor(private badgeService: BadgeService,
              private translator: RhisTranslateService,
              private notification: NotificationService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService
  ) {
  }

  ngOnInit() {

    this.getAllBadgeByRestaurant();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * pour la pagination
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getAllBadgeByRestaurant();
  }

  /**
   * Cette methode permet de recuperer la liste des badges par restaurant
   */
  public getAllBadgeByRestaurant() {
    this.badgeService.getAllWithPaginationAndFilter(this.paginationArgs, {
      filterStatut: this.choosenBadgeStatus
    }).subscribe(
      (data: any) => {
        this.listBadge = data.content;
        this.listBadge.map(el => {
          if (el.commentaire !== null) {
            el.commentaire = this.editCommentaire(el.commentaire);
          }
        });
        this.totalRecords = data.totalElements;
        this.ordonnerRecuperation();
      }, (err: any) => {
      }
    );
  }

  private editCommentaire(text: string): string {
    return text.replace(/disabled_badge/g, this.translator.translate('GESTION_BADGE.FIN_CONTRAT')).
      replace(/fin_Contrat/g, this.translator.translate('GESTION_BADGE.SUPP_CONTRAT')).
      replace('_le_', this.translator.translate('GESTION_BADGE.LE'));
  }

  /**
   * Cette methode permet de convertir la valeur du date de string vers un objet date
   * @param: item
   */
  private setCorrectDateFormat(item: BadgeModel) {
    if (item.dateDisponible) {
      item.dateDisponible = new Date(item.dateDisponible);
      item.dateDisponible.setHours(0);
      item.dateDisponible.setMinutes(0);
      item.dateDisponible.setSeconds(0);
    }
  }

  /**
   * Cette methode permet d'ordonner la liste des badges de façon ascendante selon le code
   */
  private ordonnerRecuperation() {
    this.listBadge.sort((a, b) => +a.code - (+b.code));
  }

  /**
   * Cette methode permet d'ouvrir la popup d'ajout d'un badge dans la liste des badges à afficher
   */
  public openAddBadgePopup() {
    this.selectedBadge = {} as BadgeModel;
    this.displayDialogUpdateBadge = true;
    this.dialogUpdateBadgeTitle = this.translator.translate('GESTION_BADGE.ADD_BADGE_BUTTON');
    this.selectedBadge.statut = this.tmpStatutDisponible;
  }

  /**
   * Cette methode permet d'ouvrir la modal du badge
   * @param: badge
   */
  public openModal(badge: BadgeModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.selectedBadge = JSON.parse(JSON.stringify(badge));
      if (badge.dateDisponible) {
        this.selectedBadge.dateDisponible = new Date(badge.dateDisponible);
      }
      this.displayDialogUpdateBadge = true;
      this.dialogUpdateBadgeTitle = this.translator.translate('GESTION_BADGE.UPDATE_BADGE_BUTTON');
      this.selectedBadgeStatus = this.selectedBadge.statut;
      this.tmpChoosenStatus = this.selectedBadge.statut;
    }

  }

  /**
   * Cette methode permet de mettre à jour la liste des badges
   * @param: event
   */
  public createOrUpdateBadge(event: BadgeModel) {
    // on recupere le badge depuis la popup
    this.selectedBadge = event;
    // on ferme la popup
    this.displayDialogUpdateBadge = false;
    if (this.dialogUpdateBadgeTitle === this.translator.translate('GESTION_BADGE.ADD_BADGE_BUTTON')) {
      // la creation d'un nouveau badge
      this.createNewBadge();
    } else {
      // update le badge selectionne
      this.updateBadge();
    }
  }

  /**
   * Cette methode permet d'afficher un message de confirmation de suppression de badge selectionne
   */
  public deleteBadge(badge: BadgeModel) {
    if (badge.statut === this.tmpStatutDisponible) {
      this.confirmationService.confirm({
        message: this.translator.translate('POPUPS.DELETE_MESSAGE'),
        header: this.translator.translate('POPUPS.DELETE_HEADER'),
        acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.onConfirmDeleteDeleteBadge(badge);
        },
        reject: () => {
        }
      });
    } else {
      // ECHEC_DELETE
      this.notification.showErrorMessage('GESTION_BADGE.COULD_NOT_DELETE_BADGE');
    }
  }

  /**
   * Cette methode permet de supprimer le badge selectionne
   */
  private onConfirmDeleteDeleteBadge(badge: BadgeModel) {
    this.listBadge.forEach((item, index) => {
      if (item.code === badge.code) {
        this.listBadge.splice(index, 1);
      }
    });
    if (badge.idBadge) {
      this.callDeleteBadgeWebService(badge);
    } else {
      this.notification.showInfoMessage('GESTION_BADGE.BADGE_DELETE_SUCCESS', 'GESTION_BADGE.DELETE_MESSAGE_HEADER');
    }
  }

  /**
   * Cette methode permet de faire appel a la metohde du web service qui permet la suppression d'un badge
   */
  private callDeleteBadgeWebService(badge: BadgeModel) {
    this.badgeService.deleteBadge(badge.uuid).subscribe(
      () => {
        this.notification.showSuccessMessage('GESTION_BADGE.BADGE_DELETE_SUCCESS', 'GESTION_BADGE.DELETE_MESSAGE_HEADER');
      }, () => {
      });
  }

  /**
   * Cette methode permet de faire appel a la metohde du web service qui permet la mdofication d'un badge
   */
  private callUpdateBadgeWebService() {
    this.badgeService.updateBadge(this.selectedBadge).subscribe(
      () => {
        this.notification.showSuccessMessage('GESTION_BADGE.BADGE_UPDATE_SUCCESS', 'GESTION_BADGE.UPDATE_MESSAGE_HEADER');
      }, () => {
      });
  }

  /**
   * Cette methode permet de faire appel a la metohde du web service qui permet l'ajout d'un badge
   */
  private callAddBadgeWebService() {
    this.badgeService.addBadge(this.selectedBadge).subscribe(
      (data: BadgeModel) => {
        this.listBadge.push(data);
        this.notification.showSuccessMessage('GESTION_BADGE.BADGE_CREATE_SUCCESS', 'GESTION_BADGE.CREATE_MESSAGE_HEADER');
      }, () => {
      });
  }

  /**
   *  on recupere la list des badges selons le statut selectionne
   */
  public OnChangeBadgeStatus(event) {
    if (event.value.value === this.tmpStatutAssigne) {
      this.choosenBadgeStatus = this.tmpStatutAssigne;
    }
    if (event.value.value === this.tmpStatutDisponible) {
      this.choosenBadgeStatus = this.tmpStatutDisponible;
    }
    if (event.value.value === this.tmpStatutIndisponible) {
      this.choosenBadgeStatus = this.tmpStatutIndisponible;
    }
    if (event.value.value === null) {
      this.choosenBadgeStatus = '';
    }
    this.statusAreShown = !this.statusAreShown;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getAllBadgeByRestaurant();
  }

  /**
   * Cette methode peremt de crrer un nouveau badge
   */
  private createNewBadge() {
    this.callAddBadgeWebService();
  }

  /**
   * Cette methode permet de mettre à jour le badge selectionne
   */
  private updateBadge() {
    this.callUpdateBadgeWebService();
    let found = false;
    this.listBadge.forEach((item, index) => {
      if (this.selectedBadge.code === item.code) {
        this.listBadge[index] = JSON.parse(JSON.stringify(this.selectedBadge));
        if (this.selectedBadge.dateDisponible) {
          this.listBadge[index].dateDisponible = new Date(this.selectedBadge.dateDisponible);
        }
      }
    });
    this.listBadgesToUpdate.forEach((item, index) => {
      if (this.selectedBadge.code === item.code) {
        found = true;
        this.listBadgesToUpdate[index] = JSON.parse(JSON.stringify(this.selectedBadge));
        if (this.selectedBadge.dateDisponible) {
          this.listBadgesToUpdate[index].dateDisponible = new Date(this.selectedBadge.dateDisponible);
        }
      }
    });
    if (!found) {
      this.listBadgesToUpdate.push(JSON.parse(JSON.stringify(this.selectedBadge)));
      if (this.selectedBadge.dateDisponible) {
        this.listBadgesToUpdate[this.listBadgesToUpdate.length - 1].dateDisponible = new Date(this.selectedBadge.dateDisponible);
      }
    }
  }
}
