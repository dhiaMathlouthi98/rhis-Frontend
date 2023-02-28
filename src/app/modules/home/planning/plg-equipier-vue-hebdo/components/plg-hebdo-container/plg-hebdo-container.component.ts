import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {EmployeeService} from '../../../../employes/service/employee.service';
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
import {LoiGroupeTravailModel} from '../../../../../../shared/model/loi.groupe.travail.model';
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
import {forkJoin, Observable, Subject} from 'rxjs';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {DisponiblitePairOrOdd} from '../../../../../../shared/enumeration/disponiblitePairOrOdd';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {ParamNationauxService} from '../../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {CodeNameContrainteSocial} from '../../../../../../shared/enumeration/codeNameContrainteSocial';
import {DecoupageHoraireService} from '../../../configuration/service/decoupage.horaire.service';
import {DecoupageHoraireModel} from '../../../../../../shared/model/decoupage.horaire.model';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {HelperService} from 'src/app/shared/service/helper.service';
import * as rfdc from 'rfdc';
import {ShiftService} from '../../../planning-equipier/service/shift.service';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {PlanningsHebdoEmployeeRowComponent} from '../plannings-hebdo-employee-row/plannings-hebdo-employee-row.component';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';
import {PlgHebdoService} from '../../services/plg-hebdo.service';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {ProposeAction} from 'src/app/shared/enumeration/ProposeAction';
import {PlanningEquipierService} from '../../../planning-equipier/service/planning-equipier.service';
import {DatePipe} from '@angular/common';
import {PlgHebdoHelperService} from '../../services/plg-hebdo-helper.service';
import {TotalCaPerDay} from 'src/app/shared/model/details-temps-paye';
import {WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {PlanningJourReferenceModel} from '../../../../../../shared/model/planning.jour.reference.model';
import {TabPanel} from 'primeng/primeng';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PlanningReferenceService} from '../../../planning-equipier/service/planning-reference.service';
import {SynchroPlanningEquipierService} from '../../../planning-equipier/service/synchro-planning-equipier.service';
import {PlgEquipierHelperService} from '../../../planning-equipier/service/plg-equipier-helper.service';
import {
  VerificationContraintePlanningEquipierService
} from '../../../planning-equipier/service/verification-contrainte-planning-equipier.service';
import {
  VerificationContraintePlanningEquipierViewHebdoService
} from '../../../planning-equipier/service/verification-contrainte-planning-equipier-view-hebdo.service';
import {SessionService} from '../../../../../../shared/service/session.service';

declare var interact;

@Component({
  selector: 'rhis-plg-hebdo-container',
  templateUrl: './plg-hebdo-container.component.html',
  styleUrls: ['./plg-hebdo-container.component.scss']
})
export class PlgHebdoContainerComponent implements OnInit, OnChanges {
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public lawCodeName = false;
  public showConfimeDelete = false;
  public hiddenSave = false;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  public shiftToSave: any;
  public listInthreeWeek: [];
  public showPopAddShift = false;
  public listContrainte: VerificationContrainteModel[] = [];
  public popupVerificationContrainteVisibility = false;
  public messageVerification = {} as VerificationContrainteModel;
  public employeeHasAnomalieContraintSocial = {} as EmployeeModel;
  public selectedEmployee = {} as EmployeeModel;
  public listShiftToUpdate: ShiftModel[] = [];
  public listShiftToUpdateDefault: ShiftModel[] = [];
  public listShiftToDelete: ShiftModel[] = [];
  public listShiftToDeleteDefault: ShiftModel[] = [];
  public listShiftByEmployeeToDelete: any[] = [];
  public filter: string;
  private listLoi: any;
  private listLoiByCodeName: any;
  private semaineRepos: SemaineReposModel[] = [];
  public draggableElementShift: any;
  public listEmployeeActif: EmployeeModel[] = [];
  // permet de savoir si une opération 'ajoutu d'un employé ou d'un poste est en cours
  public newEmployeeInProgress = false;
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public listShift: ShiftModel[] = [];
  public listShiftDefault: ShiftModel[] = [];
  public listePositionTravail: PositionTravailModel[] = [];
  public listEmployeeToAdd: EmployeeModel[] = [];
  public totalShiftInWeek = 0;
  public firstDayAsInteger: number;
  public dateContraintSocial: any;
  public dateContrainteAcheve: any;

// les employees qui ont des shift
  public listEmployeeHasShift: EmployeeModel[] = [];
  public listEmployeeHasShiftInWeekReference: EmployeeModel[] = [];
// les employees qui n'ont pas des shift
  public listEmployeeNotHasShift: EmployeeModel[] = [];
  public shiftByEmployee = new Map();
  public listLoiByEmployee = new Map();
  public listLoiByGroupTravail = new Map();
  days: any[] = [];
  public addPopupTitle = this.rhisTranslateService.translate('PLANNING_EQUIPIER.ADD_SHIFT_MODAL');
  public updatePopupTitle = this.rhisTranslateService.translate('PLANNING_EQUIPIER.UPDATE_SHIFT_MODAL');
  // error messages
  public dateDebutSupDateFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_DEBUT_SUP_DATE_FIN');
  public dateFinWithoutDateDebutErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_FIN_WITHOUT_DATE_DEBUT');
  public heureDebutSupHeureFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.HEURE_DEBUT_SUP_HEURE_FIN');
  public limiteHeureDebut: Date;
  public titlePopupContraint = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIES');
  public listJourFeriesByRestaurant;
  public setNightValue;
  public listEmployeeInactifHasShift;
  public messageConfonduShift = '';
  private ecran = 'VPE';
  private frConfig: any;
  private readonly GREY = '#c0bbb0';

  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 800,
    height: 700
  };
  private jourDebutWeekEnd: JourSemaine;
  private heureDebutWeekEnd: Date;
  private jourFinWeekEnd: JourSemaine;
  private heureFinWeekEnd: Date;
  private premierJourDeLaSemaine: JourSemaine;
  public contratActif = {} as ContratModel;
  public tempsTravailPartiel = false;
  private mineur: boolean;

  public contentHeightPlanning: number;

  public stylelistBesoinCondense = true;

  @ViewChild('contentBodyPlan') calcHeight: ElementRef;
  @ViewChildren(PlanningsHebdoEmployeeRowComponent, {read: PlanningsHebdoEmployeeRowComponent})
  public planningFixRows: QueryList<PlanningsHebdoEmployeeRowComponent>;
  public eventCtrl = false;
  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  /**
   * Heure début journée d'activité
   */
  private choosenJourReferenceLibelleError = false;
  private choosenDayReferenceDeletedLibelleError = false;
  @ViewChild('variableTabReference') variableTabReference: TabPanel;
  @ViewChild('variableTabDelete') variableTabDelete: TabPanel;
  public popupTitle = '';
  public popupVerificationContrainteLoadingWeekVisibility = false;
  public listContrainteOfLaodingWeek = [];
  public saveReferenceForm = new FormGroup(
    {
      referenceName: new FormControl('', [Validators.required]),
      referenceList: new FormControl(''),
    }
  );
  public isSubmitted = false;
  public showSaveReferencePopup: boolean;
  public selectedValue = false;
  public withAffectation = 0;
// retourne true si la référence exist déja dans la liste des références
  public refExist: boolean;
  public shiftReferenceList: PlanningJourReferenceModel[] = [];
  public choosenJourReference: PlanningJourReferenceModel = {semaine: false};
  public choosenDayReferenceToDelete = {} as PlanningJourReferenceModel;
  public debutJourneeActivite: any;
  public showChargerJourReferencePopupVueHebdo = false;
  public displayDialogChargerReferenceVueHebdo = true;
  public overwriteShifsReference = 0;
  /**
   * titre de la popup de charger un jour/semaine de reference
   */
  public titleChargerJourReferencePopup: string;
  @Input() deleteRow: boolean;
  @Input() showMoe: any;
  @Input() selectedDate: any;
  @Input() dateDebut: any;
  @Input() dateFin: any;
  @Input() listPairAndOdd: DisponiblitePairOrOdd[];
  @Input() weekNumber: any;
  public _displayPlgManagers: boolean;
  public listShiftEquip: ShiftModel[];
  public activeEmployeesPerWeek: EmployeeModel[];
  public activeEmployeesPerWeekWithDefault: EmployeeModel[];
  public listShiftDefaultAfterLoading: ShiftModel[];

  public oldShift: ShiftModel;
  public weekDates: string[] = [];
  public caData: TotalCaPerDay[];
  public employeInactif = false;
  public _getTauxMoeWeekTotal: boolean;
  public listContrainteAffectation = [];
  public shiftsToAssign: any;
  public employeeToAssign: EmployeeModel;
  public shiftHasAnomalieContraintSocial: any;

  @Input()
  set displayPlgManagers(value: boolean) {
    this._displayPlgManagers = value;
    if (this.activeEmployeesPerWeek) {
      this.notificationService.startLoader();
      setTimeout(() => {
        this.getlistShiftByRestaurant();
        this.notificationService.stopLoader();
      }, 1000);
    }
  }

  @Input()
  set getTauxMoeWeekTotal(value: boolean) {
    this._getTauxMoeWeekTotal = value;
  }

  @Output() public displayHebdoEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public saveListShiftEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public saveListGlobaleEmitter: EventEmitter<{ awayNavigation: boolean, operation: Function }> = new EventEmitter();
  @Output() public displayPopupReference: EventEmitter<any> = new EventEmitter();
  @Output() public totalMoeSemaineEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public checkNavigationAway: EventEmitter<any> = new EventEmitter();

  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;
  public startTime: string;
  public startTimeIsNight: boolean;
  public startActivity: any;
  public endActivity: any;
  public endTime: string;
  public endTimeIsNight: boolean;
  public clone = rfdc();
  public navigateTo = false;
  public idEmploye: number;
  public index: any;
  public idShiftToDelete: any;
  public shiftToDelete: any;
  public listContrainteSuppression: VerificationContrainteModel[] = [];
  public popupVerificationCsMaxShift = false;
  public minBeforeCoupure = 0;
  private MIN_BEFORE_COUPURE_CODE_NAME = 'MINBEFORCOUPURE';
  public modeAffichage = 0;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public decoupageHoraireFinEtDebutActivity: any;
  public newEmployeesToAdd: any;
  public listShiftNonAffecte: ShiftModel[];
  public totalAffecte = 0;
  public totalPlanifie = 0;
  public tauxMoeMoyen = 0;
  public detailTempsPayeWeek: any;
  public totauxDayByDay: any;
  public listShiftEquipManagerLeader: ShiftModel[];
  public isClosed = false;
  public listShiftManagerLeader: ShiftModel[];
  public sortByFirstName = true;
  public popupVerificationContrainteGlobaleVisibility = false;
  public listContrainteGlobale: any[] = [];
  public hiddenSaveGlobale = false;
  public listContraintesSocialesByShift = new Map();
  public listContraintesSocialesByShiftDefault = new Map();
  public navigationAwayActivated = false;
  public onWeekChanged: Function;
  public clickMenubas: boolean;

  constructor(
    private confirmationService: ConfirmationService,
    private rhisTranslateService: RhisTranslateService,
    private employeeService: EmployeeService,
    private sharedRestaurant: SharedRestaurantService,
    private dateService: DateService,
    private plgHebdoService: PlgHebdoService,
    private positionTravailService: PositionTravailService,
    private periodeManagerService: PeriodeManagerService,
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
    public rhisRouter: RhisRoutingService,
    private paramNationauxService: ParamNationauxService,
    private decoupageHoraireService: DecoupageHoraireService,
    private domControlService: DomControlService,
    private helperService: HelperService,
    private shiftService: ShiftService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private parametreService: ParametreGlobalService,
    private limitDecoupageService: LimitDecoupageFulldayService,
    private planningEquipierService: PlanningEquipierService,
    private planningEquipieService: PlanningEquipierService,
    private datePipe: DatePipe,
    private plgHebdoHelperService: PlgHebdoHelperService,
    private verificationContraintePlanningEquipierService: VerificationContraintePlanningEquipierService,
    private planningReferenceService: PlanningReferenceService,
    private synchroPlanningEquipierService: SynchroPlanningEquipierService,
    private plgEquipierHelperService: PlgEquipierHelperService,
    private verificationContraintePlanningEquipierViewHebdoService: VerificationContraintePlanningEquipierViewHebdoService,
    private sessionService: SessionService
  ) {
    this.titleChargerJourReferencePopup = this.rhisTranslateService.translate('PLANNING_EQUIPIER.CHARGER_REF_TITLE_WEEK');

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

    setTimeout(() =>
        this.onReadyInitDrag() // initialisation de l'interraction du drag & drop des cards
      , 300);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.deleteRow) {
      this.deleteRow = changes.deleteRow.currentValue;
      if (this.deleteRow) {
        // this.showConfirmDeleteRow();
      }
    }
    if (changes && changes.showMoe) {
      this.showMoe = changes.showMoe.currentValue;
    }
    // if (changes && changes.selectedDate) {
    //   this.selectedDate =  this.datePipe.transform(changes.selectedDate.currentValue, 'dd-MM-yyyy');
    //   this.getEmployeesToAdd();
    //   this.getActifsEmployeesWithShifts();
    // }
    if (changes && changes.dateDebut && changes.dateDebut.currentValue) {
      this.dateDebut = changes.dateDebut.currentValue;
      this.caData = null;
      this.detailTempsPayeWeek = null;
      this.selectedDate = this.datePipe.transform(this.dateDebut, 'dd-MM-yyyy');
      this._displayPlgManagers = false;
      this.listShiftByEmployeeToDelete = [];
      this.listShiftToDelete = [];
      this.listShiftToUpdate = [];
      this.getEmployeesToAdd();
      this.getSelectedRestaurant();
      this.getParamRestaurantByCodeNames();
      this.getDecoupageHoraire();
      this.getActifsEmployeesWithShifts();
      this.getListePositionTravailActiveByRestaurant();
      this.getHeureLimite();
      this.getParamNationauxByRestaurant();
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
   * Trie des shifts par heure debut
   */
  private sortListShift(listShift: ShiftModel[]): void {
    listShift.sort(function (a: ShiftModel, b: ShiftModel) {
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
   * recupere le contrat actif
   */
  private getContratByEmployeeActif(employee: EmployeeModel, dateJournee: any, forLoadingWeek: boolean, isAssigned?: boolean, filterDragAndDrop?: string) {
    if (employee && (!isNaN(Number(employee.idEmployee)) && employee.idEmployee !== 0 && employee.idEmployee !== undefined)) {
      const employeHaslaw = this.listEmployeeActif.find(item => item.idEmployee === employee.idEmployee);
      if (employeHaslaw && employeHaslaw.idEmployee && employeHaslaw.loiEmployee && employeHaslaw.loiEmployee.length) {
        this.listLoi = employeHaslaw.loiEmployee;
      }
      let index = -1;
      if (!forLoadingWeek) {
        index = this.activeEmployeesPerWeek.findIndex(value => value.idEmployee === employee.idEmployee);
      }
      if (forLoadingWeek || (index !== -1 && this.activeEmployeesPerWeek[index].contrats && this.activeEmployeesPerWeek[index].contrats.length !== 0)) {
        const employeeDisplay = forLoadingWeek ? employee : this.clone(this.activeEmployeesPerWeek[index]);
        const activeContratList = this.contrainteSocialeService.getContratByDay(employeeDisplay, dateJournee).contrats;
        let activeContrat: any;
        if (activeContratList && activeContratList.length) {
          this.employeInactif = false;
          activeContrat = activeContratList[0];

          this.contratActif = forLoadingWeek ? activeContrat : this.activeEmployeesPerWeek[index].contrats.length === 1 ? this.activeEmployeesPerWeek[index].contrats[0] : activeContrat;
          this.tempsTravailPartiel = !!this.contratActif.tempsPartiel;
          this.checkIsFoundJourReposByEmployee(employee, forLoadingWeek);
          this.getListShiftByThreeWeek(this.clone(employeHaslaw), dateJournee, forLoadingWeek, isAssigned, filterDragAndDrop);

        } else {
          this.employeInactif = true;
          if (filterDragAndDrop) {
            this.resetCradInitialPlace(this.shiftToSave);
          }
          this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE');
        }
      } else {
        // this.getContratActifWithDisponibilite(employee, filterDragAndDrop);
        if (filterDragAndDrop) {
          this.resetCradInitialPlace(this.shiftToSave);
        }
      }
    } else {
      this.employeInactif = false;
    }

  }


  private getListShiftByThreeWeek(employee: any, dateJournee: any, forLoadingWeek: boolean, isAssigned?: boolean, filterDragAndDrop?: any): void {
    employee.listShiftForThreeWeek.forEach((element: ShiftModel) => {
      element.employee = null;
      this.dateService.setCorrectTimeToDisplayForShift(element);
    });
    if (employee.listShiftForThreeWeek.length) {
      employee.listShiftForThreeWeekViewHebdo = this.clone(employee.listShiftForThreeWeek);
    }
    employee.listShiftForThreeWeek = [];
    if (!forLoadingWeek) {
      this.listInthreeWeek = this.clone(employee.listShiftForThreeWeekViewHebdo);
      this.identifierEmployee(employee, dateJournee, isAssigned, filterDragAndDrop);
    }


  }

  /**
   * permet de recupere le lois de l'employe
   * @param: employee
   */
  private identifierEmployee(employee: EmployeeModel, dateJournee?: any, isAssigned?: boolean, filterDragAndDrop?: string): void {
    this.checkEmployeMineur(employee);
    if (employee.contrats[0].tempsPartiel) {
      this.tempsTravailPartiel = true;
    } else {
      this.tempsTravailPartiel = false;
    }
    // employee laws
    this.getEmployeeLaws(employee, dateJournee, isAssigned, filterDragAndDrop);

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
    if (this.paramNationaux.payerLeBreak) {
      this.checkEmployeMineur(employee);
      if (employee.contrats[0].tempsPartiel) {
        this.tempsTravailPartiel = true;
      } else {
        this.tempsTravailPartiel = false;
      }

    }
    const collection = this.clone(this.shiftByEmployee.get(employee.idEmployee));
    this.takeBreakswithTime(collection ? collection : [], employee.idEmployee, employee.loiEmployee, this.tempsTravailPartiel, this.mineur);
    employee.totalRowTime = this.clone(this.totalRowTime);
  }

  /**
   * Cette methode permet de verifier si  la liste des loi de l'employee existe
   *
   * @param :idEmployee
   */
  private getEmployeeLaws(employee: EmployeeModel, dateJournee: any, isAssigned?: boolean, filterDragAndDrop?) {
    this.listLoi = employee.loiEmployee;
    if (filterDragAndDrop) {
      this.checkShiftChangePosition(employee);
    } else if (isAssigned) {
      this.checkContrainteAffectation(dateJournee, isAssigned);
    }

  }


  /**
   * recuprer le jours  de repos de l'employee
   */
  private checkIsFoundJourReposByEmployee(employee, forLoadingWeek: boolean): void {
    if (forLoadingWeek) {
      const employeeDisplay = new EmployeeModel();
      employeeDisplay.idEmployee = employee.idEmployee;
      employeeDisplay.nom = employee.nom;
      employeeDisplay.prenom = employee.prenom;
      this.semaineRepos = employee.semaineRepos;
      this.semaineRepos.forEach(semaine => {
        semaine.employee = employeeDisplay;
      });

    } else {
      if (this.semaineRepos.length > 0) {
        if (this.semaineRepos[0].employee.idEmployee !== employee.idEmployee) {
          this.getAllJourReposByEmployee(employee);
        }
      } else {
        this.getAllJourReposByEmployee(employee);
      }
    }
  }

  checkContrainteAffectation(dateJournee, isAssigned): void {
    const day = this.days.find(d => d.dateJournee === dateJournee);
    let listShiftByDay = this.plgHebdoHelperService.grouperShiftParJour(day.val, this.shiftsToAssign);
    if (listShiftByDay.length) {
      listShiftByDay.forEach(element => {
        this.dateService.setCorrectTimeToDisplayForShift(element);
      });
      this.sortListShift(listShiftByDay);
      listShiftByDay.forEach((sh: ShiftModel) => {
        this.calculeTotalInWeekAndTotalInDayForShift(sh, isAssigned, true);
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(sh.idShift, this.listContrainte.filter(value => value.idShift === sh.idShift), this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);

      });
      if (moment(this.dateService.setTimeNull(this.shiftsToAssign[this.shiftsToAssign.length - 1].dateJournee))
        .isSame(this.dateService.setTimeNull(listShiftByDay[0].dateJournee))) {
        if (this.listContrainte && this.listContrainte.length) {
          this.popupVerificationContrainteVisibility = true;
        } else {
          this.initEmployeeSelection();
          this.assignShifts();
        }
      }
    }
  }

  /**
   * Cette methode permet de recuperer la liste des loi du groupe de travail dont son identifiant est passe en param
   *
   * @param :idGroupeTravail
   */
  private getLawGroupTravailUsedInVerificationContraintSocial(employee: EmployeeModel, dateJournee?: any, isAssigned?: boolean, filterDragAndDrop?: string) {
    this.loiGroupeTravailService.getGroupeTravailLawsWithoutPagination(employee.contrats[0].groupeTravail.uuid).subscribe(
      (data: LoiGroupeTravailModel[]) => {
        this.listLoi = data;
        this.listLoiByGroupTravail = this.loiByEmployeeOrGroupTravail(employee.contrats[0].groupeTravail.idGroupeTravail, data, this.listLoiByGroupTravail);
        this.listLoi = this.listLoiByGroupTravail.get(employee.contrats[0].groupeTravail.idGroupeTravail);
        this.filter = 'groupeTravail';
        if (filterDragAndDrop) {
          this.checkShiftChangePosition(employee);
        } else if (isAssigned) {
          this.checkContrainteAffectation(dateJournee, isAssigned);
        }
      },
      (err: any) => {
      }
    );
  }


  /**
   * get parametre of restaurant saved in shared service
   * @param :employee
   */
  private getParamNatValues() {
    this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    this.jourDebutWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourWeekend;
    this.jourFinWeekEnd = this.sharedRestaurant.selectedRestaurant.parametreNationaux.dernierJourWeekend;
    this.heureDebutWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureDebutWeekend);
    this.heureFinWeekEnd = this.dateService.setTimeFormatHHMM(this.sharedRestaurant.selectedRestaurant.parametreNationaux.heureFinWeekend);
  }

  /**
   * get pâyes of restaurant
   */
  private getPaysOfRestaurant() {
    this.nationnaliteService.getNationaliteByRestaurant().subscribe(
      (data: NationaliteModel) => {
        this.sharedRestaurant.selectedRestaurant.pays = data;
        this.getParamNatValues();


      }, (err: any) => {
        // TODO error panel
        console.log('err');
        console.log(err);
      }
    );
  }

  private markManagerLeaders(listShift: ShiftModel[]): void {
    listShift.forEach((shift: ShiftModel) => {
      if (shift.employee && shift.employee.contrats && shift.employee.contrats.length && (shift.employee.contrats[0].groupeTravail.plgMgr || shift.employee.contrats[0].groupeTravail.plgLeader)) {
        if (shift.fromPlanningManager) {
          shift.employee.isManagerOrLeader = true;
        } else {
          // si l'employé n'a pas de contrat ou cas de changement contrat(groupe de travail a changé)
          shift.notActifEquip = true;
          shift.positionTravail.oldPositionColor = shift.positionTravail.couleur;
          shift.positionTravail.couleur = this.GREY;
          delete shift.employee.plgEquipier;
        }
      }
    });
  }

  /**
   * recuperer list de shift
   */
  public getlistShiftByRestaurant() {
    this.listShiftEquipManagerLeader = [];
    this.listShiftEquip = [];
    this.listEmployeeHasShift = [];
    this.activeEmployeesPerWeek.forEach((employe: EmployeeModel) => {
      employe.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => this.listShiftEquipManagerLeader = this.listShiftEquipManagerLeader.concat(wdp.shifts));
    });
    this.listShiftManagerLeader = this.listShiftEquipManagerLeader.filter((shift: ShiftModel) => shift.fromPlanningManager);

    if (!this._displayPlgManagers) {
      if (this.listShiftToUpdate.length || this.listShiftToDelete.length) {
        this.listShift = this.listShift.filter((shift: ShiftModel) => !shift.fromPlanningManager);
      } else {
        this.listShift = this.listShiftEquipManagerLeader.filter((shift: ShiftModel) => !shift.fromPlanningManager);
      }
    } else {
      this.listShift = this.listShift.concat(this.listShiftManagerLeader);
      this.listShiftEquip = this.listShiftEquipManagerLeader.filter((shift: ShiftModel) => !shift.fromPlanningManager);
    }
    const shiftSet = new Set();
    // removing-duplicates-in-an-array
    this.listShift = this.listShift.filter(shift => {
      const duplicate = shiftSet.has(shift.idShift);
      shiftSet.add(shift.idShift);
      return !duplicate;
    });
    this.markManagerLeaders(this.listShift);


    const fakeEmployee = new EmployeeModel();
    fakeEmployee.idEmployee = 0;
    fakeEmployee.nom = '';
    fakeEmployee.prenom = '';
    this.listShift.forEach((sh: ShiftModel) => {
      if (!sh.employee) {
        sh.employee = fakeEmployee;
      }
    });
    this.listShift = this.displayListShift(this.listShift);
    this.listShiftDefault = JSON.parse(JSON.stringify(this.listShift));
    this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);
    if (this._displayPlgManagers) {
      this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
    } else {
      this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
    }
    this.calculeTotalInWeekAndTotalInDayForShift();
    this.reCalculeHeight();
    this.getJourFeriesByRestaurant();
  }

  initValuesForVericationContrainte(event: any): void {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(event.day);
    this.showPopAddShift = false;
    this.getContratByEmployeeActif(event.employee, event.dateJournee, false);
  }

  verifContrainteEmployeeBeforeAffectation(event: any): void {
    const employeeToCheck = this.activeEmployeesPerWeek.find(emp => emp.idEmployee === event.selectedEmployee);
    this.shiftsToAssign = event.shiftsToAssign.filter(value => value.employee && !value.employee.nom);
    this.listContrainteAffectation = [];
    this.listContrainte = [];
    if (employeeToCheck) {
      this.employeeToAssign = employeeToCheck;
      if (event.shiftsToAssign.length) {
        event.shiftsToAssign.forEach(sh => sh.employee = this.clone(employeeToCheck));
        this.days.forEach((day: any) => {
          this.getContratByEmployeeActif(employeeToCheck, day.dateJournee, false, true);
        });
      } else {
        this.initEmployeeSelection();
        this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee, this.employeeToAssign);
      }

    }
  }

  private initEmployeeSelection(): void {
    this.planningFixRows.forEach(planningFix => {
      const fakeEmployee = new EmployeeModel();
      fakeEmployee.idEmployee = this.makeString();
      fakeEmployee.nom = '';
      fakeEmployee.prenom = '';
      planningFix.selectedEmployee = fakeEmployee;
    });
  }

  /**
   * Permet de grouper la liste des shiftes par employee
   * @param: list
   * @param: keyGetter
   */
  public groupShiftByEmployee(list, keyGetter, assignedEmployee?: EmployeeModel) {
    let searchedEmployeeIndexs = [];
    let listEmployeeHasShiftRefrence = [...this.listEmployeeHasShift];
    if (listEmployeeHasShiftRefrence.some(emp => isNaN(Number(emp.idEmployee)))) {
      listEmployeeHasShiftRefrence.forEach((employee: EmployeeModel, index: number) => {
        if (isNaN(Number(employee.idEmployee)) && this.shiftByEmployee.get(employee.idEmployee)) {
          searchedEmployeeIndexs.push(index);
        }
      });
    }

    this.listEmployeeHasShift = [];
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
        this.listEmployeeActif.forEach(employeeDisplay => {
          if (employeeDisplay.idEmployee === item.employee.idEmployee) {
            if (item.fromPlanningManager) {
              employeeDisplay.isManagerOrLeader = true;
            }
            this.listEmployeeHasShift.push(employeeDisplay);
          }
        });
      } else {
        collection.push(item);
      }
    });
    if (assignedEmployee && !this.listEmployeeHasShift.find((emp: EmployeeModel) => emp.idEmployee === assignedEmployee.idEmployee)) {
      this.listEmployeeHasShift.push(assignedEmployee);
    }
    const missingEmployees = listEmployeeHasShiftRefrence.filter(obj => this.listEmployeeHasShift.every((emp: EmployeeModel) => (emp.idEmployee !== obj.idEmployee)));
    this.listEmployeeHasShift = this.listEmployeeHasShift.concat(missingEmployees);
    this.sortEmployees(this.sortByFirstName);
    this.getHistoriqueOfPlanning();
    if (searchedEmployeeIndexs.length) {
      searchedEmployeeIndexs.forEach((ind: number) => {
        if (this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === listEmployeeHasShiftRefrence[ind].idEmployee) === -1 && this.shiftByEmployee.get(listEmployeeHasShiftRefrence[ind].idEmployee)) {
          this.listEmployeeHasShift.splice(ind, 0, listEmployeeHasShiftRefrence[ind]);
        }
      });
    }
    if (assignedEmployee) {
      this.listEmployeeHasShift = this.listEmployeeHasShift.filter((emp: EmployeeModel) => !isNaN(Number(emp.idEmployee)));
    }
    return map;
  }

  /**
   *Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe,
   * il faut garder et afficher l’historique des plannings
   */
  public getHistoriqueOfPlanning() {
    this.listEmployeeInactifHasShift = [];
    this.listShift.forEach(shift => {
      this.listEmployeeActif.forEach((employee: EmployeeModel) => {
          if (!employee.contrats) {
            employee.disableInactifEmployee = true;
          }
        }
      );
      // pour eviter la duplication
      const duplicate = this.listEmployeeInactifHasShift.some(employeeDisplay =>
        employeeDisplay.idEmployee === shift.employee.idEmployee
      );
      // ajpouter des managers pou leaders ont de plannings manager ou leader et non pas actif ou leurs groupes travails ont changés
      //  if (!exist && !duplicate) {
      //    shift.employee.disableInactifEmployee = true;
      //    this.listEmployeeInactifHasShift.push(shift.employee);
      //  }

    });
    //  this.listEmployeeHasShift = this.listEmployeeHasShift.concat(this.listEmployeeInactifHasShift);
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
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * recuperer tous les employes actifs et leurs shifts
   */
  private getActifsEmployeesWithShifts() {
    this.notificationService.startLoader();
    this.sessionService.setDateSelected(this.dateDebut.toDateString());
    this.employeeService.getEmployeesWithPlgEquipierAndManagerAndLeaderAndWeekShifts(this.selectedDate, true).subscribe((data: EmployeeModel[]) => {
      this.activeEmployeesPerWeek = data;
      this.listEmployeeActif = this.clone(data);
      // const fakeEmployee = new EmployeeModel();
      // fakeEmployee.idEmployee = -1;
      // fakeEmployee.nom = 'Shifts';
      // fakeEmployee.prenom = 'Non Affectés';
      // this.listEmployeeActif.push(fakeEmployee);
      this.listEmployeeActif.forEach(emp => {
        if (emp.idEmployee === 0) {
          emp.nom = 'Shifts';
          emp.prenom = 'Non Affectés';
        }
        emp.fullName = emp.nom + ' ' + emp.prenom;
      });
      this.getlistShiftByRestaurant();
      this.notificationService.stopLoader();
    }, (err: any) => {
      console.log(err);
      this.notificationService.stopLoader();
    });
  }

  private chargerJourReference(keepShift: boolean): void {
    this.withAffectation = 0;
    this.isClosed = false;
    this.synchroPlanningEquipierService.sendWeekLoading(this.choosenJourReference.semaine);
    const stringAsDate = this.dateService.formatToShortDate(this.dateDebut);
    this.listShiftDefaultAfterLoading = this.clone(this.listShift);
    this.activeEmployeesPerWeekWithDefault = this.clone(this.activeEmployeesPerWeek);
    this.listShiftToDeleteDefault = this.clone(this.listShiftToDelete);
    this.listShiftToUpdateDefault = this.clone(this.listShiftToUpdate);

    if (this.listContraintesSocialesByShift.size) {
      this.listContraintesSocialesByShiftDefault = new Map((this.clone(Array.from(this.listContraintesSocialesByShift))));
    }
    this.notificationService.startLoader();
    this.displayDialogChargerReferenceVueHebdo = false;
    if (!this.selectedValue) {
      this.withAffectation = 1;
    }
    this.planningReferenceService.chargerJourneeReference(this.choosenJourReference.libelle, stringAsDate, this.withAffectation).subscribe(async (loadedShiftOrEmploye: any) => {
      this.listContraintesSocialesByShift = new Map();
      // en cas d'écrassement
      if (!keepShift) {
        if (this.choosenJourReference.semaine) {
          const listShiftByWeek = await this.shiftService.getListShiftByWeekForRestaurant(stringAsDate).toPromise();
          listShiftByWeek.forEach((shift: ShiftModel) => {
            this.dateService.setCorrectTimeToDisplay(shift);
            this.listShiftToDelete.push(shift);
            if (shift.employee && shift.employee.idEmployee !== null) {
              const oldEmployeeIndex = this.activeEmployeesPerWeek.findIndex(val => val.idEmployee === shift.employee.idEmployee);
              if (oldEmployeeIndex !== -1) {
                const indexDayToUpdateInWeeklyPlg = this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd'));
                if (indexDayToUpdateInWeeklyPlg !== -1) {
                  const indexShiftToUpdateInListShiftWeek = this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shiftWeek => shiftWeek.idShift === shift.idShift);
                  if (indexShiftToUpdateInListShiftWeek !== -1) {
                    this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
                  }

                }
              }
            }

          });
        }
        // Delete week shifts to update total temps payé
        this.listShift.forEach((shift: ShiftModel) => {
          if (!isNaN(Number(shift.idShift))) {
            const indexShiftToDelete = this.listShift.findIndex((shiftToDelete: ShiftModel) => shiftToDelete.idShift === shift.idShift);
            if (indexShiftToDelete === -1) {
              this.listShiftToDelete.push(shift);
            }
            if (shift.employee && shift.employee.idEmployee !== null) {
              const oldEmployeeIndex = this.activeEmployeesPerWeek.findIndex(val => val.idEmployee === shift.employee.idEmployee);
              if (oldEmployeeIndex !== -1) {
                const indexDayToUpdateInWeeklyPlg = this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings.findIndex(val => val['dateJour'] === this.selectedDate);
                if (indexDayToUpdateInWeeklyPlg !== -1) {
                  const indexShiftToUpdateInListShiftWeek = this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shiftWeek => shiftWeek.idShift === shift.idShift);
                  if (indexShiftToUpdateInListShiftWeek !== -1) {
                    this.activeEmployeesPerWeek[oldEmployeeIndex].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
                  }

                }
              }
            }

          }
        });
        this.deleteShiftFromShiftFixeAfterOverwrite();
        this.listShift = [];
        this.listShiftToUpdate = [];
      }
      if (this.withAffectation) {
        //lors de chargement semaine de reference avec affectation
        this.ovewriteWeekWithAffecation(loadedShiftOrEmploye);
      } else {
        // total des shifts à ajouter au total temps planifié
        let totalShifts = 0;
        const fakeEmployee = new EmployeeModel();
        fakeEmployee.idEmployee = 0;
        fakeEmployee.nom = 'Shifts';
        fakeEmployee.prenom = 'Non Affectés';
        fakeEmployee.fullName = fakeEmployee.nom + ' ' + fakeEmployee.prenom;
        loadedShiftOrEmploye = this.shiftService.filterShifts(loadedShiftOrEmploye, this.frConfig, this.decoupageHoraireFinEtDebutActivity);

        loadedShiftOrEmploye.forEach((shift: ShiftModel) => {
          shift.jour = this.dateService.getJourSemaineFromInteger(new Date(shift.dateJournee).getDay());
          if (!shift.employee) {
            shift.employee = fakeEmployee;
          }

          this.dateService.setCorrectTimeToDisplayForShift(shift);
          totalShifts += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);

        });

        /*if (keepShift) {
          loadedShiftOrEmploye = loadedShiftOrEmploye.concat(this.listShift);
        }*/
        this.setListRefrenceToListShift(loadedShiftOrEmploye);

        this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);
        this.calculeTotalInWeekAndTotalInDayForShift();
        this.reCalculeHeight();
      }
      // calculeTotalInWeekAndTotalInDayForShift check pause and cs
      // tableau en bas en (takeBreakswithTime)
      //

      /*this.oldShiftNonAffecte =
        {
          'valueToSubstruct': 0,
          'valueToAdd': totalShifts
        };
      this.oldShiftNonAffecte = null;

      if (!keepShift) {
        this.employees = this.plgEquipierHelperService.getEmployeesList(this.employees, this.listShift);
      }*/
      this.notificationService.stopLoader();
      this.showChargerJourReferencePopupVueHebdo = false;
    }, (err: any) => {
      this.notificationService.stopLoader();
      this.showChargerJourReferencePopupVueHebdo = false;
      console.log(err);
    });
  }

  private deleteShiftFromShiftFixeAfterOverwrite() {
    this.listShift = this.listShift.filter((sh: ShiftModel) => !sh.fromShiftFix);

    this.activeEmployeesPerWeek.forEach((employee: EmployeeModel) => {
      employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        wdp.shifts = wdp.shifts.filter((sh: ShiftModel) => !sh.fromShiftFix);
      });
    });
  }

  /**
   * Ajouter shift dans la list des shifts lors de chargement de Semaine de reference
   */
  private setListRefrenceToListShift(listShift: any[]): void {
    listShift.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      shift.idShift = this.makeString();
      this.listShiftToUpdate.push(this.clone(shift));

    });
    this.listShift = this.listShift.concat(listShift);
    this.planningEquipieService.setListShift(this.listShift);


    this.shiftToSave = null;
    this.selectedEmployee = null;

  }

  /**
   * get restaurant
   */
  private getSelectedRestaurant() {
    if (this.sharedRestaurant.selectedRestaurant.idRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant !== 0) {
      this.setColumns();
      this.getPaysOfRestaurant();
    } else {
      this.sharedRestaurant.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurant.selectedRestaurant = data;
          this.setColumns();
          this.getPaysOfRestaurant();

        }, (err: any) => {
          console.log(err);
        }
      );
    }

  }

  /**
   * commencer les jours  de semaine par preimere jour de semaine de restaurant
   */
  private setColumns() {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine
    (this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.frConfig = this.dateService.getCalendarConfig(this.firstDayAsInteger);
    this.weekDates = [];
    this.days = [];
    for (let i = 0; i < 7; i++) {
      const startDate = this.clone(this.dateDebut);
      const dateJournee = this.datePipe.transform(new Date(startDate.setDate(startDate.getDate() + i)), 'yyyy-MM-dd');
      this.days.push({
        column: this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        val: this.convertStringToCamelCase(this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        dateJournee: dateJournee
      });
      this.weekDates.push(dateJournee);

      this.days.push();
    }
    this.days = JSON.parse(JSON.stringify(this.days));
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
  private getListePositionTravailActiveByRestaurant() {
    this.positionTravailService.getAllActivePositionTravailByRestaurant().subscribe(
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
   * Ajouter ou modifier une nouvelle card de shift
   * @param: cardDetails
   */
  public addOrUpdateNewShiftCard(shift: ShiftModel): void {
    this.hiddenSave = false;
    this.shiftToSave = {...shift};
    if (this.canAddShift(this.shiftToSave)) {
      if (!shift.employee.idEmployee || isNaN(Number(shift.employee.idEmployee)) || this.calculeTotalInWeekAndTotalInDayForShift(this.shiftToSave)) {
        if (shift.employee.idEmployee && !isNaN(Number(shift.employee.idEmployee))) {
          const collection = this.clone(this.shiftByEmployee.get(shift.employee.idEmployee));
          this.takeBreakswithTime(collection ? collection : [], shift.employee.idEmployee, this.listLoi, this.tempsTravailPartiel, this.mineur, shift);
        }
        if (shift.idShift) {
          // update
          this.updateShift();
        } else {
          // add new
          this.addNewShift();
        }
      } else {
        this.popupVerificationContrainteVisibility = true;
      }
    }
  }

  private getModeDispaly(newShift: ShiftModel): number {
    return this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, this.dateService.getDateOfEnumertionJour(newShift.jour), this.dateService).updatedModeAffichage;

  }

  /**
   * Verification  de l'horraire du planning shift
   * on ne peut pas avoir des horaires confondues
   */
  public canAddShift(shift: ShiftModel, isDragAndDrop?: boolean): boolean {
    this.dateService.setCorrectTimeToDisplayForShift(shift);
    shift.heureDebut = this.dateService.setSecondAndMilliSecondsToNull(shift.heureDebut);
    shift.heureFin = this.dateService.setSecondAndMilliSecondsToNull(shift.heureFin);

    const shiftToSave = this.clone(shift);
    this.dateService.setCorrectTimeToDisplayForShift(shiftToSave);
    if (isDragAndDrop) {
      this.getStartTimeAndEndTimeFromDecoupageHoraire(shiftToSave.jour);
      this.getStartAndEndActivityDay(shift.dateJournee);
      if (shiftToSave.acheval) {
        shiftToSave.modifiable = true;
      }

      if ((!shiftToSave.acheval || this.getModeDispaly(shiftToSave) === 0) && (moment(shiftToSave.heureFin).isAfter(this.endActivity) || moment(shiftToSave.heureDebut).isBefore(this.startActivity))) {
        this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_EQUIPIER.END_START_ERROR_LIMIT_ACTIVITY');
        return false;
      }
    }
    if (!shiftToSave.employee.idEmployee || !this.shiftByEmployee.get(shiftToSave.employee.idEmployee) || (this.shiftByEmployee.get(shiftToSave.employee.idEmployee) && this.shiftByEmployee.get(shiftToSave.employee.idEmployee).length === 0)) {
      return true;
    } else {
      let canAdd = true;
      let collection = this.clone(this.shiftByEmployee.get(shiftToSave.employee.idEmployee));
      collection = collection.filter((shiftDisplay: ShiftModel) => !shiftDisplay.acheval || !shiftDisplay.shiftAchevalHidden);

      if (this.modeAffichage !== 0) {
        collection = collection.concat(this.addShiftAchevalInCurrentList(this.clone(shiftToSave), collection, true));

      }
      collection.forEach(shiftDisplay => {
        this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
        if (shiftToSave.idShift !== shiftDisplay.idShift) {
          if (shiftToSave.dateJournee instanceof Date) {
            shiftToSave.dateJournee.setHours(0, 0, 0, 0);
          }
          if (shiftDisplay.dateJournee instanceof Date) {
            shiftDisplay.dateJournee.setHours(0, 0, 0, 0);
          }
          if (moment(shiftDisplay.dateJournee).isSame(shiftToSave.dateJournee) || shiftDisplay.sameDateToShiftAcheval) {
            const lastValue = shiftDisplay;
            // condition dans l'intervaele

            if (lastValue.idShift !== shiftToSave.idShift) {
              const plannedDate = shiftToSave.dateJournee;
              shiftToSave.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureDebut), shiftToSave.heureDebutIsNight);
              shiftToSave.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureFin), shiftToSave.heureFinIsNight);
              const plannedDateLastValue = lastValue.dateJournee;
              lastValue.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDateLastValue, lastValue.heureDebut), lastValue.heureDebutIsNight);
              lastValue.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDateLastValue, lastValue.heureFin), lastValue.heureFinIsNight);
              if ((moment(lastValue.heureDebut).isSameOrBefore(shiftToSave.heureDebut) &&
                  moment(lastValue.heureFin).isAfter(shiftToSave.heureDebut)) ||
                (moment(lastValue.heureDebut).isBefore(shiftToSave.heureFin) &&
                  moment(lastValue.heureFin).isSameOrAfter(shiftToSave.heureFin)) ||
                (moment(lastValue.heureDebut).isSameOrAfter(shiftToSave.heureDebut) &&
                  (moment(lastValue.heureFin).isSameOrBefore(shiftToSave.heureFin))
                )) {
                canAdd = canAdd && false;
              }
            }
          }
        }
      });
      if (!canAdd) {
        this.horraireConfonduesErrorMessage(isDragAndDrop);
      }
      return canAdd;
    }
  }

  public getEmployeesToAdd(): void {
    const data = {
      'employeesShifts': [],
      'listShiftUpdate': [],
      'shiftsToAssign': []
    };
    this.employeeService.getEmployeesWithPlgEquipier(this.selectedDate, data).subscribe((res: any) => {
      const newEmployeesToDisplay = [];
      this.listEmployeeToAdd = [];
      const keys = Object.keys(ProposeAction);
      keys.forEach((key: any) => {
        if (res[key]) {
          let groupedEmployees;
          if (key === ProposeAction.FIRST_GROUP) {
            groupedEmployees = {label: '', items: []};
          } else {
            groupedEmployees = {label: this.rhisTranslateService.translate(`PROPOSE.${key}`), items: []};
          }
          res[key].forEach((newEmployee: any) => {
            newEmployee.employee.fullName = newEmployee.employee.nom + ' ' + newEmployee.employee.prenom;
            this.listEmployeeToAdd.push(this.clone(newEmployee.employee));
            groupedEmployees.items.push(
              {
                label: newEmployee.employee.prenom + ' ' + newEmployee.employee.nom,
                value: newEmployee.employee.idEmployee
              }
            );
          });
          newEmployeesToDisplay.push(groupedEmployees);
        }
      });
      // this.newEmployeesList.emit({
      //   listEmployees: newEmployeesToDisplay,
      //   newEmployees: newEmployees,
      //   loadEditOrAdd: false

      // });

    });
  }

  /**
   * Cette methode permet d'afficher un message d'erreur en cas ou les horaires sont confondues
   */
  public horraireConfonduesErrorMessage(isDragAndDrop?: boolean) {
    // en cas de drag and drop
    this.messageConfonduShift = '';
    if (isDragAndDrop) {
      this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');
    } else {
      this.messageConfonduShift = this.rhisTranslateService.translate('PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');

    }
  }

  /**
   * reset message  du chevauchement des heures
   */
  public resetMessageConfonduShift(): void {
    this.messageConfonduShift = '';
  }

  /**
   * modifier shift
   */
  private updateShift(): void {
    this.shiftToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
    this.updateShiftAfterSave();
  }

  /**
   * meesage de sauvegarde shift
   */
  private displaySuccesSauvegardeMessage(): void {
    this.notificationService.showSuccessMessage('PLANNING_EQUIPIER.SHIFT_MODIFIED', 'PLANNING_EQUIPIER.UPDATE_MESSAGE_HEADER');
  }

  /**
   * ajouter nouveau shift
   */
  private addNewShift(): void {
    this.shiftToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
    this.setNewShiftToListShift();
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
        message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
        header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
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
   * Cette méthode permet de sauvegarder une journée/semaine comme référence
   */
  public saveDayWeekAsReference() {
    this.isSubmitted = true;
    const data = {
      'libelle': this.saveReferenceForm.controls['referenceName'].value,
      'semaine': true,
      'dateJournee': this.dateDebut,
      'dateDebut': this.dateDebut,
      'dateFin': this.dateFin
    };
    if (this.saveReferenceForm.valid) {
      this.planningReferenceService.addUpdateDayOrWeekAsReference(data).subscribe(res => {
          this.notificationService.showSuccessMessage('PLANNING_EQUIPIER.SAVE_REFERENCE_MESSAGE');
        }, console.log
      );
      this.showSaveReferencePopup = false;
      this.isSubmitted = false;
    }
  }

  /**
   * check if reference alreday exists in list
   */
  public checkReferenceExistance() {
    this.refExist ? this.ecraserReferenceConfirmation() : this.saveDayWeekAsReference();
  }

  /**
   * Pop up for confirmation d'ecrasement reference'
   */
  public ecraserReferenceConfirmation() {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PLANNING_EQUIPIER.REFERENCE_POPUP_MESSAGE'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveDayWeekAsReference();
      },
      reject: () => {
      }
    });
  }

  /**
   * Ouvrir Popup save day/week as reference
   */
  public async openSaveReferencePopup(): Promise<void> {
    this.getReferenceList();
    this.choosenDayReferenceDeletedLibelleError = false;
    this.variableTabReference.selected = true;
    this.variableTabDelete.selected = false;
    this.popupTitle = this.rhisTranslateService.translate('PLANNING_REFERENCE.TAB_TITLE');
    this.showSaveReferencePopup = true;
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

  }

  /**
   * Cette méthode permet de récupérer la liste des journées/semaines de référence
   */
  public getReferenceList(openChargerJourReference?: boolean) {
    this.notificationService.startLoader();
    this.planningReferenceService.getReferenceListInWeek().subscribe((result: PlanningJourReferenceModel[]) => {
      this.notificationService.stopLoader();
      if (result) {
        this.shiftReferenceList = result.filter(val => val.libelle !== null);
        if (openChargerJourReference) {
          this.showChargerJourReferencePopupVueHebdo = true;
        }
      }
    }, error => {
      this.notificationService.stopLoader();
      this.shiftReferenceList = [];
    });
  }

  /**
   * Cette methode permet d'ouvrir la popup de charger jour/semaine de reference
   */
  public async openChargerReferencePopup(): Promise<void> {
    if (this.updateButtonControl()) {
      this.choosenJourReference = {semaine: false};
      this.choosenJourReferenceLibelleError = false;
      this.getReferenceList(true);
    }
  }

  public prepareToLoadJourReference(): void {
    if (!this.choosenJourReference.libelle) {
      this.choosenJourReferenceLibelleError = true;
    } else {
      // check if there is shifts in current day
      if (this.listShift.length) {
        this.displayDialogChargerReferenceVueHebdo = true;
        setTimeout(() => {
          this.displayDialogChargerReferenceToKeepOrReplaceShifts();
        }, 100);
      } else {
        // check if there is shifts in whole week
        this.checkIfThereIsShiftsForCurrentWeek();
      }
    }
  }

  private checkIfThereIsShiftsForCurrentWeek(): void {
    const stringAsDate = this.dateService.formatToShortDate(this.dateDebut);
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
      message: this.rhisTranslateService.translate('PLANNING_EQUIPIER.QUE_VOULEZ_VOUS_REFAIRE'),
      header: this.rhisTranslateService.translate('PLANNING_EQUIPIER.CHARGER_REF_TITLE'),
      key: 'dialogChargerReferenceViewHebdo',
      icon: 'pi pi-info-circle',
    });
  }

  public ecraserShiftsForReference(): void {
    this.overwriteShifsReference = 1;
    this.showChargerJourReferencePopupVueHebdo = false;
    this.displayDialogChargerReferenceVueHebdo = false;
    setTimeout(() => this.displayDialogChargerReferenceVueHebdo = true, 100);
    this.chargerJourReference(false);
  }

  public keepShifstForReference(): void {
    this.overwriteShifsReference = 0;
    this.showChargerJourReferencePopupVueHebdo = false;
    this.displayDialogChargerReferenceVueHebdo = false;
    setTimeout(() => this.displayDialogChargerReferenceVueHebdo = true, 100);
    this.chargerJourReference(true);
  }

  /**
   *  créer une nouvelle ligne Poste
   */
  public newEmployee(): void {
    if (!this.checkEmptyLine()) {
      this.addEmployeeLine();
    }
  }

  private checkEmptyLine(): boolean {
    let emptyLine = false;
    const nonAssignedLines = this.listEmployeeHasShift.filter((emp: EmployeeModel) => isNaN(Number(emp.idEmployee)));
    if (nonAssignedLines && nonAssignedLines.length) {
      nonAssignedLines.forEach(line => {
        const lineShifts = this.shiftByEmployee.get(line.idEmployee);
        if (lineShifts && lineShifts.length) {
          return false;
        } else {
          emptyLine = true;
        }
      });
      return emptyLine;
    } else {
      return emptyLine;
    }
  }

  /**
   * Ajout employee en cours : on affiche le formulaire contenant la selectbox
   * @param: event
   */
  public employeeAdded(event) {
    const employeeToAdd = this.listEmployeeActif.findIndex(emp => emp.idEmployee === event.idEmployee);
    this.listEmployeeHasShift[this.listEmployeeHasShift.length - 1] = this.listEmployeeActif[employeeToAdd];
    this.shiftByEmployee.set(this.listEmployeeActif[employeeToAdd].idEmployee, []);
  }

  /**
   * desaffecterEmployee
   */
  public desaffecterEmployee(event: any) {
    const employeeToRemove = this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === event.employeeDesaffecte.idEmployee);
    if (employeeToRemove !== -1) {
      this.listEmployeeHasShift.splice(employeeToRemove, 1, event.newFakeEmployee);
    }
    this.listShift.forEach(sh => {
      if (sh.employee.idEmployee === event.employeeDesaffecte.idEmployee) {
        sh.employee = event.newFakeEmployee;
        this.listShiftToUpdate.push({...sh});
        this.listContraintesSocialesByShift.delete(sh.idShift);

      }
    });
    this.shiftByEmployee.set(event.newFakeEmployee.idEmployee, this.listShift.filter(sh => sh.employee.idEmployee === event.newFakeEmployee.idEmployee));

    //  this.shiftByEmployee.set(this.listEmployeeActif[employeeToAdd].idEmployee, []);
    //  if(this.newEmployeesToAdd){
    //    this.addEmployeeLine(this.newEmployeesToAdd);
    //  }
  }

  /**
   * Ajouter une nouvelle ligne employé
   */
  private addEmployeeLine(): void {
    const fakeEmployee = new EmployeeModel();
    fakeEmployee.idEmployee = this.makeString();
    fakeEmployee.nom = '';
    fakeEmployee.prenom = '';
    this.listEmployeeHasShift.splice(0, 0, fakeEmployee);
    this.shiftByEmployee.set(fakeEmployee.idEmployee, this.listShift.filter(sh => sh.employee.idEmployee === fakeEmployee.idEmployee));
  }

  public sortEmployees(sortByFirstName: boolean): void {
    this.sortByFirstName = sortByFirstName;
    const fakeEmpIndex = this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === 0);
    let deletedElement: EmployeeModel[];
    if (fakeEmpIndex !== -1) {
      deletedElement = this.listEmployeeHasShift.splice(fakeEmpIndex, 1);
    }
    if (sortByFirstName) {
      this.plgHebdoHelperService.sortListEmployeesByFirstName(this.listEmployeeHasShift);
    } else {
      this.plgHebdoHelperService.sortListEmployeesByLastName(this.listEmployeeHasShift);
    }
    if (deletedElement && deletedElement.length) {
      this.listEmployeeHasShift.push(deletedElement[0]);
    }
  }

  /**
   * calcule total of shift of employee for day/week
   */
  private calculeTotalInWeekAndTotalInDayForShift(shift?: any, isAssigned?: boolean, affectationViewHebdo?: boolean): any {
    let totalInDay = 0;
    let cummuleTotal = 0;

    if (shift) {
      const employeHaslaw = this.listEmployeeActif.find(item => item.idEmployee === shift.employee.idEmployee);
      if (employeHaslaw && employeHaslaw.idEmployee && employeHaslaw.loiEmployee && employeHaslaw.loiEmployee.length) {
        this.listLoi = employeHaslaw.loiEmployee;
      }

      this.employeeHasAnomalieContraintSocial = shift.employee;
      if (this.shiftByEmployee.get(shift.employee.idEmployee)) {
        this.shiftByEmployee.get(shift.employee.idEmployee).forEach(shiftDisplay => {
          if (shift.idShift !== shiftDisplay.idShift) {
            if (shift.jour === shiftDisplay.jour) {
              totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
            }
            cummuleTotal += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          }
        });
      }
      cummuleTotal += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      cummuleTotal = +this.dateService.convertNumberToTime(cummuleTotal);
      this.dateContraintSocial = this.dateService.formatToShortDate(shift.dateJournee, '/');
      this.totalRowTime = cummuleTotal;
      totalInDay = +this.dateService.convertNumberToTime(totalInDay);
      this.shiftHasAnomalieContraintSocial = shift;
      return this.verifContrainte(shift, isAssigned, affectationViewHebdo);

    } else {
      this.calculeTempsPlanifieForAllEmploye();
    }
  }

  private verifContrainte(shift: ShiftModel, isAssigned?: boolean, affectationViewHebdo?: boolean): void {
    const employeVerifCs = {
      listLoi: this.listLoi,
      tempsTravailPartiel: this.tempsTravailPartiel,
      mineur: this.mineur,
      contratActif: this.contratActif
    };
    const paramDate = {
      selectedDate: this.dateDebut,
      premierJourDeLaSemaine: this.premierJourDeLaSemaine,
      limiteHeureDebut: this.limiteHeureDebut
    };

    const paramWeek = {
      jourDebutWeekEnd: this.jourDebutWeekEnd,
      jourFinWeekEnd: this.jourFinWeekEnd,
      heureDebutWeekEnd: this.heureDebutWeekEnd,
      heureFinWeekEnd: this.heureFinWeekEnd
    };
    let listShiftSemaineByEmployee = [];
    const listShiftWithSign = [];
    if (this.shiftByEmployee.get(shift.employee.idEmployee)) {
      listShiftSemaineByEmployee = this.shiftByEmployee.get(shift.employee.idEmployee);
    }
    let collection = this.shiftByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (isAssigned) {
      if (collection) {
        collection = collection.forEach((shiftDisplay: ShiftModel, index: number) => {
          if (shiftDisplay.idShift === shift.idShift) {
            collection.splice(index, 1);
          }
        });
      }

      let shiftsToAssigneDisplay = this.clone(this.shiftsToAssign);
      shiftsToAssigneDisplay = shiftsToAssigneDisplay.filter((shiftDisplay: ShiftModel) => shiftDisplay.idShift === shift.idShift || moment(shiftDisplay.dateJournee).isSameOrBefore(shift.dateJournee));
      collection = collection ? shiftsToAssigneDisplay.concat(collection) : shiftsToAssigneDisplay;
    }
    let listShiftInWeek = [];
    if (collection) {
      collection.forEach(element => listShiftInWeek.push(this.clone(element)));
      listShiftInWeek = listShiftInWeek.filter((shiftDisplay: ShiftModel) => !shiftDisplay.acheval || !shiftDisplay.shiftAchevalHidden);
    }

    const exists = !!listShiftInWeek.find(item => item.idShift === shift.idShift);
    if (!exists) {
      listShiftInWeek.push(shift);
    } else {
      listShiftInWeek.forEach((item: ShiftModel, index: number) => {
        // en cas de drag and drop pour ajouter un shift a un list de planning  par eemployee si old emp est differ a le nouveau emplpoyee
        if (shift.idShift === item.idShift) {
          item = shift;
          listShiftInWeek[index] = shift;
        }
      });
    }

    const result = this.verificationContraintePlanningEquipierService.verifContraintes(shift, this.oldShift, employeVerifCs, this.employeeHasAnomalieContraintSocial, this.activeEmployeesPerWeek, this.listContraintesSocialesByShift, listShiftSemaineByEmployee, listShiftWithSign, this.messageVerification, this.listContrainte, this.dateContrainteAcheve, this.popupVerificationContrainteVisibility, this.listContrainteSuppression, this.weekDates, this.paramNationaux, this.listOfBreakAndShift, this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd, this.modeAffichage, this.listJourFeriesByRestaurant, this.semaineRepos, paramDate, paramWeek, this.hiddenSaveGlobale, this.hiddenSave, isAssigned, listShiftInWeek, this.listInthreeWeek, affectationViewHebdo);
    ['listContrainte', 'messageVerification', 'dateContrainteAcheve', 'popupVerificationContrainteVisibility', 'listShiftWithSign', 'listShiftSemaineByEmployee', 'newActiveEmployees', 'listContrainteSuppression', 'listContraintesSocialesByShift', 'hiddenSaveGlobale', 'hiddenSave'].forEach(item => this[item] = result[item]);
      result.listContrainte.forEach(element => {
        if ((!element.idShift  && isAssigned) || !isAssigned) {
          element.idShift = shift.idShift;
          element.employe = this.employeeHasAnomalieContraintSocial;
          element.dateOfAnomalie = this.dateService.formatToShortDate(shift.dateJournee, '/');

        }
      });

    return result.socialeConstraintesAreValid;
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieForAllEmploye(): Promise<void> {
    for (const employeDisplay of this.listEmployeeHasShift.filter(emp => !emp.disableInactifEmployee)) {
      if (employeDisplay.contrats && employeDisplay.contrats.length && (employeDisplay.contrats[0].groupeTravail.plgEquip || employeDisplay.contrats[0].groupeTravail.plgLeader || employeDisplay.contrats[0].groupeTravail.plgMgr)) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.clone(this.totalRowTime);
      }
    }
    this.listEmployeeHasShift = [...this.listEmployeeHasShift];
  }

  /**
   * Prendre en compte les pauses dans les compteur de temps
   * calcul des temps planifiés
   *   soustraire au temps planifié la valeur du temps minimum d’un break
   * @param listShift
   * @param listLoi
   * @param tempsTravailPartiel
   * @param mineur
   * @param shift
   */
  private takeBreakswithTime(listShift: ShiftModel[], idEmployee: number, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, shift?: ShiftModel): void {
    if (!isNaN(Number(idEmployee))) {
      let totalInDay = 0;
      let nbrShiftInDay = 0;
      let pause = 0;
      let totalInWeek = 0;
      let shiftToUpdate = {} as ShiftModel;
      const tempsAffecteData = [];
      listShift = listShift.filter((shift: ShiftModel) => !shift.acheval || !shift.shiftAchevalHidden);

      if (shift) {
        if (!shift.idShift) {
          listShift.push(shift);
        } else {
          const indexShiftToReplace = listShift.findIndex((sh: ShiftModel) => shift.idShift && sh.idShift === shift.idShift);
          if (indexShiftToReplace !== -1) {
            shiftToUpdate = {...listShift[indexShiftToReplace]};
            listShift[indexShiftToReplace] = shift;
            // listShift[index] = shift;
          } else {
            listShift.push(shift);
          }
        }
      }
      this.days.forEach((day: any, indexDay: number) => {
        let listShiftByDay = this.plgHebdoHelperService.grouperShiftParJour(day.val, listShift);
        const indexEmployee = this.activeEmployeesPerWeek.findIndex((val: EmployeeModel) => val.idEmployee === idEmployee);
        if (indexEmployee !== -1) {
          const employeHasContrat = this.contrainteSocialeService.getContratByDay(this.clone(this.activeEmployeesPerWeek[indexEmployee]), new Date(JSON.parse(JSON.stringify(day.dateJournee))), true);
          if (!employeHasContrat.contrats) {
            listShiftByDay = [];
          }
          const dayToCheck = this.activeEmployeesPerWeek[indexEmployee].weekDetailsPlannings.findIndex((val: WeekDetailsPlanning) => val['dateJour'] === day.dateJournee);
          if (dayToCheck !== -1 && this.activeEmployeesPerWeek[indexEmployee].weekDetailsPlannings[dayToCheck].libelleAbsence !== '') {
            listShiftByDay = [];
          }
        }
        this.correctTimeBeforCalculHour(listShiftByDay);
        this.sortListShift(listShiftByDay);
        nbrShiftInDay = 0;
        pause = 0;
        totalInDay = 0;
        let totalMinutes = 0;
        let totalCurrent = 0;
        let totalCureent = 0;
        let employeHaslaw;
        let totalCurrentAcheval = 0;
        let totalCureentAcheval = 0;
        let timeToSubstructCurrent = false;

        listShiftByDay.forEach((shiftByDay: ShiftModel, index: number) => {
          timeToSubstructCurrent = false;
          const shiftDisplay = this.clone(shiftByDay);
          const numJour = this.dateService.getIntegerValueFromJourSemaine(shiftDisplay.jour);
          const lastDay = this.days[(this.days.length - 1)];
          const numJourLastWeek = this.dateService.getIntegerValueFromJourSemaine(lastDay.val.toUpperCase());

          if (shiftDisplay.modifiable && shiftDisplay.acheval && this.modeAffichage === 2) {
            const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shiftDisplay));
            if (shiftDuplicate) {
              listShift.push(shiftDuplicate);
            }
          }
          if (shiftDisplay.jour === day.val.toUpperCase() && shiftDisplay.employee.idEmployee) {
            totalMinutes += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
            totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
            employeHaslaw = this.listEmployeeActif.find(item => item.idEmployee === shiftDisplay.employee.idEmployee);
            employeHaslaw.loiEmployee = listLoi;
            if (this.modeAffichage === 2 && shiftDisplay.acheval) {
              let nextOrPreviousShiftAcheval;
              if (shiftDisplay.modifiable && this.days[indexDay + 1]) {
                nextOrPreviousShiftAcheval = this.plgHebdoHelperService.grouperShiftParJour(this.days[indexDay + 1].val, listShift);
              } else if (this.days[indexDay - 1]) {
                nextOrPreviousShiftAcheval = this.plgHebdoHelperService.grouperShiftParJour(this.days[indexDay - 1].val, listShift);
              }

              if (nextOrPreviousShiftAcheval && nextOrPreviousShiftAcheval.length) {
                nextOrPreviousShiftAcheval = nextOrPreviousShiftAcheval.filter((shift: ShiftModel) => !shift.acheval);
                this.sortListShift(nextOrPreviousShiftAcheval);
              }
              if (numJour !== numJourLastWeek || (numJour === numJourLastWeek && !shiftDisplay.modifiable) || (numJour === numJourLastWeek && shiftDisplay.modifiable && this.modeAffichage === 2)) {
                this.shiftService.setStatutLongerAndTimeTosubstructToShiftAcheval(shiftDisplay, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, nextOrPreviousShiftAcheval, employeHaslaw);
              } else {
                shiftDisplay.longer = true;
              }
            }
            totalCurrent = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
            if (shiftDisplay.acheval && this.modeAffichage === 2) {
              totalCurrentAcheval = this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
              totalCureentAcheval = totalCurrentAcheval;
            }
            if (this.paramNationaux.payerLeBreak) {
              if (listShiftByDay.length > 1) {
                let dureeMinBreak;
                let dureeMinBreakLast;
                totalCureent = totalCurrent;
                if (!shiftDisplay.acheval || this.modeAffichage !== 2 || (shiftDisplay.acheval && shiftDisplay.longer && this.modeAffichage === 2)) {
                  totalCurrent = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, employeHaslaw, this.paramNationaux, this.listOfBreakAndShift);
                } else if (shiftDisplay.acheval && !shiftDisplay.longer && this.modeAffichage === 2) {
                  totalCureentAcheval = totalCureentAcheval - shiftDisplay.timeToSubstruct;
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
                if (totalCurrent === totalCureent && !dureeMinBreak && !dureeMinBreakLast) {
                  totalInDay = totalInDay - totalCureent;
                }

                // si le shift courant a un pause
                if ((totalCurrent < totalCureent || totalCurrentAcheval < totalCureentAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
                  if (!shiftDisplay.acheval || this.modeAffichage !== 2 || (shiftDisplay.acheval && shiftDisplay.longer && this.modeAffichage === 2)) {
                    totalInDay = totalInDay - totalCureent;
                    totalMinutes = totalMinutes - totalCureent;
                    totalMinutes = totalMinutes + totalCurrent;
                  } else if (shiftDisplay.acheval && totalCurrentAcheval < totalCureentAcheval) {
                    timeToSubstructCurrent = true;
                    totalInDay -= shiftDisplay.timeToSubstruct;
                    totalMinutes -= shiftDisplay.timeToSubstruct;
                    totalInDay = totalInDay - totalCureentAcheval;
                    totalMinutes = totalMinutes - totalCureentAcheval;
                    totalMinutes = totalMinutes + totalCurrentAcheval;
                  }
                  if (listShiftByDay[index - 1]) {
                    const shiftTobreak = {...listShiftByDay[index - 1]};
                    const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
                    totalInDay = totalInDay - nbrHourLast;
                  }

                } else if (listShiftByDay[index - 1] && (!listShiftByDay[index + 1] || !dureeMinBreak)) {
                  const shiftTobreak = {...listShiftByDay[index - 1]};
                  if (shiftDisplay.acheval && this.modeAffichage === 2 && shiftDisplay.timeToSubstruct) {
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
          if (shiftDisplay.acheval && this.modeAffichage === 2 && !timeToSubstructCurrent && shiftDisplay.timeToSubstruct) {
            totalMinutes -= shiftDisplay.timeToSubstruct;
            if (totalInDay) {
              totalInDay -= shiftDisplay.timeToSubstruct;
            }
          }
          const data = {
            'day': day.val,
            'value': totalMinutes
          };
          const dayIndex = tempsAffecteData.findIndex(val => val.day === data.day);
          if (dayIndex === -1) {
            tempsAffecteData.push(data);
          } else {
            tempsAffecteData.splice(dayIndex, 1, data);
          }
        });
        totalInWeek += totalMinutes;
        this.totalRowTime = +this.dateService.convertNumberToTime(totalInWeek);
        const indexEmp = this.activeEmployeesPerWeek.findIndex(emp => emp.idEmployee === idEmployee);
        if (indexEmp !== -1) {
          this.activeEmployeesPerWeek[indexEmp].tempsAffecteData = tempsAffecteData;
        }
      });
      if (shift) {
        listShift.splice((listShift).findIndex(shift => shift.idShift === shift.idShift), 1);
        if (shift.idShift) {
          listShift.push(shiftToUpdate);
        }
      }
      if (this._displayPlgManagers) {
        this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
        this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
      } else {
        this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
        this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
      }
    }
  }


  /**
   * s'il y a une contrainte bloquante, on bloque l'ajout du shift
   */
  public getBlockedConstraint(): boolean {
    let areBlocked = false;
    this.hiddenSave = false;
    this.listContrainte.forEach(item => {
      areBlocked = areBlocked || item.bloquante;
      if (item.bloquante) {
        this.hiddenSave = true;
      }
    });
    if (this.listContrainteSuppression && this.listContrainteSuppression.length) {
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
    this.popupVerificationContrainteGlobaleVisibility = false;
    if (this.employeeToAssign) {
      this.initEmployeeSelection();
    }
    this.eventCtrl = false;
    this.employeeToAssign = null;
    this.checkNavigationAway.emit();
  }

  public closePopupLoadingWeekRefrence() {
    if (!this.isClosed) {
      this.withAffectation = 0;
      if (this.listContraintesSocialesByShiftDefault.size) {

        this.listContraintesSocialesByShift = new Map(this.clone(Array.from(this.listContraintesSocialesByShiftDefault)));
      }else {
        this.listContraintesSocialesByShift = new Map();
      }
      this.listShift = this.listShiftDefaultAfterLoading;
      this.activeEmployeesPerWeek = this.activeEmployeesPerWeekWithDefault;
      this.listShiftToUpdate = this.listShiftToUpdateDefault;
      this.listShiftToDelete = this.listShiftToDeleteDefault;
    }
    this.popupVerificationContrainteLoadingWeekVisibility = false;

  }

  public saveWeekReference() {
    this.isClosed = true;
    this.popupVerificationContrainteLoadingWeekVisibility = false;
    this.getlistShiftByRestaurant();

  }

  /**
   * Enregistrer shift si aucune contrainte bloquante

   */
  public save(): void {
    if (!this.getBlockedConstraint()) {
      if (this.shiftToSave && this.shiftToSave.employee) {
        let collection = this.clone(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
        if (!collection) {
          collection = [];
        }
        this.takeBreakswithTime(collection, this.shiftToSave.employee.idEmployee, this.listLoi, this.tempsTravailPartiel, this.mineur, this.shiftToSave);
        if (this.shiftToSave.idShift) {
          this.updateShift();
        } else {
          this.addNewShift();
        }
      } else {
        if (this.eventCtrl) {
          this.copieShift(this.shiftToSave);
        } else if (this.shiftsToAssign && this.shiftsToAssign.length) {
          if (!this.listEmployeeHasShift.find((emp: EmployeeModel) => emp.idEmployee === this.employeeToAssign.idEmployee)) {
            const indexEmptyLine = this.listEmployeeHasShift.findIndex((emp: EmployeeModel) => isNaN(Number(emp.idEmployee)));
            if (indexEmptyLine !== -1) {
              this.listEmployeeHasShift.splice(indexEmptyLine, 1, this.employeeToAssign);
            } else {
              this.listEmployeeHasShift.push(this.employeeToAssign);
            }
          }
          this.initEmployeeSelection();
          this.assignShifts();
        } else {
          this.moveShiftCard(this.shiftToSave);
        }
      }
      this.popupVerificationContrainteVisibility = false;
    } else {
      this.popupVerificationContrainteVisibility = true;
      this.showPopAddShift = false;

    }
    if (this.shiftsToAssign && this.shiftsToAssign.length) {
      this.shiftsToAssign.forEach(sh => {
        this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(sh.idShift, this.listContrainte.filter(value => value.idShift === sh.idShift), this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
      });
    } else {
      this.listContraintesSocialesByShift = this.verificationContraintePlanningEquipierService.contraintesSocialesByEmployee(this.shiftHasAnomalieContraintSocial.idShift, this.listContrainte.filter(value => value.idShift === this.shiftHasAnomalieContraintSocial.idShift), this.listContraintesSocialesByShift, this.employeeHasAnomalieContraintSocial);
    }
    this.updatePlanningFixRowInterface();
  }

  public assignShifts(): void {
    this.shiftsToAssign.forEach((shiftToAssign: ShiftModel) => {
      shiftToAssign.employee.listShiftForThreeWeek = [];
      shiftToAssign.employee.weekDetailsPlannings = [];
      shiftToAssign.employee.employeeWeekShiftCS = [];
    });
    const shiftsToAssignDisplay = this.clone(this.shiftsToAssign);
    shiftsToAssignDisplay.forEach((shiftToAssign: ShiftModel) => {
      this.shiftToSave = shiftToAssign;
      let shiftAcheveToSave = new ShiftModel();
      this.deleteShiftAchevalHidden(this.shiftToSave.idShift, this.shiftToSave.employee.idEmployee);
      if (this.shiftToSave.acheval) {
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.shiftToSave.jour), true);
        this.shiftToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
        shiftAcheveToSave = this.clone(this.shiftToSave);
        shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      }
      this.shiftToSave.employee.totalRowTime = this.totalRowTime;
      let collection = this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee);
      if (!collection) {
        collection = [];
      }
      if (this.shiftToSave.oldEmployee && this.shiftToSave.oldEmployee.idEmployee !== this.shiftToSave.employee.idEmployee) {
        let oldEmployeeCollection = this.shiftByEmployee.get(this.shiftToSave.oldEmployee.idEmployee);
        if (!oldEmployeeCollection) {
          oldEmployeeCollection = [];
        }
        const indexShiftToUpdateInShifteByOldEmployee = oldEmployeeCollection.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
        if (indexShiftToUpdateInShifteByOldEmployee !== -1) {
          oldEmployeeCollection.splice(indexShiftToUpdateInShifteByOldEmployee, 1);
          if (oldEmployeeCollection[indexShiftToUpdateInShifteByOldEmployee]) {
            oldEmployeeCollection[indexShiftToUpdateInShifteByOldEmployee].employee.totalRowTime = 5;
          }
        }
      }
      const indexShiftToUpdateInShifteByEmployee = collection.findIndex((shift: ShiftModel) => shift.idShift === this.shiftToSave.idShift);
      if (indexShiftToUpdateInShifteByEmployee !== -1) {
        collection[indexShiftToUpdateInShifteByEmployee] = this.shiftToSave;
        collection[indexShiftToUpdateInShifteByEmployee].employee.totalRowTime = 5;
      } else {
        collection.push(this.shiftToSave);
      }
      const indexShiftToUpdateInListSift = this.listShift.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
      this.updateListShift(indexShiftToUpdateInListSift, this.listShift);
      const indexShiftToUpdate = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
      this.updateListShift(indexShiftToUpdate, this.listShiftToUpdate);

      this.listShiftDefault = JSON.parse(JSON.stringify(this.listShift));
      if (shiftAcheveToSave && shiftAcheveToSave.idShift) {
        collection.push({...shiftAcheveToSave});
        this.listShift.push({...shiftAcheveToSave});
      }
      this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);

      this.listEmployeeHasShift.forEach((employeDisplay: EmployeeModel) => {
        if (employeDisplay.idEmployee === this.shiftToSave.employee.idEmployee) {
          employeDisplay.totalRowTime = this.totalRowTime;
          return;
        }
      });
      this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
      this.sortListShiftByShiftAcheval(this.listShift);
      this.sortListShift(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
    });
    if (this._displayPlgManagers) {
      this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
    } else {
      this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
    }
    const collection = this.clone(this.shiftByEmployee.get(this.shiftsToAssign[0].employee.idEmployee));
    if (this.shiftsToAssign[0].employee && this.shiftsToAssign[0].employee.idEmployee) {
      this.takeBreakswithTime(collection ? collection : [], this.shiftsToAssign[0].employee.idEmployee, this.listLoi, this.tempsTravailPartiel, this.mineur);
      this.afficherTempsPlanifier(this.shiftsToAssign[0].employee.idEmployee);
    }
    this.shiftToSave = null;
    this.shiftsToAssign = [];
  }

  /**
   * fermer le ppup de verificattion de contrainte
   */
  public discard() {
    this.popupVerificationContrainteVisibility = false;

  }

  /**
   * recupeere les shifts d'un employee dans un jour defini
   * @param :shift
   */
  private getListShiftByJour(shift: ShiftModel) {
    const listShiftInDay: ShiftModel[] = [];
    listShiftInDay.push(this.clone(shift));
    const collection = this.shiftByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach((item: ShiftModel) => {
        if (item.jour === shift.jour) {
          if (shift.idShift !== item.idShift && !item.shiftAchevalHidden) {
            listShiftInDay.push(this.clone(item));
          }
        }
      });
    }
    listShiftInDay.forEach((item: ShiftModel) => {
      const plannedDate = this.dateService.getDateOfEnumertionJour(item.jour);
      item.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, item.heureDebut), item.heureDebutIsNight);
      item.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, item.heureFin), item.heureDebutIsNight);
    });
    return listShiftInDay;
  }
  private updateActiveEmployeeShifts(idEmployee?: number, shift?: ShiftModel): void {
    let employee : EmployeeModel;
    if(idEmployee !== undefined){
      employee = this.activeEmployeesPerWeek.find((val: EmployeeModel) => val.idEmployee === idEmployee);
    } else {
      employee = this.activeEmployeesPerWeek.find((val: EmployeeModel) => val.idEmployee === this.shiftToSave.employee.idEmployee);
    }
    let shiftToSave : ShiftModel;
    if(shift){
      shiftToSave = shift;
    } else {
      shiftToSave = this.shiftToSave;
    }
    if(employee){
      let indexDayToUpdateInWeeklyPlg = employee.weekDetailsPlannings.findIndex(val => val['dateJour'] === this.datePipe.transform(shiftToSave.dateJournee, 'yyyy-MM-dd'));

      if (indexDayToUpdateInWeeklyPlg !== -1) {
        const actifEmployeeToUpdate = this.activeEmployeesPerWeek.findIndex(val => val.idEmployee === employee.idEmployee);
        if (actifEmployeeToUpdate !== -1) {
          const indexShiftToUpdateInListShiftWeek = this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.findIndex(shift => shift.idShift === shiftToSave.idShift);
          if(indexShiftToUpdateInListShiftWeek === -1){
            this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...shiftToSave});
          } else {
            this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
            this.activeEmployeesPerWeek[actifEmployeeToUpdate].weekDetailsPlannings[indexDayToUpdateInWeeklyPlg].shifts.push({...shiftToSave});      }
        }
      }
    }
  }
  /**
   * ajouter sift dans la list de shift et dans la map shifts par employee
   * @param :data
   */
  private setNewShiftToListShift() {
    this.showPopAddShift = false;
    let shiftAcheveToSave = new ShiftModel();

    this.shiftToSave.idShift = this.makeString();
    this.listShift.forEach(shift => {
      if (shift.idShift === this.shiftToSave.idShift) {
        this.setNewShiftToListShift();
      }
    });
    if (this.shiftToSave.acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.dateService.getJourSemaineFromInteger(new Date(this.shiftToSave.dateJournee).getDay()), true);

      this.shiftToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      shiftAcheveToSave = this.clone(this.shiftToSave);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave && shiftAcheveToSave.idShift) {
        this.listShift.push({...shiftAcheveToSave});
      }
    }
    const collection = this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee);
    if (!collection) {
      if (shiftAcheveToSave && shiftAcheveToSave.idShift) {
        this.shiftByEmployee.set(this.shiftToSave.employee.idEmployee, [this.shiftToSave, shiftAcheveToSave]);
      } else {
        this.shiftByEmployee.set(this.shiftToSave.employee.idEmployee, [this.shiftToSave]);
      }
    } else {
      collection.push({...this.shiftToSave});
      if (shiftAcheveToSave && shiftAcheveToSave.idShift) {
        collection.push({...shiftAcheveToSave});
      }
    }
    this.listShift.push({...this.shiftToSave});
    this.shiftToSave.employee.totalRowTime = this.totalRowTime;
    if (!this.listEmployeeHasShift.find((emp: EmployeeModel) => emp.idEmployee === this.shiftToSave.employee.idEmployee)) {
      const indexEmptyLine = this.listEmployeeHasShift.findIndex((emp: EmployeeModel) => isNaN(Number(emp.idEmployee)));
      if (indexEmptyLine !== -1) {
        this.listEmployeeHasShift.splice(indexEmptyLine, 1, this.shiftToSave.employee);
      } else {
        this.listEmployeeHasShift.push(this.shiftToSave.employee);
      }
      this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);
    }
    this.listEmployeeHasShift.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.shiftToSave.employee.idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
    this.updateActiveEmployeeShifts();
    this.listShiftDefault = JSON.parse(JSON.stringify(this.listShift));
    this.listShiftToUpdate.push({...this.shiftToSave});
    this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
    this.sortListShiftByShiftAcheval(this.listShift);
    this.sortListShift(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
    if (this._displayPlgManagers) {
      this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
    } else {
      this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
    }
    this.shiftToSave = null;
    this.showPopAddShift = true;
  }

  /**
   * modifier shift dans la list de shift et dans la map shift par employee
   * recuperer la list de shift de qe on va enregistrer (listShiftToUpdate)
   * @param :data
   */
  private updateShiftAfterSave() {
    this.showPopAddShift = false;
    let shiftAcheveToSave = new ShiftModel();
    this.deleteShiftAchevalHidden(this.shiftToSave.idShift, this.shiftToSave.employee.idEmployee);

    if (this.shiftToSave.acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.shiftToSave.jour), true);
      this.shiftToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      shiftAcheveToSave = this.clone(this.shiftToSave);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
    }
    this.shiftToSave.employee.totalRowTime = this.totalRowTime;
    let collection = this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee);
    if (!collection) {
      collection = [];
    }

    if (this.shiftToSave.oldEmployee && this.shiftToSave.oldEmployee.idEmployee !== this.shiftToSave.employee.idEmployee) {
      let oldEmployeeCollection = this.shiftByEmployee.get(this.shiftToSave.oldEmployee.idEmployee);
      if (!oldEmployeeCollection) {
        oldEmployeeCollection = [];
      }
      const indexShiftToUpdateInShifteByOldEmployee = oldEmployeeCollection.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
      if (indexShiftToUpdateInShifteByOldEmployee !== -1) {
        oldEmployeeCollection.splice(indexShiftToUpdateInShifteByOldEmployee, 1);
        if (oldEmployeeCollection[indexShiftToUpdateInShifteByOldEmployee]) {
          oldEmployeeCollection[indexShiftToUpdateInShifteByOldEmployee].employee.totalRowTime = 5;
        }
      }
    }
    const indexShiftToUpdateInShifteByEmployee = collection.findIndex((shift: ShiftModel) => shift.idShift === this.shiftToSave.idShift);
    if (indexShiftToUpdateInShifteByEmployee !== -1) {
      collection[indexShiftToUpdateInShifteByEmployee] = this.shiftToSave;
      collection[indexShiftToUpdateInShifteByEmployee].employee.totalRowTime = 5;
    } else {
      collection.push(this.shiftToSave);
    }
    const indexShiftToUpdateInListSift = this.listShift.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
    this.updateListShift(indexShiftToUpdateInListSift, this.listShift);
    const indexShiftToUpdate = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
    this.updateListShift(indexShiftToUpdate, this.listShiftToUpdate);

    this.listShiftDefault = JSON.parse(JSON.stringify(this.listShift));
    if (shiftAcheveToSave && shiftAcheveToSave.idShift) {
      collection.push({...shiftAcheveToSave});
      this.listShift.push({...shiftAcheveToSave});
    }
    // Case update employee, selected employee doesnt exist in planning
    if (!this.listEmployeeHasShift.find((emp: EmployeeModel) => emp.idEmployee === this.shiftToSave.employee.idEmployee)) {
      this.listEmployeeHasShift.push(this.shiftToSave.employee);
      this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);
    }
    this.listEmployeeHasShift.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.shiftToSave.employee.idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
    this.updateActiveEmployeeShifts();
    this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
    this.sortListShiftByShiftAcheval(this.listShift);
    this.sortListShift(this.shiftByEmployee.get(this.shiftToSave.employee.idEmployee));
    if (this._displayPlgManagers) {
      this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
    } else {
      this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
      this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
    }
    this.showPopAddShift = true;

    this.shiftToSave = null;
  }

  /**
   * modifier la list de shift
   * @param indexShiftToUpdate
   * @param list
   */
  private updateListShift(indexShiftToUpdate: number, list: any): void {
    indexShiftToUpdate = list.findIndex(shift => shift.idShift === this.shiftToSave.idShift);
    if (indexShiftToUpdate !== -1) {
      list.splice(indexShiftToUpdate, 1);
    }
    list.push({...this.shiftToSave});
  }

  /**
   * message de confirmation de suppression d'une card dans l'onglet 'Shift'
   * @param: event
   */
  public showConfirmDeleteShiftCard(event, filter?) {
    let idShiftToDelete: number;
    if (!filter) {
      idShiftToDelete = event;
    } else {
      const draggableElement = event.relatedTarget;
      idShiftToDelete = draggableElement.getAttribute('data-idShift');
    }
    const deletedShift = this.listShift.find((element: ShiftModel) => element.idShift === idShiftToDelete);
    if (deletedShift) {
      const employeeIndex = this.listEmployeeHasShift.findIndex((emp: any) => emp.idEmployee === deletedShift.employee.idEmployee && deletedShift.employee.idEmployee);
      if ((employeeIndex !== -1) && this.listEmployeeHasShift[employeeIndex].contrats) {
        this.employeeHasAnomalieContraintSocial = this.listEmployeeHasShift[employeeIndex];
        this.identifierEmployee(this.employeeHasAnomalieContraintSocial);
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
          this.deleteShiftCard(event);
        } else {
          const draggableElement = event.relatedTarget;
          const idShiftToDelete = draggableElement.getAttribute('data-idShift'); // ancienne journée à laquelle appartient la card
          this.deleteShiftCard(idShiftToDelete);
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

  /**
   * permet de savegarder la ligne employee selectionnée pour la suppression
   * @param: event
   */
  public updateSelectedEmployeeRow(event) {
    this.selectedEmployee = event;
  }

  /**
   * afficher le message de confirmation de supression d'une ligne entière
   */
  public showConfirmDeleteRowtest() {
    if (this.selectedEmployee.idEmployee) {
      this.showConfimeDelete = true;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
        header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          if (this.selectedEmployee && this.selectedEmployee.idEmployee === 0) {
            this.listEmployeeHasShift.splice(this.listEmployeeHasShift.length - 1, 1);
            this.selectedEmployee = undefined;
          }
          if (this.selectedEmployee && this.selectedEmployee.idEmployee !== 0) {
            this.deleteAllShiftByIdEmployee();
            this.showConfimeDelete = false;
          }
          this.updatePlanningFixRowInterface();
        },
        reject: () => {
          this.showConfimeDelete = false;
        }
      });
    }
  }


  /**
   * Vérification de la durée minimale d'un shift lors du sauvegarde global
   */
  public verifDureeMinDesShifts(days: any, listEmployeeHasShift: EmployeeModel[], listShift: ShiftModel[], messageVerification: VerificationContrainteModel): VerificationContrainteModel[] {
    let verificationContrainte = new VerificationContrainteModel();
    let verificationContrainteNbrCoupure = new VerificationContrainteModel();
    let employeHaslaw: EmployeeModel;
    let nbrCoupure = 0;
    const listContrainteDureeMinShift: VerificationContrainteModel[] = [];
    if (this.listShiftToUpdate.length || this.listShiftToDelete.length || this.listShiftByEmployeeToDelete.length) {
      for (const employeDisplay of listEmployeeHasShift) {
        const collection = [];
        nbrCoupure = 0;
        listShift.forEach((shiftDisplay: ShiftModel) => {
          if (employeDisplay.idEmployee === shiftDisplay.employee.idEmployee && !shiftDisplay.shiftAchevalHidden) {
            collection.push(shiftDisplay);
          }
        });
        days.forEach((day: any) => {
          verificationContrainte = new VerificationContrainteModel();
          if (employeDisplay.contrats && employeDisplay.contrats.length === 1) {
            employeHaslaw = employeDisplay;
          } else if (employeDisplay.contrats && employeDisplay.contrats.length > 1) {
            employeHaslaw = JSON.parse(JSON.stringify(employeDisplay));
          }
          if (employeHaslaw && employeHaslaw.contrats && employeHaslaw.contrats.length) {
            this.identifierEmployee(employeHaslaw);
            // get list shift by day by employee
            const listShiftByDay = this.plgHebdoHelperService.grouperShiftParJour(day.val, collection);
            if (listShiftByDay.length && listShiftByDay.length === 1) {
              const dureeShift = this.dateService.formatMinutesToHours(this.dateService.getDiffHeure(listShiftByDay[0].heureFin, listShiftByDay[0].heureDebut));
              verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
              if (verificationContrainte) {
                messageVerification.bloquante = verificationContrainte.bloquante;
                verificationContrainte.employe = employeHaslaw;
                //  verificationContrainte.idShift = listShiftByDay[0].idShift;
                verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
                listContrainteDureeMinShift.push(verificationContrainte);

              }
            } else if (listShiftByDay.length && listShiftByDay.length > 1) {
              this.sortListShift(listShiftByDay);
              const listShiftDuree = this.shiftService.getListShiftDurationByMaxBreak(listShiftByDay, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
              listShiftDuree.forEach((dureeShift: any) => {
                dureeShift = this.dateService.formatMinutesToHours(dureeShift);
                verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
                if (verificationContrainte) {
                  messageVerification.bloquante = verificationContrainte.bloquante;
                  verificationContrainte.employe = employeHaslaw;
                  //  verificationContrainte.idShift = listShiftByDay[0].idShift;
                  verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
                  listContrainteDureeMinShift.push(verificationContrainte);
                }
              });
            }
            const numberOfHourInDayAndBreak = this.contrainteSocialeCoupureService.getNumberOfWorkedHoursInDay(listShiftByDay, this.listLoi, employeHaslaw.contrats[0].tempsPartiel, this.mineur, this.minBeforeCoupure, nbrCoupure);
            nbrCoupure = numberOfHourInDayAndBreak.nbrCoupure;
          }

        });
        if (!employeHaslaw) {
          employeHaslaw = employeDisplay;
        }
        if (employeHaslaw.contrats && employeHaslaw.contrats.length) {
          const verfiContrainteCoupureSemaine = this.contrainteSocialeService.verifCSContratMinSansCoupure(employeHaslaw,employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, this.mineur)
          verificationContrainteNbrCoupure = this.contrainteSocialeService.validNombreMaxCoupureParSemaine(nbrCoupure, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur, verfiContrainteCoupureSemaine);
          if (verificationContrainteNbrCoupure) {
            this.messageVerification.bloquante = verificationContrainteNbrCoupure.bloquante;
            verificationContrainteNbrCoupure.employe = employeHaslaw;
            verificationContrainteNbrCoupure.dateOfAnomalie = ' ';
            listContrainteDureeMinShift.push(verificationContrainteNbrCoupure);

          }
        }
      }
    }
    return listContrainteDureeMinShift;
  }

  /**
   * verification s'il y a changement de shift
   * save list shfit, suppression shfit ,suppression list shifts
   *
   */
  public canDeactivate(): boolean {
    let canSave = true;
    const autorizeDeleteShift = true;
    let autorizeDeleteShiftByEmployee = true;
    this.listShiftToUpdate.forEach(shift => {
      if (isNaN(Number(shift.idShift))) {
        shift.idShift = 0;
        delete shift.uuid;
      }
      shift.restaurant = this.sharedRestaurant.selectedRestaurant;
    });
    //  if (this.listShiftToDelete.length === 0) {
    //    this.listShiftToDelete.push('0');
    //    autorizeDeleteShift = false;
    //  }
    if (this.listShiftByEmployeeToDelete.length === 0) {
      this.listShiftByEmployeeToDelete.push('0');
      autorizeDeleteShiftByEmployee = false;
    }

    if (this.listShiftToUpdate.length > 0 || (autorizeDeleteShift && autorizeDeleteShiftByEmployee)
      || (autorizeDeleteShift && !autorizeDeleteShiftByEmployee)
      || (!autorizeDeleteShift && autorizeDeleteShiftByEmployee)) {
      canSave = false;
    }
    return canSave;
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieAfterDeleteCard(idEmployee: any): Promise<void> {
    for (const employeDisplay of this.listEmployeeHasShift.filter(emp => !emp.disableInactifEmployee)) {
      if (employeDisplay.idEmployee === idEmployee) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    }
  }

  /**
   * message de suppression
   */
  private displaySuccessDeleteMessage() {
    this.notificationService.showInfoMessage('BIMPOSE.DELETE_SUCCESS', 'BIMPOSE.DELETE_INFORMATION');
  }

  private onReadyInitDrag() {
    if (this.updateButtonControl()) {
      interact('.td-drop-zone').unset();
      interact('.btn-delete').unset();
      interact('.position-card').unset();

      interact.dynamicDrop(true);

      let resetToInitial = true; // si l'utilisateur-restaurant lâche le souris à mis chemin, on remet le card à sa place
      // enable draggables to be dropped into this drop zones
      interact('.td-drop-zone').dropzone({
        // only accept elements matching this CSS selector
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
            this.showConfirmDeleteShiftCard(event, 'dragAndDrop'); // suppression du card du shift : onglet 'shift'
          }
          // on remet le card à sa position en attendant le onfirmation de l'utilisateur-restaurant pour la suppression
          event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';

          // reset the posiion attributes
          event.relatedTarget.setAttribute('data-x', 0);
          event.relatedTarget.setAttribute('data-y', 0);
        },
        ondropdeactivate: (event) => {
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
          setTimeout(_ => this.updatePlanningFixRowInterface(), 70);
        }
      });

      // initialiser les draggable shifts : cette fonction permet de rendre les cards déplaçable à la souris
      interact('.position-card').draggable({
        // enable inertial throwing
        inertia: false,
        autoScroll: {
          container: document.getElementById('planningFixeContainer'),
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
    } else {
      this.displayHebdoEmitter.emit(false);
    }
  }

  private updatePlanningFixRowInterface(): void {
    this.planningFixRows.forEach(planningFix => planningFix.checkChangeDetection());
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
   * Permet de gérer le déplacements des cards des postes
   * @param: event
   */
  private dropShiftCard(event: any): void {
    this.eventCtrl = false;
    if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
      this.eventCtrl = true;
    }
    const draggableElement = event.relatedTarget;
    const dropzoneElement = event.target;
    this.draggableElementShift = draggableElement;
    let idShift: any;
    const idDropShift = draggableElement.getAttribute('data-idShift');
    if (!isNaN(Number(draggableElement.getAttribute('data-idShift')))) {
      idShift = parseInt(draggableElement.getAttribute('data-idShift'), 10); // ordre du card dans la journée initial
    } else {
      idShift = idDropShift; // ordre du card dans la journée initial
    }
    const oldDayZone = draggableElement.getAttribute('data-cardDay'); // ancienne journée à laquelle appartient la card
    const newDayZone = dropzoneElement.getAttribute('data-day'); // nouvelle journée dans laquelle on veut déplacer la card
    let oldEmp: any;
    if (!isNaN(Number(draggableElement.getAttribute('data-empIndex')))) {
      oldEmp = parseInt(draggableElement.getAttribute('data-empIndex'), 10); // poste initial de la card
    } else {
      oldEmp = draggableElement.getAttribute('data-empIndex'); // poste initial de la card
    }
    let newEmp: any;
    if (!isNaN(Number(dropzoneElement.parentElement.getAttribute('data-empIndex')))) {
      newEmp = parseInt(dropzoneElement.parentElement.getAttribute('data-empIndex'), 10); // nouveau poste du card
    } else {
      newEmp = dropzoneElement.parentElement.getAttribute('data-empIndex'); // ordre du card dans la journée initial
    }
    // if (isNaN(newEmp)) {
    //   newEmp = 0;
    // }
    const cardDropInfos = {
      idShift: idShift,
      oldDayZone: oldDayZone,
      newDayZone: newDayZone,
      oldEmp: oldEmp,
      newEmp: newEmp
    };
    const newDateJournee = this.days.find(d => d.val.toUpperCase() === newDayZone.toUpperCase());
    this.shiftToSave = cardDropInfos;
    this.shiftToSave.dateJournee = newDateJournee.dateJournee;
    const newEmployee = this.listEmployeeHasShift.find(employeeDisplay => employeeDisplay.idEmployee === cardDropInfos.newEmp);
    const newShift = this.getShiftBeforeDragAndDrop(this.shiftToSave, newEmployee);
    const indexShiftToMove = this.listShift.findIndex((item: ShiftModel) => item.idShift === cardDropInfos.idShift && !item.shiftAchevalHidden);
    const shiftDisplay = this.listShift[indexShiftToMove];
    const oldEmployee = this.listEmployeeHasShift.find((emp: EmployeeModel) => emp.idEmployee === cardDropInfos.oldEmp);
    this.shiftToSave.dateJournee = this.dateService.correctTimeZoneDifference(this.shiftToSave.dateJournee);
    if ((oldEmployee && oldEmployee.isManagerOrLeader) || (newEmployee && newEmployee.isManagerOrLeader)) {
      this.resetCradInitialPlace(shiftDisplay);
    } else {
      if (cardDropInfos.newEmp && !isNaN(Number(cardDropInfos.newEmp))) {
        //  this.listEmployeeHasShift.forEach(employeeDisplay => {
        if (newEmployee.idEmployee === cardDropInfos.newEmp) {
          this.getStartTimeAndEndTimeFromDecoupageHoraire(this.shiftToSave.newDayZone);
          this.getStartAndEndActivityDay(this.shiftToSave.dateJournee);
          if (this.updateButtonControl() && this.disableChangePositionOfEmployee(this.shiftToSave.oldEmp, this.shiftToSave.newEmp) && this.canAddShift(newShift, true)) {
            this.getContratByEmployeeActif(newEmployee, this.shiftToSave.dateJournee, false, false, 'dragDrop');
          } else {
            // reset the card to the initial place
            this.resetCradInitialPlace(shiftDisplay);
          }
        }
        //  });
      } else {
        if ((cardDropInfos.newEmp === 0 || isNaN(Number(cardDropInfos.newEmp))) && this.updateButtonControl() && this.canAddShift(newShift, true)) {
          if (this.eventCtrl) {
            this.copieShift(this.shiftToSave);
          } else {
            // exécuter le déplacement du card dans l'interface
            this.moveShiftCard(this.shiftToSave);
          }
        } else {
          // reset the card to the initial place
          this.resetCradInitialPlace(shiftDisplay);
        }
      }

    }

  }

  /**
   * reset the card to the initial place
   */
  private resetCradInitialPlace(shift: ShiftModel): void {
    this.draggableElementShift.style.transform = this.draggableElementShift.style.webkitTransform = 'translate(0, 0)';
    // reset the posiion attributes
    this.draggableElementShift.setAttribute('data-x', 0);
    this.draggableElementShift.setAttribute('data-y', 0);
  }

  /**
   * Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe
   *  empecher le drag&drop vers l’employé
   * @param :idOldEmployee
   * @param :idNewEmployee
   */
  public disableChangePositionOfEmployee(idOldEmployee, idNewEmployee): boolean {
    let canChangePosition = true;
    this.listEmployeeInactifHasShift.forEach(employee => {
      if ((employee.idEmployee === idOldEmployee && idNewEmployee === idOldEmployee) || idNewEmployee === employee.idEmployee) {
        canChangePosition = false;
      }

    });
    return canChangePosition;
  }

  /**
   * confirme le changement de shift apres drag and drop
   * @param :employee
   */
  private checkShiftChangePosition(employee, isAssigned?: boolean) {

    const newShift = this.getShiftBeforeDragAndDrop(this.shiftToSave, employee);
    if (this.shiftToSave.oldDayZone !== this.shiftToSave.newDayZone || this.shiftToSave.oldEmp !== this.shiftToSave.newEmp) {
      this.popupVerificationContrainteVisibility = !this.calculeTotalInWeekAndTotalInDayForShift(newShift, isAssigned);
    }
    // drop only if day is different
    if ((this.shiftToSave.oldDayZone !== this.shiftToSave.newDayZone || this.shiftToSave.oldEmp !== this.shiftToSave.newEmp) && !this.popupVerificationContrainteVisibility) {
      // changer les détails du card suivant le nouveau emplacement
      if (this.eventCtrl) {
        this.copieShift(this.shiftToSave);
      } else {
        // exécuter le déplacement du card dans l'interface
        this.moveShiftCard(this.shiftToSave);
      }

    } else {
      // reset the card to the initial place
      const indexShiftToMove = this.listShift.findIndex((item: ShiftModel) => item.idShift === this.shiftToSave.idShift && !item.shiftAchevalHidden);
      let shiftDisplay;
      if (indexShiftToMove !== -1) {
        shiftDisplay = this.listShift[indexShiftToMove];
        this.resetCradInitialPlace(shiftDisplay);
      }

    }
  }

  /**
   * Cette méthode permet convertir  la fin/début activité de la journée en date

   */
  private getStartAndEndActivityDay(dateJournee: Date): void {
    let dateShift = new Date();
    if (dateJournee) {
      dateShift = new Date(dateJournee);
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
   * déplacer le card entre les deux zone de jours différentes
   * @param: movedCardInfos
   */
  public moveShiftCard(movedCardInfos: any): void {
    this.deleteShiftAchevalHidden(movedCardInfos.idShift, movedCardInfos.oldEmp);
    const indexShiftToMove = this.listShift.findIndex(shift => shift.idShift === movedCardInfos.idShift);
    // update employee
    const indexNewEmployee = this.listEmployeeActif.findIndex(emp => emp.idEmployee === movedCardInfos.newEmp);
    const indexNewFakeEmployee = this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === movedCardInfos.newEmp);
    if (indexNewEmployee !== -1) {
      this.listShift[indexShiftToMove].employee = this.listEmployeeActif[indexNewEmployee];
    } else if (isNaN(Number(movedCardInfos.newEmp)) && indexNewFakeEmployee !== -1) {
      this.listShift[indexShiftToMove].employee = this.listEmployeeHasShift[indexNewFakeEmployee];
    }
    // update day
    this.listShift[indexShiftToMove].jour = movedCardInfos.newDayZone.toUpperCase();
    this.listShift[indexShiftToMove].dateJournee = movedCardInfos.dateJournee;
    // mettre a jour la map
    let oldEmployeeCollection = this.shiftByEmployee.get(movedCardInfos.oldEmp);
    if (oldEmployeeCollection && oldEmployeeCollection.length) {
      this.shiftByEmployee.get(movedCardInfos.oldEmp).splice(this.shiftByEmployee.get(movedCardInfos.oldEmp).findIndex(shift => shift.idShift === movedCardInfos.idShift), 1);
    }
    if (this.listShift[indexShiftToMove].acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.listShift[indexShiftToMove].jour), true);
      this.listShift[indexShiftToMove].shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      let shiftAcheveToSave = this.clone(this.listShift[indexShiftToMove]);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave) {
        this.shiftByEmployee.get(movedCardInfos.newEmp).push(shiftAcheveToSave);
        this.listShift.push(shiftAcheveToSave);
      }
    }
    let collection = this.shiftByEmployee.get(movedCardInfos.newEmp);
    if (collection === undefined || (collection && !collection.length)) {
      collection = [];
      this.shiftByEmployee.set(movedCardInfos.newEmp, [this.listShift[indexShiftToMove]]);
    } else {
      this.shiftByEmployee.get(movedCardInfos.newEmp).push(this.listShift[indexShiftToMove]);
    }

    const indexShiftToUpdate = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.listShift[indexShiftToMove].idShift);
    if (indexShiftToUpdate !== -1) {
      this.listShiftToUpdate[indexShiftToUpdate] = {...this.listShift[indexShiftToMove]};
    } else {
      this.listShiftToUpdate.push({...this.listShift[indexShiftToMove]});
    }
    this.sortListShiftByShiftAcheval(this.listShift);
    this.sortListShift(this.shiftByEmployee.get(movedCardInfos.newEmp));

    if (movedCardInfos.newEmp !== movedCardInfos.oldEmp && !isNaN(Number(movedCardInfos.newEmp))) {
      this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(movedCardInfos.newEmp));

      this.calculeTempsPlanifieAfterCopieOrMoveShift(movedCardInfos);
    } else if (!isNaN(Number(movedCardInfos.newEmp))) {
      this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(movedCardInfos.oldEmp));
      const listShiftEmployee = this.clone(this.shiftByEmployee.get(movedCardInfos.newEmp));
      this.takeBreakswithTime(listShiftEmployee ? listShiftEmployee : [], movedCardInfos.newEmp, this.listLoi, this.tempsTravailPartiel, this.mineur);
      this.afficherTempsPlanifier(movedCardInfos.newEmp);
    }
    this.updateActiveEmployeeShifts(movedCardInfos.newEmp, this.listShift[indexShiftToMove]);
    this.updateActiveEmployeeShifts(movedCardInfos.oldEmp, this.listShift[indexShiftToMove]);
    this.days.forEach((day: any) => {
      this.shiftByEmployee.set(movedCardInfos.newEmp, this.plgHebdoHelperService.indexerShiftParJour(day.val, this.shiftByEmployee.get(movedCardInfos.newEmp)));
    });
  }

  /**
   * Si l’utilisateur maintient la touche Ctrl appuyer tous le long du drag&drop (appuyer à la sélection et au relâchement du shift),
   *  il faut permettre de copier un shift lors d’un drag&drop.
   *  @param :copieCardInfos
   */

  private copieShift(copieCardInfos: any): void {
    let shiftCopy = {} as ShiftModel;
    let shiftSource = {} as ShiftModel;
    const indexShiftToMove = this.listShift.findIndex(shift => shift.idShift === copieCardInfos.idShift && !shift.shiftAchevalHidden);
    const indexNewEmployee = this.listEmployeeActif.findIndex(emp => emp.idEmployee === copieCardInfos.newEmp);
    this.shiftByEmployee.get(copieCardInfos.oldEmp).splice(this.shiftByEmployee.get(copieCardInfos.oldEmp).findIndex(shift => shift.idShift === copieCardInfos.idShift && !shift.shiftAchevalHidden), 1);
    shiftCopy = {...this.listShift[indexShiftToMove]};
    shiftCopy.idShift = this.makeString();
    const indexNewFakeEmployee = this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === copieCardInfos.newEmp);
    if (indexNewEmployee !== -1) {
      shiftCopy.employee = this.listEmployeeActif[indexNewEmployee];
    } else if (isNaN(Number(copieCardInfos.newEmp)) && indexNewFakeEmployee !== -1) {
      shiftCopy.employee = this.listEmployeeHasShift[indexNewFakeEmployee];
    }
    shiftCopy.jour = copieCardInfos.newDayZone.toUpperCase();
    shiftCopy.dateJournee = copieCardInfos.dateJournee;
    shiftSource = {...this.listShift[indexShiftToMove]};
    if (shiftCopy.acheval) {
      shiftCopy.modifiable = true;
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftCopy.jour), true);
      shiftCopy.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
    }
    this.listShift.push(shiftCopy);
    this.shiftByEmployee.get(copieCardInfos.oldEmp).push(shiftSource);
    const newEmpCollection = this.shiftByEmployee.get(copieCardInfos.newEmp);
    if (!newEmpCollection) {
      this.shiftByEmployee.set(copieCardInfos.newEmp, [shiftCopy]);
    } else {
      this.shiftByEmployee.get(copieCardInfos.newEmp).push(shiftCopy);
    }
    if (shiftCopy.acheval) {
      let shiftAcheveToSave = this.clone(shiftCopy);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave) {
        this.shiftByEmployee.get(copieCardInfos.newEmp).push(shiftAcheveToSave);
        this.listShift.push(shiftAcheveToSave);
      }
    }
    this.updateActiveEmployeeShifts(copieCardInfos.newEmp, shiftCopy);
    this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(copieCardInfos.newEmp));
    this.sortListShiftByShiftAcheval(this.listShift);
    this.sortListShift(this.shiftByEmployee.get(copieCardInfos.newEmp));
    if(shiftCopy.fromShiftFix){
      delete shiftCopy.uuid;
      delete shiftCopy.fromShiftFix;
    }
    this.listShiftToUpdate.push({...shiftCopy});
    if (!isNaN(Number(copieCardInfos.newEmp))) {
      if (copieCardInfos.newEmp !== copieCardInfos.oldEmp) {
        this.calculeTempsPlanifieAfterCopieOrMoveShift(copieCardInfos);
      } else {
        const listShiftEmployee = this.clone(this.shiftByEmployee.get(copieCardInfos.newEmp));
        this.takeBreakswithTime(listShiftEmployee ? listShiftEmployee : [], copieCardInfos.newEmp, this.listLoi, this.tempsTravailPartiel, this.mineur);
        this.afficherTempsPlanifier(copieCardInfos.newEmp);
      }
    }
    this.eventCtrl = false;
    this.days.forEach((day: any) => {
      this.shiftByEmployee.set(copieCardInfos.newEmp, this.plgHebdoHelperService.indexerShiftParJour(day.val, this.shiftByEmployee.get(copieCardInfos.newEmp)));
    });
  }

  /**
   * aficher temps planifier de l"employe
   */
  private afficherTempsPlanifier(idEmployee: number): void {
    this.listEmployeeHasShift.forEach((employeDisplay: EmployeeModel) => {
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
    for (const employeDisplay of this.listEmployeeHasShift.filter(emp => !emp.disableInactifEmployee)) {
      if (employeDisplay.idEmployee === cardInf.newEmp) {
        const listShiftEmployee = this.clone(this.shiftByEmployee.get(employeDisplay.idEmployee));
        this.takeBreakswithTime(listShiftEmployee ? listShiftEmployee : [], employeDisplay.idEmployee, this.listLoi, this.tempsTravailPartiel, this.mineur);
        employeDisplay.totalRowTime = this.totalRowTime;
      } else if ( employeDisplay.contrats && employeDisplay.contrats.length  && employeDisplay.idEmployee === cardInf.oldEmp) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
      }
    }
  }

  /**
   * permet de savegarder la ligne Poste selectionnée pour la suppression
   * @param: event
   */
  public updateSelectedShiftRow(event) {
    this.selectedEmployee = event;
  }

  private deleteAllShiftByIdEmployee() {

    const indexEmployeeToDelete = this.listEmployeeHasShift.findIndex(emp => emp.idEmployee === this.selectedEmployee.idEmployee);
    this.listEmployeeHasShift.splice(indexEmployeeToDelete, 1);
    if (this.shiftByEmployee.get(this.selectedEmployee.idEmployee)) {
      this.shiftByEmployee.delete(this.selectedEmployee.idEmployee);
    }
    this.listShiftByEmployeeToDelete.push(this.selectedEmployee.uuid);
    if (this.listShiftToUpdate.length > 0) {
      for (let i = 0; i < this.listShiftToUpdate.length; i++) {
        if (this.listShiftToUpdate[i].employee.idEmployee === this.selectedEmployee.idEmployee) {
          if (!isNaN(Number(this.listShiftToUpdate[i].idShift))) {
            // supprimer les shifts qui se trouvent ds la bd avec un autre employee
            this.listShiftToDelete.push(this.listShiftToUpdate[i]);
          }
          this.listContraintesSocialesByShift.delete(this.listShiftToUpdate[i].idShift);

          // supprimer les  shifts qui se trouvent da list que on va enregistrer ds la bd
          this.listShiftToUpdate.splice(i, 1);
          i--;
        }
      }
    }
    if (this.listShift.length > 0) {
      for (let i = 0; i < this.listShift.length; i++) {
        if (this.listShift[i].employee.idEmployee === this.selectedEmployee.idEmployee) {
          this.listShiftToDelete.push(this.listShift[i]);
          this.listShift.splice(i, 1);
          i--;
        }
      }
    }
  }

  /**
   * delete shift de la list shift et de map et de la liste shift que on va enregistrer
   * @param: event
   */
  private deleteShiftCard(event: any): void {
    this.idEmploye = 0;
    this.index = null;
    this.idShiftToDelete = null;
    this.shiftToDelete = null;

    if (!isNaN(Number(event))) {
      event = +event;
    }
    this.listShift.forEach((shift: ShiftModel, index: number) => {
      if (shift.idShift === event && (!shift.acheval || (shift.acheval && shift.modifiable && !shift.shiftAchevalHidden))) {
        this.index = index;
        this.idShiftToDelete = event;
        this.shiftToDelete = shift;
        this.idEmploye = shift.employee.idEmployee;

        const filteredShiftsByDayAndEmployee = this.getListShiftByJour(shift);
        const indexShiftToDelete = filteredShiftsByDayAndEmployee.findIndex((shiftFix: ShiftModel) => shiftFix.idShift === this.idShiftToDelete);
        if (indexShiftToDelete !== -1) {
          filteredShiftsByDayAndEmployee.splice(indexShiftToDelete, 1);
        }
        if (filteredShiftsByDayAndEmployee.length > 2) {
          this.employeeHasAnomalieContraintSocial = shift.employee;
          let verificationContrainte = new VerificationContrainteModel();


          this.listContrainteSuppression = [];
          // Nombre Shift Max Par Jour
          verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(this.listLoi, this.tempsTravailPartiel, this.mineur, filteredShiftsByDayAndEmployee), this.listLoi, this.tempsTravailPartiel, this.mineur);
          if (verificationContrainte) {
            this.popupVerificationCsMaxShift = true;
            this.messageVerification.bloquante = verificationContrainte.bloquante;
            verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(this.shiftToDelete.dateJournee, '/');
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
    const employeToDeleteShift = this.clone(this.listShift[this.index].employee);
    this.deleteShiftAchevalHidden(this.idShiftToDelete, employeToDeleteShift.idEmployee);
    let indexShiftToDeleteInListUpdateShift: number;
    this.shiftByEmployee.get(employeToDeleteShift.idEmployee).splice(this.shiftByEmployee.get(employeToDeleteShift.idEmployee).findIndex(shift => shift.idShift === this.idShiftToDelete), 1);
    const collection = this.shiftByEmployee.get(employeToDeleteShift.idEmployee);
    const indexShiftDeleted = this.listShift.findIndex((item: ShiftModel) => item.idShift === this.idShiftToDelete && ((item.acheval && item.modifiable && !item.shiftAchevalHidden) || !item.acheval));
    if (indexShiftDeleted !== -1) {
      this.listShift.splice(indexShiftDeleted, 1);
    }
    if (!isNaN(Number(this.idShiftToDelete))) {
      this.listShiftToDelete.push(this.shiftToDelete);
    }
    this.listContraintesSocialesByShift.delete(this.shiftToDelete.idShift);

    this.listShiftDefault = JSON.parse(JSON.stringify(this.listShift));
    if (this.listShiftToUpdate.length > 0) {
      indexShiftToDeleteInListUpdateShift = this.listShiftToUpdate.findIndex(shift => shift.idShift === this.idShiftToDelete);
      if (indexShiftToDeleteInListUpdateShift !== -1) {
        this.listShiftToUpdate.splice(indexShiftToDeleteInListUpdateShift, 1);
      }
    }
    if (employeToDeleteShift) {
      this.sortListShiftByShiftAcheval(this.shiftByEmployee.get(employeToDeleteShift.idEmployee));
    }
    this.sortListShiftByShiftAcheval(this.listShift);
    if (this.idEmploye) {
      this.calculeTempsPlanifieAfterDeleteCard(this.idEmploye);
    } else {
      if (this._displayPlgManagers) {
        this.getDetailsSemaine(this.listShiftEquip, this.listShiftManagerLeader);
        this.getCaDayByDay(this.listShiftEquip, this.listShiftManagerLeader);
      } else {
        this.getDetailsSemaine(this.listShift, this.listShiftManagerLeader);
        this.getCaDayByDay(this.listShift, this.listShiftManagerLeader);
      }
    }
    this.updatePlanningFixRowInterface();
    this.hiddenSaveGlobale = false;
    this.listContraintesSocialesByShift.delete(this.idShiftToDelete);
  }

  /**
   * set value to id shift
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  /**
   * ajouter list de shift apres save
   * @param: data
   */
  public setListShiftAfterSave(data: ShiftModel[], displayPlgHebdo: boolean) {
    if (data.length > 0) {
      data.forEach(item => {
        this.dateService.setCorrectTimeToDisplayForShift(item);
        item.jour = this.dateService.getJourSemaineFromInteger(new Date(item.dateJournee).getDay());
        const fakeEmployee = new EmployeeModel();
        fakeEmployee.idEmployee = 0;
        fakeEmployee.nom = '';
        fakeEmployee.prenom = '';
        if (!item.employee) {
          item.employee = fakeEmployee;
        }
        const indexShift = this.listShift.findIndex((val: ShiftModel) => val.idShift === item.idShift);
        if (indexShift !== -1) {
          this.listShift.splice(indexShift, 1);
          this.listShift.push(item);
        } else {
          this.listShift.push(item);
        }
          //update weekly list shift
          if (item.employee) {
            const indexEmploye = this.activeEmployeesPerWeek.findIndex((employe: EmployeeModel) => employe.idEmployee === item.employee.idEmployee);
            if (indexEmploye !== -1) {
             const weeklyDetailsToRemoveFrom = this.activeEmployeesPerWeek[indexEmploye].weekDetailsPlannings.find((wdp: WeekDetailsPlanning) => wdp.dateJour === this.datePipe.transform(item.dateJournee, 'yyyy-MM-dd'));
             const indexShiftToUpdateInListShiftWeek =  weeklyDetailsToRemoveFrom.shifts.findIndex(shift => shift.idShift === item.idShift);
              if(indexShiftToUpdateInListShiftWeek === -1){
                 weeklyDetailsToRemoveFrom.shifts.push(item);
              } else {
                weeklyDetailsToRemoveFrom.shifts.splice(indexShiftToUpdateInListShiftWeek, 1);
                weeklyDetailsToRemoveFrom.shifts.push({...item});
              }

            this.activeEmployeesPerWeek[indexEmploye].weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
              for (let i = 0; i < wdp.shifts.length; i++) {
                if ((isNaN(Number(wdp.shifts[i].idShift))) || (wdp.shifts[i].idShift === 0) || wdp.shifts[i].fromShiftFix) {
                  wdp.shifts.splice(i, 1);
                  i--;
                }
              }
            });
            this.activeEmployeesPerWeek[indexEmploye].weekDetailsPlannings.forEach((wdp: any) => {
              const weekShiftSet = new Set();
              wdp.shifts = wdp.shifts.filter((shift: ShiftModel) => {
                const duplicate = weekShiftSet.has(shift.idShift);
                weekShiftSet.add(shift.idShift);
                return !duplicate;
              });
            });
            }
          }
      });
    }
    for (let i = 0; i < this.listShift.length; i++) {
      if (isNaN(Number(this.listShift[i].idShift))) {
        this.listShift.splice(i, 1);
        i--;
      }
    }
    this.listShift = this.listShift.filter((shift: ShiftModel) => shift.idShift && (!shift.acheval || (shift.acheval && !shift.shiftAchevalHidden)));
    const shiftSet = new Set();
    // removing-duplicates-in-an-array
    this.listShift = this.listShift.filter(shift => {
      const duplicate = shiftSet.has(shift.idShift);
      shiftSet.add(shift.idShift);
      return !duplicate;
    });
    this.listEmployeeHasShift = [];

    this.listShift.forEach((shiftDisplay: ShiftModel) => {
      const fakeEmployee = new EmployeeModel();
      fakeEmployee.idEmployee = 0;
      fakeEmployee.nom = '';
      fakeEmployee.prenom = '';
      if (!shiftDisplay.employee) {
        shiftDisplay.employee = fakeEmployee;
      }
      if (this.checkIfShiftAcheval(shiftDisplay) && this.getModeDispaly(shiftDisplay)) {
        shiftDisplay.acheval = true;
        shiftDisplay.modifiable = true;
      }
      if (shiftDisplay.acheval && shiftDisplay.modifiable) {
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftDisplay.jour), true);
        shiftDisplay.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));

        const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shiftDisplay));
        if (shiftDuplicate) {
          this.listShift.push(shiftDuplicate);
        }
      }
    });
    this.sortListShiftByShiftAcheval(this.listShift);
    this.sortListShift(this.listShift);
    this.shiftByEmployee = this.groupShiftByEmployee(this.listShift, shiftDisplay => shiftDisplay.employee.idEmployee);
    this.calculeTotalInWeekAndTotalInDayForShift();
    this.displaySuccesSauvegardeMessage();
    this.displayHebdoEmitter.emit(displayPlgHebdo);
    this.popupVerificationContrainteGlobaleVisibility = false;
    this.listShiftToUpdate = [];
    this.listShiftToDelete = [];
    this.listShiftByEmployeeToDelete = [];
    this.withAffectation = 0;
    this.listContraintesSocialesByShift = new Map();
    this.listContraintesSocialesByShiftDefault = new Map();

  }

  private checkIfShiftAcheval(shift: ShiftModel): boolean {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(shift.jour);
    this.getStartAndEndActivityDay(shift.dateJournee);
    return (moment(shift.heureFin).isAfter(this.endActivity));
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
   * get shift before drag and drop for veification contrainte social
   * @param: cardDropInfos
   */
  private getShiftBeforeDragAndDrop(cardDropInfos, employee): ShiftModel {
    let newShift = {} as ShiftModel;
    this.listShift.forEach(shift => {
      if (shift.idShift === cardDropInfos.idShift && !shift.shiftAchevalHidden) {
        newShift = {...shift};
        if (newShift.acheval) {
          newShift.modifiable = true;
        }
        if (this.eventCtrl) {
          newShift.idShift = 0;
          delete newShift.uuid;
        }
        newShift.employee = employee;
        newShift.jour = cardDropInfos.newDayZone.toUpperCase();
        const newShiftDate = this.days.find((d: any) => d.val.toUpperCase() === newShift.jour);
        if (newShiftDate) {
          newShift.dateJournee = newShiftDate.dateJournee;
        }
        this.dateService.setCorrectTimeToDisplayForShift(newShift);
      }
    });
    return newShift;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(onAcceptOperation: Function, onRejectOperation?: Function): Observable<boolean> {
    this.navigateTo = false;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        //  this.saveListShift();
        //  this.saveListShiftEmitter.emit();
        this.saveListGlobaleEmitter.emit({awayNavigation: !onRejectOperation, operation: onAcceptOperation});
      },
      reject: () => {
        if (onRejectOperation) {
          onRejectOperation();
        } else {
          this.navigateAway.next(true);
          this.displayHebdoEmitter.emit(false);
        }
      }
    });
    return this.navigateAway;
  }

  public sauvegardeGlobaleVueHebdo(): void {
    this.saveListShiftEmitter.emit();
  }

  /**
   * methode excecute after init
   */
  reCalculeHeight() {
    this.cdRef.detectChanges();
    const windowHeight = window.innerHeight;
    this.contentHeightPlanning = windowHeight - 270;
  }

  /**
   * deselectionner la ligne
   */
  public unselectShift() {
    if (!this.showConfimeDelete) {
      // toggle selected rows
      document.querySelectorAll('table.planning tr').forEach(element => {
        element.classList.remove('row-selected');
      });
      this.selectedEmployee = {} as EmployeeModel;
    }
  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.reCalculeHeight();
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
    const finJournee = this.decoupageHoraireService.getFinJourneePhase();
    const debutJournee = this.decoupageHoraireService.getDebutJourneePhase();
    forkJoin([finJournee, debutJournee])
      .subscribe((decoupageHoraire: [DecoupageHoraireModel, DecoupageHoraireModel]) => {
        this.finJourneeActivite = decoupageHoraire[0];
        this.debutJourneeActivite = decoupageHoraire[1];
        this.decoupageHoraireFinEtDebutActivity = {debutJournee: this.debutJourneeActivite, finJournee: this.finJourneeActivite};
      });


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
   * correction des heures planifiers
   * @param :listShiftByDay
   */
  private correctTimeBeforCalculHour(listShiftByDay: ShiftModel[]): ShiftModel[] {
    listShiftByDay.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
    });
    return listShiftByDay;
  }

  public duplicateShiftAcheval(shift: ShiftModel): ShiftModel {
    const shiftRefrence = this.clone(shift);
    const numJour = this.dateService.getIntegerValueFromJourSemaine(this.dateService.getJourSemaineFromInteger(new Date(shiftRefrence.dateJournee).getDay()));
    shiftRefrence.acheval = true;
    shiftRefrence.modifiable = false;
    shiftRefrence.heureDebutIsNight = false;
    shiftRefrence.heureFinIsNight = false;
    const day = numJour < 6 ? numJour + 1 : 0;
    shiftRefrence.shiftAchevalHidden = true;
    shiftRefrence.jour = this.dateService.getJourSemaineFromInteger(day);
    if (this.firstDayAsInteger === day) {
      return null;
    }
    return shiftRefrence;
  }

  /**
   * verifier si le journée de shift est egual à derniere jour de la semaine
   * @param day
   */
  private checkShiftInlastWeek(day: number): boolean {
    return this.firstDayAsInteger === day;
  }

  /**
   * ajouter shift acheval (modifiable) dans le list de shift en cours
   * @param shift
   * @param collection
   */
  public addShiftAchevalInCurrentList(shift: ShiftModel, collection: any, filter?: boolean): any {
    const listShiftInDay: any[] = [];
    if (collection) {
      collection.forEach((item: ShiftModel) => {
        const shiftRefrence = this.clone(shift);
        const shiftDisplay = this.clone(item);
        const dayShift = this.getDayOfShiftAcheval(this.clone(shiftRefrence.jour));
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftDisplay.jour));
        if ((item.acheval && item.modifiable) && dayShift === item.jour) {
          const shiftDuplicate = this.duplicateShiftAcheval(this.clone(item));
          if (shiftDuplicate) {
            listShiftInDay.push(shiftDuplicate);
          }
        }
        if (filter && (shift.acheval && shift.modifiable) && shiftRefrence.jour === dayShiftDisplay && this.firstDayAsInteger !== this.dateService.getIntegerValueFromJourSemaine(this.clone(shiftDisplay.jour))) {
          shiftDisplay.sameDateToShiftAcheval = true;
          listShiftInDay.push(shiftDisplay);
        }
      });
    }
    return listShiftInDay;
  }

  /**
   * ajouter journée pour le shift
   * @param dayShift
   * @param addDays
   */
  private getDayOfShiftAcheval(dayShift: JourSemaine, addDays?: boolean): JourSemaine {
    let day;
    const numJour = this.dateService.getIntegerValueFromJourSemaine(dayShift);
    if (!addDays) {
      day = numJour > 0 ? numJour - 1 : 0;
    } else {
      day = numJour < 6 ? numJour + 1 : 0;

    }
    dayShift = this.dateService.getJourSemaineFromInteger(day);

    return dayShift;

  }

  /**
   * supprime shift acheval et non modifiable
   * @param idShift
   * @param mangerOrLeaderActif
   */
  public deleteShiftAchevalHidden(idShift: any, idEmployee: number): void {
    let collection = this.shiftByEmployee.get(idEmployee);
    if (!collection) {
      collection = [];
    }
    const indexPlanningManager = collection.findIndex((item: ShiftModel) => item.idShift === idShift && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManager !== -1) {
      collection.splice(indexPlanningManager, 1);
    }
    const indexPlanningManagerDeleted = this.listShift.findIndex((item: ShiftModel) => item.idShift === idShift && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManagerDeleted !== -1) {
      this.listShift.splice(indexPlanningManagerDeleted, 1);
    }
  }

  /**
   * Trie des shifts
   */
  private sortListShiftByShiftAcheval(listShift: ShiftModel[]): void {
    listShift.sort(function (shift: ShiftModel, shiftDisplay: ShiftModel) {
      // true values first
      return (shift.acheval && shift.modifiable === shiftDisplay.acheval && shift.modifiable) ? 0 : shift.acheval && shift.modifiable ? 0 : shift.acheval && !shift.modifiable ? -1 : 1;
    });
  }

  public getDetailsSemaine(listShift: ShiftModel[], listShiftManagerLeader: ShiftModel[]): void {
    if (this.detailTempsPayeWeek) {
      this.detailTempsPayeWeek = this.plgHebdoHelperService.calculTotauxSemaine(listShift, this.activeEmployeesPerWeek, this.detailTempsPayeWeek, this._displayPlgManagers, listShiftManagerLeader, this.listEmployeeHasShift);
      this.getTotalSemaineMOEProd();
    } else {
      this.planningEquipierService.getDetailsTempsPayeWeek(this.datePipe.transform(this.dateDebut, 'dd/MM/yyyy')).subscribe((data: any) => {
        this.detailTempsPayeWeek = data;
        this.detailTempsPayeWeek = this.plgHebdoHelperService.calculTotauxSemaine(listShift, this.activeEmployeesPerWeek, this.detailTempsPayeWeek, this._displayPlgManagers, listShiftManagerLeader, this.listEmployeeHasShift);
        this.getTotalSemaineMOEProd();
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  public getCaDayByDay(listShift: ShiftModel[], listShiftManagerLeader: ShiftModel[]): void {
    if (this.caData) {
      this.totauxDayByDay = this.plgHebdoHelperService.getDayByDayInfo(listShift, listShiftManagerLeader, this.days, this.caData, this._displayPlgManagers, this.activeEmployeesPerWeek, this.listEmployeeHasShift);
    } else {
      this.plgHebdoService.getDayByDayVente(this.datePipe.transform(this.dateDebut, 'dd-MM-yyyy'), this.datePipe.transform(this.dateFin, 'dd-MM-yyyy')).subscribe((data: TotalCaPerDay[]) => {
        this.caData = data;
        this.totauxDayByDay = this.plgHebdoHelperService.getDayByDayInfo(listShift, listShiftManagerLeader, this.days, this.caData, this._displayPlgManagers, this.activeEmployeesPerWeek, this.listEmployeeHasShift);
        this.notificationService.stopLoader();
      }, (err: any) => {
        console.log(err);
        this.notificationService.stopLoader();
      });
    }
  }

  public getTotalSemaineMOEProd(): void {
    if (this._getTauxMoeWeekTotal) {
      this.totalMoeSemaineEmitter.emit({totalMoe: this.detailTempsPayeWeek.tauxMOEMoyen, totalProd: this.detailTempsPayeWeek.prodMoyenne});
    }
  }

  /**
   * charger des shifts avec des employes, vérification de chevauchement, vérification de statut de l'émployé (actif ou non actif)
   * @param loadedShiftOrEmploye
   * @private
   */
  private ovewriteWeekWithAffecation(loadedShiftOrEmploye: any) {
    let shifts = [];
    const fakeEmployee = new EmployeeModel();
    fakeEmployee.idEmployee = 0;
    fakeEmployee.nom = '';
    fakeEmployee.prenom = '';
    loadedShiftOrEmploye.forEach(employe => {
      employe.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
        const employeHasContart = this.contrainteSocialeService.getContratByDay(this.clone(employe), new Date(wdp.dateJour));
        wdp.shifts = employeHasContart.contrats ? wdp.shifts : this.getShiftsWithFakeEmploye(wdp.shifts);
        wdp.shifts.forEach(shift => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);
          if (!shift.employee) {
            shift.employee = fakeEmployee;
          }
          shift.jour = this.dateService.getJourSemaineFromInteger(new Date(shift.dateJournee).getDay());
          this.listShift.forEach(shiftDispaly => {
            if (!shiftDispaly.employee) {
              shiftDispaly.employee = fakeEmployee;

            }
            if ((shift.employee.idEmployee === shiftDispaly.employee.idEmployee &&
                moment(this.dateService.setTimeNull(new Date(shift.dateJournee))).isSame(this.dateService.setTimeNull(new Date(shiftDispaly.dateJournee)))) &&
              this.dateService.isIntervalConfondues(shiftDispaly, shift)) {
              if ((shift.employee && shift.employee.idEmployee)) {
                shift.employee = fakeEmployee;
              }
            }
          });
          shift.idShift = this.makeString();
          if (shift.employee && shift.employee.idEmployee) {
            shift.employee.nom = employeHasContart.nom;
            shift.employee.prenom = employeHasContart.prenom;
            shift.employee.idEmployee = employeHasContart.idEmployee;
          }
          shifts.push(shift);
        });

      });
    });

    this.listShiftToUpdate = this.listShiftToUpdate.concat(shifts);
    this.listShift = this.listShift.concat(shifts);

    if (!this.verificationCsAfterLoadingWeek()) {
      this.popupVerificationContrainteLoadingWeekVisibility = true;

    } else {
      this.getlistShiftByRestaurant();
    }

  }

  /**
   * si un employé n’est plus actif sur une journée,
   * ses shifts de la journée passeront directement dans “shifts non affectés”
   * @param shifts
   * @private
   */
  private getShiftsWithFakeEmploye(shifts: ShiftModel[]): ShiftModel[] {
    const fakeEmployee = new EmployeeModel();
    fakeEmployee.idEmployee = 0;
    fakeEmployee.nom = '';
    fakeEmployee.prenom = '';
    shifts.forEach((shift: ShiftModel) => {
      if (shift.employee && shift.employee.idEmployee) {
        shift.employee = fakeEmployee;
      }
    });
    return shifts;

  }

  /**
   * vérification de Cs aprés le chargement semaine de réference
   * @param fromSaveGlobal
   */
  public verificationCsAfterLoadingWeek(fromSaveGlobal?: boolean) {
    this.listContrainteOfLaodingWeek = [];
    this.listContrainteSuppression = [];
    const socialeConstraintesAreValid = true;
    let shift = null;
    let dateJournee = null;
    let employee = null;
    let listShifts = this.clone(this.listShift);
    listShifts = this.displayListShift(listShifts);
    let param: any;
    let result;
    let listShiftsInDay = [];
    let listShiftInWeek = [];
    // from save global pour identifier si la vc avant le save global ou avant le chargement de semaine de réference
    // !fromSaveGlobal: pour la verification avant le chargement semaine de reference
    if (!fromSaveGlobal) {
      this.listEmployeeHasShiftInWeekReference = [];
      this.listContraintesSocialesByShift = new Map();
      //vérification de cs pour tous les shifts comme jour de repos , disponibilité,qualification

      listShifts.forEach(value => {
        if (value.employee && value.employee.idEmployee) {
          shift = value;
          dateJournee = new Date(value.dateJournee);
          employee = this.activeEmployeesPerWeek.find(employe => employe.idEmployee === value.employee.idEmployee);
          // pour gerer l'employee avec id == 0 ( employee avec id == 0 pour les shifts sans affectations )
          if (employee !== undefined && employee.contrats && employee.contrats.length) {
            param = this.getParamForVerificationCS(employee, dateJournee);
            const exists = !!this.listEmployeeHasShiftInWeekReference.find((employe: EmployeeModel) => employe.idEmployee === employee.idEmployee);
            if (!exists) {
              this.listEmployeeHasShiftInWeekReference.push(this.clone(employee));
            }
            result = this.verificationContraintePlanningEquipierViewHebdoService.verifContraintesForAllShift(shift, param.employeVerifCs, this.employeeHasAnomalieContraintSocial, this.listContraintesSocialesByShift, this.messageVerification, this.listContrainteOfLaodingWeek, this.dateContrainteAcheve, this.popupVerificationContrainteLoadingWeekVisibility, this.listContrainteSuppression, this.paramNationaux, this.listOfBreakAndShift, this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd, this.modeAffichage, this.listJourFeriesByRestaurant, this.semaineRepos, param.paramDate, param.paramWeek, socialeConstraintesAreValid);
            ['listContrainteOfLaodingWeek', 'messageVerification', 'dateContrainteAcheve', 'popupVerificationContrainteLoadingWeekVisibility', 'listContrainteSuppression', 'listContraintesSocialesByShift'].forEach(item => this[item] = result[item]);
          }
        }
      });
      if (this.listContrainteOfLaodingWeek.length) {
        this.listContraintesSocialesByShift = this.groupContrainteByShift(this.clone(this.listContrainteOfLaodingWeek), value => value.idShift);
      }
    }
    if(fromSaveGlobal){
      this.listContrainteOfLaodingWeek = [];
      this.listContraintesSocialesByShift.delete(0);
    }
    this.activeEmployeesPerWeek.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay && employeDisplay.idEmployee && employeDisplay.contrats && employeDisplay.contrats.length) {
        listShiftInWeek = [];
        if (listShifts) {
          listShifts.filter((shiftDisplay: ShiftModel) => (!shiftDisplay.acheval || !shiftDisplay.shiftAchevalHidden) && shiftDisplay.employee && shiftDisplay.employee.idEmployee &&
            shiftDisplay.employee.idEmployee && shiftDisplay.employee.idEmployee === employeDisplay.idEmployee).forEach(element => listShiftInWeek.push(this.clone(element)));
        }
        //vérification de cs par semaine comme nbre des heures travaillé dans une semaine, nbre de jours travillé dans une semaine ...
        if (listShiftInWeek && listShiftInWeek.length) {
          param = this.getParamForVerificationCS(employeDisplay, listShiftInWeek[0].dateJournee);
          result = this.verificationContraintePlanningEquipierViewHebdoService.verifContraintFromListShiftInWeek(this.activeEmployeesPerWeek, param.employeVerifCs,
            this.employeeHasAnomalieContraintSocial, this.messageVerification, this.listContrainteOfLaodingWeek,
            this.dateContrainteAcheve, this.popupVerificationContrainteLoadingWeekVisibility, this.listContrainteSuppression, this.paramNationaux,
            this.listOfBreakAndShift, this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd, this.modeAffichage,
            this.listJourFeriesByRestaurant, param.paramDate, param.paramWeek, socialeConstraintesAreValid, this.weekDates, listShiftInWeek, employeDisplay.listShiftForThreeWeekViewHebdo);
          ['listContrainteOfLaodingWeek', 'messageVerification', 'dateContrainteAcheve', 'popupVerificationContrainteLoadingWeekVisibility', 'listContrainteSuppression'].forEach(item => this[item] = result[item]);
        }
        // verification de cs journaliére comme l 'amplitude , nbre de shift par jours...
        for (let i = 0; i < 7; i++) {
          dateJournee = this.clone(this.dateDebut);
          dateJournee.setDate(dateJournee.getDate() + i);
          listShiftsInDay = this.listShift.filter(value => value.employee && value.employee.idEmployee && value.employee.idEmployee === employeDisplay.idEmployee &&
            moment(this.dateService.setTimeNull(new Date(value.dateJournee))).isSame(this.dateService.setTimeNull(new Date(dateJournee))));
          if (listShiftsInDay.length) {
            param = this.getParamForVerificationCS(employeDisplay, listShiftsInDay[0].dateJournee);
            result = this.verificationContraintePlanningEquipierViewHebdoService.verifContraintFromListShiftInDay(listShiftsInDay, param.employeVerifCs,
              this.employeeHasAnomalieContraintSocial, this.messageVerification, this.listContrainteOfLaodingWeek,
              this.dateContrainteAcheve, this.popupVerificationContrainteLoadingWeekVisibility, this.listContrainteSuppression, this.paramNationaux,
              this.listOfBreakAndShift, this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd, this.modeAffichage,
              this.listJourFeriesByRestaurant, param.paramDate, param.paramWeek, socialeConstraintesAreValid, this.weekDates, listShiftInWeek);
            ['listContrainteOfLaodingWeek', 'messageVerification', 'dateContrainteAcheve', 'popupVerificationContrainteLoadingWeekVisibility', 'listContrainteSuppression'].forEach(item => this[item] = result[item]);

          }
        }
      }
    });
    if (fromSaveGlobal && this.listContrainteOfLaodingWeek.length) {
      this.listContraintesSocialesByShift = new Map([...Array.from(this.listContraintesSocialesByShift.entries()), ...Array.from(this.groupContrainteByShift(this.listContrainteOfLaodingWeek, value => value.idShift).entries())]);
      this.popupVerificationContrainteLoadingWeekVisibility = false;
      return true;
    }
    this.popupVerificationContrainteLoadingWeekVisibility = false;
    if (!fromSaveGlobal) {
      this.shiftByEmployee = this.groupShiftByEmployee(this.listShiftDefaultAfterLoading, shiftDisplay => shiftDisplay.employee.idEmployee);
    }
    return result ? result.socialeConstraintesAreValid : true;
  }

  /**
   * corriger  la date et supprimer la duplication pour le list de shifts a afficher
   * @param listShifts
   * @private
   */
  private displayListShift(listShifts: ShiftModel[]): ShiftModel[] {
    listShifts.forEach(shift => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      shift.jour = this.dateService.getJourSemaineFromInteger(new Date(shift.dateJournee).getDay());
      if (shift.acheval && shift.modifiable) {
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shift.jour), true);
        shift.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
        const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shift));
        if (shiftDuplicate) {
          listShifts.push(shiftDuplicate);
        }
      } else if (shift.acheval && !shift.modifiable) {
        shift.jour = this.getDayOfShiftAcheval(this.clone(shift.jour), true);
      }

    });
    this.sortListShiftByShiftAcheval(listShifts);
    this.sortListShift(listShifts);
    return listShifts;
  }

  /**
   * recuperer les inputs pout la Vc
   * @param employee
   * @param dateJournee
   * @private
   */
  private getParamForVerificationCS(employee: EmployeeModel, dateJournee: any): any {
    this.listLoi = employee.loiEmployee;
    this.checkEmployeMineur(employee);
    this.getContratByEmployeeActif(employee, dateJournee, true);
    this.employeeHasAnomalieContraintSocial = employee;
    const employeVerifCs = {
      listLoi: this.listLoi,
      tempsTravailPartiel: this.tempsTravailPartiel,
      mineur: this.mineur,
      contratActif: this.contratActif
    };
    const paramDate = {
      selectedDate: dateJournee,
      premierJourDeLaSemaine: this.premierJourDeLaSemaine,
      limiteHeureDebut: this.limiteHeureDebut
    };

    const paramWeek = {
      jourDebutWeekEnd: this.jourDebutWeekEnd,
      jourFinWeekEnd: this.jourFinWeekEnd,
      heureDebutWeekEnd: this.heureDebutWeekEnd,
      heureFinWeekEnd: this.heureFinWeekEnd
    };
    return {employeVerifCs: employeVerifCs, paramDate: paramDate, paramWeek: paramWeek};
  }

  /**
   * grouper le cs par shift
   * @param list
   * @param keyGetter
   */
  public groupContrainteByShift(list, keyGetter) {
    this.listEmployeeHasShift = [];
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  /**
   * verify if bellow menu opened or not
   * @param event
   */
  menuOpenedBas(event) {
    this.clickMenubas = event;
  }

  hideDropDown() {
    const elems = document.querySelectorAll('.show');
    elems.forEach((el) => {
      el.classList.remove('show');
    });
  }

}
