import {RapportContrat} from '../enumeration/rapportContrat';
import {EntityUuidModel} from './entityUuid.model';

export class RapportModel extends EntityUuidModel {

  public idRapport: number;
  public pathTemplate: string;
  public description: string;
  public categorie: string;
  public lastUsed: Date;
  public pathTemplateUnix: string;
  public libelleFile: string;
  public rapportContrat: String[] = Object.keys(RapportContrat);
  public module: string;
  public codeName: string;
  public paramsEnvoi?: boolean;
  public restaurants?: any[];
  public lib?: string;
  public uuidRapport?: string;
  public categorieType?: string;
}
