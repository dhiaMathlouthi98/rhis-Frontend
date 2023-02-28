import {Component, Input, OnInit} from '@angular/core';
import {PhaseModel} from '../../../../../../shared/model/phase.model';
import {PhaseService} from '../../service/phase.service';
import {AbsenteismeService} from '../../service/absenteisme.service';
import {AbsenteismeModel} from '../../../../../../shared/model/absenteisme.model';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-gestion-absenteisme',
  templateUrl: './gestion-absenteisme.component.html',
  styleUrls: ['./gestion-absenteisme.component.scss']
})
export class GestionAbsenteismeComponent implements OnInit {

  public firstDayAsInteger: number;

  public collumns: any[] = [];

  public listAbsenteisme: AbsenteismeModel[] = [];

  public listAbsenteismeOrdonner: AbsenteismeModel[] = [];

  public defaultListAbsenteismeOrdonner: AbsenteismeModel[] = [];

  private ecran = 'GAB';

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
              private absenteismeService: AbsenteismeService,
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
    this.getAllAbsenteismeByRestaurant();
  }

  /**
   * Cette methode permet d'appeler le WS responsable à la recuperation de la liste des absenteisme par restaurant
   */
  private getAllAbsenteismeByRestaurant() {
    this.absenteismeService.getAbsenteismeByRestaurant().subscribe(
      (data: AbsenteismeModel[]) => {
        this.listAbsenteisme = data;
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
      this.listAbsenteisme.forEach(item => {
        if (item.phase.idPhase === itemPhase.idPhase) {
          item.restaurant = this.sharedRestaurant.selectedRestaurant;
          item.phase.restaurant = this.sharedRestaurant.selectedRestaurant;
          this.listAbsenteismeOrdonner.push(item);
        }
      });
    });
    this.listAbsenteismeOrdonner.splice(this.listAbsenteismeOrdonner.length - 1, 1);
    this.defaultListAbsenteismeOrdonner = JSON.parse(JSON.stringify(this.listAbsenteismeOrdonner));
  }

  /**
   * Cette methode permet de faire appel à la methode de mise dans le cas où les conditions sont vérifier
   */
  public addAbsenteisme() {
    if (this.canUpdate()) {
      this.updateAbsenteisme();
    } else {
      this.notificationService.showErrorMessage('ABSENTEISME.ERROR_VALUE_BODY', 'ABSENTEISME.ERROR_VALUE_HEADER');
    }
  }

  /**
   * Cette methode permet de retourner 'true'=> lancer l'appel vers la mise à jour dans le cas où tout les valeurs sont entre 0 et 100 et false => un message d'erreur si non
   */
  private canUpdate(): boolean {
    let canUpdate = true;
    this.listAbsenteismeOrdonner.forEach(item => {
      this.collumns.forEach(jour => {
        if (+item['valeur' + jour.val] > +100 || +item['valeur' + jour.val] < +0) {
          canUpdate = canUpdate && false;
        }
      });
    });
    return canUpdate;
  }

  /**
   * Cette methode permet d'appeler le WS responsable à la mise à jour de la liste d'absenteisme
   */
  private updateAbsenteisme() {
    this.absenteismeService.updateListAbsenteisme(this.listAbsenteismeOrdonner).subscribe(
      () => {
        this.defaultListAbsenteismeOrdonner = JSON.parse(JSON.stringify(this.listAbsenteismeOrdonner));
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
    this.listAbsenteismeOrdonner.forEach((item, index) => {
      if (JSON.stringify(this.defaultListAbsenteismeOrdonner[index]) !== JSON.stringify(this.listAbsenteismeOrdonner[index])) {
        same = false;
      }
    });
    return same;
  }


}
