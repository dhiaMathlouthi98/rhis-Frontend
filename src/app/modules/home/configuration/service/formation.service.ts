import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FormationModel} from '../../../../shared/model/formation.model';

@Injectable({
  providedIn: 'root'
})
export class FormationService extends GenericCRUDRestService<FormationModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/formation/`);
  }

  /**
   * recupere tous les groupes de travail par restaurant
   */
  public getAllFormationByRestaurant(): Observable<FormationModel[]> {
    return this.httpClient.get<FormationModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/all');
  }

  /**
   * modifier les priorités des formations
   * @param :listFormations
   */
  updateFormationsPrioriteByRestaurant(listFormations): Observable<Object> {
    return super.update(listFormations, this.pathService.getUuidRestaurant() + '/update/listFormations');

  }

  /**
   * modifier type de formation
   * @param :typeFormation
   */
  public updateTypeFormation(typeFormation: FormationModel): Observable<Object> {
    return super.update(typeFormation, this.pathService.getUuidRestaurant() + '/update');
  }

  /**
   * ajouter type formation
   * @param: typeFormation
   */
  public addNewTypeFormation(listFormationInactif): Observable<Object> {
    return super.add(listFormationInactif, this.pathService.getUuidRestaurant() + '/add');
  }

  /**
   * activer le type formation et modifier le priorite
   * @param :listGroupTravailInactif
   */
  activateTypeFormationAndUpdateNiveau(listFormationInactif): Observable<any> {
    return super.update(listFormationInactif, this.pathService.getUuidRestaurant() + '/activate');
  }

  /**
   * suppression type formation
   * @param: idFormation
   */
  public deleteFormation(idFormation: string): Observable<Object> {
    return super.remove(idFormation, this.pathService.getUuidRestaurant() + '/delete/');
  }

  /**
   * Permet de retourner la liste des formations actives par restaurant
   */
  public getAllActiveForamtionByRestaurant(): Observable<FormationModel[]> {
    return this.httpClient.get<FormationModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/all/active');
  }
}
