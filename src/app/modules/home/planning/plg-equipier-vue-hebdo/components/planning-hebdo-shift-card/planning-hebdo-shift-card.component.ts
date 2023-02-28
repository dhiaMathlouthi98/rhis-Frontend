import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {GlobalSettingsService} from 'src/app/shared/service/global-settings.service';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';


@Component({
  selector: 'rhis-planning-hebdo-shift-card',
  templateUrl: './planning-hebdo-shift-card.component.html',
  styleUrls: ['./planning-hebdo-shift-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningHebdoCardComponent implements OnInit, AfterViewInit {

  @Input() shift: any;
  @Input() cardDay: any;
  @Input() cardEmpIndex: number;
  @Input() cardID: string;
  @Input() idShift: number;
  @Input() employee;
  @Output() public editCardShift: EventEmitter<any> = new EventEmitter();
  @Output() public deleteCardShift: EventEmitter<any> = new EventEmitter();
  public menuOpened = false;

  public colorTextShift: any;

  public imageEditIcon: any;

  private ecran = 'VPE';
  public top = -22;
  public buttom = 15;
  public menuState = false;
  public sizeShift: string;
  @Input() days: any[] = [];

  /**
   * Class Constructor
   * @param: brightnessColorShiftService
   */
  constructor(private brightnessColorShiftService: BrightnessColorShiftService,
              private domControlService: DomControlService,
              private globalSettings: GlobalSettingsService,
              private cdRef: ChangeDetectorRef) {
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit() {

    this.colorTextShift = this.brightnessColorShiftService.codeColorTextShift(this.shift.positionTravail.couleur, !this.employee.disableInactifEmployee);
    this.imageEditIcon = this.brightnessColorShiftService.icontShift(this.shift.positionTravail.couleur, !this.employee.disableInactifEmployee);
    // check menuState uses
    this.resizeOnMenuChange(this.globalSettings.menuIsOpen, 500, () => {
      this.cdRef.detectChanges();
    });
    this.globalSettings.onToggleMenu().subscribe(menuOpen => {
      this.cdRef.detectChanges();
      this.resizeOnMenuChange(menuOpen,  400, () => {
        this.setShiftFontSize();
        this.cdRef.detectChanges();
      });
    });
  }

  private resizeOnMenuChange(menuOpen: boolean, tmp: number, operation: Function) {
    this.menuOpened = menuOpen;
    setTimeout(() => {
      operation();
    }, tmp);
  }

  ngAfterViewInit(): void {
    this.setShiftFontSize();
    this.cdRef.detectChanges();
  }

  /**
   * calculate width of shift depends on day size
   */
  public setShiftFontSize(): void {
      const element = document.getElementsByClassName('dayName');
      if (element) {
        const el = element.item(0);
        if (el) {
          const widthOfContent = +(window.getComputedStyle(el).width).substring(0, 3);
          if (widthOfContent > 200) {
            this.sizeShift = '11px';
          } else if (widthOfContent < 200 && widthOfContent >= 185) {
            this.sizeShift = '10px';
          } else if (widthOfContent < 185 && widthOfContent >= 150) {
            this.sizeShift = '9px';
          } else if (widthOfContent < 150 && widthOfContent >= 125) {
            this.sizeShift = '8px';
          } else {
            this.sizeShift = '7px';
          }
        }
      }
  }

  /**
   * Permet de faire l'appel à la fonction d'edition d'un card dans le container principal
   * @param: event
   */
  public edit(employee: EmployeeModel) {
    if (this.updateButtonControl() && !employee.disableInactifEmployee && !employee.isManagerOrLeader) {
      this.editCardShift.emit({card: {...this.shift}, cardIndex: this.idShift, employee: this.employee});
    }
  }

  /**
   * Faire appel à la fonction de suppression d'un card dans le container principal
   * @param: event
   */
  public delete(event) {
    if (this.deleteButtonControl()) {
      this.deleteCardShift.emit(this.idShift);
    }
  }

  public getTooltipPositionTop(shift: ShiftModel): void {
    this.top = -28;
    if (shift.shiftIndexInDay > 1) {
      if (shift.shiftIndexInDay === 2 || shift.shiftIndexInDay === 3) {
        this.top = this.top + 22;
      } else {
        this.top = this.top + Math.trunc(shift.shiftIndexInDay / 2) * 22;
      }
    } else {
      this.top = -28;
    }
  }

  public getTooltipPositionRight(shift: ShiftModel): any {
    const screenWidth = window.screen.width;
    if (screenWidth >= 1681) {
      if (shift.shiftIndexInDay % 2 === 0) {
        return 140;
      } else {
        return 35;
      }
    } else if (screenWidth > 1600 && screenWidth <= 1680) {
      if (shift.shiftIndexInDay % 2 === 0) {
        return 110;
      } else {
        return 20;
      }
    } else if (screenWidth > 1366 && screenWidth <= 1600) {
      if (shift.shiftIndexInDay % 2 === 0) {
        return 100;
      } else {
        return 15;
      }
    } else {
      if (shift.shiftIndexInDay % 2 === 0) {
        if (shift.positionTravail.libelle.length > 10) {
          return 80;
        } else if (shift.positionTravail.libelle.length >= 5 && shift.positionTravail.libelle.length <= 10) {
          return 74;
        } else {
          return 75;
        }

      } else {
        if (shift.positionTravail.libelle.length > 10) {
          return 5;
        } else if (shift.positionTravail.libelle.length >= 5 && shift.positionTravail.libelle.length <= 10) {
          return 5;
        } else {
          return 3;
        }
      }
    }
  }

}
