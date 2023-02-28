import {EntityUuidModel} from './entityUuid.model';

export class NationaliteModel extends EntityUuidModel {
  public idNationalite: number;
  public code: string;
  public libelleFR: string;
  public paysFR: string;
  public titreSejour: boolean;
  public titreTravail: boolean;
  public majeurMasculin: number;
  public majeurFeminin: number;
  public libellePays: string;
}
