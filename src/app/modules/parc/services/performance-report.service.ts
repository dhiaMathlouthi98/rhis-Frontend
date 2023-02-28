import { Injectable } from '@angular/core';
import {PathService} from '../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { ComparativePerformanceSheet } from 'src/app/shared/model/analysePerformanceModel';
import {SessionService} from "../../../shared/service/session.service";

@Injectable({
  providedIn: 'root'
})
export class PerformanceReportService {

  constructor(private pathService: PathService,
              private httpClient: HttpClient,
              private sessionService: SessionService) {}

  public getPerformanceReportWithRestaurantsUuids(startDate: string, endDate: string, filter: string, fullMonth?: boolean, uuid?: string): Observable<any> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + `/rapportPerformance/${uuid ? uuid : this.sessionService.getUuidRestaurant()}?filter=` + `${filter}` + '&startDate=' + `${startDate}` + '&endDate=' + `${endDate}` + '&fullMonth=' + `${fullMonth}`);
  }

  public exportRapportPerformanceAvecRestaurantsUuids(startDate: string, endDate: string, filter: string, lang: string, listRestaurant: any): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPerformance?filter=' + `${filter}` + '&startDate=' + `${startDate}` + '&endDate=' + `${endDate}` + '&lang=' + `${lang}`, listRestaurant, {
      responseType: 'blob', observe: 'response'
    });
  }
  public exportComparativeModePerformanceReportForRestaurants(startDate: string, endDate: string, filter: string, lang: string, listRestaurant: string[]): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare?filter=' + `${filter}` + '&startDate=' + `${startDate}` + '&endDate=' + `${endDate}` + '&lang=' + `${lang}`, listRestaurant, {
      responseType: 'blob', observe: 'response'
    });
  }

  public latestSheetComparativeModePerformanceReportForRestaurants(startDate: string, endDate: string, filter: string, lang: string, listRestaurant: string[]): Observable<ComparativePerformanceSheet> {
    return this.httpClient.post<ComparativePerformanceSheet>(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare/lastSheet?filter=' + `${filter}` + '&startDate=' + `${startDate}` + '&endDate=' + `${endDate}` + '&lang=' + `${lang}`, listRestaurant);
  }

  public exportComparativeModeDayPerformanceReportForRestaurants(date: string, lang: string, listRestaurant: string[]): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare/day?date=' + `${date}` + '&lang=' + `${lang}`, listRestaurant, {
      responseType: 'blob', observe: 'response'
    });
  }

  public latestSheetComparativeDayModePerformanceReportForRestaurants(date: string, lang: string, listRestaurant: string[]): Observable<ComparativePerformanceSheet> {
    return this.httpClient.post<ComparativePerformanceSheet>(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare/day/lastSheet?date=' + `${date}` + '&lang=' + `${lang}`, listRestaurant);
  }

  public exportComparativeModeMonthPerformanceReportForRestaurants(date: string, lang: string, listRestaurant: string[]): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare/month?date=' + `${date}` + '&lang=' + `${lang}`, listRestaurant, {
      responseType: 'blob', observe: 'response'
    });
  }

  public latestSheetComparativeMonthModePerformanceReportForRestaurants(date: string, lang: string, listRestaurant: string[]): Observable<ComparativePerformanceSheet> {
    return this.httpClient.post<ComparativePerformanceSheet>(`${this.pathService.hostServerRapport}` + '/rapportPerformance/compare/month/lastSheet?date=' + `${date}` + '&lang=' + `${lang}`, listRestaurant);
  }
}
