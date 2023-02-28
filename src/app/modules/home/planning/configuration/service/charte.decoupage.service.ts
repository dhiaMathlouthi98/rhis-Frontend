import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {CharteDecoupageModel} from '../../../../../shared/model/charte.decoupage.model';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CharteDecoupageService extends GenericCRUDRestService<CharteDecoupageModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/charteDecoupage`);
  }

  /**
   * Cette methode permet de ajouter une liste des chartes de decoupage par restaurant
   * @param restaurantId
   * @param charte
   */
  public persistCharteDecoupage(charteDecoupage: CharteDecoupageModel[]) {
    return this.httpClient.post(this.baseUrl + '/' + this.pathService.getUuidRestaurant(), charteDecoupage);
  }

  /**
   * Cette methode permet de retourner la liste des chartes de decoupage par restaurant
   * @param restaurantId
   */
  public getAllCharteDecoupageByRestaurant(): Observable<CharteDecoupageModel[]> {
    return this.httpClient.get<CharteDecoupageModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }
}
