import {Component, OnInit, ViewChild} from '@angular/core';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {MyRhisUserModel} from '../../../../../shared/model/MyRhisUser.model';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {AffectationModel} from '../../../../../shared/model/affectation.model';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {SocieteModel} from '../../../../../shared/model/societe.model';
import {ProfilService} from '../../../../admin/profils/service/profil.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {UtilisateurRestaurantService} from '../../service/utilisateur-restaurant.service';
import {AffectationRestaurantService} from '../../service/affectation-restaurant.service';
import {EmployeeService} from '../../../employes/service/employee.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {UtilisateurService} from '../../../../admin/utilisateur/service/utilisateur.service';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {ListUtilisateurMobileComponent} from '../list-utilisateur-mobile/list-utilisateur-mobile.component';

@Component({
  selector: 'rhis-list-utilisateur-restaurant',
  templateUrl: './list-utilisateur-restaurant.component.html',
  styleUrls: ['./list-utilisateur-restaurant.component.scss']
})
export class ListUtilisateurRestaurantComponent implements OnInit {
  public ListUtilisteurs: MyRhisUserModel[] = [];
  /** la liste des emplyés non associé */
  public ListNotAssocietedEmployes: EmployeeModel[] = [];

  /** liste des utilisateurs affecté à des profils afin de les afficher dans la liste des utilisateurs*/
  public ListActifUsers: MyRhisUserModel[] = [];

  public listProfil: ProfilModel[] = [];
  public profilDefault: ProfilModel;
  public restaurant: RestaurantModel = new RestaurantModel();
  public societe: SocieteModel = new SocieteModel();
  public affectation: AffectationModel = {};
  private userToSave: MyRhisUserModel = new MyRhisUserModel();
  public idUser: number;
  public showAddUpdateUserPopup = false;
  public showAddUpdateUserPopupTitle: string;
  private employeTosave: EmployeeModel = new EmployeeModel();
  public header = ['NOM', 'PRENOM', 'MAIL', 'PROFIL', 'EMPTY'];
  private ecran = 'GUR';
  private sousEcran = 'UTM';
  public heightInterface: any;
  public showPasswordPopUp = false;
  public passwordPopUp: string;
  public password: String;
  public isMobileAppEnabled: boolean;
  private readonly codeParameter = 'USEAPPLIMOBILE';
  private readonly IS_TRUE = 'true';
  @ViewChild(ListUtilisateurMobileComponent) mobileUsers;
  constructor(private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private utilisateurService: UtilisateurRestaurantService,
              private affecationSerbice: AffectationRestaurantService,
              private profilService: ProfilService,
              private sessionService: SessionService,
              private employeService: EmployeeService,
              private domControlService: DomControlService,
              private userService: UtilisateurService,
              private parametreGlobalService: ParametreGlobalService
  ) {
  }

  ngOnInit() {
    this.getUsersByRestaurant();
    this.getProfilsByRestaurant();
    this.getListActifEmployeWithMailNotAssocieted();
    this.displayMobileUsers();
  }

  private async displayMobileUsers(): Promise<void> {
    const userAppMobileParam = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.codeParameter).toPromise();
    this.isMobileAppEnabled = userAppMobileParam.valeur.toString().toLowerCase() === this.IS_TRUE;
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

  public showMobileControl(): boolean {
    return this.domControlService.showControl(this.sousEcran);
  }

  public showRestaurantControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }


  /**
   * cette methode permet de sauvgarder temporairement le nom et prenom de l'employé dans le champ fullname
   */
  private setNomPrenomEmploye() {
    for (const employe of this.ListNotAssocietedEmployes) {
      employe.fullName = employe.prenom + ' ' + employe.nom;
    }
  }

  /**
   * permet de recuperer la liste des employes actifs ayant un mail et non associé à un profil
   */
  private getListActifEmployeWithMailNotAssocieted() {
    this.employeService.findActiveEmployeeWithMailByRestaurant().subscribe((listEmp: EmployeeModel[]) => {
      this.ListNotAssocietedEmployes = listEmp;
      this.setNomPrenomEmploye();
    }, (err: any) => {
      console.log(err);
    });
  }

  /**
   * Cette methode permet de recuperer la liste des utilisateurs par restaurant
   */
  private getUsersByRestaurant() {
    this.ListUtilisteurs = [];
    this.utilisateurService.getUsersByRestaurant().subscribe(
      (data: MyRhisUserModel[]) => {
        this.ListActifUsers = data;
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  public showConfirmDelete(user: MyRhisUserModel, event) {
    this.showAddUpdateUserPopup = false;
    event.stopPropagation();
    this.idUser = user.idUser;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('EMPLOYEE.DELETE_MAIL_BODY'),
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
   * supprimer un utilisateur
   */
  private deleteUser(user: MyRhisUserModel): void {
    user.affectations[0].profil = this.profilDefault;
    this.utilisateurService.deleteUser(user.uuid).subscribe(() => {
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.DELETED'));
      this.getUsersByRestaurant();
      this.getListActifEmployeWithMailNotAssocieted();
    }, (err: any) => {
      console.log(err);
    });
  }

  /**
   * Permet d'afficher le popup d'ajout utilisateur-restaurant
   */
  public affecterUserPopUp(): void {
    if (this.ListNotAssocietedEmployes.length === 0) {
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate('USER.NO_USER'));
    } else {
      this.showAddUpdateUserPopup = true;
      this.showAddUpdateUserPopupTitle = this.rhisTranslateService.translate('USER.ADD_NEW_POPUP');
    }
  }

  /**
   * fermer le pupup
   */
  public closePopup() {
    this.showAddUpdateUserPopup = false;
  }

  /**
   * get list des profils par restaurant sauf le profil default
   */
  public getProfilsByRestaurant() {
    const num = 0;
    this.profilService.getProfilsByRestaurant().subscribe(
      (data: ProfilModel[]) => {
        this.listProfil = data;
      }, (err: any) => {
        console.log(err);
      }
    );

  }

  /**
   * affecter un profil à un employe
   * creation d'un utilisateur
   * @param: form
   */
  public affecterEmploye(form: Object) {
    this.employeTosave = form['employe'];
    /** creation de l'utilisateur */
    this.userCreation();
    if (form['profil'].libelle === 'mobile') {
      this.userToSave.mobile = true ;
    }
    this.userToSave.langue = form['langue'].value ? form['langue'].value.toUpperCase() : form['langue'].toUpperCase();
    this.utilisateurService.addUser(this.userToSave).subscribe((userSaved: MyRhisUserModel) => {
      /** creation de l'affectation */
      this.affectationCreation();
      this.affectation.profil = form['profil'];
      this.affectation.utilisateur = userSaved;
      this.affecationSerbice.addAffectation(this.affectation).subscribe((affectationSeved: AffectationModel) => {
        this.getListActifEmployeWithMailNotAssocieted();
        this.showAddUpdateUserPopup = false;
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.AFFECTED'));
        this.getUsersByRestaurant();
        if (form['profil'].libelle === 'mobile') {
          this.mobileUsers.getMobileUsersByRestaurant();
        }
      this.notificationService.stopLoader();
      }, err => {
        this.notificationService.stopLoader();
      });
    });
  }

  /**
   * cette method permdet de creer un utilisateur à partir de lemenploye selectioné
   */
  private userCreation() {
    this.userToSave.nom = this.employeTosave.nom;
    this.userToSave.prenom = this.employeTosave.prenom;
    this.userToSave.email = this.employeTosave.email.toString();
  }

  /**
   * cette methode permet de creer un affectation
   */
  private affectationCreation() {
    this.restaurant.idRestaurant = +this.sessionService.getRestaurant();
    this.societe.idSociete = +this.sessionService.getSociete();
    this.affectation.restaurant = this.restaurant;
    this.affectation.societe = this.societe;
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
       this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('LOGIN.CODE_RESET_MSG') );
    });
  }

  /**
   * permet de fermer le popup de generation de mot de passe
   */
  public closePopupPassword(): void {
    this.showPasswordPopUp = false;
  }

  /**
   * verifie si l'utilisateur actuel est superviseur
   */
  public isSupervisor(): boolean {
    return this.sessionService.getProfil() === 'superviseur';
  }

}
