import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {RapportService} from '../../../../../modules/home/employes/service/rapport.service';
import {RapportModel} from '../../../../model/rapport.model';
import {ActivatedRoute, Router} from '@angular/router';
import {EmployeeService} from '../../../../../modules/home/employes/service/employee.service';
import {SharedEmployeeService} from '../../../../../modules/home/employes/service/sharedEmployee.service';
import {EmployeeModel} from '../../../../model/employee.model';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {DataReportsModel} from '../../../../model/data.reports.model';
import {RestaurantModel} from '../../../../model/restaurant.model';
import {RestaurantService} from '../../../../service/restaurant.service';
import {NotificationService} from '../../../../service/notification.service';
import * as FileSaver from 'file-saver';
import {MailModel} from '../../../../model/mail.model';
import {GenerationReport} from '../../../../enumeration/generation.rapport';
import {ContratService} from '../../../../../modules/home/employes/service/contrat.service';
import {ContratModel} from '../../../../model/contrat.model';
import {DateService} from '../../../../service/date.service';
import {RapportContrat} from '../../../../enumeration/rapportContrat';
import {DomControlService} from '../../../../service/dom-control.service';
import {ConfirmationService} from 'primeng/api';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {SharedRestaurantListService} from 'src/app/shared/service/shared-restaurant-list.service';
import {SessionService} from 'src/app/shared/service/session.service';
import * as rfdc from 'rfdc';


@Component({
  selector: 'rhis-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss']
})
export class RapportComponent implements AfterViewInit, OnInit {
  public listRapport: RapportModel[];
  public reportUpdate = {} as RapportModel;
  public clone = rfdc();

  private idEmployee: string;
  public dataReport = {} as DataReportsModel;
  public restaurant = new RestaurantModel();
  public langue: String;
  public isReportShown = false;
  public reportViewer: any;
  public titleReport: string;
  // exporter en format  pdf
  public view: number;
  public nameFile: string;
  public categorie: string;
  public contratOrAvenant: any;
  public header;
  public showMailPopup = false;
  public mailReposTitle: string;
  // verification pour envoyer email
  public sendMail: number;
  public isReportGenerationLoader = false;
  public reportGenerationLabel: string;
  public reportGenerationTitle = this.rhisTranslateService.translate('REPORT.GENERATOR_LOADER_TITLE');
  public listContrat: ContratModel[];
  public contrat = {} as ContratModel;
  public viewFileAndDisplayContrat = false;
  public printFileAndDisplayContrat = false;
  public downloadFileAndDisplayContrat = false;
  public sendMailFileAndDisplayContrat = false;
  public popupSelectContratOrAvenant = false;
  public contratId: string;
  public listContratAndAvenant: ContratModel[];
  public listAvenant: ContratModel[];
  public listContratDisplay: ContratModel[];
  private ecran = 'GRH';

  public heightWindow: any;
  public maxHeightPopUpRapport: any;
  public emptySpaceBtwRelativeToVertical = 260;
  public heightInterface: any;
  public content = '';
  public operationIconText: string;
  public displayRestoList = false;
  public listRestoSource: any;
  public listRestoDestination: any;
  public restaurantSource: any;
  public showPopup = false;
  public submitButtonText = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  public listRestoIds = [];
  public deleteRapport: Boolean = false;
  public rapportToDelete: any;
public selectedRestaureant: any = {};
  constructor(private rapportService: RapportService,
              private route: ActivatedRoute,
              private employeeService: EmployeeService,
              private sharedEmployee: SharedEmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private restaurantService: RestaurantService,
              private notificationService: NotificationService,
              private translateService: RhisTranslateService,
              private contratService: ContratService,
              private dateService: DateService,
              private router: Router,
              private domControlService: DomControlService,
              private confirmationService: ConfirmationService,
              private sharedRestoService: SharedRestaurantListService,
              private sessionService: SessionService) {


  }

  ngOnInit() {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    this.header = [
      {title: this.rhisTranslateService.translate('REPORT.INTITULE'), field: 'description'},
      {title: this.rhisTranslateService.translate('REPORT.CATEGORIE'), field: 'categorie'},
      {title: this.rhisTranslateService.translate('REPORT.DERNIERE'), field: 'lastUsed'}
    ];
    if (this.router.url.includes('parc')) {
      this.displayRestoList = true;
      let uuidRestaurant;
      if (regexExp.test(this.sessionService.getRestaurantUUIdForReport())) {
        uuidRestaurant = this.sessionService.getRestaurantUUIdForReport();
      }
      this.header.push({title: this.rhisTranslateService.translate('REPORT.RESTAURANT'), field: 'restaurant'});
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestoSource = result;
        if (this.listRestoSource.length) {

        //  this.listRestoDestination = !uuidRestaurant ? this.listRestoSource.filter((val: any) => val.uuid !== this.listRestoSource[0].uuid) : this.listRestoSource.filter((val: any) => val.uuid !== uuidRestaurant);
          this.listRestoDestination = [...this.listRestoSource];
          this.getListRapportParc(!uuidRestaurant ? this.listRestoSource[0].uuid : uuidRestaurant);
          this.restaurantSource = !uuidRestaurant ? this.listRestoSource[0] : this.listRestoSource.filter((val: any) => val.uuid === uuidRestaurant)[0];
          if (uuidRestaurant) {
            const restaurantIndexToBeDeleted = this.listRestoSource.findIndex(restau => restau.uuid === uuidRestaurant);
            if (restaurantIndexToBeDeleted !== -1) {
              this.listRestoSource.splice(restaurantIndexToBeDeleted, 1);
              this.listRestoSource.unshift(this.clone(this.restaurantSource));
            }
          }
        }

      });
    } else {
      this.displayRestoList = false;
      this.route.parent.params.subscribe(params => {
        this.idEmployee = params.idEmployee;
        this.getInfoEmployees();
      });
    }
  }

  /**
   * get all reports
   **/
  public getListRapport() {
    this.rapportService.getAllRapportByRestaurant().subscribe(
      (data: RapportModel[]) => {
        this.listRapport = data;
        this.listRapport.forEach((rapport: RapportModel) => {
          rapport.categorieType = rapport.categorie;
          rapport.categorie = this.rhisTranslateService.translate('RAPPORT_CATEGORIE.' + rapport.categorie);
        }
      );
      }, (err: any) => {

      }
    );
  }

  /**
   * get all reports gestion parc
   **/
  public getListRapportParc(uuidResto: string) {
    this.rapportService.getAllRapportParc(uuidResto, (this.sessionService.getUuidFranchise() ? '*' : this.sessionService.getUuidUser()), (this.sessionService.getUuidFranchise() ? this.sessionService.getUuidFranchise() : '*')).subscribe(
      (data: RapportModel[]) => {
        this.listRapport = data;
        this.listRapport.forEach((rapport: RapportModel) => {
          rapport.categorie = this.rhisTranslateService.translate('RAPPORT_CATEGORIE.' + rapport.categorie);
          rapport.restaurants = rapport.lib.split(',');
          if (rapport.restaurants.length === this.listRestoSource.length && rapport.restaurants.length > 1) {
            rapport.restaurants = [];
            rapport.restaurants[0] = this.rhisTranslateService.translate('REPORT.ALL');
          }
          if (rapport.restaurants.length === 1 && rapport.restaurants[0] === '') {
            rapport.restaurants[0] = '-';
          }
        });
        this.listRapport.sort((rapport1, rapport2) => {
          if (rapport1.description.toLowerCase() > rapport2.description.toLowerCase()) {
            return 1;
          }
          if (rapport1.description.toLowerCase() < rapport2.description.toLowerCase()) {
            return -1;
          }
          return 0;
        });

      }, (err: any) => {

      }
    );
  }

  public changeReports(): void {
   // this.listRestoDestination = this.listRestoSource.filter((val: any) => val.uuid !== this.restaurantSource.uuid);
    this.listRestoDestination = [...this.listRestoSource];
    this.sessionService.setRestaurantUUidForReport(this.restaurantSource.uuid);
    this.getListRapportParc(this.restaurantSource.uuid);
  }

  closePopup() {
    this.showPopup = false;
  }

  showPopupListResto() {
    this.showPopup = true;
    this.deleteRapport = false;
    this.submitButtonText = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
    this.listRestoDestination = this.listRestoSource.filter((val: any) => val.uuid !== this.restaurantSource.uuid);
  }

  showPopupListRestoDelete(rapport) {
    if (this.sessionService.getProfil() === 'superviseur') {
      this.getRestaurantsByRapportDescriptionAndFranchise(this.sessionService.getUuidFranchise(), rapport);
    } else {
      this.getRestaurantsByRapportDescriptionAndUser(this.sessionService.getUuidUser(), rapport);
    }
  }

  private getRestaurantsByRapportDescriptionAndFranchise(uuidFranchise: string, rapport: RapportModel) {
    this.rapportService.getRestaurantsByRapportDescriptionAndFranchise(uuidFranchise, rapport.description).subscribe((data: RapportModel[]) => {
      this.selectedRestaureant = data.filter((val: any) => val.uuid === this.restaurantSource.uuid)[0];
      this.listRestoDestination = [...data];
      this.listRestoDestination.sort((resto1, resto2) => {
        if (resto1.libelleRestaurant.toLowerCase() > resto2.libelleRestaurant.toLowerCase()) {
          return 1;
        }
        if (resto1.libelleRestaurant.toLowerCase() < resto2.libelleRestaurant.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      this.showPopup = true;
      this.deleteRapport = true;
      this.rapportToDelete = rapport;
      if (this.listRestoDestination.length === 1) {
        setTimeout(() => {
          const multiselectElementLabel = document.getElementsByClassName('ui-multiselect-label ui-corner-all')[0] as HTMLElement;
          const multiselectElementArrow = document.getElementsByClassName('ui-multiselect-trigger-icon ui-clickable pi pi-chevron-down')[0] as HTMLElement;
          const multiselectElementTrigger = document.getElementsByClassName('ui-multiselect-trigger ui-state-default ui-corner-right')[0] as HTMLElement;
          multiselectElementLabel.style.backgroundColor = '#d7d3d3';
          multiselectElementLabel.style.height = '31px';
          multiselectElementTrigger.style.backgroundColor = '#d7d3d3';
          multiselectElementLabel.style.cursor = 'not-allowed';
          multiselectElementTrigger.style.cursor = 'not-allowed';
          multiselectElementArrow.style.display = 'none';
        }, 100);
      }
      this.submitButtonText = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.DELETE_POPUP');
    }, error => {
      console.log('cannot get list restaurant with description : ' + rapport.description);
    });
  }

  private getRestaurantsByRapportDescriptionAndUser(uuidUser: string, rapport: RapportModel) {
    this.rapportService.getRestaurantsByRapportDescriptionAndUser(uuidUser, rapport.description).subscribe((data: RapportModel[]) => {
      this.selectedRestaureant = data.filter((val: any) => val.uuid === this.restaurantSource.uuid)[0];
      this.listRestoDestination = [...data];
      this.listRestoDestination.sort((resto1, resto2) => {
        if (resto1.libelleRestaurant.toLowerCase() > resto2.libelleRestaurant.toLowerCase()) {
          return 1;
        }
        if (resto1.libelleRestaurant.toLowerCase() < resto2.libelleRestaurant.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      this.showPopup = true;
      this.deleteRapport = true;
      this.rapportToDelete = rapport;
      if (this.listRestoDestination.length === 1) {
        setTimeout(() => {
          const multiselectElementLabel = document.getElementsByClassName('ui-multiselect-label ui-corner-all')[0] as HTMLElement;
          const multiselectElementArrow = document.getElementsByClassName('ui-multiselect-trigger-icon ui-clickable pi pi-chevron-down')[0] as HTMLElement;
          const multiselectElementTrigger = document.getElementsByClassName('ui-multiselect-trigger ui-state-default ui-corner-right')[0] as HTMLElement;
          multiselectElementLabel.style.backgroundColor = '#d7d3d3';
          multiselectElementLabel.style.height = '31px';
          multiselectElementTrigger.style.backgroundColor = '#d7d3d3';
          multiselectElementLabel.style.cursor = 'not-allowed';
          multiselectElementTrigger.style.cursor = 'not-allowed';
          multiselectElementArrow.style.display = 'none';
        }, 100);
      }
      this.submitButtonText = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.DELETE_POPUP');
    }, error => {
      console.log('cannot get list restaurant with description : ' + rapport.description);
    });
  }

  public submit(event: any[]): void {
    if (this.deleteRapport) {
      this.deleteFile(this.rapportToDelete);
    } else {
      this.confirmCopieReports();
    }
    this.listRestoIds = [];
    event.forEach((val: any) => this.listRestoIds.push(val.IdenRestaurant));
  }

  public copierRapports(): void {
    this.rapportService.copierRapports(this.restaurantSource.uuid, this.listRestoIds).subscribe((result: any) => {
        this.notificationService.showSuccessMessage('REPORT.REPORTS_COPIED_SUCCESSFULLY');
        this.getListRapportParc(!this.restaurantSource.uuid ? this.listRestoSource[0].uuid : this.restaurantSource.uuid);
      }
      , error => {
        console.log(error);
      });
  }

  public confirmCopieReports(): void {
    this.confirmationService.confirm({
      header: this.rhisTranslateService.translate('REPORT.CONFIRM_TITLE_POPUP'),
      message: this.rhisTranslateService.translate('REPORT.CONFIRM_POPUP_CONTENT') + this.restaurantSource.libelleRestaurant + '.  ' +
        this.rhisTranslateService.translate('REPORT.CONTINUE'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.showPopup = false;
        this.copierRapports();
      }
    });
  }

  /**
   * Get Employee when we reload page and the sahred one is gone
   * Then fetch employee by id
   */
  private setEmploye() {
    if (!this.sharedEmployee.selectedEmployee) {
      this.getEmployeByIdWithBadge();
    } else {
      this.getAvenantOrContratByIdEmployee();
    }
  }

  /**
   * Get Employee with badge by id
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.idEmployee).subscribe(
      (employe: EmployeeModel) => {
        this.sharedEmployee.selectedEmployee = employe;
        this.getAvenantOrContratByIdEmployee();

      },
      (err: any) => {
        console.log('Erreuue au niveau de un employe ');
      }
    );
  }

  /**
   * download file
   * @param :report
   */
  public downloadFile(report?: RapportModel) {
    this.view = 0;
    this.sendMail = 0;
    this.downloadFileAndDisplayContrat = false;
    if (!report) {
      this.exporterFile(this.nameFile);
    } else if (report.categorie) {
      this.setDataRapportBeforeExport(report);
      if (!this.contratOrAvenant) {
        this.contratId = '0';
        this.setReportGenerationConfig(true, GenerationReport.Progress);
        this.beforeExporteDocument();
      } else {
        this.OpenPopupOfContrat();
        this.downloadFileAndDisplayContrat = true;
      }
    } else {
      this.notificationService.showErrorMessage('REPORT.PATH_NOT_FOUND', 'REPORT.SUMMARY');
    }
  }

  /**
   * apres la verification si le rapport est appartient a la categorie contrat ou nn
   * verification si le rapport appartient a la categorie conge ou nn
   * @param: report
   */
  private beforeExporteDocument() {
    if (!this.sendMail) {
      this.setReportGenerationConfig(true, GenerationReport.Progress);
    }
    this.popupSelectContratOrAvenant = false;
    this.exporterFile(this.nameFile);

  }

  /**
   * fill report before download or view
   * @param :report
   */
  private setDataRapportBeforeExport(report: RapportModel) {
    const dateContrat = new Date();
    this.reportUpdate = JSON.parse(JSON.stringify(report));
    this.reportUpdate.lastUsed = new Date;
    this.nameFile = report.description;
    this.categorie = report.categorie;
    this.contratOrAvenant = report.rapportContrat;
    this.dataReport.description = report.description;
    this.dataReport.pathFile = report.pathTemplate;
    this.dataReport.pathFileUnix = report.pathTemplateUnix;
    this.dataReport.rapport = this.reportUpdate;
    // send mail
    if (this.sendMail === 1) {
      this.dataReport.mail.to = this.sharedEmployee.selectedEmployee.email;
    }
  }

  /**
   * recupere un restaurant
   */
  private getFullRestaurant() {
    this.restaurantService.getRestaurantWithPaysAndTypeRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.restaurant = data;
      }, (err: any) => {
        // TODO error panel
        console.log('err');
        console.log(err);
      }
    );
  }

  /**
   * Configuration of the popup of report generation template
   * @param: loader
   * @param :label
   */
  private setReportGenerationConfig(loader?: boolean, label?: string) {
    this.isReportGenerationLoader = loader;
    this.reportGenerationLabel = this.translateService.translate(`REPORT.${label}`);
  }

  public getBackgroundColor(code: number): boolean {
    switch (code) {
      case 0:
        return this.reportGenerationLabel === this.translateService.translate(`REPORT.${GenerationReport.Success}`);
      case 1:
        return this.reportGenerationLabel === this.translateService.translate(`REPORT.${GenerationReport.Progress}`);
      case 2:
        return this.reportGenerationLabel === this.translateService.translate(`REPORT.${GenerationReport.Error}`);
    }
  }

  public getAllReportVariables(): void {
    this.rapportService.getAllReportVariables().subscribe(console.log);
  }

  public editWord(report: RapportModel): void {
    let employeeUuid: string;
    let reportUuid: string;
    let restaurantUuid: string;

    if (!this.displayRestoList) {
      employeeUuid = this.sharedEmployee.selectedEmployee.uuid;
      reportUuid = report.uuid;
      this.router.navigate([`/home/edit-doc-rh/employee/${employeeUuid}/report/${reportUuid}`]);
    } else {
      reportUuid = report.uuidRapport;
      restaurantUuid = this.restaurantSource.uuid;
      this.router.navigate([`/parc/edit-doc-rh/update/${restaurantUuid}/report/${reportUuid}`]);
    }
  }

  public addRapport(): void {
    let employeeUuid: string;
    let restaurantUuid: string;
    if (!this.displayRestoList) {
      employeeUuid = this.sharedEmployee.selectedEmployee.uuid;
      this.router.navigate(['/home/edit-doc-rh'], {state: {employeeUuid: employeeUuid}});
    } else {
      restaurantUuid = this.restaurantSource.uuid;
      this.router.navigate(['/parc/edit-doc-rh'], {state: {employeeUuid: employeeUuid, restaurantUuid: restaurantUuid}});
    }
  }

  public deleteFile(report: RapportModel): void {
    this.confirmationService.confirm({
      header: this.rhisTranslateService.translate('REPORT.REPORT_DELETION'),
      message: this.rhisTranslateService.translate('REPORT.DELETION_REQUEST') + report.description,
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        if (this.deleteRapport) {
          this.listRestoIds.push(this.restaurantSource.IdenRestaurant);
          this.proceedReportDeletionParc(report.description, report.categorie, this.listRestoIds);
        } else {
          this.proceedReportDeletion(report.uuid);
        }

      }
    });
  }

  private proceedReportDeletionParc(rapportDescription: string, rapportCategorie: string, idsRestaurant: any): void {
    this.rapportService.deleteDocxFileForParc(rapportDescription, rapportCategorie, idsRestaurant).subscribe((data: any) => {
      const reportIndexToBeDeleted = this.listRapport.findIndex(report => report.uuidRapport === this.rapportToDelete.uuidRapport);
      if (reportIndexToBeDeleted !== -1) {
        this.listRapport.splice(reportIndexToBeDeleted, 1);
        this.closePopup();
        this.notificationService.showMessageWithToastKey('success', 'REPORT.SUPP_SUCESS', 'globalToast');
      }
    }, error => {
      this.closePopup();
      this.notificationService.showMessageWithToastKey('error', 'REPORT.SUPP_FAILED', 'globalToast');
    });
  }

  private async proceedReportDeletion(reportUuid: string): Promise<void> {
    if (await this.rapportService.deleteDocxFile(reportUuid).toPromise()) {
      const reportIndexToBeDeleted = this.listRapport.findIndex(report => report.uuid === reportUuid);
      if (reportIndexToBeDeleted !== -1) {
        this.listRapport.splice(reportIndexToBeDeleted, 1);
        this.notificationService.showMessageWithToastKey('success', 'REPORT.SUPP_SUCESS', 'globalToast');
      }
    } else {
      this.notificationService.showMessageWithToastKey('error', 'Document est non supprimé', 'globalToast');
    }
  }

  /**
   * view file
   * @param: report
   */
  public viewFile(report: RapportModel) {
    this.viewFileAndDisplayContrat = false;
    if (report.categorie) {
      this.setDataRapportBeforeExport(report);
      this.view = 1;
      this.sendMail = 0;
      if (!this.contratOrAvenant) {
        this.contratId = '0';
        this.viewRapport();
      } else {
        this.OpenPopupOfContrat();
        this.viewFileAndDisplayContrat = true;
      }
    } else {
      this.notificationService.showErrorMessage('REPORT.PATH_NOT_FOUND', 'REPORT.SUMMARY');
    }
  }

  /**
   * ouvrire popup de list  contrats
   */
  OpenPopupOfContrat() {
    this.listContratAndAvenant = [];
    if (this.reportUpdate.rapportContrat.toString() === RapportContrat.AVENANT) {
      this.listContratAndAvenant = this.listAvenant;
    } else if (this.reportUpdate.rapportContrat.toString() === RapportContrat.CONTRAT) {
      this.listContratAndAvenant = this.listContratDisplay;

    } else {
      this.listContratAndAvenant = this.listContrat;
    }
    this.popupSelectContratOrAvenant = true;

  }


  /**
   * print file
   * @param :report
   */
  public printFile(report?: RapportModel) {
    this.printFileAndDisplayContrat = false;
    if (report) {
      this.setReportGenerationConfig(true, GenerationReport.Progress);
    }
    this.view = 1;
    this.sendMail = 0;
    if (!report) {
      this.exporterFile(this.nameFile);

    } else if (report.categorie) {
      this.setDataRapportBeforeExport(report);
      if (!this.contratOrAvenant) {
        this.contratId = '0';
        this.beforeExporteDocument();
      } else {
        this.OpenPopupOfContrat();
        this.printFileAndDisplayContrat = true;
      }
    } else {
      this.notificationService.showSuccessMessage('REPORT.PATH_NOT_FOUND', 'REPORT.SUMMARY');

    }
  }

  /**
   * recuperer les list des contrats et les avenants
   */
  public getAvenantOrContratByIdEmployee() {
    this.contratService.getAvenantOrContratByIdEmployee(this.sharedEmployee.selectedEmployee.uuid).subscribe((data: ContratModel[]) => {
      this.listContrat = data;
      this.setHeaderToListContrat();
    }, (err: any) => {

    });
  }

  /**
   * creation de ifrme de print
   * @param :data
   */
  public printDocument(responce: any) {
    const blob = new Blob([responce], {type: 'application/pdf'});
    const blobUrl = URL.createObjectURL(blob);
    const iframe: any = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
    this.setReportGenerationConfig(false);
  }


  /**
   * display file in popup
   * @param : data
   * @param : description
   */
  public async showDocument(data: any, description: string) {
    this.reportViewer = await this.rapportService.createDocument(data);
    this.titleReport = description;
    this.setReportGenerationConfig(false);
    this.isReportShown = true;
    this.listRapport.forEach(rapport => {
      if (rapport.idRapport === this.reportUpdate.idRapport) {
        rapport.lastUsed = this.reportUpdate.lastUsed;
      }
    });

  }

  /**

   * download file if boolean view egal 0
   * else print file conge
   * @param :nameFile
   */
  private exporterFileConge(nameFile: string) {
    this.rapportService.createDemandeCongeFile(this.langue, this.dataReport, this.view, this.sendMail).subscribe(responce => {
      this.setReportGenerationConfig(true, GenerationReport.Success);
      this.isReportGenerationLoader = false;
      if (this.sendMail === 1) {
        this.showMailPopup = false;
        this.notificationService.showSuccessMessage('REPORT.ENVOI_SUCCES', 'REPORT.SUMMARY');
      }
      if (this.view === 0 && this.sendMail === 0) {
        FileSaver.saveAs(responce, nameFile + ' ' + '.Doc');
      } else if (this.view === 1) {
        this.printDocument(responce);
      }
      this.listRapport.forEach(rapport => {
        if (rapport.idRapport === this.reportUpdate.idRapport) {
          rapport.lastUsed = this.reportUpdate.lastUsed;
        }
      });
    }, error => {
      this.setReportGenerationConfig(true, GenerationReport.Error);
      console.log('download error:', JSON.stringify(error));
    }, () => {
      console.log('Completed file download.');
    });
  }

  /**
   * open popup mail
   * @param :report
   */
  public openPopupMail(report: RapportModel) {
    if (this.sharedEmployee.selectedEmployee.email) {
      this.dataReport.mail = {} as MailModel;
      this.view = 0;
      this.sendMail = 1;
      if (report.categorie) {
        this.setDataRapportBeforeExport(report);
        this.isReportShown = false;
        this.showMailPopup = true;
        this.mailReposTitle = this.rhisTranslateService.translate('REPORT.ENVOI_MAIL_TITLE');

      } else {
        this.notificationService.showSuccessMessage('REPORT.PATH_NOT_FOUND', 'REPORT.SUMMARY');
      }
    } else {
      this.notificationService.showErrorMessage('REPORT.ENVOI_ERROR', 'REPORT.SUMMARY');
    }
  }

  /**
   * envoi de mail
   */
  public sendMailSubmit() {
    this.sendMailFileAndDisplayContrat = false;
    if (!this.contratOrAvenant) {
      this.contratId = '0';
      this.beforeExporteDocument();
    } else {
      this.OpenPopupOfContrat();
      this.sendMailFileAndDisplayContrat = true;
    }

  }

  /**
   * get Employees form infos
   */
  private getInfoEmployees() {
    this.langue = this.translateService.currentLang;
    this.dataReport.mail = {} as MailModel;

    this.getListRapport();
    this.setEmploye();
    this.getFullRestaurant();
  }

  /**
   * fermer le popup de visualisation
   */
  public closeReportShow(): void {
    this.isReportShown = false;
    this.contratId = '0';
  }

  /**
   * set  header to  list contrat
   * @param: data
   */
  private setHeaderToListContrat() {
    this.listAvenant = [];
    this.listContratDisplay = [];
    this.listContrat.forEach((contrat) => {
      if (!contrat.contratPrincipale) {
        if (contrat.datefin) {
          contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
            + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
            this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
        } else {
          contrat.header = this.rhisTranslateService.translate('CONTRAT.CONTRAT_DU')
            + ' ' + this.dateService.formatDate(contrat.dateEffective);
        }
        this.listContratDisplay.push(contrat);
      } else {
        contrat.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_DU')
          + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' ' +
          this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(contrat.datefin);
        this.listAvenant.push(contrat);
      }
    });
  }

  /**
   * lors de selectionner un contrat ou avenant
   */
  public validate() {
    if (this.contratId) {
      this.setReportGenerationConfig(true, GenerationReport.Progress);
      if (this.contratId) {
        if (this.downloadFileAndDisplayContrat || this.printFileAndDisplayContrat || this.sendMailFileAndDisplayContrat) {
          this.beforeExporteDocument();
        } else if (this.viewFileAndDisplayContrat) {
          this.viewRapport();

        }
      }
    } else {
      this.notificationService.showInfoMessage('REPORT.SELECTIONER_CONTRAT', 'REPORT.SUMMARY');

    }
  }

  /**
   * visualiser le document
   */
  private viewRapport() {
    this.setReportGenerationConfig(true, GenerationReport.Progress);

    this.rapportService.exporterDoc(this.langue, this.dataReport, this.view, this.sendMail, this.sharedEmployee.selectedEmployee.uuid, this.contratId).subscribe(responce => {
      this.showDocument(responce, this.dataReport.description);
      this.downloadFileAndDisplayContrat = false;
      this.printFileAndDisplayContrat = false;
      this.viewFileAndDisplayContrat = false;
      this.sendMailFileAndDisplayContrat = false;
      this.popupSelectContratOrAvenant = false;
      this.contrat = {} as ContratModel;
    }, error => {
      this.setReportGenerationConfig(true, GenerationReport.Error);
    }, () => {
    });
  }

  /**
   * lors de selectione un contrat ou avenant
   * @param: idContratSelected
   */
  public onChange(idContratSelected): void {
    this.contratId = idContratSelected;
  }

  /**

   * download file if boolean view egal 0
   * else print file
   * @param :nameFile
   */
  private exporterFile(nameFile: string) {
    this.setReportGenerationConfig(true, GenerationReport.Progress);
    this.rapportService.exporterDoc(this.langue, this.dataReport, this.view, this.sendMail, this.sharedEmployee.selectedEmployee.uuid, this.contratId).subscribe(responce => {
      this.setReportGenerationConfig(true, GenerationReport.Success);
      this.isReportGenerationLoader = false;
      this.downloadFileAndDisplayContrat = false;
      this.printFileAndDisplayContrat = false;
      this.viewFileAndDisplayContrat = false;
      this.sendMailFileAndDisplayContrat = false;
      this.popupSelectContratOrAvenant = false;
      this.contratId = '0';
      this.contrat = {} as ContratModel;
      if (this.sendMail === 1) {
        this.showMailPopup = false;
        this.notificationService.showSuccessMessage('REPORT.ENVOI_SUCCES', 'REPORT.SUMMARY');
      }
      if (this.view === 0 && this.sendMail === 0) {
        FileSaver.saveAs(responce, nameFile + ' ' + '.Docx');
      } else if (this.view === 1) {
        this.printDocument(responce);
      }
      this.listRapport.forEach(rapport => {
        if (rapport.idRapport === this.reportUpdate.idRapport) {
          rapport.lastUsed = this.reportUpdate.lastUsed;
        }
      });
    }, error => {
      this.setReportGenerationConfig(true, GenerationReport.Error);
      console.log('download error:', JSON.stringify(error));
    }, () => {
      console.log('Completed file download.');
    });

  }

  /**
   * Define height window
   */
  public heightWindowActuel(): any {
    this.heightWindow = window.innerHeight;
    return this.heightWindow;
  }

  /**
   * detecte changement height window
   * @param: event
   */
  @HostListener('window:resize', ['$event'])
  public detectWindow(event) {
    this.heightWindowActuel();
  }

  /**
   * methode excecute after init
   */
  ngAfterViewInit() {
    this.heightWindowActuel();
  }

  /**
   * Calculate max height of pop-up rapport
   */
  public maxHeightRapport(): any {
    this.maxHeightPopUpRapport = (this.heightWindowActuel() - this.emptySpaceBtwRelativeToVertical) + 'px';
    return this.maxHeightPopUpRapport;
  }

  public showIconHoverText(event, operation: string, tooltip: OverlayPanel): void {
    this.operationIconText = this.rhisTranslateService.translate(`REPORT.ICON_HOVER_${operation}`);
    tooltip.show(event);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }
}
