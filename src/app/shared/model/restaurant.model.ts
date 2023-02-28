import {NationaliteModel} from './nationalite.model';
import {TypePeriodeRestaurantModel} from '../enumeration/typePeriodeRestaurant.model';
import {ParametreNationauxModel} from './parametre.nationaux.model';
import {TypeEvenementModel} from './type.evenement.model';
import {TypeRestaurantModel} from './typeRestaurant.model';
import {SocieteModel} from './societe.model';
import {EmployeeModel} from './employee.model';
import {ParametrePlanningModel} from './parametre.planning.model';
import {EntityUuidModel} from './entityUuid.model';
import {FranchiseModel} from './franchise.model';

export class RestaurantModel extends EntityUuidModel {
  public idRestaurant: number;
  public libelle: string;
  public matricule: string;
  public adresse: string;
  public codePostal: string;
  public telephone: string;
  public telephone2: string;
  public codeDebutMatricule: string;
  public numTVA: string;
  public siret: string;
  public codeAPE: string;
  public numURSSAF: string;
  public centreURSSAF: string;
  public pointRassemblement: string;
  public typeRestaurant: TypeRestaurantModel;
  public defaultRestaurant: boolean;
  public directeur: EmployeeModel;

  // public users: UserRestaurantModel[];
  // public decoupageHoraires: DecoupageHoraireModel[];
  public pays: NationaliteModel;
  public parametreNationaux: ParametreNationauxModel;
  public parametrePlanning: ParametrePlanningModel;
  // public parametreGlobals: ParametreModel[];
  // public alerte: AlerteModel;
  public societe: SocieteModel;
  public periodeRestaurant: TypePeriodeRestaurantModel;
  public valeurDebutMois: number;
  public arrondiContratSup: boolean;
  public typeEvenements: TypeEvenementModel[];
  public jourFeriesRefs;
  public codePointeuse: string;
  public franchise: FranchiseModel;
  public occupationalHealthServiceCode: string;

  constructor() {
    super();
    this.defaultRestaurant = false;
    this.valeurDebutMois = 1;
  }

}
