import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ComparativePerformanceSheet} from 'src/app/shared/model/analysePerformanceModel';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {RapportService} from '../../home/employes/service/rapport.service';
import {SharedService} from '../services/shared.service';

@Component({
  selector: 'rhis-generation-rapport-parc',
  templateUrl: './generation-rapport-parc.component.html',
  styleUrls: ['./generation-rapport-parc.component.scss']
})
export class GenerationRapportParcComponent implements OnInit, OnDestroy {
  public firstTab = this.translateService.translate('GESTION_PARC_RAPPORT.FIRST_TAB');
  public secondTab = this.translateService.translate('GESTION_PARC_RAPPORT.SECOND_TAB');
  public secondTabTooltipText = this.translateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.GENERATE_REPORT_FIRST');
  public libelleRapport: string;
  public rapportCodeName: string;
  public uuidRapport: string;
  public idRapport: any;
  public heightInterface: any;
  public reportViewer: any;
  public documentName: string;
  public totalRecords = 7;
  public buttonExport = false;
  public selectedReport: any;
  public generatedReport = false;
  public showSpinner = false;
  public comparatif = true;
  public listRestoUuids = [];
  public first = 0;
  public envoiParams: any;
  public typePeriode = '';
  public data: ComparativePerformanceSheet;
  public showPaginator = false;

  constructor(private translateService: RhisTranslateService,
              private activatedRoute: ActivatedRoute,
              private rapportService: RapportService,
              public sharedService: SharedService) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.envoi) {
        this.envoiParams = JSON.parse(params.envoi);
      }
      this.libelleRapport = params.libelle;
      this.uuidRapport = params.uuid;
      this.idRapport = params.idRapport;
      this.rapportCodeName = params.codeName;
    });
  }

  ngOnInit() {
    this.sharedService.buttonExport.subscribe((data: boolean) => {
      this.buttonExport = data;
    });
  }

  ngOnDestroy() {
    this.sharedService.initParametreRapport();
  }

  public generateReportData(event: any) {
    if (event.hasOwnProperty('comparatif')) {
      this.comparatif = event.comparatif;
    }
    if (event.data && event.data.typePeriodeCalcul) {
      this.typePeriode = event.data.typePeriodeCalcul;
    }
    this.documentName = event.documentName;
    if (event.firstGeneration) {
      if (event.listUuids) {
        this.listRestoUuids = event.listUuids;
        if (event.hasOwnProperty('comparatif') && event.comparatif) {
          //Case Comparatif restaurants (rapport analyse performance)
          this.totalRecords = Math.ceil(event.listUuids.length / 10);
        } else {
          // Case of 1 page per restaurant
          this.totalRecords = event.listUuids.length;
        }
        this.first = 0;
      } else {
        // Case of compare restaurants
        this.first = 0;
        this.listRestoUuids = event.restaurants;
        this.totalRecords = 7;
      }
    }
    this.showDocument(event);
  }

  private showDocument(event: any): void {
    if (this.rapportCodeName === 'PERFORMANCE_RAPPORT') {
      this.showPerformanceTable(event);
    } else if (this.rapportCodeName === 'POSTES_TRAVAIL_RAPPORT') {
      this.showPosteTravailTable(event);
    } else {
      this.showPDF(event.resumePlgSrc);
      this.showPaginator = this.listRestoUuids.length > 1;
    }
  }

  private showPerformanceTable(event: any): void {
    this.generatedReport = true;
    if (event.data) {
      const data = event.data;
      this.reportViewer = {
        startDate: data.startDate,
        header: data.header,
        filter: data.filter,
        performanceValues: data.performanceValues,
        ecart: data.ecart,
        spMode: data.spMode,
        tableTitle: data.restaurantName
      };
      this.showPaginator = this.listRestoUuids.length > 1;
    } else {
      this.data = event.fileData;
      this.showPaginator = this.listRestoUuids.length > 10;
    }
  }

  private showPosteTravailTable(event: any): void {
    this.generatedReport = true;
    if (event.data) {
      if (!event.comparatif) {
        this.listRestoUuids = event.restaurants;
        this.totalRecords = event.restaurants.length;
        this.showPaginator = event.restaurants.length > 1;
        if (event.firstGeneration) {
          this.first = 0;
        }
      } else {
        this.showPaginator = false;
      }
      this.data = event;
    }
  }

  private async showPDF(data: any): Promise<void> {
    this.reportViewer = await this.rapportService.createDocument(data);
    this.generatedReport = true;
  }

  exportButtonClick() {
    this.sharedService.export.next();
  }

  public onChangeReport(event: any): void {
    this.selectedReport = event;
    this.selectedReport = Object.assign({}, this.selectedReport);
    this.first = event.first;
  }

  public displaySpinner(event: any): void {
    this.showSpinner = event;
    if (!event) {
      this.sharedService.buttonExport.next(true);
    }
  }
}
