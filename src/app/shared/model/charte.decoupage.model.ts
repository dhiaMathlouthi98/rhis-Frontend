import {RestaurantModel} from './restaurant.model';
import {PhaseModel} from './phase.model';
import {EntityUuidModel} from './entityUuid.model';

export class CharteDecoupageModel extends EntityUuidModel {

  public idCharteDecoupage: number;
  public valeurLundi: string;
  public valeurMardi: string;
  public valeurMercredi: string;
  public valeurJeudi: string;
  public valeurVendredi: string;
  public valeurSamedi: string;
  public valeurDimanche: string;

  public restaurant: RestaurantModel;
  public phase: PhaseModel;
}
