import {TypePointageModel} from './type-pointage.model';
import {EntityUuidModel} from './entityUuid.model';

export interface PointageModel extends EntityUuidModel {
  idPointage?: number;
  idEmployee?: number;
  idShift?: number;
  idRestaurant?: number;
  dateJournee?: string;
  heureDebut?: string;
  heureDebutIsNight?: boolean;
  heureFin?: string;
  heureFinIsNight?: boolean;
  tempsPointes?: number;
  typePointageRef?: TypePointageModel;
  // 0 : created from pointeuse; 1 : modified GDH; 2: modified pointeuse; 3: created from gdh
  modified?: number;
  isAcheval?: boolean;
}
