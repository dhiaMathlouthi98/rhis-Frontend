import {Injectable} from '@angular/core';
import {TypeEvenementModel} from '../../../../shared/model/type.evenement.model';

@Injectable({
  providedIn: 'root'
})
export class TypeEvenementUtilitiesService {

  public getTypeEvenementByLibelle(typesEvenements: TypeEvenementModel[], libelle: string): TypeEvenementModel {
    return typesEvenements.find(typeEvenement => typeEvenement.libelle === libelle);
  }

  public getTypeEvenementByCode(typesEvenements: TypeEvenementModel[], code: string): TypeEvenementModel {
    return typesEvenements.find(typeEvenement => typeEvenement.code === code);
  }
}
