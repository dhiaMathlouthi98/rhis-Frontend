import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BesoinImposeModel} from '../../../../../../shared/model/besoin.impose.model';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import * as moment from 'moment';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

@Component({
  selector: '[rhis-plannings-fixes-poste-row]',
  templateUrl: './plannings-fixes-poste-row.component.html',
  styleUrls: ['./plannings-fixes-poste-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningsFixesPosteRowComponent implements OnChanges {

  @Input() public poste: any;
  @Input() public posteIndex: number;
  @Input() public positionList: any[];
  @Input() public days: any[] = [];
  @Input() public besoinImposeByPosteTravail = new Map();
  @Input() public addPopupTitle: string;
  @Input() public updatePopupTitle: string;

  // error messages
  @Input() public dateDebutSupDateFinErrorMessage: string;
  @Input() public dateFinWithoutDateDebutErrorMessage: string;
  @Input() public heureDebutSupHeureFinErrorMessage: string;
  @Input() public startTime: string;
  @Input() public startTimeIsNight: boolean;
  @Input() public endTime: string;
  @Input() public endTimeIsNight: boolean;
  // heure debut/fin est nuit
  public limiteHeureDebut: Date;

  public isNightValue: boolean;

  @Input() set setDecoupageValues(value: any) {
    if (value) {
      this.decoupageHoraireFinEtDebutActivity = value;
    }
  }

  @Input() modeAffichagePlanning: any;
  private modeAffichage: any;
  private decoupageHoraireFinEtDebutActivity: any;

  @Input()
  public set limitHeureDebut(limiteHeureDebut: Date) {
    this.limiteHeureDebut = limiteHeureDebut;
  }

  private limitDecoupageHours: any;
  public checkHeureIsNight = '';

  @Output()
  public checkIfNightValueEvent = new EventEmitter();

  public verificationNightIsRaised = false;

  @Output() public cardDetailsEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public cardDroppedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public editCardEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public deleteCardEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public positionAddedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public rowSelectedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public getStartTimeAndEndTimeFromDecoupageHoraire: EventEmitter<any> = new EventEmitter();

  public heureDebutRequiredField = false;

  public heureFinRequiredField = false;

  public personne;

  public personnes;

  @Input()
  set initPersonneValue(personne: string) {
    this.personne = personne;
  }

  @Input()
  set initPersonnesValue(personnes: string) {
    this.personnes = personnes;
  }

  public newBesoinImpose: BesoinImposeModel = new BesoinImposeModel();

  // variable boolean qui permet d'afficher ou masquer le popup d'ajout ou d'édition
  public showPopUp = false;

  // messages d'erreur de l'heure et de la date
  public errorHourMessage = '';
  public errorDateMessage = '';
  public selectedPosition: PositionTravailModel;

  // Paramètres du popup
  public popUpStyle = {width: 650};
  public titlePopup: string;
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;
  public heureDebutLimitError = false;
  public heureFinLimitError = false;
  public heureFinLimitErrorMessage = '';
  public heureDebutLimitErrorMessage = '';

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null) {
      this.isNightValue = nightValue;
      if (this.isNightValue) {
        if (this.checkHeureIsNight === 'debut') {
          this.newBesoinImpose.heureDebutNuit = true;
          // recuperation à partie par default  current date
          this.newBesoinImpose.heureDebut.setDate(new Date().getDate() + 1);
        } else if (this.checkHeureIsNight === 'fin' && this.newBesoinImpose.heureFin) {
          this.newBesoinImpose.heureFinNuit = true;
          this.newBesoinImpose.heureFin.setDate(new Date().getDate() + 1);
        }
      } else {
        if (this.checkHeureIsNight === 'debut') {
          this.newBesoinImpose.heureDebutNuit = true;
        } else if ((this.checkHeureIsNight === 'fin')) {
          this.newBesoinImpose.heureFinNuit = false;
        }
      }
      if (this.verificationNightIsRaised) {
        this.verificationNightIsRaised = false;
      }
    }
  }

  private ecran = 'GBI';

  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private cdRef: ChangeDetectorRef,
              private domControlService: DomControlService,
              private limitDecoupageService: LimitDecoupageFulldayService) {

  }

  private async getModeDispaly(): Promise<void> {
    this.limitDecoupageHours = await this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichagePlanning, this.dateService.getDateOfEnumertionJour(this.newBesoinImpose.jourSemaine), this.dateService);
    this.modeAffichage = this.limitDecoupageHours.updatedModeAffichage;

  }

  private checkIfShiftAcheval(heureFin: Date): boolean {
    return (moment(heureFin).isAfter(this.finJourneeActivite));
  }

  public checkChangeDetection(): void {
    this.cdRef.detectChanges();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   *  fonction qui s'exécute à chaque changement des inputs du composant

   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
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

  /**
   * affichage du popup d'ajout d'un card
   * @param: event
   * @param dayIndex : index du jour dans lequel on doit ajouter le card
   */
  showAddCardForm(posTravail: PositionTravailModel, dayLabel) {
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    this.newBesoinImpose = new BesoinImposeModel();
    this.titlePopup = this.addPopupTitle;
    this.showPopUp = true;
    this.getStartTimeAndEndTimeFromDecoupageHoraire.emit(dayLabel.toUpperCase());
    this.newBesoinImpose.jourSemaine = dayLabel.toUpperCase();
    this.newBesoinImpose.positionTravail = posTravail;
  }

  /**
   * affichage du popup d'édition
   * @param event : contient les détails du card à éditer
   */
  showEditCardForm(event) {
    this.titlePopup = this.updatePopupTitle;
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    this.newBesoinImpose = {...event.card};
    this.getStartTimeAndEndTimeFromDecoupageHoraire.emit(this.newBesoinImpose.jourSemaine.toString().toUpperCase());

    this.showPopUp = true;
  }

  /**
   * permet de sauvegarder le card après vérifications des heures et des dates
   * @param: event
   */
  saveCard() {
    let canSave = true;
    // date debut without date fin or date fin without date debut
    if ((!this.newBesoinImpose.dateDebut && this.newBesoinImpose.dateFin)) {
      canSave = canSave && false;
      this.errorDateMessage = this.dateFinWithoutDateDebutErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorDateMessage = '';
    }

    // la date de fin doit être supérieure à la date de début
    if (this.newBesoinImpose.dateDebut && this.newBesoinImpose.dateFin) {
      if (this.newBesoinImpose.dateFin <= this.newBesoinImpose.dateDebut) {
        canSave = canSave && false;
        this.errorDateMessage = this.dateDebutSupDateFinErrorMessage;
      } else {
        canSave = canSave && true;
        this.errorDateMessage = '';
      }
    }

    if (!this.newBesoinImpose.heureDebut || !this.newBesoinImpose.heureFin) {
      if (!this.newBesoinImpose.heureDebut) {
        this.heureDebutRequiredField = true;
      } else {
        this.heureDebutRequiredField = false;
      }
      if (!this.newBesoinImpose.heureFin) {
        this.heureFinRequiredField = true;
      } else {
        this.heureFinRequiredField = false;

      }
      canSave = false;
    } else {
      this.newBesoinImpose.heureFin = this.setTimeNull(this.newBesoinImpose.heureFin);
      this.newBesoinImpose.heureDebut = this.setTimeNull(this.newBesoinImpose.heureDebut);
      if (moment(this.newBesoinImpose.heureDebut).isBefore(this.debutJourneeActivite)) {
        this.heureDebutLimitError = true;
        canSave = false;
        this.heureDebutLimitErrorMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.START_ERROR_LIMIT');
      } else {
        this.heureDebutLimitErrorMessage = '';
      }
      if (moment(this.newBesoinImpose.heureFin).isAfter(this.finJourneeActivite) && this.modeAffichage === 0) {
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
    if (this.newBesoinImpose.heureDebut >= this.newBesoinImpose.heureFin) {
      canSave = canSave && false;
      this.errorHourMessage = this.heureDebutSupHeureFinErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorHourMessage = '';
    }

    if (canSave) {
      if (moment(this.newBesoinImpose.heureFin).isAfter(this.finJourneeActivite)) {
        this.newBesoinImpose.acheval = true;
      } else {
        this.newBesoinImpose.acheval = false;
      }
      // if dayIndex is set so we are adding a new card, else we are updating
      this.cardDetailsEmitter.emit(this.newBesoinImpose);
      // fermer le popup
      this.showPopUp = false;
    }
  }

  /**
   * permet de fermer le popup et de faire un reset des champs
   * @param: event
   */
  public closePopup(event) {
    this.showPopUp = false;
    this.errorHourMessage = '';
    this.selectedPosition = null;
    this.heureFinLimitErrorMessage = '';
    this.heureDebutLimitErrorMessage = '';
  }

  /**
   * Lancer l'opération de suppression d'un card avec en paramètre les détails du card
   * @param: event
   */
  public deleteCard(event) {
    this.deleteCardEmitter.emit(event);
  }

  /**
   * permet de selectionner une ligne entière pour la suppression
   * @param: event
   */
  public selectRow(event: any, poste: PositionTravailModel) {
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
      this.rowSelectedEmitter.emit(poste);
    } else {
      // sinon vider la valeur de la ligne selectionnée
      this.rowSelectedEmitter.emit('');
    }
  }

  /**
   * à chaque changement de la position, intitaliser le card avec la nouvelle valeur selectionnée
   * @param: event
   */
  public onChangePosition() {
    this.positionAddedEmitter.emit(this.selectedPosition);
  }

  public validerHeureNuit(heureDebut: boolean) {
    this.getModeDispaly();
    let heureToVerify: Date;
    if (heureDebut) {
      heureToVerify = this.newBesoinImpose.heureDebut;
    } else {
      heureToVerify = this.newBesoinImpose.heureFin;
    }
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
        this.newBesoinImpose.heureDebutNuit = false;
      } else {
        if (this.modeAffichage === 0) {
          this.newBesoinImpose.heureFinNuit = false;
        } else if (heureToVerify.getHours() >= 0) {
          this.checkHeureIsNight = 'fin';
          this.verificationNightIsRaised = true;
          this.checkIfNightValueEvent.emit();

        }
      }
    }
  }

  // convertion la date time en date selement
  private setTimeNull(date) {
    date = new Date(date);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }
}
