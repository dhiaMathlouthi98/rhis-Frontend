import {RestaurantModel} from './restaurant.model';
import {VariablePayeEnum} from '../enumeration/variable.paye.enum';
import {EntityUuidModel} from './entityUuid.model';

export class VariablesPayesModel extends EntityUuidModel {

  idVariablesPayes?: number | string;

  codeMyRhis?: VariablePayeEnum;

  codePaye?: string;

  restaurant?: RestaurantModel;

  newVariable?: boolean;

  wrongValueDuplicated?: boolean;

  wrongValueEmpty?: boolean;


  constructor() {
    super();
    this.idVariablesPayes = 0;
    this.codePaye = '';
  }
}
