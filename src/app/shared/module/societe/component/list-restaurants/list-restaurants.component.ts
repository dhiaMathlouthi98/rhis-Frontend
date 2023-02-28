import {Component, HostListener, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {RestaurantService} from '../../../../service/restaurant.service';
import {RestaurantModel} from '../../../../model/restaurant.model';
import {PaginationArgs, PaginationPage} from '../../../../model/pagination.args';
import {FormControl} from '@angular/forms';
import {NotificationService} from '../../../../service/notification.service';
import {SessionService} from '../../../../service/session.service';
import {PathService} from '../../../../service/path.service';
import {DomControlService} from '../../../../service/dom-control.service';
import {RhisRoutingService} from '../../../../service/rhis.routing.service';
import {RestaurantNameService} from '../../../../service/restaurant-name.service';
import {GuiAlarme} from '../../../../model/gui/gui.alarme';
import {AlarmeService} from '../../../../../modules/home/accueil/service/alarme.service';
import {SharedRestaurantService} from '../../../../service/shared.restaurant.service';
import {FranchiseService} from 'src/app/modules/home/franchise/services/franchise.service';

@Component({
  selector: 'rhis-list-restaurants',
  templateUrl: './list-restaurants.component.html',
  styleUrls: ['./list-restaurants.component.scss']
})
export class ListRestaurantsComponent implements OnInit {
  public header: { title: string, field: string }[];
  public listRestaurants: RestaurantModel[];
  public first = 0;
  public row = 10;
  public totalRecords: number;
  public nbrRestaurants: number;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public filterName = new FormControl('');
  public uuidSociete: string;
  private ecran = 'LDR';
  private sous_ecran = 'GTR';

  public heightInterface: any;
  public uuidFranchise: any;

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
              private franchiseService: FranchiseService,
  ) {
    this.activatedRoute.params.subscribe((parmas) => {
      if (parmas.uuidSociete) {
        this.uuidSociete = parmas.uuidSociete;
      } else if (parmas.uuidFranchise) {
        this.uuidFranchise = parmas.uuidFranchise;
      }
    });
    this.sessionService.setRestaurant(0);
    this.sessionService.setUuidFranchisee('');
  }

  ngOnInit() {
    this.domService.detailsControl(this.sous_ecran);
    this.resetAlarmeAndIdRestaurant();
    this.initializeHeader();
    this.getListRestaurants();
    this.domService.addControl(this.ecran);
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
      {title: this.rhisTranslateService.translate('RESTAURANT.TYPE_RESTAURANT'), field: 'typeRestaurant'},
      {title: this.rhisTranslateService.translate('RESTAURANT.NOM_RESTAURANT'), field: 'libelle'},
      {title: this.rhisTranslateService.translate('RESTAURANT.NOM_SOCIETE'), field: 'societe'},
      {title: this.rhisTranslateService.translate('RESTAURANT.DIRECTEUR'), field: 'directeur'},
      {title: this.rhisTranslateService.translate('RESTAURANT.FRANCHISE'), field: 'franchise'},
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
   * Get restaurants by societe ,user and page
   */
  private getListRestaurants() {
    let filter = {};
    if (this.uuidFranchise) {
      filter = {nom: this.filterName.value, uuidFranchise: this.uuidFranchise};

      this.franchiseService.getListRestoByFranchise(this.paginationArgs, filter, this.uuidFranchise)
        .subscribe((restaurantPage: PaginationPage<RestaurantModel>) => {
          this.totalRecords = restaurantPage.totalElements;
          this.listRestaurants = restaurantPage.content;
          if (!this.filterName.value) {
            this.nbrRestaurants = this.totalRecords;
          }
        });
    } else {
      if (this.uuidSociete) {
        filter = {filterName: this.filterName.value, uuidSociete: this.uuidSociete};
      } else {
        filter = {filterName: this.filterName.value};
      }
      this.restaurantService.getAllWithPaginationAndFilter(this.paginationArgs, filter)
        .subscribe((restaurantPage: PaginationPage<RestaurantModel>) => {
          this.totalRecords = restaurantPage.totalElements;
          this.listRestaurants = restaurantPage.content;
          if (!this.filterName.value) {
            this.nbrRestaurants = this.totalRecords;
          }
        });
    }


  }

  /**
   * Search by key Enter
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchRestaurants();
    }
  }

  /**
   * Search for restaurants by name
   */
  public searchRestaurants() {
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListRestaurants();

  }

  /**
   * Sort restaurant list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {
    this.listRestaurants.sort((row1, row2) => {
      let val1: any;
      let val2: any;
      if (event.field === 'typeRestaurant') {
        val1 = row1[event.field]['nomType'];
        val2 = row2[event.field]['nomType'];
      } else if (event.field === 'societe') {
        val1 = row1[event.field]['societeName'];
        val2 = row2[event.field]['societeName'];
      } else if (event.field === 'directeur') {
        if (row1[event.field] && !row2[event.field]) {
          return event.order;
        } else if (row2[event.field] && !row1[event.field]) {
          return -event.order;
        } else if (!row1[event.field] && !row2[event.field]) {
          return 0;
        }
        val1 = row1[event.field]['nom'];
        val2 = row2[event.field]['nom'];
      } else if (event.field === 'franchise') {
        if (row1[event.field]) {
          val1 = row1[event.field]['nom'];
        } else {
          val1 = '';
        }
        if (row2[event.field]) {
          val2 = row2[event.field]['nom'];
        } else {
          val2 = '';
        }
      } else {
        val1 = row1[event.field];
        val2 = row2[event.field];
      }
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDelete(id: string): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {

        this.delete(id);
      },
      reject: () => {
      }
    });
  }

  /**
   * Delete a restaurant by id
   * @param: id
   */
  private delete(id: string) {
    this.notificationService.startLoader();
    this.restaurantService.remove(id).subscribe(rees => {
      this.getListRestaurants();
      this.notificationService.stopLoader();
      this.notificationService.showSuccessMessage('RESTAURANT.DELETED');
    }, error => {
      this.notificationService.stopLoader();
      this.notificationService.showErrorMessage('RESTAURANT.NOT_DELETED');
    });
  }

  /**
   * Show Details of dedicated restaurant
   * @param: id
   */
  public showDetails(event, uuid: string) {
    if (event.target.tagName !== 'IMG' && this.domService.updateListControl(this.ecran)) {
      this.router.navigateByUrl(this.rhisRouter.getRouteDetailRestaurant('RESTAURANT_DETAIL', uuid));

    }
  }

  public getRestaurant(restaurant: RestaurantModel): void {
    this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur('0');
    if (restaurant.franchise) {
      this.sessionService.setUuidFranchisee(restaurant.franchise.uuid);
      this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur(restaurant.franchise.uuid);
    }
    this.sessionService.setSocieteName(restaurant.societe.societeName);
    this.sessionService.setSociete(restaurant.societe.idSociete);
    this.pathService.setIdRestaurant(restaurant.idRestaurant);
    this.sessionService.setRestaurant(restaurant.idRestaurant);
    this.sessionService.setUuidRestaurant(restaurant.uuid);
    this.restaurantNameService.changeNameRestaurant(restaurant.libelle);
    this.sessionService.setSociete(restaurant.societe.idSociete);
    this.sessionService.setRestaurantName(restaurant.libelle);
    this.sharedRestaurantService.selectedRestaurant = restaurant;
    this.getAllGuiAlarmeByRestaurant(restaurant);
    this.router.navigateByUrl(this.rhisRouter.getRoute('HOME'));
    this.router.navigateByUrl('home');

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
