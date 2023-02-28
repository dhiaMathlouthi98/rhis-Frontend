import {Component, OnInit} from '@angular/core';
import {ModeVenteService} from '../../service/mode-vente.service';
import {ModeVenteModel} from '../../../../../shared/model/modeVente.model';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {ParametreGlobalService} from '../../service/param.global.service';
import {ParametreModel} from '../../../../../shared/model/parametre.model';
import {SystemCaisseModeVenteEnum} from '../../../../../shared/enumeration/system.caisse.mode.vente.enum';


@Component({
  selector: 'rhis-mode-vente',
  templateUrl: './mode-vente.component.html',
  styleUrls: ['./mode-vente.component.scss'],

})
export class ModeVenteComponent implements OnInit {

  public selectedModeVente;
  public modesVente: ModeVenteModel[] = [];
  public popupModeVente = false;
  public actionTitle: string;
  public libelleExist = false;
  public nomExist = false;

  public heightInterface: any;
  private ecran = 'GPM';
  public hasSystemCaisse = false;
  public hasMaitreDSystemCaisse = false;
  public hasZeltySystemCaisse = false;
  private SYSTEM_CAISSE_CODE_NAME = 'SYSTEMECAISSE';
  private SYSTEM_CAISSE_MAITRED_CODE_NAME = 'MAITRED';
  private SYSTEM_CAISSE_ZELTY_CODE_NAME = 'Zelty';

  constructor(private modeVenteService: ModeVenteService,
              private parametreService: ParametreGlobalService,
              private confirmationService: ConfirmationService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  /**
   * Initialization phase
   */
  async ngOnInit() {
    await this.getRestaurantSystemCaisse();
    this.getAllModeVente();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Fetch all mode vente
   */
  getAllModeVente() {
    this.modeVenteService.getAll().subscribe(
      (modesVente: ModeVenteModel[]) => {
        this.modesVente = modesVente;
        this.sortModesVente(this.modesVente);
      }, err => {

      }
    );
  }

  /**
   * Open pop up ta add 'mode vente'
   */
  public openPoUpToAddModeVente() {
    this.actionTitle = this.rhisTranslateService.translate('MODE_VENTE.ADD_BUTTON');
    this.popupModeVente = true;
  }

  /**
   * Sort Mode vente to active and inactive
   * @param: modesVente
   */
  private sortModesVente(modesVente: ModeVenteModel[]): ModeVenteModel[] {
    return modesVente.sort((a: any, b: any) => b['statut'] - a['statut']);
  }

  /**
   * Delegate the action to add or update a 'mode vente'
   */
  addUpdateModeVente(modeVente: ModeVenteModel) {
    this.removeLastValueIfSemiColon(modeVente);
    if (!this.selectedModeVente) {
      this.saveNewModeVente(modeVente);
    } else {
      modeVente = {
        ...modeVente,
        idModeVente: this.selectedModeVente.idModeVente,
        statut: this.selectedModeVente.statut,
        uuid: this.selectedModeVente.uuid
      };
      this.updateModeVente(modeVente);
    }
  }

  /**
   * Add a new mode  vente
   */
  saveNewModeVente(modeVente: ModeVenteModel) {
    this.modeVenteService.add({...modeVente, statut: true}).subscribe(
      (savedModeVente: ModeVenteModel) => {
        this.modesVente.push(savedModeVente);
        this.sortModesVente(this.modesVente);
        this.notificationService.showMessageWithoutTranslateService('success',
          modeVente.nom + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATE_SUCCESS'));
      }, err => {
        this.setError(err);
      },
      () => this.popupModeVente = false
    );
  }

  /**
   * Show pop up for the edit mode of a 'mode vente'
   * @param: modeVente
   */
  public changeModeVente(modeVente: ModeVenteModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.selectedModeVente = modeVente;
      this.actionTitle = this.rhisTranslateService.translate('MODE_VENTE.EDIT_BUTTON');
      this.popupModeVente = true;
    }
  }

  /**
   * Update mode vente in the displayed list by a new one by id
   * @param: modeVente
   */
  private updateListModeVente(newModeVente: ModeVenteModel) {
    const index = this.modesVente.findIndex((modeVente: ModeVenteModel) => modeVente.idModeVente === newModeVente.idModeVente);
    if (index !== -1) {
      this.modesVente[index] = newModeVente;
    }
  }

  /**
   * Update mode vente
   */
  updateModeVente(modeVente: ModeVenteModel) {
    this.modeVenteService.update(modeVente).subscribe(
      _ => {
        this.updateListModeVente(modeVente);
        this.sortModesVente(this.modesVente);
        this.hide();
        this.notificationService.showMessageWithoutTranslateService('success',
          modeVente.nom + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_HE_SUCCESS'));
      }, err => {
        this.setError(err);
      }
    );
  }

  /**
   * Display error nom || libelle error
   * @param: err
   */
  private setError(err: any) {
    if (err.error.includes('RHIS_MODE_VENTE_LIBELLE_EXISTS')) {
      this.libelleExist = true;
    }
    if (err.error.includes('RHIS_MODE_VENTE_NAME_EXISTS')) {
      this.nomExist = true;
    }
  }

  /**
   * Show confirmation Popup for delete operation
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
   * Remove a mode vente by id from list of displayed ones
   * @param: id
   */
  private removeFromListModeVente(index: number) {
    if (index !== -1) {
      this.modesVente.splice(index, 1);
    }
  }

  /**
   * Deactivate mode vente and sort list
   * @param: index of mode vente to be desactivated
   */
  private deactivateModeVente(index: number): void {
    this.modesVente[index].statut = false;
    this.modesVente = this.sortModesVente(this.modesVente);
  }

  /**
   * Activate a mode vente
   * @param: modeVente
   */
  private activateModeVente(modeVente: ModeVenteModel): void {
    this.modeVenteService.update({...modeVente, statut: true}).subscribe(
      _ => {
        modeVente.statut = true;
        this.modesVente = this.sortModesVente(this.modesVente);
        this.notificationService.showMessageWithoutTranslateService('success',
          modeVente.nom + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));
      });
  }

  /**
   * Delete mode vente by id
   * @param: id
   */
  private delete(uuid: string): void {
    const index = this.modesVente.findIndex((modeVente: ModeVenteModel) => modeVente.uuid === uuid);
    if (index !== -1) {
      this.modeVenteService.remove(uuid).subscribe(
        (resp: string) => {
          if (resp === 'RHIS_MODE_VENTE_IS_USED') {
            this.notificationService.showMessageWithoutTranslateService('success',
              this.modesVente[index].libelle + ' ' + this.rhisTranslateService.translate('MODE_VENTE.DEACTIVATED_SUCCESS'));
            this.deactivateModeVente(index);
          } else {
            this.notificationService.showMessageWithoutTranslateService('success',
              this.modesVente[index].libelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DELETE_SUCESS'));
            this.removeFromListModeVente(index);
          }
        },
        err => console.error(err)
      );
    }
  }

  /**
   * Close pop up
   */
  public hide(): void {
    if (this.popupModeVente) {
      this.popupModeVente = false;
    }
    if (this.selectedModeVente) {
      this.selectedModeVente = null;
    }
    this.libelleExist = this.nomExist = false;
  }

  /**
   * Show confirmation Popup for activation
   * @param: modeVente
   */
  public showConfirmActivation(modeVente: ModeVenteModel): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.ACTIVATION_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.ACTIVATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.activateModeVente(modeVente);
      },
      reject: () => {
      }
    });
  }

  /**
   * Update nomExist || libelleExist value;
   * @param: guard
   */
  public setUniquenessGuard(uniquenessGuard: { name: string, value: boolean }): void {
    this[uniquenessGuard.name] = uniquenessGuard.value;
  }

  private async getRestaurantSystemCaisse(): Promise<void> {
    this.parametreService.getParameterByRestaurantIdAndCodeParameter(this.SYSTEM_CAISSE_CODE_NAME).subscribe((param: ParametreModel) => {
      this.hasSystemCaisse = param.valeur.trim().length && this.acceptedSystemCaisse(param.valeur);
      this.hasMaitreDSystemCaisse = param.valeur.trim() === this.SYSTEM_CAISSE_MAITRED_CODE_NAME;
      this.hasZeltySystemCaisse = param.valeur.trim() === this.SYSTEM_CAISSE_ZELTY_CODE_NAME;
    });
  }

  private acceptedSystemCaisse(systemCaisse: string): boolean {
    return Object.keys(SystemCaisseModeVenteEnum).some(acceptedSystemCaisse => acceptedSystemCaisse.toUpperCase() === systemCaisse.toUpperCase());
  }

  private removeLastValueIfSemiColon(modeVente: ModeVenteModel): void {
    if (modeVente.lignesMontant) {
      while (modeVente.lignesMontant.charAt(modeVente.lignesMontant.length - 1) === ';') {
        modeVente.lignesMontant = modeVente.lignesMontant.slice(0, modeVente.lignesMontant.length - 1);
      }
    }
    if (modeVente.lignesTransaction) {
      while (modeVente.lignesTransaction.charAt(modeVente.lignesTransaction.length - 1) === ';') {
        modeVente.lignesTransaction = modeVente.lignesTransaction.slice(0, modeVente.lignesTransaction.length - 1);
      }
    }
  }
}
