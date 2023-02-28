import {VenteHoraireModeVenteModel} from './vente.horaire.mode.vente.model';
import {EntityUuidModel} from './entityUuid.model';

export class VenteHoraireModel extends EntityUuidModel {

  public idVenteHoraire: any;
  public heureDebut: any;
  public heureDebutNuit: boolean;
  public heureFin: any;
  public heureFinNuit: boolean;
  public ventesLissees: number;
  public ventes: number;
  public pourcentage: number;
  public trans: number;
  public plateauMoyen: number;
  public phaseName: string;

  public venteHoraireModeVentes: VenteHoraireModeVenteModel[];

}
