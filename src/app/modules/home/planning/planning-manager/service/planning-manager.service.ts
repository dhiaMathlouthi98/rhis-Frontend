import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DateService} from '../../../../../shared/service/date.service';
import {PlanningManagerModel} from '../../../../../shared/model/planningManager.model';
import {PlanningManagerProductifModel} from '../../../../../shared/model/planningManagerProductif.model';
import {EmployeeModel} from '../../../../../shared/model/employee.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningManagerService extends GenericCRUDRestService<PlanningManagerModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/plgManager`);
  }

  /**
   * Cette methode permet de retourner la liste de shifte  par restaurant
   */
  public getListPlanningManagers(dateDebut, dateFin, isPlanningLeader): Observable<PlanningManagerModel[]> {
    dateDebut = this.dateService.formatDateToScoreDelimiter(dateDebut);
    dateFin = this.dateService.formatDateToScoreDelimiter(dateFin);

    return this.httpClient.get<PlanningManagerModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + dateDebut + '/' + dateFin + '/' + isPlanningLeader);
  }

  /**
   * Cette methode permet de changer le variable isMobileBoreadcasted
   */
  public changePlanningManagerIsMobileBroadcasted(dateDebut, dateFin, isPlanningLeader, isBroadcasted): Observable<PlanningManagerModel[]> {
    dateDebut = this.dateService.formatDateToScoreDelimiter(dateDebut);
    dateFin = this.dateService.formatDateToScoreDelimiter(dateFin);

    return this.httpClient.get<PlanningManagerModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + dateDebut + '/' + dateFin + '/' + isPlanningLeader + '/' + isBroadcasted);
  }

  /**
   * Cette methode permet de retourner la liste de shifte  par restaurant avant la date de debut et apres la date d fin
   */
  public getListPlanningManagersPreviousAndNextWeek(dateDebut: Date, dateFin, isPlanningLeader: number): Observable<PlanningManagerModel[]> {
    const beginDate = this.dateService.formatDateToScoreDelimiter(dateDebut);
    const finDate = this.dateService.formatDateToScoreDelimiter(dateFin);

    return this.httpClient.get<PlanningManagerModel[]>(this.baseUrl + '/previousOrNext/' + this.pathService.getUuidRestaurant() + '/' + beginDate + '/' + finDate + '/' + isPlanningLeader);
  }

  /**
   * Cette methode permet de retourner la liste des planning manager par restaurant et date choisit
   */
  public getListPlanningLeaderAndManagerByIdRestaurantAndDate(dateJournee): Observable<PlanningManagerModel[]> {
    dateJournee = this.dateService.formatDateToScoreDelimiter(dateJournee);

    return this.httpClient.get<PlanningManagerModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + dateJournee);
  }

  /**
   * Cette methode permet de retourner la liste des planning manager par restaurant et date choisit sans les employees ayant des absences planifie
   */
  public getListPlanningLeaderAndManagerByIdRestaurantAndDateWithoutAbsence(dateJournee): Observable<PlanningManagerModel[]> {
    dateJournee = this.dateService.formatDateToScoreDelimiter(dateJournee);

    return this.httpClient.get<PlanningManagerModel[]>(this.baseUrl + '/rapportJournalier/' + this.pathService.getUuidRestaurant() + '/' + dateJournee);
  }

  /**
   * modifier list de planning manager
   * @param: data
   * @param: listIdShiftToDelete
   * @param: listShiftManagerByManagerToDelete
   * @param: listIdPlanningManagerProductifsToDelete
   */
  public updateListPlanningManager(data: PlanningManagerModel[], listIdShiftToDelete, listShiftManagerByManagerOrleaderToDelete, listShiftManagerByPeriodeToDelete, listIdPlanningManagerProductifsToDelete, hasPlanningLeader, dateDebut: Date): Observable<PlanningManagerModel[]> {
    data.forEach((item: PlanningManagerModel) => {
      item.totalMinute = this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
      this.setCorrectDateFormat(item);
      if (item.planningManagerProductif) {
        item.planningManagerProductif.forEach((productif: PlanningManagerProductifModel) => {
          productif.totalMinute = this.dateService.getDiffHeure(productif.heureFin, productif.heureDebut);
          this.setCorrectDateFormat(productif);
        });
      }

      item.dateJournee = this.dateService.correctTimeZoneDifference(item.dateJournee);
    });
    const dateDebutString = this.dateService.formatDateToScoreDelimiter(dateDebut);

    return this.httpClient.put<PlanningManagerModel[]>(`${this.baseUrl}/updateList/` + listIdShiftToDelete + '/' + listShiftManagerByManagerOrleaderToDelete + '/' + listShiftManagerByPeriodeToDelete + '/' + listIdPlanningManagerProductifsToDelete + '/' + hasPlanningLeader + '/' + dateDebutString, data);
  }


  /**
   * recupere les listes de shift de  2 semaine
   * @param dateChosit
   */
  getThreeWeeksListPlanningManagers(dateChosit: Date, hasPlanningLeader): Observable<Object> {
    const stringDateChoisit = this.dateService.formatDateToScoreDelimiter(dateChosit);
    return this.httpClient.get(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + stringDateChoisit + '/' + hasPlanningLeader);
  }

  setCorrectDateFormat(item) {
    if (item.heureDebut) {
      item.heureDebut = this.dateService.setCorrectTime(item.heureDebut);
    }
    if (item.heureFin) {
      item.heureFin = this.dateService.setCorrectTime(item.heureFin);
    }
    if (item.dateJournee) {
      item.dateJournee = this.dateService.setCorrectDate(item.dateJournee);
    }
    if (item.dateDebut) {
      item.dateDebut = this.dateService.setCorrectTime(item.dateDebut);
    }
    if (item.dateFin) {
      item.dateFin = this.dateService.setCorrectTime(item.dateFin);
    }
  }
  public sortEmployeeByName(listManagerOrLeaderWithPlanningManager: EmployeeModel[]): void {
    if (listManagerOrLeaderWithPlanningManager && listManagerOrLeaderWithPlanningManager.length) {
      listManagerOrLeaderWithPlanningManager.sort((a: EmployeeModel, b: EmployeeModel) => {
        if (a.nom > b.nom) {
          return 1;
        } else if (a.nom < b.nom) {
          return -1;
        } else {
          if (a.prenom > b.prenom) {
            return 1;
          } else if (a.prenom < b.prenom) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    }
  }
}
