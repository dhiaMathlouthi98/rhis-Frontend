import {RestaurantModel} from './restaurant.model';
import {ModeVenteParPhaseModel} from './modeVenteParPhase.model';
import {EntityUuidModel} from './entityUuid.model';

export interface ModeVenteModel extends EntityUuidModel {
  idModeVente?: number;
  nom?: string;
  libelle?: string;
  lignesMontant?: string;
  lignesTransaction?: string;
  centreRevenu?: string;
  filtre?: string;
  codeSource?: string;
  mainOeuvre?: boolean;
  statut?: boolean;
  restaurant?: RestaurantModel;
  modesVentesPhases?: ModeVenteParPhaseModel[];
}
