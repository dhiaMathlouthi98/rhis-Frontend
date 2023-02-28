import {DisponibiliteModel} from './disponibilite.model';
import {EntityUuidModel} from './entityUuid.model';

export class JourDisponibiliteModel extends EntityUuidModel {

  public idJourDisponibilite;
  public debut1 = null;
  public fin1 = null;
  public debut2 = null;
  public fin2 = null;
  public debut3 = null;
  public fin3 = null;
  public jourSemain;

  // identifie la disponibilite de l'employe (true si l'employe est disponible de
  // l'ouverture a la fermeture de restaurant et false si non)
  public dispoJour = false;
  public disponibilite: DisponibiliteModel;

  public heureDebut1IsNight = false;
  public heureFin1IsNight = false;
  public heureDebut2IsNight = false;
  public heureFin2IsNight = false;
  public heureDebut3IsNight = false;
  public heureFin3IsNight = false;

  public odd = false;
}
