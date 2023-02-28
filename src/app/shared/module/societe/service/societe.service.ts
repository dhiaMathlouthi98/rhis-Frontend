import {Injectable} from '@angular/core';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {SocieteModel} from '../../../model/societe.model';
import {Observable} from 'rxjs';
import {PaginationArgs, PaginationPage} from '../../../model/pagination.args';
import {SessionService} from '../../../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class SocieteService extends GenericCRUDRestService<SocieteModel, string> {

  constructor(private http: HttpClient, private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathEmployee()}/societe`);
  }

  /**
   * Get societe by restaurant id
   */
  public getSocieteByRestaurantId(): Observable<SocieteModel> {
    return this.httpClient.get<SocieteModel>(`${this.baseUrl}/restaurant/${this.pathService.getUuidRestaurant()}`);
  }

  /**
   * Fetch list societe by page and filter
   * @param: paginationArgs
   * @param: filter
   */
  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<SocieteModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/ByUser/` + this.sessionService.getUuidUser() + '/' + this.sessionService.getProfil(), filter);
  }


  /**
   * Get societe by id and with pays
   * @param: idSociete
   */
  public getSocieteByIdWithPays(uuidSociete: string): Observable<SocieteModel> {

    return this.httpClient.get<SocieteModel>(`${this.baseUrl}/pays/${uuidSociete}`);
  }

  public getAllSociete() {

    return this.httpClient.get<SocieteModel[]>(`${this.baseUrl}/allSociete/`);
  }

  public getSocieteByRestaurantUuid(uuidRestaurant: string): Observable<SocieteModel> {
    return this.httpClient.get<SocieteModel>(`${this.baseUrl}/restaurant/` + uuidRestaurant);
  }
}
