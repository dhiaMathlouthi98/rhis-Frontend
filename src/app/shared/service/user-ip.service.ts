import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIpService {

  public ipAdress = new BehaviorSubject('');
  currentIp = this.ipAdress.asObservable();

  constructor() {
  }

  changeIp(ip: string) {
    this.ipAdress.next(ip);
  }

}
