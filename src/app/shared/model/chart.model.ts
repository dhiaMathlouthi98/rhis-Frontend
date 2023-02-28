import {EntityUuidModel} from './entityUuid.model';

export class PositionDeTravail extends EntityUuidModel {
  couleur: string;
  decalageArrive: number;
  decalageDepart: number;
  dureeMax: number;
  fermeture: boolean;
  idPositionTravail: number;
  libelle: string;
  minQualfication: number;
  positionementPositionTravails: PositionementPositionTravails;
  priorite: number;
  prod: boolean;
  senseDecalageArrive: boolean;
  senseDecalageDepart: boolean;
}

export class PositionnementPositionTravailID {
  idPostitionementPK: number;
  idPositionPK: number;
}

export class PositionementPositionTravails {
  positionnementPositionTravailID: PositionnementPositionTravailID;
  valeur: number;
}

export class Positionnement extends EntityUuidModel {
  effectif: number;
  idPositionement: number;
  nombreTours: number;
  platMoyen: number;
  positionementPositionTravails: PositionementPositionTravails[];
  pourcentageCol: number;
  productivite: number;
  venteHoraire: number;
}

export class CharteData extends EntityUuidModel {
  idcharte: number;
  libelle: string;
  positionnements: Positionnement[];
}

export class CharteType {
  idCharte: number;
  libelle: string;
}

export class SelectedPDT {
  label: string;
  color: string;
  value: number;
  idPosition: number;
}
