import {Injectable} from '@angular/core';
import {TypePointageModel} from '../../../../shared/model/type-pointage.model';

@Injectable({
  providedIn: 'root'
})
export class TypePointageUtilitiesService {

  public getTypePointageByLibelle(typesPointages: TypePointageModel[], libelle: string): TypePointageModel {
    return typesPointages.find(typePointage => typePointage.libelle === libelle);
  }
}
