import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {VisiteMedicaleModel} from '../../../../../../shared/model/visiteMedicale.model';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {VisiteMedicalService} from '../../../service/visite-medical.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {SharedEmployeeService} from '../../../service/sharedEmployee.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';


@Component({
  selector: 'rhis-visite-medical',
  templateUrl: './list-visite-medical.component.html',
  styleUrls: ['./list-visite-medical.component.scss']
})
export class ListVisiteMedicalComponent implements OnChanges {

  public addUpdateVisiteMedicalTitle: string;
  public listVisiteMedical: VisiteMedicaleModel[] = [];
  public visiteMedical = {} as VisiteMedicaleModel;
  public showVisiteMedicalPopup = false;
  @Input()
  public idEmployee;
  public visiteHeader = [
    {title: this.rhisTranslateService.translate('EMPLOYEE.DATE_VISIE'), field: 'dateVisite'},
    {title: this.rhisTranslateService.translate('EMPLOYEE.EXPIRE_LE'), field: 'dateExpiration'},
    {title: this.rhisTranslateService.translate('EMPLOYEE.Valide'), field: 'valide'},

  ];
  public ecran = 'GVM';

  constructor(private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private visiteMedicalService: VisiteMedicalService,
              private notificationService: NotificationService,
              private dateService: DateService,
              private sharedEmployeeService: SharedEmployeeService,
              private domControlService: DomControlService) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des visite de l'employee
   */
  public getListVisiteMedicalByEmployee() {
    this.visiteMedicalService.getAllVisiteMedicalByEmployee(this.idEmployee).subscribe(
      (data: VisiteMedicaleModel[]) => {
        this.listVisiteMedical = data;
      }, (err: any) => {

      }
    );
  }

  /**
   * ajouter absence conge
   * @param :absenceConge
   */
  addVisiteMedicalToEmployee(visiteMedical: VisiteMedicaleModel) {
    this.visiteMedicalService.saveVisiteMedical(visiteMedical).subscribe(
      (data: VisiteMedicaleModel) => {
        this.setvisiteMedicalAfterSave(visiteMedical, data);
      }, (err: any) => {
        this.setErrorMessageOnSavevisiteMedical(err);
      }
    );
  }

  /**
   * getsion des erreuurs d'unicite
   * @param : error
   */
  public setErrorMessageOnSavevisiteMedical(error) {
    if (error.error === 'CONGE_ABSENCE_CONTRAT_IS_NULL') {
      this.notificationService.showErrorMessage('DEMANDE_CONGE.CONTRAT_NULL', 'DEMANDE_CONGE.ERROR_VALIDATION');
    }
  }

  /**
   * ajouter  absence conge dans la list des visite Medical
   * @param :IdAbsenceConge
   */
  public setvisiteMedicalAfterSave(visiteMedicale: VisiteMedicaleModel, peristedVisiteMedicale: VisiteMedicaleModel): void {
    this.showVisiteMedicalPopup = false;
    visiteMedicale.idVisiteMedicale = peristedVisiteMedicale.idVisiteMedicale;
    visiteMedicale.uuid = peristedVisiteMedicale.uuid;
    this.listVisiteMedical.push(visiteMedicale);
    this.notificationService.showSuccessMessage('VISITE_MEDICAL.SAVE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');
  }


  /**
   * Cette methode permet de :
   *  1- Vérifier si le visite medicale a une date d'expiration et une date de visite sinon un message d'erreur sera affiché
   *  2- Vérifier que la date d'expiration est supérieur à la date de visite sinon un message d'erreur sera affiché
   * @param :absenceConge
   */
  public addOrUpdatevisiteMedical(visiteMedical: VisiteMedicaleModel) {

    if (visiteMedical.dateVisite && visiteMedical.dateExpiration) {
      if (visiteMedical.dateExpiration <= visiteMedical.dateVisite) {
        this.notificationService.showErrorMessage('VISITE_MEDICAL.COULD_NOT_ADD_DATE_EXPIRATION_INF_DATE_VISITE',
          'DEMANDE_CONGE.ERROR_VALIDATION');
        return;
      }
    } else {
      this.notificationService.showErrorMessage('VISITE_MEDICAL.COULD_NOT_ADD_EMPTY_DATE',
        'DEMANDE_CONGE.ERROR_VALIDATION');
      return;
    }

    visiteMedical.dateVisite = this.dateService.setCorrectDate(visiteMedical.dateVisite);
    visiteMedical.dateExpiration = this.dateService.setCorrectDate(visiteMedical.dateExpiration);

    const vistiteToBeSaved = JSON.parse(JSON.stringify(visiteMedical));
    vistiteToBeSaved.employee = this.sharedEmployeeService.selectedEmployee;
    if (vistiteToBeSaved.idVisiteMedicale) {
      this.UpdateVisiteMedicalToEmployee(vistiteToBeSaved);
    } else {
      this.addVisiteMedicalToEmployee(vistiteToBeSaved);
    }
  }


  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.idEmployee) {
      this.idEmployee = changes.idEmployee.currentValue;
      this.getListVisiteMedicalByEmployee();
    }
  }

  /**
   * Modifier visite medical qui se trouve dans liste
   * @param :absenceConge
   * @param :data
   */
  private setVisiteMedicalAfterUpdate(visiteMedical, data) {
    this.showVisiteMedicalPopup = false;
    this.listVisiteMedical.forEach((visite, index) => {
      if (visite.idVisiteMedicale === data) {
        this.listVisiteMedical[index] = visiteMedical;
      }
    });
    this.notificationService.showSuccessMessage('VISITE_MEDICAL.SAVE_SUCESS', 'FORMATION.FORMATION_ADDED_SUCCESSFULLY');

  }

  /**
   * Affichage de message de confirmation de suppression
   * @param: visiteMedical
   */
  public showConfirmDeleteVisiteMedical(visiteMedical: VisiteMedicaleModel): void {
    this.showVisiteMedicalPopup = false;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteVisiteMedical(visiteMedical);
      },
      reject: () => {
      }
    });
  }

  /**
   *  Modifier visite medical
   * @param: visiteMedical
   * @constructor
   */
  private UpdateVisiteMedicalToEmployee(visiteMedical: VisiteMedicaleModel) {
    this.visiteMedicalService.updateVisiteMedical(visiteMedical).subscribe(
      (data: any) => {
        this.setVisiteMedicalAfterUpdate(visiteMedical, data);
      }, (err: any) => {
        this.setErrorMessageOnSavevisiteMedical(err);
      }
    );
  }

  /**
   * Cette methode methode permet d'afficher le popup d'ajout d'un visie medicale
   */
  public addVisiteMedical() {
    this.addUpdateVisiteMedicalTitle = this.rhisTranslateService.translate('VISITE_MEDICAL.ADD_NEW_VISITE');
    this.visiteMedical = new VisiteMedicaleModel();
    this.showVisiteMedicalPopup = true;
  }

  /**
   * Afficher le detail absence visiste medicale
   * @param: visiteMedical
   */
  showDetailsVisiteMedical(visiteMedical: VisiteMedicaleModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.addUpdateVisiteMedicalTitle = this.rhisTranslateService.translate('VISITE_MEDICAL.UPDATE_VISITE_LABEL');
      this.visiteMedical = JSON.parse(JSON.stringify(visiteMedical));
      this.showVisiteMedicalPopup = true;
    }
  }

  /**
   * suppression visite medical
   * @param :idVisiteMedical
   */
  private deleteVisiteMedical(visiteMedical: VisiteMedicaleModel): void {
    this.visiteMedicalService.deleteVisiteMedical(visiteMedical.uuid).subscribe((data: any) => {
        const index = this.listVisiteMedical.findIndex(visite => visite.idVisiteMedicale === visiteMedical.idVisiteMedicale);
        this.listVisiteMedical.splice(index, 1);
        this.notificationService.showSuccessMessage('VISITE_MEDICAL.SUPP_SUCESS', 'FORMATION.SUPP');

      }, err => {
        console.log(err);
      }
    );
  }
}
