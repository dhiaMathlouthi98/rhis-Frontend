import {EntityUuidModel} from './entityUuid.model';

export class DroitList extends EntityUuidModel {
  public name?: string;
  public code?: string;
  public id?: number;
  public permissionList?: DroitList[];
  public permission?: boolean;
}
