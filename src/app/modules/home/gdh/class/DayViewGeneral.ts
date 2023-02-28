import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {DateService} from '../../../../shared/service/date.service';
import {GdhService} from '../service/gdh.service';
import {TypeEvenementService} from '../../configuration/service/type.evenement.service';
import {TypePointageService} from '../../configuration/service/type-pointage.service';
import {TypeEvenementModel} from '../../../../shared/model/type.evenement.model';
import {TypePointageModel} from '../../../../shared/model/type-pointage.model';
import {GDHGeneral} from './GDHGeneral';
import {
  GuiAbsenceGdh,
  GuiEmployeeGdh,
  GuiGdh,
  GuiPointageAbsenceActionGdh,
  GuiPointageAbsenceGdh,
  GuiPointageGdh,
  GuiShiftGdh,
  VueJourModel
} from '../../../../shared/model/gui/vue-jour.model';
import {JourSemaine} from '../../../../shared/enumeration/jour.semaine';
import {DecoupageHoraireService} from '../../planning/configuration/service/decoupage.horaire.service';
import {AbsenceCongeService} from '../../employes/service/absence.conge.service';
import {AbsenceCongeModel} from '../../../../shared/model/absence.conge.model';
import {EmployeeModel} from '../../../../shared/model/employee.model';
import {NotificationService} from '../../../../shared/service/notification.service';
import {PointageModel} from '../../../../shared/model/pointage.model';
import {PointageService} from '../service/pointage.service';
import {DateInterval} from '../../../../shared/model/gui/date-interval';
import {StatusDemandeCongeEnumeration} from '../../../../shared/model/enumeration/status.demande.conge.enumeration';
import {SharedEmployeeService} from '../../employes/service/sharedEmployee.service';
import {RepasModel} from '../../../../shared/model/repas.model';
import {RepasService} from '../service/repas.service';
import {CoupuresService} from '../service/coupures.service';
import {DecoupageHoraireModel} from '../../../../shared/model/decoupage.horaire.model';
import {FirstLastNameFilterQueue} from '../service/first-last-name-filter-queue.service';
import {OverlayPanel} from 'primeng/primeng';
import {DomControlService} from '../../../../shared/service/dom-control.service';
import {GenerationReport} from '../../../../shared/enumeration/generation.rapport';
import {forkJoin, Observable} from 'rxjs';
import {LimitDecoupageFulldayService} from '../../../../shared/service/limit.decoupage.fullday.service';
import {ParametreGlobalService} from '../../configuration/service/param.global.service';
import {GuiPointageAbsence} from '../../../../shared/model/gui/GuiPointageAbsence';
import {GuiDay24Coordination} from '../../../../shared/model/gui/gdh-period-model';
import {BlockGdhService} from '../service/block-gdh.service';

export abstract class DayViewGeneral extends GDHGeneral {

  protected typeEvenements: TypeEvenementModel[];
  protected typePointages: TypePointageModel[];
  public gdhViewData: VueJourModel;
  protected startTime: string;
  protected startTimeIsNight: boolean;
  protected endTime: string;
  protected endTimeIsNight: boolean;
  protected debutJourneesPhases: DecoupageHoraireModel;
  protected finJourneesPhases: DecoupageHoraireModel;
  public header = [];
  public ecran = 'GDH';
  public showVoucherPdf = false;
  public popUpStyle = {
    height: 700
  };
  public bonInfo: any;
  public isReportGenerationLoader = false;
  public reportGenerationLabel: string;
  public reportGenerationTitle = this.rhisTranslateService.translate('REPORT.GENERATOR_LOADER_TITLE');
  public decoupageHoraireFinEtDebutActivity: any;
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;

  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';

  protected constructor(protected rhisTranslateService: RhisTranslateService,
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
                        protected domControlService: DomControlService,
                        protected limitDecoupageFulldayService: LimitDecoupageFulldayService,
                        protected parametreService: ParametreGlobalService,
                        protected blockGdhService: BlockGdhService) {
    super(dateService, sharedEmployee, firstLastNameFilterQueue, notificationService, limitDecoupageFulldayService, blockGdhService);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  protected findTypeEvenement() {
    this.typeEvenementService.getAllTypeEvenementActiveByRestaurant()
      .subscribe((typeEvenements: TypeEvenementModel[]) => {
        this.typeEvenements = typeEvenements;
      }, err => {
        console.log(err);
      });
  }

  protected findTypePointageRef() {
    this.typePointageService.getActiveTypePointage()
      .subscribe((typePointages: TypePointageModel []) => {
        this.typePointages = typePointages;
      }, err => {
        console.log(err);
      });
  }

  public editRepas(employeeIndex: number): void {
    if (!this.isModificationBlocked) {
      this.isRepasOnEditionMode[employeeIndex % this.gdhViewData.size] = true;
    }
  }

  protected async getDataByPage(): Promise<void> {
    this.gdhPointageService.getEmployeePageViewDay(this.filter, this.paginationArgs).subscribe((vueJour: VueJourModel) => {
      this.isEmptyDataWhenSearchingByFirstLastFirstName(vueJour.totalElements);
      this.updateDataAndTable(vueJour);
    }, err => {
      console.log(err);
    });
  }

  private updateDataAndTable(vueJour: VueJourModel): void {
    this.gdhViewData = vueJour;
    this.totalRecords = vueJour.totalElements;
    this.sortAllPointagesForAllShifts();
    this.createInnerShiftsAbsencesForEmployees();
    this.isRepasOnEditionMode = new Array<boolean>(this.gdhViewData.pageSize);
    this.isRepasOnEditionMode.fill(false);
  }

  private createInnerShiftsAbsencesForEmployees(): void {
    if (this.gdhViewData.employees) {
      this.gdhViewData.employees.forEach((employee: GuiEmployeeGdh) => {
        this.processAchevalEntities(employee);
        this.createInnerShiftAbsencesPerEmployee(employee);
      });
    }
  }

  private processAchevalEntities(employee: GuiEmployeeGdh): void {
    this.checkAchevalAbsence(employee);
    employee.shifts.forEach((shift: GuiShiftGdh) => {
      this.checkAchevalShift(shift);
    });
  }

  protected abstract createInnerShiftAbsencesPerEmployee(employee: GuiEmployeeGdh): void;

  protected async saveRepasAndGetCorrectNumber(repas: RepasModel): Promise<number> {
    return null;
  }

  private sortAllPointagesForAllShifts(): void {
    if (this.gdhViewData.employees) {
      this.gdhViewData.employees.forEach((employee: GuiEmployeeGdh) => {
        if (employee.shifts) {
          employee.shifts.forEach((shift: GuiShiftGdh) => {
            shift.pointages.sort((p1: GuiPointageGdh, p2: GuiPointageGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(p1, p2) ? -1 : 1);
          });
        }
        if (employee.absences) {
          employee.absences.sort((a1: GuiAbsenceGdh, a2: GuiAbsenceGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(a1, a2) ? -1 : 1);
        }
      });
    }
  }

  /**
   * Get open and close hours for the selected date
   */
  protected async getOpenAndCloseHours(): Promise<void> {
    if ((!this.debutJourneesPhases) || (!this.finJourneesPhases)) {
      // fetch open/close hours for all week days
      this.debutJourneesPhases = await this.decoupageHoraireService.getDebutJourneePhase().toPromise();
      this.finJourneesPhases = await this.decoupageHoraireService.getFinJourneePhase().toPromise();
      const startEndWeekDays = {
        debutJournee: this.debutJourneesPhases,
        finJournee: this.finJourneesPhases
      };
      this.limitDecoupageFulldayService.decoupageHoraireFinEtDebutActivity = {...startEndWeekDays};
      this.decoupageHoraireFinEtDebutActivity = {...startEndWeekDays};
    }
    const filterDate: Date = new Date(this.filter.date.split('-').reverse().join('-'));
    // Get the day of the selected date
    const day: JourSemaine = this.dateService.getJourSemaine(filterDate);
    const key = day[0] + day.substring(1).toLowerCase();
    // Extract open/close hour based on the created key
    this.startTime = this.debutJourneesPhases['valeur' + key];
    this.startTimeIsNight = this.debutJourneesPhases['valeur' + key + 'IsNight'];
    this.endTime = this.finJourneesPhases['valeur' + key];
    this.endTimeIsNight = this.finJourneesPhases['valeur' + key + 'IsNight'];
  }

  /**
   * Check the nature of the operation (delete | add | update)
   * Delegate the action to the appropriate method
   * @param: origin ( original pointage | absence)
   * @param: updatedEntity (updated pointage | absence)
   * @param: employee
   * @param: indexOfEmployee (index of employee of in the list of employees
   * @param: overlayPanel
   */
  public async onSubmit(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh,
                        employee: GuiEmployeeGdh, indexOfEmployee: number, overlayPanel: OverlayPanel): Promise<void> {
    // In we are in a page different from the first one, index Of Employee in the table doesn't return to 0
    // it has the value: (((number of page) * (page size)) + (index in current page))
    indexOfEmployee %= this.gdhViewData.size;
    if (!updatedEntity.fromStatus) {
      await this.checkValidityAndCreatePointageAbsence(employee, indexOfEmployee, updatedEntity, origin, overlayPanel);
    } else {
      const {totalPointagesAbsences, indexInTotalElement} = this.getPointageAbsneceCoordination(employee, origin);
      // entity statuses are delete | present | absent
      // so if this entity keep it's status ( present --> present | absent --> absent)
      // it's an update for this case
      if (updatedEntity.fromStatus === updatedEntity.toStatus) {
        await this.updatePointageAbsence(origin, updatedEntity, totalPointagesAbsences, indexInTotalElement, employee, indexOfEmployee, overlayPanel);
      } else if (updatedEntity.toStatus === 'deleted') {
        await this.deletePointageAbsence(updatedEntity, origin, employee, totalPointagesAbsences, indexInTotalElement, indexOfEmployee);
      } else {
        // transform a ``pointage`` ot absence or the opposite --> delete the old one and create the newest
        await this.checkEntityValidityDeleteAndCreate(origin, updatedEntity, totalPointagesAbsences, indexInTotalElement, employee, indexOfEmployee, overlayPanel);
      }
    }
  }

  private postUpdateAfterPointageAbsenceAction(employee: GuiEmployeeGdh): void {
    this.getTotalGdh();
    this.createInnerShiftAbsencesPerEmployee(employee);
  }

  private async checkEntityValidityDeleteAndCreate(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh, totalPointagesAbsences: GuiGdh[],
                                                   indexInTotalElement: number, employee: GuiEmployeeGdh, indexOfEmployee: number, overlayPanel: OverlayPanel): Promise<void> {
    // check inclusion with start/close day hours and get the real values of  ``heures debut/fin isNight``
    const {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight} = await this.checkInclusionInStartEndDayHours(updatedEntity);
    const chevauchement = await this.verifier(updatedEntity, employee.idEmploye);
    if (isIncluded && !chevauchement) {
      // check intersection with other pointages/absences
      const noIntersectionWithSiblings = this.checkIntersectionWithSiblings(totalPointagesAbsences, indexInTotalElement, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      if (noIntersectionWithSiblings) {
        if (updatedEntity.toStatus === 'present') {
          await this.deleteAbsence(origin, employee, false);
          await this.createPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
        } else {
          await this.deletePointage(origin, employee, totalPointagesAbsences, indexInTotalElement, false);
          await this.createAbsence(origin, updatedEntity, employee, heureDebutEntityIsNight, heureFinEntityIsNight);
        }
        this.postUpdateAfterPointageAbsenceAction(employee);
        this.gdhViewData.employees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
        overlayPanel.hide();
      } else {
        this.limitDecoupageFulldayService.setChevevauchement(true);
      }
    } else {
      this.limitDecoupageFulldayService.setChevevauchement(true);
    }
  }

  private async checkValidityAndCreatePointageAbsence(employee: GuiEmployeeGdh, indexOfEmployee: number, updatedEntity: GuiPointageAbsenceActionGdh, origin: GuiPointageAbsenceGdh, overlayPanel: OverlayPanel): Promise<void> {
    const totalPointagesAbsences = this.collectEmployeePointagesAbsences(employee);
    // check inclusion with start/close day hours and get the real values of  ``heures debut/fin isNight``
    const {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight} = this.checkInclusionInStartEndDayHours(updatedEntity);
    const guiAbsencePointage: GuiPointageAbsence = {};

    const chevauchement = await this.verifier(updatedEntity, employee.idEmploye);

    if (isIncluded && !chevauchement) {
      // check intersection with other pointages/absences
      const noIntersectionWithSiblings = this.checkIntersectionWithSiblings(totalPointagesAbsences, 0,
        updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
      if (noIntersectionWithSiblings) {
        await this.createPointageAbsenceAndUpdateLocalState(updatedEntity, origin, employee, heureDebutEntityIsNight, heureFinEntityIsNight, indexOfEmployee, overlayPanel);
      } else {
        this.limitDecoupageFulldayService.setChevevauchement(true);
      }
    } else {
      this.limitDecoupageFulldayService.setChevevauchement(true);
    }
  }

  private async verifier(updatedEntity, idEmployee: number): Promise<boolean> {
    const debutJournee: DecoupageHoraireModel = this.decoupageHoraireFinEtDebutActivity.debutJournee;
    const finJournee: DecoupageHoraireModel = this.decoupageHoraireFinEtDebutActivity.finJournee;
    const todayDate = new Date(updatedEntity.date);
    const nextDate = new Date(new Date(updatedEntity.date).getTime() + (24 * 60 * 60 * 1000));
    const debutNextJourneeJ = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate))];
    const debutNextJourneeJIsNight = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate)) + 'IsNight'];
    const debutNextJourneeJAsDate = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(nextDate, debutNextJourneeJ), debutNextJourneeJIsNight);
    const debutPointageAbsence = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(new Date(updatedEntity.date), updatedEntity.heureDebut), updatedEntity.heureDebutIsNight);
    const finPointageAbsence = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(new Date(updatedEntity.date), updatedEntity.heureFin), updatedEntity.heurefinIsNight);
    if (this.dateService.isBefore(debutPointageAbsence, debutNextJourneeJAsDate) && !this.dateService.isBefore(finPointageAbsence, debutNextJourneeJAsDate)) {

      const guiAbsencePointage: GuiPointageAbsence = {};
      guiAbsencePointage.dateJournee = this.dateService.formatToShortDate(nextDate, '-').split('-').reverse().join('-');
      guiAbsencePointage.heureDebut = updatedEntity.heureDebut;
      guiAbsencePointage.heureDebutIsNight = updatedEntity.heureDebutIsNight;
      guiAbsencePointage.heureFin = updatedEntity.heureFin;
      guiAbsencePointage.heureFinIsNight = updatedEntity.heurefinIsNight;
      guiAbsencePointage.idEmployee = idEmployee;
      const chevauchement = await this.pointageService.controlChevauchement(guiAbsencePointage).toPromise();
      return chevauchement;
    }
    return false;
  }

  private async deletePointageAbsence(updatedEntity: GuiPointageAbsenceActionGdh, origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh,
                                      totalPointagesAbsences: Array<GuiPointageGdh | GuiAbsenceGdh>, indexInTotalElement: number, indexOfEmployee: number): Promise<void> {
    if (updatedEntity.fromStatus === 'present') {
      await this.deletePointage(origin, employee, totalPointagesAbsences, indexInTotalElement);
    } else {
      await this.deleteAbsence(origin, employee);
    }
    this.postUpdateAfterPointageAbsenceAction(employee);
    this.gdhViewData.employees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
  }

  private async deleteAbsence(origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, showMessage: boolean = true): Promise<void> {
    await this.absenceCongeService.removeFromGdh(origin.data.uuid).toPromise();
    employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
    let innerAbsenceIndex: number;
    for (const shift of employee.shifts) {
      const shiftIndex: number = employee.shifts.indexOf(shift);
      if (shift.absences) {
        innerAbsenceIndex = shift.absences.findIndex((absence: GuiAbsenceGdh) => {
          return (absence.id === origin.data.id);
        });

        if (innerAbsenceIndex !== -1) {
          this.calculateDelayedArrivalEarlyDeparture(employee.shifts[shiftIndex]);
          employee.shifts[shiftIndex].absences.splice(innerAbsenceIndex, 1);
          await this.calculateTempsAbsence(employee);
          if (showMessage) {
            this.notificationService.showSuccessMessage('GDH.DELETE_ABSENCE_SUCCESS');
          }
        }
      }
    }

    const index = employee.absences.findIndex((absence: GuiAbsenceGdh) => absence.id === origin.data.id);
    if (index !== -1) {
      employee.absences.splice(index, 1);
      await this.calculateTempsAbsence(employee);
      if (showMessage) {
        this.notificationService.showSuccessMessage('GDH.DELETE_ABSENCE_SUCCESS');
      }
    }
  }

  private async deletePointage(origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, totalPointagesAbsences: Array<GuiPointageGdh | GuiAbsenceGdh>,
                               indexInTotalElement: number, showMessage: boolean = true): Promise<void> {
    await this.pointageService.remove(origin.data.uuid).toPromise();
    const {searchedIndex, shiftIndex} = this.getTargetPointageAndAssociatedShiftIndexes(employee, totalPointagesAbsences, indexInTotalElement);
    if (searchedIndex !== -1 && shiftIndex !== -1) {
      employee.shifts[shiftIndex].pointages.splice(searchedIndex, 1);
      if (employee.shifts[shiftIndex].id === 0) {
        employee.shifts.splice(shiftIndex, 1);
      } else {
        this.calculateDelayedArrivalEarlyDeparture(employee.shifts[shiftIndex]);
      }
      await this.calCulateTempsPointe(employee);
      if (showMessage) {
        this.notificationService.showSuccessMessage('GDH.DELETE_POINTAGE_SUCCESS');
      }
      employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
      employee.coupures = await this.coupuresService.checkNbrCoupuresForEmployeeInDate(employee.uuid, this.filter.date).toPromise();
    }
  }

  /**
   * Collect all absences and ``pointages`` in one table
   * Get index of the item (``pointage``|absence) to be updated in that table
   * @param: employee
   * @param: origin element (pointage or absence to be updated)
   */
  private getPointageAbsneceCoordination(employee: GuiEmployeeGdh, origin: GuiPointageAbsenceGdh): { totalPointagesAbsences: Array<GuiPointageGdh | GuiAbsenceGdh>, indexInTotalElement: number } {
    const totalPointagesAbsences = this.collectEmployeePointagesAbsences(employee);
    const indexInTotalElement = totalPointagesAbsences.findIndex((element: any) => {
      if ((element.typePointage !== undefined) && (origin.data.typePointage !== undefined)) {
        return (element.id === origin.data.id) && ((element.typePointage === origin.data.typePointage) || (element.typePointage.id === origin.data.typePointage.id));
      }
      if ((element.typeEvenement !== undefined) && (origin.data.typeEvenement !== undefined)) {
        return (element.id === origin.data.id) && (
          (element.typeEvenement === origin.data.typeEvenement) ||
          (element.typeEvenement.idTypeEvenement === origin.data.typeEvenement.idTypeEvenement)
        );
      }
    });
    return {totalPointagesAbsences, indexInTotalElement};
  }

  /**
   * Put all empmloyee absences and ``pointages`` in a same list
   * @param: employee
   */
  private collectEmployeePointagesAbsences(employee: GuiEmployeeGdh): any[] {
    const totalPointagesAbsences = [];
    employee.shifts.map((shift: GuiShiftGdh) => shift.pointages).forEach((pointages: GuiPointageGdh[]) => totalPointagesAbsences.push(...pointages));
    employee.shifts.map((shift: GuiShiftGdh) => shift.absences).forEach((absences: GuiAbsenceGdh[]) => {
      if (absences) {
        totalPointagesAbsences.push(...absences.filter((abs: GuiAbsenceGdh) => abs.id));
      }
    });
    totalPointagesAbsences.push(...employee.absences);
    return totalPointagesAbsences;
  }

  /**
   * Check constraints (inclusion in open/close day hours and intersection with siblings (``pointages`` | absence)
   * Update item (pointage | absence) or show time error ithe other case
   * @param: origin
   * @param: updatedEntity
   * @param: totalPointagesAbsences
   * @param: indexInTotalElement
   * @param: employee
   * @param: indexOfEmployee
   * @param: overlayPanel
   */
  private async updatePointageAbsence(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh, totalPointagesAbsences: GuiGdh[],
                                      indexInTotalElement: number, employee: GuiEmployeeGdh, indexOfEmployee: number, overlayPanel: OverlayPanel): Promise<void> {
    // check inclusion with start/close day hours and get the real values of  ``heures debut/fin isNight``
    const {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight} = await this.checkInclusionInStartEndDayHours(updatedEntity);
    const chevauchement = await this.verifier(updatedEntity, employee.idEmploye);
    if (isIncluded && !chevauchement) {
      // check intersection with other pointages/absences
      const noIntersectionWithSiblings = this.checkIntersectionWithSiblings(totalPointagesAbsences, indexInTotalElement, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      if (noIntersectionWithSiblings) {
        await this.updatePointageAbsenceAndLocalState(updatedEntity, origin, employee, heureDebutEntityIsNight, heureFinEntityIsNight, totalPointagesAbsences, indexInTotalElement, indexOfEmployee, overlayPanel);
      } else {
        this.limitDecoupageFulldayService.setChevevauchement(true);
      }
    } else {
      this.limitDecoupageFulldayService.setChevevauchement(true);
    }
  }

  private async createPointageAbsenceAndUpdateLocalState(updatedEntity: GuiPointageAbsenceActionGdh, origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, heureDebutEntityIsNight, heureFinEntityIsNight,
                                                         indexOfEmployee: number, overlayPanel: OverlayPanel): Promise<void> {
    if (updatedEntity.toStatus === 'present') {
      // create`pointage`
      await this.createPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
    } else if (updatedEntity.toStatus === 'absent') {
      // create absence
      await this.createAbsence(origin, updatedEntity, employee, heureDebutEntityIsNight, heureFinEntityIsNight);
    }
    this.postUpdateAfterPointageAbsenceAction(employee);
    // update employee reference so template can be rendered again and modifications show up
    this.gdhViewData.employees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
    overlayPanel.hide();
  }

  private async createAbsence(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh, employee: GuiEmployeeGdh, heureDebutEntityIsNight, heureFinEntityIsNight): Promise<void> {
    const absenceCongeToBeCreated = this.createUpdatedAbsence(origin, updatedEntity, employee, heureDebutEntityIsNight, heureFinEntityIsNight, true);
    const createdAbsenceConge: AbsenceCongeModel = await this.absenceCongeService.addAbsenceCongeFromGdh(absenceCongeToBeCreated).toPromise();
    const newAbsenceConge: GuiAbsenceGdh = this.createGuiGdhFromExistedOneWithNightsValue({} as GuiGdh, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
    newAbsenceConge.typeEvenement = updatedEntity.type;
    await this.displayAndCalculateAbsence(newAbsenceConge, createdAbsenceConge, employee);
    employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
    this.notificationService.showSuccessMessage('GDH.CREATE_ABSENCE_SUCCESS');
  }

  private async createPointage(origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, updatedEntity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight, heureFinEntityIsNight): Promise<void> {
    const pointage = this.createUpdatedPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
    const createdPointage = await this.pointageService.add(pointage).toPromise();
    const newPointage = this.createPointageFromExistedPointageAndNightsValue(createdPointage['idPointage'], createdPointage['uuid'], updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
    await this.displayPointageAndCalculateTotalPointing(employee, newPointage);
    this.notificationService.showSuccessMessage('GDH.CREATE_POINTAGE_SUCCESS');
    employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
    employee.coupures = await this.coupuresService.checkNbrCoupuresForEmployeeInDate(employee.uuid, this.filter.date).toPromise();
  }

  private async displayAndCalculateAbsence(absenceConge: GuiAbsenceGdh, createdAbsenceConge: AbsenceCongeModel, employee: GuiEmployeeGdh): Promise<void> {
    absenceConge.idAbsConge = createdAbsenceConge.idAbsenceConge;
    absenceConge.id = createdAbsenceConge.detailEvenements[0].idDetailEvenement;
    absenceConge.uuid = createdAbsenceConge.detailEvenements[0].uuid;
    employee.absences.push(absenceConge);
    employee.absences.sort((a1: GuiAbsenceGdh, a2: GuiAbsenceGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(a1, a2) ? -1 : 1);
    await this.calculateTempsAbsence(employee);
  }

  public isModifiedPointage(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh): boolean {
    if ((origin.data.heureDebut).substr(0, 5) === (updatedEntity.heureDebut).substr(0, 5) &&
      (origin.data.heureFin).substr(0, 5) === (updatedEntity.heureFin).substr(0, 5) &&
      origin.data.typePointage.libelle === updatedEntity.type.libelle &&
      origin.data.typePointage.uuid === updatedEntity.type.uuid &&
      origin.data.heureDebutIsNight === updatedEntity.heureDebutIsNight &&
      origin.data.heureFinIsNight === updatedEntity.heurefinIsNight) {
      return false;
    } else {
      return true;
    }
  }

  private createUpdatedAbsence(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh, employee: GuiEmployeeGdh, heureDebutEntityIsNight, heureFinEntityIsNight, isNew: boolean = false): AbsenceCongeModel {
    const absenceConge = new AbsenceCongeModel();
    absenceConge.idAbsenceConge = !isNew ? origin.data.idAbsConge : 0;
    absenceConge.typeEvenement = updatedEntity.type;
    absenceConge.employee = {idEmployee: employee.idEmploye} as EmployeeModel;
    absenceConge.detailEvenements = [{
      idDetailEvenement: !isNew ? origin.data.id : 0,
      dateEvent: updatedEntity.date,
      heureDebut: updatedEntity.heureDebut,
      heureDebutValeurNuit: heureDebutEntityIsNight,
      heureFin: updatedEntity.heureFin,
      heureFinValeurNuit: heureFinEntityIsNight,
      nbHeure: this.getDurationInHour(origin, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight)
    }];
    if (isNew) {
      absenceConge.status = StatusDemandeCongeEnumeration.VALIDE;
      absenceConge.dateDebut = absenceConge.dateFin = new Date(updatedEntity.date);
      absenceConge.dureeJour = 1;
    }
    return absenceConge;
  }

  private async updatePointageAbsenceAndLocalState(updatedEntity: GuiPointageAbsenceActionGdh, origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, heureDebutEntityIsNight, heureFinEntityIsNight, totalPointagesAbsences: GuiGdh[], indexInTotalElement: number, indexOfEmployee: number, overlayPanel: OverlayPanel): Promise<void> {
    if (updatedEntity.fromStatus === 'present' && this.isModifiedPointage(origin, updatedEntity)) {
      // update a `pointage`
      const pointage = this.createUpdatedPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      await this.pointageService.update(pointage).toPromise();
      await this.updateLocalPointages(employee, totalPointagesAbsences, indexInTotalElement, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      employee.coupures = await this.coupuresService.checkNbrCoupuresForEmployeeInDate(employee.uuid, this.filter.date).toPromise();
      employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
      this.notificationService.showSuccessMessage('GDH.UPDATE_POINTAGE_SUCCESS');
    } else if (updatedEntity.fromStatus === 'absent') {
      // update an absence
      const absenceConge = this.createUpdatedAbsence(origin, updatedEntity, employee, heureDebutEntityIsNight, heureFinEntityIsNight);
      await this.absenceCongeService.updateAbsenceCongeFromGdh(absenceConge).toPromise();
      await this.updateLocalAbsences(employee, totalPointagesAbsences, indexInTotalElement, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      employee.repas = await this.repasService.checkRepasAutoCalculationForDate(employee.uuid, this.filter.date).toPromise();
      this.notificationService.showSuccessMessage('GDH.UPDATE_ABSENCE_SUCCESS');
    }
    this.postUpdateAfterPointageAbsenceAction(employee);
    // update employee reference so template can be rendered again and modifications show up
    this.gdhViewData.employees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
    overlayPanel.hide();
  }

  private createUpdatedPointage(origin: GuiPointageAbsenceGdh, employee: GuiEmployeeGdh, updatedEntity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight, heureFinEntityIsNight, isNew: boolean = false): PointageModel {
    const pointage = {} as PointageModel;
    pointage.idPointage = isNew ? 0 : origin.data.id;
    pointage.modified = isNew ? 3 : 1;
    pointage.idEmployee = employee.idEmploye;
    pointage.idRestaurant = this.gdhPointageService.getIdRestaurant();
    pointage.heureDebut = updatedEntity.heureDebut;
    pointage.heureDebutIsNight = heureDebutEntityIsNight;
    pointage.heureFin = updatedEntity.heureFin;
    pointage.heureFinIsNight = heureFinEntityIsNight;
    pointage.dateJournee = updatedEntity.date;
    pointage.typePointageRef = updatedEntity.type;
    pointage.tempsPointes = this.getDurationInHour(origin, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
    const shift = this.getNewAssociatedShift(employee, pointage);
    pointage.idShift = shift ? shift.id : 0;
    return pointage;
  }

  private getDurationInHour(origin: GuiPointageAbsenceGdh, updatedEntity: GuiPointageAbsenceActionGdh,
                            heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): number {
    const nbOfHours = this.dateService.getTotalMinutes({
      dateJournee: origin.data.dateJournee,
      heureDebut: updatedEntity.heureDebut,
      heureDebutIsNight: heureDebutEntityIsNight,
      heureFin: updatedEntity.heureFin,
      heureFinIsNight: heureFinEntityIsNight
    }) / 60;
    return +nbOfHours.toFixed(4);
  }


  /**
   * Cette methode permet de retourner le découpage horaire d'un restaurant
   */
  private requestDataFromMultipleSources(): Observable<{ debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }> {
    const response1 = this.decoupageHoraireService.getDebutJourneePhase();
    const response2 = this.decoupageHoraireService.getFinJourneePhase();
    return forkJoin({
      debutJournee: response1,
      finJournee: response2
    });
  }

  private checkInclusionInStartEndDayHours(updatedEntity: GuiPointageAbsenceActionGdh): { isIncluded: boolean, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean } {
    let isIncluded = false;
    let heureDebutEntityIsNight = false, heureFinEntityIsNight = false;
    if (!this.isContinuedDecoupageWithNextDay || (this.modeAffichage === 0)) {
      return this.getInclusionAndNightStateOfStartAndEndHour(updatedEntity);
    } else {
      const debutJournee: DecoupageHoraireModel = this.decoupageHoraireFinEtDebutActivity.debutJournee;
      const todayDate = new Date(updatedEntity.date);
      const nextDate = new Date(new Date(updatedEntity.date).getTime() + (24 * 60 * 60 * 1000));
      const debutNextJourneeJ = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate))];
      const debutNextJourneeJIsNight = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(nextDate)) + 'IsNight'];
      const debutNextJourneeJAsDate = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(nextDate, debutNextJourneeJ), debutNextJourneeJIsNight);
      const debutPointageAbsence = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(new Date(updatedEntity.date), updatedEntity.heureDebut), updatedEntity.heureDebutIsNight);
      const finPointageAbsence = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(new Date(updatedEntity.date), updatedEntity.heureFin), updatedEntity.heurefinIsNight);

      const debutJourneeJ = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(todayDate))];
      const debutJourneeJIsNight = debutJournee['valeur' + this.limitDecoupageFulldayService.convertStringToCamelCase(this.dateService.getJourSemaine(todayDate)) + 'IsNight'];
      const debutJourneeJAsDate = this.dateService.getDateFromIsNight(this.limitDecoupageFulldayService.getTimeWithouSecond(todayDate, debutJourneeJ), debutJourneeJIsNight);

      if (this.dateService.isSameOrBefore(debutNextJourneeJAsDate, debutPointageAbsence) ||
          this.dateService.isBefore(debutPointageAbsence, debutJourneeJAsDate) ||
          ( this.dateService.isBefore(finPointageAbsence, debutPointageAbsence))) {
        isIncluded = false;
      } else if (this.dateService.isBefore(debutPointageAbsence, debutNextJourneeJAsDate) && !this.dateService.isBefore(finPointageAbsence, debutNextJourneeJAsDate)) {
        isIncluded = true;
        heureDebutEntityIsNight = updatedEntity.heureDebutIsNight;
        heureFinEntityIsNight = updatedEntity.heurefinIsNight;
      } else {
        return this.getInclusionAndNightStateOfStartAndEndHour(updatedEntity);
      }
    }
    return {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight};
  }

  private getInclusionAndNightStateOfStartAndEndHour(updatedEntity: GuiPointageAbsenceActionGdh) {
    let isIncluded;
    let heureDebutEntityIsNight = false, heureFinEntityIsNight = false;
    if (updatedEntity.hoursInSameDay) {
      isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      if (!isIncluded) {
        heureDebutEntityIsNight = heureFinEntityIsNight = true;
        isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      }
    } else {
      heureDebutEntityIsNight = false;
      heureFinEntityIsNight = true;
      isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
    }
    return {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight};
  }

  private async updateLocalAbsences(employee: GuiEmployeeGdh, totalPointagesAbsences: GuiGdh[], indexInTotalElement: number, entity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): Promise<void> {
    this.updateModifiedAbsence(employee, totalPointagesAbsences, indexInTotalElement, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    employee.absences.sort((a1: GuiAbsenceGdh, a2: GuiAbsenceGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(a1, a2) ? -1 : 1);
    await this.calculateTempsAbsence(employee);
  }

  private updateModifiedAbsence(employee: GuiEmployeeGdh, totalPointagesAbsences: GuiGdh[], indexInTotalElement: number, entity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): void {
    const absenceIndex = employee.absences.findIndex((absence: GuiAbsenceGdh) => {
      return (absence.id === totalPointagesAbsences[indexInTotalElement].id);
    });
    let innerAbsenceIndex: number;
    employee.shifts.forEach((shift: GuiShiftGdh, index: number) => {
      if (shift.absences) {
        innerAbsenceIndex = shift.absences.findIndex((absence: GuiAbsenceGdh) => {
          return (absence.id === totalPointagesAbsences[indexInTotalElement].id);
        });
        if (innerAbsenceIndex !== -1) {
          const searchedAbsence = employee.shifts[index].absences[innerAbsenceIndex];
          searchedAbsence['typeEvenement'] = entity.type;
          this.createGuiGdhFromExistedOneWithNightsValue(searchedAbsence, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
        }
      }
    });

    if (absenceIndex !== -1) {
      const searchedAbsence = employee.absences[absenceIndex];
      searchedAbsence.typeEvenement = entity.type;
      this.createGuiGdhFromExistedOneWithNightsValue(searchedAbsence, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    }
  }

  private createGuiGdhFromExistedOneWithNightsValue(guiGdh: GuiGdh, entity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): GuiGdh {
    guiGdh.dateJournee = entity.date;
    guiGdh.heureDebut = entity.heureDebut;
    guiGdh.heureDebutIsNight = heureDebutEntityIsNight;
    guiGdh.heureFin = entity.heureFin;
    guiGdh.heureFinIsNight = heureFinEntityIsNight;

    const startGui = this.dateService.getDateFromIsNight(new Date(`${guiGdh.dateJournee} ${guiGdh.heureDebut}`), guiGdh.heureDebutIsNight);
    const endGui = this.dateService.getDateFromIsNight(new Date(`${guiGdh.dateJournee} ${guiGdh.heureFin}`), guiGdh.heureFinIsNight);
    const currentDay = this.filter.date.split('-').reverse().join('-');
    const endDecoupage = this.dateService.getDateFromIsNight(new Date(`${currentDay} ${this.endTime}`), this.endTimeIsNight);
    if (this.dateService.isBefore(startGui, endDecoupage) && this.dateService.isAfter(endGui, endDecoupage)) {
      guiGdh.acheval = true;
      guiGdh.heureDebutCheval = entity.heureDebut;
      guiGdh.heureDebutChevalIsNight = entity.heureDebutIsNight;
      guiGdh.heureFinCheval = entity.heureFin;
      guiGdh.heureFinChevalIsNight = entity.heurefinIsNight;
      guiGdh.heureFin = this.endTime;
      guiGdh.heureFinIsNight = this.endTimeIsNight;
    }
    guiGdh.modifiable = true;
    guiGdh.totalMinutes = this.dateService.getTotalMinutes(guiGdh);
    return guiGdh;
  }

  private async updateLocalPointages(employee: GuiEmployeeGdh, totalPointagesAbsences: GuiGdh[], indexInTotalElement: number, entity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): Promise<void> {
    const {searchedIndex, shiftIndex} = this.getTargetPointageAndAssociatedShiftIndexes(employee, totalPointagesAbsences, indexInTotalElement);
    const searchedPointage = employee.shifts[shiftIndex].pointages[searchedIndex];
    const newPointage = this.createPointageFromExistedPointageAndNightsValue(searchedPointage.id, searchedPointage.uuid, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    employee.shifts[shiftIndex].pointages.splice(searchedIndex, 1);
    if (!employee.shifts[shiftIndex].id) {
      // Delete the encapsulate shift, it's a isolated ``pointage`` (not associated with a shit)
      // this shift is just an encapsulation object
      employee.shifts.splice(shiftIndex, 1);
    } else {
      // Recalculate delay arrival and early departure for the existing shift
      // after retrieving the updated ``pointage``
      this.calculateDelayedArrivalEarlyDeparture(employee.shifts[shiftIndex]);
    }
    await this.displayPointageAndCalculateTotalPointing(employee, newPointage);
  }

  private async displayPointageAndCalculateTotalPointing(employee: GuiEmployeeGdh, pointage): Promise<void> {
    const newAssociatedShift = this.getNewAssociatedShift(employee, pointage);
    if (newAssociatedShift) {
      newAssociatedShift.pointages.push(pointage);
      newAssociatedShift.pointages.sort((p1: GuiPointageGdh, p2: GuiPointageGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(p1, p2) ? -1 : 1);
      this.calculateDelayedArrivalEarlyDeparture(newAssociatedShift);
    } else {
      this.createNewIsolatedPointage(pointage, employee);
    }
    await this.calCulateTempsPointe(employee);
  }

  private createPointageFromExistedPointageAndNightsValue(id: number, uuid: string, entity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean, isNew: boolean = false): GuiPointageGdh {
    const newPointage: GuiPointageGdh = {};
    newPointage.id = id;
    newPointage.uuid = uuid;
    newPointage.typePointage = entity.type;
    this.createGuiGdhFromExistedOneWithNightsValue(newPointage, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    newPointage.modified = isNew ? 3 : 1;
    return newPointage;
  }

  private getTargetPointageAndAssociatedShiftIndexes(employee: GuiEmployeeGdh, totalPointagesAbsences: GuiGdh[], indexInTotalElement: number): { searchedIndex: number, shiftIndex: number } {
    let searchedIndex = 0;
    const shiftIndex = employee.shifts.findIndex((shift: GuiShiftGdh) => {
      const searchedpointage = shift.pointages.find((pointage: GuiPointageGdh, i: number) => {
        if (pointage.id === totalPointagesAbsences[indexInTotalElement].id) {
          searchedIndex = i;
          return true;
        } else {
          return false;
        }
      });
      return searchedpointage !== undefined;
    });
    return {searchedIndex, shiftIndex};
  }

  /**
   * Calculate delay arrival and early departure for ``pointages`` of a shift
   * @param: shift
   */
  protected calculateDelayedArrivalEarlyDeparture(shift: GuiShiftGdh): void {
    shift.pointages.forEach((pointage: GuiPointageGdh, index: number) => {
      pointage.sortie = pointage.arrives = 0;
      if (index === 0) {
        pointage.arrives = this.dateService.getDiffInMinutesForStartHours(pointage, shift);
      }
      if (index === shift.pointages.length - 1) {
        pointage.sortie = this.dateService.getDiffInMinuteForEndHours(pointage, shift);
      }
    });
  }

  /**
   * Create a ``pointage`` (not associated with a shift)
   * This pointage is encapsulated in a fake shift structure
   * Added it to list of shifts of an employee
   * @param: ``pointage``
   * @param: employee
   */
  private createNewIsolatedPointage(pointage: GuiPointageGdh, employee: GuiEmployeeGdh): void {
    pointage.arrives = pointage.sortie = 0;
    const newShift = {} as GuiShiftGdh;
    newShift.id = 0;
    newShift.pointages = [pointage];
    employee.shifts.push(newShift);
  }

  private getNewAssociatedShift(employee: GuiEmployeeGdh, pointage: GuiPointageGdh): GuiShiftGdh {
    const migreatedShift = employee.shifts.filter((shift: GuiShiftGdh) => shift.id !== 0).sort((s1: GuiShiftGdh, s2: GuiShiftGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(s1, s2) ? -1 : 1).find((shift: GuiShiftGdh) => {
      const intersection = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(shift, pointage);
      return (intersection[0] !== null) && (intersection[1] !== null) && !this.dateService.isTheSameDates(...intersection);
    });
    return migreatedShift;
  }

  private async calCulateTempsPointe(employee: GuiEmployeeGdh): Promise <void> {
    const {
      guiDay24Coordination
    } = await this.getDayCoordination(this.filter.date.split('-').reverse().join('-'));
    employee.tempsPointes = employee.shifts
        .map((shift: GuiShiftGdh) => shift.pointages)
        .map((pointages: GuiPointageGdh[]) => pointages
            .map((pointage: GuiPointageGdh) => {
              return this.getGuiGdhCountedMinutes(pointage, guiDay24Coordination);
            })
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0))
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  }

  private async calculateTempsAbsence(employee: GuiEmployeeGdh): Promise <void> {
    const {
      guiDay24Coordination
    } = await this.getDayCoordination(this.filter.date.split('-').reverse().join('-'));
    employee.tempsAbsences = employee.absences
        .map((absence: GuiAbsenceGdh) => {
          return this.getGuiGdhCountedMinutes(absence, guiDay24Coordination);
        })
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  private getGuiGdhCountedMinutes(guiGdh: GuiGdh, guiDay24Coordination: GuiDay24Coordination): number {
    if (guiGdh.acheval) {
      if (guiGdh.modifiable && (!guiDay24Coordination.is24WithNextDay || (this.modeAffichage !== 2))) {
        return this.getTotalMinutesForAchevalItem(guiGdh);
      } else if (!guiGdh.modifiable && !guiDay24Coordination.is24WithPreviousDay || (this.modeAffichage !== 2)) {
        return 0;
      }
    }
    return guiGdh.totalMinutes;
  }

  private getTotalMinutesForAchevalItem(guiGdh: GuiPointageGdh): number {
    const item: GuiGdh = {
      ...guiGdh,
      heureDebut: guiGdh.heureDebutCheval,
      heureDebutIsNight: guiGdh.heureDebutChevalIsNight,
      heureFin: guiGdh.heureFinCheval,
      heureFinIsNight: guiGdh.heureFinChevalIsNight
    };
    return this.dateService.getTotalMinutes(item);
  }

  /**
   * Check if star/end hours of ``pointage`` | absence is included in open/close day hours
   * @param: updatedEntity
   * @param: heureDebutEntityIsNight
   * @param: heureFinEntityIsNight
   */
  private checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity: GuiPointageAbsenceActionGdh, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): boolean {
    return this.dateService.isIncluded(
      {
        dateJournee: updatedEntity.date,
        heureDebut: updatedEntity.heureDebut,
        heureFin: updatedEntity.heureFin,
        heureDebutIsNight: heureDebutEntityIsNight,
        heureFinIsNight: heureFinEntityIsNight
      },
      {
        dateJournee: updatedEntity.date,
        heureDebut: this.startTime,
        heureDebutIsNight: this.startTimeIsNight,
        heureFin: this.endTime,
        heureFinIsNight: this.endTimeIsNight
      }
    );
  }

  /**
   * Check if ``pointage`` | absence time interval intersects with other ``pointages`` | absences
   * @param: totalPointagesAbsences
   * @param: indexInTotalElement
   * @param: updatedEntity
   * @param: heureDebutEntityIsNight
   * @param: heureFinEntityIsNight
   */
  private checkIntersectionWithSiblings(totalPointagesAbsences: DateInterval[], indexInTotalElement: number, updatedEntity: GuiPointageAbsenceActionGdh,
                                        heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean, isNew: boolean = false): boolean {
    const isIntersectWithOtherElements = totalPointagesAbsences.some((pa: DateInterval, index: number) => {
      const intersectionInterval = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(
        {
          dateJournee: updatedEntity.date,
          heureDebut: updatedEntity.heureDebut,
          heureFin: updatedEntity.heureFin,
          heureDebutIsNight: heureDebutEntityIsNight,
          heureFinIsNight: heureFinEntityIsNight
        },
        pa
      );
      const intersectionResult = (intersectionInterval[0] !== null) && (intersectionInterval[1] !== null) && !this.dateService.isTheSameDates(...intersectionInterval);
      return isNew ? intersectionResult : intersectionResult && (index !== indexInTotalElement);
    });
    return !isIntersectWithOtherElements;
  }

  /**
   * Run when double clicking a pointage | absence
   * Display a overlayPanel to edit the item
   * @param: overlayPanel
   * @param: pointageAbsence
   */
  public openPopOver(event, overlayPanel: OverlayPanel, pointageAbsence: GuiPointageAbsenceGdh): void {
    if (this.updateControl() && pointageAbsence.data.modifiable && !this.isModificationBlocked) {
      pointageAbsence.shown = true;
      overlayPanel.show(event);
    }
  }

  /**
   * When overlayPanel is hidden, update ``pointage`` | absence shown and error properties
   * @param: pointageAbsence
   */
  public onHidden(pointageAbsence: GuiPointageAbsenceGdh): void {
    pointageAbsence.shown = false;
    pointageAbsence.error = false;
  }

  private sortEmployeeByName(): void {
    if (this.gdhViewData.employees) {
      this.gdhViewData.employees.sort((a: GuiEmployeeGdh, b: GuiEmployeeGdh) => {
        if (a.nom > b.nom) {
          return 1;
        } else if (a.nom < b.nom) {
          return -1;
        } else {
          if (a.prenom > b.prenom) {
            return 1;
          } else if (a.prenom < b.prenom) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    }
  }

  public printEvent(event: any, employe: GuiEmployeeGdh): void {
    this.bonInfo = {
      employe: employe.nom + ' ' + employe.prenom,
      matricule: employe.matricule,
      heureDebut: event.data ? event.data.heureDebut : event.heureDebut,
      heureFin: event.data ? event.data.heureFin : event.heureFin,
      dateJournee: event.data ? event.data.dateJournee : event.dateJournee,
      absenceType: event.data ? event.data.typeEvenement.libelle : event.libelle
    };
    this.setReportGenerationConfig(true, GenerationReport.Progress);
    setTimeout(() => {
      this.setReportGenerationConfig(true, GenerationReport.Success);
      this.showVoucherPdf = true;
      this.setReportGenerationConfig(false);
    }, 1500);

  }


  /**
   * Configuration of the popup of report generation template
   * @param: loader
   * @param :label
   */
  private setReportGenerationConfig(loader: boolean, label?: string): void {
    this.isReportGenerationLoader = loader;
    this.reportGenerationLabel = this.rhisTranslateService.translate(`REPORT.${label}`);
  }

  public getBackgroundColor(code: number): boolean {
    switch (code) {
      case 0:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Success}`);
      case 1:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Progress}`);
      case 2:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Error}`);
    }
  }

  protected checkAchevalAbsence(employee: GuiEmployeeGdh): void {
    if (employee.absences && employee.absences.length) {
      employee.absences.forEach(absence => {
        if (absence.id && absence.acheval) {
          this.updateGuiGdhAchevalCoordinations(absence);
          absence.totalMinutes = this.dateService.getTotalMinutes(absence);
        }
      });
    }
  }

  protected updateGuiGdhAchevalCoordinations(guiGdh: GuiGdh): void {
    if (guiGdh.modifiable) {
      guiGdh.heureFinCheval = guiGdh.heureFin;
      guiGdh.heureFin = this.endTime;
      guiGdh.heureFinIsNight = this.endTimeIsNight;
    } else {
      guiGdh.dateJournee = this.filter.date.split('-').reverse().join('-');
      guiGdh.heureDebutCheval = guiGdh.heureDebut;
      guiGdh.heureDebut = this.startTime;
      guiGdh.heureDebutIsNight = this.startTimeIsNight;
      guiGdh.heureFinIsNight = guiGdh.heureFin < this.startTime;
    }
  }

  protected checkAchevalShift(shift: GuiShiftGdh): void {
    shift.pointages.forEach(pointage => {
      if (pointage.acheval) {
        this.updateGuiGdhAchevalCoordinations(pointage);
        pointage.totalMinutes = this.dateService.getTotalMinutes(pointage);
      }
    });
    if (shift.id && shift.acheval) {
      this.updateGuiGdhAchevalCoordinations(shift);
      shift.totalMinutes = this.dateService.getTotalMinutes(shift);
      this.calculateDelayedArrivalEarlyDeparture(shift);
    }
  }

  protected getTotalGdh(): void {
  }

  protected getTotalRepas(): void {
  }
}
