import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {GridsterComponentInterface, GridsterConfig, GridsterItem, GridsterItemComponent} from 'angular-gridster2';
import {RecapitulatifEmployeComponent} from '../recapitulatif-employe/recapitulatif-employe.component';
import {DateService} from 'src/app/shared/service/date.service';
import {GRIDSTER_EMPLOYEE_OPTIONS} from '../../gridster-employe-config';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {Indisponibilite, Periode, WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {DatePipe} from '@angular/common';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {ShiftService} from '../../service/shift.service';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import {HelperService} from '../../../../../../shared/service/helper.service';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';
import {PlanningLockService} from '../../../../../../shared/service/planning-lock.service';
import * as rfdc from 'rfdc';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {PlanningHourLabelFulldayService} from '../../../../../../shared/service/planning.hour.label.fullday.service';
import {LimitDecoupageFulldayService} from 'src/app/shared/service/limit.decoupage.fullday.service';
import * as moment from 'moment';
import {PlgEquipierHelperService} from '../../service/plg-equipier-helper.service';

@Component({
  selector: 'rhis-planning-semaine',
  templateUrl: './planning-semaine.component.html',
  styleUrls: ['./planning-semaine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningSemaineComponent implements OnInit, AfterViewInit {
  private readonly GREY = '#c0bbb0';
  private readonly BLACK = '#414141';
  public eventCtrl= false;

  /**
   * options de Configuration de la grille
   */
  public options: GridsterConfig;
  /**
   * données à afficher dans la grille
   */
  public data: Array<GridsterItem> = [];
  /**
   * largeur d'une colonne de la grille
   */
  public timeAxisCellWidth: string;
  /**
   * hauteur de la grille
   */
  public gridsterHeight: string;
  @Input() public decoupageHoraireFinEtDebutActivity: any;
  @Input() public frConfig: any;
  @Input() public paramMode: any;
  /**
   * valeurs de l'axe du temps
   */
  @Input() hours: string[];
  @Input() listShiftWithSignForWeekOrDay: any;

  /**
   * Heure de debut de journée d'activité
   */
  @Input() debutJourneeActivite: any;
  /**
   * Heure de fin de journée d'activité
   */
  @Input() finJourneeActivite: any;
  /**
   * Axe des jours de semaine pour un employée
   */
  public datesAxis: any[] = [];
  @Input() weekDatesToDisplay: any[];
  @Input() debutPeriode: Date;
  @Input() finPeriode: Date;
  @Input() paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  @Input() listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  /**
   * Différence de nombre de colonne d'un shift redimensionné
   */
  public diffCols = 0;
  /**
   * Composant fils RecapitulatifEmployeComponent
   */
  @ViewChild(RecapitulatifEmployeComponent) recapEmployee: RecapitulatifEmployeComponent;
  /**
   * mettre à jour la liste des shifts to update dans le composant parent
   */
  @Output() updateShiftAfterResize: EventEmitter<{ shiftToUpdate: ShiftModel, gridsterItem: GridsterItem, oldShift: ShiftModel, submitUpdate: boolean, vueSemaine: boolean, copyEvent: boolean }> = new EventEmitter();
  @Output() updateEmployeeSummary: EventEmitter<{ diffCols: number, employeToUpdate: EmployeeModel }> = new EventEmitter();
  @Output() deleteShiftEvent = new EventEmitter();
  @Output() columnWidthFromWeek = new EventEmitter();
  @Input() weekEmployeeSummary: Periode;
  @Input() monthEmployeeSummary: Periode;
  public datePipe = new DatePipe('en-US');
  /**
   * Composant gridster
   */
  private gridster: GridsterComponentInterface;
  updatetdDateJournee: any;

  public colorBrightDarker = 90;

  public draggingItemSemaine: GridsterItemComponent;

  /**
   * valeurs de l'axe des employées
   */
  public _employee: EmployeeModel;
  public columnWidth: any;

  /**
   * Récupérer l'employé à partir du parent
   */
  get employee(): EmployeeModel {
    return this._employee;
  }

  @Input()
  set employee(val: EmployeeModel) {
    this._employee = val;
  }

  /**
   * planning envoyé par le serveur
   */
  public _weeklyPlanning: ShiftModel[];

  /**
   * Récupérer le Planning à partir du parent
   */
  get weeklyPlanning(): ShiftModel[] {
    return this._weeklyPlanning;
  }

  @Input()
  set weeklyPlanning(val: ShiftModel[]) {
    this._weeklyPlanning = val;
  }

  /**
   * Planning détaillé de la semaine
   */
  public _weeklyDetailsPlanning: WeekDetailsPlanning[] = [];

  /**
   * Récupérer le Planning détaillé de la semaine à partir du parent
   */
  get weeklyDetailsPlanning(): WeekDetailsPlanning[] {
    return this._weeklyDetailsPlanning;
  }

  public _weekDates: any[] = [];

  private modeAffichage = 0;

  @Input()
  set setModeAffichage(modeAffichage: number) {
    this.modeAffichage = modeAffichage;
  }

  public dragAction = false;

  /**
   * constructeur de la classe
   * @param planningEquipierService service PlanningEquipierService
   * @param shiftService service ShiftService
   * @param service BrightnessColorShiftService
   */
  constructor(
    private dateService: DateService,
    private brightnessColorShiftService: BrightnessColorShiftService,
    private shiftService: ShiftService,
    private contrainteSocialeService: ContrainteSocialeService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private helperService: HelperService,
    private globalSettings: GlobalSettingsService,
    private planningLockService: PlanningLockService,
    private datePipeSemaine: DatePipe,
    private domControlService: DomControlService,
    private planningHourLabelFulldayService: PlanningHourLabelFulldayService,
    private limitDecoupageService: LimitDecoupageFulldayService,
    private plgEquipierHelperService: PlgEquipierHelperService) {
  }

  /**
   * Tableau avec les dates de la semaine
   */
  get weekDates(): string[] {
    return this._weekDates;
  }

  @Input()
  set weekDates(val: string[]) {
    if (val) {
      this._weekDates = val;
      this.buildGrid();

    }

  }

  /**
   * Numéro de semaine
   */
  public _weekNumber: number;
  /**
   * nombres de cellules à soustraire de la fin du grille de découpage
   */
  @Input() endMinutesCells: number;
  /**
   * nombres de cellules à soustraire du debut du grille de découpage
   */
  @Input() startMinutesCells: number;
  @Input() minutesToSubstructFin: number;

  /**
   * Récupérer le numéro de la semaine à partir du parent
   */
  get weekNumber(): number {
    return this._weekNumber;
  }

  @Input()
  set weekNumber(val: number) {
    this._weekNumber = val;
  }

  public _shiftToUpdate: GridsterItem;

  /**
   * Récupérer le shift à modifier du parent
   */
  get shiftToUpdate(): GridsterItem {
    return this._shiftToUpdate;
  }

  public menuOpened = false;
  public menuState = false;

  public clone = rfdc();

  private ecran = 'VPE';
  @Input() lockState: boolean;

  @Input()
  set weeklyDetailsPlanning(val: WeekDetailsPlanning[]) {
    this.addAChevalShifts(val);
    this._weeklyDetailsPlanning = val;
    this.buildGrid();

  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(domControlService: DomControlService, ecran: string): boolean {
    return domControlService.deleteListControl(ecran);
  }

  public updateButtonControl(domControlService: DomControlService, ecran: string): boolean {
    return domControlService.updateListControl(ecran);
  }

  @Input()
  set shiftToUpdate(shift: GridsterItem) {
    this._shiftToUpdate = shift;
    if (this._shiftToUpdate) {
      this._shiftToUpdate.isOverIndisponibilte = this.IsShiftDropedOverIndisponibility(this._shiftToUpdate.x, this._shiftToUpdate.cols, this._shiftToUpdate.y);

      // REMOVE FIRST PART OF SHIFT A CHEVAL?????
      const indexShiftToUpdateInListItems = this.data.findIndex(item => item.idShift === this._shiftToUpdate.idShift && item.modifiable === this._shiftToUpdate.modifiable);
      if (indexShiftToUpdateInListItems !== -1) {
        this.data.splice(indexShiftToUpdateInListItems, 1);
      }
      this.data.push(this._shiftToUpdate);


      // if (shift.selectedShift) {
      //   const indexShiftToUpdateInOtherDay = this.data.findIndex(item => item.idShift === this._shiftToUpdate.idShift && item.modifiable === !this._shiftToUpdate.modifiable);
      //   if (shift.acheval) {
      //     if (indexShiftToUpdateInOtherDay !== -1) {
      //       const otherDayShift = this.data[indexShiftToUpdateInOtherDay];
      //       if (shift.modifiable) {
      //         // update shift j+1
      //         otherDayShift.hdf = shift.selectedShift.heureFinCheval;
      //         otherDayShift.cols = this.dateService.convertDurationToColsNumber(otherDayShift.hdd, otherDayShift.heureDebutIsNight, otherDayShift.hdf, otherDayShift.heureFinIsNight);
      //       } else {
      //         // update shift j
      //         otherDayShift.hdd = shift.selectedShift.heureDebutCheval;
      //         otherDayShift.cols = this.dateService.convertDurationToColsNumber(otherDayShift.hdd, otherDayShift.heureDebutIsNight, otherDayShift.hdf, otherDayShift.heureFinIsNight);
      //         // *****************************************************
      //         let dateJour : any;
      //         this.weeklyDetailsPlanning.forEach((wdp: WeekDetailsPlanning) => {
      //           if(wdp.shifts.some((sh: ShiftModel) => (sh.idShift === shift.idShift) && (sh.modifiable === !shift.modifiable)))
      //           {
      //             dateJour = wdp.dateJour;
      //           }
      //          });
      //         if(dateJour){
      //           const indexJour = this.weeklyDetailsPlanning.findIndex((wdp: WeekDetailsPlanning)=> wdp.dateJour === dateJour);
      //           if (indexJour !== -1) {
      //             const indexShiftInPreviousDay = this.weeklyDetailsPlanning[indexJour].shifts.findIndex(value => value.idShift === this._shiftToUpdate.idShift);
      //             const shiftAChevalToUpdate = this.weeklyDetailsPlanning[indexJour].shifts[indexShiftInPreviousDay];
      //             this.weeklyDetailsPlanning[indexJour].shifts.splice(indexShiftInPreviousDay, 1);
      //             if((indexJour + 1) < 6){
      //               this.weeklyDetailsPlanning[indexJour + 1].shifts.push(shiftAChevalToUpdate);
      //             }
      //             // this.weeklyDetailsPlanning[indexJour].shifts[indexShiftInPreviousDay]

      //             // this.weeklyDetailsPlanning[indexJour].shifts[indexShiftInPreviousDay].heureDebutCheval = shift.selectedShift.heureDebutCheval;
      //             // this.weeklyDetailsPlanning[indexJour].shifts[indexShiftInPreviousDay].heureFinCheval = shift.selectedShift.heureFinCheval;
      //           }
      //         }
      //    // *******************************************
      //       }
      //       this.data.splice(indexShiftToUpdateInOtherDay, 1);
      //       this.data.push(otherDayShift);
      //     }
      //   } else {

      // case shift n'est plus a cheval
      // const indexShiftToUpdateInOtherDay = this.data.findIndex(item => item.idShift === this._shiftToUpdate.idShift && item.modifiable === !this._shiftToUpdate.modifiable);

      //   if (indexShiftToUpdateInOtherDay !== -1) {
      //     this.data.splice(indexShiftToUpdateInOtherDay, 1);
      //     const indexJour = this.weeklyDetailsPlanning.findIndex(value => value.dateJour === this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd'));
      //     if (indexJour < 6 && indexJour !== -1) {
      //       const indexShiftInNextDay = this.weeklyDetailsPlanning[indexJour + 1].shifts.findIndex(value => value.idShift === shift.idShift);
      //       if (indexShiftInNextDay !== -1) {
      //         this.weeklyDetailsPlanning[indexJour + 1].shifts.splice(indexShiftInNextDay, 1);
      //       }
      //       if (indexJour !== 0) {
      //         const indexShiftInPreviousDay = this.weeklyDetailsPlanning[indexJour - 1].shifts.findIndex(value => value.idShift === shift.idShift);
      //         if (indexShiftInPreviousDay !== -1) {
      //           this.weeklyDetailsPlanning[indexJour + 1].shifts.splice(indexShiftInPreviousDay, 1);

      //         }
      //       }
      //     }
      //   }

      // }
      //   this.buildGrid();
      // }

      if (this._shiftToUpdate.acheval) {
        this.buildGrid();
      }

      if (this.listShiftWithSignForWeekOrDay && this.listShiftWithSignForWeekOrDay.length) {
        this.listShiftWithSignForWeekOrDay.forEach((shiftDisplay: ShiftModel) => {
          this.data.forEach((element: any) => {
            if (shiftDisplay.idShift === element.idShift) {
              element.sign = shiftDisplay.sign;
              if (element.sign) {
                element.colorSign = this.brightnessColorShiftService.LightenDarkenColor(shiftDisplay.positionTravail.couleur, this.colorBrightDarker);
              } else {
                element.colorSign = shiftDisplay.positionTravail.couleur;

              }
            }
          });
        });
      }
    }
  }

  public tooltipStyle = {
    top: '',
    buttom: 30,
    isFlagTop: false,
    right: 10
  };


  public tooltipStyleRight = {
    top: '',
    buttom: 15,
    isFlagTop: false,
    right: -80
  };

  /**
   * Initialisation du composant
   */
  async ngOnInit() {
    this.buildGrid();
    this.menuState = this.globalSettings.menuIsOpen;
    this.menuOpened = this.menuState;
    this.globalSettings.onToggleMenu().subscribe(menuState => {
      this.menuState = menuState;
      if (!this.menuState) {
        setTimeout(() => {
          this.menuOpened = this.menuState;
        }, 500);
      } else {
        this.menuOpened = this.menuState;
      }
    });

  }

  /**
   * Ajouter un listner sur les mouvement de la souris sur l'écran pour faire défiler l'écran lors d'un drag&drop
   * @param event évènement
   */
  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    if (this.gridster && this.gridster.dragInProgress) {
      const footerHeight = document.getElementById('footer').clientHeight;
      const down = (window.innerHeight - event.clientY) < (80 + footerHeight);
      const up = event.clientY < 300;
      const rhisContainer = document.getElementsByClassName('content-planning-equipier')[0];
      const oldScrollTop = rhisContainer.scrollTop;
      if (up || down) {
        const baseIncrement = 20;
        const baseIncrementSemaine = 40;
        const increment = (up ? -baseIncrementSemaine : baseIncrement);
        rhisContainer.scrollTop = rhisContainer.scrollTop + increment;
        if (rhisContainer.scrollTop !== oldScrollTop) {
          this.draggingItemSemaine.drag.diffTop = this.draggingItemSemaine.drag.diffTop - increment; // composant element position for scroll
        }
      }
      if (this.menuOpened) {
        const left = event.clientX > (window.innerWidth - 230);
        const right = (event.clientX - window.innerWidth) < 230;
        const baseIncrementHorizontal = 5;
        const incrementLeftRight = (left ? baseIncrementHorizontal : -baseIncrementHorizontal);
        const oldScrollLeft = rhisContainer.scrollLeft;
        if (left || right) {
          rhisContainer.scrollLeft += incrementLeftRight;
          if (rhisContainer.scrollLeft !== oldScrollLeft) {
            this.draggingItemSemaine.drag.diffLeft = this.draggingItemSemaine.drag.diffLeft - incrementLeftRight;
          }
        }
      }
    }
  }

  /**
   * Après la création de la vue
   */
  ngAfterViewInit(): void {
    // Affichage des indisponibilités
    let columnWidth: any;
    if ((document.getElementById('day-gridster1')
      .getElementsByClassName('gridster-column')[0] as HTMLElement)) {
      this.columnWidth = (document.getElementById('day-gridster1')
        .getElementsByClassName('gridster-column')[0] as HTMLElement).style.width;
      columnWidth = this.columnWidth;
    }
    this.columnWidthFromWeek.emit(this.columnWidth);
    const indisponibilities: any[] = [];
    const absences: any[] = [];
    this.weeklyDetailsPlanning.forEach(weeklyDetailsPlg => {
      const position = this._weekDates.indexOf(weeklyDetailsPlg.dateJour) * 3;

      weeklyDetailsPlg.indisponibiliteEmployees.forEach((indispo: Indisponibilite) => {
        if (indispo.fromAbsence) {
          this.dateService.setCorrectTimeToDisplayForShift(indispo);
          this.dateService.resetSecondsAndMilliseconds(indispo.heureDebut);
          this.dateService.resetSecondsAndMilliseconds(indispo.heureFin);
          const cols = this.plgEquipierHelperService.convertDurationToColsNumber(indispo.heureDebut, indispo.heureDebutIsNight, indispo.heureFin, indispo.heureFinIsNight);
          if (cols > 0) {
            absences.push({
              cols: cols,
              rows: 2,
              y: position,
              x: this.plgEquipierHelperService.convertStartTimeToPosition(indispo.heureDebut, indispo.heureDebutIsNight, this.debutJourneeActivite),
              libelleAbsence: weeklyDetailsPlg.libelleAbsence,
              dureeTotalAbsence: weeklyDetailsPlg.totalAbsence
            });
          }
        } else {
          const allDayIndispo = weeklyDetailsPlg.indisponibiliteEmployees.find((indispo: Indisponibilite) => (indispo.heureDebut === this.debutJourneeActivite.value && indispo.heureFin === this.finJourneeActivite.value) && (!indispo.fromAbsence && !indispo.fromJourRepos));
          if (allDayIndispo) {
            let cellesToRemove = 0;
            if (this.endMinutesCells) {
              cellesToRemove = 4 - this.endMinutesCells;
            }
            indisponibilities.push({
              cols: this.hours.length * 4 - cellesToRemove, // nombre de colonne de 15 minutes par 24 heures
              rows: 2,
              y: position,
              x: 0
            });
          } else {
            this.dateService.setCorrectTimeToDisplayForShift(indispo);
            this.dateService.resetSecondsAndMilliseconds(indispo.heureDebut);
            this.dateService.resetSecondsAndMilliseconds(indispo.heureFin);
            const cols = this.plgEquipierHelperService.convertDurationToColsNumber(indispo.heureDebut, indispo.heureDebutIsNight, indispo.heureFin, indispo.heureFinIsNight);
            if (cols > 0) {
              indisponibilities.push({
                cols: cols,
                rows: 2,
                y: position,
                x: this.plgEquipierHelperService.convertStartTimeToPosition(indispo.heureDebut, indispo.heureDebutIsNight, this.debutJourneeActivite)
              });
            }
          }
        }
      });

    });
    indisponibilities.forEach(ind => {
      const node = document.createElement('div');
      node.style.cssText = ` background: linear-gradient(312deg, #c8c8c8 2.5%, #fff 2.5%, #fff 47.5%, #c8c8c8 47.5%, #c8c8c8 52.5%, #fff 52.5%, #fff 97.5%, #c8c8c8 97.5%);
        background-size: 6px 6px;
        background-position: 50px 50px;
        height: 100%;
        position: absolute;`;
      node.style.width = (+(columnWidth.slice(0, -2)) * ind.cols).toString() + 'px';
      node.style.left = (+(columnWidth.slice(0, -2)) * ind.x).toString() + 'px';
      node.style.borderRadius = '5px 5px 0px 0px';
      node.style.border = '1px solid #C8C7C4';
      node.style.borderBottom = '0';
      document.getElementById('employee-details-grid').getElementsByClassName('gridster-row')[ind.y].appendChild(node);
      const node2 = document.createElement('div');
      node2.style.cssText = `background: linear-gradient(312deg, #c8c8c8 2.5%, #fff 2.5%, #fff 47.5%, #c8c8c8 47.5%, #c8c8c8 52.5%, #fff 52.5%, #fff 97.5%, #c8c8c8 97.5%);
        background-size: 6px 6px;
        background-position: 47px 50px;
        height: 100%;
        position: absolute;`;
      node2.style.width = (+(columnWidth.slice(0, -2)) * ind.cols).toString() + 'px';
      node2.style.left = (+(columnWidth.slice(0, -2)) * ind.x).toString() + 'px';
      node2.style.border = '1px solid #C8C7C4';
      node2.style.borderTop = '0';
      node2.style.borderRadius = '0px 0px 5px 5px';
      document.getElementById('employee-details-grid').getElementsByClassName('gridster-row')[ind.y + 1]
        .appendChild(node2);
    });
    absences.forEach(abs => {
      const node = document.createElement('div');
      node.style.cssText = `
      height: 100%;
      position: absolute;
      background: #f7f7f7;`;
      node.style.width = (+(columnWidth.slice(0, -2)) * abs.cols).toString() + 'px';
      node.style.left = (+(columnWidth.slice(0, -2)) * abs.x).toString() + 'px';
      node.style.borderRadius = '5px 5px 0px 0px';
      node.style.border = '2px dashed rgb(200 199 196)';
      node.style.borderBottom = '0';
      if (this.shiftService.canDisplayLibelle(abs.y, abs.x, 16, this.data)) {
        node.innerHTML = '<div size="1" style="position: absolute;top: 0;font-size: 9px;color: #414141;font-weight: bold;left: 5px;line-height: 9px;">' + abs.libelleAbsence + '</div>';
      } else {
        node.innerHTML = '<div size="1" style="position: absolute;top: 0;font-size: 9px;color: #414141;font-weight: bold;right: 10px;line-height: 9px;">' + abs.libelleAbsence + '</div>';
      }
      document.getElementById('employee-details-grid').getElementsByClassName('gridster-row')[abs.y].appendChild(node);
      const node2 = document.createElement('div');
      node2.style.cssText = `;
      height: 100%;
      position: absolute;
      background: #f7f7f7;`;
      node2.style.width = (+(columnWidth.slice(0, -2)) * abs.cols).toString() + 'px';
      node2.style.left = (+(columnWidth.slice(0, -2)) * abs.x).toString() + 'px';
      node2.style.border = '2px dashed rgb(200 199 196)';
      node2.style.borderTop = '0';
      node2.style.borderRadius = '0px 0px 5px 5px';
      document.getElementById('employee-details-grid').getElementsByClassName('gridster-row')[abs.y + 1]
        .appendChild(node2);
    });
  }

  /**
   * Construction de la grille de la semaine pour un employé
   */
  public buildGrid() {
    // récuperer le planning à partir du seveur
    // créer la grille
    this.buildDatesAxis();
    this.buildShifts();
    this.timeAxisCellWidth = Math.trunc(100 / (this.hours.length - 1)).toString() + '%';
    this.gridsterHeight = '210px'; // hauteur d'une ligne (50) * nombre de jours (7)
    this.options = GRIDSTER_EMPLOYEE_OPTIONS;
    let cellesToRemove = 0;
    if (this.endMinutesCells) {
      cellesToRemove = 4 - this.endMinutesCells;
    }
    this.options.minCols = this.hours.length * 4 - cellesToRemove;
    this.options.maxCols = this.hours.length * 4 - cellesToRemove;
    this.options.minRows = 21; // nombre de jours * 3
    this.options.maxRows = 21;
    this.options.itemChangeCallback = (gridsterItem) => this.onItemChangeSemaine(gridsterItem);
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
    this.options.draggable.start = (item, gridsterItem, event) => this.dragStart(item, gridsterItem, event);
    this.options.draggable.stop = (item, gridsterItem, event) => this.dragStop(item, gridsterItem, event);
    this.options.initCallback = gridsterComponent => this.initGrid(gridsterComponent);
  }

  private checkIfNewDayIsACheval(item: any, gridsterItem: any): boolean {
    if (this.modeAffichage === 0 || !item.acheval) {
      return true;
    }
    const oldDay = this._weekDates[item.y / 3];
    const newDay = this._weekDates[gridsterItem.$item.y / 3];
    if (oldDay === newDay) {
      return true;
    }
    return ((this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichage, new Date(oldDay), this.dateService).updatedModeAffichage) !== 0);
  }

  /**
   * Déterminer le nombre d'heures totales pour une journée
   */
  public getTotalHoursForDay(): void {

    this.datesAxis.forEach((element: any, index: number) => {
      let dayShifts: ShiftModel[] = [];
      dayShifts = this.getShiftInthisDay(index);
      let totalMinutes = 0;
      let totalInDay = 0;
      let totalCurrent = 0;
      let totalCureentFixe = 0;
      let employeHasAbsence = false;
      let calculeTempsPlannifieAbsence = 0;

      let totalCurrentAcheval = 0;
      let totalCureentFixeAcheval = 0;
      let timeToSubstructCurrent = false;
      let dateDebut = this.clone(this._weekDates[0]);
      dateDebut = new Date(dateDebut);
      this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
        if (weeklyDetailsPlg.dateJour === this._weekDates[index] && weeklyDetailsPlg.libelleAbsence !== '') {
          employeHasAbsence = true;
          totalMinutes = weeklyDetailsPlg.totalAbsence;
        }
        if (this.paramMode === 2 && (weeklyDetailsPlg.dateJour === this._weekDates[index - 1] && weeklyDetailsPlg.libelleAbsence !== '')) {
          dayShifts = dayShifts.filter((val: any) => (!val.acheval || (val.acheval && val.modifiable)));
        }
      });
      if (dayShifts && dayShifts.some((sh: ShiftModel) => sh.shiftFromAbsence) || employeHasAbsence) {
        if (this.paramMode === 2) {
          dayShifts = dayShifts.filter((val: any) => (val.acheval && !val.modifiable));
          calculeTempsPlannifieAbsence = dayShifts && dayShifts.length ? totalMinutes : 0;
        } else {
          dayShifts = [];
        }

      }

      if (dayShifts && dayShifts.length) {
        const shiftPreviousWeek = this.clone(dayShifts[0]);
        if (this.paramMode === 2 && shiftPreviousWeek.acheval && !shiftPreviousWeek.modifiable && this._employee.checkAbsenceDayPreviousWeek && moment(this.dateService.setTimeNull(moment(shiftPreviousWeek.dateJournee).add(1, 'days'))).isSame(this.dateService.setTimeNull(dateDebut))) {
          dayShifts = dayShifts.filter((val: any) => (!val.acheval || (val.acheval && val.modifiable)));

        }
        totalMinutes = 0;
        dayShifts.forEach((shift: ShiftModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);
        });
        if (this._employee.contrats.length) {
          const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(this._employee);
          this.helperService.verificationContraintMaxShiftWithoutBreakInListShift(this._employee.loiEmployee, this._employee.contrats[0].tempsPartiel, employeeMineur, dayShifts);
          this.shiftService.sortListShift(dayShifts);
          dayShifts.forEach((shiftDisplay: ShiftModel, indexDisplay: number) => {
            this.data.forEach((element: any) => {
              if (shiftDisplay.idShift === element.idShift) {
                element.sign = shiftDisplay.sign;
                if (element.sign) {
                  element.colorSign = this.brightnessColorShiftService.LightenDarkenColor(shiftDisplay.positionTravail.couleur, this.colorBrightDarker);

                } else {
                  element.colorSign = shiftDisplay.positionTravail.couleur;

                }
              }
            });
            timeToSubstructCurrent = false;

            const shift = {...shiftDisplay};
            this.shiftService.getShiftInMode2or1(shift, this._employee, this.weekDates, this.paramMode, this.decoupageHoraireFinEtDebutActivity, this.frConfig, true);
            if (this.modeAffichage === 1 && shiftDisplay.acheval && !shiftDisplay.modifiable) {
              return;
            }
            totalMinutes += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
            totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
            totalCurrent = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
            if (shift.acheval && this.paramMode === 2) {
              totalCurrentAcheval = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
              totalCureentFixeAcheval = totalCurrentAcheval;
            }
            if (this.paramNationaux.payerLeBreak) {
              if (dayShifts.length > 1) {
                let dureeMinBreak;
                let dureeMinBreakLast;
                totalCureentFixe = totalCurrent;
                if (!shift.acheval || this.paramMode !== 2 || (shift.acheval && shift.longer && this.paramMode === 2)) {
                  totalCurrent = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, this._employee, this.paramNationaux, this.listOfBreakAndShift);
                } else if (shift.acheval && !shift.longer && this.paramMode === 2) {
                  totalCureentFixeAcheval = totalCureentFixeAcheval - shift.timeToSubstruct;
                  totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), this._employee, this.paramNationaux, this.listOfBreakAndShift);
                }
                if (dayShifts[indexDisplay + 1]) {
                  const pause = this.dateService.getDiffHeure(dayShifts[indexDisplay + 1].heureDebut, shift.heureFin);
                  dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(this._employee.loiEmployee, this._employee.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(this._employee), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
                }
                if (dayShifts[indexDisplay - 1]) {
                  const pause = this.dateService.getDiffHeure(shift.heureDebut, dayShifts[indexDisplay - 1].heureFin);
                  dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(this._employee.loiEmployee, this._employee.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(this._employee), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
                }
                // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
                if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
                  totalInDay = totalInDay - totalCureentFixe;
                }
                if ((totalCurrent < totalCureentFixe || totalCurrentAcheval < totalCureentFixeAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
                  if (!shift.acheval || this.paramMode !== 2 || (shift.acheval && shift.longer && this.paramMode === 2)) {
                    totalInDay = totalInDay - totalCureentFixe;
                    totalMinutes = totalMinutes - totalCureentFixe;
                    totalMinutes = totalMinutes + totalCurrent;
                  } else if (shift.acheval && totalCurrentAcheval < totalCureentFixeAcheval) {
                    timeToSubstructCurrent = true;
                    totalInDay -= shift.timeToSubstruct;
                    totalMinutes -= shift.timeToSubstruct;
                    totalInDay = totalInDay - totalCureentFixeAcheval;
                    totalMinutes = totalMinutes - totalCureentFixeAcheval;
                    totalMinutes = totalMinutes + totalCurrentAcheval;
                  }
                  if (dayShifts[indexDisplay - 1]) {
                    const shiftTobreak = {...dayShifts[indexDisplay - 1]};
                    const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
                    totalInDay = totalInDay - nbrHourLast;
                  }
                } else if (dayShifts[indexDisplay - 1] && (!dayShifts[indexDisplay + 1] || !dureeMinBreak)) {
                  const shiftTobreak = {...dayShifts[indexDisplay - 1]};
                  if (shift.acheval && this.paramMode === 2) {
                    timeToSubstructCurrent = true;
                    totalMinutes -= shift.timeToSubstruct;
                    if (totalInDay) {
                      totalInDay -= shift.timeToSubstruct;
                    }
                  }
                  totalMinutes = this.shiftService.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, dayShifts.length, totalMinutes, this._employee, this.paramNationaux, this.listOfBreakAndShift).totalMinutes;
                  totalInDay = 0;
                }
              } else if (dayShifts.length === 1) {
                if (!shift.acheval || this.paramMode !== 2 || (shift.acheval && shift.longer && this.paramMode === 2)) {
                  totalMinutes = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalMinutes, this._employee, this.paramNationaux, this.listOfBreakAndShift);
                } else if (shift.acheval && !shift.longer && this.paramMode === 2) {
                  totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), this.clone(this._employee), this.paramNationaux, this.listOfBreakAndShift);
                  totalMinutes = totalCurrentAcheval;
                  timeToSubstructCurrent = true;
                }
              }
            }
            if (shift.acheval && this.paramMode === 2 && !timeToSubstructCurrent) {
              totalMinutes -= shift.timeToSubstruct;
              if (totalInDay) {
                totalInDay -= shift.timeToSubstruct;
              }
            }
          });
        }
      }
      element.tempsPlanifie = this.dateService.convertNumberToTime(totalMinutes + calculeTempsPlannifieAbsence);
    });

  }

  /**
   * Supprimer un shift
   * @param $event evenement émis
   * @param item shift à supprimer
   */
  public async removeItem($event: any, item: any) {
    if (!this.lockState && this.deleteButtonControl(this.domControlService, this.ecran)) {
      $event.preventDefault();
      $event.stopPropagation();
      let shifts: ShiftModel[] = [];
      this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
        shifts = shifts.concat(weeklyDetailsPlg.shifts);
      });
      const indexItemToRemove = this.data.findIndex(element => element.idShift === item.idShift);
      this.data.splice(indexItemToRemove, 1);
      this.deleteShiftEvent.emit(item);
      // this.recapEmployee.updateEmployeeSummary(0);
      await this.scrollToEmployee(this.employee.idEmployee, 1);
    }
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
  }

  public updateSummary(diffCols: number): void {
    this.recapEmployee.updateEmployeeSummary(diffCols);
  }

  private dragStart(item: any, gridsterItem: any, event: any) {
    this.draggingItemSemaine = gridsterItem;
    // if (this.modeAffichage === 1 || this.modeAffichage === 2) {
      this.dragAction = true;
    // }
  }

  /**
   * recuperer les shifts pour une journée donnée
   * @param index
   */
  private getShiftInthisDay(index: number): ShiftModel[] {
    let dayShifts: ShiftModel[] = [];
    this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
      if (weeklyDetailsPlg.dateJour === this._weekDates[index]) {
        dayShifts = dayShifts.concat(weeklyDetailsPlg.shifts);
      }
    });
    return dayShifts;
  }

  /**
   * Déterminer si l'heure est de jour ou de nuit
   * @param x position
   */
  public isNightTime(x: number) {
    const midnightHour = new Date(0, 0, 0, 0);
    const midnightPosition = this.plgEquipierHelperService.convertStartTimeToPosition(midnightHour, true, this.debutJourneeActivite);
    return x >= midnightPosition;
  }

  /**
   * Récupération du composant grille créé par Gridster
   * @param gridsterComponent GridsterComponentInterface
   */
  private initGrid(gridsterComponent: GridsterComponentInterface) {
    this.gridster = gridsterComponent;
  }

  /**
   * Créer l'axe des employées à partir des shifts envoyés par le serveur
   */
  private buildDatesAxis() {
    this.datesAxis = [];
    this.weekDatesToDisplay.forEach((weekDate: any) => {
      const data = {
        date: weekDate
      };
      this.datesAxis.push(data);
    });
    this.getTotalHoursForDay();
  }

  /**
   * return all small shift which have cols < 8
   * @param: item
   */
  public smallShiftHover(item: GridsterItem): boolean {
    return item.cols < 8;
  }

  /**totalMinutes
   * Focus screen on searched employee
   */
  public scrollToEmployee(employeeId: number, resizeDrag: number): void {
    const el = document.getElementById('employee' + employeeId) as HTMLElement;
    const parentPrincipalEl = el.parentElement.parentElement;

    const allEmployees = document.getElementsByClassName('employees-list')[0] as HTMLElement;

    for (let i = 1; i < allEmployees.children.length; i++) {
      if (allEmployees.children[i] === parentPrincipalEl) {
        if (i === 1 || i === 2) {
          el.parentElement.parentElement.parentElement.children[i - 1].scrollIntoView();
        } else {
          if (resizeDrag === 1) {
            allEmployees.children[i].scrollIntoView();
          } else if (resizeDrag === 2) {
            allEmployees.children[i - 1].scrollIntoView();
          }
        }
      }
    }
  }

  /**
   * Méthode appelé quand un item de la grille est redimensionné ou déplacé
   * @param gridsterItem item de la grille
   */
  private async onItemChangeSemaine(gridsterItem: GridsterItem): Promise<void> {
    let submitUpdate = true;
    this.eventCtrl = false;
    if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
      this.eventCtrl = true;
    }
    if (gridsterItem.cols > 0) {
      if (gridsterItem.x < this.startMinutesCells) {
        gridsterItem.cols = gridsterItem.cols - (this.startMinutesCells - gridsterItem.x);
        gridsterItem.x = this.startMinutesCells;
        submitUpdate = false;
      }
      // case fin journee d'activité
      let gridLimit: number;
      if (!this.endMinutesCells) {
        gridLimit = (this.hours.length * 4);
      } else {
        gridLimit = ((this.hours.length - 1) * 4) + this.endMinutesCells;
      }
      if (this.minutesToSubstructFin !== 0) {
        if ((gridsterItem.x + gridsterItem.cols) > gridLimit || this.lockState || !this.updateButtonControl(this.domControlService, this.ecran)) {
          gridsterItem.cols = gridsterItem.cols - (gridLimit - (gridsterItem.x + gridsterItem.cols));
          submitUpdate = false;
          if (this.lockState) {
            this.planningLockService.showPopOfLockedWeek();
          }
        }
      }
      if(this.eventCtrl && this.dragAction){
        submitUpdate = false;
      }
      // convertir la nouvelle position en heure de début et heure de fin puis mettre à jour le label
      let heureDeDebut: string;
      if (gridsterItem.x === this.startMinutesCells) {
        heureDeDebut = this.debutJourneeActivite.value.slice(0, 5);
      } else {
        heureDeDebut = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x, this.debutJourneeActivite);
      }
      let heureDeFin: string;
      if ((gridsterItem.x + gridsterItem.cols) === gridLimit) {
        heureDeFin = this.finJourneeActivite.value.slice(0, 5);
      } else {
        heureDeFin = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x + gridsterItem.cols, this.debutJourneeActivite);
      }
      const datesAxisItem = this._weekDates[gridsterItem.y / 3];
      // Mettre à jour le label du shift
      gridsterItem.timeLabel = heureDeDebut + ' - ' + heureDeFin;
      // Si le shift est déplacé sur une zone d'indisponibilité, afficher le en hachuré
      gridsterItem.isOverIndisponibilte = this.IsShiftDropedOverIndisponibility(gridsterItem.x, gridsterItem.cols, gridsterItem.y);
      // Déterminer si le shift a été déplacé sur une autre ligne ou redimensionné/déplacé sur la même ligne pour le calcul du temps total
      // de la journée et de la semaine
      let shifts: ShiftModel[] = [];
      this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
        shifts = shifts.concat(weeklyDetailsPlg.shifts);
      });
      const shift: ShiftModel = shifts.find((shift: ShiftModel) => shift.idShift === gridsterItem.idShift && shift.modifiable === gridsterItem.modifiable);
      if (shift.employee) {
        shift.employee.weekDetailsPlannings = [];
      }
      const oldShift = JSON.parse(JSON.stringify(shift));
      oldShift.heureDebut = new Date(oldShift.heureDebut);
      oldShift.heureFin = new Date(oldShift.heureFin);
      oldShift.heureDebutCheval = new Date(oldShift.heureDebutCheval);
      oldShift.heureFinCheval = new Date(oldShift.heureFinCheval);
      oldShift.dateJournee = new Date(oldShift.dateJournee);
      // le shift a été redimensionné ou déplacé sur la même ligne
      if (this.lockState || !this.updateButtonControl(this.domControlService, this.ecran) || !gridsterItem.canUpdate) {
        gridsterItem.employee = oldShift.employee;
        gridsterItem.heureDebut = oldShift.heureDebut;
        gridsterItem.heureFin = oldShift.heureFin;
        shift.employee = oldShift.employee;
        shift.heureDebut = oldShift.heureDebut;
        shift.heureFin = oldShift.heureFin;
        this.buildGrid();
        if (this.lockState) {
          this.planningLockService.showPopOfLockedWeek();
        }
      } else {
        if (shift.shiftFromAbsence) {
          this.diffCols = gridsterItem.cols;
        } else {
          this.diffCols = gridsterItem.cols
            - this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
        }
        // Update employee summary after save confirmation
        this.updateEmployeeSummary.emit({diffCols: this.diffCols, employeToUpdate: shift.employee});
        shift.totalHeure = shift.totalHeure + (this.diffCols * 15);
        shift.heureDebut = heureDeDebut;
        shift.heureDebutIsNight = this.isNightTime(gridsterItem.x);
        shift.heureFin = heureDeFin;
        shift.heureFinIsNight = this.isNightTime(gridsterItem.x + gridsterItem.cols);
        this.dateService.setCorrectTimeToDisplayForShift(shift);
        const oldShiftDate = this.datePipe.transform(shift.dateJournee, 'yyyy-MM-dd');
        this.updateShiftHours(shift, shifts, gridsterItem, heureDeDebut, heureDeFin);
        if (oldShiftDate !== datesAxisItem) {
          // le shift a été déplacé à une autre ligne
          shift.dateJournee = datesAxisItem;
        }
        if (oldShiftDate === datesAxisItem && this.diffCols) {
          this.scrollToEmployee(this.employee.idEmployee, 2);
        } else if ((oldShiftDate !== datesAxisItem) || ((oldShiftDate === datesAxisItem) && !this.diffCols)) {
          this.scrollToEmployee(this.employee.idEmployee, 1);
        }
        this.updatetdDateJournee = shift.dateJournee;
        //bloque resizing shift a cheval à droite
        if (shift.acheval && shift.modifiable && (gridsterItem.x + gridsterItem.cols) < gridLimit) {
          submitUpdate = false;
        }
        this.updateShiftAfterResize.emit({
          shiftToUpdate: shift,
          gridsterItem: gridsterItem,
          oldShift: oldShift,
          submitUpdate: submitUpdate,
          vueSemaine: true,
          copyEvent: this.eventCtrl
        });
      }
    }
  }

  private updateShiftHours(shift: ShiftModel, shifts: ShiftModel[], gridsterItem: GridsterItem, heureDeDebut: string, heureDeFin: string) {
    if (this.modeAffichage !== 0 && gridsterItem.acheval) {
      const shiftOnJ: ShiftModel = shifts.find((sh: ShiftModel) => sh.idShift === gridsterItem.idShift && sh.modifiable === true);
      if (gridsterItem.modifiable) {
        if (this.dragAction) {
          shift.heureDebutCheval = shift.heureDebut;
          shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
          shift.heureFinChevalIsNight = this.isNightTime(gridsterItem.x + (gridsterItem.acheval ? gridsterItem.colACheval : gridsterItem.cols));
          shift.heureFinCheval = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x + (gridsterItem.acheval ? gridsterItem.colACheval : gridsterItem.cols), this.debutJourneeActivite);
          this.dateService.setCorrectTimeToDisplayForShift(shift);
          if (shift.heureFinCheval.getTime() > gridsterItem.hdf.getTime()) {
            shift.heureFin = gridsterItem.hdf;
          } else {
            shift.acheval = false;
            shift.heureFin = shift.heureFinCheval;
          }
        } else {
          shift.heureDebutCheval = shift.heureDebut;
        }
      } else {
        if (this.dragAction) {
          const totalHeure = shiftOnJ.totalHeureACheval;
          const heureDebutShift = new Date(shift.heureFin.getTime() - (totalHeure * 60 * 1000));
          const debutJourneeDateTime = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, this.debutJourneeActivite.value), this.debutJourneeActivite.night);
          if (heureDebutShift.getTime() < debutJourneeDateTime.getTime()) {
            // shift still A cheval
            shift.heureDebut = debutJourneeDateTime;
            shift.heureDebutCheval = heureDebutShift;
          }
        } else {
          // resizing
          if (this.dateService.setStringFromDate(shiftOnJ.heureFin) === heureDeDebut) {
            // resizing heure fin j+1
            shiftOnJ.heureFinCheval = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, shift.heureFin), true);
            this.dateService.resetSecondsAndMilliseconds(shiftOnJ.heureFinCheval);
          }
        }
      }

      if (shift.modifiable) {
        const shiftOnJPlus: ShiftModel = shifts.find((sh: ShiftModel) => sh.idShift === gridsterItem.idShift && sh.modifiable === false);
        shift.heureDebutCheval = shift.heureDebut;
        if (shiftOnJPlus) {
          shiftOnJPlus.heureFin = shift.heureFinCheval;
          shiftOnJPlus.heureFinCheval = shift.heureFinCheval;
        }
        // update gridster items data
        const indexGridItemOnJPlus = this.data.findIndex(value => value.idShift === shift.idShift && value.modifiable === false);
        if (indexGridItemOnJPlus !== -1) {
          const gridItem = this.data[indexGridItemOnJPlus];
          gridItem.hdf = shift.heureFinCheval;
          gridItem.cols = this.plgEquipierHelperService.convertDurationToColsNumber(gridItem.hdd, gridItem.heureDebutIsNight, gridItem.hdf, gridItem.heureFinIsNight);
          gridItem.timeLabel = this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage);
        }
      } else {
        const shiftOnJPlus: ShiftModel = shifts.find((sh: ShiftModel) => sh.idShift === gridsterItem.idShift && sh.modifiable === false);
        if (shiftOnJPlus) {
          // changement dans l'heure de fin
          shift.heureFinCheval = shift.heureFin;
        }
        if (shiftOnJ && !this.dragAction) {
          shift.heureDebutCheval = shiftOnJ.heureDebutCheval;
        }
      }

      shift.colACheval = shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0;
      shift.totalHeureACheval = this.dateService.getDiffHeure(shift.heureFinCheval, shift.heureDebutCheval);
    } else {
      shift.heureDebutCheval = shift.heureDebut;
      shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
      shift.heureFinChevalIsNight = shift.heureFinIsNight;
      shift.heureFinCheval = shift.heureFin;
    }
    this.dragAction = false;
  }

  /**
   * Permettre de dropper des shifts uniquement sur les lignes qui correspondent à un employés (lignes avec background blanc)
   * @param item shift
   * @param gridsterItem item de la grille
   * @param event évènement
   */
  private async dragStop(item: any, gridsterItem: any, event: any) {
    const isAllowed = this.updateButtonControl(this.domControlService, this.ecran);
    const isShiftOutsideDecoupage = gridsterItem.$item.x < this.startMinutesCells;
    const isNewDayACheval = this.checkIfNewDayIsACheval(item, gridsterItem);
    const lock = this.lockState;
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
    return new Promise(function (resolve, reject) {
      if (isShiftOutsideDecoupage || gridsterItem.$item.y % 3 !== 0 || (lock || !isAllowed) || !isNewDayACheval) {
        reject('shift cannot be placed here');
        if (this.lockState) {
          this.planningLockService.showPopOfLockedWeek();
        }
      } else {
        resolve('success');
      }
    });
  }

  /**
   * Vérifier si le shift est dropé dans une zone d'indisponibilité
   * @param x position du shift
   * @param cols nombre de colonne du nouveau shift
   * @param y position du shift
   */
  private IsShiftDropedOverIndisponibility(x: number, cols: number, y: number) {
    const indisponibilities: any = [];
    this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
      weeklyDetailsPlg.indisponibiliteEmployees.forEach((indisponibilite: Indisponibilite) => {
        indisponibilities.push({
          heureDebut: indisponibilite.heureDebut,
          heureDebutIsNight: indisponibilite.heureDebutIsNight,
          heureFin: indisponibilite.heureFin,
          heureFinIsNight: indisponibilite.heureFinIsNight,
          y: this._weekDates.indexOf(weeklyDetailsPlg.dateJour) * 3
        });
      });
    });
    return (indisponibilities.some((indisponibilite: any) => {
      this.dateService.setCorrectTimeToDisplayForShift(indisponibilite);
      const xIndisponibilite = this.plgEquipierHelperService.convertStartTimeToPosition(indisponibilite.heureDebut, indisponibilite.heureDebutIsNight, this.debutJourneeActivite);
      const colsIndisponibilite = this.plgEquipierHelperService.convertDurationToColsNumber(indisponibilite.heureDebut, indisponibilite.heureDebutIsNight,
        indisponibilite.heureFin, indisponibilite.heureFinIsNight);
      const sameLine = indisponibilite.y === y;
      const overlap = ((x + cols > xIndisponibilite && x + cols < xIndisponibilite + colsIndisponibilite)
        || (x < xIndisponibilite + colsIndisponibilite && x > xIndisponibilite)
        || (x < xIndisponibilite && x + cols > xIndisponibilite + colsIndisponibilite)
        || (x > xIndisponibilite && x + cols < xIndisponibilite + colsIndisponibilite));
      return sameLine && overlap;
    }));
  }

  /**
   * Convertir les shifts envoyés par le serveur au format attendu par Gridster
   */
  private buildShifts(): void {
    this.data = [];
    const employeeNew = this.clone(this._employee);
    this.weeklyDetailsPlanning.forEach((weeklyDetailsPlg: WeekDetailsPlanning) => {
      const position = this._weekDates.indexOf(weeklyDetailsPlg.dateJour) * 3;
      let x: number;
      let cols: number;
      weeklyDetailsPlg.shifts.forEach((shift: ShiftModel) => {
        this.dateService.setCorrectTimeToDisplayForShift(shift);
        x = this.plgEquipierHelperService.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight, this.debutJourneeActivite);
        cols = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
        let activeGroupeTravail;
        if (employeeNew.contrats) {
          const employeeWithActifContrat = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(shift.dateJournee), true);
          if (employeeWithActifContrat.contrats && employeeWithActifContrat.contrats.length) {
            activeGroupeTravail = employeeWithActifContrat.contrats[0].groupeTravail;
          } else {
            activeGroupeTravail = this._employee.groupeTravail;
          }
        } else {
          activeGroupeTravail = this._employee.groupeTravail;
        }
        if (shift.employee.hasOwnProperty('plgEquipier') || (!shift.fromPlanningManager && !activeGroupeTravail.plgEquip)) {
          const gridsterItem = {
            cols: cols,
            oldCols: cols,
            rows: 2,
            y: position,
            positionCopy: position,
            x: x,
            color: this.GREY,
            textColor: this.BLACK,
            iconEditShift: this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur),
            label: this.planningHourLabelFulldayService.getShiftLabelValue(shift, this.modeAffichage),
            timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage),
            idShift: shift.idShift,
            employee: shift.employee,
            isOverIndisponibilte: this.IsShiftDropedOverIndisponibility(x, cols, position),
            hdd: shift.heureDebut,
            hdf: shift.heureFin,
            heureDebutIsNight: shift.heureDebutIsNight,
            heureFinIsNight: shift.heureFinIsNight,
            selectedEmployee: shift.employee,
            dragEnabled: false,
            resizeEnabled: false,
            notPlgEquipier: true,
            dateJournee: shift.dateJournee,
            sign: shift.sign,
            colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
            canUpdate: !shift.fromPlanningManager,
            acheval: shift.acheval,
            modifiable: shift.modifiable,
            colACheval: shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0
          };
          if (gridsterItem.cols > 0) {
            this.data.push(gridsterItem);
          }
          ;
        } else {
          const gridsterItem = {
            cols: cols,
            oldCols: cols,
            rows: 2,
            y: position,
            positionCopy: position,
            x: x,
            color: shift.positionTravail.couleur,
            textColor: this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur),
            iconEditShift: this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur),
            label: this.planningHourLabelFulldayService.getShiftLabelValue(shift, this.modeAffichage),
            timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage),
            idShift: shift.idShift,
            employee: shift.employee,
            isOverIndisponibilte: this.IsShiftDropedOverIndisponibility(x, cols, position),
            hdd: shift.heureDebut,
            hdf: shift.heureFin,
            heureDebutIsNight: shift.heureDebutIsNight,
            heureFinIsNight: shift.heureFinIsNight,
            selectedEmployee: shift.employee,
            dateJournee: shift.dateJournee,
            sign: shift.sign,
            colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
            canUpdate: !shift.fromPlanningManager,
            dragEnabled: !shift.acheval && !shift.fromPlanningManager,
            resizeEnabled: shift.acheval ? shift.modifiable : (shift.notActifEquip ? false : !shift.fromPlanningManager),
            notPlgEquipier: shift.notActifEquip,
            acheval: shift.acheval,
            modifiable: shift.modifiable,
            colACheval: shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0
          };
          if (gridsterItem.cols > 0) {
            if ((shift.fromPlanningManager && shift.totalHeure > 7) || !shift.fromPlanningManager) {
              this.data.push(gridsterItem);
            }
          }
        }

      });
    });
  }

  private addAChevalShifts(val: WeekDetailsPlanning[]): void {
    val.forEach((item: WeekDetailsPlanning, index: number) => {
      if (index !== val.length - 1) {
        item.shifts.forEach((sh: ShiftModel) => {
          if (sh.acheval && sh.modifiable) {
            const tmpShift = {...sh};
            tmpShift.dateJournee = new Date(tmpShift.dateJournee.getTime() + (24 * 60 * 60 * 1000));
            tmpShift.heureDebut = tmpShift.heureFin;
            tmpShift.heureDebutIsNight = false;
            tmpShift.heureFin = tmpShift.heureFinCheval;
            tmpShift.heureFinIsNight = false;
            tmpShift.modifiable = false;
            val[index + 1].shifts.push(tmpShift);
          }
        });
      }
    });
  }

  private checkIsItemAChevalOnJ(gridsterItem: GridsterItem) {
    if (gridsterItem.acheval) {
      return !gridsterItem.modifiable;
    }
    return true;
  }
}

