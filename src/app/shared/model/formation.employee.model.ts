import {FormationModel} from './formation.model';
import {FormationEmployeePK} from './formation.employeePK';
import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export class FormationEmployeeModel extends EntityUuidModel {
  public formationEmployePK: FormationEmployeePK;
  public dateFormation: Date;
  public formation: FormationModel;
  public employee: EmployeeModel;

  constructor() {
    super();
  }
}
