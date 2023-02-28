import {EntityUuidModel} from './entityUuid.model';

export class PositionTravailModel extends EntityUuidModel {

  public idPositionTravail: number;
  public libelle: string;
  public couleur: string;
  public oldPositionColor?: string;
  public minQualfication: number;
  public dureeMax: number;
  public priorite: number;
  public fermeture: boolean;
  public prod: boolean;
  public decalageArrive: number;
  public decalageDepart: number;
  public senseDecalageArrive: boolean;
  public senseDecalageDepart: boolean;
  public actifPositionTravail: boolean;
  public groupement: PositionTravailModel[] = [];

  // pour gérer l'association manyto many avec positionnement
//  public positionementPositionTravails: PositionnementPositionTravailModel[];


  constructor() {
    super();
    this.idPositionTravail = 0;
    this.libelle = '';
    this.couleur = '#c4c0c0';
    this.dureeMax = 0;
    this.fermeture = false;
    this.prod = false;
    this.decalageArrive = 0;
    this.decalageDepart = 0;
    this.senseDecalageArrive = false;
    this.senseDecalageDepart = false;
    this.priorite = 1;
    this.minQualfication = 0;
    this.actifPositionTravail = true;
    this.groupement = [];
  }

}
