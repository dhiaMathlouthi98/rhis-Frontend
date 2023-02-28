import {Component, HostListener, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {SharedEmployeeService} from '../../../../home/employes/service/sharedEmployee.service';
import {Router} from '@angular/router';
import {MotifSortieService} from '../../../../home/configuration/service/motifSortie.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {GenerateFilesService} from '../../../../../shared/service/generate.files.service';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {UtilisateurService} from '../../../utilisateur/service/utilisateur.service';
import {AffectationService} from '../../../utilisateur/service/affectation.service';
import {ProfilService} from '../../service/profil.service';
import {FormControl} from '@angular/forms';
import {PaginationArgs, PaginationPage} from '../../../../../shared/model/pagination.args';
import {MyRhisUserModel} from '../../../../../shared/model/MyRhisUser.model';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {Subject} from 'rxjs';
import {RestaurantNameService} from '../../../../../shared/service/restaurant-name.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {SessionService} from '../../../../../shared/service/session.service';

@Component({
  selector: 'rhis-list-profil-global',
  templateUrl: './list-profil-global.component.html',
  styleUrls: ['./list-profil-global.component.scss']
})

export class ListProfilGlobalComponent implements OnInit {

  public header;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public motifSortieHeader: string;
  public filterName;
  public nbreProfil: number;
  public first = 0;
  public row = 10;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 4};
  public recherche = false;
  public listProfilGlobal: ProfilModel[];
  public showAddUpdateUserPopup = false;
  public totalRecords: number;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  private ecran = 'GDF';
  public profilLibelle: string;
  public heightInterface: any;
  public searchParProfil: string;


  constructor(private rhisTranslateService: RhisTranslateService,
              private sharedEmployeeService: SharedEmployeeService,
              private router: Router,
              private motifSortieService: MotifSortieService,
              private notificationService: NotificationService,
              private generateFilesService: GenerateFilesService,
              private confirmationService: ConfirmationService,
              private userService: UtilisateurService,
              private affectationService: AffectationService,
              private profilService: ProfilService,
              private restaurantNameService: RestaurantNameService,
              private domControlService: DomControlService,
              private sessionService: SessionService) {
    this.restaurantNameService.changeNameRestaurant('');
    this.sessionService.setUuidFranchisee('');
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.filterName = new FormControl('');
    this.header = [
      {title: this.rhisTranslateService.translate('PROFIL.NOM'), field: 'nom'},
      {title: this.rhisTranslateService.translate('PROFIL.SOCIETES_GLOBAL'), field: 'societe'},
      {title: this.rhisTranslateService.translate('PROFIL.RESTAURANT'), field: 'restaurant'},
      {title: '', field: 'delete'},
    ];
    this.searchParProfil = this.rhisTranslateService.translate('USER.SEARCH_PLACEHOLDER');
    this.rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
    this.motifSortieHeader = this.rhisTranslateService.translate('POPUPS.CONFIRMATION_HEADER');
    this.row = 10;
    this.paginationArgs = {pageNumber: 0, pageSize: this.row};
    this.getListProfilGlobal();
     this.getProfilById();
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListProfilGlobal();
  }

  public showAddPopup() {
    this.router.navigateByUrl('/admin/profil/all/add');
  }

  private getListProfilGlobal() {
    this.profilService.getAllWithPaginationAndFilter(this.paginationArgs, {filterName: this.filterName.value}).subscribe(
      (data: PaginationPage<ProfilModel>) => {
        this.listProfilGlobal = data.content;
        this.totalRecords = data.totalElements;
        this.nbreProfil = data.totalElements;
      });
  }

  /**
   * Search by key Enter
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchProfil();
    }
  }

  public searchProfil() {
    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListProfilGlobal();
  }

  /**
   * Sort societe list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {
    this.listProfilGlobal.sort((row1, row2) => {
      const val1 = row1[event.field];
      const val2 = row2[event.field];
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
  }


  public showConfirmDelete(user: MyRhisUserModel, event) {
    this.showAddUpdateUserPopup = false;
    this.showAddUpdateUserPopup = false;
    event.stopPropagation();
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        // this.deleteUser(user);
      },
      reject: () => {
      }
    });
  }

  public deletProfil(profil: ProfilModel) {
    let etat: boolean;
    this.affectationService.isAffected(profil.uuid).subscribe(data => {
      etat = data;
      if (etat === true) {
        this.confirmationService.confirm({
          message: this.rhisTranslateService.translate('PROFIL.DELETE_PROFIL_GLOBAL'),
          header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
          acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: () => {
            this.profilService.deleteProfilGlobal(profil.uuid).subscribe(a => {
              this.listProfilGlobal.splice(this.listProfilGlobal.indexOf(profil), 1);
              this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.DELETED'));
            });
          },
          reject: () => {
          }
        });
      } else {
        this.profilService.deleteProfilGlobal(profil.uuid).subscribe(a => {
          this.listProfilGlobal.splice(this.listProfilGlobal.indexOf(profil), 1);
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.DELETED'));
          this.getListProfilGlobal();
        });
      }
    });
  }

  public showUpdate(profil: ProfilModel, event): void {
    this.router.navigateByUrl('/admin/profil/all/' + profil.uuid + '/update');
    event.stopPropagation();
  }

  public getProfilById(): void {
    this.profilService.getProfilByid(this.sessionService.getUuidProfil()).subscribe((profil: ProfilModel) => {
      this.profilLibelle = profil.libelle;
    });
  }
}
