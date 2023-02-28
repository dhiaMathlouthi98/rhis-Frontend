import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {SessionService} from '../../shared/service/session.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  email: string;
  profil: string;
  id;
  permissions: Array<string>;

  jwt: string;

  constructor(private http: HttpClient, private sessionService: SessionService) {
  }

  saveToken(jwt: string) {
    this.sessionService.setBearerToken(jwt);
    this.jwt = jwt;
  }

  parseJWT(listDroit: string[]): void {
    const jwtHelper = new JwtHelperService();
    const objJWT = jwtHelper.decodeToken(this.jwt);
    this.email = objJWT.sub;
    this.permissions = objJWT.authorities;
    if (listDroit.length === 0) {
      this.sessionService.setPermissions('*');
    } else {
      this.sessionService.setPermissions(listDroit.toString());
    }
    this.sessionService.setUserEmail(this.email);

  }

}
