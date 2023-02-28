import {EntityUuidModel} from './entityUuid.model';

export interface TypeContratModel extends EntityUuidModel {

  idTypeContrat?: number;
  libelle?: string;
  dureeDetermine?: boolean;
  activeTypeContrat?: boolean;
}
