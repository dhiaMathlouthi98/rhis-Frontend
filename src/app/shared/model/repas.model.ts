import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export interface RepasModel extends EntityUuidModel {
  id?: number;
  date?: Date;
  nbrRepas?: number;
  employee?: EmployeeModel;
}
