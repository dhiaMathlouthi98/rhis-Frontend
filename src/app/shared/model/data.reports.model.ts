import {RapportModel} from './rapport.model';
import {MailModel} from './mail.model';
import {EntityUuidModel} from './entityUuid.model';

export class DataReportsModel extends EntityUuidModel {

  public restaurantName: string;
  public restaurantAdresse: string;
  public restaurantCity: string;
  public employeeTitle: string;
  public employeeAdresse: string;
  public directeur: string;
  public pathFile: string;
  public pathFileUnix: string;
  public employeeName: string;
  public description: string;
  public image: string;
  public employeeJob: string;
  public employeeContratDate: Date;
  public restaurantNameDate: string;
  public restaurantCityContratTc: string;
  public emplMnthHeures: string;
  public restaurantNameContratTravail: string;
  public dateEffective: string;
  public fonctionName: string;
  public restaurantCityAttestationEmploi: string;
  public rapport: RapportModel;
  public mail = {} as MailModel;
}
