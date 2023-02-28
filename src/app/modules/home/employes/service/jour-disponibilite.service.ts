import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {SecuriteSocialeModel} from '../../../../shared/model/securiteSociale.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JourDisponibiliteService extends GenericCRUDRestService<SecuriteSocialeModel, number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/jourDisponibilite`);
  }

  /**
   * Remove all jours disponibilite by id disponibilite
   * @param: id
   */
  public removeOddByDisponibiliteId(id: string): Observable<Response> {
    return this.httpClient.delete<Response>(`${this.baseUrl}/${id}`);
  }
}
