import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {AffectationModel} from '../../../../shared/model/affectation.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AffectationService extends GenericCRUDRestService<AffectationModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient, private http: HttpClient) {
    super(httpClinent, `${pathService.getPathSecurity()}/affectation`);
  }

  public addAffectation(entity: any, uuidProfil: string): Observable<AffectationModel> {
    return super.add(entity, `/add/` + uuidProfil);
  }

  public updateAffectation(entity: any, uuidProfil: string): Observable<AffectationModel> {
    return super.update(entity, `/update/` + uuidProfil);
  }

  public isAffected(uuidProfil: string) {
    return this.httpClient.get<boolean>(`${this.baseUrl}` + '/byProfil/' + uuidProfil);
  }

  public isLastSupervisor() {
    return this.httpClient.get<boolean>(`${this.baseUrl}` + '/isLastSupervisor');
  }
}
