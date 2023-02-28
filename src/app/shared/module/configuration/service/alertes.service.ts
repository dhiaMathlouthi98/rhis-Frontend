import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AlerteModel} from '../../../model/alerte.model';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {PathService} from '../../../service/path.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertesService extends GenericCRUDRestService<AlerteModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/alertes/`);
  }

  getAllAlertesByRestaurant(uuidRestaurant?: any): Observable<AlerteModel[]> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<AlerteModel[]>(`${this.baseUrl}` + uuid);
  }

  updateAllAlertesByRestaurant(listeAlerte: AlerteModel[], uuidRestaurant?: any): Observable<Object> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.put(`${this.baseUrl}` + uuid + '/updateList', listeAlerte);
  }

  updateAlertesByRestaurant(alerte: AlerteModel, uuidRestaurant?: string): Observable<Object> {
    let uuid: string;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.put(`${this.baseUrl}` + uuid + '/update', alerte);
  }

  public copierParamAlerte(uuidRestaurant: string, listRestoIds: number[]): Observable<any> {
    return this.httpClient.put<any>(this.baseUrl + 'copy/' + uuidRestaurant + '/updateList', listRestoIds);
  }
}
