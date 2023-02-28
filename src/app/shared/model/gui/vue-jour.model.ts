import {TypeEvenementModel} from '../type.evenement.model';
import {TypePointageModel} from '../type-pointage.model';
import {DateInterval} from './date-interval';
import {LoiPaysModel} from "../loi.pays.model";
import {ContratModel} from "../contrat.model";

export interface VueJourModel {
  date?: string;
  first?: boolean;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  last?: boolean;
  employees?: GuiEmployeeGdh[];
}

export interface GuiEmployeeGdh extends GuiVueJourTotalInfoGdh {
  idEmploye?: number;
  matricule?: string;
  nom?: string;
  prenom?: string;
  sexe?: any;
  dateNaissance?: any;
  shifts?: GuiShiftGdh[];
  absences?: GuiAbsenceGdh[];
  loiEmployee?: LoiPaysModel[];
  activeContrat?: ContratModel;
}

export interface GuiVueJourTotalInfoGdh {
  uuid?: string;
  coupures?: number;
  repas?: number;
  tempsPlanifies?: number;
  tempsPointes?: number;
  tempsAbsences?: number;
}

export interface GuiGdh extends DateInterval {
  id?: number;
  uuid?: string;
  totalMinutes?: number;
}

export interface GuiShiftGdh extends GuiGdh {
  pointages?: GuiPointageGdh[];
  absences?: GuiGdh[];
}

export interface GuiAbsenceGdh extends GuiGdh {
  idAbsConge?: number;
  typeEvenement?: TypeEvenementModel;
}

export interface GuiPointageGdh extends GuiGdh {
  sortie?: number;
  arrives?: number;
  modified?: number;
  typePointage?: TypePointageModel;
}

export interface GuiPointageAbsenceGdh {
  shift?: GuiShiftGdh;
  data?: any;
  first?: boolean;
  last?: boolean;
  shown?: boolean;
  error?: boolean;
}

export type PointageAbsenceStatus = 'present' | 'absent' | 'deleted';

export interface GuiPointageAbsenceActionGdh {
  fromStatus?: PointageAbsenceStatus;
  toStatus?: PointageAbsenceStatus;
  heureDebut?: string;
  heureDebutIsNight?: boolean;
  heureFin?: string;
  heurefinIsNight?: boolean;
  hoursInSameDay?: boolean;
  type?: TypePointageModel | TypeEvenementModel;
  date?: string;
}
