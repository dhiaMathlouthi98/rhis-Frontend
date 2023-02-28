import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {RhisTranslateService} from './shared/service/rhis-translate.service';
import {NavigationService} from './shared/service/navigation.service';
import {UserActionDetectorService} from './shared/service/user-action-detector.service';
import {Subject, Subscription, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PathService} from './shared/service/path.service';
import {SessionService} from './shared/service/session.service';
import {Router} from '@angular/router';
import {LanguageStorageService} from './shared/service/language-storage.service';
import {langueUser} from './shared/enumeration/langueUser';

@Component({
  selector: 'rhis-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  private tabIsVisible = document.visibilityState === 'visible';

  /** la durré max d'innactvité en minute  */
  private endTime = +this.pathService.idleTime;

  private unsubscribe$: Subject<void> = new Subject();
  private timerSubscription: Subscription;
  public languages = [
    {label: 'Français', value: langueUser.FR},
    {label: 'Anglais', value: langueUser.EN},
    {label: 'Espagnol', value: langueUser.ES},
    {label: 'Allemand', value: langueUser.DE},
    {label: 'Néerlandais', value: langueUser.NL}
  ];
  language: any;

  constructor(private rhisTranslateService: RhisTranslateService,
              private routingState: NavigationService,
              private userActionDetector: UserActionDetectorService,
              private pathService: PathService,
              private sessionService: SessionService,
              private router: Router,
              private languageStorageService: LanguageStorageService) {
    this.rhisTranslateService.configLanguage(['en', 'fr'], 'fr');
    this.routingState.loadRouting();
  }

  /** detecter tous les actions de l'utilisateur */
  @HostListener('document:keyup', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:wheel', ['$event'])
  resetTimers() {
    this.userActionDetector.notifyUserAction();
  }


  ngOnInit() {
    if (this.sessionService.getPermissions() && +this.sessionService.getRestaurant() > 0) {
      if (this.sessionService.getPermissions().indexOf(this.sessionService.getRestaurant()) < 0) {
        this.router.navigateByUrl('/login');
      }
    }
    // demarer le timer d'innactivité
    if (document.visibilityState === 'visible') {
      this.setTimer();
    }

    // detection d'activite utilisateur et reset du timer
    this.userActionDetector.userActionOccured.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.setTimer();
    });
    this.listenToVisibilityAndStorageChange();
    this.displayLanguage();
  }

  /**
   * detect language in localstorage if exist or browser language
   */
  public displayLanguage() {
    if (this.languageStorageService.getLanguageSettings()) {
      this.language = this.languageStorageService.getLanguageSettings();
    } else {
      const languageBrowser = navigator.language.slice(0, 2);
      const indexOfLanugage = this.languages.findIndex(elem => elem.value === languageBrowser);
      if (indexOfLanugage !== -1) {
        this.language = this.languages[indexOfLanugage];
      } else {
        this.language = this.languages[1];
      }
    }
    this.rhisTranslateService.language = this.language.value;
  }


  private removeTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private listenToVisibilityAndStorageChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.setTimer();
      } else {
        this.removeTimer();
      }
      this.tabIsVisible = document.visibilityState === 'visible';
    });

    // listner sur la local storage si pas de token , fermer tous les onglets de l'application (redirection vers login)
    window.addEventListener('storage', (e) => {
      if (e.storageArea === localStorage) {
        const token = localStorage.getItem('T120');
        if (!token) {
          this.removeTimer();
          this.router.navigateByUrl('/login');
        }
      }
    });
  }

  /**
   * permet de créer un timer sur l'inactivité client
   * ce timer est fonctionnel meme em mode background
   *
   * @param: endTime
   */
  private setTimer(endTime: number = this.endTime): void {
    const duration = endTime * 60 * 1000;
    this.removeTimer();
    this.timerSubscription = timer(duration).pipe(
        takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      if (this.tabIsVisible) {
        this.userActionDetector.logOutUser();
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
