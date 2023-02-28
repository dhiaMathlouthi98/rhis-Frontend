import {RestaurantModel} from './restaurant.model';
import {SocieteModel} from './societe.model';
import {DroitModel} from './droit.model';
import {EntityUuidModel} from './entityUuid.model';


export class EcranModel extends EntityUuidModel {
  idEcran?: number;
  code?: string;
  matricule?: string;
  description?: string;
  path?: string;
  libelle?: string;
  restaurant?: RestaurantModel;
  societe?: SocieteModel;
  droits?: DroitModel[];
  admin?: boolean;
  mobile?: boolean;


}
