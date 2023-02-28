import {PaginationArgs, PaginationPage} from '../../../model/pagination.args';
import {Observable} from 'rxjs';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LoiRestaurantModel} from '../../../model/loi.restaurant.model';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';

@Injectable({
  providedIn: 'root'
})
export class LoiRestaurantService extends GenericCRUDRestService<LoiRestaurantModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/restaurantLaw`);
  }

  public getAllWithPagination(paginationArgs: PaginationArgs, restaurantUuid?: string): Observable<PaginationPage<LoiRestaurantModel>> {
    const uuid = restaurantUuid || this.pathService.getUuidRestaurant();
    return super.getAllWithPaginationAndFilter(paginationArgs, `/active/${uuid}`);
  }

  /**
   * Get LoiRestaurantModel by code name
   * @param: codeName
   */
  public getOneByCodeName(codeName: string): Observable<LoiRestaurantModel> {
    return this.httpClient.get<LoiRestaurantModel>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/codeName/${codeName}`);
  }

  public update(loiRestaurant: LoiRestaurantModel, restaurantUuid?: string): Observable<any> {
    const uuid = restaurantUuid || this.pathService.getUuidRestaurant();
    return this.httpClient.put(this.baseUrl + '/' + uuid + '/', loiRestaurant);
  }

  public getAllActifLoiRestaurantByIdRestaurant(): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  /**
   * get  loi groupe travail by CodeName ( longueurMiniBreak and longueurMaxiShiftSansBreak)
   * @param: idGroupeTravail
   * @param :longueurMiniBreak
   * @param: longueurMaxiShiftSansBreak
   */
  public getRestaurantLawUsedInVerificationContraintSocialByCodeName(longueurMiniBreak: String, longueurMaxiShiftSansBreak: String, nbHeuresMinSansCoupure: String, longueurMiniShift: string, longueurMaxiBreak: String, contratMinSansCoupure: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + longueurMiniBreak + '/' + longueurMaxiShiftSansBreak + '/' + nbHeuresMinSansCoupure + '/' + longueurMiniShift + '/' + longueurMaxiBreak + '/'+ contratMinSansCoupure);
  }

  public copyLoiRestaurant(uuidRestaurant: string, listeRestaurantIds: number[]): Observable<void> {
    return this.httpClient.put<void>(`${this.baseUrl}/copy/${uuidRestaurant}`, listeRestaurantIds);
  }
}
