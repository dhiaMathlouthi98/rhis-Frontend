import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TotalCaPerDay } from 'src/app/shared/model/details-temps-paye';
import { PlanningModel } from 'src/app/shared/model/planning.model';
import { DateService } from 'src/app/shared/service/date.service';
import { GenericCRUDRestService } from 'src/app/shared/service/generic-crud.service';
import { PathService } from 'src/app/shared/service/path.service';

@Injectable({
  providedIn: 'root'
})
export class PlgHebdoService extends GenericCRUDRestService<PlanningModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}`);
  }

  public getDayByDayVente(dateDebut: string, dateFin: string): Observable<TotalCaPerDay[]> {
    return this.httpClient.get<TotalCaPerDay[]>(this.baseUrl + '/venteJournaliere/VentesDTOVueHebdo/' + this.pathService.getUuidRestaurant() + '/' + dateDebut+ '/' + dateFin);
  } 
  public getCaValuesDayPerDay(date: string): Observable<TotalCaPerDay[]> {
    const dateValue = this.dateService.createDateFromStringPattern(date, 'DD/MM/YYYY');
    date = this.dateService.formatToShortDate(dateValue);
    return this.httpClient.get<TotalCaPerDay[]>(this.baseUrl + 'tempsPaye/week/' + this.pathService.getUuidRestaurant() + '/' + date);
  }
}
