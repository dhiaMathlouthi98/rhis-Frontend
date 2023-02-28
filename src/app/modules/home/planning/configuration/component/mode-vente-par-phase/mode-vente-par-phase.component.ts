import {Component, Input, OnInit} from '@angular/core';
import {ModeVenteParPhaseModel} from '../../../../../../shared/model/modeVenteParPhase.model';
import {ModeVenteParPhaseService} from '../../service/modeVenteParPhase.service';
import {PhaseService} from '../../service/phase.service';
import {PhaseModel} from '../../../../../../shared/model/phase.model';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis--mode-vente-par-phase',
  templateUrl: './mode-vente-par-phase.component.html',
  styleUrls: ['./mode-vente-par-phase.component.scss']

})
export class ModeVenteParPhaseComponent implements OnInit {

  public listModeVente: ModeVenteParPhaseModel[];

  public listPhase: PhaseModel[] = [];

  public firstDayAsInteger: number;

  public collumns: any[] = [];

  private ecran = 'MVP';

  @Input()
  set initListeJours(listJours: any[]) {
    this.collumns = listJours;
  }

  @Input()
  set initPremierJourSemaine(firstDayAsInteger: number) {
    this.firstDayAsInteger = firstDayAsInteger;
  }

  constructor(private modeVenteParPhaseService: ModeVenteParPhaseService,
              private phaseService: PhaseService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit() {
    this.getAllPhaseByRestaurantOrderByTime();
  }

  /**
   * recuperation des mode de vente par phase dans un restaurant
   */
  getAllModeVenteParPhase() {
    this.modeVenteParPhaseService.getAll().subscribe(
      (data: any) => {
        this.listModeVente = data;
        this.onSortPhase();
      }, err => {
        // TODO gestion err
        console.log(err);
      }
    );
  }

  getAllPhaseByRestaurantOrderByTime() {
    this.phaseService.getAllPhaseByRestaurantOrderByTime().subscribe(
      (data: PhaseModel[]) => {
        this.listPhase = data;
        this.listPhase.splice(this.listPhase.length - 1, 1);
        this.getAllModeVenteParPhase();
      }, err => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }

  updateModeVente_Phase() {
    this.modeVenteParPhaseService.updateAll(this.listModeVente).subscribe(
      () => {
        // TODO add success message
      }, err => {
        // TODO gestion erreur
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('ABSENTEISME.SUCCESS_UPDATE_BODY', 'ABSENTEISME.SUCCESS_UPDATE_HEADER');
      }
    );
  }

  /**
   * cette methode s'execute lors de l affichage du tableau
   * elle permet de regroupes les phase par mode de vente
   */
  onSortPhase() {
    this.listPhase.forEach(item => {
      this.listModeVente.forEach(mvPhase => {
        if (mvPhase.phase.idPhase === item.idPhase) {
          if (item.modesVentes) {
            item.modesVentes.push(mvPhase);
          } else {
            item.modesVentes = [];
            item.modesVentes.push(mvPhase);
          }
        }
      });
    });
  }

  public calculerTotalPourcentage(phase: PhaseModel, dayName: string): number {
    let total = 0;
    if (phase.modesVentes) {
      phase.modesVentes.forEach(mv => {
        total += +mv['valeur' + dayName];
      });
    }
    return total;
  }

  /**
   * Cette methode permet de faire appel à la methode de mise dans le cas où les conditions sont vérifier
   */
  public saveListModeVente() {
    if (this.canUpdate()) {
      this.updateModeVente_Phase();
    } else {
      this.notificationService.showErrorMessage('MODE_VENTE_PAR_PHASE.ERROR_VALUE_BODY', 'MODE_VENTE_PAR_PHASE.ERROR_VALUE_HEADER');
    }
  }

  /**
   * Cette methode permet de retourner 'true'=> lancer l'appel vers la mise à jour dans le cas où tout les valeurs sont entre 0 et 100 et false => un message d'erreur si non
   */
  private canUpdate(): boolean {
    let canUpdate = true;
    let tmpTotal = 0;
    this.listPhase.forEach(item => {
      this.collumns.forEach(jour => {
        tmpTotal = this.calculerTotalPourcentage(item, jour.val);
        if (tmpTotal !== +100) {
          canUpdate = canUpdate && false;
        }
      });
    });
    return canUpdate;
  }

}
