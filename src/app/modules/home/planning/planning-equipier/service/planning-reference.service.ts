import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../../shared/service/path.service';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PlanningJourReferenceModel} from '../../../../../shared/model/planning.jour.reference.model';
import {Observable} from 'rxjs';
import {DateService} from 'src/app/shared/service/date.service';
import {ShiftModel} from '../../../../../shared/model/shift.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningReferenceService extends GenericCRUDRestService<PlanningJourReferenceModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/`);

  }

  /**
   * add/update a reference
   */
  public addUpdateDayOrWeekAsReference(data: any) {
    data['dateJournee'] = this.dateService.setCorrectDate(data['dateJournee']);
    return this.httpClient.post(this.baseUrl + 'refPlg/persist/' + this.pathService.getUuidRestaurant(), data);
  }

  /**
   * get reference list
   */
  public getReferenceList(): Observable<PlanningJourReferenceModel[]> {
    return this.httpClient.get<PlanningJourReferenceModel[]>(this.baseUrl + 'refPlg/getAll/' + this.pathService.getUuidRestaurant());
  }

  /**
   * get shift from reference
   */
  public chargerJourneeReference(libelleReference: string, stringAsDate: string, withAffectationHebdo: number): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + 'refPlg/charger/' + libelleReference + '/' + this.pathService.getUuidRestaurant() + '/' + stringAsDate + '/' + withAffectationHebdo);
  }
  /**
   * delete a reference
   */
  public deleteDayOrWeekAsReference(uuidReference: any) {
    return this.httpClient.delete(this.baseUrl + 'refPlg/deleteReference/' + uuidReference);
  }

  /**
   * get reference list
   */
  public getReferenceListInWeek(): Observable<PlanningJourReferenceModel[]> {
    return this.httpClient.get<PlanningJourReferenceModel[]>(this.baseUrl + 'refPlg/week/' + this.pathService.getUuidRestaurant());
  }

}
