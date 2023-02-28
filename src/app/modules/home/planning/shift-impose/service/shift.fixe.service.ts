import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ShiftFixeModel} from '../../../../../shared/model/shiftFixe.model';
import {DateService} from '../../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftFixeService extends GenericCRUDRestService<ShiftFixeModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/shiftFixe`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte fixes par restaurant
   */
  public getlistSifhtFixeByRestaurant(): Observable<ShiftFixeModel[]> {
    return this.httpClient.get<ShiftFixeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  /**
   * ajouter ou modifier  shift fixe
   * @param :data
   */
  public addShiftFixe(data: ShiftFixeModel) {
    this.setCorrectDateFormat(data);
    return this.httpClient.post(`${this.baseUrl}/add`, data);
  }

  /**
   * suppression de shift fixe
   * @param :idShiftFixe
   */
  public deleteShiftFixe(uuidShiftFixe: string) {
    return this.httpClient.delete(`${this.baseUrl}/delete/${uuidShiftFixe}`);
  }

  /**
   * modofuer list de shift fixe apres drag and drop
   * @param :data
   */
  public updateListShiftFixe(data: ShiftFixeModel[], listIdShiftFixesToDelete, listShiftFixesByEmployeeToDelete): Observable<ShiftFixeModel[]> {
    data.forEach(item => {
      this.setCorrectDateFormat(item);
    });
    return this.httpClient.put<ShiftFixeModel[]>(`${this.baseUrl}/updateList/` + listIdShiftFixesToDelete + '/' + listShiftFixesByEmployeeToDelete, data);
  }

  setCorrectDateFormat(item: ShiftFixeModel) {
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
