import {EntityUuidModel} from './entityUuid.model';

export class FormationModel extends EntityUuidModel {

  public idFormation: number;
  public libelle: string;
  public priorite: number;
  public code: string;
  public formationObligatoire: boolean;
  public formationSelectedForEmployee: boolean;
  public toolTipShow: boolean;
  public dateFormationEmployee: Date;
  public dureeValidite: number;
  public dateFinValidite: Date;
  public statut: boolean;

}
