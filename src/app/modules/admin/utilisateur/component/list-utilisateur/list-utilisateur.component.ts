import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {SharedEmployeeService} from '../../../../home/employes/service/sharedEmployee.service';
import {Router} from '@angular/router';
import {GenerateFilesService} from '../../../../../shared/service/generate.files.service';
import {MotifSortieService} from '../../../../home/configuration/service/motifSortie.service';
import {EmployeeService} from '../../../../home/employes/service/employee.service';
import {ConfirmationService, LazyLoadEvent, SortEvent} from 'primeng/api';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {FormControl} from '@angular/forms';
import {PaginationArgs} from '../../../../../shared/model/pagination.args';
import {UtilisateurService} from '../../service/utilisateur.service';
import {MyRhisUserModel} from '../../../../../shared/model/MyRhisUser.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {UtilisateurAffectation} from '../../../../../shared/model/utilisateur-affectation.model';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {ProfilService} from '../../../profils/service/profil.service';
import {AffectationService} from '../../service/affectation.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {SuppressionUtilisateurComponent} from './suppression-utilisateur/suppression-utilisateur.component';
import {RestaurantNameService} from '../../../../../shared/service/restaurant-name.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-list-utilisateur',
  templateUrl: './list-utilisateur.component.html',
  styleUrls: ['./list-utilisateur.component.scss']
})
export class ListUtilisateurComponent implements OnInit {
  public listProfil: ProfilModel[] = [];
  public password: String;
  public showAddUserPopup = false;
  public showAddUserPopupTitle: string;
  public header;
  public nbreUtilisateur: number;
  public motifSortieHeader: string;
  public filterName;
  public first = 0;
  public row = 10;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 4};
  public recherche = false;
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public mailExistatnt = false;
  public listUtilisateurs: MyRhisUserModel[];
  public listUtilisateursFinal: UtilisateurAffectation[] = [];
  public userFinal: UtilisateurAffectation;
  public suppressionConfirm: string;
  public showDeletePopUp = false;
  public showPasswordPopUp = false;
  public passwordPopUp: string;
  public userToDelete: UtilisateurAffectation = {};
  @ViewChild(SuppressionUtilisateurComponent)
  private suppression: SuppressionUtilisateurComponent;
  public selectedUser: any;
  public selectedProfil: ProfilModel;
  public buttonLabel: string;
  private ecran = 'ELU';
  public heightInterface: any;
  public searchEmail: string;

  constructor(private sharedEmployeeService: SharedEmployeeService,
              private employeeService: EmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private motifSortieService: MotifSortieService,
              private notificationService: NotificationService,
              private generateFilesService: GenerateFilesService,
              private confirmationService: ConfirmationService,
              private userService: UtilisateurService,
              private affectationService: AffectationService,
              private profilService: ProfilService,
              private sessionService: SessionService,
              private restaurantNameService: RestaurantNameService,
              private domControlService: DomControlService) {
    this.restaurantNameService.changeNameRestaurant('');
    this.sessionService.setUuidFranchisee('');
  }

  ngOnInit() {
    this.domControlService.addControl(this.ecran);
    this.header = [
      {title: this.rhisTranslateService.translate('USER.NOM'), field: 'nom'},
      {title: this.rhisTranslateService.translate('USER.PRENOM'), field: 'prenom'},
      {title: this.rhisTranslateService.translate('USER.MAIL'), field: 'email'},
      {title: this.rhisTranslateService.translate('USER.PROFIL'), field: 'profil'},
      {title: this.rhisTranslateService.translate('USER.RESTAURANT'), field: 'restaurant'},
      {title: this.rhisTranslateService.translate('USER.SOCIETE'), field: 'societe'},
      {title: '', field: 'delete'},
    ];
    this.searchEmail = this.rhisTranslateService.translate('USER.SEARCH_PLACEHOLDER');
    this.rowsPerPageOptions = [1, 5, 10, 15, 20, 25];

    this.motifSortieHeader = this.rhisTranslateService.translate('POPUPS.CONFIRMATION_HEADER');
    this.filterName = new FormControl('');
    /** pour recuperer la premiere page pour afficher list des employees **/
    this.row = 10;
    this.paginationArgs = {pageNumber: 0, pageSize: this.row};
    this.getListUtilisateur();
    this.getListProfilGlobal();
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public addCOntroll(): boolean {
    return this.domControlService.addControl(this.ecran);
  }

  /**
   * Permet de faire un appel WS pour recuperer la liste des tous les utilisateurs
   */
  private getListUtilisateur() {
    this.userService.getAllWithPaginationAndFilter(this.paginationArgs, {filterName: this.filterName.value}).subscribe(
      (data: any) => {
        this.listUtilisateurs = data.content;
        this.nbreUtilisateur = data.totalElements;
        this.listUtilisateursFinal = [];
        /** Parcourir la liste des utilisateurs pour creer une nouvelle liste du model userAffectation **/
        for (const entry of this.listUtilisateurs) {
          this.userFinal = {};
          this.userFinal.restaurant = [];
          this.userFinal.societe = [];
          this.userFinal.nom = entry.nom;
          this.userFinal.prenom = entry.prenom;
          this.userFinal.id = entry.idUser;
          this.userFinal.email = entry.email;
          this.userFinal.pseudo = entry.pseudo;
          this.userFinal.profil = entry.affectations[0].profil.libelle;
          this.userFinal.uuid = entry.uuid;
          this.userFinal.langue = entry.langue;
          /** Si c'est un employee **/
          if (entry.affectations.length === 1 && entry.affectations[0].societe != null && entry.affectations[0].restaurant != null) {
            this.createEmploye(entry);

          } else if (entry.affectations[0].societe === null && entry.affectations[0].restaurant === null) {
            this.createSuperviseur();
            /** Si c'est un administrateur **/
          } else if (entry.affectations.length >= 1) {
            if (entry.affectations[0].restaurant != null) {
              this.createAdministrateur(entry);
            }
            /** Si c'est un franchise **/
            if (entry.affectations[0].societe != null) {
              this.createFranchise(entry);
            }
          }
          this.listUtilisateursFinal.push(this.userFinal);
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  public isCurrent(user: MyRhisUserModel): boolean {
    return user.email === this.sessionService.getEmail();
  }

  public closePopupPassword() {
    this.showPasswordPopUp = false;
  }

  /** affecter liste vide pour societe et restaurant */
  private createSuperviseur() {
    this.userFinal.societe = [];
    this.userFinal.restaurant = [];
  }

  /** affecter la societe et le restaurant */
  private createEmploye(user: MyRhisUserModel) {
    this.userFinal.societe.push(user.affectations[0].societe);
    this.userFinal.restaurant.push(user.affectations[0].restaurant);
  }

  /** affecter liste des societes  */
  private createFranchise(user: MyRhisUserModel) {
    this.userFinal.societe = [];
    for (const affectation of user.affectations) {
      this.userFinal.societe.push(affectation.societe);
    }
  }

  /** affecter liste des restaurants  */
  private createAdministrateur(user: MyRhisUserModel) {
    for (const affectation of user.affectations) {
      this.userFinal.restaurant.push(affectation.restaurant);
    }
  }

  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListUtilisateur();
  }

  public showConfirmDelete(user: UtilisateurAffectation) {
    this.suppression.password = null;
    this.suppression.isVerifierd = false;
    this.suppression.passwordVerifier = false;
    this.suppressionConfirm = this.rhisTranslateService.translate('USER.VALIDATE_DELETE');
    this.showDeletePopUp = true;
    this.userToDelete = user;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchUilisateur();
    }
  }

  /**
   * recherche selon le email
   */
  public searchUilisateur() {
    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListUtilisateur();
  }

  public closePopupDelete() {
    this.showDeletePopUp = false;
  }

  /**
   * Sort utilisateur list rows
   * @param: event
   */
  public sortRows(event: SortEvent) {
    this.listUtilisateursFinal.sort((row1, row2) => {
      const val1 = row1[event.field];
      const val2 = row2[event.field];
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
  }


  /**
   *permet de ouvrir le pop up de modification
   * @param: event
   */
  public async showUserDetails(user: any) {
    this.selectedProfil = await this.listProfil.find(profil => profil.libelle === user.profil);
    this.selectedUser = {...user};
    this.showAddUserPopupTitle = this.rhisTranslateService.translate('USER.UPDATE_USER');
    this.buttonLabel = this.rhisTranslateService.translate('USER.UPDATE_USER');
    this.showAddUserPopup = true;
  }

  public downloadUtilisateurList() {
  }

  public closePopup() {
    this.showAddUserPopup = false;
  }

  /**
   * permet d'afficher le popo up d'ajout d'utilisateur
   */
  public showAddPopup() {
    this.selectedUser = {} as any;
    this.selectedProfil = {} as ProfilModel;
    this.buttonLabel = this.rhisTranslateService.translate('USER.ADD_USER');
    this.showAddUserPopup = true;
    this.showAddUserPopupTitle = this.rhisTranslateService.translate('USER.ADD_USER');
  }

  public getListProfilGlobal() {
    this.profilService.getGlobalProfils().subscribe(data => {
      this.listProfil = data;
    });
  }

  /**
   * permet de modifier ou ajouter un utilisateur global
   */
  public addOrUpdateUser(form: Object): void {
    const user: MyRhisUserModel = {};
    user.nom = form['nom'];
    user.prenom = form['prenom'];
    user.pseudo = form['pseudo'];
    user.email = form['email'];
    user.langue = form['langue'].value ? form['langue'].value.toUpperCase() : form['langue'].toUpperCase();
    if (this.buttonLabel === this.rhisTranslateService.translate('USER.ADD_USER')) {
      this.affectationService.addAffectation(user, form['profil'].uuid).subscribe(data => {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.ADDED'));
        this.showAddUserPopup = false;
        this.getListUtilisateur();
      }, err => {
        if (err.status === 406) {
          console.log(err);
        }
      });
    } else {
      user.idUser = this.selectedUser.id;
      this.affectationService.updateAffectation(user, form['profil'].uuid).subscribe(data => {
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.UPDATED'));
        this.showAddUserPopup = false;
        this.getListUtilisateur();
      }, err => {
        if (err.status !== 406) {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('USER.NOT_UPDATED'));
        }
        console.log(err);
      });
    }
  }

  /**
   * verifier le mot de passe d'un utilisateur-restaurant
   *  password
   */
  public verifyUserPassword(password: string): any {
    this.suppression.password = null;
    const user: MyRhisUserModel = {};
    user.email = this.sessionService.getEmail();
    user.password = password;
    this.userService.verifyUser(user).subscribe(async state => {
        if (state === true) {
          this.showDeletePopUp = false;
          const profil = this.getProfilType();
          if (profil === 'superviseur') {
            if (await this.isLastSuperviseur()) {
              this.notificationService.showErrorMessage(this.rhisTranslateService.translate('USER.LAST_SUPER'));
            } else {
              this.confirmationService.confirm({
                message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
                header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
                acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
                rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
                icon: 'pi pi-info-circle',
                accept: () => {
                  this.deleteUser(this.userToDelete.uuid);
                },
                reject: () => {
                }
              });
            }
          } else if (profil === 'franchisé') {
            const listSociete = this.getListSociete(this.userToDelete);
            this.confirmationService.confirm({
              message: 'Le franchisé est associé au(x) société(s) ' + '\'' + listSociete + '\'' +
                ' N\'oubliez pas de choisir un nouveau franchisé pour ces sociétés.',
              header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
              acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
              rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
              icon: 'pi pi-info-circle',
              accept: () => {
                this.deleteUser(this.userToDelete.uuid);
              },
              reject: () => {
              }
            });
          } else {
            this.confirmationService.confirm({
              message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
              header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
              acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
              rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
              icon: 'pi pi-info-circle',
              accept: () => {
                this.deleteUser(this.userToDelete.uuid);
              },
              reject: () => {
              }
            });
          }
        } else {
        }
      },
      error => {
      });
  }

  /**
   * retourner le type de profil
   * email
   */
  private getProfilType(): string {
    const userFound = this.userToDelete;
    if (userFound.societe.length === 0 && userFound.restaurant.length === 0) {
      return 'superviseur';
    } else if (userFound.societe.length === 0 && userFound.restaurant.length === 0) {
      return 'employee';
    } else if (userFound.societe.length > 0 && userFound.restaurant.length === 0) {
      return 'franchisé';
    } else if (userFound.restaurant.length > 0 && userFound.societe.length === 0) {
      return 'administrateur';
    }
  }

  /**
   * verifier si c'est le dernier superviseur avant la supression
   */
  private isLastSuperviseur(): Promise<boolean> {
    return this.affectationService.isLastSupervisor().toPromise();
  }

  /**
   * supprimer un utilisateur-restaurant
   *  idUser
   */
  private deleteUser(uuidUser: string) {
    this.userService.deleteUser(uuidUser).subscribe(deleted => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.DELETED'));
      this.listUtilisateursFinal.splice(this.listUtilisateursFinal.findIndex(i => i.uuid === uuidUser), 1);
      --this.nbreUtilisateur;
      if (this.listUtilisateursFinal.length === 0) {
        location.reload();
      }
    });
  }

  /**
   * afficher la liste des societes dans une chaine
   *  user
   */
  private getListSociete(user: UtilisateurAffectation): string {
    let listSociete = '';
    user.societe.forEach(societe => {
      listSociete = listSociete + societe.societeName;
    });
    return listSociete;
  }

  public generatePassword(user: MyRhisUserModel) {
    this.userService.generatePassword(user.email).subscribe((pass: string) => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('LOGIN.CODE_RESET_MSG'));
    });
  }
}
