import {RepartitionModel} from './repartition.model';
import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';


export interface RepartitionTimeModel extends EntityUuidModel {
  idContrat: number;
  hebdo: number;
  mens: number;
  annee: number;
  txHoraire: number;
  salaire: number;
  compt: number;
  jourReposConsecutifs: boolean;
  tempsPartiel: boolean;
  repartition: RepartitionModel;
   employee: EmployeeModel;
}
