import {EntityUuidModel} from './entityUuid.model';

export interface ParametreModel extends EntityUuidModel {

  idParametre?: number;
  rubrique?: string;
  param?: string;
  description?: string;
  valeur?: any;
  booleanValue?: boolean;
  floatValue?: boolean;
  isTime?: boolean;
  wrongValue?: boolean;
  leftBorderWrongValue?: boolean;
  rightBorderWrongValue?: boolean;
  isDate?: boolean;

}
