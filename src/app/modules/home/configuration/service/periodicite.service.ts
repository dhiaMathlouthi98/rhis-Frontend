import {Injectable} from '@angular/core';
import {ConfigTypeService} from './config-type.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {PeriodiciteModel} from '../../../../shared/model/periodicite.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeriodiciteService extends ConfigTypeService<PeriodiciteModel> {

  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'periodicite');
  }

  /**
   * Permet de recuperer la liste des periodicites actifs
   */
  public getAllActivePeriodicite(): Observable<PeriodiciteModel[]> {
    return this.httpClient.get<PeriodiciteModel[]>(`${this.baseUrl}/active/all`);
  }
}
