import {Component, OnInit} from '@angular/core';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {TypePeriodeRestaurantModel} from '../../../../../shared/enumeration/typePeriodeRestaurant.model';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {PeriodePaieRestaurantModel} from '../../../../../shared/model/periode.paie.restaurant.model';
import {PeriodePaieRestaurantService} from '../../service/periode.paie.restaurant.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-periode-paie',
  templateUrl: './periode-paie.component.html',
  styleUrls: ['./periode-paie.component.scss']
})
export class PeriodePaieComponent implements OnInit {
  public listPeriode: PeriodePaieRestaurantModel[] = [];
  public defaultListPeriode: PeriodePaieRestaurantModel[] = [];
  public currentMonth = new Date();

  public heightInterface: any;

  public choosenMinDate: Date;
  public choosenMaxDate: Date;
  public selectedDate: Date;

  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

  public startingMonth = 1;
  private ecran = 'PRP';

  constructor(private sharedRestaurantService: SharedRestaurantService,
              private periodePaieRestaurantSerice: PeriodePaieRestaurantService,
              private notificationService: NotificationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getListPeriodePaieByRestaurant();
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   * Cette methode permet de calculer la periode selon le type de periode du restaurant
   */
  public generateListPeriode(): void {
    this.getRestaurantById();
  }

  /**
   * Switch Mode to display
   * @param: index
   */
  public resetSelection(index: number): void {
    this.listPeriode[index].display = true;
  }

  /**
   * Set Max Date and Min Date values and switch mode to update
   * @param: index
   */
  public setMaxDateAndMinDateValues(index: number): void {
    this.listPeriode[index].display = false;
    this.selectedDate = this.listPeriode[index].dateDebut;
    if (index !== 0 && index !== this.listPeriode.length - 1) {
      this.choosenMinDate = new Date(this.listPeriode[index - 1].dateDebut.getTime() + this.ONE_DAY_IN_MILLISECONDS);
      this.choosenMaxDate = new Date(this.listPeriode[index + 1].dateDebut.getTime() - this.ONE_DAY_IN_MILLISECONDS);
    } else if (index === 0) {
      this.choosenMinDate = new Date(this.listPeriode[index].dateDebut);
      this.choosenMaxDate = new Date(this.listPeriode[index + 1].dateDebut.getTime() - this.ONE_DAY_IN_MILLISECONDS);
    } else {
      this.choosenMinDate = new Date(this.listPeriode[index - 1].dateDebut.getTime() + this.ONE_DAY_IN_MILLISECONDS);
      this.choosenMaxDate = new Date(this.listPeriode[index].dateFin.getTime() - this.ONE_DAY_IN_MILLISECONDS);
    }
  }

  public setNewDate(index: number): void {
    this.listPeriode[index].dateDebut = this.selectedDate;
    if (index !== 0) {
      this.listPeriode[index - 1].dateFin = new Date(this.selectedDate.getTime() - this.ONE_DAY_IN_MILLISECONDS);
    }
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des parametres
   */
  public compareList(): boolean {
    let same = true;
    this.listPeriode.forEach((item: PeriodePaieRestaurantModel, index: number) => {
      if (JSON.stringify(this.defaultListPeriode[index]) !== JSON.stringify(this.listPeriode[index])) {
        same = false;
      }
    });
    return same;
  }

  public updatePeriodePaieRestaurant(): void {
    this.notificationService.startLoader();
    this.periodePaieRestaurantSerice.addPeriodePaieByRestaurant(this.listPeriode).subscribe(
      (data: PeriodePaieRestaurantModel[]) => {
        this.notificationService.stopLoader();
        this.listPeriode = [];
        data.forEach((item: PeriodePaieRestaurantModel) => {
          this.listPeriode.push({
            'idPeriodePaieResaurant': item.idPeriodePaieResaurant,
            'dateDebut': new Date(item.dateDebut),
            'dateFin': new Date(item.dateFin),
            'originalDate': new Date(item.originalDate),
            'display': true
          });
        });
        this.defaultListPeriode = JSON.parse(JSON.stringify(this.listPeriode));
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('PERIODE_PAIE.UPDATED_SUCCESS');
      }
    );
  }

  private generateListPeriodePaieByTypePeriodeRestaurant(): void {
    switch (this.sharedRestaurantService.selectedRestaurant.periodeRestaurant) {
      case TypePeriodeRestaurantModel.MENSUEL: {
        this.generateListPeriodeMensuel(0);
        break;
      }
      case TypePeriodeRestaurantModel.SEMAINE_COMPLETE: {
        this.generateListPeriodeSemaineComplete(0);
        break;
      }
      case TypePeriodeRestaurantModel.SEMAINE_COMPLETE_DECALE: {
        const valeurDecalage: number = this.sharedRestaurantService.selectedRestaurant.valeurDebutMois;
        this.generateListPeriodeSemaineComplete(valeurDecalage);
        break;
      }
      case TypePeriodeRestaurantModel.MOIS_DECALE: {
        const valeurDecalage: number = this.sharedRestaurantService.selectedRestaurant.valeurDebutMois;
        this.generateListPeriodeMensuel(valeurDecalage);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }


  /**
   * Cette methode permet de generer la liste des periodes pour les types MENSUEL et MOIS_DECALE
   * @param decalage : Le decalage par rapport le 1 ( decalage = 1 pour MENSUEL / decalage = X pour MOIS_DECALE)
   */
  // TODO recursivite
  private generateListPeriodeMensuel(decalage: number): void {
    decalage += 1;
    let dateDebut: Date = new Date();
    for (let i = this.startingMonth; i < 13; i++) {
      // Le dernier jour du mois precedent
      dateDebut = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i - 1, 0);
      // Le premier jour du mois courant
      dateDebut.setDate(dateDebut.getDate() + decalage);
      this.listPeriode.push({
        'idPeriodePaieResaurant': 0,
        'dateDebut': dateDebut,
        'dateFin': new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i, decalage - 1),
        'originalDate': new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i - 1, 1),
        'display': true
      });
    }
  }

  /**
   * Cette methode permet de generer la liste des periodes pour le type SEMAINE_COMPLETE
   * Elle consiste a avoir le premier jour du mois a calculer et le premier jour de la semaine du restaurant puis on calcule la difference entre les deux (le DECALAGE = le nombre du jour a REVENIR pour avoir le premier jour de la periode)
   * Le dernier jour de la periode d'un mois X = (le premier jour de la periode du mois X+1) - 1
   */
  // TODO recursivite
  private generateListPeriodeSemaineComplete(decalage: number): void {
    let premierJourRestaurant: JourSemaine;
    let premierJour: Date = new Date();
    let dernierJour: Date = new Date();
    let decalageDebutSemaine = 0;
    let tmpPremierDate: Date = new Date();
    let tmpDernierDate: Date = new Date();
    premierJourRestaurant = this.sharedRestaurantService.selectedRestaurant.parametreNationaux.premierJourSemaine;

    for (let i = this.startingMonth; i < 13; i++) {
      // recuperer le dernier jour du mois dernier
      tmpPremierDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i - 1, 0);
      // recuperer le premier jour du mois courant
      tmpPremierDate.setDate(tmpPremierDate.getDate() + 1);
      // Calculer le DECALAGE entre le premier jour du mois courant et le premier jour de la semaine
      decalageDebutSemaine = this.getDecalageDebutSemaineDebutMois(premierJourRestaurant, tmpPremierDate);
      premierJour = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i - 1, 0);
      premierJour.setDate(premierJour.getDate() + 1);
      premierJour.setDate(premierJour.getDate() - decalageDebutSemaine + decalage);

      // recuperer le dernier jour du mois courant
      tmpDernierDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i, 0);
      // recuperer le premier jour du mois suivant
      tmpDernierDate.setDate(tmpDernierDate.getDate() + 1);
      // Calculer le DECALAGE entre le premier jour du mois suivnat et le premier jour de la semaine
      decalageDebutSemaine = this.getDecalageDebutSemaineDebutMois(premierJourRestaurant, tmpDernierDate);
      dernierJour = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i, 0);
      dernierJour.setDate(dernierJour.getDate() + 1);
      // Calculer le dernier jour de la periode courante = le premier jour de la periode suivante - 1
      dernierJour.setDate(dernierJour.getDate() - (decalageDebutSemaine + 1 - decalage));
      this.listPeriode.push({
        'idPeriodePaieResaurant': 0,
        'dateDebut': premierJour,
        'dateFin': dernierJour,
        'originalDate': new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + i - 1, 1),
        'display': true
      });
    }
  }

  /**
   * Cette methode permer de calculer le decalage entre la date (1er du mois) et le premier jour de la semaine du restaurant
   * @param: premierJourRestaurant
   * @param: premierJourMois
   */
  private getDecalageDebutSemaineDebutMois(premierJourRestaurant: JourSemaine, premierJourMois: Date): number {
    let decalage = 0;
    switch (premierJourRestaurant) {
      case JourSemaine.LUNDI: {
        decalage = premierJourMois.getDay() - (1 % 7);
        break;
      }
      case JourSemaine.MARDI: {
        decalage = premierJourMois.getDay() - (2 % 7);
        break;
      }
      case JourSemaine.MERCREDI: {
        decalage = premierJourMois.getDay() - (3 % 7);
        break;
      }
      case JourSemaine.JEUDI: {
        decalage = premierJourMois.getDay() - (4 % 7);
        break;
      }
      case JourSemaine.VENDREDI: {
        decalage = premierJourMois.getDay() - (5 % 7);
        break;
      }
      case JourSemaine.SAMEDI: {
        decalage = premierJourMois.getDay() - (6 % 7);
        break;
      }
      case JourSemaine.DIMANCHE: {
        decalage = premierJourMois.getDay() - (7 % 7);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    if (decalage < 0) {
      decalage += 7;
    }
    return decalage;
  }


  private getRestaurantById(): void {
    this.notificationService.startLoader();
    this.sharedRestaurantService.getRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.notificationService.stopLoader();
        this.sharedRestaurantService.selectedRestaurant = data;
        this.generateListPeriodePaieByTypePeriodeRestaurant();
        this.defaultListPeriode = JSON.parse(JSON.stringify(this.listPeriode));
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }
    );
  }


  private getListPeriodePaieByRestaurant(): void {
    this.periodePaieRestaurantSerice.getPeriodePaieByRestaurant().subscribe(
      (data: PeriodePaieRestaurantModel[]) => {
        this.startingMonth = data.length + 1;
        if (data.length === 12) {
          this.setListOfPeriodePaie(data, false);
          this.defaultListPeriode = JSON.parse(JSON.stringify(this.listPeriode));
        } else if (data.length === 0) {
          this.generateListPeriode();
        } else {
          this.setListOfPeriodePaie(data, true);
        }
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Permet de mettre les données recupérer du backend dans le tableau listPeriode et génère le reste des periodes si besoin (si la taille des données inférieur à 12)
   * @param: data
   * @param: missingData
   */
  private setListOfPeriodePaie(data: PeriodePaieRestaurantModel[], missingData: boolean): void {
    data.forEach((item: PeriodePaieRestaurantModel) => {
      this.listPeriode.push({
        'idPeriodePaieResaurant': item.idPeriodePaieResaurant,
        'dateDebut': new Date(item.dateDebut),
        'dateFin': new Date(item.dateFin),
        'originalDate': new Date(item.originalDate),
        'display': true
      });
    });
    if (missingData) {
      this.generateListPeriode();
    }
  }
}
