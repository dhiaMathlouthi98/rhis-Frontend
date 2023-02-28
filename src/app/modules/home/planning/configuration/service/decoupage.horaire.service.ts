import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {DecoupageHoraireModel} from '../../../../../shared/model/decoupage.horaire.model';
import {Observable} from 'rxjs';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DateService} from '../../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class DecoupageHoraireService extends GenericCRUDRestService<DecoupageHoraireModel, string> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/decoupage`);
  }

  public getAllDecoupageHoraireByRestaurant(): Observable<DecoupageHoraireModel[]> {
    return this.httpClient.get<DecoupageHoraireModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant());
  }

  public deleteDecoupageHoraire(uuidDecoupage: string): Observable<Object> {
    return super.remove(uuidDecoupage, '/' + this.pathService.getUuidRestaurant() + '/');
  }

  public persistDecoupageHoraire(decoupage: DecoupageHoraireModel): Observable<DecoupageHoraireModel> {
    this.setCorrectDateFormat(decoupage);
    return super.add(decoupage, '/' + this.pathService.getUuidRestaurant());
  }

  public persistListDecoupageHoraire(listDecoupage: DecoupageHoraireModel[]): Observable<DecoupageHoraireModel[]> {
    listDecoupage.forEach(item => {
      this.setCorrectDateFormat(item);
    });
    return this.httpClient.post<DecoupageHoraireModel[]>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/list', listDecoupage);
  }

  public getDebutJourneePhase(uuidRestaurant?: any): Observable<DecoupageHoraireModel> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<DecoupageHoraireModel>(this.baseUrl + '/' + uuid + '/debut');
  }

  public getFinJourneePhase(uuidRestaurant?: any): Observable<DecoupageHoraireModel> {
    let uuid: any;
    if (uuidRestaurant) {
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    return this.httpClient.get<DecoupageHoraireModel>(this.baseUrl + '/' + uuid + '/fin');
  }

  public getOpenPhase(): Observable<DecoupageHoraireModel> {
    return this.httpClient.get<DecoupageHoraireModel>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/open');
  }

  public getClosePhase(): Observable<DecoupageHoraireModel> {
    return this.httpClient.get<DecoupageHoraireModel>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/close');
  }

  private setCorrectDateFormat(decoupageHoraire: DecoupageHoraireModel) {
    if (decoupageHoraire.valeurDimanche) {
      decoupageHoraire.valeurDimanche = this.dateService.setCorrectTime(decoupageHoraire.valeurDimanche);
    }
    if (decoupageHoraire.valeurLundi) {
      decoupageHoraire.valeurLundi = this.dateService.setCorrectTime(decoupageHoraire.valeurLundi);
    }
    if (decoupageHoraire.valeurMardi) {
      decoupageHoraire.valeurMardi = this.dateService.setCorrectTime(decoupageHoraire.valeurMardi);
    }
    if (decoupageHoraire.valeurMercredi) {
      decoupageHoraire.valeurMercredi = this.dateService.setCorrectTime(decoupageHoraire.valeurMercredi);
    }
    if (decoupageHoraire.valeurJeudi) {
      decoupageHoraire.valeurJeudi = this.dateService.setCorrectTime(decoupageHoraire.valeurJeudi);
    }
    if (decoupageHoraire.valeurVendredi) {
      decoupageHoraire.valeurVendredi = this.dateService.setCorrectTime(decoupageHoraire.valeurVendredi);
    }
    if (decoupageHoraire.valeurSamedi) {
      decoupageHoraire.valeurSamedi = this.dateService.setCorrectTime(decoupageHoraire.valeurSamedi);
    }
  }
}
