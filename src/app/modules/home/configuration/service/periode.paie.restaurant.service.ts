import {Injectable} from '@angular/core';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PeriodePaieRestaurantModel} from '../../../../shared/model/periode.paie.restaurant.model';
import {Observable} from 'rxjs';
import {DateService} from '../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class PeriodePaieRestaurantService extends GenericCRUDRestService<PeriodePaieRestaurantModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathEmployee()}/paie/`);
  }

  public getPeriodePaieByRestaurant(): Observable<PeriodePaieRestaurantModel[]> {
    return this.httpClient.get<PeriodePaieRestaurantModel[]>(`${this.baseUrl}${this.pathService.getUuidRestaurant()}`);
  }

  public addPeriodePaieByRestaurant(listePeriodePaie: PeriodePaieRestaurantModel[]): Observable<PeriodePaieRestaurantModel[]> {
    this.setCorrectDate(listePeriodePaie);
    return this.httpClient.post<PeriodePaieRestaurantModel[]>(`${this.baseUrl}add/${this.pathService.getUuidRestaurant()}`, listePeriodePaie);
  }
  public getMapPeriodPaieWithResaurant(uuidFranchise: any, date: Date, isFranchise: number): Observable<any> {
    const dateChoisit = date ? this.dateService.formatDateToScoreDelimiter(date) : null;
    return this.httpClient.get<any>(`${this.baseUrl}${uuidFranchise}/${isFranchise}/` + dateChoisit);

  }
  private setCorrectDate(listePeriodePaie: PeriodePaieRestaurantModel[]) {
    listePeriodePaie.forEach(item => {
      item.dateDebut = this.dateService.setCorrectDate(item.dateDebut);
      item.dateFin = this.dateService.setCorrectDate(item.dateFin);
      item.originalDate = this.dateService.setCorrectDate(item.originalDate);
    });
  }
}
