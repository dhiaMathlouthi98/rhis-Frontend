import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GroupeTravailModel} from '../../../../shared/model/groupeTravail.model';

@Injectable({
  providedIn: 'root'
})
export class GroupeTravailService extends GenericCRUDRestService<GroupeTravailModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/groupeTravail/`);
  }

  /**
   * recupere tous les groupes de travail par restaurant
   */
  public getAllGroupTravailByRestaurant(): Observable<GroupeTravailModel[]> {
    return this.httpClient.get<GroupeTravailModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/all');
  }

  /**
   * suppression groupTravail
   * @param : idGroupTravail
   */
  public deleteGroupTravail(idGroupTravail: string): Observable<Object> {
    return super.remove(idGroupTravail, this.pathService.getUuidRestaurant() + '/delete/');
  }

  /**
   * modifier group Travail
   * @param: groupTravail
   */
  public updateGroupTravail(groupTravail: GroupeTravailModel): Observable<Object> {
    return super.update(groupTravail, this.pathService.getUuidRestaurant() + '/update');
  }

  /**
   * ajouter group Travail
   * @param :listGroupTravail
   */
  public addNewGroupTravail(listGroupTravail): Observable<Object> {
    return super.add(listGroupTravail, this.pathService.getUuidRestaurant() + '/add');
  }

  /**
   * permet de mettre a jour tous les contrats avec le bon taux horaire.
   * Les contrats concernés sont ceux actifs ou qui vont l’être.
   * @param :groupTravail
   */
  public updateContratByTauxHoraireOfGroupTravail(groupTravail: GroupeTravailModel): Observable<any> {
    return super.update(groupTravail, this.pathService.getUuidRestaurant() + '/updateTauxHoraire');
  }

  /**
   * activer le groupe de trvail et modifier le niveau
   * @param :listGroupTravailInactif
   */
  public activateGroupeTravailAndUpdateNiveau(listGroupTravailInactif): Observable<any> {
    return super.update(listGroupTravailInactif, this.pathService.getUuidRestaurant() + '/activate');
  }

  /**
   * suppression groupe de travail
   * @param :idGroupTravail
   */
  public deleteGroupTravailMoOrPlgEquipier(idGroupTravail): Observable<any> {
    return super.remove(idGroupTravail, this.pathService.getUuidRestaurant() + '/delete/MoOrPlgEquipier/');
  }

  /**
   * modifier les niveau des groupes de travail
   * @param :listFormations
   */
  public updateGroupeTravailNiveauByRestaurant(listGroupesTravail): Observable<any> {
    return super.update(listGroupesTravail, this.pathService.getUuidRestaurant() + '/update/listGroupeTravail');

  }

  /**
   * recupere tous les groupes de travail actifs par restaurant
   */
  public getAllGroupTravailActifByRestaurant(restaurantUuid?: string): Observable<GroupeTravailModel[]> {
    const uuid = restaurantUuid || this.pathService.getUuidRestaurant();
    return this.httpClient.get<GroupeTravailModel[]>(`${this.baseUrl}` + uuid + '/dispo/');
  }
}
