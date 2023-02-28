import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {TempPlanifiesTimePipe} from '../../pipe/temp-planifies-time.pipe';
import {DayViewGeneral} from '../../class/DayViewGeneral';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {DateService} from '../../../../../shared/service/date.service';
import {GdhService} from '../../service/gdh.service';
import {TypeEvenementService} from '../../../configuration/service/type.evenement.service';
import {TypePointageService} from '../../../configuration/service/type-pointage.service';
import {DecoupageHoraireService} from '../../../planning/configuration/service/decoupage.horaire.service';
import {GlobalSettingsService} from '../../../../../shared/service/global-settings.service';
import {
  GuiAbsenceGdh,
  GuiEmployeeGdh,
  GuiGdh,
  GuiPointageAbsenceGdh,
  GuiPointageGdh,
  GuiShiftGdh
} from '../../../../../shared/model/gui/vue-jour.model';
import {AbsenceCongeService} from '../../../employes/service/absence.conge.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {PointageService} from '../../service/pointage.service';
import {SharedEmployeeService} from '../../../employes/service/sharedEmployee.service';
import {RepasService} from '../../service/repas.service';
import {CoupuresService} from '../../service/coupures.service';
import {FirstLastNameFilterQueue} from '../../service/first-last-name-filter-queue.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {OverlayPanel} from 'primeng/primeng';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {BlockGdhService} from '../../service/block-gdh.service';
import {ShiftService} from '../../../planning/planning-equipier/service/shift.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {ParametreNationauxModel} from '../../../../../shared/model/parametre.nationaux.model';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {NationaliteModel} from '../../../../../shared/model/nationalite.model';
import {NationaliteService} from '../../../configuration/service/nationalite.service';
import {ParamNationauxService} from '../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';

@Component({
  selector: 'rhis-day-hourly-view',
  templateUrl: './day-hourly-view.component.html',
  styleUrls: ['./day-hourly-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DayHourlyViewComponent extends DayViewGeneral implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('day_hour')
  private dayHour: ElementRef;
  @Output()
  public lunchSortByOrder = new EventEmitter();
  // the width of employee first/last name column, this value is fixed
  public employeeNameSectionWidth = 140;
  public menuIsOpen = false;
  public menuWidth: number;
  public widthOfMinute = 0;
  private tempPlanifiesTimePipe = new TempPlanifiesTimePipe();
  protected limitAbsence: any;
  public heightInterface: any;
  public changePositionOverlay: number;
  private caretDecal = -19;
  public maxWidthPlanning: number;
  public ecran = 'GDH';
  // Reference to a created absence for a shift that don't have any 'pointage' or absences on it's interval
  public unjustifiedAbsenceCoordination;
  public pointageAbsenceToAdd: GuiPointageAbsenceGdh = {};
  @Input() public blockGdhParamDefault: any;

  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];

  constructor(protected rhisTranslateService: RhisTranslateService,
              protected notificationService: NotificationService,
              protected router: Router,
              protected dateService: DateService,
              protected shiftService: ShiftService,
              protected sharedRestaurantService: SharedRestaurantService,
              protected paramNationauxService: ParamNationauxService,
              protected gdhPointageService: GdhService,
              protected pointageService: PointageService,
              protected typeEvenementService: TypeEvenementService,
              protected typePointageService: TypePointageService,
              protected decoupageHoraireService: DecoupageHoraireService,
              private globalSettingsService: GlobalSettingsService,
              protected absenceCongeService: AbsenceCongeService,
              protected sharedEmployee: SharedEmployeeService,
              protected repasService: RepasService,
              protected coupuresService: CoupuresService,
              protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
              protected domControlService: DomControlService,
              protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
              protected parametreService: ParametreGlobalService,
              private nationnaliteService: NationaliteService,
              protected blockGdhService: BlockGdhService) {
    super(rhisTranslateService, notificationService, router, dateService, gdhPointageService, pointageService, typeEvenementService,
      typePointageService, decoupageHoraireService, absenceCongeService, sharedEmployee, repasService, coupuresService,
      firstLastNameFilterQueue, domControlService, limitDecoupageFulldayService, parametreService, blockGdhService);
    this.setUpFirstLastNameSearch();
    this.sortByOrder();
    if (!this.sharedRestaurantService.selectedRestaurant || !this.sharedRestaurantService.selectedRestaurant.idRestaurant || this.sharedRestaurantService.selectedRestaurant.idRestaurant === 0) {
      this.getParamNationauxByRestaurant();
    } else {
      this.paramNationaux = this.sharedRestaurantService.selectedRestaurant.parametreNationaux;
      this.sortBreakInParametresNationaux();
    }

  }

  public addControlButton(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit() {
    this.getPaysForSelectedRestaurant();
    this.setGdhModificationState();
    this.checkMenuSate();
    this.findTypeEvenement();
    this.findTypePointageRef();
  }

  ngAfterViewInit(): void {
    this.createDayHourlyTable();
  }

  // ckeck existing and update decoupage horaire for current day
  protected async checkDecoupageHoraire(): Promise<void> {
    await this.createDayHourlyTable();
  }

  /**
   * If the menu is open, on horizontal scroll should be displayed
   * otherwise, the table should take the maximum width of the page
   * Capturing the width of menu is essential to calculate the width of the table
   */
  private checkMenuSate() {
    this.menuIsOpen = this.globalSettingsService.menuIsOpen;
    this.menuWidth = this.globalSettingsService.menuWidh;
    this.globalSettingsService.onToggleMenu().subscribe((menuState: boolean) => this.menuIsOpen = menuState);
    this.globalSettingsService.getMenuWidth().subscribe((menuWidth: number) => this.menuWidth = menuWidth);
  }

  /***
   * Chaque colone represente 30 minutes = 25px
   * 1440 égale à 24 heures, si on dépasse 23h on revient vers 00h, 01h, 02h ....
   * on ajoute null à chaque fois pour ne pas afficher les demi heures
   */
  private createColumn(startTime: number, toTime: number, minutePartInEndHour: number) {
    this.header = [];
    let isNight = false;
    for (let t = startTime * 60; t <= 60 * (toTime + 1); t = t + 60) {
      let aux = t;
      if (aux >= 1440) {
        aux = aux - 1440;
        isNight = true;
      }
      this.header.push({title: this.tempPlanifiesTimePipe.transform(aux), field: aux, isNight: isNight});
      this.header.push({title: this.tempPlanifiesTimePipe.transform(null), field: null, isNight: isNight});
    }

    /**
     * Verify the number of columns at the end based on minutes part of closing hour
     */
    let nbrSlotToRetrieve = 1;
    if (minutePartInEndHour === 0) {
      nbrSlotToRetrieve = 3;
    } else if (minutePartInEndHour <= 30) {
      nbrSlotToRetrieve = 2;
    }
    this.header.splice(this.header.length - nbrSlotToRetrieve);
  }

  /**
   * Get start/end hour and create table with the disposal measures
   */
  private async createDayHourlyTable(): Promise<void> {
    await this.getOpenAndCloseHours();
    const startTimeNb = this.converteStringToHour(this.startTime, this.startTimeIsNight);
    const toTimeNb = this.converteStringToHour(this.endTime, this.endTimeIsNight);
    this.createColumn(startTimeNb, toTimeNb, +this.endTime.substring(3, 5));
    this.setDisposalWidthsforTable();
  }

  /**
   * Set the width of a minutes and the maximum width of day hourly view table that we can get
   */
  private setDisposalWidthsforTable(): void {
    this.widthOfMinute = Math.trunc(
      (
        this.dayHour.nativeElement.offsetWidth - this.employeeNameSectionWidth
        + (this.menuIsOpen ? this.menuWidth : 0)
      ) / (this.header.length * 30)) || 1;
    document.getElementById('vue-heure').style.setProperty(
      'width', `${this.widthOfMinute * 30 * this.header.length + this.employeeNameSectionWidth}px`, 'important'
    );
  }

  /**
   * Get the last hour to display in the table based on the close hour of the day
   */
  public getEndHourIfShouldBeDisplayed(): string {
    const minutePartInEndHour: number = +this.endTime.substring(3, 5);
    const hourPartInEndHour: string = this.endTime.substring(0, 2);
    if (minutePartInEndHour === 0) {
      return hourPartInEndHour + ':00';
    } else if (minutePartInEndHour > 30) {
      const lastHour = +hourPartInEndHour + 1;
      return `${(lastHour !== 24 ? lastHour : 0).toString().padStart(2, '0')}:00`;
    }
    return '';
  }

  // si 06h et night egale à true, dans ce cas là, il faut ajouter 24 heures
  private converteStringToHour(time: string, night: boolean): number {
    const arrAux = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let hour = 0;
    if (arrAux.length > 0) {
      if (night === true) {
        hour = (+arrAux[0]) + 24;
      } else {
        hour = (+arrAux[0]);
      }
    }
    return hour;
  }

  /**
   * Check if absence intersect with a shift
   * This boolean is needed in HoursDivComponent to specify the position of an absence compared to the position of a shift
   * @param: employee
   * @param: col
   */
  public checkIntersectioBetweenShiftAndAbsence(employee: GuiEmployeeGdh, col: any): boolean {
    let intersection = false;
    employee.shifts.filter(shift => shift.id !== 0).forEach(shift => {
      if (shift.heureDebut && col.title.substring(0, 2) === shift.heureDebut.substring(0, 2)
        && shift.heureDebutIsNight === col.isNight) {
        intersection = true;
      }
    });
    return intersection;
  }

  public clickedAbsence(event: any, totalShiftInMinute: number, shiftStarHour: string, index: number): void {
    this.limitAbsence = event;
    if (this.limitAbsence) {
      const decaleSize = (index === 0 ? Number(shiftStarHour.substring(3, 5)) : 0) + this.caretDecal;
      if (this.limitAbsence.libelle === 'Retard') {
        const decal = (this.limitAbsence.totalMinutes / 2) + decaleSize;
        this.changePositionOverlay = (decal >= 0 ? decal : 0);
      } else {
        this.changePositionOverlay = (index === 0 ? (totalShiftInMinute - (this.limitAbsence.totalMinutes / 2)) :
          this.limitAbsence['totalMinutesPointage'] + (this.limitAbsence.totalMinutes / 2)) + decaleSize;
      }

    }
  }

  public getAbsencePointageOverlayPanelPosition(employee: GuiEmployeeGdh, pointage: GuiPointageGdh, shift: GuiShiftGdh, absence: GuiAbsenceGdh, index: number): number {
    if (pointage && shift) {
      let decal;
      if (pointage.arrives <= 0) {
        const shiftInterval = pointage.totalMinutes + pointage.arrives - (pointage.sortie < 0 ? 0 : pointage.sortie);
        decal = (shiftInterval / 2) + Math.abs(pointage.arrives) + this.caretDecal;
      } else {
        const pointagePositions: { isFirst: boolean, isLast: boolean } = this.getPointageOrderAmongOthers(pointage, employee, this.dateService);
        let firstPart = 0;
        if (pointagePositions.isFirst) {
          if (index === 0) {
            firstPart = Math.abs(pointage.arrives);
          } else {
            const items: GuiGdh[] = this.getPointageAndInnerShiftAbsences(shift);
            const previousItem = items[index - 1];
            firstPart = this.dateService.getDiffInMinuteInBetween(previousItem, pointage);
          }
        } else {
          firstPart = Number(shift.heureDebut.substring(3, 5));
        }
        decal = firstPart +
          ((pointage.totalMinutes - (pointage.sortie < 0 ? 0 : pointage.sortie)) / 2) +
          this.caretDecal;
      }
      return decal >= 0 ? decal : 0;
    } else if (absence) {
      const marginLeft = (absence.totalMinutes / 2) + this.caretDecal;
      return marginLeft >= 0 ? marginLeft : 0;
    }
    return 0;
  }

  public getPointageAndInnerShiftAbsences(shift: GuiShiftGdh): GuiGdh [] {
    return [].concat(shift.absences ? shift.absences : [], shift.pointages).sort((firstItem: GuiGdh, secondItem: GuiGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(firstItem, secondItem) ? -1 : 1);
  }

  public getPointageIndex(index: number, items: GuiGdh[]): number {
    if (items[index]['typePointage']) {
      return items.slice(0, index + 1).filter((item: GuiGdh) => item.id !== undefined).length - 1;
    }
    return index;
  }

  /**
   * Calculate margin between ``pointages`` associated for the same shift
   * Calculate too the margin left from the nearest hour (minute margin) for single ``pointages`` and absences
   * @param: pointages
   * @param: index
   */
  public getMarginLeft(shift: GuiShiftGdh, index: number, absence: GuiAbsenceGdh, employee: GuiEmployeeGdh,
                       widthOfMinute: number): number {
    if (shift) {
      if (shift.id === 0) {
        return Number(shift.pointages[0].heureDebut.substring(3, 5)) * widthOfMinute;
      }
      const items: GuiGdh[] = this.getPointageAndInnerShiftAbsences(shift);
      const phaseFromNearestHour = Number(shift.heureDebut.substring(3, 5));
      if (shift.absences.length && absence &&
        shift.absences.find((abs: GuiAbsenceGdh) => abs['typeEvenement'] && abs.id === absence.id)) {
        if (index !== 0) {
          const previousItem = items[index - 1];
          if (previousItem['typePointage']) {
            const previousPointagePosition: { isFirst: boolean, isLast: boolean; } = this.getPointageOrderAmongOthers(previousItem, employee, this.dateService);
            if (previousPointagePosition.isLast && shift.absences.length <= 1) {
              if (previousItem['arrives'] === 0) {
                return 0;
              } else {
                return phaseFromNearestHour;
              }
            } else if (shift.absences.length >= 2) {
              return 0;
            }
          }
          return (this.dateService.getDiffInMinuteInBetween(previousItem, absence) +
            ((previousItem['typePointage'] && previousItem['arrives'] > 0 && (index - 1 === 0)) ? phaseFromNearestHour : 0)) * widthOfMinute;
        } else {
          const marginFromShift = this.dateService.getDiffInMinutesForStartHours(absence, shift) * widthOfMinute;
          if (shift.pointages.length) {
            return marginFromShift + Number(shift.heureDebut.substring(3, 5));
          }
          return marginFromShift;
        }
      } else {
        const pointage = <GuiPointageGdh>this.getPointageAndInnerShiftAbsences(shift)[index];
        const pointagePosition: { isFirst: boolean, isLast: boolean; } = this.getPointageOrderAmongOthers(pointage, employee, this.dateService);
        if (index === 0) {
          return pointage.arrives <= 0 ? (pointage.arrives + phaseFromNearestHour) * widthOfMinute : (pointagePosition.isFirst ? 0 : pointage.arrives * widthOfMinute);
        } else {
          if (pointagePosition.isFirst) {
            return 0;
          } else {
            const end = this.dateService.getDateFromIsNight(
              new Date(`${pointage.dateJournee} ${pointage.heureDebut}`), pointage.heureDebutIsNight
            );
            const previousPointage = items[index - 1];
            const start = this.dateService.getDateFromIsNight(
              new Date(`${previousPointage.dateJournee} ${previousPointage.heureFin}`), previousPointage.heureFinIsNight
            );
            return (this.dateService.getDiffOn(end, start) +
              ((previousPointage['typePointage'] && previousPointage['arrives'] > 0 && (index - 1 === 0)) ? phaseFromNearestHour : 0)) * this.widthOfMinute;
          }
        }
      }
    }
    return Number(absence.heureDebut.substring(3, 5)) * widthOfMinute;
  }

  /**
   * Verify if we should display shift for this column of the talbe
   * @param: shift
   * @param: col (a column infos)
   */
  public getDisplayCondition([shift, col]): boolean {
    return (
        shift.heureDebut && (col.title.substring(0, 2) === shift.heureDebut.substring(0, 2))
        && (shift.heureDebutIsNight === col.isNight)
      ) ||
      (
        (shift.id === 0) && (col.title.substring(0, 2) === shift.pointages[0].heureDebut.substring(0, 2))
        && (shift.pointages[0].heureDebutIsNight === col.isNight)
      ) || false;
  }

  public isThereAnyIntersection(shift: GuiShiftGdh, employee: GuiEmployeeGdh, dateService: DateService): boolean {
    return employee.shifts.filter((s: GuiGdh) => s.id)
      .map((s: GuiShiftGdh) => (s.pointages ? s.pointages : []).concat((s.absences ? s.absences : [])))
      .reduce((previousValue, currentValue) => [...currentValue, ...previousValue], [])
      .concat(employee.absences ? employee.absences : [])
      .some((item: GuiGdh) => {
        const [start, end] = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(shift, item);
        return !(start == null || end == null);
      });
  }

  public getPointageOrderAmongOthers(pointage: GuiPointageGdh, employee: GuiEmployeeGdh, dateService: DateService): { isFirst: boolean, isLast: boolean } {
    const orderedPointages = employee.shifts.map((s: GuiShiftGdh) => (s.pointages ? s.pointages : []))
      .reduce((previousValue, currentValue) => [...currentValue, ...previousValue], [])
      .filter(p => (p.acheval && p.modifiable) || (!p.acheval))
      .sort((firstPointage: GuiPointageGdh, secondPointage: GuiPointageGdh) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstPointage, secondPointage) ? -1 : 1);
    if (orderedPointages.length && pointage) {
      return {
        isFirst: orderedPointages[0].id === pointage.id,
        isLast: orderedPointages[orderedPointages.length - 1].id === pointage.id
      };
    }
    return {isFirst: false, isLast: false};
  }

  public async showUnjustifiedAbsencePopUp(shift: GuiShiftGdh, employee: GuiEmployeeGdh, overlayPanel: OverlayPanel, index: number, event: Event): Promise<void> {
    overlayPanel.hide();
    await this.dateService.delay(0);
    if (!this.isThereAnyIntersection(shift, employee, this.dateService) && !this.isModificationBlocked) {
      const {dateJournee, heureDebut, heureDebutIsNight, heureFin, heureFinIsNight} = shift;
      const pauseValue = this.getPauseValue(shift, employee);
      this.unjustifiedAbsenceCoordination = {
        absencePointage: {
          data: {
            dateJournee,
            heureDebut,
            heureDebutIsNight,
            heureFin,
            heureFinIsNight,
            pauseValue
          },
          shift: {id: shift.id},
          error: false
        },
        employee: employee,
        indexEmployee: index
      };
      if (+this.blockGdhParamDefault === 0) {

        this.unjustifiedAbsenceCoordination = {
          ...this.unjustifiedAbsenceCoordination,
          absencePointage: {
            ...this.unjustifiedAbsenceCoordination.absencePointage,
            data: {
              ...this.unjustifiedAbsenceCoordination.absencePointage.data,
              typePointage: this.typePointages.find(typePointage => typePointage.libelle === 'Terrain') || null
            },
          }
        };
      } else if (+this.blockGdhParamDefault === 1) {
        this.unjustifiedAbsenceCoordination = {
          ...this.unjustifiedAbsenceCoordination,
          absencePointage: {
            ...this.unjustifiedAbsenceCoordination.absencePointage,
            data: {
              ...this.unjustifiedAbsenceCoordination.absencePointage.data,
              typeEvenement: this.typeEvenements.find(typeEvenement => typeEvenement.code.toUpperCase() === 'AI') || null
            },
          }
        };
      }
      overlayPanel.show(event);
    }
  }

  public getAssociatedShifts(dateService: DateService, pointage: GuiPointageGdh, shift: GuiShiftGdh, shifts: GuiShiftGdh[], employe: GuiEmployeeGdh): any[] {
    const partitions = [];
    if (shifts && (shift.id !== 0)) {
      const realShifts = shifts.filter(s => s.id !== 0).sort((firstShift: GuiShiftGdh, secondShift: GuiShiftGdh) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstShift, secondShift) ? -1 : 1);
      const intersections = [];
      realShifts.forEach((s: GuiShiftGdh) => {
        if (s.id !== shift.id && pointage['typePointage']) {
          const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(s, pointage);
          if ((intersection[0] != null) && (intersection[1] != null)) {
            intersections.push({shift: s, interval: intersection});
          }
        }
      });
      if (intersections.length) {
        intersections.forEach((intersection, index: number) => {
          const partition = [];
          partition.push(intersection);
          if (intersections[index + 1]) {
            partition.push(null, {
              shift: null,
              interval: [intersection.interval[1], intersections[index + 1].interval[0]]
            });
          } else {
            const endShiftDate = dateService.getDateFromIsNight(new Date(`${intersection.shift.dateJournee} ${intersection.shift.heureFin}`), intersection.shift.heureFinIsNight);
            const endPointageDate = dateService.getDateFromIsNight(new Date(`${pointage.dateJournee} ${pointage.heureFin}`), pointage.heureFinIsNight);
            if (dateService.isSameDateOn(endPointageDate, endShiftDate, 'minutes')) {
              partition.push(null, null);
            } else if (dateService.isBefore(endPointageDate, endShiftDate)) {
              if (intersection.shift.pointages && intersection.shift.pointages.length) {
                partition.push(null, null);
              } else {
                partition.push({shift: intersection.shift, interval: [intersection.interval[1], endShiftDate]}, null);
              }
            } else if (dateService.isBefore(endShiftDate, endPointageDate)) {
              partition.push(null, {shift: null, interval: [endShiftDate, endPointageDate]});
            }
          }
          partitions.push(partition);

          const intersectedAbsences = employe.absences.filter((absence: GuiGdh) => {
            const [start, end] = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(intersection['shift'], absence);
            return !(start == null || end == null);
          });
          if (intersectedAbsences && intersectedAbsences.length && partitions.length) {
            intersectedAbsences.sort((abs1: GuiAbsenceGdh, abs2: GuiAbsenceGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(abs1, abs2) ? -1 : 1);
            partitions.forEach(element => {
              if (element[1] && (element[1]['shift']['id'] === intersection['shift']['id'])) {
                const absStartHour = dateService.getDateFromIsNight(new Date(`${intersectedAbsences[0].dateJournee} ${intersectedAbsences[0].heureDebut}`), intersectedAbsences[0].heureDebutIsNight);
                if (dateService.isSameDateOn(absStartHour, intersection['interval'][1], 'minutes')) {
                  element[1] = null;
                } else {
                  element[1] = {shift: intersection.shift, interval: [intersection.interval[1], absStartHour]};
                }
              }
            });
          }
        });
      }
    }
    return partitions;
  }

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
  private setShiftAndBreakOfParmetreNationaux(shift: Date, breakOfParmatre: Date): void {
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

  private getPauseValue(shift: GuiShiftGdh, gdhEmployee: GuiEmployeeGdh): number {
    const heureDebutAsDate = this.dateService.setTimeFormatHHMM(shift.heureDebut, shift.heureDebutIsNight);
    const heureFinAsDate = this.dateService.setTimeFormatHHMM(shift.heureFin, shift.heureFinIsNight);
    const employee = this.convertGdhEmployeeToEmployee(gdhEmployee);
    const shiftCopy = {...shift};
    shiftCopy.heureDebut = heureDebutAsDate;
    shiftCopy.heureFin = heureFinAsDate;
    const totalDayWithBreak = this.shiftService.getDayTotalHoursForEmployee([shiftCopy], employee, this.paramNationaux, this.listOfBreakAndShift, 0, null, null, null, true, true);

    // la division par 60000 pour avoir la valeur en minutes
    return ((heureFinAsDate.getTime() - heureDebutAsDate.getTime()) / 60000) - totalDayWithBreak;
  }

  private convertGdhEmployeeToEmployee(gdhEmployee: GuiEmployeeGdh): EmployeeModel {
    const employee = new EmployeeModel();
    employee.sexe = gdhEmployee.sexe;
    employee.dateNaissance = gdhEmployee.dateNaissance;
    employee.contrats = [gdhEmployee.activeContrat];
    employee.loiEmployee = gdhEmployee.loiEmployee;
    return employee;
  }

  protected createInnerShiftAbsencesPerEmployee(employee: GuiEmployeeGdh): void {
    employee.shifts.forEach((shift: GuiShiftGdh) => {
      let intersectedAbsences: GuiAbsenceGdh[] = [];
      if (shift.absences && shift.absences.length) {
        employee.absences = employee.absences.concat(shift.absences);
      }
      if (shift.id && shift.pointages.length) {
        // get intersected absences
        if (employee.absences && employee.absences.length) {
          intersectedAbsences = employee.absences.filter((absence: GuiGdh) => {
            const [start, end] = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(shift, absence);
            return !(start == null || end == null);
          });

          intersectedAbsences.forEach((intersectedAbs: GuiAbsenceGdh) => {
            const intersectedAbsIndex = employee.absences.findIndex((element: GuiAbsenceGdh) => element.id === intersectedAbs.id);
            if (intersectedAbsIndex !== -1) {
              employee.absences.splice(intersectedAbsIndex, 1);
            }
          });
        }
        intersectedAbsences = intersectedAbsences.filter((intersectedAbs: GuiAbsenceGdh) => intersectedAbs.id);
        const items: GuiGdh [] = [].concat(shift.pointages, intersectedAbsences);
        items.sort((p1: GuiGdh, p2: GuiGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(p1, p2) ? -1 : 1);
      } else {
        employee.absences = employee.absences.filter((abs: GuiAbsenceGdh) => abs.id);
      }
      shift.absences = intersectedAbsences;
    });
  }

  /**
   * Initialize the entity responsible for adding ``pointage``/absence
   */
  public setPointageAbsenceToAdd(): void {
    this.pointageAbsenceToAdd = {
      shift: null, shown: true, error: false,
      data: {dateJournee: this.filter.date.split('-').reverse().join('-')}
    };
  }

  public onHideAddPopUp(): void {
    this.setPointageAbsenceToAdd();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  public sortList(): void {
    this.lunchSortByOrder.emit();
  }

  /**
   * get restaurant
   */
  private getPaysForSelectedRestaurant() {
    if (this.sharedRestaurantService.selectedRestaurant.idRestaurant && this.sharedRestaurantService.selectedRestaurant.idRestaurant !== 0) {
      this.getPaysOfRestaurant();
    } else {
      this.sharedRestaurantService.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurantService.selectedRestaurant = data;
          this.getPaysOfRestaurant();
        }, (err: any) => {
          console.log(err);
        }
      );
    }
  }

  /**
   * get pâyes of restaurant
   */
  private getPaysOfRestaurant() {
    this.nationnaliteService.getNationaliteByRestaurant().subscribe(
      (data: NationaliteModel) => {
        this.sharedRestaurantService.selectedRestaurant.pays = data;
      }, (err: any) => {
        // TODO error panel
        console.log(err);
      }
    );
  }
}
