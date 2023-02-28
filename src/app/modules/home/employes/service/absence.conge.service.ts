import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AbsenceCongeModel} from '../../../../shared/model/absence.conge.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenceCongeService extends GenericCRUDRestService<AbsenceCongeModel, String> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/absConge`);
  }

  /**
   * get all absence conge
   * @param: idEmployee
   */
  public getAllAbsenceCongeByEmployee(idEmployee: number): Observable<AbsenceCongeModel[]> {
    return super.getAll(`/all/` + idEmployee);
  }

  public updateAbsenceCongeFromGdh(absenceCongeModel: AbsenceCongeModel): Observable<Object> {
    return super.update(absenceCongeModel, '/updatefromGDH');
  }

  public addAbsenceCongeFromGdh(absenceConge: AbsenceCongeModel): Observable<AbsenceCongeModel> {
    return super.add(absenceConge, `/addfromGDH`);
  }

  /**
   * add absence conge
   * @param: absenceConge
   */
  public saveConge(absenceConge: AbsenceCongeModel): Observable<Object> {
    return super.add(absenceConge, `/add`);
  }

  /**
   * Add absence conge with duration
   * @param: absenceConge
   */
  public saveCongeWithDuration(absenceConge: AbsenceCongeModel, hours: number, minutes: number): Observable<Object> {
    return super.add(absenceConge, `/add/duration?hours=${hours}&minutes=${minutes}`);
  }

  /**
   * update absence conge
   * @param: absenceConge
   */
  public updateConge(absenceConge: AbsenceCongeModel): Observable<Object> {
    return super.update(absenceConge, `/update`);
  }

  /**
   * Update absence conge status
   * @param: absenceConge
   */
  public updateCongeStatus(absenceConge: AbsenceCongeModel): Observable<Object> {
    return super.update(absenceConge, `/status`);
  }

  /**
   * update absence conge with duration
   * @param: absenceConge
   */
  public updateCongeWithDuration(absenceConge: AbsenceCongeModel, hours: number, minutes: number): Observable<Object> {
    return super.update(absenceConge, `/update/duration?hours=${hours}&minutes=${minutes}`);
  }

  /**
   * delete absence conge
   * @param :idAbsenceConge
   */
  public deleteAbsenceConge(idAbsenceConge): Observable<Object> {
    return super.remove(idAbsenceConge, `/delete/`);
  }

  /**
   * delete absence conge from gdh
   * @param: idAbsenceConge
   */
  public removeFromGdh(idAbsenceConge: string): Observable<Object> {
    return super.remove(idAbsenceConge, `/gdh/`);
  }

  /**
   * create accepte demande conge
   * @param :idConge
   * @param :langue
   */
  public createDemandeCongeFile(data: AbsenceCongeModel, langue: string, view: number) {
    return this.httpClient.post(`${this.baseUrl}` + '/' + this.pathService.getUuidRestaurant() + '/demande/' + langue + '/' + view, data, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   *create refus demande conge
   * @param: idConge
   * @param: langue
   */
  public createRefusDemandeCongeFile(data: AbsenceCongeModel, langue: string, view: number) {
    return this.httpClient.post(`${this.baseUrl}` + '/' + this.pathService.getUuidRestaurant() + '/refu/' + langue + '/' + view, data, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   * creation de iframe de print
   * @param :data
   */
  public printDocument(responce: any) {
    const blob = new Blob([responce], {type: 'application/pdf'});
    const blobUrl = URL.createObjectURL(blob);
    const iframe: any = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
  }
}
