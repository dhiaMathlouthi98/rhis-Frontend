import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {PaginationArgs, PaginationPage} from '../../../../model/pagination.args';
import {FormControl} from '@angular/forms';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {Router} from '@angular/router';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {NotificationService} from '../../../../service/notification.service';
import {SocieteService} from '../../service/societe.service';
import {SocieteModel} from '../../../../model/societe.model';
import {RestaurantService} from '../../../../service/restaurant.service';
import {SessionService} from '../../../../service/session.service';
import {RhisRoutingService} from '../../../../service/rhis.routing.service';
import {RestaurantNameService} from '../../../../service/restaurant-name.service';
import {DomControlService} from '../../../../service/dom-control.service';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'rhis-list-societes',
  templateUrl: './list-societes.component.html',
  styleUrls: ['./list-societes.component.scss']
})

export class ListSocietesComponent implements OnInit {
  public header: { title: string, field: string }[];
  public listSocietes: SocieteModel[];
  public first = 0;
  public row = 10;
  public totalRecords: number;
  public nbrSocietes: number;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public profil = localStorage.getItem('profil');
  public filterName = new FormControl('');
  private selectedSocieteForRestaurantsPopUp: number;
  public restaurantsNames: string[];
  public numberElementPerPage = 10;

  public heightInterface: any;
  private ecran = 'LDS';
  private sous_ecran = 'LDR';

  constructor(private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private societeService: SocieteService,
              private restaurantService: RestaurantService,
              private sessionService: SessionService,
              public rhisRouter: RhisRoutingService,
              private restaurantNameService: RestaurantNameService,
              private domControlService: DomControlService,
              @Inject(DOCUMENT) private document: any) {
    this.sessionService.setRestaurant(0);
    this.sessionService.setRestaurantName('');
    this.sessionService.setUuidFranchisee('');
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.domControlService.detailsControl(this.ecran);
    this.initializeHeader();
    this.getListSocietes();
    this.restaurantNameService.setListGuiAlarme([]);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public detailsControl(): boolean {
    return this.domControlService.detailsControl(this.sous_ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   * Create societe table header
   */
  private initializeHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('SOCIETE.NAME'), field: 'societeName'},
      {title: this.rhisTranslateService.translate('SOCIETE.FRANCHISE'), field: 'franchise'},
      {title: this.rhisTranslateService.translate('SOCIETE.PHONE'), field: 'typeRestaurant'}];
  }

  /**
   * Fetch a specific sociétes page
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListSocietes();
    this.numberElementPerPage = this.paginationArgs.pageSize;
  }

  /**totalRecords
   * Get societes by page
   */
  private getListSocietes() {
    this.societeService.getAllWithPaginationAndFilter(this.paginationArgs,
      {filterName: this.filterName.value}).subscribe((societePage: PaginationPage<SocieteModel>) => {
      this.totalRecords = societePage.totalElements;
      this.listSocietes = societePage.content;
      if (!this.filterName.value) {
        this.nbrSocietes = this.totalRecords;
      }
    });
  }

  /**
   * Search by key Enter
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchSocietes();
    }
  }

  /**
   * Search for sociétes by name
   */
  public searchSocietes() {
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListSocietes();
    this.numberElementPerPage = this.paginationArgs.pageSize;
  }

  /**
   * Navigate to restaurant creation component page
   * @param: idSociete
   */
  public navigateToRestaurantCreation(uuidSociete: string): void {
    this.router.navigateByUrl(`admin/societe/${uuidSociete}/add-restaurant`);
  }

  /**
   * Sort societe list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {
    this.listSocietes.sort((row1, row2) => {
      const val1 = row1[event.field];
      const val2 = row2[event.field];
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
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
   * Delete a societe by id
   * @param: id
   */
  private delete(uuid: string) {
    this.societeService.remove(uuid).subscribe(rees => {
      this.getListSocietes();
      this.notificationService.showSuccessMessage('SOCIETE.DELETED');
    });
  }

  /**
   * Show Details of dedicated societe
   * @param: id
   */
  public showDetails(event, societe: SocieteModel) {
    if (this.updateControl()) {
      this.sessionService.setSociete(societe.idSociete);
      this.sessionService.setSocieteName(societe.societeName);
      this.sessionService.setUuidSociete(societe.uuid);
      if (event.target.tagName !== 'IMG') {
        this.router.navigateByUrl(`admin/societe/all/${societe.uuid}`);
      }
    }
  }

  /**
   * Get first 10 restaurant name for societe with idSociete
   * @param: idSociete
   */
  public getRestaurantName(societe: SocieteModel): void {
    this.selectedSocieteForRestaurantsPopUp = societe.idSociete;
    this.sessionService.setUuidSociete(societe.uuid);
    this.restaurantService.getLimitedRestaurantBySocieteId(societe.uuid, 10).subscribe((restaurantsNames: string[]) => {
      this.restaurantsNames = restaurantsNames;
    });
  }

}
