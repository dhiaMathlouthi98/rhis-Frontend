import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {ShiftFixeService} from '../../service/shift.fixe.service';
import {ShiftFixeModel} from '../../../../../../shared/model/shiftFixe.model';
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
import {PlanningsFixesEmployeeRowComponent} from '../plannings-fixes-employee-row/plannings-fixes-employee-row.component';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

declare var interact;


@Component({
  selector: 'rhis-planning-fixes-container',
  templateUrl: './planning-fixes-container.component.html',
  styleUrls: ['./planning-fixes-container.component.scss'],

})
export class PlanningFixesContainerComponent implements OnInit, AfterViewInit {
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public lawCodeName = false;
  public showConfimeDelete = false;
  public hiddenSave = false;
  public listPairAndOdd: DisponiblitePairOrOdd [] = [];
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  public shiftFixeToSave: any;
  public showPopAddShiftFixe = false;
  public listContrainte: VerificationContrainteModel[] = [];
  public popupVerificationContrainteVisibility = false;
  public messageVerification = {} as VerificationContrainteModel;
  public employeeHasAnomalieContraintSocial = {} as EmployeeModel;
  public selectedEmployee = {} as EmployeeModel;
  public listShiftFixesToUpdate: ShiftFixeModel[] = [];
  public listIdShiftFixesToDelete: any[] = [];
  public listShiftFixesByEmployeeToDelete: any[] = [];
  public filter: string;
  private listLoi: any;
  private listLoiByCodeName: any;
  private semaineRepos: SemaineReposModel[] = [];
  public draggableElementShiftFixe: any;
  public listEmployeeActif: EmployeeModel[] = [];
  // permet de savoir si une opération 'ajoutu d'un employé ou d'un poste est en cours
  public newEmployeeInProgress = false;
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public listShiftFixe: ShiftFixeModel[] = [];
  public listShiftFixeDefault: ShiftFixeModel[] = [];
  public listePositionTravail: PositionTravailModel[] = [];
  public totalShiftFixeInWeek = 0;
  public firstDayAsInteger: number;
  public dateContraintSocial: any;
  public dateContrainteAcheve: any;

// les employees qui ont des shift fixes
  public listEmployeeHasShiftFixe: EmployeeModel[] = [];
// les employees qui n'ont pas des shift fixes
  public listEmployeeNotHasShiftFixe: EmployeeModel[] = [];
  public shiftFixeByEmployee = new Map();
  public listLoiByEmployee = new Map();
  public listLoiByGroupTravail = new Map();
  days: any[] = [];
  public addPopupTitle = this.rhisTranslateService.translate('SHIFT_FIXE.MODAL_ADD_TITLE');
  public updatePopupTitle = this.rhisTranslateService.translate('SHIFT_FIXE.MODAL_UPDATE_TITLE');
  // error messages
  public dateDebutSupDateFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_DEBUT_SUP_DATE_FIN');
  public dateFinWithoutDateDebutErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_FIN_WITHOUT_DATE_DEBUT');
  public heureDebutSupHeureFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.HEURE_DEBUT_SUP_HEURE_FIN');
  public limiteHeureDebut: Date;
  public titlePopupContraint = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIES');
  public listJourFeriesByRestaurant;
  public setNightValue;
  public listEmployeeInactifHasShiftFixe;
  public messageConfonduShiftFixe = '';
  private ecran = 'GPF';
  private frConfig: any;

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

  public listBesoinsCondense = true;

  public stylelistBesoinCondense = true;

  @ViewChild('contentBodyPlan') calcHeight: ElementRef;
  @ViewChildren(PlanningsFixesEmployeeRowComponent, {read: PlanningsFixesEmployeeRowComponent})
  public planningFixRows: QueryList<PlanningsFixesEmployeeRowComponent>;
  public eventCtrl = false;
  public isActif = false;
  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
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

  constructor(
    private confirmationService: ConfirmationService,
    private rhisTranslateService: RhisTranslateService,
    private employeeService: EmployeeService,
    private sharedRestaurant: SharedRestaurantService,
    private dateService: DateService,
    private shiftFixeService: ShiftFixeService,
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
    this.getSelectedRestaurant();
    this.getParamRestaurantByCodeNames();
    this.getDecoupageHoraire();
    this.findAllEmployeActifWithGroupTravailsPlgFixe();
    this.getListePositionTravailActiveByRestaurant();
    this.getHeureLimite();
    this.getParamNationauxByRestaurant();

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

  /**
   * recuperer tous les jours feries par restaurant
   */
  private getJourFeriesByRestaurant() {
    this.joursFeriesServie.getAllJourFeriesByRestaurant().subscribe((data: JourFeriesModel[]) => {
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
   * Trie des shifts fixe
   */
  private sortListShiftFixe(listShiftFixe: ShiftFixeModel[]): void {
    listShiftFixe.sort(function (a: ShiftFixeModel, b: ShiftFixeModel) {
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
  private getContratByEmployeeActif(employee: EmployeeModel, filterDragAndDrop?: string) {
    if (this.contratActif.idContrat !== employee.contrats[0].idContrat) {

        this.contratService.getActifContratByEmployeeWithDisponiblite(employee.uuid, new Date(), !employee.contrats[0].actif).subscribe(
          (data: any) => {
            this.contratActif = data;
            if (data.tempsPartiel) {
              this.tempsTravailPartiel = true;
            } else {
              this.tempsTravailPartiel = false;
            }
            this.checkIsFoundJourReposByEmployee(employee);
            this.identifierEmployee(employee, filterDragAndDrop);
          }
        );
    } else if (filterDragAndDrop) {
      this.checkShiftFixeChangePosition(employee);
    }

  }


  /**
   * permet de recupere le lois de l'employe
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
    if (this.paramNationaux.payerLeBreak) {
      this.checkEmployeMineur(employee);
      if (employee.contrats[0].tempsPartiel) {
        this.tempsTravailPartiel = true;
      } else {
        this.tempsTravailPartiel = false;
      }

      if (employee.hasLaws) {
        // employee laws
        await this.getEmployeeLawsByCodeName(employee);
      } else if (employee.contrats[0].groupeTravail.hasLaws) {
        // groupe trav laws
        await this.getGroupeTravailLawsByCodeName(employee);
      } else {
        // restaurant laws
        await this.getRestaurantLawsByCodeName();
      }
    }
    const collection = this.clone(this.shiftFixeByEmployee.get(employee.idEmployee));
    this.takeBreakswithTime(collection, this.listLoiByCodeName, this.tempsTravailPartiel, this.mineur);
    employee.totalRowTime = this.clone(this.totalRowTime);
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
          this.checkShiftFixeChangePosition(employee);
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
          this.checkShiftFixeChangePosition(employee);
        }
      },
      (err: any) => {
      }
    );
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
          this.checkShiftFixeChangePosition(employee);
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
          this.checkShiftFixeChangePosition(employee);
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
    this.loiRestaurantService.getAllActifLoiRestaurantByIdRestaurant().subscribe(
      (data: LoiRestaurantModel[]) => {
        this.listLoi = data;
        this.filter = 'restaurant';
        if (filterDragAndDrop) {
          this.checkShiftFixeChangePosition(employee);
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

  /**
   * recuperer list de shift fixe
   */
  public getListSifhtFixeByRestaurant() {
    this.shiftFixeService.getlistSifhtFixeByRestaurant().subscribe(
      (data: any) => {
        this.listShiftFixe = data;
        this.listShiftFixeDefault = JSON.parse(JSON.stringify(this.listShiftFixe));
        this.listShiftFixe.forEach(shift => {
          this.setCorrectTimeToDisplay(shift);
          if (shift.acheval && shift.modifiable) {
            const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shift.jour), true);

            shift.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
            const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shift));
            if (shiftDuplicate) {
              this.listShiftFixe.push(shiftDuplicate);
            }

          }
        });
        this.listEmployeeHasShiftFixe = [];
        this.sortListShiftByShiftAcheval(this.listShiftFixe);
        this.shiftFixeByEmployee = this.groupShiftFixeByEmployee(this.listShiftFixe, shiftFixeDisplay => shiftFixeDisplay.employee.idEmployee);

        this.fillAvailableEmployeeActif();
        this.calculeTotalInWeekAndTotalInDayForShiftFixe();
        this.reCalculeHeight();
        this.getJourFeriesByRestaurant();

      },
      (err: any) => {
      }
    );
  }

  initValuesForVericationContrainte(event: any): void {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(event.day);
    this.showPopAddShiftFixe = false;
    this.getContratByEmployeeActif(event.employee);
  }

  /**
   * Permet de grouper la liste des shiftes fixes  par employee
   * @param: list
   * @param: keyGetter
   */
  private groupShiftFixeByEmployee(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
        this.listEmployeeActif.forEach(employeeDisplay => {
          if (employeeDisplay.idEmployee === item.employee.idEmployee) {
            this.listEmployeeHasShiftFixe.push(employeeDisplay);
          }
        });

      } else {
        collection.push(item);
      }
    });
    this.getHistoriqueOfPlanningFixe();
    return map;
  }

  /**
   *Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe,
   * il faut garder et afficher l’historique des plannings
   */
  public getHistoriqueOfPlanningFixe() {
    this.listEmployeeInactifHasShiftFixe = [];
    this.listShiftFixe.forEach(shift => {
      const exist = this.listEmployeeActif.some(employee =>
        employee.idEmployee === shift.employee.idEmployee
      );
      // pour eviter la duplication
      const duplicate = this.listEmployeeInactifHasShiftFixe.some(employeeDisplay =>
        employeeDisplay.idEmployee === shift.employee.idEmployee
      );
      // ajpouter des managers pou leaders ont de plannings manager ou leader et non pas actif ou leurs groupes travails ont changés
      if (!exist && !duplicate) {
        shift.employee.disablePlanningManagerOrLeaderOrFixe = true;
        this.listEmployeeInactifHasShiftFixe.push(shift.employee);
      }

    });

    this.listEmployeeHasShiftFixe = this.listEmployeeHasShiftFixe.concat(this.listEmployeeInactifHasShiftFixe);
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
   * recuperer tous les employes actifs et appartient a plng fixe
   */
  private findAllEmployeActifWithGroupTravailsPlgFixe() {
    this.employeeService.findAllEmployeActifWithGroupTravailsPlgFixe().subscribe(
      (data: any) => {
        this.listEmployeeActif = data;
        this.listEmployeeActif.forEach(emp => {
          emp.fullName = emp.nom + ' ' + emp.prenom;
        });
        this.getListSifhtFixeByRestaurant();
      },
      (err: any) => {
        console.log(err);
      }
    );

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
    for (let i = 0; i < 7; i++) {
      this.days.push({
        column: this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        val: this.convertStringToCamelCase(this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7))
      });
      this.days.push();
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
   * Ajouter ou modifier une nouvelle card de shift fixe
   * @param: cardDetails
   */
  public addOrUpdateNewShiftFixeCard(shiftFixe: ShiftFixeModel): void {
    this.hiddenSave = false;
    this.shiftFixeToSave = {...shiftFixe};
    if (this.canAddShiftFixe(this.shiftFixeToSave)) {
      if (this.calculeTotalInWeekAndTotalInDayForShiftFixe(shiftFixe)) {
        const collection = this.clone(this.shiftFixeByEmployee.get(shiftFixe.employee.idEmployee));
        this.takeBreakswithTime(collection, this.listLoi, this.tempsTravailPartiel, this.mineur, shiftFixe);
        if (shiftFixe.idShiftFixe) {
          // update
          this.updateShiftFixe();
        } else {
          // add new
          this.addNewShiftFixee();
        }
      } else {
        this.popupVerificationContrainteVisibility = true;
      }
    }
  }

  private getModeDispaly(newShiftFixe: ShiftFixeModel): number {
    return this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, this.dateService.getDateOfEnumertionJour(newShiftFixe.jour), this.dateService).updatedModeAffichage;

  }

  /**
   * Verification  de l'horraire du planning shift
   * on ne peut pas avoir des horaires confondues
   */
  public canAddShiftFixe(shift, isDragAndDrop?: boolean): boolean {
    shift.heureDebut = this.dateService.setSecondAndMilliSecondsToNull(shift.heureDebut);
    shift.heureFin = this.dateService.setSecondAndMilliSecondsToNull(shift.heureFin);
    const shiftToSave = this.clone(shift);
    this.dateService.setCorrectTimeToDisplayForShift(shiftToSave);
    if (isDragAndDrop) {
      this.getStartTimeAndEndTimeFromDecoupageHoraire(shiftToSave.jour);
      this.getStartAndEndActivityDay();
      if (shiftToSave.acheval) {
        shiftToSave.modifiable = true;
      }
      if ((!shiftToSave.acheval || this.getModeDispaly(shiftToSave) === 0) && (moment(shiftToSave.heureFin).isAfter(this.endActivity) || moment(shiftToSave.heureDebut).isBefore(this.startActivity))) {
        this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_EQUIPIER.END_START_ERROR_LIMIT_ACTIVITY');
        return false;
      }
    }
    if (this.shiftFixeByEmployee.get(shiftToSave.employee.idEmployee).length === 0) {
      return true;
    } else {
      let canAdd = true;
      let collection = this.clone(this.shiftFixeByEmployee.get(shiftToSave.employee.idEmployee));
      collection = collection.filter((shiftDisplay: ShiftFixeModel) => !shiftDisplay.acheval || !shiftDisplay.shiftAchevalHidden);

      if (this.modeAffichage !== 0) {
        collection = collection.concat(this.addShiftAchevalInCurrentList(this.clone(shiftToSave), collection, true));

      }
      collection.forEach(shiftDisplay => {
        if (shiftToSave.idShiftFixe !== shiftDisplay.idShiftFixe) {
          if (shiftDisplay.jour.toUpperCase() === shiftToSave.jour.toUpperCase() || shiftDisplay.sameDateToShiftAcheval) {
            const lastValue = shiftDisplay;
            // condition dans l'intervaele

            if (lastValue.idShiftFixe !== shiftToSave.idShiftFixe) {
              const plannedDate = this.dateService.getDateOfEnumertionJour(shiftToSave.jour);
              shiftToSave.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureDebut), shiftToSave.dateDebutIsNight);
              shiftToSave.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, shiftToSave.heureFin), shiftToSave.dateFinIsNight);
              const plannedDateLastValue = this.dateService.getDateOfEnumertionJour(lastValue.jour);
              lastValue.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDateLastValue, lastValue.heureDebut), lastValue.dateDebutIsNight);
              lastValue.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDateLastValue, lastValue.heureFin), lastValue.dateFinIsNight);
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

  /**
   * Cette methode permet d'afficher un message d'erreur en cas ou les horaires sont confondues
   */
  public horraireConfonduesErrorMessage(isDragAndDrop?: boolean) {
    // en cas de drag and drop
    this.messageConfonduShiftFixe = '';
    if (isDragAndDrop) {
      this.notificationService.showErrorMessage('BIMPOSE.ERROR_VALIDATION', 'PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');
    } else {
      this.messageConfonduShiftFixe = this.rhisTranslateService.translate('PLANNING_MANAGER.HORAIRE_CONFONDUE_ERROR');

    }


  }

  /**
   * reset message  du chevauchement des heures
   */
  public resetMessageConfonduShiftFixe(): void {
    this.messageConfonduShiftFixe = '';
  }

  /**
   * modifier shift fixe
   */
  private async updateShiftFixe(): Promise<void> {
    await this.verificationStatutOfEmployee();
    if (this.isActif) {
      this.shiftFixeToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
      this.updateShiftFixeAfterSave();
    } else {
      this.displayErrorDisponibiliteMessage();
    }
  }

  /**
   * message d'erreur pour la disponiblité de l'employé
   */
  private displayErrorDisponibiliteMessage(): void {
    if (this.shiftFixeToSave.dateFin) {
      this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_PERIODE', 'SHIFT_FIXE.SHIFT_FIXE');
    } else {
      this.notificationService.showErrorMessage('SHIFT_FIXE.DISPONIBLITE_DATE', 'SHIFT_FIXE.SHIFT_FIXE');
    }
  }

  /**
   * vérifier que l’employé est actif sur toute la période du shift
   */
  private async verificationStatutOfEmployee(): Promise<void> {
    this.isActif = false;
    if (this.shiftFixeToSave.dateDebut) {
      try {
        const data = await
          this.contratService.getActifContratByDateDebutAndDateFin(this.shiftFixeToSave.dateDebut, this.shiftFixeToSave.dateFin, this.shiftFixeToSave.employee.uuid).toPromise();
        if (data) {
          this.isActif = true;
        }
      } catch (err) {
      }
    } else {
      this.isActif = true;
    }

  }

  /**
   * meesage de sauvegarde shift fixe
   */
  private displaySuccesSauvegardeMessage(): void {
    this.notificationService.showSuccessMessage('BIMPOSE.SAVED_INFORMATIONS', 'SHIFT_FIXE.SHIFT_FIXE');
  }

  /**
   * ajouter nouveau shift fixe
   */
  private async addNewShiftFixee(): Promise<void> {
    await this.verificationStatutOfEmployee();
    if (this.isActif) {
      this.shiftFixeToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
      this.setNewShiftFixeToListShifFixe();
    } else {
      this.displayErrorDisponibiliteMessage();
    }
  }

  /**
   *  créer une nouvelle ligne Poste
   */
  public newEmployee(): void {
    if (this.listEmployeeNotHasShiftFixe.length !== 0) {
      this.listEmployeeHasShiftFixe.push(new EmployeeModel());
    } else {
      this.notificationService.showInfoMessage(' ', 'SHIFT_FIXE.DISPONIBILITE');
    }
  }

  /**
   * Ajout employee en cours : on affiche le formulaire contenant la selectbox
   * @param: event
   */
  public employeeAdded(event) {
    const employeeToAdd = this.listEmployeeActif.findIndex(emp => emp.idEmployee === event.idEmployee);
    this.listEmployeeHasShiftFixe[this.listEmployeeHasShiftFixe.length - 1] = this.listEmployeeActif[employeeToAdd];
    this.shiftFixeByEmployee.set(this.listEmployeeActif[employeeToAdd].idEmployee, []);
    this.fillAvailableEmployeeActif();
  }

  /**
   * employee has shift fixe
   */
  private fillAvailableEmployeeActif(): void {
    this.listEmployeeNotHasShiftFixe = [];
    let found = false;
    this.listEmployeeActif.forEach((item: EmployeeModel) => {
      found = false;
      this.listEmployeeHasShiftFixe.forEach((usedItem: EmployeeModel) => {

        if (usedItem.idEmployee === item.idEmployee) {
          found = true;
        }
      });
      if (!found) {
        this.listEmployeeNotHasShiftFixe.push(item);
      }
    });
    this.sortListEmployeNotHasShiftFixe();

  }

  /**
   * Trie des employé dans planning fixe
   */
  private sortListEmployeNotHasShiftFixe(): void {
    this.listEmployeeNotHasShiftFixe.sort(function (a: EmployeeModel, b: EmployeeModel) {
      if (a.fullName.toLowerCase() < b.fullName.toLowerCase()) {
        return -1;
      }
      if (a.fullName.toLowerCase() > b.fullName.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Cette methode utilisee lors de la recuperation de la liste des shift fixe elle permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  private setCorrectTimeToDisplay(item: ShiftFixeModel): void {
    item.heureDebut = this.dateService.setTimeFormatHHMM(item.heureDebut);
    if (item.dateDebutIsNight) {
      item.heureDebut.setDate(item.heureDebut.getDate() + 1);
    }
    item.heureFin = this.dateService.setTimeFormatHHMM(item.heureFin);
    if (item.dateFinIsNight) {
      item.heureFin.setDate(item.heureFin.getDate() + 1);
    }
    if (item.dateDebut) {
      if (item.dateDebut instanceof Date) {
        item.dateDebut.setHours(0, 0, 0, 0);
      }
      const rawDate = new Date(item.dateDebut);
      const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
      if (userTimezoneOffset > 0) {
        item.dateDebut = new Date(rawDate.getTime() + userTimezoneOffset);
      } else {
        item.dateDebut = rawDate;
      }

    }
    if (item.dateFin) {
      if (item.dateFin instanceof Date) {
        item.dateFin.setHours(0, 0, 0, 0);
      }
      const rawDate = new Date(item.dateFin);
      const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
      if (userTimezoneOffset > 0) {
        item.dateFin = new Date(rawDate.getTime() + userTimezoneOffset);
      } else {
        item.dateFin = rawDate;
      }

    }
  }

  /**
   * calcule total of shit fixe to employee for week
   * calcule total of shit fixe to employee for day
   */
  private calculeTotalInWeekAndTotalInDayForShiftFixe(shiftFixe?: any): any {
    let totalInDay = 0;
    let cummuleTotal = 0;
    if (shiftFixe) {

      this.employeeHasAnomalieContraintSocial = shiftFixe.employee;
      this.shiftFixeByEmployee.get(shiftFixe.employee.idEmployee).forEach(shiftDisplay => {
        if (shiftFixe.idShiftFixe !== shiftDisplay.idShiftFixe) {
          if (shiftFixe.jour === shiftDisplay.jour) {
            totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          }
          cummuleTotal += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
        }
      });
      cummuleTotal += this.dateService.getDiffHeure(shiftFixe.heureFin, shiftFixe.heureDebut);
      totalInDay += this.dateService.getDiffHeure(shiftFixe.heureFin, shiftFixe.heureDebut);
      cummuleTotal = +this.dateService.convertNumberToTime(cummuleTotal);

      this.totalRowTime = cummuleTotal;
      totalInDay = +this.dateService.convertNumberToTime(totalInDay);
      return this.verifContrainte(cummuleTotal, totalInDay, shiftFixe);

    } else {
      this.calculeTempsPlanifieForAllEmploye();
    }
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieForAllEmploye(): Promise<void> {
    for (const employeDisplay of this.listEmployeeHasShiftFixe) {
      if (employeDisplay.contrats && employeDisplay.contrats[0].groupeTravail.plgFixe) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.clone(this.totalRowTime);
      }
    }
    this.fillAvailableEmployeeActif();

  }

  /**
   * Prendre en compte les pauses dans les compteur de temps
   * calcul des temps planifiés
   *   soustraire au temps planifié la valeur du temps minimum d’un break
   * @param listShiftFixe
   * @param listLoi
   * @param tempsTravailPartiel
   * @param mineur
   * @param shiftFixe
   */
  private takeBreakswithTime(listShiftFixe: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, shiftFixe?: ShiftFixeModel): void {
    let totalInDay = 0;
    let nbrShiftInDay = 0;
    let pause = 0;
    let totalInWeek = 0;
    let shiftFixeUpdate = {} as ShiftFixeModel;
    listShiftFixe = listShiftFixe.filter((shift: ShiftFixeModel) => !shift.acheval || !shift.shiftAchevalHidden);

    if (shiftFixe) {
      if (!shiftFixe.idShiftFixe) {
        listShiftFixe.push(shiftFixe);
      } else {
        listShiftFixe.forEach((shiftDisplay: ShiftFixeModel, index: number) => {
          if (shiftFixe.idShiftFixe && shiftFixe.idShiftFixe === shiftDisplay.idShiftFixe) {
            shiftFixeUpdate = {...shiftDisplay};
            shiftDisplay = shiftFixe;
            listShiftFixe[index] = shiftFixe;
          }
        });
      }
    }
    this.days.forEach((day: any, indexDay: number) => {
      const listShiftByDay = this.grouperShiftParJour(day.val, listShiftFixe);
      this.correctTimeBeforCalculHour(listShiftByDay);
      this.sortListShiftFixe(listShiftByDay);
      nbrShiftInDay = 0;
      pause = 0;
      totalInDay = 0;
      let totalMinutes = 0;
      let totalCurrent = 0;
      let totalCureentFixe = 0;
      let employeHaslaw;
      let totalCurrentAcheval = 0;
      let totalCureentFixeAcheval = 0;
      let timeToSubstructCurrent = false;

      listShiftByDay.forEach((shiftFixePlanning: ShiftFixeModel, index: number) => {
        timeToSubstructCurrent = false;
        const shiftDisplay = this.clone(shiftFixePlanning);
        const numJour = this.dateService.getIntegerValueFromJourSemaine(shiftDisplay.jour);
        const lastDay = this.days[(this.days.length - 1)];
        const numJourLastWeek = this.dateService.getIntegerValueFromJourSemaine(lastDay.val.toUpperCase());

        if (shiftDisplay.modifiable && shiftDisplay.acheval && this.modeAffichage === 2) {
          const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shiftDisplay));
          if (shiftDuplicate) {
            listShiftFixe.push(shiftDuplicate);
          }
        }
        if (shiftDisplay.jour === day.val.toUpperCase()) {
          totalMinutes += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          totalInDay += this.dateService.getDiffHeure(shiftDisplay.heureFin, shiftDisplay.heureDebut);
          employeHaslaw = this.listEmployeeActif.find(item => item.idEmployee === shiftDisplay.employee.idEmployee);
          employeHaslaw.loiEmployee = listLoi;
          if (this.modeAffichage === 2 && shiftDisplay.acheval) {
            let nextOrPreviousShiftAcheval;
            if (shiftDisplay.modifiable && this.days[indexDay + 1]) {
              nextOrPreviousShiftAcheval = this.grouperShiftParJour(this.days[indexDay + 1].val, listShiftFixe);
            } else if (this.days[indexDay - 1]) {
              nextOrPreviousShiftAcheval = this.grouperShiftParJour(this.days[indexDay - 1].val, listShiftFixe);
            }

            if (nextOrPreviousShiftAcheval && nextOrPreviousShiftAcheval.length) {
              nextOrPreviousShiftAcheval = nextOrPreviousShiftAcheval.filter((shift: ShiftFixeModel) => !shift.acheval);
              this.sortListShiftFixe(nextOrPreviousShiftAcheval);
            }
            if (numJour !== numJourLastWeek || (numJour === numJourLastWeek && !shiftDisplay.modifiable)) {
              this.shiftService.setStatutLongerAndTimeTosubstructToShiftAcheval(shiftDisplay, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, nextOrPreviousShiftAcheval, employeHaslaw);
            } else {
              shiftDisplay.longer = true;
            }
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
      });
      totalInWeek += totalMinutes;
      this.totalRowTime = +this.dateService.convertNumberToTime(totalInWeek);
    });
    if (shiftFixe) {
      listShiftFixe.splice((listShiftFixe).findIndex(shift => shift.idShiftFixe === shiftFixe.idShiftFixe), 1);
      if (shiftFixe.idShiftFixe) {
        listShiftFixe.push(shiftFixeUpdate);
      }
    }
  }

  /**
   * Permet de grouper les shift   par jour
   * @param: list
   * @param: keyGetter
   */
  private grouperShiftParJour(day: String, list: ShiftFixeModel[]): ShiftFixeModel[] {
    const listShiftByDay: ShiftFixeModel[] = [];
    list.forEach((shiftDisplay: ShiftFixeModel) => {
      if (shiftDisplay.jour === day.toUpperCase()) {
        listShiftByDay.push(shiftDisplay);
      }
    });
    return listShiftByDay;
  }

  /**
   **  verification Contrainte Social
   * @param :commuleTotal
   * @param :totalInDay
   * @param :tempsTravail
   * @param :shiftFixe
   */
  private verifContrainte(cummuleTotal: any, totalInDay: any, shiftFixe: ShiftFixeModel) {
    this.verificationWeekPairOrOddForShiftFixe(shiftFixe);
    const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftFixe.jour), true);
    if (shiftFixe.acheval) {

      shiftFixe.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
    }
    let socialeConstraintesAreValid = true;
    this.hiddenSave = false;
    let employeHasContrat = new EmployeeModel();

    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    let listShiftInWeek = this.clone(collection);
    listShiftInWeek = listShiftInWeek.filter((shift: ShiftFixeModel) => !shift.acheval || !shift.shiftAchevalHidden);

    const exists = !!listShiftInWeek.find(item => item.idShiftFixe === shiftFixe.idShiftFixe);
    if (!exists) {
      listShiftInWeek.push(shiftFixe);
    } else {
      listShiftInWeek.forEach((item: ShiftFixeModel, index: number) => {
        // en cas de drag and drop pour ajouter un shift a un list de planning  par eemployee si old emp est differ a le nouveau emplpoyee
        if (shiftFixe.idShiftFixe === item.idShiftFixe) {
          item = shiftFixe;
          listShiftInWeek[index] = shiftFixe;
        }
      });
    }
    let verificationContrainte = new VerificationContrainteModel();
    this.listContrainte = [];
    this.listContrainteSuppression = [];
    // verication hebdo contrat
    this.takeBreakswithTime(this.clone(listShiftInWeek), this.listLoi, this.tempsTravailPartiel, this.mineur);

    verificationContrainte = this.contrainteSocialeService.validHebdoEmployee(this.contratActif, this.totalRowTime);
    if (verificationContrainte) {
      this.messageVerification = {} as VerificationContrainteModel;

      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);

      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // disponibilité de l'employé (jours de repos, disponibilités du contrat...)
    const verificationDisponibilite = this.contrainteSocialeService.validDisponibiliteEmployee(this.contratActif, shiftFixe, 'shiftFixe', this.decoupageHoraireFinEtDebutActivity, this.frConfig, this.listPairAndOdd);
    if (verificationDisponibilite.length > 0) {
      verificationDisponibilite.forEach(item => {
        if (item.acheval) {
          let shiftAcheveToSave = this.clone(shiftFixe);
          shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
          this.dateContrainteAcheve = shiftAcheveToSave.jour;
        }
        if (item.DisplayDate) {
          this.dateContraintSocial = shiftFixe.jour;

        }
        this.listContrainte.push(item);
        socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      });
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // disponibilité de l'employé (jours de repos)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourRepos(this.semaineRepos, shiftFixe, 'shiftFixe');
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // disponibilité de l'employé (jours feries)
    if (shiftFixe.dateDebut && shiftFixe.dateFin) {
      verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourFeries(this.listJourFeriesByRestaurant, this.listLoi, this.tempsTravailPartiel, this.mineur, shiftFixe, 'shiftFixe');
      if (verificationContrainte) {
        this.popupVerificationContrainteVisibility = true;
        this.messageVerification.bloquante = verificationContrainte.bloquante;
        this.listContrainte.push(verificationContrainte);
        socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    }
    // Nombre heure Max Par Jour Si plannifie
    const listShiftInDay = this.getListShiftFixeByJour(shiftFixe);
    // recupere les shift apres ou avant de shift current de la journée
    let previousOrLastOfShiftInDay;
    let listShiftInDayCurrent = this.clone(listShiftInDay);
    if (this.modeAffichage === 2) {
      listShiftInDayCurrent = listShiftInDayCurrent.concat(this.addShiftAchevalInCurrentList(shiftFixe,
        this.clone(this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee))));
      previousOrLastOfShiftInDay = this.clone(listShiftInWeek);
    }
    if (previousOrLastOfShiftInDay && previousOrLastOfShiftInDay.length) {
      previousOrLastOfShiftInDay = previousOrLastOfShiftInDay.filter((shiftPreviousOrNext: ShiftFixeModel) => shiftPreviousOrNext.employee.idEmployee === employeHasContrat.idEmployee);
      this.sortListShiftFixe(previousOrLastOfShiftInDay);
    }

    this.listEmployeeActif.forEach((employeeDisplay: EmployeeModel) => {
      if (employeeDisplay.idEmployee === shiftFixe.employee.idEmployee) {
        employeHasContrat = this.clone(employeeDisplay);
      }
    });

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
    // Nb d'heure maxi par semaine  (done)
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParSemaine(this.totalRowTime, this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
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
// Le collaborateur ne peut travailler après heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerApresHeure(this.getListShiftFixeByJour(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Le collaborateur ne peut travailler avant heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerAvantHeure(this.getListShiftFixeByJour(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // //  Amplitude journaliere maximale.
    verificationContrainte = this.contrainteSocialeService.validAmplitudeJounaliereMaximale(this.getListShiftFixeByJour(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    if (shiftFixe.jour === JourSemaine.DIMANCHE) {
      // Le collaborateur peut travailler le dimanche
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeDimanche(shiftFixe.jour, this.listLoi, this.tempsTravailPartiel, this.mineur);
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
    verificationContrainte = this.contrainteSocialeService.validNombreJourOffDansUneSemaine(this.getNombreDeJourOffDansUneSemaine(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Les jours de repos doivent-ils être consécutifs

    verificationContrainte = this.contrainteSocialeService.validJourReposConsecutif(this.getJourRepos(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur, this.contratActif);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }

    // //  Heure de repos min entre 2 jours
    verificationContrainte = this.contrainteSocialeService.validHeureRepoMinEntreDeuxJours(this.getLastDayValues(shiftFixe), this.getListShiftFixeByJour(shiftFixe), this.getNextDayValues(shiftFixe), this.listLoi, this.tempsTravailPartiel, this.mineur, this.limiteHeureDebut, true);
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      this.listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // Le collaborateur peut travailler le weekend
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeWeekEnd(shiftFixe.jour, shiftFixe, this.listLoi, this.tempsTravailPartiel, this.mineur, this.jourDebutWeekEnd, this.jourFinWeekEnd, this.heureDebutWeekEnd, this.heureFinWeekEnd, 'shiftFixe');
    if (verificationContrainte) {
      this.popupVerificationContrainteVisibility = true;
      this.messageVerification.bloquante = verificationContrainte.bloquante;
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
      this.listContrainte.push(verificationContrainte);
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    // valider pause planifier
    const isBreak = this.contrainteSocialeService.validPausePlanifier(this.listLoi, this.tempsTravailPartiel, this.mineur);
    if (isBreak) {
      verificationContrainte = this.helperService.verificationContraintMaxShiftWithoutBreak(shiftFixe, this.listLoi, this.tempsTravailPartiel, this.mineur, listShiftInDay);
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
    return socialeConstraintesAreValid;

  }

  /**
   * s'il y a un contraint bloquante, on ne peur pas ajouter shift fixe
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
  }

  /**
   * Enregistrer shift fixe si aucune contrainte bloquante

   */
  public save(): void {
    if (!this.getBlockedConstraint()) {
      if (this.shiftFixeToSave.employee) {
        const collection = this.clone(this.shiftFixeByEmployee.get(this.shiftFixeToSave.employee.idEmployee));
        this.takeBreakswithTime(collection, this.listLoi, this.tempsTravailPartiel, this.mineur, this.shiftFixeToSave);
        if (this.shiftFixeToSave.idShiftFixe) {
          this.updateShiftFixe();
        } else {
          this.addNewShiftFixee();
        }
      } else {
        if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
          this.copieShiftFixe(this.shiftFixeToSave);
        } else {
          this.moveShiftCard(this.shiftFixeToSave);
        }
      }
      this.popupVerificationContrainteVisibility = false;
    } else {
      this.popupVerificationContrainteVisibility = true;
      this.showPopAddShiftFixe = false;

    }
    this.updatePlanningFixRowInterface();
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
  private getNombreShiftParJour(shiftfixe): number {
    let nombreShiftParJour = 0;
    if (!shiftfixe.idShiftFixe) {
      nombreShiftParJour++;
    }

    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    collection.forEach((item: any, index: number) => {
      // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
      if (shiftfixe.idShiftFixe === item.idShiftFixe) {
        item = shiftfixe;
      }
      if (shiftfixe.jour === item.jour) {
        nombreShiftParJour++;
        // lors de drag ang drap
        if (this.shiftFixeToSave) {
          if (this.shiftFixeToSave.oldEmp) {
            if (this.shiftFixeToSave.oldEmp !== shiftfixe.employee.idEmployee && shiftfixe.idShiftFixe) {
              nombreShiftParJour++;
            }

          }
        }

      }
    });

    return nombreShiftParJour;
  }

  /**
   * nbre de jours no trevailé par employée
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

    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (!shift.idShiftFixe) {
      collection.unshift(shift);
    }
    collection.forEach((item: any) => {
      if (!item.shiftAchevalHidden) {

        // en cas de drag and drop pour ajouter un shift a un list de shift  par manager si old emp est differ a le nouveau emplpoyee
        if (shift.idShiftFixe && shift.idShiftFixe === item.idShiftFixe) {
          item = shift;
        }
        if (item.jour === JourSemaine.DIMANCHE) {
          isWorkingDimanche = true;
        } else if (item.jour === JourSemaine.LUNDI) {
          isWorkingLundi = true;
        } else if (item.jour === JourSemaine.MARDI) {
          isWorkingMardi = true;
        } else if (item.jour === JourSemaine.MERCREDI) {
          isWorkingMercredi = true;
        } else if (item.jour === JourSemaine.JEUDI) {
          isWorkingJeudi = true;
        } else if (item.jour === JourSemaine.VENDREDI) {
          isWorkingVendredi = true;
        } else if (item.jour === JourSemaine.SAMEDI) {
          isWorkingSamedi = true;
        }
      }
    });
    if (!shift.idShiftFixe) {
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
  private getNombreDeJourTravaillerDansUneSemaine(shiftFixe): number {
    let resultingNumber = 0;
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    collection.unshift(shiftFixe);
    if (collection) {
      collection.forEach((item: any) => {
        // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
        if (shiftFixe.idShiftFixe === item.idShiftFixe) {
          item = shiftFixe;
        }
        if (item.jour === JourSemaine.DIMANCHE) {
          isWorkingDimanche = true;
        } else if (item.jour === JourSemaine.LUNDI) {
          isWorkingLundi = true;
        } else if (item.jour === JourSemaine.MARDI) {
          isWorkingMardi = true;
        } else if (item.jour === JourSemaine.MERCREDI) {
          isWorkingMercredi = true;
        } else if (item.jour === JourSemaine.JEUDI) {
          isWorkingJeudi = true;
        } else if (item.jour === JourSemaine.VENDREDI) {
          isWorkingVendredi = true;
        } else if (item.jour === JourSemaine.SAMEDI) {
          isWorkingSamedi = true;
        }
      });
    }
    collection.splice(collection[0], 1);

    if (this.premierJourDeLaSemaine === JourSemaine.DIMANCHE) {
      if (isWorkingDimanche) {
        resultingNumber += 64;
      }
      if (isWorkingLundi) {
        resultingNumber += 32;
      }
      if (isWorkingMardi) {
        resultingNumber += 16;
      }
      if (isWorkingMercredi) {
        resultingNumber += 8;
      }
      if (isWorkingJeudi) {
        resultingNumber += 4;
      }
      if (isWorkingVendredi) {
        resultingNumber += 2;
      }
      if (isWorkingSamedi) {
        resultingNumber += 1;
      }

    }
    if (this.premierJourDeLaSemaine === JourSemaine.LUNDI) {
      if (isWorkingLundi) {
        resultingNumber += 64;
      }
      if (isWorkingMardi) {
        resultingNumber += 32;
      }
      if (isWorkingMercredi) {
        resultingNumber += 16;
      }
      if (isWorkingJeudi) {
        resultingNumber += 8;
      }
      if (isWorkingVendredi) {
        resultingNumber += 4;
      }
      if (isWorkingSamedi) {
        resultingNumber += 2;
      }
      if (isWorkingDimanche) {
        resultingNumber += 1;
      }
    }
    if (this.premierJourDeLaSemaine === JourSemaine.MARDI) {
      if (isWorkingMardi) {
        resultingNumber += 64;
      }
      if (isWorkingMercredi) {
        resultingNumber += 32;
      }
      if (isWorkingJeudi) {
        resultingNumber += 16;
      }
      if (isWorkingVendredi) {
        resultingNumber += 8;
      }
      if (isWorkingSamedi) {
        resultingNumber += 4;
      }
      if (isWorkingDimanche) {
        resultingNumber += 2;
      }
      if (isWorkingLundi) {
        resultingNumber += 1;
      }
    }
    if (this.premierJourDeLaSemaine === JourSemaine.MERCREDI) {
      if (isWorkingMercredi) {
        resultingNumber += 64;
      }
      if (isWorkingJeudi) {
        resultingNumber += 32;
      }
      if (isWorkingVendredi) {
        resultingNumber += 16;
      }
      if (isWorkingSamedi) {
        resultingNumber += 8;
      }
      if (isWorkingDimanche) {
        resultingNumber += 4;
      }
      if (isWorkingLundi) {
        resultingNumber += 2;
      }
      if (isWorkingMardi) {
        resultingNumber += 1;
      }
    }
    if (this.premierJourDeLaSemaine === JourSemaine.JEUDI) {
      if (isWorkingJeudi) {
        resultingNumber += 64;
      }
      if (isWorkingVendredi) {
        resultingNumber += 32;
      }
      if (isWorkingSamedi) {
        resultingNumber += 16;
      }
      if (isWorkingDimanche) {
        resultingNumber += 8;
      }
      if (isWorkingLundi) {
        resultingNumber += 4;
      }
      if (isWorkingMardi) {
        resultingNumber += 2;
      }
      if (isWorkingMercredi) {
        resultingNumber += 1;
      }
    }
    if (this.premierJourDeLaSemaine === JourSemaine.VENDREDI) {
      if (isWorkingVendredi) {
        resultingNumber += 64;
      }
      if (isWorkingSamedi) {
        resultingNumber += 32;
      }
      if (isWorkingDimanche) {
        resultingNumber += 16;
      }
      if (isWorkingLundi) {
        resultingNumber += 8;
      }
      if (isWorkingMardi) {
        resultingNumber += 4;
      }
      if (isWorkingMercredi) {
        resultingNumber += 2;
      }
      if (isWorkingJeudi) {
        resultingNumber += 1;
      }
    }
    if (this.premierJourDeLaSemaine === JourSemaine.SAMEDI) {
      if (isWorkingSamedi) {
        resultingNumber += 64;
      }
      if (isWorkingDimanche) {
        resultingNumber += 32;
      }
      if (isWorkingLundi) {
        resultingNumber += 16;
      }
      if (isWorkingMardi) {
        resultingNumber += 8;
      }
      if (isWorkingMercredi) {
        resultingNumber += 4;
      }
      if (isWorkingJeudi) {
        resultingNumber += 2;
      }
      if (isWorkingVendredi) {
        resultingNumber += 1;
      }
    }
    return resultingNumber;
  }

  /**
   * recupere le jour de repos de l'employee a plannifie
   * @param :shiftFixe
   */
  private getJourRepos(shiftFixe): number[] {
    let isWorkingLundi = false;
    let isWorkingMardi = false;
    let isWorkingMercredi = false;
    let isWorkingJeudi = false;
    let isWorkingVendredi = false;
    let isWorkingSamedi = false;
    let isWorkingDimanche = false;
    const jourRepos: number[] = [];
    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    collection.unshift(shiftFixe);
    if (collection) {
      collection.forEach((item: any) => {
        if (!item.shiftAchevalHidden) {

          // en cas de drag and drop pour ajouter un shift a un list de shift fixe par eemployee si old emp est differ a le nouveau emplpoyee
          if (shiftFixe.idShiftFixe === item.idShiftFixe) {
            item = shiftFixe;
          }
          if (item.jour === JourSemaine.DIMANCHE) {
            isWorkingDimanche = true;
          } else if (item.jour === JourSemaine.LUNDI) {
            isWorkingLundi = true;
          } else if (item.jour === JourSemaine.MARDI) {
            isWorkingMardi = true;
          } else if (item.jour === JourSemaine.MERCREDI) {
            isWorkingMercredi = true;
          } else if (item.jour === JourSemaine.JEUDI) {
            isWorkingJeudi = true;
          } else if (item.jour === JourSemaine.VENDREDI) {
            isWorkingVendredi = true;
          } else if (item.jour === JourSemaine.SAMEDI) {
            isWorkingSamedi = true;
          }
        }
      });
    }
    collection.splice(collection[0], 1);

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
   * recuperer le jour avant pour le deail shift fixe
   * @param :shiftFixe
   */
  private getLastDayValues(shiftFixe) {
    let lastDayDate;
    const lastShiftFixeValues: ShiftFixeModel[] = [];
    if (shiftFixe.jour === JourSemaine.DIMANCHE) {
      lastDayDate = JourSemaine.SAMEDI;
    }
    if (shiftFixe.jour === JourSemaine.LUNDI) {
      lastDayDate = JourSemaine.DIMANCHE;
    }
    if (shiftFixe.jour === JourSemaine.MARDI) {
      lastDayDate = JourSemaine.LUNDI;
    }
    if (shiftFixe.jour === JourSemaine.MERCREDI) {
      lastDayDate = JourSemaine.MARDI;
    }
    if (shiftFixe.jour === JourSemaine.JEUDI) {
      lastDayDate = JourSemaine.MERCREDI;
    }
    if (shiftFixe.jour === JourSemaine.VENDREDI) {
      lastDayDate = JourSemaine.JEUDI;
    }
    if (shiftFixe.jour === JourSemaine.SAMEDI) {
      lastDayDate = JourSemaine.VENDREDI;

    }

    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach(item => {
        if (item.idShiftFixe !== shiftFixe.idShiftFixe && !item.shiftAchevalHidden) {

          if (item.jour === lastDayDate) {
            item.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), item.heureDebut), item.dateDebutIsNight);
            this.dateService.resetSecondsAndMilliseconds(item.heureDebut);
            item.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), item.heureFin), item.dateFinIsNight);
            this.dateService.resetSecondsAndMilliseconds(item.heureFin);
            lastShiftFixeValues.push(item);
          }
        }

      });
    }
    return lastShiftFixeValues;
  }

  /**
   *   recuperer le jour apres pour le  shift fixe

   */
  private getNextDayValues(shiftFixe) {
    let nextDayDate;
    if (shiftFixe.jour === JourSemaine.DIMANCHE) {
      nextDayDate = JourSemaine.LUNDI;
    }
    if (shiftFixe.jour === JourSemaine.LUNDI) {
      nextDayDate = JourSemaine.MARDI;
    }
    if (shiftFixe.jour === JourSemaine.MARDI) {
      nextDayDate = JourSemaine.MERCREDI;
    }
    if (shiftFixe.jour === JourSemaine.MERCREDI) {
      nextDayDate = JourSemaine.JEUDI;
    }
    if (shiftFixe.jour === JourSemaine.JEUDI) {
      nextDayDate = JourSemaine.VENDREDI;
    }
    if (shiftFixe.jour === JourSemaine.VENDREDI) {
      nextDayDate = JourSemaine.SAMEDI;
    }
    if (shiftFixe.jour === JourSemaine.SAMEDI) {
      nextDayDate = JourSemaine.DIMANCHE;
    }
    const nextShiftFixeValues: ShiftFixeModel[] = [];
    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach(item => {
        if (item.idShiftFixe !== shiftFixe.idShiftFixe && !item.shiftAchevalHidden) {

          if (item.jour === nextDayDate) {
            item.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), item.heureDebut), item.dateDebutIsNight);
            this.dateService.resetSecondsAndMilliseconds(item.heureDebut);
            item.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), item.heureFin), item.dateFinIsNight);
            this.dateService.resetSecondsAndMilliseconds(item.heureFin);
            nextShiftFixeValues.push(item);
          }
        }

      });

    }
    return nextShiftFixeValues;
  }

  /**
   * recupeere le shift fixe pour un employee dans un jour definie
   * @param :shiftFixe
   */
  private getListShiftFixeByJour(shiftFixe) {
    const listShiftFixeInDay: ShiftFixeModel[] = [];
    listShiftFixeInDay.push(this.clone(shiftFixe));
    const collection = this.shiftFixeByEmployee.get(this.employeeHasAnomalieContraintSocial.idEmployee);
    if (collection) {
      collection.forEach((item: ShiftFixeModel) => {
        if (item.jour === shiftFixe.jour) {
          if (shiftFixe.idShiftFixe !== item.idShiftFixe && !item.shiftAchevalHidden) {
            listShiftFixeInDay.push(this.clone(item));
          }
        }
      });
    }
    listShiftFixeInDay.forEach((item: ShiftFixeModel) => {
      const plannedDate = this.dateService.getDateOfEnumertionJour(item.jour);
      item.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, item.heureDebut), item.dateDebutIsNight);
      item.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(plannedDate, item.heureFin), item.dateFinIsNight);
    });
    return listShiftFixeInDay;
  }

  /**
   * ajouter sift fixe dans la list de shift fixe et dans la map shift fixe par employee
   * @param :data
   */
  private setNewShiftFixeToListShifFixe() {
    this.showPopAddShiftFixe = false;
    let shiftAcheveToSave = new ShiftFixeModel();

    this.shiftFixeToSave.idShiftFixe = this.makeString();
    this.listShiftFixe.forEach(shift => {
      if (shift.idShiftFixe === this.shiftFixeToSave.idShiftFixe) {
        this.setNewShiftFixeToListShifFixe();
      }
    });
    if (this.shiftFixeToSave.acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.shiftFixeToSave.jour), true);

      this.shiftFixeToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      shiftAcheveToSave = this.clone(this.shiftFixeToSave);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave && shiftAcheveToSave.idShiftFixe) {
        this.listShiftFixe.push({...shiftAcheveToSave});
      }
    }
    const collection = this.shiftFixeByEmployee.get(this.shiftFixeToSave.employee.idEmployee);
    if (!collection) {
      this.shiftFixeByEmployee.set(this.shiftFixeToSave.employee.idEmployee, [this.shiftFixeToSave]);
      if (shiftAcheveToSave.idShiftFixe) {
        this.shiftFixeByEmployee.set(this.shiftFixeToSave.employee.idEmployee, [shiftAcheveToSave]);
      }
      this.fillAvailableEmployeeActif();
    } else {
      collection.push({...this.shiftFixeToSave});
      if (shiftAcheveToSave && shiftAcheveToSave.idShiftFixe) {
        collection.push({...shiftAcheveToSave});
      }
    }
    this.listShiftFixe.push({...this.shiftFixeToSave});
    this.listShiftFixeDefault = JSON.parse(JSON.stringify(this.listShiftFixe));
    this.listShiftFixesToUpdate.push({...this.shiftFixeToSave});
    this.shiftFixeToSave.employee.totalRowTime = this.totalRowTime;
    this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(this.shiftFixeToSave.employee.idEmployee));
    this.sortListShiftByShiftAcheval(this.listShiftFixe);
    this.shiftFixeToSave = null;
    this.showPopAddShiftFixe = true;

  }

  /**
   * modifier  sift fixe dans la list de shift fixe et dans la map shift fixe par employee
   * recuperer la list de shift de fixe qe on va enregistrer (listShiftFixesToUpdate)
   * @param :data
   */
  private updateShiftFixeAfterSave() {
    this.showPopAddShiftFixe = false;
    let shiftAcheveToSave = new ShiftFixeModel();
    this.deleteShiftAchevalHidden(this.shiftFixeToSave.idShiftFixe, this.shiftFixeToSave.employee.idEmployee);

    if (this.shiftFixeToSave.acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.shiftFixeToSave.jour), true);
      this.shiftFixeToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      shiftAcheveToSave = this.clone(this.shiftFixeToSave);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
    }
    this.shiftFixeToSave.employee.totalRowTime = this.totalRowTime;
    const collection = this.shiftFixeByEmployee.get(this.shiftFixeToSave.employee.idEmployee);
    const indexShiftToUpdateInShiftFixeByEmployee = collection.findIndex(shift => shift.idShiftFixe === this.shiftFixeToSave.idShiftFixe);
    collection[indexShiftToUpdateInShiftFixeByEmployee] = this.shiftFixeToSave;
    collection[indexShiftToUpdateInShiftFixeByEmployee].employee.totalRowTime = 5;
    const indexShiftToUpdateInListSiftFixe = this.listShiftFixe.findIndex(shift => shift.idShiftFixe === this.shiftFixeToSave.idShiftFixe);
    this.updateListShiftFixe(indexShiftToUpdateInListSiftFixe, this.listShiftFixe);
    const indexShiftToUpdate = this.listShiftFixesToUpdate.findIndex(shift => shift.idShiftFixe === this.shiftFixeToSave.idShiftFixe);
    this.updateListShiftFixe(indexShiftToUpdate, this.listShiftFixesToUpdate);

    this.listShiftFixeDefault = JSON.parse(JSON.stringify(this.listShiftFixe));
    if (shiftAcheveToSave && shiftAcheveToSave.idShiftFixe) {
      collection.push({...shiftAcheveToSave});
      this.listShiftFixe.push({...shiftAcheveToSave});
    }
    this.listEmployeeHasShiftFixe.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === this.shiftFixeToSave.employee.idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
    this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(this.shiftFixeToSave.employee.idEmployee));
    this.sortListShiftByShiftAcheval(this.listShiftFixe);
    this.showPopAddShiftFixe = true;

    this.shiftFixeToSave = null;
  }

  /**
   * modifier la list de shift fixe
   * @param indexShiftToUpdate
   * @param list
   */
  private updateListShiftFixe(indexShiftToUpdate: number, list: any): void {
    indexShiftToUpdate = list.findIndex(shift => shift.idShiftFixe === this.shiftFixeToSave.idShiftFixe);
    if (indexShiftToUpdate !== -1) {
      list.splice(indexShiftToUpdate, 1);
    }
    list.push({...this.shiftFixeToSave});
  }

  /**
   * message de confirmation de suppression d'une card dans l'onglet 'Shift Fixe'
   * @param: event
   */
  public showConfirmDeleteShiftFixeCard(event, filter?) {
    let idShiftToDelete: number;
    if (!filter) {
      idShiftToDelete = event;
    } else {
      const draggableElement = event.relatedTarget;
      idShiftToDelete = draggableElement.getAttribute('data-idShiftFixe');
    }
    const deletedShift = this.listShiftFixe.find((element: ShiftFixeModel) => element.idShiftFixe === idShiftToDelete);
    if (deletedShift) {
      const employeeIndex = this.listEmployeeHasShiftFixe.findIndex((emp: any) => emp.idEmployee === deletedShift.employee.idEmployee);
      if ((employeeIndex !== -1) && this.listEmployeeHasShiftFixe[employeeIndex].contrats) {
        this.employeeHasAnomalieContraintSocial = this.listEmployeeHasShiftFixe[employeeIndex];
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
          this.deleteShiftFixeCard(event);
        } else {
          const draggableElement = event.relatedTarget;
          const idShifFixeToDelete = draggableElement.getAttribute('data-idShiftFixe'); // ancienne journée à laquelle appartient la card
          this.deleteShiftFixeCard(idShifFixeToDelete);
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
  public showConfirmDeleteRow($event: any) {
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
            this.listEmployeeHasShiftFixe.splice(this.listEmployeeHasShiftFixe.length - 1, 1);
            this.selectedEmployee = undefined;
          }
          if (this.selectedEmployee && this.selectedEmployee.idEmployee !== 0) {
            this.deleteAllShiftFixeByIdEmployee();
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

  // action to save and export the plannings to the corresponfing service
  public saveListShiftFixe() {
    const listContraintDureeMinShift = this.verifDureeMinDesShifts(this.days, this.listEmployeeHasShiftFixe, this.listShiftFixe, this.messageVerification);
    if (listContraintDureeMinShift.length) {
      this.listContrainte = listContraintDureeMinShift;
      this.popupVerificationContrainteVisibility = true;
      this.navigateTo = true;
    } else {
      this.popupVerificationContrainteVisibility = false;
      let autorizeDeleteShiftFixes = true;
      let autorizeDeleteShiftFixesByEmployee = true;
      this.listShiftFixesToUpdate.forEach(shift => {
        if (isNaN(Number(shift.idShiftFixe))) {
          shift.idShiftFixe = 0;
          delete shift.uuid;
        }
        shift.restaurant = this.sharedRestaurant.selectedRestaurant;
      });
      if (this.listIdShiftFixesToDelete.length === 0) {
        this.listIdShiftFixesToDelete.push('0');
        autorizeDeleteShiftFixes = false;
      }
      if (this.listShiftFixesByEmployeeToDelete.length === 0) {
        this.listShiftFixesByEmployeeToDelete.push('0');
        autorizeDeleteShiftFixesByEmployee = false;
      }
      if (this.listShiftFixesToUpdate.length > 0 || (autorizeDeleteShiftFixes && autorizeDeleteShiftFixesByEmployee)
        || (autorizeDeleteShiftFixes && !autorizeDeleteShiftFixesByEmployee)
        || (!autorizeDeleteShiftFixes && autorizeDeleteShiftFixesByEmployee)) {
        this.notificationService.startLoader();
        this.shiftFixeService.updateListShiftFixe(this.listShiftFixesToUpdate, this.listIdShiftFixesToDelete, this.listShiftFixesByEmployeeToDelete).subscribe(
          (data: ShiftFixeModel[]) => {
            this.notificationService.stopLoader();
            this.setListShiftFixeAfterSave(data);
          },
          (err) => {
            this.notificationService.stopLoader();
            // TODO notify of error
            console.log('error');
            console.log(err);
          }
        );
      } else {
        this.listIdShiftFixesToDelete = [];
        this.listShiftFixesByEmployeeToDelete = [];
      }
      this.navigateAway.next(true);
    }

  }

  /**
   * Vérification de la durée minimale d'un shift lors du sauvegarde global
   */
  public verifDureeMinDesShifts(days: any, listEmployeeHasShiftFixe: EmployeeModel[], listShiftFixe: ShiftFixeModel[], messageVerification: VerificationContrainteModel): VerificationContrainteModel[] {
    let verificationContrainte = new VerificationContrainteModel();
    let verificationContrainteNbrCoupure = new VerificationContrainteModel();
    let employeHaslaw: EmployeeModel;
    let nbrCoupure = 0;
    const listContrainteDureeMinShift: VerificationContrainteModel[] = [];
    if (this.listShiftFixesToUpdate.length || this.listIdShiftFixesToDelete.length || this.listShiftFixesByEmployeeToDelete.length) {
      for (const employeDisplay of listEmployeeHasShiftFixe) {
        let collection = [];
        nbrCoupure = 0;
        listShiftFixe.forEach((shiftDisplay: ShiftFixeModel) => {
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
            const listShiftByDay = this.grouperShiftParJour(day.val, collection);
            if (listShiftByDay.length && listShiftByDay.length === 1) {
              const dureeShift = this.dateService.formatMinutesToHours(this.dateService.getDiffHeure(listShiftByDay[0].heureFin, listShiftByDay[0].heureDebut));
              verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
              if (verificationContrainte) {
                messageVerification.bloquante = verificationContrainte.bloquante;
                verificationContrainte.employe = employeHaslaw;
                verificationContrainte.idShift = listShiftByDay[0].idShiftFixe;
                verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
                listContrainteDureeMinShift.push(verificationContrainte);

              }
            } else if (listShiftByDay.length && listShiftByDay.length > 1) {
              this.sortListShiftFixe(listShiftByDay);
              const listShiftDuree = this.shiftService.getListShiftDurationByMaxBreak(listShiftByDay, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
              listShiftDuree.forEach((dureeShift: any) => {
                dureeShift = this.dateService.formatMinutesToHours(dureeShift);
                verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur);
                if (verificationContrainte) {
                  messageVerification.bloquante = verificationContrainte.bloquante;
                  verificationContrainte.employe = employeHaslaw;
                  verificationContrainte.idShift = listShiftByDay[0].idShiftFixe;
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
          verificationContrainteNbrCoupure = this.contrainteSocialeService.validNombreMaxCoupureParSemaine(nbrCoupure, employeHaslaw.loiPlanning, employeHaslaw.contrats[0].tempsPartiel, this.mineur, true);
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
   * verification s'il y a changement de shift fixe
   * save list shfit, suppression shfit ,suppression list shifts
   *
   */
  public canDeactivate(): boolean {
    let canSave = true;
    let autorizeDeleteShiftFixes = true;
    let autorizeDeleteShiftFixesByEmployee = true;
    this.listShiftFixesToUpdate.forEach(shift => {
      if (isNaN(Number(shift.idShiftFixe))) {
        shift.idShiftFixe = 0;
        delete shift.uuid;
      }
      shift.restaurant = this.sharedRestaurant.selectedRestaurant;
    });
    if (this.listIdShiftFixesToDelete.length === 0) {
      this.listIdShiftFixesToDelete.push('0');
      autorizeDeleteShiftFixes = false;
    }
    if (this.listShiftFixesByEmployeeToDelete.length === 0) {
      this.listShiftFixesByEmployeeToDelete.push('0');
      autorizeDeleteShiftFixesByEmployee = false;
    }

    if (this.listShiftFixesToUpdate.length > 0 || (autorizeDeleteShiftFixes && autorizeDeleteShiftFixesByEmployee)
      || (autorizeDeleteShiftFixes && !autorizeDeleteShiftFixesByEmployee)
      || (!autorizeDeleteShiftFixes && autorizeDeleteShiftFixesByEmployee)) {
      canSave = false;
    }
    return canSave;
  }

  /**
   * calculer temps planifiés pour les employés
   */
  private async calculeTempsPlanifieAfterDeleteCard(idEmployee: any): Promise<void> {
    for (const employeDisplay of this.listEmployeeHasShiftFixe) {
      if (employeDisplay.idEmployee === idEmployee) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
        this.fillAvailableEmployeeActif();

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
          this.showConfirmDeleteShiftFixeCard(event, 'dragAndDrop'); // suppression du card du shift : onglet 'shift fixe'
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
  }

  private updatePlanningFixRowInterface(): void {
    this.planningFixRows.forEach(planningFix => planningFix.checkChangeDetection());
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
  private dropShiftCard(event: any): void {
    this.eventCtrl = false;
    if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
      this.eventCtrl = true;
    }
    const draggableElement = event.relatedTarget;
    const dropzoneElement = event.target;
    this.draggableElementShiftFixe = draggableElement;
    let idShiftFixe;
    const idDropShift = draggableElement.getAttribute('data-idShiftFixe');
    if (!isNaN(Number(draggableElement.getAttribute('data-idShiftFixe')))) {
      idShiftFixe = parseInt(draggableElement.getAttribute('data-idShiftFixe'), 10); // ordre du card dans la journée initial
    } else {
      idShiftFixe = idDropShift; // ordre du card dans la journée initial
    }
    const oldDayZone = draggableElement.getAttribute('data-cardDay'); // ancienne journée à laquelle appartient la card
    const newDayZone = dropzoneElement.getAttribute('data-day'); // nouvelle journée dans laquelle on veut déplacer la card
    const oldEmp = parseInt(draggableElement.getAttribute('data-empIndex'), 10); // poste initial de la card
    const newEmp = parseInt(dropzoneElement.parentElement.getAttribute('data-empIndex'), 10); // nouveau poste du card
    const cardDropInfos = {
      idShiftFixe: idShiftFixe,
      oldDayZone: oldDayZone,
      newDayZone: newDayZone,
      oldEmp: oldEmp,
      newEmp: newEmp
    };
    this.shiftFixeToSave = cardDropInfos;
    let employeeNew = {} as EmployeeModel;
    const indexShiftToMove = this.listShiftFixe.findIndex((item: ShiftFixeModel) => item.idShiftFixe === cardDropInfos.idShiftFixe && !item.shiftAchevalHidden);
    const shiftDisplay = this.listShiftFixe[indexShiftToMove];
    if (cardDropInfos.newEmp) {
      this.listEmployeeHasShiftFixe.forEach(employeeDisplay => {
        if (employeeDisplay.idEmployee === cardDropInfos.newEmp) {
          employeeNew = employeeDisplay;
          const shiftFixeNew = this.getShiftFixeBeforeDragAndDrop(this.shiftFixeToSave, employeeNew);
          this.getStartTimeAndEndTimeFromDecoupageHoraire(this.shiftFixeToSave.newDayZone);
          this.getStartAndEndActivityDay();
          if (this.updateButtonControl() && this.disableChangePositionOfEmployee(this.shiftFixeToSave.oldEmp, this.shiftFixeToSave.newEmp) && this.canAddShiftFixe(shiftFixeNew, true)) {

            this.getContratByEmployeeActif(employeeDisplay, 'dragDrop');
          } else {

            // reset the card to the initial place
            this.resetCradInitialPlace(shiftDisplay);

          }
        }
      });
    } else {
      // reset the card to the initial place
      this.resetCradInitialPlace(shiftDisplay);

    }

  }

  /**
   * reset the card to the initial place
   */
  private resetCradInitialPlace(shift: ShiftFixeModel): void {
    this.draggableElementShiftFixe.style.transform = this.draggableElementShiftFixe.style.webkitTransform = 'translate(0, 0)';
    // reset the posiion attributes
    this.draggableElementShiftFixe.setAttribute('data-x', 0);
    this.draggableElementShiftFixe.setAttribute('data-y', 0);
  }

  /**
   * Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe
   *  empecher le drag&drop vers l’employé
   * @param :idOldEmployee
   * @param :idNewEmployee
   */
  public disableChangePositionOfEmployee(idOldEmployee, idNewEmployee): boolean {
    let canChangePosition = true;
    this.listEmployeeInactifHasShiftFixe.forEach(employee => {
      if ((employee.idEmployee === idOldEmployee && idNewEmployee === idOldEmployee) || idNewEmployee === employee.idEmployee) {
        canChangePosition = false;
      }

    });
    return canChangePosition;
  }

  /**
   * confirme la changement de shift fixe apres drag and drop
   * @param :employee
   */
  private checkShiftFixeChangePosition(employee) {

    const shiftFixeNew = this.getShiftFixeBeforeDragAndDrop(this.shiftFixeToSave, employee);
    if (this.shiftFixeToSave.oldDayZone !== this.shiftFixeToSave.newDayZone || this.shiftFixeToSave.oldEmp !== this.shiftFixeToSave.newEmp) {
      this.popupVerificationContrainteVisibility = !this.calculeTotalInWeekAndTotalInDayForShiftFixe(shiftFixeNew);
    }
    // drop only if day is different
    if ((this.shiftFixeToSave.oldDayZone !== this.shiftFixeToSave.newDayZone || this.shiftFixeToSave.oldEmp !== this.shiftFixeToSave.newEmp) && !this.popupVerificationContrainteVisibility) {
      // changer les détails du card suivant le nouveau emplacement
      if (this.eventCtrl) {
        this.copieShiftFixe(this.shiftFixeToSave);
      } else {
        // exécuter le déplacement du card dans l'interface
        this.moveShiftCard(this.shiftFixeToSave);
      }

    } else {
      // reset the card to the initial place
      const indexShiftToMove = this.listShiftFixe.findIndex((item: ShiftFixeModel) => item.idShiftFixe === this.shiftFixeToSave.idShiftFixe && !item.shiftAchevalHidden);
      let shiftDisplay;
      if (indexShiftToMove !== -1) {
        shiftDisplay = this.listShiftFixe[indexShiftToMove];
        this.resetCradInitialPlace(shiftDisplay);
      }

    }
  }

  /**
   * Cette méthode permet convertir  la fin/début activité de la journée en date

   */
  private getStartAndEndActivityDay(): void {
    if (this.startTime) {
      const nightValue = this.startTimeIsNight;
      this.startActivity = this.dateService.setTimeFormatHHMM(this.startTime).setDate(new Date().getDate());
      this.startActivity = this.dateService.getDateFromIsNight(this.startActivity, nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.startActivity);
    }
    if (this.endTime) {
      const nightValue = this.endTimeIsNight;
      this.endActivity = this.dateService.setTimeFormatHHMM(this.endTime).setDate(new Date().getDate());
      this.endActivity = this.dateService.getDateFromIsNight(this.endActivity, nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.endActivity);
    }
  }

  /**
   * déplacer le card entre les deux zone de jours différentes
   * @param: movedCardInfos
   */
  public moveShiftCard(movedCardInfos: any): void {
    this.deleteShiftAchevalHidden(movedCardInfos.idShiftFixe, movedCardInfos.oldEmp);
    const indexShiftFixeToMove = this.listShiftFixe.findIndex(shift => shift.idShiftFixe === movedCardInfos.idShiftFixe);
    // update employee
    const indexNewEmployee = this.listEmployeeActif.findIndex(emp => emp.idEmployee === movedCardInfos.newEmp);
    if (indexNewEmployee !== -1) {
      this.listShiftFixe[indexShiftFixeToMove].employee = this.listEmployeeActif[indexNewEmployee];
    }
    // update day
    this.listShiftFixe[indexShiftFixeToMove].jour = movedCardInfos.newDayZone.toUpperCase();
    // mettre a jour la map

    this.shiftFixeByEmployee.get(movedCardInfos.oldEmp).splice(this.shiftFixeByEmployee.get(movedCardInfos.oldEmp).findIndex(shift => shift.idShiftFixe === movedCardInfos.idShiftFixe), 1);

    if (this.listShiftFixe[indexShiftFixeToMove].acheval) {
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.listShiftFixe[indexShiftFixeToMove].jour), true);
      this.listShiftFixe[indexShiftFixeToMove].shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
      let shiftAcheveToSave = this.clone(this.listShiftFixe[indexShiftFixeToMove]);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave) {
        this.shiftFixeByEmployee.get(movedCardInfos.newEmp).push(shiftAcheveToSave);
        this.listShiftFixe.push(shiftAcheveToSave);
      }
    }
    this.shiftFixeByEmployee.get(movedCardInfos.newEmp).push(this.listShiftFixe[indexShiftFixeToMove]);

    const indexShiftFixeToUpdate = this.listShiftFixesToUpdate.findIndex(shift => shift.idShiftFixe === this.listShiftFixe[indexShiftFixeToMove].idShiftFixe);
    if (indexShiftFixeToUpdate !== -1) {
      this.listShiftFixesToUpdate[indexShiftFixeToUpdate] = {...this.listShiftFixe[indexShiftFixeToMove]};
    } else {
      this.listShiftFixesToUpdate.push({...this.listShiftFixe[indexShiftFixeToMove]});
    }
    this.sortListShiftByShiftAcheval(this.listShiftFixe);

    if (movedCardInfos.newEmp !== movedCardInfos.oldEmp) {
      this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(movedCardInfos.newEmp));

      this.calculeTempsPlanifieAfterCopieOrMoveShift(movedCardInfos);
    } else {
      this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(movedCardInfos.oldEmp));

      this.takeBreakswithTime(this.clone(this.shiftFixeByEmployee.get(movedCardInfos.newEmp)), this.listLoi, this.tempsTravailPartiel, this.mineur);
      this.afficherTempsPlanifier(movedCardInfos.newEmp);
    }

  }

  /**
   * Si l’utilisateur maintient la touche Ctrl appuyer tous le long du drag&drop (appuyer à la sélection et au relâchement du shift),
   *  il faut permettre de copier un shift lors d’un drag&drop.
   *  @param :copieCardInfos
   */

  private copieShiftFixe(copieCardInfos: any): void {
    let shiftFixeCopy = {} as ShiftFixeModel;
    let shiftFixe = {} as ShiftFixeModel;
    const indexShiftFixeToMove = this.listShiftFixe.findIndex(shift => shift.idShiftFixe === copieCardInfos.idShiftFixe && !shift.shiftAchevalHidden);
    const indexNewEmployee = this.listEmployeeActif.findIndex(emp => emp.idEmployee === copieCardInfos.newEmp);
    this.shiftFixeByEmployee.get(copieCardInfos.oldEmp).splice(this.shiftFixeByEmployee.get(copieCardInfos.oldEmp).findIndex(shift => shift.idShiftFixe === copieCardInfos.idShiftFixe && !shift.shiftAchevalHidden), 1);
    shiftFixeCopy = {...this.listShiftFixe[indexShiftFixeToMove]};
    shiftFixeCopy.idShiftFixe = this.makeString();
    shiftFixeCopy.employee = this.listEmployeeActif[indexNewEmployee];
    shiftFixeCopy.jour = copieCardInfos.newDayZone.toUpperCase();
    shiftFixe = {...this.listShiftFixe[indexShiftFixeToMove]};
    if (shiftFixeCopy.acheval) {
      shiftFixeCopy.modifiable = true;
      const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftFixeCopy.jour), true);
      shiftFixeCopy.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
    }
    this.listShiftFixe.push(shiftFixeCopy);
    this.shiftFixeByEmployee.get(copieCardInfos.newEmp).push(shiftFixeCopy);
    this.shiftFixeByEmployee.get(copieCardInfos.oldEmp).push(shiftFixe);
    if (shiftFixeCopy.acheval) {
      let shiftAcheveToSave = this.clone(shiftFixeCopy);
      shiftAcheveToSave = this.duplicateShiftAcheval(shiftAcheveToSave);
      if (shiftAcheveToSave) {
        this.shiftFixeByEmployee.get(copieCardInfos.newEmp).push(shiftAcheveToSave);
        this.listShiftFixe.push(shiftAcheveToSave);
      }
    }
    this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(copieCardInfos.newEmp));
    this.sortListShiftByShiftAcheval(this.listShiftFixe);
    this.listShiftFixesToUpdate.push({...shiftFixeCopy});
    if (copieCardInfos.newEmp !== copieCardInfos.oldEmp) {
      this.calculeTempsPlanifieAfterCopieOrMoveShift(copieCardInfos);
    } else {
      this.takeBreakswithTime(this.clone(this.shiftFixeByEmployee.get(copieCardInfos.newEmp)), this.listLoi, this.tempsTravailPartiel, this.mineur);
      this.afficherTempsPlanifier(copieCardInfos.newEmp);
    }
    this.eventCtrl = false;
  }

  /**
   * aficher temps planifier de l"employe
   */
  private afficherTempsPlanifier(idEmployee: number): void {
    this.listEmployeeHasShiftFixe.forEach((employeDisplay: EmployeeModel) => {
      if (employeDisplay.idEmployee === idEmployee) {
        employeDisplay.totalRowTime = this.totalRowTime;
        return;
      }
    });
    this.fillAvailableEmployeeActif();

  }

  /**
   * calculer temps planifiés pour les employés
   * cardInf
   */
  private async calculeTempsPlanifieAfterCopieOrMoveShift(cardInf: any): Promise<void> {
    for (const employeDisplay of this.listEmployeeHasShiftFixe) {
      if (employeDisplay.idEmployee === cardInf.newEmp) {
        this.takeBreakswithTime(this.clone(this.shiftFixeByEmployee.get(employeDisplay.idEmployee)), this.listLoi, this.tempsTravailPartiel, this.mineur);
        employeDisplay.totalRowTime = this.totalRowTime;
      } else if (employeDisplay.idEmployee === cardInf.oldEmp) {
        await this.getlawByCodeName(employeDisplay);
        employeDisplay.totalRowTime = this.totalRowTime;
      }
    }
    this.fillAvailableEmployeeActif();
  }

  /**
   * permet de savegarder la ligne Poste selectionnée pour la suppression
   * @param: event
   */
  public updateSelectedShiftFixeRow(event) {
    this.selectedEmployee = event;
  }

  private deleteAllShiftFixeByIdEmployee() {

    const indexEmployeeToDelete = this.listEmployeeHasShiftFixe.findIndex(emp => emp.idEmployee === this.selectedEmployee.idEmployee);
    this.listEmployeeHasShiftFixe.splice(indexEmployeeToDelete, 1);
    if (this.shiftFixeByEmployee.get(this.selectedEmployee.idEmployee)) {
      this.shiftFixeByEmployee.delete(this.selectedEmployee.idEmployee);
    }
    this.listShiftFixesByEmployeeToDelete.push(this.selectedEmployee.uuid);
    if (this.listShiftFixesToUpdate.length > 0) {
      for (let i = 0; i < this.listShiftFixesToUpdate.length; i++) {
        if (this.listShiftFixesToUpdate[i].employee.idEmployee === this.selectedEmployee.idEmployee) {
          if (!isNaN(Number(this.listShiftFixesToUpdate[i].idShiftFixe))) {
            // supprimer les shifts fixe qui se trouvent ds la bd avec un autre employee
            this.listIdShiftFixesToDelete.push(this.listShiftFixesToUpdate[i].uuid);
          }
          // supprimer les  shifts qui se trouvent da list que on va enregistrer ds la bd
          this.listShiftFixesToUpdate.splice(i, 1);
          i--;
        }
      }
    }
    if (this.listShiftFixe.length > 0) {
      for (let i = 0; i < this.listShiftFixe.length; i++) {
        if (this.listShiftFixe[i].employee.idEmployee === this.selectedEmployee.idEmployee) {
          this.listShiftFixe.splice(i, 1);
          i--;
        }
      }
    }
    this.fillAvailableEmployeeActif();
  }

  /**
   * delet sift fixe de la list shift fixe et de map et de shifli list que on va enregistrer
   * @param: event
   */
  private deleteShiftFixeCard(event: any): void {
    this.idEmploye = 0;
    this.index = null;
    this.idShiftToDelete = null;
    this.shiftToDelete = null;

    if (!isNaN(Number(event))) {
      event = +event;
    }
    this.listShiftFixe.forEach((shift: ShiftFixeModel, index: number) => {
      if (shift.idShiftFixe === event && (!shift.acheval || (shift.acheval && shift.modifiable && !shift.shiftAchevalHidden))) {
        this.index = index;
        this.idShiftToDelete = event;
        this.shiftToDelete = shift;
        this.idEmploye = shift.employee.idEmployee;

        const filteredShiftsByDayAndEmployee = this.getListShiftFixeByJour(shift);
        const indexShiftToDelete = filteredShiftsByDayAndEmployee.findIndex((shiftFix: ShiftFixeModel) => shiftFix.idShiftFixe === this.idShiftToDelete);
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
    const employeToDeleteShift = this.clone(this.listShiftFixe[this.index].employee);
    this.deleteShiftAchevalHidden(this.idShiftToDelete, employeToDeleteShift.idEmployee);
    let indexShiftFixeToDeleteInListUpdateShiftFixe;
    this.shiftFixeByEmployee.get(employeToDeleteShift.idEmployee).splice(this.shiftFixeByEmployee.get(employeToDeleteShift.idEmployee).findIndex(shiftFixe => shiftFixe.idShiftFixe === this.idShiftToDelete), 1);
    const collection = this.shiftFixeByEmployee.get(employeToDeleteShift.idEmployee);
    const indexShiftDeleted = this.listShiftFixe.findIndex((item: ShiftFixeModel) => item.idShiftFixe === this.idShiftToDelete && ((item.acheval && item.modifiable && !item.shiftAchevalHidden) || !item.acheval));
    if (indexShiftDeleted !== -1) {
      this.listShiftFixe.splice(indexShiftDeleted, 1);
    }
    if (!isNaN(Number(this.idShiftToDelete))) {
      this.listIdShiftFixesToDelete.push(this.shiftToDelete.uuid);
    }
    this.listShiftFixeDefault = JSON.parse(JSON.stringify(this.listShiftFixe));
    if (this.listShiftFixesToUpdate.length > 0) {
      indexShiftFixeToDeleteInListUpdateShiftFixe = this.listShiftFixesToUpdate.findIndex(shift => shift.idShiftFixe === this.idShiftToDelete);
      if (indexShiftFixeToDeleteInListUpdateShiftFixe !== -1) {
        this.listShiftFixesToUpdate.splice(indexShiftFixeToDeleteInListUpdateShiftFixe, 1);
      }

    }
    if (employeToDeleteShift) {
      this.sortListShiftByShiftAcheval(this.shiftFixeByEmployee.get(employeToDeleteShift.idEmployee));
    }
    this.sortListShiftByShiftAcheval(this.listShiftFixe);
    this.calculeTempsPlanifieAfterDeleteCard(this.idEmploye);
    this.updatePlanningFixRowInterface();
    if (!collection) {
      this.fillAvailableEmployeeActif();
    }
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

  /**
   * ajouter list de shift fixe apres save
   * @param: data
   */
  private setListShiftFixeAfterSave(data: ShiftFixeModel[]) {
    if (data.length > 0) {
      data.forEach(item => {
        this.setCorrectTimeToDisplay(item);
        this.listShiftFixe.push(item);

      });
    }
    for (let i = 0; i < this.listShiftFixe.length; i++) {
      if (isNaN(Number(this.listShiftFixe[i].idShiftFixe))) {
        this.listShiftFixe.splice(i, 1);
        i--;
      }
    }
    this.listShiftFixe = this.listShiftFixe.filter((shift: ShiftFixeModel) => !shift.acheval || (shift.acheval && !shift.shiftAchevalHidden));
    const shiftFixeSet = new Set();
    // removing-duplicates-in-an-array
    this.listShiftFixe = this.listShiftFixe.filter(shift => {
      const duplicate = shiftFixeSet.has(shift.idShiftFixe);
      shiftFixeSet.add(shift.idShiftFixe);
      return !duplicate;
    });
    this.listEmployeeHasShiftFixe = [];

    this.listShiftFixe.forEach((shiftDisplay: ShiftFixeModel) => {
      if (this.checkIfShiftAcheval(shiftDisplay) && this.getModeDispaly(shiftDisplay)) {
        shiftDisplay.acheval = true;
        shiftDisplay.modifiable = true;
      }
      if (shiftDisplay.acheval && shiftDisplay.modifiable) {
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftDisplay.jour), true);
        shiftDisplay.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));

        const shiftDuplicate = this.duplicateShiftAcheval(this.clone(shiftDisplay));
        if (shiftDuplicate) {
          this.listShiftFixe.push(shiftDuplicate);
        }
      }
    });
    this.sortListShiftByShiftAcheval(this.listShiftFixe);
    this.shiftFixeByEmployee = this.groupShiftFixeByEmployee(this.listShiftFixe, shiftFixeDisplay => shiftFixeDisplay.employee.idEmployee);
    this.calculeTotalInWeekAndTotalInDayForShiftFixe();

    this.fillAvailableEmployeeActif();
    this.displaySuccesSauvegardeMessage();
    this.listShiftFixesToUpdate = [];
    this.listIdShiftFixesToDelete = [];
    this.listShiftFixesByEmployeeToDelete = [];

  }

  private checkIfShiftAcheval(planning: ShiftFixeModel): boolean {
    this.getStartTimeAndEndTimeFromDecoupageHoraire(planning.jour);
    this.getStartAndEndActivityDay();
    return (moment(planning.heureFin).isAfter(this.endActivity));
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
   * get shift fixe before drag and drop for veification contrainte social
   * @param: cardDropInfos
   */
  private getShiftFixeBeforeDragAndDrop(cardDropInfos, employee): ShiftFixeModel {
    let shiftFixe = {} as ShiftFixeModel;
    this.listShiftFixe.forEach(shift => {
      if (shift.idShiftFixe === cardDropInfos.idShiftFixe && !shift.shiftAchevalHidden) {
        shiftFixe = {...shift};
        if (shiftFixe.acheval) {
          shiftFixe.modifiable = true;
        }
        if (this.eventCtrl) {
          shiftFixe.idShiftFixe = 0;
          delete shiftFixe.uuid;
        }
        shiftFixe.employee = employee;
        shiftFixe.jour = cardDropInfos.newDayZone.toUpperCase();
      }
    });

    return shiftFixe;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.navigateTo = false;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveListShiftFixe();
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
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
  public unselectShiftFixe() {
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
   * list clicked Condense
   */
  public btnListBesoins() {
    this.listBesoinsCondense = !this.listBesoinsCondense;
    this.stylelistBesoinCondense = !this.stylelistBesoinCondense;
  }

  /**
   * fermer le popup de shift
   */
  public resetPopupOfShiftFixe(): void {
    this.eventCtrl = false;
  }

  /**
   * recupere semaine de date selectioné
   * @param: dateSelected
   */
  private getWeekNumber(dateSelected: Date): number {
    const dateDisplay = new Date(Date.UTC(dateSelected.getFullYear(), dateSelected.getMonth(), dateSelected.getDate()));
    const dayNum = dateDisplay.getUTCDay() || 7;
    dateDisplay.setUTCDate(dateDisplay.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dateDisplay.getUTCFullYear(), 0, this.firstDayAsInteger));
    return Math.ceil((((+dateDisplay - (+yearStart)) / 86400000) + this.firstDayAsInteger) / 7);
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
   * verification numero de semaine de shift fixe
   * @param :shiftFixe
   */
  private verificationWeekPairOrOddForShiftFixe(shiftFixe: ShiftFixeModel): void {
    this.listPairAndOdd = [];
    if (!shiftFixe.dateFin) {
      this.listPairAndOdd.push(DisponiblitePairOrOdd.PAIRE_ODD);
    }
    if (shiftFixe.dateFin && shiftFixe.dateDebut) {
      const diff = this.dateService.getDiffDatesOnDays(shiftFixe.dateFin, shiftFixe.dateDebut) + 1;
      if (diff <= 7) {
        if (this.getWeekNumber(shiftFixe.dateDebut) === this.getWeekNumber(shiftFixe.dateFin)) {
          this.getWeekPairOrOdd(this.getWeekNumber(shiftFixe.dateDebut));
        } else {
          this.listPairAndOdd.push(DisponiblitePairOrOdd.PAIRE_ODD);
        }
      } else {
        this.listPairAndOdd.push(DisponiblitePairOrOdd.PAIRE_ODD);

      }
    }
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
      this.listLoiByCodeName = data;
    } catch (err) {

    }
  }

  /**
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour groupe de travail de l'employé
   * @param :employee
   */
  private async getGroupeTravailLawsByCodeName(employee: EmployeeModel): Promise<void> {
    try {
      const data = await this.loiGroupeTravailService.getGroupeTravailLawUsedInVerificationContraintSocialByCodeName
      (employee.contrats[0].groupeTravail.uuid, CodeNameContrainteSocial.LONGUEUR_MINI_BREAK, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK, CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES)
        .toPromise();
      this.listLoiByCodeName = data;
    } catch (err) {
    }
  }

  /**
   * recuperer le deux loi LONGUEUR_MAXI_SHIFT_SANS_BREAK et LONGUEUR_MINI_BREAK pour le restaurant
   */
  private async getRestaurantLawsByCodeName(): Promise<void> {
    try {
      const data = await this.loiRestaurantService.getRestaurantLawUsedInVerificationContraintSocialByCodeName
      (CodeNameContrainteSocial.LONGUEUR_MINI_BREAK, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK, CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES, CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES)
        .toPromise();
      this.listLoiByCodeName = data;
    } catch (err) {

    }
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
  private correctTimeBeforCalculHour(listShiftByDay: ShiftFixeModel[]): ShiftFixeModel[] {
    listShiftByDay.forEach((shift: ShiftFixeModel, index: number) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
    });
    return listShiftByDay;
  }

  public duplicateShiftAcheval(shiftFixe: ShiftFixeModel): ShiftFixeModel {
    const shift = {...shiftFixe};
    const numJour = this.dateService.getIntegerValueFromJourSemaine(shift.jour);
    shift.acheval = true;
    shift.modifiable = false;
    shift.dateDebutIsNight = false;
    shift.dateFinIsNight = false;
    const day = numJour < 6 ? numJour + 1 : 0;
    shift.shiftAchevalHidden = true;
    shift.jour = this.dateService.getJourSemaineFromInteger(day);
    if (this.firstDayAsInteger === day) {
      return null;
    }
    return shift;
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
  public addShiftAchevalInCurrentList(shift: ShiftFixeModel, collection: any, filter?: boolean): any {
    const listShiftInDay: any[] = [];
    if (collection) {
      collection.forEach((item: ShiftFixeModel) => {
        const shiftFixe = this.clone(shift);
        const shiftDisplay = this.clone(item);
        const dayShift = this.getDayOfShiftAcheval(this.clone(shiftFixe.jour));
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(shiftDisplay.jour));
        if ((item.acheval && item.modifiable) && dayShift === item.jour) {
          const shiftDuplicate = this.duplicateShiftAcheval(this.clone(item));
          if (shiftDuplicate) {
            listShiftInDay.push(shiftDuplicate);
          }
        }
        if (filter && (shift.acheval && shift.modifiable) && shiftFixe.jour === dayShiftDisplay && this.firstDayAsInteger !== this.dateService.getIntegerValueFromJourSemaine(this.clone(shiftDisplay.jour))) {
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
   * @param idShiftFixe
   * @param mangerOrLeaderActif
   */
  public deleteShiftAchevalHidden(idShiftFixe: any, idEmployee: number): void {
    const collection = this.shiftFixeByEmployee.get(idEmployee);
    const indexPlanningManager = collection.findIndex((item: ShiftFixeModel) => item.idShiftFixe === idShiftFixe && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManager !== -1) {
      collection.splice(indexPlanningManager, 1);
    }
    const indexPlanningManagerDeleted = this.listShiftFixe.findIndex((item: ShiftFixeModel) => item.idShiftFixe === idShiftFixe && item.acheval && !item.modifiable && item.shiftAchevalHidden);
    if (indexPlanningManagerDeleted !== -1) {
      this.listShiftFixe.splice(indexPlanningManagerDeleted, 1);
    }
  }

  /**
   * Trie des shifts
   */
  private sortListShiftByShiftAcheval(listShiftFixe: ShiftFixeModel[]): void {
    listShiftFixe.sort(function (shift: ShiftFixeModel, shiftDisplay: ShiftFixeModel) {
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

