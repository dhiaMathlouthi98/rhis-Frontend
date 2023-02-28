import {EntityUuidModel} from './entityUuid.model';

export class VerificationContrainteModel extends EntityUuidModel {
  public id;
  public message;
  public bloquante = false;
  public employe: any;
  public dateOfAnomalie: string;
  public idShift = 0;
  public acheval = false;
  public DisplayDate = false;

  constructor() {
    super();
  }
}
