import {JourSemaine} from '../enumeration/jour.semaine';
import {EntityUuidModel} from './entityUuid.model';

export interface JourOrdreDernierPosteModel extends EntityUuidModel {
  idJourOrdreDernierPoste?: number;
  jour?: JourSemaine;
  ordre?: number;
  dernierPoste;
  valeurNuitDernierPoste?: boolean;

  /**
   * Cette valeur existe seulement dans la partie frontEnd afin de ne pas donner la main a l'utilisateur-restaurant de mettre une valeur inf a la valeur du debut de journeee du restaurant
   * Exp : Restaurant commence a 6h; on peut pas avoir une valeur de dernierPoste = 3 heure du jour.
   */
  minHeure;
}
