import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {AlarmeService} from 'src/app/modules/home/accueil/service/alarme.service';
import {FranchiseService} from 'src/app/modules/home/franchise/services/franchise.service';
import {GuiAlarme} from 'src/app/shared/model/gui/gui.alarme';
import {PaginationArgs} from 'src/app/shared/model/pagination.args';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {DomControlService} from 'src/app/shared/service/dom-control.service';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {PathService} from 'src/app/shared/service/path.service';
import {RestaurantNameService} from 'src/app/shared/service/restaurant-name.service';
import {RestaurantService} from 'src/app/shared/service/restaurant.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SessionService} from 'src/app/shared/service/session.service';
import {SharedRestaurantService} from 'src/app/shared/service/shared.restaurant.service';


@Component({
  selector: 'rhis-list-restaurants',
  templateUrl: './list-restaurants.component.html',
  styleUrls: ['./list-restaurants.component.scss']
})
// Affichage list restaurants by user ou by franchise en mode table avec pagination
export class ListRestaurantsTableComponent implements OnInit{
  public header: { title: string, field: string }[];
  public listRestaurants: RestaurantModel[];
  public first = 0;
  public row = 10;
  public totalRecords: number;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  private ecran = 'LDR';
  private sous_ecran = 'GTR';

  public heightInterface: any;
  public uuidFranchise: string;
  private order = 1;
  private _searchedValue: string;
  public notFoundMsgText = '';
  @Input() get searchedValue(): string {
    return this._searchedValue;
  } 
  set searchedValue(value: string) {
    this._searchedValue = value;
    this.getListRestaurants();

  }
  constructor(private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private restaurantService: RestaurantService,
              private activatedRoute: ActivatedRoute,
              private sessionService: SessionService,
              private pathService: PathService,
              private domService: DomControlService,
              public rhisRouter: RhisRoutingService,
              private restaurantNameService: RestaurantNameService,
              private sharedRestaurantService: SharedRestaurantService,
              private alarmeService: AlarmeService,
              private franchiseService: FranchiseService
  ) {
    this.activatedRoute.params.subscribe((parmas) => {
      if (parmas.uuidFranchise) {
        this.uuidFranchise = parmas.uuidFranchise;
      }
    });
    this.sessionService.setRestaurant(0);
    this.sessionService.setRestaurantName('');
  }

  ngOnInit() {
    this.domService.detailsControl(this.sous_ecran);
    this.resetAlarmeAndIdRestaurant();
    this.initializeHeader();
    this.getListRestaurants();
  }


  public deleteButtonControl(): boolean {
    return this.domService.deleteListControl(this.ecran);
  }

  public detailsControl(): boolean {
    return this.domService.detailsControl(this.ecran);
  }

  private resetAlarmeAndIdRestaurant() {
    this.restaurantNameService.changeNameRestaurant('');
    this.restaurantNameService.setListGuiAlarme([]);
  }

  /**
   * Create restaurants table header
   */
  private initializeHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('RESTAURANT.NOM_RESTAURANT'), field: 'libelleRestaurant'},
      {title: this.rhisTranslateService.translate('RESTAURANT.DIRECTEUR'), field: 'directeur'},
      {title: this.rhisTranslateService.translate('RESTAURANT.FRANCHISE'), field: 'franchise'},
      {title: this.rhisTranslateService.translate('RESTAURANT.NUM_TEL'), field: 'telephone'},
      {title: this.rhisTranslateService.translate('LIST_RESTAURANT.EMPLOYES_ACTIVE'), field: 'nbreEmplyeeActif'}
    ];
  }

  /**
   * Fetch a specific restaurants page
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListRestaurants();
  }

  /**
   * Get restaurants by franchise ,user and page
   */
  private getListRestaurants() {
    if (this.uuidFranchise) {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchiseByPage(this.paginationArgs, this.order, this.uuidFranchise, {filterName: this._searchedValue})
        .subscribe((restaurantPage: any) => {
          this.totalRecords = restaurantPage.totalElements;
          this.listRestaurants = restaurantPage.content;
          if(this.listRestaurants.length){
            this.notFoundMsgText = '';
          } else{
            this.notFoundMsgText = this.rhisTranslateService.translate('LIST_RESTAURANT.RESTAURANT_NOT_FOUND');
          }
        });
    } else {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByPage(this.paginationArgs, this.sessionService.getUuidUser(), this.order, {filterName: this._searchedValue})
        .subscribe((restaurantPage: any) => {
          this.totalRecords = restaurantPage.totalElements;
          this.listRestaurants = restaurantPage.content;
          if(this.listRestaurants.length){
            this.notFoundMsgText = '';
          } else{
            this.notFoundMsgText = this.rhisTranslateService.translate('LIST_RESTAURANT.RESTAURANT_NOT_FOUND');
          }
        });
    }

  }

  /**
   * Sort restaurant list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {
    if (event.field === 'libelleRestaurant') {
      this.order = event.order ? event.order : this.order;
      this.getListRestaurants();
    } else {
      this.listRestaurants.sort((row1, row2) => {
        let val1;
        let val2;
        let result = 0;
        if (event.field === 'directeur') {
          if (row1[event.field] && !row2[event.field]) {
            return event.order;
          } else if (row2[event.field] && !row1[event.field]) {
            return -event.order;
          } else if (!row1[event.field] && !row2[event.field]) {
            return 0;
          }
          val1 = row1[event.field]['nom'];
          val2 = row2[event.field]['nom'];
          if (val1 && val2) {
            result = val1.localeCompare(val2) * event.order;
          }
        } else if (event.field === 'nbreEmplyeeActif') {
          val1 = +row1[event.field];
          val2 = +row2[event.field];
          if (val1 === val2) {
            return 0;
          }
          result = -1;
          if (val1 > val2) {
            result = 1;
          }
          if (event.order < 0) {
            result = -result;
          }
        } else {
          val1 = row1[event.field];
          val2 = row2[event.field];
          result = val1.localeCompare(val2) * event.order;
        }
        return result;

      });
    }
  }


  public async getRestaurant(restaurant: any): Promise<void> {
    this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur('0');
    this.pathService.setIdRestaurant(restaurant.IdenRestaurant);
    this.sessionService.setRestaurant(restaurant.IdenRestaurant);
    if (restaurant.franchise && restaurant.franchise.uuid) {
      this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur(restaurant.franchise.uuid);
    } else if (this.uuidFranchise) {
      this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur(this.uuidFranchise);
    }
    this.sessionService.setUuidRestaurant(restaurant.uuid);
    this.restaurantNameService.changeNameRestaurant(restaurant.libelleRestaurant);
    this.sessionService.setRestaurantName(restaurant.libelleRestaurant);
    this.sharedRestaurantService.selectedRestaurant = restaurant;

    this.getAllGuiAlarmeByRestaurant(restaurant);
    this.router.navigateByUrl(this.rhisRouter.getRoute('HOME'));
    this.router.navigateByUrl('home');

    this.sharedRestaurantService.selectedRestaurant = await this.restaurantService.getRestaurantById(restaurant.uuid).toPromise();

  }

  private getAllGuiAlarmeByRestaurant(restaurant: RestaurantModel) {
    this.alarmeService.getAllGuiAlarmeByRestaurant(restaurant.uuid).subscribe(
      (data: GuiAlarme[]) => {
        this.restaurantNameService.setListGuiAlarme(this.alarmeService.getAllPresentGuiAlarmeOrderByPriorite(data));
      }, (err: any) => {
        // TODO notify of error
      }
    );
  }
}
