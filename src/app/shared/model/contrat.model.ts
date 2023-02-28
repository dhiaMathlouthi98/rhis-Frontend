import {RepartitionModel} from './repartition.model';
import {EmployeeModel} from './employee.model';
import {GroupeTravailModel} from './groupeTravail.model';
import {DisponibiliteModel} from './disponibilite.model';
import {MotifSortieModel} from './motifSortie.model';
import {TypeContratModel} from './type.contrat.model';
import {ContratPrimaryModel} from './contrat.primary.model';
import {RepartitionTimeModel} from './repartition.time.model';
import {EntityUuidModel} from './entityUuid.model';


export class ContratModel extends EntityUuidModel {
  idContrat;
  hebdo;
  mens;
  annee;
  txHoraire;
  salaire;
  compt;
  dateEffective;
  datefin;
  actif: boolean;
   jourReposConsecutifs: boolean;
   tempsPartiel: boolean;
   repartition: RepartitionModel;
   employee: EmployeeModel;
   typeContrat: TypeContratModel;
   groupeTravail: GroupeTravailModel;
   motifSortie: MotifSortieModel;
   disponibilite: DisponibiliteModel;
   avenantContrats: ContratModel[] = [];
  contratPrincipale: ContratModel ;
   dateSortie;
  contratInfoPrimary: ContratPrimaryModel;
  repartitionTime: RepartitionTimeModel;
  header: string;
  selectedAccordion: boolean;
  // afficher  le button modifier
  updateContratBoolean = false;
  // contrat existe ou nn
  contratExistInfoPrimary: boolean;

  // difference entre hebdo  et somme de  repatition
  istotalHeuresEquals = true;
  duplicateContrat = false;
  presenceDirecteurInfoprimary = false;
  txHoraireGroupeTravail = 0;
  // verifier si le contrat avec id ou nn
  isNewContrat = false;
  public ouvre = false;
  public ouvrable = false;
  public dateFinPeriodEssai: any;
  level: string;
  echelon: string;
  coefficient: string;
 }
