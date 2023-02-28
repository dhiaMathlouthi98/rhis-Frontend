import {Component, OnInit, ViewChild} from '@angular/core';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {Observable, Subject} from 'rxjs';
import {DecoupageHoraireComponent} from '../decoupage-horaire/decoupage-horaire.component';
import {GestionProductiviteComponent} from '../gestion-productivite/gestion-productivite.component';
import {GestionAbsenteismeComponent} from '../gestion-absenteisme/gestion-absenteisme.component';
import {CharteDecoupageComponent} from '../charte-decoupage/charte-decoupage.component';
import {ConfirmationService} from 'primeng/api';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {SessionService} from '../../../../../../shared/service/session.service';

@Component({
  selector: 'rhis-charte-decoupage-absenteisme-productivite-decoupage-horaire',
  templateUrl: './charte-decoupage-absenteisme-productivite-decoupage-horaire.component.html',
  styleUrls: ['./charte-decoupage-absenteisme-productivite-decoupage-horaire.component.scss']
})
export class CharteDecoupageAbsenteismeProductiviteDecoupageHoraireComponent implements OnInit {

  public selectedTab = 'decoupage';

  public firstDayAsInteger: number;

  public collumns: any[] = [];

  public heightInterface: any;

  @ViewChild(DecoupageHoraireComponent) decoupageHoraireComponent;
  @ViewChild(GestionProductiviteComponent) gestionProductiviteComponent;
  @ViewChild(GestionAbsenteismeComponent) gestionAbsenteismeComponent;
  @ViewChild(CharteDecoupageComponent) charteDecoupageComponent;

  public decoupageHoraireComponentNotChanged = false;
  public gestionProductiviteComponentNotChanged = false;
  public gestionAbsenteismeComponentNotChanged = false;
  public charteDecoupageComponentNotChanged = false;

  public navigateAway: Subject<boolean> = new Subject<boolean>();

  constructor(private rhisTranslator: RhisTranslateService,
              private sharedRestaurant: SharedRestaurantService,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private dateService: DateService,
              private sessionService: SessionService) {
  }

  ngOnInit() {
    this.notificationService.stopLoader();
    this.getSelectedRestaurant();
  }

  public setSelectedTab(choix: string) {
    this.selectedTab = choix;
  }

  private getSelectedRestaurant() {
    if (this.sharedRestaurant.selectedRestaurant.idRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant !== 0) {
      this.setColumns();
    } else {
      this.sharedRestaurant.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurant.selectedRestaurant = data;
          this.setColumns();
        }, (err: any) => {
          console.log('error');
          console.log(err);
        }
      );
    }
  }

  private setColumns() {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    for (let i = 0; i < 7; i++) {
      this.collumns.push({
        column: this.rhisTranslator.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        val: this.convertStringToCamelCase(this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7))
      });
      this.collumns.push();
    }
  }

  private convertStringToCamelCase(day: string): string {
    let convertedItem = day.charAt(0);
    convertedItem = convertedItem.concat(day.substring(1, day.length).toLowerCase());
    return convertedItem;
  }


  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    // this.decoupageHoraireComponentNotChanged = this.decoupageHoraireComponent.compareList();
    // this.gestionProductiviteComponentNotChanged = this.gestionProductiviteComponent.compareList();
    // this.gestionAbsenteismeComponentNotChanged = this.gestionAbsenteismeComponent.compareList();
    // this.charteDecoupageComponentNotChanged = this.charteDecoupageComponent.compareList();
    // return this.decoupageHoraireComponentNotChanged && this.gestionProductiviteComponentNotChanged && this.gestionAbsenteismeComponentNotChanged && this.charteDecoupageComponentNotChanged;
    return true;
  }

  /**
   * Launch all updates for the restaurant parameters
   */
  private updateParametres() {
    if (!this.decoupageHoraireComponentNotChanged) {
      /*      this.decoupageHoraireComponent.updateParamNat();*/
    }
    if (!this.gestionProductiviteComponentNotChanged) {
      this.gestionProductiviteComponent.addProductivite();
    }
    if (!this.gestionAbsenteismeComponentNotChanged) {
      this.gestionAbsenteismeComponent.addAbsenteisme();
    }
    if (!this.charteDecoupageComponentNotChanged) {
      this.charteDecoupageComponent.addCharteDecoupage();
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParametres();
        setTimeout(() => this.navigateAway.next(true), 1500);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  public canAccess(componentName: string): boolean {
    return this.sessionService.getComponents().indexOf(componentName) > -1;
  }
}
