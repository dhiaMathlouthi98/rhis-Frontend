import {EmployeeModel} from './employee.model';
import {StatutBadgeModel} from '../enumeration/statutBadge.model';
import {EntityUuidModel} from './entityUuid.model';

export class BadgeModel extends EntityUuidModel {

  public idBadge: number;
  public code: string;
  public statut: StatutBadgeModel;
  public dateDisponible: any;
  public commentaire: string;
  public employee: EmployeeModel;


  constructor() {
    super();
    this.init();
  }

  init() {
    this.commentaire = '';
    this.code = '';
  }


}
