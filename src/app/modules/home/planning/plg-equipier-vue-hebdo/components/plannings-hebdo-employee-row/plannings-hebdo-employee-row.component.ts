import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter, HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbsenceCongeModel} from '../../../../../../shared/model/absence.conge.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {DateService} from '../../../../../../shared/service/date.service';
import * as moment from 'moment';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {PlgHebdoHelperService} from '../../services/plg-hebdo-helper.service';
import {ProposeAction} from '../../../../../../shared/enumeration/ProposeAction';
import {ListShiftsEmployes} from '../../../../../../shared/model/gui/list.shift.employes.model';
import * as rfdc from 'rfdc';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {Dropdown} from 'primeng/components/dropdown/dropdown';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: '[rhis-plannings-hebdo-employee-row]',
  templateUrl: './plannings-hebdo-employee-row.component.html',
  styleUrls: ['./plannings-hebdo-employee-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningsHebdoEmployeeRowComponent implements OnChanges {

  @Input() employee;
  @Input() listePositionTravail: PositionTravailModel [] = [];
  @Input() listEmployeeToAdd: EmployeeModel [] = [];
  @Input() empIndex: number;
  @Input() employeeList;
  @Input() newEmployeeInProgress: boolean;
  @Input() showPopAddShift;
  @Input() shiftByEmployee;
  @Input() days: any[] = [];
  @Input() public addPopupTitle: string;
  @Input() public updatePopupTitle: string;
  @Input() totalShiftInWeek;
  // error messages
  @Input() public dateDebutSupDateFinErrorMessage: string;
  @Input() public dateFinWithoutDateDebutErrorMessage: string;
  @Input() public heureDebutSupHeureFinErrorMessage: string;
  @Input() public messageConfonduShift: string;
  @Input() public startTime: string;
  @Input() public startTimeIsNight: boolean;
  @Input() public endTime: string;
  @Input() public endTimeIsNight: boolean;
  @Input() modeAffichagePlanning: any;
  @Input() listEmployeeHasShift: any;
  @Input() dateDebut: any;
  @Input() dateFin: any;
  @Input() listShiftToUpdate: any;
  @Input() public employeInactif: boolean;
  private modeAffichage: any;
  private decoupageHoraireFinEtDebutActivity: any;
  // heure debut/fin est nuit
  public limiteHeureDebut: Date;
  public isNightValue: boolean;
  public employeNotFound = '';
  /**
   * Liste des employées récupérée du BE et à envoyer au composant planning equipier
   */
  public newEmployees = [];
  private ecran = 'VPE';
  public buttonLabel: any;
  public actifLoad = true;
  public loadEditOrAdd = true;
  public selectedEmployeeName = '';
  public idSelectedEmployee: any;
  public listEmployeeForAdd = [];

  public idShiftUpdate = 0;
  public addOrUpdateShift = 0;
  public dateDislplay = null;
  public activLoader = false;
  public openDrpDown = false;
  public listShiftAssigneToEmployes: ListShiftsEmployes = {} as ListShiftsEmployes;
  public clone = rfdc();
  /**
   * Liste des employées à afficher dans la liste déroulante pour ajouter un nouvel employé
   */
  public newEmployeesToDisplay = [];
  public dayLabel: string;
  public shiftsToAssign: ShiftModel[];

  @Input()
  public set limitHeureDebut(limiteHeureDebut: Date) {
    this.limiteHeureDebut = new Date(limiteHeureDebut);
  }

  @Input() set setDecoupageValues(value: any) {
    if (value) {
      this.decoupageHoraireFinEtDebutActivity = value;
    }
  }

  public verificationNightIsRaised = false;

  public newShift: ShiftModel = new ShiftModel();
  @ViewChild('dropDown') dropDown: Dropdown;
  @Output() public shiftEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public cardDroppedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public deleteShiftCardEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public rowSelectedEmitter: EventEmitter<any> = new EventEmitter();

  @Output() public employeeAddedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public desaffecterEmployeeEmitter: EventEmitter<any> = new EventEmitter();
  @Output()
  public checkIfNightValueEvent = new EventEmitter();
  @Output()
  public initValues = new EventEmitter();
  @Output()
  public verifContrainteEmployee = new EventEmitter();
  @Output()
  public resetMessageConfonduShift = new EventEmitter();
  public selectedEmployee: EmployeeModel;
  public heureDebutLimitError = false;
  public heureFinLimitError = false;
  public heureFinLimitErrorMessage = '';
  public heureDebutLimitErrorMessage = '';
  // variable boolean qui permet d'afficher ou masquer le popup d'ajout ou d'édition
  public showPopUp = false;
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public heureDebutRequiredField = false;
  public positionTravailRequiredField = false;

  public heureFinRequiredField = false;
  public checkHeureIsNight = '';
  public congeDisplay = {} as AbsenceCongeModel;

  // titre du popup par défaut
  titlePopup = '';
  // Initialisation des détails d'un nouveau card à créer

  // messages d'erreur de l'heure et de la date
  errorHourMessage = '';
  errorDateMessage = '';

  // Valeur de la position selectionnée dans le popup lors de l'ajout ou de la modification
  selectedPosition: any;

  /**
   * Pop up style
   */
  public popUpStyle = {
    width: 550,
    height: 600
  };
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null) {
      this.isNightValue = nightValue;
      if (this.isNightValue) {
        if (this.checkHeureIsNight === 'debut') {
          this.newShift.heureDebutIsNight = true;
          // recuperation à partie par default  current date
          this.newShift.heureDebut.setDate(new Date().getDate() + 1);

        } else if (this.checkHeureIsNight === 'fin' && this.newShift.heureFin) {
          this.newShift.heureFinIsNight = true;
          this.newShift.heureFin.setDate(new Date().getDate() + 1);
        }
      } else {
        if (this.checkHeureIsNight === 'debut') {
          this.newShift.heureDebutIsNight = false;
        } else if ((this.checkHeureIsNight === 'fin')) {
          this.newShift.heureFinIsNight = false;
        }
      }
      if (this.verificationNightIsRaised) {
        this.verificationNightIsRaised = false;
      }
    }
  }

  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private contrainteSocialeService: ContrainteSocialeService,
              private domControlService: DomControlService,
              private cdRef: ChangeDetectorRef,
              private limitDecoupageService: LimitDecoupageFulldayService,
              private plgHebdoHelperService: PlgHebdoHelperService,
              private sharedRestaurant: SharedRestaurantService,
              private employeeService: EmployeeService,
              private confirmationService: ConfirmationService) {
  }

  public checkChangeDetection(): void {
    this.cdRef.detectChanges();
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  private getModeDispaly(): void {
    const limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichagePlanning, this.dateService.getDateOfEnumertionJour(this.newShift.jour), this.dateService);
    this.modeAffichage = limitDecoupageHours.updatedModeAffichage;

  }

  /**
   *  fonction qui s'exécute à chaque changement des inputs du composant

   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this.updateButtonControl()) {
      if (changes.showPopAddShift) {
        this.showPopAddShift = changes.showPopAddShift.currentValue;
        if (this.showPopAddShift) {
          this.closePopup();
        }
      }
      if (changes.days && changes.days.currentValue) {
        this.days = changes.days.currentValue;
        if (this.days.length && this.shiftByEmployee) {
          this.days.forEach((day: any) => {
            this.shiftByEmployee = this.plgHebdoHelperService.indexerShiftParJour(day.val, this.shiftByEmployee);
          });
        }
      }
      if (changes.totalShiftInWeek) {
        this.totalShiftInWeek = changes.totalShiftInWeek.currentValue;
        this.totalRowTime = this.totalShiftInWeek;
      }
      if (changes.shiftByEmployee) {
        this.shiftByEmployee = changes.shiftByEmployee.currentValue;
        if (this.days && this.days.length) {
          this.days.forEach((day: any) => {
            this.shiftByEmployee = this.plgHebdoHelperService.indexerShiftParJour(day.val, changes.shiftByEmployee.currentValue);
          });
        }
      }
      if (changes.listEmployeeHasShift) {
        this.listEmployeeHasShift = changes.listEmployeeHasShift.currentValue;

      }
      if (changes.employeeList) {
        this.employeeList = changes.employeeList.currentValue;

      }
      if (changes.employee) {

        this.employee = changes.employee.currentValue;

        if (this.employee.contrats && this.employee.contrats.length) {
          this.employee.contrats.forEach(contrat => {
            if (this.employee.absenceConges) {
              this.congeDisplay = this.employee.absenceConges[0];
            }

          });
        }
      }
      if (changes.startTime) {
        this.startTime = changes.startTime.currentValue;
        if (this.startTime) {
          const nightValue = this.startTimeIsNight;
          this.debutJourneeActivite = this.dateService.setTimeFormatHHMM(this.startTime).setDate(new Date().getDate());
          this.debutJourneeActivite = this.dateService.getDateFromIsNight(this.debutJourneeActivite, nightValue);
          this.dateService.resetSecondsAndMilliseconds(this.debutJourneeActivite);
        }
      }
      if (changes.endTime) {
        this.endTime = changes.endTime.currentValue;
        if (this.endTime) {
          const nightValue = this.endTimeIsNight;
          this.finJourneeActivite = this.dateService.setTimeFormatHHMM(this.endTime).setDate(new Date().getDate());
          this.finJourneeActivite = this.dateService.getDateFromIsNight(this.finJourneeActivite, nightValue);
          this.dateService.resetSecondsAndMilliseconds(this.finJourneeActivite);
        }
      }
    }
  }


  /**
   * affichage du popup d'ajout d'un card
   * @param: employeeDisplay
   * @param dayLabel : index du jour dans lequel on doit ajouter le card
   */
  async showAddCardForm(employeeDisplay: EmployeeModel, dayLabel) {
    this.resetMessageConfonduShift.emit();
    this.addOrUpdateShift = 1;
    this.idShiftUpdate = 0;
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    this.dayLabel = dayLabel.toUpperCase();
    this.newShift = new ShiftModel();
    this.newShift.idShift = 0;
    this.titlePopup = this.addPopupTitle;
    this.buttonLabel = this.rhisTranslateService.translate('PLANNING_EQUIPIER.ADD_BUTTON');
    this.newShift.jour = dayLabel.toUpperCase();
    this.newShift.employee = employeeDisplay;
    const newShiftDate = this.days.find((d: any) => d.val.toUpperCase() === dayLabel.toUpperCase());
    if (newShiftDate) {
      this.newShift.dateJournee = newShiftDate.dateJournee;
      this.dateDislplay = newShiftDate.dateJournee;
    }
    this.initValues.emit({employee: employeeDisplay, day: dayLabel.toUpperCase(), dateJournee : this.newShift.dateJournee});
    setTimeout(() => this.verificationShowPopPup(), 500);
    await this.getNewEmployees(0, employeeDisplay);
    this.getModeDispaly();
  }
  /**
   * le popup affiche si l'employe est actif
   */
   private verificationShowPopPup() {
    if (!this.employeInactif) {
      this.showPopUp = true;
    }
    this.checkChangeDetection();
  }
  /**
   * affichage du popup d'édition
   * @param event : contient les détails du card à éditer
   */
  public async showEditShiftCardForm(event) {
    this.addOrUpdateShift = 1;
    this.resetMessageConfonduShift.emit();
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.idShiftUpdate = event.card.idShift;
    this.dateDislplay = event.card.dateJournee;
    this.heureFinLimitError = false;
    this.initValues.emit({employee: event.employee, day: event.card.jour.toUpperCase(), dateJournee : event.card.dateJournee});
    setTimeout(() => this.verificationShowPopPup(), 500);
    this.dayLabel = event.card.jour.toUpperCase();

    this.selectedPosition = this.listePositionTravail.find((position: PositionTravailModel) => position.idPositionTravail === event.card.positionTravail.idPositionTravail);

    // const employeeToUpdate = this.newEmployees.find((emp: EmployeeModel) => emp.idEmployee === event.employee.idEmployee);
    this.selectedEmployee = event.employee;
    this.selectedEmployeeName = event.employee.prenom + ' ' + event.employee.nom;
    this.idSelectedEmployee = event.employee.idEmployee;
    if (!event.employee.idEmployee) {
      this.selectedEmployeeName = ' ';
    }
    this.titlePopup = this.updatePopupTitle;
    this.buttonLabel = this.rhisTranslateService.translate('PLANNING_EQUIPIER.UPDATE_BUTTON');

    this.newShift = {...event.card};
    await this.getNewEmployees(this.idShiftUpdate);
    this.newShift.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(new Date(), this.newShift.heureDebut), this.newShift.heureDebutIsNight);
    this.newShift.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(new Date(), this.newShift.heureFin), this.newShift.heureFinIsNight);
    this.getModeDispaly();
    this.checkChangeDetection();
  }

  public selectedEmployeeChange(employeeDisplay: EmployeeModel): void {
    let selectedEmployee = this.newEmployees.find(emp=> emp.idEmployee === employeeDisplay);
    this.initValues.emit({employee: selectedEmployee, day: this.newShift.jour, dateJournee : this.newShift.dateJournee});
  }
  /**
   * correction heure avant la vérification
   */
  private correctTimeOfBegginAndLastDayOfActivity(dateJournee: Date) {
    if (this.debutJourneeActivite) {
      this.debutJourneeActivite = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(dateJournee), this.debutJourneeActivite), this.startTimeIsNight);
      this.dateService.resetSecondsAndMilliseconds(this.debutJourneeActivite);
    }
    if (this.finJourneeActivite) {
      this.finJourneeActivite = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(dateJournee), this.finJourneeActivite), this.endTimeIsNight);
      this.dateService.resetSecondsAndMilliseconds(this.finJourneeActivite);
    }
  }
  /**
   * permet de sauvegarder le card après vérifications des heures et des dates
   * @param: event
   */
  public saveCard() {
    this.correctTimeOfBegginAndLastDayOfActivity(this.clone(this.newShift.dateJournee));
    this.dateService.setCorrectTimeToDisplayForShift(this.newShift);

    let canSave = true;
    this.addOrUpdateShift = 0;
    if (!this.selectedPosition ) {
      this.positionTravailRequiredField = true;
      canSave = false;
    }else{
      this.positionTravailRequiredField = false;

    }
    if (!this.newShift.heureDebut || !this.newShift.heureFin) {
      if (!this.newShift.heureDebut) {
        this.heureDebutRequiredField = true;
      } else {
        this.heureDebutRequiredField = false;
      }
      if (!this.newShift.heureFin) {
        this.heureFinRequiredField = true;
      } else {
        this.heureFinRequiredField = false;

      }
      canSave = false;
    } else {
      this.newShift.heureFin = this.setTimeNull(this.newShift.heureFin);
      this.newShift.heureDebut = this.setTimeNull(this.newShift.heureDebut);
      if (moment(this.newShift.heureDebut).isBefore(this.debutJourneeActivite)) {
        this.heureDebutLimitError = true;
        canSave = false;
        this.heureDebutLimitErrorMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.START_ERROR_LIMIT');
      } else {
        this.heureDebutLimitErrorMessage = '';
      }
      if (moment(this.newShift.heureFin).isAfter(this.finJourneeActivite) && this.modeAffichage === 0) {
        this.heureFinLimitError = true;
        canSave = false;
        this.heureFinLimitErrorMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.END_ERROR_LIMIT');
      } else {
        this.heureFinLimitErrorMessage = '';
      }
      this.heureDebutRequiredField = false;
      this.heureFinRequiredField = false;
    }

    // heure debut sup herue fin
    this.dateService.setCorrectTimeToDisplayForShift(this.newShift);
    if (this.newShift.heureDebut >= this.newShift.heureFin) {
      canSave = canSave && false;
      this.errorHourMessage = this.heureDebutSupHeureFinErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorHourMessage = '';
    }

    if (canSave) {
      // if dayIndex is set so we are adding a new card, else we are updating
      this.newShift.positionTravail = this.selectedPosition;
      if (this.idShiftUpdate) {
        if (this.idSelectedEmployee) {
          this.selectedEmployee = this.newEmployees.find((emp: EmployeeModel) => emp.idEmployee === this.idSelectedEmployee);
          // Check ajouté pour recupérer l'employé au cas ou il est absent
          if(!this.selectedEmployee){
            this.selectedEmployee = this.newShift.employee;
          }
        } else {
          this.selectedEmployee = this.newShift.employee;
        }
      }
      if (this.selectedEmployee && this.selectedEmployee.idEmployee) {
        if (this.selectedEmployee.idEmployee !== this.newShift.employee.idEmployee) {
          this.newShift.oldEmployee = JSON.parse(JSON.stringify(this.newShift.employee));
        }
        this.newShift.employee = this.selectedEmployee;
      } else {
        let fakeEmployee = new EmployeeModel();
        fakeEmployee.idEmployee = 0;
        this.newShift.employee = fakeEmployee;
      }
      this.dateService.setCorrectTimeToDisplayForShift(this.newShift);
      this.newShift.modifiable = this.newShift.acheval = this.checkIfShiftAcheval(this.newShift.heureFin) ? true : false;
      if (this.newShift.acheval) {
        this.newShift.heureDebutCheval = this.newShift.heureDebut;
        this.newShift.heureFinCheval = this.newShift.heureFin;
        this.newShift.heureDebutChevalIsNight = this.newShift.heureDebutIsNight;
        this.newShift.heureFinChevalIsNight = this.newShift.heureFinIsNight;
      }
      // this.initValues.emit({employee: this.selectedEmployee, day: this.dayLabel, dateJournee : this.newShift.dateJournee});
      this.shiftEmitter.emit(this.newShift);
    }
    this.selectedEmployee ? this.idSelectedEmployee = this.selectedEmployee.idEmployee : 0;
  }

  public validerHeureNuit(heureDebut: boolean) {
    let heureToVerify: Date;
    if (heureDebut) {
      this.heureDebutLimitErrorMessage = '';
      heureToVerify = this.newShift.heureDebut;
    } else {
      this.heureFinLimitErrorMessage = '';
      heureToVerify = this.newShift.heureFin;
    }
    if (heureToVerify) {
      if (heureToVerify.getHours() >= 0 && (heureToVerify.getHours() <= this.finJourneeActivite.getHours() && ((heureToVerify.getHours() < this.debutJourneeActivite.getHours()) || this.finJourneeActivite.getHours() === this.debutJourneeActivite.getHours()))) {
        if (heureDebut) {
          this.checkHeureIsNight = 'debut';
        } else {
          this.checkHeureIsNight = 'fin';
        }
        this.verificationNightIsRaised = true;
        this.checkIfNightValueEvent.emit();
      } else {
        if (heureDebut) {
          this.newShift.heureDebutIsNight = false;
        } else {
          if (this.modeAffichage === 0) {
            this.newShift.heureFinIsNight = false;
          } else if (heureToVerify.getHours() >= 0) {
            this.checkHeureIsNight = 'fin';
            this.verificationNightIsRaised = true;
            this.checkIfNightValueEvent.emit();

          }
        }
      }
    }
  }

  /**
   * vérifier si le shift acheval ou nn
   * @param heureFin
   */
  private checkIfShiftAcheval(heureFin: Date): boolean {
    return (moment(heureFin).isAfter(this.finJourneeActivite));
  }

  /**
   * permet de fermer le popup et de faire un reset des champs
   * @param: event
   */
  public closePopup(event?) {
    this.showPopUp = false;
    this.errorHourMessage = '';
    this.errorDateMessage = '';
    this.selectedPosition = '';
    this.selectedEmployee = new EmployeeModel();
    this.heureFinLimitErrorMessage = '';
    this.heureDebutLimitErrorMessage = '';
    this.addOrUpdateShift = 0;

  }

  /**
   * Lancer l'opération de suppression d'un card avec en paramètre les détails du card
   * @param: event
   */
  deleteShiftCard(event) {
    this.deleteShiftCardEmitter.emit(event);
  }

  public showConfirmDesaffecterEmployee(employee: EmployeeModel): void{
    if (!employee.isManagerOrLeader && employee.idEmployee && this.deleteButtonControl()) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.desaffecterEmploye(employee);
      },
      reject: () => {
      }
    });
    }
  }
  public desaffecterEmploye(employee: EmployeeModel): void {
    const fakeEmployee = new EmployeeModel();
    fakeEmployee.idEmployee = this.makeString();
    fakeEmployee.nom = '';
    fakeEmployee.prenom = '';

    this.desaffecterEmployeeEmitter.emit({employeeDesaffecte: employee, newFakeEmployee: fakeEmployee});
  }
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }
  /**
   * permet de selectionner une ligne entière pour la suppression
   * @param: event
   */
  public selectRow(event: any, employee: EmployeeModel) {
    if (!employee.isManagerOrLeader && employee.idEmployee) {
      let elementIsSelected = false;
      const closestTr = event.target.closest('tr');
      // impossible de selectionner une ligne si une tentative d'ajout est en cours

      if (closestTr != null) {
        elementIsSelected = closestTr.classList.contains('row-selected');
      }

      // toggle selected rows
      document.querySelectorAll('table.planning tr').forEach(element => {
        element.classList.remove('row-selected');
      });

      // si pas d'opération d'ajout en cours alors marquer la ligne comme selectionnée et récupérer son index
      if (closestTr != null && !elementIsSelected) {
        event.target.closest('tr').classList.add('row-selected');
        this.rowSelectedEmitter.emit(employee);
      } else {
        // sinon vider la valeur de la ligne selectionnée
        this.rowSelectedEmitter.emit('');
      }
    }
  }

  /**
   * en selectionnant un employée, on initialise la ligne avec les détails de cet employée
   * @param: event
   */
  onchangeEmployee() {
    // remove the employee from the list to prevent it from selection again
    this.employeeAddedEmitter.emit(this.selectedEmployee);
  }


  /**
   * convertit une chaine de caractère en un objet date
   * @param: timeString
   */
  public getDateTimeFromString(timeString) {
    const timeparts = timeString.split(':');
    const myDate = new Date();
    myDate.setHours(parseInt(timeparts[0]), parseInt(timeparts[1]));
    return (myDate);
  }

  /**
   * permet de vérifier si le total des heures du contrat a été atteint afin de changer le statut de l'icone
   */
  public isContractTimeReached() {
    return this.employee.totalRowTime >= this.employee.hebdoCourant;
  }


  // convertion la date time en date selement
  private setTimeNull(date) {
    date = new Date(date);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  /**
   * Alimenter la liste des nouveaux employés
   */
  public async getNewEmployees(idshiftUpdated?: number, employeeDisplay?: EmployeeModel) {
    this.selectedEmployee = null;
    this.employeeList = [];
    this.newEmployees = [];
    this.activLoader = true;
    let shiftsToAssign: ShiftModel[] = [];
    this.shiftsToAssign = [];
    shiftsToAssign = [];
    if (!this.openDrpDown) {
      this.selectedEmployee = null;
      this.loadEditOrAdd = true;

      if (idshiftUpdated || (employeeDisplay && isNaN(Number(employeeDisplay.idEmployee)) && this.shiftByEmployee && this.shiftByEmployee.length)) {
        this.shiftByEmployee.filter((shift: ShiftModel) => {

          const shiftReference = this.clone(shift);
          if(isNaN(Number(shiftReference.employee.idEmployee))){
            shift.oldEmployee =  JSON.parse(JSON.stringify(shift.employee));
            shiftReference.employee.idEmployee = -1;
          }
          shiftReference.employee.listShiftForThreeWeek = [];
          this.shiftsToAssign.push(this.clone(shiftReference));

          if (idshiftUpdated) {
            if (idshiftUpdated === shift.idShift) {
              shiftsToAssign = [];
              shiftsToAssign.push(shiftReference);
            }
          } else {
            if (typeof shiftReference.idShift === 'number') {
              shiftsToAssign.push(shiftReference);
            } else {
              shiftReference.idShift = 0;
              shiftsToAssign.push(shiftReference);
            }
          }
        });
      }

      this.addShiftAndActifEmployeToList(shiftsToAssign);
      const res = await this.employeeService.getEmployeesWithPlgEquipierViewHebdo(this.addOrUpdateShift ? new Date(this.dateDislplay) : this.dateDebut, this.listShiftAssigneToEmployes, this.addOrUpdateShift).toPromise();
      this.newEmployeesToDisplay = [];
      this.listEmployeeForAdd = [];
      this.activLoader = false;
      this.loadEditOrAdd = false;
      this.setNewEmployeListAfterFetch(res, shiftsToAssign, employeeDisplay);
    }
    this.checkChangeDetection();
    this.hideListSpan();
  }
  public selectEmployee(): void{
    this.verifContrainteEmployee.emit({selectedEmployee: this.selectedEmployee, shiftsToAssign: this.shiftsToAssign});
  }
  /**
   * hide list of list when list have an empty span
   */
  @HostListener('document:keyup', ['$event'])
  @HostListener('document:click', ['$event'])
  public hideListSpan() {
    setTimeout(() => {
      const elementsHide = document.querySelectorAll('.hide-groupe-propose');
      const elementAll = Array.from(elementsHide);
      elementAll.forEach((element: any, index: number) => {
        const elementLiToHide = element.parentElement;
        if (!elementLiToHide.classList.contains('hide-groupe-propose-li')) {
          elementLiToHide.classList.add('hide-groupe-propose-li');
        }
      });
    }, 30);
  }
  /**
   * rechargement de list employe pour affichage
   * @param res
   * @param shiftsToAssign
   * @private
   */
  private setNewEmployeListAfterFetch(res: any, shiftsToAssign: any, employeeDisplay?: EmployeeModel): void {
    this.loadEditOrAdd = false;
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
          this.newEmployees.push(this.clone(newEmployee.employee));
          groupedEmployees.items.push(
            {
              label: newEmployee.employee.prenom + ' ' + newEmployee.employee.nom,
              value: newEmployee.employee.idEmployee
            }
          );
        });

        this.newEmployeesToDisplay.push(groupedEmployees);
      }
    });
    this.selectedEmployee = null;
    if (!this.idShiftUpdate && shiftsToAssign.length === 0) {
      this.newEmployees.forEach((item: any) => {
        item.fullName = item.nom + ' ' + item.prenom;
      });
      this.listEmployeeForAdd = this.newEmployees;
    }
    if(employeeDisplay){
      this.selectedEmployee = this.listEmployeeForAdd.find((emp: EmployeeModel)=> emp.idEmployee === employeeDisplay.idEmployee);
    }
    this.addOrUpdateShift =0;
  }

  /**
   * recupere les employee actif et le shift assigné
   */
  private addShiftAndActifEmployeToList(shiftsToAssign: ShiftModel[]) {

    this.listShiftAssigneToEmployes.shiftsToAssign = this.clone(shiftsToAssign);
    this.listShiftAssigneToEmployes.shiftsToAssign.forEach((shift: ShiftModel) => {
      shift.idShift = 0;
      if(shift.employee && shift.employee.idEmployee === -1 ){
        shift.employee = null;
      }
    });

    this.listShiftAssigneToEmployes.employeesShifts = [];
    this.listShiftAssigneToEmployes.listShiftUpdate = [];
    if (shiftsToAssign && shiftsToAssign.length) {
      let shiftUpdatedwithEmploye = [];
      const listShiftUpdatedFinal = this.clone(this.listShiftToUpdate);
      listShiftUpdatedFinal.forEach((shift: ShiftModel) => {
        if (shift.employee) {
          delete shift.employee.weekDetailsPlannings;
          delete shift.employee.employeeWeekShiftCS;
          delete shift.employee.badge;
          delete shift.employee.contrats;
          delete shift.employee.listShiftForThreeWeek;
          delete shift.employee.qualifications;
          delete shift.employee.groupeTravail;
          if(isNaN(Number(shift.employee.idEmployee)) ){
            shift.oldEmployee =  JSON.parse(JSON.stringify(shift.employee));
            shift.employee =  null;
          }
        }
        if (isNaN(Number(shift.idShift))) {
          shift.idShift = 0;
        }
        shift.createFromReference = false;
        if (this.sharedRestaurant.selectedRestaurant) {
          shift.idRestaurant = this.sharedRestaurant.selectedRestaurant.idRestaurant;
        }
        if (!shift.shiftPrincipale && shift.oldShiftData) {
          shift.shiftPrincipale = shift.oldShiftData.shiftPrincipale;
        }
        shift.totalHeure = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        shift.dateJournee = this.dateService.setCorrectDate(new Date(shift.dateJournee));
        this.dateService.setCorrectFormat(shift);
        if (shift.employee && !shift.employee.idEmployee) {
          shift.employee = null;
        }

        shiftUpdatedwithEmploye.push(shift);
      });

      this.listShiftAssigneToEmployes.listShiftUpdate = shiftUpdatedwithEmploye;
    }
  }
}
