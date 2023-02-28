import {StatusDemandeCongeEnumeration} from './enumeration/status.demande.conge.enumeration';
import {TypeEvenementModel} from './type.evenement.model';
import {EmployeeModel} from './employee.model';
import {EntityUuidModel} from './entityUuid.model';

export class AbsenceCongeModel extends EntityUuidModel {

  public idAbsenceConge: number;
  public dateDebut: Date;
  public dateDebutDisplayInPlanningManagerOrLeader;
  public dateFin: Date;
  public heureDebut: Date;
  public heureDebutValeurNuit: boolean;
  public heureFin: Date;
  public heureFinValeurNuit: boolean;
  public dureeHeure: Date;
  public dureeJour: number;
  public periodeHoraire: boolean;
  public status: StatusDemandeCongeEnumeration;
  public typeEvenement: TypeEvenementModel;
  public employee: EmployeeModel;
  public detailEvenements?: DetailEvenementModel[];
  constructor() {
    super();
  }

}
export class DetailEvenementModel extends EntityUuidModel {
idDetailEvenement?: number;
dateEvent?: string;
nbHeure?: number;
heureDebut?: string;
heureDebutValeurNuit?: boolean;
heureFin?: string;
heureFinValeurNuit?: boolean;
absenceConge?: AbsenceCongeModel;
}
