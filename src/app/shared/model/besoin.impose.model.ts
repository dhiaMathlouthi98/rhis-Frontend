import {PositionTravailModel} from './position.travail.model';
import {RestaurantModel} from './restaurant.model';
import {JourSemaine} from '../enumeration/jour.semaine';
import {EntityUuidModel} from './entityUuid.model';

export class BesoinImposeModel extends EntityUuidModel {

  public idBesoinImpose: number;
  public heureDebut;
  public heureDebutNuit: boolean;
  public heureFin;
  public heureFinNuit: boolean;
  public dateDebut;
  public dateFin;
  public valeur = 1;
  public jourSemaine: JourSemaine;
  public day: number;
  public additionel: boolean;
  public positionTravail: PositionTravailModel;
  public restaurant: RestaurantModel;
  public acheval?: boolean;
  public shiftAchevalHidden?: boolean;
  public shiftInLastWeek = false;
}
