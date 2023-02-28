import {RestaurantModel} from '../model/restaurant.model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from './path.service';
import {Observable} from 'rxjs';
import {DateService} from './date.service';
import {JourSemaine} from '../enumeration/jour.semaine';

@Injectable({
  providedIn: 'root'
})
export class SharedRestaurantService {

  public selectedRestaurant: RestaurantModel = new RestaurantModel();

  constructor(private httpClient: HttpClient,
              private pathService: PathService,
              private dateService: DateService) {
  }

  public getRestaurantById(uuidRestaurant?: any): Observable<RestaurantModel> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<RestaurantModel>(this.pathService.getPathEmployee() + '/restaurant/paysAndTypeRestaurant/' + uuid);
  }

  public getRestaurantByIdWithTypeRestaurant(idRestaurant = this.pathService.getUuidRestaurant()): Observable<RestaurantModel> {

    return this.httpClient.get<RestaurantModel>(this.pathService.getPathEmployee() + '/restaurant/paysAndTypeRestaurant/' + idRestaurant);
  }

  public async getWeekFirstDayRank(): Promise<number> {
    await this.checkOrFetchRestaurant();
    return this.dateService.getIntegerValueFromJourSemaine(
      this.selectedRestaurant.parametreNationaux.premierJourSemaine);
  }

  public async getWeekFirstDay(): Promise<JourSemaine> {
    await this.checkOrFetchRestaurant();
    return this.selectedRestaurant.parametreNationaux.premierJourSemaine;
  }

  private async checkOrFetchRestaurant() {
    if (!(this.selectedRestaurant &&
      this.selectedRestaurant.parametreNationaux &&
      this.selectedRestaurant.parametreNationaux.premierJourSemaine)) {
      this.selectedRestaurant = await this.getRestaurantById().toPromise();
    }
  }
}
