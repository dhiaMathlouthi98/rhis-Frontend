import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from 'src/app/shared/service/generic-crud.service';
import {PathService} from 'src/app/shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DetailTempsPaye} from 'src/app/shared/model/details-temps-paye';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {Periode, WeekDetailsPlanning} from 'src/app/shared/model/planning-semaine';
import {PlanningModel} from '../../../../../shared/model/planning.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {DateService} from 'src/app/shared/service/date.service';
import {ShiftModel} from '../../../../../shared/model/shift.model';
import {SessionService} from '../../../../../shared/service/session.service';


@Injectable({
  providedIn: 'root'
})
export class PlanningEquipierService extends GenericCRUDRestService<PlanningModel, Number> {

  private listShift = new BehaviorSubject([]);
  currentShiftList = this.listShift.asObservable();

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathPlanning()}/plg/`);
  }

  public setListShift(listShift: ShiftModel[]) {
    this.listShift.next(listShift);
  }

  /**
   * Récupérer les valeurs du temps payé pour la journée affichée
   * @param date date du jour
   */
  public getDetailTempsPaye(date: string): Observable<DetailTempsPaye> {
    const dateValue = this.dateService.createDateFromStringPattern(date, 'DD/MM/YYYY');
    date = this.dateService.formatToShortDate(dateValue);
    return this.httpClient.get<DetailTempsPaye>(this.baseUrl + 'tempsPaye/day/' + this.pathService.getUuidRestaurant() + '/' + date);
  }

  /**
   * Récupérer les valeurs du temps payé de la semaine affichée
   * @param date date du jour
   */
  public getDetailsTempsPayeWeek(date: string): Observable<Object> {
    const dateValue = this.dateService.createDateFromStringPattern(date, 'DD/MM/YYYY');
    date = this.dateService.formatToShortDate(dateValue);
    return this.httpClient.get<Object>(this.baseUrl + 'tempsPaye/week/' + this.pathService.getUuidRestaurant() + '/' + date);
  }

  /**
   * Envoyer une requête au serveur pour mettre à jour le temps payé
   * @param date date du jour à modifier
   * @param tempsPaye nouvelles valeurs de temps payé de la journée
   * @param tempsPayeWeek nouvelles valeurs de temps payé pour la semaine
   * @param totalTempsPaye total temps payé de la journée
   * @param totalTempsPayeWeek total temps payé de la semaine
   */
  public updateTempsPaye(date: string, tempsPaye: any[], tempsPayeWeek: any[], totalTempsPaye: number,
                         totalTempsPayeWeek: number) {
  }

  /**
   * Récupérer le récapitulatif d'un employé
   * @param employee EmployeeModel
   * @param date string
   */
  public getEmployeeSummary(date: string, employee: EmployeeModel): Observable<Periode[]> {
    date = this.dateService.formatToShortDate(date);
    return this.httpClient.get<Periode[]>(this.baseUrl + 'weekMonthSummary/' + employee.idEmployee + '/' + date);
  }

  public getDetailsWeekPlanning(date: string, employee: EmployeeModel): Observable<WeekDetailsPlanning[]> {
    date = this.dateService.formatToShortDate(date);
    return this.httpClient.get<WeekDetailsPlanning[]>(this.pathService.getPathEmployee() + '/employee/' + 'weekDetails/' + employee.uuid + '/' + date);
  }

  public checkIfPlanningIsCalculated(dateAsString: string): Observable<PlanningModel> {
    return this.httpClient.get(`${this.baseUrl}checkPlgCalculated/${this.pathService.getUuidRestaurant()}/` + dateAsString);
  }

  public getPlanningDataByRestaurant(dateAsString: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}monthData/${this.pathService.getUuidRestaurant()}/` + dateAsString);
  }

  public lancerCalculePlanning(dateAsString: string, affecter: boolean): Observable<any> {
    return this.httpClient.get(`${this.pathService.getPathCalculePlanning()}/plg/generate/${this.pathService.getUuidRestaurant()}/` + dateAsString + '?affecter=' + affecter);
  }

  public refaireAffectation(dateAsString: string): Observable<any> {
    return this.httpClient.get(`${this.pathService.getPathCalculePlanning()}/plg/refaireAffectation/${this.pathService.getUuidRestaurant()}/` + dateAsString);
  }

  public updatePlanningDateAfterChangingPremierJourRestaurant(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}updatePlanningData/${this.sessionService.getUuidRestaurant()}`);
  }

  public lockPlanning(uuidPlanning: string, uuidUser: string): Observable<PlanningModel> {
    return this.httpClient.get(`${this.baseUrl}` + 'verouiller/' + uuidUser + '/' + uuidPlanning);
  }

  public unlockPlanning(uuidPlanning: string): Observable<PlanningModel> {
    return this.httpClient.get(`${this.baseUrl}` + 'deverouiller/' + uuidPlanning);
  }

  public mobileBroadcastPlanning(uuidPlanning: string, isMobileBroadcast: number): Observable<PlanningModel> {
    return this.httpClient.get<PlanningModel>(`${this.baseUrl}broadcastMobile/${uuidPlanning}/${isMobileBroadcast}`);
  }

  public checkIfPlanningIsLocked(dateAsString: string): Observable<PlanningModel> {
    return this.httpClient.get(`${this.baseUrl}checkLocked/${this.pathService.getUuidRestaurant()}/` + dateAsString);
  }

  public deletePlanning(dateAsString: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}nettoyer/${this.pathService.getUuidRestaurant()}/` + dateAsString);
  }

}
