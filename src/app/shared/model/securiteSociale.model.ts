import {ProcedureModel} from './procedure.model';
import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export class SecuriteSocialeModel extends EntityUuidModel {
  public idSecuriteSocial: number;
  public idRestaurant: number;
  public numero: string;
  public noCentre: string;
  public noTitreSejour: string;
  public nomTitreSejour: string;
  public prefecture: string;
  public adresse1: string;
  public codePostal: string;
  public ville: string;
  public debutValiditeSejour;
  public finValiditeSejour;
  public date1erAutorisationTravail;
  public debutValiditeAutorisationTravail;
  public finValiditeAutorisationTravail;
  public eleveEtudiant: boolean;
  public procedure: ProcedureModel;
  public employee: EmployeeModel;
  public numTelephUrgence;
  public nomPersonneContacter;
  public mutuelle;
}
