import {RestaurantModel} from './restaurant.model';
import {AffectationModel} from './affectation.model';
import {EntityUuidModel} from './entityUuid.model';


export class ProfilModel extends EntityUuidModel {
  idProfil?: number;
  libelle?: string;
  defaults?: boolean;
  restaurant?: RestaurantModel;
  affectations?: AffectationModel[];

  constructor() {
    super();
  }

}
