import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ParametreModel} from '../../../../model/parametre.model';
import {ParametreGlobalService} from '../../../../../modules/home/configuration/service/param.global.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, SelectItem, SortEvent} from 'primeng/api';
import {DateService} from '../../../../service/date.service';
import {EncodageType} from '../../../../enumeration/encodage.enum';
import {PerformCodeEnum} from '../../../../enumeration/PerformCode.enum';
import {DatePipe} from '@angular/common';
import {SharedRestaurantListService} from '../../../../service/shared-restaurant-list.service';
import {Observable, Subject} from 'rxjs';
import {DomControlService} from '../../../../service/dom-control.service';
import {RestaurantSyncService} from "../../../../service/restaurant-sync.service";

@Component({
  selector: 'rhis-parametre-globaux',
  templateUrl: './parametre-globaux.component.html',
  styleUrls: ['./parametre-globaux.component.scss']
})
export class ParametreGlobauxComponent implements OnInit {
  public excludeParams = ['ENCODAGE', 'PERFORM_MODE', 'LANGUE_SONS', 'LANGUE_AFFICHAGE', 'ENTREPRISE'];
  public listEncodage: SelectItem[] = [
    {label: 'UTF-8', value: EncodageType.UTF_8},
    {label: 'UTF-16', value: EncodageType.UTF_16},
    {label: 'ISO-8859-1', value: EncodageType.ISO_8859_1},
    {label: 'ISO-8859-15', value: EncodageType.ISO_8859_15},
    {label: 'WINDOWS-1252', value: EncodageType.ANSI}
  ];
  public listPerformCode: SelectItem[] = [];
  public listeParametres: ParametreModel[] = [];
  public defaultListeParametres: ParametreModel[] = [];
  public uuidRestaurant: string;
  public heightInterface: any;
  @Output()
  public changesDetector = new EventEmitter();
  public header: { title: string; field: string; }[];
  public displaySpinner = false;
  public PALIER1_CODE_NAME = 'PALIER1_SUP';
  public PALIER1_INDEX = -1;
  public PALIER2_CODE_NAME = 'PALIER2_SUP';
  public PALIER3_CODE_NAME = 'PALIER3_SUP';
  public PALIER2_INDEX = -1;
  public PALIER3_INDEX = -1;
  public JOUR_DECALAGE_CODE_NAME = 'nSocFrwDay';
  public JOUR_DECALAGE_INDEX = -1;
  public MIN_DAY_REF_CODE_NAME = 'MIN_DAY_REF';
  public MIN_DAY_REF_INDEX = -1;
  public STC_CODE_NAME = 'SOLDE_TCOMPTE';
  public STC_INDEX = -1;
  public GESTION_DEFAUT = 'GESTIONDEFAUT';
  public GESTION_DEFAUT_INDEX = -1;
  public MINUTE_INTERVALE_CODE_NAME = 'MINUTEINTERVALRECUP';
  public MINUTE_INTERVALE_INDEX = -1;
  public title: string;
  public listRestaurant: any[];
  public restaurantSelected: any;
  public showPopup = false;
  public listRestaurants: any[];
  public listRestaurantsWitoutCurrent: any[];
  public isParc = false;
  private updateByNavigationAway = false;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public ecran = 'PRS';
  public resourceName = this.translator.translate('GESTION_PARC_RAPPORT.PARAM_RESTO_RESOURCE');
  public restaurantSourceLibelle: string;
  public languesList = [
    {label: 'FR', value: 'FR'},
    {label: 'EN', value: 'EN'},
    {label: 'ES', value: 'ES'},
    {label: 'DE', value: 'DE'},
    {label: 'NL', value: 'NL'},
  ];
  constructor(private paramService: ParametreGlobalService,
              private translator: RhisTranslateService,
              private dateService: DateService,
              private activatedRoute: ActivatedRoute,
              private notificationService: NotificationService,
              protected rhisTranslateService: RhisTranslateService,
              private datePipe: DatePipe,
              private sharedRestaurantListService: SharedRestaurantListService,
              private route: Router,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService,
              private restaurantSyncService: RestaurantSyncService) {

    this.listPerformCode = [
      {label: 'MOE', value: PerformCodeEnum.MOE},
      {label: this.translator.translate('PRODUCTIVITE.LABEL'), value: PerformCodeEnum.PRODUCTIVITE}
    ];
    this.activatedRoute.params.subscribe(async params => {
      if (this.route.url.includes('parc')) {
        this.isParc = true;
        this.uuidRestaurant = (await this.sharedRestaurantListService.getListRestaurant())[0].uuid;
        this.restaurantSourceLibelle = (await this.sharedRestaurantListService.getListRestaurant())[0].libelleRestaurant;
        this.listRestaurants = await this.sharedRestaurantListService.getListRestaurant();
        this.listRestaurantsWitoutCurrent = this.listRestaurants.filter(val => val.uuid !== this.listRestaurants[0].uuid);
      } else {
        this.uuidRestaurant = params.uuidRestaurant;
      }
      this.getAllParamsByRestaurant();
    });
    this.initializeHeader();
    this.title = this.rhisTranslateService.translate('SOCIETE.UPDATE_PARAMS');
    this.updateEntrepriseParam();
  }

  async ngOnInit() {
    this.listRestaurant = await this.sharedRestaurantListService.getListRestaurant();
  }

  private updateEntrepriseParam(): void {
    this.restaurantSyncService.getEntrepriseParam().subscribe(entrepriseParamValue => {
      const index = this.listeParametres.findIndex(p => p.param.toUpperCase() === 'ENTREPRISE' && p.rubrique.toUpperCase() == 'INTERFACE_PAYE');
      if (index != -1) {
        this.listeParametres[index].valeur = entrepriseParamValue;
      }
    });
  }

  private showMenuControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  private updateListControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }


  /**
   * Create restaurant parameters table header
   */
  private initializeHeader() {
    this.header = [
      {title: this.translator.translate('PARAMS_GLOBAL.RUBRIQUE_LABEL'), field: 'rubrique'},
      {title: this.translator.translate('PARAMS_GLOBAL.PARAM_LABEL'), field: 'param'},
      {title: this.translator.translate('PARAMS_GLOBAL.DESCRIPTION_LABEL'), field: 'description'},
      {title: this.translator.translate('PARAMS_GLOBAL.VALUE_LABEL'), field: 'valeur'}
    ];
  }

  /**
   * Send parameters list changing
   */
  public detectChanges(param: ParametreModel) {
    if (param.param === this.PALIER1_CODE_NAME || param.param === this.PALIER2_CODE_NAME) {
      if (+this.listeParametres[this.PALIER2_INDEX].valeur < +this.listeParametres[this.PALIER1_INDEX].valeur) {
        this.listeParametres[this.PALIER1_INDEX].wrongValue = true;
        this.listeParametres[this.PALIER2_INDEX].leftBorderWrongValue = true;
      } else {
        this.listeParametres[this.PALIER1_INDEX].wrongValue = false;
        this.listeParametres[this.PALIER2_INDEX].leftBorderWrongValue = false;
      }
    }

    if (param.param === this.PALIER3_CODE_NAME || param.param === this.PALIER2_CODE_NAME) {
      if (+this.listeParametres[this.PALIER2_INDEX].valeur > +this.listeParametres[this.PALIER3_INDEX].valeur
        && (+this.listeParametres[this.PALIER3_INDEX].valeur !== 0)) {
        this.listeParametres[this.PALIER3_INDEX].wrongValue = true;
        this.listeParametres[this.PALIER2_INDEX].rightBorderWrongValue = true;
      } else {
        this.listeParametres[this.PALIER3_INDEX].wrongValue = false;
        this.listeParametres[this.PALIER2_INDEX].rightBorderWrongValue = false;
      }
    }

    if (param.param === this.STC_CODE_NAME) {
      this.listeParametres[this.STC_INDEX].wrongValue = ((+param.valeur !== 0) && (+param.valeur !== 1) && (+param.valeur !== 2));
    }
    if (param.param === this.GESTION_DEFAUT) {
      this.listeParametres[this.GESTION_DEFAUT_INDEX].wrongValue = ((+param.valeur !== 0) && (+param.valeur !== 1)) || (param.valeur.trim().length === 0);
    }
    if (param.param === this.MINUTE_INTERVALE_CODE_NAME) {
      this.listeParametres[this.MINUTE_INTERVALE_INDEX].wrongValue = ((+param.valeur < 0) || (+param.valeur > 1440));
    }
    this.listeParametres[this.JOUR_DECALAGE_INDEX].wrongValue = (param.param === this.JOUR_DECALAGE_CODE_NAME) && (+this.listeParametres[this.JOUR_DECALAGE_INDEX].valeur > 6);
    this.listeParametres[this.MIN_DAY_REF_INDEX].wrongValue = (param.param === this.MIN_DAY_REF_CODE_NAME) && (+this.listeParametres[this.MIN_DAY_REF_INDEX].valeur < 1);
    this.changesDetector.emit();
  }

  /**
   * Cette methode permet de lancer le service responsable de la recuperation de la liste des parametres
   */
  private getAllParamsByRestaurant() {
    this.paramService.getParamsByRestaurant(this.uuidRestaurant).subscribe((data: ParametreModel[]) => {
        this.listeParametres = data;
        this.sortListParam();
        this.checkTimeAndSetIndexValueAndCreateDefaultList();
      },
      (err: any) => {
        // TODO notify of error
        console.log(err);
      });
  }

  /**
   * Set restaurant parameters list to it's default value
   */
  public setDefaultValue() {
    this.listeParametres = JSON.parse(JSON.stringify(this.defaultListeParametres));
  }

  /**
   * Sort restaurant parameters list
   * @param: event
   */
  public sortRows(event: SortEvent) {
    this.listeParametres.sort((row1, row2) => {
      const val1 = row1[event.field];
      const val2 = row2[event.field];
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
    this.listeParametres.sort(function (a, b) {
      if (a.rubrique === b.rubrique) {
        return a.param.localeCompare(b.param) * event.order;
      }
    });
  }

  /**
   * Cette methode permet d'appeler le service de mettre a jour les parametres
   */
  public saveUpdate() {
    if (this.canSave()) {
      this.callWSToUpdate();
    }
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des parametres
   */
  public compareList(): boolean {
    let same = true;
    this.listeParametres.forEach((item, index) => {
      if (JSON.stringify(this.defaultListeParametres[index]) !== JSON.stringify(this.listeParametres[index])) {
        same = false;
      }
    });
    return same;
  }

  public setBooleanValue(param: ParametreModel): void {
    param.valeur = (!(param.valeur === 'true')).toString();
    this.detectChanges(param);
  }

  public getOtherParamValue(paramName: string): any {
    if (paramName === this.PALIER1_CODE_NAME) {
      return +this.listeParametres[this.PALIER2_INDEX].valeur;
    } else if (paramName === this.PALIER2_CODE_NAME) {
      return +this.listeParametres[this.PALIER1_INDEX].valeur;
    } else if (paramName === this.PALIER3_CODE_NAME) {
      return +this.listeParametres[this.PALIER2_INDEX].valeur;
    }
  }

  public canSave(): boolean {
    let displayError = false;
    this.listeParametres.forEach(item => {
      displayError = displayError || item.wrongValue;
    });
    if (displayError) {
      this.notificationService.showMessage('error', 'PARAMS_GLOBAL.CORRECT_WRONG_VALUES');
      return false;
    } else {
      return true;
    }
  }

  private checkTimeAndSetIndexValueAndCreateDefaultList(): void {
    for (let i = 0; i < this.listeParametres.length; i++) {
      this.listeParametres[i].wrongValue = false;
      if (this.dateService.isTimeValue(this.listeParametres[i].valeur)) {
        this.listeParametres[i].valeur = this.dateService.setTimeFormatHHMM(this.listeParametres[i].valeur);
        this.listeParametres[i].isTime = true;
      }
      this.listeParametres[i].isDate = this.dateService.isDateValue(this.listeParametres[i].valeur);
      if (this.listeParametres[i].isDate && this.listeParametres[i].param === 'GDH_BLOCK') {
        this.listeParametres[i].valeur = new Date(this.listeParametres[i].valeur.split('/').reverse().join('/'));
      }
      if (this.listeParametres[i].isDate && this.listeParametres[i].param === 'DERNIER') {
        this.listeParametres[i].valeur = new Date(this.listeParametres[i].valeur.split('-').reverse().join('-'));
      }
      if (this.listeParametres[i].param === this.PALIER1_CODE_NAME) {
        this.PALIER1_INDEX = i;
      } else if (this.listeParametres[i].param === this.PALIER2_CODE_NAME) {
        this.PALIER2_INDEX = i;
      } else if (this.listeParametres[i].param === this.PALIER3_CODE_NAME) {
        this.PALIER3_INDEX = i;
      } else if (this.listeParametres[i].param === this.JOUR_DECALAGE_CODE_NAME) {
        this.JOUR_DECALAGE_INDEX = i;
      } else if (this.listeParametres[i].param === this.MIN_DAY_REF_CODE_NAME) {
        this.MIN_DAY_REF_INDEX = i;
      } else if (this.listeParametres[i].param === this.STC_CODE_NAME) {
        this.STC_INDEX = i;
      } else if (this.listeParametres[i].param === this.MINUTE_INTERVALE_CODE_NAME) {
        this.MINUTE_INTERVALE_INDEX = i;
      } else if (this.listeParametres[i].param === this.GESTION_DEFAUT) {
        this.GESTION_DEFAUT_INDEX = i;
      }
    }
    this.defaultListeParametres = JSON.parse(JSON.stringify(this.listeParametres));
  }

  private sortListParam(): void {
    this.listeParametres.sort(function (a: ParametreModel, b: ParametreModel) {
      if (a.rubrique.toLowerCase() < b.rubrique.toLowerCase()) {
        return -1;
      }
      if (a.rubrique.toLowerCase() > b.rubrique.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    this.listeParametres.sort(function (a: ParametreModel, b: ParametreModel) {
      if (a.rubrique === b.rubrique) {
        return a.param.localeCompare(b.param);
      }
    });
  }

  private callWSToUpdate(): void {
    this.transformGdhParamDate();
    this.paramService.updateParamsByRestaurant(this.listeParametres, this.uuidRestaurant).subscribe(() => {
        this.checkTimeAndSetIndexValueAndCreateDefaultList();
      },
      (err: any) => {
        // TODO notify of error
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('CREATE_RESTAURANT.UPDATED_SUCCESSFULLY');
      });
  }


  /**
   * transform date to string 'jj/mm/yy'
   */
  private transformGdhParamDate() {
    const index = this.listeParametres.findIndex(item => item.param === 'GDH_BLOCK');
    if (index !== -1) {
      this.listeParametres[index].valeur = this.datePipe.transform(this.listeParametres[index].valeur, 'dd/MM/yyyy');
    }
    const indexDernier = this.listeParametres.findIndex(item => item.param === 'DERNIER');
    if (indexDernier !== -1) {
      this.listeParametres[indexDernier].valeur = this.datePipe.transform(this.listeParametres[indexDernier].valeur, 'dd-MM-yyyy');
    }
  }

  public async changeRestaurant(): Promise<void> {
    if (!this.compareList()) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
        header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.notificationService.startLoader();
          this.transformGdhParamDate();
          this.paramService.updateParamsByRestaurant(this.listeParametres, this.uuidRestaurant).subscribe((result:any)=>{
              this.notificationService.stopLoader();
              this.changeSelectedRestaurant();
            });
          this.checkTimeAndSetIndexValueAndCreateDefaultList();
          this.navigateAway.next(true);
        },
        reject: () => {
          this.changeSelectedRestaurant();
          this.navigateAway.next(true);
        }
      });
    } else {
      this.changeSelectedRestaurant();
    }
  }

  changeSelectedRestaurant() {
    this.uuidRestaurant = this.restaurantSelected.uuid;
    this.restaurantSourceLibelle = this.restaurantSelected.libelleRestaurant;
    this.listRestaurantsWitoutCurrent = this.listRestaurants.filter(val => val.uuid !== this.uuidRestaurant);
    this.getAllParamsByRestaurant();
  }
  public closePopup(): void {
    this.showPopup = false;
  }

  public updateParams(): void {
    if (!this.compareList()) {
      this.saveUpdate();
    }
  }

  public copyParams(): void {
    this.showPopup = true;
  }

  public canDeactivate(): boolean {
    return this.compareList();
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(sectionNumber?: number): Observable<boolean> {
    this.updateByNavigationAway = true;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParams();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  public async submit(restaurants: any[]): Promise<void> {
    const idsRestaurant: number[] = [];
    if (restaurants.length > 0) {
      restaurants.forEach(restaurant => {
        idsRestaurant.push(restaurant.IdenRestaurant);
      });
    }
    if (!this.compareList()) {
      await this.transformGdhParamDate();
      await this.paramService.updateParamsByRestaurant(this.listeParametres, this.uuidRestaurant).toPromise();
      await this.checkTimeAndSetIndexValueAndCreateDefaultList();
    }
    this.paramService.copyParams(this.uuidRestaurant, idsRestaurant).subscribe(() => {
        this.checkTimeAndSetIndexValueAndCreateDefaultList();
      },
      (err: any) => {
        console.log(err);
      }, () => {
        this.showPopup = false;
        this.notificationService.showSuccessMessage('SOCIETE.COPY_PARAM');
      });
  }

}

