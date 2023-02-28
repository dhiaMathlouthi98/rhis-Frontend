import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {VariablesPayesModel} from '../../../../shared/model/variables.payes.model';
import {ParametreModel} from '../../../../shared/model/parametre.model';

@Injectable({
  providedIn: 'root'
})
export class PayeService extends GenericCRUDRestService<any, string> {

  constructor(httpClient: HttpClient, private pathService: PathService) {
    super(httpClient, `${pathService.hostServerGDH}/gdhinterfacepaye`);
  }

  public getVariablePaieByRestaurant(): Observable<VariablesPayesModel[]> {
    return this.httpClient.get<VariablesPayesModel[]>(`${this.baseUrl}/variablespayes/${this.pathService.getUuidRestaurant()}`);
  }

  public updateVariablePaieByRestaurant(variablePayes: VariablesPayesModel[]): Observable<VariablesPayesModel[]> {
    return this.httpClient.post<VariablesPayesModel[]>(`${this.baseUrl}/variablespayes/${this.pathService.getUuidRestaurant()}`, variablePayes);
  }

  public deleteListeVariablePaie(listVariablePaieByRestaurantToDelete: number[]): Observable<Object> {
    return this.httpClient.post<Object>(`${this.baseUrl}/variablespayes/deleteList`, listVariablePaieByRestaurantToDelete);
  }

  public getPaySystems(): Observable<String[]> {
    return this.httpClient.get<String[]>(`${this.baseUrl}/paySystems`);
  }

  public getParameterByPaySystems(paySystem: string): Observable<ParametreModel[]> {
    return this.httpClient.get<ParametreModel[]>(`${this.baseUrl}/parametreLogicielPaye/${paySystem}`);
  }
}
