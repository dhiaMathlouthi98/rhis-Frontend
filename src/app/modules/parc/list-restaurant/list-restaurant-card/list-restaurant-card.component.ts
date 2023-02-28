import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {NotificationService} from '../../../../shared/service/notification.service';
import {AuthenticationService} from '../../../../authentication/services/authentication.service';
import {FranchiseService} from '../../../home/franchise/services/franchise.service';
import {RhisRoutingService} from '../../../../shared/service/rhis.routing.service';
import {SocieteService} from '../../../../shared/module/societe/service/societe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AlarmeService} from '../../../home/accueil/service/alarme.service';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {RestaurantNameService} from '../../../../shared/service/restaurant-name.service';
import {RestaurantService} from '../../../../shared/service/restaurant.service';
import {DomControlService} from '../../../../shared/service/dom-control.service';
import {GuiAlarme} from '../../../../shared/model/gui/gui.alarme';
import {SessionService} from '../../../../shared/service/session.service';
import {PathService} from '../../../../shared/service/path.service';
import {TokenService} from '../../../../authentication/services/token.service';
import {SharedRestaurantListService} from '../../../../shared/service/shared-restaurant-list.service';
import {SharedRestaurantService} from '../../../../shared/service/shared.restaurant.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'rhis-list-restaurant-card',
  templateUrl: './list-restaurant-card.component.html',
  styleUrls: ['./list-restaurant-card.component.scss']
})
// Affichage list restaurants by user ou by franchise en mode card
export class ListRestaurantCardComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public listRestaurant: any [];
  public imgTitle = '';
  public heightBlocListRestaurant: any;
  public uuidFranchise: string;
  public modeAffichage = true;
  private ecran = 'GPC';
  public searchField= new FormControl();
  public listRestaurantCopy: any[];
  public searchByName = this.rhisTranslateService.translate('RESTAURANT.SEARCH_PLACEHOLDER');
  public searchedValue = '';
  public notFoundMsgText= '';
  constructor(private rhisTranslateService: RhisTranslateService,
              private sharedRestaurantService: SharedRestaurantService,
              private authService: AuthenticationService,
              private router: Router,
              private notificationService: NotificationService,
              private tokenService: TokenService,
              private sessionService: SessionService,
              private restaurantService: RestaurantService,
              private pathService: PathService,
              private restaurantNameService: RestaurantNameService,
              private rhisRouter: RhisRoutingService,
              private alarmeService: AlarmeService,
              private changeDetectorRef: ChangeDetectorRef,
              private societeService: SocieteService,
              private activatedRoute: ActivatedRoute,
              private franchiseService: FranchiseService,
              private domControlService: DomControlService,
              private sharedRestaurantListService: SharedRestaurantListService) {
    this.activatedRoute.params.subscribe((parmas) => {
      if (parmas.uuidFranchise) {
        this.uuidFranchise = parmas.uuidFranchise;
      }
    });
    this.sessionService.setRestaurant(0);
    this.restaurantNameService.changeNameRestaurant('');
  }

  ngOnInit() {
    this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur('0');

    this.getListByUser();
    this.imgTitle = this.rhisTranslateService.translate('LIST_RESTAURANT.ACCEDE_RESTAURANT');
    this.sessionService.setRestaurant(0);
    this.sessionService.setRestaurantName('');
  }

  private showMenuControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }
  private checkNotFoundMsg():void{
    if(this.listRestaurant.length){
      this.notFoundMsgText = '';
    } else {
      this.notFoundMsgText = this.rhisTranslateService.translate('LIST_RESTAURANT.RESTAURANT_NOT_FOUND');
    }
  }
  public searchRestaurant(): void {
    this.searchedValue = this.searchField.value;
    if(this.searchField.value){
      this.listRestaurant = this.listRestaurantCopy.filter((val) =>
        val.libelleRestaurant.toLowerCase().includes(this.searchField.value.toLowerCase())
      );
    this.checkNotFoundMsg();
    } else {
      this.listRestaurant = this.listRestaurantCopy;
      this.checkNotFoundMsg();
    }
  }
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchRestaurant();
    }
  }
  private getListByUser() {
    if (this.uuidFranchise) {
      this.sessionService.setUuidFranchiseeForRestaurantOfSuperviseur(this.uuidFranchise);
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVenteByFranchise(this.uuidFranchise)
        .subscribe((restaurantPage: any) => {
          this.listRestaurant = restaurantPage.content;
          this.listRestaurantCopy = [... this.listRestaurant];
          this.checkNotFoundMsg();

          this.sharedRestaurantListService.retaurantList = restaurantPage.content;
        });
    } else {
      this.restaurantService.getRestaurantsWithNbrEmployeeActifAndVente(this.sessionService.getUuidUser()).subscribe((list: any) => {
        this.listRestaurant = list.content;
        this.checkNotFoundMsg();

        this.listRestaurantCopy = [... this.listRestaurant];
        this.sharedRestaurantListService.retaurantList = list.content;
      });
    }
  }

  public async redirectToRestaurant(resDTO: any): Promise<void> {
    this.pathService.setIdRestaurant(resDTO.IdenRestaurant);
    this.sessionService.setRestaurant(resDTO.IdenRestaurant);
    this.sessionService.setUuidRestaurant(resDTO.uuid);
    this.getSocieteByRestaurant(resDTO.uuid);
    this.restaurantNameService.changeNameRestaurant(resDTO.libelleRestaurant);
    this.sessionService.setRestaurantName(resDTO.libelleRestaurant);
    this.getAllGuiAlarmeByRestaurant(resDTO.uuid);
    this.router.navigateByUrl(this.rhisRouter.getRoute('HOME'));
    this.router.navigateByUrl('home');
    this.sharedRestaurantService.selectedRestaurant = await this.restaurantService.getRestaurantById(resDTO.uuid).toPromise();
  }

  private async getSocieteByRestaurant(uuidRestaurant: string): Promise<void> {
    const societe = await this.societeService.getSocieteByRestaurantUuid(uuidRestaurant).toPromise();
    this.sessionService.setSociete(societe.idSociete);
    this.sessionService.setSocieteName(societe.societeName);
  }

  private getAllGuiAlarmeByRestaurant(idRestaurant: number | string) {
    this.alarmeService.getAllGuiAlarmeByRestaurant(idRestaurant).subscribe(
      (data: GuiAlarme[]) => {
        this.restaurantNameService.setListGuiAlarme(this.alarmeService.getAllPresentGuiAlarmeOrderByPriorite(data));
      }, (err: any) => {
        // TODO notify of error
      }
    );
  }

  /**
   * Detecter height de list de restaurant
   */

  public heightListRestaurant() {
    const heightWindows = window.innerHeight;
    // 140 est celle de height de H1 + espace
    this.heightBlocListRestaurant = heightWindows - 200;
  }

  /**
   * detecte changement size of window
   * @param: event
   */
  @HostListener('window:resize', ['$event'])
  public detectWindow(event) {
    this.heightListRestaurant();
  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.heightListRestaurant();
  }

  /**
   * Run change detection explicitly after the change
   */
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  public getAffichage(mode: boolean) {
    if(this.modeAffichage !== mode){
      this.searchField = new FormControl();
      this.searchedValue = '';
    }
    this.modeAffichage = mode;
    this.listRestaurant = this.listRestaurantCopy;
    this.checkNotFoundMsg();

  }
}
