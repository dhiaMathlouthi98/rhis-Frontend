import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {SessionService} from '../../shared/service/session.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  public profilId = localStorage.getItem('profilId');
  public profil = localStorage.getItem('profil');


  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const component = next.data;
    if (!this.authService.isAutheticated()) {
      this.route.navigateByUrl('/login');
      return false;
    } else if (!this.canAccess(component.name)) {
      this.route.navigateByUrl('/forbidden');
    }
    return true;
  }

  constructor(private route: Router,
              private authService: AuthenticationService,
              private sessionService: SessionService) {
  }


  private canAccess(componentName: string): boolean {
    return this.sessionService.getComponents().indexOf(componentName) > -1;
  }

}
