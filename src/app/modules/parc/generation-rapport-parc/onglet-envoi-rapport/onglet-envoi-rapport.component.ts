import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {SharedService} from '../../services/shared.service';
import {ParametreRapport} from '../../../../shared/model/parametreRapport';
import {EnvoiService} from '../../services/envoi.service';
import {ReceiverGUI} from '../../../../shared/model/gui/ReceiverGUI.model';
import * as moment from 'moment';
import {ParamNationauxService} from '../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {NotificationService} from '../../../../shared/service/notification.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'rhis-onglet-envoi-rapport',
  templateUrl: './onglet-envoi-rapport.component.html',
  styleUrls: ['./onglet-envoi-rapport.component.scss'],
})
export class OngletEnvoiRapportComponent implements OnInit, OnChanges {
  public frequenceOptions = [];
  selectedReceivers: ReceiverGUI[] = [];
  listReceiver: ReceiverGUI[] = [];
  filteredReceiver = [];
  errorReceiver = false;
  envoiRecurrent: Boolean = false;
  parametreEnvoi: ParametreRapport;
  emailWriter = '';
  heuresPlanifieList = [];
  frequenceExpedition: any = '';
  public initParamPage = false;
  listRestaurantSelectionne: any = [];
  @Input() public libelleRapport: string;
  @Input() public uuidRapport: string;
  @Input() public idRapport: string;
  @Input() public envoiParams: any;
  @Input() public rapportCodeName: string;

  constructor(private parametresharedService: SharedService,
              private rhisTranslateService: RhisTranslateService, private envoyerService: EnvoiService,
              private paramNationauxService: ParamNationauxService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.parametresharedService.getParametreRapport().subscribe(data => {
      this.parametreEnvoi = data;
      this.selectedReceivers.push(...data.receiver);
      this.getListReciever();
      this.initFrequeceExpeditionOptions();
      this.initParametreNationauxOnInit();
    });
    this.parametresharedService.listRestaurantSelectionne$.subscribe(data => {
      if (!this.initParamPage) {
        this.listRestaurantSelectionne = data;
        this.initObjetMailAndMessage();
      }
    });
    if (this.initParamPage) {
      this.parametreEnvoi.objectMail = this.envoiParams.objectMail;
      this.parametreEnvoi.message = this.envoiParams.message;
      this.parametreEnvoi.scheduledTime = this.envoiParams.scheduledTime;
      this.parametreEnvoi.frequenceExpedition = this.envoiParams.frequenceExpedition;
      this.parametreEnvoi.idParamEnvoi = this.envoiParams.idParamEnvoi;
      this.getListReciever();
      this.selectedReceivers = this.envoiParams.receiver;
    }
    this.initFrequeceExpedition();
    this.initScheduledTime();
    this.initHeurePlanifierList();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.envoiParams && changes.envoiParams.currentValue) {
      this.envoiRecurrent = true;
      this.initParamPage = true;
    }
  }

  initObjetMailAndMessage() {
    if (this.parametreEnvoi.rapport) {
      this.parametreEnvoi.objectMail = '';
      this.parametreEnvoi.message = '';
      const datePipe = new DatePipe('en-US');
      let dateRange = '';
      const message = [];
      if (this.parametreEnvoi.rapport.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
        dateRange = datePipe.transform(this.parametreEnvoi.startDate, 'dd-MM-yyyy') + ' au '
          + datePipe.transform(this.parametreEnvoi.endDate, 'dd-MM-yyyy');
        this.parametreEnvoi.objectMail = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.RAPPORT') + ' ' +
          this.parametreEnvoi.rapport.libelleFile.toLowerCase()
          + ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.DU') + ' '
          + dateRange;
        message[0] = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CI-JOINT_LE_RAPPORT') + ' ' +
          this.parametreEnvoi.rapport.libelleFile.toLowerCase();
      }
      if (this.parametreEnvoi.rapport.codeName === 'PERFORMANCE_RAPPORT') {
        message[0] = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CI-JOINT_LE_RAPPORT') + ' '
          + this.rhisTranslateService.translate('Acceuil.performances').toLowerCase();
        switch (this.parametreEnvoi.typePeriodeCalcul) {
          case 'JOUR' :
            dateRange = datePipe.transform(this.parametreEnvoi.startDate, 'dd-MM-yyyy') + ' ' +
              this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.AU') + ' '
              + datePipe.transform(this.parametreEnvoi.endDate, 'dd-MM-yyyy');
            break;
          case 'SEMAINE' :
            // datedebut de la semaine  S -4
            const week_4 = moment(this.parametreEnvoi.startDate).add(-28, 'days').toDate();
            dateRange = datePipe.transform(week_4, 'dd-MM-yyyy') + ' ' +
              this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.AU') + ' '
              + datePipe.transform(this.parametreEnvoi.endDate, 'dd-MM-yyyy');
            break;
          case 'MOIS' :
            dateRange = this.parametreEnvoi.year;

        }
        this.parametreEnvoi.objectMail = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.RAPPORT')
          + ' ' + this.rhisTranslateService.translate('Acceuil.performances').toLowerCase() + ' ' +
          this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.DU') + ' '
          + dateRange;
      }
      if (this.parametreEnvoi.rapport.codeName === 'POSTES_TRAVAIL_RAPPORT') {
        dateRange = this.parametreEnvoi.typePeriodeCalcul === 'SEMAINE' ? datePipe.transform(this.parametreEnvoi.startDate, 'dd-MM-yyyy') + ' ' + this.rhisTranslateService.translate('GESTION_PAIE_PARC.PERIODE_TO') + ' '
          + datePipe.transform(this.parametreEnvoi.endDate, 'dd-MM-yyyy') : datePipe.transform(this.parametreEnvoi.startDate, 'dd-MM-yyyy');

        this.parametreEnvoi.objectMail = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.RAPPORT_POSTE_TRAVAIL_OBJECT') + ' ' +
          dateRange;
        message[0] = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CI-JOINT_LE_RAPPORT_POSTE_TRAVAIL') + ' ';
      }

      if (this.parametreEnvoi.rapport.codeName !== 'POSTES_TRAVAIL_RAPPORT') {
        message[1] = this.listRestaurantSelectionne.length > 1 ?
          ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Des_restaurants_de') + ' ' :
          ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Du_restaurant') + ' ';
        message[2] = this.addRestaurantsNamesToMessage();
        message[3] = ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Pour_la_periode_du') + ' ';
        message[4] = dateRange;
        message.forEach(messagePart => this.parametreEnvoi.message += messagePart);
      } else {
        message[1] = this.listRestaurantSelectionne.length > 1 ?
          ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Des_restaurants_de') + ' ' :
          ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Du_restaurant') + ' ';
        message[2] = this.addRestaurantsNamesToMessage();

        message[3] = this.parametreEnvoi.typePeriodeCalcul === 'SEMAINE' ? ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.MESSAGE_SEMAINE_RAPPORT_POSTE_TRAVAIL') + ' ' :
          ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.MESSAGE_JOUR_RAPPORT_POSTE_TRAVAIL') + ' ';
        message[4] = dateRange;
        message[5] = '.\nMyRhis';
        message.forEach(messagePart => this.parametreEnvoi.message += messagePart);
      }


    } else {
      this.parametreEnvoi.objectMail = '';
      this.parametreEnvoi.message = '';
    }
  }

  addRestaurantsNamesToMessage(): string {

    if (this.parametreEnvoi.listRestaurantDispaly.length > 0) {
      const list = [];
      this.listRestaurantSelectionne.forEach(restaurant => list.push(restaurant.libelleRestaurant));
      if (list.length === 1) {
        return list[0];
      } else {
        let names = '';
        list.forEach((name, index) => {
          if (index + 1 === list.length) {
            names += ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER_MORE_RESTO') + ' ' + name;
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

  initScheduledTime() {
    if (this.parametreEnvoi.scheduledTime === null) {
      this.parametreEnvoi.scheduledTime = moment('1970-01-01' + ' ' + '08:00').toDate();
    } else {
      this.parametreEnvoi.scheduledTime = moment('1970-01-01' + ' ' + this.parametreEnvoi.scheduledTime).toDate();
    }
  }

  initFrequeceExpeditionOptions() {
    if (this.parametreEnvoi.rapport === null) {
      this.frequenceOptions = [
        {label: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_Quotidienne'), value: 'QUOTIDIENNE'},
        {label: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_Hebdomadaire'), value: 'HEBDOMADAIRE'},
        {label: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_Mensuel'), value: 'MENSUEL'}
      ];
    }

    if (this.parametreEnvoi.rapport !== null && this.parametreEnvoi.rapport.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
      this.frequenceOptions = [
        {label: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_Hebdomadaire'), value: 'HEBDOMADAIRE'},
        {label: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_Mensuel'), value: 'MENSUEL'}
      ];
    }

  }

  initFrequeceExpedition() {
    switch (this.parametreEnvoi.frequenceExpedition) {
      case 'QUOTIDIENNE' :
        this.parametreEnvoi.frequenceExpedition = this.frequenceOptions[0];
        this.frequenceExpedition = this.frequenceOptions[0].value;
        break;
      case 'HEBDOMADAIRE' :
        this.parametreEnvoi.frequenceExpedition = this.frequenceOptions[1];
        this.initParametreNationaux();
        this.frequenceExpedition = this.frequenceOptions[1].value;
        break;
      case 'MENSUEL' :
        this.parametreEnvoi.frequenceExpedition = this.frequenceOptions[2];
        this.frequenceExpedition = this.frequenceOptions[2].value;
        break;
      default:
        this.parametreEnvoi.frequenceExpedition = this.frequenceOptions[0];
        this.frequenceExpedition = this.frequenceOptions[0].value;
    }
  }

  initParametreNationaux() {
    this.paramNationauxService.getParamNationauxByRestaurantUuid(this.parametreEnvoi.listRestaurantDispaly[0]).subscribe(data => {
      this.parametreEnvoi.dayDelivery = data.premierJourSemaine;
      this.updateParametre();
    });

  }

  initParametreNationauxOnInit() {
    if (this.parametreEnvoi.listRestaurantDispaly.length > 0) {
      this.paramNationauxService.getParamNationauxByRestaurantUuid(this.parametreEnvoi.listRestaurantDispaly[0]).subscribe(data => {
        this.parametreEnvoi.dayDelivery = data.premierJourSemaine;
      });
    }
  }

  initHeurePlanifierList() {
    const date = '1970-01-01';
    const time = '00:00';
    const start = moment(date + ' ' + time);
    for (let i = 0; i < 24; i++) {
      this.heuresPlanifieList.push(moment(start).add(i, 'hours').toDate());
    }
  }

  updateParametre() {
    this.parametresharedService.setParametreRapport(this.parametreEnvoi);
    this.verifierAvantEnvoi();
  }

  validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    }
    return false;
  }

  getListReciever() {
    this.envoyerService.getListReciever(this.parametreEnvoi.listRestaurantDispaly).subscribe(data => {
      this.listReceiver = data;
    }, error => console.log(error));
  }

  changeFrequence(event) {
    this.frequenceExpedition = event.value.value;
    if (this.frequenceExpedition === 'HEBDOMADAIRE') {
      this.initParametreNationaux();
    } else {
      this.parametreEnvoi.dayDelivery = null;
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
    if (this.parametreEnvoi.objectMail == null || this.parametreEnvoi.objectMail === '') {
      return true;
    }
    if (this.errorReceiver || this.selectedReceivers.length === 0) {
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

  planifier() {
    const finalParams = {...this.parametreEnvoi};
    console.log(finalParams);
    finalParams.receiver = this.formatReceiverForSend();
    finalParams.frequenceExpedition = this.frequenceExpedition;
    if (this.parametreEnvoi.rapport.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT' && finalParams.frequenceExpedition === 'QUOTIDIENNE') {
      finalParams.frequenceExpedition = 'HEBDOMADAIRE';
    }
    if (finalParams.frequenceExpedition !== 'HEBDOMADAIRE') {
      finalParams.dayDelivery = null;
    }
    if (this.parametreEnvoi.rapport.codeName === 'POSTES_TRAVAIL_RAPPORT') {
      if (finalParams.typePeriodeCalcul === 'JOUR') {
        finalParams.frequenceExpedition = 'QUOTIDIENNE';
      } else {
        finalParams.frequenceExpedition = 'HEBDOMADAIRE';
        this.initParametreNationaux();
        finalParams.dayDelivery = this.parametreEnvoi.dayDelivery;
      }
    }
    finalParams.scheduledTime = moment(finalParams.scheduledTime).format('HH:mm:ss');
    this.envoyerService.planifier(finalParams).subscribe(data => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.PLANIFIER'), '');
    }, error => console.log(error));

  }

  envoyer() {
    const finalParams = {...this.parametreEnvoi};
    finalParams.receiver = this.formatReceiverForSend();
    finalParams.frequenceExpedition = null;
    finalParams.scheduledTime = null;
    finalParams.dayDelivery = '';
    this.envoyerService.envoyer(finalParams, this.rhisTranslateService.currentLang).subscribe(data => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.ENVOYE'), '');
    }, error => console.log(error));
  }
}
