import {VenteHoraireModel} from './vente.horaire.model';
import {EntityUuidModel} from './entityUuid.model';

export class RepartitionMensuelleCa {
  CAReel: number;
  CAPlanifie: number;
}
// TODO add Model suffix in it's name
export class VenteJournaliere extends EntityUuidModel {
  idVenteJournaliere: number;
  dateVente: Date;
  numSemaine: number;
  realVentes: boolean;
  jour: string;
  ventes: number;
  trans: number;
  commentaire: string;
  venteHoraires: VenteHoraireModel[];
  jourDeReference: VenteJournaliere[];
  venteJournaliereModeVentes: VenteJournaliereModeVentes[];
}

export class VenteJournaliereModeVentePK {
  idModeVente: number;
  idVenteJournaliere: number;
}

export class VenteJournaliereModeVentes {
  venteJournaliereModeVentePK: VenteJournaliereModeVentePK;
  pourcentage: number;
  transaction: number;
  ventes: number;
}

export interface PrevisionsPlannedDays {
  days: string[];
  date: string;
  weekNumber: number;
}
