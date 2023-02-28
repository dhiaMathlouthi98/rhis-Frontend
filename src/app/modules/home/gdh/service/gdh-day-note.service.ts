import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {GdhDayNoteModel} from '../../../../shared/model/gdh-day-note.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';

@Injectable()
export class GdhDayNoteService extends GenericCRUDRestService<GdhDayNoteModel, number> {

  constructor(httpClient: HttpClient, private pathService: PathService) {
    super(httpClient, `${pathService.hostServerGDH}/gdhdaynote`);
  }

  public getUuIdRestaurant(): string {
    return this.pathService.getUuidRestaurant();
  }

  public getIdRestaurant(): number {
    return +this.pathService.getIdRestaurant();
  }

  /**
   * Get gdh note day by restaurant id and date
   * @param: idRestaurant
   * @param: date
   */
  public getOneByRestaurantIdAndDate(date: string): Observable<GdhDayNoteModel> {
    return this.httpClient.get<GdhDayNoteModel>(`${this.baseUrl}/${this.getUuIdRestaurant()}?date=${date}`);
  }
}
