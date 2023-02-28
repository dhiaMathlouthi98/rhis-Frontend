import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {SessionService} from './session.service';
import {GuiAlarme} from '../model/gui/gui.alarme';


@Injectable({
  providedIn: 'root'
})
export class RestaurantNameService {

  private nameRestaurant = new BehaviorSubject('');
  currentMessage = this.nameRestaurant.asObservable();

  private listGuiAlarmeSubject = new BehaviorSubject([]);
  listGuiAlarme = this.listGuiAlarmeSubject.asObservable();

  private showProfilPopupSubject = new BehaviorSubject(false);
  showProfilPopup = this.showProfilPopupSubject.asObservable();

  constructor(private sessionService: SessionService) {
  }

  public changeNameRestaurant(message: string) {
    this.sessionService.setRestaurantName(message);
    this.nameRestaurant.next(message);
  }

  public setListGuiAlarme(listGuiAlarme: GuiAlarme[]) {
    this.listGuiAlarmeSubject.next(listGuiAlarme);
  }

  public changePopUpState(state: boolean) {
    this.showProfilPopupSubject.next(state);
  }

}
