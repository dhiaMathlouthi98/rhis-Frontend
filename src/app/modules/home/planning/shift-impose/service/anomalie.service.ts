import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {AnomaliePlanningModel} from '../../../../../shared/model/gui/anomalie.planning.model';
import {AnomalieModel} from '../../../../../shared/model/anomalie.model';

@Injectable({
  providedIn: 'root'
})
export class AnomalieService {

  private baseUrl: string;

  constructor(private httpClient: HttpClient, private pathService: PathService) {
    this.baseUrl = this.pathService.getPathPlanning() + '/anomalie';
  }


  /**
   * Permet de recuperer la liste des anomalie planning par restaurant et date
   */
  public getAnomaliePlanningByRestaurantAndDate(dateJournee: string): Observable<AnomaliePlanningModel[]> {
    return this.httpClient.get<AnomaliePlanningModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/date/${dateJournee}`);
  }

  public getAnomalieWeekByRestaurantAndDate(): Observable<AnomalieModel[]> {
    return this.httpClient.get<AnomalieModel[]>(`${this.pathService.hostServerRapport}/rapportAnomalie/week/${this.pathService.getUuidRestaurant()}`);
  }

  public generateAnomaliePDF(currentLangue: string, listContraintePlanning: AnomaliePlanningModel[], dateJournee: string): Observable<Object> {
    return this.httpClient.post(this.baseUrl + '/pdf/' + this.pathService.getUuidRestaurant() + '/date/' + dateJournee + '/' + currentLangue, listContraintePlanning);
  }
}
