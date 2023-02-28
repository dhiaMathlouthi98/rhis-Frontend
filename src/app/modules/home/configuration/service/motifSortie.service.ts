import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MotifSortieModel} from '../../../../shared/model/motifSortie.model';
import {PathService} from '../../../../shared/service/path.service';
import {ConfigTypeService} from './config-type.service';

@Injectable({
  providedIn: 'root'
})
export class MotifSortieService extends ConfigTypeService<MotifSortieModel> {
  constructor(pathService: PathService, httpClient: HttpClient) {
    super(pathService, httpClient, 'motifSortie');
  }
  /**
   * get all motif sortie active
   */
  getAllMoyenTransportActive() {
    return this.httpClient.get(this.baseUrl + '/active/all');
  }
}
