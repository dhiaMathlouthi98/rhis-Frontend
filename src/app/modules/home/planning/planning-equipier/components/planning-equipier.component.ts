import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {GridsterItem} from 'angular-gridster2';
import {PlanningEquipierService} from '../service/planning-equipier.service';
import * as moment from 'moment';
import {DecoupageHoraireService} from '../../configuration/service/decoupage.horaire.service';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {DateService} from 'src/app/shared/service/date.service';
import {SharedRestaurantService} from 'src/app/shared/service/shared.restaurant.service';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {forkJoin, Observable, Subject} from 'rxjs';
import {DecoupageHoraireModel} from 'src/app/shared/model/decoupage.horaire.model';
import {PositionTravailModel} from 'src/app/shared/model/position.travail.model';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {AddShiftComponent} from './add-shift/add-shift.component';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {DatePipe} from '@angular/common';
import {Sexe} from 'src/app/shared/enumeration/Sexe.model';
import {LoiEmployeeService} from 'src/app/shared/module/restaurant/service/loi.employee.service';
import {LoiEmployeeModel} from 'src/app/shared/model/loi.employee.model';
import {LoiGroupeTravailService} from 'src/app/shared/module/restaurant/service/loi.groupe.travail.service';
import {LoiGroupeTravailModel} from 'src/app/shared/model/loi.groupe.travail.model';
import {LoiRestaurantService} from 'src/app/shared/module/restaurant/service/loi.restaurant.service';
import {LoiRestaurantModel} from 'src/app/shared/model/loi.restaurant.model';
import {ContratModel} from 'src/app/shared/model/contrat.model';
import {ContratService} from '../../../employes/service/contrat.service';
import {SemaineReposModel} from 'src/app/shared/model/semaineRepos.model';
import {SemaineReposService} from '../../../employes/service/semaine-repos.service';
import {VerificationContrainteModel} from '../../../../../shared/model/verificationContrainte.model';
import {ContrainteSocialeService} from 'src/app/shared/service/contrainte-sociale.service';
import {JoursFeriesService} from '../../../../../shared/module/params/jours-feries/service/jours.feries.service';
import {JourFeriesModel} from 'src/app/shared/model/jourFeries.model';
import {JourSemaine} from 'src/app/shared/enumeration/jour.semaine';
import {PeriodeManagerService} from 'src/app/shared/module/restaurant/service/periode.manager.service';
import {NationaliteService} from '../../../configuration/service/nationalite.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PlanningJourComponent} from './planning-jour/planning-jour.component';
import * as _ from 'lodash';
import {DetailsTempsPayeComponent} from './details-temps-paye/details-temps-paye.component';
import {ShiftService} from '../service/shift.service';
import {PlanningReferenceService} from '../service/planning-reference.service';
import {PlanningJourReferenceModel} from 'src/app/shared/model/planning.jour.reference.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {BrightnessColorShiftService} from '../../../../../shared/service/brightnessColorShift.service';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {Periode, WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {DisponiblitePairOrOdd} from 'src/app/shared/enumeration/disponiblitePairOrOdd';
import {EmployeeService} from '../../../employes/service/employee.service';
import {GlobalSettingsService} from '../../../../../shared/service/global-settings.service';
import {Router} from '@angular/router';
import {RestaurantService} from '../../../../../shared/service/restaurant.service';
import {PlanningSemaineComponent} from './planning-semaine/planning-semaine.component';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {ParametreNationauxModel} from '../../../../../shared/model/parametre.nationaux.model';
import {ParamNationauxService} from '../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {ContrainteSocialeCoupureService} from '../../../../../shared/service/contrainte-sociale-coupure.service';
import * as rfdc from 'rfdc';
import {PlanningLockService} from '../../../../../shared/service/planning-lock.service';
import {ParametreModel} from '../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {RapportModel} from '../../../../../shared/model/rapport.model';
import {RapportService} from '../../../employes/service/rapport.service';
import {SynchroPlanningEquipierService} from '../service/synchro-planning-equipier.service';
import {DecoupagePlanningEquipier} from '../../../../../shared/model/gui/planning.equipier.model';
import {PlanningHourLabelFulldayService} from '../../../../../shared/service/planning.hour.label.fullday.service';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';
import {VerificationContraintePlanningEquipierService} from '../service/verification-contrainte-planning-equipier.service';
import {PlgEquipierHelperService} from '../service/plg-equipier-helper.service';
import {MethodeUsefulToPlgEquipierService} from '../service/methode-useful-to-plg-equipier.service';
import {TabPanel} from 'primeng/primeng';
import { PlgHebdoContainerComponent } from '../../plg-equipier-vue-hebdo/components/plg-hebdo-container/plg-hebdo-container.component';
import { ListShiftUpdatedAndDeletedModel } from 'src/app/shared/model/gui/listShiftUpdatedAndDeleted.model';

export enum EmployeePosition {
  NotLast,
  Last
}

@Component({
  selector: 'rhis-planning-equipier',
  templateUrl: './planning-equipier.component.html',
  styleUrls: ['./planning-equipier.component.scss']
})
export class PlanningEquipierComponent implements OnInit, OnDestroy {

  public shiftToRestore: ShiftModel[] = [];

  /**
   * incrément du calendrier
   */
  public offset = 0;
  /**
   * valeurs de l'axe du temps
   */
  public hours: string[] = [];
  /**
   * valeurs de l'axe des employées
   */
  public employees: EmployeeModel[] = [];
  /**
   * afficher la popup de création d'un nouveau shift
   */
  public showAddShiftPopup: boolean;
  /**
   * numéro de semaine
   */
  public weekNumber: number;

  public previousWeek = -1;
  /**
   * configuration du calendrier pour afficher les dates en français
   */
  public frConfig: any;
  /**
   * date d'aujourd'hui
   */
  public today: Date;
  /**
   * Afficher une pop-up pour informer l'utilisateur qu'il doit d'abord ajouter un employé pour pouvoir ajouter des shifts
   */
  public showAddEmployeeFirst = false;
  /**
   * Afficher un message d'erreur en cas de chevauchement de shifts lors de la création
   */
  public showOverlapErrorMessage: boolean;
  /**
   * Date sélectionnée dans le calendrier
   */
  public selectedDate: any;
  public planningEquipierShow = true;
  public dateContrainteAcheve: any;

  /**
   * Date choisie pour le calendrier
   */
  public calendarDate: Date;
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;

  public debutJourneeActiviteByDay: any;
  public finJourneeActiviteByDay: any;
  /**
   * Premier jour de la semaine d'un restaurant
   */
  public firstDayAsInteger: number;
  /**
   * afficher la popup de création d'un nouveau shift
   */
  public showSaveReferencePopup: boolean;
  public tauxMOA = '';
  public popupTitle = '';
  public buttonLabel = '';
  public setNightValue;
  @ViewChildren(PlanningJourComponent) planningsJour: QueryList<PlanningJourComponent>;
  @ViewChildren(PlanningSemaineComponent) planningsSemaine: QueryList<PlanningSemaineComponent>;
  @ViewChild(AddShiftComponent) addShiftComponent: AddShiftComponent;
  @ViewChild(PlgHebdoContainerComponent) plgHebdoComponent: PlgHebdoContainerComponent;
  /**
   * Composant fils DetailTempsPayeComponent
   */
  @ViewChild(DetailsTempsPayeComponent) detailsTempsPayeComponent: DetailsTempsPayeComponent;
  @ViewChild('content_planning_equipier') contentPlanningEquipier: ElementRef;
  @ViewChild('variableTabReference') variableTabReference: TabPanel;
  @ViewChild('variableTabDelete') variableTabDelete: TabPanel;
  public selectedShift: any;
  public employeeShifts: any[] = [];
  public listShift: ShiftModel[] = [];
  public listShiftToUpdate: ShiftModel[] = [];
  public shiftToSave: any;
  public listeAvailableEmployee: EmployeeModel[] = [];
  // la liste des employés actifs
  public listeEmployee: EmployeeModel[] = [];
  public listIdShiftToDelete: any[] = [];
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public mineur: boolean;
  public listLoiByEmployee = new Map();
  public listLoi: any;
  public filter: string;
  public listLoiByGroupTravail = new Map();
  public listContraintesSocialesByShift = new Map();
  public contratActif: ContratModel;
  public tempsTravailPartiel = false;
  public semaineRepos: SemaineReposModel[] = [];
  public hiddenSave = false;
  public hiddenSaveGlobale = false;
  public listContrainte: VerificationContrainteModel[] = [];
  public listContrainteSuppression: VerificationContrainteModel[] = [];
  public messageVerification = {} as VerificationContrainteModel;
  public listJourFeriesByRestaurant;
  public popupVerificationContrainteVisibility = false;
  public employeeHasAnomalieContraintSocial = {} as EmployeeModel;
  public dateContraintSocial: any;
  public totalRowTime: any;
  public premierJourDeLaSemaine: JourSemaine;
  public jourDebutWeekEnd: JourSemaine;
  public heureDebutWeekEnd: Date;
  public jourFinWeekEnd: JourSemaine;
  public heureFinWeekEnd: Date;
  public limiteHeureDebut: Date;
  public cummuleTotal = 0;
  public listShiftSemaineByEmployee: ShiftModel[] = [];
  public oldItemData: GridsterItem;
  public saveReferenceForm = new FormGroup(
    {
      referenceName: new FormControl('', [Validators.required]),
      referenceList: new FormControl(''),
    }
  );
  public selectedValue = false;
  public isSubmitted = false;
  public titlePopupContraint = this.translator.translate('SHIFT_FIXE.ANOMALIE');
  public shiftReferenceList: PlanningJourReferenceModel[] = [];
  public choosenJourReference: PlanningJourReferenceModel = {semaine: false};
  public choosenDayReferenceToDelete = {} as PlanningJourReferenceModel;
  public listShiftToDelete: ShiftModel[] = [];
  /**
   * Ouvrir la vue détaillée pour un employé
   */
  public showEmployeeDetails: boolean;
  /**
   * Employée sélectionné pour l'affichage du planning détaillé
   */
  public selectedEmployee: EmployeeModel;
  /**
   * L'employée sélectionné dans la popup de recherche
   */
  public searchedEmployee: EmployeeModel;
  /**
   * id de l'employée sélectionné dans le popup de recherche
   */
  public searchedEmployeeId = 0;
  public minBeforeCoupure = 0;
  /**
   * Afficher la popup de recherche d'un employé
   */
  public showSearchEmployeePopup: boolean;
  /**
   * Afficher la popup de charger un jour/semaine de reference
   */
  public showChargerJourReferencePopup: boolean;
  public overwriteShifsReference = 0;
  /**
   * titre de la popup de charger un jour/semaine de reference
   */
  public titleChargerJourReferencePopup: string;

  public planningJournalierTitle: string;
  /**
   * Nouveau shift à ajouter
   */
  public shiftToAdd: GridsterItem;
  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 550,
    height: 600
  };
  public minimalDisplay = false;
  public shiftHasAnomalieContraintSocial: ShiftModel;
  public employeesToAdd: EmployeeModel[] = [];
  public employeesList: any;
  /**
   * position de l'employée sélectionné sur la grille
   */
  public selectedEmployeePosition: EmployeePosition;
  public employeePositions = EmployeePosition;
  public searchEmployeesList: any;
  /**
   * List des contraintes sociale globale rompues
   */
  public listContrainteGlobale: any[] = [];
  /**
   * Show global social constrainte  popup
   */
  public popupVerificationContrainteGlobaleVisibility = false;
  /**
   * Build grid and change date after contrainte social check
   */
  public changeDateAfterCheckContrainte = false;
  /**
   * Change Page after contrainte social check
   */
  public changePageAfterCheckContrainte = false;
  /**
   * New Date selected from calendar
   */
  public newDate: Date;
  public employeePlanning: any;
  public employeesStartGrid: EmployeeModel[] = [];
  public employeesEndGrid: EmployeeModel[] = [];
  public weeklyPlanningStartGrid: ShiftModel[];
  public weeklyPlanningEndGrid: ShiftModel[];
  public weeklyDetailsPlanning: WeekDetailsPlanning[] = [];
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public existanceErrorMessage = '';
  private ecran = 'VPE';
  // retourne true si la référence exist déja dans la liste des références
  public refExist: boolean;
  public index: number;
  public employeeToAssign: EmployeeModel;
  public displayDialogChargerReference = true;
  public overlapPopupMessage: string;
  /**
   * Tableau avec les dates de la semaine
   */
  public weekDates: string[] = [];
  public weekDatesToDisplay: any[];
  /**
   * Récapitulatif de la semaine
   */
  public weekEmployeeSummary: Periode;
  /**
   * Récapitulatif du mois
   */
  public monthEmployeeSummary: Periode;
  @ViewChild('myCalendar') private myCalendar: any;
  private choosenJourReferenceLibelleError = false;
  private choosenDayReferenceDeletedLibelleError = false;
  public oldShift: ShiftModel;
  public listPairAndOdd: DisponiblitePairOrOdd[] = [];
  public newActiveEmployees: EmployeeModel[] = [];

  public equipierScrollableMenuOpen = false;
  public menuState = false;

  /**
   * Afficher la pop-up de sélection des sections à inclure dans le pdf
   */
  public showPdfSections = false;
  public backgroundRowColor: string;
  public oldEmploye: EmployeeModel;
  public diffCols: number;
  public employeeSummary: EmployeeModel;
  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  public listShiftForThreeWeek: ShiftModel[] = [];
  private listShiftToSave: any[] = [];
  public employeeSummaryDetails: EmployeeModel;
  public startMinutesCells = 0;
  public gridWhiteSpace = 0;
  public endMinutesCells = 0;
  public clone = rfdc();
  public listShiftWithSign = [];
  public listShiftWithSignForWeekOrDay = [];

  private weeksPerMonth = [];
  public debutPeriode: Date;
  public finPeriode: Date;
  public activeEmployeesWithTotalPlanifieJour: any[];

  public leftElement: any;
  public heightInterface: any;

  public lastScrollLeft = 0;
  public newLeft = 0;
  public elementScrollPlanning: any;
  public activeEmployeesPerWeek: EmployeeModel[] = [];
  public activeEmployeesWithTotalPlanifieSemaine: EmployeeModel[] = [];

  public leftHourModify: any;
  public widthMenuWhenOpen = 231;
  public oldShiftNonAffecte: any;
  public minutesToSubstructFin: number;
  public shiftsToDelete = [];
  public item: any;
  public employeeDisplay: EmployeeModel;
  public popupVerificationCsMaxShift = false;

  // variable utilise pour pouvoir afficher / cache les shifts managers / leaders
  public displayPlgManagers = false;
  public managersShifts: ShiftModel[] = [];
  private readonly GREY = '#c0bbb0';
  public employeListWithIndispo = [];
  public indisponibilities = [];
  public absences = [];
  public indisponibilitiesStart: any[];
  public absencesStart: any[];
  public indisponibilitiesEnd: any[];
  public absencesEnd: any[];
  public dayToUpdateInDetailedPayedTime: any;
  public listLeaderMangerWeekShifts = [];
  public totalTempsAbsence: any;
  columnWidthFromWeekValue: any;
  public listItemToUpdate: any[];
  public newListItemToUpdate = [];

  public selectedRapport: RapportModel;
  public listRapports: RapportModel[];

  public PLANNING_EMPLOYEE = 'PLG_EMPLOYE_RAPPORT';
  public RAPPORT_OPERATIONNEL = 'RAPPORT_OPERATIONNEL';
  public RESUME_PLANNING = 'RESUME_PLANNING_RAPPORT';

  public listEmployees: EmployeeModel[] = [];
  public allEmployeeLabel = '';

  public showPopupRapport = false;
  public decoupageHoraireFinEtDebutActivity: any;
  // total Shift equipie Non Affecte par semaine autre que journee en cours
  public totalEquipNonAffecteByWeek = 0;
  public totalEquipNonAffecteByWeekToSend = 0;
  public lockState;
  public currentPlanning;
  public showMoe: boolean;
  public prod = '-';
  public performMode: string;

  public modeAffichage = 0;
  public paramMode = 0;

  private MIN_BEFORE_COUPURE_CODE_NAME = 'MINBEFORCOUPURE';
  private PERFORM_MODE_CODE_NAME = 'PERFORM_MODE';
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  private updateVueSemaine = false;
  public gridLimit: number;
  public copyEvent = false;
  public displayPlgHebdo = false;
  public values: any[];
  public calendar_fr: any;
  public deleteRow: boolean;
  public dateDebut: Date;
  public dateFin: Date;
  public downDate = false;
  public upDate = false;
  public changePlgHebdo = false;
  public getTauxMoeWeekTotal = false;

  constructor(
    private planningEquipieService: PlanningEquipierService,
    private shiftService: ShiftService,
    private decoupageHoraireService: DecoupageHoraireService,
    private dateService: DateService,
    private sharedRestaurant: SharedRestaurantService,
    private restaurantService: RestaurantService,
    private translator: RhisTranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private employeeLawService: LoiEmployeeService,
    private loiGroupeTravailService: LoiGroupeTravailService,
    private loiRestaurantService: LoiRestaurantService,
    private contratService: ContratService,
    private semaineReposService: SemaineReposService,
    private contrainteSocialeService: ContrainteSocialeService,
    private joursFeriesServie: JoursFeriesService,
    private periodeManagerService: PeriodeManagerService,
    private nationnaliteService: NationaliteService,
    private helperService: HelperService,
    private planningReferenceService: PlanningReferenceService,
    private domControlService: DomControlService,
    private brightnessColorShiftService: BrightnessColorShiftService,
    private sessionService: SessionService,
    public rhisRoutingService: RhisRoutingService,
    private router: Router,
    private paramNationauxService: ParamNationauxService,
    private employeeService: EmployeeService,
    private globalSettings: GlobalSettingsService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private planningLockService: PlanningLockService,
    private parametreService: ParametreGlobalService,
    private rapportService: RapportService,
    private synchroPlanningEquipierService: SynchroPlanningEquipierService,
    private planningHourLabelFulldayService: PlanningHourLabelFulldayService,
    private limitDecoupageFulldayService: LimitDecoupageFulldayService,
    private verificationContraintePlanningEquipierService: VerificationContraintePlanningEquipierService,
    private plgEquipierHelperService: PlgEquipierHelperService,
    private methodeUsefulToPlgEquipierService: MethodeUsefulToPlgEquipierService
  ) {
    this.titleChargerJourReferencePopup = this.translator.translate('PLANNING_EQUIPIER.CHARGER_REF_TITLE');
    this.planningJournalierTitle = this.translator.translate('REPORT.RAPPORT_JOURNALIER_TITLE');
    window.addEventListener('scroll', this.scrollToCorrectPosition.bind(this), true);
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

  async ngOnInit() {
    this.menuState = this.globalSettings.menuIsOpen;
    this.equipierScrollableMenuOpen = this.menuState;
    let date: any;
    const rawDate = new Date(this.sessionService.getLastSelectedDate());
    const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
    if (userTimezoneOffset > 0) {
      date = new Date(rawDate.getTime() + userTimezoneOffset);
    } else {
      date = rawDate;
    }
    this.initCalender();
    const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(date, 'dd-MM-yyyy'));
    this.lockState = planningWithStatus.locked;
    this.currentPlanning = planningWithStatus.planning;
    this.globalSettings.onToggleMenu().subscribe(menuState => {
      this.menuState = menuState;
      if (!this.menuState) {
        setTimeout(() => {
          this.equipierScrollableMenuOpen = this.menuState;
          if(this.contentPlanningEquipier){
            this.contentPlanningEquipier.nativeElement.scrollLeft = 0;
            this.contentPlanningEquipier.nativeElement.style.overflowX = 'hidden';
          }
          this.planningsJour.forEach(plnJour => plnJour.buildGrid());
        }, 500);
      } else {
        this.equipierScrollableMenuOpen = this.menuState;
        if(this.contentPlanningEquipier){
        this.contentPlanningEquipier.nativeElement.style.overflowX = 'auto';
        }
      }
    });
    this.getSelectedRestaurant();
    if (this.sessionService.getResetPlanningCalendar() === false.toString()) {
      this.selectedDate = new Date(this.sessionService.getLastSelectedDate());
    }
    this.getListRapportByCodeName();
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

  /**
   *get param PERFORM_MODE pour afficher productivité ou taux de MOE
   */
  public getParamRestaurantIndicateurPerformance(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.PERFORM_MODE_CODE_NAME);
    if (index !== -1) {
      this.performMode = paramList[index].valeur;
      this.showMoe = this.performMode !== 'MOE';
    }
  }

  /**
   *get param PERFORM_MODE pour afficher productivité ou taux de MOE
   */
  public getDisplayMode24H(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      this.modeAffichage = +paramList[index].valeur;
      this.paramMode = this.clone(+paramList[index].valeur);
      this.modeAffichage = this.limitDecoupageFulldayService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, this.calendarDate, this.dateService).updatedModeAffichage;
    }
  }

  public getTauxMoeByDay(value?: { moa: any, CA: number, totalPlanifie: number }): void {
    if(!this.displayPlgHebdo){
      this.getTauxMoeWeekTotal = false;
      if (value && value.CA) {
        let totalMinuteNonAffecte = 0;
        this.listShift.forEach((item: ShiftModel) => {
          if (!item.employee || !item.employee.idEmployee) {
            totalMinuteNonAffecte += this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
          }
        });
        if (value.CA === 0) {
          this.tauxMOA = '-';
          this.prod = '-';
        } else {
          const nonAffecteMOA = this.getNonAffecteMoaInCurrentDay(value.CA);
          this.tauxMOA = '' + (+value.moa + nonAffecteMOA).toFixed(2) + '%';
          if ((value.totalPlanifie + totalMinuteNonAffecte) === 0) {
            this.prod = '-';
          } else {
            const arrondiTotalPlanifie = +((value.totalPlanifie).toFixed(0));
            const ca = +((value.CA).toFixed(2));
            this.prod = (ca / ((arrondiTotalPlanifie + totalMinuteNonAffecte) / 60)).toFixed(2) + '€/h';
          }
        }
      } else {
        this.prod = '-';
        if (value.moa === '-') {
          this.tauxMOA = '' + value.moa;
        } else {
          this.tauxMOA = '' + value.moa + '%';
        }
      }
      this.getNonAffecteMoaInCurrentDay();
    } else {
      this.getTauxMoeWeekTotal = true;
    }

  }
  public totalMoeSemaineDisplay(event: any): void{
    this.tauxMOA = event.totalMoe + '%';
    this.prod = event.totalProd + '€/h';
  }
  /**
   * undoResize dans le cas de violation des contraintes sociales
   */
  public undoResize(oldItemData: GridsterItem) {
    const x = this.plgEquipierHelperService.convertStartTimeToPosition(oldItemData.hdd, oldItemData.heureDebutIsNight, this.debutJourneeActivite, oldItemData.hdf, oldItemData.heureFinIsNight);
    let cols: number;
    if (oldItemData.acheval) {
      cols = oldItemData.oldCols;
    } else {
      cols = this.plgEquipierHelperService.convertDurationToColsNumber(oldItemData.hdd, oldItemData.heureDebutIsNight,
        oldItemData.hdf, oldItemData.heureFinIsNight);
    }
    const oldPosition = oldItemData.positionCopy;

    this.shiftToAdd = {
      x: x,
      y: oldPosition,
      positionCopy: oldPosition,
      cols: cols,
      oldCols: oldItemData.oldCols,
      rows: 2,
      label: this.planningHourLabelFulldayService.getShiftLabelValue(this.oldShift, this.modeAffichage),
      color: oldItemData.color,
      textColor: this.brightnessColorShiftService.codeColorTextShift(oldItemData.color),
      iconEditShift: this.brightnessColorShiftService.icontShift(oldItemData.color),
      timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(this.oldShift, this.modeAffichage),
      isShift: true,
      idShift: oldItemData.idShift,
      employee: oldItemData.employee,
      selectedEmployee: oldItemData.selectedEmployee,
      selectedShift: this.oldShift,
      hdd: oldItemData.hdd,
      hdf: oldItemData.hdf,
      heureDebutIsNight: oldItemData.heureDebutIsNight,
      heureFinIsNight: oldItemData.heureFinIsNight,
      dragEnabled: oldItemData.dragEnabled,
      resizeEnabled: oldItemData.resizeEnabled,
      dateJournee: oldItemData.dateJournee,
      notPlgEquipier: oldItemData.notPlgEquipier,
      shiftPrincipale: oldItemData.shiftPrincipale,
      canUpdate: oldItemData.canUpdate,
      acheval: oldItemData.acheval,
      modifiable: oldItemData.modifiable,
      fromUndoResize: true
    };

    this.initShiftNonAchevalAttribute(this.oldShift, this.oldShift);

    this.updateDayShiftsAfterUndoResize();
    if (this.updateVueSemaine && !this.oldShift.acheval) {
      const indexShiftToUpdateInListShiftJour = this.planningsJour.toArray()[0].listShift.findIndex((shift: ShiftModel) => this.oldShift && shift.idShift === this.oldShift.idShift && this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.oldShift.dateJournee, 'yyyy-MM-dd'));
      if (indexShiftToUpdateInListShiftJour !== -1) {
        this.oldShift.fromUndoResize = true;
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShiftJour, this.planningsJour.toArray()[0].listShift, this.oldShift,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
      }
    } else {
      // this.planningsJour.toArray()[0].listShift = [...this.listShift];
      let indexShiftToRestore = this.planningsJour.toArray()[0].listShift.findIndex((shift: ShiftModel) => this.oldShift && shift.idShift === this.oldShift.idShift);
      if (this.oldShift.acheval && this.updateVueSemaine) {
        indexShiftToRestore = this.planningsJour.toArray()[0].listShift.findIndex((shift: ShiftModel) => this.oldShift && shift.idShift === this.oldShift.idShift && this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.oldShift.dateJournee, 'yyyy-MM-dd') && shift.modifiable);
      }
      if (indexShiftToRestore !== -1) {
        this.planningsJour.toArray()[0].listShift.splice(indexShiftToRestore, 1);
        this.planningsJour.toArray()[0].listShift.push({...this.oldShift});
      }
    }
    this.updateWeeklyShiftsAfterUndoResize();
  }

  /**
   * Update list shifts de la journée de l'employé modifié après undo resize
   */
  private updateDayShiftsAfterUndoResize(): void {
    let indexShiftToRestore = this.listShift.findIndex((shift: ShiftModel) => this.oldShift && shift.idShift === this.oldShift.idShift);
    if (this.oldShift.acheval && this.updateVueSemaine) {
      indexShiftToRestore = this.listShift.findIndex((shift: ShiftModel) => this.oldShift && shift.idShift === this.oldShift.idShift && this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.oldShift.dateJournee, 'yyyy-MM-dd') && shift.modifiable);
    }
    if (indexShiftToRestore !== -1) {
      this.listShift.splice(indexShiftToRestore, 1);
      this.listShift.push({...this.oldShift});
    }
  }

  /**
   * Update list shifts de la semaine de l'employé modifié
   * après undoResize (shift retourné à sa place)
   */
  private updateWeeklyShiftsAfterUndoResize(): void {
    if (this.oldShift && this.oldShift.employee && this.oldShift.employee.idEmployee !== null) {
      const actifEmployeeToUpdate = this.newActiveEmployees.findIndex(val => val.idEmployee === this.oldShift.employee.idEmployee);
      if (actifEmployeeToUpdate !== -1) {
        const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.oldShift.dateJournee, 'yyyy-MM-dd'));
        if (indexDayToUpdateInWeeklyPlg !== -1) {
          const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === this.oldShift.idShift && shift.modifiable === this.oldShift.modifiable);
          if (indexShiftToUpdateInListShiftWeek !== -1) {
            this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
            this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push(this.clone(this.oldShift));
            this.listShiftSemaineByEmployee = this.verificationContraintePlanningEquipierService.getListDefaultEmployeeWeekShiftCs(this.newActiveEmployees, this.employeeHasAnomalieContraintSocial, this.listShiftSemaineByEmployee, this.oldShift.employee.idEmployee);
          }
        }
      }
    }
  }

  private initShiftNonAchevalAttribute(shiftModifie: ShiftModel, shiftSource: ShiftModel): void {
    if (!shiftModifie.acheval) {
      shiftModifie.heureDebutCheval = shiftSource.heureDebut;
      shiftModifie.heureDebutChevalIsNight = shiftSource.heureDebutIsNight;
      shiftModifie.heureFinCheval = shiftSource.heureFin;
      shiftModifie.heureFinChevalIsNight = shiftSource.heureFinIsNight;
    }
  }

  /**
   * Récupérer la liste des employés du BE du composant planning-jour
   */
  public getNewEmployeesList(event: any) {
    this.employeesList = event;
  }

  /**
   * récuperer les parametres nantionaux
   */
  private getParamNationauxByRestaurant(): void {
    this.paramNationauxService.getParamNationauxByRestaurant().subscribe((data: ParametreNationauxModel) => {
        this.paramNationaux = data;
        const sortBreakInParametresNationauxResult = this.plgEquipierHelperService.sortBreakInParametresNationaux(this.paramNationaux);
        this.paramNationaux = sortBreakInParametresNationauxResult.paramNationaux;
        this.listOfBreakAndShift = sortBreakInParametresNationauxResult.listOfBreakAndShift;
      }
    );
  }

  /**
   * Afficher la popup de création d'un nouveau shift et Réinitialiser les champs du formulaire shiftform
   */
  public async openAddShiftForm() {
    if (this.addButtonControl()) {
      if (!this.lockState) {
        this.planningsJour.toArray()[0].getNewEmployees(0);
        this.showAddShiftPopup = true;
        this.selectedShift = null;
        this.addShiftComponent.shiftform.reset();
        this.addShiftComponent.isSubmitted = false;
        this.addShiftComponent.errorHourMessage = '';
        this.addShiftComponent.errorMinShiftDelayMessage = '';
        this.addShiftComponent.isNighthdd = false;
        this.addShiftComponent.isNighthdf = false;
        this.addShiftComponent.heureDebutLimitError = false;
        this.addShiftComponent.heureFinLimitError = false;
        this.addShiftComponent.heureFinLimitErrorMessage = '';
        this.addShiftComponent.heureDebutLimitErrorMessage = '';
        this.popupTitle = this.translator.translate('PLANNING_EQUIPIER.ADD_SHIFT_MODAL');
        this.buttonLabel = this.translator.translate('PLANNING_EQUIPIER.ADD_BUTTON');

      } else {
        this.planningLockService.showPopOfLockedWeek();
      }
    }
  }

  /**
   * Afficher la popup de modification d'un shift
   */
  public openUpdateShiftForm(data: GridsterItem) {
    if (data.idShift) {
      this.planningsJour.toArray()[0].getNewEmployees(0, data.idShift);
    } else {
      this.planningsJour.toArray()[0].getNewEmployees(0);
    }
    this.popupTitle = this.translator.translate('PLANNING_EQUIPIER.UPDATE_SHIFT_MODAL');
    this.buttonLabel = this.translator.translate('PLANNING_EQUIPIER.UPDATE_BUTTON');
    this.getShiftSelected(data);
    if (data.isShift) {
      this.showAddShiftPopup = true;
    }
  }

  private getShiftSelected(data) {
    let employeSelected = null;
    let assigne = false;
    if (data.employee.idEmployee !== null) {
      data.selectedEmployee.fullName = data.selectedEmployee.nom + ' ' + data.selectedEmployee.prenom;
      employeSelected = data.selectedEmployee;
      assigne = true;
    }
    this.selectedShift = {
      'employee': employeSelected,
      'positionTravail': data.selectedShift.positionTravail,
      'hdd': data.hdd,
      'hdf': data.hdf,
      'hddIsNight': data.heureDebutIsNight,
      'hdfIsNight': data.heureFinIsNight,
      'dateJournee': data.selectedShift.dateJournee,
      'idShift': data.idShift,
      'employeePosition': data.y,
      'assignedShift': assigne,
      'hasAssociatedShifts': data.hasAssociatedShifts,
      'dragEnabled': data.dragEnabled,
      'resizeEnabled': data.resizeEnabled,
      'oldShiftData': data.selectedShift,
      'shiftPrincipale': data.shiftPrincipale,
      'acheval': data.acheval,
      'modifiable': data.modifiable
    };

  }

  public columnWidthFromWeek(event: any): void {
    this.columnWidthFromWeekValue = event;
  }

  public deleteListShiftEvent(listShiftToDelete: ShiftModel[]): void {
    this.shiftsToDelete = listShiftToDelete;
    listShiftToDelete.forEach((shift: ShiftModel) => this.deleteShift(shift));
  }

  private getSelectedEmployeeToCheck(item: any): void {
    if (item.selectedEmployee && item.selectedEmployee.idEmployee) {
      this.employeeDisplay = item.selectedEmployee;
    } else if (item.employee && item.employee.idEmployee) {
      this.employeeDisplay = item.employee;
    } else {
      this.employeeDisplay = null;
    }
  }

  public deleteShift(item: any) {
    let employeeShiftsList = [];
    this.item = item;
    if (!isNaN(Number(item.idShift))) {
      item.idShift = +item.idShift;
    }
    this.getSelectedEmployeeToCheck(item);
    // En cas de suppression d'un seul shift, il faut vérifier la CS de nbre max de shift(sinon c'est une suppression d'une ligne de shift)
    let checkNbreMaxShift = false;
    if (this.employeeDisplay) {
      const employeCs = this.newActiveEmployees.find((actifEmploye: EmployeeModel) =>
        actifEmploye.idEmployee === this.employeeDisplay.idEmployee);
      if (employeCs) {
        const employeesShifts = employeCs.employeeWeekShiftCS.filter((shift: ShiftModel) => shift.employee && (shift.employee.idEmployee === this.employeeDisplay.idEmployee && (!shift.acheval || (shift.acheval && shift.modifiable))));
        if (employeesShifts && employeesShifts.length) {
          employeeShiftsList = employeesShifts.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(item.dateJournee)) && element.idShift !== item.idShift);
        }
        if (!this.shiftsToDelete.length && (employeeShiftsList && employeeShiftsList.length >= 2)) {
          checkNbreMaxShift = true;
        }
      }
      if (checkNbreMaxShift && employeCs) {
        this.employeeHasAnomalieContraintSocial = this.employeeDisplay;
        this.dateContraintSocial = this.dateService.formatToShortDate(item.dateJournee, '/');
        // En cas de suppression de la vue semaine (le contrat de l'employé est null)
        if (!this.employeeDisplay.contrats) {
          const employeIndex = this.newActiveEmployees.findIndex((val: EmployeeModel) => val.idEmployee === this.employeeDisplay.idEmployee);
          if (employeIndex !== -1) {
            this.employeeDisplay = this.newActiveEmployees[employeIndex];
          }
        }
        if (this.employeeDisplay.contrats.length === 1) {
          this.tempsTravailPartiel = this.employeeDisplay.contrats[0].tempsPartiel;
        } else if (this.employeeDisplay.contrats.length > 1) {
          const employeeNew = this.clone(this.employeeDisplay);
          this.tempsTravailPartiel = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(new Date(item.dateJournee))))).contrats[0].tempsPartiel;
        }
        this.listContrainteSuppression = [];
        // Vérification CS Nombre Shift Max Par Jour
        this.verificationCSNbreShiftMaxParJour(employeeShiftsList, employeCs);
        if (!this.listContrainteSuppression.length) {
          this.saveAfterDelete();
        }
      } else {
        this.saveAfterDelete();
      }
    } else {
      this.calculDureeShift(item);
      this.saveAfterDelete();
    }
    this.undoDeleteAfterCsCheck(item);
  }

  private verificationCSNbreShiftMaxParJour(employeeShiftsList: ShiftModel[], employeCs: EmployeeModel
  ): void {
    const listLoi = employeCs.loiEmployee;
    let verificationContrainte = new VerificationContrainteModel();
    verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(listLoi, this.tempsTravailPartiel, this.shiftService.identifierEmployee(employeCs), employeeShiftsList), listLoi, this.tempsTravailPartiel, this.shiftService.identifierEmployee(employeCs));
    if (verificationContrainte) {
      this.popupVerificationCsMaxShift = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainteSuppression.push(verificationContrainte);
    }
    verificationContrainte = this.shiftService.getPauseBetwenShift(employeeShiftsList, listLoi, this.tempsTravailPartiel, this.shiftService.identifierEmployee(employeCs));
    if (verificationContrainte) {
      this.popupVerificationCsMaxShift = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainteSuppression.push(verificationContrainte);
    }
  }

  private calculDureeShift(item: any): void {
    let heureDebutShift = null;
    let heureFinShift = null;
    if (item.heureDebut) {
      heureDebutShift = item.heureDebut;
      heureFinShift = item.heureFin;
    } else {
      heureDebutShift = item.hdd;
      heureFinShift = item.hdf;
    }
    this.oldShiftNonAffecte =
      {
        'valueToSubstruct': this.dateService.getDiffHeure(heureFinShift, heureDebutShift),
        'valueToAdd': 0
      };
  }

  private undoDeleteAfterCsCheck(item: any): void {
    if (this.listContrainteSuppression.length) {
      // En cas de suppression de la vue semaine et CS bloquante, on remet le shift à sa position
      if (item.hasOwnProperty('isOverIndisponibilte')) {
        this.planningsSemaine.toArray()[0].data.push(item);
      } else {
        // En cas de suppression de la vue jour et CS bloquante, on remet le shift à sa position
        this.planningsJour.toArray()[0].data.push(item);
      }
    }
  }

  // Confirmer suppression après verification de CS nbre max shift par jour
  public saveAfterDelete(): void {
    let deletedShiftInactif = null;
    let indexShiftToDeleteInListUpdateShift: number;
    this.popupVerificationCsMaxShift = false;
    let deletedShiftCurrent = null;
    if (this.employeeDisplay) {

      //Remove shift from grid after confirm delete
      if (this.item.hasOwnProperty('isOverIndisponibilte')) {
        const shiftIndexInGrid = this.planningsSemaine.toArray()[0].data.findIndex(val => val.idShift === this.item.idShift);
        if (shiftIndexInGrid !== -1) {
          this.planningsSemaine.toArray()[0].data.splice(shiftIndexInGrid, 1);
        }
      }
      let actifEmployeeToUpdate;
      actifEmployeeToUpdate = this.activeEmployeesPerWeek.findIndex(val => val.idEmployee === this.employeeDisplay.idEmployee);
      if (actifEmployeeToUpdate !== -1) {
        this.updateActiveEmployeeList(this.activeEmployeesPerWeek);
        this.updateActiveEmployeeList(this.newActiveEmployees);
      } else {
        // update week list shift case delete from inactif employee
        if (this.weeklyDetailsPlanning.length) {
          const indexDayToUpdateInWeeklyPlg = this.weeklyDetailsPlanning.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(this.item.dateJournee, 'yyyy-MM-dd'));
          if (indexDayToUpdateInWeeklyPlg !== -1) {
            const indexShiftToDeleteInListShiftWeek = this.weeklyDetailsPlanning[indexDayToUpdateInWeeklyPlg].shifts.findIndex((shift: ShiftModel) => shift.idShift === this.item.idShift);
            if (indexShiftToDeleteInListShiftWeek !== -1) {
              if (this.datePipe.transform(this.item.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
                this.listShiftToDelete.push(this.weeklyDetailsPlanning[indexDayToUpdateInWeeklyPlg].shifts[indexShiftToDeleteInListShiftWeek]);
              }
              deletedShiftInactif = this.weeklyDetailsPlanning[indexDayToUpdateInWeeklyPlg].shifts[indexShiftToDeleteInListShiftWeek];
              this.weeklyDetailsPlanning[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToDeleteInListShiftWeek, 1);
            }
          }
        }
      }
    }
    this.listShift.forEach((shift, index) => {
      if (shift.idShift === this.item.idShift) {
        this.listShift.splice(index, 1);
        deletedShiftCurrent = shift;
        if (!isNaN(Number(this.item.idShift))) {
          this.listShiftToDelete.push(shift);
        }
      }
    });
    this.listShift = [...this.listShift];

    if (this.selectedEmployee) {
      this.afterGettingEmployeeWeekPlanning();
    }
    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    this.planningEquipieService.setListShift(this.listShift);

    if (this.employeeDisplay) {
      let deletedShift;
      if (deletedShiftInactif) {
        deletedShift = deletedShiftInactif;
      } else {
        deletedShift = this.listShift.find((shift: ShiftModel) => shift.employee && shift.employee.idEmployee === this.employeeDisplay.idEmployee);
      }
      if (!deletedShift && (deletedShiftCurrent && deletedShiftCurrent.employee && this.employeeDisplay.idEmployee === deletedShiftCurrent.employee.idEmployee)) {
        deletedShift = deletedShiftCurrent;
        if (this.activeEmployeesWithTotalPlanifieSemaine) {
          this.activeEmployeesWithTotalPlanifieSemaine.forEach((employeDisplay: EmployeeModel) => {
            if (employeDisplay.idEmployee === deletedShiftCurrent.employee.idEmployee && this.datePipe.transform(deletedShiftCurrent.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
              deletedShiftCurrent.employee = employeDisplay;
            }
          });
        }
      }
      let employeToUpdateSummary = null;
      if (deletedShift) {
        employeToUpdateSummary = deletedShift.employee;
      } else {
        const actifEmployeeToDeleteShift = this.newActiveEmployees.findIndex(val => val.idEmployee === this.employeeDisplay.idEmployee);
        if (actifEmployeeToDeleteShift !== -1) {
          employeToUpdateSummary = this.newActiveEmployees[actifEmployeeToDeleteShift];
        }
      }
      if (!employeToUpdateSummary) {
        const actifEmployeeToDeleteShift = this.activeEmployeesWithTotalPlanifieSemaine.findIndex(val => val.idEmployee === this.employeeDisplay.idEmployee);
        if (actifEmployeeToDeleteShift !== -1) {
          employeToUpdateSummary = this.activeEmployeesWithTotalPlanifieSemaine[actifEmployeeToDeleteShift];
        }
      }
      if (employeToUpdateSummary) {
        this.getSummaryData(employeToUpdateSummary);
      }

    }

    if (this.planningsSemaine && this.planningsSemaine.toArray()[0]) {
      this.planningsSemaine.toArray()[0].getTotalHoursForDay();
      this.planningsSemaine.toArray()[0].updateSummary(0);
    }

    this.dayToUpdateInDetailedPayedTime = this.clone(this.item.dateJournee);
    if (!this.item.dateJournee) {
      this.dayToUpdateInDetailedPayedTime = this.clone(this.item.selectedShift.dateJournee);

    }
    this.planningsJour.toArray()[0].calculatePayedTime(this.item.x, this.item.cols, null, null);

    if (this.listShiftToUpdate.length > 0) {
      indexShiftToDeleteInListUpdateShift = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.item.idShift);
      if (indexShiftToDeleteInListUpdateShift !== -1) {
        this.listShiftToUpdate.splice(indexShiftToDeleteInListUpdateShift, 1);
      }
    }
    this.listContraintesSocialesByShift.delete(this.item.idShift);
    this.hiddenSaveGlobale = false;
    ;
    setTimeout(() =>
        this.oldShiftNonAffecte = null
      , 100);
  }

  private updateActiveEmployeeList(employeesList: EmployeeModel[]): void {
    let actifEmployeeToUpdate: any;
    actifEmployeeToUpdate = employeesList.findIndex(val => val.idEmployee === this.employeeDisplay.idEmployee);
    if (actifEmployeeToUpdate !== -1) {
      const indexDayToUpdateInWeeklyPlg = employeesList[actifEmployeeToUpdate].weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(this.item.dateJournee, 'yyyy-MM-dd'));
      if (indexDayToUpdateInWeeklyPlg !== -1) {
        const indexShiftToDeleteInListShiftWeek = employeesList[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex((shift: ShiftModel) => shift.idShift === this.item.idShift);
        if (indexShiftToDeleteInListShiftWeek !== -1) {
          if (this.datePipe.transform(this.item.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
            this.listShiftToDelete.push(employeesList[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts[indexShiftToDeleteInListShiftWeek]);
          }
          employeesList[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToDeleteInListShiftWeek, 1);
        }
      }
      // liste de contrainte sociale
      const indexShift = employeesList[actifEmployeeToUpdate].employeeWeekShiftCS.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === this.item.idShift);
      if (indexShift !== -1) {
        employeesList[actifEmployeeToUpdate].employeeWeekShiftCS.splice(indexShift, 1);
      }
    }
  }

  /**
   * Ajouter un nouvel employé
   */
  public async addEmployeeButton(newLine: boolean, employe: EmployeeModel, shiftPosition?: number, shiftLength?: number): Promise<void> {
    if (this.addButtonControl()) {
      if (!this.lockState) {
        if (!this.displayPlgHebdo) {
          this.addEmployee(newLine, employe, shiftPosition, shiftLength);
        } else {
          this.plgHebdoComponent.newEmployee();
        }
      } else {
        this.planningLockService.showPopOfLockedWeek();
      }
    }
  }

  public addEmployee(newLine: boolean, employe: EmployeeModel, shiftPosition?: number, shiftLength?: number): void {
    this.planningsJour.toArray()[0].addEmployee(newLine, employe, shiftPosition, shiftLength);
  }

  /**
   * Ajouter un nouveau shift
   * @param: event évènement émis
   */
  public addUpdateShift(event: any) {
    this.copyEvent = false;
    if (event.employee) {
      this.listShiftByWeek(this.selectedDate, event.employee.uuid, event);
      this.verifContrainteEmploye(event);
    } else {
      this.checkContraintesInAddUpdate(event);
    }
  }

  /**
   * Modification d'un shift via resizing/drag and drop
   */
  public async updateShiftResize(event: any): Promise<void> {
    let shifts = [];
    this.oldShift = event.oldShift;
    this.oldEmploye = event.oldShiftEmployee;
    if (event.vueSemaine) {
      this.updateVueSemaine = event.vueSemaine;
    }
    this.buttonLabel = '';
    const initEmployeeWeekAttributesResult = this.initEmployeeWeekAttributes(event, shifts);
    event = initEmployeeWeekAttributesResult.event;
    shifts = initEmployeeWeekAttributesResult.shifts;
    const employeRefrence = JSON.parse(JSON.stringify(event.shiftToUpdate.employee));
    if (employeRefrence && employeRefrence.idEmployee !== null && employeRefrence.idEmployee !== -1) {
      this.resizeOrDragDropShiftAffecté(event, employeRefrence, shifts);
    } else {
      this.resizeOrDragDropShiftNonAffecté(event);
    }
  }

  /**
   * Init "employeeWeekShiftCS" and "weekDetailsPlannings" attributes to prevent looping error
   */
  private initEmployeeWeekAttributes(event: any, shifts: ShiftModel[]): any {
    if (event.shiftToUpdate.employee && event.shiftToUpdate.employee.idEmployee !== null && event.shiftToUpdate.employee.weekDetailsPlannings && event.shiftToUpdate.employee.weekDetailsPlannings.length) {
      if (event.shiftToUpdate.employee.employeeWeekShiftCS && event.shiftToUpdate.employee.employeeWeekShiftCS.length) {
        event.shiftToUpdate.employee.employeeWeekShiftCS.forEach((val: ShiftModel) => {
          shifts.push({...val});
          val.employee.employeeWeekShiftCS = [];
        });
      }
      event.shiftToUpdate.employee.weekDetailsPlannings.forEach((val: WeekDetailsPlanning) => {
        val.shifts.forEach((shift: ShiftModel) => shift.employee.weekDetailsPlannings = []);
      });
    }
    return {event: event, shifts: shifts};
  }

  /**
   * Resize / Drag and drop d'un shift non affecté
   */
  private resizeOrDragDropShiftNonAffecté(event: any): void {
    if (!event.submitUpdate) {
      // Cas de copie d'un shift vers une ligne non affecté
      if (event.copyEvent) {
        this.copyEvent = event.copyEvent;
        this.undoResize(event.gridsterItem);
        let shiftCopy = {...event.shiftToUpdate};
        shiftCopy.idShift = this.makeString();
        this.copyNonAssignedShift(shiftCopy, event.gridsterItem);
      } else {
        this.undoResize(event.gridsterItem);
      }
    } else {
      this.checkContraintesInUpdateResize(event.shiftToUpdate, event.gridsterItem);
    }
  }

  /**
   * Resize / Drag and drop d'un shift affecté
   */
  private resizeOrDragDropShiftAffecté(event: any, employeRefrence: EmployeeModel, shifts: ShiftModel[]): void {
    if (!event.submitUpdate) {
      // Cas de copie d'un shift
      if (event.copyEvent) {
        let shiftCopy = {...event.shiftToUpdate};
        shiftCopy.idShift = this.makeString();
        this.copyAssignedShift(event.gridsterItem, employeRefrence, shiftCopy, shifts);
      } else {
        this.undoResize(event.gridsterItem);
      }
    } else {
      event.shiftToUpdate.employee.employeeWeekShiftCS = shifts;
      this.listShiftByWeek(this.selectedDate, employeRefrence.uuid, event.shiftToUpdate);
      this.verifContrainteEmploye(event.shiftToUpdate, event.gridsterItem);
    }
  }

  private copyAssignedShift(gridsterItem: any, employeRefrence: any, shiftToUpdate: any, shifts: any[]): void {
    this.copyEvent = true;
    this.undoResize(gridsterItem);
    let listweeklyShifts: any[];
    if (this.updateVueSemaine) {
      const indexDay = this.weeklyDetailsPlanning.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(shiftToUpdate.dateJournee, 'yyyy-MM-dd'));
      listweeklyShifts = this.weeklyDetailsPlanning[indexDay].shifts;
    }
    // Si le nouvel emplacement du shift copié contient un employé => on véifie les CS
    if (this.shiftService.canAddUpdateShift(shiftToUpdate, this.updateVueSemaine ? listweeklyShifts : this.listShift, this.copyEvent)) {
      if (employeRefrence && employeRefrence.idEmployee !== null && employeRefrence.idEmployee !== -1) {
        shiftToUpdate.employee.employeeWeekShiftCS = shifts;
        this.listShiftByWeek(this.selectedDate, employeRefrence.uuid, shiftToUpdate);
        this.verifContrainteEmploye(shiftToUpdate, gridsterItem);
      } else {
        // Si le nouvel emplacement du shift copié est une ligne non affectée => pas de verif CS
        this.checkContraintesInUpdateResize(shiftToUpdate, gridsterItem);
      }
    } else {
      this.overlapPopupMessage = this.translator.translate('PLANNING_EQUIPIER.CHEVAUCHEMENT_COPY_POPUP_TITLE');
      this.showOverlapErrorMessage = true;
    }
  }

  private copyNonAssignedShift(shiftToUpdate: any, gridsterItem: any): void {
    this.plgEquipierHelperService.formatGridsterItems(gridsterItem.associatedShifts);
    if (this.shiftService.canAddUpdateShift(shiftToUpdate, gridsterItem.associatedShifts, this.copyEvent)) {
      this.shiftToSave = {...this.getShiftUpdated(shiftToUpdate, gridsterItem)};
      this.addNewShift();
    } else {
      this.overlapPopupMessage = this.translator.translate('PLANNING_EQUIPIER.CHEVAUCHEMENT_COPY_POPUP_TITLE');
      this.showOverlapErrorMessage = true;
    }
  }

  /**
   * recuperer le shift modifié
   * @param: shiftToUpdate
   * @param: gridsterItem
   */
  private getShiftUpdated(shiftToUpdate: any, gridsterItem: any): any {
    shiftToUpdate.employeePosition = gridsterItem.y;
    shiftToUpdate.assignedShift = false;
    shiftToUpdate.hasAssociatedShifts = gridsterItem.hasAssociatedShifts;
    shiftToUpdate.dragEnabled = gridsterItem.dragEnabled;
    shiftToUpdate.resizeEnabled = gridsterItem.resizeEnabled;
    shiftToUpdate.positionDeTravail = shiftToUpdate.positionTravail;
    return shiftToUpdate;
  }

  private getNonAffecteMoaInCurrentDay(CA?: number): number {
    let totalMinuteNonAffecte = 0;
    this.listShift.forEach((item: ShiftModel) => {
      if (!item.employee || !item.employee.idEmployee) {
        totalMinuteNonAffecte += this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
      }
    });
    this.totalEquipNonAffecteByWeekToSend = this.totalEquipNonAffecteByWeek + totalMinuteNonAffecte;
    if (CA) {
      return +((+this.sharedRestaurant.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (+totalMinuteNonAffecte / 60)) / +(CA.toFixed(2)));
    } else {
      return 0;
    }

  }

  /**
   * Déterminer le nombre d'heures totales d'un employé pour la journée en cours
   * @param: employee employée
   */
  public getDayTotalHoursForEmployee(employee: EmployeeModel): string {
    const employeeShifts: ShiftModel[] = this.listShift.filter(shift => shift.employee.idEmployee === employee.idEmployee);
    let colsSum = 0;
    employeeShifts.forEach((shift: ShiftModel) => {
      colsSum = colsSum
        + this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
    });
    const totalMinutes = colsSum * 15;
    return this.dateService.convertNumberToTime(totalMinutes);
  }

  /**
   * popup de confirmation heure de nuit ou heure de jour
   */
  public checkIfNightValue() {
    this.setNightValue = null;
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
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
   * Afficher le planning de la journée sélectionnée dans le calendrier
   * @param: event évènement émis
   */
  public async onDateChanged(event: Date, offset = 0): Promise<void> {
    if (!this.displayPlgHebdo) {
      this.newDate = event;
      this.calendarDate = new Date(this.calendarDate);
      if (!this.canDeactivate()) {
        this.saveContentBeforeDateChange(offset);
      } else {
        if (offset) {
          this.calendarDate.setDate(this.calendarDate.getDate() + offset);
          this.myCalendar.updateInputfield();
        } else {
          this.calendarDate = new Date(this.newDate);
        }
        this.newShiftGrid(this.calendarDate);
        this.showEmployeeDetails = false;
        this.minimalDisplay = null;
        this.selectedEmployee = null;
        this.shiftToAdd = null;
        this.changeDateAfterCheckContrainte = false;
      }
      this.detailsTempsPayeComponent.getDetailTempsPaye(this.calendarDate);
      this.planningsJour.toArray()[0].sortByEmployee = true;
      const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(this.calendarDate, 'dd-MM-yyyy'));
      this.lockState = planningWithStatus.locked;
      this.currentPlanning = planningWithStatus.planning;
    } else {
      if (!this.canDeactivate()) {
        this.saveContentBeforeDateChange(offset);
      } else {
        this.selectDate(event);
      }
    }
  }

  public selectDate(date, filter?) {
    if (date) {
      this.values = [];
      let start = new Date(date);
      start = new Date(date.getTime() - (this.helperService.findDecalage(start, this.premierJourDeLaSemaine) * this.ONE_DAY_IN_MILLISECONDS));
      this.values[0] = start;
      this.dateDebut = start;
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      this.values[1] = end;
      this.dateFin = end;
      this.selectedDate = start;
      // if (!filter) {
      //   this.saveContentAfterChangeDate();
      // } else {
      //   this.findAllEmployeActifWithGroupTravailsPlgManager();
      // }
    }
    this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.dateDebut, 'YYYY-MM-DD'));
    this.getWeeksByMonthByRestaurant(this.dateDebut);

  }

  public sortByEmployeeChange(event: any): void {
    if (this.planningsJour && this.planningsJour.toArray()[0]) {
      this.planningsJour.toArray()[0].sortByEmployee = event;
    }
  }

  /**
   * Verification s'il y a changement de shift
   */
  public canDeactivate(): boolean {
    let canSave = true;
    if (!this.displayPlgHebdo && (this.listShiftToUpdate.length > 0 || this.listShiftToDelete.length > 0 || this.listContraintesSocialesByShift.size > 0)) {
      canSave = false;
    } else if(this.displayPlgHebdo){
      canSave = this.canDeactivateVueHebdo();
    }
    return canSave;
  }
    /**
   * Verification s'il y a changement de shift su vue hebdo
   */
  public canDeactivateVueHebdo(): boolean {
    let canSave = true;
    let autorizeDeleteShift = true;
    let autorizeDeleteShiftByEmployee = true;
    this.plgHebdoComponent.listShiftToUpdate.forEach(shift => {
      if (isNaN(Number(shift.idShift))) {
        shift.idShift = 0;
        delete shift.uuid;
      }
      shift.restaurant = this.sharedRestaurant.selectedRestaurant;
    });
    if (this.listIdShiftToDelete.length === 0) {
      // this.plgHebdoComponent.listIdShiftToDelete.push('0');
      autorizeDeleteShift = false;
    }
    if (this.plgHebdoComponent.listShiftByEmployeeToDelete.length === 0 &&
        this.plgHebdoComponent.listShiftToDelete.length === 0) {
      this.plgHebdoComponent.listShiftByEmployeeToDelete.push('0');
      autorizeDeleteShiftByEmployee = false;
    }
    if (this.plgHebdoComponent.listShiftToUpdate.length > 0 || (autorizeDeleteShift && autorizeDeleteShiftByEmployee)
      || (autorizeDeleteShift && !autorizeDeleteShiftByEmployee)
      || (!autorizeDeleteShift && autorizeDeleteShiftByEmployee)) {
      canSave = false;
    }
    return canSave;
  }
  /**
   * Pop up for confirmation de sauvegarde de données ajouteés/modifiées avant date change
   */
  public saveContentBeforeDateChange(offset: number) {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.changeDateAfterCheckContrainte = true;
        this.saveGlobale(offset);
      },
      reject: () => {
        this.resetReferenceShifts();
        if (offset) {
          this.calendarDate.setDate(this.calendarDate.getDate() + offset);
          this.myCalendar.updateInputfield();
        } else {
          this.calendarDate = new Date(this.newDate);
        }
        // this.selectDate(new Date(this.selectedDate));
        // this.displayPlgHebdo = true;
        this.resetChangementShift();
      }
    });
  }

  /**
   * Réinitialiser les listes des changements (updated et deleted) et l'interface
   */
  private resetChangementShift(): void {
    this.activeEmployeesPerWeek = [];
    this.newShiftGrid(this.calendarDate);
    this.detailsTempsPayeComponent.getDetailsTempsPayeWeek(false);
    this.listShiftToUpdate = [];
    this.listShiftToDelete = [];
    this.newActiveEmployees = [];
    this.listContraintesSocialesByShift.clear();
  }

  /**
   * Pop up for confirmation de sauvegarde de données ajouteés/modifiées avant page change
   */
  public saveContentBeforeDeactivation(offset: number, displayPlgHebdo?: boolean): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.changePageAfterCheckContrainte = true;
        this.saveGlobale(offset, displayPlgHebdo, true);
        this.disablePlgHebdoIfNoPopUpConstraints(() => this.navigateAway.next(true));
      },
      reject: () => {
        this.resetReferenceShifts();
        this.navigateAway.next(true);
        if(displayPlgHebdo !== undefined){
          this.selectDate(new Date(this.selectedDate));
          this.displayPlgHebdo = displayPlgHebdo;
          this.changePlgHebdo = false;
        }
      }
    });
    return this.navigateAway;
  }


  /**
   * Afficher un rappel des CS globales rompues
   */
  public async saveGlobale(offset: number, displayPlgHebdo?: boolean,
                           navigationAwayPlgHeboActivated?: boolean,
                           operation?: Function): Promise<void> {
    if ((this.updateButtonControl() || this.addButtonControl() || this.deleteButtonControl())) {
      if (!this.lockState) {
        if(!this.displayPlgHebdo){
          const employeeSearch = this.plgEquipierHelperService.getListEmployeInSelectedDate(this.selectedDate, this.newActiveEmployees, this.listShiftToUpdate);
          const dates = JSON.parse(JSON.stringify(this.weekDates));
          // Vérification de la CS coupure
          const verificationNbrHourWithoutCoupureResult = this.verificationContraintePlanningEquipierService.verificationNbrHourWithoutCoupure(dates, employeeSearch, this.messageVerification, this.minBeforeCoupure);
          const listContrainteMinTimeWithoutCoupure = verificationNbrHourWithoutCoupureResult.listContrainteMinTimeWithoutCoupure;
          this.messageVerification = verificationNbrHourWithoutCoupureResult.messageVerification;
          // Vérification de la CS durée min d'un shift
          const verifDureeMinDesShiftsResult = this.verificationContraintePlanningEquipierService.verifDureeMinDesShifts(dates, employeeSearch, this.messageVerification);
          const listContrainteDureeMinShift = verifDureeMinDesShiftsResult.listContrainteDureeMinShift;
          this.messageVerification = verifDureeMinDesShiftsResult.messageVerification;

          if (this.listContraintesSocialesByShift.size || listContrainteMinTimeWithoutCoupure.length || listContrainteDureeMinShift.length) {
            this.getListConstraintGlobale(listContrainteMinTimeWithoutCoupure, listContrainteDureeMinShift);
            this.popupVerificationContrainteGlobaleVisibility = true;
          } else {
            this.popupVerificationContrainteGlobaleVisibility = false;
            this.saveListShift(offset, displayPlgHebdo);
            this.synchroPlanningEquipierService.sendEquipierGlobalSave();
          }
          if (this.selectedEmployee) {
            this.scrollToEmployee(this.selectedEmployee.idEmployee);
          }
        } else {
          let employeeSearch;
          // en cas de vérification des cs apres le chargement de semaine de réference
          if (this.plgHebdoComponent.withAffectation) {
            this.plgHebdoComponent.verificationCsAfterLoadingWeek(true);
             employeeSearch = this.plgHebdoComponent.listEmployeeHasShiftInWeekReference.filter((emp: EmployeeModel)=> emp.contrats && emp.contrats.length);
          } else {
             employeeSearch = this.plgHebdoComponent.listEmployeeHasShift.filter((emp: EmployeeModel) => emp.contrats && emp.contrats.length);

          }const dates = this.plgHebdoComponent.weekDates;
          // Vérification de la CS coupure
          const verificationNbrHourWithoutCoupureResult = this.verificationContraintePlanningEquipierService.verificationNbrHourWithoutCoupure(dates, employeeSearch, this.plgHebdoComponent.messageVerification, this.minBeforeCoupure, this.plgHebdoComponent.groupShiftByEmployee(this.plgHebdoComponent.listShift, shiftDisplay => shiftDisplay.employee.idEmployee));
          const listContrainteMinTimeWithoutCoupure = verificationNbrHourWithoutCoupureResult.listContrainteMinTimeWithoutCoupure;
          this.plgHebdoComponent.messageVerification = verificationNbrHourWithoutCoupureResult.messageVerification;
          // Vérification de la CS durée min d'un shift
          const verifDureeMinDesShiftsResult = this.verificationContraintePlanningEquipierService.verifDureeMinDesShifts(dates, employeeSearch, this.plgHebdoComponent.messageVerification, this.plgHebdoComponent.groupShiftByEmployee(this.plgHebdoComponent.listShift, shiftDisplay => shiftDisplay.employee.idEmployee));
          const listContrainteDureeMinShift = verifDureeMinDesShiftsResult.listContrainteDureeMinShift;
          this.plgHebdoComponent.messageVerification = verifDureeMinDesShiftsResult.messageVerification;
          if (this.plgHebdoComponent.listContraintesSocialesByShift.size || listContrainteMinTimeWithoutCoupure.length || listContrainteDureeMinShift.length) {
            this.getListConstraintGlobale(listContrainteMinTimeWithoutCoupure, listContrainteDureeMinShift);
            this.plgHebdoComponent.popupVerificationContrainteGlobaleVisibility = true;
            this.plgHebdoComponent.navigationAwayActivated = navigationAwayPlgHeboActivated;
            this.plgHebdoComponent.onWeekChanged = operation;
          } else {
            this.plgHebdoComponent.popupVerificationContrainteGlobaleVisibility = false;
            this.saveListShift(offset, displayPlgHebdo);
            // this.synchroPlanningEquipierService.sendEquipierGlobalSave();
          }
        }

      } else {
        this.planningLockService.showPopOfLockedWeek();
      }
    }
  }

  /**
   * Récupère la liste des contraintes globales des employés
   */
  public getListConstraintGlobale(listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[], listContrainteDureeMinShift: VerificationContrainteModel[]): boolean {
    let result : any;
    if(!this.displayPlgHebdo){
      result = this.verificationContraintePlanningEquipierService.getListConstraintGlobale(listContrainteMinTimeWithoutCoupure,
        listContrainteDureeMinShift, this.listContrainteGlobale, this.hiddenSaveGlobale, this.listContraintesSocialesByShift);
      ['listContrainteMinTimeWithoutCoupure', 'listContrainteDureeMinShift', 'listContrainteGlobale', 'hiddenSaveGlobale', 'listContraintesSocialesByShift'].forEach(item => this[item] = result[item]);
    } else {
      result = this.verificationContraintePlanningEquipierService.getListConstraintGlobale(listContrainteMinTimeWithoutCoupure,
        listContrainteDureeMinShift, this.plgHebdoComponent.listContrainteGlobale, this.plgHebdoComponent.hiddenSaveGlobale, this.plgHebdoComponent.listContraintesSocialesByShift);
      ['listContrainteMinTimeWithoutCoupure', 'listContrainteDureeMinShift', 'listContrainteGlobale', 'hiddenSaveGlobale', 'listContraintesSocialesByShift'].forEach(item => this.plgHebdoComponent[item] = result[item]);
    }
    return result.areBlocked;
  }

  public saveShiftsForPlgHebdo(): void {
    this.saveListShift(0, false);
    if (this.plgHebdoComponent.navigationAwayActivated) {
      this.plgHebdoComponent.navigationAwayActivated = false;
      this.navigateAway.next(true);
    } else if (this.plgHebdoComponent.onWeekChanged) {
      this.callWeekChangesAndResetConfig();
    }
  }

  public checkNavigationAndNavigateAwayFromPlgHebdo(): void {
    if (this.plgHebdoComponent.navigationAwayActivated) {
      this.plgHebdoComponent.navigationAwayActivated = false;
      setTimeout(() => {
        this.displayPlgHebdo = false;
        this.navigateAway.next(true);
      }, 300);
    } else if (this.plgHebdoComponent.onWeekChanged) {
      this.callWeekChangesAndResetConfig();
    }
  }

  private callWeekChangesAndResetConfig(): void {
    this.plgHebdoComponent.onWeekChanged();
    this.plgHebdoComponent.onWeekChanged = null;
  }

  /**
   * Action to save and export shifts to the corresponding service
   */
  public async saveListShift(offset: number, displayHebdo?: boolean) {

    if (!this.displayPlgHebdo) {
      const result = this.plgEquipierHelperService.getListShitUpdatedAndDeleted(this.currentPlanning, this.activeEmployeesPerWeek,
        this.listShiftToUpdate, this.listShift, this.listShiftToDelete);
      ['currentPlanning', 'activeEmployeesPerWeek', 'listShiftToUpdate', 'listShift', 'listShiftToDelete'].forEach(item => this[item] = result[item]);
      if ((result.listShiftUpdatedAndDeleted.listShiftDeleted && result.listShiftUpdatedAndDeleted.listShiftDeleted.length > 0) ||
        (result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated && result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated.length > 0)) {
        this.notificationService.startLoader();
        this.shiftService.updateAndDeleteListShift(result.listShiftUpdatedAndDeleted, this.overwriteShifsReference).subscribe(async (shiftsUpdated: ShiftModel[]) => {
          this.notificationService.stopLoader();
        this.overwriteShifsReference = 0;
        this.setListShiftAfterSave(shiftsUpdated, displayHebdo);
         if (this.displayPlgManagers) {
            this.displayHidePlgManagers();
            this.displayHidePlgManagers();
          }
          if (this.listShiftToDelete.length === 0) {
            this.displaySuccesUpdateMessage();
          }
          this.deleteListShifts(offset);
          const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(this.calendarDate, 'dd-MM-yyyy'));
          this.lockState = planningWithStatus.locked;
          this.currentPlanning = planningWithStatus.planning;
        }, error => {
          this.reformatShifts(result.listShiftUpdatedAndDeleted);
          console.log('error ', error);
          this.deleteListShifts(offset);
          this.notificationService.stopLoader();
          this.notificationService.showErrorMessage('PLANNING_EQUIPIER.ERROR_SHIFT_MODIFIED', 'PLANNING_EQUIPIER.UPDATE_MESSAGE_HEADER');
        });
      } else {
        this.listShift = [...this.listShift];
        this.deleteListShifts(offset);
        this.employees = this.plgEquipierHelperService.getEmployeesList(this.employees, this.listShift);
      }
    } else {
      const cloneListToDelete = this.plgHebdoComponent.listShiftToDelete.filter( el => el.fromShiftFix);
      const result = this.plgEquipierHelperService.getListShitUpdatedAndDeleted(this.currentPlanning, this.plgHebdoComponent.activeEmployeesPerWeek,
        this.plgHebdoComponent.listShiftToUpdate, this.plgHebdoComponent.listShift , this.plgHebdoComponent.listShiftToDelete);
      ['currentPlanning', 'activeEmployeesPerWeek', 'listShiftToUpdate', 'listShift', 'listShiftToDelete'].forEach(item => this.plgHebdoComponent[item] = result[item]);


      if ( result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated.length ) {
        if (!this.currentPlanning) {
      const list_shiftsToUpdatedOrCreated = [...result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated];
          cloneListToDelete.forEach(el => {
            list_shiftsToUpdatedOrCreated.splice(list_shiftsToUpdatedOrCreated.findIndex(i => i.uuid === el.uuid),1);
          });
          result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated = [...list_shiftsToUpdatedOrCreated];
        }
        result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated.forEach((shift: ShiftModel) => {

          this.dateService.setCorrectTimeToDisplayForShift(shift);
          if (isNaN(Number(shift.idShift))) {
            shift.idShift = 0;
            delete shift.uuid;
          }
          if (isNaN(Number(shift.employee.idEmployee))) {
            shift.employee.idEmployee = 0;
          }
          shift.restaurant = this.sharedRestaurant.selectedRestaurant;
        });
      }
      if(result.listShiftUpdatedAndDeleted.listShiftDeleted){
        result.listShiftUpdatedAndDeleted.listShiftDeleted.forEach((shift: ShiftModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);
        });
      }
      if ((result.listShiftUpdatedAndDeleted.listShiftDeleted && result.listShiftUpdatedAndDeleted.listShiftDeleted.length > 0) ||
      (result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated && result.listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated.length > 0)) {
      this.notificationService.startLoader();
        this.shiftService.updateAndDeleteListShift(result.listShiftUpdatedAndDeleted, 0).subscribe(async (shiftsUpdated: ShiftModel[]) => {
          this.notificationService.stopLoader();
          this.plgHebdoComponent.setListShiftAfterSave(shiftsUpdated, displayHebdo !== undefined ? displayHebdo : this.displayPlgHebdo);
          // if (this.displayPlgManagers) {
          //   this.displayHidePlgManagers();
          //   this.displayHidePlgManagers();
          // }
          // if (this.listShiftToDelete.length === 0) {
          //   this.displaySuccesUpdateMessage();
          // }
          const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(this.calendarDate, 'dd-MM-yyyy'));
          this.lockState = planningWithStatus.locked;
          this.currentPlanning = planningWithStatus.planning;
        }, error => {
          console.log('error ', error);
          this.notificationService.stopLoader();
          this.notificationService.showErrorMessage('PLANNING_EQUIPIER.ERROR_SHIFT_MODIFIED', 'PLANNING_EQUIPIER.UPDATE_MESSAGE_HEADER');
        });
      } else {
        this.plgHebdoComponent.popupVerificationContrainteGlobaleVisibility = false;
        const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(this.calendarDate, 'dd-MM-yyyy'));
        this.lockState = planningWithStatus.locked;
        this.currentPlanning = planningWithStatus.planning;

        this.listContraintesSocialesByShift.clear();
      }

    }

  }
  private reformatShifts(data: any): void{
    if (data.shiftsToUpdatedOrCreated) {
      data.shiftsToUpdatedOrCreated.forEach((item: ShiftModel) => {
        this.dateService.setCorrectTimeToDisplayForShift(item);
      });
    }
    if (data.listShiftDeleted) {
      data.listShiftDeleted.forEach(item => {
        this.dateService.setCorrectTimeToDisplayForShift(item);
      });

    }
  }
  public setListShiftBeforeSave(currentPlanning: any, activeEmployeesPerWeek: EmployeeModel[], listShiftToUpdate: ShiftModel[],
    listShift: ShiftModel[], listShiftToDelete: ShiftModel[]): any {
    const listShiftUpdatedAndDeleted: ListShiftUpdatedAndDeletedModel = {} as ListShiftUpdatedAndDeletedModel;
    listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated = [];
    listShiftUpdatedAndDeleted.listShiftDeleted = [];
    if (!currentPlanning) {
      activeEmployeesPerWeek.forEach((employee: EmployeeModel) => {
        employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
          wdp.shifts.forEach((sh: ShiftModel) => {
            if (listShiftToUpdate.findIndex((value: ShiftModel) => value.idShift === sh.idShift) === -1) {
              listShiftToUpdate.push(sh);
            }
          });
        });
      });
      listShift.filter((sh: ShiftModel) => !sh.employee && sh.fromShiftFix).forEach((shift: ShiftModel) => {
        const index = listShiftToUpdate.findIndex((sh: ShiftModel) => sh.idShift === shift.idShift);
        if (index === -1) {
          listShiftToUpdate.push(shift);
        }
      });
      listShiftToUpdate.filter((shift: ShiftModel) => shift.fromShiftFix).forEach((shift: ShiftModel) => {
        shift.oldShiftFixId = shift.idShift;
        shift.idShift = 0;
        const index = listShift.findIndex((sh: ShiftModel) => sh.idShift === shift.oldShiftFixId);
        if (index !== -1) {
          listShift[index].idShift = 0;
        }
      });
      listShiftToDelete = [];
    } else {
      // listShiftUpdatedAndDeleted.listShiftDeleted = this.getListeShiftToDeleted(listShiftUpdatedAndDeleted.listShiftDeleted, listShiftToDelete);
    }
    listShiftToUpdate.forEach(shift => {
      if (((!shift.employee && shift.idDefaultEmploye) || (shift.employee && shift.employee.idEmployee !== shift.idDefaultEmploye)) && shift.fromShiftFix) {
        shift.fromShiftFix = false;
      }
      if (shift.employee) {
        delete shift.employee.weekDetailsPlannings;
        delete shift.employee.employeeWeekShiftCS;
      }
      if (isNaN(Number(shift.idShift))) {
        shift.idShift = 0;
        if (shift.uuid) {
          delete shift.uuid;
        }
      }
      shift.createFromReference = false;
      if (this.sharedRestaurant.selectedRestaurant) {
        shift.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
      }
      if (!shift.shiftPrincipale && shift.oldShiftData) {
        shift.shiftPrincipale = shift.oldShiftData.shiftPrincipale;
      }
    });

    if (listShiftToUpdate.length > 0) {
      listShiftUpdatedAndDeleted.shiftsToUpdatedOrCreated = listShiftToUpdate;
    }
    return {
      currentPlanning: currentPlanning, activeEmployeesPerWeek: activeEmployeesPerWeek, listShiftToUpdate: listShiftToUpdate,
      listShift: listShift, listShiftToDelete: listShiftToDelete, listShiftUpdatedAndDeleted: listShiftUpdatedAndDeleted
    };
  }
  /**
   * Supprimer un employé
   */
  public async onDeleteEmployee(): Promise<void> {
    if (this.deleteButtonControl()) {
      if (!this.lockState) {
        if (!this.displayPlgHebdo) {
          const planningsJourArray = this.planningsJour.toArray();
          planningsJourArray.forEach((planningJour: PlanningJourComponent) => {
            if (this.selectedEmployee) {
              this.closeEmployeeWeekPlanning();
            }
            planningJour.deleteEmployee();
            const deletedEmployee = planningJour.deletedEmployee;
            if (deletedEmployee && planningsJourArray.length > 1) {
              const index = this.employees.findIndex((emp: EmployeeModel) => emp.idEmployee === deletedEmployee.idEmployee);
              if (index !== -1) {
                this.employees.splice(index, 1);
              }
              this.listShift.forEach((shift: ShiftModel) => {
                if (shift.employee.idEmployee === deletedEmployee.idEmployee) {
                  const indexShift = this.listShift.findIndex((sh: ShiftModel) => sh.idShift === shift.idShift);
                  if (indexShift !== -1) {
                    this.listShift.splice(indexShift, 1);
                  }
                }
              });
            }
          });
        } else {
          this.plgHebdoComponent.showConfirmDeleteRowtest();
          // this.deleteRow = true;
        }
      } else {
        this.planningLockService.showPopOfLockedWeek();
      }
    }
  }

  private async goToNewDate(offset: number): Promise<void> {
    this.popupVerificationContrainteGlobaleVisibility = false;
    // Change Date and build new shift grid after social constraint check
    if (this.changeDateAfterCheckContrainte) {
      if (this.offset !== 0) {
        offset = this.offset;
        this.calendarDate.setDate(this.calendarDate.getDate() + offset);
        this.myCalendar.updateInputfield();
      } else {
        this.calendarDate = new Date(this.newDate);
      }
      this.newShiftGrid(this.calendarDate);
      this.hiddenSaveGlobale = false;
    }
    // Change page after social constrainte check
    if (this.changePageAfterCheckContrainte) {
      this.navigateAway.next(true);
    }
    const planningWithStatus = await this.planningLockService.checkLockWithoutPopUp(this.datePipe.transform(this.calendarDate, 'dd-MM-yyyy'));
    this.lockState = planningWithStatus.locked;
    this.currentPlanning = planningWithStatus.planning;

    this.listContraintesSocialesByShift.clear();
  }

  /**
   * Aller à la journée suivante
   */
  public goToNextDay() {
    this.offset = 1;
    this.onDateChanged(this.calendarDate, 1);
  }

  /**
   * Aller à la journée précédente
   */
  public goToPreviousDay() {
    this.offset = -1;
    this.onDateChanged(this.calendarDate, -1);
  }

  /**
   * Ouvrir le planning détaillé de la semaine pour un employée
   * @param: employee employée
   */
  public openEmployeeWeeklyPlanning(employee: EmployeeModel): void {
    this.minimalDisplay = false;
    this.employeeSummaryDetails = employee;

    this.selectedEmployee = this.activeEmployeesPerWeek.find(value => value.idEmployee === employee.idEmployee);
    if (!this.selectedEmployee) {
      this.selectedEmployee = employee;
      this.getLastContratByEmployee(employee);
    } else if (employee.hasOwnProperty('plgEquipier')) {
      this.selectedEmployee.plgEquipier = employee.plgEquipier;
    }

    this.getDetailsWeeklyPlanning(this.selectedEmployee);
    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
  }

  public getLastContratByEmployee(employee: EmployeeModel) {
    this.contratService.getLastContratByEmployee(employee.uuid).subscribe(
      (data: ContratModel) => {
        employee.hebdoCourant = data.hebdo;
        this.selectedEmployee.contrats[0] = data;
        this.employeeSummaryDetails = employee;

      });

  }

  private afterGettingEmployeeWeekPlanning(): void {
    const shiftsWithoutEmployee: ShiftModel[] = this.listShift.filter((shift: ShiftModel) => shift.employee === null);
    const employeeIndex = this.employees.findIndex(empl => empl.idEmployee === this.selectedEmployee.idEmployee);
    this.employeePlanning = this.listShift.filter((shift: ShiftModel) => shift.employee && shift.employee.idEmployee === this.selectedEmployee.idEmployee);
    if (employeeIndex !== this.employees.length - 1) {
      /**
       * L'employé sélectionné n'est pas le dernier de la grille
       */
      this.selectedEmployeePosition = this.employeePositions.NotLast;
      this.employeesStartGrid = this.employees.slice(1, employeeIndex + 1);
      const emptyEmployeesStartGridLength = this.employeesStartGrid.filter((employe: EmployeeModel) => employe.idEmployee === null).length;
      this.weeklyPlanningStartGrid = this.listShift
        .filter((shift: ShiftModel) => {
          if (shift.employee) {
            return this.checkEmployeeInGrid(shift.employee, this.employeesStartGrid);
          } else {
            if (shiftsWithoutEmployee.indexOf(shift) < emptyEmployeesStartGridLength) {
              return shift;
            }
          }
        });
      this.employeesEndGrid = this.employees.slice(employeeIndex + 1, this.employees.length);
      this.weeklyPlanningEndGrid = this.listShift
        .filter((shift: ShiftModel) => {
          if (shift.employee) {
            return this.checkEmployeeInGrid(shift.employee, this.employeesEndGrid);
          } else {
            if (shiftsWithoutEmployee.indexOf(shift) >= emptyEmployeesStartGridLength) {
              return shift;
            }
          }
        });
    } else {
      this.selectedEmployeePosition = this.employeePositions.Last;
    }
  }

  /**
   * Fermer la vue détaillé d'un employé
   */
  public closeEmployeeWeekPlanning(): void {
    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    if (this.selectedEmployee) {
      this.selectedEmployee.weekDetailsPlannings.forEach((element: WeekDetailsPlanning) => {
        if (element.shiftToRestore) {
          element.shiftToRestore.forEach((sh: ShiftModel) => {
            if (element.shifts.findIndex((elem: ShiftModel) => elem.idShift === sh.idShift) === -1) {
              element.shifts.push(sh);
            }
          });
        }
      });
    }
    this.resetAfterCloseEmployeeWeekPlanning();
  }

  /**
   *
   * réinitialiser tous les champs et les listes liées à la vue détaillé d'un employé
   */
  private resetAfterCloseEmployeeWeekPlanning(): void {
    this.weeklyDetailsPlanning = [];
    this.showEmployeeDetails = false;
    this.selectedEmployee = null;
    this.minimalDisplay = false;
    this.shiftToAdd = null;
    this.employeesEndGrid = [];
    this.employeesStartGrid = [];
    this.updateVueSemaine = false;
  }

  /**
   * Affichage minimale ou non
   * @param: minimalDisplay true si affichage minimaliste, false sinon
   */
  public showMinimalDisplay(minimalDisplay: boolean) {
    this.indisponibilities = [...this.indisponibilities];
    if (this.showEmployeeDetails && minimalDisplay) {
      this.showEmployeeDetails = false;
      this.selectedEmployee = null;
      this.shiftToAdd = null;
      this.employeesEndGrid = [];
      this.employeesStartGrid = [];
    }
    this.minimalDisplay = minimalDisplay;
  }

  /**
   * incrémenter le temps payé lors de chargement des managers/leaders
   * @param: incrementIndexes indexes des valeurs à incrémenter
   */
  public incrementManagerPayedTime(event: { incrementIndexes: any }): void {
    this.detailsTempsPayeComponent.updateTempsPayeWeek(this.displayPlgManagers, event.incrementIndexes, JSON.parse(JSON.stringify(this.debutJourneeActivite)), this.dayToUpdateInDetailedPayedTime, false, null, null);
  }

  /**
   * Afficher la popup de recherche d'employé
   */
  public onSearchEmployee() {
    const el = document.getElementsByClassName('highlight-employee-name')[0] as HTMLElement;
    if (el) {
      el.classList.remove('highlight-employee-name');
      el.className.replace('highlight-employee-name', '');
    }
    this.searchEmployeesList = [];
    this.employees.forEach((employee: EmployeeModel) => {
      if (employee && employee.idEmployee !== null && employee.idEmployee !== -1 && !employee.isManagerOrLeader) {
        this.searchEmployeesList.push({label: employee.prenom + ' ' + employee.nom, value: employee.idEmployee});
      }
    });
    if (this.searchEmployeesList.length > 0) {
      this.searchedEmployeeId = this.searchEmployeesList[0].value;
    }
    this.showSearchEmployeePopup = true;
  }

  /**
   * Chercher l'employé sélectionné dans le popup de recherche
   */
  public searchEmployee() {
    const employe = this.employees.find((employee: EmployeeModel) => employee.idEmployee === this.searchedEmployeeId);
    this.searchedEmployee = _.clone(employe);
    this.showSearchEmployeePopup = false;
  }

  /**
   * décrémenter le temps payé
   * @param: decrementIndexes indexes des valeurs à décrémenter
   */
  public decrementPayedTime(event: { decrementIndexes: any, newDayToUpdate: any, oldDayToUpdate: any }): void {
    this.detailsTempsPayeComponent.updateTempsPayeWeek(this.displayPlgManagers, event.decrementIndexes, JSON.parse(JSON.stringify(this.debutJourneeActivite)), this.dayToUpdateInDetailedPayedTime, true, event.oldDayToUpdate, event.newDayToUpdate, this.oldShiftNonAffecte);
  }

  /**
   * incrémenter le temps payé
   * @param: incrementIndexes indexes des valeurs à incrémenter
   */
  public incrementPayedTime(event: { incrementIndexes: any, newDayToUpdate: any, oldDayToUpdate: any }): void {
    //Remove duplicates from incrementIndexes
    const incrementSet = new Set();
    event.incrementIndexes = event.incrementIndexes.filter((increment: any) => {
      const duplicate = incrementSet.has(increment.index);
      incrementSet.add(increment.index);
      return !duplicate;
    });
    this.detailsTempsPayeComponent.updateTempsPayeWeek(this.displayPlgManagers, event.incrementIndexes, JSON.parse(JSON.stringify(this.debutJourneeActivite)), this.dayToUpdateInDetailedPayedTime, false, event.oldDayToUpdate, event.newDayToUpdate);
  }

  /**
   * Methode permet de gerer le changement de l'affichage (afficher / cacher les plannings managers / leader)
   */
  public displayHidePlgManagers(): void {
    if (!this.displayPlgHebdo) {
      if (this.managersShifts.length) {
        this.notificationService.startLoader();
        setTimeout(() => {
          this.getDataToDisplayHideML();
          this.notificationService.stopLoader();
        }, 1000);
      }
    } else {
      this.displayPlgManagers = !this.displayPlgManagers;
    }
  }

  public displayHidePlgHebdo(displayPlgHebdo: boolean): void {
    this.displayPlgManagers = false;
    this.showMoe = this.performMode !== 'MOE';
    this.changePlgHebdo = true;
    // this.selectedDate = this.calendarDate;
    if(displayPlgHebdo){
      if (!this.canDeactivate()) {
        this.saveContentBeforeDeactivation(0, displayPlgHebdo);
      } else {
        this.selectDate(new Date(this.selectedDate));
        this.displayPlgHebdo = true;
        this.changePlgHebdo = false;
        this.getTauxMoeByDay();
      }
   } else {
     if(!this.canDeactivateVueHebdo()){
       this.plgHebdoComponent.saveContentBeforeDeactivation(this.disablePlgHebdo.bind(this));
    } else {
      this.displayPlgHebdo = false;
      this.changePlgHebdo = false;
      this.getSelectedRestaurant();
     }
   }
  }
  displayHebdoAfterDeactive(event: boolean): void{
    if(this.changePlgHebdo){
      this.displayPlgHebdo = event;
      this.changePlgHebdo = false;
      if(!this.displayPlgHebdo){
        this.getSelectedRestaurant();
      }
    }
  }

  public saveHebdoDataAndChangeView(config: {awayNavigation: boolean, operation: Function}): void {
    this.saveGlobale(0, this.changePlgHebdo ? !this.displayPlgHebdo : this.displayPlgHebdo, config.awayNavigation, config.operation);
    this.disablePlgHebdoIfNoPopUpConstraints(() => config.operation());
  }

  private disablePlgHebdo(): boolean {
    return this.displayPlgHebdo = false;
  }

  private disablePlgHebdoIfNoPopUpConstraints(callback: Function): void {
    setTimeout(() => {
      if (!this.plgHebdoComponent.popupVerificationContrainteGlobaleVisibility) {
        callback();
      }
    }, 300);
  }

  /**
   * recuperer le list de planning hebdo du semaine precedente
   */
  public downWeekDate(): void {
    this.downDate = true;
    this.upDate = false;
    this.updateOrDownDate();
  }

  /**
   *recuperer le list de planning hebdo du semaine suivante
   */
  public upWeekDate(): void {
    this.upDate = true;
    this.downDate = false;
    this.updateOrDownDate();
  }

  public checkDataAndChangeDate(operation: Function, ...args: any[]): void {
    if (!this.canDeactivateVueHebdo()) {
      this.plgHebdoComponent.saveContentBeforeDeactivation(operation.bind(this, ...args), operation.bind(this, ...args));
    } else {
      const day = 60 * 60 * 24 * 1000;
      this.sessionService.setDateSelected((new Date( this.dateFin.getTime() + day)).toDateString());
      operation.call(this, ...args);
    }
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
    this.selectedDate = start;
    this.weekNumber = this.getWeekNumber(this.dateDebut);
    this.sessionService.setDateSelected(this.dateDebut.toDateString());
    // this.sessionService.setCurrentWeek(this.weekSelected);
    // this.sessionService.setCurrentYear(this.dateDebut.getFullYear().toString());
    // this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.dateDebut, 'YYYY-MM-DD'));
    // this.findAllEmployeActifWithGroupTravailsPlgManager();
    // this.changeDate = false;
    this.getWeeksByMonthByRestaurant(this.dateDebut);
  }

  public closeAddShift() {
    this.showAddShiftPopup = false;
  }

  /**
   * Mettre à jour la liste des employées après un ajout
   * @param: event evenement transmis par le composant planning-jour
   */
  public updateEmployees(event: { employee: EmployeeModel, index: number, confirmAdd: boolean }) {
    if (this.showEmployeeDetails) {
      if (event.confirmAdd) {
        this.employees.splice(event.index, 1);
      }
      this.employees.splice(event.index, 0, event.employee);
    }
  }

  public updateSortedEmployeeList(event: any): void {
    if (event.length === this.employees.length) {
      this.employees = event;
    }
    this.getEmployeesIndisponibilitiesAndTotalAbsences();
  }

  /**
   * Check des contraintes sociales à l'assignement d'un employé
   */
  public checkContraintesInAssignEmployee(event: ShiftModel) {
    this.employeeToAssign = event.employee;
    this.hiddenSaveGlobale = false;
    const checkContrainte = event.employee && event.employee.idEmployee !== null;
    if (this.checkContrainteAndCalculTotalShiftPerDay(checkContrainte, event, true)) {
      this.updateShiftAfterAssignEmployee();
      const employeeToUpdateIndex = this.employees.findIndex(employe => this.employeeToAssign && (employe.idEmployee === this.employeeToAssign.idEmployee));
      if (employeeToUpdateIndex === -1) {
        this.planningsJour.toArray()[0].employees.splice(this.index, 1);
        this.planningsJour.toArray()[0].employees.splice(this.index, 0, this.employeeToAssign);
        this.planningsJour.toArray()[0].employeeToAdd = null;
      }
      this.getEmployeesIndisponibilitiesAndTotalAbsences();
    } else {
      this.updateListShiftToSave();
    }
  }

  /**
   *
   * modification de la list shiftToSave
   */
  private updateListShiftToSave(): void {
    this.listShiftToSave.forEach(shiftToSave => {
      const employee: EmployeeModel = new EmployeeModel();
      employee.nom = null;
      employee.prenom = null;
      employee.hebdoCourant = null;
      employee.hebdoPlanifie = null;
      employee.idEmployee = null;
      shiftToSave.employee = employee;
      const indexShiftToUpdateInListShift = this.listShift.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
      if (indexShiftToUpdateInListShift !== -1) {
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShift, this.listShift, shiftToSave,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
      }
      const indexShiftToUpdateInListShiftJour = this.planningsJour.toArray()[0].listShift.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
      if (indexShiftToUpdateInListShiftJour !== -1) {
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShiftJour, this.planningsJour.toArray()[0].listShift, shiftToSave,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
      }
    });

    this.popupVerificationContrainteVisibility = true;
  }

  public updateShiftsToUpdate(event: any) {
    this.index = event.index;
    this.listItemToUpdate = event.listItemToUpdate;
    if (event.shiftToUpdate.length) {
      this.listShiftToSave = JSON.parse(JSON.stringify(event.shiftToUpdate));
      this.listShiftToSave.forEach(shift => {
        shift.heureFin = new Date(Date.parse(shift.heureFin));
        shift.heureDebut = new Date(Date.parse(shift.heureDebut));
        shift.heureFinCheval = !shift.heureFinCheval ? shift.heureFin : new Date(Date.parse(shift.heureFinCheval));
        shift.heureDebutCheval = !shift.heureDebutCheval ? shift.heureDebut : new Date(Date.parse(shift.heureDebutCheval));
        this.dateService.setCorrectTimeToDisplayForShift(shift);
      });
      if (event.shiftChild) {
        this.listShiftByWeek(this.selectedDate, event.shiftToUpdate[0].employee.uuid, event.shiftToUpdate);
        this.verifContrainteEmploye(event.shiftToUpdate[0], null, event.shiftChild);
      } else {
        // event.shiftToUpdate.forEach((shift: any) => {
        //   this.shiftToSave = {...shift};
        this.updateShiftAfterAssignEmployee(event.idEmployee);
        // });
      }
    }
  }

  /**
   * Enregistrer shift si aucune contrainte bloquante
   */
  public save() {
    if (!this.getBlockedConstraint()) {
      if (this.employeeToAssign) {
        this.listShiftToSave.forEach((shiftToSave: ShiftModel) => shiftToSave.employee = this.employeeToAssign);

        this.updateShiftAfterAssignEmployee();
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(this.shiftHasAnomalieContraintSocial.idShift, this.listContrainte, this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
        const employeeToUpdateIndex = this.employees.findIndex(employe => this.employeeToAssign && (employe.idEmployee === this.employeeToAssign.idEmployee));
        if (employeeToUpdateIndex === -1) {
          this.planningsJour.toArray()[0].employees.splice(this.index, 1);
          this.planningsJour.toArray()[0].employees.splice(this.index, 0, this.employeeToAssign);
          this.getEmployeesIndisponibilitiesAndTotalAbsences();
          this.employeeToAssign = null;
        }
        this.employeeToAssign = null;
      } else if (this.oldItemData) {
        this.updateResizeShift(this.oldItemData);
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(this.shiftHasAnomalieContraintSocial.idShift, this.listContrainte, this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
      } else if (this.buttonLabel === this.translator.translate('PLANNING_EQUIPIER.UPDATE_BUTTON')) {
        this.updateShift();
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(this.shiftHasAnomalieContraintSocial.idShift, this.listContrainte, this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
      } else if (this.buttonLabel === this.translator.translate('PLANNING_EQUIPIER.ADD_BUTTON')) {
        this.addNewShift();
        this.addShiftComponent.shiftform.reset();
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(this.shiftHasAnomalieContraintSocial.idShift, this.listContrainte, this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
      }
      this.popupVerificationContrainteVisibility = false;
    } else {
      this.popupVerificationContrainteVisibility = true;
      this.showAddShiftPopup = false;
    }
  }

  /**
   * s'il y a une contrainte bloquante, on ne peut pas ajouter un shift
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
  public closePopup() {
    this.popupVerificationContrainteVisibility = false;
    this.popupVerificationContrainteGlobaleVisibility = false;
    this.popupVerificationCsMaxShift = false;
    this.oldItemData = null;
    this.showPopupRapport = false;
    this.copyEvent = false;
  }

  /**
   * Ouvrir Popup save day/week as reference
   */
  public async openSaveReferencePopup(): Promise<void> {
    if(!this.displayPlgHebdo) {
      this.getReferenceList();
      this.choosenDayReferenceDeletedLibelleError = false;
      this.variableTabReference.selected = true;
      this.variableTabDelete.selected = false;
      this.popupTitle = this.translator.translate('PLANNING_REFERENCE.TAB_TITLE');
      this.showSaveReferencePopup = true;
      this.selectedValue = false;
      this.saveReferenceForm.reset();
      this.isSubmitted = false;
      this.saveReferenceForm.get('referenceList').valueChanges.subscribe((refSelected: PlanningJourReferenceModel) => {
        if (refSelected) {
          this.saveReferenceForm.controls['referenceName'].setValue(refSelected.libelle);
        }
      });
      this.saveReferenceForm.get('referenceName').valueChanges.subscribe((refName: string) => {
        if (refName) {
          this.refExist = this.shiftReferenceList.some((reference: PlanningJourReferenceModel) => reference.libelle === refName);
          if (!this.refExist) {
            this.saveReferenceForm.controls['referenceList'].setValue(null);
          }
        }
      });
    }else{
      this.plgHebdoComponent.openSaveReferencePopup();

    }
  }

  /**
   * Cette methode permet d'ouvrir la popup de charger jour/semaine de reference
   */
  public async openChargerReferencePopup(): Promise<void> {
    if (this.updateButtonControl()) {
      if (!this.lockState) {
        if (!this.displayPlgHebdo) {
          this.choosenJourReference = {semaine: false};
          this.choosenJourReferenceLibelleError = false;
          this.getReferenceList(true);
        }else{
          this.plgHebdoComponent.openChargerReferencePopup();
        }
      } else {
        this.planningLockService.showPopOfLockedWeek();
      }
    }
  }

  public prepareToLoadJourReference(): void {
    if (!this.choosenJourReference.libelle) {
      this.choosenJourReferenceLibelleError = true;
    } else {
      if (this.choosenJourReference.semaine) {
        // check if there is shifts in current day
        if (this.listShift.length) {
          this.displayDialogChargerReferenceToKeepOrReplaceShifts();
        } else {
          // check if there is shifts in whole week
          this.checkIfThereIsShiftsForCurrentWeek();
        }
      } else {
        // check if there is shifts in current day
        if (this.listShift.length) {
          this.displayDialogChargerReferenceToKeepOrReplaceShifts();
        } else {
          this.chargerJourReference(false);
        }
      }
    }
  }

  public ecraserShiftsForReference(): void {
    this.overwriteShifsReference = 1;
    this.showChargerJourReferencePopup = false;
    this.displayDialogChargerReference = false;
    setTimeout(() => this.displayDialogChargerReference = true, 100);
    this.displayPlgManagers = false;
    this.chargerJourReference(false);
  }

  public keepShifstForReference(): void {
    this.overwriteShifsReference = 0;
    this.showChargerJourReferencePopup = false;
    this.displayDialogChargerReference = false;
    setTimeout(() => this.displayDialogChargerReference = true, 100);
    this.chargerJourReference(true);
  }

  /**
   * Pop up for confirmation d'ecrasement reference'
   */
  public ecraserReferenceConfirmation() {
    this.confirmationService.confirm({
      message: this.translator.translate('PLANNING_EQUIPIER.REFERENCE_POPUP_MESSAGE'),
      acceptLabel: this.translator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveDayWeekAsReference();
      },
      reject: () => {
      }
    });
  }

  /**
   * check if reference alreday exists in list
   */
  public checkReferenceExistance() {
    this.refExist ? this.ecraserReferenceConfirmation() : this.saveDayWeekAsReference();
  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDeleteReference(): void {
    if (!this.choosenDayReferenceToDelete.libelle) {
      this.choosenDayReferenceDeletedLibelleError = true;
    } else {
      this.confirmationService.confirm({
        message: this.translator.translate('POPUPS.DELETE_MESSAGE'),
        header: this.translator.translate('POPUPS.DELETE_HEADER'),
        acceptLabel: this.translator.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.translator.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.deleteReferenceExistance();
        },
        reject: () => {
        }
      });
      this.choosenDayReferenceDeletedLibelleError = false;

    }
  }

  /**
   * delete reference exists in list
   */
  public deleteReferenceExistance() {
    this.planningReferenceService.deleteDayOrWeekAsReference(this.choosenDayReferenceToDelete.uuid).subscribe(res => {
        const index = this.shiftReferenceList.findIndex((reference: PlanningJourReferenceModel) => reference.idPlanningJourReference === this.choosenDayReferenceToDelete.idPlanningJourReference);
        if (index !== -1) {
          this.shiftReferenceList.splice(index, 1);
        }
        this.notificationService.showSuccessMessage('CONTRAT.DELETE_SUCCESS');
      }
    );
    this.showSaveReferencePopup = false;
    this.choosenDayReferenceDeletedLibelleError = false;
    this.choosenDayReferenceToDelete = new VerificationContrainteModel();
  }

  /**
   * Cette méthode permet de récupérer la liste des journées/semaines de référence
   */
  public getReferenceList(openChargerJourReference?: boolean) {
    this.notificationService.startLoader();
    this.planningReferenceService.getReferenceList().subscribe((result: PlanningJourReferenceModel[]) => {
      this.notificationService.stopLoader();
      if (result) {
        this.shiftReferenceList = result.filter(val => val.libelle !== null);
        if (openChargerJourReference) {
          this.showChargerJourReferencePopup = true;
        }
      }
    }, error => {
      this.notificationService.stopLoader();
      console.log('error ', error);
      this.shiftReferenceList = [];
    });
  }

  /**
   * Cette méthode permet de sauvegarder une journée/semaine comme référence
   */
  public saveDayWeekAsReference() {
    this.isSubmitted = true;
    const data = {
      'libelle': this.saveReferenceForm.controls['referenceName'].value,
      'semaine': this.selectedValue,
      'dateJournee': this.calendarDate,
      'dateDebut': null,
      'dateFin': null
    };
    if (this.saveReferenceForm.valid) {
      this.planningReferenceService.addUpdateDayOrWeekAsReference(data).subscribe(res => {
          this.notificationService.showSuccessMessage('PLANNING_EQUIPIER.SAVE_REFERENCE_MESSAGE');
        }, console.log
      );
      this.showSaveReferencePopup = false;
      this.isSubmitted = false;
      this.existanceErrorMessage = '';
    }
  }

  ngOnDestroy(): void {
    // this.sessionService.setDateSelected(null);
  }

  private getParamRestaurantByCodeNames(): void {
    const codeNamesAsArray = [this.MIN_BEFORE_COUPURE_CODE_NAME, this.PERFORM_MODE_CODE_NAME, this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    this.parametreService.getParamRestaurantByCodeNames(codeNames).subscribe(
      (data: ParametreModel[]) => {
        this.getParamRestaurantMinBeforeCoupur(data);
        this.getParamRestaurantIndicateurPerformance(data);
        this.getDisplayMode24H(data);
      }
    );
  }

  private deleteListShifts(offset: number): void {
    if (this.listShiftToDelete.length > 0) {
      this.listShiftToDelete = [];
      this.displaySuccesUpdateMessage();
      this.goToNewDate(offset);
    } else {
      this.goToNewDate(offset);
    }
  }


  /**
   * recuperer tous les jours feries par restaurant
   */
  private getJourFeriesByRestaurant() {
    this.joursFeriesServie.getAllJourFeriesByRestaurantAndDate(new Date(this.selectedDate)).subscribe((data: JourFeriesModel[]) => {
        this.listJourFeriesByRestaurant = data;
      },
    );
  }

  /**
   * Cette methode permet de retourner le découpage horaire d'un restaurant
   */
  private requestDataFromMultipleSources(): Observable<{ debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }> {
    const response1 = this.decoupageHoraireService.getDebutJourneePhase();
    const response2 = this.decoupageHoraireService.getFinJourneePhase();
    return forkJoin({
      debutJournee: response1,
      finJournee: response2
    });
  }

  public backToHomePlanning(): void {
    this.sessionService.setResetPlanningCalendar(false);
    this.router.navigateByUrl(this.rhisRoutingService.getRoute('HOME_PLANNING'));
  }

  /**
   * Cette méthode permet de récupérer le restaurant selectionné
   */
  private getSelectedRestaurant(): void {
    this.notificationService.startLoader();
    this.restaurantService.getRestaurantWithPaysAndTypeRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.notificationService.stopLoader();
        this.sharedRestaurant.selectedRestaurant = data;
        this.initDateAndCalender();
        this.getDecoupageHoraire();
        this.getParamNationauxByRestaurant();
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Récupérer l'heure limite du travil du restaurant
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
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette méthode permet d'initialiser le Calendrier
   */
  private setCalendar(): void {
    this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    this.jourFinWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.dernierJourWeekend;
    this.jourDebutWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourWeekend;
    this.heureDebutWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureDebutWeekend);
    this.heureFinWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureFinWeekend);
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    this.weekNumber = +this.sessionService.getCurrentWeek();
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

  private checkContraintesInAddUpdate(event: any) {
    const result = this.plgEquipierHelperService.getShiftToSaveOrUpdate(event, this.copyEvent, this.selectedDate);
    event = result.event;
    this.hiddenSave = false;
    this.shiftToSave = {...result.shiftFormat};
    const checkContrainte = this.shiftToSave.employee && this.shiftToSave.employee.idEmployee !== null;
    if (this.shiftService.canAddUpdateShift(this.shiftToSave, this.listShift, this.copyEvent)) {
      if (this.checkContrainteAndCalculTotalShiftPerDay(checkContrainte, this.shiftToSave)) {
        if (this.buttonLabel === this.translator.translate('PLANNING_EQUIPIER.UPDATE_BUTTON')) {
          this.updateShift();
          this.listShift = this.shiftService.filterShifts(this.listShift, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
          this.planningEquipieService.setListShift(this.listShift);
        } else {
          this.addNewShift();
          this.addShiftComponent.shiftform.reset();
        }
      } else {
        this.popupVerificationContrainteVisibility = true;
      }
    } else {
      this.showAddShiftPopup = true;
      if (this.buttonLabel === this.translator.translate('PLANNING_EQUIPIER.UPDATE_BUTTON')) {
        this.overlapPopupMessage = this.translator.translate('PLANNING_EQUIPIER.CHEVAUCHEMENT_UPDATE_POPUP_TITLE');
      } else {
        this.overlapPopupMessage = this.translator.translate('PLANNING_EQUIPIER.CHEVAUCHEMENT_ADD_POPUP_TITLE');
      }
      this.showOverlapErrorMessage = true;
    }
  }

  public filterActiveEmployeesAndAddShiftSign(): void {
    this.listLeaderMangerWeekShifts = [];
    this.planningsJour.toArray()[0].newEmployees = this.activeEmployeesPerWeek;
    const result = this.plgEquipierHelperService.addSigneToListShift(this.activeEmployeesPerWeek, this.listShift, this.listLeaderMangerWeekShifts, this.frConfig, this.decoupageHoraireFinEtDebutActivity, this.selectedDate);
    ['activeEmployeesPerWeek', 'listShift', 'listLeaderMangerWeekShifts'].forEach(item => this[item] = result[item]);
    this.planningEquipieService.setListShift(this.listShift);
    this.newActiveEmployees = this.plgEquipierHelperService.filterActiveEmployeesInDay(this.activeEmployeesPerWeek, this.selectedDate);
    this.employeesToAdd = this.newActiveEmployees;
    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(this.newActiveEmployees, this.activeEmployeesPerWeek, this.displayPlgManagers);
    if (this.selectedEmployee) {
      this.getEmployeeSummary();
    }
    this.getEmployeesIndisponibilitiesAndTotalAbsences();
    this.notificationService.stopLoader();
  }

  /**
   * Cette méthode permet d'identifier la fin/début activité de la journée
   */
  private getDecoupageHoraire() {
    this.getWeeksByMonthByRestaurant(this.calendarDate);
    this.calendarDate.setHours(12);
    this.requestDataFromMultipleSources().subscribe((res: { debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }) => {
      this.decoupageHoraireFinEtDebutActivity = res;
      this.getParamRestaurantByCodeNames();
      const index = this.calendarDate.getDay();
      const dayName = this.dateService.convertDayNames(index);
      const filteredDecoupageFin = Object.keys(res['finJournee']).filter(val => val.includes(dayName));
      this.finJourneeActivite = {
        value: res.finJournee[filteredDecoupageFin[0]],
        night: res.finJournee[filteredDecoupageFin[1]]
      };
      const filteredDecoupage = Object.keys(res['debutJournee']).filter(val => val.includes(dayName));
      this.debutJourneeActivite = {
        value: res.debutJournee[filteredDecoupage[0]],
        night: res.debutJournee[filteredDecoupage[1]]
      };
      this.synchroPlanningEquipierService.setDecoupage(<DecoupagePlanningEquipier>{
        start: this.debutJourneeActivite,
        end: this.finJourneeActivite,
        date: this.selectedDate
      });
      const result = this.plgEquipierHelperService.getHours(this.debutJourneeActivite, this.finJourneeActivite);
      ['hours', 'endMinutesCells', 'startMinutesCells', 'minutesToSubstructFin', 'gridLimit', 'backgroundRowColor'].forEach(item => this[item] = result[item]);
      this.listShiftByDay();
    });
  }

  private getDataToDisplayHideML(): void {
    this.dayToUpdateInDetailedPayedTime = null;
    this.displayPlgManagers = !this.displayPlgManagers;
    if (!this.displayPlgHebdo) {
      if (this.displayPlgManagers) {
        if (this.selectedEmployee) {
          this.closeEmployeeWeekPlanning();
        }
        this.removeOldEquiShifts();
        if (this.managersShifts.length === 0) {
          this.planningEquipieService.setListShift(this.listShift);
          this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, true);
        } else {
          const listManager = [];
          this.managersShifts.forEach((shift: ShiftModel) => {
            this.notificationService.startLoader();
            if (shift.employee.contrats.length) {
              this.dateService.setCorrectTimeToDisplayForShift(shift);
              listManager.push(shift.employee);
            }
          });
          this.setManagerListShift(listManager, this.managersShifts);

        }
        this.getEmployeesIndisponibilitiesAndTotalAbsences();
        // calcul du temps payé heure par heure pour les shifts manager/leader (cas affichage M/L)
        const listPositions = [];
        this.formatManagerLeaderShifts();
        this.listLeaderMangerWeekShifts.forEach((shiftLeaderManager: ShiftModel) => {
          const x = this.plgEquipierHelperService.convertStartTimeToPosition(shiftLeaderManager.heureDebut, shiftLeaderManager.heureDebutIsNight, this.debutJourneeActivite, shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight);
          const cols = this.plgEquipierHelperService.convertDurationToColsNumber(shiftLeaderManager.heureDebut, shiftLeaderManager.heureDebutIsNight,
            shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight);
          listPositions.push({position: x, colsNumber: cols, dateToUpdate: this.clone(shiftLeaderManager.dateJournee)});
          if (shiftLeaderManager.acheval) {
            const colsNextDay = this.plgEquipierHelperService.convertDurationToColsNumber(shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight,
              shiftLeaderManager.heureFinCheval, shiftLeaderManager.heureFinChevalIsNight);
            listPositions.push({
              position: 0,
              colsNumber: colsNextDay,
              dateToUpdate: this.clone(new Date(shiftLeaderManager.dateJournee.getTime() + (24 * 60 * 60 * 1000)))
            });
          }
        });
        this.planningsJour.toArray()[0].calculatePayedTimeManager(listPositions);
      } else {
        if (this.selectedEmployee && (this.selectedEmployee.groupeTravail.plgMgr || this.selectedEmployee.groupeTravail.plgLeader)) {
          this.showEmployeeDetails = false;
          this.selectedEmployee = null;
        }
        const listShiftToDelete = this.listShift.filter((shift: ShiftModel) => shift.fromPlanningManager);
        listShiftToDelete.forEach((item: ShiftModel) => {
          const index = this.employees.findIndex((emp: EmployeeModel) => emp.idEmployee === item.employee.idEmployee);
          if (index !== -1) {
            this.employees.splice(index, 1);
          }
        });
        this.employees = [...this.employees];
        this.listShift = [...this.listShift.filter((shift: ShiftModel) => !shift.fromPlanningManager)];
        this.planningEquipieService.setListShift(this.listShift);
        if (this.shiftToRestore.length === 0) {
          this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, false);
        } else {
          this.shiftToRestore.forEach((shift: ShiftModel) => {
            this.dateService.setCorrectTimeToDisplayForShift(shift);
            this.shiftToSave = shift;
            this.setNewShiftToListShift({restoreOnly: true});
          });
        }
        this.getEmployeesIndisponibilitiesAndTotalAbsences();
        // calcul du temps payé heure par heure pour les shifts manager/leader (cas suppression M/L)
        let listPositionToRemove = [];
        this.formatManagerLeaderShifts();
        this.listLeaderMangerWeekShifts.forEach((shiftLeaderManager: ShiftModel) => {
          const x = this.plgEquipierHelperService.convertStartTimeToPosition(shiftLeaderManager.heureDebut, shiftLeaderManager.heureDebutIsNight, this.debutJourneeActivite, shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight);
          const cols = this.plgEquipierHelperService.convertDurationToColsNumber(shiftLeaderManager.heureDebut, shiftLeaderManager.heureDebutIsNight,
            shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight);
          listPositionToRemove.push({
            position: x,
            colsNumber: cols,
            dateToUpdate: this.clone(shiftLeaderManager.dateJournee)
          });
          if (shiftLeaderManager.acheval) {
            const colsNextDay = this.plgEquipierHelperService.convertDurationToColsNumber(shiftLeaderManager.heureFin, shiftLeaderManager.heureFinIsNight,
              shiftLeaderManager.heureFinCheval, shiftLeaderManager.heureFinChevalIsNight);
            listPositionToRemove.push({
              position: 0,
              colsNumber: colsNextDay,
              dateToUpdate: this.clone(new Date(shiftLeaderManager.dateJournee.getTime() + (24 * 60 * 60 * 1000)))
            });
          }
        });
        this.planningsJour.toArray()[0].calculatePayedTimeManager(null, listPositionToRemove);
      }
    }
  }

  private formatManagerLeaderShifts(): void {
    this.listLeaderMangerWeekShifts.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      if (shift.employee) {
        shift.idDefaultEmploye = this.clone(shift.employee.idEmployee);
      }
    });
  }

  private removeOldEquiShifts(): void {
    this.shiftToRestore = [];
    // list shiftToRestore contient les shifts équipiers d'un employé qui avait un contrat manager ou leader
    // exemple: un manager ayant deux shifts sur lundi/mardi, on change son gpe de travail à équipier lundi,
    // puis on ajoute un shift équipier mardi => lors de l'ouverture du plg on trouve affiché les shifts équipiers
    // lors du clique sur M/L => les shifts équipiers seront stockés(supprimé du plg) dans la liste "shiftToRestore" et remplacés par les shifts
    // manager grisés
    this.shiftToRestore = this.listShift.filter((sh: ShiftModel) => sh.notActifEquip);
    const employeesToRemove = this.shiftToRestore.map((sh: ShiftModel) => sh.employee);
    this.employees = [...this.employees.filter(function (item: EmployeeModel) {
      return employeesToRemove.indexOf(item) === -1;
    })];
    this.listShift = [...this.listShift.filter((sh: ShiftModel) => !sh.notActifEquip)];
    this.planningEquipieService.setListShift(this.listShift);
    // delete temps payé ( tableau heure par heure de la semaine) des shift to restore
    this.shiftToRestore.forEach((item: ShiftModel) => {
      const x = this.plgEquipierHelperService.convertStartTimeToPosition(item.heureDebut, item.heureDebutIsNight, this.debutJourneeActivite, item.heureFin, item.heureFinIsNight);
      const cols = this.plgEquipierHelperService.convertDurationToColsNumber(item.heureDebut, item.heureDebutIsNight,
        item.heureFin, item.heureFinIsNight);
      this.dayToUpdateInDetailedPayedTime = this.clone(item.dateJournee);
      this.planningsJour.toArray()[0].calculatePayedTime(x, cols, null, null);
    });
  }

  // Modification d'un shift via popup
  private updateShift() {
    this.shiftToSave.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
    this.updateShiftAfterSave();
  }

  // Modification d'un shift via resize/ drag and drop
  private updateResizeShift(oldItemData: GridsterItem) {
    this.shiftToSave.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
    if (this.copyEvent) {
      this.addNewShift();
    } else {
      this.updateShiftResizeAfterSave(oldItemData);
    }
  }

  private addNewShift() {
    this.shiftToSave.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
    this.shiftToSave.shiftPrincipale = true;
    this.setNewShiftToListShift({});
  }


  /**
   * Vérification des contrainte sociale dans le cas de resize / drag and drop
   */
  private checkContraintesInUpdateResize(shift: any, oldItemData: GridsterItem) {
    this.shiftToSave = {...shift};
    this.oldItemData = {...oldItemData};
    const checkContrainte = this.shiftToSave.employee && this.shiftToSave.employee.idEmployee !== null;
    if (this.copyEvent) {
      shift = this.getShiftToCopy(shift, oldItemData);
    }
    if (!shift.acheval) {
      this.listShift.forEach((val: ShiftModel) => {
        if (val.acheval && !val.modifiable) {
          this.dateService.setCorrectTimeToDisplayForShift(val, this.selectedDate);
        }
      });
    }
    if (this.checkContrainteAndCalculTotalShiftPerDay(checkContrainte, this.shiftToSave)) {
      // Pas de CS surmontés => on copie le shift
      if (this.copyEvent) {
        this.addNewShift();
      } else {
        this.updateResizeShift(oldItemData);
      }
    } else {
      this.popupVerificationContrainteVisibility = true;
      this.undoResize(oldItemData);
    }
  }

  /**
   * recuperer le shift aprés la copie
   * @param shift
   * @param oldItemData
   */
  private getShiftToCopy(shift: any, oldItemData: GridsterItem): any {
    shift.employeePosition = oldItemData.y;
    shift.assignedShift = false;
    shift.hasAssociatedShifts = !this.updateVueSemaine ? oldItemData.hasAssociatedShifts : null;
    shift.dragEnabled = oldItemData.dragEnabled;
    shift.resizeEnabled = oldItemData.resizeEnabled;
    shift.positionDeTravail = shift.positionTravail;
    return shift;
  }

  public updateEmployeeSummary(event: any): void {
    this.diffCols = event.diffCols;
    this.employeeSummary = JSON.parse(JSON.stringify(event.employeToUpdate));
    if (!this.diffCols && this.employeeSummary) {
      this.getEmployeeSummary(this.diffCols);
    }
  }

  /**
   * modifier shift dans la list  et dans la map
   * recuperer la list qu'on va enregistrer (listShiftToUpdate)
   */
  private updateShiftAfterSave() {
    delete this.shiftToSave.shiftFromAbsence;

    this.shiftToSave = this.shiftService.filterShifts([this.shiftToSave], this.frConfig, this.decoupageHoraireFinEtDebutActivity)[0];
    this.listShiftWithSignForWeekOrDay = JSON.parse(JSON.stringify(this.listShiftWithSign));
    const x = this.plgEquipierHelperService.convertStartTimeToPosition(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight, this.debutJourneeActivite, this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    const cols = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight,
      this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    // Si l'employee est null, on ajoute une ligne avec une liste déroulante à la première position dans la grille, sinon on ajoute
    // le nouveau shift à l'employée sélectionné
    let employee: EmployeeModel = null;
    let employeePosition = 3;
    const employeeToUpdateIndex = this.employees.findIndex(employe => this.shiftToSave.employee && (employe.idEmployee === this.shiftToSave.employee.idEmployee));
    if (this.shiftToSave.employee && this.shiftToSave.employee.idEmployee !== null && employeeToUpdateIndex !== -1) {
      employeePosition = employeeToUpdateIndex * 3;
      employee = this.shiftToSave.employee;
    } else if (this.shiftToSave.employee === null && this.shiftToSave.employeePosition) {
      employeePosition = this.shiftToSave.employeePosition;
      employee = new EmployeeModel();
      employee.nom = null;
      employee.prenom = null;
      employee.hebdoCourant = null;
      employee.hebdoPlanifie = null;
      employee.idEmployee = null;
    } else if (this.shiftToSave.employee && employeeToUpdateIndex === -1 && !this.shiftToSave.assignedShift && !this.shiftToSave.hasAssociatedShifts) {
      employeePosition = this.shiftToSave.employeePosition;
      employee = this.shiftToSave.employee;
      employee.isAffected = true;
      this.planningsJour.toArray()[0].employeeToAdd = this.shiftToSave.employee.idEmployee;
      this.planningsJour.toArray()[0].confirmAddEmployee(employeePosition / 3, true, this.shiftToSave);
      this.planningsJour.toArray()[0].employeeToAdd = null;
    } else {
      employee = this.shiftToSave.employee;
      this.addEmployee(true, this.shiftToSave.employee);
    }

    this.shiftToAdd = {
      x: x,
      y: employeePosition,
      positionCopy: employeePosition,
      cols: cols,
      oldCols: cols,
      rows: 2,
      label: this.planningHourLabelFulldayService.getShiftLabelValue(this.shiftToSave, this.modeAffichage),
      color: this.shiftToSave.positionTravail.couleur,
      textColor: this.brightnessColorShiftService.codeColorTextShift(this.shiftToSave.positionTravail.couleur),
      iconEditShift: this.brightnessColorShiftService.icontShift(this.shiftToSave.positionTravail.couleur),
      timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(this.shiftToSave, this.modeAffichage),
      isShift: true,
      idShift: this.shiftToSave.idShift,
      employee: employee,
      selectedEmployee: employee,
      selectedShift: this.shiftToSave,
      hdd: this.shiftToSave.heureDebut,
      hdf: this.shiftToSave.heureFin,
      heureDebutIsNight: this.shiftToSave.heureDebutIsNight,
      heureFinIsNight: this.shiftToSave.heureFinIsNight,
      dragEnabled: this.shiftToSave.dragEnabled,
      resizeEnabled: this.shiftToSave.resizeEnabled,
      dateJournee: this.shiftToSave.dateJournee,
      shiftPrincipale: this.shiftToSave.oldShiftData ? this.shiftToSave.oldShiftData.shiftPrincipale : this.shiftToSave.shiftPrincipale,
      canUpdate: true,
      acheval: this.shiftToSave.acheval,
      modifiable: this.shiftToSave.modifiable
    };
    if (!employee.isAffected) {
      // update weekly employee shifts
      if (employee && employee.idEmployee !== null) {
        if (!employee.weekDetailsPlannings.length) {
          employee = this.newActiveEmployees.find(val => val.idEmployee === employee.idEmployee);
        }
        const indexDayToUpdateInWeeklyPlg = employee.weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd'));
        //Cas de modification d'un shift à un autre employé => remove updated shift from old emplyee weekly list shift
        if (this.shiftToSave.oldShiftData && this.shiftToSave.oldShiftData.employee && this.shiftToSave.oldShiftData.employee.idEmployee !== employee.idEmployee) {
          const oldEmployeeIndex = this.newActiveEmployees.findIndex(val => val.idEmployee === this.shiftToSave.oldShiftData.employee.idEmployee);
          if (oldEmployeeIndex !== -1) {
            const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
            if (indexShiftToUpdateInListShiftWeek !== -1) {
              this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
            }
          }
        }

        this.shiftToSave.employee.weekDetailsPlannings = [];
        if (indexDayToUpdateInWeeklyPlg !== -1) {
          const actifEmployeeToUpdate = this.newActiveEmployees.findIndex(val => val.idEmployee === this.shiftToSave.employee.idEmployee);
          if (actifEmployeeToUpdate !== -1) {
            const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
            if (indexShiftToUpdateInListShiftWeek !== -1) {
              this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
              this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...this.shiftToSave});
            } else {
              this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...this.shiftToSave});
            }
            const indexShiftToReplace = this.newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === this.shiftToSave.idShift);
            if (indexShiftToReplace !== -1) {
              this.newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.splice(indexShiftToReplace, 1);
              this.newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.push({...this.shiftToSave});
            } else {
              this.newActiveEmployees[actifEmployeeToUpdate].employeeWeekShiftCS.push({...this.shiftToSave});
            }
          }
        }

        const indexShiftToUpdateInListShift = this.listShift.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShift, this.listShift, this.shiftToSave,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);

      } else {
        const indexShiftToUpdateInListShift = this.listShift.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShift, this.listShift, this.shiftToSave,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
        this.oldShiftNonAffecte =
          {
            'valueToSubstruct': this.dateService.getDiffHeure(this.shiftToSave.oldShiftData.heureFin, this.shiftToSave.oldShiftData.heureDebut),
            'valueToAdd': this.dateService.getDiffHeure(this.shiftToSave.heureFin, this.shiftToSave.heureDebut)
          };
      }

      const indexShiftToUpdate = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
      if (indexShiftToUpdate !== -1) {
        this.plgEquipierHelperService.updateListShift(indexShiftToUpdate, this.listShiftToUpdate, this.shiftToSave,
          this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine, true);
      } else {
        this.listShiftToUpdate.push(this.clone(this.shiftToSave));
      }

      this.planningEquipieService.setListShift(this.listShift);
      this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
      const oldShiftPosition = this.plgEquipierHelperService.convertStartTimeToPosition(this.shiftToSave.oldShiftData.heureDebut, this.shiftToSave.oldShiftData.heureDebutIsNight, this.debutJourneeActivite, this.shiftToSave.oldShiftData.heureFin, this.shiftToSave.oldShiftData.heureFinIsNight);
      const oldColsNumber = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.oldShiftData.heureDebut, this.shiftToSave.oldShiftData.heureDebutIsNight,
        this.shiftToSave.oldShiftData.heureFin, this.shiftToSave.oldShiftData.heureFinIsNight);
      this.dayToUpdateInDetailedPayedTime = this.clone(this.shiftToSave.dateJournee);
      this.planningsJour.toArray()[0].calculatePayedTime(oldShiftPosition, oldColsNumber, x, cols);

    }
    this.shiftToSave = null;
    this.buttonLabel = '';
    this.showAddShiftPopup = false;
    this.showAddShiftPopup = false;
    this.showEmployeeDetails = false;
    this.selectedEmployee = null;
    this.oldShiftNonAffecte = null;
  }

  /**
   * Vérification des contraintes sociales pour un employé (selon son contrat, ses lois ...)
   */
  private verifContrainteEmploye(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    this.getContratByEmployeeActif(event, oldItemData, shiftChild);
  }

  /**
   * recuperer le contrat actif
   */
  private getContratByEmployeeActif(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    let dateOfPlanning = null;
    dateOfPlanning = event.dateJournee ? new Date(event.dateJournee) : new Date(this.selectedDate);
    if (event.employee.idEmployee !== -1) {
      const index = this.newActiveEmployees.findIndex(value => value.idEmployee === event.employee.idEmployee);
      if (index !== -1 && this.newActiveEmployees[index].contrats && this.newActiveEmployees[index].contrats.length !== 0) {
        this.contratActif = this.newActiveEmployees[index].contrats.length === 1 ? this.newActiveEmployees[index].contrats[0] : this.getContratActifInListContrat(index, dateOfPlanning);
        this.tempsTravailPartiel = !!this.contratActif.tempsPartiel;
        this.checkIsFoundJourReposByEmployee(event.employee);
        this.getListShiftByThreeWeek(event, oldItemData, shiftChild);
      } else {
        this.getContratActifWithDisponibilite(event, dateOfPlanning, oldItemData, shiftChild);
      }
    }
  }

  /**
   * recuperer le contrat actif avec leurs disponibilités
   * @param event
   * @param dateOfPlanning
   * @param oldItemData
   * @param shiftChild
   * @private
   */
  private getContratActifWithDisponibilite(event: any, dateOfPlanning: Date, oldItemData?: GridsterItem, shiftChild?: boolean): void {
    this.contratService.getActifContratByEmployeeWithDisponiblite(event.employee.uuid, dateOfPlanning).subscribe(
      (data: any) => {
        this.contratActif = data;
        this.tempsTravailPartiel = !!data.tempsPartiel;
        this.checkIsFoundJourReposByEmployee(event.employee);
        this.getListShiftByThreeWeek(event, oldItemData, shiftChild);
      }
    );
  }

  /**
   * recupere le contrat actif par date de planning
   * @param: index
   * @param: dateOfPlanning
   */
  private getContratActifInListContrat(index: number, dateOfPlanning: Date): any {
    const shifts = [];
    if (this.newActiveEmployees[index].employeeWeekShiftCS && this.newActiveEmployees[index].employeeWeekShiftCS.length) {
      this.newActiveEmployees[index].employeeWeekShiftCS.forEach(val => {
        if (val.employee.employeeWeekShiftCS && val.employee.employeeWeekShiftCS.length) {
          shifts.push({...val});
          val.employee.employeeWeekShiftCS = [];
        } else {
          shifts.push({...val});
        }
      });
    }
    const employeeDisplay = this.clone(this.newActiveEmployees[index]);
    if (shifts && shifts.length) {
      this.newActiveEmployees[index].employeeWeekShiftCS = shifts;
    }
    return this.contrainteSocialeService.getContratByDay(employeeDisplay, dateOfPlanning).contrats[0];
  }

  /**
   * recuprer le jours  de repos de l'employee
   */
  private checkIsFoundJourReposByEmployee(employee: EmployeeModel): void {
    if (!employee.currentSemaineRepos) {
      this.getAllJourReposByEmployee(employee);
    }
  }

  /**
   * Cette methode permet de verifier si  la liste des loi de l'employee existe
   */
  private getEmployeeLaws(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    if (this.listLoiByEmployee.size > 0) {
      if (!this.listLoiByEmployee.has(event.employee.idEmployee)) {
        this.getLawEmployeeUsedInVerificationContraintSocial(event, oldItemData, shiftChild);

      } else {
        this.listLoi = this.listLoiByEmployee.get(event.employee.idEmployee);
        if (oldItemData) {
          this.checkContraintesInUpdateResize(event, oldItemData);
        } else if (shiftChild) {
          this.checkContraintesInAssignEmployee(event);
        } else {
          this.checkContraintesInAddUpdate(event);
        }
      }
    } else {
      this.getLawEmployeeUsedInVerificationContraintSocial(event, oldItemData, shiftChild);
    }
  }

  /**
   * Cette methode permet de verifier si  la liste des loi de groupe de travail existe
   */
  private getGroupeTravailLaws(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    if (this.listLoiByGroupTravail.size > 0) {
      if (!this.listLoiByGroupTravail.has(event.employee.contrats[0].groupeTravail.idGroupeTravail)) {
        this.getLawGroupTravailUsedInVerificationContraintSocial(event, oldItemData, shiftChild);
      } else {
        this.listLoi = this.listLoiByGroupTravail.get(event.employee.contrats[0].groupeTravail.idGroupeTravail);
        if (oldItemData) {
          this.checkContraintesInUpdateResize(event, oldItemData);
        } else if (shiftChild) {
          this.checkContraintesInAssignEmployee(event);
        } else {
          this.checkContraintesInAddUpdate(event);
        }
      }
    } else {
      this.getLawGroupTravailUsedInVerificationContraintSocial(event, oldItemData, shiftChild);
    }
  }

  /**
   * Cette methode permet de recuperer la liste des loi du restaurant
   */
  private getRestaurantLaws(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    this.loiRestaurantService.getAllActifLoiRestaurantByIdRestaurant().subscribe(
      (data: LoiRestaurantModel[]) => {
        this.listLoi = data;
        this.filter = 'restaurant';
        if (oldItemData) {
          this.checkContraintesInUpdateResize(event, oldItemData);
        } else if (shiftChild) {
          this.checkContraintesInAssignEmployee(event);
        } else {
          this.checkContraintesInAddUpdate(event);
        }
      },
      (err: any) => {
      }
    );
  }

  /**
   * permet de recupere le list de loi de employee
   */
  private getLawEmployeeUsedInVerificationContraintSocial(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    this.employeeLawService.getEmployeeLawUsedInVerificationContraintSocial(event.employee.uuid).subscribe(
      (data: LoiEmployeeModel[]) => {
        this.listLoiByEmployee = this.loiByEmployeeOrGroupTravail(event.employee.idEmployee, data, this.listLoiByEmployee);
        this.listLoi = this.listLoiByEmployee.get(event.employee.idEmployee);
        this.filter = 'employee';
        if (oldItemData) {
          this.checkContraintesInUpdateResize(event, oldItemData);
        } else if (shiftChild) {
          this.checkContraintesInAssignEmployee(event);
        } else {
          this.checkContraintesInAddUpdate(event);
        }
      },
      (err: any) => {
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des loi du groupe de travail dont son identifiant est passe en param
   */
  private getLawGroupTravailUsedInVerificationContraintSocial(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    this.loiGroupeTravailService.getGroupeTravailLawsWithoutPagination(event.employee.contrats[0].groupeTravail.uuid).subscribe(
      (data: LoiGroupeTravailModel[]) => {
        this.listLoi = data;
        this.listLoiByGroupTravail = this.loiByEmployeeOrGroupTravail(event.employee.contrats[0].groupeTravail.idGroupeTravail, data, this.listLoiByGroupTravail);
        this.listLoi = this.listLoiByGroupTravail.get(event.employee.contrats[0].groupeTravail.idGroupeTravail);
        this.filter = 'groupeTravail';
        if (oldItemData) {
          this.checkContraintesInUpdateResize(event, oldItemData);
        } else if (shiftChild) {
          this.checkContraintesInAssignEmployee(event);
        } else {
          this.checkContraintesInAddUpdate(event);
        }
      },
      (err: any) => {
      }
    );
  }

  /**
   * Permet de grouper la loi  par employee ou groupe de travail
   * @param: list
   * @param: key
   */
  private loiByEmployeeOrGroupTravail(key: number, list: any, map: any) {
    map.set(key, list);
    return map;
  }

  /**
   * permet de recupere le sexe et l'age de l 'employee
   * @param: event
   */
  private identifierEmployee(event: any, oldItemData?: GridsterItem, shiftChild?: boolean) {
    const dateNaissance = new Date(Date.parse(event.employee.dateNaissance));
    const dateCourante = new Date();
    const age = moment(dateCourante).diff(moment(dateNaissance), 'year');
    this.mineur = !((age >= this.sharedRestaurant.selectedRestaurant.pays.majeurMasculin && event.employee.sexe === Sexe.MASCULIN) ||
      (age >= this.sharedRestaurant.selectedRestaurant.pays.majeurFeminin && event.employee.sexe === Sexe.FEMININ));

    const index = this.employeesToAdd.findIndex(value => value.idEmployee === event.employee.idEmployee);
    if (index !== -1 && this.employeesToAdd[index].loiEmployee.length !== 0) {
      this.listLoi = this.employeesToAdd[index].loiEmployee;
      if (oldItemData) {
        this.checkContraintesInUpdateResize(event, oldItemData);
      } else if (shiftChild) {
        this.checkContraintesInAssignEmployee(event);
      } else {
        this.checkContraintesInAddUpdate(event);
      }
    } else {
      if (event.employee.hasLaws) {
        this.getEmployeeLaws(event, oldItemData, shiftChild);
      } else if (event.employee.contrats !== null && event.employee.contrats[0].groupeTravail.hasLaws) {
        this.getGroupeTravailLaws(event, oldItemData, shiftChild);
      } else {
        this.getRestaurantLaws(event, oldItemData, shiftChild);
      }
    }
  }


  /**
   * recuperer jour repos par employee
   * @param: employee
   */
  private getAllJourReposByEmployee(employee: EmployeeModel): void {
    this.semaineReposService.getAllJourReposByEmployee(employee.uuid).subscribe(
      (data: SemaineReposModel[]) => {
        if (data != null) {
          this.semaineRepos = data;
          // this.semaineRepos.forEach(semaine => {
          //   semaine.employee = employee;
          // });
          employee.currentSemaineRepos = data;
          const index = this.newActiveEmployees.findIndex(value => value.idEmployee === employee.idEmployee);
          if (index !== -1) {
            this.newActiveEmployees[index].currentSemaineRepos = data;
          }
        }
      }
    );
  }

  /**
   * Get List Shift by Week
   */
  private listShiftByWeek(date: string, uuidEmploye: string, shift?: any) {
    this.cummuleTotal = 0;
    if (uuidEmploye !== '0') {
      this.getListShiftByWeek(date, uuidEmploye, shift);
    }

  }

  /**
   * Build shifts with date changed
   */
  private newShiftGrid(event: any) {
    this.closeEmployeeWeekPlanning();
    if (this.displayPlgManagers) {
      this.detailsTempsPayeComponent.getDetailsTempsPayeWeek(false);
    }
    this.employeesToAdd = [];
    this.selectedDate = event;
    this.displayPlgManagers = false;
    this.getDecoupageHoraire();
  }

  /**
   * Return week number according to first day of week
   */
  private getWeekNumber(date: Date): number {
    date = this.dateService.setTimeNull(date);
    let weekNumber = 0;
    this.weeksPerMonth.forEach((item: any) => {
      const dateDebut = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      const dateFin = this.dateService.createDateFromStringPattern(item.dateFin, 'YYYY-MM-DD');
      this.dateService.resetSecondsAndMilliseconds(date);
      if (dateDebut.getTime() <= date.getTime() && dateFin.getTime() >= date.getTime()) {
        weekNumber = +item.weekNumber;
      }
    });
    this.getWeekPairOrOdd(weekNumber);
    return weekNumber;
  }

  private getWeeksByMonthByRestaurant(selectedDate: Date): void {
    const selectedDateAsString = this.dateService.formatToShortDate(selectedDate);
    this.restaurantService.getListWeekFromMonthByRestaurant(selectedDateAsString).subscribe((weeksPerMonth: any) => {
      this.weeksPerMonth = weeksPerMonth;
      this.weekNumber = this.getWeekNumber(this.selectedDate);
    }, () => {
    });
  }

  private getListShiftByWeek(date: string, uuidEmploye: string, shift?: any): void {
    const index = this.newActiveEmployees.findIndex(value => value.uuid === uuidEmploye);
    if (index !== -1) {
      this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, index);
      if ((this.newActiveEmployees[index].employeeWeekShiftCS && this.newActiveEmployees[index].employeeWeekShiftCS.length) || this.newActiveEmployees[index].hasShift) {
        if (Array.isArray(shift)) {
          shift.forEach((element: any) => {
            element.totalHeure = this.dateService.getDiffHeure(element.heureFin, element.heureDebut);
            this.newActiveEmployees[index].employeeWeekShiftCS.push({...element});
          });
        } else {
          if (shift.idShift && shift.heureDebut && shift.heureDebut) {
            shift.totalHeure = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);

          } else {
            shift.totalHeure = this.dateService.getDiffHeure(shift.heureDeFin.hour, shift.heureDeDebut.hour);
          }
          let indexShiftToReplace = this.newActiveEmployees[index].employeeWeekShiftCS.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shift.idShift);
          if (shift.acheval) {
            indexShiftToReplace = this.newActiveEmployees[index].employeeWeekShiftCS.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shift.idShift && shiftElement.modifiable === shift.modifiable);
          }
          if (indexShiftToReplace !== -1) {
            this.newActiveEmployees[index].employeeWeekShiftCS.splice(indexShiftToReplace, 1);
            this.newActiveEmployees[index].employeeWeekShiftCS.push({...shift});
          } else {
            this.newActiveEmployees[index].employeeWeekShiftCS.push({...shift});
          }
        }
        this.newActiveEmployees[index].employeeWeekShiftCS.forEach((element: any) => {
          if (!element.totalHeure) {
            if (element.idShift && element.heureDebut && element.heureDebut) {
              element.totalHeure = this.dateService.getDiffHeure(element.heureFin, element.heureDebut);

            } else {
              element.totalHeure = this.dateService.getDiffHeure(element.heureDeFin.hour, element.heureDeDebut.hour);
            }
          }
          this.cummuleTotal += element.totalHeure;
        });
        this.cummuleTotal = +this.dateService.convertNumberToTime(this.cummuleTotal);
        this.listShiftSemaineByEmployee = this.newActiveEmployees[index].employeeWeekShiftCS;
      } else {
        // en cas d 'ajout un nouveau shift et la liste de contrainte sociale vide
        if (shift && !shift.idShift) {
          this.newActiveEmployees[index].employeeWeekShiftCS.push({...shift});
        }
        this.getListShiftByWeekWS(date, uuidEmploye, index, shift);
      }
    } else {
      this.getListShiftByWeekWS(date, uuidEmploye, index, shift);
    }
  }

  private getListShiftByWeekWS(date: string, uuidEmploye: string, index: number, shift?: any): void {
    this.shiftService.getListShiftByWeek(date, uuidEmploye).subscribe((res: ShiftModel[]) => {
        if (shift) {
          if (shift.idShift) {
            shift.totalHeure = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);

          } else {
            shift.totalHeure = this.dateService.getDiffHeure(shift.heureDeFin.hour, shift.heureDeDebut.hour);
          }
          const indexShiftToReplace = res.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shift.idShift);
          if (indexShiftToReplace !== -1) {
            res.splice(indexShiftToReplace, 1);
            res.push({...shift});
          } else {
            res.push({...shift});
          }
        }
        res.forEach((element: ShiftModel) => {
          this.cummuleTotal += element.totalHeure;
        });
        this.cummuleTotal = +this.dateService.convertNumberToTime(this.cummuleTotal);
        this.listShiftSemaineByEmployee = res;
        if (index !== -1) {
          this.newActiveEmployees[index].employeeWeekShiftCS = res;
        }
      }
      , error => {
        console.log('error', error);
        this.listShiftSemaineByEmployee = [];

      });
  }

  /**
   * modifier shift dans la list  et dans la map
   * recuperer la list qu'on va enregistrer (listShiftToUpdate)
   */
  private updateShiftResizeAfterSave(oldItemData: GridsterItem) {
    delete this.shiftToSave.shiftFromAbsence;
    if (this.shiftToSave.acheval) {
      this.shiftToSave = this.shiftService.filterShifts([{...this.shiftToSave}], this.frConfig, this.decoupageHoraireFinEtDebutActivity, false, true)[0];
    }
    let x = this.plgEquipierHelperService.convertStartTimeToPosition(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight, this.debutJourneeActivite, this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    let cols = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight,
      this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    let employee = oldItemData.employee;
    let y = oldItemData.y;
    let resizeEnabled = oldItemData.resizeEnabled;
    if (this.shiftToSave.employee && this.shiftToSave.employee.idEmployee !== -1) {
      employee = this.employees.find((employee: EmployeeModel) => employee.idEmployee === this.shiftToSave.employee.idEmployee);
      if (employee && (employee.idEmployee === null || this.newActiveEmployees.findIndex((emp: EmployeeModel) => emp.idEmployee === employee.idEmployee) !== -1)) {
        resizeEnabled = true;
      }
    }
    this.listShiftWithSignForWeekOrDay = JSON.parse(JSON.stringify(this.listShiftWithSign));
    if (x < 0) {
      cols += x;
      x = 0;
    }
    this.shiftToAdd = {
      x: x,
      y: y,
      positionCopy: y,
      cols: cols,
      oldCols: cols,
      rows: 2,
      label: this.planningHourLabelFulldayService.getShiftLabelValue(this.shiftToSave, this.modeAffichage),
      color: this.shiftToSave.positionTravail.couleur,
      textColor: this.brightnessColorShiftService.codeColorTextShift(this.shiftToSave.positionTravail.couleur),
      iconEditShift: this.brightnessColorShiftService.icontShift(this.shiftToSave.positionTravail.couleur),
      timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(this.shiftToSave, this.modeAffichage),
      isShift: true,
      idShift: this.shiftToSave.idShift,
      employee: employee,
      selectedEmployee: employee,
      selectedShift: this.shiftToSave,
      hdd: this.shiftToSave.heureDebut,
      hdf: this.shiftToSave.heureFin,
      heureDebutIsNight: this.shiftToSave.heureDebutIsNight,
      heureFinIsNight: this.shiftToSave.heureFinIsNight,
      dragEnabled: oldItemData.dragEnabled,
      resizeEnabled: resizeEnabled,
      dateJournee: this.shiftToSave.dateJournee,
      canUpdate: true,
      acheval: this.shiftToSave.acheval,
      colACheval: this.shiftToSave.acheval ? (this.shiftToSave.colACheval ? this.shiftToSave.colACheval : 0) : 0,
      modifiable: this.shiftToSave.modifiable
    };
    this.initShiftNonAchevalAttribute(this.shiftToSave, this.shiftToSave);
    this.updateListShiftJourneeAfterResizeSave();
    this.updateListShiftToUpdateAfterResize();
    // update weekly employee shifts
    if (employee && employee.idEmployee !== null) {
      this.updateWeekShiftEmployee(oldItemData);
    } else {
      this.oldShiftNonAffecte =
        {
          'valueToSubstruct': this.dateService.getDiffHeure(oldItemData.hdf, oldItemData.hdd),
          'valueToAdd': this.dateService.getDiffHeure(this.shiftToSave.heureFin, this.shiftToSave.heureDebut)
        };
    }
    this.updateOldEmployeeWeekShifts();
    this.updatedetailstempsPaye(oldItemData, x, cols);
    this.initVariableAfterResizeOrDragDrop();
  }

  private initVariableAfterResizeOrDragDrop(): void {
    this.shiftToSave = null;
    this.oldItemData = null;
    this.oldEmploye = null;
    this.oldShiftNonAffecte = null;
    this.updateVueSemaine = false;
  }

  private updateListShiftJourneeAfterResizeSave(): void {
    const indexShiftToUpdateInListShift = this.listShift.findIndex((shift: ShiftModel) => shift.idShift === this.shiftToSave.idShift);
    if ((this.updateVueSemaine && !this.shiftToSave.acheval) || (indexShiftToUpdateInListShift !== -1 && this.listShift[indexShiftToUpdateInListShift].modifiable)) {
      this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShift, this.listShift, this.shiftToSave,
        this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
    }
    if (this.updateVueSemaine && this.shiftToSave.acheval) {
      if (indexShiftToUpdateInListShift !== -1) {
        this.listShift[indexShiftToUpdateInListShift].heureDebutCheval = this.shiftToSave.heureDebut;
      }
    }
  }

  /**
   * listShiftToUpdate : list contenant les shifts modifiés ou créées
   * Update listShiftToUpdate en cas de resize/ drag and drop
   */
  private updateListShiftToUpdateAfterResize(): void {
    const indexShiftToUpdate = this.listShiftToUpdate.findIndex((shift: ShiftModel) => shift.idShift === this.shiftToSave.idShift);
    if (indexShiftToUpdate !== -1) {
      this.plgEquipierHelperService.updateListShift(indexShiftToUpdate, this.listShiftToUpdate, this.shiftToSave,
        this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine, true);
    } else {
      this.listShiftToUpdate.push(this.clone(this.shiftToSave));
    }
  }

  private updatedetailstempsPaye(oldItemData: any, x: number, cols: number): void {
    if (oldItemData.selectedEmployee && oldItemData.selectedEmployee.idEmployee === null && this.shiftToSave.employee && this.shiftToSave.employee.idEmployee) {
      // drag and drop d'un shift non affecté vers un employé (shift devient affecté)
      this.oldShiftNonAffecte =
        {
          'valueToSubstruct': this.dateService.getDiffHeure(oldItemData.hdf, oldItemData.hdd),
          'valueToAdd': 0
        };
    } else if (oldItemData.selectedEmployee && oldItemData.selectedEmployee.idEmployee && this.shiftToSave.employee && !this.shiftToSave.employee.idEmployee) {
      // drag and drop d'un shift affecté vers une ligne vide (shift devient non affecté)
      this.oldShiftNonAffecte =
        {
          'valueToSubstruct': 0,
          'valueToAdd': this.dateService.getDiffHeure(this.shiftToSave.heureFin, this.shiftToSave.heureDebut)
        };
    }
    this.planningEquipieService.setListShift(this.listShift);
    const oldShiftPosition = this.plgEquipierHelperService.convertStartTimeToPosition(oldItemData.hdd, oldItemData.heureDebutIsNight, this.debutJourneeActivite, oldItemData.hdf, oldItemData.heureFinIsNight);
    const oldColsNumber = this.plgEquipierHelperService.convertDurationToColsNumber(oldItemData.hdd, oldItemData.heureDebutIsNight,
      oldItemData.hdf, oldItemData.heureFinIsNight);
    // update temps payé heure par heure par resize/drag and drop sur la meme journee du calendrier
    if (moment(this.dateService.setTimeNull(new Date(this.shiftToSave.dateJournee))).isSame(this.dateService.setTimeNull(new Date(oldItemData.dateJournee)))) {
      this.dayToUpdateInDetailedPayedTime = this.clone(oldItemData.dateJournee);
      this.planningsJour.toArray()[0].calculatePayedTime(oldShiftPosition, oldColsNumber, x, cols);
    } else {
      // update temps payé heure par heure par drag and drop d'une journee à une autre en vue semaine
      const oldDayToUpdate = this.detailsTempsPayeComponent.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.datePipe.transform(oldItemData.dateJournee, 'dd/MM/yyyy'));
      const newDayToUpdate = this.detailsTempsPayeComponent.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.datePipe.transform(this.shiftToSave.dateJournee, 'dd/MM/yyyy'));
      // ajout du temps payé sur la ligne de nouvelle journee
      this.planningsJour.toArray()[0].calculatePayedTime(null, null, x, cols, newDayToUpdate, null);
      // suppression du temps payé sur la ligne de l'ancienne journee
      this.planningsJour.toArray()[0].calculatePayedTime(oldShiftPosition, oldColsNumber, null, null, null, oldDayToUpdate);
    }
  }

  /**
   * Cas d'un drag and drop shift d'un employé à un autre
   * Update shifts de l'ancien employé
   */
  private updateOldEmployeeWeekShifts(): void {
    if (this.oldEmploye) {
      const oldEmployeeToUpdate = this.newActiveEmployees.findIndex(val => val.idEmployee === this.oldEmploye.idEmployee);
      if (oldEmployeeToUpdate !== -1) {
        const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[oldEmployeeToUpdate].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd'));
        if (indexDayToUpdateInWeeklyPlg !== -1) {
          const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[oldEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
          if (indexShiftToUpdateInListShiftWeek !== -1) {
            this.newActiveEmployees[oldEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
          }
        }
        this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, oldEmployeeToUpdate);
      }
      this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
      if (this.planningsSemaine && this.planningsSemaine.toArray()[0]) {
        this.planningsSemaine.toArray()[0].getTotalHoursForDay();
      }
    }
  }

  /**
   * Update des shifts de la semaine de l'employé
   */
  private updateWeekShiftEmployee(oldItemData: any): void {
    const actifEmployeeToUpdate = this.newActiveEmployees.findIndex(val => val.idEmployee === this.shiftToSave.employee.idEmployee);
    if (actifEmployeeToUpdate !== -1) {
      // Update des shifts de la journée cible
      const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd'));
      if (indexDayToUpdateInWeeklyPlg !== -1) {
        const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
        if (indexShiftToUpdateInListShiftWeek !== -1) {
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...this.shiftToSave});
        } else {
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...this.shiftToSave});
        }
      }
      // Update des shifts de la journée source
      if (this.datePipe.transform(oldItemData.dateJournee, 'yyyy-MM-dd') !== this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd')) {
        const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(oldItemData.dateJournee, 'yyyy-MM-dd'));
        if (indexDayToUpdateInWeeklyPlg !== -1) {
          const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === oldItemData.idShift);
          if (indexShiftToUpdateInListShiftWeek !== -1) {
            this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
          }
        }

      }
      // Mise à jour des shifts de la verif des CS
      this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, actifEmployeeToUpdate);
    }
    // Mise à jour de la vue semaine et ses calculs (tableau summary en bas de la vue semaine)
    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    if (this.shiftToSave.acheval && this.updateVueSemaine) {
      this.weeklyDetailsPlanning = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings;
    }
    if (this.planningsSemaine && this.planningsSemaine.toArray()[0]) {
      this.planningsSemaine.toArray()[0].getTotalHoursForDay();
      this.planningsSemaine.toArray()[0].updateSummary(this.diffCols);
    }
  }

  private checkIdShiftUnicity(opts: any): void {
    if (!opts.skipIdVerification && !this.copyEvent) {
      this.shiftToSave.idShift = this.makeString();
      this.listShift.forEach(shift => {
        if (shift.idShift === this.shiftToSave.idShift) {
          this.setNewShiftToListShift({});
        }
      });
    }
  }

  private calculEmployeePosition(y: number, employee: EmployeeModel): any {
    if (this.shiftToSave.employee && this.shiftToSave.employee.idEmployee !== -1 && !this.updateVueSemaine) {
      // y = this.employees.indexOf(this.shiftToSave.employee) * 3;
      y = this.employees.findIndex(val => val.idEmployee === this.shiftToSave.employee.idEmployee) * 3;
      employee = this.shiftToSave.employee;
    } else if (!this.shiftToSave.employee && this.copyEvent) {
      y = this.shiftToSave.employeePosition;
    } else if (this.copyEvent && this.updateVueSemaine && this.shiftToSave.employee) {
      y = this.weekDates.indexOf(this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd')) * 3;
      employee = this.shiftToSave.employee;
    }
    return {y: y, employee: employee};
  }

  /**
   * Ajouter shift dans la list des shifts et dans la map  par employe
   */
  private setNewShiftToListShift(opts?: { displayOnly?: boolean, skipIdVerification?: boolean, restoreOnly?: boolean }) {
    this.checkIdShiftUnicity(opts);
    this.shiftToSave = this.shiftService.filterShifts([this.shiftToSave], this.frConfig, this.decoupageHoraireFinEtDebutActivity)[0];
    this.listShiftWithSignForWeekOrDay = JSON.parse(JSON.stringify(this.listShiftWithSign));
    const x = this.plgEquipierHelperService.convertStartTimeToPosition(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight, this.debutJourneeActivite, this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    const cols = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight,
      this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
    // Si l'employee est null, on ajoute une ligne avec une liste déroulante à la première position dans la grille, sinon on ajoute
    // le nouveau shift à l'employée sélectionné
    let employee = null;
    let y = 3;
    const calculEmployePostionResult = this.calculEmployeePosition(y, employee);
    employee = calculEmployePostionResult.employee;
    y = calculEmployePostionResult.y;
    if (this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
      this.listShift.unshift({...this.shiftToSave});
      this.listShift = [...this.listShift];
    }
    if (!this.shiftToSave.positionTravail) {
      this.shiftToSave.positionTravail = new PositionTravailModel();
    }
    if ((y === -3 || !this.shiftToSave.employee) && this.listShift.length && this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') && !this.copyEvent) {
      this.addEmployee(true, this.shiftToSave.employee, x, cols);
    } else if (this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || (this.copyEvent && this.updateVueSemaine)) {
      let timeLabel = this.shiftToSave.heureDebut.toTimeString().slice(0, 5) + ' - ' + this.shiftToSave.heureFin.toTimeString().slice(0, 5);
      if (this.shiftToSave.acheval) {
        timeLabel = this.shiftToSave.heureDebutCheval.toTimeString().slice(0, 5) + ' - ' + this.shiftToSave.heureFinCheval.toTimeString().slice(0, 5);
      }

      this.shiftToAdd = {
        x: x,
        y: y,
        positionCopy: y,
        cols: cols,
        oldCols: cols,
        rows: 2,
        label: this.shiftToSave.positionTravail.libelle.toUpperCase() + (this.shiftToSave.acheval ? (this.shiftToSave.modifiable ? '->' : '<-') : ''),
        color: this.shiftToSave.positionTravail.couleur,
        textColor: this.brightnessColorShiftService.codeColorTextShift(this.shiftToSave.positionTravail.couleur),
        iconEditShift: this.brightnessColorShiftService.icontShift(this.shiftToSave.positionTravail.couleur),
        timeLabel: timeLabel,
        isShift: true,
        idShift: this.shiftToSave.idShift,
        employee: employee,
        selectedEmployee: employee,
        selectedShift: this.shiftToSave,
        hdd: this.shiftToSave.heureDebut,
        hdf: this.shiftToSave.heureFin,
        heureDebutIsNight: this.shiftToSave.heureDebutIsNight,
        heureFinIsNight: this.shiftToSave.heureFinIsNight,
        dragEnabled: !opts.displayOnly,
        resizeEnabled: !opts.displayOnly,
        dateJournee: this.shiftToSave.dateJournee,
        shiftPrincipale: this.shiftToSave.shiftPrincipale,
        canUpdate: !opts.displayOnly,
        totalHeure: this.shiftToSave.totalHeure ? this.shiftToSave.totalHeure : 0,
        acheval: this.shiftToSave.acheval,
        modifiable: this.shiftToSave.modifiable
      };
    }

    if (employee && employee.idEmployee !== null) {
      this.updateEmployeeShiftsAfterAdd(employee, opts);
    } else {
      this.dateService.setCorrectTimeToDisplayForShift(this.shiftToSave);
      if (!opts.displayOnly) {
        this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
        if (!opts.restoreOnly) {
          if(this.copyEvent && this.shiftToSave.fromShiftFix){
            delete this.shiftToSave.uuid;
            delete this.shiftToSave.fromShiftFix;
        }
        this.listShiftToUpdate.push(this.clone(this.shiftToSave));
        }
      } else {
        this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, true);
      }
      this.oldShiftNonAffecte =
        {
          'valueToSubstruct': 0,
          'valueToAdd': this.dateService.getDiffHeure(this.shiftToSave.heureFin, this.shiftToSave.heureDebut)
        };
    }
    this.updateDetailsTempsPayeAfterAdd(x, cols);
    if (!(this.copyEvent && this.updateVueSemaine)) {
      this.showEmployeeDetails = false;
      this.selectedEmployee = null;
    }
    this.initVariablesAfterAdd();
  }

  private updateDetailsTempsPayeAfterAdd(x: number, cols: number): void {
    if (this.planningsSemaine && this.planningsSemaine.toArray()[0]) {
      this.diffCols = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.heureDebut, this.shiftToSave.heureDebutIsNight, this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight);
      this.planningsSemaine.toArray()[0].getTotalHoursForDay();
      this.planningsSemaine.toArray()[0].updateSummary(this.diffCols);
    }
    this.listShift = this.shiftService.filterShifts(this.listShift, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
    this.planningEquipieService.setListShift(this.listShift);

    this.dayToUpdateInDetailedPayedTime = this.clone(this.shiftToSave.dateJournee);
    this.planningsJour.toArray()[0].calculatePayedTime(null, null, x, cols);
    if (this.modeAffichage === 2 && this.shiftToSave.acheval) {
      const colsNextDay = this.plgEquipierHelperService.convertDurationToColsNumber(this.shiftToSave.heureFin, this.shiftToSave.heureFinIsNight,
        this.shiftToSave.heureFinCheval, this.shiftToSave.heureFinChevalIsNight);
      const newDayToUpdate = this.detailsTempsPayeComponent.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.datePipe.transform(new Date(this.shiftToSave.dateJournee.getTime() + (24 * 60 * 60 * 1000)), 'dd/MM/yyyy'));
      this.planningsJour.toArray()[0].calculatePayedTime(null, null, 0, colsNextDay, newDayToUpdate);
    }
  }

  private initVariablesAfterAdd(): void {
    this.shiftToSave = null;
    this.showAddShiftPopup = false;
    this.oldShiftNonAffecte = null;
    this.copyEvent = false;
    this.oldItemData = null;
    this.oldEmploye = null;
  }

  private updateEmployeeShiftsAfterAdd(employee: EmployeeModel, opts: any): void {
    if (!employee.weekDetailsPlannings.length) {
      employee = this.activeEmployeesPerWeek.find((val: EmployeeModel) => val.idEmployee === employee.idEmployee);
    }
    let indexDayToUpdateInWeeklyPlg = employee.weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'));
    if (this.copyEvent && this.updateVueSemaine) {
      indexDayToUpdateInWeeklyPlg = employee.weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.shiftToSave.dateJournee, 'yyyy-MM-dd'));
    }

    this.shiftToSave.employee.weekDetailsPlannings = [];
    if (indexDayToUpdateInWeeklyPlg !== -1) {
      const actifEmployeeToUpdate = this.newActiveEmployees.findIndex(val => val.idEmployee === this.shiftToSave.employee.idEmployee);
      if (actifEmployeeToUpdate !== -1) {
        this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...this.shiftToSave});
        this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, actifEmployeeToUpdate);
      }
    }
    if (!opts.displayOnly) {
      this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
      if (!opts.restoreOnly) {
        if(this.copyEvent && this.shiftToSave.fromShiftFix){
            delete this.shiftToSave.uuid;
            delete this.shiftToSave.fromShiftFix;
        }
        this.listShiftToUpdate.push(this.clone(this.shiftToSave));
      }
    } else {
      this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, true);
    }
  }

  /**
   * Ajouter shift dans la list des shifts lors de chargement des ML
   */
  private setManagerListShift(listManager: any[], listShift: any[]): void {
    listShift.forEach((sh: ShiftModel) => {
      sh.idShift = this.makeString();
      let dateToCheck = new Date(sh.dateJournee.getTime());
      if (sh.acheval && !sh.modifiable) {
        dateToCheck = new Date(dateToCheck.getTime() + (1000 * 24 * 60 * 60));
      }
      if (this.datePipe.transform(dateToCheck, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
        this.listShift.unshift({...sh});
        this.listShift = [...this.listShift];
      }
    });
    this.planningEquipieService.setListShift(this.listShift);

    this.listShiftWithSignForWeekOrDay = JSON.parse(JSON.stringify(this.listShiftWithSign));
    this.planningsJour.toArray()[0].addManager(listManager);

    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, true);
    this.resetAfterChangementToML();
  }

  /**
   * Réinitialiser les variables  des changements de l'interface

   */
  private resetAfterChangementToML(): void {

    this.shiftToSave = null;
    this.showAddShiftPopup = false;
    this.showAddShiftPopup = false;
    this.showEmployeeDetails = false;
    this.selectedEmployee = null;
    this.oldShiftNonAffecte = null;
  }

  /**
   * Ajouter shift dans la list des shifts lors de chargement d'une journee/Semaine de reference
   */
  private setListRefrenceToListShift(employeesList: EmployeeModel[], listShift: any[]): void {
    listShift.forEach((shift: ShiftModel) => {
      if (this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
        this.listShift.unshift({...shift});
        this.listShift = [...this.listShift];
      }
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      this.listShiftToUpdate.push(this.clone(shift));

    });
    this.planningEquipieService.setListShift(this.listShift);
    // if (this.listShift.length && this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd') === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')) {
    this.planningsJour.toArray()[0].addEmployeeChargerJourneeRef(employeesList);
    // }

    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    this.shiftToSave = null;
    this.showAddShiftPopup = false;
    this.showAddShiftPopup = false;
    this.showEmployeeDetails = false;
    this.selectedEmployee = null;
    this.oldShiftNonAffecte = null;

  }

  /**
   * Get List Shift by selected Date
   */
  private listShiftByDay() {
    if (this.displayPlgHebdo) {

    } else {
      this.notificationService.startLoader();
      this.calculateWeekDaysByWeekNumber();
      this.shiftService.getListShift(this.selectedDate).subscribe((res: ShiftModel[]) => {
        res = this.displayListShiftByDay(res);
        // fromPlanningManager && fromPlanningLeader => shift provient du plg leader
        // fromPlanningManager && !fromPlanningLeader => shift provient du plg manager
        // !fromPlanningManager && !fromPlanningLeader => shift provient du plg équipier
        this.managersShifts = res.filter(sh => sh.fromPlanningManager); // filtrer les shifts actifs des manager et leaders
        this.managersShifts = this.shiftService.filterShifts(this.managersShifts, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
        this.listShift = this.shiftService.filterShifts(res.filter(sh => !sh.fromPlanningManager), this.frConfig, this.decoupageHoraireFinEtDebutActivity);
        if (!this.detailsTempsPayeComponent.detailTempsPayeWeek || !this.activeEmployeesPerWeek.length || this.previousWeek !== this.weekNumber) {
          this.parametreService.getParameterByRestaurantIdAndCodeParameter('DUREE_DETAIL_PHASE').toPromise().then((response: ParametreModel) => {
            this.sessionService.setDureeMinShiftParam(response.valeur);
          });
          this.detailsTempsPayeComponent.getDetailsTempsPayeWeek(true);
          this.previousWeek = this.weekNumber;
          this.getEmployeesListWithWeekInfo();
          this.employees = this.plgEquipierHelperService.getEmployeesList(this.employees, this.listShift);
        } else {
          setTimeout(() => {
            this.filterActiveEmployeesAndAddShiftSign();
          }, 1000);
          this.employees = this.plgEquipierHelperService.getEmployeesList(this.employees, this.listShift);
          this.getEmployeesIndisponibilitiesAndTotalAbsences();
        }
        this.getTotalNonAffecteByDate();
        this.getJourFeriesByRestaurant();
        this.getHeureLimite();
      }, error => {
        this.listShift = [];
        this.notificationService.stopLoader();
      });
    }
  }

  /**
   * Methode permet de gerer le list de shift recuperer par jour
   * @param result
   * @private
   */
  private displayListShiftByDay(result: ShiftModel[]): ShiftModel[] {
    result.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      if (shift.employee) {
        shift.idDefaultEmploye = this.clone(shift.employee.idEmployee);
      }
      if (shift.employee && ((shift.employee.contrats && shift.employee.contrats.length && !shift.employee.contrats[0].groupeTravail.plgEquip) || !shift.employee.contrats.length)) {
        // cas d'un employé n'ayant de contrat équipier
        shift.employee.plgEquipier = false;
      }
      if (shift.employee && shift.employee.contrats && shift.employee.contrats.length && (shift.employee.contrats[0].groupeTravail.plgMgr || shift.employee.contrats[0].groupeTravail.plgLeader)) {
        if (shift.fromPlanningManager) {
          shift.employee.isManagerOrLeader = true;
          delete shift.employee.plgEquipier;
        } else {
          // si l'employé n'a pas de contrat ou cas de changement contrat(groupe de travail a changé)
          shift.notActifEquip = true;
          shift.positionTravail.oldPositionColor = shift.positionTravail.couleur;
          shift.positionTravail.couleur = this.GREY;
          delete shift.employee.plgEquipier;
        }
      }
    });
    return result;
  }

  // Calcul Total temps d'absence de la semaine de la liste des employés actifs

  private calculTotalTempsAbsence(): void {
    this.totalTempsAbsence = 0;
    if (this.displayPlgManagers) {
      this.activeEmployeesPerWeek.forEach((employe: EmployeeModel) => {
        const indexEmploye = this.employees.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
        const listShifts = employe.employeeWeekShiftCS.filter((shift: ShiftModel) => !moment(this.dateService.setTimeNull(new Date(this.selectedDate))).isSame(this.dateService.setTimeNull(new Date(shift.dateJournee))));
        if (indexEmploye !== -1 || listShifts.length) {
          employe.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
            this.totalTempsAbsence += wdp.totalAbsence;
          });
        }
      });
    } else {
      this.activeEmployeesPerWeek.forEach((employe: EmployeeModel) => {
        if (employe.groupeTravail && employe.groupeTravail.plgEquip) {
          const indexEmploye = this.employees.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
          const listShifts = employe.employeeWeekShiftCS.filter((shift: ShiftModel) => !moment(this.dateService.setTimeNull(new Date(this.selectedDate))).isSame(this.dateService.setTimeNull(new Date(shift.dateJournee))));
          if (indexEmploye !== -1 || listShifts.length) {
            employe.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
              this.totalTempsAbsence += wdp.totalAbsence;
            });
          }
        }
      });
    }
    this.totalTempsAbsence = this.dateService.formatMinutesToHours(this.totalTempsAbsence);
  }

  public getEmployeesIndisponibilitiesAndTotalAbsences(): void {
    this.indisponibilities = [];
    this.employeListWithIndispo = [];
    let empDispoStart = [];
    this.calculTotalTempsAbsence();

    if (this.employeesStartGrid.length) {
      this.employeesStartGrid.forEach((employe: EmployeeModel) => {
        const activeEmployeeIndex = this.activeEmployeesPerWeek.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
        if (activeEmployeeIndex !== -1) {
          empDispoStart.push(this.activeEmployeesPerWeek[activeEmployeeIndex]);
        }
      });
    }
    let empDispoEnd = [];
    if (this.employeesEndGrid.length) {
      this.employeesEndGrid.forEach((employe: EmployeeModel) => {
        const activeEmployeeIndex = this.activeEmployeesPerWeek.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
        if (activeEmployeeIndex !== -1) {
          empDispoEnd.push(this.activeEmployeesPerWeek[activeEmployeeIndex]);
        }
      });
    }
    if (!this.employeesEndGrid.length && !this.employeesStartGrid.length) {
      this.employees.forEach((employe: EmployeeModel) => {
        const activeEmployeeIndex = this.activeEmployeesPerWeek.findIndex((emp: EmployeeModel) => emp.idEmployee === employe.idEmployee);
        if (activeEmployeeIndex !== -1) {
          this.employeListWithIndispo.push(this.activeEmployeesPerWeek[activeEmployeeIndex]);
        }
      });
    }


    if (this.employeListWithIndispo.length) {
      const calculIndisponibiliteResult = this.plgEquipierHelperService.calculIndisponibilite(this.employeListWithIndispo, this.employees, false, this.debutJourneeActivite, this.finJourneeActivite, this.selectedDate, this.endMinutesCells, this.hours);
      this.indisponibilities = calculIndisponibiliteResult.indisponibilities;
      this.absences = calculIndisponibiliteResult.absences;
    } else {
      const calculIndisponibiliteStartResult = this.plgEquipierHelperService.calculIndisponibilite(empDispoStart, this.employeesStartGrid, true, this.debutJourneeActivite, this.finJourneeActivite, this.selectedDate, this.endMinutesCells, this.hours);
      const calculIndisponibiliteEndResult = this.plgEquipierHelperService.calculIndisponibilite(empDispoEnd, this.employeesEndGrid, true, this.debutJourneeActivite, this.finJourneeActivite, this.selectedDate, this.endMinutesCells, this.hours);
      this.indisponibilitiesStart = calculIndisponibiliteStartResult.indisponibilities;
      this.indisponibilitiesEnd = calculIndisponibiliteEndResult.indisponibilities;
      this.absencesStart = calculIndisponibiliteStartResult.absences;
      this.absencesEnd = calculIndisponibiliteEndResult.absences;
    }

  }

  public launchGenerateRapport(event: any): void {
    this.showPopupRapport = false;

    this.sessionService.setPdfPlanningEmployeeSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      employeeIds: event.employeeIds,
      groupeTravailIds: event.groupeTravailIds
    });

    this.sessionService.setPdfServiceAPrendreSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });

    this.sessionService.setPdfDetailsPeriodeSettings({
      uuidRestaurant: event.uuidRestaurant,
      groupeTravail: event.groupeTravail,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      minutesOrCentieme : event.minutesOrCentieme,
      employeeOrGroupTravail : event.employeeOrGroupTravail === 'employee' ? 1 : 2,
      listEmployee: event.listEmployee
    });

    this.sessionService.setPdfCompteursEmployesSettings({
      uuidRestaurant: event.uuidRestaurant,
      date: event.date,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfCompteursEmployesForDownloadSettings({
      uuidRestaurant: event.uuidRestaurant,
      periodeAnalyser: event.periodeAnalyser,
      date: event.date,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfRapportOperationnelSettings({
      uuidRestaurant: event.uuidRestaurant,
      groupeTravail: event.groupeTravail,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      hundredth: event.hundredth
    });

    this.sessionService.setPdfResumePlanningSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });
    window.open(window.location.href + '/display/' + this.selectedRapport.codeName, '_blank');
  }


  /**
   * Déterminer les dates des jours composant la semaine à partir du numéro de la semaine
   */
  private calculateWeekDaysByWeekNumber() {
    this.weekDates = [];
    this.weekDatesToDisplay = [];
    let diff = new Date(this.selectedDate).getDay() - this.firstDayAsInteger;
    if (diff < 0) {
      diff = diff + 7;
    }
    const selectedWeekFrom = this.dateService.getDateFromSubstractDateWithNumberOf(this.selectedDate, diff, 'days');
    const selectedWeekTo = this.dateService.getDateFromAddNumberOfToDate(6 - diff, 'days', this.selectedDate);
    for (const date = selectedWeekFrom; date <= selectedWeekTo; date.setDate(date.getDate() + 1)) {
      const shortDate = this.datePipe.transform(date, 'dd/MM');
      this.weekDatesToDisplay.push(this.dateService.getJourSemaineFromInteger(date.getDay()) + ' ' + shortDate);
      this.weekDates.push(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

  }

  private getEmployeesListWithWeekInfo(): void {
    this.notificationService.startLoader();
    this.employeeService.getEmployeesWithPlgEquipierAndManagerAndLeaderAndWeekShifts(this.dateService.formatToShortDate(this.selectedDate)).subscribe((data: EmployeeModel[]) => {
      this.activeEmployeesPerWeek = data;
      this.filterActiveEmployeesAndAddShiftSign();
      this.notificationService.stopLoader();
    }, (err: any) => {
      console.log(err);
    });
  }

  private getDetailsWeeklyPlanning(employe: EmployeeModel): void {
    const index = this.newActiveEmployees.findIndex(value => value.idEmployee === employe.idEmployee);
    const indexManager = this.activeEmployeesPerWeek.findIndex(value => value.idEmployee === employe.idEmployee);
    this.weeklyDetailsPlanning = null;
    this.weeklyDetailsPlanning = [];
    if ((index === -1 || !this.newActiveEmployees[index].weekDetailsPlannings || this.newActiveEmployees[index].weekDetailsPlannings.length === 0) && indexManager === -1) {
      this.getDetailsWeeklyPlanningByEmployee(employe);
    } else {
      this.getDetailsWeeklyPlanningForManagerOrLeader(employe, indexManager, index);
    }
  }

  /**
   * recuperer de detail de planning manager or leader pour une semaine
   * @param: employe
   * @param: indexManager
   * @param: index
   */
  public getDetailsWeeklyPlanningForManagerOrLeader(employe: EmployeeModel, indexManager: number, index: number): void {
    if (employe.groupeTravail && ((employe.groupeTravail.plgMgr || employe.groupeTravail.plgLeader) || (employe.groupeTravail.plgEquip && index === -1))) {
      employe.weekDetailsPlannings = this.activeEmployeesPerWeek[indexManager].weekDetailsPlannings;
    } else {
      employe.weekDetailsPlannings = this.newActiveEmployees[index].weekDetailsPlannings;
    }
    employe.weekDetailsPlannings.forEach((element: WeekDetailsPlanning) => {
      const employeeNew = {contrats: employe.contrats.filter(_=> true)} as EmployeeModel;
      const employeeWithActifContrat = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(element.dateJour), true);
      if (element.shifts.length) {
        element.shifts.forEach((shift: ShiftModel) => {
          if (employe.hasOwnProperty('plgEquipier')) {
            shift.employee.plgEquipier = false;
          }
        });
        let activeGroupeTravail;
        if (employeeWithActifContrat.contrats && employeeWithActifContrat.contrats.length) {
          activeGroupeTravail = employeeWithActifContrat.contrats[0].groupeTravail;
        } else {
          activeGroupeTravail = employe.groupeTravail;
        }
        if ((activeGroupeTravail.plgMgr || activeGroupeTravail.plgLeader)) {
          if (this.displayPlgManagers) {
            // element.shifts = element.shifts.filter((sh: ShiftModel) => sh.fromPlanningManager && sh.totalHeure > 7);
            element.shiftToRestore = element.shifts.filter((sh: ShiftModel) => !sh.fromPlanningManager);
            element.shifts = element.shifts.filter((sh: ShiftModel) => sh.fromPlanningManager);
          } else {
            element.shiftToRestore = element.shifts.filter((sh: ShiftModel) => sh.fromPlanningManager);
            element.shifts = element.shifts.filter((sh: ShiftModel) => !sh.fromPlanningManager);
          }
        } else {
          element.shiftToRestore = element.shifts.filter((sh: ShiftModel) => sh.fromPlanningManager);
          element.shifts = this.shiftService.filterShifts(element.shifts.filter((sh: ShiftModel) => !sh.fromPlanningManager), this.frConfig, this.decoupageHoraireFinEtDebutActivity);
        }
      }
    });
    this.weeklyDetailsPlanning = this.removeShiftInWeekView(employe.weekDetailsPlannings);
    this.getEmployeeSummary();
    this.showEmployeeDetails = true;
  }

  public employesActifsWithTotalPlanifieJour(employees: any[]): void {
    this.activeEmployeesWithTotalPlanifieJour = employees.filter((employe: any) => employe.totalPlanifieJournee);
  }

  public employesActifsWithTotalPlanifieSemaine(employees: any[]): void {
    this.activeEmployeesWithTotalPlanifieSemaine = employees;
  }

  private getEmployeeSummary(diffCols?: number): void {
    this.afterGettingEmployeeWeekPlanning();
    this.getSummaryData();
  }


  private getSummaryData(employeToUpdateSummary?: EmployeeModel): void {
    let actifEmployeeSummary;
    let totalTempsAbsence = 0;
    if (this.selectedEmployee) {
      if (this.selectedEmployee.groupeTravail && (this.selectedEmployee.groupeTravail.plgMgr || this.selectedEmployee.groupeTravail.plgLeader)) {
        actifEmployeeSummary = this.activeEmployeesPerWeek.find(value => value.idEmployee === this.selectedEmployee.idEmployee);
      } else {
        actifEmployeeSummary = this.newActiveEmployees.find(value => value.idEmployee === this.selectedEmployee.idEmployee);
      }
    } else if (employeToUpdateSummary) {
      actifEmployeeSummary = this.newActiveEmployees.find(value => value.idEmployee === employeToUpdateSummary.idEmployee);
    }
    if (!actifEmployeeSummary && this.selectedEmployee) {
      actifEmployeeSummary = this.activeEmployeesPerWeek.find(value => value.idEmployee === this.selectedEmployee.idEmployee);
    }
    let currentWeekShifts = [];
    if (actifEmployeeSummary) {
      actifEmployeeSummary.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        currentWeekShifts = currentWeekShifts.concat(wdp.shifts);
        totalTempsAbsence += wdp.totalAbsence;
      });
    } else if (this.selectedEmployee) {
      actifEmployeeSummary = this.selectedEmployee;
      this.weeklyDetailsPlanning.forEach((wdp: WeekDetailsPlanning) => {
        currentWeekShifts = currentWeekShifts.concat(wdp.shifts);
        totalTempsAbsence += wdp.totalAbsence;
      });
    } else if (employeToUpdateSummary) {
      actifEmployeeSummary = employeToUpdateSummary;
    }

    this.shiftService.getEmployeeListShiftByMonth(this.selectedDate, actifEmployeeSummary.uuid).subscribe((result: any) => {
      let periodeDivision: ShiftModel[][];
      if (result.shiftPerWeek) {
        periodeDivision = Object.values(result.shiftPerWeek);
        periodeDivision.forEach((monthShifts: ShiftModel[]) => {
          if (monthShifts.length) {
            monthShifts.forEach((shift: ShiftModel) => {
              this.dateService.setCorrectTimeToDisplayForShift(shift);
            });
          }
        });
      }
      let periodeDivisionTempsPlanifie = [];
      periodeDivision.forEach((element: ShiftModel[]) => {
        let weekCumul = 0;
        const periodeShiftList = this.plgEquipierHelperService.getDayShifts(element);
        periodeShiftList.forEach((list: ShiftModel[]) => {
          weekCumul += this.plgEquipierHelperService.getPeriodeTotalHoursForEmployee(list, actifEmployeeSummary, this.paramNationaux, this.listOfBreakAndShift);
        });
        periodeDivisionTempsPlanifie.push(weekCumul);
      });

      let monthShifts = [];
      periodeDivision.forEach((list: ShiftModel[]) => monthShifts = monthShifts.concat(list));
      this.debutPeriode = new Date(result.dateDebutPeriode);
      this.finPeriode = new Date(result.dateFinPeriode);
      // check if shift is in periode, we add it to period list shift
      let currentWeekShiftInPeriod = [];
      currentWeekShifts.forEach((shiftToAdd: ShiftModel) => {
        const dateToChek = new Date(shiftToAdd.dateJournee);
        if (!monthShifts.find((shift: ShiftModel) => shift.idShift === shiftToAdd.idShift) &&
          moment(this.dateService.setTimeNull(dateToChek)).isSameOrAfter(this.dateService.setTimeNull(this.debutPeriode)) && moment(this.dateService.setTimeNull(dateToChek)).isSameOrBefore(this.dateService.setTimeNull(this.finPeriode))) {
          currentWeekShiftInPeriod.push(shiftToAdd);
        }
      });
      // calcul du temps planifié des semaine du periode hors semaine selectionnée
      const periodeShiftListForCurrentWeek = this.plgEquipierHelperService.getDayShifts(currentWeekShiftInPeriod.filter((sh: ShiftModel) => !this.plgEquipierHelperService.checkEmployeAbsenceInDate(this.newActiveEmployees, sh.employee.idEmployee, sh.dateJournee)));
      let selectedWeekCumul = 0;
      periodeShiftListForCurrentWeek.forEach((list: ShiftModel[]) => {
        selectedWeekCumul += this.plgEquipierHelperService.getPeriodeTotalHoursForEmployee(list, actifEmployeeSummary, this.paramNationaux, this.listOfBreakAndShift);
      });
      periodeDivisionTempsPlanifie.push(selectedWeekCumul);

      if (employeToUpdateSummary) {
        this.employeeSummaryDetails = employeToUpdateSummary;
      }
      let hebdoPlanifieSemaine: number;
      const indexEmployee = this.activeEmployeesPerWeek.findIndex(value => value.idEmployee === actifEmployeeSummary.idEmployee);
      if (indexEmployee !== -1) {
        hebdoPlanifieSemaine = this.employeeSummaryDetails.hebdoPlanifie;
      } else {
        hebdoPlanifieSemaine = selectedWeekCumul;
      }
      // structure week data in employee recap
      const weekData = {
        'tempsPlanifie': hebdoPlanifieSemaine,
        'tempsContrat': this.dateService.convertNumberToTime(this.employeeSummaryDetails.hebdoCourant * 60),
        'temspAbsence': this.dateService.formatMinutesToHours(totalTempsAbsence)
      };
      this.weekEmployeeSummary = weekData;
      // calcul cumul temps planifié pour la période totale
      let tempsPlanifieMois = 0;
      periodeDivisionTempsPlanifie.forEach((tp: number) => tempsPlanifieMois += tp);
      const monthData = {
        'tempsPlanifie': tempsPlanifieMois,
        'tempsContrat': result.hebdoMensuel,
        'tempsContratDisplay': result.hebdoMensuel,
        'periodeDivisionTempsPlanifie': periodeDivisionTempsPlanifie,
        'totalAbsenceInPeriode': this.dateService.formatMinutesToHours(result.totalAbsenceInPeriode)
      };

      this.monthEmployeeSummary = monthData;
    }, (error: any) => {
      console.log('error ', error);
    });

  }


  /**
   * Vérifier si un employé existe dans un tableau d'employés
   * @param employee employé
   * @param employees tableau d'employés
   */
  private checkEmployeeInGrid(employee: EmployeeModel, employees: EmployeeModel[]): boolean {
    return employees.some((e: EmployeeModel) => employee && e.idEmployee === employee.idEmployee);
  }

  private updateShiftAfterAssignEmployee(idEmployee?: number) {
    this.newListItemToUpdate = [];
    if (this.listItemToUpdate && this.listItemToUpdate.length) {
      this.listItemToUpdate.forEach((itemToUpdate: any) => {
        const shiftToUpdate = {
          x: itemToUpdate.x,
          y: itemToUpdate.y,
          positionCopy: itemToUpdate.y,
          cols: itemToUpdate.cols,
          rows: 2,
          label: itemToUpdate.label,
          color: itemToUpdate.color,
          textColor: itemToUpdate.textColor,
          iconEditShift: itemToUpdate.iconEditShift,
          timeLabel: itemToUpdate.timeLabel,
          isShift: true,
          idShift: itemToUpdate.idShift,
          employee: itemToUpdate.employee,
          selectedEmployee: itemToUpdate.selectedEmployee,
          selectedShift: itemToUpdate.selectedShift,
          hdd: itemToUpdate.hdd,
          hdf: itemToUpdate.hdf,
          heureDebutIsNight: itemToUpdate.heureDebutIsNight,
          heureFinIsNight: itemToUpdate.heureFinIsNight,
          dragEnabled: itemToUpdate.dragEnabled,
          resizeEnabled: itemToUpdate.resizeEnabled,
          dateJournee: itemToUpdate.dateJournee,
          canUpdate: true,
          acheval: itemToUpdate.acheval,
          modifiable: itemToUpdate.modifiable,
          colACheval: itemToUpdate.colACheval

        };
        this.newListItemToUpdate.push(shiftToUpdate);
      });
    }

    this.listShiftWithSignForWeekOrDay = JSON.parse(JSON.stringify(this.listShiftWithSign));
    this.listShiftToSave.forEach(shiftToSave => {
      shiftToSave.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
      const x = this.plgEquipierHelperService.convertStartTimeToPosition(shiftToSave.heureDebut, shiftToSave.heureDebutIsNight, this.debutJourneeActivite, shiftToSave.heureFin, shiftToSave.heureFinIsNight);
      const cols = this.plgEquipierHelperService.convertDurationToColsNumber(shiftToSave.heureDebut, shiftToSave.heureDebutIsNight,
        shiftToSave.heureFin, shiftToSave.heureFinIsNight);

      // Case 1: l'employé à affecter existe deja sur le planning, on recupère sa position pour lui affecter les shifts
      let employee: EmployeeModel = null;
      let employeePosition = 3;
      const employeeToUpdateIndex = this.employees.findIndex(employe => shiftToSave.employee && (employe.idEmployee === shiftToSave.employee.idEmployee));
      if (employeeToUpdateIndex !== -1) {
        employeePosition = employeeToUpdateIndex * 3;
        employee = shiftToSave.employee;
        const shiftToUpdate = {
          x: x,
          y: employeePosition,
          positionCopy: employeePosition,
          cols: cols,
          rows: 2,
          color: shiftToSave.positionTravail.couleur,
          textColor: this.brightnessColorShiftService.codeColorTextShift(shiftToSave.positionTravail.couleur),
          iconEditShift: this.brightnessColorShiftService.icontShift(shiftToSave.positionTravail.couleur),
          label: this.planningHourLabelFulldayService.getShiftLabelValue(shiftToSave, this.modeAffichage),
          timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shiftToSave, this.modeAffichage),
          isShift: true,
          idShift: shiftToSave.idShift,
          employee: employee,
          selectedEmployee: employee,
          selectedShift: shiftToSave,
          hdd: shiftToSave.heureDebut,
          hdf: shiftToSave.heureFin,
          heureDebutIsNight: shiftToSave.heureDebutIsNight,
          heureFinIsNight: shiftToSave.heureFinIsNight,
          dragEnabled: true,
          resizeEnabled: shiftToSave.modifiable,
          dateJournee: shiftToSave.dateJournee,
          shiftPrincipale: shiftToSave.oldShiftData ? shiftToSave.oldShiftData.shiftPrincipale : shiftToSave.shiftPrincipale,
          canUpdate: true,
          acheval: shiftToSave.acheval,
          modifiable: shiftToSave.modifiable,
          colACheval: shiftToSave.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shiftToSave.heureDebutCheval, shiftToSave.heureDebutChevalIsNight, shiftToSave.heureFinCheval, shiftToSave.heureFinChevalIsNight) : 0
        };
        if (!this.listItemToUpdate || (this.listItemToUpdate && !this.listItemToUpdate.length)) {
          this.newListItemToUpdate.push(shiftToUpdate);
        }
      }
      this.updateShiftInListShiftJournee(shiftToSave);
      this.updateShiftInGrid(shiftToSave);
      //Update employee list shift by week
      // Case Reassign employee (modifier l'ancien employé en supprimant les shifts + modifier le nouvel employé en lui affectant les shifts)
      if (idEmployee) {
        shiftToSave.employee.weekDetailsPlannings = [];
        let actifEmployeeToUpdate = this.activeEmployeesPerWeek.findIndex((employe: EmployeeModel) => employe.idEmployee === idEmployee);
        this.updateEmployeDataAfterAssign(actifEmployeeToUpdate, shiftToSave);
        const indexShiftACheval = this.listItemToUpdate.findIndex((sh: ShiftModel) => sh.acheval && !sh.modifiable);
        this.updateShiftAChevalAfterAssign(indexShiftACheval, actifEmployeeToUpdate, idEmployee);

        this.planningEquipieService.setListShift(this.listShift);
        this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
        this.oldShiftNonAffecte =
          {
            'valueToSubstruct': 0,
            'valueToAdd': this.dateService.getDiffHeure(shiftToSave.heureFin, shiftToSave.heureDebut)
          };
        if (this.listContraintesSocialesByShift.has(shiftToSave.idShift)) {
          this.listContraintesSocialesByShift.delete(shiftToSave.idShift);
        }
      }
      // Case Assign employee to shift
      if (shiftToSave.employee && shiftToSave.employee.idEmployee !== null) {
        shiftToSave.employee.weekDetailsPlannings = [];
        const actifEmployeeToUpdate = this.newActiveEmployees.findIndex((employe: EmployeeModel) => employe.idEmployee === shiftToSave.employee.idEmployee);
        this.updateShiftsAfterAssignNewEmploye(actifEmployeeToUpdate, shiftToSave);

        this.oldShiftNonAffecte =
          {
            'valueToSubstruct': this.dateService.getDiffHeure(shiftToSave.heureFin, shiftToSave.heureDebut),
            'valueToAdd': 0
          };
        this.planningEquipieService.setListShift(this.listShift);
        this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
      }
      this.dayToUpdateInDetailedPayedTime = this.clone(shiftToSave.dateJournee);
      this.planningsJour.toArray()[0].calculatePayedTime(x, cols, null, null);
    });

    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    this.oldShiftNonAffecte = null;
  }

  private updateEmployeDataAfterAssign(actifEmployeeToUpdate: number, shiftToSave: ShiftModel): void {
    if (actifEmployeeToUpdate !== -1) {
      const indexDayToUpdateInWeeklyPlg = this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'));
      if (indexDayToUpdateInWeeklyPlg !== -1) {
        const indexShiftToRemove = this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shiftToSave.idShift);
        if (indexShiftToRemove !== -1) {
          this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToRemove, 1);
        }
      }
      this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, actifEmployeeToUpdate);

    }
  }

  private updateShiftAChevalAfterAssign(indexShiftACheval: number, actifEmployeeToUpdate: number, idEmployee: number): void {
    if (indexShiftACheval !== -1) {
      actifEmployeeToUpdate = this.newActiveEmployees.findIndex((employe: EmployeeModel) => employe.idEmployee === idEmployee);
      if (actifEmployeeToUpdate !== -1) {
        const indexDayToUpdateInPrevDayWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(new Date(this.selectedDate.getTime() - (24 * 60 * 60 * 1000)), 'yyyy-MM-dd'));
        if (indexDayToUpdateInPrevDayWeeklyPlg !== -1) {
          const indexShiftToReplace = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInPrevDayWeeklyPlg].shifts.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === this.listItemToUpdate[indexShiftACheval].idShift);
          if (indexShiftToReplace !== -1) {
            this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInPrevDayWeeklyPlg].shifts.splice(indexShiftToReplace, 1);
          }
        }
        const indexDayToUpdateInCurrentDayWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'));
        if (indexDayToUpdateInCurrentDayWeeklyPlg !== -1) {
          const indexShiftToReplace = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInCurrentDayWeeklyPlg].shifts.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === this.listItemToUpdate[indexShiftACheval].idShift);
          if (indexShiftToReplace !== -1) {
            this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInCurrentDayWeeklyPlg].shifts.splice(indexShiftToReplace, 1);
          }
        }
        this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, actifEmployeeToUpdate);
      }
    }
  }

  private updateShiftInListShiftJournee(shiftToSave: ShiftModel): void {
    const indexShiftToUpdateInListShift = this.listShift.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
    this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShift, this.listShift, shiftToSave,
      this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
    const indexShiftToUpdate = this.listShiftToUpdate.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
    if (indexShiftToUpdate !== -1) {
      this.plgEquipierHelperService.updateListShift(indexShiftToUpdate, this.listShiftToUpdate, shiftToSave,
        this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
    } else {
      this.listShiftToUpdate.push(this.clone(shiftToSave));
    }
  }

  private updateShiftsAfterAssignNewEmploye(actifEmployeeToUpdate: number, shiftToSave: ShiftModel): void {
    if (actifEmployeeToUpdate !== -1) {
      const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings.findIndex((wdp: WeekDetailsPlanning) => wdp['dateJour'] === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'));
      if (indexDayToUpdateInWeeklyPlg !== -1) {
        const indexShiftToReplace = this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex((shiftElement: ShiftModel) => shiftElement.idShift === shiftToSave.idShift);
        if (indexShiftToReplace !== -1) {
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToReplace, 1);
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...shiftToSave});
        } else {
          this.newActiveEmployees[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...shiftToSave});
        }
      }
      this.newActiveEmployees = this.methodeUsefulToPlgEquipierService.setEmployeeWeekShiftCS(this.newActiveEmployees, actifEmployeeToUpdate);
    }
  }

  private updateShiftInGrid(shiftToSave: ShiftModel): void {
    const indexShiftToUpdateInListShiftJour = this.planningsJour.toArray()[0].listShift.findIndex((shift: ShiftModel) => shift.idShift === shiftToSave.idShift);
    if (indexShiftToUpdateInListShiftJour !== -1) {
      this.plgEquipierHelperService.updateListShift(indexShiftToUpdateInListShiftJour, this.planningsJour.toArray()[0].listShift, shiftToSave,
        this.oldShift, this.selectedDate, this.modeAffichage, this.showEmployeeDetails, this.updateVueSemaine);
    }
  }

  //  ******************** Verification contraintes sociales *************************
  /**
   * calcule total of shift to employee for day
   */
  private checkContrainteAndCalculTotalShiftPerDay(checkContrainte: boolean, shift?: ShiftModel, isAssigned?: boolean) {
    if (checkContrainte) {
      this.employeeHasAnomalieContraintSocial = shift.employee;
      let dateContraint = this.clone(shift.dateJournee);
      if (shift.acheval && !shift.modifiable) {
        dateContraint = moment(dateContraint).subtract(1, 'days');
      }
      this.dateContraintSocial = this.dateService.formatToShortDate(shift.dateJournee, '/');
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      this.shiftHasAnomalieContraintSocial = shift;
      return this.verifContrainte(shift, isAssigned);
    } else {
      return true;
    }
  }

  private getListShiftByThreeWeek(event: any, oldItemData?: GridsterItem, shiftChild?: boolean): void {
    let dateDislpay;
    if (!event.dateJournee) {
      dateDislpay = new Date(this.selectedDate);
    } else {
      dateDislpay = new Date(event.dateJournee);
    }
    this.shiftService.getListShiftByThreeWeek(dateDislpay, event.employee.uuid).subscribe((res: ShiftModel[]) => {

        res.forEach((element: ShiftModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(element);
        });
        event.employee.listShiftForThreeWeek = res;
        this.identifierEmployee(event, oldItemData, shiftChild);
      }
      , error => {
        console.log('error', error);
        event.employee.listShiftForThreeWeek = [];

      });
  }

  private getDetailsWeeklyPlanningByEmployee(employe: EmployeeModel): void {
    this.notificationService.startLoader();
    this.planningEquipieService.getDetailsWeekPlanning(this.selectedDate, employe).subscribe((result: WeekDetailsPlanning[]) => {
      this.notificationService.stopLoader();
      result.forEach((element: WeekDetailsPlanning) => {
        if (element.shifts.length) {
          element.shifts.forEach((shift: ShiftModel) => {
            if (employe.hasOwnProperty('plgEquipier')) {
              shift.employee.plgEquipier = false;
            }
          });
          element.shifts = this.shiftService.filterShifts(element.shifts, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
        }
      });

      const index = this.newActiveEmployees.findIndex(value => value.idEmployee === employe.idEmployee);
      if (index !== -1) {
        this.newActiveEmployees[index].weekDetailsPlannings = result;
      }

      this.weeklyDetailsPlanning = this.removeShiftInWeekView(result);
      this.showEmployeeDetails = true;
      this.getEmployeeSummary();
    }, (error: any) => {
      this.notificationService.stopLoader();
      console.log(error);
    });
  }

  // remove deleted shifts from week view, in case of inactive employee
  private removeShiftInWeekView(result: WeekDetailsPlanning[]): WeekDetailsPlanning[] {
    if (this.listShiftToDelete.length) {
      result.forEach((wdp: WeekDetailsPlanning) => {
        wdp.shifts.forEach((shift: ShiftModel) => {
          const indexShiftToRemove = this.listShiftToDelete.findIndex((sh: ShiftModel) => sh.idShift === shift.idShift);
          if (indexShiftToRemove !== -1) {
            const indexShiftInWeekList = wdp.shifts.findIndex((element: ShiftModel) => element.idShift === this.listShiftToDelete[indexShiftToRemove].idShift);
            if (indexShiftInWeekList !== -1) {
              wdp.shifts.splice(indexShiftInWeekList, 1);
            }
          }
        });
      });
    }
    return result;
  }

  /**
   * savoir si le numweek est paire ou impaire
   * @param: numWeek
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
   *  message de succès de sauvegarde d'une modification de shift UPDATE
   */
  private displaySuccesUpdateMessage() {
    this.notificationService.showSuccessMessage('PLANNING_EQUIPIER.SHIFT_MODIFIED', 'PLANNING_EQUIPIER.UPDATE_MESSAGE_HEADER');
  }

  /**
   * Cette méthode permet de générer un id pour un nouveau shift ajouté
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  private checkIfThereIsShiftsForCurrentWeek(): void {
    const stringAsDate = this.dateService.formatToShortDate(this.selectedDate);
    this.notificationService.startLoader();
    this.shiftService.checkIfThereIsShiftsForCurrentWeek(stringAsDate).subscribe((result: boolean) => {
      this.notificationService.stopLoader();
      if (result) {
        // presence of shifts in current week
        this.displayDialogChargerReferenceToKeepOrReplaceShifts();
      } else {
        // no shift are present
        this.chargerJourReference(false);
      }
    }, (err: any) => {
      this.notificationService.stopLoader();
      console.log('error');
      console.log(err);
    });
  }

  private displayDialogChargerReferenceToKeepOrReplaceShifts(): void {
    this.confirmationService.confirm({
      message: this.translator.translate('PLANNING_EQUIPIER.QUE_VOULEZ_VOUS_REFAIRE'),
      header: this.translator.translate('PLANNING_EQUIPIER.CHARGER_REF_TITLE'),
      key: 'dialogChargerReference',
      icon: 'pi pi-info-circle',
    });
  }

  /**
   * Modifier list de shift apres sauvegarde
   */
  private setListShiftAfterSave(data: ShiftModel[], displayPlgHebdo?: boolean) {
    const result = this.methodeUsefulToPlgEquipierService.setListShiftAfterSave(this.currentPlanning, data, this.weeklyDetailsPlanning, this.newActiveEmployees, this.listShiftToUpdate, this.listShift, this.selectedEmployee, this.frConfig,
      this.decoupageHoraireFinEtDebutActivity, this.selectedDate, this.modeAffichage);
    ['newActiveEmployees', 'listShiftToUpdate', 'listShift', 'weeklyDetailsPlanning'].forEach(item => this[item] = result[item]);
    data = result.data;
    if (this.selectedEmployee) {
      this.afterGettingEmployeeWeekPlanning();
    }
    if(this.changePlgHebdo){
      this.selectDate(new Date(this.selectedDate));
      this.displayPlgHebdo = !this.displayPlgHebdo;
    }

    this.planningsJour.toArray()[0].getWeekTotalHoursForEmployee(null, null, this.displayPlgManagers);
    this.listShiftToUpdate = [];
    this.employeeToAssign = null;
    this.changePlgHebdo = false;
  }

  /**
   * delete shift reference
   * @private
   */
  private resetReferenceShifts(): void {
    const stringAsDate = this.dateService.formatToShortDate(this.selectedDate);
    /*this.notificationService.startLoader();
    this.shiftService.deleteFromReference(stringAsDate).subscribe(() => {
      this.notificationService.stopLoader();
    }, (err: any) => {
      this.notificationService.stopLoader();
      console.log('error');
      console.log(err);
    });*/
  }

  private initDateAndCalender(): void {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    if (this.sessionService.getDateSelected() !== 'null') {
      this.calendarDate = new Date(this.sessionService.getDateSelected());
    } else {
      this.calendarDate = new Date();
    }
    this.selectedDate = this.calendarDate.toDateString();

    this.setCalendar();
  }

  /**
   **  verification Contrainte Social
   * @param :totalInDay
   * @param :shift
   */
  private verifContrainte(shift: any, isAssigned?: boolean) {
    const employeVerifCs = {
      listLoi: this.listLoi,
      tempsTravailPartiel: this.tempsTravailPartiel,
      mineur: this.mineur,
      contratActif: this.contratActif
    };
    const paramDate = {
      selectedDate: this.selectedDate,
      premierJourDeLaSemaine: this.premierJourDeLaSemaine,
      limiteHeureDebut: this.limiteHeureDebut
    };

    const paramWeek = {
      jourDebutWeekEnd: this.jourDebutWeekEnd,
      jourFinWeekEnd: this.jourFinWeekEnd,
      heureDebutWeekEnd: this.heureDebutWeekEnd,
      heureFinWeekEnd: this.heureFinWeekEnd
    };

    const result = this.verificationContraintePlanningEquipierService.verifContraintes(shift, this.oldShift, employeVerifCs, this.employeeHasAnomalieContraintSocial, this.newActiveEmployees, this.listContraintesSocialesByShift, this.listShiftSemaineByEmployee, this.listShiftWithSign, this.messageVerification, this.listContrainte, this.dateContrainteAcheve, this.popupVerificationContrainteVisibility, this.listContrainteSuppression, this.weekDates, this.paramNationaux, this.listOfBreakAndShift, this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd, this.modeAffichage, this.listJourFeriesByRestaurant, this.semaineRepos, paramDate, paramWeek, this.hiddenSaveGlobale, this.hiddenSave, isAssigned);
    ['listContrainte', 'messageVerification', 'dateContrainteAcheve', 'popupVerificationContrainteVisibility', 'listShiftWithSign', 'listShiftSemaineByEmployee', 'newActiveEmployees', 'listContrainteSuppression', 'listContraintesSocialesByShift', 'hiddenSaveGlobale', 'hiddenSave'].forEach(item => this[item] = result[item]);
    return result.socialeConstraintesAreValid;

  }


  /**
   * Ouvrir la pop-up de sélection des section du PDF
   */
  public openPdfSectionsSelectionView() {
    this.showPdfSections = true;
  }


  public async scrollToCorrectPosition(): Promise<void> {
    this.elementScrollPlanning = document.getElementsByClassName('content-planning-equipier')[0];
    this.newLeft = this.elementScrollPlanning.scrollLeft;
    const hoursElement = document.querySelectorAll<HTMLElement>('.horizontal-scroll-equipier-menu-open gridster-item.hour-item');

    this.leftHourModify = document.querySelector('.employees-list') as HTMLElement;
    this.leftHourModify = this.leftHourModify.offsetWidth + 34;

    if (this.lastScrollLeft !== this.newLeft) {
      this.lastScrollLeft = this.newLeft;
      const elm2 = document.querySelector<HTMLElement>('.horizontal-scroll-equipier-menu-open .employee-item:nth-child(1)');
      elm2.style.left = (this.widthMenuWhenOpen + 34 - this.newLeft) + 'px';
      for (let i = 0; i < hoursElement.length; i++) {
        hoursElement[i].style.left = (this.widthMenuWhenOpen + this.leftHourModify - this.newLeft) + 'px';
      }
    }

  }


  private chargerJourReference(keepShift: boolean): void {
    this.synchroPlanningEquipierService.sendWeekLoading(this.choosenJourReference.semaine);
    const stringAsDate = this.dateService.formatToShortDate(this.selectedDate);
    this.notificationService.startLoader();
    this.planningReferenceService.chargerJourneeReference(this.choosenJourReference.libelle, stringAsDate, 0).subscribe(async (loadedShift: ShiftModel[]) => {
      if (!keepShift) {
        if (this.choosenJourReference.semaine) {
          const listShiftByWeek = await this.shiftService.getListShiftByWeekForRestaurant(stringAsDate).toPromise();
          listShiftByWeek.forEach((shift: ShiftModel) => {
            if (!shift.createFromReference) {
              this.dateService.setCorrectTimeToDisplay(shift);
              this.listShiftToDelete.push(shift);
              if (shift.employee && shift.employee.idEmployee !== null) {
                const oldEmployeeIndex = this.newActiveEmployees.findIndex(val => val.idEmployee === shift.employee.idEmployee);
                if (oldEmployeeIndex !== -1) {
                  const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd'));
                  if (indexDayToUpdateInWeeklyPlg !== -1) {
                    const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shiftWeek => shiftWeek.idShift === shift.idShift);
                    if (indexShiftToUpdateInListShiftWeek !== -1) {
                      this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
                    }

                  }
                }
              }
            }
          });
        }
        // Delete week shifts to update total temps payé
        this.listShift.forEach((shift: ShiftModel) => {
          if (!isNaN(Number(shift.idShift))) {
            const indexShiftToDelete = this.listShiftToDelete.findIndex((shiftToDelete: ShiftModel) => shiftToDelete.idShift === shift.idShift);
            if (indexShiftToDelete === -1) {
              this.listShiftToDelete.push(shift);
            }
            if (shift.employee && shift.employee.idEmployee !== null) {
              const oldEmployeeIndex = this.newActiveEmployees.findIndex(val => val.idEmployee === shift.employee.idEmployee);
              if (oldEmployeeIndex !== -1) {
                const indexDayToUpdateInWeeklyPlg = this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'));
                if (indexDayToUpdateInWeeklyPlg !== -1) {
                  const indexShiftToUpdateInListShiftWeek = this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shiftWeek => shiftWeek.idShift === shift.idShift);
                  if (indexShiftToUpdateInListShiftWeek !== -1) {
                    this.newActiveEmployees[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
                  }

                }
              }
            }

          }
        });
        if (this.choosenJourReference.semaine) {
          const totalTempsPlanifToSubstruct = this.plgEquipierHelperService.getHoursInDay(this.listShiftToDelete.filter((shift: ShiftModel) => !shift.employee));
          this.detailsTempsPayeComponent.detailTempsPayeWeek.totalTempsPlanifieEnMinutes = this.detailsTempsPayeComponent.detailTempsPayeWeek.totalTempsPlanifieEnMinutes - totalTempsPlanifToSubstruct;
        } else {
          const totalTempsPlanifToSubstruct = this.plgEquipierHelperService.getHoursInDay(this.listShift.filter((shift: ShiftModel) => !shift.employee));
          this.detailsTempsPayeComponent.detailTempsPayeWeek.totalTempsPlanifieEnMinutes = this.detailsTempsPayeComponent.detailTempsPayeWeek.totalTempsPlanifieEnMinutes - totalTempsPlanifToSubstruct;
        }
         if(this.choosenJourReference.semaine) {
           this.deleteShiftFromShiftFixeAfterOverwrite();
         }
        this.listShift = [];
        this.listShiftToUpdate = [];
      }
      let listShiftPositions = [];
      // total des shifts à ajouter au total temps planifié
      let totalShifts = 0;
      let employeesList = [];
      loadedShift = this.shiftService.filterShifts(loadedShift, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
      loadedShift.forEach((shift: ShiftModel) => {
        shift.idShift = this.makeString();
        const employee: EmployeeModel = new EmployeeModel();
        employee.nom = null;
        employee.prenom = null;
        employee.hebdoCourant = null;
        employee.hebdoPlanifie = null;
        employee.idEmployee = null;
        employeesList.splice(1, 0, employee);

        this.dateService.setCorrectTimeToDisplayForShift(shift);
        totalShifts += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        const x = this.plgEquipierHelperService.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight, this.debutJourneeActivite, shift.heureFin, shift.heureFinIsNight);
        const cols = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight,
          shift.heureFin, shift.heureFinIsNight);
        listShiftPositions.push({position: x, colsNumber: cols, dateToUpdate: this.clone(shift.dateJournee)});
      });

      this.setListRefrenceToListShift(employeesList, loadedShift);
      this.oldShiftNonAffecte =
        {
          'valueToSubstruct': 0,
          'valueToAdd': totalShifts
        };
      this.detailsTempsPayeComponent.updateTotalTempsPayeWek(this.oldShiftNonAffecte);
      this.oldShiftNonAffecte = null;

      if (!keepShift) {
        this.employees = this.plgEquipierHelperService.getEmployeesList(this.employees, this.listShift);
        this.planningsJour.toArray()[0].calculatePayedTimeRefrence(listShiftPositions);
      }
      this.notificationService.stopLoader();
      this.showChargerJourReferencePopup = false;
    }, (err: any) => {
      this.notificationService.stopLoader();
      this.showChargerJourReferencePopup = false;
      console.log(err);
    });
  }
 public displayPopupReference(): void{


 }
  /**
   * Focus screen on searched employee
   */
  public scrollToEmployee(employeeId: number): void {
    const el = document.getElementById('employee' + employeeId) as HTMLElement;
    const parentPrincipalEl = el.parentElement.parentElement;

    const allEmployees = document.getElementsByClassName('employees-list')[0] as HTMLElement;

    for (let i = 1; i < allEmployees.children.length; i++) {
      if (allEmployees.children[i] === parentPrincipalEl) {
        if (i === 1 || i === 2) {
          el.parentElement.parentElement.parentElement.children[i - 1].scrollIntoView();
        } else {
          allEmployees.children[i].scrollIntoView();
        }
      }
    }
  }

  public showActionPopup(codeName: String): void {
    this.selectedRapport = this.getRapportSelected(codeName);
    this.showPopupRapport = true;
  }

  public getRapportSelected(codeName: String): RapportModel {
    return this.listRapports.find((rapport: RapportModel) => rapport.codeName === codeName);
  }

  public getListEmployeeByPointage(event: any): void {
    this.notificationService.startLoader();
    this.employeeService.findAllEmployeesWithPointageBetweenDate(event.dateDebut, event.dateFin).subscribe(
      (data: EmployeeModel[]) => {
        this.listEmployees = data;
        this.listEmployees.forEach((item: EmployeeModel) => {
          item.displayedName = item.nom + ' ' + item.prenom;
        });
        this.notificationService.stopLoader();

      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
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

  private getTotalNonAffecteByDate(): void {
    const stringAsDate = this.dateService.formatToShortDate(this.selectedDate);
    this.shiftService.getTotalEquipNonAffecteByWeek(stringAsDate).subscribe((totalEquipNonAffecteByWeek: number) => {
      this.totalEquipNonAffecteByWeek = totalEquipNonAffecteByWeek;
      let totalMinuteNonAffecte = 0;
      this.listShift.forEach((item: ShiftModel) => {
        if (!item.employee || !item.employee.idEmployee) {
          totalMinuteNonAffecte += this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
        }
      });
      //this.totalEquipNonAffecteByWeekToSend = this.clone(+(this.totalEquipNonAffecteByWeek + totalMinuteNonAffecte));
      this.totalEquipNonAffecteByWeekToSend = +(this.totalEquipNonAffecteByWeek + totalMinuteNonAffecte);
    });
  }

  /**
   * Affichage MOE ou Productivité
   * @param: showMoe true si affichage MOE, false si affichage productivité
   */
  public displayMoeProductivity(showMoe: boolean) {
    this.showMoe = showMoe;
  }

  private deleteShiftFromShiftFixeAfterOverwrite() {
    this.listShift = this.listShift.filter((sh: ShiftModel) => !sh.fromShiftFix);

    this.activeEmployeesPerWeek.forEach((employee: EmployeeModel) => {
      employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        wdp.shifts = wdp.shifts.filter((sh: ShiftModel) => !sh.fromShiftFix);
      });
    });
  }
}
