import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../../shared/service/path.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {GuiAlarme} from '../../../../shared/model/gui/gui.alarme';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmeService {

  public codeAlarmeToBeDisplayed = new BehaviorSubject('');


  constructor(private httpClient: HttpClient, private pathService: PathService, private rhisTransaltor: RhisTranslateService) {
  }

  sharedCodeAlarmeToBeDisplayed = this.codeAlarmeToBeDisplayed.asObservable();

  public nextCodeAlarmeToBeDisplayed(message: string): any {
    this.codeAlarmeToBeDisplayed.next(message);
  }
  public getAllGuiAlarmeByRestaurant(idRestaurant: string | number): Observable<GuiAlarme[]> {
    return this.httpClient.get<GuiAlarme[]>(this.pathService.getPathEmployee() + '/alarme/' + idRestaurant);
  }

  public getAllAlarmeByRestaurant(): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathEmployee() + '/alarme/' + this.pathService.getUuidRestaurant() + '/all');
  }

  public getAllPresentGuiAlarmeOrderByPriorite(data: GuiAlarme[]): GuiAlarme[] {
    const presentGuiAlarme: GuiAlarme[] = [];
    data.forEach(item => {
      if (item.present) {
        item.translatedAlarmelibelle = this.rhisTransaltor.translate('ALERTES_CODE_NAME.' + item.alarmeCodeName);
        presentGuiAlarme.push(item);
      }
    });
    presentGuiAlarme.sort((item1, item2) => item1.priorite - item2.priorite);
    return presentGuiAlarme;
  }

  public getAlarmeOrderByPriorite(data: any[]): any[] {
    const orderedAlarme = [];
    data.forEach(item => {
      item.translatedAlarmelibelle = this.rhisTransaltor.translate('ALERTES_CODE_NAME.' + item.alerteCodeName);
      orderedAlarme.push(item);
    });
    orderedAlarme.sort((item1, item2) => item1.priorite - item2.priorite);
    return orderedAlarme;
  }
}
