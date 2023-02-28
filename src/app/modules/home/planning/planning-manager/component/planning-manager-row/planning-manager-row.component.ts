import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbsenceCongeModel} from '../../../../../../shared/model/absence.conge.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {PeriodeManagerModel} from '../../../../../../shared/model/periode.manager.model';
import {PlanningManagerModel} from '../../../../../../shared/model/planningManager.model';
import * as moment from 'moment';
import {PlanningManagerProductifModel} from '../../../../../../shared/model/planningManagerProductif.model';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {ShiftService} from '../../../planning-equipier/service/shift.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

@Component({
  selector: '[rhis-planning-manager-row]',
  templateUrl: './planning-manager-row.component.html',
  styleUrls: ['./planning-manager-row.component.scss']
})
export class PlanningManagerRowComponent implements OnInit, OnChanges {

  @Input() managerOuLeader;
  @Input() periode;
  @Input() messageConfonduPlanningManger;
  @Input() listPeriodesManager: PeriodeManagerModel [] = [];
  @Input() empIndex: number;
  @Input() periodeIndex: number;
  @Input() ManagerOrLeaderList;
  @Input() showPopAddShiftManager;
  @Input() planningManagerOrLeaderByEmployee;
  @Input() listManagerOrleaderInactif;

  // vue poste
  @Input() vuePoste;
  @Input() planningManagerByPeriode;
  @Input() days: any[] = [];
  @Input() public addPopupTitle: string;
  @Input() public updatePopupTitle: string;
  @Input() totalShiftManagerInWeek;
  @Input() listePositionTravail;
  @Input() listManagerOrLeaderActif;
  @Input()
  public JoursSemainEnum = [];
  @Input()
  public dateDebut;
  @Input()
  public dateFin;
  @Input()
  public valeurProductif;
  // error messages
  @Input() public dateDebutSupDateFinErrorMessage: string;
  @Input() public dateFinWithoutDateDebutErrorMessage: string;
  @Input() public heureDebutSupHeureFinErrorMessage: string;
  @Input() public hasPlanningLeader;
  @Input() public startTime: string;
  @Input() public startTimeIsNight: boolean;
  @Input() public endTime: string;
  @Input() public endTimeIsNight: boolean;
  @Input() public employeInactif: boolean;
  public periodesManager: PeriodeManagerModel [] = [];
  // heure debut/fin est nuit
  public limiteHeureDebut: Date;
  public isNightValue: boolean;
  public newPlanningManager: PlanningManagerModel = new PlanningManagerModel();
  public selectedPeriode: PeriodeManagerModel;
  public listPlanningManagerProductifs: PlanningManagerProductifModel [] = [];
  public planningManagerOrProductif: any;
  public heureDebutPeriodeManager;
  public heureFinPeriodeManager;
  public hiddenAdd = true;
  public heureDebutLimitError = false;
  public heureFinLimitError = false;
  public heureFinLimitErrorMessage = '';
  public heureDebutLimitErrorMessage = '';
  public dateOfPlanning: Date;
  @Input()
  public set limitHeureDebut(limiteHeureDebut: Date) {
    this.limiteHeureDebut = new Date(limiteHeureDebut);
  }

  @Input() modeAffichagePlanning: any;
  private modeAffichage: any;
  private decoupageHoraireFinEtDebutActivity: any;
  private limitDecoupageHours: any;
  public verificationNightIsRaised = false;

  @Output() public planningManagerShiftEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public cardDroppedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public deletePlanningManagerCardEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public rowSelectedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public resetMessageConfonduPlanningManager: EventEmitter<any> = new EventEmitter();
  @Output() public employeeAddedEmitter: EventEmitter<any> = new EventEmitter();
  @Output()
  public checkIfNightValueEvent = new EventEmitter();
  @Output()
  public initValues = new EventEmitter();
  @Output()
  public resetPopupOfPlanningManager = new EventEmitter();
  @Output()
  getIdOfPlanningManagerProductifDeleted = new EventEmitter();
  @Output()
  getLastAndFirstDayOfActivity = new EventEmitter();
  public selectedManager: EmployeeModel;
  // variable boolean qui permet d'afficher ou masquer le popup d'ajout ou d'édition
  public showPopUp = false;
  // la somme totale des heures contenues dans les cards
  public totalRowTime: any;
  public hebdoContrat: string;
  public heureDebutRequiredField = false;
  public selectedPeriodeRequiredField = false;
  public heureFinRequiredField = false;
  public selectedManagerRequiredField = false;
  public ecran = 'VPM';

  public checkHeureIsNight = '';
  public congeDisplay: AbsenceCongeModel[] = [];
  public addPlanningManagerProductif = false;
  // titre du popup par défaut
  titlePopup = '';
  // Initialisation des détails d'un nouveau card à créer

  // messages d'erreur de l'heure et de la date
  public errorHourMessagePlanningManager = '';


  // Paramètres du popup
  public popUpStyle = {width: 500};
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
          this.planningManagerOrProductif.heureDebutIsNight = true;
          this.planningManagerOrProductif.heureDebut.setDate(this.planningManagerOrProductif.heureDebut.getDate() + 1);
        } else if (this.checkHeureIsNight === 'fin' && this.planningManagerOrProductif.heureFin) {
          this.planningManagerOrProductif.heureFinIsNight = true;
          this.planningManagerOrProductif.heureFin.setDate(this.planningManagerOrProductif.heureFin.getDate() + 1);
        }
      } else {
        if (this.checkHeureIsNight === 'debut') {
          this.planningManagerOrProductif.heureDebutIsNight = false;
        } else if (this.checkHeureIsNight === 'fin') {
          this.planningManagerOrProductif.heureFinIsNight = false;
        }
      }
      if (this.verificationNightIsRaised) {
        this.verificationNightIsRaised = false;
      }
    }
  }

  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService, private shiftService: ShiftService,
              private domControlService: DomControlService,
              private limitDecoupageService: LimitDecoupageFulldayService) {
  }

  @Input() set setDecoupageValues(value: any) {
    if (value) {
      this.decoupageHoraireFinEtDebutActivity = value;
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
   *  fonction qui s'exécute à chaque changement des inputs du composant

   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.showPopAddShiftManager) {
      this.showPopAddShiftManager = changes.showPopAddShiftManager.currentValue;
      if (this.showPopAddShiftManager) {
        this.closePopup();
      }

    }
    if (changes.totalShiftManagerInWeek) {
      this.totalShiftManagerInWeek = changes.totalShiftManagerInWeek.currentValue;
      this.totalRowTime = this.totalShiftManagerInWeek;
    }
    if (changes.managerList) {
      this.ManagerOrLeaderList = changes.managerList.currentValue;

    }
    if (changes.managerOuLeader) {
      if (!this.vuePoste) {
        this.managerOuLeader = changes.managerOuLeader.currentValue;
        this.hebdoContrat = this.managerOuLeader.hebdoCourant;
      }
    }
    if (changes.planningManagerOrLeaderByEmployee) {

      this.planningManagerOrLeaderByEmployee = changes.planningManagerOrLeaderByEmployee.currentValue;

      if (!this.vuePoste && this.managerOuLeader) {
        if (this.managerOuLeader.absenceConges) {
          this.congeDisplay = [];
          this.displayConge(this.managerOuLeader.absenceConges);
        }
      }

    }
    if (changes.listManagerOrLeaderActif) {
      this.listManagerOrLeaderActif = changes.listManagerOrLeaderActif.currentValue;
      if (this.listManagerOrLeaderActif && this.listManagerOrLeaderActif.length) {
        this.hiddenAdd = false;
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

  ngOnInit(): void {
    this.changeFormatTimePeriodeManagerForDisplay();
  }

  /**
   *changer le format des heures de periode manager pour l'affichage
   */
  public changeFormatTimePeriodeManagerForDisplay() {
    if (this.vuePoste) {
      this.heureDebutPeriodeManager = this.periode.dateDebut;
      this.heureDebutPeriodeManager = this.heureDebutPeriodeManager.substring(0, this.heureDebutPeriodeManager.length - 3);
      this.heureFinPeriodeManager = this.periode.dateFin;
      this.heureFinPeriodeManager = this.heureFinPeriodeManager.substring(0, this.heureFinPeriodeManager.length - 3);
    }
  }

  /**
   * affiche les conges de manager pour la vue manager
   * @param :absenceConge
   */
  displayConge(absenceConge: AbsenceCongeModel[]) {

    absenceConge.forEach(conge => {
      for (let i = 0; i < conge.detailEvenements.length; i++) {
        //if(moment(this.dateService.setTimeNull(conge.dateDebut)))
        conge.dateDebutDisplayInPlanningManagerOrLeader = JSON.parse(JSON.stringify(conge.detailEvenements[i].dateEvent));
        conge.dateDebutDisplayInPlanningManagerOrLeader = this.setHeureMinuteNull(conge.dateDebutDisplayInPlanningManagerOrLeader);
        this.dateFin = this.setHeureMinuteNull(this.dateFin);
        this.dateDebut = this.setHeureMinuteNull(this.dateDebut);
        //conge.dateDebutDisplayInPlanningManagerOrLeader.setDate(conge.dateDebutDisplayInPlanningManagerOrLeader.getDate() + i);
        if (moment(conge.dateDebutDisplayInPlanningManagerOrLeader).isSameOrAfter(this.dateDebut) && moment(conge.dateDebutDisplayInPlanningManagerOrLeader).isSameOrBefore(this.dateFin) && conge.typeEvenement.previsible) {
          if (this.congeDisplay && this.congeDisplay.length) {
            // pour n est pas avois des congés en meme date
            const exists = !!this.congeDisplay.find(absConge => moment(absConge.dateDebutDisplayInPlanningManagerOrLeader).isSame(conge.dateDebutDisplayInPlanningManagerOrLeader));
            if (!exists) {
              this.congeDisplay.push({...conge});
            }
          } else {
            this.congeDisplay.push({...conge});

          }
        }
      }

    });
  }

  private getModeDispaly(): void {
    this.limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichagePlanning, this.newPlanningManager.dateJournee, this.dateService);
    this.modeAffichage = this.limitDecoupageHours.updatedModeAffichage;

  }

  /**
   * affichage du popup d'ajout d'un card
   * @param: employeeDisplay
   * @param dayLabel : index du jour dans lequel on doit ajouter le card
   */
  public showAddCardForm(managerOuLeaderDisplay: EmployeeModel, dayLabel: string, periode?: PeriodeManagerModel): void {
    this.periodesManager = [...this.listPeriodesManager];
    this.showPopUp = false;
    this.newPlanningManager = new PlanningManagerModel();
    this.addPlanningManagerProductif = false;
    this.resetMessageConfonduPlanningManager.emit();
    this.heureDebutLimitError = false;
    this.heureFinLimitError = false;
    this.titlePopup = this.addPopupTitle;
    this.newPlanningManager.dateJournee = this.setJourSemaine(dayLabel.toUpperCase());
    this.getModeDispaly();
    this.dateOfPlanning = this.setJourSemaine(dayLabel.toUpperCase());
    if (this.vuePoste) {
      this.showPopUp = true;
      this.selectedPeriode = periode;
      this.selectedManagerRequiredField = false;
      this.setHeureDebutHeureFinPlanningManager();
      this.getLastAndFirstDayOfActivity.emit(dayLabel.toUpperCase());
    } else if (managerOuLeaderDisplay.idEmployee) {
      this.newPlanningManager.managerOuLeader = managerOuLeaderDisplay;
      this.selectedPeriodeRequiredField = false;
      this.initValues.emit({employee: managerOuLeaderDisplay, day: dayLabel.toUpperCase()});
      setTimeout(() => this.verificationShowPopPup(), 500);
    }
    this.listPlanningManagerProductifs = [];
    this.heureDebutRequiredField = false;
    this.heureFinRequiredField = false;
  }

  /**
   * le popup affiche si l'employe est actif
   */
  private verificationShowPopPup() {
    if (!this.employeInactif) {
      this.showPopUp = true;
    }
  }

  /**
   * lors de selectionne sur le manager Ou Leader
   * @param: managerDisplay
   */
  public setManagerToPlanning(managerDisplay: EmployeeModel): void {
    this.newPlanningManager.managerOuLeader = managerDisplay;
    this.resetMessageConfonduPlanningManager.emit();
    this.initValues.emit({employee: managerDisplay, day: this.dateOfPlanning});

  }

  /**
   * affichage du popup d'édition
   * modifier le shift qui n'a pas achevée
   * modifier le shift :isAcheval true et is,modifiable  true
   * envoyer l'employee pour recupere son contrat actif
   * @param event : contient les détails du card à éditer
   */
  public showEditPlanningManagerCardForm(event) {
      this.periodesManager = [...this.listPeriodesManager];
      this.addPlanningManagerProductif = false;
      this.heureDebutRequiredField = false;
      this.heureFinRequiredField = false;
      this.selectedPeriodeRequiredField = false;
      this.selectedManagerRequiredField = false;
      this.heureDebutLimitError = false;
      this.heureFinLimitError = false;
      this.resetMessageConfonduPlanningManager.emit();
      // vue manager
      if (event.employee) {
        this.initValues.emit({employee: event.employee, day: this.getJourSemaine(event.card.dateJournee)});
        setTimeout(() => this.verificationShowPopPup(), 500);
        let periodeManager = event.card.periodeManager;
        const index = this.listPeriodesManager.findIndex(p => p.idPeriodeManager === periodeManager.idPeriodeManager);
        if (index === -1) {
          this.periodesManager = [periodeManager, ...this.listPeriodesManager];
          this.selectedPeriode = this.periodesManager[0];
        } else {
          this.periodesManager.forEach(periode => {
            if (periodeManager.idPeriodeManager === periode.idPeriodeManager) {
              this.selectedPeriode = periode;
            }
          });
        }
      }
      // vue poste
      if (event.periode) {
        this.listManagerOrLeaderActif.forEach(managerDisplay => {
          if (event.card.managerOuLeader.idEmployee === managerDisplay.idEmployee) {
            this.selectedManager = managerDisplay;
          }
        });
        this.dateOfPlanning = event.card.dateJournee;
        this.initValues.emit({employee: this.selectedManager, day: event.card.dateJournee});
        const dayOfPlanning = this.getJourSemaine(event.card.dateJournee);
        this.getLastAndFirstDayOfActivity.emit(dayOfPlanning);
        this.selectedPeriode = event.periode;
        this.showPopUp = true;
      }


    if (event.card.planningManagerProductif) {
      this.listPlanningManagerProductifs = event.card.planningManagerProductif;
      this.listPlanningManagerProductifs.forEach(productif => {
        productif.horraireConfonduesErrorMessage = false;
      });
    } else {
      this.listPlanningManagerProductifs = [];
      this.addPlanningManagerProductif = false;
    }
    if (this.listPlanningManagerProductifs.length >= this.valeurProductif) {
      this.addPlanningManagerProductif = true;
    }
    this.titlePopup = this.updatePopupTitle;
    this.newPlanningManager = {...event.card};
    this.getModeDispaly();
  }


  /**
   * set heure debut ,heure fin for planning manager
   */
  public setHeureDebutHeureFinPlanningManager() {
    this.newPlanningManager.heureDebut = JSON.parse(JSON.stringify(this.selectedPeriode.dateDebut));
    this.newPlanningManager.heureFin = JSON.parse(JSON.stringify(this.selectedPeriode.dateFin));
    this.newPlanningManager.heureDebut = this.setTimeFormatHHMM(this.newPlanningManager.heureDebut);
    this.newPlanningManager.heureFin = this.setTimeFormatHHMM(this.newPlanningManager.heureFin);
    this.newPlanningManager.heureDebutIsNight = false;
    this.newPlanningManager.heureFinIsNight = false;

    if (this.selectedPeriode.dateDebutIsNight) {
      this.newPlanningManager.heureDebut.setDate(this.newPlanningManager.heureDebut.getDate() + 1);
      this.newPlanningManager.heureDebutIsNight = true;
    }
    if (this.selectedPeriode.dateFinIsNight) {
      this.newPlanningManager.heureFin.setDate(this.newPlanningManager.heureFin.getDate() + 1);
      this.newPlanningManager.heureFinIsNight = true;

    }
  }


  /**
   * permet de sauvegarder le card après vérifications des heures et des dates
   * @param: event
   */
  public saveCard() {
    if (this.canSave()) {
      if ((this.listPlanningManagerProductifs.length > 0 && this.displayAddPlanningManagerProductif('save'))
        || this.listPlanningManagerProductifs.length === 0) {
        // if dayIndex is set so we are adding a new card, else we are updating
        this.newPlanningManager.periodeManager = this.selectedPeriode;
        if (this.listPlanningManagerProductifs.length > 0) {
          this.newPlanningManager.planningManagerProductif = this.listPlanningManagerProductifs;
        } else {
          this.newPlanningManager.planningManagerProductif = null;
        }
        if (this.checkIfShiftAcheval(this.newPlanningManager.heureFin)) {
          this.newPlanningManager.acheval = true;
          this.newPlanningManager.modifiable = true;
          this.setHeureMinuteNull(this.dateFin);
          this.setHeureMinuteNull(this.newPlanningManager.dateJournee);

          if (moment(this.setHeureMinuteNull(this.dateFin)).isSame(this.setHeureMinuteNull(this.newPlanningManager.dateJournee))) {
            this.newPlanningManager.achevalWeek = true;
          } else {
            this.newPlanningManager.achevalWeek = false;
          }
        } else {
          this.newPlanningManager.acheval = false;
          this.newPlanningManager.modifiable = false;
          this.newPlanningManager.achevalWeek = false;

        }
        this.planningManagerShiftEmitter.emit(this.newPlanningManager);
      }
    }
  }

  /**
   * tester si on peut ajouter planning manager
   * heure debut heur fin ,periode manager ,manager seront obligatoires
   */
  canSave() {
    let canSave = true;
    this.correctTimeOfPnnanigeMAnagerOrLeader();
    if (!this.newPlanningManager.heureDebut || !this.newPlanningManager.heureFin || (!this.vuePoste && !this.selectedPeriode) || (this.vuePoste && !this.selectedManager)) {
      if (!this.newPlanningManager.heureDebut) {
        this.heureDebutRequiredField = true;
      } else {
        this.heureDebutRequiredField = false;
      }
      if (!this.newPlanningManager.heureFin) {
        this.heureFinRequiredField = true;
      } else {
        this.heureFinRequiredField = false;
      }
      if (this.vuePoste) {
        if (!this.selectedManager) {
          this.selectedManagerRequiredField = true;
        } else {
          this.selectedManagerRequiredField = false;
        }
      } else {
        if (!this.selectedPeriode) {
          this.selectedPeriodeRequiredField = true;
        } else {
          this.selectedPeriodeRequiredField = false;
        }
      }
      canSave = false;
    } else {
      this.newPlanningManager.heureFin = this.setTimeNull(this.newPlanningManager.heureFin);
      this.newPlanningManager.heureDebut = this.setTimeNull(this.newPlanningManager.heureDebut);
      this.heureDebutRequiredField = false;
      this.heureFinRequiredField = false;
      this.selectedPeriodeRequiredField = false;
      this.selectedManagerRequiredField = false;
      if (moment(this.newPlanningManager.heureDebut).isBefore(this.debutJourneeActivite)) {
        this.heureDebutLimitError = true;
        canSave = false;
        this.heureDebutLimitErrorMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.START_ERROR_LIMIT');
      } else {
        this.heureDebutLimitErrorMessage = '';
      }
      if (moment(this.newPlanningManager.heureFin).isAfter(this.finJourneeActivite) && this.modeAffichage === 0) {
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
    if (this.newPlanningManager.heureDebut && this.newPlanningManager.heureFin && this.newPlanningManager.heureDebut >= this.newPlanningManager.heureFin) {
      canSave = canSave && false;
      this.errorHourMessagePlanningManager = this.heureDebutSupHeureFinErrorMessage;
    } else {
      canSave = canSave && true;
      this.errorHourMessagePlanningManager = '';
    }
    return canSave;
  }

  /**
   * correction heure avant la vérification
   */
  private correctTimeOfPnnanigeMAnagerOrLeader() {
    if (this.newPlanningManager.heureDebut) {
      this.newPlanningManager.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), this.newPlanningManager.heureDebut), this.newPlanningManager.heureDebutIsNight);
      this.dateService.resetSecondsAndMilliseconds(this.newPlanningManager.heureDebut);
    }
    if (this.newPlanningManager.heureFin) {
      this.newPlanningManager.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(), this.newPlanningManager.heureFin), this.newPlanningManager.heureFinIsNight);
      this.dateService.resetSecondsAndMilliseconds(this.newPlanningManager.heureFin);
    }
  }

  /**
   * pour que les heures de planning productif ne depassent pas les heure de planning manager
   * @param event
   */
  verifyHeurePlanninPoductif(event, i, filter) {
    if (filter === 'debut') {
      if ((this.newPlanningManager.heureDebut.getMinutes() > event.getMinutes() && this.newPlanningManager.heureDebut.getHours() === event.getHours()) ||
        (this.newPlanningManager.heureFin.getMinutes() < event.getMinutes() && this.newPlanningManager.heureFin.getHours() === event.getHours())) {
        this.listPlanningManagerProductifs[i].heureDebut = this.newPlanningManager.heureDebut;
      }
    } else {
      if ((this.newPlanningManager.heureFin.getMinutes() < event.getMinutes() && this.newPlanningManager.heureFin.getHours() === event.getHours()) ||
        (this.newPlanningManager.heureDebut.getMinutes() > event.getMinutes() && this.newPlanningManager.heureDebut.getHours() === event.getHours())) {

        this.listPlanningManagerProductifs[i].heureFin = this.newPlanningManager.heureFin;
      }
    }
  }

  /**
   * validation heure de nuit
   * @param heureDebut
   * @param planning
   */
  public validerHeureNuit(heureDebut: boolean, planning: any) {
    this.resetMessageConfonduPlanningManager.emit();

    let heureToVerify: Date;
    this.planningManagerOrProductif = planning;
    if (heureDebut) {
      heureToVerify = planning.heureDebut;
    } else {
      heureToVerify = planning.heureFin;
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
          planning.heureDebutIsNight = false;
        } else {
          if (this.modeAffichage === 0) {
            planning.heureFinIsNight = false;
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
   * permet de fermer le popup et de faire un reset des champs
   * @param: event
   */
  public closePopup(event?) {
    this.showPopUp = false;
    this.errorHourMessagePlanningManager = '';
    this.heureFinLimitErrorMessage = '';
    this.heureDebutLimitErrorMessage = '';
    this.selectedPeriode = null;
    if (this.vuePoste) {
      this.selectedManager = null;
    }
    this.resetPopupOfPlanningManager.emit();
  }

  /**
   * Lancer l'opération de suppression d'un card avec en paramètre les détails du card
   * @param: event
   */
  deletePlanningManagerCard(event) {
    this.deletePlanningManagerCardEmitter.emit(event);
  }

  /**
   * permet de selectionner une ligne entière pour la suppression tout les planning manager associé  à la periode manager
   * @param: event
   * @param: periode
   */
  public selectRow(event: any, rowSelected) {
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
      this.rowSelectedEmitter.emit(rowSelected);
    } else {
      // sinon vider la valeur de la ligne selectionnée
      this.rowSelectedEmitter.emit('');
    }
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
    return this.managerOuLeader.totalRowTime >= this.managerOuLeader.hebdoCourant;
  }


  // convertion la date time en hh:mm
  private setTimeNull(date) {
    date = new Date(date);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  /**
   * ajouter planning manager produtif
   * heure planning manager productif prend en default les heure de planning manager productif
   * @param: savePlanningManager
   */
  public displayAddPlanningManagerProductif(savePlanningManager?) {
    let addNewPlanningManagerProductif = false;
    this.addPlanningManagerProductif = false;
    let newPlanningManagerProductif = {} as PlanningManagerProductifModel;
    if (this.canSave()) {
      newPlanningManagerProductif = this.setTimeToNewPlanningManagerProductif(newPlanningManagerProductif);
      if (this.listPlanningManagerProductifs.length > 0) {
        const listPlanningManagerProductifsDefault = JSON.parse(JSON.stringify(this.listPlanningManagerProductifs));
        this.listPlanningManagerProductifs = [];

        listPlanningManagerProductifsDefault.forEach((productif, index) => {
          this.setCorrectTimeToDisplay(productif);

          if (this.cannAddPlanningManagerProductif(productif) && this.newCanAdd(listPlanningManagerProductifsDefault)) {

            this.listPlanningManagerProductifs.push(productif);
            if (!addNewPlanningManagerProductif && listPlanningManagerProductifsDefault.length === index + 1) {
              if (!savePlanningManager) {
                this.listPlanningManagerProductifs.push(newPlanningManagerProductif);
                addNewPlanningManagerProductif = true;
              } else {
                addNewPlanningManagerProductif = true;
              }
            }

          } else {
            this.listPlanningManagerProductifs = listPlanningManagerProductifsDefault;
            if (savePlanningManager) {
              addNewPlanningManagerProductif = false;
            }
          }
        });
      } else if (this.listPlanningManagerProductifs.length === 0 && !savePlanningManager) {
        addNewPlanningManagerProductif = true;
        this.listPlanningManagerProductifs.push(newPlanningManagerProductif);
      }
      if (this.listPlanningManagerProductifs.length >= this.valeurProductif) {
        this.addPlanningManagerProductif = true;
      }
      return addNewPlanningManagerProductif;
    }
  }

  /**
   * Les heures de la periode productive doivent etre inclu dans les heures du shift planning
   * les heures periode productive obligatoire

   * @param: planningManagerProductif
   */
  private cannAddPlanningManagerProductif(planningManagerProductif: PlanningManagerProductifModel): boolean {
    let canAdd = true;
    planningManagerProductif.heureInclu = false;

    if (!planningManagerProductif.heureDebut || !planningManagerProductif.heureFin) {
      if (!planningManagerProductif.heureDebut) {
        planningManagerProductif.heureDebutPlanningManagerProductifRequiredField = true;

      } else {
        planningManagerProductif.heureDebutPlanningManagerProductifRequiredField = false;
      }
      if (!planningManagerProductif.heureFin) {
        planningManagerProductif.heureFinPlanningManagerProductifRequiredField = true;

      } else {
        planningManagerProductif.heureFinPlanningManagerProductifRequiredField = false;

      }
      canAdd = false;
    } else {
      planningManagerProductif.heureFin = this.setTimeNull(planningManagerProductif.heureFin);
      planningManagerProductif.heureDebut = this.setTimeNull(planningManagerProductif.heureDebut);
      planningManagerProductif.heureDebutPlanningManagerProductifRequiredField = false;
      planningManagerProductif.heureFinPlanningManagerProductifRequiredField = false;
    }

    // heure debut sup herue fin
    if (planningManagerProductif.heureFin && planningManagerProductif.heureDebut && planningManagerProductif.heureDebut >= planningManagerProductif.heureFin) {
      canAdd = canAdd && false;
      planningManagerProductif.errorHourePlanningManagerProductifMessage = this.heureDebutSupHeureFinErrorMessage;
      return false;
    } else {
      canAdd = canAdd && true;
      planningManagerProductif.errorHourePlanningManagerProductifMessage = '';
    }
    if ((planningManagerProductif.heureFin && planningManagerProductif.heureDebut) && ((this.newPlanningManager.heureDebut > planningManagerProductif.heureDebut) || (this.newPlanningManager.heureFin < planningManagerProductif.heureFin))) {
      canAdd = canAdd && false;
      planningManagerProductif.heureInclu = true;
      return false;
    }
    return canAdd;
  }

  /**
   * suppression planning manager productif
   * @param :index
   */
  public deletePlanningManagerProductif(indexPlanning) {
    this.listPlanningManagerProductifs.forEach((production, index) => {
      if (index === indexPlanning) {
        if (production.idPlanningManagerProductif) {
          this.getIdOfPlanningManagerProductifDeleted.emit(production.uuid);
        }
        this.listPlanningManagerProductifs.splice(index, 1);
      }
    });
    this.addPlanningManagerProductif = false;
  }

  /**
   * permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  private setCorrectTimeToDisplay(item: any) {
    if (item.heureDebut) {
      item.heureDebut = new Date(item.heureDebut);
    } else {
      item.heureDebut = null;
    }
    if (item.heureFin) {
      item.heureFin = new Date(item.heureFin);

    } else {
      item.heureFin = null;
    }
  }


  /**
   * Verification  de l'horraire du planning on ne peut pas avoir des horaires confondues
   */
  public canAdd(list): boolean {
    if (list.length === 0) {
      return true;
    } else {
      const lastValue = list[list.length - 1];
      let canAdd = true;
      for (let i = 0; i < list.length - 1; i++) {
        // condition dans l'intervale
        if ((moment(lastValue.heureDebut).isSameOrAfter(list[i].heureDebut) &&
          moment(lastValue.heureDebut).isSameOrBefore(list[i].heureFin)) ||

          (moment(lastValue.heureFin).isSameOrAfter(list[i].heureDebut) &&
            moment(lastValue.heureFin).isSameOrBefore(list[i].heureFin)) ||

          // condition heureDebut OK mais heureFin dans l'intervale
          (((moment(lastValue.heureDebut).isSameOrBefore(list[i].heureDebut)) &&
            (moment(lastValue.heureFin).isSameOrAfter(list[i].heureDebut)) &&
            (moment(lastValue.heureFin).isSameOrBefore(list[i].heureFin)))) ||

          // condition heureFin OK mais heureDebut dans l'intervale
          ((moment(lastValue.heureDebut).isSameOrAfter(list[i].heureDebut)) &&
            (moment(lastValue.heureDebut).isSameOrBefore(list[i].heureFin)) &&
            (moment(lastValue.heureFin).isSameOrAfter(list[i].heureFin))) ||

          // condition heureFin OK et heureDebut OK mais les valeurs déjà présentes sont inclues EXP :
          // valeur a verifier 7-10
          // valeur existante 8-9
          ((moment(lastValue.heureDebut).isSameOrBefore(list[i].heureDebut)) &&
            (moment(lastValue.heureFin).isSameOrAfter(list[i].heureFin)))) {
          canAdd = canAdd && false;
        }
      }
      if (!canAdd) {
        lastValue.horraireConfonduesErrorMessage = true;
      }
      return canAdd;
    }
  }

  public newCanAdd(list: any[]): boolean {
    if (list.length === 0) {
      return true;
    } else {
      let canAdd = true;
      let lastValue: any;
      this.shiftService.sortListShift(list);
      list.forEach((postProdDisplay: any, index: number) => {
        if (index < list.length - 1) {
          lastValue = list[index + 1];
          // condition dans l'intervaele
          if ((moment(lastValue.heureDebut).isSameOrBefore(postProdDisplay.heureDebut) &&
            moment(lastValue.heureFin).isAfter(postProdDisplay.heureDebut)) ||
            (moment(lastValue.heureDebut).isBefore(postProdDisplay.heureFin) &&
              moment(lastValue.heureFin).isSameOrAfter(postProdDisplay.heureFin)) ||
            (moment(lastValue.heureDebut).isSameOrAfter(postProdDisplay.heureDebut) &&
              (moment(lastValue.heureFin).isSameOrBefore(postProdDisplay.heureFin))
            )) {
            canAdd = canAdd && false;
          }
        }
      });
      if (!canAdd) {
        lastValue.horraireConfonduesErrorMessage = true;
      }
      return canAdd;
    }
  }

  /**
   * Cette methode permet de retourner le jourSemaine d'une date passer en param
   * @param jour
   */
  getJourSemaine(jour: Date): JourSemaine {
    let jourSemaine: JourSemaine;
    switch (jour.getDay()) {
      case 0: {
        jourSemaine = JourSemaine.DIMANCHE;
        break;
      }
      case 1: {
        jourSemaine = JourSemaine.LUNDI;
        break;
      }
      case 2: {
        jourSemaine = JourSemaine.MARDI;
        break;
      }
      case 3: {
        jourSemaine = JourSemaine.MERCREDI;
        break;
      }
      case 4: {
        jourSemaine = JourSemaine.JEUDI;
        break;
      }
      case 5: {
        jourSemaine = JourSemaine.VENDREDI;
        break;
      }
      case 6: {
        jourSemaine = JourSemaine.SAMEDI;
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return jourSemaine;
  }

  /**
   * recuperer les dates de jour de semaine
   ** @param :value
   */
  public setJourSemaine(value) {
    const firstDayOfweek = this.dateDebut;
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

  public setTimeFormatHHMM(param): Date {
    if (param) {
      const dateParser = new Date();
      dateParser.setMinutes(+(param.substr(3, 2)));
      dateParser.setHours(+(param.substr(0, 2)));
      dateParser.setSeconds(0);
      dateParser.setMilliseconds(0);
      param = dateParser;
    }
    return param;
  }

  /**
   * par defaut mettre les heures de début et de fin de la planning manager.
   * @param: newPlanningManagerProductif
   */
  private setTimeToNewPlanningManagerProductif(newPlanningManagerProductif) {
    newPlanningManagerProductif.heureDebut = JSON.parse(JSON.stringify(this.newPlanningManager.heureDebut));
    newPlanningManagerProductif.heureFin = JSON.parse(JSON.stringify(this.newPlanningManager.heureFin));
    newPlanningManagerProductif.heureDebut = new Date(newPlanningManagerProductif.heureDebut);
    newPlanningManagerProductif.heureFin = new Date(newPlanningManagerProductif.heureFin);
    newPlanningManagerProductif.heureDebutIsNight = false;
    newPlanningManagerProductif.heureFinIsNight = false;
    if (this.newPlanningManager.heureDebutIsNight) {
      newPlanningManagerProductif.heureDebutIsNight = true;
    }
    if (this.newPlanningManager.heureFinIsNight) {
      newPlanningManagerProductif.heureFinIsNight = true;

    }
    return newPlanningManagerProductif;
  }

  // convertion la date time en date seulement
  private setHeureMinuteNull(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  private checkIfShiftAcheval(heureFin: Date): boolean {
    return (moment(heureFin).isAfter(this.finJourneeActivite));
  }
}
