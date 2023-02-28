import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class GdhDayNoteModel extends EntityUuidModel {
  id: number;
  date: Date;
  note: string;
  restaurant: RestaurantModel;
}
