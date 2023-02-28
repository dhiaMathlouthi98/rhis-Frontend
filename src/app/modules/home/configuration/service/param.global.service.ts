import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ParametreModel} from '../../../../shared/model/parametre.model';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {forkJoin, Observable} from 'rxjs';
import {DateService} from '../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class ParametreGlobalService extends GenericCRUDRestService<ParametreModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathEmployee()}/params/`);
  }

  public getParamsByRestaurant(uuidRestaurant?: string): Observable<ParametreModel[]> {
    return this.httpClient.get<ParametreModel[]>(this.baseUrl + (uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()));
  }

  updateParamsByRestaurant(listeParametres: ParametreModel[], uuidRestaurant?: string): Observable<ParametreModel[]> {
    this.setStringFromDate(listeParametres);
    return this.httpClient.put<ParametreModel[]>(`${this.baseUrl}` + (uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()), listeParametres);
  }

  getParametreByRestaurantByParam() {
    return this.httpClient.get<ParametreModel>(this.baseUrl + this.pathService.getUuidRestaurant() + '/param');
  }

  public getParameterByRestaurantIdAndCodeParameter(codeParameter: string, uuidRestaurant?: string): Observable<ParametreModel> {
    return this.httpClient.get<ParametreModel>(`${this.baseUrl}${uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()}/codeParam/${codeParameter}`);
  }

  public getParameterByRestaurantUuIdAndCodeParameter(uuid: string, codeParameter: string): Observable<ParametreModel> {
    return this.httpClient.get<ParametreModel>(`${this.baseUrl}${uuid}/codeParam/${codeParameter}`);
  }

  public async updateParametersValuesByIdRestaurantAndParamAndRubrique(parameters: ParametreModel[], rubrique: string): Promise<any> {
    const observalbles = parameters.map((parameter: ParametreModel) => this.httpClient.put(`${this.baseUrl}restaurants/${this.pathService.getUuidRestaurant()}?param=${parameter.param}&newValue=${parameter.valeur}&rubrique=${rubrique}`, null));
    return await forkJoin(...observalbles).toPromise();
  }

  public getRestaurantPaySystem(): Observable<ParametreModel[]> {
    return this.httpClient.get<ParametreModel[]>(`${this.baseUrl}restaurants/${this.pathService.getUuidRestaurant()}/paySystemParams`);
  }

  private setStringFromDate(listeParametres: ParametreModel[]): void {
    listeParametres.forEach((item: ParametreModel) => {
      if (item.valeur instanceof Date) {
        item.valeur = this.dateService.setStringFromDate(item.valeur);
      }
    });
  }

  public getArrondiContratSupByRestaurant() {
    return this.httpClient.get<ParametreModel>(this.baseUrl + this.pathService.getUuidRestaurant() + '/paramArrondiContrat');
  }

  public getParameterByParamMonthWeek(): Observable<ParametreModel> {
    return this.httpClient.get<ParametreModel>(this.baseUrl + this.pathService.getUuidRestaurant() + '/paramMonthWeek');
  }

  public getOuvrableParamByRestaurant(): Observable<ParametreModel> {
    return this.httpClient.get<ParametreModel>(this.baseUrl + this.pathService.getUuidRestaurant() + '/paramOuvrable');
  }

  public getParamRestaurantByCodeNames(codeNames: string): Observable<ParametreModel[]> {
    return this.httpClient.get<ParametreModel[]>(this.baseUrl + this.pathService.getUuidRestaurant() + '/codeNames?codeNamesAsString=' + codeNames);

  }

  public copyParams(uuidRestaurant?: string, listeRestaurantIds?: number[]): Observable<number[]> {
    return this.httpClient.put<number[]>(`${this.baseUrl}copy/` + (uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()), listeRestaurantIds);
  }

}
