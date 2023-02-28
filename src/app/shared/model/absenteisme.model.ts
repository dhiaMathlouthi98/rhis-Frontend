import {PhaseModel} from './phase.model';
import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export interface AbsenteismeModel extends EntityUuidModel {

  idAbsenteisme?: number;

  valeurLundi?: number;

  valeurMardi?: number;

  valeurMercredi?: number;

  valeurJeudi?: number;

  valeurVendredi?: number;

  valeurSamedi?: number;

  valeurDimanche?: number;

  phase?: PhaseModel;

  restaurant?: RestaurantModel;


}
