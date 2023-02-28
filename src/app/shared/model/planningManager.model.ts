import {EmployeeModel} from './employee.model';
import {PeriodeManagerModel} from './periode.manager.model';
import {PlanningManagerProductifModel} from './planningManagerProductif.model';
import {EntityUuidModel} from './entityUuid.model';

export class PlanningManagerModel extends EntityUuidModel {

  public idPlanningManager: number;

  public dateJournee: any;
  public heureDebut;
  public heureDebutIsNight: boolean;
  public heureFin;
  public heureFinIsNight: boolean;
  public periodeManager: PeriodeManagerModel;
  public managerOuLeader: EmployeeModel;
  public planningLeader = false;
  public totalMinute = 0;
  public sign = false;
  public colorSign: string;
  public pauseToRemove?: number;
  public notActiveShift?: boolean;
  public planningManagerProductif: PlanningManagerProductifModel [];
  public modifiable = false;
  public acheval = false;
  public longer = false;
  public timeToSubstruct = 0;
  public achevalWeek = false;
  public shiftAchevalHidden = false;
  public sameDateToShiftAcheval = false;
  public mobileBroadcasted: boolean;
}
