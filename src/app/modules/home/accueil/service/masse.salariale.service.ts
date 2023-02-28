import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MasseSalarialeService {

  constructor(private httpClient: HttpClient, private pathService: PathService) {
  }

  public getMasseSalarileByFilter(filter: string): Observable<number> {
    return this.httpClient.get<number>(this.pathService.getPathEmployee() + '/masseSalariale/' + this.pathService.getUuidRestaurant() + '/' + filter);
  }
}
