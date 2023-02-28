import {Component, OnInit} from '@angular/core';
import {PeriodeManagerModel} from '../../../../model/periode.manager.model';
import {PeriodeManagerService} from '../../service/periode.manager.service';
import {DateService} from '../../../../service/date.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {DomControlService} from '../../../../service/dom-control.service';

@Component({
  selector: 'rhis-periode-manager',
  templateUrl: './periode-manager.component.html',
  styleUrls: ['./periode-manager.component.scss']
})
export class PeriodeManagerComponent implements OnInit {

  public listPeriodeManager: PeriodeManagerModel[] = [];

  public selectedPeriodeManager: PeriodeManagerModel;

  public showAddUpdatePeriodeManagerPopup = false;

  public addUpdatePeriodeManagerPopupTitle: string;

  public buttonLabel: string;

  public limiteHeureDebut: Date;
  public limiteHeureFin: Date;

  public isDuplicatedLibelle = false;

  public setNightValue;

  public heightInterface: any;

  private ecran = 'GPM';

  constructor(private periodeManagerService: PeriodeManagerService,
              private dateService: DateService,
              private rhisTranslate: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getAllPeriodeManagerByRestaurantWithHourLimitation();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  private getAllPeriodeManagerByRestaurantWithHourLimitation() {
    this.periodeManagerService.getAllPeriodeManagerByRestaurantWithHourLimitation().subscribe(
      (responseList) => {
        this.listPeriodeManager = responseList[0];
        this.limiteHeureDebut = this.dateService.setTimeFormatHHMM(responseList[1].value);
        if (responseList[1].night) {
          this.limiteHeureDebut.setDate(this.limiteHeureDebut.getDate() + 1);
        }
        this.limiteHeureFin = this.dateService.setTimeFormatHHMM(responseList[2].value);
        if (responseList[2].night) {
          this.limiteHeureFin.setDate(this.limiteHeureFin.getDate() + 1);
        }
        this.listPeriodeManager.forEach(item => {
          item.dateDebut = this.dateService.setTimeFormatHHMM(item.dateDebut);
          item.dateFin = this.dateService.setTimeFormatHHMM(item.dateFin);
        });
        this.listPeriodeManager = this.sortPeriodeManagers(this.listPeriodeManager);
      }, (err: any) => {
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet de fermer la popup
   */
  public closePopup() {
    this.showAddUpdatePeriodeManagerPopup = false;
  }

  /**
   * Cette methode permet d'ouvrir la popup d'ajout/modification d'une periode manager tout en initialisant les titres du popup et du bouton
   * @param: addAction
   */
  public openPopupToAddOrUpdatePeriodeManager(periodeManager?: PeriodeManagerModel) {

    this.isDuplicatedLibelle = false;
    if (!periodeManager) {
      this.selectedPeriodeManager = new PeriodeManagerModel();
      this.buttonLabel = this.rhisTranslate.translate('PERIODE_MANAGER.ADD_NEW_PERIODE_MANAGER_LABEL');
      this.addUpdatePeriodeManagerPopupTitle = this.rhisTranslate.translate('PERIODE_MANAGER.ADD_NEW_PERIODE_MANAGER_LABEL');
      this.showAddUpdatePeriodeManagerPopup = true;
    } else if (periodeManager && this.domControlService.updateListControl(this.ecran)) {
      this.selectedPeriodeManager = JSON.parse(JSON.stringify(periodeManager));
      this.selectedPeriodeManager.dateDebut = this.dateService.setTimeFormatHHMM(this.dateService.setStringFromDate(periodeManager.dateDebut));
      if (this.selectedPeriodeManager.dateDebutIsNight) {
        this.selectedPeriodeManager.dateDebut.setDate(this.selectedPeriodeManager.dateDebut.getDate() + 1);
      }
      this.selectedPeriodeManager.dateFin = this.dateService.setTimeFormatHHMM(this.dateService.setStringFromDate(periodeManager.dateFin));
      if (this.selectedPeriodeManager.dateFinIsNight) {
        this.selectedPeriodeManager.dateFin.setDate(this.selectedPeriodeManager.dateFin.getDate() + 1);
      }
      this.buttonLabel = this.rhisTranslate.translate('PERIODE_MANAGER.UPDATE_PERIODE_MANAGER_LABEL');
      this.addUpdatePeriodeManagerPopupTitle = this.rhisTranslate.translate('PERIODE_MANAGER.UPDATE_PERIODE_MANAGER_LABEL');
      this.showAddUpdatePeriodeManagerPopup = true;
    }

  }


  /**
   * Cette methode permet d'afficher un message de confirmation de suppression de periode manager
   */
  public deletePeriodeManager(periodeManager: PeriodeManagerModel) {
    this.confirmationService.confirm({
      message: this.rhisTranslate.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslate.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslate.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslate.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteDeletePeriodeManager(periodeManager);
      },
      reject: () => {
      }
    });
  }

  /**
   * Cette methode permet de supprimer une periode manager
   * @param:  periodeManager
   */
  public onConfirmDeleteDeletePeriodeManager(periodeManager: PeriodeManagerModel): void {
    const index = this.listPeriodeManager.findIndex(item => item.uuid === periodeManager.uuid);
    if (index !== -1) {
      this.periodeManagerService.remove(periodeManager.uuid, 'delete/').subscribe(
          (value: any) => {
            if (value === 'RHIS_PERIODE_MANAGER_IS_USED') {
              this.desactivatePeriodeManager(index);
            } else {
              this.notificationService.showMessageWithoutTranslateService('success',
                  this.listPeriodeManager[index].libelle + ' ' + this.rhisTranslate.translate('NOTIFICATION_GENERIQUE.DELETE_SUCESS'));
              this.listPeriodeManager.splice(index, 1);
            }
          },
          console.error
      );
    }
  }

  /**
   * Desactivate attatched periodeManager instead of delete
   * @param: id
   */
  private desactivatePeriodeManager(index: number): void {
    if (index !== -1) {
      this.notificationService.showMessageWithoutTranslateService('success',
          this.listPeriodeManager[index].libelle + ' ' + this.rhisTranslate.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));
      this.listPeriodeManager[index]['statut'] = false;
      this.sortPeriodeManagers(this.listPeriodeManager);
    }
  }

  public addOrUpdatePeriodeManager(event: PeriodeManagerModel) {
    this.isDuplicatedLibelle = null;
    const periodeManagerToAddOrUpdate = JSON.parse(JSON.stringify(event));
    periodeManagerToAddOrUpdate.dateDebut = this.dateService.setTimeFormatHHMM(this.dateService.setStringFromDate(event.dateDebut));
    periodeManagerToAddOrUpdate.dateFin = this.dateService.setTimeFormatHHMM(this.dateService.setStringFromDate(event.dateFin));

    // parse date for sauvegarde
    periodeManagerToAddOrUpdate.dateDebut = this.dateService.setCorrectTime(periodeManagerToAddOrUpdate.dateDebut);
    periodeManagerToAddOrUpdate.dateFin = this.dateService.setCorrectTime(periodeManagerToAddOrUpdate.dateFin);
    if (periodeManagerToAddOrUpdate.idPeriodeManager !== 0) {
      this.updatePeriodeManager(periodeManagerToAddOrUpdate, event);
    } else {
      this.addNewPeriodeManager(periodeManagerToAddOrUpdate, event);
    }
  }

  private updatePeriodeManager(periodeManager: PeriodeManagerModel, event: PeriodeManagerModel) {
    this.periodeManagerService.updatePeriodeManage(periodeManager).subscribe(() => {
        periodeManager.dateFin = event.dateFin;
        periodeManager.dateDebut = event.dateDebut;
        this.showAddUpdatePeriodeManagerPopup = false;
      }, (err: any) => {
        // display error message if periode manager name exists
        if (err.error === 'RHIS_PERIODE_MANAGER_NAME_EXISTS') {
          this.isDuplicatedLibelle = true;
        }
      }, () => {
        this.isDuplicatedLibelle = false;
        this.notificationService.showMessageWithoutTranslateService('success',
          periodeManager.libelle + ' ' + this.rhisTranslate.translate('PERIODE_MANAGER.UPDATESUCCESS'));
        const index = this.listPeriodeManager.findIndex(item => item.idPeriodeManager === periodeManager.idPeriodeManager);
        this.listPeriodeManager[index] = periodeManager;
      }
    );
  }

  private addNewPeriodeManager(periodeManager: PeriodeManagerModel, event: PeriodeManagerModel): void {
    periodeManager.statut = true;
    this.periodeManagerService.persist(periodeManager).subscribe(
      (data: PeriodeManagerModel) => {
        periodeManager.idPeriodeManager = data.idPeriodeManager;
        periodeManager.uuid = data.uuid;
        periodeManager.dateFin = event.dateFin;
        periodeManager.dateDebut = event.dateDebut;
        this.showAddUpdatePeriodeManagerPopup = false;
      }, (err: any) => {
        // display error message if periode manager name exists
        if (err.error === 'RHIS_PERIODE_MANAGER_NAME_EXISTS') {
          this.isDuplicatedLibelle = true;
        }
      }, () => {
        this.isDuplicatedLibelle = false;

        this.notificationService.showMessageWithoutTranslateService('success',
          periodeManager.libelle + ' ' + this.rhisTranslate.translate('PERIODE_MANAGER.ADDSUCCESS'));

          this.listPeriodeManager.push(periodeManager);
          this.sortPeriodeManagers(this.listPeriodeManager);
        }
    );
  }

  public checkIfNightValue() {
    this.setNightValue = null;
    this.confirmationService.confirm({
      message: this.rhisTranslate.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.rhisTranslate.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.rhisTranslate.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslate.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.setNightValue = true;
      },
      reject: () => {
        this.setNightValue = false;
      }
    });
  }

  /**
   * Show confirmation Popup for activation
   * @param: periodeManager
   */
  public showConfirmActivation(periodeManager: PeriodeManagerModel): void {
    this.confirmationService.confirm({
      message: this.rhisTranslate.translate('POPUPS.ACTIVATION_MESSAGE'),
      header: this.rhisTranslate.translate('POPUPS.ACTIVATION_HEADER'),
      acceptLabel: this.rhisTranslate.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslate.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.activatePeriodeManager(periodeManager);
      },
      reject: () => {
      }
    });
  }

  /**
   * Activate an inactive PeriodeManagerModel
   * @param: periodeManager
   */
  private activatePeriodeManager(periodeManager: PeriodeManagerModel): void {
    this.periodeManagerService.updateStatus(periodeManager.idPeriodeManager, true).subscribe({
      next: _=> {
        periodeManager.statut = true;
        this.sortPeriodeManagers(this.listPeriodeManager);
      },
      complete: () =>
          this.notificationService.showMessageWithoutTranslateService('success',
              periodeManager.libelle + ' ' + this.rhisTranslate.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'))
    });
  }

  /**
   * Sort Periode Manager with order : active the inactive ones
   * @param: periodeManagers
   */
  private sortPeriodeManagers(periodeManagers: PeriodeManagerModel[]): PeriodeManagerModel[] {
    return periodeManagers.sort((a: any, b: any) => b['statut'] - a['statut']);
  }

}
