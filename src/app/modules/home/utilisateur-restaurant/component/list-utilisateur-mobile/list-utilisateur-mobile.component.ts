import {Component, OnInit} from '@angular/core';
import {MyRhisUserModel} from '../../../../../shared/model/MyRhisUser.model';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {SocieteModel} from '../../../../../shared/model/societe.model';
import {AffectationModel} from '../../../../../shared/model/affectation.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {UtilisateurRestaurantService} from '../../service/utilisateur-restaurant.service';
import {AffectationRestaurantService} from '../../service/affectation-restaurant.service';
import {ProfilService} from '../../../../admin/profils/service/profil.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {EmployeeService} from '../../../employes/service/employee.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {UtilisateurService} from '../../../../admin/utilisateur/service/utilisateur.service';

@Component({
  selector: 'rhis-list-utilisateur-mobile',
  templateUrl: './list-utilisateur-mobile.component.html',
  styleUrls: ['./list-utilisateur-mobile.component.scss']
})
export class ListUtilisateurMobileComponent implements OnInit {
  public ListUtilisteurs: MyRhisUserModel[] = [];
  /** la liste des emplyés non associé */
  public ListNotAssocietedEmployes: EmployeeModel[] = [];

  /** liste des utilisateurs mobile*/
  public ListActifUsers: MyRhisUserModel[] = [];

  public listProfil: ProfilModel[] = [];
  public profilDefault: ProfilModel;
  public restaurant: RestaurantModel = new RestaurantModel();
  public societe: SocieteModel = new SocieteModel();
  public affectation: AffectationModel = {};
  private userToSave: MyRhisUserModel = new MyRhisUserModel();
  public idUser: number;
  public showAddUpdateUserPopup = false;
  public header = ['NOM', 'PRENOM', 'MAIL', 'PROFIL', 'EMPTY'];
  private ecran = 'UTM';
  public heightInterface: any;
  public showPasswordPopUp = false;
  public passwordPopUp: string;
  public password: String;


  constructor(private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private utilisateurService: UtilisateurRestaurantService,
              private userService: UtilisateurService,
              private affecationSerbice: AffectationRestaurantService,
              private profilService: ProfilService,
              private sessionService: SessionService,
              private employeService: EmployeeService,
              private domControlService: DomControlService
  ) {
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

  ngOnInit() {
    this.getMobileUsersByRestaurant();
  }

  /**
   * permet d'affiche le pop up de confirmation de suppression d'un utilisateur mobile
   * @param user
   * @param event
   */
  public showConfirmDelete(user: MyRhisUserModel, event) {
    this.showAddUpdateUserPopup = false;
    event.stopPropagation();
    this.idUser = user.idUser;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('EMPLOYEE.DELETE_MAIL_MOBILE_BODY'),
      header: this.rhisTranslateService.translate('EMPLOYEE.DELETE_MAIL_HEAD'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteUser(user);
      },
      reject: () => {
      }
    });
  }

  /**
   * permet de supprimer un utilisateur
   * @param user
   */
  private deleteUser(user: MyRhisUserModel): void {
    user.affectations[0].profil = this.profilDefault;
    this.utilisateurService.deleteUser(user.uuid).subscribe(() => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.DELETED'));
      this.getMobileUsersByRestaurant();
    }, (err: any) => {
      console.log(err);
    });
  }

  /**
   * Cette methode permet de recuperer la liste des utilisateurs mobile par restaurant
   */
  public getMobileUsersByRestaurant(): void {
    this.ListUtilisteurs = [];
    this.utilisateurService.getUsersMobileByRestaurant().subscribe(
      (data: MyRhisUserModel[]) => {
        this.ListActifUsers = data;
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * permet de modifier le mot de passe d'un utilisateur
   * @param user
   */
  public generatePassword(user: MyRhisUserModel): void {
    this.passwordPopUp = this.rhisTranslateService.translate('USER.PASSWORD');
    this.userService.generatePassword(user.email).subscribe((pass: string) => {
      this.showPasswordPopUp = true;
      this.password = pass;
    });
  }

  /**
   * permet de fermer le popup de generation mot de passe
   */
  public closePopupPassword(): void {
    this.showPasswordPopUp = false;
  }

  /**
   * permet de verifier si l'tulisateur actuel est un superviseur ou non
   */
  public isSupervisor(): boolean {
    return this.sessionService.getProfil() === 'superviseur';
  }
}
