import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EmployeeService} from '../../service/employee.service';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {ContratService} from '../../service/contrat.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {ContratModel} from '../../../../../shared/model/contrat.model';
import * as moment from 'moment';
import {DateService} from '../../../../../shared/service/date.service';
import {ContratPrimaryModel} from '../../../../../shared/model/contrat.primary.model';
import {GroupeTravailService} from '../../../configuration/service/groupe-travail.service';
import {TypeContratService} from '../../../configuration/service/type.contrat.service';
import {GroupeTravailModel} from '../../../../../shared/model/groupeTravail.model';
import {TypeContratModel} from '../../../../../shared/model/type.contrat.model';
import {RepartitionTimeModel} from '../../../../../shared/model/repartition.time.model';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {ParametreModel} from '../../../../../shared/model/parametre.model';
import {RepartitionModel} from '../../../../../shared/model/repartition.model';
import {RestaurantService} from '../../../../../shared/service/restaurant.service';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {DisponibiliteModel} from '../../../../../shared/model/disponibilite.model';
import {Observable, Subject} from 'rxjs';
import {MotifSortieService} from '../../../configuration/service/motifSortie.service';
import {LoiRestaurantService} from '../../../../../shared/module/restaurant/service/loi.restaurant.service';
import {DecoupageHoraireService} from '../../../planning/configuration/service/decoupage.horaire.service';
import {DecoupageHoraireModel} from '../../../../../shared/model/decoupage.horaire.model';
import {DisponibiliteConfigModel} from '../../../../../shared/model/disponibilite-config.model';
import {ContratUtilitiesService} from '../../service/contrat-utilities.service';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {NationaliteService} from '../../../configuration/service/nationalite.service';
import {NationaliteModel} from '../../../../../shared/model/nationalite.model';
import {Sexe} from '../../../../../shared/enumeration/Sexe.model';
import {JourDisponibiliteService} from '../../service/jour-disponibilite.service';
import {BadgeService} from '../../service/badge.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {ScrollToBlockService} from '../../../../../shared/service/scroll-to-block.service';
import {ParametersTempsMaxDispoEnum} from '../../../../../shared/enumeration/ParametersTempsMaxDispo.enum';
import * as rfdc from 'rfdc';
import {DPAEStateEnum, DpaeStatut} from '../../../../../shared/model/gui/dpae.model';
import {DpaeService} from '../../service/dpae.service';

@Component({
  selector: 'rhis-contrats',
  templateUrl: './contrats.component.html',
  styleUrls: ['./contrats.component.scss']
})
export class ContratsComponent implements AfterViewInit, OnInit {
  private idEmployee: string;
  public dateFinPeriodEssai: any;
  public listContrat: ContratModel[] = [];
  public listGroupTravail: GroupeTravailModel[] = [];
  public listTypeContrat: TypeContratModel[] = [];
  public listmotifSorties = [];
  public listContratDisplay: ContratModel[] = [];
  public contratActif: any;
  public header: string;
  public newContrat = {} as ContratModel;
  public avenantUpdate = {} as ContratModel;
  public newAvenantHidden = false;
  public contratUpdate = {} as ContratModel;
  // contrat par default lors de clique sur le button annuler
  public contratDefault = {} as ContratModel;
  // les info principal de contrat
  public contratInfo = {} as ContratModel;
  // le repatition de contrat
  public contratRepartition = {} as ContratModel;
  // les autre s informatios du contrat tel que hebdo le temps partiel l compl le taux horaire ,le mens
  public contratTime = {} as ContratModel;
  // verification que la somme de repartition doit egal la valeur hebdo de contrat
  public istotalHeuresEquals = true;
  // verification les chmaps qui sont obligatoire
  public dateConstraints = true;
  public isSubmitSave = false;
  public employee;
  // pour conserver le contrat qui a des avenants
  public contratAvenantDefault = {} as ContratModel;
  public employeeDefault = {} as EmployeeModel;
  public selectNewEmployee = false;
  public openHours: { day: string, isNight: boolean, value: string }[] = [];
  public closeHours: { day: string, isNight: boolean, value: string }[] = [];
  // FIXME
  public daysValueLable = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  public disponibiliteConfig: DisponibiliteConfigModel = {} as DisponibiliteConfigModel;
  private adultAge: number;
  public nbrHeuresSections = [
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.HEBDO'), formControlName: 'hebdo'},
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.MENS'), formControlName: 'mens'},
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.ANNEE'), formControlName: 'annee'},
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.TX_HORAIRE'), formControlName: 'txHoraire'},
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.SALAIRE'), formControlName: 'salaire'},
    {sectionTitle: this.rhisTranslateService.translate('CONTRAT.%Compl'), formControlName: 'compt'}
  ];
  public RepartitionSections = [
    {sectionTitle: this.rhisTranslateService.translate('DAYS.MONDAY'), formControlName: 'valeurLundi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.TUESDAY'), formControlName: 'valeurMardi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.WEDNESDAY'), formControlName: 'valeurMercredi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.THURSDAY'), formControlName: 'valeurJeudi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.FRIDAY'), formControlName: 'valeurVendredi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.SATURDAY'), formControlName: 'valeurSamedi'},
    {sectionTitle: this.rhisTranslateService.translate('DAYS.SUNDAY'), formControlName: 'valeurDimanche'}
  ];
  public nbrHeuresTitle = this.rhisTranslateService.translate('CONTRAT.NBR_HEURES');
  public totalHebdoTitle = this.rhisTranslateService.translate('CONTRAT.TOTAL_HEBDO');
  public actionTitle = this.rhisTranslateService.translate('CONTRAT.NOUVEAU_CONTRAT');
  public popUpStyle = {
    height: 400,
    width: 720
  };
  /**
   * variable for controlling the display of popup add/edit "discipline"
   */
  public clone = rfdc();

  public showPopUp = false;
  // verification que l contrat ext existe ou nn
  public contratExist = false;
  public displayPopup = false;
  public newContratHidden = false;
  public txHoraireGroupeTravail = 0;
  public totalRepartition: number;
  // pour calculer le nbr de jours travaillés
  public totalDays: number;
  public compl: string;
  public restaurant = {} as RestaurantModel;
  public avenantUpdateId;
  // list des avenant par defaut
  public avenantContratInit;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  // popup list motif sortie
  public popupVisibility;
  public motifSortie;
  // id de contrat pour desactiver
  public idOfDisactifContrat;
  public secondModifiedContrat;
  public presenceDirecteur = false;
  public popupAddBadgeToEmployee = false;
  public popupUpdateDateFinContrat = false;
  public badge;
  public listBadge;
  public presenceBadge = false;
  public presenceMotifSorite = false;
  public presenceDateFin = false;
  public contrat: Object;
  public canSaveContrat = false;
  public arrondiContratMensuel = 0;
  public ouvrableParama = false;
  public contratAfterChoseBadge = {} as ContratModel;
  public datefin;
  public datefinCDI: Date;
  public dateEffectifCDI: Date;
  public ecran = 'GDC';
  // pour afficher le calendrier en cas  de desactivation de contrat CDI
  // cdd -> false
  // cdi-> true
  public dateFinDisplay = false;
  public paramMonthWeek = false;
  private setcontratInActif = false;

  // dpae
  public dpaeStatut = {} as DpaeStatut;
  public popupVisibilityDPAE = false;
  public pop_up_dape_title = '';
  public popUpStyleDPAE = {
    height: 700,
    width: 450
  };
  public DPAE_PARAMETRE = 'DPAE';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dateService: DateService,
              private contratService: ContratService,
              private employeeService: EmployeeService,
              private sharedEmployee: SharedEmployeeService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private  groupeTravailService: GroupeTravailService,
              private typeContratService: TypeContratService,
              private confirmationService: ConfirmationService,
              private parametreGlobalService: ParametreGlobalService,
              private restaurantService: RestaurantService,
              private sharedRestaurant: SharedRestaurantService,
              private nationaliteService: NationaliteService,
              private decoupageHoraireService: DecoupageHoraireService,
              private motifSortieService: MotifSortieService,
              private loiRestaurantService: LoiRestaurantService,
              private contratUtilitiesService: ContratUtilitiesService,
              private jourDisponibiliteService: JourDisponibiliteService,
              private badgeService: BadgeService,
              private domControlService: DomControlService,
              private scrollToBlockService: ScrollToBlockService,
              private dpaeService: DpaeService) {
    this.route.parent.params.subscribe(params => {
      this.idEmployee = params.idEmployee;
      this.getInfoEmployees();
    });
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation.extras.state && currentNavigation.extras.state.addContrat) {
      this.addNewContrat();
    }
  }
  ngOnInit() {
    this.contratUtilitiesService.getAvenantParam().subscribe(entrepriseParamValue => {
      this.setNewAvenantContratOrUpdateAvenantInListContrat(entrepriseParamValue);
    });
  }


  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /*
     recuperations lalist de badge disponible par restaurant
     */
  private getlistBadge() {
    this.badgeService.getAllBadgeDisponible().subscribe(
      (data: any) => {
        if (data != null) {
          this.listBadge = data.sort((a, b) => +a.code - b.code);
          this.popupAddBadgeToEmployee = true;
          if (this.employee.idEmployee && this.employee.badge) {
            this.listBadge.push(this.employee.badge);
          }
        }

      },
      (err: any) => {
        console.log('Erreure au niveau de la liste badge');
      }
    );
  }

  /**
   * enregister contrat apres tous les vérifications
   */
  public async saveNewContratAfterVerification(): Promise<void> {
    try {
      const data = await
        this.contratService.persistContrat(this.newContrat, this.arrondiContratMensuel).toPromise();
        if(!this.sharedEmployee.selectedEmployee.dateEntree){
          this.sharedEmployee.selectedEmployee.dateEntree = this.newContrat.dateEffective;
        }
     await this.setNewContratAfterSave(data);
      if (this.badge) {
        this.sharedEmployee.selectedEmployee.badge = this.badge;
        this.popupAddBadgeToEmployee = false;
        // check for DPAE
        if (await this.checkParametreDPAE()) {
          this.notificationService.startLoader();
          this.dpaeService.checkStatut(this.sharedEmployee.selectedEmployee.uuid).subscribe((data: DpaeStatut) => {
            this.dpaeStatut = data;
            this.notificationService.stopLoader();
            this.showDPAE_popup();
          });
        }
      }


    } catch (err) {
      this.canSaveContrat = false;
      if (err.error === 'RHIS_CONTRAT_IS_EXIST') {
        this.newContrat.contratExistInfoPrimary = true;
        this.listContratDisplay.forEach((contratDisplay: any, index: number) => {
          if (contratDisplay.idContrat === this.newContrat.idContrat) {
            this.listContratDisplay[index].contratExistInfoPrimary = true;
          }
        });
      } else if (this.contratUpdate.idContrat) {
        this.setErrorInAccordionOfnewContrat();
      }
    }
  }

  /**
   * verification si l'employee a un badge ou nn
   * ajouter un badge a l 'employee ayant un contrat actif ou  un contrat futur
   */
  public async checkEmployeeHasBadgeAndSaveContrat(): Promise<void> {
    this.presenceBadge = false;
    if (this.badge) {
      if ((this.newContrat.groupeTravail || this.newContrat.duplicateContrat)) {
        this.newContrat.employee.badge = this.badge;
        await this.saveNewContratAfterVerification();

      } else {
        this.contratUpdate.employee.badge = this.badge;
        this.afterVerificationUpdateContrat(this.contratAfterChoseBadge);
      }
    } else {
      this.presenceBadge = true;
    }
  }

  /**
   * Récupérer debut journee phase
   */
  private getDebutJourneePhase(): void {
    this.decoupageHoraireService.getDebutJourneePhase().subscribe(
      (startDecoupageHoraire: DecoupageHoraireModel) => {
        this.createDaysHours(startDecoupageHoraire, this.openHours);
        this.openHours.sort((firstHour, secondHour) => {
          if (firstHour.isNight && (!secondHour.isNight)) {
            return 1;
          } else if (secondHour.isNight && (!firstHour.isNight)) {
            return -1;
          } else {
            return this.getMinutes(firstHour.value) - this.getMinutes(secondHour.value);
          }
        });
        this.disponibiliteConfig = {
          ...this.disponibiliteConfig,
          openHour: this.getTime(this.openHours[0].value)
        } as DisponibiliteConfigModel;
      },
      (err: any) => {
        console.log(err);
      });
  }

  private createDaysHours(decoupageHoraire: DecoupageHoraireModel,
                          phaseHours: { day: string, isNight: boolean, value: string }[]): void {
    this.daysValueLable.forEach((day: string) => {
      const dayValue = {} as { day: string, isNight: boolean, value: string };
      dayValue.day = day;
      dayValue.isNight = decoupageHoraire['valeur' + day + 'IsNight'];
      dayValue.value = decoupageHoraire['valeur' + day];
      phaseHours.push(dayValue);
    });
  }

  /**
   * Récupérer fin journee phase
   */
  private getFinJourneePhase(): void {
    this.decoupageHoraireService.getFinJourneePhase().subscribe(
      (endDecoupageHoraire: DecoupageHoraireModel) => {
        this.createDaysHours(endDecoupageHoraire, this.closeHours);
        this.closeHours.sort((firstHour: { day: string, isNight: boolean, value: string },
                              secondHour: { day: string, isNight: boolean, value: string }) => {
          if (firstHour.isNight && (!secondHour.isNight)) {
            return -1;
          } else if (secondHour.isNight && (!firstHour.isNight)) {
            return 1;
          } else {
            return this.getMinutes(secondHour.value) - this.getMinutes(firstHour.value);
          }
        });
        this.disponibiliteConfig = {
          ...this.disponibiliteConfig,
          closeHour: this.getTime(this.closeHours[0].value)
        } as DisponibiliteConfigModel;
      },
      (err: any) => {
        console.log(err);
      });
  }

  /**
   * Récupérer min shift
   */
  private getMinShift() {
    this.loiRestaurantService.getOneByCodeName('LONGUEUR_MINI_SHIFT').subscribe(data => {
      this.disponibiliteConfig = {
        ...this.disponibiliteConfig,
        minShift: (this.getAge(this.employee.dateNaissance) < this.adultAge) ? data.valeurMineurTempsPlein : data.valeurMajeurTempsPlein
      } as DisponibiliteConfigModel;
    });
  }

  /**
   * Calculate age by birthday date
   * @param: DOB
   */
  private getAge(DOB: string): number {
    const today = new Date();
    const birthDate = new Date(DOB);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age = age - 1;
    }
    return age;
  }

  ngAfterViewInit() {
    this.scrollTo('.first-avenant');
  }

  /**
   * scroll to an element
   * @param: target
   */
  private scrollTo(target: string) {
    setTimeout(function () {
      const activAvenant = document.querySelector(target);
      if (activAvenant) {
        activAvenant.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }, 700);
  }

  /**
   * dupliquer : ouvrir la fenêtre contrat avec un nouveau contrat contenant
   * les infos du dernier contrat,ou un nouveau contrat la date de début égal à aujourd'hui
   * et pas de date de finL'utilisateur-restaurant ne veut pas dupliquer
   * ouvrir la fenêtre contrat de l'employé avec un nouveau contrat
   * vide sauf la date de début égal à aujourd'hui.
   */
  public setDuplicateContratInnewContrat() {
    this.employee = this.sharedEmployee.selectedEmployee;
    if (this.employee.contrats && this.employee.contrats.length) {
      this.newContrat = {...this.employee.contrats[0]};
      this.sharedEmployee.selectedEmployee.contrats = null;
      this.newContrat.header = this.rhisTranslateService.translate('CONTRAT.EN_COURS');
      this.newContrat.istotalHeuresEquals = true;
      this.newContrat.updateContratBoolean = false;
      this.newContrat.selectedAccordion = true;
      this.newContrat.duplicateContrat = true;
      this.newContrat.compt = this.compl;
      this.newContratHidden = true;
      this.setContratPrimary(this.newContrat);
      this.setRepartitionAndTime(this.newContrat);

      this.listContratDisplay.unshift(this.newContrat);
    }

  }

  /**
   * Get Employee when we reload page and the sahred one is gone
   * Then fetch employee by id
   */
  private setEmploye() {
    this.employee = this.sharedEmployee.selectedEmployee;
    this.employeeDefault = this.clone(this.sharedEmployee.selectedEmployee);
    if (!this.sharedEmployee.selectedEmployee) {
      this.getEmployeByIdWithBadge();
    } else {
      this.getListContratByEmployeWithoutContratActif();
    }
  }

  /**
   * recuperation de la liste des motif de sorties
   */
  public getListMotifSortie() {
    this.motifSortieService.getAllMoyenTransportActive().subscribe(
      (data: any) => {
        this.listmotifSorties = data;
      }, error => {
        // TODO gestion erreur
        console.log(error);
      }
    );
  }

  /**
   * Get Employee with badge by id
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.idEmployee).subscribe(
      (employe: EmployeeModel) => {
        this.sharedEmployee.selectedEmployee = employe;
        this.employeeDefault = this.clone(this.sharedEmployee.selectedEmployee);
        this.idEmployee = employe.uuid;
        this.employee = employe;
        this.getMinShift();
      },
      (err: any) => {
      }, () => this.getListContratByEmployeWithoutContratActif()
    );
  }

  /**
   * recuperation du  contrat actif de l employe
   */
  getContratActif() {
    this.listContratDisplay = [];
    if (this.sharedEmployee.selectedEmployee.statut) {
      this.contratService.getActifContratByEmployee(new Date(), this.idEmployee).subscribe(
        (data: ContratModel) => {
          if (data != null) {
            data.istotalHeuresEquals = true;
            this.setContratOrAvenantActifInListContrat(data);

          }
        }
      );
    } else {
      this.listContratDisplay = this.listContrat;
      this.setDuplicateContratInnewContrat();
    }

  }

  /**
   * recuperation des contrats non  actifs de l employe
   */
  getListContratByEmployeWithoutContratActif() {
    this.contratService.getListContratByEmployeWithoutContratActif(new Date(), this.idEmployee).subscribe(
      (data: ContratModel[]) => {
        if (data != null) {
          this.listContrat = data;
          this.displayHeaderOfPagination();
          this.getMinShift();
        }
      }, error => {
        console.log(error);
      }, () => this.getContratActif()
    );

  }

  /**
   * Get restaurant first day and create week days list
   */
  private setWeekDays() {
    const firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.restaurant.parametreNationaux.premierJourSemaine);
    this.disponibiliteConfig.weekDays = [];
    for (let i = 0; i < 7; i++) {
      this.disponibiliteConfig.weekDays.push({
        day: this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+firstDayAsInteger + i) % 7)),
        val: this.dateService.getJourSemaineFromInteger((+firstDayAsInteger + i) % 7)
      });
    }
  }

  /**
   * Transform a string format('__:__') to another ('__h__')
   * @param: time
   */
  private getTime(time: string): string {
    return time.split(':', 2).join('h');
  }

  /**
   * Get minutes from a string
   * @param: time
   */
  private getMinutes(time: string): number {
    const parts = time.split(':', 2);
    return (+parts[0] * 60) + (+parts[1]);
  }

  /**
   * display header of paginatation
   */
  private displayHeaderOfPagination() {
    this.listContrat.forEach((contrat, index) => {
      if (contrat.datefin) {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
          + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
          this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
      } else {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
          + ' ' + this.dateService.formatDate(contrat.dateEffective);
      }
    });
  }

  /**
   * add contrat actif in list contrat
   */
  private setContratOrAvenantActifInListContrat(data: ContratModel) {
    this.contratActif = data;
    this.contratActif.selectedAccordion = true;
    this.setContratPrimary(data);
    this.setRepartitionAndTime(data);
    this.contratActif.txHoraireGroupeTravail = data.txHoraire;
    this.contratActif.header = this.rhisTranslateService.translate('CONTRAT.EN_COURS');
    if (this.contratActif.avenantContrats) {
      if (this.contratActif.datefin) {
        this.contratActif.datefin = new Date(this.contratActif.datefin);
      }
      this.contratActif.dateEffective = new Date(this.contratActif.dateEffective);
      this.setAvenantContratInListContrat(this.contratActif);
    }
    this.listContratDisplay.push(this.contratActif);
    if (this.listContrat.length >= 1) {
      this.listContratDisplay.push(...this.listContrat);
    }
    this.setDateFinPeriodeToContrat(this.contratActif);
  }

  /**
   * get full contart(groupe travail,type contra, disponiblite,repartition)
   * @param :contrat
   * @param: event
   */
  public getFullContrat(contrat: ContratModel, event) {
    if (contrat.idContrat) {
      if (this.contratActif) {
        if (event === true && contrat.idContrat !== this.contratActif.idContrat && !contrat.repartition) {
          this.getFullContratByContraId(contrat);
        }
      } else {
        if (event === true && !contrat.repartition) {
          this.getFullContratByContraId(contrat);
        }
      }
      if (event === true && contrat.repartition) {
        this.setDateFinPeriodeToContrat(contrat);
      }
    }
  }

  /**la date de fin de période d'essai qui dépendra du paramètre dure de la période d’essai en jours pour le groupe de travail.
   * @param contrat
   */
  private setDateFinPeriodeToContrat(contrat: ContratModel): void {
    this.dateFinPeriodEssai = '';
    if (contrat.groupeTravail.dureePeriodEssai > 0) {
      let listContratPeriodEssai = this.clone(this.listContratDisplay);
      listContratPeriodEssai = this.sortlistContratPeriodEssai(listContratPeriodEssai);
      listContratPeriodEssai.forEach((contratDisplay, index) => {
        let dateDebut = this.clone(contrat.dateEffective);
        dateDebut = moment(dateDebut).subtract(1, 'days').toDate();
        if (contrat.idContrat === contratDisplay.idContrat && (!listContratPeriodEssai[index + 1]
          || !(listContratPeriodEssai[index + 1] && listContratPeriodEssai[index + 1].datefin
            && moment(this.dateService.setTimeNull(dateDebut)).isSame(this.dateService.setTimeNull(listContratPeriodEssai[index + 1].datefin))))) {
          this.dateFinPeriodEssai = moment(contrat.dateEffective).add(contrat.groupeTravail.dureePeriodEssai, 'months').toDate();
          this.dateFinPeriodEssai = this.rhisTranslateService.translate('CONTRAT.MESSAGE_FIN_ESSAI')
            + ' ' + this.dateService.formatToShortDate(this.dateFinPeriodEssai, '/');
        }
      });
    }
  }

  private sortlistContratPeriodEssai(listContratPeriodEssai: any): any {
    if (listContratPeriodEssai) {
      listContratPeriodEssai.sort((contrat1, contrat2): number => {
        if (new Date(contrat1.dateEffective) < new Date(contrat2.dateEffective)) {
          return 1;
        }
        if (new Date(contrat1.dateEffective) > new Date(contrat2.dateEffective)) {
          return -1;
        }
      });
    }
    return listContratPeriodEssai;
  }

  /**
   * get full contrat
   * @param: contrat
   */
  public getFullContratByContraId(contrat) {
    this.contratService.getFullContratByIdContrat(contrat.uuid).subscribe(
      (data: ContratModel) => {
        if (data != null) {
          if (data.datefin) {
            data.datefin = new Date(data.datefin);
          }
          data.dateEffective = new Date(data.dateEffective);
          data.istotalHeuresEquals = true;
          this.setFullContratListContrat(data);
        }
      }
    );
  }

  /**
   * set full contrat  in list contrat
   * @param: data
   */
  private setFullContratListContrat(data: ContratModel) {
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === data.idContrat) {
        contrat = data;
        this.setAvenantContratInListContrat(contrat);
        this.setContratPrimary(contrat);
        this.setRepartitionAndTime(contrat);
        contrat.txHoraireGroupeTravail = contrat.txHoraire;
        if (contrat.datefin) {
          data.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
            + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
            this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
        } else {
          data.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
            + ' ' + this.dateService.formatDate(contrat.dateEffective);
        }
        data.selectedAccordion = true;
        this.listContratDisplay[index] = data;
      }
    });
    this.setDateFinPeriodeToContrat(data);
  }

  /**
   * set section contrat primary
   * @param: contrat
   */
  private setContratPrimary(contrat: ContratModel) {
    contrat.contratInfoPrimary = {} as ContratPrimaryModel;
    contrat.contratInfoPrimary.employee = {} as EmployeeModel;
    contrat.contratInfoPrimary.dateEffective = new Date(contrat.dateEffective);
    contrat.contratInfoPrimary.level = contrat.level;
    contrat.contratInfoPrimary.echelon = contrat.echelon;
    contrat.contratInfoPrimary.coefficient = contrat.coefficient;
    if (contrat.datefin) {
      contrat.contratInfoPrimary.datefin = new Date(contrat.datefin);
    } else {
      contrat.contratInfoPrimary.datefin = null;
    }
    contrat.contratInfoPrimary.groupeTravail = contrat.groupeTravail;
    contrat.contratInfoPrimary.typeContrat = contrat.typeContrat;
    contrat.contratInfoPrimary.idContrat = contrat.idContrat;
    if (this.contratActif) {
      if (this.contratActif.idContrat === contrat.idContrat) {
        contrat.contratInfoPrimary.actif = contrat.actif;
      }
    } else {
      contrat.contratInfoPrimary.actif = false;
    }
    if (contrat.motifSortie) {
      contrat.contratInfoPrimary.motifSortie = contrat.motifSortie;
    } else {
      contrat.contratInfoPrimary.motifSortie = null;
    }
  }

  /**
   * Cette methode permet de recuperer la liste des groupe de travail actifs par restaurant
   */
  public getAllGroupTravailActifByRestaurant() {
    this.groupeTravailService.getAllGroupTravailActifByRestaurant().subscribe(
      (data: GroupeTravailModel[]) => {
        this.listGroupTravail = data;

      }, (err: any) => {

      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des types contrats actifs par restaurant
   */
  public getAllTypeContratActifByRestaurant() {
    this.typeContratService.getAllTypeContratActifByRestaurant().subscribe(
      (data: TypeContratModel[]) => {
        this.listTypeContrat = data;
      }
    );
  }

  /**
   * set session repartituion
   * @param :contrat
   */
  private setRepartitionAndTime(contrat: ContratModel) {
    contrat.repartitionTime = {} as RepartitionTimeModel;
    contrat.repartitionTime.annee = contrat.annee;
    contrat.repartitionTime.mens = contrat.mens;
    contrat.repartitionTime.compt = contrat.compt;
    contrat.repartitionTime.txHoraire = contrat.txHoraire;
    contrat.repartitionTime.tempsPartiel = contrat.tempsPartiel;
    contrat.repartitionTime.hebdo = contrat.hebdo;
    contrat.repartitionTime.jourReposConsecutifs = contrat.jourReposConsecutifs;
    contrat.repartitionTime.repartition = contrat.repartition;
    contrat.repartitionTime.salaire = contrat.salaire;

  }

  /**
   * add avenant contrat  in list contrat
   * add new avenant in list
   * update avenant to the list
   */
  private setAvenantContratInListContrat(contrat: ContratModel) {
    let avenantActif;
    this.newAvenantHidden = false;
    if (contrat.avenantContrats) {
      contrat.avenantContrats.forEach((avenantDisplay, index) => {
        avenantDisplay.updateContratBoolean = false;
        avenantDisplay.contratExistInfoPrimary = false;
        avenantDisplay.istotalHeuresEquals = true;
        if (this.isActiveAvenant(avenantDisplay)) {
          avenantDisplay.selectedAccordion = true;
          avenantDisplay.updateContratBoolean = false;
          avenantDisplay.contratExistInfoPrimary = false;
          avenantDisplay.istotalHeuresEquals = true;
          avenantDisplay.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_EN_COURS');
          avenantActif = JSON.parse(JSON.stringify(avenantDisplay));
          contrat.avenantContrats.splice(index, 1);
        }
      });
      this.sortListAvenant(contrat);
      if (avenantActif) {
        contrat.avenantContrats.unshift(avenantActif);
      }
      this.avenantContratInit = JSON.parse(JSON.stringify(contrat.avenantContrats));

    }


  }

  /**
   * Check if the `avenant` is active or not
   * @param: avenant
   */
  public isActiveAvenant(avenant): boolean {
    let today = new Date();
    if (avenant.datefin) {
      avenant.datefin = this.dateService.setTimeNull(avenant.datefin);

      avenant.dateEffective = this.dateService.setTimeNull(avenant.dateEffective);
      today = this.dateService.setTimeNull(today);

      return (moment(today).isSameOrAfter(avenant.dateEffective)) &&
        (moment(today).isSameOrBefore(avenant.datefin) && !moment(avenant.dateEffective).isSame(avenant.datefin));
    }
  }

  /**
   * affiche popup des informations principal de contrat
   */
  public addNewContrat() {
    this.newContrat = {} as ContratModel;
    this.presenceDirecteur = false;
    this.newContrat.updateContratBoolean = false;
    this.showPopUp = true;
    this.contratExist = false;
  }
  /**
   * affichage de message de confirmation d'ajouter un contrat actif
   * @param :contrat
   */
  private showConfirmAddActifContrat(contrat) {
      const messageView = this.viewMessageConfirmationOfAddContrat(contrat);
      this.confirmationService.confirm({
        message: messageView,
        header: this.rhisTranslateService.translate('AVENANT_CONTRAT.CONTRAT_ACTIF'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          contrat.istotalHeuresEquals = true;
          contrat.updateContratBoolean = false;
        this.setDateFinOfContratActif(contrat) ;
          },
        reject: () => {
          this.contratExist = true;
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');        }
      });
  }
  /**
   * tester si la contrat actif  qui on va modifier  devient un contrat incatif ou nn
   * modifier le contrat actif
   *
   */
  public setDateFinOfContratActif(contrat: ContratModel) {
    this.contratUpdate = this.clone(this.contratActif);
    this.contratActif = null;
    if (this.contratUpdate.actif) {
      this.contratUpdate.actif = false;
      this.contratUpdate.dateEffective = this.dateService.setTimeNull(this.contratUpdate.dateEffective);
      contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
        this.contratUpdate.datefin = moment(this.contratUpdate.dateEffective).isSame(contrat.dateEffective) ?
        this.clone(contrat.dateEffective) :  moment(contrat.dateEffective).subtract(1, 'days').toDate();
    }
    this.isSubmitSave = true;
    this.canSaveContrat = false;
    this.setContratBeforeSave(this.contratUpdate);
    this.sendContratToBeUpdated(null, contrat);
  }
  private viewMessageConfirmationOfAddContrat(contratDisplay: ContratModel): string {
    let messageView;
    const contrat = JSON.parse(JSON.stringify(this.contratActif));
    contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
    contratDisplay.dateEffective = this.dateService.setTimeNull(contratDisplay.dateEffective);
    contrat.datefin = moment(contrat.dateEffective).isSame(contratDisplay.dateEffective) ?
      contrat.dateEffective :  moment(contratDisplay.dateEffective).subtract(1, 'days').toDate();
      contrat.contratInfoPrimary['datefin'] = new Date(contrat.datefin);
      contrat.contratInfoPrimary['dateEffective'] = new Date(contrat.dateEffective);
      messageView = this.rhisTranslateService.translate('AVENANT_CONTRAT.CONTRAT')
        + ' ' + contrat.typeContrat.libelle + ' ' + this.rhisTranslateService.translate('AVENANT_CONTRAT.DU')
        + ' ' + this.dateService.formatDate(contrat.contratInfoPrimary['dateEffective']) + ' , ' +
        this.rhisTranslateService.translate('AVENANT_CONTRAT.DISACTIVATE_CONTRAT') + ' ' + this.dateService.formatDate(contrat.contratInfoPrimary['datefin']) + '?';

    return messageView;
  }

  /**
   * add contrat in list contrat display apres la verification de contrat existe ou nn
   * @param: contrat
   */
  public addContratInfoPrimary(contrat: ContratModel, fromAddContratActif) {
    if (this.checkContratActif(contrat ) && !fromAddContratActif) {
      this.displayPopup = true;
      this.showConfirmAddActifContrat(contrat);
    }else{
      this.contratService.getPresentConratByDateDebutAndDateFin(contrat.dateEffective, contrat.datefin, this.idEmployee).subscribe(
        (data: any) => {
          contrat.istotalHeuresEquals = true;
          contrat.updateContratBoolean = false;
          this.setNewContratContratInListContratDisplay(contrat);
        }, (err: any) => {
          if (err.error === 'RHIS_CONTRAT_IS_EXIST') {
            this.contratExist = true;
            this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
          }
        }
      );
    }
  }
  private checkContratActif(contrat: ContratModel): boolean{
    let contratActifDisplay = null;
    let listContratInactif = [];
    let checkFoundContrat = false;
    this.listContratDisplay.forEach((item, index) => {
      if (this.contratActif && this.contratActif.idContrat === item.idContrat) {
        contratActifDisplay = item;
      }else if(moment(this.dateService.setTimeNull(item.dateEffective)).isSameOrAfter(this.dateService.setTimeNull(this.contratActif.dateEffective))){
        listContratInactif.push(item);
      }
    });
    if(contratActifDisplay) {
      const checkFoundAvenant = contratActifDisplay.avenantContrats && contratActifDisplay.avenantContrats.length &&
        contratActifDisplay.avenantContrats.some((item: ContratModel) =>
          moment(this.dateService.setTimeNull(item.datefin)).isSameOrAfter(this.dateService.setTimeNull(contrat.dateEffective)));
       checkFoundContrat =  !listContratInactif.length || listContratInactif.some((item: ContratModel) => (contrat.datefin &&
          moment( this.dateService.setTimeNull(contrat.datefin)).isSameOrBefore(this.dateService.setTimeNull(item.dateEffective))) );
      if (!checkFoundAvenant && checkFoundContrat && contratActifDisplay &&
        moment(this.dateService.setTimeNull(contratActifDisplay.dateEffective)).
        isBefore(this.dateService.setTimeNull(contrat.dateEffective)) && ((contratActifDisplay.datefin &&
          moment(this.dateService.setTimeNull(contratActifDisplay.datefin)).
          isSameOrAfter(this.dateService.setTimeNull(contrat.dateEffective))) || !contratActifDisplay.datefin)) {
        return true;
      }
    }
    return  false;

  }
  /**
   * set new contrat in list contrat display
   * @param :contrat
   */
  private setNewContratContratInListContratDisplay(contrat: ContratModel) {
    this.listContratDisplay.forEach((contratDelete, index) => {
      const contratToDelete = JSON.parse(JSON.stringify(contratDelete));
      if (!contratToDelete.idContrat) {
        this.listContratDisplay.splice(index, 1);

      }
    });

    if (contrat.datefin) {
      contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
        + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
        this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
    } else {
      contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
        + ' ' + this.dateService.formatDate(contrat.dateEffective);
    }
    this.setContratPrimary(contrat);
    this.setDisponibilitePrimary(contrat);
    this.newContrat = {...this.newContrat, ...contrat};
    contrat.txHoraireGroupeTravail = contrat.groupeTravail.tauxhoraire;
    contrat.selectedAccordion = true;
    contrat.isNewContrat = true;
    this.listContratDisplay.push(contrat);
    this.sortList();
    // contratActif reste  à la 1ere position
    this.verifyNewContratOrUpdateContratIsActif(contrat);
    this.showPopUp = false;
    this.newContratHidden = true;
    this.presenceDirecteur = false;
    this.setDateFinPeriodeToContrat(contrat);
  }

  /**
   * Initialize disponibilité
   * @param: contrat
   */
  private setDisponibilitePrimary(contrat: ContratModel) {
    const disponibilite = new DisponibiliteModel();
    disponibilite.jourDisponibilites = [];
    contrat.disponibilite = disponibilite;
  }

  /**
   * ordonner la liste des contrat du plus recent au plus encien
   */
  private sortList() {
    if (this.listContratDisplay) {
      this.listContratDisplay.sort((contrat1, contrat2): number => {
        if (new Date(contrat1.dateEffective) < new Date(contrat2.dateEffective)) {
          return 1;
        }
        if (new Date(contrat1.dateEffective) > new Date(contrat2.dateEffective)) {
          return -1;
        }
      });
    }
  }

  /**
   * verify new contrat is actif or update contrat
   * verify contrat is actif or no
   * @param: contrat
   */
  private verifyNewContratOrUpdateContratIsActif(contrat) {
    let dateNow = new Date();
    dateNow = this.dateService.setTimeNull(dateNow);
    if (contrat.typeContrat.dureeDetermine || contrat.datefin) {
      contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
      if (contrat.datefin) {
        contrat.datefin = this.dateService.setTimeNull(contrat.datefin);
      }

      if (moment(contrat.dateEffective).isSameOrBefore(dateNow) && moment(contrat.datefin).isSameOrAfter(dateNow) &&
        moment(contrat.datefin).diff(contrat.dateEffective)) {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.EN_COURS');
        if ((!contrat.typeContrat.dureeDetermine && !contrat.motifSortie) || contrat.typeContrat.dureeDetermine) {
          contrat.motifSortie = null;
          contrat.dateSortie = null;
        }
        this.updateIndexOfContratActifInListContratDisplay(contrat);
        // verificationen cas de modifier un contrat actif
      } else {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
          + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
          this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
        this.updateContratActifInContarInactif(contrat);

      }
    } else {
      contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
      if (moment(contrat.dateEffective).isSameOrBefore(dateNow)) {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.EN_COURS');
        contrat.motifSortie = null;
        contrat.dateSortie = null;
        contrat.datefin = null;
        this.updateIndexOfContratActifInListContratDisplay(contrat);
      } else {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
          + ' ' + this.dateService.formatDate(contrat.dateEffective);
        this.updateContratActifInContarInactif(contrat);
      }
    }
    this.setContratPrimary(contrat);
    this.setRepartitionAndTime(contrat);
  }

  /**
   * set new contrat actif in index 0 of list contrat display
   * @param: contrat
   */
  private updateIndexOfContratActifInListContratDisplay(contrat) {
    const indexOfContraActif = this.listContratDisplay.findIndex(contratDisplay => contratDisplay.dateEffective === contrat.dateEffective);
    this.listContratDisplay.splice(indexOfContraActif, 1);
    if (contrat.idContrat) {
      this.contratActif = contrat;
      this.contratActif.dateEffective = new Date(this.contratActif.dateEffective);
      if (this.contratActif.datefin) {
        this.contratActif.datefin = new Date(this.contratActif.datefin);
      }
    }

    contrat.actif = true;
    this.sharedEmployee.selectedEmployee.statut = true;
    this.listContratDisplay.unshift(contrat);
  }

  /**
   * modifier un contrat actif en ietat inactif
   */
  private updateContratActifInContarInactif(contrat) {
    const indexOfContrat = this.listContratDisplay.findIndex(contratDisplay => contratDisplay.dateEffective === contrat.dateEffective);
    this.listContratDisplay.splice(indexOfContrat, 1);
    contrat.contratInfoPrimary.employee.statut = false;
    contrat.actif = false;
    if (this.contratActif) {
      if (this.contratActif.idContrat) {
        if (this.contratActif.idContrat === contrat.idContrat) {
          this.contratActif = null;
          this.listContratDisplay.push(contrat);
          this.setBadgeOfEmployeeToNull();
          this.sortList();
        } else {
          const indexOfContratActif = this.listContratDisplay.findIndex(contratDisplay => contratDisplay.idContrat === this.contratActif.idContrat);
          this.listContratDisplay.splice(indexOfContratActif, 1);
          this.listContratDisplay.push(contrat);
          this.sortList();
          this.contratActif.selectedAccordion = false;
          this.listContratDisplay.unshift(this.contratActif);
        }
      }
    } else {
      this.listContratDisplay.push(contrat);
      this.sortList();
    }
  }

  /**
   * reset message de erreur pour la  date effectif et date fin pour popup add contrat
   */
  resetErrorMessagesDateEffectifAndDateFin() {
    this.contratExist = false;
  }


  /**
   * reset message de erreur pour la  date effectif et date fin pour info principal
   */
  resetErrorMessagesDateEffectifAndDateFinInfoPrimary(contratId) {
    const index = this.listContratDisplay.findIndex(contratDisplay => contratDisplay.idContrat === contratId);
    this.listContratDisplay[index].contratExistInfoPrimary = false;
  }

  /**
   * recupere total hebdo
   * @param :event
   */
  public calculeTotalHebdo(event) {
    event = +event;
    this.totalRepartition = event.toFixed(2);
  }

  /**
   * recuperation la valeur de compl a partir de parametre  par restaurant
   */
  public getParameterByPram() {
    this.parametreGlobalService.getParametreByRestaurantByParam().subscribe(
      (data: ParametreModel) => {
        this.compl = data.valeur;
      }
    );
  }

  /**
   * recuperation la valeur de month week a partir de parametre  par restaurant
   */
  public getParameterByParamMonthWeek(): void {
    this.parametreGlobalService.getParameterByParamMonthWeek().subscribe(
      (data: ParametreModel) => {
        this.paramMonthWeek = data.valeur === 'true';
      }
    );
  }

  /**
   * recuperation la valeur de arrondi contrat a partir de parametre  par restaurant
   */
  public getArrondiContratSupByRestaurant() {
    this.parametreGlobalService.getArrondiContratSupByRestaurant().subscribe(
      (data: ParametreModel) => {
        if (data.valeur === 'true') {
          this.arrondiContratMensuel = 1;
        }
      }
    );
  }

  /**
   * recuperation  restaurant
   */
  getRestaurant() {
    this.restaurantService.getRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.restaurant = data;
        this.setWeekDays();
        this.getDebutJourneePhase();
        this.getFinJourneePhase();
        this.getAdultAge();
        this.getTempsMaxDispoParams();
      }
    );
  }

  /**
   * Calculate adolescence age
   */
  private getAdultAge() {
    this.nationaliteService.getNationaliteByRestaurant().subscribe((nationalite: NationaliteModel) => {
      if (this.employee.sexe === Sexe.MASCULIN) {
        this.adultAge = nationalite.majeurMasculin;
      }
      if (this.employee.sexe === Sexe.FEMININ) {
        this.adultAge = nationalite.majeurFeminin;
      }
    });
  }

  private async getTempsMaxDispoParams(): Promise<void> {
    const tempsMaxDispoDay = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(ParametersTempsMaxDispoEnum.Day).toPromise();
    const tempsMaxDispoWeek = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(ParametersTempsMaxDispoEnum.Week).toPromise();
    this.disponibiliteConfig = {
      ...this.disponibiliteConfig,
      maxDispoDay: tempsMaxDispoDay.valeur,
      maxDispoWeek: tempsMaxDispoWeek.valeur
    } as DisponibiliteConfigModel;
  }

  /**
   * Envoyer nombre d'heure vers le contrat
   * @param :nbHeure
   */
  public saveNbHeure(contratNbreHeure: ContratModel) {
    if (contratNbreHeure['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === contratNbreHeure['idContrat']) {
          this.contratTime = contratNbreHeure;
          this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          this.contratUpdate = {...this.contratUpdate, ...contratNbreHeure['InfoValue']};
          this.contratUpdate.idContrat = contrat.idContrat;
          if (contratNbreHeure['tempsPartiel'] !== undefined) {
            this.contratUpdate.tempsPartiel = contratNbreHeure['tempsPartiel'];
          }
          // conserver la valeur modifier des info   principal
          if (this.contratInfo['idContrat'] === contratNbreHeure['idContrat']) {
            this.contratUpdate = {...this.contratUpdate, ...this.contratInfo['InfoValue']};
          }
          // conserver la valeur modifier de repartition
          if (this.contratRepartition.repartition) {
            if (this.contratRepartition.repartition['idContrat'] === contratNbreHeure['idContrat']) {
              this.contratUpdate.repartition = this.contratRepartition.repartition['InfoValue'];
            }
          }
          if (((moment(this.dateService.setTimeNull(new Date)).isAfter(this.dateService.setTimeNull(contrat.datefin)) ||
            (moment(this.dateService.setTimeNull(new Date)).isSame(this.dateService.setTimeNull(contrat.datefin))
              && moment(this.dateService.setTimeNull(contrat.dateEffective))
                .isSame(this.dateService.setTimeNull(contrat.datefin)))) || (!contrat.typeContrat.dureeDetermine)) && contrat.motifSortie) {
            this.contratUpdate.motifSortie = contrat.motifSortie;
          } else {
            this.contratUpdate.motifSortie = null;
          }
          this.contratDefault = JSON.parse(JSON.stringify(contrat));
          contrat.updateContratBoolean = true;
        }

      });
      if (this.isSubmitSave) {
        this.contratUpdate.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    } else {
      this.newContrat = {...this.newContrat, ...contratNbreHeure['InfoValue']};
      if (this.isSubmitSave) {
        this.newContrat.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    }
  }

  public getFieldValue(field: string, contrat: ContratModel) {
    let value;
    if (this.newContrat[field] !== undefined) {
      value = this.newContrat[field];
    } else {
      if (this.contratUpdate.idContrat === contrat.idContrat) {
        value = this.contratUpdate[field];
      } else {
        value = contrat[field];
      }
    }
    return value;
  }

  /**
   * Envoyer total hebdo vers le contrat
   * @param: totalHebdo
   */
  public saveRepartition(totalHebdo: RepartitionModel) {
    if (totalHebdo['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === totalHebdo['idContrat']) {
          this.contratRepartition.repartition = totalHebdo;

          this.contratUpdate.idContrat = contrat.idContrat;
          this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          this.contratUpdate.repartition = {...this.contratUpdate.repartition, ...totalHebdo['InfoValue']};
          // conserver la valeur modifier des info   principal
          if (this.contratInfo['idContrat'] === totalHebdo['idContrat']) {
            this.contratUpdate = {...this.contratUpdate, ...this.contratInfo['InfoValue']};
          }
          if (this.contratTime['idContrat'] === totalHebdo['idContrat']) {
            this.contratUpdate = {...this.contratUpdate, ...this.contratTime['InfoValue']};
            if (this.contratTime['tempsPartiel'] !== undefined) {
              this.contratUpdate.tempsPartiel = this.contratTime['tempsPartiel'];
            }
          }
          if (((moment(this.dateService.setTimeNull(new Date)).isAfter(this.dateService.setTimeNull(contrat.datefin)) ||
            (moment(this.dateService.setTimeNull(new Date)).isSame(this.dateService.setTimeNull(contrat.datefin))
              && moment(this.dateService.setTimeNull(contrat.dateEffective))
                .isSame(this.dateService.setTimeNull(contrat.datefin)))) || (!contrat.typeContrat.dureeDetermine)) && contrat.motifSortie) {
            this.contratUpdate.motifSortie = contrat.motifSortie;
          } else {
            this.contratUpdate.motifSortie = null;
          }
          this.contratDefault = JSON.parse(JSON.stringify(contrat));
          contrat.updateContratBoolean = true;
        }
      });
      if (this.isSubmitSave) {
        this.contratUpdate.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
      this.setDateFinPeriodeToContrat(this.contratUpdate);
    } else {
      this.newContrat.repartition = totalHebdo['InfoValue'];
      if (this.isSubmitSave) {
        this.newContrat.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
        this.setDateFinPeriodeToContrat(this.newContrat);
      }
    }

  }

  /**
   * Envoyer total contratInfoPrimary vers le contrat
   * @param: contratInfoPrimary
   */
  public saveInfoPrimary(contratInfoPrimary: ContratModel): void {
    if (contratInfoPrimary['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === contratInfoPrimary['idContrat']) {
          this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          this.contratUpdate.idContrat = contrat.idContrat;
          this.contratInfo = contratInfoPrimary;
          this.contratUpdate = {...this.contratUpdate, ...contratInfoPrimary['InfoValue']};
          if (((moment(this.dateService.setTimeNull(new Date)).isAfter(this.dateService.setTimeNull(contrat.datefin)) ||
            (moment(this.dateService.setTimeNull(new Date)).isSame(this.dateService.setTimeNull(contrat.datefin))
              && moment(this.dateService.setTimeNull(contrat.dateEffective))
                .isSame(this.dateService.setTimeNull(contrat.datefin)))) || (!contrat.typeContrat.dureeDetermine)) && contrat.motifSortie) {
            this.contratUpdate.motifSortie = contrat.motifSortie;
          } else {
            this.contratUpdate.motifSortie = null;
          }

          // conserver la valeur modifier de repartition
          if (this.contratRepartition.repartition) {
            if (this.contratRepartition.repartition['idContrat'] === contratInfoPrimary['idContrat']) {
              this.contratUpdate.repartition = this.contratRepartition.repartition['InfoValue'];
            }
          }
          if (this.contratTime['idContrat'] === contratInfoPrimary['idContrat']) {
            this.contratUpdate = {...this.contratUpdate, ...this.contratTime['InfoValue']};
            if (this.contratTime['tempsPartiel'] !== undefined) {
              this.contratUpdate.tempsPartiel = this.contratTime['tempsPartiel'];
            }
          }
          this.contratDefault = JSON.parse(JSON.stringify(contrat));
          this.contratDefault.dateEffective = new Date(this.contratDefault.dateEffective);
          if (this.contratDefault.datefin) {
            this.contratDefault.datefin = new Date(this.contratDefault.datefin);
          }
          contrat.updateContratBoolean = true;
        }
      });
      this.setDateFinPeriodeToContrat(this.contratUpdate);
    } else {
      this.newContrat = {...this.newContrat, ...contratInfoPrimary['InfoValue']};
      this.setDateFinPeriodeToContrat(this.newContrat);
    }
  }

  /**
   * Guard disponibilite and prepare it to be saved and check the other parts modifications
   * @param: dispo
   */
  public saveDisponibilite(dispo): void {
    if (dispo['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === dispo['idContrat']) {
          if (!this.contratUpdate.disponibilite) {
            this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          }
          this.contratUpdate = this.contratUtilitiesService.updateDisponibilite(this.contratUpdate, dispo['dispo'], dispo['alternate']);
          this.contratUpdate.idContrat = dispo['idContrat'];
          this.updateOtherThanDispo(dispo, contrat);
        }
      });
      this.setDateFinPeriodeToContrat(this.contratUpdate);
    } else {
      if (!this.newContrat.disponibilite) {
        const disponibilite = new DisponibiliteModel();
        disponibilite.jourDisponibilites = dispo['dispo'];
        this.newContrat = {...this.newContrat, disponibilite: disponibilite};
      } else {
        this.newContrat = this.contratUtilitiesService.updateDisponibilite(this.newContrat, dispo['dispo'], dispo['alternate']);
        this.setDateFinPeriodeToContrat(this.newContrat);

      }
    }

  }

  /**
   * Update the alternate state of contract
   * @param: dispo
   */
  public saveAlternate(dispo) {
    if (dispo['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === dispo['idContrat']) {
          if (!this.contratUpdate.disponibilite) {
            this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          }
          this.contratUpdate = this.contratUtilitiesService.updateAlternateProperty(this.contratUpdate,
            dispo['alternate'], this.disponibiliteConfig);
          this.contratUpdate.idContrat = dispo['idContrat'];
          if (((moment(this.dateService.setTimeNull(new Date)).isAfter(this.dateService.setTimeNull(contrat.datefin)) ||
            (moment(this.dateService.setTimeNull(new Date)).isSame(this.dateService.setTimeNull(contrat.datefin))
              && moment(this.dateService.setTimeNull(contrat.dateEffective))
                .isSame(this.dateService.setTimeNull(contrat.datefin)))) || (!contrat.typeContrat.dureeDetermine)) && contrat.motifSortie) {
            this.contratUpdate.motifSortie = contrat.motifSortie;
          } else {
            this.contratUpdate.motifSortie = null;
          }
          this.updateOtherThanDispo(dispo, contrat);
        }
      });
      this.setDateFinPeriodeToContrat(this.contratUpdate);
    } else {
      if (!this.newContrat.disponibilite) {
        const disponibilite = new DisponibiliteModel();
        disponibilite.jourDisponibilites = [];
        disponibilite.alternate = dispo['alternate'];
        this.newContrat = {...this.newContrat, disponibilite: disponibilite};
      } else {
        this.newContrat = this.contratUtilitiesService.updateAlternateProperty(this.newContrat,
          dispo['alternate'], this.disponibiliteConfig);
        this.setDateFinPeriodeToContrat(this.newContrat);

      }
    }
  }

  /**
   * Update other contract parts rather than availability
   * @param: dispo
   * @param: data
   */
  private updateOtherThanDispo(dispo: any, contrat: ContratModel): void {
    // conserver la valeur modifier de repartition
    if (this.contratRepartition.repartition) {
      if (this.contratRepartition.repartition['idContrat'] === dispo['idContrat']) {
        this.contratUpdate.repartition = this.contratRepartition.repartition['InfoValue'];
      }
    }
    if (this.contratTime['idContrat'] === dispo['idContrat']) {
      this.contratUpdate = {...this.contratUpdate, ...this.contratTime['InfoValue']};
      if (this.contratTime['tempsPartiel'] !== undefined) {
        this.contratUpdate.tempsPartiel = this.contratTime['tempsPartiel'];
      }
    }
    if (this.contratInfo['idContrat'] === dispo['idContrat']) {
      this.contratUpdate = {...this.contratUpdate, ...this.contratInfo['InfoValue']};
      if (((moment(this.dateService.setTimeNull(new Date)).isAfter(this.dateService.setTimeNull(this.contratUpdate.datefin)) ||
        (moment(this.dateService.setTimeNull(new Date)).isSame(this.dateService.setTimeNull(this.contratUpdate.datefin))
          && moment(this.dateService.setTimeNull(this.contratUpdate.dateEffective))
            .isSame(this.dateService.setTimeNull(this.contratUpdate.datefin)))) || (!this.contratUpdate.typeContrat.dureeDetermine)) && contrat.motifSortie) {
        this.contratUpdate.motifSortie = contrat.motifSortie;
      } else {
        this.contratUpdate.motifSortie = null;
      }
    }
    this.contratDefault = JSON.parse(JSON.stringify(contrat));
    this.contratDefault.dateEffective = new Date(this.contratDefault.dateEffective);
    if (this.contratDefault.datefin) {
      this.contratDefault.datefin = new Date(this.contratDefault.datefin);
    }
    contrat.updateContratBoolean = true;
  }

  /**
   * modifier contrat ou modifier
   * Echec de la  sauvegarde  si il y a un contrat à un groupe de travail directeur de meme date
   * @param :contratEvent
   */
  public async saveContrat(contratEvent?: any): Promise<void> {
    this.presenceMotifSorite = false;
    this.presenceBadge = false;
    this.secondModifiedContrat = contratEvent;
    if (this.popupUpdateDateFinContrat && !this.datefin) {
      this.presenceDateFin = true;
      return;
    }
    if (this.popupAddBadgeToEmployee && !this.badge) {
      this.presenceBadge = true;
      return;
    } else if ((this.newContrat.groupeTravail || this.newContrat.duplicateContrat)) {
      await this.saveNewContrat();
    } else {
      // en cas de activer un contrat avec le check box actif
      if (this.popupUpdateDateFinContrat && this.datefin) {
        this.contratUpdate.datefin = this.datefin;
      }
      this.calculeRepartitionOfContratUpdate(this.contratUpdate);
      if (this.checkContratValidite(this.contratUpdate) && !this.openAccordianContrat(this.contratUpdate.idContrat)) {

        await this.onUpdateContrat(this.secondModifiedContrat);

      } else {
        this.cancelUpdateOtherContrat(this.secondModifiedContrat);
      }
    }
  }

  /**
   * activer l' accordion du contrat
   */
  private openAccordianContrat(idContratToSave): boolean {
    let canSave = false;
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === idContratToSave) {
        canSave = this.listContratDisplay[index].presenceDirecteurInfoprimary;
      }
    });
    return canSave;
  }

  /**
   * tester si la contrat actif  qui on va modifier  devient un contrat incatif ou nn
   *
   */
  public IscontrtActif() {
    let contratIsActif = true;
    let dateFinPresent = true;
    if (this.contratUpdate.actif) {
      contratIsActif = moment(this.dateService.setTimeNull(this.contratUpdate.dateEffective)).isSameOrBefore(this.dateService.setTimeNull(new Date()));
      if (this.contratUpdate.datefin) {
        dateFinPresent = moment(this.dateService.setTimeNull(this.contratUpdate.datefin)).isSameOrAfter(this.dateService.setTimeNull(new Date()));
      }
    }
    return contratIsActif && dateFinPresent;
  }

  /**
   * ajouter nouveau contrat
   */
  async saveNewContrat() {
    this.isSubmitSave = true;
    this.canSaveContrat = false;
    this.setContratBeforeSave(this.newContrat);
    this.calculeRepartitionOfContratUpdate(this.newContrat);
    if (this.checkContratValidite(this.newContrat) && !this.openAccordianContrat(this.newContrat.idContrat)) {
      const isTotalDispoCorrectComparedToHebdo = this.contratUtilitiesService.isTotalDispoCorrect(this.newContrat);
      const isMaxDispoValid = this.contratUtilitiesService.isTotalDispoDayAndWeekCorrect(this.newContrat, this.disponibiliteConfig.maxDispoDay, this.disponibiliteConfig.maxDispoWeek);
      if (isTotalDispoCorrectComparedToHebdo && isMaxDispoValid) {
        this.canSaveContrat = true;
        if (!this.employee.badge && ((this.newContrat.typeContrat && (!this.newContrat.typeContrat.dureeDetermine || (this.newContrat.typeContrat.dureeDetermine && moment(this.dateService.setTimeNull(this.newContrat.datefin)).isSameOrAfter(this.dateService.setTimeNull(new Date()))))))) {
          this.getlistBadge();
        } else {
          await this.saveNewContratAfterVerification();
        }
      } else {
        if (!isTotalDispoCorrectComparedToHebdo) {
          this.notificationService.showErrorMessage('EMPLOYEE.TOTAL_DISPONIBILITE_MESSAGE_ERROR');
          const idCourantContrat = this.listContratDisplay.findIndex((contratSelected: ContratModel) => contratSelected.selectedAccordion);
          this.scrollToBlockService.scrollToElementHasError('div.contrat-courant' + idCourantContrat);
        } else {
          this.scrollToBlockService.scrollToElementHasError('.max-dispo.red');
        }
        this.setErrorInAccordionOfnewContrat();
      }
    } else if (this.contratUpdate.idContrat) {
      this.setErrorInAccordionOfnewContrat();
    }
  }

  /**
   * determiner erreur lors d ajouter un new contrat
   */
  private setErrorInAccordionOfnewContrat() {
    this.listContratDisplay.forEach((contratDisplay, index) => {
      contratDisplay.selectedAccordion = false;
      if (contratDisplay.idContrat === this.contratUpdate.idContrat) {
        contratDisplay.selectedAccordion = false;
      }
      if (!contratDisplay.idContrat) {
        contratDisplay.selectedAccordion = true;
        this.popupAddBadgeToEmployee = false;
      }
    });
  }

  /**
   * ajouter new contrat en list contrat apres enregistrement
   * @param :data
   */
  private async setNewContratAfterSave(data: any) {
    let newContratAffiche;

    this.listContratDisplay.forEach(contrat => {
      if (!this.newContrat.idContrat) {
        contrat = JSON.parse(JSON.stringify(this.newContrat));
        contrat.idContrat = data.idContrat;
        contrat.uuid = data.uuid;
        contrat.mens = data.mens;
        newContratAffiche = contrat;
        newContratAffiche.duplicateContrat = false;
        newContratAffiche.contratExistInfoPrimary = false;
      }
    });
    if (newContratAffiche.datefin) {
      newContratAffiche.datefin = new Date(newContratAffiche.datefin);
    }
    newContratAffiche.dateEffective = new Date(newContratAffiche.dateEffective);
    this.updateContratInListContratDisplay(newContratAffiche);
    this.newContrat = {} as ContratModel;
    this.newContratHidden = false;
    this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.SAVED'));
    // check for DPAE
    if (await this.checkParametreDPAE()) {
      this.notificationService.startLoader();
      this.dpaeService.checkStatut(this.sharedEmployee.selectedEmployee.uuid).subscribe((data: DpaeStatut) => {
        this.dpaeStatut = data;
        this.notificationService.stopLoader();
        this.showDPAE_popup();
      });
    }
  }

  /**
   * verification le contratr valide ou nn pour enregistrer
   * @param :contrat
   */
  public checkContratValidite(contrat: ContratModel): boolean {
    let validOuvrable = true;
    contrat.ouvrable = false;
    contrat.ouvre = false;
    if (contrat.hebdo.length === 0) {
      this.scrollToBlockService.scrollToElementHasErrorThirdParent('span.form-item-error');
    }
    contrat.istotalHeuresEquals = +contrat.hebdo === this.totalRepartition;
    this.listContratDisplay.forEach((contratDisplay, index) => {
      contratDisplay.ouvrable = false;
      contratDisplay.ouvre = false;
      if (!contratDisplay.idContrat || contrat.idContrat === contratDisplay.idContrat) {
        // affiche le message pour que verifier l'hebdo est egal la total repartition ou nn
        contratDisplay.istotalHeuresEquals = contrat.istotalHeuresEquals;

        if (!contratDisplay.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
        if (this.totalDays > 5 && !this.ouvrableParama) {
          validOuvrable = false;
          contrat.ouvre = true;
          contratDisplay.ouvre = contrat.ouvre;
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');

        } else if (this.totalDays > 6 && this.ouvrableParama) {
          contrat.ouvrable = true;
          contratDisplay.ouvrable = contrat.ouvrable;

          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
          validOuvrable = false;


        }
      }
    });
    if (contrat.datefin) {
      contrat.datefin = this.dateService.setTimeNull(contrat.datefin);
    }
    if (contrat.hebdo === undefined) {
      contrat.hebdo = 0;
    }
    if (contrat.txHoraire === undefined) {
      contrat.txHoraire = 0;
      this.scrollToBlockService.scrollToElementHasErrorThirdParent('input.ng-invalid');
    }
    if (contrat.compt === undefined) {
      contrat.compt = 0;
    }
    const validEchelonLevelCoefficient = this.contratUtilitiesService.validEchelonLevelCoefficient(contrat);
    if (!validEchelonLevelCoefficient) {
      this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
    }
    contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
    this.dateConstraints = contrat.groupeTravail && contrat.typeContrat && contrat.dateEffective && contrat.hebdo.toString() && contrat.txHoraire.toString() && contrat.compt.toString() && ((contrat.datefin && contrat.typeContrat.dureeDetermine) || (contrat.datefin && !contrat.typeContrat.dureeDetermine
      && (contrat.motifSortie !== null || contrat.motifSortie !== undefined)) || (!contrat.datefin && !contrat.typeContrat.dureeDetermine
      && !contrat.motifSortie)) && validEchelonLevelCoefficient;
    if (!this.dateConstraints) {
      this.dateConstraints = false;
    }
    return contrat.istotalHeuresEquals && this.dateConstraints && validOuvrable;
  }

  /**
   * set value to new contrat before save
   * @param: arrondiContratMensuel
   */
  private setContratBeforeSave(contrat: any) {
    contrat.dateEffective = new Date(contrat.dateEffective);
    if (contrat.datefin) {
      contrat.datefin = new Date(contrat.datefin);
    }
    delete contrat.contratInfoPrimary;
    delete contrat.repartitionTime;
    contrat.employee = this.employeeDefault;
    if (contrat.employee.idEmployee === this.sharedEmployee.selectedEmployee.idEmployee) {
      contrat.employee = this.sharedEmployee.selectedEmployee;
    } else {
      this.selectNewEmployee = true;
    }

    if (this.badge) {
      contrat.employee.badge = this.badge;
    }
    this.dateService.setCorrectDate(contrat.dateEffective);
    if (contrat.datefin) {
      this.dateService.setCorrectDate(contrat.datefin);
    }
    if (!contrat.motifSortie) {
      contrat.motifSortie = null;
    }
    if (!contrat.avenantContrats) {
      contrat.avenantContrats = [];
    }
    contrat.hebdo = +contrat.hebdo;
  }

  /**
   * update contrat in list contrat display
   * @param :contrat
   */
  private updateContratInListContratDisplay(contrat: ContratModel) {
    this.listContratDisplay.forEach((contratSave, index) => {
      if (!contratSave.idContrat || contrat.idContrat === contratSave.idContrat) {
        this.listContratDisplay.splice(index, 1);
      }
    });
    if (contrat.datefin) {
      contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
        + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
        this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
    } else {
      contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
        + ' ' + this.dateService.formatDate(contrat.dateEffective);
    }
    contrat.presenceDirecteurInfoprimary = false;
    this.presenceDirecteur = false;
    contrat.selectedAccordion = true;
    this.setContratPrimary(contrat);
    this.setRepartitionAndTime(contrat);
    this.listContratDisplay.push(contrat);
    contrat.txHoraireGroupeTravail = contrat.txHoraire;
    this.sortList();
    // contratActif reste  à la 1ere position
    if (this.contratActif) {
      // En cas de modifier un contrat actif
      if (this.contratActif.idContrat === contrat.idContrat) {
        this.verifyNewContratOrUpdateContratIsActif(contrat);
      } else {
        // en cas de modifier un contrat inactif et list contient un contrat actif
        // mettre le contrat actif dans la premiere position
        // sauvegarder le header de contrat actif
        this.listContratDisplay.forEach((contratDisplay, index) => {
          if (contratDisplay.idContrat === this.contratActif.idContrat) {
            this.listContratDisplay.splice(index, 1);

          }
        });
        this.contratActif.selectedAccordion = false;
        this.contratActif.dateEffective = new Date(this.contratActif.dateEffective);
        if (this.contratActif.datefin) {
          this.contratActif.datefin = new Date(this.contratActif.datefin);
        }
        this.sortList();
        this.listContratDisplay.unshift(this.contratActif);
      }

    } else {
      this.verifyNewContratOrUpdateContratIsActif(contrat);
    }
    this.showPopUp = false;
    this.newContratHidden = true;
  }

  /**
   * annuler la modification du contrat
   */
  public resetContrat(contratEvent?) {
    let contratDefaultReset;
    // restaurer le contrat  qui a deja non sauvegarder
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === this.contratDefault.idContrat) {
        if (contratEvent) {
          this.contratDefault.selectedAccordion = false;
        }
        contratDefaultReset = JSON.parse(JSON.stringify(this.contratDefault));
        contratDefaultReset.updateContratBoolean = false;
        contratDefaultReset.presenceDirecteurInfoprimary = false;
        this.setRepartitionAndTime(contratDefaultReset);
        this.setContratPrimary(contratDefaultReset);
        this.listContratDisplay[index] = contratDefaultReset;
      }
    });
    const contratDisplay = this.clone(contratDefaultReset);
    this.contratUpdate = {} as ContratModel;
    // mis a jour le contrat qui sera modifier
    if (contratEvent) {
      this.updateOtherContrat(contratEvent);
    }
    // annuler la sauvegarde de nouveau contrat;
    if (this.newContrat.groupeTravail || this.newContrat.duplicateContrat) {
      this.listContratDisplay.forEach((contrat, index) => {
        if (!contrat.idContrat) {
          this.newContrat = {} as ContratModel;
          this.listContratDisplay.splice(index, 1);
          this.newContratHidden = false;
        }
      });
    }
    this.presenceDirecteur = false;
    this.setDateFinPeriodeToContrat(contratDisplay);
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :groupTravail
   * @param :filter
   */
  showConfirmUpdateContrat(event) {
    if (!this.newContrat.groupeTravail) {
      const messageView = this.viewMessageConfirmationOfUpdateContrat();
      this.confirmationService.confirm({
        message: messageView,
        header: this.rhisTranslateService.translate('CONTRAT.VALIDATE'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.saveContrat(event);
        },
        reject: () => {
          this.resetContrat(event);
        }
      });
    }
  }

  /**
   * afficher le message de confirmation modifier le contrat courant
   */
  private viewMessageConfirmationOfUpdateContrat(): string {
    let messageView;
    const index = this.listContratDisplay.findIndex(contratDisplay => contratDisplay.idContrat === this.contratUpdate.idContrat);
    const contrat = JSON.parse(JSON.stringify(this.listContratDisplay[index]));
    if (contrat.contratInfoPrimary['datefin']) {
      contrat.contratInfoPrimary['datefin'] = new Date(contrat.contratInfoPrimary['datefin']);
      contrat.contratInfoPrimary['dateEffective'] = new Date(contrat.contratInfoPrimary['dateEffective']);
      messageView = this.rhisTranslateService.translate('CONTRAT.SHOW_CONFIRMATION')
        + ' ' + this.dateService.formatDate(contrat.contratInfoPrimary['dateEffective']) + ' ' +
        this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.contratInfoPrimary['datefin']);
    } else {
      contrat.contratInfoPrimary['dateEffective'] = new Date(contrat.contratInfoPrimary['dateEffective']);
      messageView = this.rhisTranslateService.translate('CONTRAT.SHOW_CONFIRMATION')
        + ' ' + this.dateService.formatDate(contrat.contratInfoPrimary['dateEffective']);
    }
    return messageView;
  }

  /**
   * modifier contrat et sauvegarder dans la bd
   * @param :contratEvent
   */
  private onUpdateContrat(contratEvent?: any): void {
    this.contratAfterChoseBadge = contratEvent;
    this.isSubmitSave = true;
    this.canSaveContrat = false;
    this.setContratBeforeSave(this.contratUpdate);
    const isTotalDispoCorrectComparedToHebdo = this.contratUtilitiesService.isTotalDispoCorrect(this.contratUpdate);
    const isMaxDispoValid = this.contratUtilitiesService.isTotalDispoDayAndWeekCorrect(this.contratUpdate, this.disponibiliteConfig.maxDispoDay, this.disponibiliteConfig.maxDispoWeek);
    if (isTotalDispoCorrectComparedToHebdo && isMaxDispoValid) {
      if (!this.IscontrtActif() && !this.popupVisibility && ((this.contratUpdate.motifSortie && !this.contratUpdate.typeContrat.dureeDetermine) || (this.contratUpdate.typeContrat.dureeDetermine && !this.contratUpdate.motifSortie))) {
        this.openPopupListMotifSortie();
      } else {
        if (!this.contratUpdate.disponibilite.alternate && this.contratUpdate.disponibilite.idDisponibilite) {
          if (!this.employee.badge && (this.contratUpdate.idContrat &&
            ((this.contratUpdate.datefin && moment(this.dateService.setTimeNull(this.contratUpdate.datefin)).isAfter(this.dateService.setTimeNull(this.contratUpdate.dateEffective))) || !this.contratUpdate.datefin) &&
            ((!this.contratUpdate.typeContrat.dureeDetermine && !this.contratUpdate.datefin) || ((this.contratUpdate.typeContrat.dureeDetermine ||
              (!this.contratUpdate.typeContrat.dureeDetermine && this.contratUpdate.datefin)) && moment(this.dateService.setTimeNull(this.contratUpdate.datefin)).isSameOrAfter(this.dateService.setTimeNull(new Date())))))) {
            this.getlistBadge();
          } else {
            this.afterVerificationUpdateContrat(contratEvent);
          }
        } else {
          this.sendContratToBeUpdated(contratEvent);
        }
      }
    } else {
      this.showTotalDispoMessageError(contratEvent, isTotalDispoCorrectComparedToHebdo);
    }
    this.popupUpdateDateFinContrat = false;
  }

  /**
   * apres la vérification de contraintes du contrat qui sera modifier
   */
  private afterVerificationUpdateContrat(contratEvent: any): void {
    this.jourDisponibiliteService.removeOddByDisponibiliteId(this.contratUpdate.disponibilite.uuid).subscribe({
      complete: () => {
        this.sendContratToBeUpdated(contratEvent);
      }
    });
  }

  /**
   * Send contrat to be updated to the backend
   * @param: contratEvent
   */
  private async sendContratToBeUpdated(contratEvent: any, contratActif?: ContratModel) {
    const disactivateContrat = contratActif ? 1 : 0;
    this.canSaveContrat = true;
    try {
      const data = await this.contratService.UpdateContrat(this.contratUpdate, this.arrondiContratMensuel, disactivateContrat ).toPromise();
      if (!this.selectNewEmployee) {
        this.contratUpdate.mens = data['mens'];
        this.contratUpdate.disponibilite = data['disponibilite'];
        if(contratActif){
          this.contratUpdate.motifSortie = data['motifSortie'];
        }

        const contratDisplay = this.clone(this.contratUpdate);
        this.setContratAfterUpdate(contratEvent);
        if (this.badge) {
          this.sharedEmployee.selectedEmployee.badge = this.badge;
          this.popupAddBadgeToEmployee = false;
          this.popupUpdateDateFinContrat = false;
        }
        this.setDateFinPeriodeToContrat(contratDisplay);
        if(contratActif) {
          this.setNewContratContratInListContratDisplay(contratActif);
        }

      } else {
        this.selectNewEmployee = false;
        this.newContratHidden = false;
        this.contratUpdate = new ContratModel();

      }
      this.popupVisibility = false;
    } catch (err) {
      this.canSaveContrat = false;
      if (err.error === 'RHIS_CONTRAT_IS_EXIST') {
        this.contratUpdate.contratExistInfoPrimary = true;
        this.contratUpdate.presenceDirecteurInfoprimary = false;
        this.presenceDirecteur = false;
      }
      this.cancelUpdateOtherContrat(contratEvent);
    }

  }

  /**
   * Show (total disponibilite) > (total hebdo) error message and open concerned contrat
   * @param: contratEvent
   */
  public showTotalDispoMessageError(contratEvent, isTotalDispoCorrectComparedToHebdo: boolean) {
    if (!isTotalDispoCorrectComparedToHebdo) {
      this.notificationService.showErrorMessage('EMPLOYEE.TOTAL_DISPONIBILITE_MESSAGE_ERROR');
      const idCourantContrat = this.listContratDisplay.findIndex((contratSelected: ContratModel) => contratSelected.selectedAccordion);
      this.scrollToBlockService.scrollToElementHasError('div.contrat-courant' + idCourantContrat);
    } else {
      this.scrollToBlockService.scrollToElementHasError('.max-dispo.red');
    }
    this.cancelUpdateOtherContrat(contratEvent);
  }

  /**
   * Show (total disponibilite) > (total hebdo) error message and open concerned contrat
   * @param: contratEvent
   */
  public showTotalDispoMessageErrorExist(contratEvent) {
    this.notificationService.showErrorMessage('CONTRAT.CONTRAT_ACTIF');
    this.cancelUpdateOtherContrat(contratEvent);
  }

  public showMessageErrorActif(contratEvent) {
    this.notificationService.showErrorMessage('CONTRAT.CONTRAT_ALERT_ACTIF');
    this.cancelUpdateOtherContrat(contratEvent);
  }

  /**
   * modifier contrat aprés enregistrement
   * @param: contratEvent
   */
  private setContratAfterUpdate(contratEvent?) {
    this.updateContratInListContratDisplay(this.contratUpdate);
    this.newContratHidden = false;
    this.listContratDisplay.forEach((contrat, index) => {
      contrat.updateContratBoolean = false;
      contrat.contratExistInfoPrimary = false;
      if (contrat.idContrat === this.contratUpdate.idContrat) {
        contrat.updateContratBoolean = false;
        contrat.dateEffective = new Date(contrat.dateEffective);
        if (contrat.datefin) {
          contrat.datefin = new Date(contrat.datefin);
        }
        this.changeDateAvenatOfContratUpdateAfterSave();
        if (contratEvent) {
          contrat.selectedAccordion = false;
        } else {
          this.contratUpdate = new ContratModel();
        }
      }

    });
    if (contratEvent) {
      this.updateOtherContrat(contratEvent);
    }
    this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.UPDATE'));

  }

  /**
   * change date avenat lors de modification d'un contrat
   */
  public changeDateAvenatOfContratUpdateAfterSave() {
    if (this.avenantContratInit && this.avenantContratInit.length) {
      this.contratUpdate.avenantContrats = JSON.parse(JSON.stringify(this.avenantContratInit));
    }
    this.contratUpdate.avenantContrats.forEach((avenantDisplay, indexAvenant) => {
      avenantDisplay.selectedAccordion = false;
      avenantDisplay.dateEffective = new Date(avenantDisplay.dateEffective);
      // update les date d aavenat pour ne doit etre sup ales date de son contrat
      if (this.contratUpdate.datefin) {
        avenantDisplay.datefin = new Date(avenantDisplay.datefin);

        if (moment(avenantDisplay.datefin).isAfter(this.contratUpdate.datefin) || moment(avenantDisplay.datefin).isBefore(this.contratUpdate.dateEffective)) {
          avenantDisplay.datefin = JSON.parse(JSON.stringify(this.contratUpdate.datefin));
        }
        if (moment(avenantDisplay.dateEffective).isBefore(this.contratUpdate.dateEffective) || moment(avenantDisplay.dateEffective).isAfter(this.contratUpdate.datefin)) {
          avenantDisplay.dateEffective = JSON.parse(JSON.stringify(this.contratUpdate.dateEffective));
        }
      } else {
        if (moment(avenantDisplay.datefin).isBefore(this.contratUpdate.dateEffective)) {
          avenantDisplay.datefin = this.contratUpdate.dateEffective;
        }
        if (moment(avenantDisplay.dateEffective).isBefore(this.contratUpdate.dateEffective)) {
          avenantDisplay.dateEffective = JSON.parse(JSON.stringify(this.contratUpdate.dateEffective));
        }
      }
      this.setContratPrimary(avenantDisplay);
    });
    this.setAvenantContratInListContrat(this.contratUpdate);
  }

  /**
   * lors de modifier un autre contrat et sauvegarder l'ancien contrat modifié
   * @param; contratEvent
   */
  private updateOtherContrat(contratEvent) {
    if (contratEvent['idContrat']) {
      this.listContratDisplay.forEach(contrat => {
        if (contrat.idContrat === contratEvent['idContrat']) {
          this.contratDefault = JSON.parse(JSON.stringify(contrat));
          this.contratDefault.dateEffective = new Date(this.contratDefault.dateEffective);
          if (this.contratDefault.datefin) {
            this.contratDefault.datefin = new Date(this.contratDefault.datefin);
          }
          this.contratUpdate = JSON.parse(JSON.stringify(contrat));
          // permet de verifier si la valeur recuperer est de repartition
          if (contratEvent['repartition'] === true) {
            this.contratUpdate.repartition = contratEvent['InfoValue'];
            this.contratRepartition.repartition = contratEvent;
          } else if (contratEvent['disponibilite'] === true) {
            this.contratUpdate.disponibilite.jourDisponibilites = [...contratEvent['dispo']];
          } else if (contratEvent['alternate']) {
            this.contratUpdate.disponibilite.alternate = contratEvent['alternateVal'];
          } else {

            this.contratUpdate = {...this.contratUpdate, ...contratEvent['InfoValue']};

            // permet de verifier si la valeur recuperer est de info principal
            if (contratEvent['info'] === true) {
              this.contratInfo = contratEvent;
              // permet de verifier si la valeur recuperer est section heure
            }
            if (contratEvent['hebdo'] === true) {
              this.contratTime = contratEvent;
              //  permet de verifier si la valeur recuperer est section temps partiel
            }
            if (contratEvent['InfoValue'] && (contratEvent['InfoValue']['tempsPartiel'] === true || contratEvent['InfoValue']['tempsPartiel'] === false) && contratEvent['hebdo'] === false) {
              this.contratTime = contratEvent;
            }
          }
          if (contratEvent['tempsPartiel'] !== undefined) {
            this.contratUpdate.tempsPartiel = contratEvent['tempsPartiel'];
          }
          contrat.selectedAccordion = true;
          contrat.updateContratBoolean = true;
        }
      });
    }
  }

  /**
   * En cas d'erreur pour la sauvegarde un contrat modifié
   * @param :contratEvent
   */
  private cancelUpdateOtherContrat(contratEvent?) {
    let contratSave;
    this.listContratDisplay.forEach((contrat: any, index: number) => {

      if (contratEvent) {
        if (contrat.idContrat === contratEvent.idContrat) {
          contratSave = JSON.parse(JSON.stringify(contrat));
          contratSave.selectedAccordion = false;
          this.listContratDisplay[index] = contratSave;
        }
      }
      if (contrat.idContrat === this.contratUpdate.idContrat) {

        this.contratUpdate = JSON.parse(JSON.stringify(this.contratUpdate));
        contratSave = JSON.parse(JSON.stringify(this.contratUpdate));
        contratSave.txHoraireGroupeTravail = contratSave.txHoraire;
        contratSave.selectedAccordion = true;
        contratSave.updateContratBoolean = true;
        contratSave.presenceDirecteurInfoprimary = contrat.presenceDirecteurInfoprimary;
        this.presenceDirecteur = contrat.presenceDirecteurInfoprimary;
        this.setContratPrimary(contratSave);
        this.setRepartitionAndTime(contratSave);
        this.listContratDisplay[index] = contratSave;
      }
    });
  }

  /**
   * calcule la somme de repartition pour le contrat modifié
   *
   */
  public calculeRepartitionOfContratUpdate(contrat) {
    this.totalRepartition = 0;
    this.totalDays = 0;
    if (contrat.repartition) {
      const valeurSem = ['valeurDimanche', 'valeurLundi', 'valeurMardi', 'valeurMercredi', 'valeurJeudi', 'valeurVendredi', 'valeurSamedi'];
      for (const valeur of valeurSem) {
        this.totalRepartition += +contrat.repartition[valeur];
        this.totalRepartition = +this.totalRepartition.toFixed(2);
        if (+contrat.repartition[valeur]) {
          this.totalDays++;
        }


      }
    }
  }

  /**
   * verification s'il y a changement de contrat
   * ajout new contrat
   * modifier contrat
   *
   */
  public canDeactivate(): boolean {
    let canSave = true;
    if (this.updateButtonControl()) {
      if (!this.presenceDirecteur && this.checkContratUpdatedOrNewContratFound()) {
        if (this.newContrat.groupeTravail || this.newContrat.duplicateContrat) {
          canSave = false;
        } else if (this.contratUpdate.idContrat) {
          canSave = false;
        }
      }
    }
    return canSave;
  }

  private checkContratUpdatedOrNewContratFound(): boolean {
    let found = false;
    const contratDisplay = this.newContrat.groupeTravail || this.newContrat.duplicateContrat ? this.newContrat : this.contratUpdate;
    this.listContratDisplay.forEach((contrat, index) => {
      if (contratDisplay && contrat.idContrat === contratDisplay.idContrat) {
        found = true;
      }
    });
    return found;

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
      accept: async () => {
        await this.saveContrat();
        if (this.selectNewEmployee) {
          this.navigateAway.next(true);
          this.idEmployee = this.sharedEmployee.selectedEmployee.uuid;
        }
        if (this.canSaveContrat) {
          this.navigateAway.next(true);

        } else {
          this.navigateAway.next(false);
        }
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * ajouter new avenant dans  le contrat courant
   * * @param :contrat
   */
  public addNewAvenant(contrat: ContratModel) {
    let avenant = {} as ContratModel;
    this.contratAvenantDefault = JSON.parse(JSON.stringify(contrat));
    avenant = JSON.parse(JSON.stringify(contrat));
    if (!avenant.datefin) {
      avenant.dateEffective = new Date(avenant.dateEffective);
      avenant.datefin = moment(avenant.dateEffective).add(1, 'days').toDate();

    }
    avenant.contratInfoPrimary.employee.statut = false;
    avenant.istotalHeuresEquals = true;
    avenant.updateContratBoolean = false;
    avenant.idContrat = 0;
    delete avenant.uuid;
    if (contrat.avenantContrats) {
      contrat.avenantContrats.forEach((avenantDisplay, index) => {
        const avenantContrat = JSON.parse(JSON.stringify(avenantDisplay));
        avenantContrat.selectedAccordion = false;
        if (avenantContrat.datefin) {
          avenantContrat.datefin = new Date(avenantContrat.datefin);
        }
        avenantContrat.dateEffective = new Date(avenantContrat.dateEffective);
        contrat.avenantContrats[index] = avenantContrat;
      });
    } else {
      contrat.avenantContrats = [];
    }

    this.listTypeContrat.forEach(typeContrat => {
      if (typeContrat.dureeDetermine) {
        avenant.contratInfoPrimary.typeContrat = typeContrat;
        avenant.typeContrat = typeContrat;
      }
    });
    this.newAvenantHidden = true;
    contrat.avenantContrats.push(avenant);

    const idCourantContrat = this.listContratDisplay.findIndex((contratSelected: ContratModel) => contratSelected.selectedAccordion);
    this.scrollToBlockService.scrollToElementHasError('div.new-avenant-clicked-' + idCourantContrat);
  }

  /**
   * add avenant contrat  in list contrat
   * add new avenant in list
   * update avenant to the list
   */
  private setNewAvenantContratOrUpdateAvenantInListContrat(event) {
    let avenantActif;
    // pour conserver l header de éEme avenant modifié
    let headerDefaulte;
    this.newAvenantHidden = false;
    // en cas de modifier un avenant
    if (event['avenantUpdate']) {
      this.setContratPrimary(event['avenantUpdate']);
      this.setRepartitionAndTime(event['avenantUpdate']);
      event['avenantUpdate'].updateContratBoolean = false;
      event['avenantUpdate'].selectedAccordion = true;
      this.contratAvenantDefault.idContrat = event['idContrat'];
      this.contratAvenantDefault.avenantContrats = JSON.parse(JSON.stringify(event['avenantContrat']));
      const indexOfAvenant = this.contratAvenantDefault.avenantContrats.findIndex(avenantDisplay => avenantDisplay.idContrat === event['avenantUpdate'].idContrat);
      this.contratAvenantDefault.avenantContrats[indexOfAvenant] = event['avenantUpdate'];
    }

    if (this.contratAvenantDefault.avenantContrats) {

      this.contratAvenantDefault.avenantContrats.forEach((avenantDisplay, index) => {
        if (event['avenantEvent']) {
          if (event['avenantEvent']['idAvenant'] === avenantDisplay.idContrat) {
            headerDefaulte = JSON.parse(JSON.stringify(avenantDisplay));
          }
        }

        avenantDisplay.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_DU')
          + ' ' + this.dateService.formatDate(avenantDisplay.dateEffective) + ' ' +
          this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(avenantDisplay.datefin);
        avenantDisplay.selectedAccordion = false;
        avenantDisplay.istotalHeuresEquals = true;
        avenantDisplay.contratExistInfoPrimary = false;
        avenantDisplay.updateContratBoolean = false;
        if (this.isActiveAvenant(avenantDisplay)) {
          avenantDisplay.selectedAccordion = false;
          avenantDisplay.actif = true;
          avenantDisplay.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_EN_COURS');
          avenantActif = JSON.parse(JSON.stringify(avenantDisplay));
          this.contratAvenantDefault.avenantContrats.splice(index, 1);

        }
        if (event['avenantEvent']) {
          if (event['avenantEvent']['idAvenant'] === avenantDisplay.idContrat) {
            avenantDisplay.header = headerDefaulte.header;
          }
        }
        if (event['avenant']) {
          event['avenant'].selectedAccordion = true;
          event['avenant'].istotalHeuresEquals = true;
          event['avenant'].contratExistInfoPrimary = false;
          event['avenant'].updateContratBoolean = false;
        }
      });

      this.sortListAvenant(this.contratAvenantDefault);
    } else {
      this.contratAvenantDefault.avenantContrats = [];
    }
    // en cas d'ajouter un avenant
    if (event['idAvenant']) {
      event['avenant'].selectedAccordion = true;
      event['avenant'].idContrat = event['idAvenant'];
      event['avenant'].updateContratBoolean = false;
      if (this.isActiveAvenant(event['avenant'])) {

        event['avenant'].header = this.rhisTranslateService.translate('CONTRAT.AVENANT_EN_COURS');
        avenantActif = JSON.parse(JSON.stringify(event['avenant']));
      } else {
        this.contratAvenantDefault.avenantContrats.push(event['avenant']);
      }
    }
    this.sortListAvenant(this.contratAvenantDefault);
    // s'il y un avenant actif on ajout cet avenant à la 1ere position
    if (avenantActif) {
      avenantActif.actif = true;
      this.setContratPrimary(avenantActif);
      avenantActif.contratInfoPrimary.actif = true;
      this.setRepartitionAndTime(avenantActif);
      this.contratAvenantDefault.avenantContrats.unshift(avenantActif);
    }
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === this.contratAvenantDefault.idContrat) {
        if (event['avenantUpdate']) {
          this.listContratDisplay[index].avenantContrats = this.contratAvenantDefault.avenantContrats;
          this.avenantContratInit = JSON.parse(JSON.stringify(this.contratAvenantDefault.avenantContrats));
        } else {
          this.avenantContratInit = JSON.parse(JSON.stringify(this.contratAvenantDefault.avenantContrats));
          this.listContratDisplay[index] = this.contratAvenantDefault;
        }
      }
    });
  }

  /**
   * ordonner la liste des contrat du plus recent au plus encien
   */
  private sortListAvenant(contrat) {
    if (contrat.avenantContrats) {
      contrat.avenantContrats.sort((contrat1, contrat2): number => {
        if (new Date(contrat1.dateEffective) < new Date(contrat2.dateEffective)) {
          return 1;
        }
        if (new Date(contrat1.dateEffective) > new Date(contrat2.dateEffective)) {
          return -1;
        }
      });
    }
  }

  /**
   * recupere l'id d'avenant déja modifieé pour afficher le pupup de confirmation
   * afficher les messages d erreur apres l affichage de confirmùmation de sauvgarder la modification
   * @param: event
   */
  public setUpdateAvenantId(event) {
    this.avenantUpdateId = event['idAvenant'];
    this.avenantUpdate = event['avenantUpdate'];
    if (event['contratId'] && this.avenantUpdate.idContrat) {
      this.listContratDisplay.forEach((contrat, index) => {
        if (contrat.idContrat === event['contratId']) {
          contrat.avenantContrats = JSON.parse(JSON.stringify(this.avenantContratInit));
          contrat.avenantContrats.forEach((avenantDisplay, indexAvenant) => {
            if (avenantDisplay.idContrat === this.avenantUpdateId) {
              event['avenantUpdate'].updateContratBoolean = true;
              // en cas d erreur lors de modification
              if (!event['avenantUpdate'].istotalHeuresEquals) {
                event['avenantUpdate'].istotalHeuresEquals = false;
                this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
              }
              if (event['avenantUpdate'].contratExistInfoPrimary) {
                event['avenantUpdate'].contratExistInfoPrimary = true;
              }
              this.avenantUpdate = event['avenantUpdate'];
              this.avenantUpdate.updateContratBoolean = true;
              this.setContratPrimary(this.avenantUpdate);
              this.setRepartitionAndTime(this.avenantUpdate);
              contrat.avenantContrats[indexAvenant] = this.avenantUpdate;
            }
          });
          this.listContratDisplay[index] = contrat;

        }
      });
    }
  }

  /**
   * elimine le changement a l list de contrat
   * @param: event
   */
  public resetAvenantContrat(event) {
    this.avenantUpdateId = 0;
    this.avenantUpdate = {} as ContratModel;
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === event['contratId']) {
        contrat.avenantContrats = JSON.parse(JSON.stringify(this.avenantContratInit));
        if (contrat.avenantContrats) {
          contrat.avenantContrats.forEach((avenantDisplay, indexAvenant) => {
            if (event['avenant']['idContrat'] === avenantDisplay.idContrat) {
              this.setRepartitionAndTime(avenantDisplay);
              this.setContratPrimary(avenantDisplay);
              contrat.avenantContrats[indexAvenant] = avenantDisplay;
            }
          });
          this.setAvenantContratInListContrat(contrat);

          this.listContratDisplay[index] = contrat;

        }
      }
    });
  }

  /**
   * supprimer avenant de list display
   * disactiver un avenant actif
   * @param :event
   */
  public deleteAvenantContrat(event) {
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === event['contratId']) {
        contrat.avenantContrats = JSON.parse(JSON.stringify(this.avenantContratInit));
        contrat.avenantContrats.forEach((avenantDisplay, indexAvenant) => {
          // desactiver Avenant
          if (event['avenantUpdate']) {
            if (avenantDisplay.idContrat === event['avenantId']) {
              avenantDisplay.actif = false;
              const dateFin = new Date();
              let dateNow = new Date();
              avenantDisplay.dateEffective = this.dateService.setTimeNull(avenantDisplay.dateEffective);
              dateNow = this.dateService.setTimeNull(dateNow);
              if (moment(avenantDisplay.dateEffective).isSame(dateNow)) {
                avenantDisplay.datefin = dateNow;
              } else {
                dateNow.setDate(dateNow.getDate() - 1);
                avenantDisplay.datefin = dateNow;
              }
              avenantDisplay.selectedAccordion = true;
              this.setContratPrimary(avenantDisplay);
              contrat.avenantContrats[index] = avenantDisplay;

            }
          } else if (avenantDisplay.idContrat === event['avenantId']) {
            contrat.avenantContrats.splice(indexAvenant, 1);
          }
        });

        this.listContratDisplay[index] = contrat;
        this.setAvenantContratInListContrat(contrat);

      }
    });
  }

  /**
   * conserver les avenants qui sont recuperé de la bd
   * @param :avenant
   */
  public setAvenantContratDefault(event) {
    this.avenantContratInit.forEach((avenantDisplay, index) => {
      avenantDisplay.selectedAccordion = false;
      if (avenantDisplay.idContrat === event.avenant.idContrat) {
        this.avenantContratInit[index] = event.avenant;
        avenantDisplay.selectedAccordion = true;
      }
    });
    if (event.idContrat) {
      this.listContratDisplay.forEach((contrat, index) => {
        if (contrat.idContrat === event.idContrat) {
          contrat.avenantContrats.forEach((avenantDisplay, indexAvenant) => {
            avenantDisplay.selectedAccordion = false;
            avenantDisplay.istotalHeuresEquals = true;
            if (event['avenant']['idContrat'] === avenantDisplay.idContrat) {
              contrat.avenantContrats[indexAvenant] = event.avenant;
              avenantDisplay.selectedAccordion = true;
            }
          });
        }
      });
    }
  }

  /**
   * ouvrir popup motif de sortie pour rendre un contrat inactif
   * En cas de modifier la date du contrat actif
   * @param :event
   */
  public openPopupListMotifSortie(event?) {
    this.dateFinDisplay = false;
    this.dateEffectifCDI = null;
    this.datefinCDI = null;
    this.presenceMotifSorite = false;
    this.popupVisibility = true;
    if (event) {
      if (event['openPopup'] === true) {
        this.listContratDisplay.forEach(contratDisplay => {
          if (contratDisplay.idContrat === event['contratId'] && !contratDisplay.typeContrat.dureeDetermine) {
            this.dateFinDisplay = true;
            this.datefinCDI = new Date();
            this.dateEffectifCDI = contratDisplay.dateEffective;
          }
        });
        this.idOfDisactifContrat = event['contratId'];
        this.presenceMotifSorite = false;
      } else {
        this.confirmMakeContratInactive();
      }
    }
  }

  /**
   * rendre contrat actif en inactif
   * la date de fin se met a la date du jour moins 1
   */
  public confirmMakeContratInactive() {
    if (this.popupVisibility && !this.motifSortie) {
      this.presenceMotifSorite = true;
      return;
    }
    if (this.idOfDisactifContrat) {
      this.listContratDisplay.forEach(contratDisplay => {
        if (contratDisplay.idContrat === this.idOfDisactifContrat) {
          let dateNow = new Date();
          contratDisplay.dateEffective = this.dateService.setTimeNull(contratDisplay.dateEffective);
          dateNow = this.dateService.setTimeNull(dateNow);
          if (!this.dateFinDisplay) {
            if (moment(contratDisplay.dateEffective).isSame(dateNow)) {
              contratDisplay.datefin = dateNow;
            } else {
              dateNow.setDate(dateNow.getDate() - 1);
              contratDisplay.datefin = dateNow;
            }
          } else {
            contratDisplay.datefin = this.datefinCDI;
          }
          if (moment(this.dateService.setTimeNull(contratDisplay.datefin)).isBefore(this.dateService.setTimeNull(new Date()))) {
            contratDisplay.actif = false;
          }
          if (this.contratInfo['InfoValue']) {
            this.contratInfo['InfoValue']['datefin'] = contratDisplay.datefin;
            if (moment(this.dateService.setTimeNull(contratDisplay.datefin)).isBefore(this.dateService.setTimeNull(new Date()))) {
              this.contratInfo['InfoValue']['actif'] = false;
            }
          }
          contratDisplay.motifSortie = this.motifSortie;
          this.contratUpdate = JSON.parse(JSON.stringify(contratDisplay));
          this.idOfDisactifContrat = 0;
          if (moment(this.dateService.setTimeNull(contratDisplay.datefin)).isBefore(this.dateService.setTimeNull(new Date()))) {
            this.setBadgeOfEmployeeToNull();
          }
          return;
        }
      });
    } else {
      this.contratUpdate.motifSortie = this.motifSortie;
      this.setBadgeOfEmployeeToNull();
    }
    this.onUpdateContrat(this.secondModifiedContrat);
  }

  /**
   * Le groupe de travail coché directeur ne peut etre associé qu'à un seul contrat actif
   *  et si on l'affecte à un autre contrat il faut vérifier que les dates des deux contrats ne sont pas confondus
   *  @param :event
   */
  public getPresentConratHasGroupeTravailDirecteur(event) {
    this.presenceDirecteur = false;
    if (event.InfoValue) {
      event.dateEffective = event.InfoValue.dateEffective;
      event.datefin = event.InfoValue.datefin;
    }
    if (!event.idContrat) {
      event.idContrat = 0;
      delete event.uuid;
    }
    this.contratService.getPresentConratHasGroupeTravailDirecteur(event.dateEffective, event.datefin, event.uuid).subscribe(
      (data: boolean) => {
        this.presenceDirecteur = data;
        if (event.InfoValue) {
          this.listContratDisplay.forEach((contrat, index) => {
            if (!event.idContrat) {
              event.idContrat = undefined;
            }
            if (contrat.idContrat === event.idContrat) {
              contrat.presenceDirecteurInfoprimary = data;
              this.listContratDisplay[index].presenceDirecteurInfoprimary = data;

            }
          });
        }
      }, error => {
        console.log(error);
      },
    );
  }

  /**
   * recuperer le yaux horeira deu groupe de trvail selectionné et envoyer vers txHoraire du contrat
   * @param :event
   */
  public sendTxHoraireOfGroupeTravailToTxHoraireOfContrat(event) {
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === event.idContrat) {
        this.listContratDisplay[index].txHoraireGroupeTravail = event.InfoValue;
        contrat.txHoraireGroupeTravail = event.InfoValue;
      }
    });
  }

  /**
   * si groupe de trvail selectionne difffererent de directeur ,
   * presenceDirecteur prend false
   * @param : event
   */
  public setPresenceDirecteurToFalse(event) {
    this.listContratDisplay.forEach((contrat, index) => {
      if (contrat.idContrat === event) {
        this.presenceDirecteur = false;
        contrat.presenceDirecteurInfoprimary = false;
        this.listContratDisplay[index].presenceDirecteurInfoprimary = false;

      }
    });
  }

  /**
   * get Employees form infos
   */
  private getInfoEmployees() {
    this.getParameterByPram();
    this.getArrondiContratSupByRestaurant();
    this.getParameterByParamMonthWeek();
    this.getAllTypeContratActifByRestaurant();
    this.getAllGroupTravailActifByRestaurant();
    this.getRestaurant();
    this.setEmploye();
    this.getListMotifSortie();
    this.getOuvrableParamByRestaurant();
  }

  /**
   * reset le message d'erreur lors de cilque un badge
   */
  public onSelectBadge() {
    this.presenceBadge = false;
  }

  /**
   * reset le message d'erreur lors de clique un motif sortie
   */
  public onSelectMotifSortie() {
    this.presenceMotifSorite = false;
  }

  /**
   * recupere max date effectif en list contrat
   * A la désactivation d’un employé qui n’a pas de contrat futur → on lui affecte le badge null.
   */
  private setBadgeOfEmployeeToNull(filter?) {
    this.sharedEmployee.selectedEmployee.statut = false;
    const datesEffectives = this.listContratDisplay.map(function (contrat) {
      return new Date(contrat.dateEffective);
    });
    const latest = new Date(Math.max.apply(null, datesEffectives));
    if (((moment(this.dateService.setTimeNull(this.contratUpdate.dateEffective)).isBefore(this.dateService.setTimeNull(new Date())))
      || (this.contratUpdate.datefin && moment(this.dateService.setTimeNull(this.contratUpdate.dateEffective)).isSame(this.dateService.setTimeNull(this.contratUpdate.datefin))))
      && moment(this.dateService.setTimeNull(this.contratUpdate.dateEffective)).isSameOrAfter(this.dateService.setTimeNull(latest))) {
      this.sharedEmployee.selectedEmployee.badge = null;
      this.badge = null;
      this.popupAddBadgeToEmployee = false;
      if (this.employee) {
        this.employee.badge = null;

      }
    }
    if (filter) {
      this.saveContrat();
    }
  }

  /**
   * activer ou desactiver contrat
   * @param: contratId
   */
  private activeDesactiveContrat(contratId: number) {
    this.presenceDateFin = false;
    if (this.sharedEmployee.selectedEmployee.statut) {
      this.showTotalDispoMessageErrorExist(this.employee);
    } else {
      this.listContratDisplay.forEach((contrat, index) => {
        if (contrat.idContrat === contratId) {
          this.contratUpdate = {...contrat};
          contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);
          if (moment(contrat.dateEffective).isSameOrBefore(this.dateService.setTimeNull(new Date()))) {
            this.contratUpdate.dateSortie = null;
            this.contratUpdate.motifSortie = null;
            if (!contrat.typeContrat.dureeDetermine) {
              this.contratUpdate.datefin = null;
              this.saveContrat();
            } else {
              this.popupUpdateDateFinContrat = true;
              this.contratUpdate.datefin = null;

            }
          }
        }
      });
    }
  }

  /**
   * disactiver contrat de type cdi qui a  un motif sortie
   */
  public disactiveContratCDIHasMotifSortie(idContrat) {
    this.listContratDisplay.forEach((contratDisplay, index) => {
      if (contratDisplay.idContrat === idContrat) {
        let dateNow = new Date();
        dateNow = this.dateService.setTimeNull(dateNow);
        contratDisplay.dateEffective = this.dateService.setTimeNull(contratDisplay.dateEffective);

        if (moment(contratDisplay.dateEffective).isSame(dateNow)) {
          contratDisplay.datefin = dateNow;
        } else {
          dateNow.setDate(dateNow.getDate() - 1);
          contratDisplay.datefin = dateNow;
        }
        contratDisplay.actif = false;
        this.contratUpdate = JSON.parse(JSON.stringify(contratDisplay));
        this.setBadgeOfEmployeeToNull('cdiHasMotifSortie');
        return;

      }
    });
  }

  /**
   *date de fin commence par date du jour
   * @param: dateEffective
   */
  public addDaysToDateEffective(dateEffective: Date): Date {
    let datetest = null;
    const date = new Date();
    if (dateEffective) {
      dateEffective = new Date(dateEffective);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      dateEffective.setHours(0);
      dateEffective.setMinutes(0);
      dateEffective.setSeconds(0);
      dateEffective.setMilliseconds(0);
      if (moment(dateEffective).isSame(date)) {
        datetest = moment(dateEffective).add(1, 'days').toDate();
      } else if (moment(dateEffective).isBefore(date)) {
        datetest = new Date();

      }
    }
    return datetest;
  }

  /**
   * fermer la popup de badge
   */
  public closePopup() {
    this.popupAddBadgeToEmployee = false;
    this.badge = null;
  }

  /**
   * recuperation la valeur d'ouvrable a partir de parametre  par restaurant
   */
  public getOuvrableParamByRestaurant(): void {
    this.parametreGlobalService.getOuvrableParamByRestaurant().subscribe(
      (data: ParametreModel) => {
        if (data.valeur === 'true') {
          this.ouvrableParama = true;
        }
      }
    );
  }

  /**
   * recuperer l'interval de date fin lors de desactivation d'un contrat cdi qui est superiere à la date effectif
   * @param dateEffective
   */
  public getMinDateFinCdi(dateEffective: Date): Date {
    let datetest = null;
    if (dateEffective) {
      dateEffective = new Date(dateEffective);
      datetest = moment(dateEffective).add(1, 'days').toDate();
    }
    return datetest;
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :idAvenant
   */
  public showConfirmDeleteContrat(idContrat: number, uuidContrat: string): void {
    this.setcontratInActif = false;
    let headerSuppression = null;
    event.stopPropagation();
    this.listContratDisplay.forEach((contratToDelete: ContratModel, index: number) => {
      if (contratToDelete.idContrat === idContrat) {
        const dateContrat = this.clone(contratToDelete.dateEffective);
        if (contratToDelete.avenantContrats && contratToDelete.avenantContrats.length) {
          headerSuppression = this.rhisTranslateService.translate('CONTRAT.TEXT_SUPPRESSION_CONTRAT_AVENANT') + ' ' + this.dateService.formatDateTo(dateContrat, 'DD/MM/YY');
        } else {
          headerSuppression = this.rhisTranslateService.translate('CONTRAT.TEXT_SUPPRESSION_CONTRAT') + ' ' + this.dateService.formatDateTo(dateContrat, 'DD/MM/YY');
        }
        if (contratToDelete.actif) {
          this.setcontratInActif = true;
        }
      }
    });

    this.confirmationService.confirm({
      message: headerSuppression,
      header: this.rhisTranslateService.translate('CONTRAT.SUPPRESSION_CONTRAT'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteContrat(idContrat, uuidContrat);

      },
      reject: () => {
      }
    });
  }

  private onConfirmDeleteContrat(idContrat: number, uuidContrat: string): void {
    let contratDelete;
    this.listContratDisplay.forEach((contratDisplay, index) => {
      if (contratDisplay.idContrat === idContrat) {
        contratDelete = contratDisplay;
      }
    });
    this.contratService.deleteAvenant(uuidContrat).subscribe(
      (data: number) => {

        // supprimer avenat de list contrat
        this.updateListUpdateAfterDeleteContrat(contratDelete);
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.DELETE_SUCCESS'));

      }
    );
  }

  public updateListUpdateAfterDeleteContrat(contratToDelete: ContratModel): void {
    let contratAfterDate;
    if (this.setcontratInActif) {
      this.sharedEmployee.selectedEmployee.statut = false;
    }
    contratAfterDate = this.listContratDisplay.filter((element: ContratModel) => (element.idContrat !== contratToDelete.idContrat) && (element.actif ||
      (moment(this.dateService.setTimeNull(element.dateEffective)).isSameOrAfter(this.dateService.setTimeNull(new Date())))));
    if (contratAfterDate.length === 0) {
      this.sharedEmployee.selectedEmployee.badge = null;
      this.badge = null;
    }
    this.deleteListAvenant(contratToDelete);
  }

  /**
   * supprimer avenant de list display
   * @param :contrat
   */
  public deleteListAvenant(contratDelete: ContratModel): void {
    this.listContratDisplay.forEach((contrat: ContratModel, index: number) => {
      if (contrat.idContrat === contratDelete.idContrat) {
        if (contrat.avenantContrats) {
          delete contratDelete.avenantContrats;
        }
        this.listContratDisplay.splice(index, 1);
      }
    });
  }


  // dpae
  async checkParametreDPAE() {
    const paramList: ParametreModel[] = await this.parametreGlobalService.getParamRestaurantByCodeNames(this.DPAE_PARAMETRE).toPromise();
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DPAE_PARAMETRE);
    if (index !== -1) {
      return paramList[index].valeur !== 'false';
    }
    return false;
  }

  showDPAE_popup(): void {

    if (this.dpaeStatut.statut === DPAEStateEnum.NOT_YET_WITH_COMPLETE_INFOS
      || (this.dpaeStatut.statut === DPAEStateEnum.REJECTED
        && this.dpaeStatut.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
      this.popupVisibilityDPAE = true;
      this.pop_up_dape_title = this.rhisTranslateService.translate('DPAE.TITLE_RECAP');
    }

    if (this.dpaeStatut.statut === DPAEStateEnum.NOT_YET_WITH_MISSED_INFOS
      || (this.dpaeStatut.statut === DPAEStateEnum.REJECTED && !this.dpaeStatut.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
      this.popupVisibilityDPAE = true;
      this.pop_up_dape_title = this.rhisTranslateService.translate('DPAE.TITLE_MANQUANT');
    }
    // if (this.dpaeStatut.statut === DPAEStateEnum.DISABLED || this.dpaeStatut.statut === DPAEStateEnum.ACCEPTED) {
    //   console.log('')
    // }
  }

  updateDPAE(event: DpaeStatut): void {
    this.dpaeStatut = event;
  }

  closeDPAE() {
    this.popupVisibilityDPAE = false;
  }

}
