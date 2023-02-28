import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../shared/service/path.service';
import {RapportModel} from '../../../shared/model/rapport.model';
import {PaginationArgs, PaginationPage} from '../../../shared/model/pagination.args';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RapportParcService extends GenericCRUDRestService<RapportModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.hostServerRapport}/paramEnvoi`);
  }

  /**
   * Get all reports in parc with pagination
   * @param: listRestautrant
   * @param: paginationArgs
   * @param: filter
   */
  public getAllRapportsParcWithPagination(listRestautrant: any[], paginationArgs: PaginationArgs, filter?: any): Observable<PaginationPage<RapportModel>> {
    return super.getAllWithPaginationAndFilterWithBody(listRestautrant, paginationArgs, '/parc', filter);
  }

  public exportPlanningNonComparatifFileZip(dateDebut: string, dateFin: string, listRestaurant: any): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportResumePlanning/listRapportZip?dateDebut=' + `${dateDebut}` + '&dateFin=' + `${dateFin}`, listRestaurant,{
      responseType: 'blob', observe: 'response'
    });
  }

  public exportPlanningNonComparatifFile(dateDebut: string, dateFin: string, listRestaurant: any): Observable<any> {
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportResumePlanning/listRapport?dateDebut=' + `${dateDebut}` + '&dateFin=' + `${dateFin}`, listRestaurant,);
  }
}
