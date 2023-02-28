import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Renderer2,
  ViewChild
} from '@angular/core';
import {GlobalSettingsService} from '../../../../shared/service/global-settings.service';
import {SessionService} from '../../../../shared/service/session.service';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {MenuItem} from 'primeng/api';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';
import {RhisRoutingService} from '../../../../shared/service/rhis.routing.service';
import {PathService} from '../../../../shared/service/path.service';
import {ScreenService} from '../../../../shared/service/screen.service';
import {AuthenticationService} from '../../../../authentication/services/authentication.service';

@Component({
  selector: 'rhis-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements AfterViewInit, AfterViewChecked {
  public openedMenu = false;
  public showedLabels = false;
  public switchIcon = 'open.svg';
  public displayScrollMenu = false;
  public windowHeigth: any;
  private menuRestaurant: MenuItem[];
  private menuSuperviseur: MenuItem[];
  private menuGestionParc: MenuItem[];
  public shownMenu: MenuItem[];
  public contentHeight: number;
  private currentUrl: string;
  private ecran = 'GPC';
  public parcMenuShowed = true;

  @ViewChild('navMenu') nav: ElementRef;

  constructor(
    private globalSettings: GlobalSettingsService,
    private sessionService: SessionService,
    private rhisTranslateService: RhisTranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private pathService: PathService,
    private router: Router, private renderer: Renderer2, private el: ElementRef, @Inject(DOCUMENT) private document: Document,
    public rhisRouter: RhisRoutingService,
    private screenService: ScreenService,
    private authenticationService: AuthenticationService) {
    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
      )
      .subscribe((e: NavigationEnd) => {
        this.shownMenu = [];
        this.setUpMenus();
        this.currentUrl = e.urlAfterRedirects;
        if (this.currentUrl.includes('/parc') && this.authenticationService.displayAllowed(this.ecran)) {
          this.parcMenuShowed = true;
          this.shownMenu = this.getMenuForPermissions(this.menuGestionParc);
        } else if (!this.currentUrl.includes('/restaurantList')) {
          this.shownMenu = ((this.currentUrl.includes('/societe') && !this.currentUrl.includes('edit-company'))
            || this.currentUrl.includes('/profil/all') || this.currentUrl.includes('utilisateur') &&
            !this.currentUrl.includes('ByRestaurant')) || this.currentUrl.includes('franchise') ? this.getMenuForPermissions(this.menuSuperviseur) : this.getMenuForPermissions(this.menuRestaurant);
          this.parcMenuShowed = false;
        }
        this.setRestaurantIconRoute();
        setTimeout(_ => {
          this.setActiveSection();
        }, 500);
      });
  }

  /**
   * Add class when menu is closed and item is clicked
   */
  clickItem1(event, index: number) {
    this.sessionService.setRestaurantUUidForReport(0);
    const ul = event.originalEvent.path[3];
    for (let i = 0; i < ul.children.length; i++) {
      if (i === index) {
        if (ul.children[i].classList.contains('inactive')) {
          ul.children[i].classList.remove('inactive');
        }
        ul.children[i].classList.add('active');
      } else {
        if (ul.children[i].classList.contains('active')) {
          ul.children[i].classList.remove('active');
        }
        ul.children[i].classList.add('inactive');
      }
    }
  }

  /**
   * Initialize menues itmes
   */
  private setUpMenus(): void {
    if (this.sessionService.getRestaurant() === this.pathService.defaultRestaurantId) {
      this.menuRestaurant = [
        {
          label: this.rhisTranslateService.translate('MENU.DASHBOARD'),
          icon: 'icon_1',
          routerLink: this.rhisRouter.getRoute('HOME'),
          command: (event) => {
            this.clickItem1(event, 0);
          }
          ,
          title: this.screenService.getScreen('')
        },
        {
          label: this.rhisTranslateService.translate('MENU.EMPLOYEE'),
          icon: 'icon_2',
          routerLink: this.rhisRouter.getRoute('HOME_EMPLOYEE'),
          title: this.screenService.getScreen('EMPLOYEE'),
          command: (event) => {
            this.clickItem1(event, 1);
          }
        },
        {
          label: this.rhisTranslateService.translate('MENU.PREVISION'),
          icon: 'icon_3',
          routerLink: this.rhisRouter.getRoute('HOME_PREVISION'),
          command: (event) => {
            this.clickItem1(event, 2);
          },
          title: this.screenService.getScreen('PREVISION')
        },
        {
          label: this.rhisTranslateService.translate('MENU.PLANNING'),
          icon: 'icon_4',
          routerLink: this.rhisRouter.getRoute('HOME_PLANNING'),
          command: (event) => {
            this.clickItem1(event, 3);
          },
          title: this.screenService.getScreen('PLANNING')
        },
        {
          label: this.rhisTranslateService.translate('MENU.GDH'),
          icon: 'icon_5',
          routerLink: this.rhisRouter.getRoute('HOME_GDH'),
          command: (event) => {
            this.clickItem1(event, 4);
          },
          title: this.screenService.getScreen('GDH')
        },
        {
          label: this.rhisTranslateService.translate('MENU.POINTEUSE'),
          icon: 'icon_6',
          command: (event) => {
            this.clickItem1(event, 5);
          },
          title: this.screenService.getScreen('')
        },
        {
          label: this.rhisTranslateService.translate('MENU.REPORT'),
          icon: 'icon_7',
          routerLink: this.rhisRouter.getRoute('HOME_RAPPORT'),
          command: (event) => {
            this.clickItem1(event, 6);
          },
          title: this.screenService.getScreen('RAPPORT')
        },
        {
          label: this.rhisTranslateService.translate('MENU.RESTAURANT_WITHOUT_SUB_MENU'),
          icon: 'icon_8',
          routerLink: this.rhisRouter.getRoute('RESTAURANT_DETAIL'),
          command: (event) => {
            // this.clickItem1(event, 7);
          },
          title: this.screenService.getScreen(''),
          items: [
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.GROUPES_TRAVAIL'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_GROUPE_TRVAIL'),
              title: this.screenService.getScreen('GROUPE_TRAVAIL')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.POSITIONS_TRAVAIL'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_POSTE_TRVAIL'),
              title: this.screenService.getScreen('POSTE_TRAVAIL')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.BADGES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_BADGE'),
              title: this.screenService.getScreen('BADGE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.ALERTS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_ALERTE'),
              title: this.screenService.getScreen('ALERTE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.TYPE_CONTRATS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_CONTRAT'),
              title: this.screenService.getScreen('TYPE_CONTRAT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.LIST_FORMATIONS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_LIST_FORMATION'),
              title: this.screenService.getScreen('FORMATION')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.JOURS_FERIES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_JOURS_FERIES'),
              title: this.screenService.getScreen('FERIE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.EVENTS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_EVENEMENT'),
              title: this.screenService.getScreen('TYPE_EVENEMENT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.SANCTIONS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_SANCTION'),
              title: this.screenService.getScreen('TYPE_SANCTION')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_PAIE'),
              title: this.screenService.getScreen('PERIODE_PAIE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODICITE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODICITE'),
              title: this.screenService.getScreen('PERIODICITE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.POINTAGE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_POINTAGE'),
              title: this.screenService.getScreen('TYPE_POINTAGE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PROCEDURES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PROCEDURE'),
              title: this.screenService.getScreen('PROCEDURE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MOTIFS_SORTIE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_MOTIF_SORTIE'),
              title: this.screenService.getScreen('MOTIF_SORTIE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.TYPE_TRANSPORT'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_MOYEN_TRANSPORT'),
              title: this.screenService.getScreen('MOYEN_TRANSPORT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES_MANAGERS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_MANAGER'),
              title: this.screenService.getScreen('PERIODE_MANAGER')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETERES_NATIONAUX'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PARAM_RESTAURANT'),
              title: this.screenService.getScreen('PARAM_RESTAURANT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.RESTAURANT_LAW'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_LOI_RESTAURANT'),
              title: this.screenService.getScreen('LOI_RESTAURANT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.COUNTRY_LAW'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_LOI_PAYS'),
              title: this.screenService.getScreen('LOI_PAYS')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.SOCIETE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_EDIT_COMPANY'),
              title: this.screenService.getScreen('SOCIETE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.NATIONALITE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_NATIONALITE'),
              title: this.screenService.getScreen('NATIONALITE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MODE_VENTE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_MODE_VENTE'),
              title: this.screenService.getScreen('MODE_VENTE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.DECOUPAGE_HORAIRE'),
              routerLink: this.rhisRouter.getRoute('HOME_PLANNING_CONFIGURATION_DECOUPAGE_HORAIRE'),
              title: this.screenService.getScreen('DECOUPAGE_HORAIRE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRE_PLANNING'),
              routerLink: this.rhisRouter.getRoute('PARAMETRE_PLANNING'),
              title: this.screenService.getScreen('PARAMETRE_PLANNING')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_USERS'),
              routerLink: ['/home/utilisateur/ByRestaurant'],
              title: this.screenService.getScreen('MANAGE_USERS')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_PROFILS'),
              routerLink: ['/home/profil/ByRestaurant'],
              title: this.screenService.getScreen('MANAGE_PROFILS')
            }
          ]
        }
      ];
    }
    if (this.sessionService.getRestaurant() !== this.pathService.defaultRestaurantId) {
      this.menuRestaurant = [
        {
          label: this.rhisTranslateService.translate('MENU.DASHBOARD'),
          icon: 'icon_1',
          routerLink: this.rhisRouter.getRoute('HOME'),
          command: (event) => {
            this.clickItem1(event, 0);
          },
          title: this.screenService.getScreen('')
        },
        {
          label: this.rhisTranslateService.translate('MENU.EMPLOYEE'),
          icon: 'icon_2',
          routerLink: this.rhisRouter.getRoute('HOME_EMPLOYEE'),
          command: (event) => {
            this.clickItem1(event, 1);
          },
          title: this.screenService.getScreen('EMPLOYEE')
        },
        {
          label: this.rhisTranslateService.translate('MENU.PREVISION'),
          icon: 'icon_3',
          routerLink: this.rhisRouter.getRoute('HOME_PREVISION'),
          command: (event) => {
            this.clickItem1(event, 2);
          },
          title: this.screenService.getScreen('PREVISION')
        },
        {
          label: this.rhisTranslateService.translate('MENU.PLANNING'),
          icon: 'icon_4',
          routerLink: this.rhisRouter.getRoute('HOME_PLANNING'),
          command: (event) => {
            this.clickItem1(event, 3);
          },
          title: this.screenService.getScreen('PLANNING')
        },
        {
          label: this.rhisTranslateService.translate('MENU.GDH'),
          icon: 'icon_5',
          routerLink: this.rhisRouter.getRoute('HOME_GDH'),
          command: (event) => {
            this.clickItem1(event, 4);
          },
          title: this.screenService.getScreen('GDH')
        },
        {
          label: this.rhisTranslateService.translate('MENU.POINTEUSE'),
          icon: 'icon_6',
          command: (event) => {
            this.clickItem1(event, 5);
          },
          title: this.screenService.getScreen('')
        },
        {
          label: this.rhisTranslateService.translate('MENU.REPORT'),
          icon: 'icon_7',
          routerLink: this.rhisRouter.getRoute('HOME_RAPPORT'),
          command: (event) => {
            this.clickItem1(event, 6);
          },
          title: this.screenService.getScreen('RAPPORT')
        },
        {
          label: this.rhisTranslateService.translate('MENU.RESTAURANT_WITHOUT_SUB_MENU'),
          icon: 'icon_8',
          routerLink: this.rhisRouter.getRoute('RESTAURANT_DETAIL'),
          command: (event) => {
            // this.clickItem1(event, 7);
          },
          title: this.screenService.getScreen(''),
          items: [
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.GROUPES_TRAVAIL'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_GROUPE_TRVAIL'),
              title: this.screenService.getScreen('GROUPE_TRAVAIL')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.POSITIONS_TRAVAIL'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_POSTE_TRVAIL'),
              title: this.screenService.getScreen('POSTE_TRAVAIL')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.BADGES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_BADGE'),
              title: this.screenService.getScreen('BADGE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.ALERTS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_ALERTE'),
              title: this.screenService.getScreen('ALERTE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.TYPE_CONTRATS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_CONTRAT'),
              title: this.screenService.getScreen('TYPE_CONTRAT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.LIST_FORMATIONS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_LIST_FORMATION'),
              title: this.screenService.getScreen('FORMATION')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.JOURS_FERIES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_JOURS_FERIES'),
              title: this.screenService.getScreen('FERIE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.EVENTS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_EVENEMENT'),
              title: this.screenService.getScreen('TYPE_EVENEMENT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_PAIE'),
              title: this.screenService.getScreen('PERIODE_PAIE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES_MANAGERS'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_MANAGER'),
              title: this.screenService.getScreen('PERIODE_MANAGER')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETERES_NATIONAUX'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_PARAM_RESTAURANT'),
              title: this.screenService.getScreen('PARAM_RESTAURANT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.RESTAURANT_LAW'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_LOI_RESTAURANT'),
              title: this.screenService.getScreen('LOI_RESTAURANT')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.SOCIETE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_EDIT_COMPANY'),
              title: this.screenService.getScreen('SOCIETE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MODE_VENTE'),
              routerLink: this.rhisRouter.getRoute('CONFIGURATION_MODE_VENTE'),
              title: this.screenService.getScreen('MODE_VENTE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.DECOUPAGE_HORAIRE'),
              routerLink: this.rhisRouter.getRoute('HOME_PLANNING_CONFIGURATION_DECOUPAGE_HORAIRE'),
              title: this.screenService.getScreen('DECOUPAGE_HORAIRE')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRE_PLANNING'),
              routerLink: this.rhisRouter.getRoute('PARAMETRE_PLANNING'),
              title: this.screenService.getScreen('PARAMETRE_PLANNING')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_USERS'),
              routerLink: ['/home/utilisateur/ByRestaurant'],
              title: this.screenService.getScreen('MANAGE_USERS')
            },
            {
              label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_PROFILS'),
              routerLink: ['/home/profil/ByRestaurant'],
              title: this.screenService.getScreen('MANAGE_PROFILS')
            }
          ]
        }
      ];
    }
    this.menuSuperviseur = [
      {
        label: this.rhisTranslateService.translate('MENU.COMPANY'),
        icon: 'icon_9',
        command: (event) => {
          this.clickItem1(event, 0);
        },
        routerLink: this.rhisRouter.getRoute('ALL_SOCIETE'),
        title: this.screenService.getScreen('SOCIETE')

      },
      {
        label: this.rhisTranslateService.translate('MENU.FRANCHISE'),
        icon: 'icon_12',
        command: (event) => {
          this.clickItem1(event, 1);
        },
        routerLink: this.rhisRouter.getRoute('ALL_FRANCHISE'),
        title: this.screenService.getScreen('FRANCHISE')
      },
      {
        label: this.rhisTranslateService.translate('MENU.RESTAURANT_WITHOUT_SUB_MENU'),
        icon: 'icon_8',
        command: (event) => {
          // this.clickItem1(event, 2);
        },
        routerLink: this.rhisRouter.getRoute('ALL_RESTAURANT'),
        title: this.screenService.getScreen('RESTAURANT')
      },
      {
        label: this.rhisTranslateService.translate('MENU.USERS'),
        icon: 'icon_10',
        command: (event) => {
          this.clickItem1(event, 3);
        },
        routerLink: ['/admin/utilisateur'],
        title: this.screenService.getScreen('USERS')
      },
      {
        label: this.rhisTranslateService.translate('MENU.PROFILS'),
        icon: 'icon_10',
        command: (event) => {
          this.clickItem1(event, 4);
        },
        routerLink: ['/admin/profil/all/listGlobal'],
        title: this.screenService.getScreen('PROFILS')
      },
      {
        label: this.rhisTranslateService.translate('MENU.PARAMETERS'),
        icon: 'icon_11',
        command: (event) => {
          this.clickItem1(event, 3);
        },
        routerLink: this.rhisRouter.getRoute('#')
      }
    ];
    this.menuGestionParc = [
      {
        label: this.rhisTranslateService.translate('LOGOUT.GESTION_PARC'),
        icon: 'icon_1',
        routerLink: this.rhisRouter.getRouteHomePac('PARC_HOME', this.sessionService.getUuidFranchise()),
        command: (event) => {
          this.clickItem1(event, 0);
        },
        title: this.screenService.getScreen('GESTION_PARC')
      },
      {
        label: this.rhisTranslateService.translate('MENU.EMPLOYEE'),
        icon: 'icon_2',
        routerLink: this.rhisRouter.getRoute('RAPPORT_RH'),
        command: (event) => {
          this.clickItem1(event, 1);
        },
        title: this.screenService.getScreen('RAPPORT_RH')
      },
      {
        label: this.rhisTranslateService.translate('MENU.PILOTAGE'),
        icon: 'icon_7',
        routerLink: this.rhisRouter.getRoute('PARC_RAPPORT'),
        command: (event) => {
          this.clickItem1(event, 2);
        },
        title: this.screenService.getScreen('RAPPORT')
      },
      {
        label: this.rhisTranslateService.translate('MENU.PAIE'),
        icon: 'icon_5',
        routerLink: this.rhisRouter.getRoute('PARC_PAIE'),
        command: (event) => {
          this.clickItem1(event, 3);
        },
        title: this.screenService.getScreen('GESTION_PAIE')
      },
      {
        label: this.rhisTranslateService.translate('MENU.RESTAURANT_WITHOUT_SUB_MENU'),
        icon: 'icon_8',
        routerLink: this.router.url,
        command: (event) => {
          const currentRoute = this.router.routerState;
          this.router.navigateByUrl(currentRoute.snapshot.url, { skipLocationChange: true });
        },
        title: this.screenService.getScreen(''),
        items: [
          // TODO groupe de travail
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.GROUPES_TRAVAIL'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_GROUPE_TRVAIL'),
                      title: this.screenService.getScreen('GROUPE_TRAVAIL')
                    },*/
          // TODO position travail
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.POSITIONS_TRAVAIL'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_POSTE_TRVAIL'),
                      title: this.screenService.getScreen('POSTE_TRAVAIL')
                    },*/
          // TODO BADGE
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.BADGES'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_BADGE'),
                      title: this.screenService.getScreen('BADGE')
                    },*/
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.ALERTS'),
            routerLink: this.rhisRouter.getRoute('CONFIGURATION_ALERTE_PARC'),
            title: this.screenService.getScreen('ALERTE')
          },
          // TODO TYPE CONTRAT
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.TYPE_CONTRATS'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_CONTRAT'),
                      title: this.screenService.getScreen('TYPE_CONTRAT')
                    },*/
          // TODO FORMATION
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.LIST_FORMATIONS'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_LIST_FORMATION'),
                      title: this.screenService.getScreen('FORMATION')
                    },*/
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.JOURS_FERIES'),
            routerLink: ['/parc/jours-feries'],
            title: this.screenService.getScreen('FERIE')

          },
          // TODO TYPE EVENEMENT
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.EVENTS'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_TYPE_EVENEMENT'),
                      title: this.screenService.getScreen('TYPE_EVENEMENT')
                    },*/
          // TODO PERIODE PAIE
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_PAIE'),
                      title: this.screenService.getScreen('PERIODE_PAIE')
                    },*/
          // TODO PERIODE MANAGER
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PERIODES_MANAGERS'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_PERIODE_MANAGER'),
                      title: this.screenService.getScreen('PERIODE_MANAGER')
                    },*/
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETERES_NATIONAUX'),
            routerLink: ['/parc/param-nationaux'],
            title: this.screenService.getScreen('PARAM_RESTAURANT')
          },
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.RESTAURANT_LAW'),
            routerLink: this.rhisRouter.getRoute('PARC_CONFIGURATION_LOI_RESTAURANT'),
            title: this.screenService.getScreen('LOI_RESTAURANT')
          },
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRES_RESTAURANT'),
            routerLink: this.rhisRouter.getRoute('PARAMETRE_RESTAURANT'),
            title: this.screenService.getScreen('SOCIETE')
          },

          // TODO MODE DE VENTE
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MODE_VENTE'),
                      routerLink: this.rhisRouter.getRoute('CONFIGURATION_MODE_VENTE'),
                      title: this.screenService.getScreen('MODE_VENTE')
                    },*/
          // TODO DECOUPAGE HORAIRE
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.DECOUPAGE_HORAIRE'),
                      routerLink: this.rhisRouter.getRoute('HOME_PLANNING_CONFIGURATION_DECOUPAGE_HORAIRE'),
                      title: this.screenService.getScreen('DECOUPAGE_HORAIRE')
                    },*/
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRE_PLANNING'),
            routerLink: this.rhisRouter.getRoute('PARAMETRE_PLANNING_PARC'),
            title: this.screenService.getScreen('PARAMETRE_PLANNING')
          },
          {
            label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.PARAMETRE_VALIDATION_PAIE'),
            routerLink: this.rhisRouter.getRoute('PARAMETRE_VALIDATION_PAIE'),
            title: this.screenService.getScreen('PARAMETRE_PAIE')
          }
          // TODO USERS
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_USERS'),
                      routerLink: ['/home/utilisateur/ByRestaurant'],
                      title: this.screenService.getScreen('MANAGE_USERS')
                    },*/
          // TODO PROFILS
          /*          {
                      label: this.rhisTranslateService.translate('MENU.RESTAURANT.SUB_MENU.MANAGE_PROFILS'),
                      routerLink: ['/home/profil/ByRestaurant'],
                      title: this.screenService.getScreen('MANAGE_PROFILS')
                    }*/
        ]
      }
    ];
  }

  /**
   * Réuinitialisation de scroll
   */
  reuinitialisationScroll() {
    setTimeout(_ => {
      this.contentHeight = this.nav.nativeElement.scrollHeight;

      this.displayScrollRhis();
    }, 500);
  }

  /**
   * Set current url to menu icons if it changes
   */
  private setRestaurantIconRoute() {
    const index = this.shownMenu.findIndex((icon: MenuItem) => {
      if (icon.items) {
        return true;
      }
    });
    if (index !== -1) {
      this.shownMenu[index].routerLink = this.router.url;
    }
  }

  /**
   * Method close and open menu
   */
  public openClosePanel() {
    this.openedMenu = !this.openedMenu;
    this.switchIcon = this.openedMenu ? 'close.svg' : 'open.svg';
    this.toggleLabels();
    this.globalSettings.toggleMenu(this.openedMenu);
    this.globalSettings.menuIsOpen = !this.globalSettings.menuIsOpen;
    setTimeout(_ => {
      // Set the menu width in open/close action in GlobalSetting service
      const menuWidth: number = this.nav.nativeElement.offsetWidth;
      this.globalSettings.sendMenuWidth(menuWidth);
      this.globalSettings.menuWidh = menuWidth;
      this.setActiveSection();
    }, 400);
    this.displayScrollMenu = false;
  }

  /**
   * Show/hide menus labels
   */
  public toggleLabels(): any {
    if (this.openedMenu) {
      setTimeout(_ => this.showedLabels = this.openedMenu, 300);
    } else {
      setTimeout(_ => this.showedLabels = this.openedMenu, 5000);
    }
  }

  /**
   * detecte changement size of window
   * @param: event
   */
  @HostListener('window:resize', ['$event'])
  public detectWindow(event) {
    this.displayScrollRhis();
  }

  /**
   * check scroll
   * if height menu greater than window heigth :scrol show else scroll hidden
   */
  displayScrollRhis() {
    // minus 120 which is the height of the menu context without including the open/close
    this.windowHeigth = window.innerHeight - 100;
    if (this.contentHeight > this.windowHeigth) {
      this.displayScrollMenu = true;
    } else {
      this.displayScrollMenu = false;
    }
  }

  /**
   * Set active section highlighted by url
   */
  private setActiveSection() {
    let index = this.shownMenu.findIndex((menuItem: MenuItem) => {
      let isMatchExist = false;
      if (menuItem.routerLink && (Array.isArray(menuItem.routerLink) && (this.currentUrl === menuItem.routerLink[0]) || (this.currentUrl === menuItem.routerLink))) {
        isMatchExist = true;
      }
      return isMatchExist;
    });


    if (this.currentUrl.includes('/home/employee/') || this.currentUrl.includes('/home/edit-doc-rh') ||
      this.currentUrl.includes('/parc/edit-doc-rh')) {
      index = 1;
    } else if (this.currentUrl.includes('/home/planning')) {
      index = 3;
    } else if (this.currentUrl.includes('/parc/list-rapport') ||
      this.currentUrl.includes('/home/previsions') ||
      this.currentUrl === '/admin/societe' ||
      this.currentUrl.includes('/add-restaurant') ||
      this.currentUrl.includes('/restaurants/all') ||
      this.currentUrl.includes('admin/societe/types-restaurants') ||
      this.currentUrl.includes('/home/societe/restaurants')) {
      index = 2;
    } else if (this.currentUrl.includes('admin/profil')) {
      index = 4;
    } else if (this.currentUrl.includes('/societe/all') ||
      this.currentUrl.includes('/parc/list') ||
      this.currentUrl === '/admin/societe/all' || this.currentUrl === '/admin/societe/new-company' ||
      this.currentUrl === '/home/all-alerte') {
      index = 0;
    }

    const icons = document.getElementsByClassName('ui-menuitem ui-widget ui-corner-all');
    const menuPanelElements = document.getElementsByClassName('ui-panelmenu-header');
    const table = [];
    for (let i = 0; i < this.shownMenu.length; i++) {
      table.push(i);
    }
    table.forEach((i) => {
      if (icons.length) {
        if (i !== index) {
          this.renderer.removeClass(icons[i], 'active');
          this.renderer.addClass(icons[i], 'inactive');
        } else {
          this.renderer.removeClass(icons[i], 'inactive');
          this.renderer.addClass(icons[i], 'active');
        }
      }
      if (menuPanelElements.length) {
        if (i !== index) {
          this.renderer.removeClass(menuPanelElements[i], 'ui-state-active');
          this.renderer.addClass(menuPanelElements[i], 'inactive');
        } else {
          this.renderer.removeClass(menuPanelElements[i], 'inactive');
          this.renderer.addClass(menuPanelElements[i], 'ui-state-active');
        }
      }

    });

  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.contentHeight = this.nav.nativeElement.scrollHeight;
    this.displayScrollRhis();
  }

  /**
   * Run change detection explicitly after the change
   */
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  private getMenuForPermissions(menu: MenuItem[]): MenuItem[] {
    const authorizedMenu: MenuItem[] = [];
    const subMenu: MenuItem[] = [];
    menu.forEach(async (item: MenuItem) => {
        if (this.authenticationService.displayAllowed(item.title) || item.title === '') {
          if (item.items && item.items.length > 0) {
            for (const subItem of (<MenuItem[]>item.items)) {
              if (!this.authenticationService.displayAllowed(subItem.title)) {
                item.items.splice((<MenuItem[]>item.items).indexOf(subItem), 1);
              }
            }
          }
          if (item.title !== 'GP'
            || (this.authenticationService.displayAllowed('GPC')
              && this.authenticationService.displayAllowed('GDH'))) {
            await authorizedMenu.push(item);
          }
        }
      }
    );
    return authorizedMenu;
  }


}
