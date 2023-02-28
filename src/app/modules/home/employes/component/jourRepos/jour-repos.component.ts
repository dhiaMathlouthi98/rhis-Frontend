import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {SemaineReposModel} from '../../../../../shared/model/semaineRepos.model';
import {SemaineReposService} from '../../service/semaine-repos.service';
import {ParametreNationauxModel} from '../../../../../shared/model/parametre.nationaux.model';
import {EmployeeService} from '../../service/employee.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../../shared/service/date.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import * as moment from 'moment';
import {ParamNationauxService} from '../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {DatePipe} from '@angular/common';
import {DomControlService} from '../../../../../shared/service/dom-control.service';


@Component({
  templateUrl: './jour-repos.component.html',
  styleUrls: ['./jour-repos.component.scss']
})
export class JourReposComponent {
  public semaineRepos: SemaineReposModel[];
  public idEmployee: string;
  public parametreNationnaux = {} as ParametreNationauxModel;
  public JourReposHeader = [];
  public jourSem = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
  public jourSemEng = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  public showJourReposPopup = false;
  public addUpdateJourReposTitle: string;
  public selectedSemaineRepos: SemaineReposModel;
  public JoursSemainEnum = [];
  public idSemaineRepos: string;
  public existeJourRepos: string;
  public ecran = 'GJP';

  constructor(private route: ActivatedRoute,
              private semaineReposService: SemaineReposService,
              private sharedEmployee: SharedEmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private parametreNationauxService: ParamNationauxService,
              private sharedEmployeeService: SharedEmployeeService,
              private employeeService: EmployeeService,
              private dateService: DateService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private datePipe: DatePipe,
              private domControlService: DomControlService) {
    this.route.parent.params.subscribe(params => {
      this.idEmployee = params.idEmployee;
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
   * * recuperer l'id de l'employee
   * */
  getIdEmployee() {
    if (this.sharedEmployeeService.selectedEmployee) {
      this.idEmployee = this.sharedEmployeeService.selectedEmployee.uuid;
    } else {
      this.getEmployeByIdWithBadge();
    }
  }

  /**
   * recuprer le jours  de repos de l'employee
   */
  getAllJourReposByEmployee(): void {
    this.semaineReposService.getAllJourReposByEmployee(this.idEmployee).subscribe(
      (data: SemaineReposModel[]) => {
        if (data != null) {
          this.semaineRepos = data;
        }
      }, error => {
        console.log(error);
      }
    );
  }

  /**
   * recuprer le jours de semaine de repos de l'employee
   */
  getParamNationauxByRestaurant() {
    this.parametreNationauxService.getParamNationauxByRestaurant().subscribe(
      (data: ParametreNationauxModel) => {
        if (data != null) {
          this.parametreNationnaux = data;
          this.setHeaderOfColumnsAndJourReposOfPupup();
        }
      }, error => {
        console.log(error);
      }
    );
  }

  /**
   * Cette methode permet de recuperer l'employee avec le badge
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.idEmployee).subscribe(
      (data: EmployeeModel) => {
        this.sharedEmployeeService.selectedEmployee = data;
        this.idEmployee = this.sharedEmployeeService.selectedEmployee.uuid;
      },
      (err: any) => {
        console.log('Erreuue au niveau de un employe ');
      }
    );
  }

  /**
   * Reordert the tables day
   */
  public reorderDayTables(day: string) {
    const index = this.jourSem.findIndex(d => d === day);
    if (index !== -1 && index !== 0) {
      this.jourSem = [...this.jourSem.slice(index), ...this.jourSem.slice(0, index)];
      this.jourSemEng = [...this.jourSemEng.slice(index), ...this.jourSemEng.slice(0, index)];
    }
  }

  /**
   * afficher le nom  de colunm de tableau selon la prémiere jour de la semaine de restaurant
   *  afficher les jours de semaine selon la premiere jour de la semaine de restaurant
   */
  setHeaderOfColumnsAndJourReposOfPupup() {
    this.JoursSemainEnum = [];
    this.reorderDayTables(this.parametreNationnaux.premierJourSemaine);
    this.JourReposHeader = [];
    this.JourReposHeader.push(
      {title: this.rhisTranslateService.translate('EMPLOYEE.DEPUIS'), field: 'depuis'},
      {title: this.rhisTranslateService.translate('EMPLOYEE.JUSQUA'), field: 'jusqua'}
    );
    this.jourSem.forEach((day, index) => {
      this.JoursSemainEnum.push(
        {
          label: this.rhisTranslateService.translate('DAYS.' + this.jourSemEng[index]),
          value: day
        }
      );
      this.JourReposHeader.push(
        {title: this.rhisTranslateService.translate('DAYS.' + this.jourSemEng[index]), field: null}
      );
    });
  }

  /**
   * Add / Update jours repos
   * @param :semainRepos
   */
  public addOrUpdateJourReposForEmployee(semainRepos: SemaineReposModel) {
    semainRepos.idSemaineRepos = 0;
    if (this.selectedSemaineRepos) {
      semainRepos.idSemaineRepos = this.selectedSemaineRepos.idSemaineRepos;
    }
    if (this.canAdd(semainRepos)) {
      const semainReposToAddOrUpdate = this.configSemaineReposBeforeSave(semainRepos);

      if (semainReposToAddOrUpdate.idSemaineRepos) {
        this.updateSemaineRepos(semainReposToAddOrUpdate);
      } else {
        this.saveSemaineRepos(semainReposToAddOrUpdate);
      }
    }
  }

  /**
   * ajouter semaine repos
   * @param: semainReposToAdd
   */
  public saveSemaineRepos(semainReposToAdd: SemaineReposModel): void {
    this.semaineReposService.saveSemaineRepos(semainReposToAdd).subscribe((data: SemaineReposModel) => {
        this.setSemaineReposAfterSave(semainReposToAdd, data);
      }, (err: any) => {
        this.showErrorMessageOnSaveJoursRepos(err);
      }
    );
  }

  /**
   * Show error message based on error code
   * @param: data
   */
  public showErrorMessageOnSaveJoursRepos(data) {
    if (data.error === 'RHIS_SEMAINE_REPO_IS_NOT_VALID') {
      this.notificationService.showErrorMessage('DEMANDE_CONGE.CONTRAT_NULL', 'DEMANDE_CONGE.ERROR_VALIDATION');
    }
  }

  /**
   * modifier semaine repos
   * @param: semainReposToAdd
   */
  public updateSemaineRepos(semainReposToUpadte: SemaineReposModel) {
    this.semaineReposService.updateSemaineRepos(semainReposToUpadte).subscribe((data: number) => {
        this.setSemaineReposAfterUpdate(semainReposToUpadte, data);
      }, (err: any) => {
        this.showErrorMessageOnSaveJoursRepos(err);
      }
    );
  }

  /**
   * ajouter  semaine repos dans la list
   *
   * @param :IdSemaineRepos
   */
  public setSemaineReposAfterSave(semainRepos: SemaineReposModel, data: SemaineReposModel): void {
    this.showJourReposPopup = false;
    semainRepos.idSemaineRepos = data.idSemaineRepos;
    semainRepos.uuid = data.uuid;
    this.semaineRepos.push(semainRepos);
    this.notificationService.showMessageWithoutTranslateService('success',
      this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.INDISPONIBILITE')
      + ' ' + this.datePipe.transform(semainRepos.debutSemaine, 'dd-MM-yyyy')
      + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.UNTIL_DATE')
      + ' ' + this.datePipe.transform(semainRepos.finSemaine, 'dd-MM-yyyy')
      + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.CREATE_SUCCESS'));
  }

  /**
   * modifier  semaine repos dans la list
   *
   * @param :IdSemaineRepos
   */
  public setSemaineReposAfterUpdate(semainRepos: SemaineReposModel, data: number) {
    this.showJourReposPopup = false;
    this.semaineRepos.forEach((semaine, index) => {
      if (semaine.idSemaineRepos === data) {
        this.semaineRepos[index] = semainRepos;
      }
    });
    this.notificationService.showMessageWithoutTranslateService('success',
      this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.INDISPONIBILITE')
      + ' ' + this.datePipe.transform(semainRepos.debutSemaine, 'dd-MM-yyyy')
      + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.UNTIL_DATE')
      + ' ' + this.datePipe.transform(semainRepos.finSemaine, 'dd-MM-yyyy')
      + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_OK'));
  }

  /**
   * Cette methode  permet d'afficher le popup d'ajout des jours de repos
   */
  public addJoursRepos() {
    this.addUpdateJourReposTitle = this.rhisTranslateService.translate('SEMAINE_REPOS.ADD_NEW_SEMAINE_REPOS');
    this.selectedSemaineRepos = null;
    this.existeJourRepos = null;
    this.showJourReposPopup = true;
  }

  /**
   * affiche la semaine de repos selectioné
   * @param: semRepo
   */
  showSemaineRepos(semRepo: SemaineReposModel) {
    if (this.domControlService.updateListControl(this.ecran)) {
      this.existeJourRepos = null;
      this.addUpdateJourReposTitle = this.rhisTranslateService.translate('SEMAINE_REPOS.UPDATE_SEMAINE_REPOS');
      this.selectedSemaineRepos = JSON.parse(JSON.stringify(semRepo));
      this.showJourReposPopup = true;
      this.idSemaineRepos = semRepo.uuid;
    }

  }

  /**
   * correct date before saving
   * @param ; semaineRepos
   */
  private correctDateBeforeSave(semaineRepos: SemaineReposModel) {
    semaineRepos.debutSemaine = this.dateService.setCorrectDate(semaineRepos.debutSemaine);
    semaineRepos.finSemaine = this.dateService.setCorrectDate(semaineRepos.finSemaine);
    semaineRepos.idSemaineRepos = 0;
    semaineRepos.joursRepos.forEach(jourRepos => {
      jourRepos.dateRepos = this.dateService.setCorrectDate(jourRepos.dateRepos);
    });
  }

  /**
   * Set the correct employee before saving 'discipline'
   * @param :semaineRepos
   */
  private configSemaineReposBeforeSave(semaineRepos: SemaineReposModel): SemaineReposModel {
    this.correctDateBeforeSave(semaineRepos);
    semaineRepos.employee = this.sharedEmployee.selectedEmployee;
    if (this.selectedSemaineRepos) {
      semaineRepos.idSemaineRepos = this.selectedSemaineRepos.idSemaineRepos;
      semaineRepos.uuid = this.idSemaineRepos;
    }
    return semaineRepos;
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :semaineRepos
   * @param :filter
   */
  showConfirmDeleteSemaineRepos(semaineRepos: SemaineReposModel, filter: string) {
    if (filter === 'delete') {
      this.showJourReposPopup = false;
      this.idSemaineRepos = semaineRepos.uuid;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('ALERT.WAR_SUPPRESSION'),
        header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.onConfirmDeleteSemaineRepos();
        },
        reject: () => {
        }
      });
    }
  }

  /**
   * suppression de semaine repos à voir  !!!
   */
  onConfirmDeleteSemaineRepos() {
    this.semaineReposService.deleteSemaineRepos(this.idSemaineRepos).subscribe(() => {
      const index = this.semaineRepos.findIndex(semaine => semaine.uuid === this.idSemaineRepos);
        this.notificationService.showMessageWithoutTranslateService('success',
          this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.INDISPONIBILITE')
          + ' ' + this.datePipe.transform(this.semaineRepos[index].debutSemaine, 'dd-MM-yyyy')
          + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.UNTIL_DATE')
          + ' ' + this.datePipe.transform(this.semaineRepos[index].finSemaine, 'dd-MM-yyyy')
          + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DELETE_MANY_SUCESS'));
        this.semaineRepos.splice(index, 1);
      }, err => {
        console.log(err);
      }
    );
  }

  /**
   * Verification  de la date de semaine repos on ne peut pas avoir des horaires confondues
   */
  canAdd(semaineRepos: SemaineReposModel): boolean {
    semaineRepos.debutSemaine = this.dateService.setTimeNull(semaineRepos.debutSemaine);
    semaineRepos.finSemaine = this.dateService.setTimeNull(semaineRepos.finSemaine);

    if (this.semaineRepos.length === 0) {
      return true;
    } else {
      const canAdd = this.testConfusedDateOfSemaineRepôs(semaineRepos);
      if (!canAdd) {
        this.horraireConfonduesErrorMessage();
      }
      return canAdd;
    }
  }

  /**
   * Cette methode permet d'afficher un message d'erreur en cas ou les horaires sont confondues
   */
  public horraireConfonduesErrorMessage() {
    this.existeJourRepos = this.rhisTranslateService.translate('JOUR_REPOS.DEFINED_DAY_OFF_EXIST');
  }

  /**
   * reset message de erreur pour la traitement des dates sons confondues
   */
  resetErrorMessagesEvent() {
    this.existeJourRepos = undefined;
  }

  /**
   * tester si l adate de semaine repos sont confondus ou non
   */
  public testConfusedDateOfSemaineRepôs(semaineRepos: SemaineReposModel): boolean {
    let canAdd = true;
    for (let i = 0; i < this.semaineRepos.length; i++) {
      const lastValue = this.semaineRepos[i];
      lastValue.debutSemaine = this.dateService.setTimeNull(new Date(lastValue.debutSemaine));
      lastValue.finSemaine = this.dateService.setTimeNull(new Date(lastValue.finSemaine));
      if (lastValue.idSemaineRepos !== semaineRepos.idSemaineRepos) {
        if (moment(lastValue.debutSemaine).isSame(semaineRepos.debutSemaine)) {
          canAdd = false;
        }
      }
    }
    return canAdd;
  }

  /**
   * get Employees form infos
   */
  private getInfoEmployees() {
    this.getIdEmployee();
    this.getParamNationauxByRestaurant();
    this.getAllJourReposByEmployee();
  }
}
