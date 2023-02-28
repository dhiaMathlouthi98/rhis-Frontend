import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {EmployeeModel} from '../../../../shared/model/employee.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {DpaeStatut} from '../../../../shared/model/gui/dpae.model';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DpaeService extends GenericCRUDRestService<EmployeeModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient) {
    super(httpClinent, `${pathService.getPathEmployee()}/dpae`);
  }

  public deposerDPAE(uuidEmploye: String): Observable<DpaeStatut> {
    return this.httpClient.post<DpaeStatut>(`${this.baseUrl}/deposer/${uuidEmploye}`, null);
  }

  public checkStatut(uuidEmploye: String): Observable<DpaeStatut> {
    return this.httpClient.get<DpaeStatut>(`${this.baseUrl}/state/${uuidEmploye}`);
  }

}
