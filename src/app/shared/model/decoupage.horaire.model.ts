import {RestaurantModel} from './restaurant.model';
import {PhaseModel} from './phase.model';
import {EntityUuidModel} from './entityUuid.model';

export class DecoupageHoraireModel extends EntityUuidModel {

  public idDecoupageHoraire: number;

  public valeurDimanche;
  public valeurDimancheIsNight: boolean;
  public valeurDimancheIsNew: boolean;

  public valeurLundi;
  public valeurLundiIsNight: boolean;
  public valeurLundiIsNew: boolean;

  public valeurMardi;
  public valeurMardiIsNight: boolean;
  public valeurMardiIsNew: boolean;

  public valeurMercredi;
  public valeurMercrediIsNight: boolean;
  public valeurMercrediIsNew: boolean;

  public valeurJeudi;
  public valeurJeudiIsNight: boolean;
  public valeurJeudiIsNew: boolean;

  public valeurVendredi;
  public valeurVendrediIsNight: boolean;
  public valeurVendrediIsNew: boolean;

  public valeurSamedi;
  public valeurSamediIsNight: boolean;
  public valeurSamediIsNew: boolean;

  public phase: PhaseModel;

  public restaurant: RestaurantModel;

  public hasCorrectValue: boolean;

  public isVisited: boolean;
  public canDelete: boolean;


  constructor() {
    super();
    this.idDecoupageHoraire = 0;
    this.phase = new PhaseModel();
    this.hasCorrectValue = true;

    this.valeurDimancheIsNight = false;
    this.valeurLundiIsNight = false;
    this.valeurMardiIsNight = false;
    this.valeurMercrediIsNight = false;
    this.valeurJeudiIsNight = false;
    this.valeurVendrediIsNight = false;
    this.valeurSamediIsNight = false;

    this.valeurDimancheIsNew = false;
    this.valeurLundiIsNew = false;
    this.valeurMardiIsNew = false;
    this.valeurMercrediIsNew = false;
    this.valeurJeudiIsNew = false;
    this.valeurVendrediIsNew = false;
    this.valeurSamediIsNew = false;

    this.canDelete = true;

  }
}
