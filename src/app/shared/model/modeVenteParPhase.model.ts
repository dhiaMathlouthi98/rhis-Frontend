import {ModeVenteParPhasePK} from './modeVenteParPhasePK.model';
import {ModeVenteModel} from './modeVente.model';
import {PhaseModel} from './phase.model';
import {EntityUuidModel} from './entityUuid.model';

export interface ModeVenteParPhaseModel extends EntityUuidModel {
  modeVentePhasePK: ModeVenteParPhasePK;
  valeurLundi: number;
  valeurMardi: number;
  valeurMercredi: number;
  valeurJeudi: number;
  valeurVendredi: number;
  valeurSamedi: number;
  valeurDimanche: number;
  modeVente: ModeVenteModel;
  phase: PhaseModel;
}
