import {PositionTravailModel} from './position.travail.model';
import {PositionnementPositionTravailPKModel} from './positionnement.position.travail.PK.model';
import {PositionnementModel} from './positionnement.model';
import {EntityUuidModel} from './entityUuid.model';

/* model obtenu de l'association manytomany entre positionTravail et chartePositionnement
* */
export class PositionnementPositionTravailModel extends EntityUuidModel {

  public positionnementPositionTravailID: PositionnementPositionTravailPKModel;
  public valeur: number | string;
  public positionnement: PositionnementModel;
  public positionTravail: PositionTravailModel;

  public erreurEffectif: boolean;

  constructor() {
    super();
    this.positionnementPositionTravailID = new PositionnementPositionTravailPKModel();
    this.valeur = 0;
  }

}
