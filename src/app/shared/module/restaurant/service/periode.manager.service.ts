import {forkJoin, Observable} from 'rxjs';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {PeriodeManagerModel} from '../../../model/periode.manager.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodeManagerService extends GenericCRUDRestService<PeriodeManagerModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/periodeManager/`);
  }

  public getAllPeriodeManagerByRestaurant(): Observable<PeriodeManagerModel[]> {
    return this.httpClient.get<PeriodeManagerModel[]>(this.baseUrl + this.pathService.getUuidRestaurant());
  }

  public getAllPeriodeManagerByRestaurantWithStatut(statut: boolean): Observable<PeriodeManagerModel[]> {
    return this.httpClient.get<PeriodeManagerModel[]>(this.baseUrl + this.pathService.getUuidRestaurant() + `/statut/${statut}`);
  }

  public getHeureLimite(libelle: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + libelle + '/' + this.pathService.getUuidRestaurant());
  }

  public getAllPeriodeManagerByRestaurantWithHourLimitation(): Observable<any[]> {
    const periodeManagerByRestaurant = this.getAllPeriodeManagerByRestaurant();
    const limiteHeureDebut = this.getHeureLimite('Début de journée d\'activité');
    const limiteHeureFin = this.getHeureLimite('Fin de journée d\'activité');
    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin([periodeManagerByRestaurant, limiteHeureDebut, limiteHeureFin]);
  }

  public persist(periodeManager: PeriodeManagerModel): Observable<any> {
    return this.add(periodeManager, 'add/' + this.pathService.getUuidRestaurant());
  }

  public updatePeriodeManage(perdiodeManager: PeriodeManagerModel): Observable<any> {
    return this.update(perdiodeManager, 'update/' + this.pathService.getUuidRestaurant());
  }

  public updateStatus(id: number, statut: boolean): Observable<void> {
    return this.httpClient.get<void>(this.baseUrl + 'update/' + id + '?statut=' + statut);
  }
}
