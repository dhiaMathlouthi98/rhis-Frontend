import {QualificationPkModel} from './qualificationPK.model';
import {PositionTravailModel} from './position.travail.model';
import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export class QualificationModel extends EntityUuidModel {

  public qualificationPK: QualificationPkModel;
  public valeurQualification: number;
  public employee: EmployeeModel;
  public positionTravail: PositionTravailModel;

  constructor() {
    super();
  }


}
