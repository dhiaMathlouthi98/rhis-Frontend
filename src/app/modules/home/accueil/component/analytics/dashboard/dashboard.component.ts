import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MasseSalarialeService} from '../../../service/masse.salariale.service';
import {ContratService} from '../../../../employes/service/contrat.service';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {forkJoin} from 'rxjs';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {Router} from '@angular/router';
import {PeriodeChiffreAffaireModel} from '../../../../../../shared/model/gui/periode.chiffre.affaire.model';
import {EcranAccueilService} from '../../../service/ecran.accueil.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {RapportModel} from '../../../../../../shared/model/rapport.model';
import {SessionService} from '../../../../../../shared/service/session.service';
import {RapportService} from '../../../../employes/service/rapport.service';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';

@Component({
  selector: 'rhis-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public masseSalariale = -1;
  public tauxMainDOeuvreReel = -1;
  public tauxMainDOeuvrePrev = -1;
  public productiviteReel = -1;
  public productivitePrev = -1;
  public turnOver = -1;

  public DEFAULT_FILTER = 'year';
  public FILTER_JOUR = 1;
  public FILTER_YEAR = 3;

  public allEmployeeLabel = '';

  public chiffreAffaireData = [];
  public chiffreAffaireLabel = [];

  public employeesNumbers: {
    nbrEmployees: number, CDD: {
      total: number,
      label: string,
      description: string
    }, avenant: {
      total: number,
      label: string,
      description: string
    }, CDI: {
      total: number,
      label: string,
      description: string
    }
  };

  public showPopupRapport = false;
  public ANOMALIE_RAPPORT = 'ANOMALIE_RAPPORT';
  public selectedRapport: RapportModel;
  public listRapports: RapportModel[];
  public premierJourDeLaSemaine: JourSemaine;

  @Output()
  private seeActiveEmployees = new EventEmitter();

  public chiffreAffaireTitle = '';
  public chiffreAffaireDefaultIndex = 1;
  public heightInterface: any;
  public loadingProd = false;
  public loadingTurnOver = false;
  public loadingTxMainOeuvre = false;
  public loadingMasseSalariale = false;

  public heuresSupp: {
    nbHeures: number,
    coutHeures: number,
    pourcentageHeures: number,
  };
  public heuresComp: {
    nbHeures: number,
    coutHeures: number,
    pourcentageHeures: number,
  };
  public loadingHeuresSuppComp = false;

  constructor(private masseSalarialeService: MasseSalarialeService,
              private contratService: ContratService,
              private employeeServie: EmployeeService,
              private ecranAccueilService: EcranAccueilService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private router: Router,
              private sessionService: SessionService,
              private rapportService: RapportService,
              private sharedRestaurant: SharedRestaurantService) {
  }

  chiffreAffaireConfig;
  evolutionProductiviteConfig;

  ngOnInit() {
    this.loadingHeuresSuppComp = true;
    this.ecranAccueilService.getHeuresSuppComp().subscribe((hsc) => {
      this.heuresSupp = {
        nbHeures: hsc.nbHeuresSupplementaires,
        coutHeures: hsc.coutHeuresSupplementaires,
        pourcentageHeures: hsc.pourcentageHeuresSupplementaires
      };
      this.heuresComp = {
        nbHeures: hsc.nbHeuresComplementaires,
        coutHeures: hsc.coutHeuresComplementaires,
        pourcentageHeures: hsc.pourcentageHeuresComplementaires
      };
      this.loadingHeuresSuppComp = false;
    }, error1 => {
      this.loadingHeuresSuppComp = false;
    });
    this.configEvolutionProductiviteAndChiffreAffaireChart();

    this.getChiffreAffaireDefaultIndex();
    this.getValueByFilter(this.DEFAULT_FILTER);
    this.getTauxMainDOeuvreByFilter(this.FILTER_JOUR);
    this.getProductiviteByFilter(this.FILTER_JOUR);
    this.getTurnOver(this.FILTER_YEAR);
    this.getEmployeeDashboardNumbers();
    this.chiffreAffaireTitle = this.rhisTranslateService.translate('Acceuil.CHIFFRE_AFFAIRE');
    // this.premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    this.getListRapportByCodeName();
    this.allEmployeeLabel = this.rhisTranslateService.translate('POPUP_RAPPORT.ALL_EMPLOYEE_LABEL');
  }

  public getChiffreAffaireByFilter(event: number): void {
    this.notificationService.startLoader();
    this.ecranAccueilService.getChiffreAffairesByPeriode(event).subscribe(
      (data: PeriodeChiffreAffaireModel[]) => {
        this.createCharteDateAndLabels(data);
        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        this.notificationService.stopLoader();
        console.log(err);
      }
    );
  }

  /**
   * Go to active employee list
   */
  public goPageActiveEmployees(): void {
    this.router.navigateByUrl('/home/employee', {
      state: {active: true},
    });
  }

  /**
   * Get coordination for type contract
   * @param: total
   * @param: code
   */
  private getContractCoordination(total: number, code: string): { total: number, label: string, description: string } {
    return {
      total: total,
      label: this.rhisTranslateService.translate('CONTRAT.' + code),
      description: this.rhisTranslateService.translate('CONTRAT.' + code + '_DESCRIPTION')
    };
  }

  public getValueByFilter(filter: string): void {
    if (filter) {
      this.getMasseSalarileByFilter(filter);
    }
  }

  /**
   * Fetch employees dashboard numbers
   */
  private getEmployeeDashboardNumbers(): void {
    forkJoin({
      nbrEmployees: this.employeeServie.countActiveEmployeesByRestaurant(),
      CDD: this.contratService.countContractsBasedOnContractTypeAndRestaurantId(true, false),
      avenant: this.contratService.countContractsBasedOnContractTypeAndRestaurantId(false, true),
      CDI: this.contratService.countContractsBasedOnContractTypeAndRestaurantId(false, false)
    }).subscribe((data: { nbrEmployees: number, CDD: number, avenant: number, CDI: number }) => {
      this.employeesNumbers = {
        nbrEmployees: data.nbrEmployees,
        CDD: this.getContractCoordination(data.CDD, 'CDD'),
        avenant: this.getContractCoordination(data.avenant, 'AVENANT'),
        CDI: this.getContractCoordination(data.CDI, 'CDI')

      };
    }, console.error);
  }

  private getMasseSalarileByFilter(filter: string): void {
    this.loadingMasseSalariale = true;
    this.masseSalarialeService.getMasseSalarileByFilter(filter).subscribe(
      (data: number) => {
        this.masseSalariale = data;
        this.loadingMasseSalariale = false;
      }, (err: any) => {
        this.loadingMasseSalariale = false;
        // TODO notify of error
        console.log(err);
      }
    );
  }

  public getTauxMainDOeuvreByFilter(filter: number): void {
    if (filter) {
      this.loadingTxMainOeuvre = true;
      forkJoin({
        real: this.ecranAccueilService.getTauxMainDOeuvreByFilter(filter, true),
        prev: this.ecranAccueilService.getTauxMainDOeuvreByFilter(filter, false)
      }).subscribe((data: { real: number, prev: number }) => {
        this.tauxMainDOeuvreReel = data.real;
        this.tauxMainDOeuvrePrev = data.prev;
        this.loadingTxMainOeuvre = false;
      }, (err: any) => {
        // TODO notify of error
        this.loadingTxMainOeuvre = false;
        console.log(err);
      });
    }
  }

  public getProductiviteByFilter(filter: number): void {
    if (filter) {
      this.loadingProd = true;
      forkJoin({
        real: this.ecranAccueilService.getProductiviteByFilter(filter, true),
        prev: this.ecranAccueilService.getProductiviteByFilter(filter, false)
      }).subscribe((data: { real: number, prev: number }) => {
        this.productiviteReel = data.real;
        this.productivitePrev = data.prev;
        this.loadingProd = false;
      }, (err: any) => {
        // TODO notify of error
        this.loadingProd = false;
        console.log(err);
      });
    }
  }

  public getTurnOver(filter: number): void {
    this.loadingTurnOver = true;
    this.ecranAccueilService.getTurnOver(filter).subscribe(to => {
      this.turnOver = to;
      this.loadingTurnOver = false;
    }, error1 => this.loadingTurnOver = false);
  }

  private configEvolutionProductiviteAndChiffreAffaireChart(): void {
    this.chiffreAffaireConfig = {
      headerConfig: {
        headerColor: '#ffffff',
        selectedPeriodBorderStyle: '1px solid #fff'
      },
      chartConfig: {
        borderColor: '#F8E71C',
        pointBorderColor: '#FBF392',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: '#F8E71C',
        tooltip: {
          backgroundColor: '#fff',
          bodyFontColor: '#31394D',
          borderColor: '#fff'
        },
        scales: {
          xAxes: {
            ticks: {
              fontColor: '#ffe7bf'
            }
          },
          yAxes: {
            gridLines: {
              color: '#FFA555'
            }
          }
        }
      }
    };

    this.evolutionProductiviteConfig = {
      headerConfig: {
        headerColor: '#000',
        selectedPeriodBorderStyle: '1px solid #000'
      },
      chartConfig: {
        borderColor: '#385FE3',
        pointBorderColor: '#385FE3',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: '#385FE3',
        tooltip: {
          backgroundColor: '#fff',
          bodyFontColor: '#31394D',
          borderColor: '#9B9B9B'
        },
        scales: {
          xAxes: {
            ticks: {
              fontColor: '#9B9B9B'
            }
          },
          yAxes: {
            gridLines: {
              color: '#F5F4F5'
            }
          }
        }
      }
    };
  }

  private createCharteDateAndLabels(data: PeriodeChiffreAffaireModel[]): void {
    this.chiffreAffaireTitle = this.rhisTranslateService.translate('Acceuil.CHIFFRE_AFFAIRE');
    let addAsterix = false;
    const tmpChiffreAffaireData = [];
    const tmpChiffreAffaireLabels = [];
    data.forEach((item: PeriodeChiffreAffaireModel) => {
      tmpChiffreAffaireData.push(item.chiffreAffaire);
      tmpChiffreAffaireLabels.push(item.periode);
      if (!item.allValuesAreTrue) {
        addAsterix = true;
      }
    });
    if (addAsterix) {
      this.chiffreAffaireTitle = this.chiffreAffaireTitle + '*';
    }
    this.chiffreAffaireData = tmpChiffreAffaireData;
    this.chiffreAffaireLabel = tmpChiffreAffaireLabels;
  }

  private getChiffreAffaireDefaultIndex(): void {
    this.notificationService.startLoader();
    this.ecranAccueilService.getChiffreAffaireDefaultIndex().subscribe(
      (data: number) => {
        this.chiffreAffaireDefaultIndex = data;
        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        this.notificationService.stopLoader();
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   *  récupération de la liste des rapports de MyRhis
   */
  private getListRapportByCodeName(): void {
    this.rapportService.getAllRapportWithCodeNameByRestaurant().subscribe(
      (data: any) => {
        this.listRapports = data;

      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }


  public displayRapportPopup() {
    this.selectedRapport = this.listRapports.find((rapport: RapportModel) => rapport.codeName === this.ANOMALIE_RAPPORT);
    this.showPopupRapport = true;
  }

  public closeRapportPopup(): void {
    this.showPopupRapport = false;
  }

  public launchGenerateRapport(event: any): void {
    this.showPopupRapport = false;
    this.sessionService.setPdfAnomalieSettings({
      uuidRestaurant: event.uuidRestaurant,
      uuidEmployee: event.uuidEmployee,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin
    });
    const url = window.location.href;
    window.open(url + '/display/' + this.selectedRapport.codeName, '_blank');
  }
}

