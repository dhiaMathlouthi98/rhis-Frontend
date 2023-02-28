import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history = [];

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {
  }

  public loadRouting(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.history = [...this.history, urlAfterRedirects];
        if (this.history.length > 1) {
          this.sessionService.setLastUrl(this.history[this.history.length - 1]);
        } else if (this.history.length === 1) {
          this.sessionService.setLastUrl(this.history[0]);
        }
      });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public getPreviousUrl(): string {
    return this.history[this.history.length - 2] || '/login';
  }
}
