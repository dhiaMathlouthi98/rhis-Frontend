import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from '../../../../shared/service/path.service';

@Injectable({
  providedIn: 'root'
})
export class GroupementPositionTravailService {

  constructor(private httpClient: HttpClient, private pathService: PathService) {
  }

  /**
   * Permet d'ajouter un pair de groupement
   */
  public findAndPersistGroupement(idFirstElementPositionTravail: string, idSecondElementPositionTravail: string): Observable<Object> {
    return this.httpClient.post(this.pathService.getPathEmployee() + '/groupement/create/' + idFirstElementPositionTravail + '/' + idSecondElementPositionTravail, null);
  }

  /**
   * Permet de supprimer un pair de groumenet
   */
  findAndDeleteGroupement(idFirstElementPositionTravail: string, idSecondElementPositionTravail: string): Observable<Object> {
    return this.httpClient.delete(this.pathService.getPathEmployee() + '/groupement/delete/' + idFirstElementPositionTravail + '/' + idSecondElementPositionTravail,);
  }

  findAndUpdateGroupement(idPositionTravail: string, second_element: string): Observable<Object> {
    return this.httpClient.put(this.pathService.getPathEmployee() + '/groupement/update/' + idPositionTravail, second_element);
  }
}
