import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {MoyenTransportModel} from '../../../../shared/model/moyenTransport.model';
import {ConfigTypeService} from './config-type.service';

@Injectable({
  providedIn: 'root'
})
export class MoyenTransportService extends ConfigTypeService<MoyenTransportModel> {

  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'moyenTransport');
  }

  /**
   * Get 'Moyen de transport' by employee id
   * @param: idEmployee
   */
  public getMoyenTransportByEmployee(idEmployee) {
    return this.httpClient.get(this.baseUrl + '/employee/' + idEmployee);
  }

  /**
   * get all moyen trnasport active
   */
 public getAllMoyenTransportActive() {
    return this.httpClient.get(this.baseUrl + '/active/all');
  }

}
