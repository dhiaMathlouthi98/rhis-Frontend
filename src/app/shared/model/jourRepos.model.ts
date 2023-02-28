import {JourSemaine} from '../enumeration/jour.semaine';
import {EntityUuidModel} from './entityUuid.model';

export class JourReposModel extends EntityUuidModel {

  public idJourRepos: number;
  public jourSemaine: JourSemaine;
  public dateRepos: Date;
  public am: boolean;
  public pm: boolean;
}
