import {ContraintesSocialesModel} from './contraintes.sociales.model';
import {GroupeTravailModel} from './groupeTravail.model';
import {LoiRestaurantModel} from './loi.restaurant.model';

export class LoiGroupeTravailModel extends ContraintesSocialesModel {

  public valeurMajeurTempsPlein: string;
  public valeurMineurTempsPlein: string;
  public valeurMajeurTempsPartiel: string;
  public valeurMineurTempsPartiel: string;
  public isTime = false;
  public isValid = true;
  public isPeriod = false;
  public majeurBooleanValue: boolean;
  public mineurBooleanValue: boolean;
  public majeurBooleanPointeuseValue: boolean;
  public mineurBooleanPointeuseValue: boolean;

  public translatedLibelle: string;
  public valeurMajeurAfficher: string;
  public valeurMineurAfficher: string;
  public loiRef: LoiRestaurantModel;
  public toolTipShowMajeur: boolean;
  public toolTipShowMineur: boolean;

  public groupeTravail: GroupeTravailModel;
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
