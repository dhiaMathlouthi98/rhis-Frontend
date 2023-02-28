import {NationaliteModel} from './nationalite.model';
import {ContraintesSocialesModel} from './contraintes.sociales.model';

export class LoiPaysModel extends ContraintesSocialesModel {

  public valeurMajeurTempsPlein: string;
  public valeurMineurTempsPlein: string;
  public valeurMajeurTempsPartiel: string;
  public valeurMineurTempsPartiel: string;

  public valeurMajeurAfficher: string;
  public valeurMineurAfficher: string;
  public pays: NationaliteModel;
  public translatedLibelle: string;
  public loiPointeuse: boolean;

  public isValid: boolean;
  public isTime: boolean;
  valeurMajeurPointeuseAfficher: string;
  valeurMajeurPointeuseTempsPlein: string;
  valeurMineurPointeuseAfficher: string;
  valeurMineurPointeuseTempsPlein: string;
  valeurMajeurPointeuseTempsPartiel: string;
  valeurMineurPointeuseTempsPartiel: string;


  constructor() {
    super();
  }
}
