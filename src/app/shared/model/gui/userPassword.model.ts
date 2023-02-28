import {AffectationModel} from '../affectation.model';
import {langueUser} from '../../enumeration/langueUser';

export class UserPasswordModel {
  idUser?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  oldPassword?: string;
  password?: string;
  affectations?: AffectationModel[] = [];
  pseudo?: string;
  langue?: string;
}
