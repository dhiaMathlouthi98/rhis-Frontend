import {Component, HostListener, OnInit} from '@angular/core';
import {CreatePasswordService} from '../services/create-password.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MyRhisUserModel} from '../../shared/model/MyRhisUser.model';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {LanguageStorageService} from '../../shared/service/language-storage.service';
import {RhisTranslateService} from '../../shared/service/rhis-translate.service';
import {langueUser} from '../../shared/enumeration/langueUser';
import {SessionService} from '../../shared/service/session.service';


@Component({
  selector: 'rhis-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss']
})
export class CreatePasswordComponent implements OnInit {
  public password: string;
  public confirmPassword: string;
  public passwordIsValid = false;
  public isSubmitted = false;
  public wrongPass: boolean;
  public isEmptyPassword = false;
  public user: MyRhisUserModel = {};
  public addUserPassword = new FormGroup(
    {
             password: new FormControl('', [Validators.pattern('(^$|(^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*+§/,-.()?&])[A-Za-z\\d@$!%*?&+§/,-.()]{8,}$))'), ]),
             confirmPassword: new FormControl('', [Validators.pattern('(^$|(^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*+§/,-.()?&])[A-Za-z\\d@$!%*?&+§/,-.()]{8,}$))'), ]),
           }
);

  constructor(
              private createPasswordService: CreatePasswordService,
              private route: ActivatedRoute,
              private router: Router,
              private rhisTranslateService: RhisTranslateService,
              private languageStorageService: LanguageStorageService,
              private sessionService: SessionService) { }
  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL}
  ];
  language: any;

  ngOnInit() {
    // this.sessionService.deleteBearerToken();
    this.createPasswordService.verifyTokenToCreatePassword(this.route.snapshot.params['id']).subscribe(
      (user: MyRhisUserModel) => {
        if (!user) {
          this.router.navigate(['linkExpired']);
        } else {
          this.user = user;
          switch (user.langue.toLowerCase()) {
            case langueUser.FR : {
              this.language = this.languages[0];
              this.languageStorageService.setLanguageSettings(this.language);
            }
              break;
            case langueUser.EN : {
              this.language = this.languages[1];
              this.languageStorageService.setLanguageSettings(this.language);
            }
              break;
            case langueUser.ES : {
              this.language = this.languages[2];
              this.languageStorageService.setLanguageSettings(this.language);
            }
              break;
            case langueUser.DE : {
              this.language = this.languages[3];
              this.languageStorageService.setLanguageSettings(this.language);
            }
              break;
            case langueUser.NL : {
              this.language = this.languages[4];
              this.languageStorageService.setLanguageSettings(this.language);
            }
          }
          this.rhisTranslateService.language = this.language.value;
        }
  }
  );
}


public setPassword(): void {
    this.isSubmitted = true;
    this.wrongPass = false;
    if (this.password !== '' && this.confirmPassword !== '' ) {
      if (this.password === this.confirmPassword && this.password.match(('(^$|(^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*+§/,-.()?&])[A-Za-z\\d@$!%*?&+§/,-.()]{8,}$))'))) {
        this.passwordIsValid = true;
        this.onSubmit();
      } else if (this.password !== this.confirmPassword) {
        this.wrongPass = true;
        this.passwordIsValid = false;
      }
    } else {
      this.wrongPass = true;
      this.passwordIsValid = false;
    }
}

public onSubmit(): any {
  this.user.password = this.password;
  return this.createPasswordService.setPasswordToUser(this.user).subscribe(
    (data) => {
      this.router.navigate(['login']);
    },err => {
      console.log(err);
    });
}

}
