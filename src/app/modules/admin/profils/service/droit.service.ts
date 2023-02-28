import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {DroitModel} from '../../../../shared/model/droit.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DroitPkModel} from '../../../../shared/model/droitPk.model';

@Injectable({
  providedIn: 'root'
})
export class DroitService extends GenericCRUDRestService<DroitModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient) {
    super(httpClinent, `${pathService.getPathSecurity()}/droit`);

  }

  updateDroit(droit: DroitPkModel, permission: number): Observable<Object> {
    return this.httpClient.put(`${this.baseUrl}` + '/update/' + permission, droit);
  }

  /**
   * recupere les droits par utilisateurs
   */
  public getListDroit(email: string): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseUrl}` + '/droitList/' + email);
  }

  /**
   * recupere les droits par utilisateurs
   */
  public getListDroitByProfilUuid(uuidProfil: string): Observable<DroitModel[]> {
    return this.httpClient.get<DroitModel[]>(`${this.baseUrl}` + '/ByProfil/' + uuidProfil);
  }

  public getListDroitByRestaurant(uuidRestaurant: string): Observable<DroitModel[]> {
    return this.httpClient.get<DroitModel[]>(`${this.baseUrl}` + '/ByRestaurant/' + uuidRestaurant);
  }
}
