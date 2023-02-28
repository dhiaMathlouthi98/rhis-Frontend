import {PositionementPositionTravails} from '../chart.model';

export class WorkingDayLimits {
  value: string;
  night: boolean;
}

export class WorkPosition {
  couleur: string;
  idPositionTravail: number;
  libelle: string;
  minQualfication?: number;
  dureeMax?: number;
  priorite?: number;
  fermeture?: boolean;
  prod?: boolean;
  decalageArrive?: number;
  decalageDepart?: number;
  senseDecalageArrive?: boolean;
  senseDecalageDepart?: boolean;
  actifPositionTravail?: boolean;
  positionementPositionTravails?: PositionementPositionTravails[];
  groupement?: string[];
}

export class Employee {
  idEmployee: number;
  hebdoCourant: string;
  hebdoPlanifie: string;
  nom: string;
  prenom: string;
  matricule: string;
  contrainteSocial?: boolean;
  email?: string;
  adresse?: string;
  complAdresse?: string;
  motifSortie?: string;
  nomJeuneFille?: string;
  situationFamiliale?: string;
  sexe?: string;
  dateNaissance?: string;
  codePostal?: string;
  ville?: string;
  numTelephone?: string;
  numPortable?: string;
  dateEntree?: string;
  dateSortie?: string;
  dateRemise?: string;
  dateRestitution?: string;
  statut?: boolean;
  hasLaws?: boolean;
  finValiditeSejour?: string;
  finValiditeAutorisationTravail?: string;
  groupeTravail?: string;
  nationalite?: string;
  moyenTransport?: string;
  badge?: string;
  banque?: string;
  securiteSocial?: string;
  divers?: string;
  disciplinaires?: string;
  contrats?: string;
  semaineRepos?: string;
  enfants?: string;
  absenceConges?: string;
  visitesMedicale?: string;
  formationsEmployees?: string;
  qualifications?: string;
  shifts?: string;
  loiPointeuse?: string[];
  pointages?: string[];
  listWeekendOff?: string[];
  listDaysOff?: string[];
  majeur?: boolean;
}

export class Shift {
  idShift: number;
  dateJournee: string;
  heureDebut: string;
  heureDebutIsNight: boolean;
  heureFin: string;
  heureFinIsNight: boolean;
  totalHeure: number;
  positionTravail: WorkPosition;
  employee: Employee;
  nombreEmployeeRequis?: number;
  shiftPrincipale?: boolean;
  heureDebutModifier?: string;
  heureDebutModifierIsNight?: boolean;
  heureFinModifier?: string;
  heureFinModifierIsNight?: boolean;
  idPlanning?: number;
  idRestaurant?: number;
  listShiftAssocie?: Shift[];
}

export class Indisponibilite {
  heureDebut: string;
  heureDebutIsNight: boolean;
  heureFin: string;
  heureFinIsNight: boolean;
}

export class Planning {
  debutJourneeActivite: WorkingDayLimits;
  finJourneeActivite: WorkingDayLimits;
  shifts: Shift[];
  planningJour: PlanningJour;
}

export class TauxMOACATempsPayes {
  tauxMOA: number;
  ca: number;
  tempsPaye: string;
  heure: string;
}

export class PlanningJour {
  idPlanningJour: number;
  date: string;
  tauxMOA: number;
  tauxMOACATempsPayes: TauxMOACATempsPayes[];
}

export class WeekDetailsPlanning {
  dateJour: string;
  shifts: Shift[];
  indisponibilite: Indisponibilite[];
}

export class Periode {
  libelle: string;
  tempsPlanifie: string;
  tempsContrat: string;
  ratio: string;
  heureSupp: string;
  heureCompl: string;
}

export class DetailTempsPaye {
  dateJournee: string;
  tauxMOE: DetailTempsPayeValue[];
  CA: DetailTempsPayeValue[];
  tempsPaye: DetailTempsPayeValue[];
}

export class DetailCA {
  dateJournee: string;
  caValue: string;
  caAm: string;
  caPm: string;
  Prod: string;
  ProdPaye?: string;
  MoEquiMgrValue: string;
  Heures: string;
  cumul: DetailTempsPayeValue[];
  ca: DetailTempsPayeValue[];
  moEquiMgr: DetailTempsPayeValue[];
  caProd: DetailTempsPayeValue[];
}

export class DetailTempsPayeValue {
  heure: string;
  heureIsNight: boolean;
  valeur: string;
}

export class DetailTempsPayeWeek {
  totalTempsPaye: number;
  totalCA: number;
  tauxMOEMoyen: string;
  journee: Journee[];
}

export class Journee {
  dateJounree: string;
  totalTempsPaye: number;
  tempsPaye: DetailTempsPayeValue[];
}
