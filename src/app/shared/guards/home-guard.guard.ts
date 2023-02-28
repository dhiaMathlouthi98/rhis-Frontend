import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../../authentication/services/authentication.service';
import {NavigationService} from '../service/navigation.service';
import {SessionService} from '../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class HomeGuardGuard implements CanActivate {
  private currentRoute: string;

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.authService.isAutheticated()) {
      return true;
    } else if (this.authService.isAutheticated() && this.sessionService.getLastUrl() === '/') {
      return true;
    } else {
      this.route.navigateByUrl(this.sessionService.getLastUrl());
      return false;
    }
  }

  constructor(private route: Router,
              private authService: AuthenticationService,
              private navigationService: NavigationService,
              private sessionService: SessionService) {
    this.currentRoute = route.url;
  }
}
