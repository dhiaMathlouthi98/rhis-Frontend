import {Injectable} from '@angular/core';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidationPeriodPaie } from 'src/app/shared/model/validationPeriodePaie';

@Injectable({
  providedIn: 'root'
})
export class ValidationPaieService {
private readonly baseUrl: string;
  constructor(private pathService: PathService, private httpClient: HttpClient) {
    this.baseUrl = `${pathService.hostServerGDH}/validationPeriodPaie`;
  }

  public checkPeriodPaieValidated(startDate:string, endDate:string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}?startDate=${startDate}&endDate=${endDate}`);
  }

  public addValidationPeriodPaie(validation: ValidationPeriodPaie, generationTimeIsUpdated: boolean): Observable<ValidationPeriodPaie> {
       return this.httpClient.post<ValidationPeriodPaie>(`${this.baseUrl}/add?generationTimeIsUpdated=${generationTimeIsUpdated}`, validation);
  }

  public deleteParamEnvoi(limitDate:string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}?limitDate=${limitDate}`);
  }
  public getValidatedRestaurants(startDate:string, endDate:string, restaurantIds: number[]): Observable<ValidationPeriodPaie[]> {
    return this.httpClient.post<ValidationPeriodPaie[]>(`${this.baseUrl}/restaurants/period/validated?startDate=${startDate}&endDate=${endDate}`, restaurantIds);
}

  public getCurrentPeriodePaieByRestaurant(uuidRestaurant: string): Observable<any> {
    return this.httpClient.get<boolean>(`${this.pathService.hostServerEmployee}/paie/getCurrentPeriodePaie/${uuidRestaurant}`);
  }

}
