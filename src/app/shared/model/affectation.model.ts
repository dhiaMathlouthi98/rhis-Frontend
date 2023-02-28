import {SocieteModel} from './societe.model';
import {ProfilModel} from './profil.model';
import {RestaurantModel} from './restaurant.model';
import {MyRhisUserModel} from './MyRhisUser.model';
import {EntityUuidModel} from './entityUuid.model';

export class AffectationModel extends EntityUuidModel {
  idAffectation?: number;
  restaurant?: RestaurantModel;
  societe?: SocieteModel;
  profil?: ProfilModel;
  utilisateur?: MyRhisUserModel;


}
