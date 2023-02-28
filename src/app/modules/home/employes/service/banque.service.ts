import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {BanqueModel} from '../../../../shared/model/banque.model';

@Injectable({
  providedIn: 'root'
})
export class BanqueService extends GenericCRUDRestService<BanqueModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/bank`);
  }

  getBanqueByEmployee(idEmployee) {
    return this.httpClient.get(this.baseUrl + '/employee/' + idEmployee);
  }
}
