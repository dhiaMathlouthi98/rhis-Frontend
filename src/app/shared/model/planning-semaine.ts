import {ShiftModel} from './shift.model';
import {EntityUuidModel} from './entityUuid.model';

export class Periode extends EntityUuidModel {
  tempsPlanifie: any;
  tempsContrat: any;
  ratio?: string;
  heureSupp?: string;
  heureCompl?: string;
  tempsContratDisplay?: any;
  periodeDivisionTempsPlanifie?: number[];
  temspAbsence?: string;
  totalAbsenceInPeriode?: string;
}

export class Indisponibilite {
  heureDebut: any;
  heureDebutIsNight: boolean;
  heureFin: any;
  heureFinIsNight: boolean;
  fromAbsence: boolean;
  fromJourRepos: boolean;
}

export class WeekDetailsPlanning {
  dateJour: string;
  shifts: ShiftModel[];
  indisponibiliteEmployees: Indisponibilite[];
  shiftToRestore: ShiftModel[];
  totalAbsence: number; // totalAbsence planifié d'une journee en minutes
  libelleAbsence: string; //  libelle 1er absence
}
