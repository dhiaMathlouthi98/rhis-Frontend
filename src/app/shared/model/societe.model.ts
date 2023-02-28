import {NationaliteModel} from './nationalite.model';
import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class SocieteModel extends EntityUuidModel {

  idSociete: number;
  societeName: string;
  adresse1: string;
  codePostal: string;
  ville: string;
  telephone1: string;
  telephone2: string;
  fax: string;
  nomPrefecture: string;
  adressePrefecture1: string;
  codePostalPrefecture: string;
  villePrefecture: string;
  telephonePrefecture1: string;
  formeJuridique: string;
  numSiren: string;
  villeRCS: string;
  capital: string;
  caisseRetraite: string;
  adresseRetraite1: string;
  codePostalRetraite: string;
  villeRetraite: string;
  pays: NationaliteModel;
  restaurants: RestaurantModel[];

constructor(){
  super();
}
}
