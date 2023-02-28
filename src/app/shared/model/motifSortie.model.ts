import {EntityUuidModel} from './entityUuid.model';

export interface MotifSortieModel extends EntityUuidModel {
  idMotifSortie?: string;
  libelle?: string;
  statut?: boolean;
}
