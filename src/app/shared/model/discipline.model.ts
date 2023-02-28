import {EmployeeModel} from './employee.model';
import {TypeSanctionModel} from './type-sanction.model';
import {EntityUuidModel} from './entityUuid.model';

export interface DisciplineModel extends EntityUuidModel {
  idDisciplinaire: string;
  dateFais: Date;
  faisReproches: string;
  dateDemandeJustif: Date;
  dateConvocation: Date;
  dateEntretien: Date;
  dateNotification: Date;
  employee: EmployeeModel;
  typeSanction: TypeSanctionModel;
}
