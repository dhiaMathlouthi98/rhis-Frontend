import {EntityUuidModel} from './entityUuid.model';

export class DiversModel extends EntityUuidModel {
  idDivers: number;
  villeNaissance: string;
  paysNaissance: any;
  numDepartementNaissance: string;
  dateDue;
  noDue: string;
  numTelephUrgence: string;
  nomPersonneContacter: string;
  lienParente: string;

}
