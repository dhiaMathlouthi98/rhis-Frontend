import {NationaliteModel} from './nationalite.model';
import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class JourFeriesModel extends EntityUuidModel {

  public idJourFeriers: number;
  public dateFeries: Date;
  public libelle: string;
  public fix: boolean;
  public anciennete: boolean;
  public nationaliteRef: NationaliteModel;
  public jourFerierRestaurant;
  public restaurants: RestaurantModel[];

}
