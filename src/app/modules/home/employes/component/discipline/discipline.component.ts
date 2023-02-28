import {Component} from '@angular/core';
import {DisciplineModel} from '../../../../../shared/model/discipline.model';
import {ActivatedRoute} from '@angular/router';
import {DisciplineService} from '../../service/discipline.service';
import {PaginationPage} from '../../../../../shared/model/pagination.args';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {TypeSanctionService} from '../../../configuration/service/type-sanction.service';
import {TypeSanctionModel} from '../../../../../shared/model/type-sanction.model';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {EmployeeService} from '../../service/employee.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-discipline',
  templateUrl: './discipline.component.html',
  styleUrls: ['./discipline.component.scss']
})
export class DisciplineComponent {
  public header: { title: string, field: string }[];
  public disciplines: DisciplineModel[];
  private uuidEmployee: string;
  private paginationArgs = {pageNumber: 0, pageSize: 0x7fffffff};
  public isDesactivated;
  public actionTitle: string;
  /**
   * toolTip for showing faisReproches style setUp
   */
  private tooltipStyle = {
    top: -5,
    right: 90
  };
  /**
   * Pop up style
   */
  public popUpStyle = {
    height: 633,
    width: 710
  };
  /**
   * variable for controlling the display of popup add/edit "discipline"
   */
  public showPopUp = false;
  /**
   * A selected discipline when we click in a raw
   */
  public selectedDiscipline: DisciplineModel;
  private ecran = 'GDD';

  typeSanction: TypeSanctionModel[];
  dropDownListTypeSanction: { label: string, value: number }[];

  constructor(private route: ActivatedRoute,
              private disciplineService: DisciplineService,
              private typeSanctionService: TypeSanctionService,
              private employeeService: EmployeeService,
              private sharedEmployee: SharedEmployeeService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private datePipe: DatePipe,
              private domControlService: DomControlService) {
    this.route.parent.params.subscribe(params => {
      this.uuidEmployee = params.idEmployee;
      this.getInfoEmployees();
    });
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  /**
   * Get Employee when we reload page and the sahred one is gone
   * Then fetch employee by id
   */
  private setEmploye() {
    if (!this.sharedEmployee.selectedEmployee) {
      this.getEmployeByIdWithBadge();
    }
  }

  /**
   * Get Employee with badge by id
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.uuidEmployee).subscribe(
      (employe: EmployeeModel) => {
        this.sharedEmployee.selectedEmployee = employe;
      },
      (err: any) => {
      }
    );
  }

  /**
   * Get the sortable 'discipline' fields
   * @param: field
   */
  public getSortableField(field: string): string {
    if (field === 'typeSanction') {
      return 'typeSanction.libelle';
    }
    return ['dateFais', 'dateEntretien'].includes(field) ? field : null;
  }

  /**
   * Fetch the list of "Discipline" by idEmployee and with pagination
   */
  private getAllDisciplines(): void {
    this.disciplineService.getAllWithPaginationAndFilter(this.paginationArgs, this.uuidEmployee)
      .subscribe((disciplines: PaginationPage<DisciplineModel>) => this.disciplines = disciplines.content);
  }

  /**
   * Display a pop-up to add a new 'discipline'
   */
  public addDiscipline(): void {
    this.actionTitle = this.rhisTranslateService.translate('DISCIPLINE.ADD_BUTTON');
    this.selectedDiscipline = null;
    this.showPopUp = true;
  }

  /**
   * Complete the creation of a 'DisciplineModel' and save it
   * @param: discipline
   */
  public saveFormData(discipline: DisciplineModel): void {
    const disciplineToAdd = this.configDisciplineBeforeSave(discipline);
    this.disciplineService.add(disciplineToAdd).subscribe(
      {
        next: (persistedDisciplinaire: DisciplineModel) => {
          this.formatList(persistedDisciplinaire, disciplineToAdd);
        },
        complete: () => {
          this.showPopUp = false;
        }
      }
    );
  }

  /**
   * Display a pop-up to show && edit a 'discipline'
   * @param: discipline
   */
  public showDiscipline(discipline: DisciplineModel): void {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.selectedDiscipline = discipline;
      this.actionTitle = this.rhisTranslateService.translate('DISCIPLINE.EDIT_BUTTON');
      this.reorderDropDownListTypeSanction(this.selectedDiscipline.typeSanction.idTypeSanction);
      this.showPopUp = true;
    }
  }

  /**
   * Put nothing or the selected discipline sanction type
   * @param: idTypeSanction
   */
  private reorderDropDownListTypeSanction(idTypeSanction: number): void {
    if (this.dropDownListTypeSanction) {
      const i = this.dropDownListTypeSanction.findIndex(typeSanction => typeSanction.value === idTypeSanction);
      if (i !== -1) {
        this.dropDownListTypeSanction.unshift(
          ...this.dropDownListTypeSanction.splice(i, 1)
        );
      } else {
        this.isDesactivated = true;
      }
    }
  }

  /**
   * Get the list of TypeSanction
   */
  getTypeSanction(): void {
    this.typeSanctionService.getAllActive()
      .subscribe((typeSanction: TypeSanctionModel[]) => this.formatTypeSanction(typeSanction));
  }

  /**
   * Update the discipline list when add/edit operations
   * @param: id
   * @param: discipline
   */
  public formatList(persistedDisciplinaire: DisciplineModel, discipline: DisciplineModel) {
    const index = this.disciplines.findIndex(entity => entity.idDisciplinaire === persistedDisciplinaire.idDisciplinaire);
    if (index !== -1) {
      const list = [...this.disciplines];
      list[index] = discipline;
      this.disciplines = [...list];
      this.notificationService.showMessageWithoutTranslateService('success',
        this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DATE_FAITS')
        + ' ' + this.datePipe.transform(discipline.dateFais, 'dd-MM-yyyy')
        + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_SHE_OK'));
    } else {
      discipline.idDisciplinaire = persistedDisciplinaire.idDisciplinaire;
      discipline.uuid = persistedDisciplinaire.uuid;
      this.disciplines = [discipline, ...this.disciplines];
      this.notificationService.showMessageWithoutTranslateService('success',
        this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DATE_FAITS')
        + ' ' + this.datePipe.transform(discipline.dateFais, 'dd-MM-yyyy')
        + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATED_SHE_SUCCESS'));
    }
  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDelete(uuid: string): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.delete(uuid);
      },
      reject: () => {
      }
    });
  }

  /**
   * Delete discipline by id
   * @param: id
   */
  private delete(uuid: string) {
    this.disciplineService.remove(uuid).subscribe({
        next: (v) => {
          const index = this.disciplines.findIndex(discipline => discipline.uuid === uuid);
          if (index !== -1) {
            this.disciplines.splice(index, 1);
          }
        },
        complete: () => this.notificationService.showSuccessMessage('DISCIPLINE.SUPPSUCCESS')
      }
    );
  }

  /**
   * Set the correct sanctionType and employee before saving 'discipline'
   * @param: discipline
   */
  private configDisciplineBeforeSave(discipline: any): DisciplineModel {
    if (typeof discipline.typeSanction === 'number') {
      discipline.typeSanction = this.typeSanction.find(type => type.idTypeSanction === discipline.typeSanction);
    }
    discipline.employee = this.sharedEmployee.selectedEmployee;
    if (this.selectedDiscipline) {
      discipline.idDisciplinaire = this.selectedDiscipline.idDisciplinaire;
      discipline.uuid = this.selectedDiscipline.uuid;
    }
    return <DisciplineModel>discipline;
  }

  /**
   * Set Table header fields by translator
   */
  private setTableHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('DISCIPLINE.DATE_FAIS'), field: 'dateFais'},
      {title: this.rhisTranslateService.translate('DISCIPLINE.DATE_DEMANDE_JUSTIF'), field: 'dateDemandeJustif'},
      {title: this.rhisTranslateService.translate('DISCIPLINE.DATE_CONVOCATION'), field: 'dateConvocation'},
      {title: this.rhisTranslateService.translate('DISCIPLINE.DATE_ENTRETIEN'), field: 'dateEntretien'},
      {title: this.rhisTranslateService.translate('DISCIPLINE.DATE_NOTIFICATION'), field: 'dateNotification'},
      {title: this.rhisTranslateService.translate('DISCIPLINE.TYPE_SANCTION'), field: 'typeSanction'}
    ];
  }

  /**
   * Format the typeSanction list so we can display the list in the dropdown component
   * @param: typeSanction
   */
  private formatTypeSanction(typeSanction: TypeSanctionModel[]): void {
    this.typeSanction = typeSanction;
    this.dropDownListTypeSanction = this.typeSanction.map(sanction => ({
      label: sanction.libelle,
      value: sanction.idTypeSanction
    }));
  }

  /**
   * get Employees form infos
   */
  private getInfoEmployees() {
    this.getAllDisciplines();
    this.setTableHeader();
    this.getTypeSanction();
    this.setEmploye();
  }
}
