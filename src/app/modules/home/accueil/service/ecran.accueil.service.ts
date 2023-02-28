import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {Observable} from 'rxjs';
import {PeriodeChiffreAffaireModel} from '../../../../shared/model/gui/periode.chiffre.affaire.model';

@Injectable({
  providedIn: 'root'
})
export class EcranAccueilService {

  constructor(private httpClient: HttpClient, private pathService: PathService) {
  }

  public getChiffreAffairesByPeriode(filter: number): Observable<PeriodeChiffreAffaireModel[]> {
    return this.httpClient.get<PeriodeChiffreAffaireModel[]>(this.pathService.getPathEmployee() + '/accueil/' + this.pathService.getUuidRestaurant() + '/' + filter);
  }

  public getChiffreAffaireDefaultIndex(): Observable<Number> {
    return this.httpClient.get<Number>(this.pathService.getPathEmployee() + '/accueil/defaultIndex/' + this.pathService.getUuidRestaurant());
  }

  public getTauxMainDOeuvreByFilter(filter: number, real: boolean): Observable<number> {
    return this.httpClient.get<number>(this.pathService.getPathEmployee() + '/accueil/moe/'
      + this.pathService.getUuidRestaurant() + '/' + filter + '/' + real);
  }

  public getProductiviteByFilter(filter: number, real: boolean): Observable<number> {
    return this.httpClient.get<number>(this.pathService.getPathEmployee() + '/accueil/prod/'
      + this.pathService.getUuidRestaurant() + '/' + filter + '/' + real);
  }

  public getHeuresSuppComp(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.pathService.hostServerGDH}/gdh/heuresSuppComp/${this.pathService.getUuidRestaurant()}`
    );
  }

  public getTurnOver(filter: number): Observable<number> {
    return this.httpClient.get<number>(this.pathService.getPathEmployee() + '/accueil/turnOver/'
      + this.pathService.getUuidRestaurant() + '/' + filter);
  }

  public getPerformanceValues(date: String, filter: string): Observable<any> {
    return this.httpClient.get<number>(this.pathService.getPathEmployee() + '/accueil/performance/'
      + this.pathService.getUuidRestaurant() + '/' + filter + '?date=' + date);
  }
}
