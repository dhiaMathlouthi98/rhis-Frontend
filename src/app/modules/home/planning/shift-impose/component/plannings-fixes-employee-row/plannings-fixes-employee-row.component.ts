import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AbsenceCongeModel} from '../../../../../../shared/model/absence.conge.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {ShiftFixeModel} from '../../../../../../shared/model/shiftFixe.model';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {DateService} from '../../../../../../shared/service/date.service';
import * as moment from 'moment';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

@Component({
  selector: '[rhis-plannings-fixes-employee-row]',
  templateUrl: './plannings-fixes-employee-row.component.html',
  styleUrls: ['./plannings-fixes-employee-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningsFixesEmployeeRowComponent implements OnChanges {

  @Input() employee;
  @Input() listePositionTravail: PositionTravailModel [] = [];
  @Input() empIndex: number;
  @Input() employeeList;
  @Input() newEmployeeInProgress: boolean;
  @Input() showPopAddShiftFixe;
  @Input() shiftFixeByEmployee;
  @Input() days: any[] = [];
  @Input() public addPopupTitle: string;
  @Input() public updatePopupTitle: string;
  @Input() totalShiftFixeInWeek;
  // error messages
  @Input() public dateDebutSupDateFinErrorMessage: string;
  @Input() public dateFinWithoutDateDebutErrorMessage: string;
  @Input() public heureDebutSupHeureFinErrorMessage: string;
  @Input() public messageConfonduShiftFixe: string;
  @Input() public startTime: string;
  @Input() public startTimeIsNight: boolean;
  @Input() public endTime: string;
  @Input() public endTimeIsNight: boolean;
  @Input() modeAffichagePlanning: any;
  @Input() listEmployeeHasShiftFixe: any;
  private modeAffichage: any;
  private decoupageHoraireFinEtDebutActivity: any;
  // heure debut/fin est nuit
  public limiteHeureDebut: Date;
  public isNightValue: boolean;
  private ecran = 'GPF';

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

  public newShiftFixe: ShiftFixeModel = new ShiftFixeModel();

  @Output() public shiftFixeEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public cardDroppedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public deleteShiftFixeCardEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public rowSelectedEmitter: EventEmitter<any> = new EventEmitter();

  @Output() public employeeAddedEmitter: EventEmitter<any> = new EventEmitter();
  @Output()
  public checkIfNightValueEvent = new EventEmitter();
  @Output()
  public initValues = new EventEmitter();
  @Output()
  public resetMessageConfonduShiftFixe = new EventEmitter();

  public selectedEmployee: EmployeeModel;
  public heureDebutLimitError = false;
  public heureFinLimitError = false;
  public heureFinLimitErrorMessage = '';
  public heureDebutLimitErrorMessage = '';
  // variable boolean qui permet d'afficher ou masquer le popup d'ajout ou d'édition
  public showPopUp = false;
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public hebdoContrat: string;
  public heureDebutRequiredField = false;

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

  // Paramètres du popup
  public popUpStyle = {width: 650};
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
          this.newShiftFixe.dateDebutIsNight = true;
          // recuperation à partie par default  current date
          this.newShiftFixe.heureDebut.setDate(new Date().getDate() + 1);

        } else if (this.checkHeureIsNight === 'fin' && this.newShiftFixe.heureFin) {
          this.newShiftFixe.dateFinIsNight = true;
          this.newShiftFixe.heureFin.setDate(new Date().getDate() + 1);
        }
      } else {
        if (this.checkHeureIsNight === 'debut') {
          this.newShiftFixe.dateDebutIsNight = false;
        } else if ((this.checkHeureIsNight === 'fin')) {
          this.newShiftFixe.dateFinIsNight = false;
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
              private limitDecoupageService: LimitDecoupageFulldayService) {
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
    const limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichagePlanning, this.dateService.getDateOfEnumertionJour(this.newShiftFixe.jour), this.dateService);
    this.modeAffichage = limitDecoupageHours.updatedModeAffichage;

  }
  /**
   *  fonction qui s'exécute à chaque changement des inputs du composant

   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this.updateButtonControl()) {
      if (changes.showPopAddShiftFixe) {
        this.showPopAddShiftFixe = changes.showPopAddShiftFixe.currentValue;
        if (this.showPopAddShiftFixe) {
          this.closePopup();
        }

      }
      if (changes.totalShiftFixeInWeek) {
        this.totalShiftFixeInWeek = changes.totalShiftFixeInWeek.currentValue;
        this.totalRowTime = this.totalShiftFixeInWeek;
      }
      if (changes.shiftFixeByEmployee) {

        this.shiftFixeByEmployee = changes.shiftFixeByEmployee.currentValue;
        if (this.shiftFixeByEmployee) {
        }
      }
      if (changes.listEmployeeHasShiftFixe) {
        this.listEmployeeHasShiftFixe = changes.listEmployeeHasShiftFixe.currentValue;

      }
      if (changes.employeeList) {
        this.employeeList = changes.employeeList.currentValue;

      }
      if (changes.employee) {
        this.employee = changes.employee.currentValue;
        if (this.employee.contrats && this.employee.contrats.length) {
          this.employee.contrats.forEach(contrat => {
            this.hebdoContrat = contrat.hebdo;
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
  showAddCardForm(employeeDisplay: EmployeeModel, dayLabel) {
    this.resetMessageConfonduShiftFixe.emit();
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    if (employeeDisplay.idEmployee) {
      this.initValues.emit({employee: employeeDisplay, day: dayLabel.toUpperCase()});
      this.newShiftFixe = new ShiftFixeModel();
      this.titlePopup = this.addPopupTitle;
      this.showPopUp = true;
      this.newShiftFixe.jour = dayLabel.toUpperCase();
      this.newShiftFixe.employee = employeeDisplay;
      this.getModeDispaly();

    }
  }

  /**
   * affichage du popup d'édition
   * @param event : contient les détails du card à éditer
   */
  public showEditShiftFixeCardForm(event) {
    this.resetMessageConfonduShiftFixe.emit();
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    this.initValues.emit({employee: event.employee, day: event.card.jour.toUpperCase()});
    this.selectedPosition = event.card.positionTravail;
    this.titlePopup = this.updatePopupTitle;

    this.newShiftFixe = {...event.card};
    this.newShiftFixe.heureDebut = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(new Date(), this.newShiftFixe.heureDebut), this.newShiftFixe.dateDebutIsNight);
    this.newShiftFixe.heureFin = this.dateService.getDateFromIsNight(this.contrainteSocialeService.getTimeWithouSecond(new Date(), this.newShiftFixe.heureFin), this.newShiftFixe.dateFinIsNight);
    this.getModeDispaly();
    this.showPopUp = true;
  }

  /**
   * permet de sauvegarder le card après vérifications des heures et des dates
   * @param: event
   */
  public saveCard() {
    let canSave = true;
    // date debut without date fin or date fin without date debut
    if (!this.newShiftFixe.dateDebut && this.newShiftFixe.dateFin) {
      canSave = canSave && false;
      this.errorDateMessage = this.dateFinWithoutDateDebutErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorDateMessage = '';
    }

    // la date de fin doit être supérieure à la date de début
    if (this.newShiftFixe.dateDebut && this.newShiftFixe.dateFin) {
      if (this.newShiftFixe.dateFin <= this.newShiftFixe.dateDebut) {
        canSave = canSave && false;
        this.errorDateMessage = this.dateDebutSupDateFinErrorMessage;
      } else {
        canSave = canSave && true;
        this.errorDateMessage = '';
      }
    }

    if (!this.newShiftFixe.heureDebut || !this.newShiftFixe.heureFin) {
      if (!this.newShiftFixe.heureDebut) {
        this.heureDebutRequiredField = true;
      } else {
        this.heureDebutRequiredField = false;
      }
      if (!this.newShiftFixe.heureFin) {
        this.heureFinRequiredField = true;
      } else {
        this.heureFinRequiredField = false;

      }
      canSave = false;
    } else {
      this.newShiftFixe.heureFin = this.setTimeNull(this.newShiftFixe.heureFin);
      this.newShiftFixe.heureDebut = this.setTimeNull(this.newShiftFixe.heureDebut);
      if (moment(this.newShiftFixe.heureDebut).isBefore(this.debutJourneeActivite)) {
        this.heureDebutLimitError = true;
        canSave = false;
        this.heureDebutLimitErrorMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.START_ERROR_LIMIT');
      } else {
        this.heureDebutLimitErrorMessage = '';
      }
      if (moment(this.newShiftFixe.heureFin).isAfter(this.finJourneeActivite) && this.modeAffichage === 0) {
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
    if (this.newShiftFixe.heureDebut >= this.newShiftFixe.heureFin) {
      canSave = canSave && false;
      this.errorHourMessage = this.heureDebutSupHeureFinErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorHourMessage = '';
    }

    if (canSave) {
      // if dayIndex is set so we are adding a new card, else we are updating
      this.newShiftFixe.positionTravail = this.selectedPosition;
      this.newShiftFixe.modifiable = this.newShiftFixe.acheval = this.checkIfShiftAcheval(this.newShiftFixe.heureFin) ? true : false;
      this.shiftFixeEmitter.emit(this.newShiftFixe);
    }
  }

  public validerHeureNuit(heureDebut: boolean) {
    let heureToVerify: Date;
    if (heureDebut) {
      this.heureDebutLimitErrorMessage = '';
      heureToVerify = this.newShiftFixe.heureDebut;
    } else {
      this.heureFinLimitErrorMessage = '';
      heureToVerify = this.newShiftFixe.heureFin;
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
          this.newShiftFixe.dateDebutIsNight = false;
        } else {
          if (this.modeAffichage === 0) {
            this.newShiftFixe.dateFinIsNight = false;
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
    this.heureFinLimitErrorMessage = '';
    this.heureDebutLimitErrorMessage = '';
  }

  /**
   * Lancer l'opération de suppression d'un card avec en paramètre les détails du card
   * @param: event
   */
  deleteShiftFixeCard(event) {
    this.deleteShiftFixeCardEmitter.emit(event);
  }


  /**
   * permet de selectionner une ligne entière pour la suppression
   * @param: event
   */
  public selectRow(event: any, employee: EmployeeModel) {
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
    return this.employee.totalRowTime >= this.employee.contrats[0].hebdo;
  }


  // convertion la date time en date selement
  private setTimeNull(date) {
    date = new Date(date);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

}
