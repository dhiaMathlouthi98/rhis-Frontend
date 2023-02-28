import {EntityUuidModel} from './entityUuid.model';
import {PositionTravailModel} from './position.travail.model';
import {RestaurantModel} from './restaurant.model';

export interface ReferenceShiftModel extends EntityUuidModel {
    idRefShift?: number | string;
    heureDebut?: string;
    heureDebutIsNight?: boolean;
    heureFin?: string;
    heureFinIsNight?: boolean;
    dateJournee?: string;
    idPlanning?: number | string;
    positionTravail?: PositionTravailModel;
    restaurant?: RestaurantModel;
}
