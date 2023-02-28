import {EmployeeModel} from './employee.model';
import {GroupeTravailModel} from './groupeTravail.model';
import {TypeContratModel} from './type.contrat.model';
import {ContratPrimaryModel} from './contrat.primary.model';
import {EntityUuidModel} from './entityUuid.model';


export interface ContratPrimaryModel extends EntityUuidModel {
  idContrat;
  dateEffective;
  datefin;
  employee: EmployeeModel;
  typeContrat: TypeContratModel;
  groupeTravail: GroupeTravailModel;
  actif: boolean;
  motifSortie;
  dateFinPeriodEssai;
  level: string;
  echelon: string;
  coefficient: string;
}
