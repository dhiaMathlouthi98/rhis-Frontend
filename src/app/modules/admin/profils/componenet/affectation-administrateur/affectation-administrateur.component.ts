import {Component, Input, OnInit} from '@angular/core';
import {SocieteModel} from '../../../../../shared/model/societe.model';
import {SocieteService} from '../../../../../shared/module/societe/service/societe.service';
import {RestaurantService} from '../../../../../shared/service/restaurant.service';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {ProfilService} from '../../service/profil.service';
import {ActivatedRoute} from '@angular/router';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {AffectationModel} from '../../../../../shared/model/affectation.model';

@Component({
  selector: 'rhis-affectation-administrateur',
  templateUrl: './affectation-administrateur.component.html',
  styleUrls: ['./affectation-administrateur.component.scss']
})

// FIXME : USE TRANSLSATE SERVICE IN HTML
export class AffectationAdministrateurComponent implements OnInit {

  public showRestaurant = true;

  public societeChoisies: SocieteModel[] = [];
  public societeDispnibles: SocieteModel[] = [];
  public restaurantDispnibles: RestaurantModel[] = [];
  public restaurantChoisies: RestaurantModel[] = [];
  public restaurantDeleted: RestaurantModel[] = [];

  public profil: ProfilModel;
  @Input()
  public listRestaurants: RestaurantModel[];

  constructor(private societeService: SocieteService,
              private restaurantService: RestaurantService,
              private activatedRoute: ActivatedRoute,
              private profilService: ProfilService,
              private rhisTranslateService: RhisTranslateService) {
  }

  ngOnInit() {
    this.getAllSociete();
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidProfil) {
        this.getProfilByid(params.uuidProfil);
      }
    });
  }

  private async getAllSociete(): Promise<void> {
    this.societeDispnibles = await this.societeService.getAllSociete().toPromise();
  }

  /**
   * permet d'ajouter les restaurants des societes chosies
   */
  public getRestaurantBysocieteOnAdd(event: any) {

    event.items.forEach(societe => {
      this.restaurantService.getRestaurantsBySocieteId(societe.uuid).subscribe((data: RestaurantModel[]) => {
        data.forEach(value => {
          if (this.restaurantChoisies.findIndex(restau => restau.idRestaurant === value.idRestaurant) < 0) {
            this.restaurantDispnibles.push(value);
          }
        });
      });
    });
  }

  /**
   * permet d'enlever les restaurants des societes retirer
   */
  public getRestaurantBySocieteOnDelete(event: any): void {
    event.items.forEach(societe => {
      this.restaurantService.getRestaurantsBySocieteId(societe.uuid).subscribe((data: RestaurantModel[]) => {
        this.restaurantDeleted = data;
        this.restaurantDeleted.forEach(deletedRestaurant => {

          if ((this.restaurantDispnibles.findIndex(i => i.idRestaurant === deletedRestaurant.idRestaurant)) >= 0) {
            this.restaurantDispnibles.splice(this.restaurantDispnibles.findIndex(i => i.idRestaurant === deletedRestaurant.idRestaurant), 1);
          }

          if ((this.restaurantChoisies.findIndex(i => i.idRestaurant === deletedRestaurant.idRestaurant)) >= 0) {
            this.restaurantChoisies.splice(this.restaurantChoisies.findIndex((i: RestaurantModel) => i.idRestaurant === deletedRestaurant.idRestaurant), 1);
          }

          if (this.societeChoisies.length < 1) {
            this.restaurantDispnibles = [];
          }
        });
      });
    });

  }

  private async filterSocieteList(societeChoisies: SocieteModel[]): Promise<void> {
    for (const societe of societeChoisies) {
      if ((this.societeDispnibles.findIndex(((societeDispo: SocieteModel) => societeDispo.uuid === societe.uuid)) >= 0)) {
        this.societeDispnibles.splice(this.societeDispnibles.findIndex(societeDispo => societeDispo.uuid === societe.uuid), 1);
      }
    }
  }

  private async getProfilByid(uuidProfil: string): Promise<void> {
    this.profil = await this.profilService.getProfilByid(uuidProfil).toPromise();
    this.societeChoisies = await this.profilService.getSocieteProfilAdmin(uuidProfil).toPromise();
    this.profil.affectations.forEach((affectation: AffectationModel) => {
      if (!affectation.utilisateur) {
        this.restaurantChoisies.push(affectation.restaurant);
        this.filterSocieteList(this.societeChoisies);
      }
    });
  }
}
