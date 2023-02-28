import {RestaurantModel} from './restaurant.model';
import {EntityUuidModel} from './entityUuid.model';

export class PeriodeManagerModel extends EntityUuidModel {

  public idPeriodeManager: number;

  public libelle;
  public dateDebut;
  public dateFin;
  public dateDebutIsNight;
  public dateFinIsNight;
  public statut?: boolean;

  public restaurant: RestaurantModel;


  constructor() {
    super();
    this.idPeriodeManager = 0;
  }
}
