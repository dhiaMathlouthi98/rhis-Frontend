import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export class VisiteMedicaleModel extends EntityUuidModel {
  public idVisiteMedicale: number;
  public dateVisite: Date;
  public dateExpiration: Date;
  public valide: number;
  public employee: EmployeeModel;
  public jourAvant;
}
