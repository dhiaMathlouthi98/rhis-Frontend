import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AbsenteismeModel} from '../../../../../shared/model/absenteisme.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenteismeService extends GenericCRUDRestService<AbsenteismeModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/absenteisme`);
  }

  /**
   * Cette methode permet de retourner la liste d'absenteisme par restaurant
   * @param: restaurantId
   */
  public getAbsenteismeByRestaurant(): Observable<AbsenteismeModel[]> {
    return this.httpClient.get<AbsenteismeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  /**
   * Cette methode permet de mettre à jour une liste d'absenteisme
   * @param: listAbsenteisme
   */
  public updateListAbsenteisme(listAbsenteisme: AbsenteismeModel[]): Observable<Object> {
    return this.httpClient.post(this.baseUrl + '/list/' + this.pathService.getUuidRestaurant(), listAbsenteisme);
  }

}
