import {JourDisponibiliteModel} from './jourDisponibilite.model';
import {EntityUuidModel} from './entityUuid.model';


export class DisponibiliteModel extends EntityUuidModel {
  public idDisponibilite;
  // represente la disponibilite totale de la semaine
  public dispoHebdo = '';

  // represente le ratio de total disponibilite hebdo par rapport aux
  // nombres d'heures mentionnee au niveau du contrat
  public ratio = '';
  public alternate = false;
  public jourDisponibilites: JourDisponibiliteModel[] = [];
}
