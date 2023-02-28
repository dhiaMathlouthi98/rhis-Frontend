import {Component, OnInit} from '@angular/core';
import {AlarmeService} from '../../../../../home/accueil/service/alarme.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {SharedEmployeeService} from '../../../../../home/employes/service/sharedEmployee.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {EmployeeService} from '../../../../../home/employes/service/employee.service';
import {SessionService} from '../../../../../../shared/service/session.service';

@Component({
  selector: 'rhis-display-all-alerte',
  templateUrl: './display-all-alerte.component.html',
  styleUrls: ['./display-all-alerte.component.scss']
})
export class DisplayAllAlerteComponent implements OnInit {

  public visiteMedicaleCodeName = 'A_VISITE_MEDICALE';
  public formationCodeName = 'A_MANQUE_FORMATION';
  public expirationContratCodeName = 'A_EXPIRATION_CONTRAT';
  public dureePriodEssaiCodeName = 'DUREE_PERIOD_ESSAI';
  public permisEtrangersCodeName = 'A_TITRE_PERMIS_ETRANGERS';
  public permisUrgencEtrangersCodeName = 'U_TITRE_PERMIS_ETRANGERS';
  public alarmeQualificationCodeName = 'A_MANQUE_QUALIFICATION';
  public purgeCodeName = 'PURGE_WAITING';
  public employeePlannifierSansContratCodeName = 'PLG_EMP_NO_CONTRAT';
  public urgenceExpirationContratCodeName = 'U_EXPIRATION_CONTRAT';
  public alarmePurgeEmployeeInactifType = 'EMPLOYEE_INACTIF';
  public alarmePurgeEstimationDeVenteType = 'ESTIMATION_VENTE';
  public alarmePurgeTraceType = 'TRACE_UTILISATEUR';
  public alarmePurgeHeurePointeType = 'HEURE_POINTE';
  public alarmePurgeIndisponibiliteAbsenseType = 'INDISPO_ABSENCE';
  public alarmePlanningNonCloture = 'PLG_NON_CLOTURE';

  public displayedAlarmeCode = '';

  public listAllAlerte: any[] = [];

  public listPresentCodeName: any[] = [];

  public alerteByCodeName = new Map();
  public heightInterface: any;

  constructor(private alarmeService: AlarmeService,
              private rhisTransaltor: RhisTranslateService, private route: Router,
              public rhisRouter: RhisRoutingService, private sharedEmployeeService: SharedEmployeeService, private  employeeService: EmployeeService,
              private sessionService: SessionService) {
  }

  ngOnInit() {
    this.alarmeService.sharedCodeAlarmeToBeDisplayed.subscribe(message => this.displayedAlarmeCode = message);
    this.getAllAlarmeByRestaurant();
  }

  private getAllAlarmeByRestaurant() {
    this.alarmeService.getAllAlarmeByRestaurant().subscribe(
      (data: any) => {
        this.listAllAlerte = this.alarmeService.getAlarmeOrderByPriorite(data);
        this.orderListAlertDureePeriodeEssai();
        this.alerteByCodeName = this.groupAlerteByCodeName(this.listAllAlerte, alerte => alerte.alerteCodeName);
        this.extractDistinctPresentCodeName();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  private groupAlerteByCodeName(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    // trie les alarmes alerte et urgence expiration contrat par ordre croissant selon le nombre dejours depassé
    let listAlerte = [];
    if (map.get(this.urgenceExpirationContratCodeName)) {
      listAlerte = map.get(this.urgenceExpirationContratCodeName);
      listAlerte.sort((alerte1, alerte2) => alerte1.depassement - alerte2.depassement);
    } else if (map.get(this.expirationContratCodeName)) {
      listAlerte = map.get(this.expirationContratCodeName);
      listAlerte.sort((alerte1, alerte2) => alerte1.depassement - alerte2.depassement);
    }

    return map;
  }

  private extractDistinctPresentCodeName() {
    const distinctCodeName = Array.from(new Set(this.listAllAlerte.map((item: any) => item.alerteCodeName)));
    distinctCodeName.forEach((item, index) => {
      this.listPresentCodeName.push({
        'translatedCodeName': this.rhisTransaltor.translate('ALERTES_CODE_NAME.' + item),
        'codeName': item
      });
    });
  }

  /**
   * redirection vers employe detail
   * @param alert
   */
  public async redirect(alert) {
    if (alert.uuidEmployee) {
      await this.getEmployeByIdWithBadge(alert.uuidEmployee);
    }
    if (alert.alerteCodeName === 'A_VISITE_MEDICALE') {

      this.route.navigateByUrl(this.rhisRouter.getRouteDetailCongeAndAbsenceEmployee('EMPLOYEE_DETAIL', alert.uuidEmployee), {
        state: {visiteMedicalDisplayed: true},
      });

    } else {
      if (alert.alerteCodeName === 'A_MANQUE_QUALIFICATION') {

        this.route.navigate([this.rhisRouter.getRouteDetailQualificationEmployee('EMPLOYEE_DETAIL', alert.uuidEmployee)]);

      }
      if (alert.alerteCodeName === this.permisEtrangersCodeName || alert.alerteCodeName === this.permisUrgencEtrangersCodeName) {

        this.route.navigate([this.rhisRouter.getRouteDetailEmployee('EMPLOYEE_DETAIL', alert.uuidEmployee)]);

      }
      if (alert.alerteCodeName === 'A_EXPIRATION_CONTRAT' || alert.alerteCodeName === 'U_EXPIRATION_CONTRAT') {
        this.route.navigate([this.rhisRouter.getRouteDetailContratEmployee('EMPLOYEE_DETAIL', alert.uuidEmployee)]);
      }
      if (alert.alerteCodeName === 'DUREE_PERIOD_ESSAI') {
        this.route.navigate([this.rhisRouter.getRouteDetailContratEmployee('EMPLOYEE_DETAIL', alert.uuidEmployee)]);
        this.getEmployeByIdWithBadge(alert.uuidEmployee);
      }
      // redirection vers planning home et mettre la date de debut de l'alerte dans la session du planning home
      if (alert.alerteCodeName === 'PLG_NON_CLOTURE') {
        this.sessionService.setResetPlanningCalendar(false);
        this.sessionService.setLastSelectedDate(alert.dateDebutPlanning);
        this.route.navigateByUrl('/home/planning');
      }
// redirection vers planning home et mettre la date de debut de l'alerte dans la session du planning home
      if (alert.alerteCodeName === 'PLG_EMP_NO_CONTRAT') {
        this.sessionService.setResetPlanningCalendar(false);
        this.sessionService.setLastSelectedDate(alert.datePlannifie);
        if (alert.alarmeEmployeePlannifieSansContratType === 'SHIFT_FIXE') {
          this.route.navigateByUrl('/home/planning/plannings-fixes');
        } else {
          this.route.navigateByUrl('/home/planning');
        }
      }


    }


  }

  /**
   * Cette methode permet de recuperer l'employee avec le badge
   */
  async getEmployeByIdWithBadge(uuidEmployee: string) {
    this.sharedEmployeeService.selectedEmployee = <EmployeeModel>await this.employeeService.getEmployeByIdWithBadge(uuidEmployee).toPromise();
  }

  /**
   * trier les alertes par fin periode d essai
   */
  private orderListAlertDureePeriodeEssai() {
    this.listAllAlerte.sort((item1, item2) => item1.finPeriodeEssai - item2.finPeriodeEssai);
  }

  /**
   * open or close accordion
   * @param codeName
   * @param event
   */
  public changeDisplay(codeName: string, event: boolean): void {
    if (!event) {
      this.alarmeService.nextCodeAlarmeToBeDisplayed('');
    } else {
      this.alarmeService.nextCodeAlarmeToBeDisplayed(codeName);

    }
  }
}
