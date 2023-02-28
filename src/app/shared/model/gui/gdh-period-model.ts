import {GuiAbsenceGdh, GuiVueJourTotalInfoGdh} from './vue-jour.model';

interface PageCoordinations {
  first?: boolean;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  last?: boolean;
}

interface EmployeeInfos extends GuiVuePeriodTotalInfoGdh {
  idEmploye?: number;
  matricule?: string;
  nom?: string;
  prenom?: string;
  avenantExist?: boolean;
  libelleGroupeTravail?: string;
  codeGdhGroupeTravail?: string;
  codeBadge?: string;
  dateEntree?: string;
  dateSortie?: string;
}

export interface GuiVuePeriodTotalInfoGdh extends GuiVueJourTotalInfoGdh {
  heureJoursFeries: number;
  tempsContrat: number;
  heureCompl: GuiItemGdh<number, HeureCompl>[];
  heureSupp: GuiItemGdh<number, HeureSupp>[];
  heureDeNuit: GuiItemGdh<number, HeureNuit>[];
  delta: number;
}

export interface VuePeriodModel extends PageCoordinations {
  employees?: GuiEmployeePeriodView[];
}

export interface VuePayeModel extends PageCoordinations {
  employees?: GuiEmployeePayeView[];
}

export interface GuiEmployeePeriodView extends EmployeeInfos {
  absences?: GuiAbsenceGdh[];
  pointages?: GuiPointagePeriod[];
}

export interface GuiEmployeePayeView extends EmployeeInfos {
  absences?: GuiItemGdh<number, number>[];
  pointages?: GuiPointagePaye[];
  tempsRestePlanifies?: number;
  codeGdh?: string;
}

type HeureCompl = 'CP0' | 'CP10' | 'CP25';
type HeureSupp = 'SP0' | 'SP25' | 'SP50';
type HeureNuit = 'N0' | 'N1' | 'N2';

export interface GuiItemGdh<V, T> {
  name: T;
  value: V;
  state: boolean;
}

export interface GuiPointagePeriod {
  dateJournee?: string;
  totalMinutes?: number;
  modified?: boolean;
}
export interface GuiContratPeriodVueInfo extends GuiContratHoraireInfo {
  avenants?: GuiAvenantPeriodVueInfo [];
}

export interface GuiAvenantPeriodVueInfo extends GuiContratHoraireInfo {
  // la date de début de l'avenant
  dateDebut?: string;
  // date fin de l'avenant
  datefin?: string;
}

interface GuiContratHoraireInfo {
  // le nombre d'heure hebdomadaire a realiser pour un employe
  hebdo: number | string;
  // le nombre d'heure mensuel a realiser pour un employe
  mens: number | string;
}
export interface GuiPointagePaye extends GuiItemGdh<number, number> {
  modified?: boolean;
  cumulAbsence?: number;
  cumulPointageAbsence?: number;
}

export interface GuiVueSemaineTotalInfoGdh extends GuiVuePeriodTotalInfoGdh {
  weekNbr?: number;
}

export interface GuiVuePayeTotalInfoGui extends GuiVuePeriodTotalInfoGdh {
  monthNbr?: number;
}

export interface GuiDay24DecoupageParams {
  endCurrentDay: string;
  startNextDay: string;
  endCurrentDayAsDate: Date;
  startNextDayAsDate: Date;
}

export interface GuiDay24Coordination {
  dateJournee: string;
  is24WithNextDay: boolean;
  is24WithPreviousDay: boolean;
  withNextDay24Coordination: GuiDay24DecoupageParams;
  withPreviousDayCoordination: GuiDay24DecoupageParams;
}
