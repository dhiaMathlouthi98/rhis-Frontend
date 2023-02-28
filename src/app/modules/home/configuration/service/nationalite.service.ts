import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {NationaliteModel} from '../../../../shared/model/nationalite.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NationaliteService extends GenericCRUDRestService<NationaliteModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/nationalite`);

  }

  public getNationaliteByEmployee(idEmployee) {
    return this.httpClient.get(this.baseUrl + '/employee/' + idEmployee);
  }

  /**
   * Get all nationnlite
   * */
  public getAll(): Observable<NationaliteModel[]> {
    return super.getAll('/all');
  }

  /**
   * get nationalte by restaurant
   */
  public getNationaliteByRestaurant(uuidRestaurant?: any) {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get(this.baseUrl + '/restaurant/' + uuid);
  }

  /**
   * modifier la list de des nationalités
   * @param :listNationalite
   */
  public updateListNationalite(listNationalite: NationaliteModel[]) {
    return this.httpClient.put(this.baseUrl + '/', listNationalite);
  }

}
