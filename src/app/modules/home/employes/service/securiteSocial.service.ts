import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {SecuriteSocialeModel} from '../../../../shared/model/securiteSociale.model';

@Injectable({
  providedIn: 'root'
})
export class SecuriteSocialService extends GenericCRUDRestService<SecuriteSocialeModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/securiteSociale`);
  }

  getSecuriteSocialsByEmployee(idEmployee) {
    return this.httpClient.get(this.baseUrl + '/employee/' + idEmployee);
  }
}
