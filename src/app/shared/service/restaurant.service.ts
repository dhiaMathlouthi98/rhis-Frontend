import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from './generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from './path.service';
import {RestaurantModel} from '../model/restaurant.model';
import {Observable} from 'rxjs';
import {PaginationArgs, PaginationPage} from '../model/pagination.args';
import {SessionService} from './session.service';

@Injectable({providedIn: 'root'})
export class RestaurantService extends GenericCRUDRestService<RestaurantModel, String> {

  constructor(private http: HttpClient, private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathEmployee()}/restaurant`);
  }

  /**
   * Add restaurant
   * @param: entity
   * @param: badge
   */
  public addRestaurant(entity: RestaurantModel, badge: number, uuid: string): Observable<any> {
    return super.add(entity, `/${badge}/${uuid}`);
  }

  /**
   * Get Restaurant with pays and type restaurant by it's id
   * @param: idRestaurant
   */
  public getRestaurantWithPaysAndTypeRestaurantById() {
       return this.httpClient.get(`${this.baseUrl}/paysAndTypeRestaurant/${this.pathService.getUuidRestaurant()}`);
  }

  /**
   * Get Restaurant by id
   */
  public getRestaurantById(uuid?: any): Observable<RestaurantModel> {
    if(!uuid){
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<RestaurantModel>(`${this.baseUrl}/paysAndTypeRestaurant/${uuid}`);
  }


  public getSocieteByRestaurantId(restaurantId: number) {
    return this.httpClient.get(`${this.baseUrl}/${restaurantId}/societe`);
  }

  /**
   * Fetch list restaurant by page
   * @param: paginationArgs
   * @param: filtergetAllWithPaginationAndFilter
   */
  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<RestaurantModel>> {
    let user = '0';
    const profil = this.sessionService.getProfil();
    if (profil === 'administrateur') {
      user = this.sessionService.getUuidUser();
    }
    return super.getAllWithPaginationAndFilter(paginationArgs, `/BySocieteUser/` + this.sessionService.getUuidSociete() + '/' + user, filter);
  }

  /**
   * Setter to restaurant id
   * @param: idRestaurant
   */
  public set restaurantId(idRestaurant: string) {
    this.pathService.setIdRestaurant(idRestaurant);
  }

  /**
   * Setter to restaurant id
   * @param: idRestaurant
   */
  public set restaurantUuid(uuidRestaurant: string) {
    this.pathService.setUuidRestaurant(uuidRestaurant);
  }

  /**
   * Fetch a limited number of restaurants by societe id
   * @param: id
   * @param: limit
   */
  public getLimitedRestaurantBySocieteId(uuidSociete: string, limit: number): Observable<String[]> {
    return this.httpClient.get<String[]>(`${this.baseUrl}/societe/${uuidSociete}?limit=${limit}`);
  }

  /**
   * Fetch list restaurant for all type of profil
   * @param: idSociete
   * @param: idUSer
   */
  public getRestaurantsBySocieteId(uuidSociete: string): Observable<RestaurantModel[]> {
    return this.httpClient.get<RestaurantModel[]>(`${this.baseUrl}/BySociete/${uuidSociete}`);
  }

  public getRestaurantsByUser(uuidUser: string): Observable<RestaurantModel[]> {
    return this.httpClient.get<RestaurantModel[]>(`${this.baseUrl}/ByUser/${uuidUser}`);
  }

  public getRestaurantsWithNbrEmployeeActifAndVente(uuidUser: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/RestaurantByUser/${uuidUser}/card`);
  }

  public getRestaurantsWithNbrEmployeeActifAndVenteByProfil(uuidProfil: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/getRestaurantByProfil/${uuidProfil}`);
  }

  public getRestaurantsWithNbrEmployeeActifAndVenteByPage(paginationArgs: any, uuidUser: string, order: number, filter: any): Observable<any> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/RestaurantByUser/${uuidUser}/${order}/table`, filter);
  }

  public getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(uuidFranchise: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/RestaurantByFranchise/${uuidFranchise}/card`);
  }

  public getRestaurantsWithNbrEmployeeActifAndVenteByFranchiseByPage(paginationArgs: any, order: number, uuidFranchise: string, filter: any): Observable<any> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/RestaurantByFranchise/${uuidFranchise}/${order}/table`, filter);
  }

  public getListWeekFromMonthByRestaurant(dateJournee: string, uuid?: any): Observable<any[]> {
    if(!uuid){
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<any>(`${this.baseUrl}/weekListOfMonth/${uuid}?dateJournee=${dateJournee}`);
  }

  public getIPAddress(): Observable<object> {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  public getRestaurantsHaveGroupeTravailLibelleFrom(libelle: string, restaurantsIds: number[]): Observable<number[]> {
    return this.http.post<number[]>(`${this.baseUrl}?libelle=${libelle}`, restaurantsIds);
  }
}
