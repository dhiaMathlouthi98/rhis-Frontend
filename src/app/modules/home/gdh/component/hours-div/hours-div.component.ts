import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DateService} from '../../../../../shared/service/date.service';
import {GuiAbsenceGdh, GuiGdh, GuiPointageGdh, GuiShiftGdh} from '../../../../../shared/model/gui/vue-jour.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';

@Component({
  selector: 'rhis-hours-div',
  templateUrl: './hours-div.component.html',
  styleUrls: ['./hours-div.component.scss'],
})
export class HoursDivComponent {

  @Input() id: string;
  @Input() shift: GuiShiftGdh;
  @Input() pointage: GuiPointageGdh;
  @Input() pointagePosition: { isFirst: boolean, isLast: boolean };
  @Input() absence: GuiAbsenceGdh;
  @Input() innerShiftAbsence: GuiGdh;
  @Input() isPlanif: boolean;
  @Input() intersection: boolean;
  @Output()
  public clickedAbsence = new EventEmitter<any>();

  @Input()
  set partitions(parts: []) {
    if (parts) {
      this.parts = parts;
    }
  }

  public ecran = 'GDH';

  @Input() set widthOfMinute(value: number) {
    if (value) {
      this.minuteMesure = value;
      this.setMesures(value);
      this.setColors();
    }
  }

  public widthTotal: number;
  public width: number;
  public widthLeft = 0;
  public widthRight = 0;
  public left = 0;
  public top = 22;
  public color: string;
  public parts: any[];
  private minuteMesure: number;
  public cssClassDebut: string;
  public cssClassFin: string;
  public cssClassTiret: string;

  private readonly GRAY = '#a4a3a3';
  private readonly RED = '#ed2121a8';
  private readonly GREEN = '#2DC76Dcc';
  private readonly LIGHT_GREEN = '#2DC76D42';
  private readonly LIGHT_RED = '#e8000042';
  private readonly GRAY_TIME = 'time-gris';
  private readonly GREEN_TIME = 'time-green';
  private readonly ORANGE_TIME = 'time-orange';
  private readonly RED_TIME = 'time-red';

  constructor(private dateService: DateService,
              private domControlService: DomControlService) {
  }


  public startAbsenceData(pointage: GuiPointageGdh, shift: GuiShiftGdh): void {
    if (pointage.arrives > 0) {
      let heureDebut;
      let heureDebutIsNight;
      const items = this.getPointageAndInnerShiftAbsences(this.shift);
      const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
      if (indexOfCurrentPointage !== -1) {
        if (indexOfCurrentPointage === 0) {
          heureDebut = shift.heureDebut;
          heureDebutIsNight = shift.heureDebutIsNight;
        } else {
          heureDebut = items[indexOfCurrentPointage - 1].heureFin;
          heureDebutIsNight = items[indexOfCurrentPointage - 1].heureFinIsNight;
        }
      }
      const data = {
        'dateJournee': pointage.dateJournee,
        'heureDebut': heureDebut,
        'heureDebutIsNight': heureDebutIsNight,
        'heureFin': pointage.heureDebut,
        'heureFinIsNight': pointage.heureDebutIsNight,
        'libelle': 'Retard',
      };
      data['totalMinutes'] = this.dateService.getTotalMinutes(data);
      this.clickedAbsence.emit(data);
    }

  }

  public endAbsenceData(pointage: GuiPointageGdh, shift: GuiShiftGdh): void {
    if (pointage.sortie < 0) {
      let heureFin;
      let heureFinIsNight;
      const items = this.getPointageAndInnerShiftAbsences(this.shift);
      const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
      if (indexOfCurrentPointage !== -1) {
        if (indexOfCurrentPointage === items.length - 1) {
          heureFin = shift.heureFin;
          heureFinIsNight = shift.heureFinIsNight;
        } else {
          heureFin = items[indexOfCurrentPointage + 1].heureDebut;
          heureFinIsNight = items[indexOfCurrentPointage + 1].heureDebutIsNight;
        }
      }
      let marginLeft = 0;
      if (this.pointagePosition.isFirst && this.pointage.arrives > 0 && items[0].id !== this.pointage.id) {
        if (indexOfCurrentPointage !== -1) {
          marginLeft = this.dateService.getDiffInMinuteInBetween(items[indexOfCurrentPointage - 1], this.pointage);
        }
      }
      const data = {
        'dateJournee': pointage.dateJournee,
        'heureDebut': pointage.heureFin,
        'heureDebutIsNight': pointage.heureFinIsNight,
        'heureFin': heureFin,
        'heureFinIsNight': heureFinIsNight,
        'totalMinutesPointage': pointage.totalMinutes + marginLeft,
        'libelle': 'Départ anticipé'
      };
      data['totalMinutes'] = this.dateService.getTotalMinutes(data);
      this.clickedAbsence.emit(data);
    } else {
      const data = {
        'dateJournee': shift.dateJournee,
        'heureDebut': this.dateService.setStringFromDate(pointage[0]),
        'heureDebutIsNight': pointage.heureFinIsNight,
        'heureFin': this.dateService.setStringFromDate(pointage[1]),
        'heureFinIsNight': shift.heureFinIsNight,
        'libelle': 'Départ anticipé',
        'totalMinutesPointage': pointage.totalMinutes,
        'arrivee': pointage.arrives,
        'sortie': pointage.sortie,
        'totalMinutes': this.dateService.getDiffOn(pointage[0], pointage[1])
      };
      this.clickedAbsence.emit(data);
    }
  }

  public innerPointingClicked(innerShiftAbsence: any): void {
    if (innerShiftAbsence) {
      innerShiftAbsence.libelle = 'innerAbsence';
      this.clickedAbsence.emit(innerShiftAbsence);
    } else {
      this.clickedAbsence.emit(null);
    }
  }


  /**
   * Set widths of shift/``pointage``/absence based on the width on a minute and ``GuiGdh`` attributes values and place theme properly in th
   * @param widthOfMinute: width of a minutes in pixels
   */
  private setMesures(widthOfMinute: number): void {
    this.calculateTotalElementWidth(widthOfMinute);
    this.calculateRealWidthOfPointageOrAbsence(widthOfMinute);
    this.calculateMarginsAndPositionsInTimeAxe(widthOfMinute);
    this.addExtraBlocksMesures();
  }

  private addExtraBlocksMesures(): void {
    if (this.parts && this.minuteMesure) {
      const extraBlocksMesure = this.parts.map(part => {
        if (part && part[1]) {
          return this.dateService.getDiffOn(part[1].interval[1], part[1].interval[0]) * this.minuteMesure;
        }
        return 0;
      }).reduce((firstDuration: number, secondDuration: number) => firstDuration + secondDuration, 0);
      this.widthTotal += extraBlocksMesure;
    }
  }

  private calculateRealWidthOfPointageOrAbsence(widthOfMinute: number): void {
    if (!this.isPlanif && this.shift && (this.shift.id !== null) && this.pointage) {
      // it's a ``pointage`` associated with a shfit, so we calculate the start/end of the intersection between
      // the ``pointage`` and it's shift, we can have three blocks here (delay / advance for the start hour, ``pointage`` and delay / advance for the end hour)
      const [start, end] = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(this.shift, this.pointage);
      if (start === end === null) {
        this.width = this.shift.totalMinutes * widthOfMinute;
      } else {
        this.width = this.dateService.getDiffOn(end, start) * widthOfMinute;
      }
    } else {
      this.width = this.widthTotal;
    }
  }

  private calculateMarginsAndPositionsInTimeAxe(widthOfMinute: number): void {
    if (this.pointage) {
      // calculate delay / advance block widths for a ``pointage``
      const items: GuiGdh[] = this.getPointageAndInnerShiftAbsences(this.shift);
      if (this.pointagePosition.isFirst && this.pointage.arrives > 0 && items[0].id !== this.pointage.id) {
        const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
        if (indexOfCurrentPointage !== -1) {
          this.widthLeft = this.dateService.getDiffInMinuteInBetween(items[indexOfCurrentPointage - 1], this.pointage);
        }
      } else {
        this.widthLeft = Number(this.timeToPixel(Math.abs(this.pointage.arrives), widthOfMinute));
      }
      if (this.pointagePosition.isLast && this.pointage.sortie < 0 && items[items.length - 1].id !== this.pointage.id) {
        const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
        if (indexOfCurrentPointage !== -1) {
          this.widthRight = this.dateService.getDiffInMinuteInBetween(this.pointage, items[indexOfCurrentPointage + 1]);
        }
      } else {
        this.widthRight = Number(this.timeToPixel(Math.abs(this.pointage.sortie), widthOfMinute));
      }
      if (this.minuteMesure && this.parts && this.parts.length && this.parts[0] && this.parts[0].length && this.parts[0][0]) {
        const endCurrentShift = this.dateService.getDateFromIsNight(new Date(`${this.shift.dateJournee} ${this.shift.heureFin}`), this.shift.heureFinIsNight);
        const startNextShift = this.dateService.getDateFromIsNight(new Date(`${this.parts[0][0].shift.dateJournee} ${this.parts[0][0].shift.heureDebut}`), this.parts[0][0].shift.heureDebutIsNight);
        this.widthRight = this.dateService.getDiffOn(startNextShift, endCurrentShift) * this.minuteMesure;
      }
    }

    // Display shift/absence/``pointage`` in the axe time by calculating margin left
    if (this.isPlanif) {
      this.left = Number(this.shift.heureDebut.substring(3, 5)) * widthOfMinute;
    } else if (this.pointage && (this.pointage.arrives > 0)) {
      const item: GuiGdh = this.getPointageAndInnerShiftAbsences(this.shift).shift();
      this.left = (item['arrives'] ? Number(this.shift.heureDebut.substring(3, 5)) : 0) * widthOfMinute;
    }
  }

  public getPointageAndInnerShiftAbsences(shift: GuiShiftGdh): GuiGdh [] {
    return [].concat(shift.absences ? shift.absences : [], shift.pointages)
      .sort((firstItem: GuiGdh, secondItem: GuiGdh) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(firstItem, secondItem) ? -1 : 1);
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

  private calculateTotalElementWidth(widthOfMinute: number): void {
    if (this.isPlanif) {
      // this item is a shift
      this.widthTotal =
        this.shift.totalMinutes * widthOfMinute;
    } else if (this.absence) {
      // this item is an absence
      this.widthTotal =
        this.absence.totalMinutes * widthOfMinute;
    } else if (this.innerShiftAbsence) {
      this.widthTotal = this.innerShiftAbsence.totalMinutes * widthOfMinute;
    } else {
      // this item is a ``pointage``
      this.widthTotal =
        this.pointage.totalMinutes * widthOfMinute;
    }
    if (this.pointage) {
      if (this.pointage.arrives > 0 && this.pointagePosition.isFirst) {
        const items = this.getPointageAndInnerShiftAbsences(this.shift);
        if (items && items.length && (items[0].id !== this.pointage.id)) {
          const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
          if (indexOfCurrentPointage !== -1) {
            this.widthTotal += this.dateService.getDiffInMinuteInBetween(items[indexOfCurrentPointage - 1], this.pointage);
          }
        } else {
          this.widthTotal += (Math.abs(this.pointage.arrives) * widthOfMinute);
        }
      }
      if (this.pointage.sortie < 0 && this.pointagePosition.isLast) {
        const items = this.getPointageAndInnerShiftAbsences(this.shift);
        if (items && items.length && (items[items.length - 1].id !== this.pointage.id)) {
          const indexOfCurrentPointage = items.findIndex((guiGdh: GuiGdh) => guiGdh.id === this.pointage.id);
          if (indexOfCurrentPointage !== -1) {
            this.widthTotal += this.dateService.getDiffInMinuteInBetween(this.pointage, items[indexOfCurrentPointage + 1]);
          }
        } else {
          this.widthTotal += (Math.abs(this.pointage.sortie) * widthOfMinute);
        }
      }
    }
  }

  private setColors(): void {
    this.color = this.GRAY;
    this.cssClassTiret = 'time-white';
    if (!this.isPlanif) {
      if (this.absence) {
        this.color = this.RED;
      } else if (this.innerShiftAbsence) {
        this.color = this.LIGHT_RED;
      } else {
        this.color = this.GREEN;
        this.cssClassDebut = '';
        this.cssClassFin = '';

        if (this.pointage.arrives !== 0 || this.pointage.sortie !== 0) {
          this.color = this.LIGHT_GREEN;
          this.cssClassTiret = this.GRAY_TIME;
          this.cssClassDebut = this.GREEN_TIME;
          this.cssClassFin = this.GREEN_TIME;
        }
        if (this.pointage.arrives < 0) {
          this.cssClassDebut = this.ORANGE_TIME;
        }
        if (this.pointage.arrives > 0) {
          this.cssClassDebut = this.RED_TIME;
        }
        if (this.pointage.sortie < 0) {
          this.cssClassFin = this.RED_TIME;
        }
        if (this.pointage.sortie > 0) {
          this.cssClassFin = this.ORANGE_TIME;
        }
      }
    }
  }

  private timeToPixel(time: any, widthOfMinute: number): string {
    return Number(time * widthOfMinute).toFixed(2);
  }

  public getDuration(minuteWidht: number, part, dateService: DateService): number {
    if (part) {
      return dateService.getDiffOn(part.interval[1], part.interval[0]) * minuteWidht;
    }
    return 0;
  }

  public showMiniShiftFormat($event: MouseEvent, tooltip: OverlayPanel, shift: GuiShiftGdh, widthTotal: number, isPlanif: boolean): void {
    if (this.isShiftMiniFormatIsShown(isPlanif, shift, widthTotal)) {
      tooltip.show($event);
    }
  }

  public isShiftMiniFormatIsShown(isPlanif: boolean, shift: GuiShiftGdh, widthTotal: number): boolean {
    return isPlanif && ((shift.acheval && widthTotal < 80) || (!shift.acheval && widthTotal < 60));
  }
}
