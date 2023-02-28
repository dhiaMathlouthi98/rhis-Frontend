import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {PositionTravailService} from '../../../../configuration/service/position-travail.service';
import {PeriodeManagerService} from '../../../../../../shared/module/restaurant/service/periode.manager.service';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {VerificationContrainteModel} from '../../../../../../shared/model/verificationContrainte.model';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import * as moment from 'moment';
import {ContratModel} from '../../../../../../shared/model/contrat.model';
import {LoiEmployeeModel} from '../../../../../../shared/model/loi.employee.model';
import {LoiGroupeTravailModel} from '../../../../../../shared/model/loi.groupe.travail.model';
import {LoiRestaurantModel} from '../../../../../../shared/model/loi.restaurant.model';
import {RestaurantService} from '../../../../../../shared/service/restaurant.service';
import {ContratService} from '../../../../employes/service/contrat.service';
import {LoiRestaurantService} from '../../../../../../shared/module/restaurant/service/loi.restaurant.service';
import {LoiGroupeTravailService} from '../../../../../../shared/module/restaurant/service/loi.groupe.travail.service';
import {LoiEmployeeService} from '../../../../../../shared/module/restaurant/service/loi.employee.service';
import {NationaliteModel} from '../../../../../../shared/model/nationalite.model';
import {NationaliteService} from '../../../../configuration/service/nationalite.service';
import {Sexe} from '../../../../../../shared/enumeration/Sexe.model';
import {SemaineReposService} from '../../../../employes/service/semaine-repos.service';
import {SemaineReposModel} from '../../../../../../shared/model/semaineRepos.model';
import {JoursFeriesService} from '../../../../../../shared/module/params/jours-feries/service/jours.feries.service';
import {JourFeriesModel} from '../../../../../../shared/model/jourFeries.model';
import {Observable, Subject} from 'rxjs';
import {PeriodeManagerModel} from '../../../../../../shared/model/periode.manager.model';
import {PlanningManagerModel} from '../../../../../../shared/model/planningManager.model';
import {PlanningManagerService} from '../../service/planning-manager.service';
import {ParamNationauxService} from '../../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {DisponiblitePairOrOdd} from '../../../../../../shared/enumeration/disponiblitePairOrOdd';
import {SessionService} from '../../../../../../shared/service/session.service';
import {DecoupageHoraireModel} from '../../../../../../shared/model/decoupage.horaire.model';
import {DecoupageHoraireService} from '../../../configuration/service/decoupage.horaire.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import {PlanningManagerProductifModel} from '../../../../../../shared/model/planningManagerProductif.model';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import {CodeNameContrainteSocial} from '../../../../../../shared/enumeration/codeNameContrainteSocial';
import {ShiftService} from '../../../planning-equipier/service/shift.service';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import * as rfdc from 'rfdc';
import {RapportModel} from '../../../../../../shared/model/rapport.model';
import {RapportService} from '../../../../employes/service/rapport.service';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';
import {AbsenceCongeModel} from '../../../../../../shared/model/absence.conge.model';

declare var interact;


@Component({
  selector: 'rhis-planning-manager-vue-poste-container',
  templateUrl: './planning-manager-vue-poste-container.component.html',
  styleUrls: ['./planning-manager-vue-poste-container.component.scss'],

})
export class PlanningManagerVuePosteContainerComponent implements OnInit, AfterViewChecked, AfterViewInit {
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public listPairAndOdd: DisponiblitePairOrOdd [] = [];
  // s'il y a une contrainte bloquante le button save sera cacher
  public hiddenSave = false;
  // si on clique sur le button sup
  public showConfimeDelete = false;
  public dateJour;
  public JoursSemainEnum = [];
  public draggableElementPlanningManager: any;
  public shiftManagerToSave: any;
  public showPopAddShiftManager = false;
  public listContrainte: VerificationContrainteModel[] = [];
  public popupVerificationContrainteVisibility = false;
  public messageVerification = {} as VerificationContrainteModel;
  public planningHasAnomalieContraintSocial = {} as EmployeeModel;
  public dateContraintSocial: any;
  public selectedPeriode = {} as PeriodeManagerModel;
  public decoupageHoraireFinEtDebutActivity: any;
  public listPlanningManagerPreviousAndNextWeek: PlanningManagerModel[] = [];
  private MIN_BEFORE_COUPURE_CODE_NAME = 'MINBEFORCOUPURE';
  public modeAffichage = 0;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  // list palnning managet qui on va la sauvegarder dans la base de donnee
  public listPlanningManagerOrLeaderToUpdate: PlanningManagerModel[] = [];
  // list id planning manger pour les supprimer
  public listIdShiftManagerOrLeaderToDelete: any[] = [];
  public listShiftManagerOrLeaderByPeriodeToDelete: any[] = [];
  public listShiftManagerByManagerToDelete: any[] = [];
  public filter: string;
  public listContrainteMinTimeInWeek: VerificationContrainteModel[] = [];
  public minBeforeCoupure = 0;
  private listLoi: any;
  private semaineRepos: SemaineReposModel[] = [];
  public draggableElementShiftManager: any;
  public listManagerOrLeaderActif: EmployeeModel[] = [];
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public listPlanningManagerOrLeader: PlanningManagerModel[] = [];
  public listePositionTravail: PositionTravailModel[] = [];

  public totalShiftManagerInWeek = 0;
  public firstDayAsInteger = 0;
  public listPeriodeWithPlanningManager: PeriodeManagerModel[] = [];

  public planningByPeriode = new Map();
  public listLoiByEmployee = new Map();
  public listLoiByGroupTravail = new Map();
  public values = [];
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public employeInactif = false;
  days: any[] = [];
  public addPopupTitle = this.rhisTranslateService.translate('PLANNING_MANAGER.MODAL_ADD_TITLE');
  public updatePopupTitle = this.rhisTranslateService.translate('PLANNING_MANAGER.MODAL_UPDATE_TITLE');
  // error messages
  public dateDebutSupDateFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_DEBUT_SUP_DATE_FIN');
  public dateFinWithoutDateDebutErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_FIN_WITHOUT_DATE_DEBUT');
  public heureDebutSupHeureFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.HEURE_DEBUT_SUP_HEURE_FIN');
  public limiteHeureDebut: Date;
  public titlePopupContraint = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIES');
  public listJourFeriesByRestaurant;
  public setNightValue;
  public listPeriodesManager: PeriodeManagerModel[];
  public messageConfonduPlanningManger = '';
  public planningThreeWeeksByManager = new Map();
  public listPlanningManageOrLeaderrForThreeWeeks: PlanningManagerModel[];
  public listIdPlanningManagerProductifsToDelete = [];
  public absenceConge = [];
  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 800,
    height: 700
  };
  public jourSem = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
  public jourSemEng = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  public dateFin: Date;
  public dateDebut: Date;
  public jourDebutWeekEnd: JourSemaine;
  public heureDebutWeekEnd: Date;
  public jourFinWeekEnd: JourSemaine;
  public frConfig: any;
  public heureFinWeekEnd: Date;
  public premierJourDeLaSemaine: JourSemaine;
  public contratActif = {} as ContratModel;
  public dateContrainteAcheve: any;
  public tempsTravailPartiel = false;
  public mineur: boolean;
  public calendar_fr;
  public weekSelected;
  public valeurProductif;
  public contratIdActifDefault;
  // recupere le nouveau planning lors de drag and drap
  public planningManagerNewDragAndDrop;

  public contentHeightPlanning: number;
  public url;
  // verification si planning leader ou planning manager
  public hasPlanningLeader = 0;
  @ViewChild('contentBodyPlan') calcHeight: ElementRef;
// pour afficher le manager ou leader qui ont des historiques de planning manager ou leader
  public listManagerOrleaderInactif: EmployeeModel[] = [];
  public eventCtrl = false;
  public navigateTo = false;
  public changeDate = false;
  public downDate = false;
  public upDate = false;
  public saveGenaral = false;
  public startActivity: any;
  public endActivity: any;
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;
  public startTime: string;
  public startTimeIsNight: boolean;
  public endTime: string;
  public endTimeIsNight: boolean;
  private ecran = 'VPM';
  public loiGroupeTravail = [];
  public loiRestaurant = [];
  public clone = rfdc();

  private weeksPerMonth = [];

  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  public listContrainteSuppression: VerificationContrainteModel[] = [];
  public popupVerificationCsMaxShift = false;
  public idManagerOrLeader: number;
  public index: any;
  public idShiftToDelete: any;
  public shiftToDelete: any;

  public showPopupRapport = false;
  public PLANNING_MANAGERS = 'PLG_MANAGER_RAPPORT';
  public selectedRapport: RapportModel;
  public listRapports: RapportModel[];
  public changePositionAfterDragAnDrop = false;

  constructor(
    private confirmationService: ConfirmationService,
    private rhisTranslateService: RhisTranslateService,
    private employeeService: EmployeeService,
    private sharedRestaurant: SharedRestaurantService,
    private dateService: DateService,
    private positionTravailService: PositionTravailService,
    private contrainteSocialeService: ContrainteSocialeService,
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private contratService: ContratService,
    private loiRestaurantService: LoiRestaurantService,
    private loiGroupeTravailService: LoiGroupeTravailService,
    private employeeLawService: LoiEmployeeService,
    private nationnaliteService: NationaliteService,
    private semaineReposService: SemaineReposService,
    private joursFeriesServie: JoursFeriesService,
    private cdRef: ChangeDetectorRef,
    private periodeManagerService: PeriodeManagerService,
    private planningManagerService: PlanningManagerService,
    private paramNationauxService: ParamNationauxService,
    private router: Router,
    public rhisRouter: RhisRoutingService,
    private sessionService: SessionService,
    private decoupageHoraireService: DecoupageHoraireService,
    private domControlService: DomControlService,
    private helperService: HelperService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private shiftService: ShiftService,
    private rapportService: RapportService,
    private parametreService: ParametreGlobalService,
    private limitDecoupageService: LimitDecoupageFulldayService
  ) {
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

  ngOnInit() {
    this.initCalender();
    this.getParamRestaurantByCodeNames();
    this.getDecoupageHoraire();
    this.getRestaurantLawsByCodeName();
    this.getSelectedRestaurant();
    this.getPlanningManagerOrPlanningLeader();
    this.getAllperiodesManager();
    this.getHeureLimite();
    this.getListePositionTravailProductifByRestaurant();
    this.getvaleurProductif();
    this.getParamNationauxByRestaurant();
    this.getListRapportByCodeName();
    setTimeout(() =>
        this.onReadyInitDrag() // initialisation de l'interraction du drag & drop des cards
      , 300);

  }

  /**
   *get param MINBEFORCOUPURE pour vérifier le nbre max  de coupure par semaine
   */
  public getParamRestaurantMinBeforeCoupur(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.MIN_BEFORE_COUPURE_CODE_NAME);
    if (index !== -1) {
      this.minBeforeCoupure = +paramList[index].valeur;
    }
  }

  private getParamRestaurantByCodeNames(): void {
    const codeNamesAsArray = [this.MIN_BEFORE_COUPURE_CODE_NAME, this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    this.parametreService.getParamRestaurantByCodeNames(codeNames).subscribe(
      (data: ParametreModel[]) => {
        this.getParamRestaurantMinBeforeCoupur(data);
        this.getDisplayMode24H(data);
      }
    );
  }

  public getDisplayMode24H(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      this.modeAffichage = +paramList[index].valeur;
    }
  }

  /**
   *  récupération de la liste des rapports de MyRhis
   */
  private getListRapportByCodeName(): void {
    this.rapportService.getAllRapportWithCodeNameByRestaurant().subscribe(
      (data: any) => {
        this.listRapports = data;

      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }


  /**
   * ajouter des shifts et leures break
   ** @param :shift
   * @param :breakOfParmatre
   */
  public setShiftAndBreakOfParmetreNationaux(shift: Date, breakOfParmatre: Date): void {
    const breakAndShift = {} as BreakAndShiftOfParametresNationauxModel;
    if (shift) {
      breakAndShift.shift = shift;
    }
    if (breakOfParmatre) {
      breakAndShift.break = breakOfParmatre;
    }
    if (breakOfParmatre && shift) {
      this.listOfBreakAndShift.push(breakAndShift);
    }
  }

  /**
   * récuperer les parametres nantionaux
   */
  private getParamNationauxByRestaurant(): void {
    this.paramNationauxService.getParamNationauxByRestaurant().subscribe((data: ParametreNationauxModel) => {
        this.paramNationaux = data;
        this.sortBreakInParametresNationaux();
      }
    );
  }

  /**
   * Trie les shifts et leurs break de paramtres nationaux
   */
  private sortBreakInParametresNationaux(): void {
    if (this.paramNationaux.dureeShift1) {
      this.paramNationaux.dureeShift1 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift1);
    }
    if (this.paramNationaux.dureeShift2) {
      this.paramNationaux.dureeShift2 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift2);
    }
    if (this.paramNationaux.dureeShift3) {
      this.paramNationaux.dureeShift3 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift3);
    }
    if (this.paramNationaux.dureeBreak1) {
      this.paramNationaux.dureeBreak1 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak1);
    }
    if (this.paramNationaux.dureeBreak2) {
      this.paramNationaux.dureeBreak2 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak2);
    }
    if (this.paramNationaux.dureeBreak3) {
      this.paramNationaux.dureeBreak3 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak3);
    }
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift1, this.paramNationaux.dureeBreak1);
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift2, this.paramNationaux.dureeBreak2);
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift3, this.paramNationaux.dureeBreak3);
    this.listOfBreakAndShift.sort(function (a: BreakAndShiftOfParametresNationauxModel, b: BreakAndShiftOfParametresNationauxModel) {
      if (a.break < b.break) {
        return -1;
      }
      if (a.break > b.break) {
        return 1;
      }
      return 0;
    });
  }

  /**
   *Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe,
   * il faut garder et afficher l’historique des plannings
   */
  public getHistoriqueOfPlanningManagerOrPlanningLeader(): void {
    this.listManagerOrleaderInactif = [];
    if (this.listPlanningManagerOrLeader && this.listPlanningManagerOrLeader.length) {
      this.listPlanningManagerOrLeader.forEach((planningManagerOrLeader: PlanningManagerModel) => {
        const exist = this.listManagerOrLeaderActif.some((ManagerOrLeader: EmployeeModel) =>
          ManagerOrLeader.idEmployee === planningManagerOrLeader.managerOuLeader.idEmployee
        );
        // ajpouter des managers pou leaders ont de plannings manager ou leader et non pas actif ou leurs groupes travails ont changés
        if (!exist) {
          planningManagerOrLeader.managerOuLeader.disablePlanningManagerOrLeaderOrFixe = true;
          this.listManagerOrleaderInactif.push(planningManagerOrLeader.managerOuLeader);
        }

      });
    }
  }

  /**
   * on va gerer  planning manager ou planning leader selon l'url
   */
  public getPlanningManagerOrPlanningLeader(): void {
    this.url = this.router.url;
    if (this.url.includes('leader')) {
      this.hasPlanningLeader = 1;
      this.addPopupTitle = this.rhisTranslateService.translate('PLANNING_LEADER.MODAL_ADD_TITLE');
      this.updatePopupTitle = this.rhisTranslateService.translate('PLANNING_LEADER.MODAL_UPDATE_TITLE');
      this.getGroupeTravailLawsByCodeName();
      this.getSelectedRestaurant();

    } else if (this.url.includes('manager')) {
      this.hasPlanningLeader = 0;
      this.getGroupeTravailLawsByCodeName();
      this.getSelectedRestaurant();
    }
  }

  /**
   * recuperer tous les jours feries par restaurant
   */
  private getJourFeriesByRestaurant() {
    this.joursFeriesServie.getAllJourFeriesByRestaurantAndDate(this.dateDebut).subscribe((data: JourFeriesModel[]) => {
        this.listJourFeriesByRestaurant = data;

      },
    );
  }

  /* get list periodes manager*/
  private getAllperiodesManager() {
    this.periodeManagerService.getAllPeriodeManagerByRestaurant().subscribe(
      (data: PeriodeManagerModel[]) => {
        this.listPeriodesManager = data;
      },
      (err) => {
        // TODO
        console.log(err);
      }
    );
  }

  /**
   * Il ne peut pas y avoir plus de valeur productif
   */
  private getvaleurProductif() {
    this.paramNationauxService.getvaleurProductif().subscribe(
      (data: any) => {
        this.valeurProductif = data;
      },
      (err) => {
        // TODO
        console.log(err);
      }
    );
  }

  /**
   * recupere le contrat actif
   */
  private getContratByManagerActif(employee: EmployeeModel, dateOfPlanning: Date, filterDragAndDrop?: string) {
    let shiftToSave = null;
    if (filterDragAndDrop) {
      const indexPlanningOrLeaderToMove = this.listPlanningManagerOrLeader.findIndex((shift: PlanningManagerModel) => shift.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
      if (indexPlanningOrLeaderToMove !== -1) {
        shiftToSave = this.clone(this.listPlanningManagerOrLeader[indexPlanningOrLeaderToMove]);
      }
    }
    if (employee.absenceConges && employee.absenceConges.length) {
      this.absenceConge = employee.absenceConges;
    }
    this.contratService.getActifContratByEmployeeWithDisponiblite(employee.uuid, dateOfPlanning).subscribe(
      (data: any) => {
        if (data) {
          this.employeInactif = false;
          this.getFullContrat(employee, data);
          this.checkIsFoundJourReposByEmployee(employee);
          this.identifierEmployee(employee, filterDragAndDrop);
        } else {
          this.employeInactif = true;
          if (filterDragAndDrop) {
            this.resetCradInitialPlace(shiftToSave);
            this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');

          }

        }
      }
    );

  }

  /**
   * reset the card to the initial place
   */
  private resetCradInitialPlace(shift: PlanningManagerModel): void {
    if (shift && shift.acheval) {
      const indexShiftToMove = this.listPlanningManagerOrLeader.findIndex((item: PlanningManagerModel) => item.idPlanningManager === shift.idPlanningManager && !item.shiftAchevalHidden);
      let shiftDisplay = this.listPlanningManagerOrLeader[indexShiftToMove];
      if (!shiftDisplay) {
        shiftDisplay = this.clone(shift);
      }
      this.draggableElementPlanningManager.style.transform = this.draggableElementPlanningManager.style.webkitTransform = 'translate(0,0)';
    } else {
      this.draggableElementPlanningManager.style.transform = this.draggableElementPlanningManager.style.webkitTransform = 'translate(0, 0)';
    }
    // reset the posiion attributes
    this.draggableElementPlanningManager.setAttribute('data-x', 0);
    this.draggableElementPlanningManager.setAttribute('data-y', 0);
  }

  /**
   * si l'employe a un contrat actif
   * @param: employee
   * @param: contrat
   */
  private getFullContrat(employee: EmployeeModel, contrat: any): void {
    this.contratActif = contrat;
    employee.contrats[0] = contrat;
    this.contratIdActifDefault = this.contratActif.idContrat;
    if (contrat.tempsPartiel) {
      this.tempsTravailPartiel = true;
    } else {
      this.tempsTravailPartiel = false;
    }
  }

  /**
   * recuprer le jours  de repos de l'employee
   */
  private checkIsFoundJourReposByEmployee(employee): void {
    if (this.semaineRepos.length > 0) {
      if (this.semaineRepos[0].employee.idEmployee !== employee.idEmployee) {
        this.getAllJourReposByEmployee(employee);
      }
    } else {
      this.getAllJourReposByEmployee(employee);
    }
  }

  /**
   * permet de recupere le sexe et l'age de l 'employee
   * @param: employee
   */
  private identifierEmployee(employee: EmployeeModel, filterDragAndDrop?: string) {

    const dateNaissance = new Date(Date.parse(employee.dateNaissance));
    const dateCourante = new Date();
    const age = moment(dateCourante).diff(moment(dateNaissance), 'year');
    if ((age >= this.sharedRestaurant.selectedRestaurant.pays.majeurMasculin && employee.sexe === Sexe.MASCULIN) ||
      (age >= this.sharedRestaurant.selectedRestaurant.pays.majeurFeminin && employee.sexe === Sexe.FEMININ)) {
      this.mineur = false;
    } else {
      this.mineur = true;
    }
    if (employee.hasLaws) {
      // employee laws
      this.getEmployeeLaws(employee, filterDragAndDrop);
    } else if (employee.contrats[0].groupeTravail.hasLaws) {
      // groupe trav laws
      this.getGroupeTravailLaws(employee, filterDragAndDrop);
    } else {
      // restaurant laws
      this.getRestaurantLaws(employee, filterDragAndDrop);
    }
  }

  /**
   * Cette methode permet de verifier si  la liste des loi de l'employee existe
   *
   * @param :idEmployee
   */
  private getEmployeeLaws(employee: EmployeeModel, filterDragAndDrop?) {
    if (this.listLoiByEmployee.size > 0) {
      if (!this.listLoiByEmployee.has(employee.idEmployee)) {
        this.getLawEmployeeUsedInVerificationContraintSocial(employee, filterDragAndDrop);

      } else {
        this.listLoi = this.listLoiByEmployee.get(employee.idEmployee);
        if (filterDragAndDrop) {
          this.checkShiftChangePosition(employee);
        }
      }
    } else {
      this.getLawEmployeeUsedInVerificationContraintSocial(employee, filterDragAndDrop);
    }
  }

  /**
   * permet de recupere le list de loi de employee
   * @param: employee
   * @param :filterDragAndDrop
   */
  private getLawEmployeeUsedInVerificationContraintSocial(employee, filterDragAndDrop?) {
    this.employeeLawService.getEmployeeLawUsedInVerificationContraintSocial(employee.uuid).subscribe(
      (data: LoiEmployeeModel[]) => {
        this.listLoiByEmployee = this.loiByEmployeeOrGroupTravail(employee.idEmployee, data, this.listLoiByEmployee);
        this.listLoi = this.listLoiByEmployee.get(employee.idEmployee);
        this.filter = 'employee';
        if (filterDragAndDrop) {
          this.checkShiftChangePosition(employee);
        }
      },
      (err: any) => {
      }
    );
  }


  /**
   * Cette methode permet de verifier si  la liste des loi de groupe de travail existe
   *
   * @param :idGroupeTravail
   */
  private getGroupeTravailLaws(employee: EmployeeModel, filterDragAndDrop?: string) {
    if (this.listLoiByGroupTravail.size > 0) {
      if (!this.listLoiByGroupTravail.has(employee.contrats[0].groupeTravail.idGroupeTravail)) {
        this.getLawGroupTravailUsedInVerificationContraintSocial(employee, filterDragAndDrop);
      } else {
        this.listLoi = this.listLoiByGroupTravail.get(employee.contrats[0].groupeTravail.idGroupeTravail);
        if (filterDragAndDrop) {
          this.checkShiftChangePosition(employee);
        }
      }
    } else {
      this.getLawGroupTravailUsedInVerificationContraintSocial(employee, filterDragAndDrop);
    }
  }

  /**
   * Cette methode permet de recuperer la liste des loi du groupe de travail dont son identifiant est passe en param
   *
   * @param :idGroupeTravail
   */
  private getLawGroupTravailUsedInVerificationContraintSocial(employee: EmployeeModel, filterDragAndDrop?: string) {
    this.loiGroupeTravailService.getGroupeTravailLawsWithoutPagination(employee.contrats[0].groupeTravail.uuid).subscribe(
      (data: LoiGroupeTravailModel[]) => {
        this.listLoi = data;
        this.listLoiByGroupTravail = this.loiByEmployeeOrGroupTravail(employee.contrats[0].groupeTravail.idGroupeTravail, data, this.listLoiByGroupTravail);
        this.listLoi = this.listLoiByGroupTravail.get(employee.contrats[0].groupeTravail.idGroupeTravail);
        this.filter = 'groupeTravail';
        if (filterDragAndDrop) {
          this.checkShiftChangePosition(employee);
        }
      },
      (err: any) => {
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des loi du restaurant
   */
  private getRestaurantLaws(employee: EmployeeModel, filterDragAndDrop?: string) {
    if (this.filter !== 'restaurant') {
      this.loiRestaurantService.getAllActifLoiRestaurantByIdRestaurant().subscribe(
        (data: LoiRestaurantModel[]) => {
          this.listLoi = data;
          this.filter = 'restaurant';
          if (filterDragAndDrop) {
            this.checkShiftChangePosition(employee);
          }
        },
        (err: any) => {
        }
      );
    } else if (filterDragAndDrop) {
      this.checkShiftChangePosition(employee);
    }
  }

  /**
   * get parametre of restaurant saved in shared service
   *
   */
  private getParamNatValues() {
    this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    this.jourDebutWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourWeekend;
    this.jourFinWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.dernierJourWeekend;
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);

    this.setJourPlanninfManagerInTHeWeek();
  }

  /**
   * on dit récupérer la liste de planning manager de la semaine precedente ou suivante
   */
  updateOrDownDate(): void {
    this.values = [];
    let start = JSON.parse(JSON.stringify(this.dateDebut));
    start = new Date(start);
    this.dateDebut = null;
    if (this.downDate) {
      start.setDate(start.getDate() - 7);
    } else if (this.upDate) {
      start.setDate(start.getDate() + 7);
    }
    this.dateDebut = start;
    this.values[0] = this.dateDebut;
    const end = new Date(this.dateDebut);
    end.setDate(this.dateDebut.getDate() + 6);
    this.values[1] = end;
    this.dateFin = end;
    this.weekSelected = this.getWeekNumber(this.dateDebut);
    this.sessionService.setCurrentWeek(this.weekSelected);
    this.sessionService.setCurrentYear(this.dateDebut.getFullYear().toString());
    this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.dateDebut, 'YYYY-MM-DD'));
    this.findAllEmployeActifWithGroupTravailsPlgManagerOrManager();
    this.changeDate = false;
    this.getWeeksByMonthByRestaurant(this.dateDebut, false);
  }

  /**
   * recuperer la semmaine selon la date choisi par utlisateur
   * @param :date
   */
  public selectDate(date, filter?) {
    if (date) {
      this.values = [];
      let start = new Date(date);
      const dateSelected = new Date(date);
      start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
      this.values[0] = start;
      this.dateDebut = start;
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      this.values[1] = end;
      this.dateFin = end;
      if (!filter) {
        this.weekSelected = this.getWeekNumber(start);
        this.sessionService.setCurrentWeek(this.weekSelected);
        this.sessionService.setCurrentYear(this.dateDebut.getFullYear().toString());
        this.saveContentAfterChangeDate();
      } else {
        this.findAllEmployeActifWithGroupTravailsPlgManagerOrManager();
      }
    }
    this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.dateDebut, 'YYYY-MM-DD'));
    this.getWeeksByMonthByRestaurant(this.dateDebut, false);

  }

  /**
   * get pâyes of restaurant
   */
  private getPaysOfRestaurant() {
    this.nationnaliteService.getNationaliteByRestaurant().subscribe(
      (data: NationaliteModel) => {
        this.sharedRestaurant.selectedRestaurant.pays = data;
        this.getParamNatValues();
        this.setColumns();

      }, (err: any) => {
        // TODO error panel
        console.log(err);
      }
    );
  }

  public setWeeksValue(event: any): void {
    this.getWeeksByMonthByRestaurant(new Date(event.year, (+event.month) - 1), false, true);
  }

  /**
   * recuperer la semaine selectionne de planning home
   */
  private setWeekSelected(): void {
    this.weekSelected = +this.sessionService.getCurrentWeek();
    const yearSelected = +this.sessionService.getCurrentYear();
    this.getWeekPairOrOdd(this.weekSelected);
    this.getWeeksByMonthByRestaurant(this.dateService.createDateFromStringPattern(this.sessionService.getLastSelectedDate(), 'YYYY-MM-DD'), true);
  }

  /**
   * recuprer list de sift apres et avant semaine courant
   */
  public getListPlanningManagersPreviousAndNextWeek(): void {
    this.planningManagerService.getListPlanningManagersPreviousAndNextWeek(this.dateDebut, this.dateFin, this.hasPlanningLeader).subscribe(
      (data: PlanningManagerModel[]) => {
        this.listPlanningManagerPreviousAndNextWeek = data;
        this.listPlanningManagerPreviousAndNextWeek.forEach((planning: PlanningManagerModel) => {
          this.setCorrectTimeToDisplay(planning);
          this.dateService.setCorrectTimeToDisplayForShift(planning);

        });
        this.getListPlanningManagers();


      }, (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des plannings managers
   */
  public getListPlanningManagers(): void {
    this.planningManagerService.getListPlanningManagers(this.dateDebut, this.dateFin, this.hasPlanningLeader).subscribe(
      (data: PlanningManagerModel[]) => {
        data.forEach((planning: PlanningManagerModel, index: number) => {
          this.setCorrectTimeToDisplay(planning);
          if (this.checkEmployeIsAbsent(planning)) {
            data.splice(index, 1);
          }
        });
        this.listPlanningManagerOrLeader = data;
        this.listPlanningManagerOrLeader.forEach((planning: PlanningManagerModel, index: number) => {
          this.setCorrectTimeToDisplay(planning);
          this.dateService.setCorrectTimeToDisplayForShift(planning);
          if (planning.acheval && planning.modifiable && !moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
            this.listPlanningManagerOrLeader.push(this.shiftService.addShiftAcheval(this.clone(planning), true));
          }
          planning = this.setAchevalWeekToShift(planning);
          if (planning.planningManagerProductif && planning.planningManagerProductif.length) {
            planning.planningManagerProductif.forEach(production => {
              this.setCorrectTimeToDisplay(production, true);

            });
            planning.managerOuLeader.fullName = planning.managerOuLeader.nom + ' ' + planning.managerOuLeader.prenom;

          }
        });
        this.listPeriodeWithPlanningManager = [];
        this.planningByPeriode = new Map();
        this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);

        this.planningByPeriode = this.groupPlanningByPeriode(this.listPlanningManagerOrLeader, plg => plg.periodeManager.idPeriodeManager);
        if (this.listPlanningManagerOrLeader.length > 0) {
          this.fillAvailablePeriodeActif();
        }
        this.upDate = false;
        this.downDate = false;
        this.sessionService.setCurrentYear(this.dateDebut.getFullYear().toString());
        this.sessionService.setCurrentWeek(this.weekSelected.toString());
        this.getHistoriqueOfPlanningManagerOrPlanningLeader();
        this.getJourFeriesByRestaurant();
        this.getListPlanningManagersForThreeWeeks();
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  public setAchevalWeekToShift(planning: PlanningManagerModel): PlanningManagerModel {
    if (planning.acheval) {
      if (!planning.modifiable) {
        planning.heureFinIsNight = false;
        planning.heureDebutIsNight = false;
        planning.achevalWeek = true;
      } else if (moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        planning.achevalWeek = true;
      }
    }
    return planning;
  }


  /**
   * recuperer le contrat actif
   * @param event
   */
  public initValuesForVerificationContrainte(event: any): void {
    this.showPopAddShiftManager = false;
    this.getContratByManagerActif(event.employee, event.day);
  }

  /**
   * recuperer debut et fin de journée d'activitée
   * @param :day
   */
  public getLastAndFirstDayOfActivity(day: string): void {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(day);
  }

  /**
   * Permet de grouper la liste des planning  par manager
   * @param: list
   * @param: keyGetter
   */
  private groupPlanningByPeriode(list, keyGetter) {
    const map = new Map();
    if (list.length > 0) {
      list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
          this.listPeriodeWithPlanningManager.push(this.listPeriodesManager.find(periode => periode.idPeriodeManager === item.periodeManager.idPeriodeManager));

        } else {
          collection.push(item);
        }
      });
    } else {
      this.listPeriodesManager.forEach(periode => {
        if (periode.statut) {
          map.set(periode.idPeriodeManager, []);
          this.listPeriodeWithPlanningManager.push(periode);
        }
      });
    }
    return map;
  }

  public checkEmployeIsAbsent(planning: PlanningManagerModel): boolean {
    let isAbsent = false;
    this.listManagerOrLeaderActif.forEach((employee: EmployeeModel) => {
      if (planning.managerOuLeader.idEmployee === employee.idEmployee) {
        employee.absenceConges.forEach((conge: AbsenceCongeModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(conge);
          if (moment(this.dateService.setTimeNull(planning.dateJournee)).isSameOrAfter(this.dateService.setTimeNull(conge.dateDebut)) && moment(this.dateService.setTimeNull(planning.dateJournee)).isSameOrBefore(this.dateService.setTimeNull(conge.dateFin)) && conge.typeEvenement.previsible && ((!planning.acheval)
            || (planning.acheval && planning.modifiable) || (planning.acheval && !planning.modifiable &&
              !moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateDebut))))) {
            isAbsent = true;
          }
        });
      }
    });
    return isAbsent;
  }

  /**
   * Permet de grouper la loi  par employee ou groupe de trvail
   * @param: list
   * @param: keyGetter
   */
  private loiByEmployeeOrGroupTravail(key, list, map) {
    map.set(key, list);
    return map;
  }

  /**
   * recupere le fin journée de l'activite pour le restaurant
   */
  private getHeureLimite() {
    const limiteHeureDebut = 'Début de journée d\'activité';
    this.periodeManagerService.getHeureLimite(limiteHeureDebut).subscribe(
      (data: any) => {
        this.limiteHeureDebut = this.dateService.setTimeFormatHHMM(data.value);
        if (data.night) {
          this.limiteHeureDebut.setDate(this.limiteHeureDebut.getDate() + 1);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * recuperer tous les employes actifs et appartient a plng manager
   */
  private findAllEmployeActifWithGroupTravailsPlgManagerOrManager() {
    this.employeeService.findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(this.dateDebut, this.dateFin, this.hasPlanningLeader).subscribe(
      (data: any) => {
        this.listManagerOrLeaderActif = data;
        this.listManagerOrLeaderActif.forEach(emp => {
          emp.fullName = emp.nom + ' ' + emp.prenom;
          if (emp.hasLaws) {
            this.getEmployeeLawsByCodeName(emp);
          }
        });
        if (this.modeAffichage !== 0) {
          this.getListPlanningManagersPreviousAndNextWeek();
        } else {
          this.getListPlanningManagers();
        }
      },
      (err: any) => {
      }
    );

  }

  /**
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour l'employe
   * @param :employee
   */
  private async getEmployeeLawsByCodeName(employee: EmployeeModel): Promise<void> {
    try {
      const data = await this.employeeLawService.getEmployeeLawUsedInVerificationContraintSocialByCodeName
      (employee.uuid, CodeNameContrainteSocial.LONGUEUR_MINI_BREAK, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK, CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES, CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES)
        .toPromise();
      employee.loiEmployee = data;
    } catch (err) {

    }
  }

  /**
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour le restaurant
   */
  private getRestaurantLawsByCodeName(): void {
    this.loiRestaurantService.getRestaurantLawUsedInVerificationContraintSocialByCodeName
    (CodeNameContrainteSocial.LONGUEUR_MINI_BREAK, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK, CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES, CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES)
      .subscribe(
        (data: any) => {
          this.loiRestaurant = data;

        }, (err: any) => {
          console.log(err);
        });
  }

  /**
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour groupe de travail de l'employé
   */
  private getGroupeTravailLawsByCodeName(): void {
    this.loiGroupeTravailService.getGroupeTravailMngrOrLdrLawUsedInVerificationContraintSocialByCodeName
    (CodeNameContrainteSocial.LONGUEUR_MINI_BREAK, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK, CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES, CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES, this.hasPlanningLeader)
      .subscribe(
        (data: any) => {
          this.loiGroupeTravail = data;

        }, (err: any) => {
          console.log(err);
        });
  }

  /**
   * get restaurant
   */
  private getSelectedRestaurant() {
    if (this.sharedRestaurant.selectedRestaurant.idRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant !== 0) {
      this.heureDebutWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureDebutWeekend;
      this.heureFinWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureFinWeekend;
      this.getPaysOfRestaurant();
    } else {
      this.sharedRestaurant.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurant.selectedRestaurant = data;
          this.heureDebutWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureDebutWeekend);
          this.heureFinWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureFinWeekend);
          this.getPaysOfRestaurant();

        }, (err: any) => {
          console.log(err);
        }
      );
    }
  }


  /**
   * permet de convertir string en upper case (lundi = Lundi)
   * @param :day
   */
  private convertStringToCamelCase(day: string): string {
    let convertedItem = day.charAt(0);
    convertedItem = convertedItem.concat(day.substring(1, day.length).toLowerCase());
    return convertedItem;
  }

  /**
   * recupere les list de position de travail
   */
  private getListePositionTravailProductifByRestaurant() {
    this.positionTravailService.getAllActivePositionTravailProductifByRestaurant().subscribe(
      (data: PositionTravailModel[]) => {
        this.listePositionTravail = data;
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * popup de confirmation heure de nuit ou heure de jour
   */
  public checkIfNightValue() {
    this.setNightValue = null;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
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
   * modifier planning manager
   * @param: PlanningManager
   */
  private updatePlanningManager() {
    this.setPlanningManagerInListPlanning();
  }

  /**
   * modifier  planning mgr dans la list de planning mgr et dans la map Planning Manager par periode
   * recuperer la list de planning mgr que on va enregistrer
   */
  private setPlanningManagerInListPlanning() {
    this.showPopAddShiftManager = false;
    let shiftAcheveToSave = new PlanningManagerModel();

    if (this.shiftManagerToSave.acheval && !moment(this.dateService.setTimeNull(this.shiftManagerToSave.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      shiftAcheveToSave = this.clone(this.shiftManagerToSave);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
    }
    this.deleteShiftAchevalHidden(this.shiftManagerToSave.idPlanningManager, this.shiftManagerToSave.periodeManager.idPeriodeManager);

    const collection = this.planningByPeriode.get(this.shiftManagerToSave.periodeManager.idPeriodeManager);
    if (shiftAcheveToSave && shiftAcheveToSave.idPlanningManager) {
      collection.push({...shiftAcheveToSave});
      this.listPlanningManagerOrLeader.push({...shiftAcheveToSave});
    }
    const indexShiftToUpdateInPlanningManagerByPeriode = collection.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    collection[indexShiftToUpdateInPlanningManagerByPeriode] = this.shiftManagerToSave;
    const indexShiftToUpdateInListPlanningManager = this.listPlanningManagerOrLeader.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    this.updateListPlanningManager(indexShiftToUpdateInListPlanningManager, this.listPlanningManagerOrLeader);
    const indexShiftToUpdate = this.listPlanningManagerOrLeaderToUpdate.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    this.updateListPlanningManager(indexShiftToUpdate, this.listPlanningManagerOrLeaderToUpdate);
    this.sortListShiftByShiftAcheval(this.planningByPeriode.get(this.shiftManagerToSave.periodeManager.idPeriodeManager));
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);
    this.showPopAddShiftManager = true;
    this.shiftManagerToSave = null;
  }

  /**
   * calcule total of planning mgr to employee for week
   * calcule total of planning mgr to employee for day
   *
   */
  private calculeTotalInWeekAndTotalInDayForPlanningManager(planningManager?): any {
    let totalInDay = 0;
    let cummuleTotal = 0;
    if (planningManager) {
      this.dateService.setCorrectTimeToDisplayForShift(planningManager);
      this.planningHasAnomalieContraintSocial = planningManager.managerOuLeader;
      this.dateContraintSocial = this.dateService.formatToShortDate(planningManager.dateJournee, '/');
      this.listPlanningManagerOrLeader.forEach((shiftDisplay: any) => {
        this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
        if (planningManager.idPlanningManager !== shiftDisplay.idPlanningManager
          && planningManager.managerOuLeader.idEmployee === shiftDisplay.managerOuLeader.idEmployee) {
          if (planningManager.dateJournee === shiftDisplay.dateJournee) {
            totalInDay += this.totalRowTime;
          }
          cummuleTotal += this.totalRowTime;
        }
      });
      totalInDay += this.totalRowTime;
      cummuleTotal += this.totalRowTime;

      this.totalRowTime = cummuleTotal;
      return this.verifContrainte(cummuleTotal, totalInDay, planningManager);

    } else {
      this.listManagerOrLeaderActif.forEach((emp: EmployeeModel) => {
        cummuleTotal = 0;
        this.listPlanningManagerOrLeader.forEach((shiftDisplay: any) => {
          if (shiftDisplay.managerOuLeader.idEmployee === emp.idEmployee) {
            cummuleTotal += this.totalRowTime;
          }
        });
        emp.totalRowTime = cummuleTotal;

      });

    }
  }


  /**
   * meesage de modifier planning
   */
  private displayUpdateMessage() {
    this.notificationService.showSuccessMessage('SHIFT_FIXE.UPDATED_SUCCESS', 'BIMPOSE.UPDATE_MESSAGE_HEADER');
  }

  /**
   * ajouter nouveau planning
   */
  private addNewPlanningManager(): void {
    this.setNewShiftToListPlanningManager();
  }

  /**
   * ajouter planning mgr dans la list de planning mgr et dans la map planning manager
   */
  private setNewShiftToListPlanningManager() {
    this.showPopAddShiftManager = false;
    let shiftAcheveToSave = new PlanningManagerModel();
    this.shiftManagerToSave.idPlanningManager = this.makeString();
    this.listPlanningManagerOrLeader.forEach(shift => {

      if (shift.idPlanningManager === this.shiftManagerToSave.idPlanningManager) {
        this.setNewShiftToListPlanningManager();
      }

    });
    if (this.shiftManagerToSave.acheval && !moment(this.dateService.setTimeNull(this.shiftManagerToSave.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      shiftAcheveToSave = this.clone(this.shiftManagerToSave);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);

      this.listPlanningManagerOrLeader.push({...shiftAcheveToSave});
    }
    this.listPlanningManagerOrLeaderToUpdate.push({...this.shiftManagerToSave});

    const collection = this.planningByPeriode.get(this.shiftManagerToSave.periodeManager.idPeriodeManager);
    if (!collection) {
      this.planningByPeriode.set(this.shiftManagerToSave.periodeManager.idPeriodeManager, [this.shiftManagerToSave]);
      if (shiftAcheveToSave.idPlanningManager) {
        this.planningByPeriode.set(this.shiftManagerToSave.periodeManager.idPeriodeManager, [shiftAcheveToSave]);
      }
    } else {
      collection.push({...this.shiftManagerToSave});
      if (shiftAcheveToSave.idPlanningManager) {
        collection.push({...shiftAcheveToSave});

      }
    }

    this.listPlanningManagerOrLeader.push({...this.shiftManagerToSave});
    this.sortListShiftByShiftAcheval(this.planningByPeriode.get(this.shiftManagerToSave.periodeManager.idPeriodeManager));
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);
    this.shiftManagerToSave = null;
    this.showPopAddShiftManager = true;
  }


  /**
   * manager  not has planning
   */
  private fillAvailablePeriodeActif() {
    let found = false;
    this.listPeriodesManager.forEach(item => {
      found = false;
      this.listPeriodeWithPlanningManager.forEach(PeriodeItem => {

        if (PeriodeItem.idPeriodeManager === item.idPeriodeManager) {
          found = true;
        }
      });
      if (!found && item.statut) {
        this.listPeriodeWithPlanningManager.push(item);
        this.planningByPeriode.set(item.idPeriodeManager, []);

      }
    });

  }

  /**
   * Cette methode utilisee lors de la recuperation de la liste des planning manager elle permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  private setCorrectTimeToDisplay(item: any, isProductif?: boolean): void {
    item.heureDebut = this.dateService.setTimeFormatHHMM(item.heureDebut);
    if (item.heureDebutIsNight) {
      item.heureDebut.setDate(item.heureDebut.getDate() + 1);
    }
    item.heureFin = this.dateService.setTimeFormatHHMM(item.heureFin);
    if (item.heureFinIsNight) {
      item.heureFin.setDate(item.heureFin.getDate() + 1);
    }
    if (item.dateJournee) {
      item.dateJournee = new Date(item.dateJournee);
      item.dateJournee = this.dateService.setCorrectDate(item.dateJournee);
    }
    if (!isProductif)
      this.dateService.setCorrectTimeToDisplayForShift(item);

  }

  /**
   * Ajouter ou modifier une nouvelle card de shift
   * @param: cardDetails
   */
  public addOrUpdateNewPlanningManagerOrLeaderFixeCard(planningManager: PlanningManagerModel) {
    if (!this.employeInactif) {
      this.hiddenSave = false;
      this.shiftManagerToSave = {...planningManager};
      this.dateJour = this.shiftManagerToSave.dateJournee;
      if (this.hasPlanningLeader) {
        this.shiftManagerToSave.planningLeader = true;
      } else {
        this.shiftManagerToSave.planningLeader = false;
      }
      if (this.canAddPlanningManager(this.shiftManagerToSave)) {
        if (this.calculeTotalInWeekAndTotalInDayForPlanningManager(planningManager)) {
          if (planningManager.idPlanningManager) {
            // update
            this.updatePlanningManager();
          } else {
            // add new
            this.addNewPlanningManager();
          }
        } else {
          this.popupVerificationContrainteVisibility = true;

        }
      }
    } else {
      this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');

    }
  }

  private displaySuccessAddMessage() {
    this.notificationService.showSuccessMessage('SHIFT_FIXE.ADD_SUCCESS', 'BIMPOSE.ADD_MESSAGE_HEADER');
  }


  /**
   * modifier la list de planning manager
   * @param: indexPlanningManagerUpdate
   * @param: list
   */
  private updateListPlanningManager(indexPlanningManagerUpdate: number, list: any): void {
    indexPlanningManagerUpdate = list.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    if (indexPlanningManagerUpdate !== -1) {
      list.splice(indexPlanningManagerUpdate, 1);
    }
    list.push({...this.shiftManagerToSave});
  }


  /**
   * permet de savegarder la ligne periode manager selectionnée pour la suppression
   * @param: event
   */
  public updateSelectedEmployeeRow(event) {
    this.selectedPeriode = event;
  }

  /**
   * afficher le message de confirmation de supression d'une ligne entière
   */
  public showConfirmDeleteRow($event: any) {
    if (this.selectedPeriode.idPeriodeManager) {
      this.showConfimeDelete = true;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
        header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          if (this.selectedPeriode && this.selectedPeriode.idPeriodeManager !== 0) {
            this.deleteAllPlanningManagerByIdPeriodeManager();
            this.showConfimeDelete = false;

          }

        },
        reject: () => {
          this.showConfimeDelete = false;
        }
      });
    }
  }

  /**
   * verification s'il y aun changement au niveua de list planning manager
   */
  public setListPlanningManagerBeforeSaveAndVerification(): boolean {
    let autorizeDeleteShift = true;
    let autorizeDeleteShiftByManager = true;
    let autorizeDeleteManagerProductif = true;
    let autorizeAddPlanningManager = false;
    if (this.listIdShiftManagerOrLeaderToDelete.length === 0) {
      this.listIdShiftManagerOrLeaderToDelete.push('0');
      autorizeDeleteShift = false;
    }
    if (this.listShiftManagerOrLeaderByPeriodeToDelete.length === 0) {
      this.listShiftManagerOrLeaderByPeriodeToDelete.push('0');
      autorizeDeleteShiftByManager = false;
    }
    if (this.listIdPlanningManagerProductifsToDelete.length === 0) {
      this.listIdPlanningManagerProductifsToDelete.push('0');
      autorizeDeleteManagerProductif = false;
    }
    if (this.listPlanningManagerOrLeaderToUpdate.length > 0) {
      autorizeAddPlanningManager = true;
    }
    this.listShiftManagerByManagerToDelete.push('0');

    return autorizeDeleteShift || autorizeDeleteShiftByManager || autorizeDeleteManagerProductif || autorizeAddPlanningManager;
  }

  /**
   * deselectionner le ligne
   */
  public unselectPlanningManager() {
    if (!this.showConfimeDelete) {
      // toggle selected rows
      document.querySelectorAll('table.planning tr').forEach(element => {
        element.classList.remove('row-selected');
      });
      this.selectedPeriode = {} as PeriodeManagerModel;
    }
  }

  private displaySuccessDeleteMessage() {
    this.notificationService.showInfoMessage('BIMPOSE.DELETE_SUCCESS', 'BIMPOSE.DELETE_INFORMATION');
  }

  /**
   * message de confirmation de suppression d'une card dans l'onglet 'planning manager vue poste'
   * @param: event
   */
  public showConfirmDeletePlanningManagerCard(event, filter?) {
    let employeHaslaw: EmployeeModel;
    let idShiftToDelete: number;
    if (!filter) {
      idShiftToDelete = event;
    } else {
      const draggableElement = event.relatedTarget;
      idShiftToDelete = draggableElement.getAttribute('data-idPlanningManager');
    }
    const deletedShift = this.listPlanningManagerOrLeader.find((element: any) => element.idPlanningManager === idShiftToDelete);
    if (deletedShift) {
      const employeeIndex = this.listManagerOrLeaderActif.findIndex((manager: any) => manager.idEmployee === deletedShift.managerOuLeader.idEmployee);
      if ((employeeIndex !== -1) && this.listManagerOrLeaderActif[employeeIndex].contrats.length === 1) {
        employeHaslaw = this.listManagerOrLeaderActif[employeeIndex];
      } else if ((employeeIndex !== -1) && this.listManagerOrLeaderActif[employeeIndex].contrats.length > 1) {
        const employeeDisplay = JSON.parse(JSON.stringify(this.listManagerOrLeaderActif[employeeIndex]));
        employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeDisplay, new Date(deletedShift.dateJournee));
      }
      this.planningHasAnomalieContraintSocial = employeHaslaw;
      if (employeHaslaw) {
        this.identifierEmployee(employeHaslaw);
      }
    }

    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        // l'utilisateur-restaurant accepte la suppression
        if (!filter) {
          this.deleteShiftPlanningCard(event);
        } else {
          const draggableElement = event.relatedTarget;
          const idShiftToDelete = draggableElement.getAttribute('data-idPlanningManager'); // ancienne journée à laquelle appartient la card
          this.deleteShiftPlanningCard(idShiftToDelete);
          event.relatedTarget.classList.remove('moving-active');

        }

      },
      reject: () => {
        // enlever la transparence de la card
        if (filter) {
          event.relatedTarget.classList.remove('moving-active');
        }
      }
    });
  }

  private onReadyInitDrag() {
    interact('.td-drop-zone').unset();
    interact('.btn-delete').unset();
    interact('.position-card').unset();

    interact.dynamicDrop(true);

    let resetToInitial = true; // si l'utilisateur-restaurant lâche le souris à mis chemin, on remet le card à sa place
    // enable draggables to be dropped into this drop zones
    interact('.td-drop-zone').dropzone({
      // only accept elements matching this CSS selector
      accept: '.position-card',
      ignoreForm: '.active-planning-manager' ,
      // Require a 50% element overlap for a drop to be possible
      overlap: 'pointer',

      // listen for drop related events:
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
      },
      ondrop: (event) => {
        // si on lache la souris
        resetToInitial = false;
        this.dropShiftCard(event);
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');

        // on doit remettre le card à sa place d'origine si l'utilisateur-restaurant à lacher à mis chemin
        if (resetToInitial) {
          event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';
          // reset the posiion attributes
          event.relatedTarget.setAttribute('data-x', 0);
          event.relatedTarget.setAttribute('data-y', 0);
        }
      }
    });


    // enable draggable employee to be dropped into this to be deleted
    interact('.btn-delete').dropzone({
      // only accept elements matching this CSS selector
      // accept: '.employee-draggable',
      accept: '.position-card',
      // Require a 50% element overlap for a drop to be possible
      overlap: 'pointer',

      // listen for drop related events:
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
      },
      ondrop: (event) => {
        // quand on lache le card sur la drop zone du bouton supprimer, on supprime alors le card après affichage du message de confirmation
        resetToInitial = false;
        if (event.relatedTarget.classList.contains('position-card')) {
          this.showConfirmDeletePlanningManagerCard(event, 'dragAndDrop'); // suppression du card du shift : onglet 'planning manager'
        }
        // on remet le card à sa position en attendant le onfirmation de l'utilisateur-restaurant pour la suppression
        event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';

        // reset the posiion attributes
        event.relatedTarget.setAttribute('data-x', 0);
        event.relatedTarget.setAttribute('data-y', 0);
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');

        // si on doit remettre le card à sa place d'origine
        if (resetToInitial) {
          event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';

          // reset the posiion attributes
          event.relatedTarget.setAttribute('data-x', 0);
          event.relatedTarget.setAttribute('data-y', 0);
        }
      }
    });

    // initialiser les draggable shifts : cette fonction permet de rendre les cards déplaçable à la souris
    interact('.position-card').draggable({
      // enable inertial throwing
      inertia: false,
      autoScroll: {
        container: document.getElementById('planningManagerVuePoste'),
        speed: 150
      },
      // call this function on every dragmove event

      onstart(event) {
        const target = event.target;
        const position = target.getBoundingClientRect();
        const shiftPositionCard = document.querySelector('.position-card') as HTMLElement;
        const widthOfShift = shiftPositionCard.offsetWidth;
        target.style.position = 'fixed';
        target.style.top = position.top + 'px';
        target.style.width = widthOfShift + 'px';
        target.style.zIndex = '99';
      },
      // call this function on every dragmove event
      onmove: (event) => {
        resetToInitial = true;
        this.dragMoveListener(event); // s'exécute à chaque déplacement pour que le card suit la souris
      },
      // call this function on every dragend event
      onend: function (event) {
        event.target.classList.remove('moving-active'); // enlever la class css 'moving-active' qui permet de rendre le card transparent au moment du déplacement
        if (resetToInitial) {
          event.target.style.position = 'static';
        }
      }
    });
  }

  /**
   * s'éxécute à chaque déplacement du pointeur de la souris afin de déplacer le card avec et activer les drop zone correspondantes
   * @param: event
   */
  dragMoveListener(event) {
    let target = event.target, // card en cours de déplacement
      // keep the dragged position in the data-x/data-y attributes : changer les coordonnées de la card avec ceux de la souris
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.classList.add('moving-active'); // ajouter la classe css qui permet de créer l'effet de transparence
  }

  /**
   * Permet de gérer le déplacements des cards des postes
   * @param: event
   */
  private dropShiftCard(event) {
    this.eventCtrl = false;
    this.changePositionAfterDragAnDrop = true;

    if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
      this.eventCtrl = true;
    }
    const draggableElement = event.relatedTarget;
    const dropzoneElement = event.target;
    this.draggableElementPlanningManager = draggableElement;
    let idPlanningManager;
    const idDropShift = draggableElement.getAttribute('data-idPlanningManager');
    if (!isNaN(Number(draggableElement.getAttribute('data-idPlanningManager')))) {
      idPlanningManager = parseInt(draggableElement.getAttribute('data-idPlanningManager'), 10); // ordre du card dans la journée initial
    } else {
      idPlanningManager = idDropShift; // ordre du card dans la journée initial
    }
    const oldDayZone = draggableElement.getAttribute('data-cardDay'); // ancienne journée à laquelle appartient la card
    const newDayZone = dropzoneElement.getAttribute('data-day'); // nouvelle journée dans laquelle on veut déplacer la card

    const oldPeriode = parseInt(draggableElement.getAttribute('data-periodeIndex'), 10); // poste initial de la card
    const newPeriode = parseInt(dropzoneElement.parentElement.getAttribute('data-periodeIndex'), 10); // nouveau poste du card
    const cardDropInfos = {
      idPlanningManager: idPlanningManager,
      oldDayZone: oldDayZone,
      newDayZone: newDayZone,
      oldPeriode: oldPeriode,
      newPeriode: newPeriode
    };
    this.shiftManagerToSave = cardDropInfos;
    let periodeNew = {} as PeriodeManagerModel;
    // recuperer le nouveau planning manager par poste lors de drag and drop
    this.listPeriodesManager.forEach(periodeDisplay => {
      if (periodeDisplay.idPeriodeManager === cardDropInfos.newPeriode) {
        if (periodeDisplay.statut) {
          periodeNew = periodeDisplay;
          this.planningManagerNewDragAndDrop = this.getPlanningManagerBeforeDragAndDrop(this.shiftManagerToSave, periodeNew);
          this.getStartTimeAndEndTimeFromDecoupageHoraire(this.shiftManagerToSave.newDayZone);
          if (this.updateButtonControl() && this.disableChangePositionOfManagerOrLeader() && this.canAddPlanningManager(this.planningManagerNewDragAndDrop, 'dragAndDrop')) {
            // recuperer le manager actif a partir de list pour recuperer son contrat
            this.listManagerOrLeaderActif.forEach(managerDisplay => {
              if (this.planningManagerNewDragAndDrop.managerOuLeader.idEmployee === managerDisplay.idEmployee) {
                this.getContratByManagerActif(managerDisplay, this.setJourSemaine(newDayZone.toUpperCase()), 'dragDrop');
              }
            });
          } else {
            // reset the card to the initial place
            this.resetCradInitialPlace(this.planningManagerNewDragAndDrop);
          }
        } else {
          this.resetCradInitialPlace(this.planningManagerNewDragAndDrop);
        }

      }
    });

  }

  /**
   * Cette méthode permet convertir  la fin/début activité de la journée en date

   */
  private getStartAndEndActivityDay(dateJournee: Date): void {
    let dateShift = new Date();
    if (dateJournee) {
      dateShift = dateJournee;
    }
    if (this.startTime) {
      const nightValue = this.startTimeIsNight;
      this.startActivity = this.dateService.setTimeFormatHHMM(this.startTime).setFullYear(dateShift.getFullYear(), dateShift.getMonth(), dateShift.getDate());
      this.startActivity = this.dateService.getDateFromIsNight(this.startActivity, nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.startActivity);
    }
    if (this.endTime) {
      const nightValue = this.endTimeIsNight;
      this.endActivity = this.dateService.setTimeFormatHHMM(this.endTime).setFullYear(dateShift.getFullYear(), dateShift.getMonth(), dateShift.getDate());
      this.endActivity = this.dateService.getDateFromIsNight(this.endActivity, nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.endActivity);
    }
  }

  /**
   * Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe
   *  empecher le drag&drop vers l’employé
   *
   */
  public disableChangePositionOfManagerOrLeader(): boolean {
    let canChangePosition = true;
    this.listManagerOrleaderInactif.forEach(managerOrLeaderDisplay => {
      if (managerOrLeaderDisplay.idEmployee === this.planningManagerNewDragAndDrop.managerOuLeader.idEmployee) {
        canChangePosition = false;
      }

    });
    return canChangePosition;
  }

  /**
   * confirmer le changement de planning mgr apres drag and drop
   * @param :manager
   */
  private checkShiftChangePosition(manager) {

    if (this.shiftManagerToSave.oldDayZone !== this.shiftManagerToSave.newDayZone || this.shiftManagerToSave.oldPeriode !== this.shiftManagerToSave.newPeriode) {
      this.popupVerificationContrainteVisibility = !this.calculeTotalInWeekAndTotalInDayForPlanningManager(this.planningManagerNewDragAndDrop);
    }

    // drop only if day is different
    if ((this.shiftManagerToSave.oldDayZone !== this.shiftManagerToSave.newDayZone || this.shiftManagerToSave.oldPeriode !== this.shiftManagerToSave.newPeriode) && !this.popupVerificationContrainteVisibility) {
      // changer les détails du card suivant le nouveau emplacement

      // exécuter le déplacement du card dans l'interface
      if (this.eventCtrl) {
        this.copiePlanningManagerOrLeaderVuePost(this.shiftManagerToSave);
      } else {
        this.moveShiftCard(this.shiftManagerToSave);
      }

    } else {
      // reset the card to the initial place
      this.resetCradInitialPlace(this.shiftManagerToSave);


    }
  }

  /**
   * déplacer le card entre les deux zone de jours différentes
   * @param: movedCardInfos
   */
  public moveShiftCard(movedCardInfos: any): void {
    this.deleteShiftAchevalHidden(movedCardInfos.idPlanningManager, movedCardInfos.oldPeriode);
    const indexShiftToMove = this.listPlanningManagerOrLeader.findIndex(shift => shift.idPlanningManager === movedCardInfos.idPlanningManager);
    // update periode manager
    const indexNewPeriode = this.listPeriodesManager.findIndex(periode => periode.idPeriodeManager === movedCardInfos.newPeriode);
    if (indexNewPeriode !== -1) {
      this.listPlanningManagerOrLeader[indexShiftToMove].periodeManager = this.listPeriodesManager[indexNewPeriode];
    }
    // update day
    this.listPlanningManagerOrLeader[indexShiftToMove].dateJournee = this.setJourSemaine(movedCardInfos.newDayZone.toUpperCase());
    // mettre a jour la map
    this.listPlanningManagerOrLeader[indexShiftToMove] = this.updateShiftAcheval(this.listPlanningManagerOrLeader[indexShiftToMove]);
    if (this.listPlanningManagerOrLeader[indexShiftToMove].acheval) {
      if (!moment(this.dateService.setTimeNull(this.listPlanningManagerOrLeader[indexShiftToMove].dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        this.listPlanningManagerOrLeader[indexShiftToMove].achevalWeek = false;
      } else {
        this.listPlanningManagerOrLeader[indexShiftToMove].achevalWeek = true;
      }
    }
    if (!this.listPlanningManagerOrLeader[indexShiftToMove].acheval && this.getModeDispaly(this.listPlanningManagerOrLeader[indexShiftToMove]) !== 0 && this.checkIfShiftAcheval(this.listPlanningManagerOrLeader[indexShiftToMove])) {
      this.listPlanningManagerOrLeader[indexShiftToMove].acheval = true;
      this.listPlanningManagerOrLeader[indexShiftToMove].modifiable = true;
    }
    this.planningByPeriode.get(movedCardInfos.oldPeriode).splice(this.planningByPeriode.get(movedCardInfos.oldPeriode).findIndex(shift => shift.idPlanningManager === movedCardInfos.idPlanningManager), 1);
    this.planningByPeriode.get(movedCardInfos.newPeriode).push(this.listPlanningManagerOrLeader[indexShiftToMove]);
    if (this.listPlanningManagerOrLeader[indexShiftToMove].acheval && !moment(this.dateService.setTimeNull(this.listPlanningManagerOrLeader[indexShiftToMove].dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      let shiftAcheveToSave = this.clone(this.listPlanningManagerOrLeader[indexShiftToMove]);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
      this.planningByPeriode.get(movedCardInfos.newPeriode).push(shiftAcheveToSave);
      this.listPlanningManagerOrLeader.push(shiftAcheveToSave);
    }

    const indexShiftFixeToUpdate = this.listPlanningManagerOrLeaderToUpdate.findIndex(shift => shift.idPlanningManager === this.listPlanningManagerOrLeader[indexShiftToMove].idPlanningManager);
    this.dateService.setCorrectTimeToDisplayForShift(this.listPlanningManagerOrLeader[indexShiftToMove]);

    if (indexShiftFixeToUpdate !== -1) {
      this.listPlanningManagerOrLeaderToUpdate[indexShiftFixeToUpdate] = {...this.listPlanningManagerOrLeader[indexShiftToMove]};
    } else {
      this.listPlanningManagerOrLeaderToUpdate.push({...this.listPlanningManagerOrLeader[indexShiftToMove]});
    }
    this.sortListShiftByShiftAcheval(this.planningByPeriode.get(movedCardInfos.newPeriode));
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);
  }

  /**
   * Si l’utilisateur maintient la touche Ctrl appuyer tous le long du drag&drop (appuyer à la sélection et au relâchement du shift),
   *  il faut permettre de copier un shift lors d’un drag&drop.
   *  @param :copieCardInfos
   */

  private copiePlanningManagerOrLeaderVuePost(copieCardInfos: any): void {
    let planningManagerOrLeaderCopy: any;
    let planningManagerOrLeader = {} as PlanningManagerModel;
    const indexPlanningOrLeaderToMove = this.listPlanningManagerOrLeader.findIndex(shift => shift.idPlanningManager === copieCardInfos.idPlanningManager && !shift.shiftAchevalHidden);
    const indexNewPeriode = this.listPeriodesManager.findIndex(periode => periode.idPeriodeManager === copieCardInfos.newPeriode);
    this.planningByPeriode.get(copieCardInfos.oldPeriode).splice(this.planningByPeriode.get(copieCardInfos.oldPeriode).findIndex(shift => shift.idPlanningManager === copieCardInfos.idPlanningManager && !shift.shiftAchevalHidden), 1);
    planningManagerOrLeaderCopy = {...this.listPlanningManagerOrLeader[indexPlanningOrLeaderToMove]};
    planningManagerOrLeaderCopy.idPlanningManager = this.makeString();
    planningManagerOrLeaderCopy.periodeManager = this.listPeriodesManager[indexNewPeriode];
    planningManagerOrLeaderCopy.dateJournee = this.setJourSemaine(copieCardInfos.newDayZone.toUpperCase());
    planningManagerOrLeader = {...this.listPlanningManagerOrLeader[indexPlanningOrLeaderToMove]};
    this.dateService.setCorrectTimeToDisplayForShift(planningManagerOrLeader);
    this.dateService.setCorrectTimeToDisplayForShift(planningManagerOrLeaderCopy);
    planningManagerOrLeader = this.updateShiftAcheval(planningManagerOrLeader, true);
    planningManagerOrLeaderCopy = this.updateShiftAcheval(planningManagerOrLeaderCopy);
    if (planningManagerOrLeaderCopy.acheval && !moment(this.dateService.setTimeNull(planningManagerOrLeaderCopy.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      let shiftAcheveToSave = this.clone(planningManagerOrLeaderCopy);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
      this.planningByPeriode.get(copieCardInfos.newPeriode).push(shiftAcheveToSave);
      this.listPlanningManagerOrLeader.push(shiftAcheveToSave);
    }
    if (planningManagerOrLeaderCopy.acheval) {
      if (!moment(this.dateService.setTimeNull(planningManagerOrLeaderCopy.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        planningManagerOrLeaderCopy.achevalWeek = false;
      } else {
        planningManagerOrLeaderCopy.achevalWeek = true;
      }
    }
    if (planningManagerOrLeaderCopy.acheval || (!planningManagerOrLeaderCopy.acheval && this.getModeDispaly(planningManagerOrLeaderCopy) !== 0 && this.checkIfShiftAcheval(planningManagerOrLeaderCopy))) {
      planningManagerOrLeaderCopy.modifiable = true;

    }
    this.listPlanningManagerOrLeader.push(planningManagerOrLeaderCopy);
    this.planningByPeriode.get(copieCardInfos.newPeriode).push(planningManagerOrLeaderCopy);
    this.planningByPeriode.get(copieCardInfos.oldPeriode).push(planningManagerOrLeader);
    this.listPlanningManagerOrLeaderToUpdate.push({...planningManagerOrLeaderCopy});
    this.sortListShiftByShiftAcheval(this.planningByPeriode.get(copieCardInfos.newPeriode));
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);
    this.eventCtrl = false;

  }

  /**
   * delete AllPlanning Manager pour un periode manager selectionné
   * supprimer  a partir de list planning manager ou de map list planning manager
   */
  private deleteAllPlanningManagerByIdPeriodeManager() {

    const indexPeriodeToDelete = this.listPeriodeWithPlanningManager.findIndex(periode => periode.idPeriodeManager === this.selectedPeriode.idPeriodeManager);
    this.listPeriodeWithPlanningManager.splice(indexPeriodeToDelete, 1);
    if (this.planningByPeriode.get(this.selectedPeriode.idPeriodeManager)) {
      this.planningByPeriode.delete(this.selectedPeriode.idPeriodeManager);
    }
    this.fillAvailablePeriodeActif();
    this.listShiftManagerOrLeaderByPeriodeToDelete.push(this.selectedPeriode.uuid);
    // supprimer les planning manager de list planning(list qui on va sauvagarder dans la bd)
    if (this.listPlanningManagerOrLeaderToUpdate.length > 0) {
      for (let i = 0; i < this.listPlanningManagerOrLeaderToUpdate.length; i++) {
        if (this.listPlanningManagerOrLeaderToUpdate[i].periodeManager.idPeriodeManager === this.selectedPeriode.idPeriodeManager) {
          if (!isNaN(Number(this.listPlanningManagerOrLeaderToUpdate[i].idPlanningManager))) {
            // supprimer de planning manager  qui se trouvent ds la bd avec un autre periode manager
            this.listIdShiftManagerOrLeaderToDelete.push(this.listPlanningManagerOrLeaderToUpdate[i].uuid);
          }
          // supprimer les  shifts qui se trouvent ds la list que on va enregistrer ds la bd
          this.listPlanningManagerOrLeaderToUpdate.splice(i, 1);
          i--;
        }
      }
    }
    if (this.listPlanningManagerOrLeader.length > 0) {
      for (let i = 0; i < this.listPlanningManagerOrLeader.length; i++) {
        if (this.listPlanningManagerOrLeader[i].periodeManager.idPeriodeManager === this.selectedPeriode.idPeriodeManager) {
          this.listPlanningManagerOrLeader.splice(i, 1);
          i--;
        }
      }
    }
  }

  /**
   *  la sauvegarde par le button save
   *  * */
  public saveListPlanningManager() {
    this.saveGenaral = false;
    this.hiddenSave = false;
    if (this.setListPlanningManagerBeforeSaveAndVerification()) {

      const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure, true);
      const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
      const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
      if (this.listContrainteMinTimeInWeek.length || listContraintCoupur.length || listContraintDureeMinShift.length || listNbrCoupureInWeek.length) {
        this.saveGenaral = true;
        this.listContrainte = this.listContrainteMinTimeInWeek.concat(listContraintCoupur, listContraintDureeMinShift, listNbrCoupureInWeek);
        this.popupVerificationContrainteVisibility = true;
      } else {
        this.saveFinalListPlanningMnagerInBD();
      }
    } else {

      this.listIdShiftManagerOrLeaderToDelete = [];
      this.listShiftManagerOrLeaderByPeriodeToDelete = [];
      this.listIdPlanningManagerProductifsToDelete = [];
    }
  }

  /**
   * save after verification
   * save generale en cas de modifictatio , suppression, ajout
   * */
  public saveFinalListPlanningMnagerInBD(start?: any): void {
    this.listPlanningManagerOrLeaderToUpdate.forEach(shift => {
      if (isNaN(Number(shift.idPlanningManager))) {
        shift.idPlanningManager = 0;
        if (shift.planningManagerProductif) {
          shift.planningManagerProductif.forEach((item: PlanningManagerProductifModel) => {
            item.idPlanningManagerProductif = 0;
            delete item.uuid;
          });
        }
        delete shift.uuid;
      }
    });
    this.notificationService.startLoader();
    this.planningManagerService.updateListPlanningManager(this.listPlanningManagerOrLeaderToUpdate, this.listIdShiftManagerOrLeaderToDelete,
      this.listShiftManagerByManagerToDelete, this.listShiftManagerOrLeaderByPeriodeToDelete, this.listIdPlanningManagerProductifsToDelete,
      this.hasPlanningLeader, this.dateDebut).subscribe(
      (data: PlanningManagerModel[]) => {
        this.notificationService.stopLoader();
        this.saveGenaral = false;
        this.listContrainteMinTimeInWeek = [];
        this.setListPlanningManagerAfterSave(data);
        this.popupVerificationContrainteVisibility = false;
        if (this.navigateTo) {
          this.navigateAway.next(true);
          this.navigateTo = false;
        }
        if (start || this.changeDate) {
          this.updateOrDownDate();
        }
      },
      (err) => {
        this.notificationService.stopLoader();
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  public backToHomePlanning(): void {
    this.sessionService.setResetPlanningCalendar(false);
    this.router.navigateByUrl(this.rhisRouter.getRoute('HOME_PLANNING'));
  }

  /**
   * supprimer planning manager de la list planning manager et de map
   * @param: event
   */
  private deleteShiftPlanningCard(event) {
    this.idManagerOrLeader = 0;
    this.index = null;
    this.idShiftToDelete = null;
    this.shiftToDelete = null;

    // si l'id de plannig maneger est un number
    if (!isNaN(Number(event))) {
      event = +event;
    }

    this.listPlanningManagerOrLeader.forEach((shift, index) => {
      if (shift.idPlanningManager === event && (!shift.acheval || (shift.acheval && shift.modifiable && !shift.shiftAchevalHidden))) {
        this.index = index;
        this.idShiftToDelete = event;
        this.shiftToDelete = shift;
        this.idManagerOrLeader = shift.managerOuLeader.idEmployee;

        const filteredShiftsByDayAndEmployee = this.getListShiftByJour(shift);
        const indexShiftToDelete = filteredShiftsByDayAndEmployee.findIndex(shift => shift.idPlanningManager === this.idShiftToDelete);
        if (indexShiftToDelete !== -1) {
          filteredShiftsByDayAndEmployee.splice(indexShiftToDelete, 1);
        }

        if (filteredShiftsByDayAndEmployee.length > 2) {
          this.planningHasAnomalieContraintSocial = shift.managerOuLeader;
          this.dateContraintSocial = this.dateService.formatToShortDate(shift.dateJournee, '/');
          let verificationContrainte = new VerificationContrainteModel();


          this.listContrainteSuppression = [];
          // Nombre Shift Max Par Jour
          verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(this.listLoi, this.tempsTravailPartiel, this.mineur, filteredShiftsByDayAndEmployee), this.listLoi, this.tempsTravailPartiel, this.mineur);
          if (verificationContrainte) {
            this.popupVerificationCsMaxShift = true;
            this.messageVerification.bloquante = verificationContrainte.bloquante;
            this.listContrainteSuppression.push(verificationContrainte);
          } else {
            this.removeShift();
          }
        } else {
          this.removeShift();
        }

      }
    });
  }

  public removeShift(): void {
    const periodeToDeleteShift = this.clone(this.listPlanningManagerOrLeader[this.index].periodeManager);
    const employeToDeleteShift = this.clone(this.listPlanningManagerOrLeader[this.index].managerOuLeader);

    let indexShiftToDeleteInListUpdatePlanningManager;
    this.deleteShiftAchevalHidden(this.idShiftToDelete, periodeToDeleteShift.idPeriodeManager);

    this.planningByPeriode.get(periodeToDeleteShift.idPeriodeManager).splice(this.planningByPeriode.get(periodeToDeleteShift.idPeriodeManager).findIndex(shiftFixe => shiftFixe.idPlanningManager === this.idShiftToDelete), 1);
    const collection = this.planningByPeriode.get(employeToDeleteShift.idEmployee);
    const indexPlanningManagerDeleted = this.listPlanningManagerOrLeader.findIndex((item: PlanningManagerModel) => item.idPlanningManager === this.idShiftToDelete && ((item.acheval && item.modifiable && !item.shiftAchevalHidden) || !item.acheval));
    if (indexPlanningManagerDeleted !== -1) {
      this.listPlanningManagerOrLeader.splice(indexPlanningManagerDeleted, 1);
    }
    if (!isNaN(Number(this.idShiftToDelete))) {
      this.listIdShiftManagerOrLeaderToDelete.push(this.shiftToDelete.uuid);
    }
    if (this.listPlanningManagerOrLeaderToUpdate.length > 0) {
      indexShiftToDeleteInListUpdatePlanningManager = this.listPlanningManagerOrLeaderToUpdate.findIndex(shift => shift.idPlanningManager === this.idShiftToDelete);
      if (indexShiftToDeleteInListUpdatePlanningManager !== -1) {
        this.listPlanningManagerOrLeaderToUpdate.splice(indexShiftToDeleteInListUpdatePlanningManager, 1);
      }

    }
    this.sortListShiftByShiftAcheval(this.planningByPeriode.get(employeToDeleteShift.idEmployee));
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);
  }

  /**
   * get id of planning manager productif
   * @param idPlanningManagerProcutif
   */
  public getIdOfPlanningManagerProductifDeleted(idPlanningManagerProcutif) {
    this.listIdPlanningManagerProductifsToDelete.push(idPlanningManagerProcutif);
  }

  /**
   * set value to id shift fixe
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  private checkIfShiftAcheval(planning: PlanningManagerModel): boolean {
    this.getStartAndEndActivityDay(planning.dateJournee);
    this.dateService.setCorrectTimeToDisplayForShift(planning);
    return (moment(planning.heureFin).isAfter(this.endActivity));
  }

  /**
   * ajouter list de shift fixe apres save
   * @param: data
   */
  private setListPlanningManagerAfterSave(data: PlanningManagerModel[]) {
    if (data.length > 0) {
      data.forEach(item => {
        this.setCorrectTimeToDisplay(item);
        this.dateService.setCorrectTimeToDisplayForShift(item);
        if (item.planningManagerProductif && item.planningManagerProductif.length) {
          item.planningManagerProductif.forEach(productif => {
            this.setCorrectTimeToDisplay(productif, true);

          });
        }
        this.listPlanningManagerOrLeader.unshift(item);

      });
    }
    for (let i = 0; i < this.listPlanningManagerOrLeader.length; i++) {

      if (isNaN(Number(this.listPlanningManagerOrLeader[i].idPlanningManager))) {
        this.listPlanningManagerOrLeader.splice(i, 1);
        i--;
      }
    }
    this.listPlanningManagerOrLeader = this.listPlanningManagerOrLeader.filter((shift: PlanningManagerModel) => !shift.acheval || (shift.acheval && !shift.shiftAchevalHidden));
    const shiftSet = new Set();
    // removing-duplicates-in-an-array
    this.listPlanningManagerOrLeader = this.listPlanningManagerOrLeader.filter(shift => {
      const duplicate = shiftSet.has(shift.idPlanningManager);
      shiftSet.add(shift.idPlanningManager);
      return !duplicate;
    });

    this.listPeriodeWithPlanningManager = [];
    this.planningByPeriode = new Map();
    this.listPlanningManagerOrLeader.forEach((shiftDisplay: PlanningManagerModel) => {
      this.setCorrectTimeToDisplay(shiftDisplay);
      this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
      if (this.checkIfShiftAcheval(shiftDisplay) && this.getModeDispaly(shiftDisplay)) {
        shiftDisplay.acheval = true;
        shiftDisplay.modifiable = true;
      }
      shiftDisplay = this.setAchevalWeekToShift(shiftDisplay);
      if (shiftDisplay.acheval && shiftDisplay.modifiable && !moment(this.dateService.setTimeNull(shiftDisplay.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        this.listPlanningManagerOrLeader.push(this.shiftService.addShiftAcheval(this.clone(shiftDisplay), true));
      }
    });
    this.sortListShiftByShiftAcheval(this.listPlanningManagerOrLeader);

    this.planningByPeriode = this.groupPlanningByPeriode(this.listPlanningManagerOrLeader, shiftDisplay => shiftDisplay.periodeManager.idPeriodeManager);
    this.fillAvailablePeriodeActif();
    this.displayUpdateMessage();
    this.listPlanningManagerOrLeaderToUpdate = [];
    this.listIdShiftManagerOrLeaderToDelete = [];
    this.listShiftManagerOrLeaderByPeriodeToDelete = [];
    this.listIdPlanningManagerProductifsToDelete = [];

  }

  /**
   * recuperer jour reppos par employee
   * @param: employee
   */
  private getAllJourReposByEmployee(employee) {
    this.semaineReposService.getAllJourReposByEmployee(employee.uuid).subscribe(
      (data: SemaineReposModel[]) => {
        if (data != null) {
          this.semaineRepos = data;
          this.semaineRepos.forEach(semaine => {
            semaine.employee = employee;
          });
        }
      }
    );
  }

  /**
   * verification s'il y a changement de shift fixe
   * save list shfit, suppression shfit ,suppression list shifts
   *
   */
  public canDeactivate(): boolean {
    const canSave = !this.setListPlanningManagerBeforeSaveAndVerification();
    return canSave;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.navigateTo = false;
    this.hiddenSave = false;

    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure, true);
        const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
        const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
        if (this.listContrainteMinTimeInWeek.length || listContraintCoupur.length || listContraintDureeMinShift.length || listNbrCoupureInWeek.length) {
          this.saveGenaral = true;
          this.listContrainte = this.listContrainteMinTimeInWeek.concat(listContraintCoupur, listContraintDureeMinShift, listNbrCoupureInWeek);
          this.popupVerificationContrainteVisibility = true;
          this.navigateTo = true;
        } else {
          this.saveFinalListPlanningMnagerInBD();
          this.navigateAway.next(true);
        }
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * commencer les jours  de semaine par preimere jour de semaine de restaurant
   */
  private setColumns() {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine
    (this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.initCalender();
    this.days = [];
    for (let i = 0; i < 7; i++) {
      this.days.push({
        column: this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        val: this.convertStringToCamelCase(this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7))
      });
      this.days.push();
    }
    this.setWeekSelected();
    this.setActionOnClick();
  }

  /**
   * on dit récupérer la liste de planning manager de la semaine precedente
   */
  public downWeekDate(): void {
    this.downDate = true;
    this.saveContentAfterChangeDate();
  }

  /**
   *on dit récupérer la liste de planning manager de la semaine suivante
   */
  public upWeekDate(): void {
    this.upDate = true;
    this.saveContentAfterChangeDate();
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentAfterChangeDate() {
    this.changeDate = false;
    this.hiddenSave = false;
    if (this.setListPlanningManagerBeforeSaveAndVerification()) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
        header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure, true);
          const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
          const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.listPlanningManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, true);
          if (this.listContrainteMinTimeInWeek.length || listContraintCoupur.length || listContraintDureeMinShift.length || listNbrCoupureInWeek.length) {
            this.saveGenaral = true;
            this.listContrainte = this.listContrainteMinTimeInWeek.concat(listContraintCoupur, listContraintDureeMinShift, listNbrCoupureInWeek);
            this.popupVerificationContrainteVisibility = true;
            this.changeDate = true;
          } else
            this.saveFinalListPlanningMnagerInBD('changeDate');
        },
        reject: () => {
          this.resetPlanningManager();
        }
      });
    } else {
      this.resetPlanningManager();
    }
  }

  /**
   * réinitialiser les listes de planning manager, manager productif
   */
  private resetPlanningManager(): void {
    this.listPlanningManagerOrLeaderToUpdate = [];
    this.listIdShiftManagerOrLeaderToDelete = [];
    this.listShiftManagerOrLeaderByPeriodeToDelete = [];
    this.listIdPlanningManagerProductifsToDelete = [];
    this.updateOrDownDate();
  }

  private setActionOnClick(): void {
    document.querySelectorAll('.ui-datepicker-trigger').forEach((e, index) => {
      e.addEventListener('click', event => {
        this.getWeeksByMonthByRestaurant(this.dateDebut, false);
      });
    });

  }


  /**
   * savoir si le numweek est paire ou impaire
   * @param numWeek
   */
  private getWeekPairOrOdd(numWeek: number): void {
    this.listPairAndOdd = [];
    if (numWeek % 2 === 0) {
      this.listPairAndOdd.push(DisponiblitePairOrOdd.PAIR);
    } else {
      this.listPairAndOdd.push(DisponiblitePairOrOdd.ODD);
    }
  }

  /**
   * Reordert the tables day
   *
   */
  public reorderDayTables(day: string) {
    const index = this.jourSem.findIndex(d => d === day);
    if (index !== -1 && index !== 0) {
      this.jourSemEng = [...this.jourSemEng.slice(index), ...this.jourSemEng.slice(0, index)];
    }
  }

  /**
   * afficher le nom  de colunm de tableau selon la prémiere jour de la semaine de restaurant
   *  afficher les jours de semaine selon la premiere jour de la semaine de restaurant
   */
  setJourPlanninfManagerInTHeWeek() {
    this.reorderDayTables(this.premierJourDeLaSemaine);
    this.jourSem.forEach((day, index) => {
      this.JoursSemainEnum.push(
        {
          label: this.rhisTranslateService.translate('DAYS.' + this.jourSemEng[index]),
          value: this.dateService.mapEnglishDayNames(this.jourSemEng[index])
        }
      );

    });
  }

  /**
   * recuperer les jours de repos de l'employe
   ** @param :value
   */
  public setJourSemaine(value) {
    let firstDayOfweek = JSON.parse(JSON.stringify(this.dateDebut));
    firstDayOfweek = new Date(firstDayOfweek);
    if (firstDayOfweek) {
      // lors de select sur  combox
      let datePlanning;
      this.JoursSemainEnum.forEach((jouSemaine, index) => {
        if (value === jouSemaine.value.toUpperCase()) {
          if (index === 0) {
            datePlanning = new Date(firstDayOfweek);
          }
          if (index === 1) {
            datePlanning = moment(firstDayOfweek).add(1, 'days');
          }
          if (index === 2) {
            datePlanning = moment(firstDayOfweek).add(2, 'days');
          }
          if (index === 3) {
            datePlanning = moment(firstDayOfweek).add(3, 'days');
          }
          if (index === 4) {
            datePlanning = moment(firstDayOfweek).add(4, 'days');
          }
          if (index === 5) {
            datePlanning = moment(firstDayOfweek).add(5, 'days');
          }
          if (index === 6) {
            datePlanning = moment(firstDayOfweek).add(6, 'days');

          }
          datePlanning = new Date(datePlanning);
        }
      });
      return datePlanning;
    }
  }

  /**
   * Cette methode permer de calculer le decalage entre la date saisie et le premier jour de la semaine du restaurant
   */
  public findDecalage(date): number {
    const dateSelected = date;
    let decalage = 0;
    switch (this.premierJourDeLaSemaine) {
      case JourSemaine.LUNDI: {
        decalage = dateSelected.getDay() - (1 % 7);
        break;
      }
      case JourSemaine.MARDI: {
        decalage = dateSelected.getDay() - (2 % 7);
        break;
      }
      case JourSemaine.MERCREDI: {
        decalage = dateSelected.getDay() - (3 % 7);
        break;
      }
      case JourSemaine.JEUDI: {
        decalage = dateSelected.getDay() - (4 % 7);
        break;
      }
      case JourSemaine.VENDREDI: {
        decalage = dateSelected.getDay() - (5 % 7);
        break;
      }
      case JourSemaine.SAMEDI: {
        decalage = dateSelected.getDay() - (6 % 7);
        break;
      }
      case JourSemaine.DIMANCHE: {
        decalage = dateSelected.getDay() - (7 % 7);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    if (decalage < 0) {
      decalage += 7;
    }
    return decalage;
  }

  /**
   * Verification  de l'horraire du planning manager
   * on ne peut pas avoir des horaires confondues
   * pour ne peut avoir un chauvauchement pour un mnanger en differentes periode
   */
  public canAddPlanningManager(planning, filter?): boolean {
    this.dateService.setCorrectTimeToDisplayForShift(planning);
    if (filter === 'dragAndDrop') {
      this.getStartAndEndActivityDay(planning.dateJournee);
      if (planning.acheval && !planning.modifiable) {
        planning = this.updateShiftAcheval(planning);
      }
      if (this.getModeDispaly(planning) === 0 && (moment(planning.heureFin).isAfter(this.endActivity) || moment(planning.heureDebut).isBefore(this.startActivity))) {
        this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_EQUIPIER.END_START_ERROR_LIMIT_ACTIVITY');
        return false;
      }
    }
    if (this.listPlanningManagerOrLeader.length === 0) {
      return true;
    } else {

      let canAdd = true;
      let collection = this.clone(this.listPlanningManagerOrLeader.filter((shiftManager: PlanningManagerModel) => shiftManager.managerOuLeader.idEmployee === planning.managerOuLeader.idEmployee));
      collection = collection.filter((shift: PlanningManagerModel) => !shift.acheval || !shift.shiftAchevalHidden);
      if (this.modeAffichage !== 0) {
        if (moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin)) && planning.acheval) {
          if (!this.shiftService.canAddShiftAcheval(planning, this.clone(this.listPlanningManagerPreviousAndNextWeek))) {
            this.horraireConfonduesErrorMessage(filter);
            return false;
          }

        } else {
          collection = collection.concat(this.shiftService.addShiftAchevalInCurrentList(this.clone(planning), collection, true));
        }
      }
      collection.forEach(shiftDisplay => {
        if (planning.idPlanningManager !== shiftDisplay.idPlanningManager && planning.managerOuLeader.idEmployee === shiftDisplay.managerOuLeader.idEmployee) {

          planning.dateJournee = this.dateService.setTimeNull(planning.dateJournee);
          shiftDisplay.dateJournee = this.dateService.setTimeNull(shiftDisplay.dateJournee);

          if (moment(planning.dateJournee).isSame(shiftDisplay.dateJournee) || shiftDisplay.sameDateToShiftAcheval) {
            const lastValue = shiftDisplay;
            // condition dans l'intervaele
            if (lastValue.idPlanningManager !== planning.idPlanningManager) {
              if ((moment(lastValue.heureDebut).isSameOrBefore(planning.heureDebut) &&
                moment(lastValue.heureFin).isAfter(planning.heureDebut)) ||
                (moment(lastValue.heureDebut).isBefore(planning.heureFin) &&
                  moment(lastValue.heureFin).isSameOrAfter(planning.heureFin)) ||
                (moment(lastValue.heureDebut).isSameOrAfter(planning.heureDebut) &&
                  (moment(lastValue.heureFin).isSameOrBefore(planning.heureFin))
                )) {
                canAdd = canAdd && false;
              }
            }
          }
        }
      });
      if (!canAdd) {
        this.horraireConfonduesErrorMessage(filter);
      }
      return canAdd;
    }
  }

  /**
   * Cette methode permet d'afficher un message d'erreur en cas ou les horaires sont confondues
   */
  public horraireConfonduesErrorMessage(filter?) {
    // en cas de drag and drop
    this.messageConfonduPlanningManger = '';
    if (filter === 'dragAndDrop') {
      this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');
    } else {
      this.messageConfonduPlanningManger = this.rhisTranslateService.translate('PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');

    }


  }

  /**
   * reset message  du chevauchement des heures
   */
  public resetMessageConfonduPlanningManager() {
    this.messageConfonduPlanningManger = '';
  }

  /**
   * Trie des shifts
   */
  private sortListShift(listPlanningMnagerOrLeader: PlanningManagerModel[]): void {
    listPlanningMnagerOrLeader.sort(function (a: PlanningManagerModel, b: PlanningManagerModel) {
      if (a.heureDebut < b.heureDebut) {
        return -1;
      }
      if (a.heureDebut > b.heureDebut) {
        return 1;
      }
      return 0;
    });
  }

  /**
   **  verification Contrainte Social
   * @param :commuleTotal
   * @param :totalInDay
   * @param :tempsTravail
   * @param :shift
   */
  private verifContrainte(cummuleTotal: any, totalInDay: any, shift: PlanningManagerModel) {
    this.hiddenSave = false;
    if (shift.acheval && !shift.modifiable && this.changePositionAfterDragAnDrop) {
      shift = this.updateShiftAcheval(shift);
    }
    this.changePositionAfterDragAnDrop = false;

    let socialeConstraintesAreValid = true;
    let jourOfSemaine = JSON.parse(JSON.stringify(shift.dateJournee));
    jourOfSemaine = new Date(jourOfSemaine);
    jourOfSemaine = this.dateService.getJourSemaine(jourOfSemaine);
    const collection = this.planningByPeriode.get(this.planningHasAnomalieContraintSocial.idEmployee);
    let verificationContrainte = new VerificationContrainteModel();
    this.listContrainte = [];
    this.listContrainteSuppression = [];

    let listShiftInWeek = [];
    this.listPlanningManagerOrLeader.forEach((item: any) => {
      if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {
        listShiftInWeek.push(this.clone(item));
      }
    });
    listShiftInWeek = listShiftInWeek.filter((shiftDisplay: PlanningManagerModel) => !shiftDisplay.acheval || !shiftDisplay.shiftAchevalHidden);

    const exists = !!listShiftInWeek.find(item => item.idPlanningManager === shift.idPlanningManager);
    if (!exists) {
      listShiftInWeek.push(shift);
    } else {
      listShiftInWeek.forEach((item: PlanningManagerModel, index: number) => {
        // en cas de drag and drop pour ajouter un shift a un list de planning manager par eemployee si old emp est differ a le nouveau emplpoyee
        if (shift.idPlanningManager === item.idPlanningManager) {
          item = shift;
          listShiftInWeek[index] = shift;
        }
      });
    }

    let employeHasContrat = new EmployeeModel();
    const dates = JSON.parse(JSON.stringify(this.days));
    // verication hebdo contrat
    this.listManagerOrLeaderActif.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.planningHasAnomalieContraintSocial.idEmployee) {
        this.contratActif.hebdo = employeDisplay.hebdoCourant;
        employeHasContrat = this.clone(employeDisplay);
        employeHasContrat.loiEmployee = this.listLoi;
      }
    });
    let previousOrLastOfShiftWeek = this.clone(this.listPlanningManagerPreviousAndNextWeek);
    if (previousOrLastOfShiftWeek && previousOrLastOfShiftWeek.length) {
      previousOrLastOfShiftWeek = previousOrLastOfShiftWeek.filter((shiftPreviousOrNext: PlanningManagerModel) => shiftPreviousOrNext.managerOuLeader.idEmployee === employeHasContrat.idEmployee);
    }
    const totalWeekWithBreak = this.shiftService.getWeekTotalHours(dates, this.clone(listShiftInWeek), employeHasContrat, this.paramNationaux, this.listOfBreakAndShift, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, previousOrLastOfShiftWeek, 'planningManager');
    verificationContrainte = this.contrainteSocialeService.validHebdoEmployee(this.contratActif, +totalWeekWithBreak);
    if (verificationContrainte) {
      this.messageVerification = {} as VerificationContrainteModel;

      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);

      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // disponibilité de l'employé (jours de repos, disponibilités du contrat...)
    const verificationDisponibilite = this.contrainteSocialeService.validDisponibiliteEmployee(this.contratActif, shift, 'planning', this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd);
    if (verificationDisponibilite.length > 0) {
      verificationDisponibilite.forEach(item => {
        if (item.acheval) {
          const shiftAcheveToSave = this.clone(shift);
          this.dateContrainteAcheve = this.dateService.formatToShortDate(shiftAcheveToSave.dateJournee.setDate(shiftAcheveToSave.dateJournee.getDate() + 1), '/');
        }
        this.listContrainte.push(item);
        socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      });
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // disponibilité de l'employé (jours de repos)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourRepos(this.semaineRepos, shift, 'planningManager');
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // disponibilité de l'employé (congé)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerConge(this.absenceConge, shift.dateJournee);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // disponibilité de l'employé (jours de feries)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourFeries(this.listJourFeriesByRestaurant, this.listLoi, this.tempsTravailPartiel, this.mineur, shift, 'planningManager');
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nombre heure Max Par Jour Si plannifie
    const listShiftInDay = this.getListShiftByJour(shift);
    // recupere les shift apres ou avant de shift current de la journée
    let previousOrLastOfShiftInDay;
    let listShiftInDayCurrent = this.clone(listShiftInDay);
    if (this.modeAffichage === 2) {
      listShiftInDayCurrent = listShiftInDayCurrent.concat(this.shiftService.addShiftAchevalInCurrentList(shift, this.clone(this.listPlanningManagerOrLeader.filter((shiftManager: PlanningManagerModel) => shiftManager.managerOuLeader.idEmployee === employeHasContrat.idEmployee))));
      this.dateDebut = this.dateService.setTimeNull(this.dateDebut);
      this.dateFin = this.dateService.setTimeNull(this.dateFin);
      if (moment(shift.dateJournee).isSame(this.dateDebut) || moment(shift.dateJournee).isSame(this.dateFin)) {
        previousOrLastOfShiftInDay = this.clone(this.listPlanningManagerPreviousAndNextWeek);

      } else {
        previousOrLastOfShiftInDay = this.clone(listShiftInWeek);
      }
      if (previousOrLastOfShiftInDay && previousOrLastOfShiftInDay.length) {
        previousOrLastOfShiftInDay = previousOrLastOfShiftInDay.filter((shiftPreviousOrNext: PlanningManagerModel) => shiftPreviousOrNext.managerOuLeader.idEmployee === employeHasContrat.idEmployee);
        this.sortListShift(previousOrLastOfShiftInDay);
      }
    }
    employeHasContrat.loiEmployee = this.listLoi;
    employeHasContrat.contrats[0].tempsPartiel = this.tempsTravailPartiel;
    const totalDayWithBreak = this.shiftService.getDayTotalHoursForEmployee(this.clone(listShiftInDayCurrent), employeHasContrat, this.paramNationaux, this.listOfBreakAndShift, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, previousOrLastOfShiftInDay, false);
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParJourSiPlannifie(this.dateService.getNombreHeureTravaille(+totalDayWithBreak), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nombre heure Min Par Jour Si plannifie
    const totalDay = this.shiftService.getDayTotalHoursForEmployee(this.clone(listShiftInDay), employeHasContrat, this.paramNationaux, this.listOfBreakAndShift, 0, null, this.frConfig, null, false);
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMinParJourSiPlannifie(this.dateService.getNombreHeureTravaille(+totalDay), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nb d'heure maxi par semaine  (done)
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParSemaine(+totalWeekWithBreak, this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nb d'heure min par semaine  (done)
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMinParSemaine(+totalWeekWithBreak, this.listLoi, this.tempsTravailPartiel, this.mineur);
    this.listContrainteMinTimeInWeek.forEach((contrainte: any, index: number) => {
      if (contrainte.employe && (contrainte.employe.idEmployee === this.planningHasAnomalieContraintSocial.idEmployee)) {
        this.listContrainteMinTimeInWeek.splice(index, 1);
      }
    });
    if (verificationContrainte) {
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      verificationContrainte.employe = this.planningHasAnomalieContraintSocial;
      this.listContrainteMinTimeInWeek.push(verificationContrainte);
    }
    // Nombre Shift Max Par Jour
    verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(this.listLoi, this.tempsTravailPartiel, this.mineur, listShiftInDay), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // //  Amplitude journaliere maximale.
    verificationContrainte = this.contrainteSocialeService.validAmplitudeJounaliereMaximale(listShiftInDay, this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    if (jourOfSemaine === JourSemaine.DIMANCHE) {
      // Le collaborateur peut travailler le dimanche
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeDimanche(jourOfSemaine, this.listLoi, this.tempsTravailPartiel, this.mineur);
      if (verificationContrainte) {
        this.popupVerificationContrainteVisibility = true;
        this.messageVerification.bloquante = verificationContrainte.bloquante;
        this.listContrainte.push(verificationContrainte);
        socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    }
    // Nb de jours de repos mini dans une semaine
    verificationContrainte = this.contrainteSocialeService.validNombreJourOffDansUneSemaine(this.getNombreDeJourOffDansUneSemaine(shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;

    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Les jours de repos doivent-ils être consécutifs

    verificationContrainte = this.contrainteSocialeService.validJourReposConsecutif(this.getJourRepos(shift), this.listLoi, this.tempsTravailPartiel, this.mineur, this.contratActif);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // //  Heure de repos min entre 2 jours
    const employeCs = this.clone(employeHasContrat);
    if (this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee) && this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee).length) {
      employeCs.listShiftForThreeWeek = [];
      this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee).forEach((item: any) => {
        if (item.dateJournee) {
          item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
        }
        employeCs.listShiftForThreeWeek.push(item);
      });
    }
    const previousOrNextListShit = this.helperService.getListShiftOrBeforeLastDay(this.dateDebut, this.premierJourDeLaSemaine, employeCs, shift);
    verificationContrainte = this.contrainteSocialeService.validHeureRepoMinEntreDeuxJours(this.getLastDayValues(shift, previousOrNextListShit), listShiftInDay, this.getNextDayValues(shift, previousOrNextListShit), this.listLoi, this.tempsTravailPartiel, this.mineur, this.limiteHeureDebut);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nb maxi de jours travaillés consécutifs dans 1 sem
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansUneSemaine(this.getNombreDeJourTravaillerDansUneSemaine(shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // Nb maxi de jours travaillés consécutifs dans 2 sem
    // Nb des jours travaillés dans les deux premieres semaines 0-1
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(1, shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nb des jours travaillés dans les deux deuxiemes semaines 1-2
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(3, shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // valider pause planifier
    const isBreak = this.contrainteSocialeService.validPausePlanifier(this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (isBreak) {
      verificationContrainte = this.helperService.verificationContraintMaxShiftWithoutBreak(shift, this.listLoi, this.tempsTravailPartiel, this.mineur, listShiftInDay);
      if (verificationContrainte) {
        this.popupVerificationContrainteVisibility = true;
        this.messageVerification.bloquante = verificationContrainte.bloquante;
        socialeConstraintesAreValid = socialeConstraintesAreValid && false;
        this.listContrainte.push(verificationContrainte);
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Le collaborateur peut travailler le weekend
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeWeekEnd(jourOfSemaine, shift, this.listLoi, this.tempsTravailPartiel, this.mineur, this.jourDebutWeekEnd, this.jourFinWeekEnd, this.heureDebutWeekEnd, this.heureFinWeekEnd);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      this.listContrainte.push(verificationContrainte);
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Le collaborateur ne peut travailler après heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerApresHeure(listShiftInDay, this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Le collaborateur ne peut travailler avant heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerAvantHeure(listShiftInDay, this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    listShiftInDay.forEach((shiftDisplay: PlanningManagerModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);

    });
    return socialeConstraintesAreValid;
  }

  /**
   * fermer le ppup de verificattion de contrainte
   */
  public discard() {
    this.popupVerificationContrainteVisibility = false;

  }

  /**
   * recupere le nbre de shift fixe par jour
   * @param: shiftfixe
   */
  private getNombreShiftParJour(shift): number {
    let nombreShiftParJour = 0;
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (!shift.idPlanningManager) {
      collection.unshift(shift);
    }
    collection.forEach((item, index) => {
      // en cas de drag and drop pour ajouter un shift a un list de planning manager par eemployee si old emp est differ a le nouveau emplpoyee
      if (shift.idPlanningManager === item.idPlanningManager) {
        item = shift;
      }
      if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {

        shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
        item.dateJournee = this.dateService.setTimeNull(item.dateJournee);

        if (moment(shift.dateJournee).isSame(item.dateJournee)) {
          nombreShiftParJour++;
          // lors de drag ang drap
          if (this.shiftManagerToSave) {
            if (this.shiftManagerToSave.oldEmp) {
              if (this.shiftManagerToSave.oldEmp !== shift.managerOuLeader.idEmployee && shift.idPlanningManager) {
                nombreShiftParJour++;
              }

            }
          }

        }
      }
    });
    if (!shift.idPlanningManager) {

      collection.splice(collection[0], 1);
    }
    return nombreShiftParJour;
  }

  /**
   * recupere le nbr de jours non travaillé
   * @param shift
   */
  private getNombreDeJourOffDansUneSemaine(shift): number {
    let nombreDesJoursOffDansUneSemaine = 0;
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (!shift.idPlanningManager) {

      collection.unshift(shift);
    }
    collection.forEach(item => {
      if (!item.acheval || (item.acheval && item.modifiable)) {
        // en cas de drag and drop pour ajouter un shift a un list de shift  par manager si old emp est differ a le nouveau emplpoyee
        if (shift.idPlanningManager === item.idPlanningManager) {
          item = shift;
        }
        if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {
          if (item.dateJournee.getDay() === 0) {
            isWorkingDimanche = true;
          } else if (item.dateJournee.getDay() === 1) {
            isWorkingLundi = true;
          } else if (item.dateJournee.getDay() === 2) {
            isWorkingMardi = true;
          } else if (item.dateJournee.getDay() === 3) {
            isWorkingMercredi = true;
          } else if (item.dateJournee.getDay() === 4) {
            isWorkingJeudi = true;
          } else if (item.dateJournee.getDay() === 5) {
            isWorkingVendredi = true;
          } else if (item.dateJournee.getDay() === 6) {
            isWorkingSamedi = true;
          }
        }
      }
    });
    if (!shift.idPlanningManager) {

      collection.splice(collection[0], 1);
    }

    if (!isWorkingDimanche) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingLundi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingMardi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingMercredi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingJeudi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingVendredi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    if (!isWorkingSamedi) {
      nombreDesJoursOffDansUneSemaine++;
    }
    return nombreDesJoursOffDansUneSemaine;
  }

  /**
   * recupere le nbre de jour travailee pour un employee dans une semaine
   */
  private getNombreDeJourTravaillerDansUneSemaine(shift): number {
    let resultingNumber = 0;
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (!shift.idPlanningManager) {

      collection.unshift(shift);
    }
    if (collection) {
      collection.forEach(item => {
        if (!item.acheval || (item.acheval && item.modifiable)) {
          // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
          if (shift.idPlanningManager === item.idPlanningManager) {
            item = shift;
          }
          if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {

            if (item.dateJournee.getDay() === 0) {
              isWorkingDimanche = true;
            } else if (item.dateJournee.getDay() === 1) {
              isWorkingLundi = true;
            } else if (item.dateJournee.getDay() === 2) {
              isWorkingMardi = true;
            } else if (item.dateJournee.getDay() === 3) {
              isWorkingMercredi = true;
            } else if (item.dateJournee.getDay() === 4) {
              isWorkingJeudi = true;
            } else if (item.dateJournee.getDay() === 5) {
              isWorkingVendredi = true;
            } else if (item.dateJournee.getDay() === 6) {
              isWorkingSamedi = true;
            }
          }
        }
      });
    }
    if (!shift.idPlanningManager) {
      collection.splice(collection[0], 1);
    }
    if (isWorkingDimanche) {
      resultingNumber++;
    }
    if (isWorkingLundi) {
      resultingNumber++;
    }
    if (isWorkingMardi) {
      resultingNumber++;
    }
    if (isWorkingMercredi) {
      resultingNumber++;
    }
    if (isWorkingJeudi) {
      resultingNumber++;
    }
    if (isWorkingVendredi) {
      resultingNumber++;
    }
    if (isWorkingSamedi) {
      resultingNumber++;
    }
    return resultingNumber;
  }

  /**
   * recupere le jour de repos de l'employee a plannifie
   * @param :shiftFixe
   */
  private getJourRepos(shift): number[] {
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    const jourRepos: number[] = [];
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (!shift.idPlanningManager) {
      collection.unshift(shift);
    }
    if (collection) {

      collection.forEach(item => {
        if (!item.acheval || (item.acheval && item.modifiable)) {
          // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
          if (shift.idPlanningManager === item.idPlanningManager) {
            item = shift;
          }
          if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {

            if (item.dateJournee.getDay() === 0) {
              isWorkingDimanche = true;
            } else if (item.dateJournee.getDay() === 1) {
              isWorkingLundi = true;
            } else if (item.dateJournee.getDay() === 2) {
              isWorkingMardi = true;
            } else if (item.dateJournee.getDay() === 3) {
              isWorkingMercredi = true;
            } else if (item.dateJournee.getDay() === 4) {
              isWorkingJeudi = true;
            } else if (item.dateJournee.getDay() === 5) {
              isWorkingVendredi = true;
            } else if (item.dateJournee.getDay() === 6) {
              isWorkingSamedi = true;
            }
          }
        }
      });
      if (!shift.idPlanningManager) {
        collection.splice(collection[0], 1);
      }
    }
    if (!isWorkingLundi) {
      jourRepos.push(1);
    }
    if (!isWorkingMardi) {
      jourRepos.push(2);
    }
    if (!isWorkingMercredi) {
      jourRepos.push(3);
    }
    if (!isWorkingJeudi) {
      jourRepos.push(4);
    }
    if (!isWorkingVendredi) {
      jourRepos.push(5);
    }
    if (!isWorkingSamedi) {
      jourRepos.push(6);
    }
    if (!isWorkingDimanche) {
      jourRepos.push(0);
    }
    return jourRepos;
  }

  /**
   * recuperer le jour avant pour le planning manager
   * @param :shift
   */
  private getLastDayValues(shift: PlanningManagerModel, previousOrNextListShit: any): PlanningManagerModel[] {
    let lastDayDate = new Date(JSON.parse(JSON.stringify(shift.dateJournee)));
    lastDayDate.setDate(lastDayDate.getDate() - 1);
    lastDayDate = this.dateService.setTimeNull(lastDayDate);
    let lastShiftFixeValues: PlanningManagerModel[] = [];
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (collection) {
      collection.forEach(item => {
        if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {
          if (item.idPlanningManager !== shift.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
            item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
            if (moment(item.dateJournee).isSame(lastDayDate)) {
              lastShiftFixeValues.push(item);
            }
          }
        }
      });
    }
    if (previousOrNextListShit && previousOrNextListShit.length && moment(previousOrNextListShit[0].dateJournee).isSame(lastDayDate)) {
      lastShiftFixeValues = previousOrNextListShit;
    }
    return lastShiftFixeValues;
  }

  /**
   *   recuperer le jour apres pour le  planning manager

   */
  private getNextDayValues(shift: PlanningManagerModel, previousOrNextListShit: any): PlanningManagerModel[] {
    let nextDayDate = new Date(JSON.parse(JSON.stringify(shift.dateJournee)));
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    nextDayDate = this.dateService.setTimeNull(nextDayDate);
    let nextShiftFixeValues: PlanningManagerModel[] = [];
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (collection) {
      collection.forEach(item => {
        if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {
          if (item.idPlanningManager !== shift.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
            item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
            if (moment(item.dateJournee).isSame(nextDayDate)) {
              nextShiftFixeValues.push(item);
            }
          }
        }
      });
    }
    if (previousOrNextListShit && previousOrNextListShit.length && moment(previousOrNextListShit[0].dateJournee).isSame(nextDayDate)) {
      nextShiftFixeValues = previousOrNextListShit;
    }
    return nextShiftFixeValues;
  }

  /**
   * recupeere le shift fixe pour un employee dans un jour definie
   * @param :shiftFixe
   */
  private getListShiftByJour(shift) {
    const listShiftInDay: PlanningManagerModel[] = [];
    listShiftInDay.push(shift);
    let collection = [];
    collection = this.listPlanningManagerOrLeader;
    if (collection) {
      collection.forEach(item => {
        if (this.planningHasAnomalieContraintSocial && this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee) {

          item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
          shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
          this.dateService.setCorrectTimeToDisplayForShift(shift);
          if (moment(item.dateJournee).isSame(shift.dateJournee)) {
            this.dateService.setCorrectTimeToDisplayForShift(item);
            if (shift.idPlanningManager !== item.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
              listShiftInDay.push(item);
            }
          }
        }
      });
    }
    return listShiftInDay;
  }

  /**
   * récupérer le nbr de jour travailller ds deux semaine
   * @param: nbrWeek
   * @param: shift
   */
  private getNombreDeJourTravaillerDansDeuxSemaines(nbrWeek: number, shift): number {
    const accumulateConsecutiveWorkDays: number[] = [];
    let incrementer = 0;
    let resultingNumber = 0;
    if (this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee) && this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee).length) {

      const collection = [];
      let maxConsecutiveWorking: Date[] = [];
      let currentWeekdateFin: Date = new Date(JSON.parse(JSON.stringify(this.dateFin)));
      let previousWeekDateDebut: Date = new Date(JSON.parse(JSON.stringify(this.dateDebut)));
      previousWeekDateDebut = new Date(previousWeekDateDebut.setDate(previousWeekDateDebut.getDate() - 8));
      let nextWeekdateFin: Date = new Date(JSON.parse(JSON.stringify(this.dateFin)));
      nextWeekdateFin = new Date(nextWeekdateFin.setDate(nextWeekdateFin.getDate() + 7));
      if (nbrWeek === 1) {
        maxConsecutiveWorking = this.getNumberOfDaysFromRestaurantFirstWeekDay(previousWeekDateDebut, currentWeekdateFin);
      } else {
        currentWeekdateFin = new Date(currentWeekdateFin.setDate(currentWeekdateFin.getDate() - 7));
        maxConsecutiveWorking = this.getNumberOfDaysFromRestaurantFirstWeekDay(currentWeekdateFin, nextWeekdateFin);
      }
      maxConsecutiveWorking.sort((d1: Date, d2: Date) => this.dateService.sortDates(d1, d2));
      this.planningThreeWeeksByManager.get(this.planningHasAnomalieContraintSocial.idEmployee).forEach((item: any) => {
        collection.push(item);
      });

      this.listPlanningManagerOrLeader.forEach((item: any) => {
        if (shift.idPlanningManager === item.idPlanningManager) {
          collection.push(shift);
        } else {
          if (this.planningHasAnomalieContraintSocial.idEmployee === item.managerOuLeader.idEmployee)
            collection.push(item);
        }
      });
      if (!shift.idPlanningManager) {
        collection.unshift(shift);
      }
      maxConsecutiveWorking.forEach((date: Date) => {
        if (this.isPlanningExistInDate(collection, date)) {
          incrementer++;
        } else {
          accumulateConsecutiveWorkDays.push(incrementer);
          incrementer = 0;
        }
      });
      accumulateConsecutiveWorkDays.push(incrementer);
      if (!shift.idPlanningManager) {
        collection.splice(collection[0], 1);
      }
      if (collection) {
        collection.forEach((item: any, index: number) => {
          if (shift.idPlanningManager === item.idPlanningManager) {
            collection.splice(index, 1);
          }
        });
      }
      if (accumulateConsecutiveWorkDays.length) {
        resultingNumber = Math.max(...accumulateConsecutiveWorkDays); // quand un tableau vide returns (maxConsecutiveWorkDays  -Infinity)
      } else {
        resultingNumber = 0;
      }
    }
    return resultingNumber;
  }

  private isPlanningExistInDate(listShifts: PlanningManagerModel[], date: Date): boolean {
    return listShifts.some(
      p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
  }

  /**
   * recuperer lsemaine precedente et la semaine suivante
   */
  public getListPlanningManagersForThreeWeeks() {
    this.planningManagerService.getThreeWeeksListPlanningManagers(this.dateDebut, this.hasPlanningLeader).subscribe((data: PlanningManagerModel[]) => {
      this.listPlanningManageOrLeaderrForThreeWeeks = data;
      this.listPlanningManageOrLeaderrForThreeWeeks.forEach(item => {
        this.setCorrectTimeToDisplay(item);
      });
      this.planningThreeWeeksByManager = this.groupPlanningTreeWeekByManager(this.listPlanningManageOrLeaderrForThreeWeeks, plg => plg.managerOuLeader.idEmployee);
    }, (err: any) => {
      console.log(err);
    });
  }

  /**
   * Permet de grouper la liste des plannings manager par manager dans une map<Manager,ListPlanningManager>
   * @param: list
   * @param :keyGetter
   */
  public groupPlanningTreeWeekByManager(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        if (!(moment(item.dateJournee).isSameOrAfter(this.dateDebut) && moment(item.dateJournee).isSameOrBefore(this.dateFin)))
          collection.push(item);
      }
    });
    return map;
  }

  /**
   * s'il y a un contraint bloquante, on ne peur pas ajouter shift
   */
  public getBlockedConstraint(): boolean {
    let areBlocked = false;
    this.listContrainte.forEach(item => {
      areBlocked = areBlocked || item.bloquante;
      if (item.bloquante) {
        this.hiddenSave = true;
      }
    });
    if (this.listContrainteSuppression.length) {
      this.listContrainteSuppression.forEach(item => {
        areBlocked = areBlocked || item.bloquante;
        if (item.bloquante) {
          this.hiddenSave = true;
        }
      });
    }
    return areBlocked;
  }

  /**
   * fermer le pupup
   */
  public closePopup($event: any) {
    this.popupVerificationContrainteVisibility = false;
    this.popupVerificationCsMaxShift = false;

    this.eventCtrl = false;
    this.saveGenaral = false;
    if (this.navigateTo) {
      this.navigateAway.next(false);
      this.navigateTo = false;
    }
    if (this.changeDate) {
      this.upDate = false;
      this.downDate = false;
      this.changeDate = false;
    }
  }

  /**
   * Enregistrer shift  si aucune contrainte bloquante

   */
  public save() {
    if (!this.getBlockedConstraint()) {
      if (!this.saveGenaral) {
        if (this.shiftManagerToSave.managerOuLeader) {
          if (this.shiftManagerToSave.idPlanningManager) {
            this.updatePlanningManager();
          } else {
            this.addNewPlanningManager();
          }
        } else {
          if (this.eventCtrl) {
            this.copiePlanningManagerOrLeaderVuePost(this.shiftManagerToSave);
          } else {
            this.moveShiftCard(this.shiftManagerToSave);
          }
        }
        this.popupVerificationContrainteVisibility = false;
      } else {
        this.saveFinalListPlanningMnagerInBD();
      }
    } else {
      this.popupVerificationContrainteVisibility = true;
      this.showPopAddShiftManager = false;

    }
  }

  /**
   * inisilazer le calendries
   */
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
      weekHeader: '', //Sem.
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }

  /**
   * get planning manager after drag and drop for verificat contrainte social
   * @param: cardDropInfos
   * @param: periode
   */
  private getPlanningManagerBeforeDragAndDrop(cardDropInfos, periode): PlanningManagerModel {
    let planningManager = {} as PlanningManagerModel;
    this.listPlanningManagerOrLeader.forEach(shift => {
      if (shift.idPlanningManager === cardDropInfos.idPlanningManager) {
        planningManager = {...shift};
        if (this.eventCtrl) {
          planningManager.idPlanningManager = 0;
          if (planningManager.planningManagerProductif) {
            planningManager.planningManagerProductif.forEach((item: PlanningManagerProductifModel) => {
              item.idPlanningManagerProductif = 0;
              if (item.uuid) {
                delete item.uuid;
              }
            });
          }
          if (planningManager.uuid) {
            delete planningManager.uuid;
          }
        }
        planningManager.periodeManager = periode;
        planningManager.dateJournee = this.setJourSemaine(cardDropInfos.newDayZone.toUpperCase());
      }
    });

    return planningManager;
  }

  /**
   * methode excecute after init
   */
  reCalculeHeight() {
    this.cdRef.detectChanges();
    const windowHeight = window.innerHeight;
    this.contentHeightPlanning = windowHeight - 270;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
    this.reCalculeHeight();
  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.reCalculeHeight();
  }

  /**
   * fermer le popup de planning manager
   */
  public resetPopupOfPlanningManager(): void {
    this.eventCtrl = false;
  }

  /**
   * Cette méthode permet d'identifier la fin/début activité de la journée
   */
  private getStartTimeAndEndTimeFromDecoupageHoraire(dayName: string): void {
    const key = dayName[0] + dayName.substring(1).toLowerCase();
    // Extract open/close hour based on the created key
    this.startTime = this.debutJourneeActivite['valeur' + key];
    this.startTimeIsNight = this.debutJourneeActivite['valeur' + key + 'IsNight'];
    this.endTime = this.finJourneeActivite['valeur' + key];
    this.endTimeIsNight = this.finJourneeActivite['valeur' + key + 'IsNight'];

  }

  /**
   * Cette methode permet de retourner le découpage horaire d'un restaurant
   */
  private getDecoupageHoraire() {
    this.decoupageHoraireService.getFinJourneePhase().subscribe(
      (endDecoupageHoraire: DecoupageHoraireModel) => {
        this.finJourneeActivite = endDecoupageHoraire;
        this.decoupageHoraireService.getDebutJourneePhase().subscribe(
          (data: DecoupageHoraireModel) => {
            this.debutJourneeActivite = data;
            this.decoupageHoraireFinEtDebutActivity = {debutJournee: this.debutJourneeActivite, finJournee: this.finJourneeActivite};
          },
        );

      },
    );
  }

  public updateShiftAcheval(planning: PlanningManagerModel, filter?: boolean): PlanningManagerModel {
    if (planning.acheval && !planning.modifiable) {
      this.getStartAndEndActivityDay(planning.dateJournee);
      let ShiftCurrent = this.clone(planning);
      planning.heureFinIsNight = true;
      planning.modifiable = true;
      if (ShiftCurrent.heureDebut.getHours() >= 0 && (ShiftCurrent.heureDebut.getHours() <= this.endActivity.getHours() || ((ShiftCurrent.heureDebut.getHours() === this.endActivity.getHours())))) {
        planning.heureDebutIsNight = true;
      }
      if (planning.achevalWeek && filter) {
        planning.modifiable = false;
        planning.heureFinIsNight = false;
        planning.heureDebutIsNight = false;
      }
      this.dateService.setCorrectTimeToDisplayForShift(planning);
    }
    return planning;

  }

  public getNumberOfDaysFromRestaurantFirstWeekDay(dateDebut: Date, dateFin: Date): Date[] {
    const wantedDates: Date[] = [];
    let workingDate = dateDebut;
    while (moment(workingDate).isBefore(new Date(dateFin))) {
      wantedDates.push(workingDate);
      workingDate = new Date(workingDate.setDate(workingDate.getDate() + 1));
    }

    return wantedDates;
  }

  /**
   * recuperer date de semaine selectionné
   * @param: year
   */
  private firstDayOfWeek(): Date {
    let date;
    this.weeksPerMonth.forEach((item: any) => {
      if (item.weekNumber === +this.sessionService.getCurrentWeek()) {
        date = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      }
    });

    return date;
  }

  private getWeeksByMonthByRestaurant(selectedDate: Date, firstCheck: boolean, monthChange?: boolean): void {
    if (!selectedDate) {
      selectedDate = moment().day('Monday').year(+this.sessionService.getCurrentYear()).week(+this.sessionService.getCurrentWeek()).toDate();
    }
    const selectedDateAsString = this.dateService.formatToShortDate(selectedDate);
    this.restaurantService.getListWeekFromMonthByRestaurant(selectedDateAsString).subscribe((weeksPerMonth: any) => {
      this.weeksPerMonth = weeksPerMonth;
      this.setCorrectWeekNumbers();
      if (firstCheck) {
        this.selectDate(this.firstDayOfWeek(), 'weekFromPlanningHome');
      }
      if (!monthChange) {
        this.weekSelected = this.getWeekNumber(selectedDate);
        this.sessionService.setCurrentWeek(this.weekSelected);
        this.sessionService.setCurrentYear(selectedDate.getFullYear().toString());

      }
    }, () => {
    });
  }

  private setCorrectWeekNumbers(): void {
    const weeksElements = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksElementsArray = Array.from(weeksElements);
    weeksElementsArray.forEach((element: any, index: number) => {
      element.innerHTML = this.weeksPerMonth[index].weekNumber;
    });
  }

  /**
   * recupere semaine de date selectioné
   * @param: date
   */
  private getWeekNumber(dateSelected: any): number {
    dateSelected = this.dateService.setTimeNull(dateSelected);
    let weekNumber = 0;
    this.weeksPerMonth.forEach((item: any) => {
      const dateDebut = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      const dateFin = this.dateService.createDateFromStringPattern(item.dateFin, 'YYYY-MM-DD');
      this.dateService.resetSecondsAndMilliseconds(dateSelected);
      if (dateDebut.getTime() <= dateSelected.getTime() && dateFin.getTime() >= dateSelected.getTime()) {
        weekNumber = +item.weekNumber;
      }
    });
    this.getWeekPairOrOdd(weekNumber);
    return weekNumber;
  }

  public displayRapportPopup() {
    this.selectedRapport = this.listRapports.find((rapport: RapportModel) => rapport.codeName === this.PLANNING_MANAGERS);
    this.showPopupRapport = true;
  }

  public closeRapportPopup(): void {
    this.showPopupRapport = false;
  }

  public launchGenerateRapport(event: any): void {
    this.showPopupRapport = false;
    this.sessionService.setPdfPlanningManagersSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      managerOrLeader: event.managerOrLeader,
      sortingCriteria: event.sortingCriteria
    });
    const url = window.location.href;
    window.open(url.substr(0, url.lastIndexOf('/')) + '/display/' + this.selectedRapport.codeName, '_blank');
  }

  private getModeDispaly(planning: PlanningManagerModel): number {
    return this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, planning.dateJournee, this.dateService).updatedModeAffichage;

  }

  /**
   * supprime shift acheval et non modifiable
   * @param idPlanningManager
   * @param mangerOrLeaderActif
   */
  public deleteShiftAchevalHidden(idPlanningManager: any, idPoste: number): void {
    const collection = this.planningByPeriode.get(idPoste);
    const indexPlanningManager = collection.findIndex((item: PlanningManagerModel) => item.idPlanningManager === idPlanningManager && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManager !== -1) {
      collection.splice(indexPlanningManager, 1);
    }
    const indexPlanningManagerDeleted = this.listPlanningManagerOrLeader.findIndex((item: PlanningManagerModel) => item.idPlanningManager === idPlanningManager && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManagerDeleted !== -1) {
      this.listPlanningManagerOrLeader.splice(indexPlanningManagerDeleted, 1);
    }
  }

  /**
   * Trie des shifts
   */
  /**
   * Trie des shifts
   */
  private sortListShiftByShiftAcheval(listPlanningMnagerOrLeader: PlanningManagerModel[]): void {
    listPlanningMnagerOrLeader.sort(function (shift: PlanningManagerModel, shiftDisplay: PlanningManagerModel) {
      // true values first
      return (shift.acheval && shift.modifiable === shiftDisplay.acheval && shift.modifiable) ? 0 : shift.acheval && shift.modifiable ? 0 : shift.acheval && !shift.modifiable ? -1 : 1;
    });
  }

  hideDropDown() {
    const elems = document.querySelectorAll('.show');
    elems.forEach( (el) => {
      el.classList.remove('show');
    });
  }
}
