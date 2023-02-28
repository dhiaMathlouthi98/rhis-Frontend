import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {PaginationArgs} from '../../../../../shared/model/pagination.args';
import {EmployeeService} from '../../service/employee.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {MotifSortieService} from '../../../configuration/service/motifSortie.service';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {EmployeeDisponibiliteConge} from '../../../../../shared/model/employee-disponibilite-conge';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {GenerateFilesService} from '../../../../../shared/service/generate.files.service';
import * as FileSaver from 'file-saver';
import {MotifSortieModel} from '../../../../../shared/model/motifSortie.model';
import {ContratModel} from '../../../../../shared/model/contrat.model';
import {ContratService} from '../../service/contrat.service';
import {Table} from 'primeng/table';
import {RhisRoutingService} from '../../../../../shared/service/rhis.routing.service';
import {JourDisponibiliteModel} from '../../../../../shared/model/jourDisponibilite.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {FileUpload} from 'primeng/fileupload';
import {SessionService} from '../../../../../shared/service/session.service';

@Component({
  selector: 'rhis-employees',
  templateUrl: './list-employes.component.html',
  styleUrls: ['./list-employes.component.scss']

})
export class ListEmployesComponent implements OnInit {
  public listEmplyees: EmployeeModel[] = [];
  public listEmployeeInitiale = [];
  public listmotifSorties: MotifSortieModel[] = [];
  private motifSortie: MotifSortieModel;
  public header;
  public totalRecords: number;
  public statutOptions;
  // 2 paramtres pour afficher les employes actif ou inactif ou tous
  public filterStatut = true;
  public filterStatut1 = true;
  // nbre des employes ont affichés
  public nbreEmploye;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 4};
  public rowsPerPageOptions;
  // pour afficher les employees selon le noum ou le prenom
  public filterName;
  public first = 0;
  public row = 0;
  public recherche = false;
  public popupVisibility;
  public selectedEmployeeToUpdate;
  // l'employé selectionné en cliquant sur une ligne
  public selectedEmployee: EmployeeModel;
  public statusAreShown = false;
  // Liste des disponibilités pour un employé sélectionné
  public disponibilites: EmployeeDisponibiliteConge;
  // id de l'employé sélectionné lors de l'affichage des disponibilités
  public idSelectedEmployeeForDisponibilites: string;
  public contrat = {} as ContratModel;
  @ViewChild('dt') dataTableComponent: Table;
  public motifSortieHeader: string;

  public heightInterface: any;
  private ecran = 'ELE';
  private firstWeekDayRank: number;

  public file: File[];
  public displayDialogUploadExcel = true;
  @ViewChild('fileUpload')
  private fileUploader: FileUpload;
  private errors: string[] = [];
  public openedFilterPopup = false;
  private field = 'matricule';
  private order = 1;
  private selectedStatut: any = [];
  public filterStat = '';
  public rechercheNomOrPrenom: string;

  constructor(private sharedEmployeeService: SharedEmployeeService,
              private employeeService: EmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private motifSortieService: MotifSortieService,
              private notificationService: NotificationService,
              private generateFilesService: GenerateFilesService,
              private confirmationService: ConfirmationService,
              private contratService: ContratService,
              public rhisRouter: RhisRoutingService,
              private domControlService: DomControlService,
              private sessionService: SessionService,
              private sharedRestaurantService: SharedRestaurantService
  ) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  async ngOnInit() {
    this.firstWeekDayRank = await this.sharedRestaurantService.getWeekFirstDayRank();
    this.header = [
      {title: this.rhisTranslateService.translate('EMPLOYEE.MATRICULE'), field: 'matricule'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.CARTE'), field: 'carte'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.NOM'), field: 'nom'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.PRENOM'), field: 'prenom'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.NUM_TELEPH'), field: 'numTelephone'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.CONTRAT'), field: 'hebdoCourant'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.STATUT'), field: 'statut'},

    ];
    this.rechercheNomOrPrenom = this.rhisTranslateService.translate('EMPLOYEE.SEARCH_PLACEHOLDER');

    this.rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
    // liste des options pour filtrer les employés selon statut
    this.statutOptions = [
      // {label: this.rhisTranslateService.translate('ALL'), status: null},
      {label: this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_ACTIF'), status: 'Actif'},
      {label: this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_EMBAUCHE'), status: 'Embauche'},
      {label: this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_INACTIF'), status: 'Inactif'}
    ];
    this.selectedStatut.push(this.statutOptions[0]);
    this.selectedStatut.push(this.statutOptions[1]);
    this.motifSortieHeader = this.rhisTranslateService.translate('POPUPS.CONFIRMATION_HEADER');
    this.filterName = new FormControl('');
    // pour le recupere la premiere page pour affiche list des employees
    this.row = 25;
    this.paginationArgs = {pageNumber: 0, pageSize: this.row};
    this.getListEmplyees();
    this.getListMotifSortie();
  }

  public showDetails(selectedEmployee: EmployeeModel, e) {
    if (this.domControlService.updateListControl(this.ecran)) {
      if (!selectedEmployee.email.includes('@')) {
        selectedEmployee.email = '';
      }
      this.sharedEmployeeService.selectedEmployee = selectedEmployee;
      if (e.target.tagName !== 'IMG') {
        this.router.navigate([this.rhisRouter.getRouteDetailEmployee('EMPLOYEE_DETAIL', selectedEmployee.uuid)]);

      }
    }
  }

  public addEmploye() {
    this.sharedEmployeeService.selectedEmployee = new EmployeeModel();
    this.router.navigate([this.rhisRouter.getRoute('EMPLOYEE_ADD')]);
  }

  /**
   *récupération de la liste des employés dans un restaurant
   */
  getListEmplyees() {
    this.filterStat = '';
    this.selectedStatut.forEach(el => this.filterStat += el.status + ',');
    this.employeeService.getAllWithPaginationAndFilter(this.paginationArgs, {
      filterStatut: this.filterStat,
      filterName: this.filterName.value,
      column: this.field,
      order: this.order
    }).subscribe(
      (data: any) => {
        this.listEmplyees = data.content;
        this.listEmployeeInitiale = data.content;
        // nbre total des employees dans la bd
        this.totalRecords = data.totalElements;
        if (!this.filterName.value) {
          this.nbreEmploye = this.totalRecords;
        }
        this.setStatutToEmployee();
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
   * pour la pagination
   * @param: event
   */
  public onLazyLoad(event: LazyLoadEvent) {
    this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    this.getListEmplyees();
  }

  private showStatutpopUp() {
    setTimeout(() => {
      if (this.statusAreShown) {
        const headerListBox = document.getElementsByClassName('ui-widget-header ui-corner-all ui-listbox-header ui-helper-clearfix ui-listbox-header-w-checkbox ng-star-inserted')[0] as HTMLElement;
        headerListBox.style.display = 'none';
        const listBoxSlider = document.getElementsByClassName('ui-listbox-list-wrapper')[0] as HTMLElement;
        listBoxSlider.style.overflow = 'hidden';
      }
    }, 1);

  }

  /**
   *  on recupere la list des employes selons le statut selectionne
   */
  public changeStatus(event) {

    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListEmplyees();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchEmployee();
    }
  }

  /**
   * recherche selon le nom ou le prenom
   */
  searchEmployee() {
    this.recherche = true;
    this.first = 0;
    this.row = this.paginationArgs.pageSize;
    this.paginationArgs = {
      pageNumber: this.first / this.paginationArgs.pageSize,
      pageSize: this.paginationArgs.pageSize
    };
    this.getListEmplyees();

  }

  /**
   * ordonner l'employee selon le matricule,contra,badge,nom ,prenom
   * @param : fieldName
   * @param : order
   */
  sortListEmployee(fieldName: string, order: number) {
    this.listEmplyees.sort((row1, row2) => {
      let val1 = row1[fieldName];
      let val2 = row2[fieldName];
      if (fieldName === 'carte' || fieldName === 'hebdoCourant') {
        val1 = +val1;
        val2 = +val2;
      }

      if (val1 === val2) {
        return 0;
      }
      let result = -1;
      if (val1 > val2) {
        result = 1;
      }
      if (order < 0) {
        result = -result;
      }
      return result;
    });
  }

  /**
   *lors de clique le sorteble dans la table
   * @param : event
   */
  public sortData(event): void {
    this.field = event.field ? event.field : this.field;
    this.field = this.field === 'carte' ? 'badge' : this.field;
    this.order = event.order ? event.order : this.order;
    this.getListEmplyees();
  }

  /**
   * pour afficher le etat de l'employee selon le statut
   */
  setStatutToEmployee() {
    this.listEmplyees.forEach(employe => {
      if (employe.statut === true) {
        employe.etat = this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_ACTIF');
      } else {
        if (employe.statutEmbauche === 'Embauche') {
          employe.etat = this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_EMBAUCHE');
        } else {
          employe.etat = this.rhisTranslateService.translate('EMPLOYEE.EMP_STATUT_INACTIF');
        }

      }
      if (employe.badge) {
        employe.carte = employe.badge.code;
      } else {
        employe.carte = 0;
      }
    });

  }

  /**
   * selon le statut qui a requipere deja de files(action_employee)  on active ou desactiver un employee
   * @param : statut
   * @param : employeeSelectionne
   */
  setStatut(statut, employeeSelectionne) {
    // si on clique sur desactiver employee
    employeeSelectionne.contrats = [];
    this.selectedEmployeeToUpdate = JSON.parse(JSON.stringify(employeeSelectionne));
    this.sharedEmployeeService.selectedEmployee = this.selectedEmployeeToUpdate;
    if (!statut) {
      this.popupVisibility = true;
    } else {
      this.getLastContratByEmployeeId();
    }

  }

  /**
   * recuperation de la liste des motif de sorties
   */
  getListMotifSortie(): void {
    this.motifSortieService.getAllMoyenTransportActive().subscribe(
      (data: MotifSortieModel[]) => {
        this.listmotifSorties = data;
      }, error => {
        // TODO gestion erreur
        console.log(error);
      }
    );
  }

  /**
   * dupliquer : ouvrir la fenêtre contrat avec un nouveau contrat contenant
   * les infos du dernier contrat, la date de début égal à aujourd'hui
   * et pas de date de finL'utilisateur-restaurant ne veut pas dupliquer
   * ouvrir la fenêtre contrat de l'employé avec un nouveau contrat
   * vide sauf la date de début égal à aujourd'hui.
   */
  public showConfirmDuplicateContrat() {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.CONFIRM_DUPLIQUER_CONTRAT'),
      header: this.rhisTranslateService.translate('CONTRAT.VALIDATE'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.setContratInSharedEmployee();
      },
      reject: () => {
        this.contrat = {} as ContratModel;
        this.setContratInSharedEmployee();

      }

    });
  }


  /**
   * cette methode permet de rendre inactif un employé
   */
  confirmMakeEmployeeInactive(motifSortie: MotifSortieModel): void {
    this.employeeService.desactiverEmployee(this.selectedEmployeeToUpdate, motifSortie.uuid).subscribe(
      data => {
        // trouver l employe dans la liste initiale et le remplacer
        this.mettreAjourTableListeEmployee(data);
        this.notificationService.showSuccessMessage('EMPLOYEE.EMPLOYE_INACTIF');
      }, err => {
        // TODO gestion erreur
        console.log(err);
      },
      () => {
        this.getListEmplyees();
      }
    );
    this.closeConfirmPopup();
  }

  /**
   * fermeture popup
   */
  closeConfirmPopup() {
    this.motifSortie = null;
    this.popupVisibility = false;
  }

  /**
   * mise a jour  de valeur dans la liste des employees lors de modification
   * @param : data
   */
  mettreAjourTableListeEmployee(data) {
    const index = this.listEmployeeInitiale.findIndex(empl => empl.idEmployee === this.selectedEmployeeToUpdate.idEmployee);
    this.selectedEmployeeToUpdate = data;
    this.listEmployeeInitiale[index] = data;
    this.listEmplyees = this.listEmployeeInitiale;
    this.setStatutToEmployee();
  }

  /**
   * Récupérer la liste des disponibilités et congé par id employé
   * @param : id
   */
  getDisponibilites(id: string): void {
    this.idSelectedEmployeeForDisponibilites = id;
    const weekDays = Object.values(JourSemaine).slice(this.firstWeekDayRank - 1).concat(Object.values(JourSemaine).slice(0, this.firstWeekDayRank - 1));
    this.employeeService.getDisponiblite(id).subscribe((disponibilites: EmployeeDisponibiliteConge) => {
      if (disponibilites.disponibilites) {
        this.sortDisponibilitesBasedOnFirstWeekDay(disponibilites, weekDays);
      }
      this.disponibilites = disponibilites;
    }, _ => {
      this.disponibilites = {
        congeActuel: '',
        groupeTravail: '',
        disponibilites: []
      };
    });
  }

  private sortDisponibilitesBasedOnFirstWeekDay(disponibilites: EmployeeDisponibiliteConge, weekDays): void {
    disponibilites.disponibilites.sort((firstDisponibilite: JourDisponibiliteModel, secondDisponibilite: JourDisponibiliteModel) => {
      if (weekDays.indexOf(firstDisponibilite.jourSemain) > weekDays.indexOf(secondDisponibilite.jourSemain)) {
        return 1;
      } else if (weekDays.indexOf(firstDisponibilite.jourSemain) < weekDays.indexOf(secondDisponibilite.jourSemain)) {
        return -1;
      }
      return 0;
    });
  }

  /**
   *Cette methode permet de télécharger le fichier excel des la liste des employees
   */
  downloadEmployeeList() {
    const currentLangue = this.rhisTranslateService.browserLanguage;
    this.generateFilesService.getFileName(currentLangue, {
      filterStatut: this.filterStatut,
      filterStatut1: this.filterStatut1,
      filterName: this.filterName.value
    }).subscribe(
      (data: any) => {
        this.generateFilesService.getFileByFileNameFromEmployeeService(data).subscribe(
          (fileData: any) => {
            FileSaver.saveAs(fileData, data);
          },
          (err: any) => {
            console.log(err);
            //TODO
          }, () => {
            this.notificationService.showSuccessMessage('EMPLOYEE.LISTE_EMPLOYEE_SUCCESS_DOWNLOAD');
          }
        );
      }, (err: any) => {

      }
    );
  }

  /**
   *Cette methode permet d'importer le fichier excel des employées
   */
  public importEmployeeExcelFile(): void {
    this.fileUploader.basicFileInput.nativeElement.click();
  }

  public afterSelectingExcelFile(): void {
    this.file = this.fileUploader.files;
    this.notificationService.startLoader();
    this.employeeService.importEmployeeExcelFile(this.file[0]).subscribe((errors: string[]) => {
      this.fileUploader.files = [];
      this.notificationService.stopLoader();
      if (errors.length) {
        this.displayDownloadErrorsPDF(errors.length);
      }
      // message fin d 'importation
      this.notificationService.showInfoMessage('IMPORT_EMPLOYE_EXCEL.FIN_IMPORT');
      this.errors = errors;
    }, () => {
      this.fileUploader.files = [];
      this.notificationService.stopLoader();
      this.notificationService.showErrorMessage('IMPORT_EMPLOYE_EXCEL.ERROR_IMPORT');
    });
  }

  public hideDialog(): void {
    this.displayDialogUploadExcel = false;
    setTimeout(() => this.displayDialogUploadExcel = true, 100);
  }

  public downloadRapportFile(): void {
    this.displayDialogUploadExcel = false;
    setTimeout(() => this.displayDialogUploadExcel = true, 100);

    const currentLangue = this.rhisTranslateService.browserLanguage;
    this.generateFilesService.getErrorsFileName(currentLangue, this.errors).subscribe(
      (data: any) => {
        this.generateFilesService.getFileByFileNameFromEmployeeService(data).subscribe(
          (fileData: any) => {
            FileSaver.saveAs(fileData, data);
          },
          (err: any) => {
            console.log(err);
            // TODO
          }, () => {
            this.notificationService.showSuccessMessage('EMPLOYEE.LISTE_EMPLOYEE_SUCCESS_DOWNLOAD');
          }
        );
      }, (err: any) => {

      }
    );
  }

  private displayDownloadErrorsPDF(nombreErreur: number): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('IMPORT_EMPLOYE_EXCEL.FINISHED_WITH') + nombreErreur + this.rhisTranslateService.translate('IMPORT_EMPLOYE_EXCEL.ERRORS'),
      header: this.rhisTranslateService.translate('IMPORT_EMPLOYE_EXCEL.IMPORT_RESULT'),
      key: 'dialogTelechargerRapport',
      icon: 'pi pi-info-circle',
    });
  }

  /**
   * get last contrat for duplicate
   */
  public getLastContratByEmployeeId() {
    this.contratService.getLastContratByEmployee(this.selectedEmployeeToUpdate.uuid).subscribe(
      (data: ContratModel) => {
        this.contrat = data;
        if (this.contrat) {
          this.contrat.idContrat = 0;
          delete this.contrat.uuid;
          this.contrat.disponibilite.idDisponibilite = 0;
          delete this.contrat.disponibilite.uuid;
          this.contrat.disponibilite.jourDisponibilites.forEach((j: JourDisponibiliteModel) => {
            j.idJourDisponibilite = 0;
            delete j.uuid;
          });
          this.contrat.repartition.idRepartition = 0;
          delete this.contrat.repartition.uuid;
          this.showConfirmDuplicateContrat();
        } else {
          this.contrat = {} as ContratModel;
          this.setContratInSharedEmployee();
        }
      });


  }

  /**
   * set contrat in sahred employee for activate employee
   */
  public setContratInSharedEmployee() {
    this.contrat.dateEffective = new Date();
    this.contrat.datefin = null;
    this.contrat.motifSortie = null;
    this.sharedEmployeeService.selectedEmployee.contrats.push(this.contrat);
    this.router.navigate([`home/employee/${this.selectedEmployeeToUpdate.uuid}/detail/contrat`]);
  }

  /**
   * redirection de  l 'employee vers la page de contrat
   * @param: id
   */
  public getContratEmployee(employee: EmployeeModel) {
    this.router.navigate([this.rhisRouter.getRouteDetailContratEmployee('EMPLOYEE_DETAIL', employee.uuid)]);
    this.sharedEmployeeService.selectedEmployee = employee;
  }

  public isSuperviseur(): boolean {
    return this.sessionService.getProfil() === 'superviseur';
  }

  public toogleDownloadEmployeeFilter() {
    this.openedFilterPopup = !this.openedFilterPopup;
  }

  public closeEmployeeFilter(): void {
    this.openedFilterPopup = false;
  }

  public getFilterNameValue(): string {
    if (this.filterName && this.filterName.value) {
      return this.filterName.value;
    } else {
      return '';
    }
  }

}

