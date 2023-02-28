import {GroupeTravailModel} from './groupeTravail.model';
import {BadgeModel} from './badge.model';
import {MoyenTransportModel} from './moyenTransport.model';
import {Sexe} from '../enumeration/Sexe.model';
import {StituationFamiliale} from '../enumeration/SituationFamiliale.model';
import {NationaliteModel} from './nationalite.model';
import {SecuriteSocialeModel} from './securiteSociale.model';
import {BanqueModel} from './banque.model';
import {ContratModel} from './contrat.model';
import {AbsenceCongeModel} from './absence.conge.model';
import {SemaineReposModel} from './semaineRepos.model';
import {WeekDetailsPlanning} from './planning-semaine';
import {ShiftModel} from './shift.model';
import {LoiPaysModel} from './loi.pays.model';
import {EntityUuidModel} from './entityUuid.model';
import {QualificationModel} from './qualification.model';
import {DiversModel} from './divers.model';


export class EmployeeModel extends EntityUuidModel {
  public idEmployee: any;
  public matricule?: string;
  public email?: String;
  public restaurantId?: number;
  public sexe?: any;
  public nom = '';
  public prenom = '';
  public adresse?: any;
  public nomJeuneFille?: any;
  public situationFamiliale?: any;
  public dateNaissance?: any;
  public codePostal?: any;
  public ville?: any;
  public numTelephone?: any;
  public numPortable?: any;
  public dateEntree?: any;
  public dateSortie?: any;
  public dateRemise?: any;
  public dateRestitution?: any;
  public motifSortie?: any;
  public statut = false;
  public etat?: any;
  public carte?: any;
  public hebdoCourant?: any;
  public complAdresse?: any;
  public hasLaws: boolean;
  public groupeTravail?: GroupeTravailModel;
  public badge?: BadgeModel;
  public moyenTransport?: MoyenTransportModel;
  public sexeEnumeration?: String[] = Object.keys(Sexe);
  public situationFamilialEnumeration?: String[] = Object.keys(StituationFamiliale);
  public finValiditeSejour?: any;
  public finValiditeAutorisationTravail?: any;
  public nomPermisTravailCarteSejour?: any;
  public numPermisTravailCarteSejour?: any;
  public nationalite?: NationaliteModel;
  public securiteSocial?: SecuriteSocialeModel;
  public banque?: BanqueModel;
  // cette variable sera utilisé pour afficher le nom et le prenom de l'employee dans le dropdown
  public displayedName?: string;
  public contrats?: ContratModel[] = [];
  public absenceConges?: AbsenceCongeModel[] = [];
  public qualifications?: QualificationModel[];
  // calcule des differences des heures dans le shift fixe
  public totalRowTime?: any;
  public fullName?: any;
  public disablePlanningManagerOrLeaderOrFixe = false;
  public disableInactifEmployee? = false;
  public hebdoPlanifie?: number;
  public hebdoPlanifieToDisplay?: string;
  public plgEquipier?: boolean;
  public currentSemaineRepos?: SemaineReposModel[];
  public weekDetailsPlannings?: WeekDetailsPlanning[];
  public loiEmployee?: LoiPaysModel[];
  public totalPlanifieSemaine?: any[];
  // Liste des shifts d'une semaine pour les contraintes sociales
  public employeeWeekShiftCS?: ShiftModel[];
  public hasShift? = false;
  public listShiftForThreeWeek?: ShiftModel[];
  public isAffected?: boolean; // si employé est affecté à un shift
  public indexInRapport?: number; // utilisé au niveau du rapport journalier
  public isManagerOrLeader?: boolean; // si employé est affecté à un shift manager
  public totalAbsence?: number;
  public toolTipShow?: boolean;
  public loiPlanning?: LoiPaysModel[];
  public isAbsent?: boolean;
  public checkAbsenceDayPreviousWeek?: boolean;
  public listShiftPreviousAndLastWekk?: ShiftModel[];
  public divers?: DiversModel;
  public statutEmbauche?: string;
  public tempsAffecteData?: any[];
  villeNaissance?: string;
  paysNaissance?: NationaliteModel;
  codePostalNaissance?: string;
  handicap ? = false;
   listShiftForThreeWeekViewHebdo?: ShiftModel[];
   id_flux ?: string;
}
