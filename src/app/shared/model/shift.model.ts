import {EmployeeModel} from './employee.model';
import {PositionTravailModel} from './position.travail.model';
import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';
import { JourSemaine } from '../enumeration/jour.semaine';

export class ShiftModel extends EntityUuidModel {

  public idShift?: number | string;
  public oldIdShift?: number | string;
  public employee?: EmployeeModel;
  public heureDebut?;
  public heureFin?;
  public dateDebut?;
  public dateFin?;
  public heureDebutIsNight?: boolean;
  public heureFinIsNight?: boolean;
  public idRestaurant?: number;
  public dateJournee?: any;
  public positionTravail?: PositionTravailModel;
  public heureDebutModifier?;
  public heureDebutModifierIsNight?: boolean;
  public heureFinModifier?;
  public heureFinModifierIsNight?: boolean;
  public idPlanning?: number;
  public listShiftAssocie?;
  public nombreEmployeeRequis?;
  public shiftPrincipale?: boolean;
  public totalHeure?: number;
  public jour?: any;
  public createFromReference?: boolean;
  public restaurant?: RestaurantModel;
  // attributs concernant les shifts qui sont en dehors du decoupage horaire qui seront partiellement affichés
  public heureDebutToDisplay?: Date;
  public heureFinToDisplay?: Date;
  public heureDebutIsNightToDisplay?: boolean;
  public heureFinIsNightToDisplay?: boolean;
  public x?: number; // position du shift par rapport à l'axe du temps
  public cols?: number; // nombre de colonne représentant la longueur du shift
  public sign = false;
  public colorSign: string;
  public oldShiftData?: any;
  public pauseToRemove?: number;
  public fromPlanningManager?: boolean;
  public fromPlanningLeader?: boolean;
  public notActifEquip?: boolean;
  public shiftFromAbsence?: boolean;
  public totalAbsence?: number;
  public heureDebutCheval?: any;
  public heureDebutChevalIsNight?: boolean;
  public heureFinCheval?: any;
  public heureFinChevalIsNight?: boolean;
  public modifiable?: boolean;
  public acheval?: boolean;
  public totalHeureACheval?: number;
  public previousModifiableValue?: boolean;
  public colACheval?: number;
  public previousHeureDebut?: any;
  public previousHeureDebutIsNight?: boolean;
  public previousHeureFin?: any;
  public previousHeureFinIsNight?: boolean;
  public fromUndoResize?: boolean;
  public longer = false;
  public timeToSubstruct = 0;
  public oldShiftFixId?: number | string;
  public idDefaultEmploye?: number | string;
  public fromShiftFix?: boolean;


  public dateDebutIsNight?: boolean;
  public dateFinIsNight?: boolean;
  public shiftAchevalHidden?: boolean;
  public shiftInLastWeek?: boolean;
  public sameDateToShiftAcheval?: boolean;

  public shiftIndexInDay?: number;
  public oldEmployee?: EmployeeModel;

  constructor() {
    super();
  }
}
