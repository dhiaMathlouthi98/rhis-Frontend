import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {DisciplineModel} from '../../../../shared/model/discipline.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisciplineService extends GenericCRUDRestService<DisciplineModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/disciplinaire`);
  }

  /**
   * Fetch the list of "Discipline" by idEmployee and with pagination
   * @param paginationArgs
   * @param idEmployee
   */
  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, idEmployee: string): Observable<PaginationPage<DisciplineModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/all/${idEmployee}`);
  }

  /**
   * Add a new 'discipline'
   * @param entity
   */
  public add(entity: DisciplineModel): Observable<any> {
    return super.add(entity, '/add');
  }

  /**
   * Remove a discipline by id
   * @param id
   */
  public remove(id: string): Observable<Response> {
    return super.remove(id, `/delete/`);
  }
}
