import {EntityUuidModel} from './entityUuid.model';
import {RestaurantModel} from './restaurant.model';

export class FranchiseModel extends EntityUuidModel {
    uuid: string;
    idFranchise: number;
    nom: string;
    adresse: string;
    numTelephone: string;
    codePostal: number;
    ville: string;
    restaurants: RestaurantModel[];
 

constructor(){
  super();
}
}
