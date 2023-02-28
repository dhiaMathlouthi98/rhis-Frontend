import {Employee, Shift} from './planning.model';

export class Restaurant {
  idRestaurant: number;
  libelle: string;
  matricule: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  telephone2: string;
  codeDebutMatricule: string;
  numTVA: number;
  siret: number;
  codeAPE: number;
  numURSSAF: number;
  centreURSSAF: string;
  pointRassemblement: string;
  defaultRestaurant: boolean;
  periodeRestaurant: string;
  valeurDebutMois: number;
  arrondiContratSup: boolean;
  parametrePlanning: ParametrePlanning;
  typeRestaurant: TypeRestaurant;
  employees: Employee[];
  societe: Societe;
  pays: string;
  directeur: Directeur;
  ecrans: string[];
  heureDeSeparation: string;
  heureDeSeparationIsNight: boolean;
}

export class ParametrePlanning {
  idParametrePlanning: number;
  controleShift: boolean;
  tauxMoyenEquipier: number;
  tauxMoyenManager: number;
  jourOrdreDernierPostes: string;
}

export class TypeRestaurant {
  idTypeRestaurant: number;
  nomType: string;
  pathLogo: string;
  statut: boolean
  typeComportementRestaurant: number;
}

export class Societe {
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
  restaurants: string;
  pays: string;
  affectations: string;
}

export class Directeur {
  idEmployee: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  adresse: string;
  complAdresse: string;
  motifSortie: string;
  nomJeuneFille: string;
  situationFamiliale: string;
  sexe: string;
  dateNaissance: string;
  codePostal: string;
  ville: string;
  numTelephone: string;
  numPortable: string;
  dateEntree: string;
  dateSortie: string;
  dateRemise: string;
  dateRestitution: string;
  statut: boolean;
  hasLaws: boolean;
  hebdoCourant: number;
  finValiditeSejour: Date;
  finValiditeAutorisationTravail: Date;
  groupeTravail: string;
  nationalite: string;
  moyenTransport: string;
  badge: string;
  banque: string;
  securiteSocial: string;
  divers: string;
  disciplinaires: string;
  contrats: string;
  semaineRepos: string;
  enfants: string;
  absenceConges: string;
  visitesMedicale: string;
  formationsEmployees: string;
  qualifications: string;
  shifts: Shift[];
  loiPointeuse: string[];
  pointages: string[];
  listWeekendOff: string[];
  listDaysOff: string[];
  hebdoPlanifie: number;
  majeur: boolean;
}
