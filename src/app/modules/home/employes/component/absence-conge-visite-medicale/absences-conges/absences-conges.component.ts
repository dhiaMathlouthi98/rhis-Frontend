import {Component, Input} from '@angular/core';
import {AbsenceCongeService} from '../../../service/absence.conge.service';
import {TypeEvenementService} from '../../../../configuration/service/type.evenement.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {ConfirmationService} from 'primeng/api';
import {AbsenceCongeModel} from '../../../../../../shared/model/absence.conge.model';
import {StatusDemandeCongeEnumeration} from '../../../../../../shared/model/enumeration/status.demande.conge.enumeration';
import {TypeEvenementModel} from '../../../../../../shared/model/type.evenement.model';
import {SharedEmployeeService} from '../../../service/sharedEmployee.service';
import {RapportService} from '../../../service/rapport.service';
import * as FileSaver from 'file-saver';
import {GenerationReport} from '../../../../../../shared/enumeration/generation.rapport';
import {ActivatedRoute, Router} from '@angular/router';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {DecompteAbsenceParms} from '../../../../../../shared/model/gui/decompte-absence-parms';
import {AbsenceDurationStateModel, DurationModeEnum} from './model/absence-duration-state.model';
import {Observable} from 'rxjs';
import {JoursFeriesService} from '../../../../../../shared/module/params/jours-feries/service/jours.feries.service';
import {JourFeriesModel} from '../../../../../../shared/model/jourFeries.model';

@Component({
  selector: 'rhis-absences-conges',
  templateUrl: './absences-conges.component.html',
  styleUrls: ['./absences-conges.component.scss']
})
export class AbsencesCongesComponent {
  public listAbsenceConge: AbsenceCongeModel[] = [];
  public showCongeAbsencePopup = false;
  public absenceConge = {} as AbsenceCongeModel;
  public idAbsenceConge;
  public addUpdateAbsenceCongeTitle: string;
  public listTypeEvenement: TypeEvenementModel[] = [];
  public statusCongeAttente: StatusDemandeCongeEnumeration = StatusDemandeCongeEnumeration.EN_ATTENTE;
  public statusCongeNonValide: StatusDemandeCongeEnumeration = StatusDemandeCongeEnumeration.NON_VALIDE;
  public statusCongeValide: StatusDemandeCongeEnumeration = StatusDemandeCongeEnumeration.VALIDE;
  public viewPdf: number;
  public blob: any;
  public congeToDownload = {} as AbsenceCongeModel;
  public id: number;
  private readonly TRUE_STR = 'true';
  @Input()
  public set idEmployee(id: number) {
    this.id = id;
    this.getInfoEmployees();
  }
  public absenceCongeHeader = [
    {title: this.rhisTranslateService.translate('DEMANDE_CONGE.DATE_DEBUT'), field: 'dateDebut'},
    {title: this.rhisTranslateService.translate('DEMANDE_CONGE.DATE_FIN'), field: 'dateFin'},
    {title: this.rhisTranslateService.translate('DEMANDE_CONGE.DUREE'), field: 'dureeJour'},
    {title: this.rhisTranslateService.translate('DEMANDE_CONGE.TYPE_CONGE'), field: 'typeEvenement.libelle'},
    {title: this.rhisTranslateService.translate('DEMANDE_CONGE.STATUS'), field: 'status'}
  ];
  public listJourFeries: JourFeriesModel[] = [];
  public decompteFerie = false;
  public validateOrRefuseAbsenceCongeTitle: string;
  public showValidateOrRefuseCongeAbsencePopup = false;
  public langue: string;
  public isReportShown = false;
  public reportViewer: any;
  public titleReport: string;
  public isReportGenerationLoader = false;
  public reportGenerationLabel: string;
  public reportGenerationTitle = this.rhisTranslateService.translate('REPORT.GENERATOR_LOADER_TITLE');
  public ecran = 'GAC';
  private readonly OUVRABLE = 'OUVRABLE';
  private readonly CALCULCP = 'CALCULCP';
  private readonly DECOMPTFERIE = 'DECOMPTFERIE';
  private readonly ABS_REPARTITION_CALCULATION = 'ABS_REPARTITION_CALCULATION';
  private readonly BLOCK_GDH_PARAM_CODE = 'GDH_BLOCK';
  public absenceParam: DecompteAbsenceParms;
  public warningPopUpLock: boolean;
  public blockGdhParam: ParametreModel;
  constructor(
    private absenceCongeService: AbsenceCongeService,
    private typeEvenementService: TypeEvenementService,
    private notificationService: NotificationService,
    private rhisTranslateService: RhisTranslateService,
    private dateService: DateService,
    private confirmationService: ConfirmationService,
    private sharedEmployeeService: SharedEmployeeService,
    private rapportService: RapportService,
    private parametreGlobalService: ParametreGlobalService,
    private router: Router,
    private route: ActivatedRoute,
    private domControlService: DomControlService,
    private joursFeriesServie: JoursFeriesService,
    private parametreService: ParametreGlobalService
  ) {
  }

  private async getAbsenceParams(): Promise<void> {
    const codeNamesAsArray = [this.OUVRABLE, this.CALCULCP, this.ABS_REPARTITION_CALCULATION, this.BLOCK_GDH_PARAM_CODE, this.DECOMPTFERIE];
    const codeNames = codeNamesAsArray.join(';');
    const parameters: ParametreModel[] = await this.parametreService.getParamRestaurantByCodeNames(codeNames).toPromise();
    let isOuvrableParam, calculCPParam, isInRepartitionMode, blockGdhParam, decompteFerieParam;
    parameters.forEach((parameter: ParametreModel) => {
      switch (parameter.param) {
        case this.OUVRABLE:
          isOuvrableParam = parameter;
          break;
        case this.CALCULCP:
          calculCPParam = parameter;
          break;
        case this.ABS_REPARTITION_CALCULATION:
          isInRepartitionMode = parameter;
          break;
        case this.BLOCK_GDH_PARAM_CODE:
          blockGdhParam = parameter;
          break;
        case this.DECOMPTFERIE:
          decompteFerieParam = parameter;
          break;
      }
    });
    this.blockGdhParam = blockGdhParam;
    this.absenceParam = {
      isOuvrable: isOuvrableParam.valeur.toString().toLowerCase() === this.TRUE_STR,
      calculCP: Number(calculCPParam.valeur),
      isInRepartitionMode: isInRepartitionMode.valeur.toString().toLowerCase() === this.TRUE_STR
    };
    if (decompteFerieParam.valeur === 'true') {
      this.getListJourFeriesByRestaurant();
    }
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des absences et congés de l'employee
   */
  public getListAbsenceCongeByEmployee() {
    this.absenceCongeService.getAllAbsenceCongeByEmployee(this.id).subscribe(
      (data: AbsenceCongeModel[]) => {
        this.listAbsenceConge = data;
        this.getListTypeEvenementByRestaurant();

      }, (err: any) => {

      }
    );
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des types des evenements par restaurant
   */
  public getListTypeEvenementByRestaurant() {
    this.typeEvenementService.getAllTypeEvenementActiveByRestaurant().subscribe(
      (data: TypeEvenementModel[]) => {
        this.listTypeEvenement = data;
      }, (err: any) => {

      }
    );
  }

  /**
   * Cette methode  permet d'afficher le popup d'ajout d'un congé
   */
  public addCongeAbsence() {
    this.addUpdateAbsenceCongeTitle = this.rhisTranslateService.translate('DEMANDE_CONGE.ADD_NEW_CONGE_LABEL');
    this.absenceConge = new AbsenceCongeModel();
    this.showCongeAbsencePopup = true;
  }

  /**
   * afficher le detail absence conge
   */
  public showDetailsAbsenceConge(absenceConge) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.addUpdateAbsenceCongeTitle = this.rhisTranslateService.translate('DEMANDE_CONGE.UPDATE_CONGE_LABEL');
      this.absenceConge = JSON.parse(JSON.stringify(absenceConge));
      this.showCongeAbsencePopup = true;
    }

  }

  /**
   * Cette methode permet de :
   *  1- Vérifier si le conge a un type d'evenement si non un message d'erreur sera affiché
   *  2- Vérifier si le congé a une date de fin et une date de debut sinon un message d'erreur sera affiché
   *  3- Vérifier que la date de fin est supérieur à la date de début sinon un message d'erreur sera affiché
   * @param :absenceConge
   */
  public addOrUpdateAbsenceForEmployee(absenceCreationState: AbsenceDurationStateModel): void {
    const absenceConge = absenceCreationState.absence;
    if (!absenceConge.typeEvenement) {
      this.notificationService.showErrorMessage('DEMANDE_CONGE.COULD_NOT_ADD_EMPTY_TYPE_EVENEMENT', 'DEMANDE_CONGE.ERROR_VALIDATION');
      return;
    }
    if (absenceConge.dateDebut && absenceConge.dateFin) {
      if (absenceConge.dateFin < absenceConge.dateDebut) {
        this.notificationService.showErrorMessage('DEMANDE_CONGE.COULD_NOT_ADD_DATE_FIN_INF_DATE_DEBUT', 'DEMANDE_CONGE.ERROR_VALIDATION');
        return;
      }
    } else {
      this.notificationService.showErrorMessage('DEMANDE_CONGE.COULD_NOT_ADD_EMPTY_DATE', 'DEMANDE_CONGE.ERROR_VALIDATION');
      return;
    }
    if (!absenceConge.typeEvenement.previsible) {
      absenceConge.status = StatusDemandeCongeEnumeration.VALIDE;
    } else {
      absenceConge.status = StatusDemandeCongeEnumeration.EN_ATTENTE;
    }
    absenceConge.dateDebut = this.dateService.setCorrectDate(absenceConge.dateDebut);
    absenceConge.dateFin = this.dateService.setCorrectDate(absenceConge.dateFin);

    const congeToBeSaved = JSON.parse(JSON.stringify(absenceConge));
    congeToBeSaved.employee = this.sharedEmployeeService.selectedEmployee;
    const absences = this.isIntersectAbsenceConge(this.listAbsenceConge, absenceConge);
    // check that modification is authorized for the ``absenceConge`` interval based on GDH_BLOCK parameter
    if (this.isModificationAllowed(congeToBeSaved)) {
      if (absences.length) {
        this.confirmationService.confirm({
          message: this.rhisTranslateService.translate('POPUPS.ALREADY_ABSENT_TEXTE') + '<br>' + this.createDoublonMessage(absences) + this.rhisTranslateService.translate('POPUPS.CONTINUE'),
          header: this.rhisTranslateService.translate('POPUPS.ALREADY_ABSENT_TITLE'),
          acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: async () => {
            if (congeToBeSaved.idAbsenceConge) {
              this.updateAbsenceCongeToEmployee(congeToBeSaved, absenceCreationState);
            } else {
              this.addAbsenceCongeToEmployee(congeToBeSaved, absenceCreationState);
            }
          },
          reject: () => {
          }
        });
      } else {
        if (congeToBeSaved.idAbsenceConge) {
          this.updateAbsenceCongeToEmployee(congeToBeSaved, absenceCreationState);
        } else {
          this.addAbsenceCongeToEmployee(congeToBeSaved, absenceCreationState);
        }
      }
    } else {
      this.warningPopUpLock = true;
    }
  }

  private isIntersectAbsenceConge(listAbsenceConge: AbsenceCongeModel[], absence: AbsenceCongeModel): AbsenceCongeModel[] {
    const absenceList: AbsenceCongeModel[] = [];

    const listDatAbsences = this.dateService.getDatesBetweenTwoDates(absence.dateDebut, absence.dateFin);

    listDatAbsences.forEach((absenceDate: Date) => {
      listAbsenceConge.forEach((absenceConge: AbsenceCongeModel) => {
        if (absence.idAbsenceConge) {
          if (absence.idAbsenceConge === absenceConge.idAbsenceConge) {
            return;
          } else {
            const absenceCongeStart = new Date(absenceConge.dateDebut);
            const absenceCongeEnd = new Date(absenceConge.dateFin);
            if (this.dateService.isIntersect(this.initializeDate(absenceDate), [this.initializeDate(absenceCongeStart), this.initializeDate(absenceCongeEnd)])) {
              absenceList.push(this.createAbsence(absenceConge, absenceDate));
            }
          }
        } else {
          const absenceCongeStart = new Date(absenceConge.dateDebut);
          const absenceCongeEnd = new Date(absenceConge.dateFin);
          if (this.dateService.isIntersect(this.initializeDate(absenceDate), [this.initializeDate(absenceCongeStart), this.initializeDate(absenceCongeEnd)])) {
            absenceList.push(this.createAbsence(absenceConge, absenceDate));
          }
        }
      });
    });
    return absenceList;
  }

  private createAbsence(absenceConge: AbsenceCongeModel, absenceDate: Date): AbsenceCongeModel {
    const absenceCongeStart = new Date(absenceConge.dateDebut);
    const absenceCongeEnd = new Date(absenceConge.dateFin);
    const abseceConge: AbsenceCongeModel = new AbsenceCongeModel();
    if (this.dateService.isIntersect(this.initializeDate(absenceDate), [this.initializeDate(absenceCongeStart), this.initializeDate(absenceCongeEnd)])) {
      abseceConge.dateDebut = absenceDate;
      abseceConge.dateFin = absenceDate;
      abseceConge.typeEvenement = absenceConge.typeEvenement;
    }
    return abseceConge;
  }

  private initializeDate(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  private createDoublonMessage(absences: AbsenceCongeModel[]): string {
    let message = '';
    absences.forEach((absence: AbsenceCongeModel) => {
      message = message + '<li>' + this.dateService.dateToShortForm(absence.dateDebut) + '  (' + absence.typeEvenement.libelle + ') <br>';
    });
    return '<div class="pop-up-min-height scroll-general-rhis">' + message + '</div>';
  }

  /**
   * Modifier absence conge
   * @param: absenceConge
   * @param: absenceCreationState
   */
  private updateAbsenceCongeToEmployee(absenceConge: AbsenceCongeModel, absenceCreationState: AbsenceDurationStateModel): void {
    const updateOperationObservable: Observable<object> = absenceCreationState.mode === DurationModeEnum.PLANNING_REPARTITION ?
      this.absenceCongeService.updateConge(absenceConge) :
      this.absenceCongeService.updateCongeWithDuration(absenceConge, absenceCreationState.hours, absenceCreationState.minutes);
    updateOperationObservable.subscribe(
      (data: any) => {
        this.setAbsenceCongeAfterUpdate(absenceConge, data);
      }, (err: any) => {
        this.setErrorMessageOnSaveAbsenceConge(err);
      }
    );
  }

  /**
   * ajouter  absence conge dans la list des absences conges
   * @param :IdAbsenceConge
   */
  public setAbsenceCongeAfterSave(absenceConge: AbsenceCongeModel): void {
    this.listAbsenceConge.push(absenceConge);
    this.sortAbsenceConge();
    this.showCongeAbsencePopup = false;
    this.notificationService.showSuccessMessage('DEMANDE_CONGE.SAVE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');

  }

  /**
   * Ajouter absence conge
   * @param: absenceConge
   * @param: absenceCreationState
   */
  private addAbsenceCongeToEmployee(absenceConge: AbsenceCongeModel, absenceCreationState: AbsenceDurationStateModel): void {
    const addOperationObservable: Observable<object> = absenceCreationState.mode === DurationModeEnum.PLANNING_REPARTITION ?
      this.absenceCongeService.saveConge(absenceConge) :
      this.absenceCongeService.saveCongeWithDuration(absenceConge, absenceCreationState.hours, absenceCreationState.minutes);
    addOperationObservable.subscribe(
      (data: AbsenceCongeModel) => {
        this.setAbsenceCongeAfterSave(data);
      }, (err: any) => {
        this.setErrorMessageOnSaveAbsenceConge(err);
      }
    );
  }

  /**
   * getsion des erreuurs d'unicite
   * @param : error
   */
  public setErrorMessageOnSaveAbsenceConge(error) {
    if (error.error === 'CONGE_ABSENCE_CONTRAT_IS_NULL') {
      this.notificationService.showErrorMessage('DEMANDE_CONGE.CONTRAT_NULL', 'DEMANDE_CONGE.ERROR_VALIDATION');
    }
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :absenceConge
   * @param :filter
   */
  public showConfirmDeleteAbsenceConge(absenceConge, filter: string) {
    if (filter === 'delete') {
      this.showCongeAbsencePopup = false;
      this.idAbsenceConge = absenceConge.uuid;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
        header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.onConfirmDeleteAbsenceConge();
        },
        reject: () => {
        }
      });
    }
  }

  /**
   * set conge after refuse or validate
   * @param: absenceConge
   * @param :data
   */
  setAbsenceCongeAfterValideOrRefuse(absenceConge: AbsenceCongeModel, data: any) {
    this.listAbsenceConge.forEach((absence, index) => {
      if (absence.uuid === data) {
        this.listAbsenceConge[index] = absenceConge;
      }
    });
    this.showValidateOrRefuseCongeAbsencePopup = false;
    if (absenceConge.status === this.statusCongeValide) {
      this.notificationService.showSuccessMessage('DEMANDE_CONGE.VALIDATE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');
    }
    if (absenceConge.status === this.statusCongeNonValide) {
      this.notificationService.showSuccessMessage('DEMANDE_CONGE.REFUSE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');
    }
  }

  /**
   * modifier absence conge qui se trouve dans liste
   * @param :absenceConge
   * @param :data
   */
  private setAbsenceCongeAfterUpdate(absenceConge, data) {
    this.listAbsenceConge.forEach((absence, index) => {
      if (absence.uuid === data) {
        this.listAbsenceConge[index] = absenceConge;
        this.sortAbsenceConge();
      }
    });
    this.showCongeAbsencePopup = false;
    this.notificationService.showSuccessMessage('DEMANDE_CONGE.SAVE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');

  }

  /**
   * open popup for validate or refuse conge
   * @param: conge
   */
  showPopupvalidateOrRefuseAbsenceConge(absenceConge: AbsenceCongeModel) {
    this.showCongeAbsencePopup = false;
    this.addUpdateAbsenceCongeTitle = this.rhisTranslateService.translate('DEMANDE_CONGE.VALIDER_CONGE');
    this.absenceConge = JSON.parse(JSON.stringify(absenceConge));
    this.showValidateOrRefuseCongeAbsencePopup = true;
  }

  /**
   * Valdate or refuse conge
   * @param: absenceConge
   */
  valideOrRefuseAbsenceForEmployee(absenceConge: AbsenceCongeModel): void {
    const congeToBeSaved = JSON.parse(JSON.stringify(absenceConge));
    congeToBeSaved.employee = this.sharedEmployeeService.selectedEmployee;
    this.absenceCongeService.updateCongeStatus(congeToBeSaved).subscribe(
      (data: any) => {
        this.setAbsenceCongeAfterValideOrRefuse(congeToBeSaved, data);
        this.congeToDownload = congeToBeSaved;
      }, (err: any) => {
        this.setErrorMessageOnSaveAbsenceConge(err);
      }, () => this.viewFile(congeToBeSaved)
    );
  }

  /**
   * suppression de conge
   */
  private onConfirmDeleteAbsenceConge() {
    const index = this.listAbsenceConge.findIndex(absence => absence.uuid === this.idAbsenceConge);
    // check deletion is allowed for this absence based on GDH_BLOCK date limit
    if (Object.is(this.blockGdhParam, null) ||
        (index !== -1 && this.checkModificationAuthorization(this.blockGdhParam.valeur, this.listAbsenceConge[index].dateDebut))) {
      this.absenceCongeService.deleteAbsenceConge(this.idAbsenceConge).subscribe((data: any) => {
            this.listAbsenceConge.splice(index, 1);
            this.notificationService.showSuccessMessage('DEMANDE_CONGE.SUPP_SUCESS');
          }, err => {
            console.log(err);
          }
      );
    } else {
      this.warningPopUpLock = true;
    }
  }

  /**
   * view file
   * @param: report
   */
  public viewFile(absenceConge: AbsenceCongeModel) {
    this.setReportGenerationConfig(true, GenerationReport.Progress);

    this.viewPdf = 1;
    this.showCongeAbsencePopup = false;
    if (!absenceConge.employee) {

      absenceConge.employee = this.sharedEmployeeService.selectedEmployee;
    }
    this.congeToDownload = absenceConge;
    if (absenceConge.status === this.statusCongeValide || absenceConge.status === this.statusCongeAttente) {
      this.createDemandeCongeFile(absenceConge);
    } else if (absenceConge.status === this.statusCongeNonValide) {
      this.createRefusDemandeCongeFile(absenceConge);
    }
  }

  /**
   * cretae demande conge file after validate conge
   * @param: absenceConge
   */
  public createDemandeCongeFile(absenceConge: AbsenceCongeModel) {
    this.absenceCongeService.createDemandeCongeFile(absenceConge, this.langue, this.viewPdf).subscribe(responce => {
      if (this.viewPdf === 1) {
        this.blob = responce;
      }

      this.printOrDownloadConge(responce, 'DC_');
    }, error => {
      this.setReportGenerationConfig(true, GenerationReport.Error);
    });
  }

  /**
   * cretae demande conge file after refuse conge
   * @param: absenceConge
   */
  public createRefusDemandeCongeFile(absenceConge: AbsenceCongeModel) {
    this.absenceCongeService.createRefusDemandeCongeFile(absenceConge, this.langue, this.viewPdf).subscribe(responce => {
      if (this.viewPdf === 1) {
        this.blob = responce;
      }
      this.printOrDownloadConge(responce, 'RC_');
    }, error => {
      this.setReportGenerationConfig(true, GenerationReport.Error);
    });
  }


  /**
   * display file in popup
   * @param : data
   * @param : description
   */
  public async showDocument(data: any, description: string) {
    this.reportViewer = await this.rapportService.createDocument(data);
    this.titleReport = description;
    this.isReportShown = true;
    this.setReportGenerationConfig(false);

  }

  /**
   * print file
   * @param :report
   */
  public printFile() {
    if (this.blob) {
      this.absenceCongeService.printDocument(this.blob);
      this.setReportGenerationConfig(false);

    }
  }

  public downloadFile() {
    this.setReportGenerationConfig(true, GenerationReport.Progress);

    this.viewPdf = 0;
    if (this.congeToDownload.status === this.statusCongeValide || this.congeToDownload.status === this.statusCongeAttente) {
      this.createDemandeCongeFile(this.congeToDownload);
    } else if (this.congeToDownload.status === this.statusCongeNonValide) {
      this.createRefusDemandeCongeFile(this.congeToDownload);
    }
  }

  /**
   * downolad conge or print
   * @param :responce
   * @param :filter
   */
  public printOrDownloadConge(responce, filter: string) {
    this.setReportGenerationConfig(true, GenerationReport.Success);
    this.isReportGenerationLoader = false;
    if (this.viewPdf === 1) {

      this.showDocument(responce, filter +
        this.sharedEmployeeService.selectedEmployee.nom + '_' +
        this.sharedEmployeeService.selectedEmployee.matricule);
    }
    if (this.viewPdf === 0) {
      FileSaver.saveAs(responce, filter +
        this.sharedEmployeeService.selectedEmployee.nom + '_' +
        this.sharedEmployeeService.selectedEmployee.matricule + '.Doc');
    }
  }

  /**
   * Configuration of the popup of report generation template
   * @param: loader
   * @param :label
   */
  private setReportGenerationConfig(loader?: boolean, label?: string) {
    this.isReportGenerationLoader = loader;
    this.reportGenerationLabel = this.rhisTranslateService.translate(`REPORT.${label}`);
  }

  public getBackgroundColor(code: number): boolean {
    switch (code) {
      case 0:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Success}`);
      case 1:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Progress}`);
      case 2:
        return this.reportGenerationLabel === this.rhisTranslateService.translate(`REPORT.${GenerationReport.Error}`);
    }
  }

  /**
   * get Employees form infos
   */
  private async getInfoEmployees(): Promise<void> {
    this.langue = this.rhisTranslateService.currentLang;
    await this.getAbsenceParams();
    this.getListAbsenceCongeByEmployee();
  }

  /**
   * permet de tirié la liste des absences par date de debut decroissant
   */
  private sortAbsenceConge(): void {
    this.listAbsenceConge.sort((firstDate: AbsenceCongeModel, secondDate: AbsenceCongeModel) => {
      return +new Date(secondDate.dateDebut) - +new Date(firstDate.dateDebut);
    });
  }

  /**
   * recuperer les jours feries par restaurant
   */
  private getListJourFeriesByRestaurant(): void {
    this.joursFeriesServie.getAllJourFeriesByIdRestaurant().subscribe(
      (data: any) => {
        this.listJourFeries = data;
        this.listJourFeries.forEach((jourFeries: JourFeriesModel) => {
          jourFeries.dateFeries = new Date(jourFeries.dateFeries);
          jourFeries.dateFeries.setHours(0, 0, 0, 0);
        });
      },
      (err: any) => {
        // TODO gestion erreur
      }
    );
  }

  // ******************************             Authorization for Modification checking             ******************************

  /**
   * check that absence modification(update||creation) is allowed based on GDH_BLOCK parameter
   * @param absence absence to be checked
   * return if absence modification can be pursued or not
   */
  private isModificationAllowed(absence: AbsenceCongeModel): boolean {
    // allow all sort of modification if GDH_BLOCK parameter doesn't exist
    if (Object.is(this.blockGdhParam, null)) {
      return true;
    }
    if (absence.idAbsenceConge) {
      // check absence updating is allowed
      return this.checkUpdateModificationIsAllowed(absence);
    } else {
      // check absence creation is allowed
      return this.checkModificationAuthorization(this.blockGdhParam.valeur, absence.dateDebut);
    }
  }

  /**
   * check that absence update is allowed based on GDH_BLOCK parameter
   * @param absence absence to be checked
   * return that updating can be pursued or not
   */
  private checkUpdateModificationIsAllowed(absence: AbsenceCongeModel): boolean {
    const previousAbsence = this.listAbsenceConge.find(abs => abs.idAbsenceConge === absence.idAbsenceConge);
    if (previousAbsence) {
      const isStartDatesAreTheSame = this.dateService.isSameDateOn(previousAbsence.dateDebut, absence.dateDebut, 'days');
      const isEndDatesAreTheSame = this.dateService.isSameDateOn(previousAbsence.dateFin, absence.dateFin, 'days');
      let startDateModificationIsAllowed = true;
      let endDateModificationIsAllowed = true;
      if (!isStartDatesAreTheSame) {
        startDateModificationIsAllowed =  this.checkModificationAuthorization(this.blockGdhParam.valeur, absence.dateDebut);
      }
      if (!isEndDatesAreTheSame) {
        endDateModificationIsAllowed =  this.checkModificationAuthorization(this.blockGdhParam.valeur, absence.dateFin);
      }
      return startDateModificationIsAllowed && endDateModificationIsAllowed;
    }
  }

  /**
   * Check if the date is after the limit date in GDH_BLOCK parameter
   * @param referenceParamValue the date limit of GDH_BLOCK as a string
   * @param date the date to be checked withe teh GDH_BLOCK parameter value
   * return a boolean (if the date is after the date limit)
   */
  private checkModificationAuthorization(referenceParamValue: string, date: Date): boolean {
    const referenceDate = new Date(referenceParamValue.split('/').reverse().join('/'));
    return  this.dateService.isAfterOn(date, referenceDate, 'days');
  }
}
