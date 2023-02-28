import {EntityUuidModel} from './entityUuid.model';

export interface PeriodiciteModel extends EntityUuidModel {
  idPeriodicite?: string;
  libelle?: string;
  statut?: boolean;
}
