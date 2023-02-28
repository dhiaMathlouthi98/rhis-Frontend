import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {TypeEvenementModel} from '../../../../../shared/model/type.evenement.model';
import {TypePointageModel} from '../../../../../shared/model/type-pointage.model';
import {DateService} from '../../../../../shared/service/date.service';
import {GuiPointageAbsenceActionGdh, GuiPointageAbsenceGdh, PointageAbsenceStatus} from '../../../../../shared/model/gui/vue-jour.model';
import {TypePointageUtilitiesService} from '../../../configuration/service/type-pointage-utilities.service';
import {TypeEvenementUtilitiesService} from '../../../configuration/service/type-evenement-utilities.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {ConfirmationService} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {LimitDecoupageFulldayService} from '../../../../../shared/service/limit.decoupage.fullday.service';

@Component({
  selector: 'rhis-add-pointage-absence-form',
  templateUrl: './add-pointage-absence-form.component.html',
  styleUrls: ['./add-pointage-absence-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPointageAbsenceFormComponent implements OnInit, OnChanges {
  @Input()
  public pointageAbsence: GuiPointageAbsenceGdh;
  @Input()
  public isCreation: boolean;
  @Input()
  public isPreSelectedCreation: boolean;
  @Input()
  public typeEvenements: TypeEvenementModel[] = [];
  @Input()
  public typePointages: TypePointageModel[] = [];
  @Input()
  public absenceLimit: any;
  @Input()
  public modeAffichage: any;
  @Input()
  public isContinuedDecoupageWithNextDay: boolean;
  @Output()
  public hidePopUp = new EventEmitter();
  @Output()
  public onSubmit = new EventEmitter<GuiPointageAbsenceActionGdh>();
  @Output()
  public printEvent = new EventEmitter<any>();
  private localTypePointages: TypePointageModel[];
  private localTypeEvenements: TypeEvenementModel[];
  public selectedStatus: { code: PointageAbsenceStatus, value: string };
  // A filter to define the nature of the item (``pointage`` | absence | item_to_be_deleted)
  // It takes one of 3 values like a value : (``present`` | ``absent`` | ``deleted``)
  public statuses: { value: string, code: PointageAbsenceStatus }[];
  public types: TypePointageModel[] | TypeEvenementModel[] | [];
  public selectedType: any;
  public startHour: Date;
  public endHour: Date;
  public startHourIsNight = null;
  public endHourIsNight = null;
  public startHourInModification = false;
  public endHourInModification = false;
  public isSubmitted = false;
  public linkText: string;
  public ecran = 'GDH';
  @Input() public blockGdhParamDefault: any;

  constructor(private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private typePointageUtilitiesService: TypePointageUtilitiesService,
              private typeEvenementUtilitiesService: TypeEvenementUtilitiesService,
              private domControlService: DomControlService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private translator: RhisTranslateService,
              private limitDecoupageFulldayService: LimitDecoupageFulldayService,
              private ref: ChangeDetectorRef
  ) {
    this.createStatusFilter();
  }

  private deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.isCreation && changes.isCreation.currentValue) {
      this.isCreation = changes.isCreation.currentValue;
    }
    if (changes.isPreSelectedCreation && changes.isPreSelectedCreation.currentValue) {
      this.isPreSelectedCreation = changes.isPreSelectedCreation.currentValue;
    }
    if (changes.typeEvenements && changes.typeEvenements.currentValue) {
      this.typeEvenements = changes.typeEvenements.currentValue;
      this.localTypeEvenements = [...this.typeEvenements];
    }
    if (changes.typePointages && changes.typePointages.currentValue) {
      this.typePointages = changes.typePointages.currentValue;
      this.localTypePointages = [...this.typePointages];
    }
    if (changes.absenceLimit && changes.absenceLimit.currentValue) {
      this.absenceLimit = changes.absenceLimit.currentValue;
    }
    if (changes.pointageAbsence && changes.pointageAbsence.currentValue) {
      this.pointageAbsence = changes.pointageAbsence.currentValue;
    }
    if (this.pointageAbsence && this.localTypePointages && this.localTypeEvenements && !this.startHour && (!this.isCreation || this.isPreSelectedCreation)) {
      if (this.isPreSelectedCreation) {
        this.statuses = [
          {value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.ABSENT'), code: 'absent'},
          {value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.PRESENT'), code: 'present'},
        ];
      }
      if (this.absenceLimit) {
        if (this.absenceLimit.heureDebut instanceof Date && this.absenceLimit.heureFin instanceof Date) {
          this.startHour = new Date(JSON.parse(JSON.stringify(this.absenceLimit.heureDebut)));
          this.endHour = new Date(JSON.parse(JSON.stringify(this.absenceLimit.heureFin)));
        } else {
          this.startHour = this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.absenceLimit.heureDebut)));
          this.endHour = this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.absenceLimit.heureFin)));
        }
      } else {
        this.startHour = this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointageAbsence.data.heureDebut)));
        this.endHour = this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(this.pointageAbsence.data.acheval ? this.pointageAbsence.data.heureFinCheval : this.pointageAbsence.data.heureFin)));
        const pauseValue = this.pointageAbsence.data.pauseValue;
        if (pauseValue) {

          if(this.endHour.getHours() === 0 && this.endHour.getMinutes() < pauseValue) {
            this.endHour.setDate(this.endHour.getDate() + 1);
          }
          this.endHour = new Date(this.endHour.getTime() - (pauseValue * 60 * 1000));
        }
      }
      if (this.pointageAbsence.data && this.pointageAbsence.data.typePointage && !this.absenceLimit) {
        this.selectedStatus = this.getStatusByCode('present');
        if (this.deleteButtonControl() && !this.isPreSelectedCreation) {
          this.statuses.pop();
          this.statuses.push({
            value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.DELETE_POINTAGE'),
            code: 'deleted'
          });
        }
        this.selectedType = this.pointageAbsence.data.typePointage || null;
        if (this.selectedType && (!this.typePointageUtilitiesService.getTypePointageByLibelle(this.localTypePointages, this.selectedType.libelle)) && this.pointageAbsence.data.typePointage) {
          this.localTypePointages.unshift(this.pointageAbsence.data.typePointage);
        }
        this.types = this.localTypePointages;
      } else {
        this.selectedStatus = this.getStatusByCode('absent');
        if (this.deleteButtonControl() && !this.isPreSelectedCreation) {
          this.statuses.pop();
          this.statuses.push({
            value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.DELETE_ABSENCE'),
            code: 'deleted'
          });
        }
        if (this.absenceLimit) {
          this.selectedType = this.typeEvenementUtilitiesService.getTypeEvenementByLibelle(this.localTypeEvenements, this.absenceLimit.libelle);
          this.absenceLimit.typeEvenement = this.selectedType;
        } else {
          this.selectedType = this.pointageAbsence.data.typeEvenement || null;
          if (this.selectedType && (!this.typeEvenementUtilitiesService.getTypeEvenementByLibelle(this.localTypeEvenements, this.selectedType.libelle)) && this.pointageAbsence.data.typeEvenement) {
            this.localTypeEvenements.unshift(this.pointageAbsence.data.typeEvenement);
          }

        }
        this.types = this.localTypeEvenements;
        if ((this.absenceLimit && this.absenceLimit.libelle === 'Retard') || (this.selectedType && this.selectedType.codeGdh === 'RE')) {
          this.linkText = this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.BON_REATRD');
        } else if ((this.absenceLimit && this.absenceLimit.libelle === 'Départ anticipé') || (this.selectedType && this.selectedType.codeGdh === 'DA')) {
          this.linkText = this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.DEPART_ANTICIPE');
        }
      }
    } else if (this.isCreation) {
      this.setParamsGdhDefault();
      this.isSubmitted = false;
      this.startHour = new Date();
      this.endHour = new Date();
    }
  }

  public ngOnInit() {
    this.limitDecoupageFulldayService.currentChevauched.subscribe(value => {
      this.pointageAbsence.error = value;
      this.ref.detectChanges();
    });
  }

  private createStatusFilter(): void {
    this.statuses = [
      {value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.ABSENT'), code: 'absent'},
      {value: this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.PRESENT'), code: 'present'},
    ];
    if (this.deleteButtonControl()) {
      this.statuses.push({value: '', code: 'deleted'});
    }
  }


  private getStatusByCode(code: PointageAbsenceStatus): { code: PointageAbsenceStatus, value: string } {
    return this.statuses.find((status: { value: string, code: PointageAbsenceStatus }) => status.code === code);
  }


  public changeStartHourStatus(): void {
    this.startHourInModification = !this.startHourInModification;
  }

  public async closeStartHourTimer($event): Promise<void> {
    this.startHourInModification = false;
    if (this.modeAffichage > 0 && this.isContinuedDecoupageWithNextDay) {
      this.checkIfNightValueDebut(event);
    } else {
      this.startHourIsNight = false;
    }

  }

  public checkStartHourValidity(date: Date): void {
    if (date) {
      this.startHour = date;
      this.pointageAbsence.error = false;
    }
  }

  public checkEndHourValidity(date: Date): void {
    if (date) {
      this.pointageAbsence.error = false;
      this.endHour = date;
    }
  }

  public async closeEndHourTimer($event): Promise<void> {
    this.endHourInModification = false;
    if (this.modeAffichage > 0 && this.isContinuedDecoupageWithNextDay) {
      this.checkIfNightValueFin(event);
    } else {
      this.endHourIsNight = false;
    }

  }

  public changeEndHourStatus(): void {
    this.endHourInModification = !this.endHourInModification;
  }


  public hidePopPup(): void {
    this.hidePopUp.emit();
  }

  public checkIfNightValueDebut($event) {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.startHourIsNight = true;
        event.stopPropagation();
      },
      reject: () => {
        this.startHourIsNight = false;
        event.stopPropagation();
      }
    });
  }

  public checkIfNightValueFin($event) {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.translator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.endHourIsNight = true;
        event.stopPropagation();
      },
      reject: () => {
        this.endHourIsNight = false;
        event.stopPropagation();
      }
    });
  }

  public setListOfTypesBasedOnStatusFilter(status: { value: string, code: PointageAbsenceStatus }): void {
    this.pointageAbsence.error = false;
    switch (status.code) {
      case 'absent':
        this.types = this.localTypeEvenements;
        break;
      case 'present':
        this.types = this.localTypePointages;
        break;
      case 'deleted':
        this.types = [];
        this.linkText = '';
        break;
    }
    this.selectedType = undefined;
    if (this.isSubmitted) {
      this.isSubmitted = false;
    }
  }

  public selectedTypeChanges(selectedType: any): void {
    if (selectedType.codeGdh === 'RE') {
      this.linkText = this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.BON_REATRD');
    } else if (selectedType.codeGdh === 'DA') {
      this.linkText = this.rhisTranslateService.translate('GDH.DAY_VEIW.POPUP.DEPART_ANTICIPE');
    } else {
      this.linkText = '';
    }
  }

  private checkHoursAreDifferent(): void {
    if (this.dateService.isTheSameDates(this.startHour, this.endHour) && (this.selectedStatus.code === 'present')) {
      this.pointageAbsence.error = true;
    } else {
      this.pointageAbsence.error = false;

    }
  }

  /**
   * set statues and type by GDH parameter
   */
  private setParamsGdhDefault() {
    if (+this.blockGdhParamDefault === 0) {
      this.types = this.localTypePointages;
      this.selectedStatus = this.getStatusByCode('present');
      this.selectedType = this.typePointageUtilitiesService.getTypePointageByLibelle(this.localTypePointages, 'Terrain') || null;
    } else if (+this.blockGdhParamDefault === 1) {
      this.selectedStatus = this.getStatusByCode('absent');
      this.types = this.localTypeEvenements;
      this.selectedType = this.typeEvenementUtilitiesService.getTypeEvenementByCode(this.localTypeEvenements, 'AI') || null;
    }
  }

  public submit(): void {
    if (this.isContinuedDecoupageWithNextDay && this.modeAffichage > 0 &&
      this.isCreation && this.endHourIsNight === null && this.startHourIsNight === null) {
      this.pointageAbsence.error = true;
      this.isSubmitted = false;
    } else {
      this.isSubmitted = true;
      this.checkHoursAreDifferent();
      if ((!this.selectedStatus) ||
        ((!this.selectedType) && (this.selectedStatus.code !== 'deleted')) ||
        this.pointageAbsence.error) {
        return;
      }
      const pointageAbsenceAction = {} as GuiPointageAbsenceActionGdh;
      if (!this.isCreation && !this.absenceLimit && !this.isPreSelectedCreation) {
        pointageAbsenceAction.fromStatus = (this.pointageAbsence.data.typePointage !== undefined) ? 'present' : 'absent';
      }
      pointageAbsenceAction.toStatus = this.selectedStatus.code;
      if (this.selectedStatus.code === 'present') {
        pointageAbsenceAction.type = this.typePointageUtilitiesService.getTypePointageByLibelle(this.localTypePointages, this.selectedType.libelle);
      } else if (this.selectedStatus.code === 'absent') {
        pointageAbsenceAction.type = this.typeEvenementUtilitiesService.getTypeEvenementByLibelle(this.localTypeEvenements, this.selectedType.libelle);
      }
      pointageAbsenceAction.heureDebut = this.dateService.setStringFromDate(this.startHour);
      pointageAbsenceAction.heureFin = this.dateService.setStringFromDate(this.endHour);
      if (this.isContinuedDecoupageWithNextDay && (this.modeAffichage !== 0)) {
        let isStartHourNight = this.startHourIsNight === null ? this.pointageAbsence.data.heureDebutIsNight : this.startHourIsNight;
        let isEndHourNight = this.endHourIsNight === null ? this.pointageAbsence.data.heureFinIsNight : this.endHourIsNight;
        if (!isEndHourNight) {
          isEndHourNight = false;
        }
        if (!isStartHourNight) {
          isStartHourNight = false;
        }
        pointageAbsenceAction.hoursInSameDay = isStartHourNight === isEndHourNight;
      } else {
        pointageAbsenceAction.hoursInSameDay = this.startHour <= this.endHour;
      }
      if (!this.isCreation) {
        pointageAbsenceAction.heureDebutIsNight = this.pointageAbsence.data.heureDebut.substring(0, 5) === this.dateService.setStringFromDate(this.startHour) && this.startHourIsNight === null ? this.pointageAbsence.data.heureDebutIsNight : this.startHourIsNight;
      } else {
        pointageAbsenceAction.heureDebutIsNight = this.startHourIsNight;
      }
      pointageAbsenceAction.heurefinIsNight = pointageAbsenceAction.hoursInSameDay ? pointageAbsenceAction.heureDebutIsNight : !pointageAbsenceAction.heureDebutIsNight;
      pointageAbsenceAction.date = this.pointageAbsence.data ? this.pointageAbsence.data.dateJournee : this.absenceLimit.dateJournee;
      this.onSubmit.emit(pointageAbsenceAction);
      this.isSubmitted = false;
    }
  }

  public printVoucher(pointageAbsence: GuiPointageAbsenceGdh): void {
    this.printEvent.emit(this.absenceLimit ? this.absenceLimit : pointageAbsence);
  }
}
