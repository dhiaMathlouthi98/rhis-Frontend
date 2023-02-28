import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PhaseModel} from '../../../../../shared/model/phase.model';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhaseService extends GenericCRUDRestService<PhaseModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/phase`);
  }

  public getAllPhaseByRestaurantOrderByTime(): Observable<PhaseModel[]> {
    return this.httpClient.get<PhaseModel[]>(this.baseUrl + '/ord/' + this.pathService.getUuidRestaurant());
  }

  public getPhaseByLibelleAndRestaurant(libelle: string): Observable<PhaseModel> {
    return this.httpClient.get<PhaseModel>(this.baseUrl + '/' + libelle + '/' + this.pathService.getUuidRestaurant());
  }

  public checkListLibelleExists(phaseList: PhaseModel[]): Observable<Object> {
    return this.httpClient.post(this.baseUrl + '/' + this.pathService.getUuidRestaurant(), phaseList);
  }

}
