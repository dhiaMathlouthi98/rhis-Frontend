import {Component, Input, OnInit} from '@angular/core';
import {ProductiviteModel} from '../../../../../../shared/model/productivite.model';
import {PhaseModel} from '../../../../../../shared/model/phase.model';
import {PhaseService} from '../../service/phase.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {ProductiviteService} from '../../service/productivite.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-gestion-productivite',
  templateUrl: './gestion-productivite.component.html',
  styleUrls: ['./gestion-productivite.component.scss']
})
export class GestionProductiviteComponent implements OnInit {

  public firstDayAsInteger: number;

  public collumns: any[] = [];

  public listProductivite: ProductiviteModel[] = [];

  public listProductiviteOrdonner: ProductiviteModel[] = [];

  public defaultListProductiviteOrdonner: ProductiviteModel[] = [];

  private ecran = 'GPT';


  @Input()
  set initListeJours(listJours: any[]) {
    this.collumns = listJours;
  }

  @Input()
  set initPremierJourSemaine(firstDayAsInteger: number) {
    this.firstDayAsInteger = firstDayAsInteger;
  }

  constructor(private phaseService: PhaseService,
              private sharedRestaurant: SharedRestaurantService,
              private productiviteService: ProductiviteService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit() {
    this.getAllProductiviteByRestaurant();
  }

  private getAllProductiviteByRestaurant() {
    this.productiviteService.getProductiviteByRestaurant().subscribe(
      (data: ProductiviteModel[]) => {
        this.listProductivite = data;
        this.getAllPhaseNameOrdonner();
      },
      (err) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des phases pour un restaurant
   */
  private getAllPhaseNameOrdonner() {
    this.phaseService.getAllPhaseByRestaurantOrderByTime().subscribe(
      (data: PhaseModel[]) => {
        this.ordonnerEnRecuperation(data);
      },
      (err) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet d'ordonner la liste d'absenteisme par phase (heure de debut de chaque phase)
   * @param: data
   */
  private ordonnerEnRecuperation(data: PhaseModel[]) {
    data.forEach(itemPhase => {
      this.listProductivite.forEach(item => {
        if (item.phase.idPhase === itemPhase.idPhase) {
          item.restaurant = this.sharedRestaurant.selectedRestaurant;
          item.phase.restaurant = this.sharedRestaurant.selectedRestaurant;
          this.listProductiviteOrdonner.push(item);
        }
      });
    });
    this.listProductiviteOrdonner.splice(this.listProductiviteOrdonner.length - 1, 1);
    this.defaultListProductiviteOrdonner = JSON.parse(JSON.stringify(this.listProductiviteOrdonner));
  }

  /**
   * Cette methode permet de faire appel à la methode de mise dans le cas où les conditions sont vérifier
   */
  public addProductivite() {
    if (this.canUpdate()) {
      this.updateProductivite();
    } else {
      this.notificationService.showErrorMessage('ABSENTEISME.ERROR_VALUE_BODY', 'ABSENTEISME.ERROR_VALUE_HEADER');
    }
  }

  /**
   * Cette methode permet de retourner 'true'=> lancer l'appel vers la mise à jour dans le cas où tout les valeurs sont entre 0 et 100 et false => un message d'erreur si non
   */
  private canUpdate(): boolean {
    let canUpdate = true;
    this.listProductiviteOrdonner.forEach(item => {
      this.collumns.forEach(jour => {
        if (+item['valeur' + jour.val] > +100 || +item['valeur' + jour.val] < +0) {
          canUpdate = canUpdate && false;
        }
      });
    });
    return canUpdate;
  }

  /**
   * Cette methode permet d'appeler le WS responsable à la mise à jour de la liste de productivite
   */
  private updateProductivite() {
    this.productiviteService.updateListProductivite(this.listProductiviteOrdonner).subscribe(
      () => {
        this.defaultListProductiviteOrdonner = JSON.parse(JSON.stringify(this.listProductiviteOrdonner));
      },
      (err) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('ABSENTEISME.SUCCESS_UPDATE_BODY', 'ABSENTEISME.SUCCESS_UPDATE_HEADER');
      }
    );
  }

  public compareList(): boolean {
    let same = true;
    this.listProductiviteOrdonner.forEach((item, index) => {
      if (JSON.stringify(this.defaultListProductiviteOrdonner[index]) !== JSON.stringify(this.listProductiviteOrdonner[index])) {
        same = false;
      }
    });
    return same;
  }

}
