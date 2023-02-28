import {DecoupageHoraireService} from '../../../../../modules/home/planning/configuration/service/decoupage.horaire.service';
import {DateService} from '../../../../service/date.service';
import {SharedRestaurantService} from '../../../../service/shared.restaurant.service';
import {SharedRestaurantListService} from '../../../../service/shared-restaurant-list.service';
import {Router} from '@angular/router';
import {DomControlService} from '../../../../service/dom-control.service';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../../service/notification.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {Component, OnInit} from '@angular/core';
import {ParametrePlanningModel} from '../../../../model/parametre.planning.model';
import {DecoupageHoraireModel} from '../../../../model/decoupage.horaire.model';
import {JourOrdreDernierPosteModel} from '../../../../model/jour.ordre.dernier.poste.model';
import {Observable, Subject} from 'rxjs';
import {JourSemaine} from '../../../../enumeration/jour.semaine';
import {ParametrePlanningService} from '../../service/parametre.planning.service';

@Component({
  selector: 'rhis-parametre-planning',
  templateUrl: './parametre-planning.component.html',
  styleUrls: ['./parametre-planning.component.scss']
})

export class ParametrePlanningComponent implements OnInit {

  public parametrePlanning: ParametrePlanningModel = {} as ParametrePlanningModel;
  public debutJourneeDecoupageHoraire: DecoupageHoraireModel = {} as DecoupageHoraireModel;
  public finJourneeDecoupageHoraire: DecoupageHoraireModel = {} as DecoupageHoraireModel;
  public defaultparametrePlanning: ParametrePlanningModel = {} as ParametrePlanningModel;
  public selectedJourOrdre: JourOrdreDernierPosteModel;
  public tauxMoyenLabel: string = this.rhisTranslator.translate('PARAM_PLANNING.TAUX_MOYEN');
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public timeEnSeconde = 24 * 60 * 60 * 1000;
  public heightInterface: any;
  public displayRestoList: boolean;
  public listRestoSource: any[];
  public restaurantSource: any;
  public showPopup = false;
  public listRestoDestination = [];
  public submitButtonText = this.rhisTranslator.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  public listRestoIds = [];
  private ecran = 'GPP';
  public defaultRestoUuid: string;
  public resourceName = this.rhisTranslator.translate('GESTION_PARC_RAPPORT.PARAM_PLG_RESOURCE');


  constructor(private parametrePlanningService: ParametrePlanningService,
              private decoupageHoraireService: DecoupageHoraireService,
              private dateService: DateService,
              private sharedRestaurantService: SharedRestaurantService,
              private rhisTranslator: RhisTranslateService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService,
              private route: Router,
              private sharedRestoService: SharedRestaurantListService) {
  }

  ngOnInit() {
    if (this.route.url.includes('parc')) {
      this.displayRestoList = true;
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestoSource = result;
        if (this.listRestoSource.length) {
          this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.listRestoSource[0].uuid);
          this.getParametrePlanning(this.listRestoSource[0].uuid);
          this.getDebutJourneePhase(this.listRestoSource[0].uuid);
          this.getFinJourneePhase(this.listRestoSource[0].uuid);
          this.restaurantSource = this.listRestoSource[0];
        }
      });
    } else {
      this.displayRestoList = false;
      this.getParametrePlanning();
      this.getDebutJourneePhase();
      this.getFinJourneePhase();
    }
  }

  public changeParams(): void {
    this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.restaurantSource.uuid);
    if (this.compareObjects()) {
      this.getParametrePlanning(this.restaurantSource.uuid);
    } else {
      this.saveContentBeforRestoChange();
    }

  }

  public submit(event: any[]): void {
    this.listRestoIds = [];
    this.showPopup = false;
    event.forEach(val => this.listRestoIds.push(val.IdenRestaurant));
    if (this.compareObjects()) {
      this.copierParams();
    } else {
      this.updateParametrePlanning(true, false);

    }
  }

  /**
   * Check if parametres planning has changed
   */
  public compareObjects(): boolean {
    return JSON.stringify(this.parametrePlanning) === JSON.stringify(this.defaultparametrePlanning);
  }

  public copierParams(): void {
    this.parametrePlanningService.copierParamPlanning(this.restaurantSource.uuid, this.listRestoIds).subscribe((result: any) => {
        this.notificationService.showSuccessMessage('PARAM_PLANNING.PARAM_PLANNING_COPIED_SUCCESSFULLY');
      }
      , error => {
        console.log(error);
      });
  }

  closePopup() {
    this.showPopup = false;
  }

  showPopupListResto() {
    this.showPopup = true;
  }

  public SaveButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   * Cette methode permet d'augmenter lordre du jour (exp ordre 2 -> 1)
   */
  public augmenterOrdre(value: JourOrdreDernierPosteModel): void {
    this.selectedJourOrdre = value;
    const selectedIndex = this.getIndexOfSelectedJourOrdre();
    if (!(selectedIndex === 0) && (this.selectedJourOrdre)) {
      this.selectedJourOrdre.ordre--;
      this.parametrePlanning.jourOrdreDernierPostes[selectedIndex - 1].ordre++;
      this.sortByOrdreJour();
    }
  }

  /**
   * Cette methode permet de diminuer lordre du jour (exp ordre 1 -> 2)
   */
  public diminuerOrdre(value: JourOrdreDernierPosteModel): void {
    this.selectedJourOrdre = value;
    const selectedIndex = this.getIndexOfSelectedJourOrdre();
    if (!(selectedIndex === this.parametrePlanning.jourOrdreDernierPostes.length - 1) && (this.selectedJourOrdre)) {
      this.selectedJourOrdre.ordre++;
      this.parametrePlanning.jourOrdreDernierPostes[selectedIndex + 1].ordre--;
      this.sortByOrdreJour();
    }
  }

  /**
   * Cette methode permet d'afficher un message de confirmation de valeur de nuit si l'heure introduite est SUPERIEUR a minuit et INFERIEUR a l'heure de debut de journee dactivite de la journee suivante.
   * @param: index
   */
  public verificationNightValue(index: number): void {
    if (this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste && this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste !== '') {
      if (this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste.getHours() >= 0 && this.isValueLessThanDebutJournee(index)) {
        this.confirmationService.confirm({
          message: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
          header: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
          acceptLabel: this.rhisTranslator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslator.translate('POPUPS.DELETE_REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: () => {
            this.setNightValue(index, true);
          },
          reject: () => {
            this.setNightValue(index, false);
          }
        });
      } else {
        this.parametrePlanning.jourOrdreDernierPostes[index].valeurNuitDernierPoste = false;
      }
    }
  }

  /**
   * Cette methode permet de faire appel au web service responsable a la mise a jour des parametres du planning equipier si les conditions sont verifier si non des messages derreur seront afficher
   */
  public saveUpdate(): void {
    if (this.verifTauxMoyenChanges()) {
      if (this.verifDernierPoste()) {
        this.updateParametrePlanning();
      } else {
        this.notificationService.showErrorMessage('PARAM_PLANNING.DERNIER_POSTE_ERROR_MESSAGE', 'PARAM_PLANNING.ERROR_VALIDATION');
      }
    }
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    if (this.SaveButtonControl()) {
      return this.allowToSave();
    } else {
      return true;
    }

  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParametrePlanning();
        setTimeout(() => this.navigateAway.next(true), 1500);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * Cette methode fait appel au web service responsable a la recuepration de la phase ayant comme libelle debut journee dactivite du restaurant
   */
  private getDebutJourneePhase(uuidRestaurant?: any): void {
    this.decoupageHoraireService.getDebutJourneePhase(uuidRestaurant).subscribe(
      (data: DecoupageHoraireModel) => {
        this.debutJourneeDecoupageHoraire = data;
        this.setCorrectTimeDecoupage(this.debutJourneeDecoupageHoraire);
      },
      (err: any) => {
        console.log(err);
      });
  }

  /**
   * Cette methode fait appel au web service responsable a la recuepration de la phase ayant comme libelle fin journee dactivite du restaurant
   */
  private getFinJourneePhase(uuidRestaurant?: any): void {
    this.decoupageHoraireService.getFinJourneePhase(uuidRestaurant).subscribe(
      (data: DecoupageHoraireModel) => {
        this.finJourneeDecoupageHoraire = data;
        this.setCorrectTimeDecoupage(this.finJourneeDecoupageHoraire);
      },
      (err: any) => {
        console.log(err);
      });
  }

  /**
   * Cette methode permet de changer la format de l'heure recuperer depuis la base de donnees vers une format adequate
   */
  private setCorrectTimeDecoupage(decoupageHoraire: DecoupageHoraireModel): void {
    if (decoupageHoraire.valeurDimanche) {
      decoupageHoraire.valeurDimanche = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurDimanche);
      if (decoupageHoraire.valeurDimancheIsNight) {
        decoupageHoraire.valeurDimanche.setDate(decoupageHoraire.valeurDimanche.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurLundi) {
      decoupageHoraire.valeurLundi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurLundi);
      if (decoupageHoraire.valeurLundiIsNight) {
        decoupageHoraire.valeurLundi.setDate(decoupageHoraire.valeurLundi.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurMardi) {
      decoupageHoraire.valeurMardi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurMardi);
      if (decoupageHoraire.valeurMardiIsNight) {
        decoupageHoraire.valeurMardi.setDate(decoupageHoraire.valeurMardi.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurMercredi) {
      decoupageHoraire.valeurMercredi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurMercredi);
      if (decoupageHoraire.valeurMercrediIsNight) {
        decoupageHoraire.valeurMercredi.setDate(decoupageHoraire.valeurMercredi.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurJeudi) {
      decoupageHoraire.valeurJeudi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurJeudi);
      if (decoupageHoraire.valeurJeudiIsNight) {
        decoupageHoraire.valeurJeudi.setDate(decoupageHoraire.valeurJeudi.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurVendredi) {
      decoupageHoraire.valeurVendredi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurVendredi);
      if (decoupageHoraire.valeurVendrediIsNight) {
        decoupageHoraire.valeurVendredi.setDate(decoupageHoraire.valeurVendredi.getDate() + 1);
      }
    }
    if (decoupageHoraire.valeurSamedi) {
      decoupageHoraire.valeurSamedi = this.dateService.setTimeFormatHHMM(decoupageHoraire.valeurSamedi);
      if (decoupageHoraire.valeurSamediIsNight) {
        decoupageHoraire.valeurSamedi.setDate(decoupageHoraire.valeurSamedi.getDate() + 1);
      }
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforRestoChange(): void {
    this.confirmationService.confirm({
      message: this.rhisTranslator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParametrePlanning(false, true);
      },
      reject: () => {
        this.getParametrePlanning(this.restaurantSource.uuid);
      }
    });
  }

  /**
   * Cette methode permet de ordonner la liste 'jourOrdreDernierPostes' du parametre planning selon l 'ordre' du façn croissante
   */
  private sortByOrdreJour(): void {
    this.parametrePlanning.jourOrdreDernierPostes.sort((a, b) => a.ordre - b.ordre);
  }

  /**
   * Cette methode permet d'initialiser et cloner les parametres planning dans une autre variable
   */
  private resetAndCloneParam(): void {
    this.defaultparametrePlanning = {} as ParametrePlanningModel;
    // La methode JSON.parse(JSON.stringify(obj)) permet de creer un autre object ayant les mêmes valeures que 'obj'
    this.defaultparametrePlanning = JSON.parse(JSON.stringify(this.parametrePlanning));
    this.parametrePlanning.jourOrdreDernierPostes.forEach((item, index) => {
      if (item.dernierPoste) {
        item.dernierPoste = this.dateService.setTimeFormatHHMM(item.dernierPoste);
        if (item.valeurNuitDernierPoste) {
          item.dernierPoste = new Date(item.dernierPoste.getTime() + this.timeEnSeconde);
        }
        this.defaultparametrePlanning.jourOrdreDernierPostes[index].dernierPoste = item.dernierPoste;
      }
    });
  }

  /**
   * Cette methode permet de recuperer l'index de l'element selectionne
   */
  private getIndexOfSelectedJourOrdre(): number {
    return this.parametrePlanning.jourOrdreDernierPostes.indexOf(this.selectedJourOrdre);
  }

  /**
   * Cette methode permet de verfier les valeurs du taux moyen equipier et taux moyen manager
   * Les valeurs acceptees seulement des valeures 'float' positives
   */
  private verifTauxMoyenChanges(): boolean {
    if (this.parametrePlanning.tauxMoyenManager.toString().match('^\\d+(\\.\\d+)?$') &&
      this.parametrePlanning.tauxMoyenEquipier.toString().match('^\\d+(\\.\\d+)?$')) {
      return true;
    } else {
      if (!this.parametrePlanning.tauxMoyenManager.toString().match('^\\d+(\\.\\d+)?$')) {
        this.notificationService.showErrorMessage('PARAM_PLANNING.ERROR_MANAGER', 'PARAM_PLANNING.ERROR_VALIDATION');
      } else {
        this.notificationService.showErrorMessage('PARAM_PLANNING.ERROR_EQUIPIER', 'PARAM_PLANNING.ERROR_VALIDATION');
      }
      return false;
    }
  }

  /**
   * Cette methode permet de verifier si l'heure du dernier poste et le jour de l'index passer en @param est INFERIEUR a l'heure de debut de journee dactivite de la journee suivante
   * @param: index
   */
  private isValueLessThanDebutJournee(index: number): boolean {
    const jour: JourSemaine = this.parametrePlanning.jourOrdreDernierPostes[index].jour;
    const valeurDernierPoste = this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste;
    let isLessThanDebutJournee: boolean;
    switch (jour) {
      case JourSemaine.LUNDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurMardi.getHours();
        break;
      }
      case JourSemaine.MARDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurMercredi.getHours();
        break;
      }
      case JourSemaine.MERCREDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurJeudi.getHours();
        break;
      }
      case JourSemaine.JEUDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurVendredi.getHours();
        break;
      }
      case JourSemaine.VENDREDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurSamedi.getHours();
        break;
      }
      case JourSemaine.SAMEDI: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurDimanche.getHours();
        break;
      }
      case JourSemaine.DIMANCHE: {
        isLessThanDebutJournee = valeurDernierPoste.getHours() < this.debutJourneeDecoupageHoraire.valeurLundi.getHours();
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return isLessThanDebutJournee;
  }

  /**
   * Cette methode permet de mettre la valeur de nuit a 'true' ou bien a 'false' suivant le choix de l'utilisateur-restaurant (le choix permet aussi de diminuer un jour ou bien augmenter d un jour
   * @param: index
   * @param: isNightValue
   */
  private setNightValue(index: number, isNightValue: boolean): void {
    if (isNightValue) {
      this.parametrePlanning.jourOrdreDernierPostes[index].valeurNuitDernierPoste = true;
      this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste = new Date(this.parametrePlanning.jourOrdreDernierPostes[index].dernierPoste.getTime() + this.timeEnSeconde);
    } else {
      this.parametrePlanning.jourOrdreDernierPostes[index].valeurNuitDernierPoste = false;
    }
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur parametre planning
   */
  private allowToSave(): boolean {
    return JSON.stringify(this.parametrePlanning) === JSON.stringify(this.defaultparametrePlanning);
  }

  /**
   * Cette methode permet de recuperer les parametres du planning du restaurant, et de faire appel a la methode 'sortByOrdreJour' et 'resetAndCloneParam'
   */
  private getParametrePlanning(uuidRestaurant?: any): void {
    this.parametrePlanningService.getParametrePlanningWithJourOrdreDernierPosteByRestaurant(uuidRestaurant).subscribe(
      (data: ParametrePlanningModel) => {
        this.parametrePlanning = data;
        this.sortByOrdreJour();
        this.resetAndCloneParam();
        this.defaultRestoUuid = uuidRestaurant;
      },
      (err: any) => {
        console.log(err);
      });
  }

  /**
   * Cette methode permet de vérifier les valeurs du dernier poste.
   * Les valeurs acceptees sont :
   * elle doit etre INFERIEUR a la valeur du fin de journee dactivite && SUPERIEUR a la valeur du debut de journee dactivite
   * La verification se fait jour par jour
   */
  private verifDernierPoste(): boolean {
    let correctDernierPosteValue = true;
    this.parametrePlanning.jourOrdreDernierPostes.forEach(item => {
      if (item.jour === JourSemaine.DIMANCHE) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurDimanche || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurDimanche) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.LUNDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurLundi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurLundi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.MARDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurMardi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurMardi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.MERCREDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurMercredi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurMercredi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.JEUDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurJeudi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurJeudi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.VENDREDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurVendredi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurVendredi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
      if (item.jour === JourSemaine.SAMEDI) {
        if (item.dernierPoste > this.finJourneeDecoupageHoraire.valeurSamedi || item.dernierPoste < this.debutJourneeDecoupageHoraire.valeurSamedi) {
          correctDernierPosteValue = correctDernierPosteValue && false;
        } else {
          correctDernierPosteValue = correctDernierPosteValue && true;
        }
      }
    });
    return correctDernierPosteValue;
  }

  private updateParametrePlanning(fromCopieParam?: boolean, fromSaveContent?: boolean): void {
    let uuidRestoSource: string;
    if (this.restaurantSource) {
      uuidRestoSource = this.restaurantSource.uuid;
    }
    if (fromSaveContent) {
      uuidRestoSource = this.defaultRestoUuid;
    }
    this.parametrePlanningService.updateParametrePlanning(this.parametrePlanning, uuidRestoSource).subscribe(
      (data: ParametrePlanningModel) => {
        this.parametrePlanning = data;
        this.sharedRestaurantService.selectedRestaurant.parametrePlanning = data;
        this.selectedJourOrdre = undefined;
        this.sortByOrdreJour();
        this.resetAndCloneParam();
      }, (err: any) => {
      }, () => {
        if (!fromCopieParam) {
          this.notificationService.showSuccessMessage('PARAM_PLANNING.PARAM_PLANNING_UPDATED_SUCCESSFULLY');
        }else{
          this.copierParams();
        }
        if (fromSaveContent) {
          this.getParametrePlanning(this.restaurantSource.uuid);
        }
      });
  }

}
