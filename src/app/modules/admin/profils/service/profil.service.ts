import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {ProfilModel} from '../../../../shared/model/profil.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DateService} from '../../../../shared/service/date.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import {Observable} from 'rxjs';
import {SessionService} from '../../../../shared/service/session.service';
import {SocieteModel} from '../../../../shared/model/societe.model';
import {RestaurantModel} from '../../../../shared/model/restaurant.model';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {AffectationModel} from '../../../../shared/model/affectation.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilService extends GenericCRUDRestService<ProfilModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient,
              private dateHelperService: DateService,
              private sharedRestaurantService: SharedRestaurantService,
              private sessionService: SessionService,
              private http: HttpClient) {
    super(httpClinent, `${pathService.getPathSecurity()}/profil`);
  }

  /**
   * recupere les profils par restaurant
   */
  public getProfilsByRestaurant(): Observable<ProfilModel[]> {
    return this.httpClient.get<ProfilModel[]>(`${this.baseUrl}` + '/findByRestaurant/' + this.sessionService.getUuidRestaurant());
  }

  /**
   * recupere les profils globaux
   */
  public getGlobalProfils(): Observable<ProfilModel[]> {
    return this.httpClient.get<ProfilModel[]>(`${this.baseUrl}` + '/Global/');
  }

  /**
   * ajout d'un profil superviseur
   */
  public addSuperviseur(entity: any, profil: string): Observable<ProfilModel> {
    return super.add(entity, `/addGlobalSuperviseur/` + profil);
  }

  /**
   * ajout profil franchise
   */
  public addFranchise(listSociete: SocieteModel[], profil: string) {
    return this.http.post(`${this.baseUrl}` + '/addGlobalfranchise/' + profil, listSociete);
  }


  /**
   * ajout profil administrateur
   */
  public addAdministrateur(listrestaurant: RestaurantModel[], profil: string) {
    return this.http.post(`${this.baseUrl}` + '/addGlobalAdmin/' + profil, listrestaurant);
  }

  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<AffectationModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/ListGlobal`, filter);
  }

  public deleteProfilGlobal(uuidProfil: String): Observable<any> {
    return this.http.delete(`${this.baseUrl}` + '/globalProfil/' + uuidProfil);
  }

  public getProfilByid(uuidProfil: String): Observable<ProfilModel> {
    return this.http.get<ProfilModel>(`${this.baseUrl}` + '/byId/' + uuidProfil);
  }

  public getSocieteProfilAdmin(uuidProfil: String): Observable<SocieteModel[]> {
    return this.http.get<SocieteModel[]>(`${this.baseUrl}` + '/bySocieteForAdmin/' + uuidProfil);
  }

  public updateProfil(profil: ProfilModel): Observable<ProfilModel> {
    return this.http.put<ProfilModel>(`${this.baseUrl}` + '/update', profil);
  }

  public updateProfilFranchise(uuidProfil: string, societeList: SocieteModel[]): Observable<ProfilModel> {
    return this.http.put<ProfilModel>(`${this.baseUrl}` + '/updateFranchise/' + uuidProfil, societeList);
  }

  public updateProfilAdmin(uuidProfil: string, restaurantList: RestaurantModel[]): Observable<ProfilModel> {
    return this.http.put<ProfilModel>(`${this.baseUrl}` + '/updateAdmin/' + uuidProfil, restaurantList);
  }

  public getProfilsByFranchise(uuidFranchise: String): Observable<ProfilModel[]> {
    return this.http.get<ProfilModel[]>(`${this.baseUrl}` + '/findProfilByFranchise/' + uuidFranchise);
  }
}
