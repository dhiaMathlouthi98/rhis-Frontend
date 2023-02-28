import {EmployeeModel} from './employee.model';
import {JourReposModel} from './jourRepos.model';
import {EntityUuidModel} from './entityUuid.model';


export class SemaineReposModel extends EntityUuidModel {

  public idSemaineRepos: number;
  public debutSemaine: Date;
  public finSemaine: Date;
  public joursRepos: JourReposModel[];
  public employee: EmployeeModel;
}
