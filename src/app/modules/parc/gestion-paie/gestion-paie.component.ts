import {Component, OnInit} from '@angular/core';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {DateService} from 'src/app/shared/service/date.service';
import {DatePipe} from '@angular/common';
import {SessionService} from 'src/app/shared/service/session.service';
import {RestaurantService} from 'src/app/shared/service/restaurant.service';
import {ValidationPaieService} from '../../home/gdh/service/validation-paie.service';
import {ValidationPeriodPaie} from 'src/app/shared/model/validationPeriodePaie';
import {PeriodePaieRestaurantService} from '../../home/configuration/service/periode.paie.restaurant.service';
import {DomControlService} from '../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-gestion-paie',
  templateUrl: './gestion-paie.component.html',
  styleUrls: ['./gestion-paie.component.scss']
})

export class GestionPaieComponent implements OnInit {
  public dateCalender: any;
  public cols: any[];
  public selectedDate: any;
  public startDate: any;
  public selectedPeriod: string;
  public calendar_fr: any;
  public firstDayAsInteger = 1;
  public frConfig: any;
  public listRestaurant = [];
  public listRestaurantHasDifferentPeriod = [];
  public firstRestaurant: any;
  public premierJourDeLaSemaine = 'LUNDI';
  public selectedPeriodFrom: string;
  public selectedPeriodTo: string;
  public nbRestoValide = 0;
  public nbRestoNonValide = 0;
  public maxDateValue: any;
  public samePeriodPaie: boolean;
  public listRestaurantNonValide: any[];
  public ecran = 'VPP';
  public disableValidation = false;
  public activeIndex = 0;

  constructor(private translateService: RhisTranslateService,
              private datePipe: DatePipe, private restaurantService: RestaurantService,
              private validationPaieService: ValidationPaieService,
              private dateService: DateService,
              private sessionService: SessionService, private periodePaieRestaurantService: PeriodePaieRestaurantService,
              private domControlService: DomControlService) {
  }

  public controlAffichageOngletValidation(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  async ngOnInit() {
    this.getPeriodPaieWithRestaurant(true);
    this.dateCalender = null;
    this.initCalender();
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    this.cols = [
      {field: 'libelle'},
      {field: 'dateValidtion'}
    ];
  }

  private getListValidatedRestaurants(restaurantIds: number[]): void {
    this.validationPaieService.getValidatedRestaurants(this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy'), this.datePipe.transform(this.selectedPeriodTo, 'dd-MM-yyyy'), restaurantIds).subscribe((result: ValidationPeriodPaie[]) => {
      this.nbRestoValide = result.length;
      this.nbRestoNonValide = this.listRestaurant.length - result.length;
      this.filterRestaurants(this.listRestaurant, result);
    }, error => {
      console.log(error);
    });
  }

  private filterRestaurants(totalRestaurants: any[], validatedRestaurants: ValidationPeriodPaie[]): void {
    totalRestaurants.forEach((restaurant: any) => {
      const validation = validatedRestaurants.find((validResto: ValidationPeriodPaie) => validResto.id.restaurant.idRestaurant === restaurant.idRestaurant);
      if (validation) {
        restaurant.dateValidation = new Date(validation.validationTime);
      }
    });
    this.listRestaurantNonValide = totalRestaurants.filter((resto: any) => !resto.hasOwnProperty('dateValidation'));
  }

  private getListRestaurants() {
    this.listRestaurant.sort((resto1: any, resto2: any) => {
      return resto1.libelle.localeCompare(resto2.libelle);
    });
    this.firstRestaurant = this.listRestaurant[0];
    let restaurantsIds = [];
    this.listRestaurant.forEach((resto: any) => restaurantsIds.push(resto.idRestaurant));
    this.getListValidatedRestaurants(restaurantsIds);
    this.getRestaurantInformation();
  }

  private getRestaurantInformation(): void {
    this.restaurantService.getRestaurantById(this.firstRestaurant.uuid).subscribe(
      (data: RestaurantModel) => {
        this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(data.parametreNationaux.premierJourSemaine);
        this.premierJourDeLaSemaine = data.parametreNationaux.premierJourSemaine;
      }
    );
  }

  private initCalender() {
    this.calendar_fr = {
      closeText: 'Fermer',
      prevText: 'Précédent',
      nextText: 'Suivant',
      currentText: 'Aujourd\'hui',
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
        'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      weekHeader: '',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }

  private updateDatePaye() {
    this.getPeriodPaieWithRestaurant();
  }

  public nextPeriod(): void {
    const date = this.getDateDebut(this.selectedPeriodTo, true);
    date.setDate(date.getDate() + 1);
    if (date < this.maxDateValue) {
      this.dateCalender = date;
      this.updateDatePaye();
    }
  }

  public previousPeriod(): void {
    const date = this.getDateDebut(this.selectedPeriodFrom, true);
    date.setDate(date.getDate() - 1);
    this.dateCalender = date;
    this.updateDatePaye();
  }

  public selectDate(event: any): void {
    this.dateCalender = event;
    this.updateDatePaye();
  }

  /**
   * recuperer l'user uuid connecté ou franchise
   */
  private getUuidFranchiseOrUser(): any {
    let uuidFranchiseOrUser;
    let isFranchise: number;

    if (this.sessionService.getProfil() === 'administrateur') {
      uuidFranchiseOrUser = this.sessionService.getUuidUser();
      isFranchise = 2;
    }
    if (this.sessionService.getProfil() === 'franchise') {
      uuidFranchiseOrUser = this.sessionService.getUuidUser();
      isFranchise = 0;
    }
    if (this.sessionService.getUuidFranchise()) {
      uuidFranchiseOrUser = this.sessionService.getUuidFranchise();
      isFranchise = 1;
    }
    {
      return {
        uuidFranchiseOrUser: uuidFranchiseOrUser,
        isFranchise: isFranchise
      };
    }

  }

  /**
   * recuperer les restaurants par la période
   */
  private getPeriodPaieWithRestaurant(maxDateFirstInit?: boolean) {
    this.listRestaurantHasDifferentPeriod = [];
    const franchiseOrUser = this.getUuidFranchiseOrUser();

    this.periodePaieRestaurantService.getMapPeriodPaieWithResaurant(franchiseOrUser.uuidFranchiseOrUser, this.dateCalender, franchiseOrUser.isFranchise).subscribe((data: any) => {
      this.listRestaurant = [];
      this.selectedPeriod = this.getPeriode(Object.keys(data)[0], maxDateFirstInit);
      if (data) {
        this.samePeriodPaie = new Map(Object.entries(data)).size === 1 ? true : false;
        (Object.keys(data)).forEach(periodeOfRestaurant => {
          this.listRestaurantHasDifferentPeriod.push(
            {
              name: this.getHeaderOfPeriode(periodeOfRestaurant, data[periodeOfRestaurant].length),
              label: this.getLibelleOfRestaurant(data[periodeOfRestaurant]),
              size: data[periodeOfRestaurant].length,
              periodPaie: periodeOfRestaurant,
              dateDebut: this.getDateDebut(periodeOfRestaurant, false),
            }
          );
          this.listRestaurant = this.listRestaurant.concat(data[periodeOfRestaurant]);
        });

        if (!this.samePeriodPaie) {
          this.listRestaurantHasDifferentPeriod.sort((resto1: any, resto2: any) => {
            return resto1.label.localeCompare(resto2.label);
          });
          // recuperer la période du pérmier restaurant par ordre alphabétique
          this.selectedPeriod = this.getPeriode(this.listRestaurantHasDifferentPeriod[0].periodPaie);
          this.startDate = this.getDateDebut(this.listRestaurantHasDifferentPeriod[0].periodPaie, false);

          this.listRestaurantHasDifferentPeriod.sort((resto1: any, resto2: any) =>
            (resto1.size < resto2.size) ? 1 : (resto1.size > resto2.size) ? -1 : (resto2.dateDebut < resto1.dateDebut) ? 1 : -1);
        } else {
          this.startDate = this.getDateDebut(Object.keys(data)[0], false);
          this.getListRestaurants();
        }
      }
    });

  }

  /**
   * recupere le titre de periode paie pour afficher dans l 'accordian
   * @param periodeOfRestaurant
   * @private
   */
  private getHeaderOfPeriode(periodeOfRestaurant: string, sizeOfPeridPaie: number): string {
    let periodPaie = periodeOfRestaurant.substring(1, periodeOfRestaurant.length - 1);
    const periodPaieList: string[] = periodPaie.split(',');
    periodPaie = this.translateService.translate('GESTION_PAIE_PARC.PERIOD_PAIE') + ' ' + this.dateService.formatDate(periodPaieList[0]) + ' ' + this.translateService.translate('GESTION_PAIE_PARC.PERIODE_TO') + ' ' +
      this.dateService.formatDate(periodPaieList[1]);
    return periodPaie;
  }

  private getLibelleOfRestaurant(listOfRestaurant: any) {
    const listLabelOfRestaurant: string [] = [];
    listOfRestaurant.sort((resto1: any, resto2: any) => {
      return resto1.libelle.localeCompare(resto2.libelle);
    });
    listOfRestaurant.forEach((value: any) => {
      listLabelOfRestaurant.push(value.libelle + ' ');
    });
    return listLabelOfRestaurant.join('|');
  }

  /**
   * recupere la periode du chaque restaurant
   * @param periodeOfRestaurant
   * @private
   */
  private getPeriode(periodeOfRestaurant: string, maxDateFirstInit?: boolean): string {
    let periodPaie = periodeOfRestaurant.substring(1, periodeOfRestaurant.length - 1);
    [this.selectedPeriodFrom, this.selectedPeriodTo] = periodPaie.split(',');
    this.selectedPeriodTo = this.selectedPeriodTo.trim();
    if (maxDateFirstInit) {
      this.maxDateValue = new Date(this.selectedPeriodTo);
    }
    const periodPaieList: string[] = periodPaie.split(',');
    periodPaie = this.dateService.formatDate(periodPaieList[0]) + ' - ' + this.dateService.formatDate(periodPaieList[1]);
    return periodPaie;
  }

  /**
   * recuper date debut de periode selectionée
   * @param periodeOfRestaurant
   * @private
   */
  private getDateDebut(periodeOfRestaurant: string, selectCalendrier: boolean): Date {
    let periodPaie = periodeOfRestaurant.substring(1, periodeOfRestaurant.length - 1);
    let periodPaieList: string[];
    if (selectCalendrier) {
      periodPaie = this.datePipe.transform(periodeOfRestaurant, 'yyyy/MM/dd');
    } else {
      periodPaieList = periodPaie.split(',');
      periodPaie = periodPaieList[0];
    }
    return new Date(periodPaie);

  }

  public disableValidationAndGoToGenerationTab(tab: { isActive: boolean, index: number }): void {
    this.disableValidation = !tab.isActive;
    this.activeIndex = tab.index;
  }
}
