import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RapportModel} from '../../../../../shared/model/rapport.model';
import {DateService} from '../../../../../shared/service/date.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {PathService} from '../../../../../shared/service/path.service';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {DisponiblitePairOrOdd} from '../../../../../shared/enumeration/disponiblitePairOrOdd';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {GroupeTravailModel} from '../../../../../shared/model/groupeTravail.model';
import {TypeEvenementModel} from '../../../../../shared/model/type.evenement.model';
import {EmployeeService} from '../../../../../modules/home/employes/service/employee.service';
import {GroupeTravailService} from '../../../../../modules/home/configuration/service/groupe-travail.service';
import {TypeEvenementService} from '../../../../../modules/home/configuration/service/type.evenement.service';
import * as moment from 'moment';
import {RapportStorageService} from '../../../../service/rapport-storage.service';
import {RemoveItemLocalStorageService} from '../../../../service/remove-item-local-storage.service';
import {SessionService} from '../../../../service/session.service';

@Component({
  selector: 'rhis-popup-rapports',
  templateUrl: './popup-rapports.component.html',
  styleUrls: ['./popup-rapports.component.scss']
})
export class PopupRapportsComponent implements OnInit {

  public selectedRapport: RapportModel;
  public ANOMALIE_GDH = 'ANOMALIE_RAPPORT';
  public PLANNING_EMPLOYEE = 'PLG_EMPLOYE_RAPPORT';
  public SERVICE_A_PRENDRE = 'SERVICE_A_PRENDRE_RAPPORT';
  public DETAILS_PERIODE = 'DETAILS_PERIODE_RAPPORT';
  public COMPTEURS_EMPLOYES = 'COMPTEURS_EMPLOYES_RAPPORT';
  public RAPPORT_OPERATIONNEL = 'RAPPORT_OPERATIONNEL';
  public PLG_RAPPORT_JOURNALIER = 'PLG_RAPPORT_JOURNALIER';
  public RESUME_PLANNING = 'RESUME_PLANNING_RAPPORT';
  public RAPPORT_CORRECTION = 'CORRECTION_RAPPORT';
  public DISPONIBILITES_RAPPORT = 'DISPONIBILITES_RAPPORT';
  public ABSENCES_RAPPORT = 'ABSENCES_RAPPORT';
  public COMPETENCES_RAPPORT = 'COMPETENCES_RAPPORT';
  public PLANNING_MANAGERS = 'PLG_MANAGER_RAPPORT';
  public VACANCES_RAPPORT = 'VACANCES_RAPPORT';
  public PLANNING_POSTE_TRAVAIL = 'POSTE_TRAVAIL_RAPPORT';
  public dateDebut: Date;
  public dateFin: Date;
  public maxDate: Date;
  public selectAllEmployees = true;
  public values: Date[];
  public selectedDate: Date;
  public premierJourDeLaSemaine: JourSemaine;
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public weekSelected;
  public firstDayAsInteger = 0;
  public listPairAndOdd: DisponiblitePairOrOdd [] = [];
  public upDate = false;

  public dateDebutError = false;
  public dateFinError = false;
  public dateCompEmpError = false;
  public correctDateError = false;
  public weekDatesError = false;
  public monthDatesError = false;
  public motifAbsenceError = false;
  public rapportAbsenceEmployeeError = false;
  public rapportEmpEmployeeError = false;
  public rapportAbsenceGrpTrvError = false;
  public rapportEmpGrpTrvError = false;
  public datePosteTravailError = false;
  public listEmployee: EmployeeModel[] = [];
  public choosenEmployee: EmployeeModel = new EmployeeModel();
  public allEmployeesLabel = '';
  public disablePlgEmpRadioButton = true;
  public sortingCriteriaList = [
    {name: this.rhisTranslateService.translate('EMPLOYEE.NOM'), code: 'nom'},
    {name: this.rhisTranslateService.translate('EMPLOYEE.PRENOM'), code: 'prenom'},
    {name: this.rhisTranslateService.translate('EMPLOYEE.MATRICULE'), code: 'matricule'},
    {name: this.rhisTranslateService.translate('EMPLOYEE.BADGE'), code: 'badge'}];
  public selectedCriteria = this.sortingCriteriaList[0];
  public groupeTravailList = [
    {name: this.rhisTranslateService.translate('PARAM_PLANNING.TAUX_MOYEN_EQUIPIER'), code: 'EQUIPIER'},
    {name: this.rhisTranslateService.translate('PARAM_PLANNING.TAUX_MOYEN_MANAGER'), code: 'MANAGER'},
    {name: this.rhisTranslateService.translate('REPORT.ALL'), code: 'ALL'}];
  public selectedGroup = this.groupeTravailList[0];
  public rapportDisponibilitesTypeList = [
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.DISPONIBILITIES_CONTRACT'), code: 'contrat'},
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.REMAINING_DISPONIBILITIES'), code: 'restantes'},
  ];
  public selectedRapportDisponibilitesType = this.rapportDisponibilitesTypeList[0];
  public planningJournalierTitle = '';
  public motifAbsences: { label: string, value: { name: string, code: string } }[] = [];
  public selectedMotifAbsences: { label: string, value: { name: string, code: string } }[] = [];
  public employees: { label: string, value: { name: string, code: string } }[] = [];
  public selectedEmployees: { label: string, value: { name: string, code: string } }[] = [];
  public selectedPeEmployees: { label: string, value: { name: string, code: string } }[] = [];
  public groupesTravail: { label: string, value: { name: string, code: string } }[] = [];
  public selectedGroupesTravail: { label: string, value: { name: string, code: string } }[] = [];
  public selectedPeGroupesTravail: { label: string, value: { name: string, code: string } }[] = [];
  public rappAbsRadioButtonSelectedValue = 'employee';
  public rappEmpRadioButtonSelectedValue = 'employee';
  public weekMonthSelectedValue = 'week';
  public rappOpRadioButtonSelectedValue = 'hundredth';
  public managerLeaderList = [
    {name: this.rhisTranslateService.translate('PARAM_PLANNING.TAUX_MOYEN_MANAGER'), code: 'MANAGER'},
    {name: this.rhisTranslateService.translate('PLANNING_LEADER.MANAGER'), code: 'LEADER'},
    {name: this.rhisTranslateService.translate('REPORT.ALL'), code: 'ALL'}];
  public selectedManagerLeader = this.managerLeaderList[2];
  public monthlyChecked: boolean;
  @Output()
  public generateRapportEvent = new EventEmitter();
  @Output()
  public generateExcel = new EventEmitter();
  @Output()
  public getListEmployeeEvent = new EventEmitter();
  @Output()
  public getListEmployeeActifEvent = new EventEmitter();
  @Output() public openPopup = new EventEmitter();

  public checked = false;
  public minutesOrCentieme = false ;

  public checkedJourSemainePosteTravail = false;
  public PosteTravailDecoupage = [
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.DECOUPAGE_15_MINUTES'), valeur: '15'},
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.DECOUPAGE_30_MINUTES'), valeur: '30'},
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.DECOUPAGE_1_HEURE'), valeur: '60'}
  ];
  public selectedDecoupagePT = this.PosteTravailDecoupage[2];
  /**
   * Date choisie pour le calendrier
   */
  public calendarDate: Date;

  public periodeAnaliser = [
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.SEMAINE'), code: 'SEMAINE'},
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.MENSUEL'), code: 'MENSUEL'},
    {name: this.rhisTranslateService.translate('POPUP_RAPPORT.PERIODE'), code: 'PERIODE'}
  ];

  public selectedPeriod = this.periodeAnaliser[0];

  public dateJourprecedent: Date;

  constructor(private dateService: DateService,
              private pathService: PathService,
              private rhisTranslateService: RhisTranslateService,
              private sharedRestaurant: SharedRestaurantService,
              private employeeService: EmployeeService,
              private groupeTravailService: GroupeTravailService,
              private typeEvenementService: TypeEvenementService,
              private rapportStorageService: RapportStorageService,
              private removeItemLocalStorageService: RemoveItemLocalStorageService,
              private sessionService: SessionService) {
  }

  @Input()
  public set initSelectedRapport(selectedRapport: RapportModel) {
    this.selectedRapport = selectedRapport;
    this.selectedDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
  }

  @Input()
  public set initListEmployee(listEmployee: EmployeeModel[]) {
    this.listEmployee = [];
    this.listEmployee.push(new EmployeeModel());
    this.listEmployee = this.listEmployee.concat(listEmployee);
  }

  @Input()
  public set initAllEmployeeLabel(allEmployeesLabel: string) {
    this.allEmployeesLabel = allEmployeesLabel;
  }

  @Input()
  public set initFirstDayOfWeekend(firstDayOfWeekend: JourSemaine) {
    this.premierJourDeLaSemaine = firstDayOfWeekend;
  }

  @Input()
  public set initDateDisplay(dateDisplay: Date) {
    if (dateDisplay) {
      this.selectDate(dateDisplay);
    }
  }

  @Input()
  public set initManagerOrLeader(hasPlanningLeader: number) {
    if (hasPlanningLeader !== null && hasPlanningLeader !== undefined) {
      this.selectedManagerLeader = hasPlanningLeader === 1 ? this.managerLeaderList[1] : this.managerLeaderList[0];
    }
  }

  public iniSelectedPeEmployees(event?:any) {
    this.selectedPeEmployees = [];
  }
  public async ngOnInit(): Promise<void> {
    this.premierJourDeLaSemaine = await this.sharedRestaurant.getWeekFirstDay();
    this.firstDayAsInteger = await this.sharedRestaurant.getWeekFirstDayRank();
    this.planningJournalierTitle = this.rhisTranslateService.translate('REPORT.RAPPORT_JOURNALIER_TITLE');
    if (this.selectedRapport.codeName === this.ABSENCES_RAPPORT || this.selectedRapport.codeName === this.VACANCES_RAPPORT) {
      this.employeeService.findActiveEmployeeByRestaurant().subscribe(
        (data: EmployeeModel[]) => {
          data.map(d => {
            this.employees.push({label: d.prenom + ' ' + d.nom, value: {name: d.prenom + ' ' + d.nom, code: d.idEmployee.toString()}});
          });
        },
        (err: any) => {
          // TODO gestion erreur
          console.log(err);
        }
      );
      this.groupeTravailService.getAllGroupTravailByRestaurant().subscribe(
        (data: GroupeTravailModel[]) => {
          data.map(d => {
            this.groupesTravail.push({label: d.libelle, value: {name: d.libelle, code: d.idGroupeTravail}});
          });
        }, (err: any) => {
        }
      );
      this.typeEvenementService.getAllTypeEvenementByRestaurant().subscribe(
        (typesEvenement: TypeEvenementModel[]) => typesEvenement.map(d => {
          this.motifAbsences.push({label: d.libelle, value: {name: d.libelle, code: d.code}});
        }),
        _ => console.log
      );
    }
    this.getDataFromLocalStorage();
  }

  /**
   * recuperer la semmaine selon la date choisi par utlisateur
   * @param :date
   */
  public selectDate(date, filter?) {
    if (date) {
      this.selectedPeEmployees = [];
      this.weekDatesError = false;
      this.values = [];
      let start = new Date(date);
      start = new Date(date.getTime() - (this.findDecalage(start) * this.ONE_DAY_IN_MILLISECONDS));
      this.values[0] = start;
      this.dateDebut = start;
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      this.values[1] = end;
      this.dateFin = end;
      if (!filter) {
        this.weekSelected = this.getWeekNumber(start);
        // this.saveContentAfterChangeDate();
      } else {
        // this.getListPlanningManagers();
      }
      if (this.selectedRapport.codeName === this.PLANNING_EMPLOYEE) {
        this.getActiveEmployeesBetweenTwoDates();
      }
    } else {
      this.weekDatesError = true;
    }
  }

  /**
   * recuperer le mois selon la date choisi par utlisateur
   */
  public selectMonthDate(date) {
    if (date) {
      this.selectedPeEmployees = [];
      this.monthDatesError = false;
      const start = new Date(date);
      this.dateDebut = new Date(date);
      this.dateFin = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      if (this.selectedRapport.codeName === this.PLANNING_EMPLOYEE) {
        this.getActiveEmployeesBetweenTwoDates();
      }
    } else {
      this.monthDatesError = true;
    }
  }

  public selectMonthDateDebut(date) {
    if (date) {
      this.monthDatesError = false;
      this.dateDebut = new Date(date);
      this.dateFin = null;
    } else {
      this.monthDatesError = true;
    }
  }

  public selectMonthDateFin(date) {
    if (date) {
      this.monthDatesError = false;
      this.dateFin = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else {
      this.monthDatesError = true;
    }
  }

  public resetDates() {
    this.dateDebut = null;
    this.dateFin = null;
    this.selectedEmployees = [];
  }

  public setMaxDate() {
    if (this.dateDebut) {
      this.maxDate = new Date(this.dateDebut);
      if (!this.monthlyChecked) {
        this.maxDate.setDate(this.dateDebut.getDate() + 31);
      } else {
        this.maxDate.setMonth(this.dateDebut.getMonth() + 11);
        console.log(this.maxDate);
      }
    }
  }

  public getDataFromLocalStorage() {
    switch (this.selectedRapport.codeName) {
      case this.ANOMALIE_GDH: {
        this.selectAllEmployees = this.rapportStorageService.getPdfAnomalieSettings().selectAllEmployees;
        this.choosenEmployee = this.rapportStorageService.getPdfAnomalieSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfAnomalieSettings().uuidEmployee : [];
        break;
      }
      case this.COMPTEURS_EMPLOYES: {
        this.checked = this.rapportStorageService.getPdfCompteursEmployesSettings().checked;
        this.selectedPeriod = this.rapportStorageService.getPdfCompteursEmployesSettings().periodeAnalysee;
        this.selectedCriteria = this.rapportStorageService.getPdfCompteursEmployesSettings().sortingCriteria;
        break;
      }
      case this.DETAILS_PERIODE: {
        this.rappEmpRadioButtonSelectedValue = this.rapportStorageService.getPdfDetailsPeriodeSettings().employeeOrGroupTravail;
        if (this.rappEmpRadioButtonSelectedValue === 'groupeTravail') {
          this.selectedGroup = this.rapportStorageService.getPdfDetailsPeriodeSettings().groupeTravail;
        }
        this.minutesOrCentieme = this.rapportStorageService.getPdfDetailsPeriodeSettings().minutesOrCentieme;
        break;
      }
      case this.DISPONIBILITES_RAPPORT: {
        this.selectedRapportDisponibilitesType = this.rapportStorageService.getPdfDisponibilitesSettings().type;
        this.selectedCriteria = this.rapportStorageService.getPdfDisponibilitesSettings().sortingCriteria;
        break;
      }
      case this.RAPPORT_OPERATIONNEL: {
        this.selectedGroup = this.rapportStorageService.getPdfRapportOperationnelSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfRapportOperationnelSettings().groupeTravail : [];
        this.selectedCriteria = this.rapportStorageService.getPdfRapportOperationnelSettings().sortingCriteria;
        this.rappOpRadioButtonSelectedValue = this.rapportStorageService.getPdfRapportOperationnelSettings().hundredth;
        break;
      }
      case this.PLANNING_EMPLOYEE: {
        this.monthlyChecked = this.rapportStorageService.getPdfPlanningEmployeeSettings().mensuel;
        this.selectedCriteria = this.rapportStorageService.getPdfPlanningEmployeeSettings().sortingCriteria;
        this.rappEmpRadioButtonSelectedValue = this.rapportStorageService.getPdfPlanningEmployeeSettings().affichageEmployee;
        this.selectedPeEmployees = this.rapportStorageService.getPdfPlanningEmployeeSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfPlanningEmployeeSettings().employeeIds : [];
        this.selectedPeGroupesTravail = this.rapportStorageService.getPdfPlanningEmployeeSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfPlanningEmployeeSettings().groupeTravailIds : [];
        break;
      }
      case this.ABSENCES_RAPPORT: {
        this.selectedCriteria = this.rapportStorageService.getPdfAbsencesSettings().sortingCriteria;
        this.selectedMotifAbsences = this.rapportStorageService.getPdfAbsencesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfAbsencesSettings().motifAbsence : [];
        this.rappAbsRadioButtonSelectedValue = this.rapportStorageService.getPdfAbsencesSettings().rappAbsRadioButtonSelectedValue;
        this.selectedEmployees = this.rapportStorageService.getPdfAbsencesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfAbsencesSettings().employeeIds : [];
        this.selectedGroupesTravail = this.rapportStorageService.getPdfAbsencesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfAbsencesSettings().groupeTravailIds : [];
        break;
      }
      case this.PLANNING_MANAGERS: {
        this.weekMonthSelectedValue = this.rapportStorageService.getPdfPlanningManagerSettings().weekMonthSelectedValue;
        this.selectedManagerLeader = this.rapportStorageService.getPdfPlanningManagerSettings().managerOrLeader;
        this.selectedCriteria = this.rapportStorageService.getPdfPlanningManagerSettings().sortingCriteria;
        break;
      }
      case this.VACANCES_RAPPORT: {
        this.monthlyChecked = this.rapportStorageService.getPdfVacancesSettings().mensuel;
        this.selectedCriteria = this.rapportStorageService.getPdfVacancesSettings().sortingCriteria;
        this.selectedMotifAbsences = this.rapportStorageService.getPdfVacancesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfVacancesSettings().motifAbsence : [];
        this.rappAbsRadioButtonSelectedValue = this.rapportStorageService.getPdfVacancesSettings().employeeAffichage;
        this.selectedEmployees = this.rapportStorageService.getPdfVacancesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfVacancesSettings().employeeId : [];
        this.selectedGroupesTravail = this.rapportStorageService.getPdfVacancesSettings().uuidRestaurant === this.sessionService.getUuidRestaurant() ? this.rapportStorageService.getPdfVacancesSettings().groupTravailId : [];
        break;
      }
    }
  }

  openClosePopup(event: any) {
    this.openPopup.emit(event);
  }

  public generateRapport(): void {
    if (this.canGenerateRapport()) {
      switch (this.selectedRapport.codeName) {
        case this.ANOMALIE_GDH: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            uuidEmployee: this.choosenEmployee.uuid,
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin)
          });
          const data = {
            selectAllEmployees: this.selectAllEmployees,
            uuidEmployee: this.choosenEmployee,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfAnomalieSettings(data);
          break;
        }
        case this.PLANNING_EMPLOYEE: {
          const employeeIds = (this.rappEmpRadioButtonSelectedValue === 'employee') ? this.selectedPeEmployees : [];
          const groupeTravailIds = (this.rappEmpRadioButtonSelectedValue === 'groupeTravail') ? this.selectedPeGroupesTravail : [];
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            sortingCriteria: this.selectedCriteria.code,
            employeeIds,
            groupeTravailIds
          });
          const data = {
            mensuel: this.monthlyChecked,
            sortingCriteria: this.selectedCriteria,
            affichageEmployee: this.rappEmpRadioButtonSelectedValue,
            employeeIds: this.selectedPeEmployees,
            groupeTravailIds: this.selectedPeGroupesTravail,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfPlanningEmployeeSettings(data);
          break;
        }
        case this.SERVICE_A_PRENDRE: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin)
          });
          break;
        }
        case this.DETAILS_PERIODE: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            groupeTravail: this.selectedGroup.code,
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            minutesOrCentieme: this.minutesOrCentieme,
            employeeOrGroupTravail: this.rappEmpRadioButtonSelectedValue,
            listEmployee : this.selectedPeEmployees
          });
          const data = {
            groupeTravail: this.selectedGroup,
            uuidRestaurant: this.sessionService.getUuidRestaurant(),
            minutesOrCentieme: this.minutesOrCentieme,
            employeeOrGroupTravail: this.rappEmpRadioButtonSelectedValue
          };
          this.rapportStorageService.setPdfDetailsPeriodeSettings(data);
          break;
        }
        case this.COMPTEURS_EMPLOYES: {
          if (!this.checked) {
            this.generateRapportEvent.emit({
              uuidRestaurant: this.pathService.getUuidRestaurant(),
              date: this.dateService.formatToShortDate(this.dateJourprecedent),
              sortingCriteria: this.selectedCriteria.code
            });
          } else {
            this.generateExcel.emit({
              uuidRestaurant: this.pathService.getUuidRestaurant(),
              periodeAnalyser: this.selectedPeriod.code,
              date: this.dateService.formatToShortDate(this.dateJourprecedent),
              sortingCriteria: this.selectedCriteria.code
            });
          }
          const data = {
            checked: this.checked,
            periodeAnalysee: this.selectedPeriod,
            sortingCriteria: this.selectedCriteria
          };
          this.rapportStorageService.setPdfCompteursEmployesSettings(data);
          break;
        }
        case this.RAPPORT_OPERATIONNEL: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            groupeTravail: this.selectedGroup.code,
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            sortingCriteria: this.selectedCriteria.code,
            hundredth: this.rappOpRadioButtonSelectedValue !== 'hour'
          });
          const data = {
            groupeTravail: this.selectedGroup,
            sortingCriteria: this.selectedCriteria,
            hundredth: this.rappOpRadioButtonSelectedValue,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfRapportOperationnelSettings(data);
          break;
        }
        case this.RESUME_PLANNING: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin)
          });
          break;
        }
        case this.RAPPORT_CORRECTION: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateJournee: this.dateService.formatToShortDate(this.selectedDate)
          });
          break;
        }
        case this.DISPONIBILITES_RAPPORT: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            type: this.selectedRapportDisponibilitesType.code,
            sortingCriteria: this.selectedCriteria.code
          });
          const data = {
            type: this.selectedRapportDisponibilitesType,
            sortingCriteria: this.selectedCriteria
          };
          this.rapportStorageService.setPdfDisponibilites(data);
          break;
        }
        case this.ABSENCES_RAPPORT: {
          const employeeIds = (this.rappAbsRadioButtonSelectedValue === 'employee') ? this.selectedEmployees : [];
          const groupeTravailIds = (this.rappAbsRadioButtonSelectedValue === 'groupeTravail') ? this.selectedGroupesTravail : [];
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            sortingCriteria: this.selectedCriteria.code,
            motifAbsence: this.selectedMotifAbsences,
            employeeIds,
            groupeTravailIds
          });
          const data = {
            sortingCriteria: this.selectedCriteria,
            motifAbsence: this.selectedMotifAbsences,
            rappAbsRadioButtonSelectedValue: this.rappAbsRadioButtonSelectedValue,
            employeeIds: this.selectedEmployees,
            groupeTravailIds: this.selectedGroupesTravail,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfAbsences(data);
          break;
        }
        case this.COMPETENCES_RAPPORT: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant()
          });
          break;
        }
        case this.PLANNING_MANAGERS: {
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            managerOrLeader: this.selectedManagerLeader.code,
            sortingCriteria: this.selectedCriteria.code
          });
          const data = {
            weekMonthSelectedValue: this.weekMonthSelectedValue,
            managerOrLeader: this.selectedManagerLeader,
            sortingCriteria: this.selectedCriteria,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfPlanningManagersSettings(data);
          break;
        }
        case this.PLANNING_POSTE_TRAVAIL: {
          const uuidRestaurant = this.sessionService.getUuidRestaurant();

          const vue = !this.checkedJourSemainePosteTravail ? 'jour' : 'semaine';
          const dateDebut = !this.checkedJourSemainePosteTravail ? this.dateJourprecedent : this.values[0];
          const dateFin = !this.checkedJourSemainePosteTravail ? this.dateJourprecedent : this.values[1];
          const decoupage = !this.checkedJourSemainePosteTravail ? this.selectedDecoupagePT.valeur : null;
          this.generateExcel.emit({
              rapport: this.PLANNING_POSTE_TRAVAIL,
              uuidsRestaurants: uuidRestaurant,
              vue, dateDebut : this.dateService.formatToShortDate(dateDebut),
              dateFin : this.dateService.formatToShortDate(dateFin), decoupage
            }
          );
          break;
        }
        case this.VACANCES_RAPPORT: {
          const employeeIds = (this.rappAbsRadioButtonSelectedValue === 'employee') ? this.selectedEmployees : [];
          const groupeTravailIds = (this.rappAbsRadioButtonSelectedValue === 'groupeTravail') ? this.selectedGroupesTravail : [];
          this.generateRapportEvent.emit({
            uuidRestaurant: this.pathService.getUuidRestaurant(),
            dateDebut: this.dateService.formatToShortDate(this.dateDebut),
            dateFin: this.dateService.formatToShortDate(this.dateFin),
            sortingCriteria: this.selectedCriteria.code,
            motifAbsence: this.selectedMotifAbsences,
            employeeIds,
            groupeTravailIds
          });
          const data = {
            mensuel: this.monthlyChecked,
            sortingCriteria: this.selectedCriteria,
            motifAbsence: this.selectedMotifAbsences,
            employeeAffichage: this.rappAbsRadioButtonSelectedValue,
            employeeId: this.selectedEmployees,
            groupTravailId: this.selectedGroupesTravail,
            uuidRestaurant: this.sessionService.getUuidRestaurant()
          };
          this.rapportStorageService.setPdfVacancesSettings(data);
          break;
        }
      }
    }
  }

  public checkWeekBordersExist(): void {
    this.weekDatesError = !(!!this.values);
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
   * recuperer le list de planning manager du semaine precedente
   */
  public downWeekDate(): void {
    if (this.values) {
      this.selectedPeEmployees = [];
      const [start, end] = this.values;
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() - 7);
      this.values = [start, end];
      if (this.selectedRapport.codeName === this.PLANNING_EMPLOYEE) {
        this.getActiveEmployeesBetweenTwoDates();
      }
    }
    // this.saveContentAfterChangeDate();
  }

  /**
   *recuperer le list de planning manager du semaine suivante
   */
  public upWeekDate(): void {
    this.upDate = true;
    if (this.values) {
      this.selectedPeEmployees = [];
      const [start, end] = this.values;
      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);
      this.values = [start, end];
      if (this.selectedRapport.codeName === this.PLANNING_EMPLOYEE) {
        this.getActiveEmployeesBetweenTwoDates();
      }
    }
    // this.saveContentAfterChangeDate();
  }

  private getActiveEmployeesBetweenTwoDates() {
    if (this.selectedRapport.codeName === this.DETAILS_PERIODE) {
      this.employeeService.findAllEmployeesBetweenTwoDates(this.dateService.formatToShortDate(this.dateDebut), this.dateService.formatToShortDate(this.dateFin)).subscribe(
        (data: any) => {
          this.employees = [];
          data.map(d => {
            this.employees.push({label: d.prenom + ' ' + d.nom, value: d});
          });
        },
        (err: any) => {
          // TODO gestion erreur
          console.log(err);
        }
      );
    } else {
      this.employeeService.findActiveEmployeeHasPlgEquipByRestaurantBetweenTwoDates(this.dateService.formatToShortDate(this.dateDebut),
        this.dateService.formatToShortDate(this.dateFin)).subscribe(
        (data: EmployeeModel[]) => {
          this.employees = [];
          data.map(d => {
            this.employees.push({label: d.prenom + ' ' + d.nom, value: {name: d.prenom + ' ' + d.nom, code: d.idEmployee.toString()}});
          });
          this.disablePlgEmpRadioButton = false;
        },
        (err: any) => {
          // TODO gestion erreur
          console.log(err);
        }
      );
      this.groupeTravailService.getAllGroupTravailByRestaurant().subscribe(
        (data: GroupeTravailModel[]) => {
          data.map(d => {
            this.groupesTravail.push({label: d.libelle, value: {name: d.libelle, code: d.idGroupeTravail}});
          });
        }, (err: any) => {
        }
      );
    }
  }

  public onSelectEmployee(): void {
    this.selectAllEmployees = this.choosenEmployee.idEmployee === 0;
  }

  public onSelectAllEmployees(): void {
    this.choosenEmployee = this.listEmployee[0];
  }

  public getListEmployee(): void {
    this.resetErrorLabel();
    this.selectedEmployees = [];
    if (this.dateDebut && this.dateFin) {
      this.correctDateError = this.dateDebut > this.dateFin;
      if (!this.correctDateError) {
        this.employees.splice(0, this.employees.length);

        this.employeeService.findAllEmployeesBetweenTwoDates(this.dateService.formatToShortDate(this.dateDebut),
          this.dateService.formatToShortDate(this.dateFin)).subscribe(
          (data: EmployeeModel[]) => {
            data.map(d => {
              this.employees.push({label: d.prenom + ' ' + d.nom, value: {name: d.prenom + ' ' + d.nom, code: d.idEmployee.toString()}});
            });
          },
          (err: any) => {
            // TODO gestion erreur
            console.log(err);
          }
        );
      }
    } else {
      this.correctDateError = false;
    }
  }

  public getListEmployeePointage(): void {
    this.resetErrorLabel();
    if (this.dateDebut && this.dateFin) {
      this.correctDateError = this.dateDebut > this.dateFin;
      if (!this.correctDateError) {
        this.getListEmployeeEvent.emit({
          dateDebut: this.dateService.formatToShortDate(this.dateDebut),
          dateFin: this.dateService.formatToShortDate(this.dateFin)
        });
      }
    } else {
      this.correctDateError = false;
    }
  }

  public checkCompteursEmployeeError(date: Date): void {
    this.dateCompEmpError = !(!!date);
  }

  public recupereDateSwitch() {
    this.dateCompEmpError = false;
    this.dateJourprecedent = this.checked ? moment().add(-1, 'days').toDate() : null;
  }

  public checkDetailsPeriodeDates(): void {
    this.selectedPeEmployees = [];
    this.resetErrorLabel();
    if (this.dateDebut && this.dateFin) {
      this.correctDateError = this.dateDebut > this.dateFin;
      if (!this.correctDateError) {
        this.getActiveEmployeesBetweenTwoDates();
      }
    } else {
      this.correctDateError = false;
    }
  }

  public checkRapportAbsencesMotif(): void {
    if (this.selectedMotifAbsences.length > 0) {
      this.motifAbsenceError = false;
    }
  }

  public checkRapportAbsencesEmployees(): void {
    if (this.selectedEmployees.length > 0) {
      this.rapportAbsenceEmployeeError = false;
    }
  }

  public checkRapportPeEmployees(): void {
    if (this.selectedPeEmployees.length > 0) {
      this.rapportEmpEmployeeError = false;
    }
  }

  public checkRapportAbsencesGrpTrv(): void {
    if (this.selectedGroupesTravail.length > 0) {
      this.rapportAbsenceGrpTrvError = false;
    }
  }

  public checkRapportPeGrpTrv(): void {
    if (this.selectedPeGroupesTravail.length > 0) {
      this.rapportEmpGrpTrvError = false;
    }
  }

  /**
   * recupere semaine de date selectioné
   * @param: date
   */
  private getWeekNumber(dateSelected: any): number {
    const dateDisplay = new Date(Date.UTC(dateSelected.getFullYear(), dateSelected.getMonth(), dateSelected.getDate()));
    const dayNum = dateDisplay.getUTCDay() || 7;
    dateDisplay.setUTCDate(dateDisplay.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dateDisplay.getUTCFullYear(), 0, this.firstDayAsInteger));
    const weekNo = Math.ceil((((+dateDisplay - (+yearStart)) / 86400000) + this.firstDayAsInteger) / 7);
    this.getWeekPairOrOdd(weekNo);
    return weekNo;
  }

  /**
   * savoir si le numweek est paire ou impaire
   * @param numWeek numéro de la semaine
   */
  private getWeekPairOrOdd(numWeek: number): void {
    this.listPairAndOdd = [];
    if (numWeek % 2 === 0) {
      this.listPairAndOdd.push(DisponiblitePairOrOdd.PAIR);
    } else {
      this.listPairAndOdd.push(DisponiblitePairOrOdd.ODD);
    }
  }

  private resetErrorLabel(): void {
    if (this.dateDebut) {
      this.dateDebutError = false;
    }
    if (this.dateFin) {
      this.dateFinError = false;
    }
  }

  private canGenerateRapport(): boolean {
    this.dateDebutError = !this.dateDebut;
    this.dateFinError = !this.dateFin;
    this.dateCompEmpError = !this.dateJourprecedent;
    this.weekDatesError = !(!!this.values);
    this.motifAbsenceError = !this.selectedMotifAbsences || this.selectedMotifAbsences.length === 0;
    this.rapportAbsenceEmployeeError = !this.selectedEmployees || this.selectedEmployees.length === 0;
    this.rapportAbsenceGrpTrvError = !this.selectedGroupesTravail || this.selectedGroupesTravail.length === 0;
    this.rapportEmpEmployeeError = !this.selectedPeEmployees || this.selectedPeEmployees.length === 0;
    this.rapportEmpGrpTrvError = !this.selectedPeGroupesTravail || this.selectedPeGroupesTravail.length === 0;
    if (this.dateDebut && this.dateFin) {
      this.correctDateError = this.dateDebut > this.dateFin;
    } else {
      this.correctDateError = false;
    }
    if (this.ABSENCES_RAPPORT === this.selectedRapport.codeName || this.VACANCES_RAPPORT === this.selectedRapport.codeName) {
      if (this.rappAbsRadioButtonSelectedValue === 'employee') {
        return !this.motifAbsenceError && !this.rapportAbsenceEmployeeError;
      } else if (this.rappAbsRadioButtonSelectedValue === 'groupeTravail') {
        return !this.motifAbsenceError && !this.rapportAbsenceGrpTrvError;
      }
    }
    if (this.DETAILS_PERIODE === this.selectedRapport.codeName) {
      if (this.rappEmpRadioButtonSelectedValue === 'employee') {
        return !this.rapportEmpEmployeeError;
      }
    }
    if (this.PLANNING_EMPLOYEE === this.selectedRapport.codeName) {
      if (this.rappEmpRadioButtonSelectedValue === 'employee') {
        return !this.rapportEmpEmployeeError;
      } else if (this.rappEmpRadioButtonSelectedValue === 'groupeTravail') {
        return !this.rapportEmpGrpTrvError;
      }
    }
    if (this.selectedRapport.codeName === this.PLANNING_POSTE_TRAVAIL) {
      if (!this.checkedJourSemainePosteTravail) {
        return !!this.dateJourprecedent;
      } else {
        return !!this.values;
      }
    }

    if (![this.COMPTEURS_EMPLOYES, this.SERVICE_A_PRENDRE, this.PLANNING_EMPLOYEE, this.RAPPORT_OPERATIONNEL,
      this.RAPPORT_CORRECTION, this.DISPONIBILITES_RAPPORT, this.COMPETENCES_RAPPORT].includes(this.selectedRapport.codeName)) {
      return (!this.dateDebutError && !this.dateFinError && !this.correctDateError);
    } else if (this.COMPTEURS_EMPLOYES === this.selectedRapport.codeName) {
      return !this.dateCompEmpError;
    } else if (this.RAPPORT_CORRECTION === this.selectedRapport.codeName) {
      return !!this.selectedDate;
    } else if (this.selectedRapport.codeName === this.COMPETENCES_RAPPORT) {
      return true;
    } else if (this.selectedRapport.codeName === this.PLANNING_MANAGERS && this.weekMonthSelectedValue === 'month') {
      return !this.monthDatesError;
    } else {
      return !this.weekDatesError;
    }
  }

  public alignSizes(): void {
    const parent = document.getElementById('RAPPORT_PLANNING_POSTE_TRAVAIL');
    const elementsByClassNameElement = document.getElementsByClassName('ui-dropdown-panel ui-widget ui-widget-content ui-corner-all')[0] as HTMLElement;
    elementsByClassNameElement.style.width = parent.offsetWidth + 'px';
  }

}
