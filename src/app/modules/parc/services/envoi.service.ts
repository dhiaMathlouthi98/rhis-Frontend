import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {ReceiverGUI} from '../../../shared/model/gui/ReceiverGUI.model';
import {EntityUuidModel} from '../../../shared/model/entityUuid.model';
import {ParametreRapport} from '../../../shared/model/parametreRapport';
import {SessionService} from '../../../shared/service/session.service';
import {EnvoiMailForRestaurants, RapportsPaieRestaurants} from '../../../shared/model/gui/parc.mode';


@Injectable({
  providedIn: 'root'
})
export class EnvoiService extends GenericCRUDRestService<any, string> {

  constructor(httpClient: HttpClient, private pathService: PathService,
              private sessionService: SessionService) {
    super(httpClient, `${pathService.hostServerRapport}/paramEnvoi`);
  }

  public getListReciever(listRestaurant: EntityUuidModel[]): Observable<ReceiverGUI[]> {
    return this.httpClient.post<ReceiverGUI[]>(`${this.baseUrl}/receiver`, listRestaurant);
  }

  public planifier(parametres: ParametreRapport): Observable<any> {
    return this.httpClient.post<ReceiverGUI[]>(`${this.baseUrl}/add`, parametres);
  }

  public envoyer(parametres: ParametreRapport, lang: String): Observable<any> {
    return this.httpClient.post<ReceiverGUI[]>(`${this.baseUrl}/envoi` + '?lang=' + `${lang}`, parametres);
  }

  public getListEnvois(uuidRapport: string, paginationArgs: any, ListRestoUuid: string[], filter: any): Observable<any> {
    return super.getAllWithPaginationAndFilterWithBody(ListRestoUuid, paginationArgs, '/' + uuidRapport, filter);
  }

  public deleteEnvoi(uuidEnvoi: string): Observable<any> {
    return super.remove(uuidEnvoi, '/delete/');
  }

  public checkParametreEnvoiWithValidationFrequency(): Observable<ParametreRapport> {
    return this.httpClient.get<ParametreRapport>(`${this.baseUrl}/frequency/validation/restaurants/${this.pathService.getUuidRestaurant()}`);
  }

  public sendReportsAfterPeriodValidation(paramEnvoiUuid: string, startPeriod: string, endPeriod: string, language: string, isHourly: boolean, list: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/sendReports/paramEnvois/${paramEnvoiUuid}/restaurants/${this.sessionService.getUuidRestaurant()}?startDate=${startPeriod}&endDate=${endPeriod}&language=${language}&hourlyView=${isHourly}`, list);
  }

  public downloadRestaurantPaieReportsForPeriod(config: RapportsPaieRestaurants): Observable<string[]> {
    return this.httpClient.post<string[]>(`${this.baseUrl}/restaurants/rapport-paie/download`, config);
  }

  public envoiMailForRestaurantPaieReportsForPeriod(config: EnvoiMailForRestaurants): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/restaurants/rapport-paie/envoi-mail`, config);
  }

  public getParametreByUuidProfil(): Observable<ParametreRapport> {
    return this.httpClient.get<ParametreRapport>(`${this.baseUrl}/getParametreByUuidProfil/${this.sessionService.getUuidProfil()}`);
  }

  public restaurantVerification(ListUuidRestaurant: string[], uuidProfil: String): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/paieValidation/restaurantVerification/${uuidProfil}`, ListUuidRestaurant);
  }

  public persistConfirmation(ListUuidRestaurant: string[], uuidProfil: string): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/paieValidation/persistConfirmation/${uuidProfil}/1`, ListUuidRestaurant);
  }

  public getParametreEnvoiByUuidProfilForFranchiseUser(uuidProfil: string): Observable<ParametreRapport> {
    return this.httpClient.get<ParametreRapport>(`${this.baseUrl}/getParametreByUuidProfil/${uuidProfil}`);
  }
}
