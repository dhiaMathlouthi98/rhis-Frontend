import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {ConfigTypeService} from './config-type.service';
import {ProcedureModel} from '../../../../shared/model/procedure.model';

@Injectable({
  providedIn: 'root'
})
export class ProcedureService extends ConfigTypeService<ProcedureModel> {

  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'procedure');
  }
}
