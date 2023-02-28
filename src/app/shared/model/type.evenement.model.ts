import {EntityUuidModel} from './entityUuid.model';

export class TypeEvenementModel extends EntityUuidModel {
  public idTypeEvenement?: number;
  public code?: string;
  public libelle?: string;
  public codeGdh?: string;
  public codePaye?: string;
  public payer?: boolean;
  public travaille?: boolean;
  public previsible?: boolean;
  public statut?: boolean;
}
