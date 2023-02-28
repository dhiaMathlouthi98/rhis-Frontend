import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SessionService} from '../../../../../shared/service/session.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {RapportService} from '../../../../../modules/home/employes/service/rapport.service';

@Component({
  selector: 'rhis-affichage-rapports',
  templateUrl: './affichage-rapports.component.html',
  styleUrls: ['./affichage-rapports.component.scss']
})
export class AffichageRapportsComponent implements OnChanges{
  public reportViewer: any;
  public documentName: string;
  public typeReport: string;

  constructor(private sessionService: SessionService,
              private activatedRoute: ActivatedRoute,
              private rapportService: RapportService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.codeName) {
        this.generateRapport(params.codeName);
        this.typeReport = params.codeName;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.codeName && changes.codeName.currentValue){
      this.generateRapport(changes.codeName.currentValue);
    }
  }

  public generateRapport(type: string): void {
    this.notificationService.startLoader();
    switch (type) {
      case 'ANOMALIE_RAPPORT': {
        this.rapportService.createRapportAnomalie(this.sessionService.getPdfAnomalieSettings().uuidRestaurant, this.sessionService.getPdfAnomalieSettings().uuidEmployee, this.sessionService.getPdfAnomalieSettings().dateDebut, this.sessionService.getPdfAnomalieSettings().dateFin).subscribe(response => {
          this.showDocument(response);
        });
        this.documentName = 'Rapport_anomalie';
        break;
      }
      case 'PLG_EMPLOYE_RAPPORT': {
        this.rapportService.createRapportPlanningEmployee(this.sessionService.getPdfPlanningEmployeeSettings().uuidRestaurant,
          this.sessionService.getPdfPlanningEmployeeSettings().dateDebut, this.sessionService.getPdfPlanningEmployeeSettings().dateFin,
          this.sessionService.getPdfPlanningEmployeeSettings().sortingCriteria, this.sessionService.getPdfPlanningEmployeeSettings().employeeIds,
          this.sessionService.getPdfPlanningEmployeeSettings().groupeTravailIds).subscribe(response => {
          this.showDocument(response);
        });
        this.documentName = 'Rapport_planning_employes';
        break;
      }
      case 'SERVICE_A_PRENDRE_RAPPORT': {
        this.rapportService.createRapportServiceAPrendre(this.sessionService.getPdfServiceAPrendreSettings().uuidRestaurant,
          this.sessionService.getPdfServiceAPrendreSettings().dateDebut, this.sessionService.getPdfServiceAPrendreSettings().dateFin)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_service_à_prendre';
        break;
      }
      case 'DETAILS_PERIODE_RAPPORT': {
        this.rapportService.createRapportDetailsPeriode(this.sessionService.getPdfDetailsPeriodeSettings().uuidRestaurant,
          this.sessionService.getPdfDetailsPeriodeSettings().groupeTravail, this.sessionService.getPdfDetailsPeriodeSettings().dateDebut,
          this.sessionService.getPdfDetailsPeriodeSettings().dateFin, this.sessionService.getPdfDetailsPeriodeSettings().minutesOrCentieme,
          this.sessionService.getPdfDetailsPeriodeSettings().employeeOrGroupTravail,
          this.sessionService.getPdfDetailsPeriodeSettings().listEmployee)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_details_periode';
        break;
      }
      case 'COMPTEURS_EMPLOYES_RAPPORT': {
        this.rapportService.createRapportCompteursEmployes(this.sessionService.getPdfCompteursEmployesSettings().uuidRestaurant,
          this.sessionService.getPdfCompteursEmployesSettings().date, this.sessionService.getPdfCompteursEmployesSettings().sortingCriteria)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_compteurs_employes';
        break;
      }
      case 'RAPPORT_OPERATIONNEL': {
        this.rapportService.createRapportOperationnel(this.sessionService.getPdfRapportOperationnelSettings().uuidRestaurant,
          this.sessionService.getPdfRapportOperationnelSettings().groupeTravail, this.sessionService.getPdfRapportOperationnelSettings().dateDebut,
          this.sessionService.getPdfRapportOperationnelSettings().dateFin, this.sessionService.getPdfRapportOperationnelSettings().sortingCriteria,
          this.sessionService.getPdfRapportOperationnelSettings().hundredth)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_operationnel';
        break;
      }
      case 'RESUME_PLANNING_RAPPORT': {
        this.rapportService.createRapportResumePlanning(this.sessionService.getPdfResumePlanningSettings().uuidRestaurant,
          this.sessionService.getPdfResumePlanningSettings().dateDebut, this.sessionService.getPdfResumePlanningSettings().dateFin)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_résumé_planning';
        break;
      }
      case 'CORRECTION_RAPPORT': {
        const currentLangue = this.rhisTranslateService.browserLanguage;
        this.rapportService.createRapportCorrectionPointage(this.sessionService.getPdfCorrectionPointageSettings().uuidRestaurant,
          this.sessionService.getPdfCorrectionPointageSettings().dateJournee, currentLangue)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_des_corrections';
        break;
      }
      case 'DISPONIBILITES_RAPPORT': {
        this.rapportService.createRapportDisponibilites(this.sessionService.getPdfDisponibilitesSettings().uuidRestaurant,
          this.sessionService.getPdfDisponibilitesSettings().dateDebut, this.sessionService.getPdfDisponibilitesSettings().dateFin,
          this.sessionService.getPdfDisponibilitesSettings().type,
          this.sessionService.getPdfDisponibilitesSettings().sortingCriteria).subscribe(response => {
          this.showDocument(response);
        });
        this.documentName = 'Rapport_disponibilites';
        break;
      }
      case 'ABSENCES_RAPPORT': {
        this.rapportService.createRapportAbsences(this.sessionService.getPdfAbsencesSettings().uuidRestaurant,
          this.sessionService.getPdfAbsencesSettings().dateDebut, this.sessionService.getPdfAbsencesSettings().dateFin,
          this.sessionService.getPdfAbsencesSettings().sortingCriteria, this.sessionService.getPdfAbsencesSettings().motifAbsence,
          this.sessionService.getPdfAbsencesSettings().employeeIds, this.sessionService.getPdfAbsencesSettings().groupeTravailIds)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_absences';
        break;
      }
      case 'COMPETENCES_RAPPORT': {
        this.rapportService.createRapportCompetences(this.sessionService.getPdfCompetencesSettings().uuidRestaurant)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_competences';
        break;
      }

      case 'PLG_MANAGER_RAPPORT': {
        this.rapportService.createRapportPlanningManagers(this.sessionService.getPdfPlanningManagerSettings().uuidRestaurant,
          this.sessionService.getPdfPlanningManagerSettings().dateDebut, this.sessionService.getPdfPlanningManagerSettings().dateFin,
          this.sessionService.getPdfPlanningManagerSettings().managerOrLeader,
          this.sessionService.getPdfPlanningManagerSettings().sortingCriteria).subscribe(response => {
          this.showDocument(response);
        });
        this.documentName = 'Rapport_planning_managers';
        break;
      }

      case 'VACANCES_RAPPORT': {
        this.rapportService.createRapportVacances(this.sessionService.getPdfVacancesSettings().uuidRestaurant,
          this.sessionService.getPdfVacancesSettings().dateDebut, this.sessionService.getPdfVacancesSettings().dateFin,
          this.sessionService.getPdfVacancesSettings().sortingCriteria, this.sessionService.getPdfVacancesSettings().motifAbsence,
          this.sessionService.getPdfVacancesSettings().employeeIds, this.sessionService.getPdfVacancesSettings().groupeTravailIds)
          .subscribe(response => {
            this.showDocument(response);
          });
        this.documentName = 'Rapport_vacances';
        break;
      }
    }
  }

  public async showDocument(data: any): Promise<void> {
    this.reportViewer = await this.rapportService.createDocument(data);
    this.notificationService.stopLoader();
  }
}
