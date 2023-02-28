import {Observable} from 'rxjs';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoupuresService {
  private readonly baseUrl: string;
  constructor(private pathService: PathService, private httpClient: HttpClient) {
    this.baseUrl = `${pathService.hostServerGDH}/coupures`;
  }
  public checkNbrCoupuresForEmployeeInDate(uuidEmployee: string, date: string): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/employees/${uuidEmployee}?date=${date}`);
  }
}
