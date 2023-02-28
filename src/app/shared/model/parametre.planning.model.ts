import {JourOrdreDernierPosteModel} from './jour.ordre.dernier.poste.model';
import {EntityUuidModel} from './entityUuid.model';

export interface ParametrePlanningModel extends EntityUuidModel {

  idParametrePlanning?: number;
  controleShift?: boolean;
  tauxMoyenEquipier?: number;
  tauxMoyenManager?: number;

  jourOrdreDernierPostes?: JourOrdreDernierPosteModel[];
}
