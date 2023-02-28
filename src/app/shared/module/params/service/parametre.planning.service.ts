import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {Injectable} from '@angular/core';
import {ParametrePlanningModel} from '../../../model/parametre.planning.model';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DateService} from '../../../service/date.service';

@Injectable({
  providedIn: 'root'
})
export class ParametrePlanningService extends GenericCRUDRestService<ParametrePlanningModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/parametrePlanning`);
  }

  public getParametrePlanningWithJourOrdreDernierPosteByRestaurant(uuidRestaurant?: any): Observable<ParametrePlanningModel> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<ParametrePlanningModel>(this.baseUrl + '/' + uuid + '/withJourOrdre');
  }

  public updateParametrePlanning(parametrePlanning: ParametrePlanningModel, uuidRestaurant?: string): Observable<ParametrePlanningModel> {
    let uuid: string;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    this.setCorrectDateFormat(parametrePlanning);

    return this.httpClient.put(this.baseUrl + '/' + uuid, parametrePlanning);
  }

  private setCorrectDateFormat(parametrePlanning: ParametrePlanningModel) {
    parametrePlanning.jourOrdreDernierPostes.forEach((item) => {
      if (item.dernierPoste) {
        item.dernierPoste = this.dateService.setCorrectTime(item.dernierPoste);
      }
    });
  }

  public copierParamPlanning(uuidRestaurant: string, listRestoIds: number[]): Observable<any> {
    return this.httpClient.put<any>(this.baseUrl + '/copy/' + uuidRestaurant, listRestoIds);
  }
}
