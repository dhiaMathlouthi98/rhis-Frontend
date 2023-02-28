import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationVerifierService {

  constructor(private httpClient: HttpClient, private  sessionService: SessionService) {
  }


  public isRestaurantAllowed(idRestaurant: any) {
    return this.sessionService.getPermissions().indexOf(idRestaurant) > -1;
  }
}
