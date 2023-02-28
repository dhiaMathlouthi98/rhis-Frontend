import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {BesoinImposeService} from '../../service/besoin.impose.service';
import {BesoinImposeModel} from '../../../../../../shared/model/besoin.impose.model';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {PositionTravailService} from '../../../../configuration/service/position-travail.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {PeriodeManagerService} from '../../../../../../shared/module/restaurant/service/periode.manager.service';
import {Observable, Subject} from 'rxjs';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {DecoupageHoraireService} from '../../../configuration/service/decoupage.horaire.service';
import {PlanningsFixesPosteRowComponent} from '../plannings-fixes-poste-row/plannings-fixes-poste-row.component';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import * as rfdc from 'rfdc';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';

declare var interact;

@Component({
  selector: 'rhis-planning-besoin-impose-container',
  templateUrl: './planning-besoin-impose-container.component.html',
  styleUrls: ['./planning-besoin-impose-container.component.scss']
})
export class PlanningBesoinImposeContainerComponent implements OnInit, AfterViewInit {
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public personne = this.rhisTranslateService.translate('BIMPOSE.PERSONNE');

  public personnes = this.rhisTranslateService.translate('BIMPOSE.PERSONNES');

  public addPopupTitle = this.rhisTranslateService.translate('BIMPOSE.MODAL_ADD_TITLE');

  public updatePopupTitle = this.rhisTranslateService.translate('BIMPOSE.MODAL_UPDATE_TITLE');

  public firstDayAsInteger: number;
  public listIdBesoinImposeToDelete: any[] = [];
  public listBesoinImposeByPositionToDelete: any[] = [];

  public days: any[] = [];

  public listBesoinImpose: BesoinImposeModel[] = [];

  public listBesoinImposeToUpdate: BesoinImposeModel[] = [];

  public besoinImposeByPosteTravail = new Map();

  public listePositionTravail: PositionTravailModel[] = [];

  public listeUsedPositionTravail: PositionTravailModel[] = [];

  public listeAvailablePositionTravail: PositionTravailModel[] = [];

  public selectedPostTravail: PositionTravailModel;
  public besoinsImposeeToSave;
  // error messages
  public dateDebutSupDateFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_DEBUT_SUP_DATE_FIN');
  public dateFinWithoutDateDebutErrorMessage = this.rhisTranslateService.translate('BIMPOSE.DATE_FIN_WITHOUT_DATE_DEBUT');
  public heureDebutSupHeureFinErrorMessage = this.rhisTranslateService.translate('BIMPOSE.HEURE_DEBUT_SUP_HEURE_FIN');

  public limiteHeureDebut: Date;

  public setNightValue;

  public contentHeightPlanning: number;

  public listBesoinsCondense = true;

  public stylelistBesoinCondense = true;

  private ecran = 'GBI';

private daysOfWeek = [
  {day: 0, name: 'DIMANCHE'},
  {day: 1, name: 'LUNDI'},
  {day: 2, name: 'MARDI'},
  {day: 3, name: 'MERCREDI'},
  {day: 4, name: 'JEUDI'},
  {day: 5, name: 'VENDREDI'},
  {day: 6, name: 'SAMEDI'}
];

  public eventCtrl = false;
  @ViewChild('contentBodyPlan') calcHeight: ElementRef;
  @ViewChildren(PlanningsFixesPosteRowComponent, {read: PlanningsFixesPosteRowComponent})
  public planningFixedRows: QueryList<PlanningsFixesPosteRowComponent>;
  /**
   * Heure début journée d'activité
   */
  public debutJourneeActivite: any;
  /**
   * Heure fin journée d'activité
   */
  public finJourneeActivite: any;
  public startTime: string;
  public startTimeIsNight: boolean;
  public endTime: string;
  public endTimeIsNight: boolean;
  public modeAffichage = 0;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public decoupageHoraireFinEtDebutActivity: any;
  public clone = rfdc();

  constructor(private besoinImposeService: BesoinImposeService,
              private positionTravailService: PositionTravailService,
              private periodeManagerService: PeriodeManagerService,
              private sharedRestaurant: SharedRestaurantService,
              private dateService: DateService,
              private confirmationService: ConfirmationService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef,
              public rhisRouter: RhisRoutingService,
              private decoupageHoraireService: DecoupageHoraireService,
              private domControlService: DomControlService,
              private parametreService: ParametreGlobalService) {
  }

  ngOnInit() {
    setTimeout(() =>
        this.onReadyInitDrag() // initialisation de l'interraction du drag & drop des cards
      , 300);
    this.getSelectedRestaurant();
    this.getListePositionTravailByRestaurant();
    this.getHeureLimite();
    this.getDecoupageHoraire();
    this.getParamRestaurantByCodeNames();
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }


  private getSelectedRestaurant() {
    if (this.sharedRestaurant.selectedRestaurant.idRestaurant && this.sharedRestaurant.selectedRestaurant.idRestaurant !== 0) {
      this.setColumns();
    } else {
      this.sharedRestaurant.getRestaurantById().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurant.selectedRestaurant = data;
          this.setColumns();

        }, (err: any) => {
          console.log(err);
        }
      );

    }
  }

  private setColumns() {
    this.firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    for (let i = 0; i < 7; i++) {
      this.days.push({
        column: this.rhisTranslateService.translate('DAYS.' + this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7)),
        label: this.convertStringToCamelCase(this.dateService.getJourSemaineFromInteger((+this.firstDayAsInteger + i) % 7))
      });
      this.days.push();
    }
  }

  private getParamRestaurantByCodeNames(): void {
    const codeNamesAsArray = [this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    this.parametreService.getParamRestaurantByCodeNames(codeNames).subscribe(
      (data: ParametreModel[]) => {
        this.getDisplayMode24H(data);
      }
    );
  }

  public getDisplayMode24H(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      this.modeAffichage = +paramList[index].valeur;
    }
  }

  private convertStringToCamelCase(day: string): string {
    let convertedItem = day.charAt(0);
    convertedItem = convertedItem.concat(day.substring(1, day.length).toLowerCase());
    return convertedItem;
  }

  public duplicateBesoinAcheval(besoin: BesoinImposeModel): BesoinImposeModel {
    const besoindup = {...besoin};
    besoindup.acheval = true;
    besoindup.day = besoin.day < 6 ? besoin.day + 1 : besoin.day;
    besoindup.shiftAchevalHidden = true;
    besoindup.jourSemaine = this.dateService.getJourSemaineFromInteger(besoindup.day);
    const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(besoin.jourSemaine), true);
    besoin.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
    return besoindup;

  }

  private sortListBesoinByShiftAcheval(listBesoinImpose: BesoinImposeModel[]): void {
    listBesoinImpose.sort(function (besoin: BesoinImposeModel, besoinDisplay: BesoinImposeModel) {
      // true values first
      return (besoin.acheval === besoinDisplay.acheval) ? besoin.shiftAchevalHidden ? -1 : 0 : besoin.acheval ? -1 : 1;
    });
  }

  private getListBesoinImposeByRestaurant() {
    this.besoinImposeService.getAllBesoinImposeByRestaurant().subscribe(
      (data: BesoinImposeModel[]) => {
        this.listBesoinImpose = data;
        this.listBesoinImpose.forEach(item => {
          this.setCorrectTimeToDisplay(item);
          if (item.acheval) {
            const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(item.jourSemaine), true);
            item.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));

            const shiftDuplicate = this.duplicateBesoinAcheval(this.clone(item));
            if (shiftDuplicate) {
              this.listBesoinImpose.push(shiftDuplicate);
            }
          }
        });
        this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
        this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoin => besoin.positionTravail.idPositionTravail);
        this.fillAvailablePositionTravail();
      },
      (err) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Cette methode utilisee lors de la recuperation de la liste des besoins imposes elle permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  private setCorrectTimeToDisplay(item: BesoinImposeModel) {
    item.heureDebut = this.dateService.setTimeFormatHHMM(item.heureDebut);
    if (item.heureDebutNuit) {
      item.heureDebut.setDate(item.heureDebut.getDate() + 1);
    }
    item.heureFin = this.dateService.setTimeFormatHHMM(item.heureFin);
    if (item.heureFinNuit) {
      item.heureFin.setDate(item.heureFin.getDate() + 1);
    }
    if (item.dateDebut) {
      if (item.dateDebut instanceof Date) {
        item.dateDebut.setHours(0, 0, 0, 0);
      }
      const rawDate = new Date(item.dateDebut);
      const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
      if (userTimezoneOffset > 0) {
        item.dateDebut = new Date(rawDate.getTime() + userTimezoneOffset);
      } else {
        item.dateDebut = rawDate;
      }

    }
    if (item.dateFin) {
      if (item.dateFin instanceof Date) {
        item.dateFin.setHours(0, 0, 0, 0);
      }
      const rawDate = new Date(item.dateFin);
      const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
      if (userTimezoneOffset > 0) {
        item.dateFin = new Date(rawDate.getTime() + userTimezoneOffset);
      } else {
        item.dateFin = rawDate;
      }

    }
  }

  private groupBesoinByPosteTravail(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
        this.listeUsedPositionTravail.push(item.positionTravail);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  private getListePositionTravailByRestaurant() {
    this.positionTravailService.getAllPositionTravailByRestaurant().subscribe(
      (data: PositionTravailModel[]) => {
        this.listePositionTravail = data;
        this.getListBesoinImposeByRestaurant();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  private fillAvailablePositionTravail() {
    this.listeAvailablePositionTravail = [];
    let found = false;
    this.listePositionTravail.forEach(item => {
      found = false;
      this.listeUsedPositionTravail.forEach(usedItem => {
        if (usedItem.idPositionTravail === item.idPositionTravail) {
          found = true;
        }
      });
      if (!found) {
        this.listeAvailablePositionTravail.push(item);
      }
    });
  }

  private onReadyInitDrag() {
    interact('.td-drop-zone').unset();
    interact('.btn-delete').unset();
    interact('.position-card').unset();

    interact.dynamicDrop(true);

    let resetToInitial = true; // si l'utilisateur-restaurant lâche le souris à mis chemin, on remet le card à sa place
    // enable draggables to be dropped into this drop zones
    interact('.td-drop-zone').dropzone({
      // only accept elements matching this CSS selector
      accept: '.position-card',
      // Require a 50% element overlap for a drop to be possible
      overlap: 'pointer',

      // listen for drop related events:
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
      },
      ondrop: (event) => {
        // si on lache la souris
        resetToInitial = false;
        this.dropPosCard(event);
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');

        // on doit remettre le card à sa place d'origine si l'utilisateur-restaurant à lacher à mis chemin
        if (resetToInitial) {
          event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';
          // reset the posiion attributes
          event.relatedTarget.setAttribute('data-x', 0);
          event.relatedTarget.setAttribute('data-y', 0);
        }
      }
    });


    // enable draggable employee to be dropped into this to be deleted
    interact('.btn-delete').dropzone({
      // only accept elements matching this CSS selector
      // accept: '.employee-draggable',
      accept: '.position-card',
      // Require a 50% element overlap for a drop to be possible
      overlap: 'pointer',

      // listen for drop related events:
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
      },
      ondrop: (event) => {
        // quand on lache le card sur la drop zone du bouton supprimer, on supprime alors le card après affichage du message de confirmation
        resetToInitial = false;
        if (event.relatedTarget.classList.contains('position-card')) {
          this.showConfirmDeletePositionCard(event, 'dragAndDrop'); // suppression du card du shift : onglet 'shift fixe'
// suppression du card du poste : onglet 'Besoins imposés'
        }
        // on remet le card à sa position en attendant le onfirmation de l'utilisateur-restaurant pour la suppression
        event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';

        // reset the posiion attributes
        event.relatedTarget.setAttribute('data-x', 0);
        event.relatedTarget.setAttribute('data-y', 0);
      },
      ondropdeactivate: (event) => {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');

        // si on doit remettre le card à sa place d'origine
        if (resetToInitial) {
          event.relatedTarget.style.transform = event.relatedTarget.style.webkitTransform = 'translate(0, 0)';

          // reset the posiion attributes
          event.relatedTarget.setAttribute('data-x', 0);
          event.relatedTarget.setAttribute('data-y', 0);
        }
        this.updateBesoinImposeRowsInterface();
      }
    });

    // initialiser les draggable shifts : cette fonction permet de rendre les cards déplaçable à la souris
    interact('.position-card').draggable({
      // enable inertial throwing
      inertia: false,
      autoScroll: {
        container: document.getElementById('planningBesoinImpose'),
        speed: 150
      },
      // call this function on every dragmove event

      onstart(event) {
        const target = event.target;
        const position = target.getBoundingClientRect();
        const shiftPositionCard = document.querySelector('.position-card') as HTMLElement;
        const widthOfShift = shiftPositionCard.offsetWidth;
        target.style.position = 'fixed';
        target.style.top = position.top + 'px';
        target.style.width = widthOfShift + 'px';
        target.style.zIndex = '99';
      },
      // call this function on every dragmove event
      onmove: (event) => {
        resetToInitial = true;
        this.dragMoveListener(event); // s'exécute à chaque déplacement pour que le card suit la souris
      },
      // call this function on every dragend event
      onend: function (event) {
        event.target.classList.remove('moving-active'); // enlever la class css 'moving-active' qui permet de rendre le card transparent au moment du déplacement
        if (resetToInitial) {
          event.target.style.position = 'static';
        }
      }
    });
  }

  private updateBesoinImposeRowsInterface(): void {
    this.planningFixedRows.forEach(planningFixedRows => planningFixedRows.checkChangeDetection());
  }

  /**
   * Ajouter ou modifier une nouvelle card de poste
   * @param: cardDetails
   */
  public addNewPositionCard(cardDetails: BesoinImposeModel) {
    this.besoinsImposeeToSave = {...cardDetails};
    this.besoinsImposeeToSave.day = this.daysOfWeek.find(day => day.name === this.besoinsImposeeToSave.jourSemaine.toUpperCase()).day;
    if (cardDetails.idBesoinImpose && cardDetails.idBesoinImpose !== 0) {
      // update
      this.updateBesoinImpose();
    } else {
      // add new
      this.addNewBesoinImpose();
    }

    this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
  }

  private updateBesoinImpose() {
    this.besoinsImposeeToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
    this.updateBesoinImposeAfterSave();
  }

  private addNewBesoinImpose() {
    this.besoinsImposeeToSave.restaurant = this.sharedRestaurant.selectedRestaurant;
    this.setNewBesoinImposeToListBesoinImpose();
  }

  /**
   * Permet de gérer le déplacements des cards des postes
   * @param: event
   */
  dropPosCard(event) {
    const draggableElement = event.relatedTarget;
    const dropzoneElement = event.target;
    let idBesoinImpose = draggableElement.getAttribute('data-idBesoinImpose');
    if (!isNaN(Number(draggableElement.getAttribute('data-idBesoinImpose')))) {
      idBesoinImpose = parseInt(draggableElement.getAttribute('data-idBesoinImpose'), 10); // ordre du card dans la journée initial
    }
    const oldDayZone = draggableElement.getAttribute('data-cardDay'); // ancienne journée à laquelle appartient la card
    const newDayZone = dropzoneElement.getAttribute('data-day'); // nouvelle journée dans laquelle on veut déplacer la card
    const oldPoste = parseInt(draggableElement.getAttribute('data-posteIndex'), 10); // poste initial de la card
    const newPoste = parseInt(dropzoneElement.parentElement.getAttribute('data-posteIndex'), 10); // nouveau poste du card
    const besoinImposeToMove = this.listBesoinImpose.find(besoin => besoin.idBesoinImpose === idBesoinImpose);
    const endTime = this.finJourneeActivite['valeur' + newDayZone];


    // Get the first newDayZone in the month
    const newDate = new Date();
    newDate.setDate(1);
    while (newDate.getDay() !== this.daysOfWeek.find(value => value.name === newDayZone.toUpperCase()).day) {
      newDate.setDate(newDate.getDate() + 1);
    }
    const nextDate = new Date(newDate.getTime() + 86400000);
    let dayAfterNewDate: string = this.dateService.getJourSemaine(nextDate);
    dayAfterNewDate = dayAfterNewDate.charAt(0) + dayAfterNewDate.substring(1).toLowerCase();
    const starNextDaytTime = this.debutJourneeActivite['valeur' + dayAfterNewDate];


    // drop only if day is different
    if ((oldDayZone !== newDayZone || oldPoste !== newPoste) && this.updateButtonControl()) {

      if (besoinImposeToMove.acheval && endTime !== starNextDaytTime) {
        // reset the card to the initial place
        draggableElement.style.transform = draggableElement.style.webkitTransform = 'translate(0, 0) ';
        // reset the posiion attributes
        draggableElement.setAttribute('data-x', 0);
        draggableElement.setAttribute('data-y', 0);
      } else {
               const cardDropInfos = {
                 idBesoinImpose: idBesoinImpose,
                 oldDayZone: oldDayZone,
                 newDayZone: newDayZone,
                 oldPoste: oldPoste,
                 newPoste: newPoste,
                 acheval: besoinImposeToMove.acheval
               };
        // exécuter le déplacement du card dans l'interface
        if ((navigator.platform === 'MacIntel' && (<KeyboardEvent>window.event).metaKey) || (<KeyboardEvent>window.event).ctrlKey) {
          this.copieBesoinImpose(cardDropInfos);
        } else {
          this.movePosCard(cardDropInfos);
        }
        draggableElement.style.transform = draggableElement.style.webkitTransform = 'translate(0, 0)';
      }
    } else {
      // reset the card to the initial place
        draggableElement.style.transform = draggableElement.style.webkitTransform = 'translate(0, 0)';

      // reset the posiion attributes
      draggableElement.setAttribute('data-x', 0);
      draggableElement.setAttribute('data-y', 0);
    }
  }

  /**
   * modifier  besoin impose dans la list  et dans la map par poste
   * recuperer la list que on va enregistrer (listBesoinImposeToUpdate)
   */
  private updateBesoinImposeAfterSave() {
    const collection: BesoinImposeModel[] = this.besoinImposeByPosteTravail.get(this.besoinsImposeeToSave.positionTravail.idPositionTravail);

    const indexShiftToUpdateBesoinImposeByEmployee = collection.findIndex(besoin => besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose);
    if (collection[indexShiftToUpdateBesoinImposeByEmployee].acheval && collection[indexShiftToUpdateBesoinImposeByEmployee].shiftAchevalHidden) {
      collection.splice(indexShiftToUpdateBesoinImposeByEmployee, 1);
    } else if (collection[indexShiftToUpdateBesoinImposeByEmployee].acheval) {
      const lastIndexShiftToUpdateBesoinImposeByEmployee = collection.map(value => value.idBesoinImpose).lastIndexOf(this.besoinsImposeeToSave.idBesoinImpose);
      collection.splice(lastIndexShiftToUpdateBesoinImposeByEmployee, 1);
    }
    collection[indexShiftToUpdateBesoinImposeByEmployee] = this.besoinsImposeeToSave;

    const indexShiftToUpdateInListBesoinImpose = this.listBesoinImpose.findIndex(besoin => besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose);
    this.updateListBesoinImpose(indexShiftToUpdateInListBesoinImpose, this.listBesoinImpose);
    const indexBesoinImposeToUpdate = this.listBesoinImposeToUpdate.findIndex(besoin => besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose);
    this.updateListBesoinImpose(indexBesoinImposeToUpdate, this.listBesoinImposeToUpdate);
    this.listBesoinImposeToUpdate = this.listBesoinImposeToUpdate.filter(besoin => !besoin.shiftAchevalHidden);
    this.besoinsImposeeToSave = null;
  }

  /**
   * modifier la list de besoin imposee
   * @param: indexBesoinImposeToUpdate
   * @param: list
   */
  private updateListBesoinImpose(indexBesoinImposeToUpdate: number, list: any): void {
    indexBesoinImposeToUpdate = list.findIndex(besoin => besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose);
    if (indexBesoinImposeToUpdate !== -1) {
      list.splice(indexBesoinImposeToUpdate, 1);
    }
    indexBesoinImposeToUpdate = list.findIndex(besoin => besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose);
    if (indexBesoinImposeToUpdate !== -1) {
      list.splice(indexBesoinImposeToUpdate, 1);
    }
    list.push({...this.besoinsImposeeToSave});
    if (this.besoinsImposeeToSave.acheval) {
      list.push(this.duplicateBesoinAcheval({...this.besoinsImposeeToSave}));
      this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
      this.listeUsedPositionTravail = [];
      this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);
    }

  }

  /**
   * Ajout poste en cours : on affiche le formulaire contenant la selectbox
   * @param: event
   */
  positionAdded(event) {
    const postTravailToAdd = this.listePositionTravail.findIndex(post => post.idPositionTravail === event.idPositionTravail);
    this.listeUsedPositionTravail[this.listeUsedPositionTravail.length - 1] = this.listePositionTravail[postTravailToAdd];
    this.besoinImposeByPosteTravail.set(this.listePositionTravail[postTravailToAdd].idPositionTravail, []);
    this.fillAvailablePositionTravail();
  }

  /**
   * permet de savegarder la ligne Poste selectionnée pour la suppression
   * @param: event
   */
  updateSelectedPosRow(event) {
    this.selectedPostTravail = event;
  }

  /**
   * message de confirmation de suppression d'une card dans l'onglet 'Besoins imposés'
   * @param: event
   */
  showConfirmDeletePositionCard(event, filter?) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        // l'utilisateur-restaurant accepte la suppression
        if (!filter) {
          this.deletePosCard(event);
        } else {
          const draggableElement = event.relatedTarget;
          const idBesoinImposeToDelete = draggableElement.getAttribute('data-idBesoinImpose'); // ancienne journée à laquelle appartient la card
          this.deletePosCard(idBesoinImposeToDelete);
          event.relatedTarget.classList.remove('moving-active');

        }

      },
      reject: () => {
        // enlever la transparence de la card
        event.relatedTarget.classList.remove('moving-active');
      }
    });
  }

  /**
   * suppression d'une card de poste
   * @param: event
   */
  deletePosCard(event) {
    let indexBesoinImposeeToDeleteInListUpdateShiftFixe;

    if (!isNaN(Number(event))) {
      event = +event;
    }
    this.listBesoinImpose.forEach((besoin, index) => {
      if (besoin.idBesoinImpose === event) {
        this.besoinImposeByPosteTravail.get(this.listBesoinImpose[index].positionTravail.idPositionTravail).splice(this.besoinImposeByPosteTravail.get(this.listBesoinImpose[index].positionTravail.idPositionTravail).findIndex(besoinImposee => besoinImposee.idBesoinImpose === event), 1);
        const collection = this.besoinImposeByPosteTravail.get(this.listBesoinImpose[index].positionTravail.idPositionTravail);
        if (!collection) {
          this.fillAvailablePositionTravail();
        }
        this.listBesoinImpose.splice(index, 1);
        if (!isNaN(Number(event))) {
          this.listIdBesoinImposeToDelete.push(besoin.uuid);
        }
      }
    });

    if (this.listBesoinImposeToUpdate.length > 0) {
      indexBesoinImposeeToDeleteInListUpdateShiftFixe = this.listBesoinImposeToUpdate.findIndex(besoin => besoin.idBesoinImpose === event);
      if (indexBesoinImposeeToDeleteInListUpdateShiftFixe !== -1) {
        this.listBesoinImposeToUpdate.splice(indexBesoinImposeeToDeleteInListUpdateShiftFixe, 1);
      }
    }
    this.updateBesoinImposeRowsInterface();
  }

  /**
   * message de suppression
   */
  private displaySuccessDeleteMessage() {
    this.notificationService.showInfoMessage('BIMPOSE.DELETE_SUCCESS', 'BIMPOSE.DELETE_INFORMATION');
  }

  /**
   * ajouter besoin dans la list de besoin et dans la map  par position
   * @param :data
   */
  private setNewBesoinImposeToListBesoinImpose() {

    this.besoinsImposeeToSave.idBesoinImpose = this.makeString();
    this.listBesoinImpose.forEach(besoin => {
      if (besoin.idBesoinImpose === this.besoinsImposeeToSave.idBesoinImpose) {
        this.setNewBesoinImposeToListBesoinImpose();
      }
    });
    const collection = this.besoinImposeByPosteTravail.get(this.besoinsImposeeToSave.positionTravail.idPositionTravail);
    if (!collection) {
      this.besoinImposeByPosteTravail.set(this.besoinsImposeeToSave.positionTravail.idPositionTravail, [this.besoinsImposeeToSave]);
      this.fillAvailablePositionTravail();
    } else {
      collection.push(this.besoinsImposeeToSave);
    }
    const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(this.besoinsImposeeToSave.jourSemaine), true);
    this.besoinsImposeeToSave.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));
    this.listBesoinImpose.push({...this.besoinsImposeeToSave});
    this.listBesoinImposeToUpdate.push({...this.besoinsImposeeToSave});
    this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
    if (this.besoinsImposeeToSave.acheval) {
      this.listBesoinImpose.push(this.duplicateBesoinAcheval(this.besoinsImposeeToSave));
    }

    this.listeUsedPositionTravail = [];
    this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);

    this.besoinsImposeeToSave = null;

  }

  /**
   * déplacer le card entre les deux zone de jours différentes
   * @param: movedCardInfos
   */
  public movePosCard(movedCardInfos: any): void {

    if (movedCardInfos.acheval) {
      const indexDuplicatedBesoin = this.listBesoinImpose.findIndex(besoin =>
        besoin.idBesoinImpose === movedCardInfos.idBesoinImpose && besoin.shiftAchevalHidden);
      this.listBesoinImpose.splice(indexDuplicatedBesoin, 1);
      this.listeUsedPositionTravail = [];
      this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);
    }

    const indexBesoinImposeToMove = this.listBesoinImpose.findIndex(besoin => besoin.idBesoinImpose === movedCardInfos.idBesoinImpose);
    this.listBesoinImpose[indexBesoinImposeToMove].day = this.daysOfWeek.find(day => day.name === movedCardInfos.newDayZone.toUpperCase()).day;
    // update position travail
    const indexNewPostTravail = this.listePositionTravail.findIndex(postTrav => postTrav.idPositionTravail === movedCardInfos.newPoste);
    if (indexNewPostTravail !== -1) {
      this.listBesoinImpose[indexBesoinImposeToMove].positionTravail = this.listePositionTravail[indexNewPostTravail];
    }
    // update day
    this.listBesoinImpose[indexBesoinImposeToMove].jourSemaine = movedCardInfos.newDayZone.toUpperCase();
    // mettre a jour la map
    this.besoinImposeByPosteTravail.get(movedCardInfos.oldPoste).splice(this.besoinImposeByPosteTravail.get(movedCardInfos.oldPoste).findIndex(besoin => besoin.idBesoinImpose === movedCardInfos.idBesoinImpose), 1);
    this.besoinImposeByPosteTravail.get(movedCardInfos.newPoste).push(this.listBesoinImpose[indexBesoinImposeToMove]);

    const indexBesoinImposeToUpdate = this.listBesoinImposeToUpdate.findIndex(besoin => besoin.idBesoinImpose === this.listBesoinImpose[indexBesoinImposeToMove].idBesoinImpose);
    if (indexBesoinImposeToUpdate !== -1) {
      this.listBesoinImposeToUpdate[indexBesoinImposeToUpdate] = {...this.listBesoinImpose[indexBesoinImposeToMove]};
    } else {
      this.listBesoinImposeToUpdate.push({...this.listBesoinImpose[indexBesoinImposeToMove]});
    }
    if (movedCardInfos.acheval) {
      this.listBesoinImpose.push(this.duplicateBesoinAcheval({...this.listBesoinImpose[indexBesoinImposeToMove]}));
      this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
      this.listeUsedPositionTravail = [];
      this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);
    }

  }

  /**
   *  Si l’utilisateur maintient la touche Ctrl appuyer tous le long du drag&drop (appuyer à la sélection et au relâchement du shift),
   *  il faut permettre de copier un shift lors d’un drag&drop
   * @param: copieCardInfos
   */
  private copieBesoinImpose(copieCardInfos: any): void {
    let besoinImposeCopy: any;
    let besoinImpose = {} as BesoinImposeModel;
    const indexBesoinImposeToMove = this.listBesoinImpose.findIndex(besoin => besoin.idBesoinImpose === copieCardInfos.idBesoinImpose);
    this.besoinImposeByPosteTravail.get(copieCardInfos.oldPoste).splice(this.besoinImposeByPosteTravail.get(copieCardInfos.oldPoste).findIndex(besoin => besoin.idBesoinImpose === copieCardInfos.idBesoinImpose), 1);
    // update position travail
    const indexNewPostTravail = this.listePositionTravail.findIndex(postTrav => postTrav.idPositionTravail === copieCardInfos.newPoste);
    besoinImposeCopy = {...this.listBesoinImpose[indexBesoinImposeToMove]};
    besoinImposeCopy.idBesoinImpose = this.makeString();
    besoinImposeCopy.positionTravail = this.listePositionTravail[indexNewPostTravail];
    besoinImposeCopy.jourSemaine = copieCardInfos.newDayZone.toUpperCase();
    besoinImposeCopy.day = this.daysOfWeek.find(day => day.name === besoinImposeCopy.jourSemaine.toUpperCase()).day;
    besoinImpose = {...this.listBesoinImpose[indexBesoinImposeToMove]};
    this.listBesoinImpose.push(besoinImposeCopy);
    this.besoinImposeByPosteTravail.get(copieCardInfos.oldPoste).push(besoinImpose);
    this.besoinImposeByPosteTravail.get(copieCardInfos.newPoste).push(besoinImposeCopy);
    this.listBesoinImposeToUpdate.push({...besoinImposeCopy});
    if (copieCardInfos.acheval) {
      this.listBesoinImpose.push(this.duplicateBesoinAcheval({...besoinImposeCopy}));
      this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
      this.listeUsedPositionTravail = [];
      this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);
    }
  }

  /**
   *  créer une nouvelle ligne Poste
   */
  public newPoste() {
    if (this.listeAvailablePositionTravail.length !== 0) {
      this.listeUsedPositionTravail.push(new PositionTravailModel());
    }
  }

  /**
   * afficher le message de confirmation de supression d'une ligne entière
   */
  public showConfirmDeleteRow() {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        if (this.selectedPostTravail && this.selectedPostTravail.idPositionTravail === 0) {
          this.listeUsedPositionTravail.splice(this.listeUsedPositionTravail.length - 1, 1);
          this.selectedPostTravail = undefined;
        }
        if (this.selectedPostTravail && this.selectedPostTravail.idPositionTravail !== 0) {
          this.deleteAllBesoinImposeByIdPositionTravail();
        }

      }
    });
  }

  // action to save and export the plannings to the corresponfing service
  public save() {
    let autorizeDeleteBesoinImpose = true;
    let autorizeDeleteBesoinImposeByPosition = true;
    this.listBesoinImposeToUpdate.forEach(besoin => {
      if (isNaN(Number(besoin.idBesoinImpose))) {
        besoin.idBesoinImpose = 0;
        delete besoin.uuid;
      }
      besoin.restaurant = this.sharedRestaurant.selectedRestaurant;
    });
    if (this.listIdBesoinImposeToDelete.length === 0) {
      this.listIdBesoinImposeToDelete.push('0');
      autorizeDeleteBesoinImpose = false;
    }
    if (this.listBesoinImposeByPositionToDelete.length === 0) {
      this.listBesoinImposeByPositionToDelete.push('0');
      autorizeDeleteBesoinImposeByPosition = false;
    }
    if (this.listBesoinImposeToUpdate.length > 0 || (autorizeDeleteBesoinImpose && autorizeDeleteBesoinImposeByPosition)
      || (autorizeDeleteBesoinImpose && !autorizeDeleteBesoinImposeByPosition)
      || (!autorizeDeleteBesoinImpose && autorizeDeleteBesoinImposeByPosition)) {
      this.notificationService.startLoader();
      this.besoinImposeService.updateListBesoinImpose(this.listBesoinImposeToUpdate, this.listIdBesoinImposeToDelete, this.listBesoinImposeByPositionToDelete).subscribe(
        (data: BesoinImposeModel[]) => {
          this.notificationService.stopLoader();
          this.setListBesoinImposeAfterSave(data);
        },
        (err) => {
          this.notificationService.stopLoader();
          // TODO notify of error
          console.log('error');
          console.log(err);
        }
      );
    } else {
      this.listIdBesoinImposeToDelete = [];
      this.listBesoinImposeByPositionToDelete = [];

    }
  }

  /**
   * verification s'il y a changement de besoin
   * save list besoin, suppression besoin ,suppression list besoin
   *
   */
  public canDeactivate(): boolean {
    let canSave = true;
    let autorizeDeleteBesoinImpose = true;
    let autorizeDeleteBesoinImposeByPosition = true;
    this.listBesoinImposeToUpdate.forEach(besoin => {
      if (isNaN(Number(besoin.idBesoinImpose))) {
        besoin.idBesoinImpose = 0;
        delete besoin.uuid;
      }
      besoin.restaurant = this.sharedRestaurant.selectedRestaurant;
    });
    if (this.listIdBesoinImposeToDelete.length === 0) {
      this.listIdBesoinImposeToDelete.push('0');
      autorizeDeleteBesoinImpose = false;
    }
    if (this.listBesoinImposeByPositionToDelete.length === 0) {
      this.listBesoinImposeByPositionToDelete.push('0');
      autorizeDeleteBesoinImposeByPosition = false;
    }
    if (this.listBesoinImposeToUpdate.length > 0 || (autorizeDeleteBesoinImpose && autorizeDeleteBesoinImposeByPosition)
      || (autorizeDeleteBesoinImpose && !autorizeDeleteBesoinImposeByPosition)
      || (!autorizeDeleteBesoinImpose && autorizeDeleteBesoinImposeByPosition)) {
      canSave = false;
    }
    return canSave;
  }

  /**
   * ajouter list de besoin apres save
   * @param: data
   */
  private setListBesoinImposeAfterSave(data: BesoinImposeModel[]) {
    this.listBesoinImpose = this.listBesoinImpose.filter(besoin => !besoin.shiftAchevalHidden);
    if (data.length > 0) {
      data.forEach(item => {
        const dayShiftDisplay = this.getDayOfShiftAcheval(this.clone(item.jourSemaine), true);
        item.shiftInLastWeek = this.checkShiftInlastWeek(this.dateService.getIntegerValueFromJourSemaine(dayShiftDisplay));

        this.setCorrectTimeToDisplay(item);
        this.listBesoinImpose.push(item);

      });
    }
    for (let i = 0; i < this.listBesoinImpose.length; i++) {
      if (isNaN(Number(this.listBesoinImpose[i].idBesoinImpose))) {
        if (this.listBesoinImpose[i].shiftAchevalHidden !== false) {
          this.listBesoinImpose.splice(i, 1);
          i--;
        }
      }
    }
    const besoinImposeSet = new Set();
    // removing-duplicates-in-an-array
    this.listBesoinImpose = this.listBesoinImpose.filter(besoin => {
      const duplicate = besoinImposeSet.has(besoin.idBesoinImpose);
      besoinImposeSet.add(besoin.idBesoinImpose);
      return !duplicate;
    });
    this.listBesoinImpose.forEach((besoin: BesoinImposeModel) => {
      if (besoin.acheval) {
        this.listBesoinImpose.push(this.duplicateBesoinAcheval({...besoin}));
      }
    });
    this.sortListBesoinByShiftAcheval(this.listBesoinImpose);
    this.listeUsedPositionTravail = [];
    this.besoinImposeByPosteTravail = this.groupBesoinByPosteTravail(this.listBesoinImpose, besoinDisplay => besoinDisplay.positionTravail.idPositionTravail);

    this.fillAvailablePositionTravail();
    this.displaySuccesSauvegardeMessage();
    this.listBesoinImposeToUpdate = [];
    this.listIdBesoinImposeToDelete = [];
    this.listBesoinImposeByPositionToDelete = [];

  }

  /**
   * s'éxécute à chaque déplacement du pointeur de la souris afin de déplacer le card avec et activer les drop zone correspondantes
   * @param: event
   */
  dragMoveListener(event) {
    let target = event.target, // card en cours de déplacement
      // keep the dragged position in the data-x/data-y attributes : changer les coordonnées de la card avec ceux de la souris
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.classList.add('moving-active'); // ajouter la classe css qui permet de créer l'effet de transparence
  }

  /**
   * meesage de sauvegarde besoin imposé
   */
  private displaySuccesSauvegardeMessage() {
    this.notificationService.showSuccessMessage('BIMPOSE.SAVED_INFORMATIONS', 'BIMPOSE.BESOIN_IMPOSE');
  }

  private getHeureLimite() {
    const limiteHeureDebut = 'Début de journée d\'activité';
    this.periodeManagerService.getHeureLimite(limiteHeureDebut).subscribe(
      (data: any) => {
        this.limiteHeureDebut = this.dateService.setTimeFormatHHMM(data.value);
        if (data.night) {
          this.limiteHeureDebut.setDate(this.limiteHeureDebut.getDate() + 1);
        }
      },
      (err) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  public checkIfNightValue() {
    this.setNightValue = null;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.setNightValue = true;
      },
      reject: () => {
        this.setNightValue = false;
      }
    });
  }

  /**
   * set value to id besoin
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  private deleteAllBesoinImposeByIdPositionTravail() {

    const indexPostTravailToDelete = this.listeUsedPositionTravail.findIndex(post => post.idPositionTravail === this.selectedPostTravail.idPositionTravail);
    this.listeUsedPositionTravail.splice(indexPostTravailToDelete, 1);
    if (this.besoinImposeByPosteTravail.get(this.selectedPostTravail.idPositionTravail)) {
      this.besoinImposeByPosteTravail.delete(this.selectedPostTravail.idPositionTravail);
    }

    this.listBesoinImposeByPositionToDelete.push(this.selectedPostTravail.uuid);
    if (this.listBesoinImposeToUpdate.length > 0) {
      for (let i = 0; i < this.listBesoinImposeToUpdate.length; i++) {
        if (this.listBesoinImposeToUpdate[i].positionTravail.idPositionTravail === this.selectedPostTravail.idPositionTravail) {
          if (!isNaN(Number(this.listBesoinImposeToUpdate[i].idBesoinImpose))) {
            // supprimer les besoins qui se trouvent ds la bd avec un autre position
            this.listIdBesoinImposeToDelete.push(this.listBesoinImposeToUpdate[i].uuid);
          }
          // supprimer les  besoins qui se trouvent da list que on va enregistrer ds la bd
          this.listBesoinImposeToUpdate.splice(i, 1);
          i--;
        }
      }
    }
    if (this.listBesoinImpose.length > 0) {
      for (let i = 0; i < this.listBesoinImpose.length; i++) {
        if (this.listBesoinImpose[i].positionTravail.idPositionTravail === this.selectedPostTravail.idPositionTravail) {
          this.listBesoinImpose.splice(i, 1);
          i--;
        }
      }
    }

    this.fillAvailablePositionTravail();

  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.save();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * methode excecute after init
   */
  reCalculeHeight() {
    this.cdRef.detectChanges();
    const windowHeight = window.innerHeight;
    this.contentHeightPlanning = windowHeight - 270;
  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.reCalculeHeight();
  }

  /**
   * list clicked Condense
   */
  public btnListBesoins() {
    this.listBesoinsCondense = !this.listBesoinsCondense;
    this.stylelistBesoinCondense = !this.stylelistBesoinCondense;
  }

  /**
   * Cette méthode permet d'identifier la fin/début activité de la journée
   */
  private getStartTimeAndEndTimeFromDecoupageHoraire(dayName: string): void {
    const key = dayName[0] + dayName.substring(1).toLowerCase();
    // Extract open/close hour based on the created key
    this.startTime = this.debutJourneeActivite['valeur' + key];
    this.startTimeIsNight = this.debutJourneeActivite['valeur' + key + 'IsNight'];
    this.endTime = this.finJourneeActivite['valeur' + key];
    this.endTimeIsNight = this.finJourneeActivite['valeur' + key + 'IsNight'];

  }

  /**
   * Cette methode permet de retourner le découpage horaire d'un restaurant
   */
  private async getDecoupageHoraire() {
    this.finJourneeActivite = await this.decoupageHoraireService.getFinJourneePhase().toPromise();
    this.debutJourneeActivite = await this.decoupageHoraireService.getDebutJourneePhase().toPromise();
    this.decoupageHoraireFinEtDebutActivity = {debutJournee: this.debutJourneeActivite, finJournee: this.finJourneeActivite};
  }

  /**
   * verifier si le journée de shift est egual à derniere jour de la semaine
   * @param: day
   */
  private checkShiftInlastWeek(day: number): boolean {
    return this.firstDayAsInteger === day;
  }

  /**
   * ajouter journée pour le shift
   * @param: dayShift
   * @param: addDays
   */
  private getDayOfShiftAcheval(dayShift: JourSemaine, addDays?: boolean): JourSemaine {
    let day;
    const numJour = this.dateService.getIntegerValueFromJourSemaine(dayShift);
    if (!addDays) {
      day = numJour > 0 ? numJour - 1 : 0;
    } else {
      day = numJour < 6 ? numJour + 1 : 0;

    }
    dayShift = this.dateService.getJourSemaineFromInteger(day);

    return dayShift;

  }

  hideDropDown() {
    const elems = document.querySelectorAll('.show');
    elems.forEach( (el) => {
      el.classList.remove('show');
    });
  }

}
