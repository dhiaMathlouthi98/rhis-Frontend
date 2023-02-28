import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProfilModel} from '../../../../../../shared/model/profil.model';
import {UtilisateurService} from '../../../service/utilisateur.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {langueUser} from '../../../../../../shared/enumeration/langueUser';
import {LanguageStorageService} from '../../../../../../shared/service/language-storage.service';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';

@Component({
  selector: 'rhis-add-utilisateur',
  templateUrl: './add-utilisateur.component.html',
  styleUrls: ['./add-utilisateur.component.scss']
})
export class AddUtilisateurComponent implements OnInit {
  @Input()
  public listProfil: ProfilModel[];
  @Output()
  public AddUserEvent = new EventEmitter();
  @Input()
  public mailExistatnt: boolean;
  @Input()
  public selectedUser: any;
  @Input()
  public selectedProfil: ProfilModel;
  @Input()
  public buttonLabel: string;
  public isSubmitted = false;
  public scrollHeight = '200px';
  public savedEmail: string;
  public addUserForm = new FormGroup(
    {
      nom: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      prenom: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      langue: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      profil: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      pseudo: new FormControl('')
    }
  );

  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL},
  ];

  public selectors = {
    dropDownSelector: '.ui-dropdown'
  };

  language: any;

  languagedropdown: any;
  constructor(private  activatedRoute: ActivatedRoute,
              private userService: UtilisateurService,
              private rhisTranslateService: RhisTranslateService,
              private languageStorageService: LanguageStorageService) {
  }

  ngOnInit() {
    this.getListLanguagesLocalStorage(this.languageStorageService.getLanguageSettings().value ? this.languageStorageService.getLanguageSettings().value : this.languageStorageService.getLanguageSettings() );
    if (this.buttonLabel === this.rhisTranslateService.translate('USER.UPDATE_USER')) {
      this.savedEmail = this.selectedUser.email;
      if (this.selectedUser.langue) {
        this.language = this.languages.filter(el => el.value === this.selectedUser.langue.toLowerCase())[0];
      } else {
        this.addUserForm.get('langue').setValue(this.displayLanguage(true));
      }
    } else {
      this.addUserForm.get('langue').setValue(this.displayLanguage(true));
    }
    this.languagedropdown = this.language;
    this.addUserForm.get('langue').setValue(this.language);
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
    }
    if (languageInit) {
      this.languagedropdown = this.language;
      this.getListLanguagesLocalStorage(this.languagedropdown);
    }
    return this.language;
  }

  /**
   * affecter un profil autre que defaut à un utilisateur-restaurant
   */
  public addOrUpdateUser(): void {
    if (this.buttonLabel === this.rhisTranslateService.translate('USER.ADD_USER') || this.selectedUser.email !== this.savedEmail) {
      this.isSubmitted = true;
      this.userService.isMailExist(this.addUserForm.value['email']).subscribe(state => {
        if (state === true) {
          this.mailExistatnt = true;
        } else {
          if (this.addUserForm.valid) {
            this.AddUserEvent.emit(this.addUserForm.value);
          }
        }
      });
    } else {
      if (this.addUserForm.valid) {
        this.AddUserEvent.emit(this.addUserForm.value);
      }
    }
  }

  public onChangeMail() {
    this.mailExistatnt = false;
  }


}
