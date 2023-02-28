import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {PositionTravailModel} from '../../../../shared/model/position.travail.model';

@Injectable({
  providedIn: 'root'
})
export class PositionTravailService extends GenericCRUDRestService<PositionTravailModel, string> {

  constructor(httpClient: HttpClient, private pathService: PathService) {
    super(httpClient, `${pathService.getPathEmployee()}/position`);
  }

  /**
   * Permet de recuperer la liste des positions de travail
   */
  public getAllPositionTravailByRestaurant(): Observable<PositionTravailModel[]> {
    return this.httpClient.get<PositionTravailModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}`);
  }

  /**
   * Permet de recuperer la liste des positions de travail actifs
   */
  public getAllActivePositionTravailByRestaurant(): Observable<PositionTravailModel[]> {
    return this.httpClient.get<PositionTravailModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/active`);
  }

  /**
   * Permet d'ajouter une position de travail
   */
  public addPositionTravail(position: PositionTravailModel): Observable<Object> {
    return super.add(position, '/' + this.pathService.getUuidRestaurant() + '/add');
  }

  /**
   * Permet de mettre à jour position de travail
   */
  public updatePositionTravail(position: PositionTravailModel): Observable<Object> {
    return super.update(position, '/' + this.pathService.getUuidRestaurant() + '/update');
  }

  /**
   * Permet de supprimer position de travail
   */
  public deletePositionTravail(uuidPositionTravail: string): Observable<Object> {
    return super.remove(uuidPositionTravail, '/delete/');
  }

  public updateListPositionTravail(listePositionTravailToUpdate: PositionTravailModel[]): Observable<Object> {
    return this.httpClient.put(`${this.baseUrl}/` + this.pathService.getUuidRestaurant() + '/list', listePositionTravailToUpdate);
  }

  /**
   * Permet de recuperer la liste des positions de travail actifs
   */
  public getAllActivePositionTravailProductifByRestaurant(): Observable<PositionTravailModel[]> {
    return this.httpClient.get<PositionTravailModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/active/productif`);
  }

  public checkPositionTravailExistance(libelle: string, uuidPositionTravail: string): Observable<Object> {
    return this.httpClient.get(`${this.baseUrl}/checkExistance/${this.pathService.getUuidRestaurant()}/` + libelle + '/' + uuidPositionTravail);
  }
}
