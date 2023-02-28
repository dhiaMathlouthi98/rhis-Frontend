import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../shared/service/generic-crud.service';
import {MyRhisUserModel} from '../../../shared/model/MyRhisUser.model';
import {PathService} from '../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericCRUDRestService<MyRhisUserModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient) {
    super(httpClinent, `${pathService.getPathSecurity()}/user`);
  }

  public verifyPassword(user: any) {
    return this.httpClient.post(`${this.baseUrl}` + '/confirm', user);
  }

  public updateUser(user: any, email: string) {
    return this.httpClient.put(`${this.baseUrl}` + '/update/' + email, user);
  }

  public verifyEmail(email: String) {
    return this.httpClient.get(`${this.baseUrl}` + '/isMailExist/' + email);
  }

  public getAccessToken(user: MyRhisUserModel): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}` + '/refreshToken', user);
  }

  public updateUserLangue(uuidUser: string, langue: string) {
    return this.httpClient.get(`${this.baseUrl}` + '/' + uuidUser + '/' +  langue);
  }
}
