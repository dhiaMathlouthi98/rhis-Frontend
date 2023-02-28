import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FranchiseModel} from 'src/app/shared/model/franchise.model';
import {GenericCRUDRestService} from 'src/app/shared/service/generic-crud.service';
import {PathService} from 'src/app/shared/service/path.service';
import {SessionService} from 'src/app/shared/service/session.service';
import {PaginationArgs, PaginationPage} from 'src/app/shared/model/pagination.args';
import {RestaurantModel} from '../../../../shared/model/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class FranchiseService extends GenericCRUDRestService<FranchiseModel, string> {

  constructor(private http: HttpClient, private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathEmployee()}/franchises`);
  }

  /**
   * get list franchise by page and filter
   * @param: paginationArgs
   * @param: filter
   */
  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<FranchiseModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/all`, filter);
  }

  /**
   * Get societe by restaurant id
   */
  public getListRestoByFranchise(paginationArgs: PaginationArgs, filter: any, uuidFranchise: any): Observable<any> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${uuidFranchise}/restaurants`, filter);
  }

  /**
   * Get liste totale des franchises
   */
  public getAllFranchises(filterName: string, column: string, order: number) {
    if (!column) {
      column = 'nom';
    }
    const pagination = 'page=0&size=' + 0x7fffffff;
    return this.httpClient.get<FranchiseModel[]>(`${this.baseUrl}/all?${pagination}&nom=${filterName}&column=${column}&order=${order}`);
  }

  /**
   * Get franchise by uuid
   * @param: uuidFranchise
   */
  public getFranchiseByUuid(uuidFranchise: string): Observable<FranchiseModel> {
    return this.httpClient.get<FranchiseModel>(`${this.baseUrl}/${uuidFranchise}`);
  }

  /**
   * Delete franchise by uuid
   */
  public deleteFranchise(uuidFranchise: any): Observable<any> {
    return super.remove(uuidFranchise, `/delete/`);
  }

  public addFranchise(franchise: FranchiseModel): Observable<FranchiseModel> {
    return super.add(franchise, `/create`);
  }

  public updateFranchise(franchise: FranchiseModel): Observable<FranchiseModel> {
    return super.update(franchise, `/update`);
  }

  public getRestaurantByFranchise(uuidFranchise: string): Observable<RestaurantModel[]> {
    return this.httpClient.get<RestaurantModel[]>(`${this.baseUrl}/${uuidFranchise}/list-restaurants`);
  }
}
