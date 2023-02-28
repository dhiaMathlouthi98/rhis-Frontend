import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {VenteHoraireModel} from '../../../../shared/model/vente.horaire.model';
import {Observable} from 'rxjs';
import {DateService} from '../../../../shared/service/date.service';


@Injectable({
  providedIn: 'root'
})
export class VenteHoraireService extends GenericCRUDRestService<VenteHoraireModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathPlanning()}/venteHoraire/`);
  }

  public getVenteHoraireByIdVenteJournaliere(uuidVenteJournaliere: string, dateAsString: string): Observable<VenteHoraireModel[]> {
    return this.httpClient.get<VenteHoraireModel[]>(this.baseUrl + this.pathService.getUuidRestaurant() + '/venteJournaliere/' + uuidVenteJournaliere + '/' + dateAsString);
  }

  public updateListVenteHoraire(venteHoraires: VenteHoraireModel[], uuidVenteJournaliere: string, dateAsString: string) {
    venteHoraires.forEach(item => {
      this.setCorrectDateFormat(item);
    });
    return this.httpClient.put(`${this.baseUrl}${this.pathService.getUuidRestaurant()}/list/${uuidVenteJournaliere}/${dateAsString}`, venteHoraires);
  }

  private setCorrectDateFormat(item: VenteHoraireModel) {
    if (item.heureDebut) {
      item.heureDebut = this.dateService.setCorrectTime(item.heureDebut);
    }
    if (item.heureFin) {
      item.heureFin = this.dateService.setCorrectTime(item.heureFin);
    }
  }
}
