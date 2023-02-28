import {EntityUuidModel} from './entityUuid.model';

export interface ProcedureModel extends EntityUuidModel {
  idProcedure?: string;
  libelle?: string;
  statut?: boolean;
}

