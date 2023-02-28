import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {ProfilModel} from '../../../../shared/model/profil.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DateService} from '../../../../shared/service/date.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import {SessionService} from '../../../../shared/service/session.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfilRestaurantService extends GenericCRUDRestService<ProfilModel, String> {

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
   * ajout d'un profil
   */
  public add(entity: ProfilModel): Observable<ProfilModel> {
    return super.add(entity, `/add`);
  }
}
