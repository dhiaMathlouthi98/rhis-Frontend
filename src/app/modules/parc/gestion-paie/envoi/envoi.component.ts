import {AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ReceiverGUI} from '../../../../shared/model/gui/ReceiverGUI.model';
import {RapportPaieEnum} from '../../../../shared/model/parametreRapport';
import {SharedService} from '../../services/shared.service';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {EnvoiService} from '../../services/envoi.service';
import {ParamNationauxService} from '../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {NotificationService} from '../../../../shared/service/notification.service';
import {DatePipe} from '@angular/common';
import {
  EnvoiMailForRestaurants,
  FranchiseRestaurant,
  RapportsPaieRestaurants
} from '../../../../shared/model/gui/parc.mode';
import {ValidationPaieService} from '../../../home/gdh/service/validation-paie.service';
import {DateService} from '../../../../shared/service/date.service';
import {EntityUuidModel} from '../../../../shared/model/entityUuid.model';
import {GenerateFilesService} from '../../../../shared/service/generate.files.service';

@Component({
  selector: 'rhis-envoi',
  templateUrl: './envoi.component.html',
  styleUrls: ['./envoi.component.scss']
})
export class EnvoiComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  selectedReceivers: ReceiverGUI[] = [];
  listReceiver: ReceiverGUI[] = [];
  filteredReceiver = [];
  errorReceiver = false;
  parametreEnvoi: any;
  emailWriter = '';
  public initParamPage = false;
  listRestaurantSelectionne: any = [];

  @Input() set setStartPeriod(val) {
    this.startPeriod = val;
    this.initObjetMailAndMessage();
  }

  public startPeriod: string;

  @Input() set setEndPeriod(val) {
    this.endPeriod = val;
    this.initObjetMailAndMessage();
  }

  public endPeriod: string;
  private startDate: string;
  private endDate: string;
  @Input() public envoiParams: any;
  @Input()
  public restaurants: FranchiseRestaurant[];
  public selectedRestaurants: FranchiseRestaurant[];
  public validatedRestaurants: FranchiseRestaurant[];
  public nonValidatedRestaurants: FranchiseRestaurant[];
  public displayedRestaurants: FranchiseRestaurant[];
  public isAllRestaurantSelected = false;
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

  constructor(private parametresharedService: SharedService,
              private rhisTranslateService: RhisTranslateService,
              private envoyerService: EnvoiService,
              private paramNationauxService: ParamNationauxService,
              private notificationService: NotificationService,
              private validationPaieService: ValidationPaieService,
              private dateService: DateService,
              private generateFilesService: GenerateFilesService) {
  }

  ngOnInit() {
    this.parametresharedService.getParametreRapport().subscribe(data => {
      this.parametreEnvoi = data;
      this.selectedReceivers.push(...data.receiver);
    });
  }

  ngOnDestroy() {
    this.parametresharedService.initParametreRapport();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.envoiParams && changes.envoiParams.currentValue) {
      this.initParamPage = true;
    }
    if (changes.restaurants) {
      const restaurants: FranchiseRestaurant[] = changes.restaurants.currentValue;
      if (restaurants && restaurants.length && this.startPeriod && this.endPeriod) {
        this.startDate = this.startPeriod.split('-').reverse().join('-');
        this.endDate = this.endPeriod.split('-').reverse().join('-');
        const ids = this.restaurants.map(restaurant => restaurant.idRestaurant);
        this.validationPaieService.getValidatedRestaurants(this.startDate, this.endDate, ids).subscribe((validations) => {
          restaurants.forEach(restaurant => {
            const index = validations.findIndex((validation) => validation.id.restaurant.idRestaurant === restaurant.idRestaurant);
            restaurant.validated = index !== -1;
          });
          this.validatedRestaurants = restaurants.filter(restaurant => restaurant.validated);
          this.nonValidatedRestaurants = restaurants.filter(restaurant => !restaurant.validated);
          this.displayedRestaurants = [];
          if (this.validatedRestaurants.length) {
            this.validatedRestaurants = [{
              idRestaurant: -1,
              libelle: this.rhisTranslateService.translate('GESTION_PAIE_PARC.VALIDATE_RESTAURANTS_PAIE')
            }].concat(this.validatedRestaurants);
            this.displayedRestaurants = this.displayedRestaurants.concat(this.validatedRestaurants);
          }
          if (this.nonValidatedRestaurants.length) {
            this.nonValidatedRestaurants = [{
              idRestaurant: -2,
              libelle: this.rhisTranslateService.translate('GESTION_PAIE_PARC.NON_VALIDATED_RESTAURANT_PAIE')
            }].concat(this.nonValidatedRestaurants);
            this.displayedRestaurants = this.displayedRestaurants.concat(this.nonValidatedRestaurants);
          }
        });

      }
    }
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
      message[0] = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CI-JOINT_LE_RAPPORT_PAIE');


      message[1] = this.addRestaurantsNamesToMessage();
      message[2] = ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Pour_la_periode_du') + ' ';
      message[3] = dateRange + '.';
      message[4] = '\nMyRhis';
      message.forEach(messagePart => this.parametreEnvoi.message += messagePart);

    }
  }

  addRestaurantsNamesToMessage(): string {

    if (this.selectedRestaurants && this.selectedRestaurants.length > 0) {
      const list = [];
      this.selectedRestaurants.forEach(restaurant => list.push(restaurant.libelle));
      if (list.length === 1) {
        return list[0];
      } else {
        let names = '';
        list.forEach((name, index) => {
          if (index + 1 === list.length) {
            names += ' et ' + name;
          }
          if (index === 0) {
            names += name;
          }
          if (index !== 0 && index + 1 !== list.length) {
            names += ', ' + name;
          }
        });
        return names;
      }
    }
    return '';
  }

  validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    }
    return false;
  }

  getListReciever() {
    if (this.selectedRestaurants.length) {
      this.initObjetMailAndMessage();
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

  verifierAvantEnvoi() {
    let selectedRapport: any[];
    selectedRapport = this.reportList.filter(repo => repo.value);
    if (this.selectedReceivers.length === 0 || this.errorReceiver || selectedRapport.length === 0) {
      return true;
    }
    if (this.selectedRestaurants && this.selectedRestaurants.length === 0) {
      return true;
    }
    return false;
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


  public envoyer(): void {
    const codes = this.reportList.filter(report => report.value).map(report => report.code);
    const restaurants = this.selectedRestaurants ? this.selectedRestaurants.filter(restaurant => ![-1, -2].includes(restaurant.idRestaurant)) : [];
    const finalParams: any = {};
    if (codes.length > 0 && restaurants.length > 0) {
      const config: RapportsPaieRestaurants = {
        restaurants,
        codes,
        language: this.rhisTranslateService.currentLang,
        endDate: this.endDate,
        startDate: this.startDate,
        employeeReportFilter: this.generateFilesService.getFieldsToPrint(false)
      };
      const mailConfig: EnvoiMailForRestaurants = {
        rapportsPaieRestaurants: config,
        mailConfig: {
          recievers: this.formatReceiverForSend(),
          objet: this.parametreEnvoi.objectMail,
          message: this.parametreEnvoi.message
        }
      };
      this.prepareEnvoi(mailConfig);
    }
  }

  private prepareEnvoi(config: EnvoiMailForRestaurants): void {
    this.notificationService.startLoader();
    this.envoyerService.envoiMailForRestaurantPaieReportsForPeriod(config).subscribe(data => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.ENVOYE'), '');
      this.notificationService.stopLoader();
    }, error => this.notificationService.stopLoader());
  }

  updateList() {
    this.selectedRestaurants = this.displayedRestaurants;
    this.getListReciever();
  }

  public setSelectedRestaurants($event): void {
    if ($event.itemValue) {
      const idRestaurant = $event.itemValue.idRestaurant;
      if (idRestaurant == -1) {
        if (this.checkExistInById($event.value, -1)) {
          this.selectedRestaurants = this.addAllTo(this.validatedRestaurants, this.selectedRestaurants);
        } else {
          this.selectedRestaurants = this.removeListFrom(this.validatedRestaurants, this.selectedRestaurants);
          this.isAllRestaurantSelected = false;
        }
      } else if (idRestaurant == -2) {
        if (this.checkExistInById($event.value, -2)) {
          this.selectedRestaurants = this.addAllTo(this.nonValidatedRestaurants, this.selectedRestaurants);
        } else {
          this.selectedRestaurants = this.removeListFrom(this.nonValidatedRestaurants, this.selectedRestaurants);
          this.isAllRestaurantSelected = false;
        }
      } else {
        const isSelectedRestaurantValidated = this.checkExistInById(this.validatedRestaurants, idRestaurant);
        if (isSelectedRestaurantValidated) {
          if (this.checkExistInById($event.value, idRestaurant)) {
            this.selectedRestaurants = this.addAllIfLastOne(this.validatedRestaurants, this.selectedRestaurants, idRestaurant, -1);
          } else {
            this.selectedRestaurants = this.selectedRestaurants.filter(restaurant => restaurant.idRestaurant !== -1);
            this.isAllRestaurantSelected = false;
          }
        } else {
          if (this.checkExistInById($event.value, idRestaurant)) {
            this.selectedRestaurants = this.addAllIfLastOne(this.nonValidatedRestaurants, this.selectedRestaurants, idRestaurant, -2);
          } else {
            this.selectedRestaurants = this.selectedRestaurants.filter(restaurant => restaurant.idRestaurant !== -2);
            this.isAllRestaurantSelected = false;
          }
        }
      }

      this.getListReciever();
    }
    if (this.selectedRestaurants.length == this.restaurants.length + 2) {
      this.isAllRestaurantSelected = true;
      this.getListReciever();
    }
    this.removeToolTipInMultiSelection();
  }

  public checkOption(id: number): boolean {
    return [-1, -2].includes(id);
  }

  public getSelectedOptions(options: FranchiseRestaurant[], translator: RhisTranslateService): string {
    if ((options == null) || (options.length == 0)) {
      return translator.translate('GESTION_PARC_RAPPORT.CHOOSE');
    } else {
      const validatedOptions = options.filter(option => ![-1, -2].includes(option.idRestaurant));
      if (validatedOptions.length < 4) {
        const listRestaurantsAsPhrase = validatedOptions.map(option => option.libelle).reduce((phrase, libelle) => phrase + ', ' + libelle, '');
        return listRestaurantsAsPhrase.substr(1, listRestaurantsAsPhrase.length - 1);
      } else {
        return validatedOptions.length + ' ' + translator.translate('GESTION_PARC_RAPPORT.SELECTED_RESTAURANTS');
      }
    }
  }

  private checkExistInById(restaurants: FranchiseRestaurant[], id: number): boolean {
    return restaurants.filter(item => item.idRestaurant == id).length > 0;
  }

  private removeListFrom(restaurantsToBeRemoved: FranchiseRestaurant[], restaurants: FranchiseRestaurant[]): FranchiseRestaurant[] {
    const restaurantsIdsToBeRemoved = restaurantsToBeRemoved.map(restaurant => restaurant.idRestaurant);
    return restaurants.filter(restaurant => !restaurantsIdsToBeRemoved.includes(restaurant.idRestaurant));
  }

  private addAllTo(restaurantsWantedToAdd: FranchiseRestaurant[], restaurants: FranchiseRestaurant[]): FranchiseRestaurant[] {
    const allRestaurantsIds = restaurants.map(restaurant => restaurant.idRestaurant);
    return restaurants.concat(restaurantsWantedToAdd.filter(restaurant => !allRestaurantsIds.includes(restaurant.idRestaurant)));
  }

  private addAllIfLastOne(toBeAllAdded: FranchiseRestaurant[], restaurants: FranchiseRestaurant[], idRestaurant: number, titleId: number): FranchiseRestaurant[] {
    const title: FranchiseRestaurant = toBeAllAdded.find(restaurant => restaurant.idRestaurant == titleId);
    const isItLastOne: boolean = toBeAllAdded.filter(restaurant => ![titleId, idRestaurant].includes(restaurant.idRestaurant)).every(
      restaurant => restaurants.filter(r => r.idRestaurant === restaurant.idRestaurant).length > 0
    );
    if (isItLastOne) {
      restaurants.push(title);
    }
    return restaurants;
  }

  ngAfterViewInit(): void {
    this.removeToolTipInMultiSelection();
  }

  private async removeToolTipInMultiSelection(): Promise<void> {
    await this.dateService.delay(1000);
    const item = document.getElementById('choice-header');
    if (item) {
      item.parentElement.parentElement.removeAttribute('title');
    }
  }

}
