import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {GridsterComponentInterface, GridsterConfig, GridsterItem, GridsterItemComponent} from 'angular-gridster2';
import {GRIDSTER_OPTIONS} from '../../gridster-config';
import * as _ from 'lodash';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {EmployeeService} from 'src/app/modules/home/employes/service/employee.service';
import {DateService} from 'src/app/shared/service/date.service';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {ShiftService} from '../../service/shift.service';
import * as moment from 'moment';
import {WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import {HelperService} from '../../../../../../shared/service/helper.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';
import * as rfdc from 'rfdc';
import {PlanningLockService} from '../../../../../../shared/service/planning-lock.service';
import {DatePipe} from '@angular/common';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {ListShiftsEmployes} from '../../../../../../shared/model/gui/list.shift.employes.model';
import {ProposeAction} from '../../../../../../shared/enumeration/ProposeAction';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {PlanningHourLabelFulldayService} from '../../../../../../shared/service/planning.hour.label.fullday.service';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';
import {PlgEquipierHelperService} from '../../service/plg-equipier-helper.service';
import {LanguageStorageService} from 'src/app/shared/service/language-storage.service';

@Component({
  selector: 'rhis-planning-jour',
  templateUrl: './planning-jour.component.html',
  styleUrls: ['./planning-jour.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningJourComponent implements OnInit, OnChanges {
  private readonly GREY = '#c0bbb0';
  private readonly BLACK = '#414141';
  public absenceStyle2 = `
  height: 100%;
  position: absolute;
  background: #f7f7f7;`;
  public absenceStyle1 = `
  height: 100%;
  position: absolute;
  background: #f7f7f7;`;
  public indispoStyle = `background: linear-gradient(312deg, #c8c8c8 2.5%, #fff 2.5%, #fff 47.5%, #c8c8c8 47.5%, #c8c8c8 52.5%, #fff 52.5%, #fff 97.5%, #c8c8c8 97.5%);
  background-size: 6px 6px;
  background-position: 50px 50px;
  height: 100%;
  position: absolute;`;
  public indispoStyleCondensee = `background: linear-gradient(312deg, #c8c8c8 2.5%, #fff 2.5%, #fff 47.5%, #c8c8c8 47.5%, #c8c8c8 52.5%, #fff 52.5%, #fff 97.5%, #c8c8c8 97.5%);
  background-size: 6px 6px;
  background-position: 47px 50px;
  height: 100%;
  position: absolute;`;
  public colorBrightDarker = 90;
  public listShiftAssigneToEmployes: ListShiftsEmployes = {} as ListShiftsEmployes;
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
  /**
   * Hauteur d'une cellule de la table d'employé
   */
  public employeeItemHeight: string;
  /**
   * valeurs de l'axe du temps
   */
  @Input() hours: string[] = [];
  @Input() startMinutesCells: number;
  @Input() endMinutesCells: number;
  @Input() minutesToSubstructFin: number;
  /**
   * Autoriser le drag et le resize
   */
  @Input() enableDragAndResize: boolean;
  /**
   * Afficher l'axe du temps seulement sur la première grille
   */
  public activLoader = false;
  public activLoaderIndex: number;

  @Input() showTimeAxis: boolean;
  @Input() debutJourneeActivite: any;
  @Input() finJourneeActivite: any;
  @Input() paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  @Input() listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  /**
   * Composant gridster
   */
  public gridster: GridsterComponentInterface;
  /**
   * Shift entrain d'être déplacé
   */
  public draggingItem: GridsterItemComponent;
  /**
   * Employée sélectionné pour l'affichage du planning détaillé
   */
  @Output() selectEmployee: EventEmitter<EmployeeModel> = new EventEmitter();
  @Output() employesActifsWithTotalPlanifieJour: EventEmitter<any[]> = new EventEmitter();
  @Output() employesActifsWithTotalPlanifieSemaine: EventEmitter<any[]> = new EventEmitter();
  /**
   * Fermer le planning d'un employé
   */
  @Output() closeEmployeePlanning: EventEmitter<EmployeeModel> = new EventEmitter();
  /**
   * Employée sélectionné dans la liste déroulante d'ajout
   */
  public employeeToAdd: number;
  /**
   * Index de l'employé à supprimer
   */
  public highlightedEmployeeIndex: number;
  /**
   * Employée supprimé
   */
  public deletedEmployee: EmployeeModel;
  /**
   * Affichage minimal ou non
   */
  public _minimalDisplaye: boolean;
  /**
   * Liste des employées à afficher dans la liste déroulante pour ajouter un nouvel employé
   */
  public newEmployeesToDisplay: any;
  /**
   * Liste des employées récupérée du BE et à envoyer au composant planning equipier
   */
  public newEmployees = [];
  /**
   * Planning trié par employée ou non (par postes)
   */
  public sortByEmployee = true;
  public oldItemData: GridsterItem;
  public employeNotFound = '';
  public decoupageHoraireFinEtDebutActivity: any;
  @Input() public frConfig: any;
  @Input() public weekDates: any;
  @Input() public paramMode: any;


  /**
   * Indexes des valeurs à incrémenter dans le bandeau temps payé
   */
  @Output() increment: EventEmitter<{ incrementIndexes: { index: number, value: number }[], newDayToUpdate?: any, oldDayToUpdate?: any }> = new EventEmitter<{ incrementIndexes: { index: number, value: number }[], newDayToUpdate: any, oldDayToUpdate: any }>();
  /**
   * Indexes des valeurs à décrémenter dans le bandeau temps payé
   */
  @Output() decrement: EventEmitter<{ decrementIndexes: { index: number, value: number }[], newDayToUpdate?: any, oldDayToUpdate?: any }> = new EventEmitter<{ decrementIndexes: { index: number, value: number }[], newDayToUpdate: any, oldDayToUpdate: any }>();
  /**
   * mettre à jour la liste des employées dans le parent
   */
  @Output() updateEmployeesList: EventEmitter<{ employee: EmployeeModel, index: number, confirmAdd: boolean }> = new EventEmitter();
  /**
   * mettre à jour la liste des shifts to update dans le composant parent
   */
  @Output() updateShiftToUpdateList: EventEmitter<{ shiftToUpdate: any, shiftChild: boolean, index: number, idEmployee?: number, listItemToUpdate?: any[] }> = new EventEmitter();
  /**
   * mettre à jour le critère de tri dans le composant parent
   */
  @Output() sortByEmployeeChange: EventEmitter<boolean> = new EventEmitter();
  /**
   * mettre à jour le planning dans le composant parent
   */
  @Output() listShiftChanges: EventEmitter<ShiftModel[]> = new EventEmitter();
  @Output() openUpdatePopup = new EventEmitter();
  @Output() deleteShiftEvent = new EventEmitter();
  @Output() deleteListShiftEvent = new EventEmitter();
  /**
   * mettre à jour la liste des shifts to update dans le composant parent
   */
  @Output() updateShiftAfterResize: EventEmitter<{ shiftToUpdate: ShiftModel, gridsterItem: GridsterItem, oldShift: ShiftModel, oldShiftEmployee: EmployeeModel, submitUpdate: boolean, copyEvent: boolean }> = new EventEmitter();
  @Output() employeesChange: EventEmitter<EmployeeModel[]> = new EventEmitter();
  @Input() selectedDate: any;
  /**
   * mettre à jour la liste des employées dans le parent
   */
  @Output() newEmployeesList: EventEmitter<any> = new EventEmitter();

  /**
   * Afficher / cache les plannings managers
   */
  @Input() displayPlgManagers: boolean;
  @Input() listShiftUpdated: any;


  public sortedShift: ShiftModel[] = [];
  public tooltipStyle = {
    top: '',
    buttom: 15,
    isFlagTop: false,
    right: 10
  };
  public tooltipStyleNomEmployee = {
    top: 0,
    buttom: '',
    isFlagTop: false,
    right: 10
  };
  public openDrpDown = false;

  public tooltipStyleRight = {
    top: '',
    buttom: 15,
    isFlagTop: false,
    right: -80
  };
  public clone = rfdc();

  public menuOpened = false;
  public menuState = false;
  private ecran = 'VPE';
  @Input() lockState: boolean;
  @Output() incrementManagerIndexes: EventEmitter<{ incrementIndexes: { index: number, value: number, dayToUpdate?: any }[] }> = new EventEmitter<{ incrementIndexes: { index: number, value: number, dayToUpdate?: any }[] }>();

  public longeurEmployee: number;

  private modeAffichage = 0;

  private limitDecoupageHours: any;
  public gridLimit: number;
  public eventCtrl= false;
  public applyButtonPostStyle = false;

  @Input()
  set setModeAffichage(modeAffichage: number) {
    this.modeAffichage = modeAffichage;
  }

  public dragAction = false;
  public _newActiveEmployees: EmployeeModel[];
  public _activeEmployeesPerWeek: any;
  public _shiftToAdd: GridsterItem;
  public _listShift: ShiftModel[];
  /**
   * constructeur de la classe
   */
  constructor(
    private employeeService: EmployeeService,
    private dateService: DateService,
    private confirmationService: ConfirmationService,
    private translator: RhisTranslateService,
    private brightnessColorShiftService: BrightnessColorShiftService,
    private shiftService: ShiftService,
    private contrainteSocialeService: ContrainteSocialeService,
    private sharedRestaurant: SharedRestaurantService,
    private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
    private helperService: HelperService,
    private globalSettings: GlobalSettingsService,
    private datePipe: DatePipe,
    private planningLockService: PlanningLockService,
    private domControlService: DomControlService,
    private notificationService: NotificationService,
    private rhisTranslateService: RhisTranslateService,
    private planningHourLabelFulldayService: PlanningHourLabelFulldayService,
    private limitDecoupageService: LimitDecoupageFulldayService,
    private plgEquipierHelperService: PlgEquipierHelperService,
    private languageStorageService: LanguageStorageService,
    private ngZone: NgZone) {
  }
  private getLanguage(): void {
    if (this.languageStorageService.getLanguageSettings() && (this.languageStorageService.getLanguageSettings().value === 'en' || this.languageStorageService.getLanguageSettings().value === 'de')) {
      this.applyButtonPostStyle = true;
  }
}
  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(domControlService, ecran): boolean {
    return domControlService.deleteListControl(ecran);
  }

  public updateButtonControl(domControlService, ecran): boolean {
    return domControlService.updateListControl(ecran);
  }

  public _leftElement: number;

  get leftElement(): number {
    return this._leftElement;
  }

  @Input()
  set leftElement(value: number) {
    this._leftElement = value;
  }

  /**
   * id de la grille
   */
  public _idGrid: number;
  get idGrid(): number {
    return this._idGrid;
  }

  @Input()
  set idGrid(id: number) {
    this._idGrid = id;
  }

  @Input() indisponibilities: any;
  @Input() absences: any;
  @Input() columnWidthFromWeekValue: any;

  /**
   * valeurs de l'axe des employées
   */
  public _employees: EmployeeModel[] = [];

  /**
   * Récupérer la liste des employés à partir du parent
   */
  get employees(): EmployeeModel[] {
    return this._employees;
  }

  @Input()
  set employees(employes: EmployeeModel[]) {
    this._employees = employes;
  }

  /**
   * planning envoyé par le serveur
   */

  /**
   * Récupérer le planning à partir du parent
   */
  get listShift(): ShiftModel[] {
    return this._listShift;
  }

  @Input()
  set listShift(shifts: ShiftModel[]) {
    if (shifts) {
      this._listShift = shifts;
      this.calculateGridHeight();
      this.buildGrid();
      if (this.sortByEmployee) {
        this.sortEmployees();
      } else {
        this.sortShifts();
      }
    }
  }

  /**
   * Récupérer la list des employé actifs avec les infos semaine à partir du parent
   */
  get newActiveEmployees(): EmployeeModel[] {
    return this._newActiveEmployees;
  }

  @Input()
  set newActiveEmployees(employees: EmployeeModel[]) {
    if (employees) {
      this._newActiveEmployees = employees;
    }
  }

  /**
   * Récupérer la list des employé actifs de toute la semaine
   */
  get activeEmployeesPerWeek(): EmployeeModel[] {
    return this._activeEmployeesPerWeek;
  }

  @Input()
  set activeEmployeesPerWeek(employees: EmployeeModel[]) {
    if (employees) {
      this._activeEmployeesPerWeek = employees;
    }
  }

  /**
   * Nouveau shift à ajouter
   */

  /**
   * Récupérer le nouveau shift à ajouter du parent
   */
  get shiftToAdd(): GridsterItem {
    return this._shiftToAdd;
  }

  @Input()
  set shiftToAdd(shift: GridsterItem) {
    this._shiftToAdd = shift;
    if (this._shiftToAdd) {
      // cas d'un shift à cheval ayant X (position) négatif
      if (this._shiftToAdd.x < 0) {
        this._shiftToAdd.x = 0;
      }
      this._shiftToAdd.colACheval = shift.selectedShift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.selectedShift.heureDebutCheval, shift.selectedShift.heureDebutChevalIsNight, shift.selectedShift.heureFinCheval, shift.selectedShift.heureFinChevalIsNight) : 0;
      const indexShiftToUpdateInListItems = this.data.findIndex(item => item.idShift === this._shiftToAdd.idShift);
      if (indexShiftToUpdateInListItems !== -1) {
        if (this._shiftToAdd.selectedEmployee && this._shiftToAdd.selectedEmployee.idEmployee !== null) {
          this._shiftToAdd.y = this._employees.findIndex((val: EmployeeModel) => val.idEmployee === this._shiftToAdd.selectedEmployee.idEmployee) * 3;
        } else {
          if (!this._shiftToAdd.fromUndoResize) {
            this._shiftToAdd.y = this.data[indexShiftToUpdateInListItems].y;
            this._shiftToAdd.positionCopy = this.data[indexShiftToUpdateInListItems].y;
          }
        }
        this.data.splice(indexShiftToUpdateInListItems, 1);
      }
      if (this._shiftToAdd.canUpdate) {
        // if (this._shiftToAdd.selectedEmployee && this._shiftToAdd.selectedEmployee.idEmployee === null) {
        //   this._shiftToAdd.y = this.findNewIndex();
        // }
        this.data.push(this._shiftToAdd);
      } else {
        if (this._shiftToAdd.totalHeure > 7) {
          // if (this._shiftToAdd.selectedEmployee && this._shiftToAdd.selectedEmployee.idEmployee === null) {
          //   this._shiftToAdd.y = this.findNewIndex();
          // }
          this.data.push(this._shiftToAdd);
        }
      }
    }
    this.eventCtrl = false;
  }

  @Input()
  set listShiftToUpdate(shifts: GridsterItem[]) {
    this._listShiftToUpdate = shifts;
    if (this._listShiftToUpdate.length) {
      this._listShiftToUpdate.forEach((itemToUpdate: GridsterItem) => {
        if (itemToUpdate.x < 0) {
          itemToUpdate.x = 0;
        }
        const indexShiftToUpdateInListItems = this.data.findIndex(item => item.idShift === itemToUpdate.idShift);
        if (indexShiftToUpdateInListItems !== -1) {
          if (itemToUpdate.selectedEmployee && itemToUpdate.selectedEmployee.idEmployee !== null) {
            itemToUpdate.y = this._employees.findIndex((val: EmployeeModel) => val.idEmployee === itemToUpdate.selectedEmployee.idEmployee) * 3;
          }
          this.data.splice(indexShiftToUpdateInListItems, 1);
        }
        if (itemToUpdate.canUpdate) {
          this.data.push(itemToUpdate);
        } else {
          if (itemToUpdate.totalHeure > 7) {
            this.data.push(itemToUpdate);
          }
        }

      });

    }
  }

  public _listShiftToUpdate: GridsterItem[];

  get listShiftToUpdate(): GridsterItem[] {
    return this._listShiftToUpdate;
  }

  public buildGrid() {
    // créer la grille
    this.buildEmployeeAxis();
    this.buildShifts();
    this.buildTimeAxis();
    this.timeAxisCellWidth = Math.trunc(100 / (this.hours.length - 1)).toString() + '%';
    this.options = _.cloneDeep(GRIDSTER_OPTIONS);
    let cellesToRemove = 0;
    if (this.endMinutesCells) {
      cellesToRemove = 4 - this.endMinutesCells;
    }
    this.options.minCols = this.hours.length * 4 - cellesToRemove;
    this.options.maxCols = this.hours.length * 4 - cellesToRemove;
    this.options.minRows = this._employees.length * 3;
    this.options.maxRows = this._employees.length * 3;
    this.options.itemChangeCallback = (gridsterItem, event) => this.onItemChange(gridsterItem, event);
    this.options.draggable.stop = (item, gridsterItem, event) => this.dragStop(item, gridsterItem, event);
    this.options.draggable.start = (item, gridsterItem, event) => this.dragStart(item, gridsterItem, event);
    this.options.initCallback = gridsterComponent => this.initGrid(gridsterComponent);
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  /**
   * Nouveau shift à ajouter
   */
  public _selectedEmployee: EmployeeModel;

  /**
   * Récupérer l'employé sélectionné à partir du parent
   */
  get selectedEmployee(): EmployeeModel {
    return this._selectedEmployee;
  }

  @Input()
  set selectedEmployee(employe: EmployeeModel) {
    if (employe) {
      this._selectedEmployee = employe;
      let employeesLength = this._employees.length;
      if (this.showTimeAxis && !this.employees.some(employe => employe.idEmployee === -1)) {
        employeesLength = employeesLength + 1;
      }
      this.employeeItemHeight = '39px';
      this.gridsterHeight = (39 * employeesLength).toString() + 'px';
      this.buildGrid();
    }
  }

  /**
   * Identifiant de l'employé sélctionné dans la popup de recherche
   */
  public _searchedEmployee: EmployeeModel;

  /**
   * Récupérer l'employé sélectionné dans la popup de recherche à partir du parent
   */
  get searchedEmployee(): EmployeeModel {
    return this._searchedEmployee;
  }

  @Input()
  set searchedEmployee(employe: EmployeeModel) {
    this._searchedEmployee = employe;
    if (this._searchedEmployee) {
      this.scrollToEmployee(this._searchedEmployee.idEmployee);
    } else {
      const el = document.getElementsByClassName('highlight-employee-name')[0] as HTMLElement;
      if (el) {
        el.classList.remove('highlight-employee-name');
        el.className.replace('highlight-employee-name', '');
      }
    }
  }

  /**
   * Affichage minimal ou non à partir du boolean envoyé par le composant parent
   */
  get minimalDisplay(): boolean {
    return this._minimalDisplaye;
  }

  @Input()
  set minimalDisplay(isMinimalDisplay: boolean) {
    if (isMinimalDisplay !== null) {
      this._minimalDisplaye = isMinimalDisplay;
      this.calculateGridHeight();
      this.buildGrid();
    }
  }

  @Input() set setDecoupageValues(value: any) {
    if (value) {
      this.decoupageHoraireFinEtDebutActivity = value;
      let dateJournee = JSON.parse(JSON.stringify(this.selectedDate));
      dateJournee = new Date(dateJournee);
      this.limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(value, this.modeAffichage, dateJournee, this.dateService);
      this.modeAffichage = this.limitDecoupageHours.updatedModeAffichage;
    }
  }

  /**
   * Initialisation du composant
   */
  async ngOnInit() {
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
    this.employeNotFound = this.rhisTranslateService.translate('PROPOSE.EMPLOYEE_NOT_FOUND');
    this.getLanguage();
  }

  /**
   * permet de trouver le nouvel index du gridster item apres un tri
   */
  private findNewIndex(): number {
    const indexChauvement = this.data.findIndex(val => val.y === this._shiftToAdd.y);
    if (indexChauvement === -1) {
      return this._shiftToAdd.y;
    } else {
      const oldItemPosition = this.data[indexChauvement];
      if ((oldItemPosition.employee && this._shiftToAdd.employee) && (oldItemPosition.employee.idEmployee === this._shiftToAdd.employee.idEmployee)) {
        //check if shifts chevauchés
        if ((oldItemPosition.x + oldItemPosition.cols <= this._shiftToAdd.x) || (this._shiftToAdd.x + this._shiftToAdd.cols <= oldItemPosition.x)) {
          // Case shifts non chevauchés
          return this._shiftToAdd.y;
        }
      }
      // Case shifts chevauchés
      const indexes = this.data.filter(val => val.isShift).map(val => val.y).sort((y1, y2) => y1 - y2);
      let newY = 3;
      if (indexes.length) {
        if (indexes[0] === 3) {
          newY = -1;

          for (let i = 0; i < indexes.length - 1; i++) {
            if ((indexes[i + 1] - indexes[i]) > 3) {
              newY = indexes[i] + 3;
            }
          }
          if (newY === -1) {
            newY = indexes[indexes.length - 1] + 3;
          }
        }
      }
      return newY;

    }
  }

  /**
   * Alimenter la liste des nouveaux employés
   */
  public getNewEmployees(index: number, idshiftUpdated?): void {
    this.employeeToAdd = null;
    this.newEmployeesToDisplay = [];
    this.newEmployees = [];
    this.activLoader = false;
    if (!this.openDrpDown) {
      this.activLoader = false;
      if (index !== 0) {
        this.activLoader = true;
        this.activLoaderIndex = index;
      }
      this.employeeToAdd = null;
      let shiftsToAssign: ShiftModel[] = [];
      this.data.forEach((item: GridsterItem) => {

        if (item.y === (index * 3) || idshiftUpdated) {

          this.listShift.filter((shift: ShiftModel) => {
            const shiftReference = {...shift};
            if(shiftReference.employee) {
              shiftReference.employee.listShiftForThreeWeek = [];
            }

            if (idshiftUpdated) {
              if (idshiftUpdated === shift.idShift) {
                shiftsToAssign = [];
                shiftsToAssign.push(shiftReference);
              }
            } else {
              if (item.idShift === shiftReference.idShift) {
                if (typeof shiftReference.idShift === 'number') {
                  shiftsToAssign.push(shiftReference);
                } else {
                  shiftReference.idShift = 0;
                  shiftsToAssign.push(shiftReference);
                }
              }
            }
          });
        }
      });
      this.newEmployeesList.emit({
        listEmployees: [],
        idshiftUpdated: idshiftUpdated,
        newEmployees: [],
        loadEditOrAdd: true
      });

      this.addShiftAndActifEmployeToList(shiftsToAssign);
      this.employeeService.getEmployeesWithPlgEquipier(this.dateService.formatToShortDate(this.selectedDate), this.listShiftAssigneToEmployes).subscribe((res: any) => {
        this.newEmployeesToDisplay = [];
        const keys = Object.keys(ProposeAction);
        keys.forEach((key: any) => {
          if (res[key]) {
            let groupedEmployees;
            if (key === ProposeAction.FIRST_GROUP) {
              groupedEmployees = {label: '', items: []};
            } else
              groupedEmployees = {label: this.rhisTranslateService.translate(`PROPOSE.${key}`), items: []};
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
        this.employeeToAdd = null;
        this.activLoader = false;
        if (idshiftUpdated || shiftsToAssign.length === 0) {
          this.newEmployeesList.emit({
            listEmployees: this.newEmployeesToDisplay,
            idshiftUpdated: idshiftUpdated,
            newEmployees: this.newEmployees,
            loadEditOrAdd: false

          });
        }
        this.hideListSpan();
      });
    }
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
   * recupere les employee actif et le shift assigné
   */
  private addShiftAndActifEmployeToList(shiftsToAssign: ShiftModel[]): void {
    this.listShiftAssigneToEmployes.shiftsToAssign = this.clone(shiftsToAssign);
    this.listShiftAssigneToEmployes.shiftsToAssign.forEach((shift: ShiftModel) => {
      shift.idShift = 0;
    });

    this.listShiftAssigneToEmployes.employeesShifts = [];
    this.listShiftAssigneToEmployes.listShiftUpdate = [];
    if (shiftsToAssign && shiftsToAssign.length) {
      let shiftUpdatedwithEmploye = [];
      const listShiftUpdatedFinal = this.clone(this.listShiftUpdated);
      listShiftUpdatedFinal.forEach((shift: ShiftModel) => {
        if (shift.employee) {
          delete shift.employee.weekDetailsPlannings;
          delete shift.employee.employeeWeekShiftCS;
          delete shift.employee.badge;
          delete shift.employee.contrats;
          delete shift.employee.listShiftForThreeWeek;
          delete shift.employee.qualifications;
          delete shift.employee.groupeTravail;
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

  /**
   * Ajouter un employé
   */
  public addEmployee(newLine: boolean, emp: EmployeeModel, shiftPosition?: number, shiftLength?: number): void {
    this.openDrpDown = false;
    const nbEmployeNull = this.employees.filter((employe: EmployeeModel) => employe.idEmployee === null).length;
    const nbLigneSansEmployee = this.data.filter(item => item.isShift && item.employee && item.employee.idEmployee === null).length;
    // Ajouter une ligne vide ou avec shift + liste déroulante des employés à affecter
    if ((newLine || nbEmployeNull <= nbLigneSansEmployee) && emp === null) {
      for (let i = 0; i <= (nbLigneSansEmployee - nbEmployeNull); i++) {
        const employee: EmployeeModel = new EmployeeModel();
        employee.nom = null;
        employee.prenom = null;
        employee.hebdoCourant = null;
        employee.hebdoPlanifie = null;
        employee.idEmployee = null;
        this.employees.splice(1, 0, employee);
        this.employeeToAdd = null;
        this.calculateGridHeight();
        this.buildGrid();
        this.updateEmployeesList.emit({
          employee: employee, index: 1, confirmAdd: false
        });
        this.employeesChange.emit(this.employees);
      }
    } else if (emp !== null) {
      // Ajouter une nouvelle ligne avec le shift créé et l'employé selectionné
      this.employees.splice(1, 0, emp);
      this.employeeToAdd = null;
      this.calculateGridHeight();
      this.buildGrid();
      this.calculatePayedTime(null, null, shiftPosition, shiftLength);
      this.employeesChange.emit(this.employees);
      this.updateEmployeesList.emit({
        employee: emp, index: 1, confirmAdd: false
      });
    }
  }

  /**
   * Ajouter la liste des managers/leaders chargés sur la journee
   */
  public addManager(listManagers: EmployeeModel[]): void {
    if (listManagers && listManagers.length) {
      this.employees = listManagers.concat(this.employees);
    }
    this.employeeToAdd = null;
    this.calculateGridHeight();
    this.buildGrid();
    this.employeesChange.emit(this.employees);
  }

  /**
   * Ajouter la liste des  employés (vides) lors de chargement d'une journee/Semaine de reference
   */
  public addEmployeeChargerJourneeRef(listEmploye: EmployeeModel[]): void {
    if (listEmploye && listEmploye.length) {
      this.employees = listEmploye.concat(this.employees);
    }
    this.calculateGridHeight();
    this.buildGrid();
    this.employeesChange.emit(this.employees);
  }

  /**
   * cette methode permet d'affecter l'employé selectionné à la ligne choisi
   * et lancer la vérification des contrainte sociales avant de l'assigner
   * @param index : number (index de l'employé choisi)
   * @param socialConstraintVerified : boolean (true si les CS sont deja vérifié dans la modification d'un shift via le popup)
   */
  public confirmAddEmployee(index: number, socialConstraintVerified: boolean, shiftToSave?: ShiftModel): void {
    const employeObject = this.newEmployees.find((item: EmployeeModel) => item.idEmployee == this.employeeToAdd);
    // emtyLine refers to the assigned line, if it has no shifts emptyLine = true, if not emptyLine = false
    let emptyLine = true;
    const listShiftToUpdate = [];
    if (!socialConstraintVerified) {
      this.data.forEach((item: GridsterItem) => {
        if (item.y === (index * 3)) {
          this.listShift.forEach((shift: ShiftModel) => {
            if (item.idShift === shift.idShift) {
              emptyLine = false;
              shift.employee = employeObject;
              item.employee = employeObject;
              item.selectedEmployee = employeObject;
              listShiftToUpdate.push(shift);
            }
          });
        }
      });
      this.updateShiftToUpdateList.emit({shiftToUpdate: listShiftToUpdate, shiftChild: true, index: index});
    }
    // if emptyLine = true, the selected line will be assigned to the chosen employee without any Social constrainte check
    if (emptyLine) {
      this.employees.splice(index, 1);
      this.employees.splice(index, 0, employeObject);
      this.data.forEach((item: GridsterItem) => {
        if (item.y === (index * 3)) {
          const shiftIndexToReplace = this.listShift.findIndex((shiftSearched: ShiftModel) => shiftSearched.idShift === shiftToSave.idShift);
          if (shiftIndexToReplace !== -1) {
            this.listShift.splice(shiftIndexToReplace, 1);
            this.listShift.push(shiftToSave);
          }
          this.listShift.forEach((shift: ShiftModel) => {
            if (item.idShift === shift.idShift) {
              emptyLine = false;
              item.employee = employeObject;
              item.selectedEmployee = employeObject;
              listShiftToUpdate.push(shift);
            }
          });
        }
      });
      this.employeesChange.emit(this.employees);
      if (!listShiftToUpdate.length) {
        this.employeeToAdd = null;
      }
      this.updateShiftToUpdateList.emit({shiftToUpdate: listShiftToUpdate, shiftChild: false, index: index});
    }
    this.getDayTotalHoursForEmployee(employeObject,
        this.clone,
        this._listShift,
        this.dateService,
        this.contrainteSocialeService,
        this.employesActifsWithTotalPlanifieJour,
        this._activeEmployeesPerWeek,
        this.shiftService,
        this._newActiveEmployees,
        this.newActiveEmployees,
        this.contrainteSocialeCoupureService,
        this.helperService,
        this.datePipe,
        this.selectedDate,
        this.weekDates,
        this.paramMode,
        this.selectedEmployee,
        this.data,
        this.brightnessColorShiftService,
        this.colorBrightDarker,
        this.decoupageHoraireFinEtDebutActivity,
        this.frConfig,
        this.activeEmployeesPerWeek,
        this.listOfBreakAndShift,
        this.paramNationaux);
    this.updateEmployeesList.emit({employee: employeObject, index: index, confirmAdd: true});
    this.employeeToAdd = null;
  }

  public checkShiftNA(index: number, data: any): boolean {
    return data.some((item: GridsterItem) => item.y === (index * 3) && item.acheval && !item.modifiable);
  }

  /**
   * Modifier l'affectation d'une ligne à un employé par double clique
   */
  public async reAssignEmployee(employee: EmployeeModel, index: number): Promise<void> {
    this.openDrpDown = false;
    const idEmployeeToReassign = JSON.parse(JSON.stringify(employee.idEmployee));

    if (!this.lockState && this.updateButtonControl(this.domControlService, this.ecran)) {
      employee.idEmployee = null;
      employee.nom = null;
      employee.prenom = null;
      const listShiftToUpdate = [];
      const listItemToUpdate = [];
      this.data.forEach((item: GridsterItem) => {
        if (item.y === (index * 3)) {
          this.listShift.forEach((shift: ShiftModel) => {
            if (item.idShift === shift.idShift) {
              if (shift.positionTravail.hasOwnProperty('oldPositionColor')) {
                item.color = shift.positionTravail.oldPositionColor;
                shift.positionTravail.couleur = shift.positionTravail.oldPositionColor;
                item.textColor = this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.oldPositionColor);
                item.iconEditShift = this.brightnessColorShiftService.icontShift(shift.positionTravail.oldPositionColor);
              } else {
                item.color = shift.positionTravail.couleur;
                item.textColor = this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur);
                item.iconEditShift = this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur);
                item.notPlgEquipier = false;
                item.dragEnabled = !shift.acheval;
                item.resizeEnabled = true;
                const employee: EmployeeModel = new EmployeeModel();
                employee.nom = null;
                employee.prenom = null;
                employee.hebdoCourant = null;
                employee.hebdoPlanifie = null;
                employee.idEmployee = null;
                shift.employee = employee;
                item.sign = false;
                item.colorSign = shift.positionTravail.couleur;
                item.employee = employee;
                item.selectedEmployee = employee;

                listItemToUpdate.push(item);
                shift.shiftPrincipale = true;
                shift.notActifEquip = false;
                if (shift.listShiftAssocie) {
                  shift.listShiftAssocie.forEach((assoc: ShiftModel) => {
                    assoc.employee = employee;
                    assoc.shiftPrincipale = true;
                  });
                }
                shift.listShiftAssocie = [];
                listShiftToUpdate.push(shift);
              }
            }
          });

        }
      });
      this.employeeToAdd = null;
      this.employeesChange.emit(this.employees);

      this.updateShiftToUpdateList.emit({
        shiftToUpdate: listShiftToUpdate,
        shiftChild: false,
        index: index,
        idEmployee: idEmployeeToReassign,
        listItemToUpdate: listItemToUpdate
      });
    }
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
  }

  /**
   * Afficher la popup de modification d'un shift
   */
  public async openUpdateShiftForm(data: GridsterItem): Promise<void> {
    if (this.enableDragAndResize && data.resizeEnabled && data.canUpdate && data.modifiable && !this.lockState && this.updateButtonControl(this.domControlService, this.ecran)) {
      data.hasAssociatedShifts = this.data.filter((gridsterItem: GridsterItem) => gridsterItem.y === data.y && gridsterItem.idShift !== data.idShift).length;
      this.openUpdatePopup.emit(data);
    }
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
  }

  /**
   * message de confirmation de suppression d'un shift
   */
  public showConfirmDeleteShift(event: any, item: GridsterItem): void {
    this.confirmationService.confirm({
      message: this.translator.translate('ALERT.WAR_SUPPRESSION'),
      header: this.translator.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteShift(event, item);
      },
      reject: () => {
      }
    });
  }

  /**
   * Supprimer l'employé avec ses shifts
   */
  public deleteEmployee(): void {
    if (this.highlightedEmployeeIndex != null) {
      if (this.selectedEmployee) {
        this.closeEmployeeWeeklyPlanning(this.selectedEmployee);
      }
      this.deletedEmployee = this.employees[this.highlightedEmployeeIndex];
      let deletedShifts = [];
      if (this.deletedEmployee && this.deletedEmployee.idEmployee !== null) {
        this.listShift.forEach((shift: ShiftModel) => {
          if (shift.employee && shift.employee.idEmployee === this.deletedEmployee.idEmployee) {
            deletedShifts.push(shift);
            const position = this.plgEquipierHelperService.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight, this.debutJourneeActivite, shift.heureFin, shift.heureFinIsNight);
            const colsNumber = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
            shift.x = position;
            shift.cols = colsNumber;
          }
        });
        this.deleteListShiftEvent.emit(deletedShifts);
      } else {
        const items = this.data.filter((item: GridsterItem) => item.y === this.highlightedEmployeeIndex * 3);
        this.listShift.forEach((shift: ShiftModel) => {
          if (items.find((item: GridsterItem) => item.idShift === shift.idShift)) {
            this.deleteShiftEvent.emit(shift);
            const position = this.plgEquipierHelperService.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight, this.debutJourneeActivite, shift.heureFin, shift.heureFinIsNight);
            const colsNumber = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
            shift.x = position;
            shift.cols = colsNumber;
          }
        });
      }
      this.employees.splice(this.highlightedEmployeeIndex, 1);
      this.employeesChange.emit(this.employees);
      this.calculateGridHeight();
      this.buildGrid();
      this.highlightedEmployeeIndex = null;
    }
  }

  public getDayTotalHoursForEmployee(employee: EmployeeModel,
                                     clone,
                                     _listShift,
                                     dateService,
                                     contrainteSocialeService,
                                     employesActifsWithTotalPlanifieJour,
                                     _activeEmployeesPerWeek,
                                     shiftService,
                                     _newActiveEmployees,
                                     newActiveEmployees,
                                     contrainteSocialeCoupureService,
                                     helperService,
                                     datePipe,
                                     selectedDate,
                                     weekDates,
                                     paramMode,
                                     selectedEmployee,
                                     data,
                                     brightnessColorShiftService,
                                     colorBrightDarker,
                                     decoupageHoraireFinEtDebutActivity,
                                     frConfig,
                                     activeEmployeesPerWeek,
                                     listOfBreakAndShift,
                                     paramNationaux
                                     ): string {
    let indexEmployee;
    let indexManager;
    let employeHaslaw;
    let totalInDay = 0;
    let totalCurrent = 0;
    let totalCureentFixe = 0;
    let totalMinutes = 0;
    let totalCurrentAcheval = 0;
    let totalCureentFixeAcheval = 0;
    let timeToSubstructCurrent = false;
    let calculeTempsPlannifieAbsence = 0;

    let employeeShifts: ShiftModel[] = clone(_listShift.filter(shift => {
      if (shift.employee !== null) {
        return shift.employee.idEmployee === employee.idEmployee;
      }
    }));

    employeeShifts.forEach((shift: ShiftModel) => {
      dateService.setCorrectTimeToDisplayForShift(shift);
    });
    shiftService.sortListShift(employeeShifts);
    indexEmployee = _newActiveEmployees.findIndex(value => value.idEmployee === employee.idEmployee);
    if (indexEmployee !== -1) {
      employeHaslaw = newActiveEmployees[indexEmployee];
      const employeeMineur = contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);
      helperService.verificationContraintMaxShiftWithoutBreakInListShift(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, employeeShifts);
    } else {
      indexManager = activeEmployeesPerWeek.findIndex(value => value.idEmployee === employee.idEmployee);
      if (indexManager !== -1) {
        employeHaslaw = activeEmployeesPerWeek[indexManager];
        const employeeMineur = contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);
        helperService.verificationContraintMaxShiftWithoutBreakInListShift(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, employeeShifts);
      }
    }
    calculeTempsPlannifieAbsence = 0;
    // prendre en compte ou list shift vide d'ou recuperer total absence
    if (employeHaslaw) {
      const indexDayInWeeklyPlg = employeHaslaw.weekDetailsPlannings.findIndex((val: WeekDetailsPlanning) => val['dateJour'] === datePipe.transform(selectedDate, 'yyyy-MM-dd'));
      const indexDayPreviousInWeeklyPlg = employeHaslaw.weekDetailsPlannings.findIndex((val: WeekDetailsPlanning) => val['dateJour'] === datePipe.transform(moment(selectedDate).subtract(1, 'days'), 'yyyy-MM-dd'));
      if (indexDayInWeeklyPlg !== -1 && employeHaslaw.weekDetailsPlannings[indexDayInWeeklyPlg].libelleAbsence !== '') {
        totalMinutes = employeHaslaw.weekDetailsPlannings[indexDayInWeeklyPlg].totalAbsence;
        if (paramMode === 2) {
          employeeShifts = employeeShifts.filter((val: any) => (val.acheval && !val.modifiable));
          calculeTempsPlannifieAbsence = (employeeShifts && employeeShifts.length) ? totalMinutes : 0;
          totalMinutes = (employeeShifts && employeeShifts.length) ? 0 : totalMinutes;
        } else {
          employeeShifts = [];
        }
      }
      const dates = clone(weekDates);
      const dateDebut = new Date(dates[0]);
      if ((indexDayPreviousInWeeklyPlg !== -1 && employeHaslaw.weekDetailsPlannings[indexDayPreviousInWeeklyPlg].libelleAbsence !== '') ||
          (employeHaslaw.checkAbsenceDayPreviousWeek && moment(dateService.setTimeNull(new Date(clone(selectedDate)))).isSame(dateService.setTimeNull(dateDebut)))) {
        if (paramMode === 2) {
          employeeShifts = employeeShifts.filter((val: any) => (!val.acheval) || (val.acheval && val.modifiable));
        }
      }
    }

    if (paramMode === 1) {
      employeeShifts = employeeShifts.filter((val: any) => ((val.acheval && val.modifiable) || !val.acheval));
    }
    employeeShifts.forEach((shiftDisplay: ShiftModel, index: number) => {
      if (!selectedEmployee) {
        data.forEach((element: any) => {
          if (shiftDisplay.idShift === element.idShift) {
            element.sign = shiftDisplay.sign;
            if (element.sign) {
              element.colorSign = brightnessColorShiftService.LightenDarkenColor(shiftDisplay.positionTravail.couleur, colorBrightDarker);
            } else {
              element.colorSign = shiftDisplay.positionTravail.couleur;

            }

          }
        });
      }
      timeToSubstructCurrent = false;
      const shift = clone(shiftDisplay);
      shiftService.getShiftInMode2or1(shift, employeHaslaw, weekDates, paramMode, decoupageHoraireFinEtDebutActivity, frConfig);

      totalMinutes += dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalInDay += dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      totalCurrent = dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      if (shift.acheval && paramMode === 2) {
        totalCurrentAcheval = dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        totalCureentFixeAcheval = totalCurrentAcheval;
      }
      indexEmployee = _newActiveEmployees.findIndex(value => value.idEmployee === employee.idEmployee);
      indexManager = activeEmployeesPerWeek.findIndex(value => value.idEmployee === employee.idEmployee);
      employeHaslaw = indexEmployee === -1 ? activeEmployeesPerWeek[indexManager] : newActiveEmployees[indexEmployee];
      if (paramNationaux.payerLeBreak && (indexEmployee !== -1 || indexManager !== -1)) {


        if (employeeShifts.length > 1) {
          let dureeMinBreak;
          let dureeMinBreakLast;
          totalCureentFixe = totalCurrent;
          if (!shift.acheval || paramMode !== 2 || (shift.acheval && shift.longer && paramMode === 2)) {
            totalCurrent = shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, employeHaslaw, paramNationaux, listOfBreakAndShift);
          } else if (shift.acheval && !shift.longer && paramMode === 2) {
            totalCureentFixeAcheval = totalCureentFixeAcheval - shift.timeToSubstruct;
            totalCurrentAcheval = shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeHaslaw, paramNationaux, listOfBreakAndShift);
          }
          if (employeeShifts[index + 1]) {
            const pause = dateService.getDiffHeure(employeeShifts[index + 1].heureDebut, shift.heureFin);
            dureeMinBreak = contrainteSocialeService.validDureeMinBreak(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, shiftService.identifierEmployee(employeHaslaw), helperService.getNombreHeureTravaille(+dateService.convertNumberToTime(pause)));

          }
          if (employeeShifts[index - 1]) {
            const pause = dateService.getDiffHeure(shift.heureDebut, employeeShifts[index - 1].heureFin);
            dureeMinBreakLast = contrainteSocialeService.validDureeMinBreak(employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, shiftService.identifierEmployee(employeHaslaw), helperService.getNombreHeureTravaille(+dateService.convertNumberToTime(pause)));

          }
          // si on a shift que ne depasse pas l cs (longuere shift sns break) et qui a un break
          if (totalCurrent === totalCureentFixe && !dureeMinBreak && !dureeMinBreakLast) {
            totalInDay = totalInDay - totalCureentFixe;
          }
          // si le shift courant a un pause
          if ((totalCurrent < totalCureentFixe || totalCurrentAcheval < totalCureentFixeAcheval) && (!dureeMinBreak && !dureeMinBreakLast)) {
            if (!shift.acheval || paramMode !== 2 || (shift.acheval && shift.longer && paramMode === 2)) {
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
            // si le shift courant a un shift precedent
            if (employeeShifts[index - 1]) {
              const shiftTobreak = {...employeeShifts[index - 1]};
              const nbrHourLast = dateService.getDiffHeure(shiftTobreak.heureFinCheval, shiftTobreak.heureDebutCheval);
              totalInDay = totalInDay - nbrHourLast;
            }

          } else if (employeeShifts[index - 1] && (!employeeShifts[index + 1] || !dureeMinBreak)) {
            const shiftTobreak = {...employeeShifts[index - 1]};
            if (shift.acheval && paramMode === 2) {
              timeToSubstructCurrent = true;
              totalMinutes -= shift.timeToSubstruct;
              if (totalInDay) {
                totalInDay -= shift.timeToSubstruct;
              }
            }
            totalMinutes = shiftService.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, employeeShifts.length, totalMinutes, employeHaslaw, paramNationaux, listOfBreakAndShift).totalMinutes;
            totalInDay = 0;
          }
        } else if (employeeShifts.length === 1) {
          if (!shift.acheval || paramMode !== 2 || (shift.acheval && shift.longer && paramMode === 2)) {
            totalMinutes = shiftService.getTotalHoursInDayForShiftWithBreak(totalMinutes, employeHaslaw, paramNationaux, listOfBreakAndShift);
          } else if (shift.acheval && !shift.longer && paramMode === 2) {
            totalCurrentAcheval = shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employeHaslaw, paramNationaux, listOfBreakAndShift);
            totalMinutes = totalCurrentAcheval;
            timeToSubstructCurrent = true;
          }
        }

      }
      if (shift.acheval && paramMode === 2 && !timeToSubstructCurrent) {
        totalMinutes -= shift.timeToSubstruct;
        if (totalInDay) {
          totalInDay -= shift.timeToSubstruct;
        }
      }
      if (employeHaslaw) {
        employeHaslaw.totalPlanifieJournee = totalMinutes;
      }
    });
    employesActifsWithTotalPlanifieJour.emit(indexEmployee === -1 ? _activeEmployeesPerWeek : _newActiveEmployees);
    return dateService.convertNumberToTime(totalMinutes + calculeTempsPlannifieAbsence);
  }

  public getWeekTotalHoursForEmployee(activeEmployeesList?: EmployeeModel[], activeEmployeeListPerWeek?: EmployeeModel[], countManagers?: boolean): void {
    let employeesList: EmployeeModel[];
    let employeesListPerWeek: EmployeeModel[];
    if (activeEmployeeListPerWeek) {
      employeesListPerWeek = activeEmployeeListPerWeek;
    } else {
      employeesListPerWeek = this._activeEmployeesPerWeek;
    }
    if (activeEmployeesList) {
      employeesList = activeEmployeesList;
    } else {
      employeesList = this._newActiveEmployees;
    }
    // todo remove this clones immediatly
    this.calculTotalPlanifie(this.clone(employeesList), employeesList, countManagers);
    this.calculTotalPlanifie(this.clone(employeesListPerWeek), employeesListPerWeek, countManagers);
    this.employesActifsWithTotalPlanifieSemaine.emit(employeesListPerWeek);
    this.weekDates = [...this.weekDates];
  }

  /**
   * Ouvrir le planning détaillé de la semaine pour un employée
   * @param employee employée
   */
  public openEmployeeWeeklyPlanning(employee: EmployeeModel): void {
    this.selectEmployee.emit(employee);
    this.scrollToCorrectPositionEmployees(employee.idEmployee);
  }

  /**
   * correction les heures de planning
   * @param: shift
   */
  correctTimePlanning(shift: ShiftModel) {
    let dateJournee = JSON.parse(JSON.stringify(this.selectedDate));
    dateJournee = new Date(dateJournee);
    shift.heureDebut = this.dateService.setTimeFormatHHMM(shift.heureDebut);
    shift.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournee, shift.heureDebut), shift.heureDebutIsNight);
    this.dateService.resetSecondsAndMilliseconds(shift.heureDebut);
    shift.heureFin = this.dateService.setTimeFormatHHMM(shift.heureFin);
    shift.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournee, shift.heureFin), shift.heureFinIsNight);
    this.dateService.resetSecondsAndMilliseconds(shift.heureFin);

  }

  /**
   * Fermer le planning détaillé de la semaine pour un employée
   * @param employee employée
   */
  public closeEmployeeWeeklyPlanning(employee: EmployeeModel): void {
    this.closeEmployeePlanning.emit(employee);
    this.selectedEmployee = null;
    this.scrollToCorrectPositionEmployees(employee.idEmployee);
  }

  /**
   * Focus screen on searched employee
   */
  public scrollToCorrectPositionEmployees(employeeId: number): void {
    const el = document.getElementById('employee' + employeeId) as HTMLElement;
    const parentPrincipalEl = el.parentElement.parentElement;
    const allEmployees = document.getElementsByClassName('employees-list')[0] as HTMLElement;
    const contentPlgEq = document.getElementsByClassName('content-planning-equipier')[0] as HTMLElement;

    for (let i = 1; i < allEmployees.children.length; i++) {
      if (allEmployees.children[i] === parentPrincipalEl) {
        if (i === 1) {
          contentPlgEq.scrollTop = 0;
        } else {
          setTimeout(() => {
            i === 2 ? contentPlgEq.scrollTop = (i * 24) : (i < 5 ? contentPlgEq.scrollTop = (i * 24) + ((i - 2) * 12)
              : contentPlgEq.scrollTop = ((i * 24) + ((i - 2) * 12) + (3 * i) - 10));
          }, 100);
        }
      }
    }
  }


  /**
   * Trier le planning par shifts
   */
  public sortEmployees(): void {
    if (!this.selectedEmployee) {
      this.sortedShift = [];
      this.shiftService.triShiftParHeureDebut(this._listShift);
      const sortedEmployees: EmployeeModel[] = [];
      this._listShift.forEach((shift: ShiftModel) => {
        if (shift.employee && !sortedEmployees.find((employee: EmployeeModel) => shift.employee.idEmployee === employee.idEmployee)) {
          sortedEmployees.push(shift.employee);
        } else if (shift.employee === null || (shift.employee && shift.employee.idEmployee === null)) {
          const emptyEmployee = new EmployeeModel();
          emptyEmployee.idEmployee = null;
          emptyEmployee.nom = null;
          emptyEmployee.prenom = null;
          emptyEmployee.hebdoPlanifie = null;
          emptyEmployee.hebdoCourant = null;
          sortedEmployees.push(emptyEmployee);
        }
      });
      const employeeSortField = this.employees.find((employe: EmployeeModel) => employe && employe.idEmployee === -1);
      if (employeeSortField) {
        sortedEmployees.unshift(employeeSortField);
      }
      const employeesRefrence = this.clone(this.employees);
      this.employees = sortedEmployees;
      employeesRefrence.forEach((employe: any, index: number) => {
        if (employe && (employe.idEmployee !== -1 && employe.idEmployee !== null)) {
          if (!this.employees.find((emp: EmployeeModel) => emp && emp.idEmployee === employe.idEmployee)) {
            this.employees.splice(index, 0, employe);
          }
        }
      });
      this.calculateGridHeight();
      this.buildGrid();
      this.employeesChange.emit(this.employees);
      this.listShiftChanges.emit(this._listShift);
      this.sortByEmployee = true;
      this.sortByEmployeeChange.emit(true);
    }
  }

  /**
   * Fonction appelée après un click sur le bouton "Employés" pour les trier
   */
  public sortShifts(): void {
    if (!this.selectedEmployee) {
      this.sortedShift = [];
      this.shiftService.triShiftParHeureDebut(this._listShift);
      const listShiftEmployeeToSort = this.shiftService.filterShiftsToSort(this._listShift.filter((shift: ShiftModel) => !shift.fromPlanningManager));
      let listShiftManagerToSort = [];
      if (this.displayPlgManagers) {
        listShiftManagerToSort = this.shiftService.filterShiftsToSort(this._listShift.filter((shift: ShiftModel) => shift.fromPlanningManager));
        listShiftManagerToSort.sort((shift1: ShiftModel, shift2: ShiftModel) => {
          if (shift1.positionTravail.priorite > shift2.positionTravail.priorite) {
            return 1;
          } else if (shift1.positionTravail.priorite < shift2.positionTravail.priorite) {
            return -1;
          } else {
            return this.triHeureDebutOrdreAlphabetique(shift1, shift2);
          }
        });

      }
      listShiftEmployeeToSort.sort((shift1: ShiftModel, shift2: ShiftModel) => {
        if (shift1.positionTravail.priorite > shift2.positionTravail.priorite) {
          return 1;
        } else if (shift1.positionTravail.priorite < shift2.positionTravail.priorite) {
          return -1;
        } else {
          return this.triHeureDebutOrdreAlphabetique(shift1, shift2);
        }
      });

      const listShiftToSort = listShiftManagerToSort.concat(listShiftEmployeeToSort);
      listShiftToSort.forEach((shift: ShiftModel) => {
        if (shift.employee && shift.employee.idEmployee !== null) {
          this.sortedShift.push(shift);
          this.sortedShift = this.sortedShift.concat(this.listShift.filter((element: ShiftModel) => element.employee && element.employee.idEmployee === shift.employee.idEmployee && element.idShift !== shift.idShift));
        } else if (shift.employee === null || (shift.employee && shift.employee.idEmployee === null)) {
          this.sortedShift.push(shift);
        }
      });
      const sortedEmployees = this.shiftService.getSortedEmployeeListFromSortedShifts(listShiftToSort);
      const employeeSortField = this.employees.find((employe: EmployeeModel) => employe && employe.idEmployee === -1);
      if (employeeSortField) {
        sortedEmployees.unshift(employeeSortField);
      }
      const employeesRefrence = this.clone(this.employees);
      this.employees = sortedEmployees;
      employeesRefrence.forEach((employe: any, index: number) => {
        if (employe && (employe.idEmployee !== -1 && employe.idEmployee !== null)) {
          if (!this.employees.find((emp: EmployeeModel) => emp && emp.idEmployee === employe.idEmployee)) {
            this.employees.splice(index, 0, employe);
          }
        }
      });
      this._listShift = this.sortedShift;
      this.calculateGridHeight();
      this.buildGrid();
      this.employeesChange.emit(this.employees);
      this.sortByEmployee = false;
      this.sortByEmployeeChange.emit(false);
    }

  }

  /**
   * Tri des shifts par heure de début ensuite par ordre alphabétique
   */
  private triHeureDebutOrdreAlphabetique(shift1: ShiftModel, shift2: ShiftModel): number {
    this.dateService.formatNewOrUpdatedShiftDate(shift1);
    this.dateService.formatNewOrUpdatedShiftDate(shift2);
    if (moment(shift1.heureDebut).isAfter(shift2.heureDebut)) {
      return 1;
    } else if (moment(shift1.heureDebut).isBefore(shift2.heureDebut)) {
      return -1;
    } else {
      if (shift1.employee && shift2.employee && shift1.employee.nom && shift1.employee.prenom && shift2.employee.nom && shift2.employee.prenom) {
        if (shift1.employee.nom.concat(shift1.employee.prenom) > shift2.employee.nom.concat(shift2.employee.prenom)) {
          return 1;
        } else if (shift1.employee.nom.concat(shift1.employee.prenom) < shift2.employee.nom.concat(shift2.employee.prenom)) {
          return -1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
  }

  /**
   * Appliquer le style "Highlight" sur l'employé selectionné
   */
  public onHighlightEmployee(event: number, employee?: EmployeeModel): void {
    this.openDrpDown = false;
    if (employee) {
      this.listShift.forEach((shift: ShiftModel) => {
        if (shift.employee && employee.idEmployee === shift.employee.idEmployee) {
          if (!shift.fromPlanningManager && !shift.fromPlanningLeader) {
            this.highlightedEmployeeIndex = event;
          } else {
            return;
          }
        }
      });
      if (employee.groupeTravail && employee.groupeTravail.plgEquip) {
        this.highlightedEmployeeIndex = event;
      }
    } else {
      this.highlightedEmployeeIndex = event;
    }
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
        if (i === 1) {
          el.parentElement.parentElement.parentElement.parentElement.scrollIntoView();
        } else {
          allEmployees.children[i - 1].scrollIntoView();
        }
      }
    }
    el.children[0].classList.add('highlight-employee-name');
  }

  private calculTotalPlanifie(employeesList: EmployeeModel[], originalEmployeesList: EmployeeModel[], countManagers?: boolean): void {
    let totalInDay = 0;
    let totalRowTime = 0;
    let totalRowTimeWithAbsence = 0;
    let totalMinutes = 0;
    let timeToSubstructCurrent = false;
    employeesList.forEach((employe: EmployeeModel) => {
      let employeeWeekShifts = [];
      employe.totalPlanifieSemaine = [];
      totalRowTime = 0;
      totalRowTimeWithAbsence = 0;
      // Cas mode 2 => le temps planifié calculé chaque journée apart pour les shifts à cheval
      if (this.paramMode === 2) {
        this.addAChevalShifts(employe.weekDetailsPlannings);
      }
      employe.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning, index: number) => {
        let day = {};
        if (wdp.libelleAbsence !== '') {
          employeeWeekShifts = [];
          if (this.paramMode === 2) {
            employeeWeekShifts = wdp.shifts.filter((val: any) => (val.acheval && !val.modifiable));
          }
        } else {
          employeeWeekShifts = this.clone(wdp.shifts);
        }
        const dates = this.clone(this.weekDates);
        const dateDebut = new Date(dates[0]);
        if (((employe.weekDetailsPlannings[index - 1] && employe.weekDetailsPlannings[index - 1].libelleAbsence !== '')
          || (employe.checkAbsenceDayPreviousWeek && moment(this.dateService.setTimeNull(new Date(this.clone(employe.weekDetailsPlannings[index].dateJour)))).isSame(this.dateService.setTimeNull(dateDebut)))) && this.paramMode === 2) {
          employeeWeekShifts = employeeWeekShifts.filter((val: any) => (!val.acheval || (val.acheval && val.modifiable)));
        }
        if (this.paramMode === 1) {
          employeeWeekShifts = employeeWeekShifts.filter((val: any) => ((val.acheval && val.modifiable) || !val.acheval));
        }
        employeeWeekShifts.forEach((shift: ShiftModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);
        });
        this.shiftService.sortListShift(employeeWeekShifts);
        totalInDay = 0;
        totalMinutes = 0;
        let totalCurrent = 0;
        let totalCureentFixe = 0;
        let totalCurrentAcheval = 0;
        let totalCureentFixeAcheval = 0;
        timeToSubstructCurrent = false;
        employeeWeekShifts.forEach((shiftDisplay: ShiftModel, index: number) => {
          timeToSubstructCurrent = false;
          const shift = {...shiftDisplay};
          this.shiftService.getShiftInMode2or1(shift, employe, this.weekDates, this.paramMode, this.decoupageHoraireFinEtDebutActivity, this.frConfig);

          totalMinutes += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
          totalInDay += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
          totalCurrent = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
          if (shift.acheval && this.paramMode === 2) {
            totalCurrentAcheval = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
            totalCureentFixeAcheval = totalCurrentAcheval;
          }
          if (this.paramNationaux.payerLeBreak) {
            if (employeeWeekShifts.length > 1) {
              let dureeMinBreak;
              let dureeMinBreakLast;
              totalCureentFixe = totalCurrent;

              if (!shift.acheval || this.paramMode !== 2 || (shift.acheval && shift.longer && this.paramMode === 2)) {
                totalCurrent = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalCurrent, employe, this.paramNationaux, this.listOfBreakAndShift);
              } else if (shift.acheval && !shift.longer && this.paramMode === 2) {
                totalCureentFixeAcheval = totalCureentFixeAcheval - shift.timeToSubstruct;
                totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employe, this.paramNationaux, this.listOfBreakAndShift);
              }
              if (employeeWeekShifts[index + 1]) {
                const pause = this.dateService.getDiffHeure(employeeWeekShifts[index + 1].heureDebut, shift.heureFin);
                dureeMinBreak = this.contrainteSocialeService.validDureeMinBreak(employe.loiEmployee, employe.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(employe), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));
              }
              if (employeeWeekShifts[index - 1]) {
                const pause = this.dateService.getDiffHeure(shift.heureDebut, employeeWeekShifts[index - 1].heureFin);
                dureeMinBreakLast = this.contrainteSocialeService.validDureeMinBreak(employe.loiEmployee, employe.contrats[0].tempsPartiel, this.shiftService.identifierEmployee(employe), this.helperService.getNombreHeureTravaille(+this.dateService.convertNumberToTime(pause)));

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
                if (employeeWeekShifts[index - 1]) {
                  const shiftTobreak = {...employeeWeekShifts[index - 1]};
                  const nbrHourLast = this.dateService.getDiffHeure(shiftTobreak.heureFin, shiftTobreak.heureDebut);
                  totalInDay = totalInDay - nbrHourLast;
                }
              } else if (employeeWeekShifts[index - 1] && (!employeeWeekShifts[index + 1] || !dureeMinBreak)) {
                const shiftTobreak = {...employeeWeekShifts[index - 1]};
                if (shift.acheval && this.paramMode === 2) {
                  timeToSubstructCurrent = true;
                  totalMinutes -= shift.timeToSubstruct;
                  if (totalInDay) {
                    totalInDay -= shift.timeToSubstruct;
                  }
                }
                totalMinutes = this.shiftService.getTotalInDayForAllShiftWithBreak(shiftTobreak, shift, totalInDay, employeeWeekShifts.length, totalMinutes, employe, this.paramNationaux, this.listOfBreakAndShift).totalMinutes;
                totalInDay = 0;
              }
            } else if (employeeWeekShifts.length === 1) {
              if (!shift.acheval || this.paramMode !== 2 || (shift.acheval && shift.longer && this.paramMode === 2)) {
                totalMinutes = this.shiftService.getTotalHoursInDayForShiftWithBreak(totalMinutes, employe, this.paramNationaux, this.listOfBreakAndShift);
              } else if (shift.acheval && !shift.longer && this.paramMode === 2) {
                totalCurrentAcheval = this.shiftService.getTotalHoursInDayForShiftWithBreak((totalCurrentAcheval - shift.timeToSubstruct), employe, this.paramNationaux, this.listOfBreakAndShift);
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
          if (employe.contrats && employe.contrats.length) {
            const employeeNew = {contrats: employe.contrats.filter(_ => true)} as EmployeeModel;
            const employeHasContrat = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(shift.dateJournee))), true);
            if (employeHasContrat.contrats) {
              const currentContrat = employeHasContrat.contrats[0];
              if ((countManagers && shift.fromPlanningManager && shift.fromPlanningLeader && currentContrat.groupeTravail.plgLeader) ||
                (countManagers && shift.fromPlanningManager && !shift.fromPlanningLeader && currentContrat.groupeTravail.plgMgr) ||
                (!shift.fromPlanningManager && currentContrat.groupeTravail.plgEquip)) {
                // if((countManagers && shift.fromPlanningManager && employe.isManagerOrLeader) || (countManagers && !shift.fromPlanningManager && !employe.isManagerOrLeader) || !countManagers){
                day = {
                  'dateJournee': this.getDateJourneeForCalculTempsPlanifie(shift, dateDebut),
                  'employe': shift.employee.prenom,
                  'totalPlanifieJournee': totalMinutes
                };
              }
            } else {
              day = {
                'dateJournee': this.getDateJourneeForCalculTempsPlanifie(shift, dateDebut),
                'employe': shift.employee.prenom,
                'totalPlanifieJournee': 0
              };
            }
          } else {
            day = {
              'dateJournee': this.getDateJourneeForCalculTempsPlanifie(shift, dateDebut),
              'employe': shift.employee.prenom,
              'totalPlanifieJournee': 0
            };
          }
        });
        employe.totalPlanifieSemaine.push(day);
        totalRowTime += totalMinutes;
        totalRowTimeWithAbsence += totalMinutes;
        // add total absence d'une journee
        totalRowTimeWithAbsence += wdp.totalAbsence;
        employe.hebdoPlanifie = totalRowTime;
        this.listShift.forEach((shift: ShiftModel) => {
          if (shift.employee && employe.idEmployee === shift.employee.idEmployee) {
            shift.employee.hebdoPlanifie = totalRowTime;
            shift.employee.hebdoPlanifieToDisplay = this.dateService.formatMinutesToHours(totalRowTimeWithAbsence);
          }
        });
        this.employees.forEach((employeDisplayed: EmployeeModel) => {
          if (employeDisplayed.idEmployee && employe.idEmployee === employeDisplayed.idEmployee) {
            employeDisplayed.hebdoPlanifie = totalRowTime;
            employeDisplayed.hebdoPlanifieToDisplay = this.dateService.formatMinutesToHours(totalRowTimeWithAbsence);
          }
        });
        this.data.forEach((element: any) => {
          if (element.employee && employe.idEmployee === element.employee.idEmployee) {
            element.employee.hebdoPlanifie = totalRowTime;
            element.employee.hebdoPlanifieToDisplay = this.dateService.formatMinutesToHours(totalRowTimeWithAbsence);
          }
          if (element.selectedEmployee && employe.idEmployee === element.selectedEmployee.idEmployee) {
            element.selectedEmployee.hebdoPlanifie = totalRowTime;
            element.selectedEmployee.hebdoPlanifieToDisplay = this.dateService.formatMinutesToHours(totalRowTimeWithAbsence);
          }
          if (element.selectedEmployee && employe.idEmployee === element.selectedEmployee.idEmployee) {
            element.selectedEmployee.hebdoPlanifie = totalRowTime;
            element.selectedEmployee.hebdoPlanifieToDisplay = this.dateService.formatMinutesToHours(totalRowTimeWithAbsence);
          }
        });
      });
      const originalEmployeeIndex = originalEmployeesList.findIndex((empl: EmployeeModel) => empl.idEmployee === employe.idEmployee);
      if (originalEmployeeIndex !== -1) {
        if (employe.hebdoPlanifie) {
          originalEmployeesList[originalEmployeeIndex].hebdoPlanifie = employe.hebdoPlanifie;
        }
        if (employe.hebdoPlanifieToDisplay) {
          originalEmployeesList[originalEmployeeIndex].hebdoPlanifieToDisplay = employe.hebdoPlanifieToDisplay;
        }
        if (employe.totalPlanifieSemaine) {
          originalEmployeesList[originalEmployeeIndex].totalPlanifieSemaine = employe.totalPlanifieSemaine;
        }
      }
    });
  }

  private getDateJourneeForCalculTempsPlanifie(shift: ShiftModel, dateDebut: any): Date {
    if (this.modeAffichage === 2 && !shift.fromPlanningLeader && !shift.fromPlanningManager) {
      if (this.datePipe.transform(shift.dateJournee, 'dd-MM-yyyy') === this.datePipe.transform(dateDebut, 'dd-MM-yyyy')) {
        return shift.dateJournee;
      } else {
        return shift.modifiable ? shift.dateJournee : new Date(shift.dateJournee.getTime() + (24 * 60 * 60 * 1000));
      }
    } else {
      return shift.dateJournee;
    }
  }

  /**
   * Calculer le temps payé heure par heure (les cas de creation/update/affectation/desaffectation/suppression shift)
   */
  public calculatePayedTime(oldPosition: number, oldColsNumber: number, position: number, colsNumber: number, newDayToUpdate?: any, oldDayToUpdate?: any): void {
    const oldIndexes: { index: number, value: number }[] = [];
    if (oldPosition != null && oldColsNumber != null) {
      const oldStartIndex = Math.trunc(oldPosition / 4);
      const oldStartRemainder = oldPosition % 4;
      const oldEndIndex = Math.ceil((oldPosition + oldColsNumber) / 4);
      const oldEndRemainder = (oldPosition + oldColsNumber) % 4;
      oldIndexes.push({index: oldStartIndex, value: this.calulateStartMinutesForPayedTime(oldStartRemainder)});
      for (let i = oldStartIndex + 1; i < oldEndIndex - 1; i++) {
        oldIndexes.push({index: i, value: 60});
      }
      oldIndexes.push({index: oldEndIndex - 1, value: this.calulateEndMinutesForPayedTime(oldEndRemainder)});
    }
    const indexes: { index: number, value: number }[] = [];
    if (position != null && colsNumber != null) {
      const startIndex = Math.trunc(position / 4);
      const startRemainder = position % 4;
      const endIndex = Math.ceil((position + colsNumber) / 4);
      const endRemainder = (position + colsNumber) % 4;
      indexes.push({index: startIndex, value: this.calulateStartMinutesForPayedTime(startRemainder)});
      for (let i = startIndex + 1; i < endIndex - 1; i++) {
        indexes.push({index: i, value: 60});
      }
      indexes.push({index: endIndex - 1, value: this.calulateEndMinutesForPayedTime(endRemainder)});
    }
    const decrementIndexes = oldIndexes.filter((item: { index: number, value: number }) => {
      return indexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || indexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.decrement.emit({
      decrementIndexes: decrementIndexes, newDayToUpdate: newDayToUpdate, oldDayToUpdate: oldDayToUpdate
    });
    const incrementIndexes = indexes.filter((item: { index: number, value: number }) => {
      return oldIndexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || oldIndexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.increment.emit({
      incrementIndexes: incrementIndexes, newDayToUpdate: newDayToUpdate, oldDayToUpdate: oldDayToUpdate
    });
  }

  /**
   * Calculer le temps payé heure par heure pour les managers
   */
  public calculatePayedTimeManager(listPositionToUpdate: { position: number, colsNumber: number, dateToUpdate: any }[], listPositionToRemove?: any[]): void {
    const oldIndexes: { index: number, value: number, dateToUpdate: any }[] = [];
    const indexes: { index: number, value: number, dateToUpdate: any }[] = [];
    if (listPositionToRemove) {
      listPositionToRemove.forEach((element: any) => {
        if (element.position != null && element.colsNumber != null) {
          const oldStartIndex = Math.trunc(element.position / 4);
          const oldStartRemainder = element.position % 4;
          const oldEndIndex = Math.ceil((element.position + element.colsNumber) / 4);
          const oldEndRemainder = (element.position + element.colsNumber) % 4;
          oldIndexes.push({
            index: oldStartIndex,
            value: this.calulateStartMinutesForPayedTime(oldStartRemainder),
            dateToUpdate: element.dateToUpdate
          });
          for (let i = oldStartIndex + 1; i < oldEndIndex - 1; i++) {
            oldIndexes.push({index: i, value: 60, dateToUpdate: element.dateToUpdate});
          }
          oldIndexes.push({
            index: oldEndIndex - 1,
            value: this.calulateEndMinutesForPayedTime(oldEndRemainder),
            dateToUpdate: element.dateToUpdate
          });
        }
      });

    }
    if (listPositionToUpdate) {
      listPositionToUpdate.forEach((element: any) => {
        if (element.position != null && element.colsNumber != null) {
          const startIndex = Math.trunc(element.position / 4);
          const startRemainder = element.position % 4;
          const endIndex = Math.ceil((element.position + element.colsNumber) / 4);
          const endRemainder = (element.position + element.colsNumber) % 4;
          indexes.push({
            index: startIndex,
            value: this.calulateStartMinutesForPayedTime(startRemainder),
            dateToUpdate: element.dateToUpdate
          });
          for (let i = startIndex + 1; i < endIndex - 1; i++) {
            indexes.push({index: i, value: 60, dateToUpdate: element.dateToUpdate});
          }
          indexes.push({
            index: endIndex - 1,
            value: this.calulateEndMinutesForPayedTime(endRemainder),
            dateToUpdate: element.dateToUpdate
          });
        }
      });
    }
    const decrementIndexes = oldIndexes.filter((item: { index: number, value: number }) => {
      return indexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || indexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.decrement.emit({
      decrementIndexes: decrementIndexes
    });

    const incrementIndexes = indexes.filter((item: { index: number, value: number }) => {
      return oldIndexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || oldIndexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.incrementManagerIndexes.emit({incrementIndexes: incrementIndexes});
  }

  /**
   * Calculer le temps payé pour lors de chargement d'une journee/semaine de reference
   */
  public calculatePayedTimeRefrence(listPositionToUpdate: { position: number, colsNumber: number, dateToUpdate?: any }[]): void {
    const oldIndexes: { index: number, value: number }[] = [];
    const indexes: { index: number, value: number, dateToUpdate: any }[] = [];
    listPositionToUpdate.forEach((element: any) => {
      if (element.position != null && element.colsNumber != null) {
        const startIndex = Math.trunc(element.position / 4);
        const startRemainder = element.position % 4;
        const endIndex = Math.ceil((element.position + element.colsNumber) / 4);
        const endRemainder = (element.position + element.colsNumber) % 4;
        indexes.push({
          index: startIndex,
          value: this.calulateStartMinutesForPayedTime(startRemainder),
          dateToUpdate: element.dateToUpdate
        });
        for (let i = startIndex + 1; i < endIndex - 1; i++) {
          indexes.push({index: i, value: 60, dateToUpdate: element.dateToUpdate});
        }
        indexes.push({
          index: endIndex - 1,
          value: this.calulateEndMinutesForPayedTime(endRemainder),
          dateToUpdate: element.dateToUpdate
        });
      }
    });
    const decrementIndexes = oldIndexes.filter((item: { index: number, value: number }) => {
      return indexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || indexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.decrement.emit({
      decrementIndexes: decrementIndexes
    });

    const incrementIndexes = indexes.filter((item: { index: number, value: number }) => {
      return oldIndexes.find((i: { index: number, value: number }) => i.index === item.index) === undefined
        || oldIndexes.find((i: { index: number, value: number }) => i.index === item.index && i.value !== item.value);
    });
    this.incrementManagerIndexes.emit({
      incrementIndexes: incrementIndexes
    });
  }

  /**
   * Ajouter un listner sur les mouvement de la souris sur l'écran pour faire défiler l'écran lors d'un drag&drop
   * @param event évènement
   */
  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    if (this.gridster && this.gridster.dragInProgress && !this.selectedEmployee) {
      const footerHeight = document.getElementById('footer').clientHeight;
      const down = (window.innerHeight - event.clientY) < (80 + footerHeight);
      const up = (event.clientY - 107) < 270;
      const rhisContainer = document.getElementsByClassName('content-planning-equipier')[0];
      const oldScrollTop = rhisContainer.scrollTop;
      if (up || down) {
        const baseIncrement = 20;
        const increment = (up ? -baseIncrement : baseIncrement);
        rhisContainer.scrollTop = rhisContainer.scrollTop + increment;
        if (rhisContainer.scrollTop !== oldScrollTop) {
          this.draggingItem.drag.diffTop = this.draggingItem.drag.diffTop - increment; // composant element position for scroll
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
            this.draggingItem.drag.diffLeft = this.draggingItem.drag.diffLeft - incrementLeftRight;
          }
        }
      }
    }
  }

  private initGrid(gridsterComponent: GridsterComponentInterface): void {
    this.gridster = gridsterComponent;
  }

  /**
   * Créer l'axe du temps à partir de l'heure de début d'activité et l'heure de fin d'activité
   */
  private buildTimeAxis(): void {
    if (this.showTimeAxis) {
      // Afficher l'axe du temps sur la grille
      let x = 0;
      this.hours.forEach((hour: string) => {
        if ((this.hours.indexOf(hour) === (this.hours.length - 1)) && this.endMinutesCells) {
          this.data.push({
            cols: this.endMinutesCells,
            rows: 2,
            y: 0,
            x: x,
            color: '#f4f4f4',
            label: hour,
            dragEnabled: false,
            resizeEnabled: false,
            isheureDeDebut: this.hours.indexOf(hour) === 0
          });
        } else {
          this.data.push({
            cols: 4,
            rows: 2,
            y: 0,
            x: x,
            color: '#f4f4f4',
            label: hour,
            dragEnabled: false,
            resizeEnabled: false,
            isheureDeDebut: this.hours.indexOf(hour) === 0
          });
          x = x + 4;
        }
      });
    }
  }

  /**
   * Créer l'axe des employées à partir des shifts envoyés par le serveur
   */
  private buildEmployeeAxis(): void {
    if (this.showTimeAxis && !this.employees.some(employe => employe.idEmployee === -1)) {
      const emptyEmployee: EmployeeModel = new EmployeeModel();
      emptyEmployee.idEmployee = -1;
      emptyEmployee.hebdoPlanifie = null;
      emptyEmployee.hebdoCourant = null;
      emptyEmployee.nom = '';
      emptyEmployee.prenom = '';
      this._employees.unshift(emptyEmployee);
    }
  }

  /**
   * return all small shift which have cols < 8
   * @param: item
   */
  public smallShiftHover(item: GridsterItem): boolean {
    return item.cols < 8;
  }


  /**
   * convertir la nouvelle position en heure de début et heure de fin puis mettre à jour le label
   */
  private async convertNewPosition(shift: ShiftModel, gridsterItem: GridsterItem, oldShift: ShiftModel, submitUpdate: boolean, gridLimit: number, oldShiftEmployee?: EmployeeModel) {
    let skipHeureFinChange = false;
    let skipHeureDebutChange = false;

    let heureDeDebut: string;
    if (gridsterItem.x === this.startMinutesCells) {
      heureDeDebut = this.debutJourneeActivite.value.slice(0, 5);
    } else {
      // cas drag and drop
      if (this.dragAction) {
        if (!this.checkIsItemAChevalOnJ(gridsterItem)) {
          // cas shift acheval sur J
          heureDeDebut = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x, this.debutJourneeActivite);
        } else {
          // cas shift non acheval ou bien acheval et sur J+1
          heureDeDebut = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x - (gridsterItem.acheval ? (gridsterItem.colACheval - gridsterItem.cols) : 0), this.debutJourneeActivite);
        }
      } else {
        heureDeDebut = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x, this.debutJourneeActivite);
      }
    }
    // cas drag and drop
    let heureDeFin: string;
    if ((gridsterItem.x + gridsterItem.cols) === gridLimit) {
      heureDeFin = this.finJourneeActivite.value.slice(0, 5);
    } else {
      if (this.dragAction) {
        if (!this.checkIsItemAChevalOnJ(gridsterItem)) {
          // cas shift acheval sur J
          heureDeFin = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x + (gridsterItem.acheval ? gridsterItem.colACheval : gridsterItem.cols), this.debutJourneeActivite);
        } else {
          // cas shift non acheval ou bien acheval et sur J+1
          heureDeFin = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x + gridsterItem.cols, this.debutJourneeActivite);
        }
      } else {
        heureDeFin = this.plgEquipierHelperService.convertPositionToTime(gridsterItem.x + gridsterItem.cols, this.debutJourneeActivite);
      }
    }
    // cas de resize
    if (!this.dragAction) {
      // resize sur j
      if (shift.acheval && shift.modifiable) {
        // ne pas modifier heure fin
        if (heureDeDebut !== this.dateService.setStringFromDate(shift.heureDebut)) {
          skipHeureFinChange = true;
          heureDeFin = this.dateService.setStringFromDate(shift.heureFinCheval);
          shift.heureFin = shift.heureFinCheval;
        }
      }
      // ne pas modifier heure debut
      if (shift.acheval && !shift.modifiable) {
        if (heureDeFin !== this.dateService.setStringFromDate(shift.heureFin)) {
          skipHeureDebutChange = true;
          heureDeDebut = this.dateService.setStringFromDate(shift.heureDebutCheval);
          shift.heureDebut = shift.heureDebutCheval;
        }
      }
    }
    gridsterItem.timeLabel = heureDeDebut + ' - ' + heureDeFin;
    if (!skipHeureDebutChange) {
      shift.heureDebut = heureDeDebut;
      if (!this.checkIsItemAChevalOnJ(gridsterItem)) {
        shift.heureDebutIsNight = this.isNightTime(gridsterItem.x);
      } else {
        shift.heureDebutIsNight = this.isNightTime(gridsterItem.x - (gridsterItem.acheval ? (gridsterItem.colACheval - gridsterItem.cols) : 0));
      }
    }
    if (!skipHeureFinChange) {
      shift.heureFin = heureDeFin;
      shift.heureFinIsNight = this.isNightTime(gridsterItem.x + (gridsterItem.acheval ? gridsterItem.colACheval : gridsterItem.cols));
    }
    this.dateService.setCorrectTimeToDisplayForShift(shift, shift.heureDebutIsNight ? null : (shift.heureFinIsNight ? null : this.selectedDate));

    let debutJourneeActiviteRefrence = JSON.parse(JSON.stringify(this.debutJourneeActivite));
    const nightValueDebut = debutJourneeActiviteRefrence.night;
    debutJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(debutJourneeActiviteRefrence.value);
    debutJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(new Date(this.selectedDate), debutJourneeActiviteRefrence), nightValueDebut);
    this.dateService.resetSecondsAndMilliseconds(debutJourneeActiviteRefrence);

    //bloque resizing shift a cheval à gauche(sur J+1)
    if (!this.dragAction && shift.acheval && !shift.modifiable && moment(shift.heureDebut).isAfter(debutJourneeActiviteRefrence)) {
      submitUpdate = false;
    }
    //bloque resizing shift a cheval à droite(sur J)
    if (!this.dragAction && shift.acheval && shift.modifiable && (gridsterItem.x + gridsterItem.cols) < gridLimit) {
      submitUpdate = false;
    }
    this.dragAction = false;
    if (this.lockState || !this.updateButtonControl(this.domControlService, this.ecran)) {
      gridsterItem.employee = oldShift.employee;
      gridsterItem.heureDebut = oldShift.heureDebut;
      gridsterItem.heureFin = oldShift.heureFin;
      shift.employee = oldShift.employee;
      shift.heureDebut = oldShift.heureDebut;
      shift.heureFin = oldShift.heureFin;
      this.buildGrid();
    } else {
      gridsterItem.colACheval = shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0;
      this.updateShiftHours(shift);
      this.updateShiftAfterResize.emit({
        shiftToUpdate: shift,
        gridsterItem: gridsterItem,
        oldShift: oldShift,
        oldShiftEmployee: oldShiftEmployee,
        submitUpdate: submitUpdate,
        copyEvent : this.eventCtrl
      });
    }
  }

  /**
   *
   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.leftElement && changes.leftElement.currentValue) {
      this.leftElement = changes.leftElement.currentValue;
    }
    // Affichage des indisponibilités

    if (changes.indisponibilities && changes.indisponibilities.currentValue) {
      this.ngZone.runOutsideAngular(() => {
      this.createIndisponibilities(changes.indisponibilities.currentValue, this.indisponibilities);
      });
    }
    if (changes.absences && changes.absences.currentValue) {
    this.ngZone.runOutsideAngular(() => {
      this.createAbsences(changes.absences.currentValue, this.absences);
    });
    }
  }

  private createAbsences(absences, globalAbsences) {
    globalAbsences = absences;
    let columnWidth: any;
    let dayGridsterElement = document.getElementById('day-gridster' + this._idGrid);
    if (dayGridsterElement && dayGridsterElement.getElementsByClassName('gridster-column')[0]) {
      columnWidth = (dayGridsterElement.getElementsByClassName('gridster-column')[0] as HTMLElement).style.width;
      if (this.columnWidthFromWeekValue && this.columnWidthFromWeekValue !== columnWidth) {
        columnWidth = this.columnWidthFromWeekValue;
      }
    }

    globalAbsences.forEach((abs: any) => {
      const node = document.createElement('div');
      node.style.cssText = this.absenceStyle1;
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
      let gridsterRow = dayGridsterElement.getElementsByClassName('gridster-row')[abs.y];
      if (gridsterRow) {
        gridsterRow.appendChild(node);
      }

      const node2 = document.createElement('div');
      node2.style.cssText = this.absenceStyle2;
      node2.style.width = (+(columnWidth.slice(0, -2)) * abs.cols).toString() + 'px';
      node2.style.left = (+(columnWidth.slice(0, -2)) * abs.x).toString() + 'px';
      node2.style.border = '2px dashed rgb(200 199 196)';
      node2.style.borderTop = '0';
      node2.style.borderRadius = '0px 0px 5px 5px';
      let nextGridsterRow = dayGridsterElement.getElementsByClassName('gridster-row')[abs.y + 1];
      if (nextGridsterRow) {
        nextGridsterRow.appendChild(node2);
      }
    });
  }

  private createIndisponibilities(indisponibilities, globalIndisponibilities) {
    globalIndisponibilities = indisponibilities;
    let columnWidth: any;
    let reference = document.getElementById('day-gridster' + this._idGrid);
    if (reference) {
      if (reference.getElementsByClassName('gridster-column')[0] as HTMLElement) {
        columnWidth = (reference.getElementsByClassName('gridster-column')[0] as HTMLElement).style.width;
        if (this.columnWidthFromWeekValue && this.columnWidthFromWeekValue !== columnWidth) {
          columnWidth = this.columnWidthFromWeekValue;
        }
      }
      for (let i = 3; i <= (this.employees.length - 1) * 3; i += 3) {
        let element = reference.getElementsByClassName('gridster-row')[i];
        let nextElement = reference.getElementsByClassName('gridster-row')[i + 1];
        const firstChildNodes = element ? element.childNodes : [];
        const secondChildNodes = nextElement ? nextElement.childNodes : [];
        while (firstChildNodes.length) {
          element.removeChild(firstChildNodes[0]);
        }
        while (secondChildNodes.length) {
          nextElement
              .removeChild(secondChildNodes[0]);
        }
      }
    }

    if (columnWidth !== undefined) {
      globalIndisponibilities.forEach((ind: any) => {
        const node = document.createElement('div');
        node.style.cssText = this.indispoStyle;
        node.style.width = (((+(columnWidth.slice(0, -2)) * ind.cols) / (+(columnWidth.slice(0, -2)) * this.hours.length * 4)) * 100).toString() + '%';
        node.style.left = (((+(columnWidth.slice(0, -2)) * ind.x) / (+(columnWidth.slice(0, -2)) * this.hours.length * 4)) * 100).toString() + '%';
        node.style.borderRadius = '5px 5px 0px 0px';
        node.style.border = '1px solid #C8C7C4';
        node.style.borderBottom = '0';
        let gridsterRow = reference.getElementsByClassName('gridster-row')[ind.y];
        if (gridsterRow) {
          gridsterRow.appendChild(node);
        }

        const node2 = document.createElement('div');
        if (!this._minimalDisplaye) {
          node2.style.cssText = this.indispoStyle;
        } else {
          node2.style.cssText = this.indispoStyleCondensee;
        }
        node2.style.width = ((+(columnWidth.slice(0, -2)) * ind.cols / (+(columnWidth.slice(0, -2)) * this.hours.length * 4)) * 100).toString() + '%';
        node2.style.left = (((+(columnWidth.slice(0, -2)) * ind.x) / (+(columnWidth.slice(0, -2)) * this.hours.length * 4)) * 100).toString() + '%';
        node2.style.border = '1px solid #C8C7C4';
        node2.style.borderTop = '0';
        node2.style.borderRadius = '0px 0px 5px 5px';
        let nexGridsterRow = reference.getElementsByClassName('gridster-row')[ind.y + 1];
        if (nexGridsterRow) {
          nexGridsterRow
              .appendChild(node2);
        }
      });
    }
  }

  /**
   * Sort employees according to availability
   */
  private sortNewEmployees(newEmployeesList: { label: string, value: number }[]): void {
    newEmployeesList.sort((employe1: { label: string, value: number }, employe2: { label: string, value: number }) => {
      if (employe1.label > employe2.label) {
        return 1;
      } else if (employe1.label < employe2.label) {
        return -1;
      } else {
        return 0;
      }
    });
    const firstListReference = JSON.parse(JSON.stringify(newEmployeesList));
    firstListReference.forEach((element: { label: string, value: number }) => {
      if (element.label.lastIndexOf('*') === 0) {
        newEmployeesList.splice(newEmployeesList.findIndex((employe: { label: string, value: number }) => employe.value === element.value), 1);
        newEmployeesList.push(element);
      }
    });
    const secondListReference = JSON.parse(JSON.stringify(newEmployeesList));
    secondListReference.forEach((element: { label: string, value: number }) => {
      if (element.label.lastIndexOf('*') === 1) {
        newEmployeesList.splice(newEmployeesList.findIndex((employe: { label: string, value: number }) => employe.value === element.value), 1);
        newEmployeesList.push(element);
      }
    });
  }

  private groupShiftByPosition(list: GridsterItem[], keyGetter: (item: GridsterItem) => number): Map<number, [GridsterItem]> {
    const map = new Map();
    list.forEach((item: GridsterItem) => {
      const key = keyGetter(item);
      map.set(key, [item]);
    });
    return map;
  }

  /**
   * this method is used for display firstName and lastName when length is more than 15 in a tooltip
   * @param: employee
   */
  public showOrHideToolTip(employee: EmployeeModel) {
    employee.toolTipShow = !employee.toolTipShow;
    this.longeurEmployee = employee.nom.concat(employee.prenom.toString()).length;
  }

  /**
   * Supprimer un shift
   * @param $event evenement émis
   * @param item shift à supprimer
   */
  private deleteShift(event: any, item: GridsterItem) {
    if (this.enableDragAndResize) {
      event.preventDefault();
      event.stopPropagation();
      const items = this.data.filter((gridsterItem: GridsterItem) => (item.y === gridsterItem.y) && (item.idShift !== gridsterItem.idShift));
      if (items.length === 0 && item.selectedEmployee.idEmployee === null) {
        this.employees.splice((item.y / 3), 1);
        this.calculateGridHeight();
        this.deleteShiftEvent.emit(item);
        this.data.splice(this.data.indexOf(item), 1);
        this.buildGrid();
      } else {
        this.deleteShiftEvent.emit(item);
        this.data.splice(this.data.indexOf(item), 1);
        this.calculatePayedTime(item.x, item.cols, null, null);
      }

    }
  }

  private dragStart(item: any, gridsterItem: any, event: any) {
    this.draggingItem = gridsterItem;
    // if (this.modeAffichage === 1 || this.modeAffichage === 2) {
      this.dragAction = true;
    // }
  }

  /**
   * Permettre de dropper des shifts uniquement sur les lignes qui correspondent à un employés (lignes avec background blanc)
   * @param item shift
   * @param gridsterItem item de la grille
   * @param event évènement
   */
  private async dragStop(item: any, gridsterItem: any, event: any) {
    const isAllowed = this.updateButtonControl(this.domControlService, this.ecran);
    const employee: EmployeeModel = this.employees[gridsterItem.$item.y / 3];
    const items = this.data.filter((item: GridsterItem) => item.y === gridsterItem.$item.y);
    this.draggingItem = null;
    const isShiftOutsideDecoupage = gridsterItem.$item.x < this.startMinutesCells;
    const lock = this.lockState;
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
    return new Promise((resolve, reject) => {
      if (isShiftOutsideDecoupage || gridsterItem.$item.y % 3 !== 0 || items.some(val => val.notPlgEquipier || val.selectedEmployee.hasOwnProperty('isManagerOrLeader') || val.selectedEmployee.hasOwnProperty('plgEquipier')) || (!items.length && employee && employee.idEmployee !== null && ((employee.contrats && employee.contrats.length && ((!employee.contrats[0].groupeTravail.plgEquip || (employee.isManagerOrLeader && (!employee.contrats[0].groupeTravail.plgMgr || !employee.contrats[0].groupeTravail.plgLeader)))))
        || !employee.contrats.length)) || lock || !isAllowed || (item.acheval && !this.canPlaceShift(item.idShift, gridsterItem.$item.x, item.cols, item.colACheval, gridsterItem.$item.y))) {
        reject('shift cannot be placed here');
      } else {
        resolve('success');
      }
    });
  }

  private canPlaceShift(idShift: any, x: number, cols: number, colsACheval: number, y: number) {
    const shiftsToChecksWith = this.data.filter(shift => shift.isShift && shift.idShift !== idShift && shift.y === y);
    let canAdd = true;
    shiftsToChecksWith.forEach(shift => {
      const xEmployeeShift = shift.x;
      const colsEmplyeeShift = shift.cols;
      canAdd = canAdd && (((xEmployeeShift + colsEmplyeeShift <= x + cols - colsACheval && xEmployeeShift < x + cols - colsACheval) ||
        (x + cols - colsACheval + cols <= xEmployeeShift && x + cols - colsACheval < xEmployeeShift)) && (x + cols - colsACheval >= 0 && x + cols - colsACheval + cols <= this.options.maxCols));
    });

    return canAdd;
  }

  /**
   * Déterminer si l'heure est de jour ou de nuit
   * @param x position
   */
  private isNightTime(x: number) {
    const midnightHour = new Date(0, 0, 0, 0);
    const midnightPosition = this.plgEquipierHelperService.convertStartTimeToPosition(midnightHour, true, this.debutJourneeActivite);
    return x >= midnightPosition;
  }

  private calulateEndMinutesForPayedTime(remainder: number) {
    switch (remainder) {
      case 0:
        return 60;
      case 1:
        return 15;
      case 2:
        return 30;
      case 3:
        return 45;
    }
  }

  private calulateStartMinutesForPayedTime(remainder: number) {
    switch (remainder) {
      case 0:
        return 60;
      case 1:
        return 45;
      case 2:
        return 30;
      case 3:
        return 15;
    }
  }

  private updateShiftHours(shift: ShiftModel): void {
    if (this.modeAffichage === 1 || this.modeAffichage === 2) {
//      if (shift.acheval) {
      if (shift.acheval && shift.modifiable) {
        shift.heureDebutCheval = shift.heureDebut;
        shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
        shift.heureFinCheval = shift.heureFin;
        shift.heureFinChevalIsNight = shift.heureFinIsNight;
        let dateJournee = JSON.parse(JSON.stringify(this.selectedDate));
        dateJournee = new Date(dateJournee);
        if (moment(shift.heureFin).isSameOrBefore(this.limitDecoupageHours.heureDebutLimit)) {
          shift.acheval = false;
          shift.modifiable = true;
          if (moment(shift.heureDebut).isSameOrAfter(this.limitDecoupageHours.debutJourneeLimit)) {
            shift.dateJournee = dateJournee;
          }
        }
      }

      if (shift.acheval) {
        if (shift.modifiable) {
          //shift.heureDebut = shift.heureDebut.getTime() > shift.heureDebutCheval.getTime() ? shift.heureDebutCheval : shift.heureDebut;
          shift.heureFin = shift.heureFin.getTime() > shift.heureFinCheval.getTime() ? shift.heureFinCheval : shift.heureFin;
        } else {
          shift.heureDebut = shift.heureDebut.getTime() > shift.heureDebutCheval.getTime() ? shift.heureDebut : shift.heureDebutCheval;
          //shift.heureFin = shift.heureFin.getTime() > shift.heureFinCheval.getTime() ? shift.heureFin : shift.heureFinCheval;
        }
        shift.heureDebutCheval = shift.heureDebut;
        shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
        shift.heureFinCheval = shift.heureFin;
        shift.heureFinChevalIsNight = shift.heureFinIsNight;
      }
      shift.totalHeure = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
      shift.totalHeureACheval = this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);

      if (shift.acheval && !shift.modifiable) {
        if (moment(shift.heureDebut).isSameOrAfter(this.limitDecoupageHours.debutJourneeLimit)) {
          shift.acheval = false;
          shift.modifiable = true;
          shift.dateJournee = new Date(this.selectedDate);
        }
      }
    } else {
      shift.heureDebutCheval = shift.heureDebut;
      shift.heureDebutChevalIsNight = shift.heureDebutIsNight;
      shift.heureFinCheval = shift.heureFin;
      shift.heureFinChevalIsNight = shift.heureFinIsNight;
    }
    this.dateService.setCorrectTimeToDisplayForShift(shift);
  }

  private addLineToShiftsWithoutEmployee(shiftsWithoutEmployee: any): void {
    const employeeWithoutShift = this._employees.filter(employe => employe && employe.idEmployee === null);
    if (employeeWithoutShift.length !== shiftsWithoutEmployee.length) {
      for (let i = 0; i < shiftsWithoutEmployee.length - employeeWithoutShift.length; i++) {
        const emptyEmployee = new EmployeeModel();
        emptyEmployee.idEmployee = null;
        emptyEmployee.hebdoPlanifie = null;
        emptyEmployee.hebdoCourant = null;
        emptyEmployee.nom = null;
        emptyEmployee.prenom = null;
        emptyEmployee.matricule = null;
        this.employees.push(emptyEmployee);
      }
      this.calculateGridHeight();

    }
  }

  /**
   * Convertir les shifts envoyés par le serveur au format attendu par Gridster
   */
  private async buildShifts(): Promise<void> {
    this.data = [];
    const nullEmployeesIndexes = [];
    const shiftsWithoutEmployee = this._listShift.filter((shift: ShiftModel) => shift.employee === null || (shift.employee && shift.employee.idEmployee === null));
    this.addLineToShiftsWithoutEmployee(shiftsWithoutEmployee);
    this.employees.forEach((employe: EmployeeModel) => {
      if (employe && employe.idEmployee === null) {
        nullEmployeesIndexes.push(this.employees.indexOf(employe));
      }
    });
    let y = 0;
    let index = nullEmployeesIndexes.length - shiftsWithoutEmployee.length;
    // lors de l'affichage des shifts, si une shifts sans position de travail provoque des problèmes donc on filtre les shifts avec positions de travail
    // à voir dans l'algorithme comme on peut avoir des shifts sans positions, qu'est ce qu'on fait dans ce cas
    this._listShift.forEach((shift: ShiftModel) => {
      let x = this.plgEquipierHelperService.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight, this.debutJourneeActivite, shift.heureFin, shift.heureFinIsNight);
      let cols;
      if (shift.acheval) {
        // cols retourne la longeure totale du shifts(en prenant compte les heures en dehors du decoupage hoarire (acheval))
        cols = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.modifiable ? shift.heureDebutIsNight : false, shift.heureFin, shift.modifiable ? shift.heureFinIsNight : false);
      } else {
        cols = this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight);
      }
      // si x < 0 => affichage j+1 et shift commence dans J.
      // si on garde x < 0 => on aura un probleme au niveau de l'affichage
      // on remet x = 0 et on retrait la valeur negatif de x dans cols;
      // shift de 04 -> 08 (decoupage 06)
      // x = -8 (shift commence avant 2h) et cols = 16;
      // cols = cols + x = 16 + (-8) = 16 - 8 = 8
      // x = 0;
      if (x < 0 && shift.acheval) {
        cols += x;
        x = 0;
      }
      if (shift.employee && shift.employee.idEmployee !== null) {
        const employe = this._employees.find(employe => employe && (shift.employee.idEmployee === employe.idEmployee));
        y = this._employees.indexOf(employe) * 3;
        if (shift.positionTravail && employe) {
          if (shift.employee.hasOwnProperty('plgEquipier')) {
            const gridsterItem = {
              cols: cols,
              oldCols: cols,
              rows: 2,
              y: y,
              positionCopy: y,
              x: x,
              color: this.GREY,
              textColor: this.BLACK,
              iconEditShift: this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur),
              label: this.planningHourLabelFulldayService.getShiftLabelValue(shift, this.modeAffichage),
              timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage),
              textInsideShift: true,
              idShift: shift.idShift,
              isShift: true,
              dragEnabled: !shift.acheval && !shift.fromPlanningManager,
              resizeEnabled: false,
              employee: employe.nom + ' ' + employe.prenom,
              selectedEmployee: employe,
              selectedShift: shift,
              hdd: shift.heureDebut,
              hdf: shift.heureFin,
              heureDebutIsNight: shift.modifiable ? shift.heureDebutIsNight : false,
              heureFinIsNight: shift.modifiable ? shift.heureFinIsNight : false,
              notPlgEquipier: true,
              dateJournee: shift.dateJournee,
              sign: shift.sign,
              colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
              shiftPrincipale: shift.shiftPrincipale,
              canUpdate: !shift.fromPlanningManager,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              colACheval: shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0
            };
            if (gridsterItem.cols > 0) {
              if ((shift.fromPlanningManager && shift.totalHeure > 7) || !shift.fromPlanningManager) {
                this.data.push(gridsterItem);
              }
            }
          } else if (employe) {
            const gridsterItem = {
              cols: cols,
              oldCols: cols,
              rows: 2,
              y: y,
              positionCopy: y,
              x: x,
              color: shift.positionTravail.couleur,
              textColor: this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur),
              iconEditShift: this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur),
              label: this.planningHourLabelFulldayService.getShiftLabelValue(shift, this.modeAffichage),
              timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage),
              textInsideShift: true,
              idShift: shift.idShift,
              isShift: true,
              dragEnabled: this.enableDragAndResize && (!shift.acheval && !shift.fromPlanningManager),
              resizeEnabled: shift.acheval ? (shift.modifiable && !shift.fromPlanningManager) : (shift.notActifEquip ? false : this.enableDragAndResize && !shift.fromPlanningManager),
              employee: employe.nom + ' ' + employe.prenom,
              selectedEmployee: employe,
              selectedShift: shift,
              hdd: shift.heureDebut,
              hdf: shift.heureFin,
              heureDebutIsNight: shift.modifiable ? shift.heureDebutIsNight : false,
              heureFinIsNight: shift.modifiable ? shift.heureFinIsNight : false,
              dateJournee: shift.dateJournee,
              sign: shift.sign,
              colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
              shiftPrincipale: shift.shiftPrincipale,
              canUpdate: !shift.fromPlanningManager,
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
            ;
          }
        }
      } else {
        y = nullEmployeesIndexes[index] * 3;
        index = index + 1;
        const employee: EmployeeModel = new EmployeeModel();
        employee.nom = null;
        employee.prenom = null;
        employee.hebdoCourant = null;
        employee.hebdoPlanifie = null;
        employee.idEmployee = null;
        if (shift.positionTravail) {
          const gridsterItem = {
            cols: cols,
            oldCols: cols,
            rows: 2,
            y: y,
            positionCopy: y,
            x: x,
            color: shift.positionTravail.couleur,
            textColor: this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur),
            iconEditShift: this.brightnessColorShiftService.icontShift(shift.positionTravail.couleur),
            label: this.planningHourLabelFulldayService.getShiftLabelValue(shift, this.modeAffichage),
            timeLabel: this.planningHourLabelFulldayService.getTimeLabelValue(shift, this.modeAffichage),
            textInsideShift: true,
            idShift: shift.idShift,
            isShift: true,
            employee: employee,
            selectedEmployee: employee,
            dragEnabled: this.enableDragAndResize && !shift.acheval,
            resizeEnabled: shift.acheval ? (shift.modifiable && !shift.fromPlanningManager) : (shift.notActifEquip ? false : this.enableDragAndResize),
            selectedShift: shift,
            hdd: shift.heureDebut,
            hdf: shift.heureFin,
            heureDebutIsNight: shift.modifiable ? shift.heureDebutIsNight : false,
            heureFinIsNight: shift.modifiable ? shift.heureFinIsNight : false,
            colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
            shiftPrincipale: shift.shiftPrincipale,
            canUpdate: !shift.fromPlanningManager,
            notPlgEquipier: shift.notActifEquip,
            acheval: shift.acheval,
            modifiable: shift.modifiable,
            dateJournee: shift.dateJournee,
            colACheval: shift.acheval ? this.plgEquipierHelperService.convertDurationToColsNumber(shift.heureDebutCheval, shift.heureDebutChevalIsNight, shift.heureFinCheval, shift.heureFinChevalIsNight) : 0
          };

          if (gridsterItem.cols > 0) {
            if ((shift.fromPlanningManager && shift.totalHeure > 7) || !shift.fromPlanningManager) {
              this.data.push(gridsterItem);
            }
          }

        }
      }
    });
  }

  /**
   * Méthode appelé quand un item de la grille est redimensionné ou déplacé
   * @param gridsterItem item de la grille
   */
  private onItemChange(gridsterItem: GridsterItem, event?: any) {
    this.eventCtrl = false;
    if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
      this.eventCtrl = true;
    }
    if (this.lockState) {
      this.planningLockService.showPopOfLockedWeek();
    }
    let submitUpdate = true;
    if (gridsterItem.isShift && gridsterItem.cols > 0 && gridsterItem.y !== 0) {
      if (gridsterItem.x < this.startMinutesCells || (this.lockState && !this.updateButtonControl(this.domControlService, this.ecran))) {
        gridsterItem.cols = gridsterItem.cols - (this.startMinutesCells - gridsterItem.x);
        gridsterItem.x = this.startMinutesCells;
        submitUpdate = false;
      }
      // case fin journee d'activité
      if (!this.endMinutesCells) {
        this.gridLimit = (this.hours.length * 4);
      } else {
        this.gridLimit = ((this.hours.length - 1) * 4) + this.endMinutesCells;
      }
      if (this.minutesToSubstructFin !== 0) {
        if ((gridsterItem.x + gridsterItem.cols) > this.gridLimit || (this.lockState && !this.updateButtonControl(this.domControlService, this.ecran))) {
          gridsterItem.cols = gridsterItem.cols - (this.gridLimit - (gridsterItem.x + gridsterItem.cols));
          submitUpdate = false;
        }
      }
      if(this.eventCtrl && this.dragAction){
        submitUpdate = false;
        gridsterItem.associatedShifts = this.data.filter((item: GridsterItem) => item.y === gridsterItem.y);
        gridsterItem.hasAssociatedShifts = gridsterItem.associatedShifts.length;
      }
      this.oldItemData = gridsterItem;
      const employee: EmployeeModel = this.employees[gridsterItem.y / 3];
      const shift: ShiftModel = this.listShift.find(shift => shift.idShift === gridsterItem.idShift);
      if (shift.employee) {
        shift.employee.weekDetailsPlannings = [];

      }
      const oldShift = JSON.parse(JSON.stringify(shift));
      oldShift.heureDebut = new Date(oldShift.heureDebut);
      oldShift.heureFin = new Date(oldShift.heureFin);
      oldShift.heureDebutCheval = new Date(oldShift.heureDebutCheval);
      oldShift.heureFinCheval = new Date(oldShift.heureFinCheval);
      oldShift.dateJournee = new Date(oldShift.dateJournee);
      const oldShiftEmployee = shift.employee;
      if ((oldShiftEmployee === null && employee && employee.idEmployee === null)
        || (oldShiftEmployee && employee && oldShiftEmployee.idEmployee === employee.idEmployee)) {
        this.convertNewPosition(shift, gridsterItem, oldShift, submitUpdate, this.gridLimit);
      } else if ((oldShiftEmployee === null && employee && employee.idEmployee !== null) || (oldShiftEmployee && employee && oldShiftEmployee.idEmployee !== employee.idEmployee)) {
        // le shift a été déplacé à une autre ligne
        shift.employee = employee;
        this.convertNewPosition(shift, gridsterItem, oldShift, submitUpdate, this.gridLimit, oldShiftEmployee);
      }
    }
  }

  /**
   * Calculate Grid height based on employees length
   */
  private calculateGridHeight(): void {
    let employeesLength = this._employees.length;
    if (this.showTimeAxis && !this.employees.some(employe => employe.idEmployee === -1)) {
      employeesLength = employeesLength + 1;
    }
    if (this._minimalDisplaye) {
      this.employeeItemHeight = '30px';
      this.gridsterHeight = (30 * employeesLength).toString() + 'px';
    } else {
      this.employeeItemHeight = '39px';
      this.gridsterHeight = (39 * employeesLength).toString() + 'px';
    }
  }

  /**
   * Permet de vérifier si le shifts non acheval ou bien acheval est nous sommes sur j+1 (modifiable == false)
   * @param gridsterItem
   * @private
   */
  private checkIsItemAChevalOnJ(gridsterItem: GridsterItem) {
    if (gridsterItem.acheval) {
      return !gridsterItem.modifiable;
    }
    return true;
  }


  private addAChevalShifts(val: WeekDetailsPlanning[]): void {
    val.forEach((item: WeekDetailsPlanning, index: number) => {
      if (index !== val.length - 1) {
        item.shifts.forEach((sh: ShiftModel) => {
          if (sh.acheval && sh.modifiable) {
            const tmpShift = {...sh};
            //tmpShift.dateJournee = new Date(tmpShift.dateJournee.getTime() + (24 * 60 * 60 * 1000));
            tmpShift.heureDebut = tmpShift.heureDebutCheval;
            tmpShift.heureDebutIsNight = false;
            tmpShift.heureFin = tmpShift.heureFinCheval;
            tmpShift.heureFinIsNight = false;
            tmpShift.modifiable = false;
            //récupérer le bout de shift sur j+1 pour chaque shift à cheval
            const indexOfShiftAcheval = val[index + 1].shifts.findIndex(shiftDisplay => shiftDisplay.idShift === sh.idShift && !shiftDisplay.modifiable);
            if (indexOfShiftAcheval !== -1) {
              val[index + 1].shifts.splice(indexOfShiftAcheval, 1);
            }
            val[index + 1].shifts.push(tmpShift);
          }
        });

      }
    });
  }
}
