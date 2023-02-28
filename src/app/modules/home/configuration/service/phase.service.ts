import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PhaseModel} from '../../../../shared/model/phase.model';
import {PathService} from '../../../../shared/service/path.service';

@Injectable({
  providedIn: 'root'
})
export class PhaseService extends GenericCRUDRestService<PhaseModel, number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/phase`);
  }

  /**
   * Get all `phase` by restaurant
   * @param: apiUrl
   */
  public getAll(apiUrl?: string): Observable<PhaseModel[]> {
    return super.getAll(`/${this.pathService.getUuidRestaurant()}`);
  }

  /**
   * Get all `phase` by restaurant and ordered chronologically
   */
  public getAllByRestaurantIdOrderByTime(): Observable<PhaseModel[]> {
    return this.httpClient.get<PhaseModel[]>(`${this.baseUrl}/ord/${this.pathService.getUuidRestaurant()}`);
  }
}
