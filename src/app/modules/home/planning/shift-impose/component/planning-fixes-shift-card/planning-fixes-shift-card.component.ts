import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';


@Component({
  selector: 'rhis-planning-fixes-shift-card',
  templateUrl: './planning-fixes-shift-card.component.html',
  styleUrls: ['./planning-fixes-shift-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningFixesShiftCardComponent implements OnInit {

  @Input() shift: any;
  @Input() cardDay: any;
  @Input() cardEmpIndex: number;
  @Input() cardID: string;
  @Input() idShiftFixe: number;
  @Input() employee;

  @Output() public editCardShiftFixe: EventEmitter<any> = new EventEmitter();
  @Output() public deleteCardShiftFixe: EventEmitter<any> = new EventEmitter();

  public colorTextShift: any;

  public imageEditIcon: any;

  private ecran = 'GPF';
  public menuOpened = false;

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
    this.colorTextShift = this.brightnessColorShiftService.codeColorTextShift(this.shift.positionTravail.couleur, !this.employee.disablePlanningManagerOrLeaderOrFixe);
    this.imageEditIcon = this.brightnessColorShiftService.icontShift(this.shift.positionTravail.couleur, !this.employee.disablePlanningManagerOrLeaderOrFixe);
    this.resizeOnMenuChange(this.globalSettings.menuIsOpen);
    this.globalSettings.onToggleMenu().subscribe(menuOpen => {
      this.resizeOnMenuChange(menuOpen);
    });
  }

  private resizeOnMenuChange(menuOpen: boolean) {
    this.menuOpened = menuOpen;
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 500);
  }

  /**
   * Permet de faire l'appel à la fonction d'edition d'un card dans le container principal
   * @param: event
   */
  public edit(event) {
    if (this.updateButtonControl()) {
      this.editCardShiftFixe.emit({card: {...this.shift}, cardIndex: this.idShiftFixe, employee: this.employee});
    }
  }

  /**
   * Faire appel à la fonction de suppression d'un card dans le container principal
   * @param: event
   */
  public delete(event) {
    if (this.deleteButtonControl()) {
      this.deleteCardShiftFixe.emit(this.idShiftFixe);
    }
  }

}
