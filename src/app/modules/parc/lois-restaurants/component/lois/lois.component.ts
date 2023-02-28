import {Component, OnInit} from '@angular/core';
import {SharedRestaurantListService} from '../../../../../shared/service/shared-restaurant-list.service';
import {GroupeTravailModel} from '../../../../../shared/model/groupeTravail.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {RestaurantService} from '../../../../../shared/service/restaurant.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {LoiRestaurantService} from '../../../../../shared/module/restaurant/service/loi.restaurant.service';
import {LoiGroupeTravailService} from '../../../../../shared/module/restaurant/service/loi.groupe.travail.service';
import {NotificationService} from '../../../../../shared/service/notification.service';

type RestaurantInfo = { IdenRestaurant: number, uuid: string, libelleRestaurant: string };

@Component({
    selector: 'rhis-lois',
    templateUrl: './lois.component.html',
    styleUrls: ['./lois.component.scss']
})
export class LoisComponent implements OnInit {
    public selectedRestaurant: RestaurantInfo;
    public restaurants: RestaurantInfo[] = [];
    public restaurantsToCopyTo: RestaurantInfo[] = [];
    public excludedRestaurants: RestaurantInfo[] = [];
    public selectedGroupTravail: GroupeTravailModel = {} as GroupeTravailModel;
    public showPopup = false;
    // text shown in exclusion icon next to restaurant list
    public operationIconText: string;
    public resourceName = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.LOI_RESTO_RESOURCE');

    constructor(private sharedRestaurantListService: SharedRestaurantListService,
                private rhisTranslateService: RhisTranslateService,
                private restaurantService: RestaurantService,
                private loiRestaurantService: LoiRestaurantService,
                private loiGroupeTravailService: LoiGroupeTravailService,
                protected notificationService: NotificationService) {
    }

    async ngOnInit() {
        this.restaurants = await this.sharedRestaurantListService.getListRestaurant();
        this.selectedRestaurant = this.restaurants.length ? this.restaurants[0] : undefined;
    }

    public async showPopUpCopy(): Promise<void> {
        this.restaurantsToCopyTo = [];
        this.excludedRestaurants = [];
        const restaurantsIds = this.restaurants.filter(restaurant => restaurant.uuid !== this.selectedRestaurant.uuid).map(restaurant => restaurant.IdenRestaurant);
        if (!restaurantsIds.length || (!this.selectedGroupTravail.idGroupeTravail)) {
            this.setAllRestaurantIncludedInCopyOperation(restaurantsIds);
        } else {
            await this.separateIncludedFromExcludedRestaurantInCopyOperation(restaurantsIds);
        }
        this.showPopup = true;
    }

    private async separateIncludedFromExcludedRestaurantInCopyOperation(restaurantsIds: number[]): Promise<void> {
        const restaurantsIdsHaveGroupTravail = await this.restaurantService.getRestaurantsHaveGroupeTravailLibelleFrom(this.selectedGroupTravail.libelle, restaurantsIds).toPromise();
        this.restaurants.forEach(restaurant => {
            if (restaurantsIdsHaveGroupTravail.includes(restaurant.IdenRestaurant)) {
                this.restaurantsToCopyTo.push(restaurant);
            } else if (restaurant.uuid !== this.selectedRestaurant.uuid) {
                this.excludedRestaurants.push(restaurant);
            }
        });
    }

    private setAllRestaurantIncludedInCopyOperation(restaurantsIds: number[]): void {
        this.restaurantsToCopyTo = this.restaurants.filter(restaurant => restaurantsIds.includes(restaurant.IdenRestaurant));
        this.excludedRestaurants = [];
    }

    public async copyValues(restaurants): Promise<void> {
        if (restaurants && restaurants.length) {
            const ids = restaurants.map(restaurant => restaurant.IdenRestaurant);
            if (this.selectedGroupTravail.idGroupeTravail) {
                await this.loiGroupeTravailService.copyLoiGroupTravail(this.selectedRestaurant.uuid, ids, this.selectedGroupTravail.libelle).toPromise();
                this.notificationService.showSuccessMessage('GESTION_PARC_LOI_RESTAURANT.SUCCESS_COPY_LOI_GROUP_TRAVAIL');
            } else {
                await this.loiRestaurantService.copyLoiRestaurant(this.selectedRestaurant.uuid, ids).toPromise();
                this.notificationService.showSuccessMessage('GESTION_PARC_LOI_RESTAURANT.SUCCESS_COPY_LOI_RESTAURANT');
            }
        }
        this.showPopup = false;
    }

    public showIconHoverText(event, tooltip: OverlayPanel): void {
        this.operationIconText = this.excludedRestaurants.length ?
            this.rhisTranslateService.translate(`GESTION_PARC_LOI_RESTAURANT.EXCLUDED_RESTAURANT`) + this.selectedGroupTravail.libelle :
            this.rhisTranslateService.translate(`GESTION_PARC_LOI_RESTAURANT.ALL_RESTAURANT_INCLUDED`);
        tooltip.show(event);
    }

    public getExcludedRestaurants(event, tooltip: OverlayPanel): void {
        if (this.excludedRestaurants.length) {
            tooltip.hide();
            this.operationIconText = '';
            const sortedRestaurants: RestaurantInfo[] = this.sharedRestaurantListService.sortRestaurantBylibelleAlphabetically(this.excludedRestaurants);
            sortedRestaurants.forEach(restaurant => this.operationIconText += `<p> ${restaurant.libelleRestaurant} </p>`);
            tooltip.show(event);
        }
    }

    public initializeGroupeTravail(event: any): void {
        this.selectedGroupTravail = {} as GroupeTravailModel;
    }
}
