import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SemaineReposModel} from '../../../../shared/model/semaineRepos.model';

@Injectable({
  providedIn: 'root'
})
export class SemaineReposService extends GenericCRUDRestService<SemaineReposModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/semaineRepos`);
  }

  /**
   * recupere la list de semaine repos
   * @param :idEmployee
   */
  public getAllJourReposByEmployee(idEmployee: number | string): Observable<SemaineReposModel[]> {
    return super.getAll(`/all/` + idEmployee);
  }

  /**
   * ajouter 'semaine repos'
   * @param :entity
   */
  public saveSemaineRepos(semaioneRepos: SemaineReposModel): Observable<Object> {
    return super.add(semaioneRepos, `/add`);
  }

  /**
   * modifier  'semaine repos'
   * @param :entity
   */
  public updateSemaineRepos(semaioneRepos: SemaineReposModel): Observable<Object> {
    return super.update(semaioneRepos, `/update`);
  }

  /**
   * suppression semaineRepos
   * @param : idSemaineRepos
   */
  public deleteSemaineRepos(idSemaineRepos): Observable<Object> {
    return super.remove(idSemaineRepos, `/delete/`);
  }
}
