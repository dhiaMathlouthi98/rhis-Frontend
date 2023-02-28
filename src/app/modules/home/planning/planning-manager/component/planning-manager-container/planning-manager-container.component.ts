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
import {AbsenceCongeModel, DetailEvenementModel} from '../../../../../../shared/model/absence.conge.model';
import {Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {DisponiblitePairOrOdd} from '../../../../../../shared/enumeration/disponiblitePairOrOdd';
import {SessionService} from '../../../../../../shared/service/session.service';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {CodeNameContrainteSocial} from '../../../../../../shared/enumeration/codeNameContrainteSocial';
import {DecoupageHoraireModel} from '../../../../../../shared/model/decoupage.horaire.model';
import {DecoupageHoraireService} from '../../../configuration/service/decoupage.horaire.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import {PlanningManagerProductifModel} from '../../../../../../shared/model/planningManagerProductif.model';
import {ShiftService} from '../../../planning-equipier/service/shift.service';
import * as moment from 'moment';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import * as rfdc from 'rfdc';
import {RapportService} from '../../../../employes/service/rapport.service';
import {RapportModel} from '../../../../../../shared/model/rapport.model';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

declare var interact;


@Component({
  selector: 'rhis-planning-manager-container',
  templateUrl: './planning-manager-container.component.html',
  styleUrls: ['./planning-manager-container.component.scss'],

})
export class PlanningManagerContainerComponent implements OnInit, AfterViewChecked, AfterViewInit {
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public listPairAndOdd: DisponiblitePairOrOdd [] = [];
  // si on clique sur le button sup
  public showConfimeDelete = false;
  public hiddenSave = false;
  public dateJour;
  public JoursSemainEnum = [];
  private listLoiByCodeName: any;
  public draggableElementPlanningManager: any;
  public shiftManagerToSave: any;
  public showPopAddShiftManager = false;
  public listContrainte: VerificationContrainteModel[] = [];
  public listContrainteMinTimeInWeek: VerificationContrainteModel[] = [];
  public listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[] = [];
  public saveGenaral = false;
  public popupVerificationContrainteVisibility = false;
  public messageVerification = {} as VerificationContrainteModel;
  public manangerHasAnomalieContraintSocial = {} as EmployeeModel;
  public dateContraintSocial: any;
  public dateContrainteAcheve: any;
  public dateContraintSocialGeneral: any;
  public selectedManagerOrLeader = {} as EmployeeModel;
  public listPlanningManagerOrLeaderToUpdate: PlanningManagerModel[] = [];
  public listIdShiftManagerOrLeaderToDelete: any[] = [];
  public listShiftManagerByManagerToDelete: any[] = [];
  public listShiftManagerByPeriodeToDelete: any[] = [];
  public filter: string;
  private listLoi: any;
  private semaineRepos: SemaineReposModel[] = [];
  public listManagerOrLeaderActif: EmployeeModel[] = [];

  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public listPlanningManager: PlanningManagerModel[] = [];
  public listPlanningManagerPreviousAndNextWeek: PlanningManagerModel[] = [];
  public listePositionTravail: PositionTravailModel[] = [];
  public clone = rfdc();
  public totalShiftManagerInWeek = 0;
  public firstDayAsInteger = 0;
  public listManagerWithPlanningManager: EmployeeModel[] = [];
  // pour afficher le manager ou leader qui ont des historiques de planning manager ou leader
  public listManagerOrleaderInactif: EmployeeModel[] = [];

  public planningByManagerOrLeader = new Map();
  public listLoiByEmployee = new Map();
  public listLoiByGroupTravail = new Map();
  public values = [];
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

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
  public listPlanningManagerForThreeWeeks: PlanningManagerModel[];
  public listIdPlanningManagerProductifsToDelete = [];
  public dateSelected: Date;
  public idEmployeeSelected: number;
  public employeInactif = false;
  public url;
  public loiGroupeTravail = [];
  public loiRestaurant = [];
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
  public heureFinWeekEnd: Date;
  public premierJourDeLaSemaine: JourSemaine;
  public contratActif = {} as ContratModel;
  public tempsTravailPartiel = false;
  public mineur: boolean;
  public calendar_fr;
  public weekSelected;
  public valeurProductif;

  public contentHeightPlanning: number;
  // si plannge mgr :has planning leader prend 0
  // si plannge leader: has planning leader prend 1
  public hasPlanningLeader = 0;

  @ViewChild('contentBodyPlan') calcHeight: ElementRef;
  public eventCtrl = false;
  public navigateTo = false;
  public changeDate = false;
  public downDate = false;
  public upDate = false;
  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;
  public decoupageHoraireFinEtDebutActivity: any;

  public startTime: string;
  public startTimeIsNight: boolean;
  public endTime: string;
  public endTimeIsNight: boolean;

  public ecran = 'VPM';

  private weeksPerMonth = [];
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
  public startActivity: any;
  public endActivity: any;
  public minBeforeCoupure = 0;
  private MIN_BEFORE_COUPURE_CODE_NAME = 'MINBEFORCOUPURE';
  public modeAffichage = 0;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public changePositionAfterDragAnDrop = false;

  /**
   * configuration du calendrier pour afficher les dates en français
   */
  public frConfig: any;

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
    private domControlService: DomControlService,
    private sessionService: SessionService,
    private decoupageHoraireService: DecoupageHoraireService,
    private helperService: HelperService,
    private shiftService: ShiftService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private rapportService: RapportService,
    private parametreService: ParametreGlobalService,
    private limitDecoupageService: LimitDecoupageFulldayService
  ) {
  }

  ngOnInit() {
    this.getParamRestaurantByCodeNames();
    this.getDecoupageHoraire();
    this.initCalender();
    this.getRestaurantLawsByCodeName();
    this.getParamNationauxByRestaurant();
    this.getPlanningManagerOrPlanningLeader();
    this.getListRapportByCodeName();
    setTimeout(() =>
        this.onReadyInitDrag() // initialisation de l'interraction du drag & drop des cards
      , 300);
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
   * on va gerer  planning manager ou planning leader selon l'url
   * si on trouve 'lerader' donc on a planning leader si non planning mgr
   */
  public getPlanningManagerOrPlanningLeader() {
    this.url = this.router.url;
    if (this.url.includes('leader')) {
      this.hasPlanningLeader = 1;
      this.addPopupTitle = this.rhisTranslateService.translate('PLANNING_LEADER.MODAL_ADD_TITLE');
      this.updatePopupTitle = this.rhisTranslateService.translate('PLANNING_LEADER.MODAL_UPDATE_TITLE');
      this.getGroupeTravailLawsByCodeName();
      this.getSelectedRestaurant();
      this.listContrainteMinTimeInWeek = [];
    } else if (this.url.includes('manager')) {
      this.hasPlanningLeader = 0;
      this.getGroupeTravailLawsByCodeName();
      this.getSelectedRestaurant();
      this.listContrainteMinTimeInWeek = [];


    }

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

  /**
   * recuperer tous les jours feries par restaurant
   */
  private getJourFeriesByRestaurant() {
    this.joursFeriesServie.getAllJourFeriesByRestaurantAndDate(this.dateDebut).subscribe((data: JourFeriesModel[]) => {
        this.listJourFeriesByRestaurant = data;

      },
    );
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

  /* get list periodes manager*/
  private getAllperiodesManager() {
    this.periodeManagerService.getAllPeriodeManagerByRestaurantWithStatut(true).subscribe(
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
  private getContratByManagerActif(employee: EmployeeModel, dateShift: Date, filterDragAndDrop?: string): void {
    let shiftToSave = null;
    if (filterDragAndDrop) {
      const indexPlanningOrLeaderToMove = this.listPlanningManager.findIndex(shift => shift.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
      if (indexPlanningOrLeaderToMove !== -1) {
        shiftToSave = this.clone(this.listPlanningManager[indexPlanningOrLeaderToMove]);
      }
    }
    if (this.dateSelected !== dateShift || this.idEmployeeSelected !== employee.idEmployee) {
      this.dateSelected = dateShift;
      this.idEmployeeSelected = employee.idEmployee;
      const employeeHasContrat = this.clone(employee);
      if (this.contrainteSocialeService.getContratByDay(employeeHasContrat, new Date(dateShift)).contrats) {
        const data = this.contrainteSocialeService.getContratByDay(employeeHasContrat, new Date(dateShift)).contrats[0];
        this.employeInactif = false;
        this.getFullContrat(employee, data);
        this.checkIsFoundJourReposByEmployee(employee);
        this.identifierEmployee(employee, filterDragAndDrop);
      } else {
        this.employeInactif = true;
        if (filterDragAndDrop) {
          this.resetCradInitialPlace(shiftToSave);
        }
        this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');
      }

    } else if (filterDragAndDrop) {
      if (!this.employeInactif) {
        this.checkShiftChangePosition(employee);
      } else {
        this.resetCradInitialPlace(shiftToSave);
      }

    } else if (this.employeInactif) {
      this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');
    }
  }

  /**
   * reset the card to the initial place
   */
  private resetCradInitialPlace(shift: PlanningManagerModel): void {
    if (shift && shift.acheval) {
      const indexShiftToMove = this.listPlanningManager.findIndex((item: PlanningManagerModel) => item.idPlanningManager === shift.idPlanningManager && !item.shiftAchevalHidden);
      let shiftDisplay = this.listPlanningManager[indexShiftToMove];
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
  private getFullContrat(employee: EmployeeModel, contrat: ContratModel): void {
    this.contratActif = contrat;
    employee.contrats.forEach((contratrDisplay: ContratModel, index: number) => {
      if (contrat.idContrat === contratrDisplay.idContrat) {
        employee.contrats.splice(index, 1);
      }

    });
    employee.contrats.unshift(contrat);
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
  private identifierEmployee(employee: EmployeeModel, filterDragAndDrop?: string): void {
    this.checkEmployeMineur(employee);
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
   *  permet de recupere le sexe et l'age de l 'employee
   * @param :employee
   */
  private checkEmployeMineur(employee: EmployeeModel): void {
    const dateNaissance = new Date(Date.parse(employee.dateNaissance));
    const dateCourante = new Date();
    const age = moment(dateCourante).diff(moment(dateNaissance), 'year');
    if ((age >= this.sharedRestaurant.selectedRestaurant.pays.majeurMasculin && employee.sexe === Sexe.MASCULIN) ||
      (age >= this.sharedRestaurant.selectedRestaurant.pays.majeurFeminin && employee.sexe === Sexe.FEMININ)) {
      this.mineur = false;
    } else {
      this.mineur = true;
    }
  }

  /**
   * permet de recupere le lois l 'employee par code name
   * @param: employee
   */
  private async getlawByCodeName(employee: EmployeeModel): Promise<void> {
    this.checkEmployeMineur(employee);
    if (employee.contrats[0].tempsPartiel) {
      this.tempsTravailPartiel = true;
    } else {
      this.tempsTravailPartiel = false;
    }
    if (employee.hasLaws) {
      // employee laws
      this.listLoiByCodeName = employee.loiEmployee;
    } else if (employee.contrats[0].groupeTravail.hasLaws) {
      // groupe trav laws
      this.listLoiByCodeName = this.contrainteSocialeCoupureService.getLoiForEmployee(employee, this.loiGroupeTravail);
    } else {
      // restaurant laws
      this.listLoiByCodeName = this.loiRestaurant;
    }
    const collection = this.clone(this.planningByManagerOrLeader.get(employee.idEmployee));
    this.takeBreakswithTime(collection, this.listLoiByCodeName, employee);
    employee.totalRowTime = this.totalRowTime;
  }

  /**
   * Cette méthode permet de vérifier si  la liste des loi de l'employee existe
   *
   * @param: Employee
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
   * @param: filterDragAndDrop
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
   * @param :employee
   */
  private getParamNatValues() {

    this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    this.jourDebutWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourWeekend;
    this.jourFinWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.dernierJourWeekend;
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    this.setJourPlanninfManagerInTHeWeek();


  }

  public setWeeksValue(event: any): void {
    this.getWeeksByMonthByRestaurant(new Date(event.year, (+event.month) - 1), false, true);
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
        this.saveContentAfterChangeDate();
      } else {
        this.findAllEmployeActifWithGroupTravailsPlgManager();
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
        this.getAllperiodesManager();
        this.getHeureLimite();
        this.getListePositionTravailProductifByRestaurant();
        this.getvaleurProductif();

      }, (err: any) => {
        // TODO error panel
        console.log(err);
      }
    );
  }

  /**
   * Permet de grouper la liste des plannings manager par manager dans une map<Manager,ListPlanningManager>
   * @param: list
   * @param: keyGetter
   */
  public groupPlanningTreeWeekByManager(list, keyGetter): Map<any, any> {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        if (!(moment(item.dateJournee).isSameOrAfter(this.dateDebut) && moment(item.dateJournee).isSameOrBefore(this.dateFin))) {
          collection.push(item);
        }
      }
    });
    return map;
  }

  /**
   * s'éxécute à chaque déplacement du pointeur de la souris afin de déplacer le card avec et activer les drop zone correspondantes
   * @param: event
   */
  dragMoveListener(event) {
    const target = event.target, // card en cours de déplacement
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
   *  la sauvegarde par le button save
   *  * */
  public saveListPlanningManagerOrLeader(): void {
    this.saveGenaral = false;
    this.hiddenSave = false;

    if (this.setListPlanningManagerOrLeaderBeforeSaveAndVerification()) {
      const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
      const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
      const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure);
      if (this.listContrainteMinTimeInWeek.length > 0 || listContraintDureeMinShift.length || listContraintCoupur.length || listNbrCoupureInWeek.length) {
        this.saveGenaral = true;
        this.listContrainte = this.listContrainteMinTimeInWeek.concat(listContraintDureeMinShift, listContraintCoupur, listNbrCoupureInWeek);
        this.popupVerificationContrainteVisibility = true;
      } else {

        this.saveFinalListPlanningMnagerInBD();
      }
    } else {
      this.listIdShiftManagerOrLeaderToDelete = [];
      this.listShiftManagerByManagerToDelete = [];
      this.listIdPlanningManagerProductifsToDelete = [];
    }

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
   * Cette methode permet de recuperer la liste des plannings managers
   */
  public getListPlanningManagers(): void {
    this.planningManagerService.getListPlanningManagers(this.dateDebut, this.dateFin, this.hasPlanningLeader).subscribe(
      (data: PlanningManagerModel[]) => {
        this.listPlanningManager = data;
        let listShiftInWeek = this.clone(this.listPlanningManager);

        this.listPlanningManager.forEach((planning: PlanningManagerModel) => {
          this.setCorrectTimeToDisplay(planning);
          this.dateService.setCorrectTimeToDisplayForShift(planning);
          if (planning.acheval && planning.modifiable && !moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
            this.listPlanningManager.push(this.shiftService.addShiftAcheval(this.clone(planning), true));
          }
          planning = this.setAchevalWeekToShift(planning);


          if (planning.planningManagerProductif && planning.planningManagerProductif.length) {
            planning.planningManagerProductif.forEach(production => {
              this.setCorrectTimeToDisplay(production, true);
            });
          }
          const indexManagerLeader = this.listManagerOrLeaderActif.findIndex((emp: any) => emp.idEmployee === planning.managerOuLeader.idEmployee);
          if (indexManagerLeader !== -1) {
            this.listManagerOrLeaderActif[indexManagerLeader].absenceConges.forEach((conge: AbsenceCongeModel) => {
              this.dateService.setCorrectTimeToDisplayForShift(conge);

              if (moment(this.dateService.setTimeNull(planning.dateJournee)).isSameOrAfter(this.dateService.setTimeNull(conge.dateDebut)) && moment(this.dateService.setTimeNull(planning.dateJournee)).isSameOrBefore(this.dateService.setTimeNull(conge.dateFin)) && conge.typeEvenement.previsible && ((!planning.acheval)
                || (planning.acheval && planning.modifiable) || (planning.acheval && !planning.modifiable &&
                  !moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateDebut))))) {

                const indexShiftToRemove = listShiftInWeek.findIndex(val => val.idPlanningManager === planning.idPlanningManager);
                if (indexShiftToRemove !== -1) {
                  listShiftInWeek.splice(indexShiftToRemove, 1);
                }
              }
            });

          }
        });
        this.listManagerOrLeaderActif.forEach((element: EmployeeModel) => {
          element.totalAbsence = 0;
          element.absenceConges.forEach((conge: AbsenceCongeModel) => {
            this.dateService.setCorrectTimeToDisplayForShift(conge);
            conge.detailEvenements.forEach((event: DetailEvenementModel) => {
              this.dateService.setCorrectDate(new Date(event.dateEvent));
              this.dateService.setTimeNull(new Date(event.dateEvent));
              if ((moment(this.dateService.setTimeNull(event.dateEvent)).isSameOrAfter(this.dateService.setTimeNull(this.dateDebut)) && moment(this.dateService.setTimeNull(event.dateEvent)).isSameOrBefore(this.dateService.setTimeNull(this.dateFin))) && conge.typeEvenement.previsible) {
                element.totalAbsence += (event.nbHeure * 60);
              }

            });


          });

        });
        listShiftInWeek.forEach((planning: PlanningManagerModel) => {
          this.setCorrectTimeToDisplay(planning);
          this.dateService.setCorrectTimeToDisplayForShift(planning);
          if (planning.acheval && planning.modifiable && !moment(this.dateService.setTimeNull(planning.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
            listShiftInWeek.push(this.shiftService.addShiftAcheval(this.clone(planning), true));
          }
          planning = this.setAchevalWeekToShift(planning);
          if (planning.planningManagerProductif && planning.planningManagerProductif.length) {
            planning.planningManagerProductif.forEach(production => {
              this.setCorrectTimeToDisplay(production, true);
            });
          }
        });

        this.listPlanningManager = listShiftInWeek;
        this.sortListShiftByShiftAcheval(this.listPlanningManager);
        this.upDate = false;
        this.downDate = false;
        this.listManagerWithPlanningManager = [];
        this.planningByManagerOrLeader = new Map();
        this.planningByManagerOrLeader = this.groupPlanningByManager(this.listPlanningManager, plg => plg.managerOuLeader.idEmployee);
        if (this.listPlanningManager.length > 0) {
          this.fillAvailableManagerActif();
        }
        this.sessionService.setCurrentYear(this.dateDebut.getFullYear().toString());
        this.sessionService.setCurrentWeek(this.weekSelected.toString());
        this.calculeTotalInWeekAndTotalInDayForPlanningManager();
        this.getJourFeriesByRestaurant();
        this.getListPlanningManagersForThreeWeeks();
        this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  public setAchevalWeekToShift(planning: PlanningManagerModel): PlanningManagerModel {
    if (planning.acheval && !planning.shiftAchevalHidden) {
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
   * @param: event
   */
  public initValuesForVerificationContrainte(event: any): void {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(event.day);
    this.showPopAddShiftManager = false;
    this.getContratByManagerActif(event.employee, this.setJourSemaine(event.day));
  }

  /**
   * Permet de grouper la liste des planning  par manager
   * @param: list
   * @param: keyGetter
   */
  private groupPlanningByManager(list, keyGetter) {
    const map = new Map();
    if (list.length > 0) {
      list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
          this.listManagerOrLeaderActif.forEach(managerLeader => {
            if (managerLeader.idEmployee === item.managerOuLeader.idEmployee) {
              this.listManagerWithPlanningManager.push(managerLeader);
            }

          });

        } else {
          collection.push(item);
        }
      });
    } else {
      this.listManagerOrLeaderActif.forEach(manager => {
        map.set(manager.idEmployee, []);
        this.listManagerWithPlanningManager.push(manager);

      });
    }
    this.getHistoriqueOfPlanningManagerOrPlanningLeader();

    return map;
  }

  /**
   *Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe,
   * il faut garder et afficher l’historique des plannings
   */
  public getHistoriqueOfPlanningManagerOrPlanningLeader() {
    this.listManagerOrleaderInactif = [];
    this.listPlanningManager.forEach(planningManagerOrLeader => {
      const exist = this.listManagerOrLeaderActif.some(ManagerOrLeader =>
        ManagerOrLeader.idEmployee === planningManagerOrLeader.managerOuLeader.idEmployee
      );
      // pour eviter la duplication
      const duplicate = this.listManagerOrleaderInactif.some(ManagerOrLeader =>
        ManagerOrLeader.idEmployee === planningManagerOrLeader.managerOuLeader.idEmployee
      );
      // ajpouter des managers pou leaders ont de plannings manager ou leader et non pas actif ou leurs groupes travails ont changés
      if (!exist && !duplicate) {
        planningManagerOrLeader.managerOuLeader.disablePlanningManagerOrLeaderOrFixe = true;
        this.listManagerOrleaderInactif.push(planningManagerOrLeader.managerOuLeader);
      }

    });

    this.listManagerWithPlanningManager = this.listManagerWithPlanningManager.concat(this.listManagerOrleaderInactif);
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
  private findAllEmployeActifWithGroupTravailsPlgManager() {
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
   */
  private updatePlanningManager(): void {
    this.shiftManagerToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
    this.updatePlanningManagerAfterSave();
  }

  /**
   * modifier  sift  dans la list de shift  et dans la map shift fixe par employee
   * recuperer la list de shift de fixe qe on va enregistrer (listShiftsToUpdate)
   * @param :data
   */
  private updatePlanningManagerAfterSave(): void {
    let shiftAcheveToSave = new PlanningManagerModel();
    if (this.shiftManagerToSave.acheval && !moment(this.dateService.setTimeNull(this.shiftManagerToSave.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      shiftAcheveToSave = this.clone(this.shiftManagerToSave);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
    }
    this.deleteShiftAchevalHidden(this.shiftManagerToSave.idPlanningManager, this.shiftManagerToSave.managerOuLeader.idEmployee);
    this.showPopAddShiftManager = false;
    const collection = this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee);
    const indexShiftToUpdateInPlanningManagerByEmployee = collection.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    collection[indexShiftToUpdateInPlanningManagerByEmployee] = this.shiftManagerToSave;
    const indexShiftToUpdateInListPlanningManager = this.listPlanningManager.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    this.updateListPlanningManager(indexShiftToUpdateInListPlanningManager, this.listPlanningManager);
    const indexShiftToUpdate = this.listPlanningManagerOrLeaderToUpdate.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    this.updateListPlanningManager(indexShiftToUpdate, this.listPlanningManagerOrLeaderToUpdate);
    this.showPopAddShiftManager = true;
    const collectionPlannigManager = this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee);
    if (shiftAcheveToSave && shiftAcheveToSave.idPlanningManager) {
      collectionPlannigManager.push({...shiftAcheveToSave});
      this.listPlanningManager.push({...shiftAcheveToSave});
    }
    this.listManagerOrLeaderActif.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.shiftManagerToSave.managerOuLeader.idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
    this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee));
    this.sortListShiftByShiftAcheval(this.listPlanningManager);
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
    this.shiftManagerToSave = null;
  }

  /**
   * calcule total of shit  to employee for week
   * calcule total of shit  to employee for day
   */
  private calculeTotalInWeekAndTotalInDayForPlanningManager(planningManager?: any): any {
    let totalInDay = 0;
    let cummuleTotal = 0;
    if (planningManager) {
      this.dateService.setCorrectTimeToDisplayForShift(planningManager);
      this.manangerHasAnomalieContraintSocial = planningManager.managerOuLeader;
      this.dateContraintSocial = this.dateService.formatToShortDate(planningManager.dateJournee, '/');
      const collection = this.planningByManagerOrLeader.get(planningManager.managerOuLeader.idEmployee);
      collection.forEach((shiftDisplay: any) => {
        if (planningManager.idPlanningManager !== shiftDisplay.idPlanningManager) {
          this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
          this.takeBreakswithTime([{...shiftDisplay}], this.listLoi, this.getEmployeeWithContrat(planningManager.managerOuLeader.idEmployee), this.shiftManagerToSave);
          if (planningManager.dateJournee === shiftDisplay.dateJournee) {
            totalInDay += this.totalRowTime;
          }
          cummuleTotal += this.totalRowTime;
        }
      });

      this.takeBreakswithTime([{...planningManager}], this.listLoi, this.getEmployeeWithContrat(planningManager.managerOuLeader.idEmployee), this.shiftManagerToSave);
      totalInDay += this.totalRowTime;
      cummuleTotal += this.totalRowTime;

      this.totalRowTime = cummuleTotal;
      return this.verifContrainte(cummuleTotal, totalInDay, planningManager);

    } else {
      this.calculeTempsPlanifieForAllEmploye();
    }
  }

  /**
   * meesage de modifier palinng
   */
  private displayUpdateMessage() {
    this.notificationService.showSuccessMessage('SHIFT_FIXE.UPDATED_SUCCESS', 'BIMPOSE.UPDATE_MESSAGE_HEADER');
  }

  /**
   * ajouter nouveau planning
   * @param: shiftFixe
   */
  private addNewPlanningManager(): void {
    this.setNewShiftToListPlanningManager();
  }

  /**
   * ajouter sift fixe dans la list de shift fixe et dans la map shift fixe par employee
   * @param :data
   */
  private setNewShiftToListPlanningManager(): void {
    this.showPopAddShiftManager = false;
    let shiftAcheveToSave = new PlanningManagerModel();

    this.shiftManagerToSave.idPlanningManager = this.makeString();
    this.listPlanningManager.forEach(shift => {

      if (shift.idPlanningManager === this.shiftManagerToSave.idPlanningManager) {
        this.setNewShiftToListPlanningManager();
      }

    });

    this.listPlanningManagerOrLeaderToUpdate.push({...this.shiftManagerToSave});
    if (this.shiftManagerToSave.acheval && !moment(this.dateService.setTimeNull(this.shiftManagerToSave.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      shiftAcheveToSave = this.clone(this.shiftManagerToSave);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);

      this.listPlanningManager.push({...shiftAcheveToSave});
    }
    const collection = this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee);
    if (!collection) {
      if (shiftAcheveToSave.idPlanningManager) {
        this.planningByManagerOrLeader.set(this.shiftManagerToSave.managerOuLeader.idEmployee, [shiftAcheveToSave]);
      }
      this.planningByManagerOrLeader.set(this.shiftManagerToSave.managerOuLeader.idEmployee, [this.shiftManagerToSave]);
    } else {
      collection.push({...this.shiftManagerToSave});
      if (shiftAcheveToSave.idPlanningManager) {
        collection.push({...shiftAcheveToSave});

      }
    }
    this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee));

    this.listPlanningManager.push({...this.shiftManagerToSave});
    this.sortListShiftByShiftAcheval(this.listPlanningManager);

    this.shiftManagerToSave.managerOuLeader.totalRowTime = this.totalRowTime;
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
    this.shiftManagerToSave = null;
    this.showPopAddShiftManager = true;
  }

  private checkIfShiftAchevalActif(dateJourneePlanning: Date, employee: EmployeeModel): boolean {
    if (!this.contrainteSocialeService.getContratByDay(employee, new Date(dateJourneePlanning)).contrats) {
      this.employeInactif = true;
      this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Ajout employee en cours : on affiche le formulaire contenant la selectbox
   * @param: event
   */
  public managerAdded(event) {
    const managerToAdd = this.listManagerOrLeaderActif.findIndex(emp => emp.idEmployee === event.idEmployee);
    this.listManagerWithPlanningManager[this.listManagerWithPlanningManager.length - 1] = this.listManagerOrLeaderActif[managerToAdd];
    this.planningByManagerOrLeader.set(this.listManagerOrLeaderActif[managerToAdd].idEmployee, []);
    this.fillAvailableManagerActif();
  }

  /**
   * manager  not has planning
   */
  private fillAvailableManagerActif() {
    let found = false;
    this.listManagerOrLeaderActif.forEach(item => {
      found = false;
      this.listManagerWithPlanningManager.forEach(usedItem => {

        if (usedItem.idEmployee === item.idEmployee) {
          found = true;
        }
      });
      if (!found) {
        this.listManagerWithPlanningManager.push(item);
        this.planningByManagerOrLeader.set(item.idEmployee, []);

      }
    });

  }

  /**
   * Cette methode utilisee lors de la recuperation de la liste des shift fixe elle permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
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

    if (!isProductif) {
      this.dateService.setCorrectTimeToDisplayForShift(item);
    }
  }

  /**
   * Ajouter ou modifier une nouvelle card de shift
   * @param: cardDetails
   */
  public addOrUpdateNewPlanningManagerFixeCard(planningManager: PlanningManagerModel): void {
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
        const collection = this.clone(this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee));
        this.takeBreakswithTime(collection, this.listLoi, this.getEmployeeWithContrat(this.shiftManagerToSave.managerOuLeader.idEmployee), this.shiftManagerToSave);
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
  }

  private displaySuccessAddMessage() {
    this.notificationService.showSuccessMessage('SHIFT_FIXE.ADD_SUCCESS', 'BIMPOSE.ADD_MESSAGE_HEADER');
  }


  /**
   * modifier la list de shift fixe
   * @param indexPlanningManagerUpdate
   * @param list
   */
  private updateListPlanningManager(indexPlanningManagerUpdate: number, list: any): void {
    indexPlanningManagerUpdate = list.findIndex(planning => planning.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    if (indexPlanningManagerUpdate !== -1) {
      list.splice(indexPlanningManagerUpdate, 1);
    }
    list.push({...this.shiftManagerToSave});
  }


  /**
   * permet de savegarder la ligne employee selectionnée pour la suppression
   * @param: event
   */
  public updateSelectedEmployeeRow(event) {
    this.selectedManagerOrLeader = event;
  }

  /**
   * afficher le message de confirmation de supression d'une ligne entière
   */
  public showConfirmDeleteRow(event: any) {
    if (this.selectedManagerOrLeader.idEmployee) {
      this.showConfimeDelete = true;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
        header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {

          if (this.selectedManagerOrLeader.idEmployee !== 0) {
            this.deleteAllPlanningManagerByIdEmployee();
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
  public setListPlanningManagerOrLeaderBeforeSaveAndVerification(): boolean {
    let autorizeDeleteShift = true;
    let autorizeDeleteShiftByManager = true;
    let autorizeDeleteManagerProductif = true;
    let autorizeAddPlanningManager = false;
    if (this.listIdShiftManagerOrLeaderToDelete.length === 0) {
      this.listIdShiftManagerOrLeaderToDelete.push('0');
      autorizeDeleteShift = false;
    }
    if (this.listShiftManagerByManagerToDelete.length === 0) {
      this.listShiftManagerByManagerToDelete.push('0');
      autorizeDeleteShiftByManager = false;
    }
    if (this.listIdPlanningManagerProductifsToDelete.length === 0) {
      this.listIdPlanningManagerProductifsToDelete.push('0');
      autorizeDeleteManagerProductif = false;
    }
    if (this.listPlanningManagerOrLeaderToUpdate.length > 0) {
      autorizeAddPlanningManager = true;
    }
    this.listShiftManagerByPeriodeToDelete.push('0');

    return autorizeDeleteShift || autorizeDeleteShiftByManager || autorizeDeleteManagerProductif || autorizeAddPlanningManager;
  }

  /**
   * delete AllPlanning Manager By IdEmployee
   */
  private deleteAllPlanningManagerByIdEmployee(): void {
    const indexEmployeeToDelete = this.listManagerWithPlanningManager.findIndex(emp => emp.idEmployee === this.selectedManagerOrLeader.idEmployee);
    this.listManagerWithPlanningManager.splice(indexEmployeeToDelete, 1);
    if (this.planningByManagerOrLeader.get(this.selectedManagerOrLeader.idEmployee)) {
      this.planningByManagerOrLeader.delete(this.selectedManagerOrLeader.idEmployee);
    }
    this.listContrainteMinTimeInWeek.forEach((contrainte: any, index: number) => {
      if (contrainte.employe && (contrainte.employe.idEmployee === this.selectedManagerOrLeader.idEmployee)) {
        this.listContrainteMinTimeInWeek.splice(index, 1);
      }
    });
    this.fillAvailableManagerActif();
    this.deleteListShiftForEmployeeSelected();

  }

  private deleteListShiftForEmployeeSelected(): void {
    this.listShiftManagerByManagerToDelete.push(this.selectedManagerOrLeader.uuid);
    if (this.listPlanningManagerOrLeaderToUpdate.length > 0) {
      for (let i = 0; i < this.listPlanningManagerOrLeaderToUpdate.length; i++) {
        if (this.listPlanningManagerOrLeaderToUpdate[i].managerOuLeader.idEmployee === this.selectedManagerOrLeader.idEmployee) {
          if (!isNaN(Number(this.listPlanningManagerOrLeaderToUpdate[i].idPlanningManager))) {
            // supprimer les shifts  qui se trouvent ds la bd avec un autre employee
            this.listIdShiftManagerOrLeaderToDelete.push(this.listPlanningManagerOrLeaderToUpdate[i].uuid);
          }
          // supprimer les  shifts qui se trouvent da list que on va enregistrer ds la bd
          this.listPlanningManagerOrLeaderToUpdate.splice(i, 1);
          i--;
        }
      }
    }

    if (this.listPlanningManager.length > 0) {
      for (let i = 0; i < this.listPlanningManager.length; i++) {
        if (this.listPlanningManager[i].managerOuLeader.idEmployee === this.selectedManagerOrLeader.idEmployee) {
          this.listPlanningManager.splice(i, 1);
          i--;
        }
      }
    }
    this.calculeTempsPlanifieAfterDeleteCard(this.selectedManagerOrLeader.idEmployee);
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieAfterDeleteCard(idEmployee: any): Promise<void> {

    if (idEmployee) {

      for (const employeDisplay of this.listManagerOrLeaderActif) {
        if (employeDisplay.idEmployee === idEmployee) {
          if (this.planningByManagerOrLeader.get(idEmployee).length === 0) {
            employeDisplay.totalRowTime = 0;
            return;
          } else {
            await this.getlawByCodeName(employeDisplay);
            employeDisplay.totalRowTime = this.totalRowTime;
            return;
          }

        }
      }
    }
  }

  private displaySuccessDeleteMessage(): void {
    this.notificationService.showInfoMessage('BIMPOSE.DELETE_SUCCESS', 'BIMPOSE.DELETE_INFORMATION');
  }

  /**
   * message de confirmation de suppression d'une card dans l'onglet 'Shift'
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
    const deletedShift = this.listPlanningManager.find((element: any) => element.idPlanningManager === idShiftToDelete);
    if (deletedShift) {
      const employeeIndex = this.listManagerOrLeaderActif.findIndex((manager: any) => manager.idEmployee === deletedShift.managerOuLeader.idEmployee);
      if ((employeeIndex !== -1) && this.listManagerOrLeaderActif[employeeIndex].contrats.length === 1) {
        employeHaslaw = this.listManagerOrLeaderActif[employeeIndex];
      } else if ((employeeIndex !== -1) && this.listManagerOrLeaderActif[employeeIndex].contrats.length > 1) {
        const employeeDisplay = JSON.parse(JSON.stringify(this.listManagerOrLeaderActif[employeeIndex]));
        employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeDisplay, new Date(deletedShift.dateJournee));
      }
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
      ignoreFrom: '.position-card-blocked',
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
      ignoreFrom: '.position-card-blocked',
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
          this.showConfirmDeletePlanningManagerCard(event, 'dragAndDrop'); // suppression du card du shift : onglet 'shift fixe'
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
      ignoreFrom: '.position-card-blocked',
      autoScroll: {
        container: document.getElementById('planningManagerContainer'),
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
   * recuperer la semaine selectionne de palnning homme
   */
  private setWeekSelected(): void {
    this.weekSelected = +this.sessionService.getCurrentWeek();
    const yearSelected = +this.sessionService.getCurrentYear();
    this.getWeekPairOrOdd(this.weekSelected);
    this.getWeeksByMonthByRestaurant(this.dateService.createDateFromStringPattern(this.sessionService.getLastSelectedDate(), 'YYYY-MM-DD'), true);

  }

  /**
   * Permet de gérer le déplacements des cards des postes
   * @param: event
   */
  private dropShiftCard(event: any): void {
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

    const oldEmp = parseInt(draggableElement.getAttribute('data-empIndex'), 10); // poste initial de la card
    const newEmp = parseInt(dropzoneElement.parentElement.getAttribute('data-empIndex'), 10); // nouveau poste du card
    const cardDropInfos = {
      idPlanningManager: idPlanningManager,
      oldDayZone: oldDayZone,
      newDayZone: newDayZone,
      oldEmp: oldEmp,
      newEmp: newEmp
    };
    this.shiftManagerToSave = cardDropInfos;
    let managerNew = {} as EmployeeModel;
    this.listManagerWithPlanningManager.forEach(employeeDisplay => {
      if (employeeDisplay.idEmployee === cardDropInfos.newEmp) {
        managerNew = employeeDisplay;
        const planningManagerNew = this.getPlanningManagerBeforeDragAndDrop(this.shiftManagerToSave, managerNew);
        this.getStartTimeAndEndTimeFromDecoupageHoraire(this.shiftManagerToSave.newDayZone);

        if (this.updateButtonControl() && this.disableChangePositionOfManagerOrLeader(this.shiftManagerToSave.oldEmp, this.shiftManagerToSave.newEmp) && this.canAddPlanningManager(planningManagerNew, 'dragAndDrop')) {
          this.getContratByManagerActif(employeeDisplay, this.setJourSemaine(newDayZone.toUpperCase()), 'dragDrop');
        } else {
          // reset the card to the initial place
          this.resetCradInitialPlace(planningManagerNew);


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
   * confirme la changement de shift fixe apres drag and drop
   * @param :employee
   */
  private checkShiftChangePosition(managerOrLeader) {
    let shiftToSave = null;
    let indexPlanningOrLeader = this.listPlanningManager.findIndex(shift => shift.idPlanningManager === this.shiftManagerToSave.idPlanningManager);
    if (indexPlanningOrLeader !== -1) {
      shiftToSave = this.clone(this.listPlanningManager[indexPlanningOrLeader]);
    }

    const planningManagerNew = this.getPlanningManagerBeforeDragAndDrop(this.shiftManagerToSave, managerOrLeader);
    if (this.shiftManagerToSave.oldDayZone !== this.shiftManagerToSave.newDayZone || this.shiftManagerToSave.oldEmp !== this.shiftManagerToSave.newEmp) {
      this.popupVerificationContrainteVisibility = !this.calculeTotalInWeekAndTotalInDayForPlanningManager(planningManagerNew);
    }

    // drop only if day is different
    if ((this.shiftManagerToSave.oldDayZone !== this.shiftManagerToSave.newDayZone || this.shiftManagerToSave.oldEmp !== this.shiftManagerToSave.newEmp) && !this.popupVerificationContrainteVisibility) {
      // changer les détails du card suivant le nouveau emplacement

      // exécuter le déplacement du card dans l'interface
      if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
        this.copiePlanningManagerOrLeader(this.shiftManagerToSave);
      } else {
        this.moveShiftCard(this.shiftManagerToSave);
      }

    } else {
      // reset the card to the initial place
      this.resetCradInitialPlace(shiftToSave);


    }
  }

  /**
   * Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe
   *  empecher le drag&drop vers l’employé
   * @param: idOldManagerOrLeader
   * @param :idNewManagerOrLeader
   */
  public disableChangePositionOfManagerOrLeader(idOldManagerOrLeader, idNewManagerOrLeader): boolean {
    let canChangePosition = true;
    this.listManagerOrleaderInactif.forEach(managerOrLeaderDisplay => {
      if ((managerOrLeaderDisplay.idEmployee === idOldManagerOrLeader && idNewManagerOrLeader === idOldManagerOrLeader) || idNewManagerOrLeader === managerOrLeaderDisplay.idEmployee) {
        canChangePosition = false;
      }

    });
    return canChangePosition;
  }

  /**
   * déplacer le card entre les deux zone de jours différentes
   * @param: movedCardInfos
   */
  public moveShiftCard(movedCardInfos: any): void {
    this.deleteShiftAchevalHidden(movedCardInfos.idPlanningManager, movedCardInfos.oldEmp);
    const indexShiftToMove = this.listPlanningManager.findIndex(shift => shift.idPlanningManager === movedCardInfos.idPlanningManager);
    // update employee
    const indexNewManager = this.listManagerOrLeaderActif.findIndex(emp => emp.idEmployee === movedCardInfos.newEmp);
    if (indexNewManager !== -1) {
      this.listPlanningManager[indexShiftToMove].managerOuLeader = this.listManagerOrLeaderActif[indexNewManager];
    }
    // update day
    this.listPlanningManager[indexShiftToMove].dateJournee = this.setJourSemaine(movedCardInfos.newDayZone.toUpperCase());
    // mettre a jour la map
    this.listPlanningManager[indexShiftToMove] = this.updateShiftAcheval(this.listPlanningManager[indexShiftToMove]);
    if (this.listPlanningManager[indexShiftToMove].acheval) {
      if (!moment(this.dateService.setTimeNull(this.listPlanningManager[indexShiftToMove].dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        this.listPlanningManager[indexShiftToMove].achevalWeek = false;
      } else {
        this.listPlanningManager[indexShiftToMove].achevalWeek = true;
      }
    }
    if (!this.listPlanningManager[indexShiftToMove].acheval && this.getModeDispaly(this.listPlanningManager[indexShiftToMove]) !== 0 && this.checkIfShiftAcheval(this.listPlanningManager[indexShiftToMove])) {
      this.listPlanningManager[indexShiftToMove].acheval = true;
      this.listPlanningManager[indexShiftToMove].modifiable = true;
    }
    this.planningByManagerOrLeader.get(movedCardInfos.oldEmp).splice(this.planningByManagerOrLeader.get(movedCardInfos.oldEmp).findIndex(shift => shift.idPlanningManager === movedCardInfos.idPlanningManager), 1);
    this.planningByManagerOrLeader.get(movedCardInfos.newEmp).push(this.listPlanningManager[indexShiftToMove]);
    if (this.listPlanningManager[indexShiftToMove].acheval && !moment(this.dateService.setTimeNull(this.listPlanningManager[indexShiftToMove].dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      let shiftAcheveToSave = this.clone(this.listPlanningManager[indexShiftToMove]);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
      this.planningByManagerOrLeader.get(movedCardInfos.newEmp).push(shiftAcheveToSave);
      this.listPlanningManager.push(shiftAcheveToSave);
    }

    const indexShiftFixeToUpdate = this.listPlanningManagerOrLeaderToUpdate.findIndex(shift => shift.idPlanningManager === this.listPlanningManager[indexShiftToMove].idPlanningManager);
    if (indexShiftFixeToUpdate !== -1) {
      this.listPlanningManagerOrLeaderToUpdate[indexShiftFixeToUpdate] = {...this.listPlanningManager[indexShiftToMove]};
    } else {
      this.listPlanningManagerOrLeaderToUpdate.push({...this.listPlanningManager[indexShiftToMove]});
    }
    this.sortListShiftByShiftAcheval(this.listPlanningManager);
    if (movedCardInfos.newEmp !== movedCardInfos.oldEmp) {
      this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(movedCardInfos.newEmp));
      this.calculeTempsPlanifieAfterCopieOrMoveShift(movedCardInfos);
    } else {
      this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(movedCardInfos.oldEmp));
      this.takeBreakswithTime(this.clone(this.planningByManagerOrLeader.get(movedCardInfos.newEmp)), this.listLoi, this.getEmployeeWithContrat(movedCardInfos.newEmp));
      this.afficherTempsPlanifier(movedCardInfos.newEmp);
    }
    this.listContrainteMinTimeInWeek.forEach((contrainte: any, index: number) => {
      if (contrainte.employe && (contrainte.employe.idEmployee !== movedCardInfos.newEmp) && this.planningByManagerOrLeader.get(movedCardInfos.oldEmp).length === 0) {
        this.listContrainteMinTimeInWeek.splice(index, 1);
      }
    });
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
  }

  /**
   * Si l’utilisateur maintient la touche Ctrl appuyer tous le long du drag&drop (appuyer à la sélection et au relâchement du shift),
   *  il faut permettre de copier un shift lors d’un drag&drop.
   *  @param :copieCardInfos
   */

  private copiePlanningManagerOrLeader(copieCardInfos: any): void {
    let planningManagerOrLeaderCopy: any;
    let planningManagerOrLeader = {} as PlanningManagerModel;
    const indexPlanningOrLeaderToMove = this.listPlanningManager.findIndex(shift => shift.idPlanningManager === copieCardInfos.idPlanningManager && !shift.shiftAchevalHidden);
    const indexNewManager = this.listManagerOrLeaderActif.findIndex(emp => emp.idEmployee === copieCardInfos.newEmp);
    this.planningByManagerOrLeader.get(copieCardInfos.oldEmp).splice(this.planningByManagerOrLeader.get(copieCardInfos.oldEmp).findIndex(shift => shift.idPlanningManager === copieCardInfos.idPlanningManager && !shift.shiftAchevalHidden), 1);
    planningManagerOrLeaderCopy = {...this.listPlanningManager[indexPlanningOrLeaderToMove]};
    planningManagerOrLeaderCopy.idPlanningManager = this.makeString();
    planningManagerOrLeaderCopy.managerOuLeader = this.listManagerOrLeaderActif[indexNewManager];
    planningManagerOrLeaderCopy.managerOuLeadedraggableElementShiftFixer = this.listManagerOrLeaderActif[indexNewManager];
    planningManagerOrLeaderCopy.dateJournee = this.setJourSemaine(copieCardInfos.newDayZone.toUpperCase());
    planningManagerOrLeader = {...this.listPlanningManager[indexPlanningOrLeaderToMove]};
    planningManagerOrLeader = this.updateShiftAcheval(planningManagerOrLeader, true);
    planningManagerOrLeaderCopy = this.updateShiftAcheval(planningManagerOrLeaderCopy);
    if (planningManagerOrLeaderCopy.acheval) {
      if (!moment(this.dateService.setTimeNull(planningManagerOrLeaderCopy.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        planningManagerOrLeaderCopy.achevalWeek = false;
      } else {
        planningManagerOrLeaderCopy.achevalWeek = true;
      }
    }
    if (planningManagerOrLeaderCopy.acheval || (!planningManagerOrLeaderCopy.acheval && this.getModeDispaly(planningManagerOrLeaderCopy) !== 0 && this.checkIfShiftAcheval(planningManagerOrLeaderCopy))) {
      planningManagerOrLeaderCopy.modifiable = true;
      planningManagerOrLeaderCopy.acheval = true;
    }
    this.listPlanningManager.push(planningManagerOrLeaderCopy);
    this.planningByManagerOrLeader.get(copieCardInfos.newEmp).push(planningManagerOrLeaderCopy);
    this.planningByManagerOrLeader.get(copieCardInfos.oldEmp).push(planningManagerOrLeader);
    if (planningManagerOrLeaderCopy.acheval && !moment(this.dateService.setTimeNull(planningManagerOrLeaderCopy.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
      let shiftAcheveToSave = this.clone(planningManagerOrLeaderCopy);
      shiftAcheveToSave = this.shiftService.addShiftAcheval(shiftAcheveToSave, true);
      this.planningByManagerOrLeader.get(copieCardInfos.newEmp).push(shiftAcheveToSave);
      this.listPlanningManager.push(shiftAcheveToSave);
    }
    this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(copieCardInfos.newEmp));
    this.sortListShiftByShiftAcheval(this.listPlanningManager);
    this.listPlanningManagerOrLeaderToUpdate.push({...planningManagerOrLeaderCopy});
    if (copieCardInfos.newEmp !== copieCardInfos.oldEmp) {
      this.calculeTempsPlanifieAfterCopieOrMoveShift(copieCardInfos);
    } else {
      this.takeBreakswithTime(this.clone(this.planningByManagerOrLeader.get(copieCardInfos.newEmp)), this.listLoi, this.getEmployeeWithContrat(copieCardInfos.newEmp));
      this.afficherTempsPlanifier(copieCardInfos.newEmp);
    }
    this.eventCtrl = false;
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);

  }

  public updateShiftAcheval(planning: PlanningManagerModel, filter?): PlanningManagerModel {
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

  /**
   * aficher temps planifier de l"employe
   */
  private afficherTempsPlanifier(idEmployee: number): void {
    this.listManagerOrLeaderActif.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
  }

  /**
   * calculer temps planifiés pour les employés
   * cardInf
   */
  private async calculeTempsPlanifieAfterCopieOrMoveShift(cardInf: any): Promise<void> {
    for (const employeDisplay of this.listManagerOrLeaderActif) {
      if (employeDisplay.idEmployee === cardInf.newEmp) {
        this.takeBreakswithTime(this.clone(this.planningByManagerOrLeader.get(employeDisplay.idEmployee)), this.listLoi, employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
      } else if (employeDisplay.idEmployee === cardInf.oldEmp) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
      }
    }
  }

  /**
   * delet sift  de la list shift fixe et de map et de shifli list que on va enregistrer
   * @param: event
   */
  private deleteShiftPlanningCard(event: any): void {
    this.idManagerOrLeader = 0;
    this.index = null;
    this.idShiftToDelete = null;
    this.shiftToDelete = null;
    if (!isNaN(Number(event))) {
      event = +event;
    }

    this.listPlanningManager.forEach((shift, index) => {
      if (shift.idPlanningManager === event && (!shift.acheval || (shift.acheval && shift.modifiable && !shift.shiftAchevalHidden))) {
        this.index = index;
        this.idShiftToDelete = event;
        this.shiftToDelete = shift;
        this.idManagerOrLeader = shift.managerOuLeader.idEmployee;
        const collection = this.planningByManagerOrLeader.get(this.listPlanningManager[index].managerOuLeader.idEmployee);
        const filteredShiftsByDayAndEmployee = this.getListShiftByDayToDelete(this.clone(collection), shift);
        if (filteredShiftsByDayAndEmployee.length > 2) {
          this.manangerHasAnomalieContraintSocial = shift.managerOuLeader;
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
    const employeToDeleteShift = this.clone(this.listPlanningManager[this.index].managerOuLeader);

    this.deleteShiftAchevalHidden(this.idShiftToDelete, employeToDeleteShift.idEmployee);
    let indexShiftToDeleteInListUpdatePlanningManager;
    this.planningByManagerOrLeader.get(employeToDeleteShift.idEmployee).splice(this.planningByManagerOrLeader.get(employeToDeleteShift.idEmployee).findIndex((shift: PlanningManagerModel) => shift.idPlanningManager === this.idShiftToDelete), 1);

    const indexPlanningManagerDeleted = this.listPlanningManager.findIndex((item: PlanningManagerModel) => item.idPlanningManager === this.idShiftToDelete && ((item.acheval && item.modifiable && !item.shiftAchevalHidden) || !item.acheval));
    if (indexPlanningManagerDeleted !== -1) {
      this.listPlanningManager.splice(indexPlanningManagerDeleted, 1);
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
    this.sortListShiftByShiftAcheval(this.planningByManagerOrLeader.get(this.idManagerOrLeader));
    this.sortListShiftByShiftAcheval(this.listPlanningManager);

    this.calculeTempsPlanifieAfterDeleteCard(this.idManagerOrLeader);
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);

  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentAfterChangeDate(): void {
    this.changeDate = false;
    this.hiddenSave = false;

    if (this.setListPlanningManagerOrLeaderBeforeSaveAndVerification()) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
        header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure);
          const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
          const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
          if (this.listContrainteMinTimeInWeek.length || listContraintCoupur.length || listContraintDureeMinShift.length || listNbrCoupureInWeek.length) {
            this.saveGenaral = true;
            this.listContrainte = this.listContrainteMinTimeInWeek.concat(listContraintCoupur, listContraintDureeMinShift,
              listNbrCoupureInWeek);
            this.popupVerificationContrainteVisibility = true;
            this.changeDate = true;
          } else {
            this.saveFinalListPlanningMnagerInBD('changeDate');
          }
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
   * save after verification
   * */
  public saveFinalListPlanningMnagerInBD(start?): void {
    let isMobileBroadcasted = false;
    if (this.listPlanningManager.length !== 0) {
      isMobileBroadcasted = this.listPlanningManager[0].mobileBroadcasted;
    }
    this.listPlanningManagerOrLeaderToUpdate.forEach(shift => {
      if (isNaN(Number(shift.idPlanningManager))) {
        shift.idPlanningManager = 0;
        shift.mobileBroadcasted = isMobileBroadcasted;
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
    this.planningManagerService.updateListPlanningManager(this.listPlanningManagerOrLeaderToUpdate, this.listIdShiftManagerOrLeaderToDelete, this.listShiftManagerByManagerToDelete, this.listShiftManagerByPeriodeToDelete, this.listIdPlanningManagerProductifsToDelete, this.hasPlanningLeader, this.dateDebut).subscribe(
      (data: PlanningManagerModel[]) => {

        this.notificationService.stopLoader();
        this.saveGenaral = false;
        this.listContrainteMinTimeInWeek = [];
        this.popupVerificationContrainteVisibility = false;
        this.setListPlanningManagerAfterSave(data);
        if (this.navigateTo) {
          this.navigateAway.next(true);
          this.navigateTo = false;
        }
        if (start || this.changeDate) {
          this.updateOrDownDate();
        }
        this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);

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
   * get shift fixe before drag and drop for veification contrainte social
   * @param: cardDropInfos
   */
  private getPlanningManagerBeforeDragAndDrop(cardDropInfos: any, managerOuLeader: any): PlanningManagerModel {
    let planningManager = {} as PlanningManagerModel;
    this.listPlanningManager.forEach(shift => {
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
        planningManager.managerOuLeader = managerOuLeader;
        planningManager.dateJournee = this.setJourSemaine(cardDropInfos.newDayZone.toUpperCase());
      }
    });

    return planningManager;
  }

  /**
   * get id of planning manager productif
   * @param :idPlanningManagerProcutif
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
        this.listPlanningManager.unshift(item);

      });
    }
    for (let i = 0; i < this.listPlanningManager.length; i++) {

      if (isNaN(Number(this.listPlanningManager[i].idPlanningManager))) {
        this.listPlanningManager.splice(i, 1);
        i--;
      }
    }
    this.listPlanningManager = this.listPlanningManager.filter((shift: PlanningManagerModel) => !shift.acheval || (shift.acheval && !shift.shiftAchevalHidden));
    const shiftSet = new Set();
    // removing-duplicates-in-an-array
    this.listPlanningManager = this.listPlanningManager.filter(shift => {
      const duplicate = shiftSet.has(shift.idPlanningManager);
      shiftSet.add(shift.idPlanningManager);
      return !duplicate;
    });

    this.listManagerWithPlanningManager = [];
    this.planningByManagerOrLeader = new Map();
    this.listPlanningManager.forEach((shiftDisplay: PlanningManagerModel) => {
      this.setCorrectTimeToDisplay(shiftDisplay);
      this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
      if (this.checkIfShiftAcheval(shiftDisplay) && this.getModeDispaly(shiftDisplay) !== 0) {
        shiftDisplay.acheval = true;
        shiftDisplay.modifiable = true;
      }

      shiftDisplay = this.setAchevalWeekToShift(shiftDisplay);
      if (shiftDisplay.acheval && shiftDisplay.modifiable && !moment(this.dateService.setTimeNull(shiftDisplay.dateJournee)).isSame(this.dateService.setTimeNull(this.dateFin))) {
        this.listPlanningManager.push(this.shiftService.addShiftAcheval(this.clone(shiftDisplay), true));
      }
    });
    this.sortListShiftByShiftAcheval(this.listPlanningManager);
    this.planningByManagerOrLeader = this.groupPlanningByManager(this.listPlanningManager, shiftDisplay => shiftDisplay.managerOuLeader.idEmployee);
    this.fillAvailableManagerActif();
    this.calculeTotalInWeekAndTotalInDayForPlanningManager();

    this.displayUpdateMessage();
    this.listPlanningManagerOrLeaderToUpdate = [];
    this.listIdShiftManagerOrLeaderToDelete = [];
    this.listShiftManagerByManagerToDelete = [];
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
    const canSave = !this.setListPlanningManagerOrLeaderBeforeSaveAndVerification();
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

        const listNbrCoupureInWeek = this.contrainteSocialeCoupureService.validNbrCoupureInWeek(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum, this.minBeforeCoupure);
        const listContraintCoupur = this.contrainteSocialeCoupureService.verificationNbrHourWithoutCoupure(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
        const listContraintDureeMinShift = this.helperService.verifDureeMinDesShifts(this.days, this.listManagerOrLeaderActif, this.planningByManagerOrLeader, this.messageVerification, this.dateDebut, this.loiGroupeTravail, this.loiRestaurant, this.JoursSemainEnum);
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
   * recuperer le list de planning manager du semaine precedente
   */
  public downWeekDate(): void {
    this.downDate = true;
    this.saveContentAfterChangeDate();
  }

  /**
   *recuperer le list de planning manager du semaine suivante
   */
  public upWeekDate(): void {
    this.upDate = true;
    this.saveContentAfterChangeDate();
  }

  private setActionOnClick(): void {
    document.querySelectorAll('.ui-datepicker-trigger').forEach((e, index) => {
      e.addEventListener('click', event => {
        this.getWeeksByMonthByRestaurant(this.dateDebut, false);
      });
    });

  }

  /**
   * réinitialiser les listes de planning manger,liste manager productif
   */
  private resetPlanningManager(): void {
    this.listPlanningManagerOrLeaderToUpdate = [];
    this.listIdShiftManagerOrLeaderToDelete = [];
    this.listShiftManagerByManagerToDelete = [];
    this.listIdPlanningManagerProductifsToDelete = [];
    this.updateOrDownDate();
    this.planningManagerService.sortEmployeeByName(this.listManagerWithPlanningManager);
  }

  /**
   * récupérer la liste de planning manager de la semaine precedente ou suivante
   */
  private updateOrDownDate(): void {
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
    this.findAllEmployeActifWithGroupTravailsPlgManager();
    this.changeDate = false;
    this.getWeeksByMonthByRestaurant(this.dateDebut, false);
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

  private getModeDispaly(planning: PlanningManagerModel): number {
    return this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, planning.dateJournee, this.dateService).updatedModeAffichage;

  }

  /**
   * Verification  de l'horraire du planning shift
   * on ne peut pas avoir des horaires confondues
   */
  public canAddPlanningManager(planning: PlanningManagerModel, filter?: string): boolean {
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
    if (this.planningByManagerOrLeader.get(planning.managerOuLeader.idEmployee).length === 0) {
      return true;
    } else {

      let canAdd = true;
      let collection = this.clone(this.planningByManagerOrLeader.get(planning.managerOuLeader.idEmployee));
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
      collection.forEach((shiftDisplay: PlanningManagerModel) => {
        if (planning.idPlanningManager !== shiftDisplay.idPlanningManager) {

          planning.dateJournee = this.dateService.setTimeNull(planning.dateJournee);
          shiftDisplay.dateJournee = this.dateService.setTimeNull(shiftDisplay.dateJournee);

          if (moment(planning.dateJournee).isSame(shiftDisplay.dateJournee) || shiftDisplay.sameDateToShiftAcheval) {
            let lastValue = this.clone(shiftDisplay);
            this.dateService.setCorrectTimeToDisplayForShift(lastValue);

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
   **  verification Contrainte Social
   * @param :commuleTotal
   * @param :totalInDay
   * @param :tempsTravail
   * @param :shiftFixe
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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    let listShiftInWeek = this.clone(collection);
    listShiftInWeek = listShiftInWeek.filter((shift: PlanningManagerModel) => !shift.acheval || !shift.shiftAchevalHidden);

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
    let verificationContrainte = new VerificationContrainteModel();
    this.listContrainte = [];
    this.listContrainteSuppression = [];

    let employeHasContrat = new EmployeeModel();
    const dates = JSON.parse(JSON.stringify(this.days));

    // verication hebdo contrat
    this.listManagerOrLeaderActif.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.manangerHasAnomalieContraintSocial.idEmployee) {
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
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerConge(this.getAbsenceCongeForManager(), shift.dateJournee);
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
      listShiftInDayCurrent = listShiftInDayCurrent.concat(this.shiftService.addShiftAchevalInCurrentList(shift, this.clone(this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee))));
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
      if (contrainte.employe && (contrainte.employe.idEmployee === this.manangerHasAnomalieContraintSocial.idEmployee)) {
        this.listContrainteMinTimeInWeek.splice(index, 1);
      }
    });
    if (verificationContrainte) {
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      verificationContrainte.employe = this.manangerHasAnomalieContraintSocial;
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
    if (this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee) && this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee).length) {
      employeCs.listShiftForThreeWeek = [];
      this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee).forEach((item: any) => {
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
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // Nb maxi de jours travaillés consécutifs dans 2 sem
    // Nb des jours travaillés dans les deux premieres semaines 0-1
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(1, shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Nb des jours travaillés dans les deux deuxiemes semaines 1-2
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(3, shift), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
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
    if (!shift.idPlanningManager) {
      nombreShiftParJour++;
    }

    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    collection.forEach((item, index) => {
      // en cas de drag and drop pour ajouter un shift a un list de planning manager par eemployee si old emp est differ a le nouveau emplpoyee
      if (shift.idPlanningManager === item.idPlanningManager) {
        item = shift;
      }
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
    });

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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    collection.unshift(shift);
    collection.forEach((item: any) => {
      if (!item.acheval || (item.acheval && item.modifiable)) {
        // en cas de drag and drop pour ajouter un shift a un list de shift  par manager si old emp est differ a le nouveau emplpoyee
        if (shift.idPlanningManager === item.idPlanningManager) {
          item = shift;
        }
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
    });
    collection.splice(collection[0], 1);


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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    collection.unshift(shift);

    if (collection) {
      collection.forEach((item: any) => {
        if (!item.acheval || (item.acheval && item.modifiable)) {

          // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
          if (shift.idPlanningManager === item.idPlanningManager) {
            item = shift;
          }
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
      });
    }
    collection.splice(collection[0], 1);
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
   * @param :shift
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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    collection.unshift(shift);

    if (collection) {
      collection.forEach((item: any) => {
        if (!item.acheval || (item.acheval && item.modifiable)) {

          // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
          if (shift.idPlanningManager === item.idPlanningManager) {
            item = shift;
          }
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
      });

      collection.splice(collection[0], 1);
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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach(item => {
        if (item.idPlanningManager !== shift.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
          if (moment(item.dateJournee).isSame(lastDayDate)) {
            lastShiftFixeValues.push(item);
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
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach(item => {
        if (item.idPlanningManager !== shift.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
          item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
          if (moment(item.dateJournee).isSame(nextDayDate)) {
            nextShiftFixeValues.push(item);
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
   * recupeere le shift  pour un employee dans un jour definie
   * @param :shiftFixe
   */
  private getListShiftByJour(shift) {
    const listShiftInDay: PlanningManagerModel[] = [];
    listShiftInDay.push(shift);
    const collection = this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach(item => {
        item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
        shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
        this.dateService.setCorrectTimeToDisplayForShift(shift);

        if (moment(item.dateJournee).isSame(shift.dateJournee)) {
          this.dateService.setCorrectTimeToDisplayForShift(item);
          if (shift.idPlanningManager !== item.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
            listShiftInDay.push(item);
          }
        }
      });
    }
    return listShiftInDay;
  }

  private getListShiftByDayToDelete(listShiftByEmployee: any, shift: PlanningManagerModel) {
    const listShiftInDay: PlanningManagerModel[] = [];
    if (listShiftByEmployee) {
      listShiftByEmployee.forEach(item => {
        item.dateJournee = this.dateService.setTimeNull(item.dateJournee);
        shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
        if (moment(item.dateJournee).isSame(shift.dateJournee)) {
          if (shift.idPlanningManager !== item.idPlanningManager && (!item.acheval || (item.acheval && item.modifiable))) {
            listShiftInDay.push(item);

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
    let resultingNumber = 0;
    if (this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee) && this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee).length) {
      const accumulateConsecutiveWorkDays: number[] = [];
      let incrementer = 0;
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
      this.planningThreeWeeksByManager.get(this.manangerHasAnomalieContraintSocial.idEmployee).forEach((item: any) => {
        collection.push(item);
      });
      this.planningByManagerOrLeader.get(this.manangerHasAnomalieContraintSocial.idEmployee).forEach((item: any) => {
        if (!item.acheval || (item.acheval && item.modifiable)) {
          if (shift.idPlanningManager === item.idPlanningManager) {
            collection.push(shift);
          } else {
            collection.push(item);
          }
        }
      });
      if (!shift.idPlanningManager) {
        collection.unshift(shift);
      } else {
        const exists = !!collection.find((shiftDisplay: PlanningManagerModel) => shiftDisplay.idPlanningManager === shift.idPlanningManager);
        if (!exists) {
          collection.push({...shift});
        }
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
      this.listPlanningManagerForThreeWeeks = data;
      this.listPlanningManagerForThreeWeeks.forEach(item => {
        this.setCorrectTimeToDisplay(item);
      });
      this.planningThreeWeeksByManager = this.groupPlanningTreeWeekByManager(this.listPlanningManagerForThreeWeeks, plg => plg.managerOuLeader.idEmployee);
    }, (err: any) => {
      console.log(err);
    });
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
  public closePopup($event: any): void {
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
   * recupere employee avec leur contrat
   * @param idOfManagerOrLeader
   */
  private getEmployeeWithContrat(idOfManagerOrLeader: number): EmployeeModel {
    let manager;
    this.listManagerOrLeaderActif.forEach((managerLeader: EmployeeModel) => {
      if (managerLeader.idEmployee === idOfManagerOrLeader) {
        manager = managerLeader;
      }
    });
    return manager;
  }

  /**
   * Enregistrer shift  si aucune contrainte bloquante
   */
  public save() {
    if (!this.getBlockedConstraint()) {
      if (!this.saveGenaral) {
        if (this.shiftManagerToSave.managerOuLeader) {
          const collection = this.clone(this.planningByManagerOrLeader.get(this.shiftManagerToSave.managerOuLeader.idEmployee));
          this.takeBreakswithTime(collection, this.listLoi, this.getEmployeeWithContrat(this.shiftManagerToSave.managerOuLeader.idEmployee), this.shiftManagerToSave);
          if (this.shiftManagerToSave.idPlanningManager) {
            this.updatePlanningManager();
          } else {
            this.addNewPlanningManager();
          }
        } else {
          if (this.eventCtrl) {

            this.copiePlanningManagerOrLeader(this.shiftManagerToSave);
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
      weekHeader: '',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }

  /**
   * deselectionner le ligne
   */
  public unselectPlanningManagerOrLeader() {
    if (!this.showConfimeDelete) {
      // toggle selected rows
      document.querySelectorAll('table.planning tr').forEach(element => {
        element.classList.remove('row-selected');
      });
      this.selectedManagerOrLeader = {} as EmployeeModel;
    }
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
   * recupere les congés de manager Ou Leader
   */
  public getAbsenceCongeForManager(): AbsenceCongeModel[] {
    let managerOuLeaderHasConge = [];
    this.listManagerWithPlanningManager.forEach(managerOuLeaderDisplay => {
      if (this.manangerHasAnomalieContraintSocial.idEmployee === managerOuLeaderDisplay.idEmployee) {
        managerOuLeaderHasConge = managerOuLeaderDisplay.absenceConges;
      }
    });
    return managerOuLeaderHasConge;
  }

  /**
   * fermer le popup de planning manager
   */
  public resetPopupOfPlanningManager(): void {
    this.eventCtrl = false;
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieForAllEmploye(): Promise<void> {
    for (const employeDisplay of this.listManagerOrLeaderActif) {
      if (employeDisplay.contrats) {
        if (this.hasPlanningLeader === 1 && employeDisplay.contrats[0].groupeTravail.plgLeader) {
          await this.getlawByCodeName(employeDisplay);
          employeDisplay.totalRowTime = this.totalRowTime;
        } else if (employeDisplay.contrats[0].groupeTravail.plgMgr) {
          await this.getlawByCodeName(employeDisplay);
          employeDisplay.totalRowTime = this.totalRowTime;
        }
      }
    }
  }

  /**
   * Prendre en compte les pauses dans les compteur de temps
   * calcul des temps planifiés
   *   soustraire au temps planifié la valeur du temps minimum d’un break
   * @param :listPlanningManagerOrLeader
   * @param :listLoi
   * @param :tempsTravailPartiel
   * @param :mineur
   * @param :planningManager
   */
  private takeBreakswithTime(listPlanningManagerOrLeader: any, listLoi: any, employee: EmployeeModel, planningManager?: PlanningManagerModel): void {
    let totalInDay = 0;
    let totalInWeek = 0;
    let nbrShiftInDay = 0;
    let pause = 0;
    let shiftUpdate = {} as PlanningManagerModel;
    listPlanningManagerOrLeader = listPlanningManagerOrLeader.filter((shift: PlanningManagerModel) => !shift.acheval || !shift.shiftAchevalHidden);

    if (planningManager) {
      if (!planningManager.idPlanningManager) {
        listPlanningManagerOrLeader.push(planningManager);
      } else {
        listPlanningManagerOrLeader.forEach((shiftDisplay: PlanningManagerModel, index: number) => {
          if (planningManager.idPlanningManager && planningManager.idPlanningManager === shiftDisplay.idPlanningManager) {
            shiftUpdate = {...shiftDisplay};
            shiftDisplay = planningManager;
            listPlanningManagerOrLeader[index] = planningManager;
          }
        });
      }
    }
    this.days.forEach((day: any, indexDay: number) => {
      const listShiftByDay = this.grouperShiftParJour(day.val, listPlanningManagerOrLeader);
      this.sortListShift(listShiftByDay);
      nbrShiftInDay = 0;
      pause = 0;
      totalInDay = 0;
      let totalMinutes = 0;
      let totalCurrent = 0;
      let totalCureentFixe = 0;
      let totalCurrentAcheval = 0;
      let totalCureentFixeAcheval = 0;
      let employeHaslaw;
      // en cas d'enlever de shift acheval une intervale de tempes sur j ou j+1
      let timeToSubstructCurrent = false;
      listShiftByDay.forEach((shiftPlanningManager: PlanningManagerModel, index: number) => {
        const shiftDisplay = this.clone(shiftPlanningManager);
        if (shiftDisplay.modifiable && shiftDisplay.acheval && this.modeAffichage === 2) {
          listPlanningManagerOrLeader.push(this.shiftService.addShiftAcheval(this.clone(shiftDisplay)));
        }
        if (this.modeAffichage !== 2 && shiftDisplay.acheval && !shiftDisplay.modifiable && shiftDisplay.achevalWeek) {
          return;
        }
        if (employee.contrats.length === 1) {
          employeHaslaw = employee;
        } else if (employee.contrats.length > 1) {
          const employeeDisplay = JSON.parse(JSON.stringify(employee));
          employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeDisplay, new Date(shiftDisplay.dateJournee));
        }
        employeHaslaw.loiEmployee = listLoi;
        timeToSubstructCurrent = false;
        if (this.dateService.getJourSemaine(shiftDisplay.dateJournee) === day.val.toUpperCase()) {
          totalMinutes += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          if (this.modeAffichage === 2 && shiftDisplay.acheval) {
            let nextOrPreviousShiftAcheval;
            if (indexDay === 0 || indexDay === 6) {
              let previousOrLastOfShiftWeek = this.clone(this.listPlanningManagerPreviousAndNextWeek);
              if (previousOrLastOfShiftWeek && previousOrLastOfShiftWeek.length) {
                previousOrLastOfShiftWeek = previousOrLastOfShiftWeek.filter((shiftPreviousOrNext: PlanningManagerModel) => shiftPreviousOrNext.managerOuLeader.idEmployee === employeHaslaw.idEmployee);
                nextOrPreviousShiftAcheval = this.shiftService.getListPreviousOrLastShift(shiftDisplay, previousOrLastOfShiftWeek);
              }
            } else {
              if (shiftDisplay.modifiable && this.days[indexDay + 1]) {
                nextOrPreviousShiftAcheval = this.grouperShiftParJour(this.days[indexDay + 1].val, listPlanningManagerOrLeader);
              } else if (this.days[indexDay - 1]) {
                nextOrPreviousShiftAcheval = this.grouperShiftParJour(this.days[indexDay - 1].val, listPlanningManagerOrLeader);
              }
            }
            if (nextOrPreviousShiftAcheval && nextOrPreviousShiftAcheval.length) {
              nextOrPreviousShiftAcheval = nextOrPreviousShiftAcheval.filter((shift: PlanningManagerModel) => !shift.acheval);
              this.sortListShift(nextOrPreviousShiftAcheval);
            }
            this.shiftService.setStatutLongerAndTimeTosubstructToShiftAcheval(shiftDisplay, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, nextOrPreviousShiftAcheval, employeHaslaw);
          }
          totalCurrent = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          if (shiftDisplay.acheval && this.modeAffichage === 2) {
            totalCurrentAcheval = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
            totalCureentFixeAcheval = totalCurrentAcheval;
          }
          if (this.paramNationaux.payerLeBreak) {
            if (listShiftByDay.length > 1) {
              let dureeMinBreak;
              let dureeMinBreakLast;
              totalCureentFixe = totalCurrent;
              if (!shiftDisplay.acheval || this.modeAffichage !== 2 || (shiftDisplay.acheval && shiftDisplay.longer && this.modeAffichage === 2)) {
                totalCurrent = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, employeHaslaw, this.paramNationaux, this.listOfBreakAndShift);
              } else if (shiftDisplay.acheval && !shiftDisplay.longer && this.modeAffichage === 2) {
                totalCureentFixeAcheval = totalCureentFixeAcheval - shiftDisplay.timeToSubstruct;
                totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shiftDisplay.timeToSubstruct), employeHaslaw, this.paramNationaux, this.listOfBreakAndShift);
              }
              if (listShiftByDay[index + 1]) {
                const pauseValide = this.dateService.getDiffHeure(listShiftByDay[index + 1].heureDebut, shiftDisplay.heureFin);
                dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(employeHaslaw), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pauseValide)));
              }
              if (listShiftByDay[index - 1]) {
                const pauseValide = this.dateService.getDiffHeure(shiftDisplay.heureDebut, listShiftByDay[index - 1].heureFin);
                dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(employeHaslaw), this.dateService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pauseValide)));

              }
              // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
              if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
                totalInDay = totalInDay - totalCureentFixe;
              }
              // si le shift courant a un pause
              if ((totalCurrent < totalCureentFixe || totalCurrentAcheval < totalCureentFixeAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
                if (!shiftDisplay.acheval || this.modeAffichage !== 2 || (shiftDisplay.acheval && shiftDisplay.longer && this.modeAffichage === 2)) {
                  totalInDay = totalInDay - totalCureentFixe;
                  totalMinutes = totalMinutes - totalCureentFixe;
                  totalMinutes = totalMinutes + totalCurrent;
                } else if (shiftDisplay.acheval && totalCurrentAcheval < totalCureentFixeAcheval) {
                  timeToSubstructCurrent = true;
                  totalInDay -= shiftDisplay.timeToSubstruct;
                  totalMinutes -= shiftDisplay.timeToSubstruct;
                  totalInDay = totalInDay - totalCureentFixeAcheval;
                  totalMinutes = totalMinutes - totalCureentFixeAcheval;
                  totalMinutes = totalMinutes + totalCurrentAcheval;
                }
                if (listShiftByDay[index - 1]) {
                  const shiftTobreak = {...listShiftByDay[index - 1]};
                  const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
                  totalInDay = totalInDay - nbrHourLast;
                }


              } else if (listShiftByDay[index - 1] && (!listShiftByDay[index + 1] || !dureeMinBreak)) {
                const shiftTobreak = {...listShiftByDay[index - 1]};
                if (shiftDisplay.acheval && this.modeAffichage === 2) {
                  timeToSubstructCurrent = true;
                  totalMinutes -= shiftDisplay.timeToSubstruct;
                  if (totalInDay) {
                    totalInDay -= shiftDisplay.timeToSubstruct;
                  }
                }
                totalMinutes = this.shiftService.getTotalInDayForAllShiftWithBreak(shiftTobreak, shiftDisplay, totalInDay, listShiftByDay.length, totalMinutes, employeHaslaw, this.paramNationaux, this.listOfBreakAndShift).totalMinutes;
                totalInDay = 0;
              }
            } else if (listShiftByDay.length === 1) {
              if (!shiftDisplay.acheval || this.modeAffichage !== 2 || (shiftDisplay.acheval && shiftDisplay.longer && this.modeAffichage === 2)) {
                totalMinutes = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalMinutes, employeHaslaw, this.paramNationaux, this.listOfBreakAndShift);
              } else if (shiftDisplay.acheval && !shiftDisplay.longer && this.modeAffichage === 2) {
                totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shiftDisplay.timeToSubstruct), employeHaslaw, this.paramNationaux, this.listOfBreakAndShift);
                totalMinutes = totalCurrentAcheval;
                timeToSubstructCurrent = true;
              }
            }
          }
        }
        if (shiftDisplay.acheval && this.modeAffichage === 2 && !timeToSubstructCurrent) {
          totalMinutes -= shiftDisplay.timeToSubstruct;
          if (totalInDay) {
            totalInDay -= shiftDisplay.timeToSubstruct;
          }
        }
      });
      totalInWeek += totalMinutes;
      this.totalRowTime = +this.dateService.convertNumberToTime(totalInWeek + Math.floor(+employee.totalAbsence));

    });
    if (planningManager) {
      listPlanningManagerOrLeader.splice((listPlanningManagerOrLeader).findIndex(shift => shift.idPlanningManager === planningManager.idPlanningManager && (!shift.acheval || (shift.acheval && shift.modifiable))), 1);
      if (planningManager.idPlanningManager) {
        listPlanningManagerOrLeader.push(shiftUpdate);
      }
    }
  }


  /**
   * Permet de grouper les shift   par jour
   * @param: list
   * @param: day
   */
  private grouperShiftParJour(day: String, list: PlanningManagerModel[]): PlanningManagerModel[] {
    const listShiftByDay: PlanningManagerModel[] = [];
    list.forEach((shiftDisplay: PlanningManagerModel) => {
      if (this.dateService.getJourSemaine(shiftDisplay.dateJournee) === day.toUpperCase()) {
        this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
        listShiftByDay.push(shiftDisplay);
      }
    });
    return listShiftByDay;
  }

  /**
   *  calcul des temps planifiés
   *   soustraire au temps planifié la valeur du temps minimum d’un break
   *   verification MaxShift Sans Break et min break
   * @param :totalInDay
   * @param :nbrShiftInDay
   * @param :listLoi
   * @param :tempsTravailPartiel
   * @param :mineur
   * @param :pause
   */
  private verificationMaxShiftSansBreak(totalInDay: any, nbrShiftInDay: number, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, pause: number): Date {
    let dureeMaxSansBreak;
    let dureeMinBreak;
    let dureeSubtract;
    totalInDay = this.dateService.getNombreHeureTravaille(totalInDay);
    if (nbrShiftInDay === 1) {
      dureeMaxSansBreak = this.contrainteSocialeService.validDureeMaxSansBreak(totalInDay, listLoi, tempsTravailPartiel, mineur);
      if (dureeMaxSansBreak) {
        dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(listLoi, tempsTravailPartiel, mineur);
        dureeSubtract = this.calculeBreak(totalInDay, dureeMinBreak);
      }
    }
    if (nbrShiftInDay > 1) {
      dureeMaxSansBreak = this.contrainteSocialeService.validDureeMaxSansBreak(totalInDay, listLoi, tempsTravailPartiel, mineur);

      pause = +this.dateService.convertNumberToTime(pause);
      dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(listLoi, tempsTravailPartiel, mineur, this.dateService.getNombreHeureTravaille(pause));
      if (dureeMaxSansBreak && dureeMinBreak) {
        dureeMinBreak = this.dateService.setTimeFormatHHMM(dureeMinBreak);
        dureeSubtract = this.calculeBreak(totalInDay, dureeMinBreak);
      }
    }
    return dureeSubtract;
  }

  /**
   * recuperer le temps de break
   * @param: totalInDay
   * @param :dureeMinBreak
   */
  private calculeBreak(totalInDay: Date, dureeMinBreak: Date): Date {
    let dureeSubtract;
    if (this.listOfBreakAndShift[0]) {
      if (this.listOfBreakAndShift[0].shift > totalInDay) {
        dureeSubtract = dureeMinBreak;
      }
      if (totalInDay >= this.listOfBreakAndShift[0].shift) {
        dureeSubtract = this.listOfBreakAndShift[0].break;
      }
    } else {
      dureeSubtract = dureeMinBreak;
    }
    if (this.listOfBreakAndShift[1]) {
      if (this.listOfBreakAndShift[1].shift > totalInDay && totalInDay >= this.listOfBreakAndShift[0].shift) {
        dureeSubtract = this.listOfBreakAndShift[0].break;
      }
      if (this.listOfBreakAndShift[1].shift <= totalInDay) {
        dureeSubtract = this.listOfBreakAndShift[1].break;
      }
    }
    if (this.listOfBreakAndShift[2]) {
      if (this.listOfBreakAndShift[2].shift > totalInDay && totalInDay >= this.listOfBreakAndShift[1].shift) {
        dureeSubtract = this.listOfBreakAndShift[1].break;
      }
      if (this.listOfBreakAndShift[2].shift <= totalInDay) {
        dureeSubtract = this.listOfBreakAndShift[2].break;
      }
    }
    return dureeSubtract;
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
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour groupe de travail de l'employé
   * @param :employee
   */
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
      },);
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
    window.open(window.location.href + '/display/' + this.selectedRapport.codeName, '_blank');
  }

  /**
   * supprime shift acheval et non modifiable
   * @param: idPlanningManager
   * @param: mangerOrLeaderActif
   */
  public deleteShiftAchevalHidden(idPlanningManager: any, idEmployee: number): void {
    const collection = this.planningByManagerOrLeader.get(idEmployee);
    const indexPlanningManager = collection.findIndex((item: PlanningManagerModel) => item.idPlanningManager === idPlanningManager && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManager !== -1) {
      collection.splice(indexPlanningManager, 1);
    }
    const indexPlanningManagerDeleted = this.listPlanningManager.findIndex((item: PlanningManagerModel) => item.idPlanningManager === idPlanningManager && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManagerDeleted !== -1) {
      this.listPlanningManager.splice(indexPlanningManagerDeleted, 1);
    }
  }

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
