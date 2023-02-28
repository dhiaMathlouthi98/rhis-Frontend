import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthorizationVerifierService} from '../service/authorization-verifier.service';
import {SessionService} from '../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
   /* if (this.authorizationService.isRestaurantAllowed(this.sessionService.getRestaurant())) {
      return true;
    } else {
      this.route.navigateByUrl('forbidden');
      return false;
    }*/
   return true;
  }

  constructor(private route: Router,
              private authorizationService: AuthorizationVerifierService,
              private sessionService: SessionService) {
  }
}
