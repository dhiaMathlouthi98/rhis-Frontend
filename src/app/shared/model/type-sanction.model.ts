import {EntityUuidModel} from './entityUuid.model';

export interface TypeSanctionModel extends EntityUuidModel {
  idTypeSanction?: number;
  libelle?: string;
  statut?: boolean;
}
