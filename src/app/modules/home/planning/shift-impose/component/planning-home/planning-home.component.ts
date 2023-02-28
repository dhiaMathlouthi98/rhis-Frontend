import {Component, OnInit} from '@angular/core';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {PlanningEquipierService} from '../../../planning-equipier/service/planning-equipier.service';
import {PlanningModel} from '../../../../../../shared/model/planning.model';
import {ConfirmationService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {SessionService} from '../../../../../../shared/service/session.service';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';
import {AnomaliePlanningModel} from '../../../../../../shared/model/gui/anomalie.planning.model';
import {AnomalieService} from '../../service/anomalie.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {RapportService} from '../../../../employes/service/rapport.service';
import {RapportModel} from '../../../../../../shared/model/rapport.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {RestaurantService} from '../../../../../../shared/service/restaurant.service';
import {PlanningLockService} from '../../../../../../shared/service/planning-lock.service';
import {MyRhisUserModel} from '../../../../../../shared/model/MyRhisUser.model';
import {UtilisateurService} from '../../../../../admin/utilisateur/service/utilisateur.service';
import * as FileSaver from 'file-saver';
import {GenerateFilesService} from '../../../../../../shared/service/generate.files.service';
import * as rfdc from 'rfdc';
import {AlarmeService} from '../../../../accueil/service/alarme.service';
import {RestaurantNameService} from '../../../../../../shared/service/restaurant-name.service';
import {GuiAlarme} from '../../../../../../shared/model/gui/gui.alarme';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {PlanningManagerService} from '../../../planning-manager/service/planning-manager.service';
import {PlanningManagerModel} from '../../../../../../shared/model/planningManager.model';

@Component({
  selector: 'rhis-planning-home-container',
  templateUrl: './planning-home.component.html',
  styleUrls: ['./planning-home.component.scss']
})
export class PlanningHomeComponent implements OnInit {

  public currentWeek = 1;
  public firstDayAsInteger = 0;
  public selectedDate: Date = new Date();
  public paramAffect = true;
  public displaySpinner = false;
  public ONE_DAY_IN_MILLISECOND = 86400000;

  public weekObject: any = [];
  public viewReady = false;
  public currentYear: any;
  public calendarFr: any;

  public calculePlanningButtonTitle: string;

  public displayConfirmDialog = true;
  public premierJourDeLaSemaine: JourSemaine;

  public planningData = [];
  public showPopupRapport = false;
  public selectedRapport: RapportModel;
  public listEmployees: EmployeeModel[] = [];
  public allEmployeeLabel = '';
  public heightInterface: any;

  private emptyDayDate =
    {
      weekNumber: 0,
      etat: 0,
      month: 1,
      startDate: '01-01-1970',
      endDate: '07-00-1970',
      planning: {
        empNumber: '--',
        anomNumber: '--',
        locked: false
      }
    };
  public popupAnomalieVisibility = false;
  public titlePopupContraint: string;
  public listContraintePlanning: AnomaliePlanningModel[] = [];

  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 800,
    height: 700
  };
  public QUALIFICATION_ERROR_CODE = 'QUALIFICATION_ERROR';
  public DISPONIBILITE_ERROR_CODE = 'DISPONIBILITE_ERROR';
  public CONGE_ERROR_CODE = 'CONGE_ERROR';
  public JOUR_REPOS_ERROR_CODE = 'JOUR_REPOS_ERROR';
  public GROUPE_TRAVAIL_CHANGES_ERROR_CODE = 'GROUPE_TRAVAIL_CHANGES';
  public PERIODE_NB_HEURE_CONTRACTUELLE_ERROR_CODE = 'PERIODE_NB_HEURE_CONTRACTUELLE';
  public ecran = 'PLH';
  public ecranShiftFix = 'GDS';
  public ecranBesoinImpose = 'GBI';
  public ecranPlanningManagers = 'VPM';
  public ecanPlanningLeaders = '';
  public ecranPlanningEquipier = 'VPE';
  public listRapports: RapportModel[];

  public PLANNING_EMPLOYEE = 'PLG_EMPLOYE_RAPPORT';
  public SERVICE_A_PRENDRE = 'SERVICE_A_PRENDRE_RAPPORT';
  public RAPPORT_OPERATIONNEL = 'RAPPORT_OPERATIONNEL';
  public PLG_RAPPORT_JOURNALIER = 'PLG_RAPPORT_JOURNALIER';
  public RESUME_PLANNING = 'RESUME_PLANNING_RAPPORT';
  public COMPTEURS_EMPLOYES = 'COMPTEURS_EMPLOYES_RAPPORT';
  private weeksPerMonth = [];
  public lock = false;
  public clone = rfdc();
  private originalListContraintePlanning: AnomaliePlanningModel[];

  public isUsingMobile = false;
  public planningManagerBroadcasted = false;
  public planningleaderBroadcasted = false;
  public planningManagerEmpty = false;
  public planningLeaderEmpty = false;
  public displayConfirmDialogPlanningBroadcast = true;
  public razButtonTitle = this.rhisTranslateService.translate('PLANNING_HOME.RAZ_BUTTON_TITLE');

  constructor(private rhisTranslateService: RhisTranslateService,
              private sharedRestaurant: SharedRestaurantService,
              private dateService: DateService,
              public rhisRouter: RhisRoutingService,
              private router: Router,
              private planningService: PlanningEquipierService,
              private planninManagerService: PlanningManagerService,
              private anomalieService: AnomalieService,
              private generateFilesService: GenerateFilesService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private sessionService: SessionService,
              private domControlService: DomControlService,
              private rapportService: RapportService,
              private restaurantService: RestaurantService,
              private employeeService: EmployeeService,
              private planningLockService: PlanningLockService,
              private utilisateurService: UtilisateurService,
              private alarmeService: AlarmeService,
              private restaurantNameService: RestaurantNameService,
              private parametreService: ParametreGlobalService) {
  }

  public addControlButton(ecran: string): boolean {
    return this.domControlService.addControlButton(ecran);
  }

  public deleteButtonControl(ecran: string): boolean {
    return this.domControlService.deleteListControl(ecran);
  }

  public updateControl(ecran: string): boolean {
    return this.domControlService.updateListControl(ecran);
  }

  public showControl(ecran: string): boolean {
    return this.domControlService.showControl(ecran);
  }

  ngOnInit() {
    if (this.sessionService.getResetPlanningCalendar() === false.toString()) {
      this.selectedDate = new Date(this.sessionService.getLastSelectedDate());
    }

    this.sessionService.setResetPlanningCalendar(true);

    this.getSelectedRestaurant();
    this.getWeeksByMonthByRestaurant(this.selectedDate);

    this.titlePopupContraint = this.rhisTranslateService.translate('ANOMALIE_PLANNING.POPUP_TITLE');
    this.getListRapportByCodeName();
    this.getParamRestaurantUseAppliMobile();

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

  public  async GenerateExcelRapportDetailee(event: any): Promise<void> {
    this.notificationService.startLoader();
    const fileName = await  this.rapportService.createRapportCompteurs(
      event.uuidRestaurant,
      event.periodeAnalyser,
      event.date,
      event.sortingCriteria
    ).toPromise();

    const fileContent: Blob = await this.generateFilesService.getFileByFileNameFromGDHService(fileName.toString()).toPromise();
    FileSaver.saveAs(fileContent, fileName.toString());
    this.notificationService.stopLoader();

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

  public setCurrentWeekByDay(date: Date): void {
    this.selectedDate = date;
    this.currentYear = date.getFullYear();
    this.sessionService.setCurrentYear(this.currentYear);
    this.sessionService.setDateSelected(this.selectedDate.toDateString());
    this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.selectedDate, 'YYYY-MM-DD'));
    const weekOfDate = this.getWeekNumber(date);
    this.sessionService.setCurrentWeek(weekOfDate.toString());
    this.setCurrentWeek(weekOfDate);

  }

  /**
   * determiner lu numeroro de semaine de date courant
   */
  private initiliaseWeekNumberAndCurrentYear(): void {
    this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    if (this.selectedDate) {
      this.currentWeek = this.getWeekNumber(this.dateService.setTimeNull(this.selectedDate));
      this.currentYear = this.selectedDate.getFullYear();
    } else {
      this.currentWeek = this.getWeekNumber(this.dateService.setTimeNull(new Date()));
      this.currentYear = new Date().getFullYear();
    }
    this.sessionService.setCurrentYear(this.currentYear);
    this.sessionService.setCurrentWeek(this.currentWeek.toString());
    this.sessionService.setDateSelected(this.selectedDate.toDateString());
    this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(this.selectedDate, 'YYYY-MM-DD'));
  }


  /**
   * get restaurant
   */
  private getSelectedRestaurant(): void {
    if (this.sharedRestaurant.selectedRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant !== 0) {
      this.setColumns();
      this.initiliaseWeekNumberAndCurrentYear();
    } else {
      this.sharedRestaurant.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurant.selectedRestaurant = data;
          this.setColumns();
          this.initiliaseWeekNumberAndCurrentYear();
        }, (err: any) => {
          console.log('error');
          console.log(err);
        }
      );
    }
  }

  /**
   * commencer les jours  de semaine par premier jour de semaine de restaurant
   */
  private setColumns(): void {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.calendarFr = {
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
      weekHeader: '', // Sem.
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }

  public async monthChanged(event: any): Promise<void> {
    this.currentYear = event.year;
    this.selectedDate = new Date(event.year, event.month - 1, 1);
    this.sessionService.setDateSelected(this.selectedDate.toDateString());
    this.sessionService.setCurrentYear(this.currentYear);
    this.sessionService.setCurrentWeek(this.currentWeek.toString());
    await this.getWeeksByMonthByRestaurant(this.selectedDate);
    this.hideOtherMonthsWeeks();

  }

  private setCurrentWeek(weekNumber: number): void {
    this.currentWeek = weekNumber;
    this.sessionService.setCurrentWeek(this.currentWeek.toString());
    // get week object
    this.weekObject = this.planningData.find(planning => planning.weekNumber === weekNumber);
    if (!this.weekObject) {
      this.weekObject = this.planningData[0];
    }

    if (this.weekObject.etat === 0) {
      this.calculePlanningButtonTitle = this.rhisTranslateService.translate('PLANNING_EQUIPIER.CALCULE_PLANNING');
    } else {
      this.calculePlanningButtonTitle = this.rhisTranslateService.translate('PLANNING_EQUIPIER.RECALCULE_PLANNING');
    }

    if (this.weekObject.weekNumber === 0) {
      this.calculePlanningButtonTitle = 'please refresh ! ';
    }
    this.updateWeekStatus();
    this.viewReady = true;
    this.lock = false;
    if (this.weekObject.planning.uuidUser) {
      if (this.sessionService.getProfil() !== 'administrateur' && this.sessionService.getProfil() !== 'superviseur' && this.sessionService.getProfil() !== 'franchise' && this.weekObject.planning.uuidUser !== this.sessionService.getUuidUser() && !this.sessionService.isDirector()) {
        this.lock = true;
      }
    }
    this.getPlanningManagerAndLeader();
  }

  private updateWeekStatus(): void {
    const weeksElements = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksElementsArray = Array.from(weeksElements);
    weeksElementsArray.forEach((element: any, index: number) => {
      element.parentElement.parentElement.classList.remove('calculated-week');
      element.parentElement.parentElement.classList.remove('non-calculated-week');
      element.innerHTML = this.weeksPerMonth[index].weekNumber;
    });
    weeksElementsArray.forEach((element: any) => {
      element.parentElement.parentElement.classList.remove('calculated-week');
      element.parentElement.parentElement.classList.remove('non-calculated-week');
      const weekNumber = parseInt(element.innerHTML, 10);
      let weekObject = this.planningData.find(i => i.weekNumber === weekNumber);
      if (!weekObject) {
        weekObject = this.planningData.find(planning => planning.weekNumber === 0);
      }

      if (weekObject && this.currentWeek !== weekNumber) {
        if (weekObject.etat === 1) {
          element.parentElement.parentElement.classList.add('calculated-week');
        } else {
          element.parentElement.parentElement.classList.add('non-calculated-week');
        }
      }
      if (parseInt(element.innerHTML, 10) === weekNumber) {
      }
    });

    const weeks = document.querySelectorAll('.ui-datepicker-weeknumber span');
    const weeksArray = Array.from(weeks);
    weeksArray.forEach((element: any) => {
      element.parentElement.parentElement.classList.remove('current-week');
      if (parseInt(element.innerHTML, 10) === this.currentWeek) {
        element.parentElement.parentElement.classList.add('current-week');
      }
    });
  }

  private initWeeksEvent(): void {
    setTimeout(() => {
      const weeks = document.querySelectorAll('.ui-datepicker-weeknumber span');
      const weeksArray = Array.from(weeks);
      weeksArray.forEach((element: any) => {
        const thisComponent = this;
        element.addEventListener('click', function (event) {
          const weekNumber = parseInt(element.innerHTML, 10);
          thisComponent.setCurrentWeek(weekNumber);
          thisComponent.sessionService.setDateSelected(thisComponent.firstDayOfWeek().toDateString());
          thisComponent.sessionService.setLastSelectedDate(thisComponent.dateService.formatDateTo(thisComponent.firstDayOfWeek(), 'YYYY-MM-DD'));
        });
      });
      // initialize current week
      this.setCurrentWeek(this.currentWeek);
      this.hideOtherMonthsWeeks();

    }, 0);
  }

  private getWeekNumber(date: Date): number {
    date = this.dateService.setTimeNull(date);
    let weekNumber = 0;
    this.weeksPerMonth.forEach((item: any) => {
      const dateDebut = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      const dateFin = this.dateService.createDateFromStringPattern(item.dateFin, 'YYYY-MM-DD');
      this.dateService.resetSecondsAndMilliseconds(date);
      if (dateDebut.getTime() <= date.getTime() && dateFin.getTime() >= date.getTime()) {
        weekNumber = +item.weekNumber;
        this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(dateDebut, 'YYYY-MM-DD'));
      }
    });
    return weekNumber;
  }

  /**
   * Cette methode permet de faire disparaitre les autres mois lors du changements du mois une sorte de reinitialisation
   */
  private hideOtherMonthsWeeks(): void {
    const weeks = document.querySelectorAll('.ui-datepicker-calendar-container table tr');
    const lastWeek = weeks[weeks.length - 1];
    const otherMonthsDaysCount = lastWeek.querySelectorAll('td.ui-datepicker-other-month').length;
    if (otherMonthsDaysCount === 7) {
      (<HTMLElement>lastWeek).style.display = 'none';
    }
  }

  public calculateOrRecalculatePlanning(): void {
    if (this.weekObject.planning.locked) {
      this.planningLockService.checkLocker(this.weekObject.planning.uuidUser);
    } else {
      if (this.weekObject.etat === 0) {
        // calculate planning
        this.getPlanningByDate(true);
      } else {
        if (!this.paramAffect) {
          // relancer l'affectation
          this.lancerCalculePlanning();
        } else {
          // ouvrir la popup
          this.confirmationService.confirm({
            message: this.rhisTranslateService.translate('PLANNING_EQUIPIER.QUE_VOULEZ_VOUS_REFAIRE'),
            header: this.rhisTranslateService.translate('PLANNING_EQUIPIER.RECALCULE_PLANNIG_TITLE'),
            acceptVisible: true,
            rejectVisible: true,
            key: 'popupRecalcule',
            icon: 'pi pi-info-circle',
          });
        }
      }
    }
  }

  public deletePlanning(): void {
    if (this.weekObject.planning.locked) {
      this.planningLockService.checkLocker(this.weekObject.planning.uuidUser);
    } else {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('PLANNING_HOME.RAZ_BODY_TEXT') + this.weekObject.weekNumber + this.rhisTranslateService.translate('PLANNING_HOME.RAZ_BODY_TEXT_WARNING'),
        header: this.rhisTranslateService.translate('PLANNING_HOME.RAZ_HEADER_TEXT'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        key: 'popupRAZ',
        accept: () => {
          if (this.weekObject.etat === 0) {
            this.notificationService.showInfoMessage('PLANNING_HOME.RAZ_SUCCESS', '');
          } else {
            this.deletePlanningFromDataBase();
          }
        },
        reject: () => {
        }
      });
    }
  }

  private deletePlanningFromDataBase(): void {
    this.notificationService.startLoader();
    let date;
    if ((this.getWeekNumber(this.selectedDate)) !== (+this.sessionService.getCurrentWeek())) {
      const yearSelected = +this.sessionService.getCurrentYear();
      date = this.firstDayOfWeek(yearSelected);
    } else {
      date = new Date(this.selectedDate);
    }
    date = this.dateService.formatToShortDate(date);
    this.planningService.deletePlanning(date).subscribe((data: any) => {
      this.notificationService.stopLoader();
      this.notificationService.showInfoMessage('PLANNING_HOME.RAZ_SUCCESS', '');
      this.planningData = data;
      this.initWeeksEvent();
    }, (err: any) => {
      this.notificationService.stopLoader();
      console.log('error ', err);
    });
  }

  /**
   * Methode qui permet de lancer l'appel ws vers l'affecation seulement
   */
  public refaireAffectation(): void {
    this.displayConfirmDialog = false;
    setTimeout(() => this.displayConfirmDialog = true, 100);
    this.callRefaireAffectationWS();
  }

  /**
   * Methode qui permet de lancer l'appel ws vers le calcule du planning
   */
  public recalculerToutPlanning(): void {
    this.displayConfirmDialog = false;
    this.lancerCalculePlanning();
    setTimeout(() => this.displayConfirmDialog = true, 100);
  }

  private getPlanningByDate(recalculate: boolean): void {
    this.notificationService.startLoader();
    let date;
    if ((this.getWeekNumber(new Date(this.sessionService.getDateSelected()))) !== (+this.sessionService.getCurrentWeek())) {
      const yearSelected = +this.sessionService.getCurrentYear();
      date = this.firstDayOfWeek(yearSelected);
    } else {
      date = new Date(this.sessionService.getDateSelected());
    }
    date = this.dateService.formatToShortDate(date);
    this.planningService.checkIfPlanningIsCalculated(date).subscribe(
      (data: PlanningModel) => {
        this.notificationService.stopLoader();
        if (recalculate) {
          this.lancerCalculePlanning();
        } else {
          this.router.navigate([this.rhisRouter.getRoute('PLANNING-EQUIPIER')]);
        }
      }, (err: any) => {
        this.notificationService.stopLoader();
        if (recalculate) {
          this.displayErrorMessages(err);
        } else {
          this.router.navigate([this.rhisRouter.getRoute('PLANNING-EQUIPIER')]);
        }

      }
    );
  }

  private getPlanningDataByRestaurant(date?: Date): void {
    this.notificationService.startLoader();
    let stringAsDate = '';
    if (date) {
      stringAsDate = this.dateService.formatToShortDate(date);
      this.currentWeek = this.getWeekNumber(date);
    } else {
      stringAsDate = this.dateService.formatToShortDate(new Date());
      this.currentWeek = this.getWeekNumber(new Date());
    }
    this.planningService.getPlanningDataByRestaurant(stringAsDate).subscribe(
      (data: any) => {
        this.notificationService.stopLoader();
        this.planningData = data;
        this.initWeeksEvent();
      }, (err: any) => {
        this.notificationService.stopLoader();
        this.planningData.push(this.emptyDayDate);
        this.initWeeksEvent();
        console.log('error while retrieving planning data ', err);
      }
    );
  }

  private displayErrorMessages(error: any): void {
    if (error.error === 'RHIS_VENTE_JOURNALIERE_NOT_FOUND') {
      this.noVenteJournaliereMessage();
    } else {
      this.noPlanningMessage();
    }
  }

  private noVenteJournaliereMessage(): void {
    const date = this.dateService.formatToShortDate(this.selectedDate);
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PLANNING_HOME.NO_VJ_FOUD') + new DatePipe('en-US').transform(this.selectedDate, 'dd-MM-yyyy') + this.rhisTranslateService.translate('PLANNING_HOME.DEFINE_VJ_Q'),
      header: this.rhisTranslateService.translate('PLANNING_HOME.NO_VJ'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      acceptVisible: true,
      rejectVisible: true,
      icon: 'pi pi-info-circle',
      accept: () => {
        this.router.navigate([`home/previsions/vente-horaire/${date}/0/false`]);
      },
      reject: () => {
      }
    });
  }

  private noPlanningMessage(): void {
    let date;
    if ((this.getWeekNumber(this.selectedDate)) !== (+this.sessionService.getCurrentWeek())) {
      const yearSelected = +this.sessionService.getCurrentYear();
      date = this.firstDayOfWeek(yearSelected);
    } else {
      date = new Date(this.selectedDate);
    }
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PLANNING_HOME.NO_PLANNING_FOUD') + new DatePipe('en-US').transform(date, 'dd-MM-yyyy') + this.rhisTranslateService.translate('PLANNING_HOME.CALCULATE_PLANNING_Q'),
      header: this.rhisTranslateService.translate('PLANNING_HOME.NO_PLANNING'),
      acceptVisible: true,
      rejectVisible: true,
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.lancerCalculePlanning();
      },
      reject: () => {
      }
    });
  }

  private lancerCalculePlanning(): void {
    this.notificationService.startLoader();
    let date;
    if ((this.getWeekNumber(this.selectedDate)) !== (+this.sessionService.getCurrentWeek())) {
      const yearSelected = +this.sessionService.getCurrentYear();
      date = this.firstDayOfWeek(yearSelected);
    } else {
      date = new Date(this.selectedDate);
    }
    date = this.dateService.formatToShortDate(date);
    this.planningService.lancerCalculePlanning(date, this.paramAffect).subscribe(
      () => {
        this.notificationService.stopLoader();
        this.router.navigate([this.rhisRouter.getRoute('PLANNING-EQUIPIER')]);
      }, (err: any) => {
        console.log(err);
        this.notificationService.stopLoader();
      }
    );
  }

  private callRefaireAffectationWS(): void {
    this.notificationService.startLoader();
    let date;
    if ((this.getWeekNumber(this.selectedDate)) !== (+this.sessionService.getCurrentWeek())) {
      const yearSelected = +this.sessionService.getCurrentYear();
      date = this.firstDayOfWeek(yearSelected);
    } else {
      date = new Date(this.selectedDate);
    }
    date = this.dateService.formatToShortDate(date);
    this.planningService.refaireAffectation(date).subscribe(
      () => {
        this.notificationService.stopLoader();
        this.router.navigate([this.rhisRouter.getRoute('PLANNING-EQUIPIER')]);
      }, (err: any) => {
        console.log(err);
        this.notificationService.stopLoader();
      }
    );
  }

  /**
   * Cette methode permer de calculer le decalage entre la date saisie et le premier jour de la semaine du restaurant
   */
  public findDecalage(date: Date): number {
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

  public getAnomaliePlanning(): void {
    this.notificationService.startLoader();
    const date = this.getDateToGenerateAnomalie();
    this.anomalieService.getAnomaliePlanningByRestaurantAndDate(date).subscribe(
      (data: AnomaliePlanningModel[]) => {
        this.originalListContraintePlanning = data;
        this.setCorrectAnomalieValue(data.length);
        this.listContraintePlanning = this.clone(this.originalListContraintePlanning);
        this.setCorrectHourAndTextValue();
        this.notificationService.stopLoader();
        this.popupAnomalieVisibility = true;

      }, (err: any) => {
        console.log(err);
        this.notificationService.stopLoader();
      }
    );
  }

  /**
   * Method permet de lancer le téléchargement des anomalies plannings en format PDF
   */
  public downloadAnomaliePDF(): void {
    this.notificationService.startLoader();
    const date = this.getDateToGenerateAnomalie();
    const currentLangue = this.rhisTranslateService.browserLanguage;
    const listContraintePlanningToPrint = this.clone(this.originalListContraintePlanning);
    listContraintePlanningToPrint.forEach(value => {
      value.dateJounree = this.dateService.setCorrectDate(new Date(value.dateJounree));
      if (value.heureDebut) {
        value.heureDebut = this.dateService.setStringFromDate(this.dateService.createDateFromHourString(value.heureDebut));
      }

      if (value.heureFin) {
        value.heureFin = this.dateService.setStringFromDate(this.dateService.createDateFromHourString(value.heureFin));
      }
    });
    this.anomalieService.generateAnomaliePDF(currentLangue, listContraintePlanningToPrint, date).subscribe(
      (data: any) => {
        this.generateFilesService.getFileByFileNameFromEmployeeService(data).subscribe(
          (fileData: any) => {
            FileSaver.saveAs(fileData, data);
          },
          (err: any) => {
            console.log(err);
            // TODO
          }, () => {
            this.notificationService.stopLoader();
            this.notificationService.showSuccessMessage('EMPLOYEE.LISTE_EMPLOYEE_SUCCESS_DOWNLOAD');
          }
        );
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }
    );
  }

  /**
   * fermer le pupup d'anomalie
   */
  public closePopup(): void {
    this.popupAnomalieVisibility = false;
    this.showPopupRapport = false;

  }

  private setCorrectHourAndTextValue(): void {
    this.listContraintePlanning.forEach((item: AnomaliePlanningModel) => {
      if (item.textAnomalie !== this.PERIODE_NB_HEURE_CONTRACTUELLE_ERROR_CODE && item.textAnomalie !== this.QUALIFICATION_ERROR_CODE && item.textAnomalie !== this.DISPONIBILITE_ERROR_CODE && item.textAnomalie !== this.GROUPE_TRAVAIL_CHANGES_ERROR_CODE && item.textAnomalie !== this.CONGE_ERROR_CODE && item.textAnomalie !== this.JOUR_REPOS_ERROR_CODE) {
        item.textAnomalie = this.rhisTranslateService.translate('COMMON_LOI.' + item.textAnomalie);
      }
      if (item.textAnomalie === this.PERIODE_NB_HEURE_CONTRACTUELLE_ERROR_CODE) {
        const values = item.valeurContrainte.split(';');
        const valeurSaisie = values[0];
        const valeurContrainte = values[1];
        item.textAnomalie = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIE_VALEUR_HEBDO_CONTRAT') + valeurContrainte + ' ' + this.rhisTranslateService.translate('SHIFT_FIXE.VALEUR_SAISIE') + valeurSaisie;
        item.valeurContrainte = '';
      }
      if (item.heureDebut) {
        item.heureDebut = this.dateService.createDateFromHourString(item.heureDebut);
      }
      if (item.heureFin) {
        item.heureFin = this.dateService.createDateFromHourString(item.heureFin);
      }
    });
  }

  /**
   * recuperer date de semaine selectionné
   * @param: year
   */
  private firstDayOfWeek(year?: number): Date {
    let date = new Date();
    this.weeksPerMonth.forEach((item: any) => {
      if (item.weekNumber === +this.sessionService.getCurrentWeek()) {
        date = this.dateService.createDateFromStringPattern(item.dateDebut, 'YYYY-MM-DD');
      }

    });
    return date;
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

  private getWeeksByMonthByRestaurant(selectedDate: Date): void {
    const selectedDateAsString = this.dateService.formatToShortDate(selectedDate);
    this.restaurantService.getListWeekFromMonthByRestaurant(selectedDateAsString).subscribe((weeksPerMonth: any) => {
      this.weeksPerMonth = weeksPerMonth;
      this.getPlanningDataByRestaurant(selectedDate);
      this.sessionService.setLastSelectedDate(this.dateService.formatDateTo(selectedDate, 'YYYY-MM-DD'));

    }, () => {
    });
  }

  private async changeState(state, planning): Promise<void> {
    if (state.checked) {
      this.planningService.lockPlanning(planning.uuidPlanning, this.sessionService.getUuidUser()).subscribe();
      this.weekObject.planning.uuidUser = this.sessionService.getUuidUser();
      this.getAllGuiAlarmeByRestaurant(this.sessionService.getUuidRestaurant());
    } else {
      if (this.sessionService.getProfil() === 'superviseur' || this.sessionService.getProfil() === 'franchise' || planning.uuidUser === this.sessionService.getUuidUser()
        || (this.sessionService.getProfil() === 'administrateur' || this.sessionService.isDirector())) {
        this.planningService.unlockPlanning(planning.uuidPlanning).subscribe();
      }
    }
  }

  /**
   * recuperer la liste des alarmes par uuid restaurant
   * @param restaurantUuid
   */
  private getAllGuiAlarmeByRestaurant(restaurantUuid: string) {
    this.alarmeService.getAllGuiAlarmeByRestaurant(restaurantUuid).subscribe(
      (data: GuiAlarme[]) => {
        this.restaurantNameService.setListGuiAlarme(this.alarmeService.getAllPresentGuiAlarmeOrderByPriorite(data));
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  public async showPopUpLock(planning: any) {
    if (this.lock) {
      const user: MyRhisUserModel = await this.utilisateurService.getUserByUuid(planning.uuidUser).toPromise();
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_MESSAGE') + user.nom + ' ' + user.prenom,
        header: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_TITLE'),
        acceptVisible: false,
        rejectVisible: false
      });
    }
  }

  private getDateToGenerateAnomalie(): string {
    let anomaliesDate: Date;
    if (this.sessionService.getDateSelected() !== 'null') {
      anomaliesDate = new Date(this.sessionService.getDateSelected());
      if ((this.getWeekNumber(anomaliesDate)) !== (+this.sessionService.getCurrentWeek())) {
        const yearSelected = +this.sessionService.getCurrentYear();
        anomaliesDate = this.firstDayOfWeek(yearSelected);
      }
    } else {
      anomaliesDate = new Date();
    }
    return this.dateService.formatToShortDate(anomaliesDate);
  }

  private setCorrectAnomalieValue(anomalieNumber: number): void {
    if (this.weekObject && this.weekObject.planning) {
      this.weekObject.planning.anomNumber = anomalieNumber;
    }
  }

  /**
   *Mobile section : verifier le parametre USEAPPLIMOBILE pour diffuser le planning
   */
  public getParamRestaurantUseAppliMobile(): void {
    this.parametreService.getParameterByRestaurantIdAndCodeParameter('USEAPPLIMOBILE').subscribe(
      (data: ParametreModel) => {
        if (data && data.valeur) {
          this.isUsingMobile = Boolean(JSON.parse(data.valeur));
        }
      }
    );
  }

  public async showPopUpDiffusion(week: any) {
    if (week.planning.mobileBroadcasted) {
      if (!week.planning.locked) {
        this.confirmationService.confirm({
          header: this.rhisTranslateService.translate('PLANNING_HOME.VERROUILLER_LE_PLANNING_TITRE') + ' ' + week.weekNumber + ' ?',
          message: this.rhisTranslateService.translate('PLANNING_HOME.VERROUILLER_LE_PLANNING_TEXTE') + ' ' + week.weekNumber + ' ?',
          acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: async () => {
            this.weekObject.planning.locked = true;
            await this.changeState({checked: true}, this.weekObject.planning);
            await this.showPopUpDiffusionAutrePlanning(week);
          },
          reject: async () => {
            this.showPopUpDiffusionAutrePlanning(week);
          }
        });
      } else {
        await this.showPopUpDiffusionAutrePlanning(week);
      }
    }
  }

  private changeStateDiffusion(state: any): void {
    this.planningService.mobileBroadcastPlanning(this.weekObject.planning.uuidPlanning, Number(state.checked)).subscribe();
  }

  public async showPopUpDiffusionAutrePlanning(week: any) {
    this.confirmationService.confirm({
      header: this.rhisTranslateService.translate('PLANNING_HOME.VERROUILLER_AUTRES_PLANNING_TITRE'),
      message: this.rhisTranslateService.translate('PLANNING_HOME.VERROUILLER_AUTRES_PLANNING_TEXTE'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      key: 'popupAutrePlanning',
      icon: 'pi pi-info-circle',
      accept: async () => {
        this.changePlanningManagerIsMobileBroadcasted(false, true);
        this.changePlanningManagerIsMobileBroadcasted(true, true);
      },
      reject: async () => {

      }
    });
  }

  public async getPlanningManagerAndLeader(): Promise<void> {
    const listManager: PlanningManagerModel[] = await this.planninManagerService.getListPlanningManagers(new Date(this.weekObject.startDate), new Date(this.weekObject.endDate), 0).toPromise();
    const listLeader: PlanningManagerModel[] = await this.planninManagerService.getListPlanningManagers(new Date(this.weekObject.startDate), new Date(this.weekObject.endDate), 1).toPromise();
    if (listManager.length === 0) {
      this.planningManagerEmpty = true;
      this.planningManagerBroadcasted = false;
    } else {
      this.planningManagerEmpty = false;
      this.planningManagerBroadcasted = listManager.map(e => e.mobileBroadcasted).indexOf(false) >= 0 ? false : true;
    }

    if (listLeader.length === 0) {
      this.planningLeaderEmpty = true;
      this.planningleaderBroadcasted = false;
    } else {
      this.planningLeaderEmpty = false;
      this.planningleaderBroadcasted = listLeader.map(e => e.mobileBroadcasted).indexOf(false) >= 0 ? false : true;
    }
  }

  public changePlanningManagerIsMobileBroadcasted(isLeader: boolean, isBroadcasted: boolean): void {
    this.planninManagerService.changePlanningManagerIsMobileBroadcasted(new Date(this.weekObject.startDate), new Date(this.weekObject.endDate), Number(isLeader), Number(isBroadcasted)).subscribe((data: any) => {
        if (!isLeader) {
          this.planningManagerBroadcasted = isBroadcasted;
        } else {
          this.planningleaderBroadcasted = isBroadcasted;
        }
      }
    )
    ;
  }
}
