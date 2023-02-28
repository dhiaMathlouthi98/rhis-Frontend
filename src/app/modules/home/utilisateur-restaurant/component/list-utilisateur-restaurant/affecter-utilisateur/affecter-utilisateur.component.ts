import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProfilModel} from '../../../../../../shared/model/profil.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {langueUser} from '../../../../../../shared/enumeration/langueUser';
import {ActivatedRoute} from '@angular/router';
import {UtilisateurService} from '../../../../../admin/utilisateur/service/utilisateur.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {LanguageStorageService} from '../../../../../../shared/service/language-storage.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';

@Component({
  selector: 'rhis-affecter-utilisateur',
  templateUrl: './affecter-utilisateur.component.html',
  styleUrls: ['./affecter-utilisateur.component.scss']
})

export class AffecterUtilisateurComponent implements OnInit {

  @Input()
  public listProfil: ProfilModel[];
  @Input()
  public ListNotAssocietedEmployes: EmployeeModel[] = [];
  @Output()
  public affecterUserEvent = new EventEmitter();
  public isSubmitted = false;
  public utilisateurAffectationform = new FormGroup(
    {
      employe: new FormControl('', [Validators.required]),
      profil: new FormControl('', [Validators.required]),
      langue: new FormControl('', [Validators.required])
    }
  );

  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL},
  ];

  language: any;
  languagedropdown: any;

  constructor(private  activatedRoute: ActivatedRoute,
              private userService: UtilisateurService,
              private rhisTranslateService: RhisTranslateService,
              private languageStorageService: LanguageStorageService,
              private notificationService: NotificationService) {
  }

  /**
   * affecter un profil autre que defaut à un utilisateur-restaurant
   */
  public affecterUser() {
    this.isSubmitted = true;
    if (this.utilisateurAffectationform.valid) {
      this.notificationService.startLoader();
      this.affecterUserEvent.emit(this.utilisateurAffectationform.value);
    }
  }

  ngOnInit() {
    this.getListLanguagesLocalStorage(this.languageStorageService.getLanguageSettings().value ?
      this.languageStorageService.getLanguageSettings().value : this.languageStorageService.getLanguageSettings() );

    this.languagedropdown = this.language;
    this.utilisateurAffectationform.get('langue').setValue(this.language);
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

}
