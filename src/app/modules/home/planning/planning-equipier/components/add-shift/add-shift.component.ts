import {VerificationContrainteModel} from 'src/app/shared/model/verificationContrainte.model';
import {ContrainteSocialeService} from 'src/app/shared/service/contrainte-sociale.service';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {PositionDeTravail} from 'src/app/shared/model/chart.model';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {PositionTravailService} from '../../../../configuration/service/position-travail.service';
import {PositionTravailModel} from 'src/app/shared/model/position.travail.model';
import * as moment from 'moment';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DateService} from 'src/app/shared/service/date.service';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {LimitDecoupageFulldayService} from '../../../../../../shared/service/limit.decoupage.fullday.service';

@Component({
  selector: 'rhis-add-shift',
  templateUrl: './add-shift.component.html',
  styleUrls: ['./add-shift.component.scss']
})
export class AddShiftComponent implements OnInit, OnChanges {
  public emptyEmployeePosition: number;
  public errorMinShiftDelayMessage = '';
  public heureDebutLimitError = false;
  public heureFinLimitError = false;
  public heureFinLimitErrorMessage = '';
  public heureDebutLimitErrorMessage = '';
  public idShiftUpdate;
  public employeesList: any;
  public shiftform: FormGroup;
  public employeeDisplay: any;
  public loadEditOrAdd = true;
  @Input() debutJourneeActivite: any;
  @Input() finJourneeActivite: any;
  @Input() selectedDate: any;
  @Input() selectedShift: {
    employee: EmployeeModel,
    positionTravail: PositionTravailModel,
    hdd: Date,
    hdf: Date,
    hddIsNight: boolean,
    hdfIsNight: boolean,
    dateJournee: Date,
    idShift: 0,
    employeePosition: number,
    assignedShift: boolean,
    hasAssociatedShifts: number,
    dragEnabled: boolean,
    resizeEnabled: boolean,
    oldShiftData: ShiftModel,
    acheval: boolean
  };
  @Output() addShiftEmitter = new EventEmitter<{
    employee: EmployeeModel,
    positionDeTravail: PositionDeTravail,
    heureDeDebut: { hour: string, isNightTime: boolean },
    heureDeFin: { hour: string, isNightTime: boolean },
    idShift: any,
    employeePosition?: number,
    assignedShift?: boolean,
    hasAssociatedShifts?: number,
    dragEnabled?: boolean,
    resizeEnabled?: boolean,
    oldShiftData?: ShiftModel,
    acheval?: boolean,
    modifiable?: boolean
  }>();
  @Output() public checkIfNightValueEvent = new EventEmitter();
  public positionsDeTravail: PositionTravailModel[] = [];
  public heurDeb;
  public heurFin;
  public buttonTitle = '';
  public isSubmitted = false;
  public checkHeureIsNight = '';
  public isNightValue: boolean;
  public errorHourMessage = '';
  public isNighthdd = false;
  public isNighthdf = false;
  public selectedEmployeeName = '';
  private modeAffichageValue: any;
  private decoupageHoraireFinEtDebutActivity: any;
  private limitDecoupageHours: any;

  /**
   * constructeur de la classe
   * @param planningSemaineService service PlanningEquipieService
   */
  constructor(private rhisTranslateService: RhisTranslateService,
              private translator: RhisTranslateService,
              private positionTravailService: PositionTravailService,
              private contrainteSocialeService: ContrainteSocialeService,
              private dateService: DateService,
              private limitDecoupageService: LimitDecoupageFulldayService,
              private domControlService: DomControlService) {
  }

  @Input() set modeAffichage(value: any) {
    this.modeAffichageValue = value;
    if (this.decoupageHoraireFinEtDebutActivity) {
      this.limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichageValue, this.selectedDate, this.dateService);
      this.modeAffichageValue = this.limitDecoupageHours.updatedModeAffichage;
    }
  }

  @Input() set setDecoupageValues(value: any) {
    if (value) {
      this.decoupageHoraireFinEtDebutActivity = value;
      this.limitDecoupageHours = this.limitDecoupageService.setLimitDecoupageValues(this.decoupageHoraireFinEtDebutActivity, this.modeAffichageValue, this.selectedDate, this.dateService);
      this.modeAffichageValue = this.limitDecoupageHours.updatedModeAffichage;
    }
  }

  public _employees: any;
  /**
   * Récupérer la liste des employés à partir du parent
   */
  get employees(): any {
    this.actifLoad = true;
    if (this._employees) {
      this.actifLoad = false;

    }
    return this._employees;
  }

  public actifLoad = true;

  @Input()
  set employees(val: any) {
    this.actifLoad = true;
    this.loadEditOrAdd = true;
    this.idShiftUpdate = 0;
    if (val) {

      if (val['idshiftUpdated']) {
        this.employeeDisplay = this.selectedShift.employee;
        this.idShiftUpdate = val['idshiftUpdated'];
        this.employeesList = val['listEmployees'];
        this._employees = val['newEmployees'];
        this.loadEditOrAdd = val['loadEditOrAdd'];
        this.actifLoad = false;

      } else if (val['newEmployees']) {
        val['newEmployees'].forEach((item: any) => {
          item.fullName = item.nom + ' ' + item.prenom;
        });
        this._employees = val['newEmployees'];
        this.actifLoad = false;
        this.loadEditOrAdd = val['loadEditOrAdd'];
      }
    } else {
      this.actifLoad = true;
      this.loadEditOrAdd = true;
    }
  }

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null) {
      this.isNightValue = nightValue;
      if (this.isNightValue) {
        if ((this.checkHeureIsNight === 'debut')) {
          if (!((this.selectedDate.getDate() + 1) === this.shiftform.value['hdd'].getDate())) {
            this.shiftform.value['hdd'].setDate(this.selectedDate.getDate() + 1);
          }
          this.isNighthdd = true;
        } else if ((this.checkHeureIsNight === 'fin')) {
          if (!((this.selectedDate.getDate() + 1) === this.shiftform.value['hdf'].getDate())) {
            this.shiftform.value['hdf'].setDate(this.selectedDate.getDate() + 1);
          }
          this.isNighthdf = true;
        }
      } else {
        if ((this.checkHeureIsNight === 'debut')) {
          this.shiftform.value['hdd'].setDate(this.selectedDate.getDate());
          this.isNighthdd = false;
        } else if ((this.checkHeureIsNight === 'fin')) {
          this.shiftform.value['hdf'].setDate(this.selectedDate.getDate());
          this.isNighthdf = false;
        }
      }

    }
  }

  private ecran = 'GDS';

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit(): void {
    this.positionTravailService.getAllActivePositionTravailByRestaurant().subscribe((res: PositionTravailModel[]) => {
        this.positionsDeTravail = res;
      },
      error => {
        console.log('error ', error);
      });
    this.shiftform = new FormGroup(
      {
        employee: new FormControl(''),
        positionTravail: new FormControl('', Validators.required),
        hdd: new FormControl('', Validators.required),
        hdf: new FormControl('', Validators.required),
        employeeDisplay: new FormControl('')
      }
    );
  }

  /**
   *  fonction qui s'exécute à chaque changement des inputs du composant
   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    // Ré-initialisation des champs d'ajout et des messages d'erreur
    if (!changes.hasOwnProperty('nightValue')) {
      // this.shiftform.reset();
      this.isSubmitted = false;
      this.errorHourMessage = '';
      this.errorMinShiftDelayMessage = '';
      this.isNighthdd = false;
      this.isNighthdf = false;
      this.heureDebutLimitError = false;
      this.heureFinLimitError = false;
      this.heureFinLimitErrorMessage = '';
      this.heureDebutLimitErrorMessage = '';
    }
    if (!changes.nightValue && this.buttonTitle === this.translator.translate('PLANNING_EQUIPIER.UPDATE_BUTTON')) {
      if (this.selectedShift.employee && this.selectedShift.employee.idEmployee) {

        this.selectedEmployeeName = this.selectedShift.employee.prenom + ' ' + this.selectedShift.employee.nom;
        if (this.employeesList && this.employeesList.length === 0 && !this.loadEditOrAdd) {
          this.selectedEmployeeName = this.rhisTranslateService.translate('PROPOSE.EMPLOYEE_NOT_FOUND');
        }
        if (this.employees) {
          this.employees.push(this.employeeDisplay);
        }

        this.shiftform.controls['employee'].setValue(this.selectedShift.employee);
        this.shiftform.value['employee'] = this.selectedShift.employee;
      } else {
        this.emptyEmployeePosition = this.selectedShift.employeePosition;
        this.employeeDisplay = new EmployeeModel();
        this.shiftform.controls['employee'].setValue(this.employeeDisplay);
        this.shiftform.value['employee'] = this.employeeDisplay;
        this.shiftform.controls['employeeDisplay'].setValue(this.employeeDisplay);
        // pour que l' employee recoit null il faut mettre espace entre deux cotes
        this.selectedEmployeeName = ' ';
        if (this.employeesList && this.employeesList.length === 0 && !this.loadEditOrAdd) {
          this.selectedEmployeeName = this.rhisTranslateService.translate('PROPOSE.EMPLOYEE_NOT_FOUND');
        }

      }
      this.shiftform.controls['positionTravail'].setValue(this.selectedShift.positionTravail);
      this.selectedShift.hdd = this.dateService.getDateFromIsNight(new Date(this.selectedShift.hdd.setDate(this.selectedDate.getDate())), this.selectedShift.hddIsNight);
      this.shiftform.controls['hdd'].setValue(this.selectedShift.hdd);
      this.selectedShift.hdf = this.dateService.getDateFromIsNight(new Date(this.selectedShift.hdf.setDate(this.selectedDate.getDate())), this.selectedShift.hdfIsNight);
      this.shiftform.controls['hdf'].setValue(this.selectedShift.hdf);
      this.isNighthdd = this.selectedShift.hddIsNight;
      this.isNighthdf = this.selectedShift.hdfIsNight;

      if (this.selectedShift.acheval) {
        this.selectedShift.hdd = this.dateService.getDateFromIsNight(new Date(this.selectedShift.oldShiftData.heureDebutCheval.setDate(this.selectedDate.getDate())), this.selectedShift.oldShiftData.heureDebutChevalIsNight);
        this.shiftform.controls['hdd'].setValue(this.selectedShift.hdd);
        this.selectedShift.hdf = this.dateService.getDateFromIsNight(new Date(this.selectedShift.oldShiftData.heureFinCheval.setDate(this.selectedDate.getDate())), this.selectedShift.oldShiftData.heureFinChevalIsNight);
        this.shiftform.controls['hdf'].setValue(this.selectedShift.hdf);
      }
    }
    if (changes.hasOwnProperty('debutJourneeActivite') && changes.debutJourneeActivite.currentValue) {
      const nightValue = this.debutJourneeActivite.night;
      this.debutJourneeActivite = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.debutJourneeActivite.value), nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.debutJourneeActivite);
    }
    if (changes.hasOwnProperty('finJourneeActivite') && changes.finJourneeActivite.currentValue) {
      const nightValue = this.finJourneeActivite.night;
      this.finJourneeActivite = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.finJourneeActivite.value), nightValue);
      this.dateService.resetSecondsAndMilliseconds(this.finJourneeActivite);
    }

  }


  /**
   * hide list of list when list have an empty span
   */
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
    }, 100);
  }

  /**
   * Envoyer les valeurs sélectionnées au composant parent pour la création du nouveau shift
   */
  public addShift(): void {
    this.isSubmitted = true;
    if (this.shiftform.value['hdf']) {
      this.shiftform.value['hdf'] = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.shiftform.value['hdf']), this.isNighthdf);
    }
    if (this.shiftform.value['hdd']) {
      this.shiftform.value['hdd'] = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.shiftform.value['hdd']), this.isNighthdd);
    }
    this.dateService.resetSecondsAndMilliseconds(this.shiftform.value['hdd']);
    this.dateService.resetSecondsAndMilliseconds(this.shiftform.value['hdf']);
    // Verifier heure fin supérieur à heure début
    let minShiftVerif: boolean;
    const result =  this.contrainteSocialeService.verifDureeMinShift(this.shiftform.value['hdf'], this.shiftform.value['hdd']);
    result ? minShiftVerif = false : minShiftVerif = true;
        if (this.shiftform.value['hdd'] >= this.shiftform.value['hdf']) {
          this.errorHourMessage = this.rhisTranslateService.translate('BIMPOSE.HEURE_DEBUT_SUP_HEURE_FIN');
        } else if (!minShiftVerif && !this.shiftform.value['employee']) {
          this.errorMinShiftDelayMessage = this.rhisTranslateService.translate('PLANNING_EQUIPIER.MIN_SHIFT_DELAY_ERROR_MSG');
        } else if (moment(this.shiftform.value['hdd']).isBefore(this.modeAffichageValue === 0 ? this.debutJourneeActivite : this.limitDecoupageHours.debutJourneeLimit)) {
          this.heureDebutLimitError = true;
          this.heureDebutLimitErrorMessage = 'PLANNING_EQUIPIER.START_ERROR_LIMIT';
        } else if (moment(this.shiftform.value['hdd']).isAfter(this.limitDecoupageHours.heureDebutLimit)) {
          this.heureDebutLimitError = true;
          this.heureDebutLimitErrorMessage = 'PLANNING_EQUIPIER.START_ERROR_LIMIT_WITH_END';
        } else if (moment(this.shiftform.value['hdf']).isAfter(this.modeAffichageValue === 0 ? this.finJourneeActivite : this.limitDecoupageHours.finJourneeLimit)) {
          this.heureFinLimitError = true;
          this.heureFinLimitErrorMessage = 'PLANNING_EQUIPIER.END_ERROR_LIMIT';
        } else if (this.shiftform.valid) {
          this.heurFin = {hour: this.shiftform.value['hdf'], isNightTime: this.isNighthdf};
          this.heurDeb = {hour: this.shiftform.value['hdd'], isNightTime: this.isNighthdd};
          if (this.selectedShift) {
            if (this.idShiftUpdate) {
              const selectedEmployeeIndex = this.employees.findIndex(employe => employe.idEmployee === this.shiftform.value['employeeDisplay']);
              if (selectedEmployeeIndex !== -1) {
                this.shiftform.controls['employee'].setValue(this.employees[selectedEmployeeIndex]);
                this.shiftform.value['employee'] = this.employees[selectedEmployeeIndex];
              }

            }
            if (this.shiftform.value['employee'] && !this.shiftform.value['employee'].idEmployee) {
              this.shiftform.value['employee'] = null;
            }
            this.addShiftEmitter.emit({
              employee: this.shiftform.value['employee'],
              positionDeTravail: this.shiftform.value['positionTravail'],
              heureDeDebut: this.heurDeb,
              heureDeFin: this.heurFin,
              idShift: this.selectedShift.idShift,
              employeePosition: this.selectedShift.employeePosition,
              assignedShift: this.selectedShift.assignedShift,
              hasAssociatedShifts: this.selectedShift.hasAssociatedShifts,
              dragEnabled: this.selectedShift.dragEnabled,
              resizeEnabled: this.selectedShift.resizeEnabled,
              oldShiftData: this.selectedShift.oldShiftData,
              acheval: this.checkIfShiftACheval(),
              modifiable: true
            });
          } else {
            this.addShiftEmitter.emit({
              employee: this.shiftform.value['employee'],
              positionDeTravail: this.shiftform.value['positionTravail'],
              heureDeDebut: this.heurDeb,
              heureDeFin: this.heurFin,
              idShift: 0,
              acheval: this.checkIfShiftACheval(),
              modifiable: true
            });
          }
          this.isSubmitted = false;
          this.errorHourMessage = '';
          this.errorMinShiftDelayMessage = '';
          this.heureDebutLimitError = false;
          this.heureFinLimitError = false;
          this.heureFinLimitErrorMessage = '';
          this.heureDebutLimitErrorMessage = '';
        }
  }

  /**
   * Vérification d'une heure de nuit
   */
  public validerHeureNuit(heureDebut: boolean): void {
    let heureToVerify: Date;
    if (this.shiftform.value['hdf']) {
      this.shiftform.value['hdf'] = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.shiftform.value['hdf']), this.isNighthdf);
    }
    if (this.shiftform.value['hdd']) {
      this.shiftform.value['hdd'] = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(JSON.parse(JSON.stringify(this.selectedDate)), this.shiftform.value['hdd']), this.isNighthdd);
    }
    if (heureDebut) {
      if (this.shiftform.value['hdd']) {
        this.checkHeureIsNight = 'debut';
        heureToVerify = this.shiftform.value['hdd'];
      }
    } else {
      if (this.shiftform.value['hdf']) {
        this.checkHeureIsNight = 'fin';
        heureToVerify = this.shiftform.value['hdf'];
      }
    }
    if (heureToVerify) {
      if (this.modeAffichageValue === 0) {
        this.dateService.resetSecondsAndMilliseconds(heureToVerify);
        if (heureToVerify.getHours() >= 0 && (heureToVerify.getHours() <= this.finJourneeActivite.getHours() && ((heureToVerify.getHours() < this.debutJourneeActivite.getHours()) || this.finJourneeActivite.getHours() === this.debutJourneeActivite.getHours()))) {
          this.checkIfNightValueEvent.emit();
        } else {
          if (heureDebut) {
            if (this.isNighthdd) {
              this.shiftform.value['hdd'].setDate(this.shiftform.value['hdd'].getDate() - 1);
            }
            this.isNighthdd = false;
          } else {
            if (this.isNighthdf) {
              this.shiftform.value['hdf'].setDate(this.shiftform.value['hdf'].getDate() - 1);
            }
            this.isNighthdf = false;
          }
        }
      } else {
        this.checkIfNightValueEvent.emit();
      }
    }
  }

  /**
   * recuperer l'heure en formatm hh:mm
   * @param: time, date
   */
  public getTimeWithouSecond(date: Date, time): Date {
    date = new Date(date);
    if (time && !(time instanceof Date)) {
      const hours = +(time.substring(0, 2));
      const minutes = +(time.substring(3, 5));
      time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
    }
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  private checkIfShiftACheval(): boolean {
    return (moment(this.shiftform.value['hdf']).isAfter(this.finJourneeActivite));
  }

}
