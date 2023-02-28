import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {LazyLoadEvent} from 'primeng/api';
import {PaginationArgs} from 'src/app/shared/model/pagination.args';
import {RapportModel} from 'src/app/shared/model/rapport.model';
import {FormControl} from '@angular/forms';
import {Table} from 'primeng/table';
import {SessionService} from '../../../../../shared/service/session.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {Router} from '@angular/router';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {EmployeeService} from '../../../../../modules/home/employes/service/employee.service';
import {RapportService} from '../../../../../modules/home/employes/service/rapport.service';
import {RhisRoutingService} from '../../../../service/rhis.routing.service';
import {RestaurantService} from '../../../../service/restaurant.service';
import {RapportParcService} from '../../../../../modules/parc/services/rapport-parc.service';
import {SharedRestaurantListService} from '../../../../service/shared-restaurant-list.service';
import * as FileSaver from 'file-saver';
import {GenerateFilesService} from '../../../../service/generate.files.service';
import {HttpResponse} from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'rhis-list-rapports',
  templateUrl: './list-rapports.component.html',
  styleUrls: ['./list-rapports.component.scss']
})
export class ListRapportsComponent implements OnInit {
  public heightInterface: any;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public totalRecords: number;
  public listRapports: RapportModel[];
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public first = 0;
  public row = 10;
  public header: { title: string, field: string }[];
  public recherche = false;
  public totalRapports: number;
  public totalRapportsParc: number;
  public searchedValue: FormControl;
  public filterOptions: { label: string; field: string; }[];
  public filterBy = '';
  public showFilter = false;
  @ViewChild('dt') dataTableComponent: Table;
  public placeholderText = this.rhisTranslateService.translate('REPORT.SEARCH_PLACEHOLDER');
  public showPopupRapport = false;
  public selectedRapport: RapportModel;
  public listEmployees: EmployeeModel[] = [];
  public allEmployeeLabel = '';
  public parcRapport = false;
  public listRestaurants: any[];
  public loading = false;
  public envoiMailparametre = true;
  public openPopup = true;

  constructor(private rapportService: RapportService,
              private employeeService: EmployeeService,
              private sessionService: SessionService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private router: Router,
              public rhisRouter: RhisRoutingService,
              private restaurantService: RestaurantService,
              private rapportParcService: RapportParcService,
              private sharedRestoService: SharedRestaurantListService,
              private generateFilesService: GenerateFilesService) {
  }

  ngOnInit() {
    if (this.router.url.includes('parc')) {
      this.searchedValue = new FormControl('');
      this.headerBuilder();
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestaurants = result;
        this.getListRapportParcByPage();
      });

      this.filterOptions = [];
      this.allEmployeeLabel = this.rhisTranslateService.translate('POPUP_RAPPORT.ALL_EMPLOYEE_LABEL');
      this.parcRapport = true;
    } else {
      this.searchedValue = new FormControl('');
      this.headerBuilder();
      this.getListRapportByPage();
      this.filterOptions = [
        {label: this.rhisTranslateService.translate('REPORT.ALL'), field: ''},
        {label: this.rhisTranslateService.translate('REPORT.GDH_FILTER'), field: 'GDH'},
        {label: this.rhisTranslateService.translate('REPORT.PLANNING_FILTER'), field: 'PLG'},
        {label: this.rhisTranslateService.translate('REPORT.EMPLOYE_FILTER'), field: 'EMPLOYE'}
      ];
      this.allEmployeeLabel = this.rhisTranslateService.translate('POPUP_RAPPORT.ALL_EMPLOYEE_LABEL');
      this.parcRapport = false;
    }
  }

  public openClosePopup(event: any) {
    this.openPopup = event;
  }

  public onLazyLoad(event: LazyLoadEvent): void {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    if (this.router.url.includes('parc')) {
      this.getListRapportParcByPage();
    } else {
      this.getListRapportByPage();
    }
  }

  /**
   * Search Report By Name
   */
  public searchRapport(): void {
    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    if (!this.parcRapport) {
      this.getListRapportByPage();
    } else {
      this.getListRapportParcByPage();
    }

  }

  /**
   * Recupérer liste rapports selon filtres choisi (gdh, planning, employe)
   */
  public changeFilter(event: any): void {
    this.filterBy = event.value.field;
    this.showFilter = false;
    this.showFilter = !this.showFilter;
    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListRapportByPage();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchRapport();
    }
  }

  public showActionPopup(rapport: RapportModel): void {
    this.openPopup = true;
    this.selectedRapport = rapport;
    this.showPopupRapport = true;
  }

  public closePopup(): void {
    this.showPopupRapport = false;

  }

  public async GenerateExcelRapportDetailee(event: any): Promise<void> {

    if (event.hasOwnProperty('rapport') && event.rapport === 'POSTE_TRAVAIL_RAPPORT') {
      if (event.vue === 'jour') {
        this.notificationService.startLoader();
        this.rapportService.getRapportPosteTravailVueJour(event.dateDebut, event.decoupage, Array.of(event.uuidsRestaurants))
          .subscribe((data: HttpResponse<any>) => {
            const fileName = data.headers.get('rhis_file_name');
            const finalName = decodeURIComponent(fileName);
            FileSaver.saveAs(data.body, finalName);
            this.notificationService.stopLoader();
            this.showPopupRapport = false;
          });
      } else if (event.vue === 'semaine') {
        this.notificationService.startLoader();
        this.rapportService.getRapportPosteTravailVueSemaine(event.dateDebut, event.dateFin, Array.of(event.uuidsRestaurants))
          .subscribe((data: HttpResponse<any>) => {
            const fileName = data.headers.get('rhis_file_name');
            const finalName = decodeURIComponent(fileName);
            FileSaver.saveAs(data.body, finalName);
            this.notificationService.stopLoader();
            this.showPopupRapport = false;
          });
      }
    } else {
      this.notificationService.startLoader();
      const fileName = await this.rapportService.createRapportCompteurs(
        event.uuidRestaurant,
        event.periodeAnalyser,
        event.date,
        event.sortingCriteria
      ).toPromise();

      const fileContent: Blob = await this.generateFilesService.getFileByFileNameFromGDHService(fileName.toString()).toPromise();
      FileSaver.saveAs(fileContent, fileName.toString());
      this.notificationService.stopLoader();
      this.showPopupRapport = false;
    }
  }

  public launchGenerateRapport(event: any): void {
    this.showPopupRapport = false;

    this.sessionService.setPdfAnomalieSettings({
      uuidRestaurant: event.uuidRestaurant,
      uuidEmployee: event.uuidEmployee,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });

    this.sessionService.setPdfPlanningEmployeeSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      employeeIds: event.employeeIds,
      groupeTravailIds: event.groupeTravailIds
    });

    this.sessionService.setPdfServiceAPrendreSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });



    this.sessionService.setPdfCompteursEmployesSettings({
      uuidRestaurant: event.uuidRestaurant,
      date: event.date,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfCompteursEmployesForDownloadSettings({
      uuidRestaurant: event.uuidRestaurant,
      periodeAnalyser: event.periodeAnalyser,
      date: event.date,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfRapportOperationnelSettings({
      uuidRestaurant: event.uuidRestaurant,
      groupeTravail: event.groupeTravail,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      hundredth: event.hundredth
    });

    this.sessionService.setPdfResumePlanningSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });

    this.sessionService.setPdfCorrectionPointageSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateJournee: event.dateJournee
    });

    this.sessionService.setPdfDisponibilites({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      type: event.type,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfAbsences({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      motifAbsence: event.motifAbsence,
      employeeIds: event.employeeIds,
      groupeTravailIds: event.groupeTravailIds
    });

    this.sessionService.setPdfCompetencesSettings({
      uuidRestaurant: event.uuidRestaurant
    });

    this.sessionService.setPdfPlanningManagersSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      managerOrLeader: event.managerOrLeader,
      sortingCriteria: event.sortingCriteria
    });

    this.sessionService.setPdfVacancesSettings({
      uuidRestaurant: event.uuidRestaurant,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      sortingCriteria: event.sortingCriteria,
      motifAbsence: event.motifAbsence,
      employeeIds: event.employeeIds,
      groupeTravailIds: event.groupeTravailIds
    });

    this.sessionService.setPdfDetailsPeriodeSettings({
      uuidRestaurant: event.uuidRestaurant,
      groupeTravail: event.groupeTravail,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      minutesOrCentieme : event.minutesOrCentieme,
      employeeOrGroupTravail : event.employeeOrGroupTravail === 'employee' ? 1 : 2,
      listEmployee: event.listEmployee ? event.listEmployee.map(el => el.idEmployee) : []
    });

    window.open(window.location.href + '/display/' + this.selectedRapport.codeName, '_blank');
  }

  public launchGenerateRapportParc(selectedRapportParc: RapportModel) {
    window.open(window.location.href + '/display/' + selectedRapportParc.codeName, '_blank');
  }

  /**
   * Sort Report List
   * @param : event
   */
  public sortData(event: any): void {
    this.listRapports.sort((row1: RapportModel, row2: RapportModel) => {
      const value1 = row1[event.field];
      const value2 = row2[event.field];
      let result = null;

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order * result);
    });
  }

  public getListEmployeeByPointage(event: any): void {
    this.notificationService.startLoader();
    this.employeeService.findAllEmployeesWithPointageBetweenDate(event.dateDebut, event.dateFin).subscribe(
      (data: EmployeeModel[]) => {
        this.listEmployees = data;
        this.listEmployees.forEach((item: EmployeeModel) => {
          item.displayedName = item.nom + ' ' + item.prenom;
        });
        this.notificationService.stopLoader();

      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }

  private headerBuilder(): void {
    this.header = [
      {title: this.rhisTranslateService.translate('REPORT.MODULE'), field: 'categorie'},
      {title: this.rhisTranslateService.translate('REPORT.NAME'), field: 'libelleFile'},
      {title: this.rhisTranslateService.translate('REPORT.DERNIERE'), field: 'lastUsed'}];

  }

  /**
   *  récupération de la liste des rapports de MyRhis
   */
  private getListRapportByPage(): void {
    this.rapportService.getAllReportsWithPagination(this.paginationArgs, {
      filterName: this.searchedValue.value,
      filterCategorie: this.filterBy
    }).subscribe(
      (data: any) => {
        this.listRapports = data.content;
        const sortParams = {
          'order': 1,
          'field': 'libelleFile'
        };
        this.sortData(sortParams);
        // nbre total des rapports
        this.totalRecords = data.totalElements;
        if (!this.searchedValue.value) {
          this.totalRapports = this.totalRecords;
        }
        if (this.recherche) {
          this.first = 0;
          this.dataTableComponent.reset();
        }
        this.recherche = false;
      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }

  /**
   * Show gestion parametre d'envoi
   * @param: selectedRapportParc
   */
  public generationRapportParc(selectedRapportParc: RapportModel) {
    this.router.navigate(['/parc/list-rapport/display-rapport-parc/generation-rapport-parc'], {
      queryParams: {
        libelle: selectedRapportParc.libelleFile,
        codeName: selectedRapportParc.codeName,
        uuid: selectedRapportParc.uuid,
        idRapport: selectedRapportParc.idRapport
      }
    });
  }

  /**
   * Parametre envoi du rapport parc
   * @param: selectedRapportParc
   */
  public paramEnvoiRapport(selectedRapportParc: RapportModel) {
    this.router.navigate(['/parc/list-rapport/display/' + selectedRapportParc.uuid + '/param-envoi'], {
      queryParams: {
        libelle: selectedRapportParc.libelleFile,
        idRapport: selectedRapportParc.idRapport,
        codeName: selectedRapportParc.codeName
      }
    });
  }

  /**
   * get all list rapport parc
   */
  private getListRapportParcByPage(): void {
    this.loading = true;

    let listUuidRestaurant = [];

    this.listRestaurants.forEach(element => listUuidRestaurant.push(element.uuid));
    this.rapportParcService.getAllRapportsParcWithPagination(listUuidRestaurant, this.paginationArgs, {
      filterName: this.searchedValue.value
    }).subscribe(
      (data: any) => {
        this.listRapports = data.content;
        this.row = data.size;
        const sortParams = {
          'order': 1,
          'field': 'categorie'
        };
        this.sortData(sortParams);
        // nbre total des rapports
        this.totalRecords = data.totalElements;
        if (!this.searchedValue.value) {
          this.totalRapportsParc = this.totalRecords;
        }
        if (this.recherche) {
          this.first = 0;
          this.loading = false;
          this.dataTableComponent.reset();
        }
        this.recherche = false;
        this.loading = false;
      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
        this.loading = false;
      }
    );
  }

  public getListEmployeeActiveBetweenTwoDates(event: any): void {
    this.notificationService.startLoader();
    this.employeeService.findAllEmployeesBetweenTwoDates(event.dateDebut, event.dateFin).subscribe(
      (data: EmployeeModel[]) => {
        this.listEmployees = data;
        this.listEmployees.forEach((item: EmployeeModel) => {
          item.displayedName = item.nom + ' ' + item.prenom;
        });
        this.notificationService.stopLoader();

      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }
}
