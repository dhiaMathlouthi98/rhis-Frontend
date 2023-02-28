import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {EmployeeModel} from '../../../../shared/model/employee.model';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {PathService} from '../../../../shared/service/path.service';
import {map} from 'rxjs/operators';
import {EmployeeDisponibiliteConge} from '../../../../shared/model/employee-disponibilite-conge';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {DateService} from '../../../../shared/service/date.service';
import {ShiftModel} from 'src/app/shared/model/shift.model';
import {SessionService} from '../../../../shared/service/session.service';
import {WeekDetailsPlanning} from '../../../../shared/model/planning-semaine';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends GenericCRUDRestService<EmployeeModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient, private dateHelperService: DateService, private sessionService: SessionService, private rhisTranslateService: RhisTranslateService) {
    super(httpClinent, `${pathService.getPathEmployee()}/employee`);
  }

  public desactiverEmployee(employee: EmployeeModel, motif) {
    return this.httpClient.put(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/inactivate/${motif}`, employee);
  }

  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<EmployeeModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${this.pathService.getUuidRestaurant()}/all`, filter);
  }

  public add(entity: EmployeeModel): Observable<EmployeeModel> {
    return super.add(entity, `/${this.pathService.getUuidRestaurant()}/add`);
  }

  public updateEmployee(entity: EmployeeModel, idSecuriteSocial, idBanque, uuidDivers): Observable<EmployeeModel> {
    return super.update(entity, `/${this.pathService.getUuidRestaurant()}/update/${idSecuriteSocial}/${idBanque}/${uuidDivers}`);
  }

  public getDisponiblite(id: any): Observable<EmployeeDisponibiliteConge> {
    const lang = this.rhisTranslateService.currentLang;
    return this.httpClient.get(`${this.baseUrl}/detailEmployee/${id}/${lang}`).pipe(
      map((disponibilites: EmployeeDisponibiliteConge) => {
        disponibilites.disponibilites.forEach(disponibilite => {
          ['debut1', 'debut2', 'debut3', 'fin1', 'fin2', 'fin3'].forEach(period => {
            disponibilite[period] = this.dateHelperService.setTimeFormatHHMM(disponibilite[period]);
          });
        });
        return disponibilites;
      })
    );
  }

  getEmployeByIdWithBadge(idEmployee) {
    return this.httpClient.get(this.baseUrl + '/informationPersonel/' + idEmployee);
  }

  public findActiveEmployeeByRestaurant(): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/active/' + this.pathService.getUuidRestaurant());
  }

  public findActiveEmployeeByRestaurantBetweenTwoDates(): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/active/' + this.pathService.getUuidRestaurant());
  }

  public findActiveEmployeeHasPlgEquipByRestaurantBetweenTwoDates(dateDebut: string, dateFin: string): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/active/equipier/?uuidRestaurant=' + this.pathService.getUuidRestaurant()
      + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin);
  }

  public findActiveEmployeesWithGroupeTravailByRestaurant(restaurantUuid?: string): Observable<EmployeeModel[]> {
    const uuid = restaurantUuid || this.pathService.getUuidRestaurant();
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + uuid + '/activeEmployeesGroupeTravail');
  }

  public findAllEmployeActifWithGroupTravailsPlgFixe(): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/employeesActifHasPlanningfixe');
  }

  public getEmployeesWithPlgEquipier(stringDateJournee: string, listShift: any): Observable<any> {
    const refDate = new Date(stringDateJournee.substring(3, 5) + '-' + stringDateJournee.substring(0, 2) + '-' + stringDateJournee.substring(6));
    refDate.setHours(12);
    if (listShift.shiftsToAssign && listShift.shiftsToAssign.length) {
      listShift.shiftsToAssign.forEach((item: ShiftModel) => {
        if (item.acheval && !item.modifiable) {
          item.dateJournee = new Date(refDate.getTime() - (24 * 60 * 60 * 1000));
          item.heureDebutIsNight = true;
          item.heureDebutChevalIsNight = true;
          item.heureFinIsNight = true;
          item.heureFinChevalIsNight = true;
        }
        this.dateHelperService.setCorrectFormat(item);
      });
    }
    if (listShift.listShiftUpdate && listShift.listShiftUpdate.length) {
      listShift.listShiftUpdate.forEach((item: ShiftModel) => {
        if (item.acheval && !item.modifiable) {
          item.dateJournee = new Date(refDate.getTime() - (24 * 60 * 60 * 1000));
          item.heureDebutIsNight = true;
          item.heureDebutChevalIsNight = true;
          item.heureFinIsNight = true;
          item.heureFinChevalIsNight = true;
        }
      });
    }
    if (listShift.employeesShifts && listShift.employeesShifts.length) {
      listShift.employeesShifts.forEach((employee: EmployeeModel) => {
        if (employee.weekDetailsPlannings.length) {

          employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
            this.dateHelperService.setCorrectDate(new Date(wdp.dateJour));

            wdp.shifts.forEach((shift: ShiftModel) => {
              this.dateHelperService.setCorrectFormat(shift);

            });
          });
        }
      });
    }
    return this.httpClient.post<any>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + stringDateJournee, listShift);
  }

  public getEmployeesWithPlgEquipierAndManagerAndLeaderAndWeekShifts(stringDateJournee: string, vueHebdo?: boolean): Observable<EmployeeModel[]> {
    let concatUrl = '';
    if(vueHebdo){
      concatUrl = 'vueHebdo/';
    }
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + concatUrl + this.pathService.getUuidRestaurant() + '/' + stringDateJournee);
  }

  public getListEmployeeActifForDailyReport(stringDateJournee: string, isWeek: number): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/dailyReport/' + this.pathService.getUuidRestaurant() + '/' + stringDateJournee + '/' + isWeek);
  }

  public findAllEmployeActifWithGroupTravailsPlgMgr(isPlanningLeader): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' +
      this.pathService.getUuidRestaurant() + '/employeesActifHasPlanningMgrOrLeader/' + isPlanningLeader);
  }

  public findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(dateDebut, dateFin, isPlanningLeader): Observable<EmployeeModel[]> {
    const dateDebutPlg = this.dateHelperService.formatDateToScoreDelimiter(dateDebut);
    const dateFinPlg = this.dateHelperService.formatDateToScoreDelimiter(dateFin);
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' +
      this.pathService.getUuidRestaurant() + '/employeesActifHasPlanningMgrOrLeaderInWeek/' + dateDebutPlg + '/' + dateFinPlg + '/' + isPlanningLeader);
  }

  public requestDataFromMultipleSources(idEmployee): Observable<any[]> {
    const response1 = this.httpClient.get(this.pathService.getPathEmployee() + '/moyenTransport/employee/' + idEmployee);
    const response2 = this.httpClient.get(this.pathService.getPathEmployee() + '/securiteSociale/employee/' + idEmployee);
    const response3 = this.httpClient.get(this.pathService.getPathEmployee() + '/bank/employee/' + idEmployee);
    const response4 = this.httpClient.get(this.pathService.getPathEmployee() + '/nationalite/employee/' + idEmployee);
    const response5 = this.httpClient.get(this.pathService.getPathEmployee() + '/divers/' + idEmployee);
    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin([response1, response2, response3, response4, response5]);

  }

  /**
   * Count number of active employees by restaurant id
   */
  public countActiveEmployeesByRestaurant(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/active/count`);
  }

  public findAllEmployees(): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/allEmployees');
  }

  public verifyEmail(email: String): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.pathService.getPathSecurity()}/user` + '/isMailExist/' + email);
  }

  /**
   * recuperer la liste des employés actifs ayant un mail non associé à un utilisateur
   */
  public findActiveEmployeeWithMailByRestaurant(): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + this.sessionService.getUuidRestaurant() + '/actifEmployeeHavingMail');
  }

  /**
   * Get list employee with pointage in date betweeen date in param
   * @param dateDebut
   * @param dateFin
   */
  public findAllEmployeesWithPointageBetweenDate(dateDebut: string, dateFin: string): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/withPointage/' + this.pathService.getUuidRestaurant() + '?dateDebut=' + dateDebut + '&dateFin=' + dateFin);
  }

  /**
   * Get list employee in a specific date
   * @param date
   */
  public findAllEmployeesInDate(date: string): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/activeEmployeeInDate' + '?dateJournee=' + date);
  }

  /**
   * Get list employee between two dates
   * @param date
   */
  public findAllEmployeesBetweenTwoDates(dateDebut: string, dateFin: string): Observable<EmployeeModel[]> {
    return this.httpClient.get<EmployeeModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/employeeActifBetweenTwoDates' + '?dateDebut=' + dateDebut+ '&dateFin=' + dateFin);
  }

  public importEmployeeExcelFile(file: File): Observable<string[]> {
    const formData = new FormData();
    formData.set('file', file);
    return this.httpClient.post<string[]>(this.baseUrl + '/' + this.sessionService.getUuidRestaurant() + '/uploadEmployeeViaExcel', formData);
  }
  public findMaxMatriculeOfEmployes(): Observable<string> {
    return this.httpClient.get<string>(this.baseUrl + '/maxMatricule/' + this.pathService.getUuidRestaurant());
  }
  public getEmployeesWithPlgEquipierViewHebdo(dateJournee: Date, listShift: any, addOrUpdateShift: number): Observable<any> {

    const dateDebutPlg = this.dateHelperService.formatDateToScoreDelimiter(dateJournee);
    if (listShift.shiftsToAssign && listShift.shiftsToAssign.length) {
      listShift.shiftsToAssign.forEach((item: ShiftModel) => {
        item.dateJournee = this.dateHelperService.setCorrectDate(new Date(item.dateJournee));

        if (item.acheval && !item.modifiable) {

          item.heureDebutIsNight = true;
          item.heureDebutChevalIsNight = true;
          item.heureFinIsNight = true;
          item.heureFinChevalIsNight = true;
        }
        this.dateHelperService.setCorrectFormat(item);
      });
    }
    if (listShift.listShiftUpdate && listShift.listShiftUpdate.length) {
      listShift.listShiftUpdate.forEach((item: ShiftModel) => {
        if (item.acheval && !item.modifiable) {
          item.heureDebutIsNight = true;
          item.heureDebutChevalIsNight = true;
          item.heureFinIsNight = true;
          item.heureFinChevalIsNight = true;
        }
      });
    }
    if (listShift.employeesShifts && listShift.employeesShifts.length) {
      listShift.employeesShifts.forEach((employee: EmployeeModel) => {
        if (employee.weekDetailsPlannings.length) {

          employee.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
            this.dateHelperService.setCorrectDate(new Date(wdp.dateJour));

            wdp.shifts.forEach((shift: ShiftModel) => {
              this.dateHelperService.setCorrectFormat(shift);

            });
          });
        }
      });
    }
    return this.httpClient.post<any>(this.baseUrl + '/viewHebdo/' + this.pathService.getUuidRestaurant() + '/' + addOrUpdateShift + '/' +dateDebutPlg, listShift);
  }

  public getlistShiftByRestaurant(): Observable<ShiftModel[]> {
    return this.httpClient.get<ShiftModel[]>('/assets/data/plg-pro-emp.json');
  }
}
