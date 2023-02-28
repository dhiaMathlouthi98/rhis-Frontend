import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {FormationModel} from '../../../../shared/model/formation.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {FormationEmployeeModel} from '../../../../shared/model/formation.employee.model';

@Injectable({
  providedIn: 'root'
})
export class FormationEmployeeService extends GenericCRUDRestService<FormationModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/formationEmployee`);
  }

  public getAllFormationByEmployee(idEmployee: number): Observable<FormationEmployeeModel[]> {
    return this.httpClient.get<FormationEmployeeModel[]>(`${this.baseUrl}/all/` + idEmployee);
  }

  public getAllActiveFormationByEmployee(idEmployee: string): Observable<FormationEmployeeModel[]> {
    return this.httpClient.get<FormationEmployeeModel[]>(`${this.baseUrl}/all/active/` + idEmployee);
  }

  public saveListFormationEmployee(listFormationEmployee: FormationEmployeeModel[]): Observable<Object> {
    return this.httpClient.post(`${this.baseUrl}/save`, listFormationEmployee);
  }

  public deleteFormationEmployee(idEmployee: string, idFormation: string): Observable<Object> {
    return this.httpClient.delete(`${this.baseUrl}/delete/` + idEmployee + '/' + idFormation);
  }
}
