import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KeyValue} from '@angular/common';
import {Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {RapportStorageService} from '../../../../../service/rapport-storage.service';
// 'POPUP_RAPPORT.DISPLAY_WEEK'
export enum PdfSections {
  TPAMPM = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_AM_PM',
  SS = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_SS',
  PM = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_PM',
  DP = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_DP',
  VAMPM = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_VAMPM',
  VTAC = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_VTAC',
  PROD = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_PROD',
  MOEM = 'RAPPORT_PLANNING_JOURNALIER.POPUP_RAPPORT_TP_MOEM'
}

@Component({
  selector: 'rhis-popup-planning-journalier',
  templateUrl: './popup-planning-journalier.component.html',
  styleUrls: ['./popup-planning-journalier.component.scss']
})
export class PopupPlanningJournalierComponent implements OnInit {

  /**
   * Liste des sections du PDF
   */
  public pdfSections = PdfSections;

  /**
   * Afficher la pop-up de sélection des sections à inclure dans le pdf
   */
  public showPdfSections = false;

  /**
   * Date à afficher dans le pdf
   */
  public selectedDate_pdf: string;
  /**
   * Liste des sections sélectionnés pour être affichées dans le pdf
   */
  public selectedSectionsValues: string[];
  /**
   * Liste des sections sélectionnés pour être affichées dans le pdf à transmettre au composant fils
   */
  public selectedSectionsValues_pdf: string[];
  @Input() selectedDate: Date;
  @Input() planningEquipierShow = true;
  public choosenDate: Date;
  public heureSeparation: Date;
  public mode = true;
  public sortTypes = [
    {'sortName': this.translator.translate('RAPPORT_PLANNING_JOURNALIER.EMPLOYE'), 'sortValue': 0},
    {'sortName': this.translator.translate('RAPPORT_PLANNING_JOURNALIER.ARRIVER'), 'sortValue': 1}
  ];
  public sortBy = this.sortTypes[0];
  public labelSemaine = this.translator.translate('POPUP_RAPPORT.DISPLAY_WEEK');
  public displayWeek = false;
  /**
   * Section PROD sélectionné
   */
  private prodSelected = false;
  /**
   * section MOEM sélectionné
   */
  private moemSelected = false;

  public dateNotExist = false;
  @Output() public openPopup = new EventEmitter();

  constructor(
    private router: Router,
    private rhisRoutingService: RhisRoutingService,
    private translator: RhisTranslateService,
    private rapportStorageService: RapportStorageService
  ) {
  }

  /**
   * Fonction à utiliser dans le pipe keyvalue pour garder le tri original de l'énumération
   * @param a keyvalue
   * @param b keyvalue
   */
  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };

  ngOnInit() {
    this.getDataFromLocalStorage();
    this.onSectionsSelectionChange();
  }

  public getDataFromLocalStorage() {
    this.mode = this.rapportStorageService.getPdfPlanningJournalierSettings().payasage;
    this.sortBy = this.rapportStorageService.getPdfPlanningJournalierSettings().sortingCriteria;
    this.selectedSectionsValues = this.rapportStorageService.getPdfPlanningJournalierSettings().selectedValue;
    const heureSep = this.rapportStorageService.getPdfPlanningJournalierSettings().heureSeparation;
    this.heureSeparation = new Date(heureSep);
    this.displayWeek = this.rapportStorageService.getPdfPlanningJournalierSettings().displayWeek;
  }

  /**
   * Valider la sélection des sections du PDF
   */
  public validatePdfSectionsSelection() {
    if (!this.planningEquipierShow) {
      if (!this.choosenDate) {
        this.dateNotExist = true;
      } else {
        this.dateNotExist = false;
        this.viewPdfRapportJournalier();
      }
    } else {
      this.dateNotExist = false;
      this.viewPdfRapportJournalier();
    }

  }

  public viewPdfRapportJournalier() {
    const data = {
      payasage: this.mode,
      sortingCriteria: this.sortBy,
      selectedValue: this.selectedSectionsValues,
      heureSeparation: this.heureSeparation,
      displayWeek: this.displayWeek
    };
    this.rapportStorageService.setPdfPlanningJournalierSettings(data);
    this.showPdfSections = false;
    this.openPdfView();
    this.openPopup.emit(false);
  }

  /**
   * Ouvrir la vue PDF
   */
  public openPdfView() {
    // this.options_pdf = _.cloneDeep(GRIDSTER_OPTIONS);
    // this.planning_pdf = _.cloneDeep(this.planningSemaineService.getWeekPlanning(new Date(this.selectedDate)));
    // this.hours_pdf = this.hours;
    // this.employees_pdf = this.employees;

    this.selectedSectionsValues_pdf = this.selectedSectionsValues;
    if (this.selectedDate) {
      this.selectedDate_pdf = new Date(this.selectedDate).toDateString();
    } else {
      this.selectedDate_pdf = this.choosenDate.toDateString();
    }
    let heure = '' + this.heureSeparation.getHours();
    if (+heure < 10) {
      heure = '0' + heure;
    }
    let minute = '' + this.heureSeparation.getMinutes();
    if (+minute < 10) {
      minute = '0' + minute;
    }
    const url = this.router.createUrlTree([this.rhisRoutingService.getRoute('HOME_PLANNING_EQUIPIER') + '/pdf/'
    + this.selectedDate_pdf + '/' + heure + '/' + minute + '/' + this.displayWeek + '/' + this.sortBy.sortValue + '/' + this.mode + '/' +
    ((this.selectedSectionsValues_pdf || (this.selectedSectionsValues_pdf && this.selectedSectionsValues_pdf.length === 0)) ? this.selectedSectionsValues_pdf.join(',') : 'TPAMPM')]);
    window.open(url.toString(), '_blank');
  }

  public checkProdMoem(param: string) {
    if (param === 'PROD') {
      this.prodSelected = !this.prodSelected;
    } else if (param === 'MOEM') {
      this.moemSelected = !this.moemSelected;
    }
  }

  /**
   * Empêcher la sélection de Prod et M.O. equ+mgr en même temps
   */
  public onSectionsSelectionChange() {
    if (this.selectedSectionsValues.includes('PROD')) {
      this.prodSelected = true;
    }
    if (this.selectedSectionsValues.includes('MOEM')) {
      this.moemSelected = true;
    }
  }

}

