import {EntityUuidModel} from './entityUuid.model';

export class DisponibiliteConfigModel extends EntityUuidModel {
  public openHour;
  public closeHour;
  public weekDays;
  public minShift;
  public maxDispoDay: number;
  public maxDispoWeek: number;
}
