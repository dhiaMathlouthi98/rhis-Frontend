import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {ModeVenteParPhaseModel} from '../../../../../shared/model/modeVenteParPhase.model';
import {PathService} from '../../../../../shared/service/path.service';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ModeVenteParPhaseService extends GenericCRUDRestService<ModeVenteParPhaseModel, number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/mododeVente/phase`);
  }

  /**
   * Get all `mode vente par pahse` by restaurant id
   * @param: apiUrl
   */
  public getAll(apiUrl?: string): Observable<ModeVenteParPhaseModel[]> {
    return super.getAll(`/${this.pathService.getUuidRestaurant()}/all`);
  }

  /**
   * Update all `mode vente par phase`
   * @param: modesVenteParPhase
   */
  public updateAll(modesVenteParPhase: ModeVenteParPhaseModel[]): Observable<ModeVenteParPhaseModel[]> {
    return this.httpClient.put<ModeVenteParPhaseModel[]>(`${this.baseUrl}/update`, modesVenteParPhase);
  }

  /**
   * Get all `mode vente par phase` by `mode vente` id
   * @param: idModeVente
   */
  public getByModeVenteId(uuidModeVente: string): Observable<ModeVenteParPhaseModel[]> {
    return this.httpClient.get<ModeVenteParPhaseModel[]>(`${this.baseUrl}/${uuidModeVente}`);
  }
}
