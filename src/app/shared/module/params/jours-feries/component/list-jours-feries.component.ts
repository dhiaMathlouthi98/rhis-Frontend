import {Component, OnInit} from '@angular/core';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NationaliteModel} from '../../../../../shared/model/nationalite.model';
import {JourFeriesModel} from '../../../../../shared/model/jourFeries.model';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {DateService} from '../../../../../shared/service/date.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {PathService} from '../../../../../shared/service/path.service';
import {JoursFeriesService} from '../service/jours.feries.service';
import {NationaliteService} from '../../../../../modules/home/configuration/service/nationalite.service';
import {SharedRestaurantListService} from '../../../../service/shared-restaurant-list.service';
import {Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {CopieJourFeriesGui} from '../../../../model/gui/CopieJourFeriesGui.model';

@Component({
  selector: 'rhis-jours-feries',
  templateUrl: './list-jours-feries.component.html',
  styleUrls: ['./list-jours-feries.component.scss']
})
export class ListJoursFeriesComponent implements OnInit {

  public listPays: NationaliteModel[] = [];
  public feriesValueLable = ['Jour de l\'an', 'Vendredi Saint', 'Paques', 'Lundi de Pâques', 'Fête du travail', 'Victoire 1945', 'Ascension', 'Pentecote', 'Lundi de Pentecote', 'Fête Nationale', 'Assomption', 'Toussaint', 'Armistice', 'Noël', 'Saint Etienne'];
  public nationalite: NationaliteModel;
  public listJourFeriesByRestaurant: JourFeriesModel[] = [];
  // list de jour ferie par restaurant et par pays
  public listJourFeriesByRestaurantByPays: JourFeriesModel[] = [];
  // list de jour ferie par pays
  public listJourFeriesByPays: JourFeriesModel[] = [];
  public restaurant: RestaurantModel;
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public defaultListJoursFeries: JourFeriesModel[] = [];
  public displayRestoList: boolean;
  public listRestoSource: any[];
  public restaurantSource: any;
  public showPopup = false;
  public listRestoDestination = [];
  public submitButtonText = this.translateService.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  public listRestoIds = [];
  public listCopieJourFeriesGui = [];
  public listPaysIds = [];
  public uuidRestaurantDisplay: any;
  public heightInterface: any;
  private ecran = 'GTF';

  public updateMode = false;
  public yearSelected: number;
  private listJoursFeriesModified: JourFeriesModel[] = [];
  public resourceName = this.translateService.translate('GESTION_PARC_RAPPORT.JOUR_FERIE_RESOURCE');

  constructor(private notificationService: NotificationService,
              private translateService: RhisTranslateService,
              private nationaliteService: NationaliteService,
              private joursFeriesServie: JoursFeriesService,
              private sharedRestaurantService: SharedRestaurantService,
              private pathService: PathService,
              private dateService: DateService,
              private route: Router,
              private domControlService: DomControlService,
              private sharedRestoService: SharedRestaurantListService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.yearSelected = new Date().getFullYear();
    this.getListPays();

    if (this.route.url.includes('parc')) {
      this.displayRestoList = true;
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestoSource = result;
        if (this.listRestoSource.length) {
          this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.listRestoSource[0].uuid);
          this.uuidRestaurantDisplay = this.listRestoSource[0].uuid;
          this.getRestaurant(this.listRestoSource[0].uuid);
          this.getNationaliteByRestaurant(this.listRestoSource[0].uuid);
          this.restaurantSource = this.listRestoSource[0];

        }

      });
    } else {
      this.displayRestoList = false;
      this.getRestaurant();
      this.getNationaliteByRestaurant();
    }

  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }
  public changeParams(): void {
    this.yearSelected = new Date().getFullYear();
    this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.restaurantSource.uuid);
    this.uuidRestaurantDisplay = this.restaurantSource.uuid;
    this.getRestaurant(this.restaurantSource.uuid);
    this.getNationaliteByRestaurant(this.restaurantSource.uuid);


  }

  public submit(event: any[]): void {
    this.listCopieJourFeriesGui = [];
    this.showPopup = false;
    let differentPays = false;
    event.forEach((val: any) => {
      if (this.restaurant.pays.idNationalite !== val.idPays) {
        differentPays = true;
      }
      this.listCopieJourFeriesGui.push(this.setElementToCopieJourFeries(val));
    });
    if (differentPays) {
      this.checkCopieJourFeries();
    } else {
      this.saveAndCopieJourFeries();
    }

  }


  private setElementToCopieJourFeries(val: any): CopieJourFeriesGui {
    const copieJourFeriesGui = {} as CopieJourFeriesGui;
    copieJourFeriesGui.idPaysSource = this.restaurant.pays.idNationalite;
    copieJourFeriesGui.idRestaurantSource = this.restaurant.idRestaurant;
    copieJourFeriesGui.idPaysDestination = val.idPays;
    copieJourFeriesGui.idRestaurantDestination = val.IdenRestaurant;
    return copieJourFeriesGui;
  }

  /**
   * enregistrement  et copiage de jours féries
   */
  private saveAndCopieJourFeries(): void {
    if (this.compareList()) {
      this.copierJourFeries();
    } else {
      this.saveListJourFeries(true);
    }
  }

  /**
   * Cette methode permet de recuperer la liste des pays
   */
  private getListPays() {
    this.nationaliteService.getAll().subscribe(
      (data: NationaliteModel[]) => {
        this.listPays = data;
          this.listPays.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1));
      },
      (err: any) => {
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des nationalite par restaurant à partir de la base de données
   */
  private getNationaliteByRestaurant(uuidRestaurant?: any) {
    this.nationaliteService.getNationaliteByRestaurant(uuidRestaurant).subscribe(
      (data: NationaliteModel) => {
        this.nationalite = data;
      }, (err: any) => {
      }, () => this.saveListJourFeriesByYear()
    );
  }

  /**
   * recuperer tous les jours feries par pays
   * @param: idNationalite
   */
  private getJourFeriesByPays(uuidNationalite) {
    this.joursFeriesServie.getAllJourFeriesByPays(uuidNationalite).subscribe((data: JourFeriesModel[]) => {
        this.setListJourFeriesByPays(data);
      },
      (err: any) => {
      }, () => this.getJourFeriesByPaysAndRestaurant()
    );
  }

  /**
   * set list jour feries par pays
   * @param: data
   */
  private setListJourFeriesByPays(data) {
    this.listJourFeriesByPays = data;
    this.listJourFeriesByPays.forEach(jourFeries => {
      jourFeries.jourFerierRestaurant = false;
    });
  }

  /**
   * récuperer tous les jours feries par restaurant et pays
   */
  private getJourFeriesByPaysAndRestaurant() {
    this.listJourFeriesByRestaurantByPays = [];
    // parcourir les jours fériés par restaurant et les supprimer de la liste des jours fériés par pays pour ne pas avoir un doublon
    this.listJourFeriesByRestaurant.forEach(jourFeriesRestau => {
      this.listJourFeriesByPays.forEach((jourFeriesPays, index) => {
        if (jourFeriesRestau.idJourFeriers === jourFeriesPays.idJourFeriers) {
          this.listJourFeriesByPays.splice(index, 1);
        }
      });
    });
    this.listJourFeriesByRestaurantByPays = this.listJourFeriesByRestaurant.concat(this.listJourFeriesByPays);
    this.cloneAndResetDefaultListeJourFeries();
  }

  /**
   * récuperer tous les jours fériés par restaurant
   */
  private getJourFeriesByRestaurant() {
    this.joursFeriesServie.getAllJourFeriesByRestaurant().subscribe((data: JourFeriesModel[]) => {
        this.setListJourFeriesByRestaurant(data);
      },
      (err: any) => {
      }, () => this.getNationaliteByRestaurant()
    );
  }

  /**
   * set list jours fériés par restaurant
   * * @param: data
   */
  private setListJourFeriesByRestaurant(data: JourFeriesModel[]) {
    this.listJourFeriesByRestaurant = data;
    this.listJourFeriesByRestaurant.forEach(jourFeries => {
      jourFeries.jourFerierRestaurant = true;
    });
  }

  /**
   * ajout list des jours fériés
   */
  public saveListJourFeries(fromCopieParam?: boolean) {
    if (!this.compareList()) {
      this.setListJourFeriesBefeoreSave();
      this.notificationService.startLoader();
      this.joursFeriesServie.addListJourFeries(this.listJoursFeriesModified, this.uuidRestaurantDisplay).subscribe(
        (data: any) => {
          this.cloneAndResetDefaultListeJourFeries();
          if (!fromCopieParam) {
            this.notificationService.showSuccessMessage('JOUR_FERIES.LIST_UPDATED_SUCCESS');
          }
          this.listJoursFeriesModified = [];
        },
        (err: any) => {
          console.log('error');
          this.listJoursFeriesModified = [];
          this.notificationService.stopLoader();
        }, () => {
          if (fromCopieParam) {
            this.copierJourFeries();
          } else {
            this.notificationService.stopLoader();
          }
        }
      );
    }
  }

  closePopup() {
    this.showPopup = false;
  }

  /**
   * récuperer le restaurant par id
   */
  private getRestaurant(uuidRestaurant?: any) {
    if (!uuidRestaurant && this.sharedRestaurantService.selectedRestaurant && this.sharedRestaurantService.selectedRestaurant.idRestaurant) {
      this.restaurant = this.sharedRestaurantService.selectedRestaurant;
      this.updateMode = this.sharedRestaurantService.selectedRestaurant.idRestaurant === +this.pathService.defaultRestaurantId;
    } else {
      this.sharedRestaurantService.getRestaurantById(uuidRestaurant).subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurantService.selectedRestaurant = data;
          this.restaurant = data;
          this.updateMode = this.sharedRestaurantService.selectedRestaurant.idRestaurant === +this.pathService.defaultRestaurantId;
        }, (err: any) => {
        }
      );
    }
  }

  /**
   * set list jours fériés before save
   */
  private setListJourFeriesBefeoreSave() {
    this.listJourFeriesByRestaurantByPays.forEach(jourFeries => {
      // ajouter une jour ferie avec restaurant
      if (jourFeries.jourFerierRestaurant) {
        if (jourFeries.idJourFeriers !== undefined) {
          if (!jourFeries.restaurants) {
            jourFeries.restaurants = [];
          }
          jourFeries.restaurants.forEach((restaurant, index) => {
              // supprimer une jour ferie de restaurant
              if (restaurant.idRestaurant === this.restaurant.idRestaurant) {
                jourFeries.restaurants.splice(index, 1);
              }
            }
          );

          jourFeries.restaurants.push(this.restaurant);

        }
        // supprimer une jour ferie de restaurant
      } else {
        if (jourFeries.restaurants) {

          jourFeries.restaurants.forEach((restaurant, index) => {
              if (restaurant.idRestaurant === this.restaurant.idRestaurant) {
                jourFeries.restaurants = [];
              }
            }
          );
        }
      }
      jourFeries.dateFeries = this.dateService.setCorrectDate(new Date(jourFeries.dateFeries));
    });

  }

  /**
   * Cette methode permet d'ordonner les jour feries  selon la jourferiesrestaurant
   */
  private sortJourFeriesList(defaultListJoursFeries?: JourFeriesModel[]) {
    if (defaultListJoursFeries) {
      this.listJourFeriesByRestaurantByPays.sort((a, b) => b.jourFerierRestaurant - a.jourFerierRestaurant);
      this.defaultListJoursFeries.sort((a, b) => b.jourFerierRestaurant - a.jourFerierRestaurant);
    } else {
      this.listJourFeriesByRestaurantByPays.sort((a, b) => b.jourFerierRestaurant - a.jourFerierRestaurant);
    }
  }

  /**
   *Cette methode permet de cloner la liste des  jours feries en une autre liste afin des le comparer
   * utilise pour savoir s'il y a eu un changement dans la liste des jours feries
   */
  private cloneAndResetDefaultListeJourFeries() {
    this.defaultListJoursFeries = [];
    this.listJourFeriesByRestaurantByPays.forEach(item => {
      this.defaultListJoursFeries.push(JSON.parse(JSON.stringify(item)));
    });
    this.sortJourFeriesList(this.defaultListJoursFeries);
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des jours feries
   */
  private compareList(): boolean {
    let same = true;
    this.listJoursFeriesModified = [];
    this.defaultListJoursFeries.forEach((item, index) => {
      if (JSON.stringify(this.defaultListJoursFeries[index]) !== JSON.stringify(this.listJourFeriesByRestaurantByPays[index])) {
        this.listJoursFeriesModified.push(this.listJourFeriesByRestaurantByPays[index]);
        same = false;
      }
    });
    return same;
  }

  /**
   * set jour ferieres restaurnat
   * @param :jourFerier
   */
  public setBooleanValue(jourFerier: JourFeriesModel) {
    jourFerier.jourFerierRestaurant = !jourFerier.jourFerierRestaurant;
  }

  public changeAncienneteValue(jourFerier: JourFeriesModel) {
    if (this.updateMode) {
      jourFerier.anciennete = !jourFerier.anciennete;
    }
  }

  /**
   * recuperer les jours féries par année
   * @param year
   */
  public getJourFeriersByYear(year): any {
    const JourAn = new Date(year, 0, 1);
    const FeteTravail = new Date(year, 4, 1);
    const Victoire1945 = new Date(year, 4, 8);
    const FeteNationale = new Date(year, 6, 14);
    const Assomption = new Date(year, 7, 15);
    const Toussaint = new Date(year, 10, 1);
    const Armistice = new Date(year, 10, 11);
    const Noel = new Date(year, 11, 25);
    const SaintEtienne = new Date(year, 11, 26);

    const G = year % 19;
    const C = Math.floor(year / 100);
    const H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11));
    const J = (year * 1 + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4)) % 7;
    const L = I - J;
    const MoisPaques = 3 + Math.floor((L + 40) / 44);
    const JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4);
    const Paques = new Date(year, MoisPaques - 1, JourPaques);
    const VendrediSaint = new Date(year, MoisPaques - 1, JourPaques - 2);
    const LundiPaques = new Date(year, MoisPaques - 1, JourPaques + 1);
    const Ascension = new Date(year, MoisPaques - 1, JourPaques + 39);
    const Pentecote = new Date(year, MoisPaques - 1, JourPaques + 49);
    const LundiPentecote = new Date(year, MoisPaques - 1, JourPaques + 50);

    return new Array(JourAn, VendrediSaint, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel, SaintEtienne);
  }

  /**
   * crée jour feries
   * @param dateJourFeris
   * @param nameJourFeries
   */
  private createJourFeries(dateJourFeris: Date, nameJourFeries: string): JourFeriesModel {
    let jourferies = {} as JourFeriesModel;
    jourferies.dateFeries = this.dateService.setCorrectDate(dateJourFeris);
    jourferies.libelle = nameJourFeries;
    jourferies.nationaliteRef = this.nationalite;
    return jourferies;
  }

  /**
   * ajout list des jours fériés
   */
  public saveListJourFeriesByYear(): void {
    this.listJourFeriesByRestaurantByPays = [];
    const jourFeriesByYear = this.getJourFeriersByYear(this.yearSelected);
    jourFeriesByYear.forEach((jourFeriesDisplay: JourFeriesModel, index: number) => {
      this.listJourFeriesByRestaurantByPays.push(this.createJourFeries(jourFeriesByYear[index], this.feriesValueLable[index]));
    });
    const uuid = this.uuidRestaurantDisplay ? this.uuidRestaurantDisplay : this.pathService.getUuidRestaurant();
    let paysLoader = false;
    if (!this.notificationService.displaySpinner) {
      this.notificationService.startLoader();
      paysLoader = true;
    }
    this.joursFeriesServie.addListJourFeriesByYear(this.listJourFeriesByRestaurantByPays, this.nationalite.uuid, this.yearSelected, uuid).subscribe(
      (data: any) => {
        this.listJourFeriesByRestaurantByPays = [];
        this.listJourFeriesByRestaurantByPays = data;
        this.listJourFeriesByRestaurantByPays.forEach(jourFeries => {
          if (jourFeries.restaurants && jourFeries.restaurants.length && jourFeries.restaurants.find((restaurantDisplay: RestaurantModel) => restaurantDisplay.uuid === uuid)) {
            jourFeries.jourFerierRestaurant = true;
          }
        });
        this.cloneAndResetDefaultListeJourFeries();
        if (paysLoader) {
          this.notificationService.stopLoader();
        }


      },
      (err: any) => {
        console.log('error');
        if (paysLoader) {
          this.notificationService.stopLoader();
        }
      }
    );
  }

  /**
   *incrementé année
   */
  public increamentYear(): void {
    if (this.yearSelected > new Date().getFullYear() - 5) {
      this.yearSelected -= 1;
      this.listJourFeriesByRestaurantByPays = [];
      this.saveListJourFeriesByYear();
    }
  }

  /**
   *decrementer année
   */
  public decrementYear(): void {
    if (this.yearSelected < new Date().getFullYear() + 5) {
      this.yearSelected += 1;
      this.listJourFeriesByRestaurantByPays = [];
      this.saveListJourFeriesByYear();
    }

  }

  /**
   * aficher le popup de liste restaurant
   */
  showPopupListResto() {
    this.showPopup = true;
  }

  /**
   * copier les jours feries
   */
  private copierJourFeries() {
    this.notificationService.startLoader();
    this.joursFeriesServie.copierJoursFeries(this.listCopieJourFeriesGui).subscribe((result: any) => {
        this.notificationService.stopLoader();
        this.notificationService.showSuccessMessage('JOUR_FERIES.JOUR_FERIES_COPIED_SUCCESSFULLY');
      }
      , error => {
        console.log(error);
        this.notificationService.stopLoader();
      });

  }

  /**
   * verification s'il y a changement de shift fixe
   * save list shfit, suppression shfit ,suppression list shifts
   *
   */
  public canDeactivate(): boolean {
    const canSave = this.compareList();
    return canSave;
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
        this.saveListJourFeries();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public checkSaveContentAfterChangeRestaurant(): void {

    if (!this.compareList()) {
      this.confirmationService.confirm({
        message: this.translateService.translate('POPUPS.SAVING_MESSAGE'),
        header: this.translateService.translate('POPUPS.NAVIGATION_HEADER'),
        acceptLabel: this.translateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.translateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.saveListJourFeries();
          this.changeParams();
        },
        reject: () => {
          this.changeParams();
        }
      });
    } else {
      this.changeParams();
    }
  }

  /**
   * copie jour feries entre des restaurants de différents pays
   */
  public checkCopieJourFeries(): void {
    this.confirmationService.confirm({
      message: this.translateService.translate('POPUPS.COPIE_MESSAGE') + ' ' + this.getLabelPaysOfRestaurantSource() + ' ' + this.translateService.translate('POPUPS.COMPLEMENT_COPIE_MESSAGE') + '<br>' + this.translateService.translate('POPUPS.CONTINUER'),
      header: this.translateService.translate('POPUPS.COPIER_HEADER'),
      acceptLabel: this.translateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      key: 'pays',
      accept: () => {
        this.saveAndCopieJourFeries();
      },
      reject: () => {
        this.closePopup();
      }
    });
  }

  /**
   * recupere le  pays de restaurant
   */
  private getLabelPaysOfRestaurantSource(): string {
    let libellePaysSource;
    const paysSource = this.listPays.find((pays: NationaliteModel) => pays.idNationalite === this.restaurant.pays.idNationalite);
      libellePaysSource = paysSource.paysFR;
    return libellePaysSource;
  }

}
