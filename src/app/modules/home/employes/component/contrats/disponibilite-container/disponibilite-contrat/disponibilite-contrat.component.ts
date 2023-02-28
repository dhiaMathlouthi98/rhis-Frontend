import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {JourDisponibiliteModel} from '../../../../../../../shared/model/jourDisponibilite.model';
import {DisponibiliteConfigModel} from '../../../../../../../shared/model/disponibilite-config.model';
import {ContratUtilitiesService} from '../../../../service/contrat-utilities.service';
import {GlobalSettingsService} from '../../../../../../../shared/service/global-settings.service';
import {ParametreGlobalService} from '../../../../../configuration/service/param.global.service';
import {DateService} from '../../../../../../../shared/service/date.service';

declare var interact;

@Component({
  selector: 'rhis-disponibilite-contrat',
  templateUrl: './disponibilite-contrat.component.html',
  styleUrls: ['./disponibilite-contrat.component.scss']
})

export class DisponibiliteContratComponent implements OnInit {

  @Input()
  set prefix(val) {
    this.availabilityPrefix = val;
  }

  @Input()
  public openningHours: { day: string, value: string }[];
  @Input()
  public closureHours: { day: string, value: string }[];

  @Input()
  public set id(val) {
    this.contratId = val;
  }

  @Input()
  public set data(availibilities: []) {
    if (availibilities) {
      this.initialData = availibilities;
      this.dispoHebdo = this.contratUtilitiesService.getTotalDispoHebdo(this.initialData);
      this.dispoDays = this.contratUtilitiesService.getTotalDispoPerDay(this.initialData);
    }
  }

  @Input()
  set disponibiliteConfig(config: DisponibiliteConfigModel) {
    if (config) {
      this.config = config;
      if (config.minShift) {
        this.nbr5minForMinShift = this.getNbr5MinForMinShift(config.minShift);
      }
      this.weekDays = config.weekDays;
      this.openningHour = config.openHour;
      this.closureHour = config.closeHour;
      this.maxDispoDay = config.maxDispoDay;
      this.maxDispoWeek = config.maxDispoWeek;
      if (this.openningHour && this.closureHour) {
        this.setOpeningClosingDates();
      }
      if (this.initialData && this.isValidDisponibiliteConfig(config) && this.availabilityPrefix) {
        if (this.initialData.length) {
          this.availabilityData = this.setDisponibilites(this.initialData);
        }
        this.addNonAvailabilitiesSlots();
        if (this.idTimeOut) {
          clearTimeout(this.idTimeOut);
        }
        this.idTimeOut = setTimeout(() => {
            // réinitialiser et recalculer la taille des shifts ainsi que les différents paramètres comme
            // shiftMinSize qui dépendent de la largeur de l'écran
            this.initSizes();
            this.onReadyInit();
          }
          , 500);
      }
    }
  }

  @Input()
  public set updatedId(val) {
    this.contratUpdateId = val;
  }

  @Input()
  private isOdd: boolean;

  @Output()
  currentDispo = new EventEmitter();
  @Output()
  confirmUpdateDispoSetValue = new EventEmitter();

  @Input()
  public set hebdo(contratHebdo: number) {
    this.contratHebdo = contratHebdo || 0;
  }

  @Input()
  public set partialTime(isPartialTime: boolean) {
    this.isPartialTime = isPartialTime;
  }

  public availabilityPrefix: string;
  public initialData;
  public availabilityData: any[] = [];
  public openningHour: string;
  public closureHour: string;
  public start: Date;
  public end: Date;

  public weekDays: [];
  public contratId;
  public config: DisponibiliteConfigModel;
  private idTimeOut;
  private contratUpdateId;
  public nbr5minForMinShift: number; // it's the number of 5 min in 2 hours
  availableAllDayCheckbox: boolean[] = [false, false, false, false, false, false, false];
  sameAvailabilityCheckbox = false;
  availabilityContainerWidth = 960; // default max width
  stepSize = 4; // default step Size
  nbrStep5 = 0;
  public dispoHebdo = 0;
  public dispoDays: { day: string, value: number; }[] = [];
  public maxDispoDay: number;
  public maxDispoWeek: number;
  public contratHebdo = 0;
  public isPartialTime: boolean;
  public contratDispoHebdoRate = 0;
  fiveMinutesTime = 300000; // number of milliseconds in 5 minutes
// la durée minimal d'un shift en minutes : par défaut c'est 2 heures
// la durée minimal d'un shift en minutes : par défaut c'est 2 heures
  shiftMinSize = 96; // en pixel (correspond à 2 heures suivant paramètrage : (120 minutes / 5) * 4px = 96)
  // max availabilities we can create for one day
  maxAvailabilitiesByDay = 3;

  // this object contain informations about new left and right element creation
  // so we can decide to reset or not the sizes of shifts depending on shiftMinSize
  leftRightNewElementParams: any = {
    leftRightPadResize: 0,
    lastResizedElement: null,
    lastElementIsCreated: false
  };

  // this object contain informations about the inner elements being resized
  // so we can decide to reset or not the sizes of elements depending on shiftMinSize
  innerElementResizeParams: any = {
    lastResizedElement: null,
    resizedElementIsRemoved: false,
    fromLeft: false,
    fromRight: false
  };
  public dispoScrollable = false;
  public menuState = false;

  constructor(private contratUtilitiesService: ContratUtilitiesService,
              private parametreGlobalService: ParametreGlobalService,
              private globalSettings: GlobalSettingsService,
              private dateService: DateService) {
  }

  public ngOnInit(): void {
    this.menuState = this.globalSettings.menuIsOpen;
    this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
    this.globalSettings.onToggleMenu().subscribe(menuState => {
      this.menuState = menuState;
      if (!this.menuState) {
        setTimeout(() => {
          this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
        }, 500);
      } else {
        this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
      }
    });
    this.getDisponibiliteHebdoRateParameter();
  }

  private isValidDisponibiliteConfig(config: DisponibiliteConfigModel): boolean {
    return config && config.openHour && config.closeHour && config.minShift && config.weekDays && config.weekDays.length;
  }

  private async getDisponibiliteHebdoRateParameter(): Promise<void> {
    const parameter = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter('AVAIL_CONTRACT_RATE').toPromise();
    if (!Number.isNaN(+parameter.valeur)) {
      this.contratDispoHebdoRate = parameter.valeur;
    }
  }

  public getRatio(dispoHebdo: number, contratHebdo: number): number {
    return Math.round((dispoHebdo / contratHebdo) * 100);
  }

  public getDayDispo(day: string, dispoDays: { day: string, value: number }[]): number {
    if (dispoDays && dispoDays.length) {
      return dispoDays.find((dispoDay: { day: string, value: number }) => dispoDay.day === day).value;
    }
    return 0;
  }

  private getConcernedDay(day: string, weekDays: Array<{day: string, val: string}>): string {
    if (weekDays && weekDays.length) {
      const concernedDay: { day: string, val: string } = weekDays.find((weekDay: { day: string, val: string }) => weekDay.day === day);
      if (concernedDay) {
        return concernedDay.val;
      }
    }
    return null;
  }
  /**
   Ce listner permet d'écouter les changement sur la taille du navigateur lors d'une action de redimensionnement, afin de mettre
   à jour et recalculer les tailles des slots
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
  }

  /**
   * cette fonction permet de parcourir le tableau de disponibilité et de mettre à jour des heures
   * afin d'être prêt pour l'exportation vers le service
   */
  private updateAvailabilitiesData() {
    let dayIndex = 0;
    this.availabilityData.forEach((day) => {
      let dayElement = document.getElementById(this.availabilityPrefix + '-day-' + dayIndex);
      let dayElementSlots = dayElement.querySelectorAll('.green');
      // empty the availabilities and insert new ones
      this.availabilityData[dayIndex].availabilities = [];
      dayElementSlots.forEach((slot) => {
        this.availabilityData[dayIndex].availabilities.push({
          range: [slot.querySelector('.left-time').textContent, slot.querySelector('.right-time').textContent],
          status: 'green'
        });
      });
      dayIndex++;
    });
  }

  /**
   * permet d'ajouter des indisponibilités entre les slots de disponibilités
   */
  private addNonAvailabilitiesSlots() {
    // update availabilityData with non disponibilities slots
    let dayData;

    if (this.availabilityData.length === 0 && this.weekDays) {
      this.weekDays.forEach((value: { day: string, val: string }) => {
        this.availabilityData.push({
          idJourDisponibilite: null,
          day: value.day,
          availabilities: [
            {
              range: [this.openningHour, this.closureHour],
              status: 'orange'
            }
          ]
        });
      });
    } else {
      for (let i = 0; i < this.availabilityData.length; i++) {
        dayData = this.availabilityData[i];
        // check if the slot is from the begining
        if (dayData.availabilities.length > 0) {
          if (dayData.availabilities[0].range[0] != this.openningHour) {
            // add a slot at the beginning
            this.availabilityData[i].availabilities.unshift(
              {
                range: [this.openningHour, dayData.availabilities[0].range[0]],
                status: 'orange'
              }
            );
          }

          if (dayData.availabilities[dayData.availabilities.length - 1].range[1] != this.closureHour) {
            // add a slot at the end
            this.availabilityData[i].availabilities.push(
              {
                range: [dayData.availabilities[dayData.availabilities.length - 1].range[1], this.closureHour],
                status: 'orange'
              }
            );
          }
        }

        // add inner slots
        let previousSlot = null;
        for (let j = 0; j < dayData.availabilities.length; j++) {
          if (previousSlot != null) {
            if (dayData.availabilities[j].range[0] != previousSlot.range[1]) {
              // add inner slot
              let toPush = {
                range: [previousSlot.range[1], dayData.availabilities[j].range[0]],
                status: 'orange'
              };
              this.availabilityData[i].availabilities.splice(j, 0, toPush);
              j++;
            }
          }
          previousSlot = dayData.availabilities[j];
        }
      }
    }

  }

  private isMaxAvailabilitiesReached(dayId) {
    let availabilitiesCount = 0;
    this.availabilityData[dayId].availabilities.forEach(element => {
      if (element.status == 'green') {
        availabilitiesCount++;
      }
    });
    return availabilitiesCount >= this.maxAvailabilitiesByDay;
  }

  /**
   * Create a new date without seconds and milliseconds
   */
  private createDateWithoutSecondsAndMilliseconds(): Date {
    const date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  /**
   * Set the end hour night or not
   * @param: start
   * @param: end
   */
  private correctEndDate(start: Date, end: Date): Date {
    const sh = start.getHours();
    const eh = end.getHours();
    const sm = start.getMinutes();
    const em = end.getMinutes();
    if ((eh > sh) || ((eh === sh) && (em > sm))) {
      return end;
    }
    end.setDate(end.getDate() + 1);
    return end;
  }

  private setOpeningClosingDates() {
    const openTimeparts = this.openningHour.split('h');
    this.start = this.createDateWithoutSecondsAndMilliseconds();
    this.start.setHours(parseInt(openTimeparts[0]), parseInt(openTimeparts[1]));
    const closeTimeparts = this.closureHour.split('h');
    this.end = this.createDateWithoutSecondsAndMilliseconds();
    this.end.setHours(parseInt(closeTimeparts[0]), parseInt(closeTimeparts[1]));
    this.end = this.correctEndDate(this.start, this.end);
  }

  /**
   * Cette foction permet de calculer les différents paramètres d'affichage des disponibilités suivant la taille de l'écran
   */
  private initSizes() {
    /** Récupération de la taille du conteneur dans lequel s'affiche les disponibilités : sa taille est 5 fois plus large que
     * la taille de la première colonne (dans laquelle s'affiche le nom de l'employé) */
    const showedContainerSize = (window.screen.width - 250) * 0.8;
    // afin de pouvoir faire les calculs sur les dates, on fait la conversion de heures d'ouverture et de fermeture en un objet Date
    const totalWorkTime = (this.end.getTime() - this.start.getTime());
    this.nbrStep5 = totalWorkTime / this.fiveMinutesTime;

    // taille approximative d'un step de 5 minutes : approximative car le resultat peut être en virgule qui n'est pas acceptable par la plupart des navigateur
    const stepSizeApprox = showedContainerSize / this.nbrStep5;

    // exact step size : arrondissement de la taille d'un step
    this.stepSize = Math.trunc(stepSizeApprox);

    // exact container width : recalcul de la taille exacte de conteneur des disponibilités
    this.availabilityContainerWidth = this.stepSize * this.nbrStep5;
    // exact minShiftSize, 24 by default is the number of 5min unit in 2 hours (120 min / 5)
    this.shiftMinSize = this.nbr5minForMinShift * this.stepSize;

    // create custom dynamic CSS style for the separation lines
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = 'div.heure-dispo-rhis { width: ' + (this.shiftMinSize / 2) + 'px; }';
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  /**
   * Calculates total minutes from hh:mm time string
   * @param: time : example 05h50
   */
  private getMinutes(time) {
    if (time == '00h00') {
      return 1440;
    }
    var parts = time.split('h');
    var minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return minutes;
  }

  /**
   * getCurrentTime : Cette fonction permet de calculer l'heure exacte à partir de la position d'un marqueur
   * @param: position : la position courante d'un marqueur exprimé en pixel
   */
  private getCurrentTime(position) {
    let tmpDate = new Date();
    var parts = this.openningHour.split('h');
    tmpDate.setHours(parseInt(parts[0]), parseInt(parts[1]));
    tmpDate = new Date(tmpDate.getTime() + 300000 * (position / this.stepSize));
    return (tmpDate.getHours() + '').padStart(2, '0') + 'h' + (tmpDate.getMinutes() + '').padStart(2, '0');
  }

  /**
   * Cette fonction permet de créer un element de disponibilité ou d'indisponibilité, lui affecter la taille, la couleurs ainsi que les différents paramètres
   * puis afficher cet élément dans la ligne correspondante
   * @param: dayContainer : le <div> conteneur du jours dans lequel on va ajouter l'élément
   * @param: slotId : l'identifiant unique du slot
   * @param: slotDetails : les paramètres du slot (heure début, heure de fin, couleur...)
   * @param: prevElementPadding : si l'élément n'est pas le premier élément dans la journée, récupérer l'emplacement qui correspond à la fin de l'élément précéddent
   */
  private createSlot(dayContainer, slotId, slotDetails, prevElementPadding?) {
    // récupération de la ligne de la journée dans laquelle on va insérer le slot
    let container = document.getElementById(dayContainer);
    let element;
    // création et initialisation du slot
    element = document.createElement('div');
    element.className = 'slot-node interactive ' + slotDetails.status;
    element.id = slotId;
    element.style.height = '51px';
    element.style.left = '0px';
    // création des tranches (lignes de séparation des heures) qui sont présenté par des div
    // (<div class="h"></div>), ainsi que les marqueurs d'heure de début et d'heure de fin
    let innerMarket = '';
    for (let i = 0; i < 22; i++) {
      innerMarket += '<div class="heure-dispo-rhis"></div>';
    }
    const hoursMarker = '<div class="heure-dispo-rhis heure-dispo-rhis-first"></div>' + innerMarket;
    element.innerHTML = '<div class="resize-handle-left"></div>' +
      '<span class="left-time">' + slotDetails.range[0] + '</span>' +
      '<span class="right-time">' + slotDetails.range[1] + '</span>' +
      '<div class="resize-handle-right"></div>' + hoursMarker;

    if (slotDetails.range) {
      // we are creating the slots from initial data
      const startTime = this.getMinutes(slotDetails.range[0]);
      const endTime = this.getMinutes(slotDetails.range[1]);
      if (slotDetails.range[0] === this.openningHour) {
        element.style.left = '0px';
      }
      // the first slot in the day
      element.style.left = prevElementPadding + 'px'; //the other slots in the day
      let widthElement = (endTime - startTime) >= 0 ? (((endTime - startTime) / 5) * this.stepSize) + 'px' : (((endTime - startTime + 1440) / 5) * this.stepSize) + 'px';
      if (widthElement == '0px') {
        widthElement = this.leftRightNewElementParams.leftRightPadResize + 'px';
      }
      // if we are creating an unavailability slot when availability data is empty
      if (widthElement == '0px') {
        widthElement = (1440 / 5) * this.stepSize + 'px';
      }
      // if slotId == slot0, so we are checking all day available
      if (slotId == dayContainer + '-slot0') {
        widthElement = (this.nbrStep5 * this.stepSize) + 'px';
      }
      element.style.width = widthElement;
      container.appendChild(element);
    }

    // update first slice width to match the minutes, example : if slot start time is 12h30,
    // so the first separation line must have the half width (because 30minutes is 0,5 hour)
    this.setFirstSliceSize(element);
    // adding the element to the object window so it can be referenced by it's id later
    window[slotId] = element;
    return element;
  }

  /**
   * Quand on glisse à partir de droite ou de gauche, cela permet de créer un slot avec emplacement
   * et des détails spécifiques (en prenant compte de la taille min d'un shift)
   * @param: position : 'end' | 'start' permet de mentionner si l'élément va se placer au début ou en fin de la ligne de journée
   * @param: parentID : l'identifiant de l'élement parent, c'est l'identifiant de la ligne journée auquel il va appartenir
   * @param: target : c'est l'élement qui a été glissé et qui a décelnché l'évenement de création du slot
   */

  private createSlotByResize(position, parentID, target) {
    // récupération du conteneur du jour
    let dayContainer = document.getElementById(parentID);
    // génération d'un identifiant unique pour le slot, puis le convertir en base 36
    // pour avoir des chiffre et des lettres, puis récupérer les 9 premier caractères après la virgule
    let slotId = Math.random().toString(36).substr(2, 9);
    // tester si l'élément à créer est une disponibilité ou indisponibilité
    let newElementStatus = target.classList.contains('orange') ? 'green' : 'orange';
    // générer l'heure de début et l'heure de fin, on met l'heure d'ouverture
    // si l'élement est créé en début de la journée, sinon c'est l'heure de fermeture qui va être choisi
    let range = position == 'atEnd' ? [this.closureHour, this.closureHour] : [this.openningHour, this.openningHour];
    // création de l'élement
    let newSlot = this.createSlot(parentID, parentID + '-slot' + slotId, {status: newElementStatus, range: range});
    // refElement c'est l'élément de référence : si le slot est créé au début,
    // on le place juste avant refElement, sinon on le place juste après refElement
    let refElement = position == 'atEnd' ? target.nextSibling : target;
    return dayContainer.insertBefore(newSlot, refElement);
  }

  private resizeMove(event) {
    // target : element being resized, deltawidth : the resized amount in pixel
    const target = event.target;
    const deltaWidth = event.rect.width - parseFloat(target.style.width || 0);
    // récupération de l'élement précédent et suivant s'ils eistent, l'élement parent et l'index du jour (0 pour lundi, 1 pour mardi ...)
    let nextElement = target.nextElementSibling;
    let previousElement = target.previousElementSibling;
    const parentID = target.parentElement != null ? target.parentElement.id : '';
    const dayIndex = parentID !== '' ? parseInt(parentID.substr(parentID.length - 1), 10) : 0;
    // if element has been removed while resizing, the parentElement is null
    if (target.parentElement != null) {
      if ((event.edges.right && (nextElement === null) && (deltaWidth >= 0)) || (event.edges.left && (previousElement === null) && (deltaWidth >= 0))) {
        return;
      } else {
        // on bloque le redimensionnement si on est en train de redimensionner avant l'heure d'ouverture (position du slot à gauche = 0)
        // exemple : si heure d'ouverture = 5h00, on permet pas d'avoir 4h55
        if (!(parseFloat(target.style.left || 0) == 0 && event.edges.left && (event.delta.x < 0 || event.delta.y))) {
          // on bloque le redimensionnement si on est en train de redimensionner après l'heure de
          // fermeture (position du slot à droite = container width)
          // exemple : si heure de fermeture = 00h00, on permet pas d'avoir 00h05
          // tslint:disable-next-line:max-line-length
          if (!((parseFloat(target.style.left || 0) + parseFloat(target.style.width || 0) == this.availabilityContainerWidth) && event.edges.right && (event.delta.x > 0 || event.delta.y))) {
            // on bloque l'ajout de nouveau slots si le nombre max de disponibilité a été atteint
            // tslint:disable-next-line:max-line-length
            if (!(this.isMaxAvailabilitiesReached(dayIndex) && target.classList.contains('orange') && ((previousElement == null && event.edges.left) || (nextElement == null && event.edges.right)))) {
              // tslint:disable-next-line:max-line-length
              // on bloque le redimensionnement si on est en train de redimensionner après l'heure de fermeutre (ne pas avoir 00h10 si l'heure de fermeture est 00h00 )
              if (!(target.getElementsByClassName('right-time')[0].textContent == this.closureHour && deltaWidth > 0 && event.edges.right)) {
                // tslint:disable-next-line:max-line-length
                const targetWidthBeforeResize = parseFloat(target.style.width || 0); // récupérer la taille initial du slot afin de pouvoir l'utiliser pour diminuer la taille des lots adjascents
                // tslint:disable-next-line:max-line-length
                target.style.width = event.rect.width + 'px'; // redimensionner l'élement à la nouvelle taille : event.rect.width est la taille de l'élement après drag de la souris
                // utiliser ces variables pour savoir si l'élement a été créé au début ou à la fin
                let newNextElement = false;
                let newPrevElement = false;
                if (!(this.isMaxAvailabilitiesReached(dayIndex) && target.classList.contains('orange'))) {
                  // ici on teste si on peut créer des disponibilités
                  // si on est en train de créer un slot au début de la journée
                  if (previousElement == null && event.edges.left) {
                    this.leftRightNewElementParams.leftRightPadResize += targetWidthBeforeResize - event.rect.width;
                    target.style.left = parseFloat(target.style.left || 0) + targetWidthBeforeResize - event.rect.width + 'px';
                    this.leftRightNewElementParams.lastResizedElement = target;
                    // si la taille du resize atteint la moitité de la taille minimal d'un shift,
                    // on crée alors un shift au début de la journée et on force sa taille à shiftMinSize
                    if (this.leftRightNewElementParams.leftRightPadResize >= this.shiftMinSize / 2) {
                      previousElement = this.createSlotByResize('atStart', parentID, target);
                      newPrevElement = true;
                      this.leftRightNewElementParams.lastElementIsCreated = true;
                    }
                  }

                  // si on est en train de créer un slot à la fin de la journée
                  if (nextElement == null && event.edges.right) {
                    this.leftRightNewElementParams.leftRightPadResize += targetWidthBeforeResize - event.rect.width;
                    this.leftRightNewElementParams.lastResizedElement = target;
                    // si la taille du resize atteint la moitité de la taille minimal d'un shift,
                    // on crée alors un shift à la fin de la journée et on force sa taille à shiftMinSize
                    if (this.leftRightNewElementParams.leftRightPadResize > this.shiftMinSize / 2) {
                      nextElement = this.createSlotByResize('atEnd', parentID, target);
                      this.leftRightNewElementParams.lastElementIsCreated = true;
                      newNextElement = true;
                    }
                  }
                }

                if (previousElement && event.edges.left) {
                  // we are resizing from left handle
                  this.resizeFromLeft(event, target, parentID, deltaWidth, previousElement, nextElement, newPrevElement, newNextElement);
                }

                if (nextElement && event.edges.right) {
                  // we are resizing from right handle
                  this.resizeFromRight(event, target, parentID, deltaWidth, previousElement, nextElement, newPrevElement, newNextElement);
                }
              }
            }
          }
        }
      }
      // on met à jour l'heure de début et de fin pour les slots de la journée en cours
      this.updateDaySlotsTime(parentID);
    }
    // mettre à jour au fure et à mesure le tableau des disponibilité à exporter à la fin
    this.updateAvailabilitiesData();
    this.emitDisponibilite();
  }

  /**
   * cette fonction gère le cas de redimensionnement de gauche
   * @param: event : l'objet event resize
   * @param: target : l'élement en cours de redimensionnement
   * @param: parentID : l'identifiant de la journée
   * @param: deltaWidth : le nombre de pixel ajouté ou supprimé lors de redimensionnement
   * @param: previousElement : l'element précédent s'il existe
   * @param: nextElement  : l'element suivant s'il existe
   * @param: newPrevElement : si nous venons de créer un élément au début, cette variable prend true, sinon false
   * @param: newNextElement : si nous venons de créer un élément à la fin, cette variable prend true, sinon false
   */
  private resizeFromLeft(event, target, parentID, deltaWidth, previousElement, nextElement, newPrevElement, newNextElement) {

    // si aucun élément n'a été créé, on met à jour la taille de l'élément courant, et sa position
    if (!newPrevElement) {
      target.style.left = parseFloat(target.style.left || 0) - deltaWidth + 'px';
      previousElement.style.width = Math.max(parseFloat(target.style.left || 0), 0) - parseFloat(previousElement.style.left || 0) + 'px';
      this.sameAvailabilityCheckbox = false;
    }

    // resize current slot if width is between shiftMinSize and shiftMinSize/2
    if (target.classList.contains('green') && parseFloat(target.style.width || 0) >= this.shiftMinSize / 2 && parseFloat(target.style.width || 0) < this.shiftMinSize) {
      this.innerElementResizeParams.lastResizedElement = target;
      this.innerElementResizeParams.fromLeft = true;
    }

    // resize previous slot if width is between shiftMinSize and shiftMinSize/2
    if (previousElement.classList.contains('green') && parseFloat(previousElement.style.width || 0) >= this.shiftMinSize / 2 && parseFloat(previousElement.style.width || 0) < this.shiftMinSize) {
      this.innerElementResizeParams.lastResizedElement = previousElement;
      this.innerElementResizeParams.fromRight = true;
    }


    // remove and merge slots if current target width is under half of shiftMinSize
    let mergeExecuted = false;
    this.innerElementResizeParams.resizedElementIsRemoved = false;
    if ((target.classList.contains('green') && parseFloat(target.style.width || 0) < this.shiftMinSize / 2) || (target.classList.contains('orange') && parseFloat(target.style.width || 0) < this.stepSize * 3)) {
      let removedShiftWidth = parseFloat(target.style.width || 0);
      target.parentNode.removeChild(target); // delete the node
      this.innerElementResizeParams.resizedElementIsRemoved = true;
      // need to merge previous and next (if exists)
      if (nextElement && previousElement) {
        let nodeToMergeLeftWidth = parseFloat(previousElement.style.width || 0);
        previousElement.parentNode.removeChild(previousElement);
        nextElement.style.left = parseFloat(nextElement.style.left || 0) - nodeToMergeLeftWidth - removedShiftWidth + 'px';
        nextElement.style.width = Math.max(parseFloat(nextElement.style.width || 0) + nodeToMergeLeftWidth + removedShiftWidth, 0) + 'px';
        mergeExecuted = true;
      }
      // stop the interaction immediately
      event.interaction.stop();
      // reset the new Element Params
      this.leftRightNewElementParams.lastElementIsCreated = false;
      this.leftRightNewElementParams.leftRightPadResize = 0;
      // reset innerElementResizeParams
      this.innerElementResizeParams.resizedElementIsRemoved = false;
      this.innerElementResizeParams.fromLeft = false;
      this.innerElementResizeParams.fromRight = false;
      // if the last element is removed, resize the last-1 element to reach the end of the day slot
      if (!nextElement && previousElement) {
        previousElement.style.width = parseFloat(previousElement.style.width || 0) + removedShiftWidth + 'px';
      }
    }

    // remove previous and meslots if previous width is under half of shiftMinSize
    if ((previousElement.classList.contains('green') && parseFloat(previousElement.style.width || 0) < this.shiftMinSize / 2) || (previousElement.classList.contains('orange') && parseFloat(previousElement.style.width || 0) < this.stepSize * 3)) {
      let nodeToMergeLeft = previousElement.previousElementSibling;
      let removedShiftWidth = parseFloat(previousElement.style.width || 0);
      if (previousElement !== null) {
        previousElement.parentNode.removeChild(previousElement); // delete the previous node
      }
      this.innerElementResizeParams.resizedElementIsRemoved = true;
      // merge nodes if necessary
      if (nodeToMergeLeft != null) {
        // delete the left node and resize the target node
        let nodeToMergeLeftWidth = parseFloat(nodeToMergeLeft.style.width || 0);
        nodeToMergeLeft.parentNode.removeChild(nodeToMergeLeft);
        target.style.left = parseFloat(target.style.left || 0) - nodeToMergeLeftWidth - removedShiftWidth + 'px';
        target.style.width = Math.max(parseFloat(target.style.width || 0) + nodeToMergeLeftWidth + removedShiftWidth, 0) + 'px';
        mergeExecuted = true;
      }
      // stop the interaction immediately
      event.interaction.stop();
      // reset innerElementResizeParams
      this.innerElementResizeParams.resizedElementIsRemoved = false;
      this.innerElementResizeParams.fromLeft = false;
      this.innerElementResizeParams.fromRight = false;
      // reset the new Element Params
      this.leftRightNewElementParams.lastElementIsCreated = false;
      this.leftRightNewElementParams.leftRightPadResize = 0;
      // if the first element is removed, resize the first+1 element to reach the begining of the day slot
      if (!target.previousElementSibling && !mergeExecuted) {
        target.style.width = parseFloat(target.style.width || 0) + removedShiftWidth + 'px';
        target.style.left = parseFloat(target.style.left || 0) - removedShiftWidth + 'px';
        // parfois si le resize a été exécuté de façon rapide, on recalcule la taille des élements s'il y a un dépassement quelconque
        let deltaWidthExcess = this.slotsBiggerThanDay(parentID);

        if (deltaWidthExcess > 0) {
          target.style.width = parseFloat(target.style.width || 0) - deltaWidthExcess + 'px';
          target.style.left = parseFloat(target.style.left || 0) + deltaWidthExcess + 'px';
        }
      }
    }
  }

  /**
   * cette fonction gère le cas de redimensionnement de droite
   * @param: event : l'objet event resize
   * @param: target : l'élement en cours de redimensionnement
   * @param: parentID : l'identifiant de la journée
   * @param: deltaWidth : le nombre de pixel ajouté ou supprimé lors de redimensionnement
   * @param: previousElement : l'element précédent s'il existe
   * @param: nextElement  : l'element suivant s'il existe
   * @param: newPrevElement : si nous venons de créer un élément au début, cette variable prend true, sinon false
   * @param: newNextElement : si nous venons de créer un élément à la fin, cette variable prend true, sinon false
   */
  private resizeFromRight(event, target, parentID, deltaWidth, previousElement, nextElement, newPrevElement, newNextElement) {

    // si un élément suivant a été créé, on met à jour sa taille et sa position
    if (newNextElement) {
      nextElement.style.left = parseFloat(target.style.width || 0) + parseFloat(target.style.left || 0) + 'px';
      if (nextElement.classList.contains('green')) {
        this.innerElementResizeParams.lastResizedElement = nextElement;
        this.innerElementResizeParams.fromLeft = true;
      }
    } else {
      nextElement.style.left = parseFloat(nextElement.style.left || 0) + deltaWidth + 'px';
      this.sameAvailabilityCheckbox = false;

      // resize current slot if width is between shiftMinSize and shiftMinSize/2
      if (target.classList.contains('green') && parseFloat(target.style.width || 0) >= this.shiftMinSize / 2 && parseFloat(target.style.width || 0) < this.shiftMinSize) {
        this.innerElementResizeParams.lastResizedElement = target;
        this.innerElementResizeParams.fromRight = true;
      }

      // resize next slot if width is between shiftMinSize and shiftMinSize/2
      if (nextElement.classList.contains('green') && parseFloat(nextElement.style.width || 0) >= this.shiftMinSize / 2 && parseFloat(nextElement.style.width || 0) < this.shiftMinSize) {
        this.innerElementResizeParams.lastResizedElement = nextElement;
        this.innerElementResizeParams.fromLeft = true;
      }

      // remove and merge slots if width is under half of shiftMinSize
      let mergeExecuted = false;
      if ((target.classList.contains('green') && parseFloat(target.style.width || 0) < this.shiftMinSize / 2) || (target.classList.contains('orange') && parseFloat(target.style.width || 0) < this.stepSize * 3)) {
        let removedShiftWidth = parseFloat(target.style.width || 0);
        target.parentNode.removeChild(target); // delete the node
        // need to merge previous and next (if exists)
        if (nextElement && previousElement) {
          let nodeToMergeLeftWidth = parseFloat(previousElement.style.width || 0);
          previousElement.parentNode.removeChild(previousElement);
          nextElement.style.left = parseFloat(nextElement.style.left || 0) - nodeToMergeLeftWidth - removedShiftWidth + 'px';
          nextElement.style.width = Math.max(parseFloat(nextElement.style.width || 0) + nodeToMergeLeftWidth + removedShiftWidth, 0) + 'px';
          mergeExecuted = true;
        }
        // stop the interaction immediately
        event.interaction.stop();
        // reset innerElementResizeParams
        this.innerElementResizeParams.resizedElementIsRemoved = false;
        // this.innerElementResizeParams.widthToAdd = 0;
        this.innerElementResizeParams.fromLeft = false;
        this.innerElementResizeParams.fromRight = false;
        // reset the new Element Params
        this.leftRightNewElementParams.lastElementIsCreated = false;
        this.leftRightNewElementParams.leftRightPadResize = 0;
        // if the first element is removed, resize the first + 1 element to reach the begining of the day slot
        if (nextElement && !previousElement) {
          nextElement.style.width = parseFloat(nextElement.style.width || 0) + removedShiftWidth + 'px';
          nextElement.style.left = parseFloat(nextElement.style.left || 0) - removedShiftWidth + 'px';
        }
      }

      // remove nextElement and merge slots if nextElement width is under half of shiftMinSize
      if ((nextElement.classList.contains('green') && parseFloat(nextElement.style.width || 0) < this.shiftMinSize / 2) || (nextElement.classList.contains('orange') && parseFloat(nextElement.style.width || 0) < this.stepSize * 3)) {
        let nodeToMergeRight = nextElement.nextElementSibling;
        let removedShiftWidth = 0;
        if (nodeToMergeRight != null) {
          removedShiftWidth = parseFloat(nodeToMergeRight.style.left || 0) - parseFloat(target.style.width || 0) - parseFloat(target.style.left || 0);
        } else {
          removedShiftWidth = this.availabilityContainerWidth - parseFloat(target.style.width || 0) - parseFloat(target.style.left || 0);
        }
        nextElement.parentNode.removeChild(nextElement); // delete the next node
        // merge nodes if necessary
        if (nodeToMergeRight != null) {
          // delete the left node and resize the target node
          let nodeToMergeRightWidth = parseFloat(nodeToMergeRight.style.width || 0);
          nodeToMergeRight.parentNode.removeChild(nodeToMergeRight);
          target.style.width = Math.max(parseFloat(target.style.width || 0) + nodeToMergeRightWidth + removedShiftWidth, 0) + 'px';
          mergeExecuted = true;
        }
        // stop the interaction immediately
        event.interaction.stop();
        // reset innerElementResizeParams
        this.innerElementResizeParams.resizedElementIsRemoved = false;
        // this.innerElementResizeParams.widthToAdd = 0;
        this.innerElementResizeParams.fromLeft = false;
        this.innerElementResizeParams.fromRight = false;
        // reset the new Element Params
        this.leftRightNewElementParams.lastElementIsCreated = false;
        this.leftRightNewElementParams.leftRightPadResize = 0;
        // if the last element is removed, resize the last-1 element to reach the end of the day slot
        if (!target.nextElementSibling && !mergeExecuted) {
          target.style.width = parseFloat(target.style.width || 0) + removedShiftWidth + 'px';
          let deltaWidthExcess = 0;
          if (nodeToMergeRight != null) {
            // parfois si le resize a été exécuté de façon rapide, on recalcule la taille des élements s'il y a un dépassement quelconque
            deltaWidthExcess = this.slotsBiggerThanDay(parentID);
          }

          if (deltaWidthExcess > 0) {
            target.style.width = parseFloat(target.style.width || 0) - deltaWidthExcess + 'px';
          }
        }
      }
      // mise à jour de l'élement suivant qui dépend de la taille et la position de l'élement en cours
      nextElement.style.width = Math.max(parseFloat(nextElement.style.width || 0) - deltaWidth, 0) + 'px';
    }
  }

  /**
   * pour chaque journée, cette fonction permet de mettre à jour l'heure de début et de fin pour chaque slot
   * @param: day : la journée concernée
   */
  private updateDaySlotsTime(day) {
    if (day) {
      // récupération de la liste des lots de la journée
      let slots = document.getElementById(day).children as HTMLCollectionOf<HTMLElement>;
      for (let i = 0; i < slots.length; i++) {
        let element = slots[i];
        element.getElementsByClassName('left-time')[0].textContent = this.getCurrentTime(parseFloat(element.style.left));
        element.getElementsByClassName('right-time')[0].textContent = this.getCurrentTime(parseFloat(element.style.left) + parseFloat(element.style.width));
        // correction du decalage des barre de tranches d'heure pour chaque slot
        this.setFirstSliceSize(element);
      }
    }
  }

  /**
   * permet de mettre à jour la taille de la première ligne de séparation pour correspondre les minutes,
   * exemple: si le slot commence à 12h30, la première ligne de separation doit se positionner à la moitié (car 30minutes = 0,5 heure)
   * @param: element : l'élément concerné (slot)
   */
  private setFirstSliceSize(element) {
    const minutes = parseFloat(element.getElementsByClassName('left-time')[0].textContent.split('h')[1]);
    const firstSliceSize = ((60 - minutes) / 5) * this.stepSize;
    (<HTMLElement>element.querySelector('.heure-dispo-rhis-first')).style.width = firstSliceSize + 'px';
  }

  /**
   * permet de vérifier si les slots ne se chevauchent pas, ou s'il ya un dépassement quelconque, si oui, la fonction retourne la quantité de dépassement afin de faire la correction nécessaire
   * @param: day : journée concernée
   */
  private slotsBiggerThanDay(day) {
    let children = document.getElementById(day).children as HTMLCollectionOf<HTMLElement>;
    let totalWidth = 0;

    for (let i = 0; i < children.length; i++) {
      totalWidth += parseFloat(children[i].style.width);
    }
    return totalWidth - this.availabilityContainerWidth;
  }

  /**
   * cette fonction s'exécute à la fin de toute action de redimensionnement, c'est à dire au moment ou l'utilisateur lâche la souris,
   * on l'utilise pour savoir si on garde ou on repositionne les élements suivant la taille minimale d'un shift
   * @param: event
   */
  private resizeEnd(event) {
// test if new elements are created successfully or reset the concerned elements sizes
    if (!this.leftRightNewElementParams.lastElementIsCreated && this.leftRightNewElementParams.lastResizedElement) {
      this.leftRightNewElementParams.lastResizedElement.style.width = parseFloat(this.leftRightNewElementParams.lastResizedElement.style.width || 0) + this.leftRightNewElementParams.leftRightPadResize + 'px';
      if (event._interaction.edges.left) {
        this.leftRightNewElementParams.lastResizedElement.style.left = parseFloat(this.leftRightNewElementParams.lastResizedElement.style.left || 0) - this.leftRightNewElementParams.leftRightPadResize + 'px';
      }
      const parentElement = this.leftRightNewElementParams.lastResizedElement.parentElement;
      if (parentElement) {
        this.updateDaySlotsTime(parentElement.id);
      }
    } else {
      if (this.leftRightNewElementParams.lastResizedElement) {
        // reset same Availability checkbox for all days
        this.sameAvailabilityCheckbox = false;

        // reset same Availability checkbox for all days
        const parentId = this.leftRightNewElementParams.lastResizedElement.parentElement.id;
        const dayIndex = parseFloat(parentId.substr(parentId.length - 1));
        this.availableAllDayCheckbox[dayIndex] = false;
      }
    }
    this.leftRightNewElementParams.lastElementIsCreated = false;
    this.leftRightNewElementParams.leftRightPadResize = 0;


    // test if inner elements are resized or removed successfully or adjust the concerned elements sizes depending on shiftMinSize
    if (!this.innerElementResizeParams.resizedElementIsRemoved && this.innerElementResizeParams.lastResizedElement && (this.innerElementResizeParams.fromLeft || this.innerElementResizeParams.fromRight)) {
      let widthToAdd = this.shiftMinSize - parseFloat(this.innerElementResizeParams.lastResizedElement.style.width || 0);
      widthToAdd = widthToAdd > 0 ? widthToAdd : 0;
      this.innerElementResizeParams.lastResizedElement.style.width = parseFloat(this.innerElementResizeParams.lastResizedElement.style.width || 0) + widthToAdd + 'px';
      this.sameAvailabilityCheckbox = false;

      // need to resize previous if exists
      if (this.innerElementResizeParams.fromLeft) {
        this.innerElementResizeParams.lastResizedElement.style.left = parseFloat(this.innerElementResizeParams.lastResizedElement.style.left || 0) - widthToAdd + 'px';
        const previousElement = this.innerElementResizeParams.lastResizedElement.previousElementSibling;
        if (previousElement) {
          previousElement.style.width = parseFloat(previousElement.style.width || 0) - widthToAdd + 'px';
          this.sameAvailabilityCheckbox = false;
        }
      }
      // need to resize next if exists
      if (this.innerElementResizeParams.fromRight) {
        const nextElement = this.innerElementResizeParams.lastResizedElement.nextElementSibling;
        if (nextElement) {
          nextElement.style.width = parseFloat(nextElement.style.width || 0) - widthToAdd + 'px';
          nextElement.style.left = parseFloat(nextElement.style.left || 0) + widthToAdd + 'px';
          this.sameAvailabilityCheckbox = false;
        }
      }
      this.innerElementResizeParams.resizedElementIsRemoved = false;
      this.innerElementResizeParams.fromLeft = false;
      this.innerElementResizeParams.fromRight = false;

      let parentElement = this.innerElementResizeParams.lastResizedElement.parentElement;
      // mise à jour de heures de début et de fin de chaque slot à la fin de l'opération de redimensiennement
      if (parentElement) {
        this.updateDaySlotsTime(parentElement.id);
      }
    }
    // mise à jour du tableau des données de disponibilités à exporter
    this.updateAvailabilitiesData();
    this.emitDisponibilite();
  }

  /**
   * cette fonction permet de parcourir le tableau de données des disponibilités et de faire appel à la fonction qui va créer les slots
   */
  private drawSlots() {
    let dayIndex = 0;
    // parcours des journées
    this.availabilityData.forEach(day => {
      let slotIndex = 0;
      let prevElementPadding = 0;
      // reset the day content if resized for example
      const dayContainer = document.getElementById(this.availabilityPrefix + '-day-' + dayIndex);
      if (dayContainer) {
        dayContainer.innerHTML = '';
        // parcour des slots pour chaque journée
        day.availabilities.forEach(slotDetails => {
          let slotId = Math.random().toString(36).substr(2, 9);
          let newElement = this.createSlot(this.availabilityPrefix + '-day-' + dayIndex, this.availabilityPrefix + '-day-' + dayIndex + '-slot' + slotId, slotDetails, prevElementPadding);
          // la taille d'un step de 5 minute = 4px
          prevElementPadding += parseFloat(newElement.style.width);
          slotIndex++;
        });
      }
      dayIndex++;
    });
  }

  /**
   * prépare l'affichage des lots ainsi que l'initialisation des évenements d'interraction utilisateur : drag resize
   */
  private onReadyInit() {
    // afficher les slots
    this.drawSlots();
    // ajouter l'évènement d'interraction afin que l'utilisateur pourrait redimensionner chaque slot
    this.initializeInterraction();
    // à chaque action de resize, ou de relachement de la souris, on fait appel à ces deux fonctions
    interact('.' + this.availabilityPrefix + ' .interactive').on('resizemove', (e) => {
      this.resizeMove(e);
    });
    interact('.' + this.availabilityPrefix + ' .interactive').on('resizeend', (e) => {
      this.resizeEnd(e);
    });
  }

  /**
   * la fonction qui permet d'initialiser les évènement de redimensionnement utilisateur pour chacun des élements (slots)
   */
  private initializeInterraction() {
    interact('.' + this.availabilityPrefix + ' .interactive')
      .resizable({
        max: 2,
        edges: {left: true, right: true, top: false, bottom: false}, // on pourrait redimensionner de gauche ou de droite, mais pas de haut et d'en bas
        modifiers: [
          /*       interact.modifiers.restrict({
                  restriction: 'parent', //restriction de la taille d'un élement pour ne pas dépasser la taille de sont parent
                }), */
          interact.modifiers.snapSize({ // permet de redimensionner par step (de la taille de 5 minutes)
            enabled: true,
            targets: [interact.createSnapGrid({x: this.stepSize, y: this.stepSize})], // créer un grille pour le redimensionnement par step
          })
        ],
        invert: 'none'
      });
  }

  /**
   * permet de mettre les disponibilités des autres journées comme celle de Lundi
   * @param: event
   */
  public sameAvailabilityForAllDays(event) {
    this.sameAvailabilityCheckbox = true;
    this.availableAllDayCheckbox = [false, false, false, false, false, false, false];

    // get first day slots
    let monday = document.getElementById(this.availabilityPrefix + '-day-0');
    let mondaySlots = monday.children;

    let dayIndex = 0;
    this.availabilityData.forEach(day => {
      // apply to all days except monday
      if (dayIndex > 0) {
        var theDay = document.getElementById(this.availabilityPrefix + '-day-' + dayIndex);

        // remove old slots and create new ones
        while (theDay.firstChild) {
          theDay.removeChild(theDay.firstChild);
        }
        // duplicate monday slots and add them to all days
        let htmlSlots = monday.innerHTML.replace(/day-0/g, 'day-' + dayIndex);

        document.getElementById(this.availabilityPrefix + '-day-' + dayIndex).innerHTML = htmlSlots;
      }
      dayIndex++;
    });

    this.updateAvailabilitiesData();
    this.emitDisponibilite();
  }

  /**
   * permet de rendre toute la journée identifiée par dayId disponible (verte)
   * @param: event
   * @param: dayId
   */
  private availableAllDay(event, dayId) {
    //remove old slots and create new green one
    var theDay = document.getElementById(dayId);
    while (theDay.firstChild) {
      theDay.removeChild(theDay.firstChild);
    }
    //création d'un nouveau slot disponible
    this.createSlot(dayId, dayId + '-slot0', {status: 'green', range: [this.openningHour, this.closureHour]});
    this.sameAvailabilityCheckbox = false;
    this.updateAvailabilitiesData();
    this.emitDisponibilite();
  }

  /*_____________________________________________________________________________________________________________________________*/

  /**
   * Calculter le nombre de 5 min contenu dans shift
   * @param: shift
   */
  private getNbr5MinForMinShift(shift: string): number {
    const table = shift.split(':');
    return ((+table[0]) * 60 + (+table[1])) / 5;
  }

  /**
   * Prepare dispos to display it
   * @param: contrat
   */
  private setDisponibilites(jourDisponibilites: JourDisponibiliteModel[]): any[] {
    const dispos = [];
    if (jourDisponibilites && jourDisponibilites.length && this.weekDays) {
      this.weekDays.forEach((jour: { day: string, val: string }) => {
        const jourDispo = this.getJourDispoByDay(jour.val, jourDisponibilites);
        dispos.push({
          idJourDisponibilite: jourDispo.idJourDisponibilite,
          day: jour.day,
          availabilities: this.getDispos(jourDispo)
        });
      });
    }
    return dispos;
  }

  /**
   * Chercher jourdisponibilite par le nom de jour
   * @param: jour
   * @param: dispos
   */
  private getJourDispoByDay(jour: string, dispos: JourDisponibiliteModel[]): JourDisponibiliteModel {
    return dispos.find(dispo => dispo.jourSemain === jour);
  }

  /**
   * Créer d'une chaine de caractère à partir d'une date
   * @param: time
   */
  private getTime(time): string {
    if (new Date(time).getDate()) {
      return `${('0' + new Date(time).getHours()).slice(-2)}h${('0' + new Date(time).getMinutes()).slice(-2)}`;
    } else {
      return time.split(':', 2).join('h');
    }
  }

  /**
   * Map jourdisponibilite object to the another structure to display it
   * @param: jourDispo
   */
  private getDispos(jourDispo: JourDisponibiliteModel): any[] {
    const partitions = ['debut1', 'debut2', 'debut3'];
    const endPartitions = ['fin1', 'fin2', 'fin3'];
    const dispos = [];
    let i = 0;
    partitions.forEach((part: string, index: number) => {
      if (jourDispo[part] && jourDispo[endPartitions[index]]) {
        let start = jourDispo[part];
        let end = jourDispo[endPartitions[index]];
        if (!new Date(start).getDate()) {
          start = this.contratUtilitiesService.getDispoHour(start, ':');
          end = this.contratUtilitiesService.getDispoHour(end, ':');
          if (jourDispo['heureDebut' + (index + 1) + 'IsNight']) {
            start.setDate(start.getDate() + 1);
          }
          if (jourDispo['heureFin' + (index + 1) + 'IsNight']) {
            end.setDate(end.getDate() + 1);
          }
        }
        [start, end] = this.getRealDisponibilite([this.start, this.end], [start, end]);
        if (start !== null && end !== null) {
          dispos.push({
            range: [this.getTime(start), this.getTime(end)],
            status: 'green'
          });
        } else {
          i++;
        }
      } else {
        i++;
      }
    });
    if (i === 3) {
      dispos.push({
        range: [this.openningHour, this.closureHour],
        status: 'orange'
      });
    }
    return dispos;
  }

  /**
   * Récupérer les disponibilités réelles
   * @param: hours
   * @param: dispoLimits
   */
  private getRealDisponibilite(hours: [Date, Date], dispoLimits: [Date, Date]): [Date, Date] {
    if ((hours[0] > dispoLimits[1]) || (dispoLimits[0] > hours[1])) {
      return [null, null];
    } else {
      const start: Date = hours[0] > dispoLimits[0] ? hours[0] : dispoLimits [0];
      const end: Date = hours[1] < dispoLimits[1] ? hours[1] : dispoLimits [1];
      const isIntervalValid = this.contratUtilitiesService.isMinShifRespected([start, end], (this.nbr5minForMinShift * 5) / 60);
      return isIntervalValid ? [start, end] : [null, null];
    }
  }

  /**
   * Récupérer heur d'ouverture/cloture d'après la liste des heures d'ouverture/cloture de tous les jours
   * @param: day
   * @param: dayHours
   * @param: comparedDate
   */
  private getHourFrom(day: string, dayHours: { day: string, value: string }[], comparedDate?: Date): Date {
    const wantedDayHour = dayHours.find(dayHour => dayHour.day.toLowerCase() === day.toLowerCase());
    return this.getWholeDate(wantedDayHour.value, ':', comparedDate);
  }

  /**
   * Get the real closing date from a compare date (opening one)
   * @param: val
   * @param: comparedDate
   * @param: separator
   */
  private getWholeDate(val: string, separator: string, comparedDate?: Date): Date {
    const realDate = this.contratUtilitiesService.getDispoHour(val, separator);
    if (comparedDate && (realDate <= comparedDate)) {
      realDate.setDate(realDate.getDate() + 1);
    }
    return realDate;
  }

  /**
   * Créer & Envoyer disponibilite vers le contrat
   */
  private emitDisponibilite(): void {
    const disponibilite = this.createDisponibilites();
    this.dispoHebdo = this.contratUtilitiesService.getTotalDispoHebdo(disponibilite);
    this.dispoDays = this.contratUtilitiesService.getTotalDispoPerDay(disponibilite);
    this.sendDisponibiliteToContrat(disponibilite);
  }

  /**
   * Construire DisponibiliteMode d'après l'affichage
   */
  private createDisponibilites(): JourDisponibiliteModel[] {
    const joursDisponibilites: JourDisponibiliteModel[] = [];
    const openingDate = this.getWholeDate(this.openningHour, 'h');
    const closingDate = this.getWholeDate(this.closureHour, 'h', openingDate);
    this.availabilityData.forEach((availabilityDay: any) => {
      const jourDispo = new JourDisponibiliteModel();
      jourDispo.odd = this.isOdd;
      jourDispo.jourSemain = this.getJourSemaine(availabilityDay.day, 'day', 'val');
      const realOpenHour = this.getHourFrom(jourDispo.jourSemain, this.openningHours);
      const realCloseHour = this.getHourFrom(jourDispo.jourSemain, this.closureHours, realOpenHour);
      jourDispo.idJourDisponibilite = availabilityDay.idJourDisponibilite;
      availabilityDay.availabilities.forEach((availability: { range: string [], status: string }, index: number) => {
        jourDispo['debut' + (index + 1)] = this.contratUtilitiesService.getDispoHour(availability.range[0], 'h');
        jourDispo['fin' + (index + 1)] = this.contratUtilitiesService.getDispoHour(availability.range[1], 'h');

        jourDispo['heureDebut' + (index + 1) + 'IsNight'] = this.isNightHour(availability.range[0], [openingDate, closingDate], true);
        jourDispo['heureFin' + (index + 1) + 'IsNight'] = this.isNightHour(availability.range[1], [openingDate, closingDate], false);
        if (jourDispo['heureDebut' + (index + 1) + 'IsNight']) {
          jourDispo['debut' + (index + 1)].setDate(jourDispo['debut' + (index + 1)].getDate() + 1);
        }
        if (jourDispo['heureFin' + (index + 1) + 'IsNight']) {
          jourDispo['fin' + (index + 1)].setDate(jourDispo['fin' + (index + 1)].getDate() + 1);
        }

        [jourDispo['debut' + (index + 1)], jourDispo['fin' + (index + 1)]] = this.getRealDisponibilite([realOpenHour, realCloseHour], [jourDispo['debut' + (index + 1)], jourDispo['fin' + (index + 1)]]);
        jourDispo['heureDebut' + (index + 1) + 'IsNight'] = ((jourDispo['debut' + (index + 1)] !== null) && (jourDispo['fin' + (index + 1)] !== null)) ? this.dateService.isAfterOn(jourDispo['debut' + (index + 1)], openingDate, 'days') : false;
        jourDispo['heureFin' + (index + 1) + 'IsNight'] = ((jourDispo['debut' + (index + 1)] !== null) && (jourDispo['fin' + (index + 1)] !== null)) ? this.dateService.isAfterOn(jourDispo['fin' + (index + 1)], openingDate, 'days') : false;
      });
      this.setDispoJour(jourDispo, realOpenHour, realCloseHour);
      joursDisponibilites.push(jourDispo);
    });
    return joursDisponibilites;
  }

  /**
   * Check if availability is present all day or not
   * @param: jourDispo
   * @param: realOpenHour
   * @param: realCloseHour
   */
  private setDispoJour(jourDispo: JourDisponibiliteModel, realOpenHour: Date, realCloseHour: Date): JourDisponibiliteModel {
    if (jourDispo && jourDispo.fin1 && (!jourDispo.fin2) && (!jourDispo.fin3) && this.sameAsOpenAndCloseHours([jourDispo.debut1, jourDispo.fin1], [realOpenHour, realCloseHour])) {
      jourDispo.dispoJour = true;
    } else {
      jourDispo.dispoJour = false;
    }
    return jourDispo;
  }

  /**
   * Check if border hours are the same
   * @param: availibility
   * @param: limitHours
   */
  private sameAsOpenAndCloseHours(availibility: [Date, Date], limitHours: [Date, Date]): boolean {
    let state = true;
    [0, 1].forEach((index: number) => {
      state = state && (availibility[index].getHours() === limitHours[index].getHours()) && (availibility[index].getMinutes() === limitHours[index].getMinutes());
    });
    return state;
  }

  /**
   * Envoyer la disponibilite vers le contrat
   * @param: disponibilite
   */
  private sendDisponibiliteToContrat(joursDisponibilites: JourDisponibiliteModel[]) {
    if (!this.contratId) {
      this.currentDispo.emit({dispo: joursDisponibilites, idContrat: this.contratId, idAvenant: this.contratId, isOdd: this.isOdd});
    } else {
      if (this.contratId !== this.contratUpdateId) {
        this.confirmUpdateDispoSetValue.emit({
          dispo: joursDisponibilites,
          disponibilite: true,
          idContrat: this.contratId,
          idAvenant: this.contratId,
          isOdd: this.isOdd
        });
      } else {
        this.currentDispo.emit({
          dispo: joursDisponibilites,
          idAvenant: this.contratId, idContrat: this.contratId, isOdd: this.isOdd
        });
      }
    }
  }

  /**
   * Récupérer le jour de semaine cherché
   * @param: day
   * @param: searchKey
   * @param: wantedKey
   */
  private getJourSemaine(day: string, searchKey: string, wantedKey: string): string {
    const wantedDay: { day: string, val: string } = this.weekDays.find((weekDay: { day: string, val: string }) => weekDay[searchKey] === day);
    return wantedDay[wantedKey];
  }

  /**
   * Vérifier si l'heure est une heure de nuit ou pas
   * @param: hour
   * @param: limitHours
   * @param: isStartHour
   */
  private isNightHour(hour: string, limitHours: [Date, Date], isStartHour: boolean): boolean {
    const openingHourParts = [limitHours[0].getHours(), limitHours[0].getMinutes()];
    const closureHourParts = [limitHours[1].getHours(), limitHours[1].getMinutes()];
    const hourParts = hour.split('h');
    if (isStartHour && (+openingHourParts[0] === +hourParts[0]) && (+openingHourParts[1] === +hourParts[1])) {
      return false;
    } else {
      if ((!isStartHour) && (+closureHourParts[0] === +hourParts[0]) && (+closureHourParts[1] === +hourParts[1])) {
        return limitHours[1].getDay() !== limitHours[0].getDay();
      }
    }
    return (+openingHourParts[0] > +hourParts[0]) || ((+openingHourParts[0] === +hourParts[0]) && (+openingHourParts[1] > +hourParts[1]));
  }
}
