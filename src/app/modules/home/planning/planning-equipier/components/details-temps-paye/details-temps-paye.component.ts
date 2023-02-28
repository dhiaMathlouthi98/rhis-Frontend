import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {PlanningEquipierService} from '../../service/planning-equipier.service';
import {DetailTempsPaye, DetailTempsPayeValue} from 'src/app/shared/model/details-temps-paye';
import {DateService} from 'src/app/shared/service/date.service';
import {DatePipe} from '@angular/common';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {SessionService} from '../../../../../../shared/service/session.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';
import {ShiftModel} from '../../../../../../shared/model/shift.model';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import * as rfdc from 'rfdc';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import * as moment from 'moment';

@Component({
  selector: 'rhis-details-temps-paye',
  templateUrl: './details-temps-paye.component.html',
  styleUrls: ['./details-temps-paye.component.scss']
})
export class DetailsTempsPayeComponent implements OnInit, OnChanges {
  /**
   * Date pour laquelle on affiche les données
   */
  private _date: string;
  public listShift = [];
  @Output() tauxMoeByDay: EventEmitter<any> = new EventEmitter();
  public totalTauxMoe: any;
  public caPerDay: number;
  public totalTempsPlanifie: number;
  public detailTempsPlanifie: DetailTempsPaye;
  public displayMoeProd = false;
  public messageChartControlButton = '';
  public totalShiftNonAffecteJourneeCourante: number;

  /**
   * Récupérer la date du jour sélectionné
   */
  get date(): string {
    return this._date;
  }

  public menuOpened = false;

  /**
   * Heure de fin de journée d'activité
   */
  @Input() finJourneeActivite: any;
  @Input() activeEmployeesWithTotalPlanifieJour: any[];
  @Input() activeEmployeesWithTotalPlanifieSemaine: any[];
  /**
   * les heures travaillé de la journée
   */
  @Input() hours: string[];
  /**
   * Récupérer le numéro de la semaine
   */
  @Input() week: number;

  /**
   * Afficher / cache les plannings managers
   */
  @Input() displayPlgManagers: boolean;
  @Input() totalTempsAbsence: any;
  @Input() showMoe: any;
  /**
   * detail temps payé de la journée
   */
  private detailTempsPaye: DetailTempsPaye;
  /**
   * nombre de valeurs à afficher
   */
  public gridColumnsNumber: number;
  /**
   * Valeurs de MOE
   */
  public moeValues: string[] = [];
  /**
   * Valeurs de cA prévisionnel
   */
  public caValues: string[] = [];
  /**
   * Valeurs de temps payé
   */
  public payedTimeValues: string[] = [];
  /**
   * Valeurs de Productivité
   */
  public prodValues: any[] = [];
  public planifiedTimeValues: string[] = [];
  /**
   * Les heures à afficher
   */
  public tempsPayeHours: string[] = [];
  /**
   * nombre de colonne à afficher
   */
  public detailsGridColumnsNumber: number;
  /**
   * Afficher/ou non la vue détaillée
   */
  public showDetailedView = false;
  /**
   * Show / hide chart
   */
  public isChartShown = false;
  /**
   * Valeurs de la semaine pour la vue détaillée
   */
  public detailTempsPayeWeek: any;

  public detailTempsPaieScrollable = false;
  public menuState = false;

  @Input()
  set date(val: string) {
    this._date = val;
    this._date = this.datePipe.transform(this.date, 'dd/MM/yyyy');
    if (val) {
      this.calculateWidthDetailsTemps(this.menuState);
    }

  }

  private ONE_HOUR_IN_MS = 60 * 60 * 1000;

  public widthFooterMenuOpened: any;

  public clone = rfdc();

  public totalEquipNonAffecteByWeek: any;

  private displayManager = false;

  public days = [];

  @Input() set setTotalEquipieNonAffecteByWeek(totalEquipNonAffecteByWeek: any) {
    this.totalEquipNonAffecteByWeek = totalEquipNonAffecteByWeek;
    if (this.detailTempsPayeWeek) {
      this.updateTotalTempsPayeWek();
    }
  }

  private modeAffichage = 0;

  @Input()
  set setModeAffichage(modeAffichage: number) {
    this.modeAffichage = modeAffichage;
  }

  public widthOfHour: any;

  constructor(private planningEquipierService: PlanningEquipierService,
              private notificationService: NotificationService,
              private sessionService: SessionService,
              private sharedRestaurantService: SharedRestaurantService,
              private dateService: DateService, private datePipe: DatePipe,
              private contrainteSocialeService: ContrainteSocialeService,
              private globalSettings: GlobalSettingsService,
              private rhisTranslateService: RhisTranslateService) {
  }

  ngOnInit() {
    this.menuState = this.globalSettings.menuIsOpen;
    this.stateDetailTempsWidthMenu(this.menuState);
    this.detailTempsPaieScrollable = this.menuState;
    this.globalSettings.onToggleMenu().subscribe(_ => {
      this.stateDetailTempsWidthMenu(this.menuState);
      this.menuOpened = !this.menuOpened;
      this.calculateWidthDetailsTemps(this.menuOpened);
    });
    this.getDetailTempsPaye();
  }

  public stateDetailTempsWidthMenu(menuState: boolean) {
    this.menuState = menuState;
    if (!this.menuState) {
      setTimeout(() => {
        this.detailTempsPaieScrollable = this.menuState;
        if (this.detailTempsPaieScrollable === true && this.widthFooterMenuOpened) {
          this.widthFooterMenuOpened = document.querySelector('.employees-list') as HTMLElement;
          this.widthFooterMenuOpened = this.widthFooterMenuOpened.offsetWidth + 34;
        }
      }, 500);
    } else {
      this.detailTempsPaieScrollable = this.menuState;
      if (this.detailTempsPaieScrollable === true && this.widthFooterMenuOpened) {
        this.widthFooterMenuOpened = document.querySelector('.employees-list') as HTMLElement;
        this.widthFooterMenuOpened = this.widthFooterMenuOpened.offsetWidth + 14;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeEmployeesWithTotalPlanifieSemaine && changes.activeEmployeesWithTotalPlanifieSemaine.currentValue && this.detailTempsPayeWeek) {
      if (changes && changes.displayPlgManagers) {
        this.displayManager = changes.displayPlgManagers.currentValue;
      }
      this.updateTotalTempsPayeWek();
      this.setTotalTempsPayePlanifie();
    }
    if (changes && changes.showMoe) {
      this.displayMoeProd = changes.showMoe.currentValue;
    }
      this.calculateWidthDetailsTemps(this.menuState);
  }

  /**
   * incrémenter le temps payé
   * @param indexesToUpdate indexes des valeurs à incrémenter/ décrementer
   */
  public updateTempsPayeWeek(countPlanningManager: boolean, indexesToUpdate: { index: number, value: number }[], debutJourneeActivite: any, dayToUpdateInDetailedPayedTime: any, decrement: boolean, oldDayToUpdate: any, newDayToUpdate: any, oldShiftNonAffecte?: any): void {
    // update dans le cas de drag and drop d'une journee à une autre dans la vue semaine
    if (oldDayToUpdate) {
      this.updateDayInWeekPayedTime(oldDayToUpdate, indexesToUpdate, debutJourneeActivite, null, decrement, oldShiftNonAffecte);
    }
    if (newDayToUpdate) {
      this.updateDayInWeekPayedTime(newDayToUpdate, indexesToUpdate, debutJourneeActivite, null, decrement, oldShiftNonAffecte);
    }
    // update des journees autre que journee courante (lors de chargement des managers/leaders ou resizing sur la meme journee de la vue semaine)
    if (!newDayToUpdate && !oldDayToUpdate) {
      const dayToUpdate = this.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.datePipe.transform(dayToUpdateInDetailedPayedTime, 'dd/MM/yyyy'));
      if (dayToUpdate) {
        this.updateDayInWeekPayedTime(dayToUpdate, indexesToUpdate, debutJourneeActivite, dayToUpdateInDetailedPayedTime, decrement, oldShiftNonAffecte);
      } else if (!dayToUpdateInDetailedPayedTime) {
        if (indexesToUpdate.length) {
          //extract dates to update in detailTempsPayeWeek
          const incrementSet = new Set();
          const daysToUpdate = indexesToUpdate.filter((increment: any) => {
            const duplicate = incrementSet.has(this.datePipe.transform(increment.dateToUpdate, 'dd/MM/yyyy'));
            incrementSet.add(this.datePipe.transform(increment.dateToUpdate, 'dd/MM/yyyy'));
            return !duplicate;
          });
          daysToUpdate.forEach((element: any) => {
            const dayToUpdate = this.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.datePipe.transform(element.dateToUpdate, 'dd/MM/yyyy'));
            if (dayToUpdate) {
              this.updateDayInWeekPayedTime(dayToUpdate, indexesToUpdate, debutJourneeActivite, element.dateToUpdate, decrement, oldShiftNonAffecte);
            }
          });
        } else if (decrement && oldShiftNonAffecte) {
          // Cas du chargement d'une journee/semaine de reference, on modifie seulement le total temps planifié
          this.updateTotalTempsPayeWek(oldShiftNonAffecte);
        }
      }
    }

  }

  public updateTotalTempsPayeWek(oldShiftNonAffecte?: any): void {
    let totalTPWeek = 0;
    let totalTPEquipWeek = 0;
    this.detailTempsPayeWeek.journee.forEach((jour: any) => {
      jour.totalTempsPayeEnMinute = 0;
      jour.totalTempsPayeEquipieEnMinute = 0;
      this.activeEmployeesWithTotalPlanifieSemaine.forEach((employe: any) => {
        if (employe.totalPlanifieSemaine) {
          const days = employe.totalPlanifieSemaine.filter((total: any) => this.datePipe.transform(total.dateJournee, 'dd/MM/yyyy') === jour.dateJournee);
          if (days && days.length) {
            days.forEach((day: any) => jour.totalTempsPayeEnMinute += day.totalPlanifieJournee);
          }
        }
      });
      //Add total temps non planifié (shift non affecté)
      jour.totalTempsPaye = this.dateService.convertNumberToTimeWithPattern(jour.totalTempsPayeEnMinute, ':');
      totalTPWeek += jour.totalTempsPayeEnMinute;

      this.activeEmployeesWithTotalPlanifieSemaine.forEach((empl: EmployeeModel) => {
        const employeeNew = {contrats: empl.contrats.filter(_=> true)} as EmployeeModel;
        let activeGroupeTravail;
        if (employeeNew.contrats) {
          const employeeWithActifContrat = this.contrainteSocialeService.getContratByDay(employeeNew, this.dateService.createDateFromStringPattern(jour.dateJournee, 'DD/MM/YYYY'), true);
          if (employeeWithActifContrat.contrats && employeeWithActifContrat.contrats.length) {
            activeGroupeTravail = employeeWithActifContrat.contrats[0].groupeTravail;
          } else {
            activeGroupeTravail = empl.groupeTravail;
          }
        } else {
          activeGroupeTravail = empl.groupeTravail;
        }
        if (activeGroupeTravail && activeGroupeTravail.plgEquip) {
          if (empl.totalPlanifieSemaine) {
            const days = empl.totalPlanifieSemaine.filter((total: any) => this.datePipe.transform(total.dateJournee, 'dd/MM/yyyy') === jour.dateJournee);
            if (days && days.length) {
              days.forEach((day: any) => jour.totalTempsPayeEquipieEnMinute += day.totalPlanifieJournee);
              days.forEach((day: any) => totalTPEquipWeek += day.totalPlanifieJournee);
            }
          }
        }
      });

    });
    if (this.detailTempsPayeWeek.totalCA === 0) {
      this.detailTempsPayeWeek.tauxMOEMoyen = 0;
    } else {
      totalTPEquipWeek += this.totalEquipNonAffecteByWeek;
      this.detailTempsPayeWeek.tauxMOEMoyen = (Math.round(((this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (totalTPEquipWeek / 60)) / this.detailTempsPayeWeek.totalCA) * 100) / 100).toFixed(2);
      if (this.displayManager) {
        this.detailTempsPayeWeek.tauxMOEMoyen = (+this.detailTempsPayeWeek.tauxMOEMoyen + (this.detailTempsPayeWeek.tauxMOEMoyenManager)).toFixed(2);
      }
    }
    this.detailTempsPayeWeek.totalTempsPaye = this.dateService.formatMinutesToHours(totalTPWeek);
    this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes = this.totalEquipNonAffecteByWeek;
    if (oldShiftNonAffecte) {
      this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes = this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes - oldShiftNonAffecte.valueToSubstruct + oldShiftNonAffecte.valueToAdd;
    }
    this.detailTempsPayeWeek.totalTempsPlanifie = this.dateService.formatMinutesToHours(this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes + totalTPWeek);
    if (this.detailTempsPayeWeek.totalCA === 0 || this.dateService.timeStringToNumber(this.detailTempsPayeWeek.totalTempsPlanifie) === 0) {
      this.detailTempsPayeWeek.prodMoyenne = '0';
    } else {
      this.detailTempsPayeWeek.prodMoyenne = (this.detailTempsPayeWeek.totalCA / (this.dateService.timeStringToNumber(this.detailTempsPayeWeek.totalTempsPlanifie) / 60)).toFixed(2);
    }

    this.calculTauxMoePerDay(this.displayManager, true);
  }

  /**
   * Afficher la vue détaillé
   */
  public showMoreData() {
    this.showDetailedView = true;
    if (!this.detailTempsPayeWeek) {
      this.getDetailsTempsPayeWeek();
    }
  }

  /**
   * Récupérer les valeurs de temps payé pour chaque jour de la semaine
   */
  public getDetailedValuesByDay(index: number) {
    const tempsPayeDay = [];
    if (this.detailTempsPayeWeek) {
      this.detailTempsPayeWeek.journee[index].tempsPaye.forEach((tp: DetailTempsPayeValue) => tempsPayeDay.push(tp.valeur));
    }
    return tempsPayeDay;
  }

  /**
   * Afficher la vue minimaliste
   */
  public showLessData() {
    this.showDetailedView = false;
  }

  public getDetailTempsPaye(selectedDate?: Date) {
    if (!this.date) {
      this.date = this.sessionService.getDateSelected();
    }
    if (selectedDate) {
      this.date = selectedDate.toDateString();
    }
    this.planningEquipierService.getDetailTempsPaye(this.date).subscribe((data: DetailTempsPaye) => {
      this.detailTempsPaye = data;
      this.detailTempsPlanifie = JSON.parse(JSON.stringify(this.detailTempsPaye));
      this.subscribeListShift();
    }, err => {
      console.error(err);
    });
  }

  /**
   * calculate element in "details temps"
   */
  public calculateWidthDetailsTemps(menuState: boolean) {
    this.menuState = menuState;
    this.menuOpened = this.menuState;
    const element = document.getElementsByClassName('hour-item');
    if (element) {
      const el = element.item(0);
      if (el) {
        setTimeout(_ => {
          this.widthOfHour = window.getComputedStyle(el).width;
        });
      }
    }

  }

  public showMessage(tooltip: OverlayPanel, event, state: string): void {
    this.messageChartControlButton = this.rhisTranslateService.translate(`PLANNING_EQUIPIER.${state}_CHART`);
    tooltip.show(event);
  }

  private updateDayInWeekPayedTime(dayToUpdate: any, indexesToUpdate: { index: number, value: number }[], debutJourneeActivite: any, dayToUpdateInDetailedPayedTime: any, decrement: boolean, oldShiftNonAffecte?: any): void {
    let decoupageDiffrence = 0;
    if (debutJourneeActivite.night === dayToUpdate.tempsPaye[0].heureIsNight) {
      decoupageDiffrence = (+debutJourneeActivite.value.slice(0, 2)) - (+dayToUpdate.tempsPaye[0].heure.slice(0, 2));
    }
    if (indexesToUpdate.length !== 0) {
      indexesToUpdate.forEach((i: { index: number, value: number, dateToUpdate?: any }) => {
        if (dayToUpdateInDetailedPayedTime && this.date === this.datePipe.transform(dayToUpdateInDetailedPayedTime, 'dd/MM/yyyy')) {
          if (!i.dateToUpdate || (i.dateToUpdate && this.datePipe.transform(i.dateToUpdate, 'dd/MM/yyyy') === this.datePipe.transform(dayToUpdateInDetailedPayedTime, 'dd/MM/yyyy'))) {
            // dayToUpdate est la date selectionnée du calendrier
            if (i.index < this.payedTimeValues.length) {
              let payedTimeValue = this.payedTimeValues[i.index];
              if (payedTimeValue.length === 4) {
                payedTimeValue = '0' + payedTimeValue;
              }
              const h = +payedTimeValue.substr(0, 2);
              const min = +payedTimeValue.substr(3, 2);
              const newPayedTimeValue = this.dateService
                .formatMinutesToHours(((h * 60) + min));
              dayToUpdate.tempsPaye[i.index + decoupageDiffrence].valeur = newPayedTimeValue;
              dayToUpdate.tempsPaye[i.index + decoupageDiffrence].valeurEnMinute = ((h * 60) + min);
            }
          }
        } else if (!i.dateToUpdate || (i.dateToUpdate && this.datePipe.transform(i.dateToUpdate, 'dd/MM/yyyy') === this.datePipe.transform(dayToUpdateInDetailedPayedTime, 'dd/MM/yyyy'))) {
          // dayToUpdate est different de la date selectionnée du calendrier
          if (i.index < dayToUpdate.tempsPaye.length) {
            let payedTimeValue = dayToUpdate.tempsPaye[i.index + decoupageDiffrence].valeurEnMinute;

            if (decrement) {
              payedTimeValue -= i.value;
            } else {
              payedTimeValue += i.value;
            }
            const newPayedTimeValue = this.dateService
              .formatMinutesToHours(payedTimeValue);
            dayToUpdate.tempsPaye[i.index + decoupageDiffrence].valeur = newPayedTimeValue;
            dayToUpdate.tempsPaye[i.index + decoupageDiffrence].valeurEnMinute = payedTimeValue;
          }
        }

      });
      dayToUpdate.totalTempsPayeEnMinute = 0;
      this.payedTimeValues.forEach(val => dayToUpdate.totalTempsPayeEnMinute += this.dateService.timeStringToNumber(val));
      dayToUpdate.totalTempsPaye = this.dateService.formatMinutesToHours(dayToUpdate.totalTempsPayeEnMinute);
      let totalTPWeek = 0;
      let tauxMoyenManager = 0;
      this.detailTempsPayeWeek.journee.forEach((j: any) => {
        if (dayToUpdateInDetailedPayedTime && j.dateJournee === this.datePipe.transform(dayToUpdateInDetailedPayedTime, 'dd/MM/yyyy')) {
          j.tempsPaye = dayToUpdate.tempsPaye;
          tauxMoyenManager = +j.tauxMOEMoyenManager;
          // j.totalTempsPaye =  dayToUpdate.totalTempsPaye;
        }
        totalTPWeek += j.totalTempsPayeEnMinute;
      });
      if (this.detailTempsPayeWeek.totalCA === 0) {
        this.detailTempsPayeWeek.tauxMOEMoyen = 0;
      } else {
        totalTPWeek += this.totalEquipNonAffecteByWeek;
        this.detailTempsPayeWeek.tauxMOEMoyen = ((this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (totalTPWeek / 60)) / this.detailTempsPayeWeek.totalCA).toFixed(2);
        if (this.displayManager) {
          this.detailTempsPayeWeek.tauxMOEMoyen = ((+this.detailTempsPayeWeek.tauxMOEMoyen) + tauxMoyenManager).toFixed(2);
        }
      }
      // this.detailTempsPayeWeek.totalTempsPaye =  this.dateService.formatMinutesToHours(totalTPWeek);
    }
    this.updateTotalTempsPayeWek(oldShiftNonAffecte);
    this.setTotalTempsPayePlanifie();
  }

  private updateDetailTempsPaye(hasShiftManager: boolean): void {
    this.detailTempsPaye.tempsPaye.forEach((item: DetailTempsPayeValue) => {
      this.setUpdatedTempsPayeValue(item);
    });
    this.detailTempsPlanifie.tempsPaye.forEach((item: DetailTempsPayeValue) => {
      this.setUpdatedTempsPlanifieValue(item);
    });

    this.detailTempsPaye.tauxMOE.forEach((item: DetailTempsPayeValue) => {
      this.setUpdatedTauxMOEValue(item, hasShiftManager);
    });
    this.calculTauxMoePerDay(hasShiftManager);

  }

  private setDetailTempsPayeValueToDisplay() {
    this.moeValues = [];
    this.prodValues = [];
    this.caPerDay = 0;
    this.caValues = [];
    this.payedTimeValues = [];
    this.planifiedTimeValues = [];
    this.totalTempsPlanifie = 0;
    this.detailTempsPaye.tauxMOE.forEach((tm: DetailTempsPayeValue) => this.moeValues.push(tm.valeur));
    this.moeValues.splice(-1, 1);
    this.detailTempsPaye.cA.forEach((ca: DetailTempsPayeValue) => {
      this.caValues.push(ca.valeur);
      this.caPerDay += Number(ca.valeur);
    });
    this.caValues.splice(-1, 1);
    this.detailTempsPaye.tempsPaye.forEach((tp: DetailTempsPayeValue) => {
      this.payedTimeValues.push(tp.valeur);
      this.totalTempsPlanifie += tp.valeurEnMinute;
    });
    this.detailTempsPlanifie.tempsPaye.forEach((tp: DetailTempsPayeValue, index: number) => {
      this.planifiedTimeValues.push(tp.valeur);
      let prodValue: any;
      if (+this.detailTempsPaye.cA[index].valeur && tp.valeurEnMinute) {
        prodValue = {
          'heure': tp.heure,
          'valeur': (+this.detailTempsPaye.cA[index].valeur / (tp.valeurEnMinute / 60)).toFixed(2)
        };
      } else {
        prodValue = {
          'heure': tp.heure,
          'valeur': 0
        };
      }
      this.prodValues.push(prodValue);
    });
    this.planifiedTimeValues.splice(-1, 1);
    this.prodValues.splice(-1, 1);
    this.gridColumnsNumber = this.moeValues.length;
  }

  private calculTauxMoePerDay(hasShiftManager: boolean, recalculateMOE?: boolean): void {
    this.totalTempsPlanifie = 0;

    if (!recalculateMOE) {
      this.detailTempsPaye.tempsPaye.forEach((tp: DetailTempsPayeValue) => {
        if (hasShiftManager) {
          this.payedTimeValues.push(tp.valeur);
        } else {
          this.payedTimeValues.push(tp.valeurEquip);
        }
        this.totalTempsPlanifie += tp.valeurEquipEnMinute;
      });

      this.detailTempsPlanifie.tempsPaye.forEach((tp: DetailTempsPayeValue) => {
        this.planifiedTimeValues.push(tp.valeur);
      });
    }
    if (this.detailTempsPayeWeek && this.detailTempsPayeWeek.journee) {
      const dayToUpdate = this.detailTempsPayeWeek.journee.find((j: any) => j.dateJournee === this.date);
      if (dayToUpdate) {
        this.totalTempsPlanifie = dayToUpdate.totalTempsPayeEquipieEnMinute ? dayToUpdate.totalTempsPayeEquipieEnMinute : this.totalTempsPlanifie;
      }
    }
    let tempsPlanifeManager = 0;
    if (!this.caPerDay) {
      this.tauxMoeByDay.emit({moa: '-', totalPlanifie: 0});
    } else if ((!hasShiftManager && !this.totalTempsPlanifie) || !this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier) {
      this.tauxMoeByDay.emit({moa: 0, CA: this.caPerDay, totalPlanifie: 0});
    } else {
      this.totalTauxMoe = ((+this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (+this.totalTempsPlanifie / 60)) / +(this.caPerDay.toFixed(2)));
      if (hasShiftManager) {
        this.totalTauxMoe = ((+this.totalTauxMoe) + (+(this.detailTempsPayeWeek.journee.filter(value => value.dateJournee === this.date)[0].tauxMOEMoyenManager)));
        if ((+(this.detailTempsPayeWeek.journee.filter(value => value.dateJournee === this.date)[0].tauxMOEMoyenManager))) {
          tempsPlanifeManager = this.caPerDay * (+(this.detailTempsPayeWeek.journee.filter(value => value.dateJournee === this.date)[0].tauxMOEMoyenManager)) / (+this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenManager * 100);
        }
      }
      this.tauxMoeByDay.emit({
        moa: this.totalTauxMoe,
        CA: this.caPerDay,
        totalPlanifie: Math.floor((+this.totalTempsPlanifie) + tempsPlanifeManager * 60)
      });
    }
  }

  private setValeurEnMinuteDetailTempsPaye(shift: ShiftModel, dateDebut: Date, dateFin: Date): number {
    let heureDebutShift = new Date();
    heureDebutShift.setHours(shift.heureDebut.getHours());
    heureDebutShift.setMinutes(shift.heureDebut.getMinutes());
    heureDebutShift.setSeconds(0);
    heureDebutShift.setMilliseconds(0);
    if (shift.heureDebutIsNight) {
      heureDebutShift = new Date(heureDebutShift.getTime() + 24 * this.ONE_HOUR_IN_MS);
    }

    let heureFinShift = new Date();
    heureFinShift.setHours(shift.heureFin.getHours());
    heureFinShift.setMinutes(shift.heureFin.getMinutes());
    heureFinShift.setSeconds(0);
    heureFinShift.setMilliseconds(0);
    if (shift.heureFinIsNight) {
      heureFinShift = new Date(heureFinShift.getTime() + 24 * this.ONE_HOUR_IN_MS);
    }
    return this.dateService.calculerPartieCommune(dateDebut, dateFin, heureDebutShift, heureFinShift);
  }

  private setUpdatedTempsPlanifieValue(item: DetailTempsPayeValue): void {
    let dateDebut = new Date();
    dateDebut.setHours(+(item.heure.substring(0, 2)));
    dateDebut.setMinutes(+(item.heure.substring(3, 5)));
    dateDebut.setSeconds(0);
    dateDebut.setMilliseconds(0);
    if (item.heureIsNight) {
      dateDebut = new Date(dateDebut.getTime() + 24 * this.ONE_HOUR_IN_MS);
    }

    const dateFin = new Date(dateDebut.getTime() + this.ONE_HOUR_IN_MS);

    let tempsPayeEnMinute = 0;
    item.valeur = this.dateService.convertNumberToTimeWithPattern(tempsPayeEnMinute, ':'); // total des shift affecté
    item.valeurEnMinute = tempsPayeEnMinute; // correspond au total planifié (shifts affectés et non affectés)
    item.valeurEquipEnMinute = 0;
    this.listShift.filter((sh: ShiftModel) => !sh.notActifEquip && !sh.shiftFromAbsence && ((sh.employee && sh.employee.contrats.length > 0) || !sh.employee || !sh.employee.idEmployee)).forEach((shift: ShiftModel, index: number) => {
      let heureDebutShift = new Date();
      heureDebutShift.setHours(shift.heureDebut.getHours());
      heureDebutShift.setMinutes(shift.heureDebut.getMinutes());
      heureDebutShift.setSeconds(0);
      heureDebutShift.setMilliseconds(0);
      if (shift.heureDebutIsNight) {
        heureDebutShift = new Date(heureDebutShift.getTime() + 24 * this.ONE_HOUR_IN_MS);
      }

      let heureFinShift = new Date();
      heureFinShift.setHours(shift.heureFin.getHours());
      heureFinShift.setMinutes(shift.heureFin.getMinutes());
      heureFinShift.setSeconds(0);
      heureFinShift.setMilliseconds(0);
      if (shift.heureFinIsNight) {
        heureFinShift = new Date(heureFinShift.getTime() + 24 * this.ONE_HOUR_IN_MS);
      }
      tempsPayeEnMinute += this.dateService.calculerPartieCommune(dateDebut, dateFin, heureDebutShift, heureFinShift);
      item.valeur = this.dateService.convertNumberToTimeWithPattern(tempsPayeEnMinute, ':'); // total des shift affecté
      item.valeurEnMinute = tempsPayeEnMinute; // correspond au total planifié (shifts affectés et non affectés)
      item.valeurEquipEnMinute += shift.fromPlanningLeader ? 0 : (shift.fromPlanningManager ? 0 : this.dateService.calculerPartieCommune(dateDebut, dateFin, heureDebutShift, heureFinShift));
      item.valeurEquip = this.dateService.convertNumberToTimeWithPattern(item.valeurEquipEnMinute, ':');
    });
  }

  private setUpdatedTauxMOEValue(item: DetailTempsPayeValue, hasShiftManager: boolean): void {
    const tempsPayeIndex = this.detailTempsPaye.tempsPaye.findIndex((tempsPayeItem: DetailTempsPayeValue) => (tempsPayeItem.heure === item.heure) && (tempsPayeItem.heureIsNight === item.heureIsNight));
    const vhIndex = this.detailTempsPaye.cA.findIndex((vhItem: DetailTempsPayeValue) => (vhItem.heure === item.heure) && (vhItem.heureIsNight === item.heureIsNight));
    const valeurTempsPayeEnMinute = this.dateService.timeStringToNumber(this.detailTempsPlanifie.tempsPaye[tempsPayeIndex].valeurEquip ? this.detailTempsPlanifie.tempsPaye[tempsPayeIndex].valeurEquip : this.detailTempsPlanifie.tempsPaye[tempsPayeIndex].valeur);
    if (+this.detailTempsPaye.cA[vhIndex].valeur === 0) {
      item.valeur = '0';
    } else {
      // item.valeur = ((this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (valeurTempsPayeEnMinute / 60)) / +this.detailTempsPaye.cA[vhIndex].valeur).toFixed(2);
      item.valeur = (Math.round(((this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier * 100 * (valeurTempsPayeEnMinute / 60)) / +this.detailTempsPaye.cA[vhIndex].valeur) * 100) / 100).toFixed(2);

    }
    if (hasShiftManager) {
      item.valeur = ((+item.valeur) + (+this.detailTempsPaye.tauxMOEManager[tempsPayeIndex].valeur)).toFixed(2);
    }
  }

  public getDetailsTempsPayeWeek(skipLoader ?: boolean): void {
    if (!skipLoader) {
      this.notificationService.startLoader();
    }
    this.planningEquipierService.getDetailsTempsPayeWeek(this.date).subscribe((data: any) => {
      this.detailTempsPayeWeek = data;
      this.setDatesValue();
      this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes = data.totalShiftsNonAffectes;
      this.detailTempsPayeWeek.totalTempsPlanifie = this.dateService.formatMinutesToHours(this.detailTempsPayeWeek.totalTempsPlanifieEnMinutes + this.dateService.timeStringToNumber(JSON.parse(JSON.stringify(this.detailTempsPayeWeek.totalTempsPaye))));
      this.detailTempsPayeWeek.prodMoyenne = (this.detailTempsPayeWeek.totalCA / this.dateService.timeStringToNumber(JSON.parse(JSON.stringify(this.detailTempsPayeWeek.totalTempsPlanifie))) / 60).toFixed(2);
      this.tempsPayeHours = [];
      this.detailTempsPayeWeek.journee[0].tempsPaye.forEach((item: DetailTempsPayeValue) => {
        this.tempsPayeHours.push(item.heure);
      });
      this.detailsGridColumnsNumber = this.tempsPayeHours.length + 2;
      this.updateTotalTempsPayeWek();
      if (!skipLoader) {
        this.notificationService.stopLoader();
      }
    }, (err: any) => {
      console.log(err);
      if (!skipLoader) {
        this.notificationService.stopLoader();
      }
    });
  }
private setTotalTempsPayePlanifie():void{
  this.detailTempsPayeWeek.journee.forEach((jour: any) => {
    jour.totalPlanifiePayeEnMinutes = jour.totalTempsPayeEnMinute + jour.totalTempsNonPlanifie;
    if(jour.dateJournee === this.date){
      jour.totalPlanifiePayeEnMinutes = jour.totalTempsPayeEnMinute + this.totalShiftNonAffecteJourneeCourante
      } 
    jour.tempsPlanifiePayeDisplay = this.dateService.convertNumberToTimeWithPattern(jour.totalPlanifiePayeEnMinutes, ':');
});
}
  private setUpdatedTempsPayeValue(item: DetailTempsPayeValue): void {
    let dateDebut = new Date();
    dateDebut.setHours(+(item.heure.substring(0, 2)));
    dateDebut.setMinutes(+(item.heure.substring(3, 5)));
    dateDebut.setSeconds(0);
    dateDebut.setMilliseconds(0);
    if (item.heureIsNight) {
      dateDebut = new Date(dateDebut.getTime() + 24 * this.ONE_HOUR_IN_MS);
    }

    const dateFin = new Date(dateDebut.getTime() + this.ONE_HOUR_IN_MS);

    let tempsPayeEnMinute = 0;
    item.valeurEnMinute = tempsPayeEnMinute;
    item.valeur = this.dateService.convertNumberToTimeWithPattern(tempsPayeEnMinute, ':');
    item.valeurEquip = '00:00';
    item.valeurEquipEnMinute = 0;

    this.listShift.filter((sh: ShiftModel) => !sh.notActifEquip && !sh.shiftFromAbsence && (sh.employee && sh.employee.contrats.length > 0)).forEach((shift: ShiftModel) => {
      if (!shift.fromPlanningManager && shift.employee && shift.employee.idEmployee !== null) {
        item.valeurEquipEnMinute += this.setValeurEnMinuteDetailTempsPaye(shift, dateDebut, dateFin);
        item.valeurEquip = this.dateService.convertNumberToTimeWithPattern(item.valeurEquipEnMinute, ':'); // total des shift affecté
      }
      if (shift.employee && shift.employee.idEmployee !== null) {
        tempsPayeEnMinute += this.setValeurEnMinuteDetailTempsPaye(shift, dateDebut, dateFin);
        item.valeurEnMinute = tempsPayeEnMinute; // correspond au total planifié (shifts affectés et non affectés)
        item.valeur = this.dateService.convertNumberToTimeWithPattern(tempsPayeEnMinute, ':'); // total des shift affecté
      }
    });
  }

  private subscribeListShift(): void {
    this.planningEquipierService.currentShiftList.subscribe(listShift => {
      this.listShift = listShift.filter((sh: ShiftModel) => (sh.employee && (!sh.employee.isAbsent && (sh.employee.contrats && sh.employee.contrats.length))) || !sh.employee || (sh.employee && !sh.employee.idEmployee));
      if (this.modeAffichage === 1) {
        this.listShift = listShift.filter((sh: ShiftModel) => sh.modifiable && (sh.employee && (!sh.employee.isAbsent && (sh.employee.contrats && sh.employee.contrats.length))) || !sh.employee || (sh.employee && !sh.employee.idEmployee));
      }
      this.totalShiftNonAffecteJourneeCourante = 0;
      this.listShift.forEach((shift:ShiftModel)=>{
        if (!shift.employee || (shift.employee && !shift.employee.idEmployee)) {
          this.totalShiftNonAffecteJourneeCourante += this.dateService.getDiffHeure(shift.heureFin, shift.heureDebut);
        }
      });
      const hasShiftManager = this.listShift.filter((value: ShiftModel) => value.fromPlanningManager).length > 0;
      this.updateDetailTempsPaye(hasShiftManager);
      this.setDetailTempsPayeValueToDisplay();
    });
  }

  private setDatesValue() {
    this.detailTempsPayeWeek.journee.forEach((item: any) => {
      this.days.push('DAYS.' + this.dateService.getJourSemaineFromIntegerToTranslate(moment(item.dateJournee, 'DD/MM/YYYY').toDate().getDay()));
    });
  }

}
