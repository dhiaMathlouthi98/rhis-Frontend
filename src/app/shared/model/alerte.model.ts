import {NiveauAccessEnumeration} from '../enumeration/niveau.access.enumeration';
import {EntityUuidModel} from './entityUuid.model';

export class AlerteModel extends EntityUuidModel {

  private _idAlerte: number;
  public libelle: string;
  public valeurParam: string;
  public actif: boolean;
  public priorite: number;
  public description: string;
  public niveauAccess: NiveauAccessEnumeration;
  public prefixFichier: string;
  public displayChevron: boolean;

  get idAlerte(): number {
    return this._idAlerte;
  }

  set idAlerte(value: number) {
    this._idAlerte = value;
  }

  constructor() {
    super();
  }
}
