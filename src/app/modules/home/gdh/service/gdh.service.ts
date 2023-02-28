import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GDHFilter} from '../../../../shared/model/gui/GDH-filter';
import {PathService} from '../../../../shared/service/path.service';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {GuiVueJourTotalInfoGdh, VueJourModel} from '../../../../shared/model/gui/vue-jour.model';
import {
  GuiContratPeriodVueInfo,
  GuiVuePayeTotalInfoGui,
  GuiVueSemaineTotalInfoGdh,
  VuePayeModel,
  VuePeriodModel
} from 'src/app/shared/model/gui/gdh-period-model';
import {GdhVuePayeRapportDeltaNegatif} from '../../../../shared/model/gui/GdhVuePayeRapportDeltaNegatif.model';

@Injectable()
export class GdhService extends GenericCRUDRestService<any, string> {

  constructor(
    httpClient: HttpClient,
    private pathService: PathService
  ) {
    super(httpClient, `${pathService.hostServerGDH}/gdh`);
  }

  public getIdRestaurant(): number {
    return +this.pathService.getIdRestaurant();
  }

  public getEmployeePageViewDay(filter: GDHFilter, paginationArgs): Observable<VueJourModel> {
    return this.httpClient.get<VueJourModel>(
      `${this.baseUrl}/vj/${this.pathService.getUuidRestaurant()}?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}&datedebut=${filter.date}&datefin=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}&firstLastName=${filter.firstLastName}&order=${filter.order}&order=${filter.order}`
    );
  }

  public getTotalGdhDayView(filter: GDHFilter): Observable<GuiVueJourTotalInfoGdh> {
    return this.httpClient.get<GuiVueJourTotalInfoGdh>(
      `${this.baseUrl}/vj/restaurants/${this.pathService.getUuidRestaurant()}/total?datedebut=${filter.date}&datefin=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`
    );
  }

  public getPageViewWeek(filter: GDHFilter, paginationArgs: any): Observable<VuePeriodModel> {
    return this.httpClient.get<VuePeriodModel>(
      `${this.baseUrl}vs/${this.pathService.getUuidRestaurant()}?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}&datedebut=${filter.weekStartDate}&datefin=${filter.weekEndDate}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}&firstLastName=${filter.firstLastName}&order=${filter.order}`
    );
  }

  public getTotalGdhWeekView(filter: GDHFilter): Observable<GuiVueSemaineTotalInfoGdh> {
    return this.httpClient.get<GuiVueSemaineTotalInfoGdh>(
      `${this.baseUrl}vs/restaurants/${this.pathService.getUuidRestaurant()}/total?datedebut=${filter.weekStartDate}&datefin=${filter.weekEndDate}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`
    );
  }

  public getTotalRepasForPeriod(filter: GDHFilter): Observable<number> {
    return this.httpClient.get<number>(
      `${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/repas/total?datedebut=${filter.weekStartDate}&datefin=${filter.weekEndDate}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`
    );
  }

  public getPageViewPaye(filter: GDHFilter, paginationArgs: any): Observable<VuePayeModel> {
    return this.httpClient.get<VuePayeModel>(
      `${this.baseUrl}vp/${this.pathService.getUuidRestaurant()}?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}&date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}&firstLastName=${filter.firstLastName}&order=${filter.order}`
    );
  }

  public getTotalGdhPayView(filter: GDHFilter): Observable<GuiVuePayeTotalInfoGui> {
    return this.httpClient.get<GuiVuePayeTotalInfoGui>(
      `${this.baseUrl}vp/restaurants/${this.pathService.getUuidRestaurant()}/total?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`
    );
  }

  public getTotalRepasPayView(filter: GDHFilter): Observable<number> {
    return this.httpClient.get<number>(
      `${this.baseUrl}vp/restaurants/${this.pathService.getUuidRestaurant()}/repas/total?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`
    );
  }

  public getContratInfoViewWeek(uuidEmployee: string, filter: GDHFilter): Observable<GuiContratPeriodVueInfo[]> {
    return this.httpClient.get<GuiContratPeriodVueInfo[]>(`${this.baseUrl}vs/employees/${uuidEmployee}/avenants?&dateDebut=${filter.weekStartDate}&dateFin=${filter.weekEndDate}`);
  }

  public getContratInfoViewPaye(uuidEmployee: string, filter: GDHFilter): Observable<GuiContratPeriodVueInfo[]> {
    return this.httpClient.get<GuiContratPeriodVueInfo[]>(`${this.baseUrl}vp/restaurants/${this.pathService.getUuidRestaurant()}/employees/${uuidEmployee}/avenants?&date=${filter.date}`);
  }

  public getPeriodLimits(date: string, uuidSelectedRestaurant?: string): Observable<[Date, Date]> {
    let uuidRestaurant = this.pathService.getUuidRestaurant();
    if(uuidSelectedRestaurant){
      uuidRestaurant = uuidSelectedRestaurant;
    }
    return this.httpClient.get<[Date, Date]>(`${this.baseUrl}vp/restaurants/${uuidRestaurant}/periods/${date}`);
  }

  public createPayeViewExcelFileAndGetName(language: string, filter: GDHFilter, uuidRestaurant?: string): Observable<string> {
    return this.httpClient.get<string>(`${this.baseUrl}vp/restaurants/${uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()}/createExcel?language=${language}&date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }

  public createPayeViewPayeFileAndGetName(filter: GDHFilter, restaurantUuid?: string): Observable<GdhVuePayeRapportDeltaNegatif> {
    return this.httpClient.get<GdhVuePayeRapportDeltaNegatif>(`${this.baseUrl}interfacepaye/fichierinterface/${restaurantUuid ? restaurantUuid : this.pathService.getUuidRestaurant()}?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }

  public checkDeltaNegatif(filter: GDHFilter, restaurantUuid?: string): Observable<GdhVuePayeRapportDeltaNegatif> {
    return this.httpClient.get<GdhVuePayeRapportDeltaNegatif>(`${this.baseUrl}interfacepaye/delta-negatif/${restaurantUuid ? restaurantUuid : this.pathService.getUuidRestaurant()}?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }

  public getPaieFilesNames(filter: GDHFilter, uuidRestaurant?: string): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseUrl}interfacepaye/files/fichierinterface/${uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()}?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }
}
