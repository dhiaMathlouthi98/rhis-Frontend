import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {ProductiviteModel} from '../../../../../shared/model/productivite.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductiviteService extends GenericCRUDRestService<ProductiviteModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/productivite`);
  }

  /**
   * Cette methode permet de retourner la liste de productivite par restaurant
   * @param: restaurantId
   */
  public getProductiviteByRestaurant(): Observable<ProductiviteModel[]> {
    return this.httpClient.get<ProductiviteModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  /**
   * Cette methode permet de mettre à jour une liste de productivite
   * @param: listAbsenteisme
   */
  public updateListProductivite(listProductivite: ProductiviteModel[]): Observable<Object> {
    return this.httpClient.post(this.baseUrl + '/list/' + this.pathService.getUuidRestaurant(), listProductivite);
  }
}
