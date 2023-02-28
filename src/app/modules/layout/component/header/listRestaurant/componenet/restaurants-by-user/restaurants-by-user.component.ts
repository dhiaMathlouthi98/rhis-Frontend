import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {SessionService} from '../../../../../../../shared/service/session.service';
import {UserService} from '../../../../../service/user.service';
import {NotificationService} from '../../../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../../../shared/service/rhis-translate.service';
import {RestaurantModel} from '../../../../../../../shared/model/restaurant.model';
import {Router} from '@angular/router';
import {SharedRestaurantService} from '../../../../../../../shared/service/shared.restaurant.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'rhis-restaurants-by-user',
  templateUrl: './restaurants-by-user.component.html',
  styleUrls: ['./restaurants-by-user.component.scss']
})
export class RestaurantsByUserComponent implements OnInit {
  @Input()
  public listRestaurant: RestaurantModel[] = [];
  public ListRestaurants: string;
  public header: { title: string, field: string }[];
  @Output() private closeRestaurantListProfil = new EventEmitter();
  @Output() private setRestaurantName = new EventEmitter();

  @Input() private restaurantName;
  public searchByName = this.rhisTranslateService.translate('RESTAURANT.SEARCH_PLACEHOLDER');
  public searchField= new FormControl();
  public listRestaurantCopy: any[];
  constructor(private sessionService: SessionService,
              private userService: UserService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private sharedRestaurantService: SharedRestaurantService) {
  }

  ngOnInit() {
    this.ListRestaurants = this.rhisTranslateService.translate('RESTAURANT.LIST');
    this.listRestaurant.sort((a,b) => a.libelle.localeCompare(b.libelle));
    this.listRestaurantCopy = [... this.listRestaurant];
  }


  /**
   *  permet de changer le restaurant courant et sauvgarder les donnés du nouveau restaurant
   * @param: restaurant
   */
  public changeRestaurant(restaurant: RestaurantModel) {
    if (restaurant.societe != null) {
      this.sessionService.setSociete(restaurant.societe.idSociete);
      this.sessionService.setSocieteName(restaurant.societe.societeName);
      this.sessionService.setUuidSociete(restaurant.societe.uuid);
    }
    this.sharedRestaurantService.selectedRestaurant = restaurant;
    this.sessionService.setRestaurantName(restaurant.libelle);
    this.sessionService.setRestaurant(restaurant.idRestaurant);
    this.sessionService.setUuidRestaurant(restaurant.uuid);
    if (this.router.url === '/home') {
      window.location.reload();
    } else {
      this.setRestaurantName.emit();
      this.router.navigate(['home']);
    }
    this.closeRestaurantListProfil.emit();
  }

  public verifySuperVisor(): boolean {
    return this.sessionService.getProfil() === 'superviseur';
  }
  public searchRestaurant(): void {
    if(this.searchField.value){
      if(this.verifySuperVisor()){
        this.listRestaurant = this.listRestaurantCopy.filter((val) =>
        val.libelleRestaurant.toLowerCase().includes(this.searchField.value.toLowerCase())
      );
      } else {
        this.listRestaurant = this.listRestaurantCopy.filter((val) =>
        val.libelle.toLowerCase().includes(this.searchField.value.toLowerCase())
      );
      }
    } else {
      this.listRestaurant = this.listRestaurantCopy;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchRestaurant();
    }
  }
}
