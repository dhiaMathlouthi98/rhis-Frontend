import {Component, OnInit} from '@angular/core';
import {AlerteModel} from '../../../../../model/alerte.model';
import {AlertesService} from '../../../service/alertes.service';
import {NotificationService} from '../../../../../service/notification.service';
import {RhisTranslateService} from '../../../../../service/rhis-translate.service';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {DomControlService} from '../../../../../service/dom-control.service';
import {Router} from '@angular/router';
import {SharedRestaurantListService} from '../../../../../service/shared-restaurant-list.service';

@Component({
  selector: 'rhis-gestion-alerte',
  templateUrl: './gestion-alerte.component.html',
  styleUrls: ['./gestion-alerte.component.scss']
})
export class GestionAlerteComponent implements OnInit {

  public listAlertes: AlerteModel[] = [];
  public selectedAlerte: AlerteModel;
  public displayPopup = false;
  updateAlerteTitle = '';
  public heightInterface: any;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  // Paramètres du popup
  public popUpStyle = {width: 750};
  public displayRestoList: boolean;
  public listRestoSource: any[];
  public restaurantSource: any;
  public showPopup = false;
  public listRestoDestination = [];
  public listRestoIds = [];
  public submitButtonText = this.translateService.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  private defaultListAlertes: AlerteModel[] = [];
  private hasChanged = false;
  private ecran = 'GDA';
  public uuidRestaurantDisplay: any;
  public resourceName = this.translateService.translate('GESTION_PARC_RAPPORT.ALERTE_RESOURCE');
  public defaultRestoUuid: string;

  constructor(private alerteService: AlertesService,
              private notificationService: NotificationService,
              private translateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService,
              private route: Router,
              private sharedRestoService: SharedRestaurantListService) {
  }

  ngOnInit() {
    this.updateAlerteTitle = this.translateService.translate('GESTION_ALERTE.UPDATE_TITLE');
    if (this.route.url.includes('parc')) {
      this.displayRestoList = true;
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestoSource = result;
        if (this.listRestoSource.length) {
          this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.listRestoSource[0].uuid);
          this.uuidRestaurantDisplay = this.listRestoSource[0].uuid;
          this.getListeAlertesByRestaurant(this.listRestoSource[0].uuid);
          this.restaurantSource = this.listRestoSource[0];
        }
      });
    } else {
      this.displayRestoList = false;
      this.getListeAlertesByRestaurant();
    }
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Cette methode permet d'enregistrer la liste des alertes
   */
  public saveListAlerte(fromCopieAlerte?: boolean, fromSaveContent?: boolean) {
    let uuidRestoSource: string;
    if (this.restaurantSource) {
      uuidRestoSource = this.restaurantSource.uuid;
    }
    if (fromSaveContent) {
      uuidRestoSource = this.defaultRestoUuid;
    }
    this.alerteService.updateAllAlertesByRestaurant(this.listAlertes, uuidRestoSource).subscribe((data: any) => {
        this.cloneAndResetDefaultListeAlerte();
      },
      (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }, () => {
        if (!fromCopieAlerte) {
          this.notificationService.showSuccessMessage('GESTION_ALERTE.LIST_UPDATED_SUCCESS');
        }else{
          this.copierAlertes();
        }
        if (fromSaveContent) {
          this.getListeAlertesByRestaurant(this.restaurantSource.uuid);
        }
      }
    );
  }

  public submit(event: any[]): void {
    this.listRestoIds = [];
    this.showPopup = false;
    event.forEach(val => this.listRestoIds.push(val.IdenRestaurant));
    if (this.compareObjects()) {
      this.copierAlertes();
    } else {
      this.saveListAlerte(true, false);

    }
  }

  public copierAlertes(): void {
    this.alerteService.copierParamAlerte(this.restaurantSource.uuid, this.listRestoIds).subscribe((result: any) => {
        this.notificationService.showSuccessMessage('GESTION_ALERTE.ALERTE_COPIED_SUCCESSFULLY');
      }
      , error => {
        console.log(error);
      });
  }

  /**
   * Check if alertes has changed
   */
  public compareObjects(): boolean {
    return JSON.stringify(this.listAlertes) === JSON.stringify(this.defaultListAlertes);
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des alertes
   */
  public compareList(): boolean {
    let same = true;
    this.defaultListAlertes.forEach((item, index) => {
      if (JSON.stringify(this.defaultListAlertes[index]) !== JSON.stringify(this.listAlertes[index])) {
        same = false;
      }
    });
    return same;
  }

  /**
   * Cette methode permet d'augmenter la priorite de l'element selectionne
   */
  public augmenterPriorite(alerte: AlerteModel) {
    this.hasChanged = true;
    const selectedIndex = this.getIndexOfSelectedAlerte(alerte);
    if (!(selectedIndex === 0)) {
      alerte.priorite--;
      this.listAlertes[selectedIndex - 1].priorite++;
      this.sortAlertes();
    }
  }

  /**
   * Cette methode permet de diminuer la priorite de l'element selectionne
   */
  public diminuerPriorite(alerte: AlerteModel) {
    this.hasChanged = true;
    const selectedIndex = this.getIndexOfSelectedAlerte(alerte);
    if (!(selectedIndex === this.listAlertes.length - 1)) {
      alerte.priorite++;
      this.listAlertes[selectedIndex + 1].priorite--;
      this.sortAlertes();
    }
  }

  /**
   * Cette methode permet de sélectioner une alerte et ouvrir la popup de mise à jour
   * @param: alerte
   */
  public selectAlerteToUpdate(alerte: AlerteModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.selectedAlerte = JSON.parse(JSON.stringify(alerte));
      this.displayPopup = true;
    }
  }

  /**
   * Cette methode permet d'afficher/disparaitre les icons de changement de priorité
   * @param: alerte
   */
  public showOrHideChevron(alerte: AlerteModel) {
    alerte.displayChevron = !alerte.displayChevron;
  }

  /**
   * Cette methode permet de mettre à jour l'alerte choisit
   * @param: alerte
   */
  public updateAlerte(alerte: AlerteModel) {
    this.listAlertes.forEach(item => {
      if (item.idAlerte === alerte.idAlerte) {
        item.valeurParam = alerte.valeurParam;
        item.prefixFichier = alerte.prefixFichier;
        item.niveauAccess = alerte.niveauAccess;
        item.actif = alerte.actif;
      }
    });
    this.displayPopup = false;

    this.callUpdateAlerteWS(alerte);
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
      message: this.translateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveListAlerte();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);

      }
    });
    return this.navigateAway;
  }

  closePopup() {
    this.showPopup = false;
  }

  showPopupListResto() {
    this.showPopup = true;
  }

  public changeAlterte(): void {
    this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.restaurantSource.uuid);
    if (this.compareObjects()) {
      this.getListeAlertesByRestaurant(this.restaurantSource.uuid);
    } else {
      this.saveContentBeforRestoChange();
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforRestoChange(): void {
    this.confirmationService.confirm({
      message: this.translateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveListAlerte(false, true);
      },
      reject: () => {
        this.getListeAlertesByRestaurant(this.restaurantSource.uuid);
      }
    });
  }

  /**
   * Cette methode permet de récupérer la liste des alertes par restaurant à partir de la base de données
   */
  private getListeAlertesByRestaurant(uuidRestaurant?: any) {
    this.alerteService.getAllAlertesByRestaurant(uuidRestaurant).subscribe(
      (data: AlerteModel[]) => {
        this.listAlertes = data;
        this.defaultRestoUuid = uuidRestaurant;
        this.cloneAndResetDefaultListeAlerte();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet d'ordonner les alertes selon la priorite
   */
  private sortAlertes(defaultListAlertes?: AlerteModel[]) {
    if (defaultListAlertes) {
      this.listAlertes.sort((a, b) => a.priorite - b.priorite);
      this.defaultListAlertes.sort((a, b) => a.priorite - b.priorite);
    } else {
      this.listAlertes.sort((a, b) => a.priorite - b.priorite);
    }
  }

  /**
   * Cette methode permet de cloner la liste des alertes en une autre liste afin des le comparer (utilise pour savoir s'il y a eu un changement dans la liste des alertes)
   */
  private cloneAndResetDefaultListeAlerte() {
    this.defaultListAlertes = [];
    this.listAlertes.forEach(item => {
      item.displayChevron = false;
      this.defaultListAlertes.push(JSON.parse(JSON.stringify(item)));
    });
    this.sortAlertes(this.defaultListAlertes);
  }

  /**
   * Cette methode permet de recuperer l'index de l'element selectionne
   */
  private getIndexOfSelectedAlerte(alerte: AlerteModel): number {
    return this.listAlertes.indexOf(alerte);
  }

  /**
   * Cette methode permet de modifier l'alerte choisit dans la base de données en faisant appel au web service
   * @param: alerte
   */
  private callUpdateAlerteWS(alerte: AlerteModel) {
    this.alerteService.updateAlertesByRestaurant(alerte, this.defaultRestoUuid).subscribe(
      (data: any) => {
        this.notificationService.showMessageWithoutTranslateService('success',
          alerte.libelle + ' ' + this.translateService.translate('GESTION_ALERTE.SINGLE_UPDATED_SUCCESS'));
        this.cloneAndResetDefaultListeAlerte();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

}
