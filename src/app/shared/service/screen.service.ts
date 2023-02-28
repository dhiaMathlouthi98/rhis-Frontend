import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  constructor() { }

  SCREENS = {
    'EMPLOYEE': 'ELE',
    'PREVISION': 'GDP',
    'PLANNING': 'PLH',
    'GDH': 'GDH',
    'RAPPORT': 'GDR',
    'RAPPORT_RH': 'GRH',
    'GROUPE_TRAVAIL': 'EGT',
    'POSTE_TRAVAIL': 'EPT',
    'BADGE': 'EGB',
    'ALERTE': 'GDA',
    'TYPE_CONTRAT': 'GTC',
    'FORMATION': 'ELF',
    'FERIE': 'GTF',
    'TYPE_EVENEMENT': 'GTE',
    'PERIODE_PAIE': 'PRP',
    'PERIODE_MANAGER': 'GPM',
    'PARAM_RESTAURANT': 'GPN',
    'LOI_RESTAURANT': 'GLR',
    'SOCIETE' : 'LDS',
    'FRANCHISE': 'FRA',
    'MODE_VENTE' : 'GMV',
    'DECOUPAGE_HORAIRE' : 'EDH',
    'PARAMETRE_PLANNING' : 'GPP',
    'MANAGE_USERS' : 'GUR',
    'MANAGE_PROFILS': 'GPR',
    'RESTAURANT' : 'LDR',
    'USERS' : 'ELU',
    'PROFILS' : 'GDF',
    'TYPE_SANCTION' : 'EPR',
    'PERIODICITE' : 'EPR',
    'TYPE_POINTAGE' : 'GTP',
    'PROCEDURE' : 'GPS',
    'MOTIF_SORTIE' : 'GMS',
    'MOYEN_TRANSPORT' : 'GTT',
    'LOI_PAYS' : 'GLP',
    'NATIONALITE' : 'GDN',
    'GESTION_PARC': 'GDP',
    'GESTION_PAIE': 'GP',
    'PARAMETRE_PAIE': 'PVP',
    '': ''
  };

  public getScreen(screenBame: string): string {
    return this.SCREENS[screenBame];
  }

}
