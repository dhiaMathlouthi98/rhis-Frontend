import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {EnvoiService} from '../../services/envoi.service';
import {ParametreRapport, RapportPaieEnum} from '../../../../shared/model/parametreRapport';
import {ReceiverGUI} from '../../../../shared/model/gui/ReceiverGUI.model';
import {DatePipe} from '@angular/common';
import {EntityUuidModel} from '../../../../shared/model/entityUuid.model';
import {SharedService} from '../../services/shared.service';
import {ParamNationauxService} from '../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {NotificationService} from '../../../../shared/service/notification.service';
import {ValidationPaieService} from '../../../home/gdh/service/validation-paie.service';
import {DateService} from '../../../../shared/service/date.service';
import {SessionService} from '../../../../shared/service/session.service';
import {ParametreGlobalService} from '../../../home/configuration/service/param.global.service';
import {RestaurantService} from '../../../../shared/service/restaurant.service';
import * as moment from 'moment';
import {ProfilModel} from '../../../../shared/model/profil.model';
import {ProfilService} from '../../../admin/profils/service/profil.service';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {Tooltip} from 'primeng/primeng';

@Component({
  selector: 'rhis-parametre-validation-paie',
  templateUrl: './parametre-validation-paie.component.html',
  styleUrls: ['./parametre-validation-paie.component.scss']
})
export class ParametreValidationPaieComponent implements OnInit, OnDestroy {

  public parametrValidationPaieNotChanged = true;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public heightInterface: any;
  public pageTitle = this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRE_VALIDATION_PAIE');

  selectedReceivers: ReceiverGUI[] = [];
  listReceiver: ReceiverGUI[] = [];
  filteredReceiver = [];
  errorReceiver = false;
  parametreEnvoi: ParametreRapport;
  emailWriter = '';
  public initParamPage = false;
  public selectedRestaurants: any = [];
  public listRestaurant: any;
  startPeriod = '';
  endPeriod = '';
  public showPopup = false;
  public profilWithRestaurantInFranchiseList: ProfilModel[] = [];
  public profilSelectionne: ProfilModel;
  public profilPlaceHolder: string;
  public firstObjectForSaveChanges = '';
  public reportListForSaveChanges = '';
  public selectedRecieverSaveChanges = '';
  public messageForSaveChanges = '';
  public reportList = [
    {
      name: this.rhisTranslateService.translate('GDH.PAY.WEEK_VIEW_REPORT'),
      code: RapportPaieEnum.GDH_WEEK_VIEW,
      disabled: false,
      value: false
    },
    {
      name: this.rhisTranslateService.translate('GDH.PAY.PERIOD_VIEW_REPORT'),
      code: RapportPaieEnum.GDH_PERIOD_VIEW,
      disabled: false,
      value: false
    },
    {
      name: this.rhisTranslateService.translate('GDH.PAY.PAY_INTEGRATION_REPORT'),
      code: RapportPaieEnum.PAYROLL_INTEGRATION,
      disabled: false,
      value: false
    },
    {
      name: this.rhisTranslateService.translate('GDH.PAY.ACTIF_EMPLOYEES_REPORT'),
      code: RapportPaieEnum.ACTIF_EMPLOYEES_LIST,
      disabled: false,
      value: false
    }
  ];

  message = '';
  placeHolderFound = false;

  placeHolderMessage = '';

  @ViewChild('divMessage') divMessage: HTMLElement;

  placeHolderCheckList = ['<Liste_Restaurants>', '<Restaurants_List>', '<Lista_de_Restaurantes>', '<Restaurantlijst>', '<Restaurantliste>'];
  messageTooltip = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER_TOOLTIP');

  @ViewChild(Tooltip) tooltip!: Tooltip;
  tooltipClick = true;

  public isShownInfos = false;

  constructor(private parametresharedService: SharedService,
              private rhisTranslateService: RhisTranslateService, private envoyerService: EnvoiService,
              private paramNationauxService: ParamNationauxService, private notificationService: NotificationService,
              private validationPaieService: ValidationPaieService, public sessionService: SessionService,
              private parametreGlobalService: ParametreGlobalService,
              private restaurantService: RestaurantService,
              private dateService: DateService,
              private profilService: ProfilService,
              private confirmationService: ConfirmationService) {
    this.parametresharedService.initParametreRapport();

    if (this.sessionService.getProfil() !== 'superviseur') {
      this.notificationService.startLoader();
      this.envoyerService.getParametreByUuidProfil().subscribe((parametre: ParametreRapport) => {

        if (parametre) {
          this.parametresharedService.setParametreRapport(parametre);
          this.getListRestaurants(false);
          this.initRapportList();
        } else {
          this.parametresharedService.initParametreRapport();
          this.parametreEnvoi = this.parametresharedService.getParametreRapportInitializer();
          this.parametreEnvoi.idParamEnvoi = '';
          //  this.initObjetMailAndMessage();
          this.getListRestaurants(true);
        }
        this.saveChanges(null);
      });
    } else {

      //   this.parametresharedService.initParametreRapport();
      //  this.saveChanges(null);
    }
  }

  ngOnInit() {
    this.parametresharedService.getParametreRapport().subscribe(data => {
      this.parametreEnvoi = {...data};
      this.selectedReceivers = [...data.receiver];
      this.saveChanges(null);
    });
    if (this.sessionService.getProfil() === 'superviseur') {
      this.recuperationDesProfilsAyantRestaurantDansFranchiseChoisi();
      this.profilPlaceHolder = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.CHOOSE');
    }

  }

  private async recuperationDesProfilsAyantRestaurantDansFranchiseChoisi(): Promise<void> {
    this.profilWithRestaurantInFranchiseList = await this.profilService.getProfilsByFranchise
    (this.sessionService.getUuidFranchise()).toPromise();


  }

  ngOnDestroy() {
    this.parametreEnvoi = this.parametresharedService.getParametreRapportInitializer();
    this.parametreEnvoi.idParamEnvoi = '';
    this.parametresharedService.initParametreRapport();
  }

  showTooltip() {
    this.isShownInfos = !this.isShownInfos;
  }

  updateMessage(event) {

    const message = document.getElementById('divMessage') as HTMLElement;
    const listdesMots = message.innerText.trim().split(/\s+/);
    if (event.code === 'Space') {

      this.placeHolderCheckList.forEach(el => {
        listdesMots.forEach(word => {
          if (word.toLowerCase().slice(0, -1) === el.toLowerCase() || word.toLowerCase() === el.toLowerCase()) {
            //    this.parametreEnvoi.message = message.innerText;
            this.placeHolderMessage = message.innerText;
          }
        });
      });
    }
    // this.saveChanges(null);
  }

  getChanges(value) {
    this.messageForSaveChanges = value;
  }

  private getListRestaurants(initMessage: boolean) {
    if (this.sessionService.getUuidFranchise()) {
      /* this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(this.sessionService.getUuidFranchise())
         .subscribe((restaurantPage: any) => {
           this.selectedRestaurants = restaurantPage.content;
           this.selectedRestaurants.sort((resto1: any, resto2: any) => {
             return resto1.libelleRestaurant.localeCompare(resto2.libelleRestaurant);
           });
           this.getPeriodePaieByRestaurant(this.selectedRestaurants[0]).then(next => {
             this.getListReciever();
             const uuidRestaurant = this.selectedRestaurants.map(resto => {
               return resto.uuid;
             });
             this.parametreEnvoi.listRestaurantDispaly = [...uuidRestaurant];
             if (initMessage) {
               this.initObjetMailAndMessage();
             }
           });
         });
 */
    } else {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVente(this.sessionService.getUuidUser()).subscribe((list: any) => {
        let restoList = list.content;
        //    this.selectedRestaurants = list.content;
        restoList.sort((resto1: any, resto2: any) => {
          return resto1.libelleRestaurant.localeCompare(resto2.libelleRestaurant);
        });
        this.getPeriodePaieByRestaurant(restoList[0].uuid).then(next => {
          if (initMessage) {
            setTimeout(() => {
              this.initObjetMailAndMessage();
            }, 150);

          }
          this.getListReciever();
          setTimeout(() => {
            this.selectedRestaurants = restoList;
            const uuidRestaurant = this.selectedRestaurants.map(resto => {
              return resto.uuid;
            });
            this.parametreEnvoi.listRestaurantDispaly = [...uuidRestaurant];
            this.saveChanges(null);

          }, 300);

        });
      });
    }
  }

  private initRapportList() {
    if (this.parametreEnvoi && this.parametreEnvoi.rapportPaieEnum.length > 0) {
      this.reportList.forEach(el => {
        if (this.parametreEnvoi.rapportPaieEnum.includes(el.code)) {
          el.value = true;
        }
      });
    }
  }

  private async getPeriodePaieByRestaurant(uuidRestaurant: any) {
    const data = await this.validationPaieService.getCurrentPeriodePaieByRestaurant(uuidRestaurant).toPromise();
    if (data) {
      this.startPeriod = data[0];
      this.endPeriod = data[1];
      setTimeout(() => {
        this.notificationService.stopLoader();
      }, 500);
    }

  }

  public async restaurantVerificationBeforeSave() {
    if (this.verifSave()) {
      return false;
    }
    let uuidProfil;
    const idParam = {...this.parametreEnvoi};
    if (this.sessionService.getProfil() === 'superviseur') {
      uuidProfil = this.profilSelectionne.uuid;
    } else {
      uuidProfil = this.sessionService.getUuidProfil();
    }
    const uuidRestaurant = this.selectedRestaurants.map(resto => {
      return resto.uuid;
    });
    try {
      this.notificationService.startLoader();

      await this.envoyerService.restaurantVerification(uuidRestaurant, uuidProfil).toPromise();
      const finalParams = this.prepareBeforeSaveParamEnvoi(uuidProfil);
      try {
        const parametre = await this.envoyerService.planifier(finalParams).toPromise();
        this.parametreEnvoi = parametre;
      } catch (e) {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate
        ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_NON_ENREGISTRE'), '');
      }

      this.notificationService.stopLoader();
      if (idParam.idParamEnvoi === '') {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate
        ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_ENREGISTRE'), '');
      } else {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate
        ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_MODIFIER'), '');
      }
      setTimeout(() => this.navigateAway.next(true), 1500);
    } catch (e) {
      this.showPopup = true;
      this.notificationService.stopLoader();
    }

  }

  public async saveParametreWithNewResturant() {
    this.notificationService.startLoader();
    let uuidProfil;
    if (this.sessionService.getProfil() === 'superviseur') {
      uuidProfil = this.profilSelectionne.uuid;
    } else {
      uuidProfil = this.sessionService.getUuidProfil();
    }
    const finalParams = this.prepareBeforeSaveParamEnvoi(uuidProfil);

    try {
      const parametre = await this.envoyerService.planifier(finalParams).toPromise();
      this.parametreEnvoi = parametre;
      const checkNewParametre = finalParams.idParamEnvoi;


      await this.envoyerService.persistConfirmation(finalParams.listRestaurantDispaly, uuidProfil).toPromise();
      this.closePopup();
      this.notificationService.stopLoader();
      if (checkNewParametre === '') {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate
        ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_ENREGISTRE'), '');
      } else {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate
        ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_MODIFIER'), '');
      }
      setTimeout(() => this.navigateAway.next(true), 1500);
    } catch (e) {
      this.notificationService.stopLoader();
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate
      ('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PARAMETE_PAIE_NON_ENREGISTRE'), '');
      this.closePopup();
    }
  }

  public prepareBeforeSaveParamEnvoi(uuidProfil: string) {
    const finalParams = {...this.parametreEnvoi};
    finalParams.typePeriodeCalcul = null;
    finalParams.year = '';
    finalParams.scheduledTime = moment(moment('1970-01-01' + ' ' + '08:00').toDate()).format('HH:mm:ss');
    finalParams.dayDelivery = null;
    finalParams.frequenceExpedition = 'VALIDATION';
    finalParams.receiver = this.formatReceiverForSend();
    finalParams.rapportPaieEnum = [];
    this.reportList.forEach(el => {
      if (el.value) {
        finalParams.rapportPaieEnum.push(el.code);
      }
    });

    finalParams.endDate = new Date(this.endPeriod);
    finalParams.startDate = new Date(this.startPeriod);
    finalParams.uuidCreateur = this.sessionService.getUuidUser();
    finalParams.uuidProfil = uuidProfil;


    const message = document.getElementById('textemail') as HTMLElement;
    const children: HTMLCollectionOf<any> = message ? message.children : null;
    if (children && children.length) {
      finalParams.message = '';
      for (let i = 0; i < children.length; i++) {
        if (children[i].className === 'placeholder') {
          finalParams.message += this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER') + ' ';
        } else {
          finalParams.message += children[i].innerText;
        }
      }
    }

    this.saveChanges(finalParams);
    return finalParams;
  }

  public verifSave(): boolean {
    let selectedRapport: any[];
    selectedRapport = this.reportList.filter(repo => repo.value);
    if (this.errorReceiver || selectedRapport.length === 0 || !this.parametreEnvoi.objectMail) {
      return true;
    }
    return false;
  }

  public closePopup() {
    this.showPopup = false;
  }

  initObjetMailAndMessage() {
    if (this.parametreEnvoi) {
      this.parametreEnvoi.objectMail = '';
      this.parametreEnvoi.message = '';
      const datePipe = new DatePipe('en-US');
      let dateRange = '';
      const message = [];

      dateRange = datePipe.transform(this.startPeriod, 'dd-MM-yyyy') + ' au '
        + datePipe.transform(this.endPeriod, 'dd-MM-yyyy');

      this.parametreEnvoi.objectMail = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LE_RAPPORT_PAIE_OBJECT') + dateRange;
      message[0] = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CI-JOINT_LE_RAPPORT_PAIE_BEFORE_PLACEHOLDER');


      message[1] = ' ' + this.addRestaurantsNamesToMessage() + ' ';
      message[2] = ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Pour_la_periode_du') + ' ';
      message[3] = dateRange + '.';
      message[4] = '\nMyRhis';
      message.forEach(messagePart => this.parametreEnvoi.message += messagePart);
      //  this.placeHolderMessage = this.parametreEnvoi.message;
    }
  }

  addRestaurantsNamesToMessage(): string {
    return this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER');
  }

  validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    }
    return false;
  }

  getListReciever() {
    if (this.selectedRestaurants.length) {
      const list: EntityUuidModel[] = [];
      this.selectedRestaurants.forEach((val: any) => {
          if (val.uuid) {
            list.unshift(val.uuid);
          }
        }
      );
      this.envoyerService.getListReciever(list).subscribe(data => {
        this.listReceiver = data;
      }, error => console.log(error));
    }
  }


  verifierEmailsReceivers() {
    this.errorReceiver = false;
    this.selectedReceivers.forEach(elm => {
      if (!this.validateEmail(elm.email)) {
        this.errorReceiver = true;
      }
    });
  }

  selectReceiver(value) {
    let email = value.split('( ')[1];
    email = email.split(' )')[0];
    let duplique = false;
    this.selectedReceivers.pop();
    this.selectedReceivers.forEach(elm => {
      if (elm.email.toLowerCase() === email.toLowerCase()) {
        duplique = true;
      }
    });
    if (!duplique) {
      this.listReceiver.forEach(el => {
        if (el.email.toLowerCase() === email.toLowerCase()) {
          this.selectedReceivers.push(el);
        }
      });
    }
  }

  addReceiverByEmail(event) {
    if (event.code === 'Enter' && this.emailWriter !== '') {
      this.selectedReceivers.push({uuid: null, nom: null, prenom: null, email: this.emailWriter});
      this.emailWriter = '';
      event.path[0].value = '';
      if (!this.validateEmail(this.selectedReceivers[this.selectedReceivers.length - 1].email)) {
        this.errorReceiver = true;
        const nodeReceiverList = document.getElementsByClassName('ui-autocomplete-multiple-container ui-widget ui-inputtext ui-state-default ui-corner-all ng-star-inserted');
        setTimeout(() => {
          nodeReceiverList[0].children[nodeReceiverList[0].children.length - 2].setAttribute('style', 'background:#fd5c5c');
        }, 500);
      }
    }
  }

  // permet la recherche dans la liste des utilisateurs des restaurant selectionnes
  filterReceiver(event) {

    const filtered: any[] = [];
    const query = event.query;
    this.emailWriter = event.query;
    if (this.listReceiver.length > 0) {
      this.listReceiver.forEach(el => {
        if (el.nom.toLowerCase().indexOf(query.toLowerCase()) >= 0 || el.prenom.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          filtered.push(`${el.prenom} ${el.nom} ( ${el.email} )`);
        }
      });
    }
    this.filteredReceiver = filtered;
  }

  formatReceiverForSend() {
    const list = [];
    this.selectedReceivers.forEach(el => {
      const uuid = el.uuid === null ? '' : el.uuid;
      const nom = el.nom === null ? '' : el.nom;
      const prenom = el.prenom === null ? '' : el.prenom;
      const email = el.email === null ? '' : el.email;
      list.push(`${uuid},${nom},${prenom},${email}`);
    });
    return list;
  }

  private initMessageText() {
    const divMessage = document.getElementById('divMessage') as HTMLElement;
    divMessage.innerHTML = '';

    const textMail = document.createElement('span');
    textMail.setAttribute('id', 'textemail');
    divMessage.append(textMail);
    textMail.innerHTML = '';
  };

  public async getParamEnvoiByProfil(): Promise<void> {
    this.initMessageText();
    this.parametreEnvoi = this.parametresharedService.getParametreRapportInitializer();
    const param = await this.envoyerService.getParametreEnvoiByUuidProfilForFranchiseUser(this.profilSelectionne.uuid).toPromise();
    this.notificationService.startLoader();
    if (param) {
      this.parametresharedService.initParametreRapport();
      this.parametreEnvoi = param;
      this.parametresharedService.setParametreRapport(param);
      if (this.parametreEnvoi) {
        this.selectedReceivers = this.parametreEnvoi.receiver;
        this.reportList.forEach(rapport => {
          rapport.value = this.parametreEnvoi.rapportPaieEnum.includes(rapport.code);
        });

      }
    } else {
      this.selectedReceivers = [];
      this.reportList.map(report => report.value = false);
      this.parametresharedService.initParametreRapport();
      this.parametreEnvoi = this.parametresharedService.getParametreRapportInitializer();
      this.parametreEnvoi.idParamEnvoi = '';
    }

    this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByProfil(this.profilSelectionne.uuid).subscribe((list: any) => {
      let restoList = list.content;
      //    this.selectedRestaurants = list.content;
      restoList.sort((resto1: any, resto2: any) => {
        return resto1.libelleRestaurant.localeCompare(resto2.libelleRestaurant);
      });
      this.getPeriodePaieByRestaurant(restoList[0].uuid).then(next => {
        if (!param) {
          setTimeout(() => {
            this.initObjetMailAndMessage();
          }, 150);

        }
        this.getListReciever();
        setTimeout(() => {
          this.selectedRestaurants = restoList;
          const uuidRestaurant = this.selectedRestaurants.map(resto => {
            return resto.uuid;
          });
          this.parametreEnvoi.listRestaurantDispaly = [...uuidRestaurant];
          this.saveChanges(null);
          this.notificationService.stopLoader();
        }, 300);

      });
    });
  }

  /**
   * save new changes
   */
  saveChanges(finalParams): void {
    const message = document.getElementById('divMessage') as HTMLElement;
    if (finalParams) {
      this.firstObjectForSaveChanges = finalParams.objectMail;
      this.messageForSaveChanges = message.innerText;
    } else {
      this.firstObjectForSaveChanges = this.parametreEnvoi.objectMail;
      this.messageForSaveChanges = message.innerText;
    }

    this.reportListForSaveChanges = JSON.stringify(this.reportList);
    this.selectedRecieverSaveChanges = JSON.stringify(this.selectedReceivers);


  }

  hasChanged(): boolean {
    const message = document.getElementById('divMessage') as HTMLElement;
    return this.firstObjectForSaveChanges !== this.parametreEnvoi.objectMail ||
      this.reportListForSaveChanges !== JSON.stringify(this.reportList) || this.selectedRecieverSaveChanges !== JSON.stringify(this.selectedReceivers)
      || this.messageForSaveChanges !== message.innerText;
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    if (this.hasChanged()) {
      this.parametrValidationPaieNotChanged = false;
    } else {
      this.parametrValidationPaieNotChanged = true;
    }
    return this.parametrValidationPaieNotChanged;
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
        this.restaurantVerificationBeforeSave();
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }
}
