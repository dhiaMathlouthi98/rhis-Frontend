import {Component, OnInit} from '@angular/core';
import {GlobalSettingsService} from '../../../../shared/service/global-settings.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import {AlarmeService} from '../../../home/accueil/service/alarme.service';
import {GuiAlarme} from '../../../../shared/model/gui/gui.alarme';
import {Router} from '@angular/router';
import {SessionService} from '../../../../shared/service/session.service';
import {MenuItem} from 'primeng/api';
import {NotificationService} from '../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {RestaurantNameService} from '../../../../shared/service/restaurant-name.service';
import {RestaurantService} from '../../../../shared/service/restaurant.service';
import {RestaurantModel} from '../../../../shared/model/restaurant.model';
import {interval, Subscription} from 'rxjs';
import {UserService} from '../../service/user.service';
import {MyRhisUserModel} from '../../../../shared/model/MyRhisUser.model';
import {DomControlService} from '../../../../shared/service/dom-control.service';
import {RemoveItemLocalStorageService} from '../../../../shared/service/remove-item-local-storage.service';


@Component({
  selector: 'rhis-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public user = '';
  public openedMenu = false;
  public openedAlertes = false;
  public restaurantName: string;
  public items: MenuItem[];
  public listGuiAlarme: GuiAlarme[] = [];
  public showProfilPopup = false;
  public showProfilPopupTitle: string;
  public showRestaurantListPopUp = false;
  public listRestaurant: RestaurantModel[] = [];
  public selectedRestaurant: RestaurantModel = new RestaurantModel();
  public actifRestaurant: RestaurantModel;
  public showDropDown = false;
  public showRestaurantListTitle: string;
  private maxDropDownSize = 15;
  private ecran = 'GPC';
  public showInfoSupport = false;
  public titleInfoSupport: string;
  public supportInfo: any;
  private subscription: Subscription;
  private readonly URLFORM = 'https://share.hsforms.com/1asvHbjyXRDaG9WCO3K5kCw4vl2u?email=';

  constructor(private globalSettings: GlobalSettingsService,
              private sharedRestaurantService: SharedRestaurantService,
              private alarmeService: AlarmeService,
              private router: Router,
              public sessionService: SessionService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private restaurantNameService: RestaurantNameService,
              private restaurantService: RestaurantService,
              private userService: UserService,
              private domControlService: DomControlService,
              private removeItemLocalStorageService: RemoveItemLocalStorageService) {
  }

  public deconnexion() {
    this.removeItemLocalStorageService.removeFromLocalStorage();
    this.removeItemLocalStorageService.removeFromSessionStorage();
    localStorage.removeItem('CP1236');
    localStorage.removeItem('user-nom');
    localStorage.removeItem('user-prenom');
    localStorage.removeItem('email');
    localStorage.removeItem('profilUuid');
    localStorage.removeItem('profilId');
    localStorage.removeItem('profil');
    localStorage.removeItem('lastUrl');
    this.sharedRestaurantService.selectedRestaurant = undefined;
    this.restaurantNameService.changeNameRestaurant('');
  }

  private gestionParcShow(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  ngOnInit() {
    this.restaurantNameService.showProfilPopup.subscribe((state: boolean) => this.showProfilPopup = state);
    this.listGuiAlarme = [];
    this.user = this.sessionService.getUserNom() + ' ' + this.sessionService.getUserPrenom();
    this.restaurantNameService.currentMessage.subscribe(message => {
      this.restaurantName = message;
      this.getListRestaurantByUser();
    });

    this.restaurantService.getRestaurantById(this.sessionService.getUuidRestaurant()).subscribe( restaurant => {
    	this.actifRestaurant = restaurant;
    });

    this.restaurantNameService.listGuiAlarme.subscribe(listGuiAlarme => this.listGuiAlarme = listGuiAlarme);
    if (this.listGuiAlarme.length === 0 && (+this.sessionService.getRestaurant()) !== 0) {
      this.getAllGuiAlarmeByRestaurant();
    }

    if (this.restaurantName === '') {
      this.restaurantName = this.sessionService.getRestaurantName();
    }
    if (this.gestionParcShow()) {
      this.items = [
        {
          label: this.rhisTranslateService.translate('LOGOUT.GREETING') + ', ' + this.user,
          items: [
            {
              label: this.rhisTranslateService.translate('MENU.PROFILS_EN_COURS'),
              command: () => {
                this.showPopupProfil();
              },
            },
            {
              label: this.rhisTranslateService.translate('LOGOUT.GESTION_PARC'),
              routerLink: [],
              command: () => {
                this.redirection();
              },
            },
            {
              label: this.rhisTranslateService.translate('LOGOUT.DECONEXION'),
              routerLink: ['/login'],
              command: () => {
                this.deconnexion();
              },
            }
          ]
        },
      ];
    } else {
      this.items = [
        {
          label: this.rhisTranslateService.translate('LOGOUT.GREETING') + ', ' + this.user,
          items: [
            {
              label: this.rhisTranslateService.translate('MENU.PROFILS_EN_COURS'),
              command: () => {
                this.showPopupProfil();
              },
            },
            {
              label: this.rhisTranslateService.translate('LOGOUT.DECONEXION'),
              routerLink: ['/login'],
              command: () => {
                this.deconnexion();
              },
            }
          ]
        },
      ];
    }

    // this.RefreshToken();
  }

  private redirection() {
    if (this.sessionService.getUuidFranchise()) {
      this.router.navigateByUrl(`/parc/List/restaurantList/${this.sessionService.getUuidFranchise()}`);
    } else if (this.sessionService.getProfil() === 'franchise' || this.sessionService.getProfil() === 'administrateur') {
      this.router.navigateByUrl('/parc/List/restaurantList');
    } else {
      this.router.navigateByUrl('/admin/franchise/all');
    }
    this.sharedRestaurantService.selectedRestaurant = undefined;
    this.restaurantNameService.changeNameRestaurant('');
    this.sessionService.setRestaurant(0);
  }

  public toggleAlert() {
    if (!this.openedAlertes) {
      this.restaurantNameService.listGuiAlarme.subscribe(listGuiAlarme => this.listGuiAlarme = listGuiAlarme);
      this.getAllGuiAlarmeByRestaurant();
    }
    this.openedAlertes = !this.openedAlertes;
  }

  public closeAlertes() {
    this.openedAlertes = false;
  }

  public displayAllAlert(alarme?: GuiAlarme) {
    this.closeAlertes();
    this.router.navigate(['home/all-alerte']);
  }

  private getAllGuiAlarmeByRestaurant() {
    this.alarmeService.getAllGuiAlarmeByRestaurant(this.sessionService.getUuidRestaurant()).subscribe(
      (data: GuiAlarme[]) => {
        this.listGuiAlarme = this.alarmeService.getAllPresentGuiAlarmeOrderByPriorite(data);
      }, (err: any) => {
        // TODO notify of error
      }
    );
  }

  /**
   * Get the first letters of the employee's firs/last name
   */
  public getFirstFullNameLetters(): string {
    const nom = this.sessionService.getUserNom();
    const prenom = this.sessionService.getUserPrenom();
    if (nom && prenom) {
      return (nom.slice(0, 1).toUpperCase() + prenom.slice(0, 1).toUpperCase());
    } else if (nom) {
      return (nom.slice(0, 2).toUpperCase());
    } else if (prenom) {
      return (prenom.slice(0, 2).toUpperCase());
    } else {
      this.router.navigateByUrl('/login');
      this.deconnexion();
      return '';
    }
  }

  public closePopupProfil(): void {
    this.restaurantNameService.changePopUpState(false);
  }


  public showPopupProfil(): void {
    this.restaurantNameService.changePopUpState(true);
    this.showProfilPopupTitle = this.rhisTranslateService.translate('PROFIL.MON_PROFIL');
  }

  public closeRestaurantListProfil(): void {
    this.showRestaurantListPopUp = false;
  }


  public getListRestaurantByUser() {
    this.showRestaurantListPopUp = false;
    this.showDropDown = false;
    const uuidFranchise = this.sessionService.getUuidFranchiseForRestaurantOfSuperviseur();
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    this.restaurantService.getRestaurantsByUser(this.sessionService.getUuidUser()).subscribe((restaurantList: RestaurantModel[]) => {
      this.listRestaurant = restaurantList.sort((a,b) => a.libelle.localeCompare(b.libelle));
      if (restaurantList.length === 0) {
        if (regexExp.test(uuidFranchise) && this.sessionService.getProfil() === 'superviseur') {
          this.getRestaurantByFranchise(uuidFranchise);
        } else {
          this.restaurantService.getRestaurantsBySocieteId(this.sessionService.getUuidUser()).subscribe((restaurants: RestaurantModel[]) => {
            this.notificationService.stopLoader();
            this.listRestaurant = restaurants.sort((a,b) => a.libelle.localeCompare(b.libelle));
            this.getListRestaurantWithoutCurrent();
            this.showPopOrList();
          });
        }
      } else {
        this.notificationService.stopLoader();
        this.getListRestaurantWithoutCurrent();
        this.showPopOrList();

      }
    });
  }

  private showPopOrList(): void {
    if (this.listRestaurant.length > this.maxDropDownSize) {
      this.showRestaurantListTitle = this.rhisTranslateService.translate('RESTAURANT.AVAILABLE_RESTAURANTS');
      this.showDropDown = false;
    } else if (this.listRestaurant.length > 0) {
      this.showDropDown = true;
    }
  }

  /**
   * permet de changer le restaurant courant et sauvgarder les donnés du nouveau restaurant
   */
  public async changeCurrentRestaurant() {
    if (this.selectedRestaurant) {
    	this.listRestaurant.push(this.actifRestaurant);
        this.actifRestaurant = this.listRestaurant[this.listRestaurant.findIndex(restaurant => restaurant.idRestaurant === +this.selectedRestaurant.idRestaurant)]

      if (this.selectedRestaurant.societe != null) {
        this.sessionService.setSociete(this.selectedRestaurant.societe.idSociete);
        this.sessionService.setSocieteName(this.selectedRestaurant.societe.societeName);
        this.sessionService.setUuidSociete(this.selectedRestaurant.societe.uuid);
      }
      this.sharedRestaurantService.selectedRestaurant = this.selectedRestaurant;
      this.sessionService.setRestaurantName(this.selectedRestaurant.libelle);
      this.sessionService.setRestaurant(String(this.selectedRestaurant.idRestaurant));
      this.sessionService.setUuidRestaurant(this.selectedRestaurant.uuid);
      if (this.router.url === '/home') {
        window.location.reload();
      } else {
        await this.router.navigate(['home']);
        window.location.reload();
      }
      this.getListRestaurantWithoutCurrent();
    }
  }

  private getListRestaurantWithoutCurrent() {
    this.listRestaurant.splice(this.listRestaurant.findIndex(restaurant => restaurant.idRestaurant === +this.sessionService.getRestaurant()), 1);
  }

  /**
   * Open popup when is the button question mark and display information about myrhis
   */
  public infoSupportOpen() {
    this.showInfoSupport = true;
    this.titleInfoSupport = this.rhisTranslateService.translate('SUPPORT.TITLE');

    this.supportInfo = {
      guideUser: this.rhisTranslateService.translate('SUPPORT.GUIDE_USER'),
      monGuide: this.rhisTranslateService.translate('SUPPORT.MON_GUIDE'),
      mail: this.rhisTranslateService.translate('SUPPORT.MAIL'),
      horaire: this.rhisTranslateService.translate('SUPPORT.HORAIRE'),
      horaire_info_1: this.rhisTranslateService.translate('SUPPORT.HORAIRE_INFO_1'),
      horaire_info_2: this.rhisTranslateService.translate('SUPPORT.HORAIRE_INFO_2'),
      horaire_info_3: this.rhisTranslateService.translate('SUPPORT.HORAIRE_INFO_3'),
      tel: this.rhisTranslateService.translate('SUPPORT.TEL'),
      CGU: this.rhisTranslateService.translate('SUPPORT.CGU'),
      CGPC: this.rhisTranslateService.translate('SUPPORT.CGPC'),
    };

  }

  public openGuidePdf(): void {
    window.open('/assets/file_import/guide.pdf', '_blank');
  }

  public openMyrhisRGPDPdf(): void {
    window.open('/assets/file_import/myrhisRGPD.pdf', '_blank');
  }

  /**
   * close popup info support
   */
  public infoSupportClose() {
    this.showInfoSupport = false;
  }

  /**
   * Set restaurant name
   */
  public async setRestaurantName(): Promise<void> {
    this.getListRestaurantWithoutCurrent();
    await this.router.navigate(['home']);
    window.location.reload();
    this.restaurantName = this.sessionService.getRestaurantName();
  }


  private RefreshToken(): void {
    const refreshTime: number = +this.sessionService.getRefreshTimer();
    const source = interval(refreshTime * 60000);
    this.subscription = source.subscribe(val => {
      localStorage.removeItem('T120');
      this.getAccessToken();
    });
  }

  private async getAccessToken(): Promise<void> {
    const user: MyRhisUserModel = {};
    user.email = this.sessionService.getEmail();
    const jwt = await this.userService.getAccessToken(user).toPromise();
    this.sessionService.setBearerToken(jwt);
  }

  public openFormulaire(): void {
    window.open(this.URLFORM + this.sessionService.getEmail() + '&company=' + this.sessionService.getRestaurantName() + '&firstname=' + this.sessionService.getUserPrenom() + '&lastname=' + this.sessionService.getUserNom() + '&enseigne=' + this.sessionService.getSocieteName());
  }

  private getRestaurantByFranchise(uuidFranchise: any): void {
    this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(uuidFranchise)
      .subscribe((restaurantPage: any) => {
        this.listRestaurant = restaurantPage.content;
        this.listRestaurant.forEach((restaurantDisplay: any) => {
          restaurantDisplay.idRestaurant = restaurantDisplay.IdenRestaurant;
          restaurantDisplay.libelle = restaurantDisplay.libelleRestaurant;
        });
        this.getListRestaurantWithoutCurrent();
        this.showPopOrList();
        this.listRestaurant.sort((restO, restaurantDisplay) => restO.libelle > restaurantDisplay.libelle ? 1 : -1);

      });

  }
}
