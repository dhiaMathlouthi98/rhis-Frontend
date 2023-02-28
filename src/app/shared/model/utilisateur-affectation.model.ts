import {RestaurantModel} from './restaurant.model';
import {SocieteModel} from './societe.model';
import {EntityUuidModel} from './entityUuid.model';

export class UtilisateurAffectation extends EntityUuidModel {
  id?: number;
  nom?: string;
  prenom?: string;
  pseudo?: string;
  email?: string;
  profil?: string;
  langue?: string;
  restaurant?: RestaurantModel[];
  societe?: SocieteModel[];
}
