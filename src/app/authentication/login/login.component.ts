import {Component, HostListener, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../shared/service/rhis-translate.service';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AffectationModel} from '../../shared/model/affectation.model';
import {NotificationService} from '../../shared/service/notification.service';
import {TokenService} from '../services/token.service';
import {SessionService} from '../../shared/service/session.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {DroitService} from '../../modules/admin/profils/service/droit.service';
import {IpServiceService} from '../services/ip-service.service';
import {UserIpService} from '../../shared/service/user-ip.service';
import {RestaurantService} from '../../shared/service/restaurant.service';
import {RemoveItemLocalStorageService} from '../../shared/service/remove-item-local-storage.service';
import {LanguageStorageService} from '../../shared/service/language-storage.service';
import {langueUser} from '../../shared/enumeration/langueUser';
import {UserService} from '../../modules/layout/service/user.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'rhis-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private rhisTranslateService: RhisTranslateService,
              private authService: AuthenticationService,
              private router: Router,
              private notificationService: NotificationService,
              private tokenService: TokenService,
              private sessionService: SessionService,
              private droitSerice: DroitService,
              private ipService: IpServiceService,
              private userIpService: UserIpService,
              private restaurantService: RestaurantService,
              private removeItemLocalStorageService: RemoveItemLocalStorageService,
              private languageStorageService: LanguageStorageService,
              private userService: UserService,
              private translateService: TranslateService) {
    this.sessionService.setRestaurant(0);
    this.sessionService.setUuidFranchisee('');
  }

  user;
  public emptyMail = false;
  public validEmail = true;
  badCredential = false;
  public isSubmitted = false;
  public showEmailPopup = false;
  public showEmailPopupTitle: String;
  public affectations: AffectationModel[] = [];
  login = {email: '', password: ''};
  public isOpen = false;
  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL}
  ];
  language: any;
  public email = '';
  public blockDelai = 0;
  public loginForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    }
  );

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  ngOnInit() {
    this.displayLanguage();
    this.removeItemLocalStorageService.removeFromLocalStorage();
    localStorage.removeItem('CP1236');
    localStorage.removeItem('user-nom');
    localStorage.removeItem('user-prenom');
    localStorage.removeItem('email');
    localStorage.removeItem('profilUuid');
    localStorage.removeItem('profilId');
    localStorage.removeItem('profil');
    localStorage.removeItem('lastUrl');
  }

  /**
   * detect language in localstorage if exist or browser language
   */
  public displayLanguage() {
    if (this.languageStorageService.getLanguageSettings()) {
      this.language = this.languageStorageService.getLanguageSettings();
    } else {
      const languageBrowser = navigator.language.slice(0, 2);
      const indexOfLanugage = this.languages.findIndex(elem => elem.value === languageBrowser);
      if (indexOfLanugage !== -1) {
        this.language = this.languages[indexOfLanugage];
      } else {
        this.language = this.languages[1];
      }
      this.languageStorageService.setLanguageSettings(this.language);
    }
    this.rhisTranslateService.language = this.language.value;
  }

  /**
   * Detect language change from list of languages
   */
  public onChange(languageChoisi: string) {
    this.isOpen = !this.isOpen;
    languageChoisi = this.language.value;
    this.chooseLanguage(languageChoisi);
    this.languageStorageService.setLanguageSettings(this.language);
    this.rhisTranslateService.language = this.language.value;
  }

  public chooseLanguage(language: any) {
    switch (language.toLowerCase()) {
      case langueUser.FR : {
        this.languages = [
          {label: 'Français', value: langueUser.FR},
          {label: 'Anglais', value: langueUser.EN},
          {label: 'Espagnol', value: langueUser.ES},
          {label: 'Allemand', value: langueUser.DE},
          {label: 'Néerlandais', value: langueUser.NL}
        ];
        this.language = this.languages[0];
      }
        break;
      case langueUser.EN : {
        this.languages = [
          {label: 'French', value: langueUser.FR},
          {label: 'English', value: langueUser.EN},
          {label: 'Spanish', value: langueUser.ES},
          {label: 'German', value: langueUser.DE},
          {label: 'Dutch ', value: langueUser.NL}
        ];
        this.language = this.languages[1];
      }
        break;
      case langueUser.ES : {
        this.languages = [
          {label: 'Francés', value: langueUser.FR},
          {label: 'inglés', value: langueUser.EN},
          {label: 'español', value: langueUser.ES},
          {label: 'Alemán', value: langueUser.DE},
          {label: 'Holandés', value: langueUser.NL}
        ];
        this.language = this.languages[2];
      }
        break;
      case langueUser.DE : {
        this.languages = [
          {label: 'Französisch', value: langueUser.FR},
          {label: 'Englisch', value: langueUser.EN},
          {label: 'Spanisch', value: langueUser.ES},
          {label: 'Deutsch', value: langueUser.DE},
          {label: 'Niederländisch', value: langueUser.NL}
        ];
        this.language = this.languages[3];
      }
        break;
      case langueUser.NL : {
        this.languages = [
          {label: 'Frans', value: langueUser.FR},
          {label: 'Engels', value: langueUser.EN},
          {label: 'Spaans', value: langueUser.ES},
          {label: 'Duits', value: langueUser.DE},
          {label: 'Nederlands', value: langueUser.NL}
        ];
        this.language = this.languages[4];
      }
    }
  }

  public async onLogin(): Promise<void> {

    this.sessionService.deleteBearerToken();
    this.blockDelai = 0;
    this.isSubmitted = true;
    this.badCredential = false;
    if (this.loginForm.valid) {
      await this.authService.login(this.loginForm.value)
        .subscribe(async (resp: any) => {
          const jwt = resp.headers.get('Authorization');
          const jwtHelper = new JwtHelperService();
          const objJWT = jwtHelper.decodeToken(jwt);
          this.sessionService.setRefreshToken(objJWT.iss);
          this.sessionService.setRefreshTimer(objJWT.aud);
          this.tokenService.saveToken(jwt);
          if (objJWT.sub > 0) {
            this.blockDelai = objJWT.sub;
          } else {
            const email = this.loginForm.value.email;
            const droits: string[] = await this.droitSerice.getListDroit(email).toPromise();

            this.tokenService.parseJWT(droits);
            this.sessionService.setEmail(email);
            const utilisateur = await this.authService.getUtilisateurByEmail(email).toPromise();
            this.sessionService.setUsername(utilisateur['nom'] + ' ' + utilisateur['prenom']);
            this.sessionService.setUser(utilisateur['idUser']);
            this.sessionService.setUserPrenom(utilisateur['prenom']);
            this.sessionService.setUserNom(utilisateur['nom']);
            this.sessionService.setUuidUser(utilisateur['uuid']);
            if (!utilisateur['langue']) {
              this.userService.updateUserLangue(utilisateur['uuid'], this.language.value).subscribe();
              this.languageStorageService.setLanguageSettings(this.language);
            } else if ((utilisateur['langue']) && (utilisateur['langue'].toLowerCase() !== this.language.value.toLowerCase())) {
              this.chooseLanguage(utilisateur['langue']);
              this.rhisTranslateService.language = this.language.value;
              this.languageStorageService.setLanguageSettings(this.language);
            }
            this.authService.getAffectationsListByUser(this.sessionService.getUuidUser()).subscribe(
              async (affectationList: AffectationModel[]) => {
                this.affectations = affectationList;
                this.sessionService.setComponents(await this.authService.getComponentByProfil(this.affectations[0].profil.uuid).toPromise());
                this.rediretByProfil(this.affectations, email);
              });
          }

        }, err => {
          if (err.status === 403) {
            this.badCredential = true;
          }
        });
    }
  }

  /**
   * permet de verfier le mail et l'envoyer au backend pour generer un nouveau mot de passe pour l'utilisateur-restaurant
   */
  public motDePasseOublie() {
    if (this.validateEmail(this.email)) {
      this.validEmail = false;
      if (this.email === '') {
        this.emptyMail = true;
      } else {
        this.emptyMail = false;
        this.authService.forgottenPassword(this.email).subscribe(data => {
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('LOGIN.CODE_RESET_MSG'));
          this.showEmailPopup = false;
        }, (err: any) => {
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('LOGIN.CODE_RESET_MSG') );
          this.showEmailPopup = false;
          console.log(err.status);
        });
      }
    } else {
      this.validEmail = true;
    }
  }


  public closePopup() {
    this.showEmailPopup = false;
    this.email = '';
  }

  public showMailPopup() {
    this.validEmail = false;
    this.showEmailPopup = true;
    this.showEmailPopupTitle = this.rhisTranslateService.translate('USER.FORGOTTEN_PASSWORD');
  }

  private rediretByProfil(affectationList: any, email: string): void {
    for (const entry of affectationList) {   /**superviseur**/
      if (entry.restaurant == null && entry.societe == null) {
        this.sessionService.setProfil('superviseur');
        this.sessionService.setIdProfil(entry.profil.idProfil);
        this.sessionService.setUuidProfil(entry.profil.uuid);
        this.router.navigateByUrl('/admin/societe/all');
      } else if (affectationList.length === 1 && entry.restaurant != null && entry.societe != null) {
        this.sessionService.setRestaurant(entry.restaurant.idRestaurant);
        this.sessionService.setUuidRestaurant(entry.restaurant.uuid);
        this.sessionService.setRestaurantName(entry.restaurant.libelle);
        this.sessionService.setSociete(entry.societe.idSociete);
        this.sessionService.setSocieteName(entry.societe.societeName);
        this.sessionService.setIdProfil(entry.profil.idProfil);
        this.sessionService.setUuidProfil(entry.profil.uuid);
        this.router.navigateByUrl('/home');
        this.authService.getIsDirector(email).subscribe((isLocked: boolean) => {
          this.sessionService.setIsDirector(isLocked);
        });
      } else if (affectationList.length > 1 && entry.restaurant != null && entry.societe != null) {
        this.sessionService.setIdProfil(entry.profil.idProfil);
        this.sessionService.setUuidProfil(entry.profil.uuid);
        this.router.navigateByUrl('/admin/societe/all');

      } else if (entry.restaurant == null && entry.societe != null) {
        this.sessionService.setProfil('franchise');
        this.sessionService.setIdProfil(entry.profil.idProfil);
        this.sessionService.setUuidProfil(entry.profil.uuid);
        this.router.navigateByUrl('/parc/List/restaurantList');

      } else if (entry.restaurant != null && entry.societe == null) {
        this.sessionService.setProfil('administrateur');
        this.sessionService.setIdProfil(entry.profil.idProfil);
        this.sessionService.setUuidProfil(entry.profil.uuid);
        this.router.navigateByUrl('/parc/List/restaurantList');
      }
    }
  }

  validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    }
    return false;
  }
}
