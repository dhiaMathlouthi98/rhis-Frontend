import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DayViewGeneral} from '../../class/DayViewGeneral';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {DateService} from '../../../../../shared/service/date.service';
import {GdhService} from '../../service/gdh.service';
import {TypeEvenementService} from '../../../configuration/service/type.evenement.service';
import {TypePointageService} from '../../../configuration/service/type-pointage.service';
import {
  GuiAbsenceGdh,
  GuiEmployeeGdh,
  GuiPointageAbsenceGdh,
  GuiPointageGdh,
  GuiShiftGdh,
  GuiVueJourTotalInfoGdh
} from '../../../../../shared/model/gui/vue-jour.model';
import {DecoupageHoraireService} from '../../../planning/configuration/service/decoupage.horaire.service';
import {AbsenceCongeService} from '../../../employes/service/absence.conge.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {PointageService} from '../../service/pointage.service';
import {SharedEmployeeService} from '../../../employes/service/sharedEmployee.service';
import {RepasService} from '../../service/repas.service';
import {RepasModel} from '../../../../../shared/model/repas.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {CoupuresService} from '../../service/coupures.service';
import {FirstLastNameFilterQueue} from '../../service/first-last-name-filter-queue.service';
import {GlobalSettingsService} from '../../../../../shared/service/global-settings.service';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {BlockGdhService} from '../../service/block-gdh.service';

@Component({
  selector: 'rhis-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']

})
export class DayViewComponent extends DayViewGeneral implements OnInit, OnDestroy {
  @Input()
  public isHourlyView: boolean;
  @Output()
  public lunchSortByOrder = new EventEmitter();
  public openedFilterPopup = false;
  public pointageAbsenceToAdd: GuiPointageAbsenceGdh = {};
  public showCoupuresCol = true;
  public showRepasCol = true;
  public ecran = 'GDH';
  public total: GuiVueJourTotalInfoGdh;
  public frozenLines = [
    {
      title: '',
      pointages: '',
      tempsPlanifie: 0,
      tempsPoint: 0,
      tempsAbsence: 0,
      coupures: 0,
      repas: ''
    }
  ];

  public heightInterface: any;

  public test = false;
  public menuIsOpen = false;
  public menuWidth: number;
  @Input() public blockGdhParamDefault: any;

  constructor(protected rhisTranslateService: RhisTranslateService,
              protected notificationService: NotificationService,
              protected router: Router,
              protected dateService: DateService,
              protected gdhPointageService: GdhService,
              protected pointageService: PointageService,
              protected typeEvenementService: TypeEvenementService,
              protected typePointageService: TypePointageService,
              protected decoupageHoraireService: DecoupageHoraireService,
              protected absenceCongeService: AbsenceCongeService,
              protected sharedEmployee: SharedEmployeeService,
              protected repasService: RepasService,
              protected coupuresService: CoupuresService,
              protected firstLastNameFilterQueue: FirstLastNameFilterQueue,
              private globalSettingsService: GlobalSettingsService,
              protected domControlService: DomControlService,
              protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
              protected parametreService: ParametreGlobalService,
              protected blockGdhService: BlockGdhService) {
    super(rhisTranslateService, notificationService, router, dateService, gdhPointageService, pointageService, typeEvenementService,
      typePointageService, decoupageHoraireService, absenceCongeService, sharedEmployee, repasService, coupuresService,
        firstLastNameFilterQueue, domControlService, limitDecoupageFulldayService, parametreService, blockGdhService);
    this.setUpFirstLastNameSearch();
    this.sortByOrder();
  }

  async ngOnInit() {
    this.setGdhModificationState();
    this.checkMenuSate();
    this.setTableHeader();
    this.findTypeEvenement();
    this.findTypePointageRef();
    await this.getOpenAndCloseHours();
    this.setPointageAbsenceToAdd();
  }

  /**
   * If the menu is open, on horizontal scroll should be displayed
   */
  private checkMenuSate() {
    this.menuIsOpen = this.globalSettingsService.menuIsOpen;
    this.globalSettingsService.onToggleMenu().subscribe((menuState: boolean) => this.menuIsOpen = menuState);
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

  /**
   * Initialize the entity responsible for adding ``pointage``/absence
   */
  public setPointageAbsenceToAdd(): void {
    this.pointageAbsenceToAdd = {
      shift: null, shown: true, error: false,
      data: {dateJournee: this.filter.date.split('-').reverse().join('-')}
    };
    this.test = !this.test;
  }

  /**
   * In ``pointages`` column, we should display ``pointages`` and absences in tow blocks
   * ordered from top to bottom beginning by the first block then the second chronologically
   * It returns the number of ``pointage(s)``/absence(s) to display in the first block
   * @param: total: total ``pointage(s)``/absence(s)
   */
  public getLimit(total: number): number {
    if (total % 2 === 1) {
      return (total + 1) / 2;
    }
    return total / 2;
  }

  protected async saveRepasAndGetCorrectNumber(repas: RepasModel): Promise<number> {
    return this.repasService.setRepasForEmployeeForPeriodBetweenTowDates(repas.nbrRepas, repas.employee.uuid, this.filter.date, this.filter.date).toPromise();
  }

  public getPointagesAndAbsences(employee: GuiEmployeeGdh, guiDay24Coordination, modeAffichage): GuiPointageAbsenceGdh[] {
    let pointagesAndAbsences: GuiPointageAbsenceGdh[] = [];
    // Get a list of a a single associated with it's shift values
    if (employee.shifts) {
      employee.shifts.forEach((shift: GuiShiftGdh) => {
        if (shift.pointages) {
          shift.pointages.forEach((pointage: GuiPointageGdh, index: number) => {
            // the first acheval mode is when display mode = 1.
            if (pointage.acheval && !pointage.modifiable && guiDay24Coordination.is24WithPreviousDay && (modeAffichage === 1)) {
              pointagesAndAbsences.push(null);
            } else {
              pointagesAndAbsences.push({
                shift: {...shift, pointages: null},
                data: pointage,
                first: index === 0,
                last: index === shift.pointages.length - 1,
                shown: false,
                error: false
              });
            }
          });
        }
      });
    }
    // Extract and add absences to the above list
    if (employee.absences) {
      pointagesAndAbsences.push(...
          employee.absences.map((absence: GuiAbsenceGdh, index: number) => {
                if (absence.acheval && !absence.modifiable && guiDay24Coordination.is24WithPreviousDay && modeAffichage === 1) {
                  return null;
                } else {
                  return {
                    shift: null,
                    data: absence,
                    first: index === 0,
                    last: index === employee.absences.length - 1,
                    shown: false,
                    error: false
                  };
                }
              }
          ));
    }
    pointagesAndAbsences = pointagesAndAbsences.filter(value => value != null);
    // sort chronologically all object based on ``heureDebut`` and ``heureDebutIsNight``
    pointagesAndAbsences.sort((pa1: GuiPointageAbsenceGdh, pa2: GuiPointageAbsenceGdh) => {
      const pa1StartHour = new Date(pa1.data.dateJournee + ' ' + pa1.data.heureDebut);
      pa1StartHour.setDate(pa1StartHour.getDate() + (pa1.data.heureDebutIsNight ? 1 : 0));
      const pa2StartHour = new Date(pa2.data.dateJournee + ' ' + pa2.data.heureDebut);
      pa2StartHour.setDate(pa2StartHour.getDate() + (pa2.data.heureDebutIsNight ? 1 : 0));
      if (pa1StartHour > pa2StartHour) {
        return 1;
      } else if (pa1StartHour < pa2StartHour) {
        return -1;
      } else {
        return 0;
      }
    });
    return pointagesAndAbsences;
  }

  private setTableHeader(): void {
    this.header = [
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.POINTAGES'), field: 'pointages'},
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.TEMPS_PLANIFIE'), field: 'tempsPlanifie'},
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.TEMPS_POINT'), field: 'tempsPoint'},
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.TEMPS_ABSENCE'), field: 'tempsAbsence'},
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.COUPURES'), field: 'coupures'},
      {title: this.rhisTranslateService.translate('GDH.DAY_VEIW.TABLE_HEADER.REAPS'), field: 'repas'}
    ];
  }

  // gestion de filter des colonnes
  public toggleFilterPopup(): void {
    this.openedFilterPopup = !this.openedFilterPopup;
  }

  public closeFilterPopup(): void {
    this.openedFilterPopup = false;
  }

  public toggleColumn(data: any): void {
    this.showCoupuresCol = data.showCoupuresCol;
    this.showRepasCol = data.showRepasCol;
  }

  public onHideAddPopUp(): void {
    this.setPointageAbsenceToAdd();
  }

  public employeeHasNoPointagesOrAbsences(employee: GuiEmployeeGdh): boolean {
    const employeeHasNoPointages = employee.shifts.every((shift: GuiShiftGdh) => (shift.pointages == null) || (shift.pointages.length === 0));
    const employeeHasNoAbsences = (employee.absences == null) || (employee.absences.length === 0);
    return employeeHasNoAbsences && employeeHasNoPointages;
  }

  // ckeck existing and update decoupage horaire for current day
  protected async checkDecoupageHoraire(): Promise<void> {
    await this.getOpenAndCloseHours();
  }


  public isNotFilteredColumns(fieldName: string): boolean {
    return !['coupures', 'repas', 'pointages'].includes(fieldName);
  }

  public isFilteredColumns(fieldName: string): boolean {
    return ((fieldName === 'coupures' && this.showCoupuresCol) || (fieldName === 'repas' && this.showRepasCol));
  }

  protected getTotalGdh(): void {
    this.gdhPointageService.getTotalGdhDayView(this.filter).subscribe((total: GuiVueJourTotalInfoGdh) => {
      this.total = total;
      const totalGdhHeader = this.frozenLines.pop();
      totalGdhHeader.title = this.dateService.getFormattedDate(new Date(this.filter.date.split('-').reverse().join('-')), 'dddd DD MMMM', this.rhisTranslateService.currentLang);
      totalGdhHeader.tempsPlanifie = total.tempsPlanifies;
      totalGdhHeader.tempsPoint = total.tempsPointes;
      totalGdhHeader.tempsAbsence = total.tempsAbsences;
      this.frozenLines.push(totalGdhHeader);
    });
  }

  protected getTotalRepas(): void {
    const filter = {...this.filter, weekStartDate: this.filter.date, weekEndDate: this.filter.date};
    this.gdhPointageService.getTotalRepasForPeriod(filter).subscribe((repas: number) => this.total.repas = repas);
  }

  protected createInnerShiftAbsencesPerEmployee(employee: GuiEmployeeGdh): void {
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  public sortList(): void {
    this.lunchSortByOrder.emit();
  }
}
