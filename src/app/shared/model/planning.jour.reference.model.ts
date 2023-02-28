import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class PlanningJourReferenceModel extends EntityUuidModel {
  public idPlanningJourReference?: number;
  public libelle?: string;
  public dateJournee?;
  public dateDebut?;
  public dateFin?;
  public semaine?: boolean;
  public restaurant?: RestaurantModel;
}
