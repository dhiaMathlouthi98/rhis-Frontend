import {ModeVenteModel} from './modeVente.model';
import {VenteHoraireModel} from './vente.horaire.model';
import {VenteHoraireModeVentePkModel} from './vente.horaire.mode.vente.pk.model';
import {EntityUuidModel} from './entityUuid.model';

export class VenteHoraireModeVenteModel extends EntityUuidModel {

  public venteHoraireModeVentePK: VenteHoraireModeVentePkModel;
  public pourcentage: number;
  public transaction: number;
  public ventes: number;

  public modeVente: ModeVenteModel;
  public venteHoraire: VenteHoraireModel;

}
