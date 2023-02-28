import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {SessionService} from './session.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {LanguageStorageService} from './language-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {


  constructor(private session: SessionService,
              private languageStorageService: LanguageStorageService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.session.getBearerToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer_RH_IS ${this.session.getBearerToken()}`,
          'Accept-Language': this.languageStorageService.getLanguageSettings() ? this.languageStorageService.getLanguageSettings().value : 'fr'
        }
      });
    }
    return next.handle(request).pipe(tap(() => {
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }
          this.router.navigate(['login']);
        }
      }));
  }
}
