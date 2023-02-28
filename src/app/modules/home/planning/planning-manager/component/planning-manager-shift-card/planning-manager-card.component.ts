import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';


@Component({
  selector: 'rhis-planning-manager-card',
  templateUrl: './planning-manager-card.component.html',
  styleUrls: ['./planning-manager-card.component.scss']
})
export class PlanningManagerCardComponent implements OnChanges, OnInit {

  @Input() planning: any;
  @Input() cardDay: any;
  @Input() cardEmpIndex: number;
  @Input() cardID: string;
  @Input() cardPeriodeIndex;
  @Input() idPlanningManager: number;
  @Input() managerOuLeader;
  @Input() periode;
  @Input() vuePoste;
  @Input() listManagerOrleaderInactif;
  productif = false;

  @Output() public editCardPlanningManager: EventEmitter<any> = new EventEmitter();
  @Output() public deleteCardPlanningManager: EventEmitter<any> = new EventEmitter();
  public ecran = 'VPM';

  public menuOpened = false;

  constructor(private domControlService: DomControlService,
              private globalSettings: GlobalSettingsService,
              private cdRef: ChangeDetectorRef) {
  }


  ngOnInit() {
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

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   *  fonction qui s'exécute à chaque changement des inputs du composant

   * @param : changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.planning) {
      this.planning = changes.planning.currentValue;
      if (this.planning.planningManagerProductif && this.planning.planningManagerProductif.length) {
        this.productif = true;
      }
    }
  }

  /**
   * Permet de faire l'appel à la fonction d'edition d'un card dans le container principal
   * @param: event
   */
  public edit(event, filter?) {
    if (filter) {
      this.editCardPlanningManager.emit({card: {...this.planning}, cardIndex: this.idPlanningManager, periode: this.periode});

    } else {
      this.editCardPlanningManager.emit({card: {...this.planning}, cardIndex: this.idPlanningManager, employee: this.managerOuLeader});
    }
  }


  /**
   * Faire appel à la fonction de suppression d'un card dans le container principal
   * @param: event
   */
  public delete(event) {
    this.deleteCardPlanningManager.emit(this.idPlanningManager);
  }

}
