import {Injectable} from '@angular/core';
import {PathService} from '../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {SessionService} from '../../../shared/service/session.service';

@Injectable({
  providedIn: 'root'
})
export class PosteTravailReportService {

  constructor(private pathService: PathService,
              private httpClient: HttpClient,
              private sessionService: SessionService) {
  }

  /**
   *
   * @param startDate
   * @param endDate
   * @param modeRapport : mode = 1 => mode jour , mode = 2 => mode semaine
   * @param interval
   * @param listRestaurant
   */

  public getDataGUIAvecRestaurantsUuids(startDate: string, endDate: string, modeRapport: number, interval: number, listRestaurant: any): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPlanningPosteTravail?dateDebut=' + `${startDate}` + '&dateFin=' + `${endDate}` + '&modeRapport=' + `${modeRapport}` + '&interval=' + `${interval}`, listRestaurant);
  }

}
