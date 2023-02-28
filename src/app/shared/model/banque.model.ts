import {EntityUuidModel} from './entityUuid.model';

export class BanqueModel extends EntityUuidModel {
  public idBanque: number;
  public adresse1: string;
  public codePostal: string;
  public ville: string;
  public iban: string;
  public bic: string;
}
