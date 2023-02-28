import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {ProfilModel} from '../../../../shared/model/profil.model';
import {EcranModel} from '../../../../shared/model/ecran.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DateService} from '../../../../shared/service/date.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import {SessionService} from '../../../../shared/service/session.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EcranService extends GenericCRUDRestService<EcranModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient,
              private dateHelperService: DateService,
              private sharedRestaurantService: SharedRestaurantService,
              private sessionService: SessionService) {
    super(httpClinent, `${pathService.getPathSecurity()}/ecran`);
  }

  /**
   * recupere les ecrans par restaurant
   */
  public getEcranByRestaurant(): Observable<ProfilModel[]> {
    return this.httpClient.get<ProfilModel[]>(`${this.baseUrl}` + '/ByRestaurant/' + this.sessionService.getUuidRestaurant());
  }

  /**
   * recupere les ecrans par restaurant
   */
  public getEcranByDefaultRestaurant(): Observable<ProfilModel[]> {
    return this.httpClient.get<ProfilModel[]>(`${this.baseUrl}` + '/ByDefaultRestaurant');
  }
}
