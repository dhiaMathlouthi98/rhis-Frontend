import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VisiteMedicaleModel} from '../../../../shared/model/visiteMedicale.model';

@Injectable({
  providedIn: 'root'
})
export class VisiteMedicalService extends GenericCRUDRestService<VisiteMedicaleModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/visiteMedicale`);
  }

  public getAllVisiteMedicalByEmployee(idEmployee: number): Observable<VisiteMedicaleModel[]> {
    return super.getAll(`/all/` + idEmployee);
  }

  public saveVisiteMedical(visiteMedical: VisiteMedicaleModel): Observable<Object> {
    return super.add(visiteMedical, `/add`);
  }

  public updateVisiteMedical(visiteMedical: VisiteMedicaleModel): Observable<Object> {
    return super.update(visiteMedical, `/update`);
  }

  public deleteVisiteMedical(idVisiteMedical): Observable<Object> {
    return super.remove(idVisiteMedical, `/delete/`);
  }
}
