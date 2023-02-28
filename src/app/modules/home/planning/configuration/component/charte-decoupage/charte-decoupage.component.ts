import {Component, Input, OnInit} from '@angular/core';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {CharteService} from '../../service/charte.service';
import {CharteModel} from '../../../../../../shared/model/charte.model';
import {CharteDecoupageModel} from '../../../../../../shared/model/charte.decoupage.model';
import {PhaseModel} from '../../../../../../shared/model/phase.model';
import {PhaseService} from '../../service/phase.service';
import {CharteDecoupageService} from '../../service/charte.decoupage.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-charte-decoupage',
  templateUrl: './charte-decoupage.component.html',
  styleUrls: ['./charte-decoupage.component.scss']
})
export class CharteDecoupageComponent implements OnInit {

  public firstDayAsInteger: number;

  public collumns: any[] = [];

  public listChartes: CharteModel[] = [];

  public chartesItemList: SelectItem[] = [];

  public listChartesDecoupages: CharteDecoupageModel[] = [];

  public listChartesDecoupagesOrdonner: CharteDecoupageModel[] = [];

  public defaultListChartesDecoupagesOrdonner: CharteDecoupageModel[] = [];

  public listPhase: PhaseModel[];

  private ecran = 'CDP';


  @Input()
  set initListeJours(listJours: any[]) {
    this.collumns = listJours;
  }

  @Input()
  set initPremierJourSemaine(firstDayAsInteger: number) {
    this.firstDayAsInteger = firstDayAsInteger;
  }

  constructor(private sharedRestaurant: SharedRestaurantService,
              private dateService: DateService,
              private rhisTranslator: RhisTranslateService,
              private charteService: CharteService,
              private phaseService: PhaseService,
              private charteDecoupageService: CharteDecoupageService,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  ngOnInit() {
    this.getAllChartes();
  }

  /**
   * Cette methode permet d'ajouter une charte de decoupage
   */
  public addCharteDecoupage(): void {
    this.charteDecoupageService.persistCharteDecoupage(this.listChartesDecoupagesOrdonner).subscribe(
      () => {
        this.defaultListChartesDecoupagesOrdonner = JSON.parse(JSON.stringify(this.listChartesDecoupagesOrdonner));
        this.notificationService.showSuccessMessage('CHARTE_DECOUPAGE.UPDATE_SUCCESS', 'CHARTE_DECOUPAGE.UPDATE_MESSAGE_HEADER');
      },
      (err: any) => {
        // TODO notify for errors
        console.log(err);
      }
    );
  }

  public compareList(): boolean {
    let same = true;
    this.listChartesDecoupagesOrdonner.forEach((item: CharteDecoupageModel, index: number) => {
      if (JSON.stringify(this.defaultListChartesDecoupagesOrdonner[index]) !== JSON.stringify(this.listChartesDecoupagesOrdonner[index])) {
        same = false;
      }
    });
    return same;
  }

  /**
   * Cette methode permet de recuperer la liste des chartes disponible par restaurant la liste alimentera l'option select
   */
  private getAllChartes(): void {
    this.charteService.getAllCharteByRestaurant().subscribe(
      (data: CharteModel[]) => {
        if (data.length > 0) {
          this.listChartes = data;
          this.listChartes.forEach((item: CharteModel) => {
            this.chartesItemList.push({
              label: item.libelle,
              value: item.libelle
            });
          });
          this.getAllCharteDecoupage();
        } else {
          this.getAllPhaseNameOrdonner(true);
        }
      },
      (err: any) => {
        // TODO notify for errors
        console.log(err);
      }
    );
  }

  /**
   * Cette methode permet de lancer l appel web service pour recuperer la liste des chartes de decoupages
   */
  private getAllCharteDecoupage(): void {
    this.charteDecoupageService.getAllCharteDecoupageByRestaurant().subscribe(
      (data: CharteDecoupageModel[]) => {
        this.listChartesDecoupages = data;
        this.setDefaultValues();
        this.getAllPhaseNameOrdonner(false);
      },
      (err: any) => {
        // TODO notify for errors
        console.log(err);
      }
    );
  }

  private setDefaultValues(): void {
    this.listChartesDecoupages.forEach((item: CharteDecoupageModel) => {
      if (!item.valeurLundi) {
        item.valeurLundi = this.chartesItemList[0].label;
      }
      if (!item.valeurMardi) {
        item.valeurMardi = this.chartesItemList[0].label;
      }
      if (!item.valeurMercredi) {
        item.valeurMercredi = this.chartesItemList[0].label;
      }
      if (!item.valeurJeudi) {
        item.valeurJeudi = this.chartesItemList[0].label;
      }
      if (!item.valeurVendredi) {
        item.valeurVendredi = this.chartesItemList[0].label;
      }
      if (!item.valeurSamedi) {
        item.valeurSamedi = this.chartesItemList[0].label;
      }
      if (!item.valeurDimanche) {
        item.valeurDimanche = this.chartesItemList[0].label;
      }
    });
  }

  /**
   * Cette methode permet de recuperer la liste des phases pour un restaurant
   */
  private getAllPhaseNameOrdonner(displayOnly: boolean): void {
    this.phaseService.getAllPhaseByRestaurantOrderByTime().subscribe(
      (data: PhaseModel[]) => {
        if (displayOnly) {
          this.listPhase = data;
          this.listPhase.splice(this.listPhase.length - 1, 1);
        } else {
          this.ordonnerEnRecuperation(data);
        }
      },
      (err: any) => {
        // TODO notify for errors
        console.log(err);
      }
    );
  }

  private ordonnerEnRecuperation(data: PhaseModel[]): void {
    data.forEach((itemPhase: PhaseModel) => {
      this.listChartesDecoupages.forEach(item => {
        if (item.phase.idPhase === itemPhase.idPhase) {
          item.restaurant = this.sharedRestaurant.selectedRestaurant;
          item.phase.restaurant = this.sharedRestaurant.selectedRestaurant;
          this.listChartesDecoupagesOrdonner.push(item);
        }
      });
    });
    this.listChartesDecoupagesOrdonner.splice(this.listChartesDecoupagesOrdonner.length - 1, 1);
    this.defaultListChartesDecoupagesOrdonner = JSON.parse(JSON.stringify(this.listChartesDecoupagesOrdonner));
  }

}
