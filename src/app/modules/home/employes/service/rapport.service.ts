import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {RapportModel} from '../../../../shared/model/rapport.model';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {Observable} from 'rxjs';
import {ReportSfdtModel} from '../../../../shared/model/gui/report-sfdt.model';
import {SessionService} from '../../../../shared/service/session.service';

@Injectable({
  providedIn: 'root'
})
export class RapportService extends GenericCRUDRestService<RapportModel, String> {
  private blob: any;

  constructor(private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathEmployee()}/report/`);
  }

  public getAllReportsWithPagination(paginationArgs: PaginationArgs, filter: any): Observable<PaginationPage<RapportModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `${this.pathService.getUuidRestaurant()}`, filter);
  }

  /**
   * recupere tous les rapports par restaurant
   */
  public getAllRapportByRestaurant() {
    return this.httpClient.get<RapportModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/all');
  }

  /**
   * recupere tous les rapports par user connecté ou par franchise
   */
  public getAllRapportParc(uuidResto: string, uuidUser: string, uuidFranchise: string) {
    return this.httpClient.get<RapportModel[]>(`${this.baseUrl}` + uuidResto + '/parc/all/' + uuidUser + '/' + uuidFranchise);
  }

  public exporterDoc(langue, data, view, sendEmail, idEmployee, contratId) {
    return this.httpClient.post(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/' + idEmployee + '/' + contratId + '/' + langue + '/' + view + '/' + sendEmail, data, {
      responseType: 'blob', observe: 'body'
    },);
  }

  createDemandeCongeFile(langue, data, view, sendEmail) {
    return this.httpClient.post(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/demandeConge/' + langue + '/' + view + '/' + sendEmail, data, {
      responseType: 'blob', observe: 'body'
    },);
  }

  public createDocument(blob: any): Promise<any> {
    this.setProperties(blob);
    return new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        resolve(data);
      };
      fileReader.readAsArrayBuffer(blob);
    });
  }


  private setProperties(blob: any): void {
    this.blob = blob;
  }

  public createRapportAnomalie(uuidRestaurant: string, uuidEmployee: string, dateDebut: string, dateFin: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportAnomalie/?uuidRestaurant=' + uuidRestaurant + '&uuidEmployee=' + (uuidEmployee || '0') + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin, {
      responseType: 'blob', observe: 'body'
    });
  }

  public getRapportPlanningData(dateAsString: string, heureSeparation: number, minuteSeparation: number, isNight: boolean, planningManager: boolean): Observable<any> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}/plgJournalier/rapportPlanning/data/${this.pathService.getUuidRestaurant()}/` + dateAsString + '?heureSeparation=' + heureSeparation + '&minuteSeparation=' + minuteSeparation + '&isNight=' + isNight + '&PM=' + planningManager);
  }

  public getRapportPlanningDataPerWeek(dateAsString: string, heureSeparation: number, minuteSeparation: number, isNight: boolean, planningManager: boolean): Observable<any> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}/plgJournalier/rapportPlanningPerWeek/data/${this.sessionService.getUuidRestaurant()}/` + dateAsString + '?heureSeparation=' + heureSeparation + '&minuteSeparation=' + minuteSeparation + '&isNight=' + isNight + '&PM=' + planningManager);
  }

  public createRapportPlanningEmployee(uuidRestaurant: string, dateDebut: string, dateFin: string, sortingCriteria: string,
                                       employeeIds: any[], groupeTravailIds: any[]): Observable<Object> {
    employeeIds = employeeIds === undefined ? [] : employeeIds;
    groupeTravailIds = groupeTravailIds === undefined ? [] : groupeTravailIds;
    const selectedEmpyees = employeeIds.map(function (motif) {
      return motif.code;
    });
    const selectedGroupeTravails = groupeTravailIds.map(function (motif) {
      return motif.code;
    });
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportPlanningEmployee/?uuidRestaurant=' + uuidRestaurant
      + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&sortingCriteria=' + sortingCriteria
      + '&employeeIds=' + selectedEmpyees + '&groupeTravailIds=' + selectedGroupeTravails, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportServiceAPrendre(uuidRestaurant: string, dateDebut: string, dateFin: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportServiceAPrendre/?uuidRestaurant=' + uuidRestaurant + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportDetailsPeriode(uuidRestaurant: string, groupeTravail: string, dateDebut: string,
                                     dateFin: string, minutesOrCentieme: boolean, employeeOrGroupTravail: string , listEmployee: any): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` +
      '/rapportDetailsPeriode/?uuidRestaurant=' + uuidRestaurant + '&groupeTravail=' +
      groupeTravail + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin
    + '&minutesOrCentieme=' + minutesOrCentieme + '&employeeOrGroupTravail=' + employeeOrGroupTravail + '&listEmployee=' + listEmployee, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportCompteursEmployes(uuidRestaurant: string, date: string, sortingCriteria: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportCompteursEmployees/?uuidRestaurant=' + uuidRestaurant + '&date=' + date + '&sortingCriteria=' + sortingCriteria, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportCompteurs(uuidRestaurant: string, periodeAnalyser: string, date: string, sortingCriteria: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportCompteursEmployees/detaille?uuidRestaurant=' + uuidRestaurant + '&date=' + date + '&sortingCriteria=' + sortingCriteria + '&periode=' + periodeAnalyser);
  }

  public createRapportOperationnel(uuidRestaurant: string, groupeTravail: string, dateDebut: string, dateFin: string,
                                   sortingCriteria: string, hundredth: boolean): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportOperationnel/?uuidRestaurant=' + uuidRestaurant
      + '&groupeTravail=' + groupeTravail + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&sortingCriteria='
      + sortingCriteria + '&hundredth=' + hundredth, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportResumePlanning(uuidRestaurant: string, dateDebut: string, dateFin: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportResumePlanning/?uuidRestaurant=' + uuidRestaurant + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportResumePlanningComparatif(uuidRestaurant: any, dateDebut: string, dateFin: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportResumePlanningComparatif?uuidsRestaurant=' + uuidRestaurant + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin, {
      responseType: 'blob', observe: 'response'
    });
  }

  public createRapportCorrectionPointage(uuidRestaurant: string, dateJournee: string, language: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportCorrectionPointage/?uuidRestaurant=' + uuidRestaurant + '&dateJournee=' + dateJournee + '&lang=' + language, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportDisponibilites(uuidRestaurant: string, dateDebut: string, dateFin: string, type: string, sortingCriteria: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportDisponibilites/?uuidRestaurant=' + uuidRestaurant
      + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&type=' + type + '&sortingCriteria=' + sortingCriteria, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportAbsences(uuidRestaurant: string, dateDebut: string, dateFin: string, sortingCriteria: string, motifAbsence: any[],
                               employeeIds: any[], groupeTravailIds: any[]): Observable<Object> {
    employeeIds = employeeIds === undefined ? [] : employeeIds;
    groupeTravailIds = groupeTravailIds === undefined ? [] : groupeTravailIds;
    const selectedMotifs = motifAbsence.map(function (motif) {
      return motif.code;
    });
    const selectedEmpyees = employeeIds.map(function (motif) {
      return motif.code;
    });
    const selectedGroupeTravails = groupeTravailIds.map(function (motif) {
      return motif.code;
    });
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportAbsences/?uuidRestaurant=' + uuidRestaurant
      + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&sortingCriteria=' + sortingCriteria + '&motifAbsence=' + selectedMotifs
      + '&employeeIds=' + selectedEmpyees + '&groupeTravailIds=' + selectedGroupeTravails, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportCompetences(uuidRestaurant: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportCompetences/?uuidRestaurant=' + uuidRestaurant, {
      responseType: 'blob', observe: 'body'
    });
  }

  public createRapportPlanningManagers(uuidRestaurant: string, dateDebut: string, dateFin: string,
                                       managerOrLeader: string, sortingCriteria: string): Observable<Object> {
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportPlanningManager/?uuidRestaurant='
      + uuidRestaurant + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&managerOrLeader=' + managerOrLeader + '&sortingCriteria=' + sortingCriteria, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   * recupere tous les rapports with code name par restaurant
   */
  public getAllRapportWithCodeNameByRestaurant(): Observable<RapportModel[]> {
    return this.httpClient.get<RapportModel[]>(`${this.baseUrl}` + this.pathService.getUuidRestaurant() + '/codeName');
  }

  public getAllReportVariables(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}variables`);
  }

  public getReportContent(uuid: string): Observable<ReportSfdtModel> {
    return this.httpClient.get<ReportSfdtModel>(`${this.baseUrl}docx_to_sfdt/${uuid}`);
  }

  public saveToDocx(uuid: string, coordinations: { name: string, category: string }, data: FormData): Observable<ReportSfdtModel> {
    return this.httpClient.post<ReportSfdtModel>(`${this.baseUrl}save_docx/${uuid}?name=${coordinations.name.trim()}&category=${coordinations.category}`, data);
  }

  public createNewDocx(coordinations: { name: string, category: string }, data: FormData, uuidRestaurant: string): Observable<ReportSfdtModel> {
    let uuid: string;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.post<ReportSfdtModel>(`${this.baseUrl}${uuid}/new_docx/?name=${coordinations.name.trim()}&category=${coordinations.category}`, data);
  }

  public convertFromDocxToSFDT(data: FormData): Observable<string> {
    return this.httpClient.post<string>(`${this.baseUrl}docx_to_sfdt`, data);
  }

  public replaceExistedDocx(coordinations: { name: string, category: string }, data: FormData, uuidRestaurant: string): Observable<ReportSfdtModel> {
    let uuid: string;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.post<ReportSfdtModel>(`${this.baseUrl}${uuid}/replace_docx?name=${coordinations.name.trim()}&category=${coordinations.category}`, data);
  }

  public getReportCategories(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}${this.pathService.getUuidRestaurant()}/categories`);
  }

  public checkNameUniqueness(lastName: string, newName: string, uuidRestaurant: string): Observable<boolean> {
    let uuid: string;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    // on a ajouter le variable novar dans l URL pour eviter le cas ou le newName contient une espace a la fin
    return this.httpClient.get<boolean>(`${this.baseUrl}${uuid}/name_uniqueness?last=${lastName.trim()}&new=${newName.trim()}&novar=`);
  }

  public deleteDocxFile(reportUuid: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.baseUrl}${reportUuid}`);
  }

  public deleteDocxFileForParc(rapportDescription: string, rapportCategorie: string, idsRestaurant: any): Observable<boolean> {
    return this.httpClient.post<any>(this.baseUrl + 'delete/parc/' + rapportDescription + '/' + rapportCategorie, idsRestaurant);
  }

  public copierRapports(uuidRestaurant: string, listRestoIds: number[]): Observable<any> {
    return this.httpClient.put<any>(this.baseUrl + 'copy/' + uuidRestaurant, listRestoIds);
  }

  public copyReportInAnotherRestaurant(uuidRestaurant: string, oldNameReport: any, nameReport: string, listRestoIds: number[]): Observable<any> {
    if (!oldNameReport) {
      oldNameReport = '';
    }
    return this.httpClient.put<any>(this.baseUrl + 'copie/' + uuidRestaurant + '/' + nameReport.trim() + '/' + oldNameReport + '/', listRestoIds);


  }

  public getRestaurantsByRapportDescriptionAndFranchise(uuidFranchise: string, descriptionRapport: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + 'parc/listResto/' + uuidFranchise + '/' + descriptionRapport + '/');
  }

  public getRestaurantsByRapportDescriptionAndUser(uuidUser: string, descriptionRapport: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + 'parc/listRestoByUser/' + uuidUser + '/' + descriptionRapport + '/');
  }

  public createRapportVacances(uuidRestaurant: string, dateDebut: string, dateFin: string, sortingCriteria: string, motifAbsence: any[],
                               employeeIds: any[], groupeTravailIds: any[]): Observable<Object> {
    employeeIds = employeeIds === undefined ? [] : employeeIds;
    groupeTravailIds = groupeTravailIds === undefined ? [] : groupeTravailIds;
    const selectedMotifs = motifAbsence.map(function (motif) {
      return motif.code;
    });
    const selectedEmpyees = employeeIds.map(function (motif) {
      return motif.code;
    });
    const selectedGroupeTravails = groupeTravailIds.map(function (motif) {
      return motif.code;
    });
    return this.httpClient.get(`${this.pathService.hostServerRapport}` + '/rapportVacances/?uuidRestaurant=' + uuidRestaurant
      + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin + '&sortingCriteria=' + sortingCriteria + '&motifAbsence=' + selectedMotifs
      + '&employeeIds=' + selectedEmpyees + '&groupeTravailIds=' + selectedGroupeTravails, {
      responseType: 'blob', observe: 'body'
    });
  }

  public getRapportPosteTravailData(dateDebut: string, dateFin: string, interval: string, uuidsRestaurants: any, mode: number): Observable<any> {
    const modeAffichage = mode ? mode : 1;
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPlanningPosteTravail?dateDebut=' +
      dateDebut + '&dateFin=' + dateFin + '&interval=' + interval + '&modeRapport=' + modeAffichage, uuidsRestaurants);
  }

  public getRapportPosteTravailVueJour(dateDebut: string, interval: string, uuidsRestaurants: any, mode?: number): Observable<any> {
   const modeAffichage = mode ? mode : 1;
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPlanningPosteTravail/rapportJour?dateDebut=' +
      dateDebut + '&interval=' + interval + '&modeAffichage=' + modeAffichage, uuidsRestaurants, {
      responseType: 'blob', observe: 'response'
    });
  }

  public getRapportPosteTravailVueSemaine(dateDebut: string, dateFin: string, uuidsRestaurants: any,  mode?: number): Observable<any> {
    const modeAffichage = mode ? mode : 1;
    return this.httpClient.post(`${this.pathService.hostServerRapport}` + '/rapportPlanningPosteTravail/rapporSemaine?dateDebut=' +
      dateDebut + '&dateFin=' + dateFin + '&modeAffichage=' + modeAffichage, uuidsRestaurants, {
      responseType: 'blob', observe: 'response'
    });
  }
}
