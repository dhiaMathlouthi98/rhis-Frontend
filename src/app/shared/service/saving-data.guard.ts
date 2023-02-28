import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavingDataGuard implements CanDeactivate<any> {
  canDeactivate(component: any): Observable<boolean> | boolean {
    return component.canDeactivate() ? true : component.saveContentBeforeDeactivation();
  }
}
