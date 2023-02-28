import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {ConfigTypeService} from './config-type.service';
import {TypePointageModel} from '../../../../shared/model/type-pointage.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypePointageService extends ConfigTypeService<TypePointageModel> {

  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'typePointage');
  }

  public getActiveTypePointage(): Observable<TypePointageModel[]> {
    return this.httpClient.get<TypePointageModel[]>(`${this.baseUrl}/active/all`);
  }
}
