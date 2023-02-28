import {PositionTravailModel} from './position.travail.model';
import {PlanningManagerModel} from './planningManager.model';
import {EntityUuidModel} from './entityUuid.model';

export class PlanningManagerProductifModel extends EntityUuidModel {


  public idPlanningManagerProductif;

  public heureDebut;

  public heureFin;

  public heureDebutIsNight;

  public heureFinIsNight;

  public additionel;
  public  planningManager: PlanningManagerModel;

  public  positionTravail: PositionTravailModel;
  public heureDebutPlanningManagerProductifRequiredField = false;

  public heureFinPlanningManagerProductifRequiredField = false;
  public horraireConfonduesErrorMessage = false;
  public errorHourePlanningManagerProductifMessage = '';
  // Les heures de la periode productive doivent etre inclu dans les heures du shift planning
  public heureInclu = false;
  public totalMinute: number;



}
