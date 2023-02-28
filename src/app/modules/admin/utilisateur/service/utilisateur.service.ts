import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {MyRhisUserModel} from '../../../../shared/model/MyRhisUser.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DateService} from '../../../../shared/service/date.service';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {Observable} from 'rxjs';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService extends GenericCRUDRestService<MyRhisUserModel, String> {

  public restaurant = this.sharedRestaurantService.selectedRestaurant;

  constructor(private pathService: PathService, httpClinent: HttpClient, private dateHelperService: DateService,
              private sharedRestaurantService: SharedRestaurantService) {
    super(httpClinent, `${pathService.getPathSecurity()}/user`);
  }

  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<MyRhisUserModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/All`, filter);
  }

  public verifyUser(user: MyRhisUserModel): Observable<any> {
    return super.add(user, '/confirm');
  }

  public deleteUser(uuidUser: string) {
    return this.httpClient.delete(`${this.baseUrl}` + '/delete/' + uuidUser);
  }

  public isMailExist(email: String) {
    return this.httpClient.get(`${this.baseUrl}` + '/isMailExist/' + email);
  }

  public isUserExist(email: String) {
    return this.httpClient.get(`${this.baseUrl}` + '/isUserExist/' + email);
  }


  public updateUser(user: MyRhisUserModel) {
    return this.httpClient.put(`${this.baseUrl}` + '/update', user);
  }

  public generatePassword(email: string) {
    return this.httpClient.get(`${this.baseUrl}` + '/getPassword/' + email);
  }

  public getUserByUuid(Uuid: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}` + '/' + Uuid);
  }


}

