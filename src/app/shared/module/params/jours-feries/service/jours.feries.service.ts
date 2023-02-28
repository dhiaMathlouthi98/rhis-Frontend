import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../service/generic-crud.service';
import {PathService} from '../../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {JourFeriesModel} from '../../../../model/jourFeries.model';
import {DateService} from '../../../../service/date.service';
import {Observable} from 'rxjs';
import {CopieJourFeriesGui} from '../../../../model/gui/CopieJourFeriesGui.model';

@Injectable({
  providedIn: 'root'
})
export class JoursFeriesService extends GenericCRUDRestService<JourFeriesModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathEmployee()}/jourFeries/`);

  }

  /**
   * get jour feries by pays
   * @param: idNationalite
   */
  getAllJourFeriesByPays(uuidNationalite: string) {
    return this.httpClient.get(this.baseUrl + this.pathService.getUuidRestaurant() + '/' + uuidNationalite + '/allByPays');

  }

  /**
   * get jour feries by restaurant
   */
  getAllJourFeriesByRestaurant() {
    return this.httpClient.get(this.baseUrl + this.pathService.getUuidRestaurant() + '/all');
  }

  getAllJourFeriesByRestaurantAndDate(datePlanning: Date) {
    const date = this.dateService.formatDateToScoreDelimiter(datePlanning);
    return this.httpClient.get(this.baseUrl + this.pathService.getUuidRestaurant() + '/' + date + '/all');
  }

  /**
   * save list jour feries
   * @param: jourFeriesList
   */
  public addListJourFeries(jourFeriesList: JourFeriesModel[], uuidRestaurant?: any) {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.post(this.baseUrl + uuid + '/' + 'add/list', jourFeriesList);
  }

  /**
   * save jour féeries par année
   * @param jourFeriesList
   * @param idPays
   * @param year
   */
  public addListJourFeriesByYear(jourFeriesList: JourFeriesModel[], idPays: string, year: number, uuidRestaurant: any) {
    return this.httpClient.post(this.baseUrl + uuidRestaurant + '/' + idPays + '/' + year, jourFeriesList);
  }

  /**
   * get jour feries by restaurant
   */
  public getAllJourFeriesByIdRestaurant(): Observable<JourFeriesModel[]> {
    return this.httpClient.get<JourFeriesModel []>(this.baseUrl + this.pathService.getUuidRestaurant());

  }

  public copierJoursFeries(listCopieJourFeriesGui: CopieJourFeriesGui[]): Observable<any> {
    return this.httpClient.put<any>(this.baseUrl + 'copie/', listCopieJourFeriesGui);
  }
}
