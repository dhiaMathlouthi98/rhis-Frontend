import {AffectationModel} from './affectation.model';
import {EntityUuidModel} from './entityUuid.model';

export class MyRhisUserModel extends EntityUuidModel {
  idUser?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  password?: string;
  affectations?: AffectationModel[] = [];
  pseudo?: string;
  langue?: string;
  mobile?: boolean;

}
