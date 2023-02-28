import {Injectable} from '@angular/core';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private pathService: PathService, private httpClient: HttpClient) {
  }

  getBesoin(dateAsString: string, idRestaurant: number) {
    return this.httpClient.get(this.pathService.getPathPlanning() + '/generer_besoin/besoin/' + idRestaurant + '/' + dateAsString);
  }

  getShift(dateAsString: string, idRestaurant: number) {
    return this.httpClient.get(this.pathService.getPathPlanning() + '/generer_besoin/shift/' + idRestaurant + '/' + dateAsString);
  }

  getAssoc(dateAsString: string, idRestaurant: number) {
    return this.httpClient.get(this.pathService.getPathPlanning() + '/generer_besoin/assoc/' + idRestaurant + '/' + dateAsString);
  }
}
