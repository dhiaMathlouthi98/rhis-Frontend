import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from '../../shared/service/path.service';
import {MyRhisUserModel} from '../../shared/model/MyRhisUser.model';

@Injectable({
  providedIn: 'root'
})
export class CreatePasswordService {
  host;
  constructor(private http: HttpClient, private pathService: PathService) {
    this.host = this.pathService.hostServerSecurity;
  }

  public verifyTokenToCreatePassword(token: string): Observable<any> {
    return this.http.get(this.host + '/user/VerifyToken/' + token);
  }
  public setPasswordToUser(user: MyRhisUserModel): Observable<any> {
    return this.http.put(this.host + '/user/createPasswordUser' , user);
  }
}
