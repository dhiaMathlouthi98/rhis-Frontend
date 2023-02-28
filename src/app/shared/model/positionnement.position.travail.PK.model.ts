/* clé primaire pour l'association manytomany entre positionTravail et chartePositionnement
* */
export class PositionnementPositionTravailPKModel {

  public idPostitionementPK: number;
  public idPositionPK: number;

  constructor() {
    this.idPostitionementPK = 0;
    this.idPositionPK = 0;
  }

}
