import {EntityUuidModel} from './entityUuid.model';
import {ReceiverGUI} from './gui/ReceiverGUI.model';

export enum RapportPaieEnum {
  GDH_WEEK_VIEW = 'GDH_WEEK_VIEW',
  GDH_PERIOD_VIEW = 'GDH_PERIOD_VIEW',
  PAYROLL_INTEGRATION = 'PAYROLL_INTEGRATION',
  ACTIF_EMPLOYEES_LIST = 'ACTIF_EMPLOYEES_LIST'
}

export interface ParametreRapport extends EntityUuidModel {
  idParamEnvoi: string;
  comparatifFile: boolean;
  listRestaurantDispaly: any;
  typePeriodeCalcul: string; // jour, semaine,mois
  receiver: ReceiverGUI[]; // Les champs destinataires contiennent la liste des personnes qui recevront le rapport
  createur: any; // Le compte connecté avec lequel l'envoi a été créé
  lastNameFirstNameCreateur?: string;
  objectMail: string;
  message: string;
  frequenceExpedition: string; // Quotidienne, Hebdomadaire et Mensuel et VALIDATION
  frequenceValue?: string; // 3, 2,1
  scheduledTime: any; // heure planifié
  rapport: any;
  startDate: Date;
  endDate: Date;
  year: string;
  dayDelivery: string;  // jour de livraison
  uuidProfil: string;
  uuidCreateur: string;
  rapportPaieEnum: RapportPaieEnum[];
  decoupage: string;
}
