import {HttpClient} from '@angular/common/http';
import {Component, HostListener, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {FranchiseModel} from 'src/app/shared/model/franchise.model';
import {PaginationArgs, PaginationPage} from 'src/app/shared/model/pagination.args';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {DomControlService} from 'src/app/shared/service/dom-control.service';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {RestaurantService} from 'src/app/shared/service/restaurant.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {RhisRoutingService} from 'src/app/shared/service/rhis.routing.service';
import {SessionService} from 'src/app/shared/service/session.service';
import {FranchiseService} from '../../services/franchise.service';

@Component({
  selector: 'rhis-list-franchise',
  templateUrl: './list-franchise.component.html',
  styleUrls: ['./list-franchise.component.scss']
})
export class ListFranchiseComponent implements OnInit {
  public header: { title: string, field: string }[];
  public listFranchises: FranchiseModel[];
  public first = 0;
  public row = 10;
  public totalRecords: number;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public profil = localStorage.getItem('profil');
  public filterName = new FormControl('');
  public selectedFranchiseForRestaurantsPopUp: string;
  public restaurantsNames = [];
  public numberElementPerPage = 10;

  public heightInterface: any;
  private ecran = 'FRA';
  public sous_ecran = 'LRF';
  public sous_ecran_liste_resto = 'LDR';
  totalFranchises: number;
  public selectedFranchise: any;
  public buttonLabel: string;
  public showAddFranchisePopup = false;
  public showAddFranchisePopupTitle: string;

  public listRestaurants: RestaurantModel[] = [];

  private field = 'nom';
  private order = 1;
  constructor(private rhisTranslateService: RhisTranslateService, private franchiseService: FranchiseService,
              public rhisRouter: RhisRoutingService, private httpClient: HttpClient, private domControlService: DomControlService,
              private router: Router, private restaurantService: RestaurantService, private notificationService: NotificationService,
              private sessionService: SessionService, private confirmationService: ConfirmationService,
  ) {
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.domControlService.detailsControl(this.ecran);
    this.initializeHeader();
    this.getListFranchises();
    this.sessionService.setRestaurant(0);
    this.sessionService.setRestaurantName('');
    this.sessionService.setUuidFranchisee('');
  }
  public detailsControl() {
    return this.domControlService.detailsControl(this.sous_ecran);
  }
  public detailsControlEcran() {
    return this.domControlService.detailsControl(this.sous_ecran_liste_resto);
  }
  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }
  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }
  public addControl(): boolean{
    return this.domControlService.addControlButton(this.ecran);
  }

    /**
   * Fetch a specific sociétes page
   * @param: event
   */
     public onLazyLoad(event: LazyLoadEvent) {
      this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
      this.getListFranchises();
      this.numberElementPerPage = this.paginationArgs.pageSize;
    }

 /**
   * Create franchise table header
   */
  private initializeHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('FRANCHISE.NAME'), field: 'nom'},
      {title: this.rhisTranslateService.translate('FRANCHISE.TEL'), field: 'numTel'}];
  }

   /**
   * Get listFranchise
   */
    private getListFranchises() {
      this.franchiseService.getAllWithPaginationAndFilter(this.paginationArgs,
        {nom: this.filterName.value,
          column: this.field,
          order: this.order}).subscribe((page: PaginationPage<FranchiseModel>) => {
        this.totalRecords = page.totalElements;
        this.listFranchises = page.content;
        if (!this.filterName.value) {
          this.totalFranchises = this.totalRecords;
        }
      });
    }


  /**
   * Search by key Enter
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchFranchises();
    }
  }

  /**
   * Search for sociétes by name
   */
  public searchFranchises() {
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListFranchises();
    this.numberElementPerPage = this.paginationArgs.pageSize;
  }
      /**
   * Navigate to restaurant creation component page
   * @param: uuidFranchise
   */
  public navigateToRestaurantCreation(uuidFranchise: string): void {
        this.router.navigateByUrl(`admin/societe/${uuidFranchise + ' fra'}/add-restaurant`);
      }

  /**
   * Navigate to gestion parc page
   */
  public getGestionParcPage(uuidFranchise: string): void {
    this.sessionService.setUuidFranchisee(uuidFranchise);
    this.router.navigateByUrl(`/parc/List/restaurantList/${uuidFranchise}`);
  }

  /**
   * Display details of selected franchise
   * @param: id
   */
  public showDetails(event: any, franchise: FranchiseModel) {
    if (this.updateControl()) {
      if (event.target.tagName !== 'IMG') {
        this.router.navigateByUrl(`admin/franchise/all/${franchise.uuid}`);
      }
    }
  }

  /**
   *permet de ouvrir le pop up de modification
   * @param: event
   */
  public async showFranchiseDetails(event: any, franchise: FranchiseModel) {
    this.selectedFranchise = {...franchise};
    this.showAddFranchisePopupTitle = this.rhisTranslateService.translate('FRANCHISE.UPDATE');
    this.buttonLabel = this.rhisTranslateService.translate('FRANCHISE.UPDATE');
    this.showAddFranchisePopup = true;
  }

  /**
   * Get first 10 restaurant name for franchise with idFranchise
   * @param: idFranchise
   */
  public getRestaurantName(franchise: FranchiseModel): void {
    this.restaurantsNames = [];
    this.selectedFranchiseForRestaurantsPopUp = franchise.uuid;
    if(franchise.restaurants.length){
      franchise.restaurants.forEach((resto : RestaurantModel)=> this.restaurantsNames.push(resto.libelle));
    }
  }
  /**
   * Show confirmation Popup for delete
   * @param: id
   */
   public showConfirmDelete(uuid: string): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.delete(uuid);
      },
      reject: () => {
      }
    });
  }
   /**
   * Delete franchise by uuid
   * @param: id
   */
    private delete(uuid: string) {
      this.notificationService.startLoader();
      this.franchiseService.deleteFranchise(uuid).subscribe(result => {
        this.getListFranchises();
        this.notificationService.stopLoader();
        this.notificationService.showSuccessMessage('FRANCHISE.DELETED_MSG');
      }, error=>{
        this.notificationService.stopLoader();
      });
    }
  /**
   * Sort franchise List by name
   * @param: event
   */
   public sortRows(event) {
    this.field = event.field ? event.field : this.field;
    this.field = this.field === 'numTel' ? 'numTelephone' : this.field;
    this.order = event.order ? event.order : this.order;
    this.getListFranchises();
  }

  public closePopup() {
    this.showAddFranchisePopup = false;
  }

  /**
   * permet d'afficher le popo up d'ajout d'un Franchise
   */
  public showAddPopup() {
    this.selectedFranchise = new FranchiseModel();
    this.buttonLabel = this.rhisTranslateService.translate('FRANCHISE.ADD_FRANCHISE');
    this.showAddFranchisePopup = true;
    this.showAddFranchisePopupTitle = this.rhisTranslateService.translate('FRANCHISE.ADD_FRANCHISE');
  }

  /**
   * permet de modifier ou ajouter un utilisateur global
   */
  public addOrUpdateFranchise(form: Object): void {
    const franchise = new FranchiseModel();
    franchise.nom = form['nom'];
    franchise.adresse = form['adresse'];
    franchise.numTelephone = form['numTelephone'];
    franchise.codePostal = form['codePostal'];
    franchise.ville = form['ville'];

    if (this.buttonLabel === this.rhisTranslateService.translate('FRANCHISE.ADD_FRANCHISE')) {
      this.franchiseService.addFranchise(franchise).subscribe(data => {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('FRANCHISE.ADDED'));
        this.showAddFranchisePopup = false;
        this.getListFranchises();
      }, err => {
        if (err.status === 406) {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('FRANCHISE.EXIST'));
        }
        console.log(err);
      });
    } else {
      franchise.idFranchise = this.selectedFranchise.idFranchise;
      franchise.uuid = this.selectedFranchise.uuid;
      this.franchiseService.updateFranchise(franchise).subscribe(data => {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('FRANCHISE.UPDATE'));
        this.showAddFranchisePopup = false;
        this.getListFranchises();
      }, err => {
        if (err.status === 406) {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('FRANCHISE.EXIST'));
        }
        console.log(err);
      });
    }
  }

}
