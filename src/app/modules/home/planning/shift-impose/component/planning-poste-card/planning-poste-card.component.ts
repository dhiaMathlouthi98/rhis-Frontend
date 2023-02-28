import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';


@Component({
  selector: 'rhis-planning-poste-card',
  templateUrl: './planning-poste-card.component.html',
  styleUrls: ['./planning-poste-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningPosteCardComponent implements OnInit {

  @Input() cardDetails: any;
  @Input() color: any;
  @Input() idBesoinImpose: number;
  @Input() cardDay: any;
  @Input() cardPosteIndex: number;
  @Input() cardID: string;
  @Output() public editCard: EventEmitter<any> = new EventEmitter();
  @Output() public deleteCard: EventEmitter<any> = new EventEmitter();

  messageMapping: { [k: string]: string };

  public personne;

  public personnes;

  public colorTextCard: any;
  public imageEditIconCard: any;
  private ecran = 'GBI';
  public menuOpened = false;

  @Input()
  set initPersonneValue(personne: string) {
    this.personne = personne;
    this.messageMapping = {'=1': '#' + this.personne, 'other': '#' + this.personnes};
  }

  @Input()
  set initPersonnesValue(personnes: string) {
    this.personnes = personnes;
    this.messageMapping = {'=1': '# ' + this.personne, 'other': '# ' + this.personnes};
  }

  /**
   * Class Constructor
   * @param: brightnessColorShiftService
   */
  constructor(private brightnessColorShiftService: BrightnessColorShiftService,
              private domControlService: DomControlService,
              private globalSettings: GlobalSettingsService,
              private cdRef: ChangeDetectorRef) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  ngOnInit() {
    this.colorTextCard = this.brightnessColorShiftService.codeColorTextShift(this.cardDetails.positionTravail.couleur);
    this.imageEditIconCard = this.brightnessColorShiftService.icontShift(this.cardDetails.positionTravail.couleur);
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
    this.editCard.emit({card: this.cardDetails, cardIndex: this.idBesoinImpose});
  }

  /**
   * Faire appel à la fonction de suppression d'un card dans le container principal
   * @param: event
   */
  public delete(event) {
    this.deleteCard.emit(this.idBesoinImpose);
  }

}
