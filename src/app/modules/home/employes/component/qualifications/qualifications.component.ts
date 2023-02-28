import {Component} from '@angular/core';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {QualificationService} from '../../service/qualification.service';
import {QualificationModel} from '../../../../../shared/model/qualification.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {PositionTravailModel} from '../../../../../shared/model/position.travail.model';
import {ConfirmationService} from 'primeng/api';
import {QualificationPkModel} from '../../../../../shared/model/qualificationPK.model';
import {FormationModel} from '../../../../../shared/model/formation.model';
import {FormationEmployeePK} from '../../../../../shared/model/formation.employeePK';
import {FormationEmployeeModel} from '../../../../../shared/model/formation.employee.model';
import {FormationEmployeeService} from '../../service/formation.employee.service';
import {ActivatedRoute} from '@angular/router';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {EmployeeService} from '../../service/employee.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {PositionTravailService} from '../../../configuration/service/position-travail.service';
import {FormationService} from '../../../configuration/service/formation.service';
import {Observable, Subject} from 'rxjs';
import {DateService} from '../../../../../shared/service/date.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-qualifications',
  templateUrl: './qualifications.component.html',
  styleUrls: ['./qualifications.component.scss']
})
export class QualificationsComponent {

  public competences: QualificationModel[] = [];
  public defaultCompetences: QualificationModel[] = [];
  public listPositionTravail: PositionTravailModel[] = [];
  public remainingListPositionTravail: PositionTravailModel[] = [];
  public showAddQualificationPopup = false;

  public showUpdateFormationDatePopup = false;
  public listAllFormation: FormationModel[] = [];
  public listFormationObligatoire: FormationModel[] = [];
  public listFormationNonObligatoire: FormationModel[] = [];
  public listFormationByEmployee: FormationEmployeeModel[] = [];
  public defaultListFormationByEmployee: FormationEmployeeModel[] = [];
  public selectedFormation: FormationModel;
  public dateSelectedFormation: Date;
  private idEmployee: string;
  public showAddFormationPopup = false;

  public addNewFormationEmployeeTitle: string;
  public addNewQualificationTitle: string;
  public isCompetencesChanged = false;
  public isFormationsChanged = false;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  private ecran = 'GDQ';
  private ecranFormation = 'ELF';
  public currentDate: Date;

  tooltipStyle = {
    top: -45,
    left: -50
  };

  private ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

  constructor(private sharedEmployeeService: SharedEmployeeService,
              private qualificationService: QualificationService,
              private positionTravailService: PositionTravailService,
              private formationService: FormationService,
              private formationEmployeeService: FormationEmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private employeeService: EmployeeService,
              private dateService: DateService,
              private route: ActivatedRoute,
              private domControlService: DomControlService) {
    this.route.parent.params.subscribe(params => {
      this.idEmployee = params.idEmployee;
      this.getInfoEmployees();
    });

    this.currentDate = this.dateService.setTimeNull(this.currentDate);

  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public addButtonControlFormation(): boolean {
    return this.domControlService.addControlButton(this.ecranFormation);
  }

  public deleteButtonControlFormation(): boolean {
    return this.domControlService.deleteListControl(this.ecranFormation);
  }

  public updateControlFormation(): boolean {
    return this.domControlService.updateListControl(this.ecranFormation);
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des competneces de l'employee
   */
  private getActiveQualificationsByEmployee() {
    this.qualificationService.getAllActiveQualificationByEmployee(null, this.idEmployee).subscribe(
      (data: QualificationModel[]) => {
        this.competences = data;
        this.defaultCompetences = JSON.parse(JSON.stringify(this.competences));
        this.getListActivePositionTravailByRestaurant();
      }, (err: any) => {

      }
    );
  }

  /**
   * Get Employee when we reload page and the sahred one is gone
   * Then fetch employee by id
   */
  private setEmploye() {
    if (!this.sharedEmployeeService.selectedEmployee) {
      this.getEmployeByIdWithBadge();
    }
  }

  /**
   * Get Employee with badge by id
   */
  private getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.idEmployee).subscribe(
      (employe: EmployeeModel) => {
        this.sharedEmployeeService.selectedEmployee = employe;
      },
      (err: any) => {
        console.log('Erreuue au niveau de un employe ');
      }
    );
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des positions de travail
   */
  private getListActivePositionTravailByRestaurant() {
    this.positionTravailService.getAllActivePositionTravailByRestaurant().subscribe(
      (data: PositionTravailModel[]) => {
        this.listPositionTravail = data;
        this.setRemainingPositionTravail();
      }, (err: any) => {

      }
    );
  }

  /**
   * Methode qui permet de definir la liste des competences restantes que l'employee peut les acquirir
   */
  private setRemainingPositionTravail() {
    this.remainingListPositionTravail = [];
    let found: boolean;
    this.listPositionTravail.forEach(item => {
      found = false;
      this.competences.forEach(itemCompetence => {
        itemCompetence.employee = this.sharedEmployeeService.selectedEmployee;
        if (item.idPositionTravail === itemCompetence.positionTravail.idPositionTravail) {
          found = found || true;
        }
      });
      if (!found) {
        this.remainingListPositionTravail.push(item);
      }
    });
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des formations
   */
  private getAllActiveFormationByRestaurant() {
    this.formationService.getAllActiveForamtionByRestaurant().subscribe(
      (data: FormationModel[]) => {
        this.listAllFormation = data;
        this.getAllActiveFormationEmployee();
      }, (err: any) => {

      }
    );
  }

  /**
   * Methode qui appel le web service responsable à la récuperation de la liste des formations de l'employee
   */
  private getAllActiveFormationEmployee() {
    this.formationEmployeeService.getAllActiveFormationByEmployee(this.idEmployee).subscribe(
      (data: FormationEmployeeModel[]) => {
        this.listFormationByEmployee = data;
        this.defaultListFormationByEmployee = JSON.parse(JSON.stringify(this.listFormationByEmployee));
        this.setObligatoireFormation();
      }, (err: any) => {

      }
    );
  }

  /**
   * Cette methode permet de mettre à jour la date de la formation d'employee et mettre à jour la date d'expiration
   */
  public setDateValue() {
    this.showUpdateFormationDatePopup = false;
    this.dateSelectedFormation.setHours(12);
    this.selectedFormation.dateFormationEmployee = this.dateSelectedFormation;
    this.createFormationEmployeeObject(this.selectedFormation);
    this.listAllFormation.forEach((item, index) => {
      if (index < this.listFormationByEmployee.length) {
        if (this.listFormationByEmployee[index].formationEmployePK.idFormation === this.selectedFormation.idFormation) {
          this.listFormationByEmployee[index].dateFormation = this.dateSelectedFormation;
        }
      }
      if (item.idFormation === this.selectedFormation.idFormation) {
        item.dateFormationEmployee = this.dateSelectedFormation;
        item.dateFinValidite = new Date(this.dateSelectedFormation.getTime() + (this.ONE_DAY_IN_MILLISECONDS * item.dureeValidite));
      }
    });
  }

  /**
   * Methode qui permet de supprimer une competence de la liste de competence
   * @param: idPositionTravail
   */
  public removeCompetence(idPositionTravail: number) {
    this.confirmDeleteQualification(idPositionTravail);


  }

  /**
   * Methode qui appel le web service responsable à la suprresion d'une competence
   * @param: idPositionTravail
   */
  public deleteQualification(idPositionTravail: string) {
    this.qualificationService.deleteQualificationByIdPositionTravailAndIdEmployee(this.sharedEmployeeService.selectedEmployee.uuid, idPositionTravail).subscribe(
      () => {
        this.defaultCompetences = JSON.parse(JSON.stringify(this.competences));
        this.notificationService.showSuccessMessage('QUALIFICATION.DELETE_SUCCESS');
      }, () => {

      });
  }

  /**
   * Le methode qui retourne le commentaire sur la competence qui sont :
   * - 0-25 Débutant
   * - 25-50 Intermédiaire
   * - 50-75 Confirmé
   * - 75-100 Expert
   * Les commentaires seront traduit selon la langue du navigateur à l'aide de cette methode
   * @param: valeurQualification
   */
  public translateComment(valeurQualification: number): string {
    if (valeurQualification <= 25) {
      return this.rhisTranslateService.translate('QUALIFICATION.DEBUTANT');
    } else if (valeurQualification <= 50) {
      return this.rhisTranslateService.translate('QUALIFICATION.INTERMEDIAIRE');
    } else if (valeurQualification <= 75) {
      return this.rhisTranslateService.translate('QUALIFICATION.CONFIRME');
    } else {
      return this.rhisTranslateService.translate('QUALIFICATION.EXPERT');
    }
  }

  /**
   * methode qui permet d'ajouter une nouvelle competence à la liste des competences.
   * La competence prendra comme position de travail la position passer en param en comme employee
   * l'employee enregister dans le service d'emplyoee
   * @param: positionTravail
   */
  public addNewQualification(positionTravail: PositionTravailModel) {
    if (positionTravail) {
      this.showAddQualificationPopup = false;
      const qualificationToAdd = new QualificationModel();
      const qualificationPK = new QualificationPkModel();
      qualificationPK.idEmployee = this.sharedEmployeeService.selectedEmployee.idEmployee;
      qualificationPK.idPositionTravail = positionTravail.idPositionTravail;
      qualificationToAdd.qualificationPK = qualificationPK;
      qualificationToAdd.positionTravail = positionTravail;
      qualificationToAdd.employee = this.sharedEmployeeService.selectedEmployee;
      qualificationToAdd.valeurQualification = 25;
      this.competences.push(qualificationToAdd);
      this.setRemainingPositionTravail();
    } else {
      this.notificationService.showErrorMessage('QUALIFICATION.COULD_NOT_ADD_EMPTY', 'QUALIFICATION.ERROR_VALIDATION');
    }
  }

  /**
   * Methode qui permet d'afficher la popup de choisir une nouvelle competence
   */
  public displayAddQualificationPopup() {
    this.showAddQualificationPopup = true;
  }

  /**
   * Methode permet d'appeler le web service responsable a la modification / enregistrement des nouvelles valeurs
   * de qualifications et formations en passant comme param la liste des competences et la liste des formations employees
   */
  public saveUpdate() {
    if (this.competences.length !== 0) {
      this.saveQualifications();
    } else {
      this.notificationService.showSuccessMessage('QUALIFICATION.SAVE_SUCESS_SINGLE');
    }
    this.saveFormation();
  }

  /**
   * Save Formation
   */
  private saveFormation() {
    this.formationEmployeeService.saveListFormationEmployee(this.listFormationByEmployee).subscribe(
      (data: any) => {
        this.defaultListFormationByEmployee = JSON.parse(JSON.stringify(this.listFormationByEmployee));
      }, (err: any) => {

      });
  }

  /**
   * Save qualifications
   */
  private saveQualifications() {
    this.qualificationService.saveQualifications(this.competences, this.competences[0].employee.idEmployee).subscribe(
      () => {
        this.defaultCompetences = JSON.parse(JSON.stringify(this.competences));
        if (this.competences.length === 1) {
          this.notificationService.showSuccessMessage('QUALIFICATION.SAVE_SUCESS_SINGLE');
        } else {
          this.notificationService.showSuccessMessage('QUALIFICATION.SAVE_SUCESS_PLURAL');
        }
      }, () => {

      });
  }

  /**
   * Methode qui permet d'ajouter/supprimer une formation obligatoire à un employee
   * @param: formation
   */
  public setFormationEmployee(formation: FormationModel) {
    if (formation.formationSelectedForEmployee) {
      formation.formationSelectedForEmployee = false;
      this.defineFormationDate(formation);
    } else {
      this.dateSelectedFormation = undefined;
      this.removeFormationFromFormationEmployeeList(formation);
    }
  }

  /**
   * Methode qui permet d'afficher le popup pour modifier la date d'une formation employee
   * @param: formation
   */
  private defineFormationDate(formation: FormationModel) {
    this.updateControlFormation();
    {
      this.selectedFormation = formation;
      this.showUpdateFormationDatePopup = true;
    }
  }

  /**
   * Methode qui permet de definir les listes des formations obligatoires et non obligatoires
   */
  private setObligatoireFormation() {
    this.listFormationObligatoire = [];
    this.listFormationNonObligatoire = [];
    this.listAllFormation.forEach(item => {
      if (item.formationObligatoire) {
        this.listFormationObligatoire.push(item);
      } else {
        this.listFormationNonObligatoire.push(item);
      }
      this.listFormationByEmployee.forEach(formationEmployee => {
        if (formationEmployee.formation.idFormation === item.idFormation) {
          item.formationSelectedForEmployee = true;
          const dateFormation = new Date(formationEmployee.dateFormation);
          item.dateFormationEmployee = dateFormation;
          item.dateFinValidite = new Date(dateFormation.getTime() + (this.ONE_DAY_IN_MILLISECONDS * item.dureeValidite));
        }
      });
    });
  }

  /**
   * Cette methode permet d'afficher/masquer la tooltip qui permet d'afficher la date quand se déroule la formation
   * @param: formation
   */
  public showOrHideToolTip(formation: FormationModel) {
    formation.toolTipShow = !formation.toolTipShow;
  }

  /**
   * Cette methode permet d'ajouter une formation non obligatoire à un employee ou d'afficher un message d'erreur en cas d'absence d'une formation/date
   * @param: formation
   */
  addNewFormationEmployee(formation: FormationModel) {
    if (formation && formation.dateFormationEmployee) {
      this.showAddFormationPopup = false;
      this.createFormationEmployeeObject(formation);
    } else {
      this.notificationService.showErrorMessage(
        'FORMATION.COULD_NOT_ADD_EMPTY_DATE_OR_EMPTY_FORMATION',
        'FORMATION.ERROR_VALIDATION');
    }
  }

  displayAddFormationPopup() {
    this.showAddFormationPopup = true;
    this.listFormationNonObligatoire = [...this.listFormationNonObligatoire];
  }

  /**
   * Cette methode permet de faire appel a la methode responsable a la suppression d'une formation employee
   * @param: formation
   */
  removeFormationEmployee(formation: FormationModel) {
    this.removeFormationFromFormationEmployeeList(formation);
  }

  /**
   * Cette methode permet d'afficher un popup pour confirmer la suppression de la formation
   *
   * @param: formation
   */
  public confirmDeleteFormationEmployee(formation: FormationModel) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_MESSAGE'),
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.removeFormationEmployee(formation);
      },
      reject: () => {
      }
    });
  }

  /**
   * Cette methode permet d'afficher un popup pour confirmer la suppression de la qualification
   * @param: idPositionTravail
   */
  public confirmDeleteQualification(idPositionTravail: number) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('QUALIFICATION.DELETE_QUALIFICATION_MESSAGE'),
      header: this.rhisTranslateService.translate('QUALIFICATION.DELETE_QUALIFICATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        const index = this.competences.findIndex(value => value.positionTravail.idPositionTravail === idPositionTravail);
        const uuidToBeDeleted = this.competences[index].positionTravail.uuid;
        if (index !== -1) {
          this.competences.splice(index, 1);
          this.remainingListPositionTravail = [...this.remainingListPositionTravail];
          this.listPositionTravail.forEach(item => {
            if (item.idPositionTravail === idPositionTravail) {
              this.remainingListPositionTravail.push(item);
            }
          });
          this.deleteQualification(uuidToBeDeleted);
        }

      },
      reject: () => {
      }
    });
  }

  /**
   * Cette methode permet de supprimer une formation à employee en mettant l'objet employee et formation en null.
   * Dans la partie backend si une formation employee ayant comme formation et employee nullable
   * @param: formation
   */
  private removeFormationFromFormationEmployeeList(formation: FormationModel) {
    formation.formationSelectedForEmployee = false;
    const index = this.listFormationByEmployee.findIndex(item => item.formationEmployePK.idFormation === formation.idFormation);
    this.listFormationByEmployee.splice(index, 1);
    formation.dateFormationEmployee = null;
    this.deleteFormationEmpoyee(formation);
  }

  private deleteFormationEmpoyee(formation: FormationModel) {
    const index = this.defaultListFormationByEmployee.findIndex(item => item.formationEmployePK.idFormation === formation.idFormation);
    if (index !== -1) {
      this.formationEmployeeService.deleteFormationEmployee(this.sharedEmployeeService.selectedEmployee.uuid, formation.uuid).subscribe(() => {
        this.defaultListFormationByEmployee.splice(index, 1);
        this.notificationService.showSuccessMessage('FORMATION.EMPL_SUPP_SUCESS');
      }, () => {

      });
    } else {
      this.notificationService.showSuccessMessage('FORMATION.EMPL_SUPP_SUCESS');
    }


  }

  /**
   * Cette methode permet de creer un objet formationEmployee( qui contient la formation et l'employee)
   * afin de l'ajouter dans la liste des formations pour employees
   * @param: formation
   */
  private createFormationEmployeeObject(formation: FormationModel) {
    const formationEmployee = new FormationEmployeeModel();
    const formationEmployeePK = new FormationEmployeePK();
    formationEmployeePK.idEmployee = this.sharedEmployeeService.selectedEmployee.idEmployee;
    formationEmployeePK.idFormation = formation.idFormation;
    formationEmployee.formationEmployePK = formationEmployeePK;
    formationEmployee.formation = formation;
    formationEmployee.employee = this.sharedEmployeeService.selectedEmployee;
    formationEmployee.dateFormation = formation.dateFormationEmployee;
    formationEmployee.dateFormation.setHours(12);
    formation.formationSelectedForEmployee = true;
    this.listFormationByEmployee.push(formationEmployee);
  }

  /**
   * Cette methode permet de detecter s'il y a un changement au niveau de la liste des competences
   */
  public isSameCompetencesLists(): boolean {
    if (this.competences.length !== this.defaultCompetences.length) {
      return false;
    }
    let same = true;
    this.defaultCompetences.forEach((defaultItem) => {
      const list = this.competences.filter(item =>
        defaultItem.valeurQualification === item.valeurQualification
        && defaultItem.positionTravail.idPositionTravail === item.positionTravail.idPositionTravail);
      if (!list.length) {
        same = false;
      }
    });
    return same;
  }

  /**
   * Cette methode permet de detecter s'il y a un changement au niveau de la liste des formations
   */
  public isSameFormationsList(): boolean {
    if (this.defaultListFormationByEmployee.length !== this.listFormationByEmployee.length) {
      return false;
    }
    let same = true;
    this.defaultListFormationByEmployee.forEach((defaultItem) => {
      const list = this.listFormationByEmployee.filter(item =>
        (defaultItem.formationEmployePK.idFormation === item.formationEmployePK.idFormation) && (item.formation));
      if (!list.length) {
        same = false;
      }
    });
    return same;
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */

  public canDeactivate(): boolean {
    this.isCompetencesChanged = this.isSameCompetencesLists();
    this.isFormationsChanged = this.isSameFormationsList();
    return this.isFormationsChanged && this.isCompetencesChanged;
  }

  /**
   * Launch all updates for the restaurant parameters
   */
  private updateParametres() {
    if (!this.isCompetencesChanged) {
      this.saveQualifications();
    }
    if (!this.isFormationsChanged) {
      this.saveFormation();
    }
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
        this.updateParametres();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  private getInfoEmployees() {
    this.addNewFormationEmployeeTitle = this.rhisTranslateService.translate('FORMATION.ADD_NEW_FORMATION');
    this.addNewQualificationTitle = this.rhisTranslateService.translate('QUALIFICATION.ADD_NEW_QUALIFICATION');
    this.getActiveQualificationsByEmployee();
    this.getAllActiveFormationByRestaurant();
    this.setEmploye();
  }

  /**
   * Permet de retourner si l'employee a une formation qui peut la faire
   */
  public remainingFormation(): boolean {
    return (this.listFormationNonObligatoire.filter(item => !item.formationSelectedForEmployee
    ).length) > 0;
  }
}
