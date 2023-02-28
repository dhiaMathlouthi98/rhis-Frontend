import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RepasModel} from '../../../../shared/model/repas.model';
import {GDHFilter} from '../../../../shared/model/gui/GDH-filter';

@Injectable({
  providedIn: 'root'
})
export class RepasService extends GenericCRUDRestService<RepasModel, number> {
  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.hostServerGDH}/repas`);
  }

  public setRepasForEmployeeForPeriodBetweenTowDates(nbrRepas: number, uuidEmployee: string, startDate: string, endDate: string): Observable<number> {
    return this.httpClient.post<number>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/employees/${uuidEmployee}/period?startDate=${startDate}&endDate=${endDate}`, nbrRepas);
  }

  public setPayVueRepasForEmployeeByDate(nbrRepas: number, uuidEmployee: string, filter: GDHFilter): Observable<number> {
    return this.httpClient.post<number>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/employees/${uuidEmployee}/vp?date=${filter.date}`, nbrRepas);
  }

  public checkRepasAutoCalculationForDate(uuidEmployee: string, date: string): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/employees/${uuidEmployee}?date=${date}`);
  }
}
