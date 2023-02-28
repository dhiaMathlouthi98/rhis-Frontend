import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {RestaurantService} from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class SharedRestaurantListService {
  public retaurantList: any[] = [];

  constructor(private sessionService: SessionService,
              private restaurantService: RestaurantService) {
  }

  public async getListRestaurant(): Promise<any[]> {
    if (!this.retaurantList || this.retaurantList.length === 0) {
      if (this.sessionService.getProfil() === 'superviseur') {
        this.retaurantList = (await this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(this.sessionService.getUuidFranchise()).toPromise()).content;
      } else {

        this.retaurantList = (await this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVente(this.sessionService.getUuidUser()).toPromise()).content;
      }
    }
    return this.sortRestaurantBylibelleAlphabetically(this.retaurantList);
  }

  public sortRestaurantBylibelleAlphabetically(restaurants: any[]): any[] {
    return restaurants.sort((firstRestaurant, secondRestaurant) => {
      const sortValue = new Intl.Collator().compare(firstRestaurant.libelleRestaurant, secondRestaurant.libelleRestaurant);
      if (sortValue === 0) {
        return 0;
      } else {
        return sortValue > 0 ? 1 : -1;
      }
    });
  }
}
