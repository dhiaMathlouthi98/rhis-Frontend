import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {TypeContratModel} from '../../../../shared/model/type.contrat.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeContratService extends GenericCRUDRestService<TypeContratModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/typeContrat/`);
  }

  public getAllTypeContratByRestaurant(): Observable<TypeContratModel[]> {
    return this.httpClient.get<TypeContratModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/all');
  }

  deleteTypeContrat(uuidTypeContrat: string): Observable<Object> {
    return super.remove(uuidTypeContrat, 'delete/');
  }

  updateTypeContrat(typeContrat: TypeContratModel): Observable<Object> {
    return super.update(typeContrat, this.pathService.getUuidRestaurant() + '/update');
  }

  addNewTypeContrat(typeContrat: TypeContratModel): Observable<Object> {
    return super.add(typeContrat, this.pathService.getUuidRestaurant() + '/add');
  }

  /**
   * recupere tous les types contrats actifs par restaurant
   */
  public getAllTypeContratActifByRestaurant(): Observable<TypeContratModel[]> {
    return this.httpClient.get<TypeContratModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/dispo/');
  }
}
