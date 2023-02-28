import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PointageModel} from '../../../../shared/model/pointage.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {SessionService} from '../../../../shared/service/session.service';
import {Observable} from 'rxjs';
import {GuiPointageAbsence} from '../../../../shared/model/gui/GuiPointageAbsence';

@Injectable({
  providedIn: 'root'
})
export class PointageService extends GenericCRUDRestService<PointageModel, number> {
  constructor(private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.hostServerGDH}/pointage`);
  }

  public update(entity: PointageModel): Observable<any> {
    return super.update(entity, `/${this.sessionService.getUuidUser()}`);
  }

  public remove(id: number): Observable<Response> {
    return this.httpClient.delete<Response>(`${this.baseUrl}/${id}/user/${this.sessionService.getUuidUser()}`);
  }

  public add(entity: PointageModel): Observable<number> {
    return super.add(entity, `/${this.sessionService.getUuidUser()}`);
  }

  public controlChevauchement(entity: GuiPointageAbsence): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.baseUrl}/verifiy`, entity);
  }
}
