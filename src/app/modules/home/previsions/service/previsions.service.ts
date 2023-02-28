import {Injectable} from '@angular/core';
import {PrevisionsPlannedDays, VenteJournaliere} from '../../../../shared/model/previsions.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../shared/service/date.service';
import {JourSemaine} from '../../../../shared/enumeration/jour.semaine';
import {PaginationArgs, PaginationPage} from '../../../../shared/model/pagination.args';
import {VenteHoraireModel} from '../../../../shared/model/vente.horaire.model';

@Injectable({
  providedIn: 'root'
})
export class PrevisionsService extends GenericCRUDRestService<VenteJournaliere, string> {
  public calendrierFrConfig;
  public firstWeekDayRank: number;
  public weekOrderedDays: { day: string, val: JourSemaine } [];

  constructor(private pathService: PathService,
              httpClient: HttpClient,
              private dateService: DateService,
              private sharedRestaurnat: SharedRestaurantService) {
    super(httpClient, `${pathService.getPathPlanning()}/venteJournaliere`);
  }

  /**
   * Get Restaurant if it's absent from sharedRestaurant service
   */
  public async getDefaultPrevisions(): Promise<PrevisionsPlannedDays> {
    await this.setSharedRestaurantAndFirstWeekDay();
    return await this.getPrevisions().toPromise();
  }

  public async setSharedRestaurantAndFirstWeekDay() {
    if (!(this.sharedRestaurnat.selectedRestaurant &&
      this.sharedRestaurnat.selectedRestaurant.parametreNationaux &&
      this.sharedRestaurnat.selectedRestaurant.parametreNationaux.premierJourSemaine)) {
      this.sharedRestaurnat.selectedRestaurant = await this.sharedRestaurnat.getRestaurantById().toPromise();
    }
    this.firstWeekDayRank = this.dateService.getIntegerValueFromJourSemaine(
      this.sharedRestaurnat.selectedRestaurant.parametreNationaux.premierJourSemaine);
    this.calendrierFrConfig = this.dateService.getCalendarConfig(this.firstWeekDayRank);
    this.weekOrderedDays = this.dateService.getRestaurantWeekDays(this.firstWeekDayRank);
  }

  public getDateFormat(dateVente): string {
    return this.dateService.formatToShortDate(dateVente);
  }

  public getDateWithBackslashFormat(dateVente: Date): string {
    return this.dateService.formatToShortDate(dateVente, '/');
  }

  public getPrevisions(date?: { month: number, year: number }): Observable<PrevisionsPlannedDays> {
    let requestParams = `firstWeekDayRank=${this.firstWeekDayRank}`;
    if (date) {
      requestParams += `&monthRank=${date.month}&year=${date.year}`;
    }
    return this.httpClient.get<PrevisionsPlannedDays>(`${this.baseUrl}/plannedDays/${this.pathService.getUuidRestaurant()}?${requestParams}`);
  }

  public getMonthPlanifiedVente(date?: { month: number, year: number }): Observable<any> {
    const requestParams = `monthRank=${date.month}&year=${date.year}`;
    return this.httpClient.get<any>(`${this.baseUrl}/representationModeVente/${this.pathService.getUuidRestaurant()}?${requestParams}`);
  }

  public getWeekPlanifiedVente(firstWeekDayDate: Date): Observable<VenteJournaliere[]> {
    const date = this.dateService.formatToShortDate(firstWeekDayDate);
    return this.httpClient.get<VenteJournaliere[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/semaine/${date}`);
  }

  public add(entity: VenteJournaliere): Observable<any> {
    return super.add(entity, `/${this.pathService.getUuidRestaurant()}`);
  }


  /**
   * Renvoie les jours de références pour une vente journalière donné
   * @param venteJournaliere vente journalière
   */
  public getJoursDeReference(days: any [], statutFilter: { realStatut: boolean, previonsStatut: boolean },
                             date: string, paginationArgs: PaginationArgs): Observable<PaginationPage<VenteJournaliere>> {
    const previousYears = days.filter(refDay => refDay === 'LAST_YEARS').length > 0;
    if (previousYears) {
      days = [];
    }
    return this.httpClient.post<PaginationPage<VenteJournaliere>>(
      `${this.baseUrl}/all/` + this.pathService.getUuidRestaurant() + '?page=' + paginationArgs.pageNumber + '&size=' + paginationArgs.pageSize + '&date=' + date + '&py=' + previousYears + '&rs=' + statutFilter.realStatut + '&ps=' + statutFilter.previonsStatut, days
    );
  }

  /**
   * Get min reference days
   * @param venteJournaliere vente journalière
   */
  public getMinJoursRef(): Observable<string> {
    return this.httpClient.get<string>(`${this.baseUrl}/minJourRef/${this.pathService.getUuidRestaurant()}`);
  }

  public lisserVenteJournaliere(idVenteJournaliere: number): Observable<VenteHoraireModel[]> {
    return this.httpClient.get<VenteHoraireModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/lisser/${idVenteJournaliere}`);
  }

  public lisserVenteJournaliereWithoutSave(uuidVenteJournaliere: string, venteHoraireList: VenteHoraireModel[]): Observable<VenteHoraireModel[]> {
    venteHoraireList.forEach(item => {
      this.setCorrectDateFormat(item);
    });
    return this.httpClient.put<VenteHoraireModel[]>(`${this.baseUrl}/${this.pathService.getUuidRestaurant()}/lisser/${uuidVenteJournaliere}`, venteHoraireList);
  }

  public importRealSales(file: File): Observable<void> {
    const formData = new FormData();
    formData.set('sale', file);
    return this.httpClient.post<void>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/importSale`, formData);
  }

  private setCorrectDateFormat(item: VenteHoraireModel): void {
    if (item.heureDebut) {
      item.heureDebut = this.dateService.setCorrectTime(item.heureDebut);
    }
    if (item.heureFin) {
      item.heureFin = this.dateService.setCorrectTime(item.heureFin);
    }
  }
}
