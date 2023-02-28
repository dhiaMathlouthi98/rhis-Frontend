import {JourSemaine} from '../enumeration/jour.semaine';
import {EntityUuidModel} from './entityUuid.model';

export class ParametreNationauxModel extends EntityUuidModel {

  public idParametreNationaux: number;
  public payerLeBreak: boolean;
  public inactiviteEstBreak: boolean;
  public dureePref;
  public dureeMin;
  public premierJourSemaine: JourSemaine;
  public premierJourWeekend: JourSemaine;
  public dernierJourWeekend: JourSemaine;
  public heureDebutWeekend;
  public heureFinWeekend;
  public dureeShift1;
  public dureeShift2;
  public dureeShift3;
  public dureeBreak1;
  public dureeBreak2;
  public dureeBreak3;
  public ageJeuneFeminin: number;
  public ageJeuneMasculin: number;
}
