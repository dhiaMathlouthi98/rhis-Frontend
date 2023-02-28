import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TypeEvenementModel} from '../../../../shared/model/type.evenement.model';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TypeEvenementService extends GenericCRUDRestService<TypeEvenementModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/typeEvent`);
  }

  /**
   * Fetch all type events by Restaurant id
   */
  public getAllTypeEvenementByRestaurant(): Observable<TypeEvenementModel[]> {
    return this.httpClient.get<TypeEvenementModel[]>(`${this.baseUrl}/` + this.pathService.getUuidRestaurant() + '/all');
  }

  /**
   * Fetch all type events active true and Restaurant id
   */
  public getAllTypeEvenementActiveByRestaurant(): Observable<TypeEvenementModel[]> {
    return this.httpClient.get<TypeEvenementModel[]>(`${this.baseUrl}/` + this.pathService.getUuidRestaurant() + '/active/all');
  }

  /**
   * Remove a type event by id
   * @param: id
   */
  public remove(uuid: string): Observable<Response> {
    return super.remove(uuid, `/delete/`);
  }

  /**
   * add a type event
   * @param: entity
   */
  public add(entity: TypeEvenementModel): Observable<TypeEvenementModel> {
    return super.add(entity, `/${this.pathService.getUuidRestaurant()}/add`);
  }

  /**
   * Update type event
   * @param: entity
   */
  public update(entity: TypeEvenementModel): Observable<any> {
    return super.update(entity, `/${this.pathService.getUuidRestaurant()}/update`);
  }
}
