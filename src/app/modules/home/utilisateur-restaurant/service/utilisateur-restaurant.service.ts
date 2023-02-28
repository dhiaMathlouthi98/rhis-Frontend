import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {MyRhisUserModel} from '../../../../shared/model/MyRhisUser.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {SessionService} from '../../../../shared/service/session.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurRestaurantService extends GenericCRUDRestService<MyRhisUserModel, String> {
  constructor(private pathService: PathService, httpClient: HttpClient,
              private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathSecurity()}/user`);
  }

  /**
   * Recuperer tous les utilisateurs par restaurant
   */
  public getUsersByRestaurant(): Observable<MyRhisUserModel[]> {

    return this.httpClient.get<MyRhisUserModel[]>(`${this.baseUrl}` + '/ByRestaurant/v2/' + this.sessionService.getUuidRestaurant());
  }

  public addUser(user: MyRhisUserModel): Observable<any> {
    return super.add(user, '/');
  }

  public deleteUser(uuidUser: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}` + '/delete/' + uuidUser);
  }

  /**
   * Recuperer  les utilisateurs mobile par restaurant
   */
  public getUsersMobileByRestaurant(): Observable<MyRhisUserModel[]> {

    return this.httpClient.get<MyRhisUserModel[]>(`${this.baseUrl}` + '/ByRestaurant/mobile/' + this.sessionService.getUuidRestaurant());
  }
}
