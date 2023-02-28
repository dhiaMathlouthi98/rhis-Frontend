import {PaginationArgs, PaginationPage} from '../../../model/pagination.args';
import {Observable} from 'rxjs';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {LoiPaysModel} from '../../../model/loi.pays.model';

@Injectable({
  providedIn: 'root'
})
export class LoiPaysService extends GenericCRUDRestService<LoiPaysModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/loiPays`);
  }

  public getAllLoiPaysByPaysWithPagination(codePays: string, paginationArgs: PaginationArgs): Observable<PaginationPage<LoiPaysModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${codePays}`);
  }

  public updateLoiPaysStatus(loi: LoiPaysModel): Observable<Object> {
    return this.httpClient.put(this.baseUrl + '/switchStatus/' + loi.uuid + '/' + loi.status, {});
  }
}
