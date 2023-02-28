import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {ModeVenteModel} from '../../../../shared/model/modeVente.model';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeVenteService extends GenericCRUDRestService<ModeVenteModel, string> {

  constructor(httpClient: HttpClient, private pathService: PathService) {
    super(httpClient, `${pathService.getPathEmployee()}/modeVente`);
  }

  /**
   * Fetch all mode vente by Restaurant id
   */
  getAll(apiUrl?: string): Observable<ModeVenteModel[]> {
    return super.getAll(`/${this.pathService.getUuidRestaurant()}/all`);
  }

  /**
   * Add a mode vente in a restaurant by restaurant id
   * @param: entity
   */
  add(entity: ModeVenteModel, apiUrl?: string): Observable<any> {
    return super.add(entity, `/${this.pathService.getUuidRestaurant()}/add`);
  }

  /**
   * Update mode vente of a restaurant by restaurant id
   * @param: entity
   */
  update(entity: ModeVenteModel, apiUrl?: string): Observable<ModeVenteModel> {
    return super.update(entity, `/${this.pathService.getUuidRestaurant()}/update`);
  }

  /**
   * Remove mode vente by id
   * @param: id
   */
  remove(id: string, apiUrl?: string): Observable<any> {
    return super.remove(id, `/delete/`);
  }

  getAllByIdVenteJournaliere(uuidVenteJournaliere: string): Observable<ModeVenteModel[]> {
    return this.httpClient.get<ModeVenteModel[]>(`${this.baseUrl}/venteJournalieres/${uuidVenteJournaliere}`);
  }
}
