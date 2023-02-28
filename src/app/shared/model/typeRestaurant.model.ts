import {EntityUuidModel} from './entityUuid.model';

export interface TypeRestaurantModel extends EntityUuidModel {
  idTypeRestaurant: number;
  nomType: string;
  pathLogo: string;
  typeComportementRestaurant: number;
  statut: boolean;
}
