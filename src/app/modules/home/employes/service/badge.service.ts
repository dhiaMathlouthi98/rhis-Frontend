import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {BadgeModel} from '../../../../shared/model/badge.model';
import {Observable} from 'rxjs';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';

@Injectable({
  providedIn: 'root'
})
export class BadgeService extends GenericCRUDRestService<BadgeModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/badge`);
  }

  public getAllBadgeDisponible(): Observable<BadgeModel[]> {
    return super.getAll(`/${this.pathService.getUuidRestaurant()}/dispo`);
  }

  public addBadge(badge: BadgeModel): Observable<Object> {
    return super.add(badge, '/' + this.pathService.getUuidRestaurant() + '/add');
  }

  public deleteBadge(idBadge: string): Observable<Object> {
    return super.remove(idBadge, '/delete/');
  }

  public updateListBadge(listBadge: BadgeModel[]): Observable<Object> {
    return this.httpClient.put(`${this.baseUrl}/` + this.pathService.getUuidRestaurant() + '/update/list', listBadge);
  }

  public updateBadge(badge: BadgeModel): Observable<Object> {
    return super.update(badge, '/' + this.pathService.getUuidRestaurant() + '/update');
  }

  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<BadgeModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${this.pathService.getUuidRestaurant()}/all/paginated`, filter);
  }
}
