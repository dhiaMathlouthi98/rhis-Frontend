import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {BesoinImposeModel} from '../../../../../shared/model/besoin.impose.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {DateService} from '../../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class BesoinImposeService extends GenericCRUDRestService<BesoinImposeModel, Number> {


  constructor(httpClient: HttpClient, private pathService: PathService,
              private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/besoin`);
  }

  /**
   * Permet de recuperer la liste des besoins impose par restaurant
   */
  public getAllBesoinImposeByRestaurant(): Observable<BesoinImposeModel[]> {
    return this.httpClient.get<BesoinImposeModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}`);
  }


  public addBesoinImpose(data: BesoinImposeModel) {
    this.setCorrectDateFormat(data);
    return this.httpClient.post(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}`, data);
  }

  public deleteBesoinImpose(uuidBesoinImpose: string) {
    return this.httpClient.delete(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/${uuidBesoinImpose}`);
  }

  public deleteAllBesoinImposeByIdPositionTravail(uuidPositionTravail: string) {
    return this.httpClient.delete(`${this.baseUrl}/${uuidPositionTravail}/all`);
  }

  public updateListBesoinImpose(data: BesoinImposeModel[], listIdBesoinToDelete, listBesoinByPositionToDelete): Observable<BesoinImposeModel[]> {
    data.forEach(item => {
      this.setCorrectDateFormat(item);
    });
    return this.httpClient.put<BesoinImposeModel[]>(`${this.baseUrl}/updateList/` + listIdBesoinToDelete + '/' + listBesoinByPositionToDelete, data);
  }

  private setCorrectDateFormat(item: BesoinImposeModel) {
    if (item.heureDebut) {
      item.heureDebut = this.dateService.setCorrectTime(item.heureDebut);
    }
    if (item.heureFin) {
      item.heureFin = this.dateService.setCorrectTime(item.heureFin);
    }
    if (item.dateDebut) {
      item.dateDebut = this.dateService.correctTimeZoneDifference(item.dateDebut);
    }
    if (item.dateFin) {
      item.dateFin = this.dateService.correctTimeZoneDifference(item.dateFin);
    }
  }
}
