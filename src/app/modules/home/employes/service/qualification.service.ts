import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {QualificationModel} from '../../../../shared/model/qualification.model';
import {Observable} from 'rxjs';
import {PaginationArgs} from '../../../../shared/model/pagination.args';
import {PathService} from '../../../../shared/service/path.service';

@Injectable({
  providedIn: 'root'
})
export class QualificationService extends GenericCRUDRestService<QualificationModel, String> {

  constructor(httpClient: HttpClient, private pathService: PathService) {
    super(httpClient, `${pathService.getPathEmployee()}/qualification`);
  }

  getAllQualificationByEmployee(paginationArgs: PaginationArgs, idEmployee: string): Observable<QualificationModel[]> {
    return this.httpClient.get<QualificationModel[]>(`${this.baseUrl}/all/${idEmployee}`);
  }

  getAllActiveQualificationByEmployee(paginationArgs: PaginationArgs, idEmployee: string): Observable<QualificationModel[]> {
    return this.httpClient.get<QualificationModel[]>(`${this.baseUrl}/all/active/${idEmployee}`);
  }

  deleteQualificationByIdPositionTravailAndIdEmployee(idEmployee: string, idPositionTravail: string): Observable<Object> {
    return this.httpClient.delete(`${this.baseUrl}/${idEmployee}/${idPositionTravail}`);
  }

  /**
   * Permet d'ajouter une liste de qualifications
   * @param competences , idEmployee
   */
  saveQualifications(competences: QualificationModel[], idEmployee: number): Observable<Object> {
    return this.httpClient.post(`${this.baseUrl}/save/${idEmployee}`, competences);
  }
}
