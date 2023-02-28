import {EntityUuidModel} from './entityUuid.model';

export interface TypePointageModel extends EntityUuidModel {
  id?: number;
  libelle?: string;
  statut?: boolean;
}
