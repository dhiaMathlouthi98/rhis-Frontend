import {Injectable} from '@angular/core';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {TypeSanctionModel} from '../../../../shared/model/type-sanction.model';
import {ConfigTypeService} from './config-type.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeSanctionService extends ConfigTypeService<TypeSanctionModel> {
  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'typeSanction');
  }

  /**
   * Get all active sanction type
   */
  public getAllActive(): Observable<TypeSanctionModel[]> {
    return this.httpClient.get<TypeSanctionModel[]>(`${this.baseUrl}/active/all`);
  }
}
