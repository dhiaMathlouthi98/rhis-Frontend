import {Component, HostListener, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {PaginationArgs, PaginationPage} from 'src/app/shared/model/pagination.args';
import {ParametreRapport} from 'src/app/shared/model/parametreRapport';
import {DomControlService} from 'src/app/shared/service/dom-control.service';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {SessionService} from 'src/app/shared/service/session.service';
import {SharedRestaurantListService} from 'src/app/shared/service/shared-restaurant-list.service';
import {EnvoiService} from '../../services/envoi.service';

@Component({
  selector: 'rhis-gestion-parametre-envoi',
  templateUrl: './gestion-parametre-envoi.component.html',
  styleUrls: ['./gestion-parametre-envoi.component.scss']
})
export class GestionParametreEnvoiComponent implements OnInit {
  public ecran = '';
  public header: { title: string, field: string }[];
  public listEnvois: ParametreRapport[];
  public first = 0;
  public row = 10;
  public totalRecords: number;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public filterName = new FormControl('');
  public uuidRapport: string;
  public pageTitle = '';
  public listRestoUuids: any[];
  public isShownReceiver = false;
  public selectedEnvoiUuid: string;
  public heightInterface: any;
  private order = 1;

  constructor(private domService: DomControlService,
              private rhisTranslateService: RhisTranslateService,
              private envoiParamService: EnvoiService,
              private confirmationService: ConfirmationService,
              private activatedRoute: ActivatedRoute,
              private sharedRestoService: SharedRestaurantListService,
              private router: Router,
              private sessionService: SessionService,
              private notificationService: NotificationService) {
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidRapport) {
        this.uuidRapport = params.uuidRapport;
      }
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.libelle) {
        if (params.codeName === 'PILOTAGE_RESUME_PLANNING_RAPPORT') {
          this.pageTitle = 'Rapports Résumé planning';
        } else if (params.codeName === 'POSTES_TRAVAIL_RAPPORT') {
          this.pageTitle = this.rhisTranslateService.translate('POPUP_RAPPORT.RAPPORT_PLANNING_POSTE_TRAVAIL');
        } else {
          this.pageTitle = 'Rapports Analyse Performance';
        }
      }
    });
  }

  ngOnInit() {
    // this.domService.detailsControl(this.sous_ecran);
    this.initializeHeader();
    this.getListRestaurant();

  }

  public deleteButtonControl(): boolean {
    return this.domService.deleteListControl(this.ecran);
  }

  public detailsControl(): boolean {
    return this.domService.detailsControl(this.ecran);
  }

  private getListRestaurant(): void {
    this.sharedRestoService.getListRestaurant().then(result => {
      this.listRestoUuids = [];
      result.forEach((val: any) => this.listRestoUuids.push(val.uuid));
      this.getListEnvoi();
    });
  }

  /**
   * Create restaurants table header
   */
  private initializeHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.CREATEUR'), field: 'createur'},
      {title: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.DESTINATAIRES'), field: 'receiver'},
      {title: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.FREQUENCE_EXP'), field: 'frequence'},
      {title: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.EMAIL_NAME'), field: 'mail_object'},
    ];
  }

  /**
   * Fetch page
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListEnvoi();
  }

  /**
   * Get restaurants by societe ,user and page
   */
  private getListEnvoi() {
    const filter = {
      filterName: this.filterName.value,
      order: this.order
    };

    this.envoiParamService.getListEnvois(this.uuidRapport, this.paginationArgs, this.listRestoUuids, filter)
      .subscribe((result: PaginationPage<ParametreRapport>) => {
        this.totalRecords = result.totalElements;
        this.listEnvois = result.content;
        this.listEnvois.forEach((envoi: ParametreRapport) => {
          if (envoi.uuidCreateur === this.sessionService.getUuidUser()) {
            envoi.lastNameFirstNameCreateur = 'Moi';
          }
        });
      });

  }

  private sortListEnvoi(): void {
    this.listEnvois.sort((envoi1: any, envoi2: any) => {
      if (envoi1.objectMail.toLowerCase() > envoi2.objectMail.toLowerCase()) {
        return 1;
      } else if (envoi1.objectMail.toLowerCase() < envoi2.objectMail.toLowerCase()) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  public showDestinataires(selectedEnvoiUuid: string): void {
    this.selectedEnvoiUuid = selectedEnvoiUuid;
    this.isShownReceiver = true;
  }

  public goToParamEnvoi(selectedEnvoi: ParametreRapport): void {
    this.router.navigate(['/parc/list-rapport/display-rapport-parc/generation-rapport-parc'], {
      queryParams: {
        libelle: selectedEnvoi.rapport.libelleFile,
        uuid: selectedEnvoi.rapport.uuid,
        idRapport: selectedEnvoi.rapport.idRapport,
        codeName: selectedEnvoi.rapport.codeName,
        envoi: JSON.stringify(selectedEnvoi)
      }
    });
  }

  /**
   * Search by key Enter
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchEnvois();
    }
  }

  /**
   * Search for envois by createur
   */
  public searchEnvois() {
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListEnvoi();
  }

  /**
   * Sort envoi list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {

    this.listEnvois.sort((row1, row2) => {
      let val1: any;
      let val2: any;
      let result: any;
      if (event.field === 'frequence') {
        this.order = event.order;
        this.getListEnvoi();

      } else if (event.field === 'mail_object') {
        val1 = row1['objectMail'];
        val2 = row2['objectMail'];
        result = val2.localeCompare(val1);
      } else {
        val1 = row1['lastNameFirstNameCreateur'];
        val2 = row2['lastNameFirstNameCreateur'];
        if (val1 === 'Moi' && val2 === 'Moi') {
          result = 0;
        } else if (val1 === 'Moi') {
          result = -1;
        } else if (val2 === 'Moi') {
          result = 1;
        } else {
          result = val1.localeCompare(val2);
        }
      }
      return result * event.order;
    });

  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDelete(uuidEnvoi: string, objectMail: string): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.DELETE_MESSAGE') + ' ' + objectMail + '?',
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.removeEnvoi(uuidEnvoi);
      },
      reject: () => {
      }
    });
  }

  public closeTooltip(): void {
    this.isShownReceiver = false;
  }

  private removeEnvoi(uuidEnvoi: string): void {
    this.envoiParamService.deleteEnvoi(uuidEnvoi).subscribe((result: any) => {
        this.getListEnvoi();
        this.notificationService.showSuccessMessage('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.DELETED_ENVOI');
      },
      error => {
        console.log(error);
      });
  }
}
