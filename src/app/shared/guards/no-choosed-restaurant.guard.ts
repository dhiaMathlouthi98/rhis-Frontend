import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../../authentication/services/authentication.service';
import {NavigationService} from '../service/navigation.service';
import {SessionService} from '../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class NoChoosedRestaurantGuard implements CanActivate {

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sessionService.getRestaurantName().length === 0) {
      this.route.navigateByUrl(this.sessionService.getLastUrl());
      return false;
    } else {
      return true;
    }
  }

  constructor(private route: Router,
              private authService: AuthenticationService,
              private navigationService: NavigationService,
              private sessionService: SessionService) {

  }
}
