import {EntityUuidModel} from './entityUuid.model';

export class RepartitionModel extends EntityUuidModel {
  public idRepartition;

  public valeurLundi: number;

  public valeurMardi: number;

  public valeurMercredi: number;

  public valeurJeudi: number;

  public valeurVendredi: number;

  public valeurSamedi: number;

  public valeurDimanche: number;
}
