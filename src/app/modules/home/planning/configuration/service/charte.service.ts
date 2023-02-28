import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CharteModel} from '../../../../../shared/model/charte.model';
import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CharteService extends GenericCRUDRestService<CharteModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/charte`);
  }

  public getAllCharteByRestaurant(): Observable<CharteModel[]> {
    return this.httpClient.get<CharteModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  /**
   * Permet d'ajouter une charte par libelle
   * @param: libelle
   */
  public addByLibelle(libelle: string): Observable<Object> {
    const newCharte = new CharteModel();
    newCharte.libelle = libelle;
    return this.httpClient.post(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/', newCharte);
  }

}
