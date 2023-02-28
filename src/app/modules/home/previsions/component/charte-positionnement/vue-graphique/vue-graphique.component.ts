import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {PositionnementModel} from '../../../../../../shared/model/positionnement.model';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-vue-graphique',
  templateUrl: './vue-graphique.component.html',
  styleUrls: ['./vue-graphique.component.scss']
})
export class VueGraphiqueComponent implements OnInit, AfterViewInit {

  @ViewChild('widgetsContent', {read: ElementRef}) public widgetsContent: ElementRef<any>;
  // abscisse du positionnement sélectionné sur le graphique
  public selectedVentesHoraires = '0';
  // effectif du positionnement sélectionné sur le graphique
  public selectedEffectif = 0;
  // options du graphique
  public barChartOptions: ChartOptions = {
    title: {
      display: true,
      position: 'bottom',
      fullWidth: true,
      fontSize: 18,
      fontFamily: 'TT Wellingtons DemiBold',
      fontColor: '#414141',
      text: this.rhisTranslateService.translate('PREVISION.CANVAS_TITLE')
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          drawBorder: false,
        },
        barThickness: 13,
        ticks: {
          fontSize: 16,
          beginAtZero: true
        }
      }],
      yAxes: [{
        gridLines: {
          borderDash: [3, 8],
          drawBorder: false
        },
        ticks: {
          fontSize: 16,
          beginAtZero: true
        },
        scaleLabel: {
          display: true,
          fontSize: 18,
          fontFamily: 'TT Wellingtons DemiBold',
          fontColor: '#414141',
          labelString: this.rhisTranslateService.translate('CHARTEPOSITIONNEMENT.EFFECTIF_LABEL'),
        }
      }]
    },
    tooltips: {
      displayColors: false,
      titleFontSize: 16,
      titleSpacing: 4,
      titleMarginBottom: 10,
      bodyFontSize: 16,
      callbacks: {
        label: (tooltipItem, data) => {
          // Afficher un tooltip personnalisé sur le dernier positionnement
          let label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          label += Math.round(+tooltipItem.yLabel * 100) / 100;
          if (tooltipItem.label === '?') {
            label = this.rhisTranslateService.translate('PREVISION.EMPTY_BAR_CHART_MESSAGE');
          }
          return label;
        }
      }
    }
  };
  // l'ensemble des libellés à afficher sur le chart
  public barChartLabels: Label[] = [];
  // type du chart
  public barChartType: ChartType = 'bar';
  // Afficher ou non la légende du charte
  public barChartLegend = false;
  // les plugins utilisés pour l'affichage du charte
  public barChartPlugins = [];
  // l'ensemble des données du charte
  public barChartData: { data: number[], label: string, stack: string, backgroundColor: string, hoverBackgroundColor: string }[] = [];
  // les positions du travail
  public columnPositionTravail: PositionTravailModel[];

  public listPositionnementToDisplay: PositionnementModel[] = [];

  // boolean qui permet de savoir si la valeur saisie est une mise à jour d'un poisitionnement existant ou une mise à jour
  public isNewData = false;
  // positionnement sélectionnée sur le graphique
  public selectedChartBar: { idPositionnement: number, selectedPDT: any[] } = {
    idPositionnement: null,
    selectedPDT: []
  };
  // la valeur de CA saisie dans le bandeau de détails
  public newCAValue: number;
  // Les nouvelles positions de travail saisie par l'utilisateur-restaurant
  public newPositions: { label: string, color: string, value: number, idPosition: number }[] = [];
  // Permet d'activer ou désactiver l'affichage du bouton scroll à gauche des positions de travail
  public showPdtScrollLeft: boolean;
  // Permet d'activer ou désactiver l'affichage du bouton scroll à droite des positions de travail
  public showPdtScrollRight: boolean;
  public scrollLeftValue = 0;
  /**
   * les paramètres ci dessous sont utilisés pour le fonctionnement des boutons next et before sur le charte
   * les données de la charte sont tronquées pour en afficher qu'un certain nombre. Un click sur les boutons
   * permet d'afficher plus de données
   */
    // boolean qui permet d'activer/désactiver la saisie dans les cases positions de travail
  public isBannerEditable = false;
  // Nombre maximum de positionnements à afficher sur le graphique
  public displayedDataCounter = 28;
  // index dans barChartData du premier positionnement affiché dans le graphique
  public indexFirstDisplayed = 0;
  // index dans barChartData du dernier positionnement affiché dans le graphique
  public indexLastDisplayed = 0;
  // les données affichés sur le graphique
  public truncatedChartData = [];
  // les libellés affichés sur le graphique
  public truncatedChartLabels = [];
  // Nombre de positionnements affichés dans le graphique
  private truncatedLength: number;
  // Masquer le bouton next s'il n y a plus de données à afficher
  public displayNextButton = true;
  // Masquer le bouton previous si on est au tout début des données à afficher
  public displayPreviousButton = false;

  public selectedPositionnement;

  public tauxMOByRestaurant = 0.0;

  public heightInterface: any;

  @Output()
  public setSelectedPositionnementEvent = new EventEmitter();

  @Output()
  public displayProveUpdateMessage = new EventEmitter();

  private isGraphicMode: boolean;


  @Input()
  set initGraphicMode(isGraphicMode: boolean) {
    this.isGraphicMode = isGraphicMode;
  }

  @Input()
  set initListePositionTravailProductif(columnPositionTravail: any[]) {
    this.columnPositionTravail = columnPositionTravail;
  }

  @Input()
  set initListePositionnement(listPositionnementToDisplay: PositionnementModel[]) {
    this.listPositionnementToDisplay = listPositionnementToDisplay;
    if (this.isGraphicMode) {
      this.reloadChart();
    }
    if (!this.selectedPositionnement) {
      this.selectedPositionnement = new PositionnementModel();
    } else {
      this.isBannerEditable = true;
      this.setValueToPositionTravail();
    }
  }

  @Input()
  set initTauxMOByRestaurant(tauxMOByRestaurant: any) {
    this.tauxMOByRestaurant = (+tauxMOByRestaurant);
  }

  @Input()
  set initNewLoadData(newLoadData: boolean) {
    if (newLoadData) {
      this.unselectPositionement();
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.unselectPositionement();
  }

  constructor(private cdRef: ChangeDetectorRef,
              private rhisTranslateService: RhisTranslateService) {
  }

  ngOnInit() {
    this.selectedPositionnement.venteHoraire = '?';
    this.initializeBannerDetails();
    this.createChart();
  }

  ngAfterViewInit() {
    this.showPdtScrollLeft = false;
    this.showPdtScrollRight = false;
    this.scrollLeftValue = this.widgetsContent.nativeElement.clientWidth;
    if (this.widgetsContent.nativeElement.clientWidth < this.widgetsContent.nativeElement.scrollWidth) {
      this.showPdtScrollRight = true;
    }
    this.cdRef.detectChanges();
  }

  /**
   * Initialise les valeurs des cases positions de travail
   */
  private initializeBannerDetails() {
    this.newPositions = [];
    this.selectedChartBar = {idPositionnement: null, selectedPDT: []};
    const positionsDeTravail = [];
    this.columnPositionTravail.forEach((pdt: PositionTravailModel) => {
      positionsDeTravail.push({label: pdt.libelle, color: pdt.couleur, value: 0, idPosition: pdt.idPositionTravail});
    });
    this.selectedChartBar.selectedPDT = positionsDeTravail;
  }

  /**
   * Génere les données du charte dans le format attendu par ChartJS à partir du payload envoyés par le endpoint
   * @param chartData données envoyées par le endpoint
   */
  private createChart() {
    this.barChartData = [];
    this.barChartLabels = this.listPositionnementToDisplay.map((x: PositionnementModel) => x.venteHoraire.toString());
    this.barChartLabels.push('?');
    this.columnPositionTravail.forEach(pdt => {
      this.barChartData.push(
        {
          data: [],
          label: pdt.libelle,
          stack: 'a',
          backgroundColor: pdt.couleur,
          hoverBackgroundColor: pdt.couleur
        });
    });
    this.listPositionnementToDisplay.forEach(positionnement => {
      const indexPositionnement: number = this.listPositionnementToDisplay.indexOf(positionnement);
      const idPositions = positionnement.positionementPositionTravails.map(ppt => ppt.positionnementPositionTravailID.idPositionPK);
      const libelles: string[] = [];
      idPositions.forEach(id => {
        const postTravail = this.columnPositionTravail.find(pdt => pdt.idPositionTravail === id);
        if (postTravail) {
          libelles.push(postTravail.libelle);
        }
      });
      if (positionnement.positionementPositionTravails.length === 0) {
        const newEmptyData = [];
        for (let i = 0; i < this.barChartLabels.length - 1; i++) {
          if (i === indexPositionnement) {
            if (this.listPositionnementToDisplay.length === 0) {
              latestData.push(0.5);
            } else {
              const indeex = this.listPositionnementToDisplay.findIndex(item => +(item.venteHoraire) === +(this.barChartLabels[this.barChartLabels.length - 2]));
              const lastNewEmpty = 0.5 + ((+(this.listPositionnementToDisplay[indeex].effectif) * 20) / 100);
              newEmptyData.push(lastNewEmpty);
            }
          } else {
            newEmptyData.push(0);
          }
        }
        this.barChartData.push(
          {
            data: newEmptyData,
            label: '',
            stack: 'a',
            backgroundColor: '#030303',
            hoverBackgroundColor: '#030303'
          });
      } else {
        positionnement.positionementPositionTravails.forEach(positionementPositionTravail => {
          const positionDeTravail = this.columnPositionTravail.find(pdt => {
            return pdt.idPositionTravail === positionementPositionTravail.positionnementPositionTravailID.idPositionPK;
          });
          if (positionDeTravail) {
            const libelle = positionDeTravail.libelle;
            this.barChartData.forEach((barChartSingleData) => {
              if (barChartSingleData.label === libelle) {
                if (positionementPositionTravail.valeur === null) {
                  positionementPositionTravail.valeur = 0;
                }
                barChartSingleData.data[indexPositionnement] = +positionementPositionTravail.valeur;
              }
              if (!libelles.includes((barChartSingleData.label))) {
                barChartSingleData.data[indexPositionnement] = 0;
              }
            });
          }
        });
      }
    });
    // Ajouter un positionnement vide pour l'ajout des donnnées au charte
    this.barChartData.forEach(barChartSingleData => barChartSingleData.data.push(0));
    const latestData = [];
    for (let i = 0; i < this.barChartLabels.length - 1; i++) {
      latestData.push(0);
    }

    if (this.listPositionnementToDisplay.length === 0) {
      latestData.push(0.5);
    } else {
      const index = this.listPositionnementToDisplay.findIndex(item => +(item.venteHoraire) === +(this.barChartLabels[this.barChartLabels.length - 2]));
      const lastValue = 0.5 + ((+(this.listPositionnementToDisplay[index].effectif) * 20) / 100);
      latestData.push(lastValue);
    }

    this.barChartData.push(
      {
        data: latestData,
        label: '',
        stack: 'a',
        backgroundColor: '#030303',
        hoverBackgroundColor: '#030303'
      });
    setTimeout(() => {
      this.setDefaultSelectedPositionnement(this.indexLastDisplayed - 2);
    }, 500);

  }

  private setDefaultSelectedPositionnement(indexPositionnementToSelect: number) {
    this.selectedPositionnement = this.listPositionnementToDisplay[indexPositionnementToSelect];
    this.isBannerEditable = true;
    this.setValueToPositionTravail();
  }

  /**
   * Affiche plus de positions de travail dans la barre de détails (scroll à droite)
   */
  public scrollRight(): void {
    this.widgetsContent.nativeElement.scrollTo({
      left: (this.widgetsContent.nativeElement.scrollLeft + 130),
      behavior: 'smooth'
    });
    if (this.widgetsContent.nativeElement.scrollLeft + 160 + this.widgetsContent.nativeElement.clientWidth
      >= this.widgetsContent.nativeElement.scrollWidth) {
      this.showPdtScrollRight = false;
    }
    this.showPdtScrollLeft = true;
  }

  /**
   * Affiche moins de positions de travail dans la barre de détails (scroll à gauche)
   */
  public scrollLeft(): void {
    this.widgetsContent.nativeElement.scrollTo({
      left: (this.widgetsContent.nativeElement.scrollLeft - 130),
      behavior: 'smooth'
    });
    if (this.widgetsContent.nativeElement.scrollLeft - 160 <= 0) {
      this.showPdtScrollLeft = false;
    }
    this.showPdtScrollRight = true;
  }

  /**
   * Pour chaque click sur un positionnement, rendre les cases poisitions de travail éditable pour permettre la mise à jour/ ajout
   * de données
   * @param e event
   */
  public chartClicked(e) {
    this.unselectPositionement();
    this.isBannerEditable = false;
    this.isNewData = false;
    this.initializeBannerDetails();
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        this.isBannerEditable = true;
        const clickedElementIndex = activePoints[0]._index;
        this.selectedPositionnement = this.listPositionnementToDisplay[clickedElementIndex + this.indexFirstDisplayed];
        // si le dernier positionnement du charte est selectionné, il s'agit d'un ajout de données
        if (clickedElementIndex === this.indexLastDisplayed - 1) {
          this.isNewData = true;
        }
        if (this.selectedPositionnement) {
          this.setValueToPositionTravail();
        } else {
          this.selectedPositionnement = new PositionnementModel();
        }
      }
    }
  }

  private setValueToPositionTravail() {
    this.setSelectedPositionnementEvent.emit(this.selectedPositionnement);
    const idsPositionPK: number[] = this.selectedPositionnement.positionementPositionTravails
      .map(positionementPositionTravail => positionementPositionTravail.positionnementPositionTravailID.idPositionPK);
    this.selectedChartBar = {idPositionnement: null, selectedPDT: []};
    const selectedPDT = [];
    this.columnPositionTravail.forEach((pdt: PositionTravailModel) => {
      const label = pdt.libelle;
      const color = pdt.couleur;
      let value = 0;
      let positionementPositionTravails = null;
      if (idsPositionPK.includes(pdt.idPositionTravail)) {
        positionementPositionTravails = this.selectedPositionnement.positionementPositionTravails
          .find(x => x.positionnementPositionTravailID.idPositionPK === pdt.idPositionTravail);
        value = positionementPositionTravails.valeur;
      }
      selectedPDT
        .push({label: label, color: color, value: value, idPosition: pdt.idPositionTravail});
    });
    this.selectedChartBar = {
      idPositionnement: this.selectedPositionnement.idPositionement,
      selectedPDT: selectedPDT
    };
  }

  /**
   * Mise à jour du charte après la saisie des données dans une case position de travail
   * @param newPosition Objet représentant les nouvelles valeurs saisies, les labels et les id des positions de travail correspondants
   */
  public updateChart(newPosition: { label: string, color: string, value: number, idPosition: number }) {
    let positionDeTravail: { idPosition: number, value: number } = null;
    if (newPosition) {
      positionDeTravail = {idPosition: newPosition.idPosition, value: +newPosition.value};
    }
    if (!this.isNewData) {
      this.updateChartData(positionDeTravail, this.selectedChartBar.idPositionnement, this.newCAValue);
      this.createChart();
      this.truncateChart();
    } else {
      this.addDataToChart(positionDeTravail);
      this.createChart();
      this.truncateChart();
      this.isNewData = false;
      this.selectedVentesHoraires = this.newCAValue.toString();
    }
    this.selectedEffectif = this.listPositionnementToDisplay
      .find(x => x.idPositionement === this.selectedChartBar.idPositionnement).effectif;
  }

  /**
   * Ajout de données au charte après la saisie des données dans une case position de travail
   * @param positionDeTravail Objet représentant les nouvelles valeurs saisies et les labels des positions de travail correspondants
   */
  private addDataToChart(positionDeTravail: { idPosition: number, value: number }) {
    this.setUniqueIdentifier(this.selectedPositionnement);
    this.selectedPositionnement.venteHoraire = +this.newCAValue;
    this.listPositionnementToDisplay.push({...this.selectedPositionnement});
    this.listPositionnementToDisplay.sort((a, b) => a.venteHoraire - b.venteHoraire);
    this.reloadChart();
    if (this.indexLastDisplayed > this.indexFirstDisplayed + this.displayedDataCounter) {
      this.indexLastDisplayed = this.indexFirstDisplayed + this.displayedDataCounter;
      this.displayNextButton = true;
    }
  }

  /**
   * Permet de creer un string de 32 char utilise comme identifiant unique
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  private setUniqueIdentifier(positionnement: PositionnementModel) {
    positionnement.idPositionement = this.makeString();
    if (this.listPositionnementToDisplay.findIndex(item => item.idPositionement === positionnement.idPositionement) !== -1) {
      this.setUniqueIdentifier(positionnement);
    }
  }

  /**
   * Permet de charger les données suivantes suite à un click sur le bouton sur le charte
   */
  public loadNextData() {
    this.isBannerEditable = false;
    this.initializeBannerDetails();
    this.indexFirstDisplayed = this.indexLastDisplayed;
    this.indexLastDisplayed = this.indexFirstDisplayed + this.displayedDataCounter;
    const maxLength = this.barChartLabels.length;
    if (this.indexLastDisplayed > maxLength) {
      this.indexLastDisplayed = maxLength;
    }
    if (this.indexFirstDisplayed < maxLength) {
      this.truncateChart();
    } else {
      this.indexLastDisplayed = maxLength;
      this.indexFirstDisplayed = this.indexLastDisplayed - this.truncatedLength;
    }
    if (this.indexLastDisplayed === this.barChartLabels.length) {
      this.displayNextButton = false;
    }
    if (this.indexFirstDisplayed !== 0) {
      this.displayPreviousButton = true;
    }
  }

  /**
   * Permet de charger les données précédentes suite à un click sur le bouton sur le charte
   */
  public loadPreviousData() {
    this.displayNextButton = true;
    this.isBannerEditable = false;
    this.initializeBannerDetails();
    const maxLength = this.barChartLabels.length;
    this.indexLastDisplayed = this.indexFirstDisplayed;
    this.indexFirstDisplayed = this.indexLastDisplayed - this.displayedDataCounter;
    if (this.indexFirstDisplayed >= 0) {
      this.truncateChart();
    } else {
      this.indexFirstDisplayed = 0;
      if (this.indexLastDisplayed !== 0) {
        this.truncateChart();
      }
      this.indexLastDisplayed = this.indexFirstDisplayed + this.displayedDataCounter;
      if (this.indexLastDisplayed > maxLength) {
        this.indexLastDisplayed = maxLength;
      }
    }
    if (this.indexFirstDisplayed === 0) {
      this.displayPreviousButton = false;
    }
  }

  /**
   * Génére les données des positionnements affichés sur le charte à partir de l'ensemble des données du charte, les index de début et
   * de fin ainsi que le nombre de positionnement à afficher
   */
  private truncateChart() {
    this.truncatedChartLabels = [];
    this.truncatedChartData = [];
    this.barChartData.forEach(barChartSingleData => {
      this.truncatedChartData.push({
        data: barChartSingleData.data.slice(this.indexFirstDisplayed, this.indexLastDisplayed),
        label: barChartSingleData.label,
        stack: barChartSingleData.stack,
        backgroundColor: barChartSingleData.backgroundColor,
        hoverBackgroundColor: barChartSingleData.hoverBackgroundColor
      });
    });
    this.truncatedChartLabels = this.barChartLabels.slice(this.indexFirstDisplayed, this.indexLastDisplayed);
    this.truncatedLength = this.truncatedChartLabels.length;
  }

  public reloadChart() {
    this.indexFirstDisplayed = 0;
    this.indexLastDisplayed = 0;
    this.displayPreviousButton = false;
    this.displayNextButton = true;
    this.newPositions = [];
    this.isNewData = false;
    this.newCAValue = null;
    this.createChart();
    this.loadNextData();
  }

  public controlNewCA(event) {
    if (event.which === 13 || event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
    if (event.which === 13 && !isNaN(event.target.textContent) && event.target.textContent >= 0) {
      event.target.blur();
    }
  }

  public getNewCA(event) {
    if (event.target.textContent !== '' && event.target.textContent >= 0) {
      if (!isNaN(event.target.textContent) && event.target.textContent >= 0) {
        this.newCAValue = event.target.textContent;
        this.updateChart(null);
      } else {
        event.preventDefault();
      }
    } else {
      event.target.textContent = this.selectedVentesHoraires;
    }
  }


  public getChartNewValues(newPosition: { label: string, color: string, value: number, idPosition: number }) {
    this.newPositions.push(newPosition);
    const index = this.selectedPositionnement.positionementPositionTravails.findIndex(item => item.positionnementPositionTravailID.idPositionPK === newPosition.idPosition);
    if (index !== -1) {
      this.displayProveUpdateMessage.emit({
        newElement: false,
        positionnement: this.selectedPositionnement,
        newValue: +newPosition.value,
        idPositionTravail: newPosition.idPosition

      });
    } else {
      this.displayProveUpdateMessage.emit({
        newElement: true,
        positionnement: this.selectedPositionnement,
        newValue: +newPosition.value,
        idPositionTravail: newPosition.idPosition

      });
    }

  }

  /**
   * Mets à jour les données du charte
   * @param positionDeTravail Objet qui représente la nouvelle valeur saisie
   * @param idPositionement Id du positionnement à mettre à jour
   * @param newCAValue nouvelle valeur de ventes saisie
   */
  public updateChartData(positionDeTravail: { idPosition: number, value: number },
                         idPositionement: number, newCAValue: number) {
    let positionnement = null;
    positionnement = this.listPositionnementToDisplay.find(pos => pos.idPositionement === idPositionement);

    const positionementPositionTravails = positionnement.positionementPositionTravails;
    let exist = false;
    if (positionDeTravail) {
      positionementPositionTravails.forEach(ppt => {
        if (ppt.positionnementPositionTravailID.idPositionPK === positionDeTravail.idPosition) {
          positionnement.effectif = +positionnement.effectif - +ppt.valeur + +positionDeTravail.value;
          ppt.valeur = +positionDeTravail.value;
          exist = true;
        }
      });
      if (!exist) {
        positionementPositionTravails
          .push(
            {
              positionnementPositionTravailID: {
                idPostitionementPK: idPositionement, idPositionPK: positionDeTravail.idPosition
              }, valeur: positionDeTravail.value
            }
          );
        positionnement.effectif = +positionnement.effectif + +positionDeTravail.value;
      }
    }
    if (newCAValue) {
      positionnement.venteHoraire = newCAValue;
    }
    this.updatePositionnementEffectif(positionnement);
    this.listPositionnementToDisplay.sort((a, b) => a.venteHoraire - b.venteHoraire);
  }

  private updatePositionnementEffectif(positionnement: PositionnementModel) {
    let totalEffectif = 0;
    positionnement.positionementPositionTravails.forEach(item => {
      if (item.valeur === null) {
        item.valeur = 0;
      }
      totalEffectif += +item.valeur;
    });
    positionnement.effectif = totalEffectif;
    this.updatePositionnementProductivite(positionnement);
  }

  private updatePositionnementProductivite(positionnement: PositionnementModel) {
    if (+positionnement.effectif === 0) {
      positionnement.productivite = 0;
    } else {
      positionnement.productivite = +(((+positionnement.venteHoraire) / (+positionnement.effectif)).toFixed(2));
    }
    this.updatePourcentageColEmpl(positionnement);
  }

  private updatePourcentageColEmpl(positionnement: PositionnementModel) {
    if (+(positionnement.venteHoraire) === 0) {
      positionnement.pourcentageCol = 0;
    } else {
      positionnement.pourcentageCol = +(((((+(positionnement.effectif) * this.tauxMOByRestaurant)) / (+(positionnement.venteHoraire))) * 100).toFixed(2));
    }
  }


  /**
   * Ajoute des données au charte
   * @param positionDeTravail nouvelles positions de travail ajoutées
   * @param newCAValue nouvelle valeur de ventes saisie
   * @param idPositionnement Id du nouveau positionnement
   */
  public addToChartData(positionDeTravail: { idPosition: number, value: number },
                        newCAValue: number, idPositionnement: number) {
    let positionementPositionTravails = [];
    if (positionDeTravail) {
      positionementPositionTravails = [{
        positionnementPositionTravailID: {
          idPostitionementPK: idPositionnement,
          idPositionPK: positionDeTravail.idPosition
        },
        valeur: +positionDeTravail.value
      }];
    }
    this.updatePositionnementEffectif(this.listPositionnementToDisplay[this.listPositionnementToDisplay.findIndex(item => item.idPositionement === idPositionnement)]);
    this.listPositionnementToDisplay.sort((a, b) => a.venteHoraire - b.venteHoraire);
    this.listPositionnementToDisplay.push(new PositionnementModel());
  }

  public unselectPositionement() {
    this.selectedPositionnement = new PositionnementModel();
    this.selectedPositionnement.venteHoraire = '?';
    this.isBannerEditable = false;
    this.initializeBannerDetails();
    this.setSelectedPositionnementEvent.emit(null);
  }
}
