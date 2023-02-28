import {EmployeeModel} from './employee.model';
import {RestaurantModel} from './restaurant.model';
import {JourSemaine} from '../enumeration/jour.semaine';
import {PositionTravailModel} from './position.travail.model';
import {EntityUuidModel} from './entityUuid.model';

export class ShiftFixeModel extends EntityUuidModel {

  public idShiftFixe;
  public dateDebut;
  public dateFin;
  public employee: EmployeeModel;
  public restaurant: RestaurantModel;
  public jour: JourSemaine;
  public heureDebut;
  public  heureFin;
  public  addShiftFixe = false;
  public positionTravail: PositionTravailModel;
  public dateDebutIsNight;
  public dateFinIsNight;
  public modifiable = false;
  public acheval = false;
  public longer = false;
  public timeToSubstruct = 0;
  public shiftAchevalHidden = false;
  public sameDateToShiftAcheval = false;
  public shiftInLastWeek = false;

  constructor() {
    super();
  }


}
