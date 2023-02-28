import {ValidationContrainteSocialeModel} from '../enumeration/validationContrainteSociale.model';
import {EntityUuidModel} from './entityUuid.model';

export class ContraintesSocialesModel extends EntityUuidModel {

  private _idContraintesSociales: number;
  public libelle: string;
  public bloquante: boolean;
  public validationContrainteSociale: ValidationContrainteSocialeModel;
  public status: boolean;
  public codeName: string;


  public mineurForbiddenChanges = false;
  public majeurForbiddenChanges = false;
  public majeurPointeuseForbiddenChanges = false;
  public mineurPointeuseForbiddenChanges = false;

  constructor() {
    super();
  }

  get idContraintesSociales(): number {
    return this._idContraintesSociales;
  }

  set idContraintesSociales(value: number) {
    this._idContraintesSociales = value;
  }
}
