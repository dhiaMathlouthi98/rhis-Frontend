import {Observable} from 'rxjs';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PositionnementModel} from '../../../../shared/model/positionnement.model';

@Injectable({
  providedIn: 'root'
})
export class PositionnementService extends GenericCRUDRestService<PositionnementModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/chartePos/`);
  }

  public getAllPositionnementByCharte(uuidCharte: string): Observable<PositionnementModel[]> {
    return this.httpClient.get<PositionnementModel[]>(this.baseUrl + this.pathService.getUuidRestaurant() + '/' + uuidCharte + '/positionnement');
  }

  public getTauxMOByRestaurant(): Observable<number> {
    return this.httpClient.get<number>(this.baseUrl + this.pathService.getUuidRestaurant() + '/tauxMO');
  }

  public saveListPositionnements(uuidCharte: string, listPositionnementToSave: PositionnementModel[]): Observable<PositionnementModel[]> {
    return this.httpClient.post<PositionnementModel[]>(this.baseUrl + uuidCharte, listPositionnementToSave);

  }
}
