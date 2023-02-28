import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '../../../../../shared/service/session.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../service/user.service';
import {MyRhisUserModel} from '../../../../../shared/model/MyRhisUser.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {UserPasswordModel} from '../../../../../shared/model/gui/userPassword.model';
import {RestaurantNameService} from '../../../../../shared/service/restaurant-name.service';
import {LanguageStorageService} from '../../../../../shared/service/language-storage.service';
import {langueUser} from '../../../../../shared/enumeration/langueUser';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'rhis-profil-details',
  templateUrl: './profil-details.component.html',
  styleUrls: ['./profil-details.component.scss']
})
export class ProfilDetailsComponent implements OnInit {
  public profilForm = new FormGroup(
    {
      nomProfil: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      prenomProfil: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      emailProfil: new FormControl('', [Validators.required, Validators.email]),
      formerPassword: new FormControl('', []),
      password: new FormControl('', [Validators.pattern('(^$|(^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*+§/,-.()?&])[A-Za-z\\d@$!%*?&+§/,-.()]{8,}$))'), ]),
      langue: new FormControl('', [])
    },
  );
  public userConfirm: UserPasswordModel = {};
  public user: UserPasswordModel = {};
  public isSubmitted = false;
  public mailExistatnt = false;
  public wrongPass: boolean;
  public isEmptyPassword = false;
  @Input()
  public showProfilPopup: boolean;

  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL},
  ];

  language: any;
  languagedropdown: any;

  constructor(private sessionService: SessionService,
              private userService: UserService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private restaurantNameService: RestaurantNameService,
              private languageStorageService: LanguageStorageService) {
  }

  ngOnInit() {
    this.profilForm.setValue({
      nomProfil: this.sessionService.getUserNom(),
      prenomProfil: this.sessionService.getUserPrenom(),
      emailProfil: this.sessionService.getUserEmail(),
      formerPassword: '',
      password: '',
      langue: this.displayLanguage(true)
    });
    this.getListLanguagesLocalStorage(this.profilForm.value.langue.value);
  }

  /**
   * get list languages translated when change the language
   */
  getListLanguagesLocalStorage(language: string) {
    switch (language) {
      case 'fr': {
        this.languages = [
          {label: 'Français', value: langueUser.FR},
          {label: 'Anglais', value: langueUser.EN},
          {label: 'Espagnol', value: langueUser.ES},
          {label: 'Allemand', value: langueUser.DE},
          {label: 'Néerlandais', value: langueUser.NL},
        ];
        this.language = this.languages[0];
      }
        break;
      case 'en' : {
        this.languages = [
          {label: 'French', value: langueUser.FR},
          {label: 'English', value: langueUser.EN},
          {label: 'Spanish', value: langueUser.ES},
          {label: 'German', value: langueUser.DE},
          {label: 'Dutch ', value: langueUser.NL},
        ];
        this.language = this.languages[1];
      }
        break;
      case 'es' : {
        this.languages = [
          {label: 'Francés', value: langueUser.FR},
          {label: 'inglés', value: langueUser.EN},
          {label: 'español', value: langueUser.ES},
          {label: 'Alemán', value: langueUser.DE},
          {label: 'Holandés', value: langueUser.NL},
        ];
        this.language = this.languages[2];
      }
        break;
      case 'de' : {
        this.languages = [
          {label: 'Französisch', value: langueUser.FR},
          {label: 'Englisch', value: langueUser.EN},
          {label: 'Spanisch', value: langueUser.ES},
          {label: 'Deutsch', value: langueUser.DE},
          {label: 'Niederländisch', value: langueUser.NL},
        ];
        this.language = this.languages[3];
      }
        break;
      case 'nl' : {
        this.languages = [
          {label: 'Frans', value: langueUser.FR},
          {label: 'Engels', value: langueUser.EN},
          {label: 'Spaans', value: langueUser.ES},
          {label: 'Duits', value: langueUser.DE},
          {label: 'Nederlands', value: langueUser.NL},
        ];
        this.language = this.languages[4];
      }
    }
  }

  /**
   * detect language in localstorage if exist or browser language
   */
  public displayLanguage(languageInit?: boolean): any {
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
    }
    if (languageInit) {
      this.languagedropdown = this.language;
      this.onChange();
    }
    return this.language;
  }

  /**
   * Detect language change from list of languages
   */
  public onChange() {
    this.getListLanguagesLocalStorage(this.languagedropdown);
    this.languageStorageService.setLanguageSettings(this.language);
  }

  public updateProfil() {
    this.wrongPass = false;
    this.isEmptyPassword = false;
    this.userConfirm.email = this.sessionService.getEmail();
    this.userConfirm.password = this.profilForm.value['formerPassword'];
    if (this.userConfirm.password !== '' && this.profilForm.value['password'] !== '') {
      this.userService.verifyPassword(this.userConfirm).subscribe(() => {
          this.ModifieUser();
        }
        , () => {
          this.wrongPass = true;
        });
    } else if (this.profilForm.value['password'] !== '' && this.profilForm.value['formerPassword'] === '') {
      this.wrongPass = true;
    } else if (this.profilForm.value['password'] === '' && this.profilForm.value['formerPassword'] !== '') {
      this.isEmptyPassword = true;
    } else {
      this.ModifieUser();
    }
  }

  private ModifieUser() {
    if (this.wrongPass === false) {
      this.isSubmitted = true;
      if (this.profilForm.valid) {
        if (this.sessionService.getEmail() !== this.profilForm.value['emailProfil']) {
          this.userService.verifyEmail(this.profilForm.value['emailProfil']).subscribe((etat: boolean) => {
            this.mailExistatnt = etat;
          });
        }
        this.user.nom = this.profilForm.value['nomProfil'];
        this.user.prenom = this.profilForm.value['prenomProfil'];
        this.user.email = this.profilForm.value['emailProfil'];
        this.user.password = this.profilForm.value['password'];
        this.user.oldPassword = this.profilForm.value['formerPassword'];
        this.user.langue = this.profilForm.value['langue'].label ?
          this.profilForm.value['langue'].value : this.profilForm.value['langue']  ;
        this.languageStorageService.setLanguageSettings(this.language);
        this.rhisTranslateService.language = this.language.value;

        this.userService.updateUser(this.user, this.sessionService.getEmail()).subscribe(() => {
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('USER.UPDATED'));
          setTimeout(() => {
          }, 3000);
          this.restaurantNameService.changePopUpState(false);
          this.showProfilPopup = false;
          if (this.sessionService.getUserNom() !== this.profilForm.value['nomProfil']
            || this.sessionService.getUserPrenom() !== this.profilForm.value['prenomProfil']
            || this.sessionService.getEmail() !== this.profilForm.value['emailProfil']) {
            this.updateSession(this.user);
            setTimeout(() => {
            }, 3000);
            location.reload();
          } else if (this.languageStorageService.getLanguageSettings() !== this.profilForm.value['langue']) {
            this.updateSession(this.user);
            location.reload();
          } else  {
            this.updateSession(this.user);
          }
        }, () => {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('USER.NOT_UPDATED'));
        });
      }
    }
  }

  private updateSession(user: any) {
    this.sessionService.setEmail(user.email);
    this.sessionService.setUserNom(user.nom);
    this.sessionService.setUserPrenom(user.prenom);
    this.languageStorageService.setLanguageSettings(this.language);
    this.rhisTranslateService.language = this.language.value;
    this.displayLanguage(true);
  }

  public changePasswordValidity(): void {
    this.isEmptyPassword = false;
  }
}
