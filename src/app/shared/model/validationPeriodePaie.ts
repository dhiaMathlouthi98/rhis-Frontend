import {EntityUuidModel} from './entityUuid.model';
import { RestaurantModel } from './restaurant.model';

export class ValidationPeriodPaiePk{
    startPeriod : string;
    endPeriod: string;
    restaurant: RestaurantModel;
}


export class ValidationPeriodPaie extends EntityUuidModel {
    id : ValidationPeriodPaiePk;
    validatorLastFirstName : string;
    validatorUuid: string;
    validationTime: string;
    generationTime: string;
    validated: boolean;
    generated: boolean;
}
