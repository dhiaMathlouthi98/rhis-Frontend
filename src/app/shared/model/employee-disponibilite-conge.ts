import {EntityUuidModel} from './entityUuid.model';

export interface EmployeeDisponibiliteConge {
  congeActuel: string;
  groupeTravail: string;
  disponibilites: Disponibilite[];
}

export interface Disponibilite extends EntityUuidModel {
  idJourDisponibilite: number;
  jourSemain: string;
  debut1: any;
  fin1: any;
  debut2: any;
  fin2: any;
  debut3: any;
  fin3: any;
  dispoJour: boolean;
  heureDebut1IsNight: boolean;
  heureFin1IsNight: boolean;
  heureDebut2IsNight: boolean;
  heureFin2IsNight: boolean;
  heureDebut3IsNight: boolean;
  heureFin3IsNight: boolean;
  odd: boolean;
}
