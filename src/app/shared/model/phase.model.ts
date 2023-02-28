import {RestaurantModel} from './restaurant.model';
import {ModeVenteParPhaseModel} from './modeVenteParPhase.model';
import {EntityUuidModel} from './entityUuid.model';

export class PhaseModel extends EntityUuidModel {

  public idPhase: number;
  public libelle: string;

  public restaurant: RestaurantModel;
  modesVentes: ModeVenteParPhaseModel[];

  constructor() {
    super();
    this.libelle = '';
  }
}
