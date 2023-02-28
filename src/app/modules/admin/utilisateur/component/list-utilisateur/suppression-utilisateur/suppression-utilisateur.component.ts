import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MyRhisUserModel} from '../../../../../../shared/model/MyRhisUser.model';
import {SessionService} from '../../../../../../shared/service/session.service';
import {UtilisateurService} from '../../../service/utilisateur.service';
import {isNull} from 'util';

@Component({
  selector: 'rhis-suppression-utilisateur',
  templateUrl: './suppression-utilisateur.component.html',
  styleUrls: ['./suppression-utilisateur.component.scss']
})
export class SuppressionUtilisateurComponent implements OnInit {

  public password: string;
  public passwordVerifier: boolean;
  @Output()
  public verifyUserPasswordEvent = new EventEmitter();
  public isSubmitted = false;
  public emptyPassword: boolean;
  public isVerifierd: boolean;

  constructor(private sessionService: SessionService, private userService: UtilisateurService) {
    this.password = null;
  }

  ngOnInit() {
  }

  public onChangePassword() {
    this.passwordVerifier = false;
  }

  public verifyUserPassword() {
    const user: MyRhisUserModel = {};
    user.email = this.sessionService.getEmail();
    user.password = this.password;
    this.isVerifierd = true;
    if (isNull(this.password)) {
      this.emptyPassword = true;
    } else {
      this.isSubmitted = true;
      this.userService.verifyUser(user).subscribe(() => {
          this.verifyUserPasswordEvent.emit(this.password);
        },
        () => {
          this.passwordVerifier = true;
        });
    }
  }
}
