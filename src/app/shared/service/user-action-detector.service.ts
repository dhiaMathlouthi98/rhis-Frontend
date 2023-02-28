import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {RemoveItemLocalStorageService} from './remove-item-local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserActionDetectorService {

  constructor(private route: Router,
              private removeItemLocalStorageService: RemoveItemLocalStorageService) {
  }

  _userActionOccured: Subject<void> = new Subject();
  get userActionOccured(): Observable<void> {
    return this._userActionOccured.asObservable();
  }

  public notifyUserAction() {
    this._userActionOccured.next();
  }

  public logOutUser() {
    this.removeItemLocalStorageService.removeFromLocalStorage();
    this.removeItemLocalStorageService.removeFromSessionStorage();
    localStorage.removeItem('CP1236');
    localStorage.removeItem('user-nom');
    localStorage.removeItem('user-prenom');
    localStorage.removeItem('email');
    localStorage.removeItem('profilUuid');
    localStorage.removeItem('profilId');
    localStorage.removeItem('profil');
    localStorage.removeItem('lastUrl');
    this.route.navigateByUrl('/login');
  }
}
