import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {AuthenticationService} from '../../authentication/services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DomControlService {
  constructor(@Inject(DOCUMENT) private document: any,
              private authService: AuthenticationService
  ) {
  }

  public showControl(ecran: string): boolean {
    return this.authService.displayAllowed(ecran);
  }

  public detailsControl(ecran: string): boolean {
  return this.authService.DetailsAllowed(ecran);
  }


  public addControl(ecran: string): boolean {
    return this.authService.addAllowed(ecran);
  }

  public addControlButton(ecran: string): boolean {
    return this.authService.addAllowed(ecran);
  }


  public deleteListControl(ecran: string): boolean {
    return (this.authService.deleteAllowed(ecran));
  }

  public updateListControl(ecran: string): boolean {
    return this.authService.updateAllowed(ecran);
  }

  public duplicateControl(ecran: string): boolean {
    return this.authService.dupliquerAllowed(ecran);
  }

}
