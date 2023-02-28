import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {PathService} from '../../../service/path.service';
import {Observable} from 'rxjs';
import {TypeRestaurantModel} from '../../../model/typeRestaurant.model';

@Injectable({
  providedIn: 'root'
})
export class TypeRestaurantService extends GenericCRUDRestService<TypeRestaurantModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/typeRestaurant`);
  }

  /**
   * Get the path to upload the logo
   */
  public getUploadUrl() {
    return `${this.pathService.getPathEmployee()}/UploadLogos`;
  }

  /**
   * Check if nomType exists or not
   * @param: nomType
   */
  public isNameDoesNotExist(nomType: string, uuid: string): Observable<any> {
    const requestParam = uuid ? `?id= ${uuid}` : '';
    return this.httpClient.get(`${this.baseUrl}/nameExist/${nomType}${requestParam}`);
  }

  public getAllActive(): Observable<TypeRestaurantModel[]> {
    return this.httpClient.get<TypeRestaurantModel[]>(`${this.baseUrl}/active`);
  }
}
