import {EntityUuidModel} from './entityUuid.model';

export interface MoyenTransportModel extends EntityUuidModel {
  idMoyenTransport?: string;
  libelle?: string;
  statut?: boolean;
}
