import {CharteModel} from './charte.model';
import {PositionnementPositionTravailModel} from './positionnement.position.travail.model';
import {EntityUuidModel} from './entityUuid.model';

export class PositionnementModel extends EntityUuidModel {

  public idPositionement: any;

  // nombre de transaction
  public nombreTours: number;
  public platMoyen: number;
  public venteHoraire: any;
  public effectif: number;
  public productivite: number;
  public pourcentageCol: number;
  public charte: CharteModel;


  public hasWrongValue: boolean;
  public erreurTotalEffectif: boolean;
  public erreurCA: boolean;

  public isSelected: boolean;
  // pour gérer l'association manyto many avec positionTravail
  public positionementPositionTravails: PositionnementPositionTravailModel[] = [];

  constructor() {
    super();
    this.idPositionement = 0;
    this.nombreTours = 0;
    this.platMoyen = 0.00;
    this.venteHoraire = 0.00;
    this.effectif = 0;
    this.pourcentageCol = 0;
    this.productivite = 0;
    this.positionementPositionTravails = [];
    this.isSelected = false;
  }

}
