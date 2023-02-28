import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class CharteModel extends EntityUuidModel {

  public idCharte: number;
  public libelle: string;
  public restaurant: RestaurantModel;

  // public positionements: ChartePositionnementModel[];

  constructor() {
    super();
    this.idCharte = 0;
    this.libelle = '';
  }

}
