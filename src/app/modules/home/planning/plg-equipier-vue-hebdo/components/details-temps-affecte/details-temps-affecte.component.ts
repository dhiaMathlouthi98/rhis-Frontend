import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DateService} from 'src/app/shared/service/date.service';
import {GlobalSettingsService} from 'src/app/shared/service/global-settings.service';

@Component({
  selector: 'rhis-details-temps-affecte',
  templateUrl: './details-temps-affecte.component.html',
  styleUrls: ['./details-temps-affecte.component.scss']
})
export class DetailsTempsAffecteComponent implements OnInit, OnChanges, AfterViewInit {
  public showDetailedView = false;
  // public displayMoeProd = false;
  @Input() public displayMoeProd: number;
  @Input() public detailTempsPayeWeek: any;
  @Input() public totauxDayByDay: any;
  @Input() public weekNumber: any;
  public moeValues  = [];
  public caValues =  [];
  public tempsAffectePlanifie = [];
  public prodValues  = [];
  public menuState = false;
  public menuOpened = false;
  public widthFooterMenuOpened: any;
  public detailTempsAffecteWidth = false;
  @Output() menuBasOpen = new EventEmitter<boolean>();

  constructor(private dateService: DateService, private globalSettings: GlobalSettingsService) { }

  ngOnInit() {
    this.menuState = this.globalSettings.menuIsOpen;
    this.stateDetailTempsWidthMenu(this.menuState);
    this.globalSettings.onToggleMenu().subscribe(_ => {
      this.menuOpened = !this.menuOpened;
      this.stateDetailTempsWidthMenu(this.menuState);
    });
  }
  public stateDetailTempsWidthMenu(menuState: boolean) {
    this.menuState = menuState;
    if (!this.menuState) {
      setTimeout(() => {
        this.detailTempsAffecteWidth = this.menuState;
        if (this.detailTempsAffecteWidth === true) {
          this.widthFooterMenuOpened = document.querySelector('.empNameColumn') as HTMLElement;
          this.widthFooterMenuOpened = this.widthFooterMenuOpened.offsetWidth + 34;
        }
      }, 500);
    } else {
      this.detailTempsAffecteWidth = this.menuState;
      if (this.detailTempsAffecteWidth === true) {
        this.widthFooterMenuOpened = document.querySelector('.empNameColumn') as HTMLElement;
        this.widthFooterMenuOpened = this.widthFooterMenuOpened.offsetWidth + 14;
      }
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.displayMoeProd && changes.displayMoeProd.currentValue) {
      this.displayMoeProd = changes.displayMoeProd.currentValue;
    }
    if (changes.detailTempsPayeWeek && changes.detailTempsPayeWeek.currentValue) {
      this.detailTempsPayeWeek = changes.detailTempsPayeWeek.currentValue;
    }
    if (changes.totauxDayByDay && changes.totauxDayByDay.currentValue) {
      this.totauxDayByDay = changes.totauxDayByDay.currentValue;
      this.moeValues = [];
      this.prodValues = [];
      this.caValues = [];
      this.tempsAffectePlanifie = [];
      this.totauxDayByDay.forEach((total: any) =>{
        this.moeValues.push(total.tauxMoePerDay);
        this.prodValues.push(total.prodPerDay);
        this.caValues.push(total.ca.ca);
        this.tempsAffectePlanifie.push(this.dateService.formatMinutesToHours(total.totalAffecte) + '/' + this.dateService.formatMinutesToHours(total.totalPlanifie));
      });
    }
  }
  /**
   * Afficher la vue détaillé
   */
   public showMoreData() {
    this.showDetailedView = true;
    this.menuBasOpen.emit(this.showDetailedView);
  }
 /**
   * Afficher la vue minimaliste
   */
  public showLessData() {
    this.showDetailedView = false;
    this.menuBasOpen.emit(this.showDetailedView);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.stateDetailTempsWidthMenu(this.menuState);
    }, 100);
  }
    /**
   * calculate element in "details temps"
   */
  public calculateWidthDetailsTemps(): any {
    const element = document.getElementsByClassName('dayName');
    if (element) {
      const el = element.item(0);
      if (el) {
        return (window.getComputedStyle(el).width);
      }
    }

  }
}
