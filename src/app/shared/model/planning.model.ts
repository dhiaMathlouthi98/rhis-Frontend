import {EntityUuidModel} from './entityUuid.model';

export class PlanningModel extends EntityUuidModel {
  public idPlanning?: number | string;
  public dateDebut?;
  public dateFin?;
  public nbrEmployee?: boolean;
  public numSemaine?: boolean;
  public idRestaurant?: number;
  public uuidUserCloture?: string;
}
