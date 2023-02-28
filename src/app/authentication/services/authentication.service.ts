import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SessionService} from '../../shared/service/session.service';
import {PathService} from '../../shared/service/path.service';
import {isNull} from 'util';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  host;
  email: string;
  profil: string;
  id;
  permissions: Array<string>;

  constructor(private http: HttpClient,
              private sessionService: SessionService,
              private pathService: PathService,
              private sessionSevice: SessionService) {
    this.host = this.pathService.hostServerSecurity;
  }

  public login(data) {
    // option observe pour récuperer toute la reponse http et non sa convertion json
    return this.http.post(this.host + '/login', data, {observe: 'response'});
  }

  public getUtilisateurByEmail(email) {
    return this.http.get(this.host + '/user/ByEmail/' + email);
  }

  public getAffectationsListByUser(uuidUser: string): Observable<any> {
    return this.http.get(this.host + '/affectation/ByUser/' + uuidUser);
  }

  public forgottenPassword(email: string) {
    return this.http.get(this.host + '/user/password/' + email);
  }


  isSuperviseur() {
    if (localStorage.getItem('profil') === 'superviseur') {
      return true;
    } else {
      return false;
    }
  }

  public isAutheticated() {
    return !isNull(this.sessionService.getBearerToken());
  }


  public displayAllowed(ecran) {
    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(ecran + '.1') > -1;
    } else {
      return false;
    }
  }

  public DetailsAllowed(ecran) {
    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(ecran + '.2') > -1;
    } else {
      return false;
    }
  }

  public addAllowed(code) {

    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(code + '.4') > -1;
    } else {
      return false;
    }
  }

  public deleteAllowed(ecran) {
    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(ecran + '.8') > -1;
    } else {
      return false;
    }
  }

  public updateAllowed(ecran) {
    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(ecran + '.16') > -1;
    }
  }


  public dupliquerAllowed(ecran) {
    if (this.sessionSevice.getPermissions()) {
      return this.sessionSevice.getPermissions().indexOf(ecran + '.32') > -1;
    } else {
      return false;
    }
  }

  public getComponentByProfil(uuidProfil: string) {
    return this.http.get(this.host + '/component/findByProfil/' + uuidProfil);
  }

  public getIsDirector(email: string): Observable<Object> {
    return this.http.get(this.host + '/user/isDirector/' + email);
  }

  public getIPAddress() {
    return this.http.get('http://api.ipify.org/?format=json');
  }

}
