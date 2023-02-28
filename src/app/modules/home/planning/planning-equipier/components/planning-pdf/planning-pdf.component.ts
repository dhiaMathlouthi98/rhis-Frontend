import {Component, OnInit} from '@angular/core';
import {GridsterConfig} from 'angular-gridster2/lib/gridsterConfig.interface';
import {GridsterItem} from 'angular-gridster2/lib/gridsterItem.interface';
import * as jspdf from 'jspdf';
import {DatePipe, registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeNl from '@angular/common/locales/nl';
import localeEs from '@angular/common/locales/es';
import * as _ from 'lodash';
import {GRIDSTER_OPTIONS} from '../../gridster-config';
import {ActivatedRoute} from '@angular/router';
import {PlanningSemaineService} from '../../service/planning-semaine.service';
import {DetailCA, WorkingDayLimits} from '../../../../../../shared/model/rapport/planning.model';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {FileService} from '../../../../../../shared/service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ShiftService} from '../../service/shift.service';
import {ShiftModel} from '../../../../../../shared/model/shift.model';
import {DateService} from '../../../../../../shared/service/date.service';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import {DecoupageHoraireModel} from '../../../../../../shared/model/decoupage.horaire.model';
import {forkJoin, Observable} from 'rxjs';
import {DecoupageHoraireService} from '../../../configuration/service/decoupage.horaire.service';
import {PlanningManagerService} from '../../../planning-manager/service/planning-manager.service';
import {PlanningManagerModel} from '../../../../../../shared/model/planningManager.model';
import {PlanningEquipierService} from '../../service/planning-equipier.service';
import * as moment from 'moment';
import {ContrainteSocialeCoupureService} from '../../../../../../shared/service/contrainte-sociale-coupure.service';
import {HelperService} from '../../../../../../shared/service/helper.service';
import {EmployeeService} from '../../../../employes/service/employee.service';
import {ContrainteSocialeService} from '../../../../../../shared/service/contrainte-sociale.service';
import {BrightnessColorShiftService} from '../../../../../../shared/service/brightnessColorShift.service';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {ParamNationauxService} from '../../../../../../shared/module/params/param-nationaux/service/param.nationaux.service';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import * as rfdc from 'rfdc';
import domtoimage from 'dom-to-image';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {RapportService} from '../../../../employes/service/rapport.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {LanguageStorageService} from '../../../../../../shared/service/language-storage.service';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeDe, 'de');
registerLocaleData(localeNl, 'nl');

@Component({
  selector: 'rhis-planning-pdf',
  templateUrl: './planning-pdf.component.html',
  styleUrls: ['./planning-pdf.component.scss']
})

export class PlanningPdfComponent implements OnInit {
  private readonly GREY = '#c0bbb0';
  private readonly BLACK = '#414141';
  /**
   * Options de la grille
   */
  public options_pdf: GridsterConfig;
  /**
   * liste des employés
   */
  public employees: EmployeeModel[] = [];

  /**
   * tableau contenant la liste des employés pour chaque page du pdf
   */
  public employee_arrays: EmployeeModel[][] = [];
  /**
   * Axe du temps
   */
  public hours: string[];
  /**
   * Date sélectionnée
   */
  public date: string;
  public employeesList: EmployeeModel [] = [];
  public listPreviousOrNextPlanningManager = [];
  public listPreviousOrNextShift = [];

  /**
   * Date pour récupérer découpage horaire
   */
  public dateDecoupage: string;
  /**
   * Hauteur d'une ligne de la grille
   */
  public employeeItemHeight: string;
  /**
   * Hauteur de la grille des employés
   */
  public gridsterTmHeight: string[] = [];
  /**
   * Hauteur de la grille des managers
   */
  public gridsterManagerHeight: string;
  /**
   * liste des items de la grille des employés
   */
  public teamMembersData: GridsterItem[][] = [];
  /**
   * liste des items de la grille des managers
   */
  public managersData: Array<GridsterItem> = [];
  /**
   * Informations globales sur le restaurant
   */
  public restaurant: RestaurantModel;
  /**
   * Nom du restaurant
   */
  public restaurantName: string;
  /**
   * Logo du restaurant
   */
  public restaurantLogo: SafeUrl;
  public decoupageHoraireFinEtDebutActivity: any;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public modeAffichage = 0;
  /**
   * configuration du calendrier pour afficher les dates en français
   */
  public frConfig: any;
  /**
   * Liste des managers
   */
  public managers: EmployeeModel[] = [];
  /**
   * Planning des managers
   */
  public managerShifts: ShiftModel[] = [];
  /**
   * Options de la grille des employés
   */
  public teamMemberGridOptions: GridsterConfig[] = [];
  /**
   * Options de la grille des managers
   */
  public managerGridOptions: GridsterConfig;
  /**
   * Sections sélectionnées pour être affichées dans le PDF
   */
  public pdfSections: string[];

  /**
   * Détail du chiffre d'affaire
   */
  public detailCa: DetailCA = {
    dateJournee: '01/01/1970',
    caValue: '0.0',
    caAm: '0.0',
    caPm: '0.0',
    Prod: '0.0',
    ProdPaye: '0.0',
    MoEquiMgrValue: '0.0',
    Heures: '0.0',
    cumul: [],
    ca: [],
    moEquiMgr: [],
    caProd: []
  };

  public dataTables = [];
  /**
   * longueur du tableau d'employés
   */
  public employees_l: number;
  /**
   * longueur du tableau de managers
   */
  public managers_l: number;
  public listShift: ShiftModel[] = [];

  /**
   * maximum de lignes à mettre sur une page du pdf
   */
  private max_page: number;

  private heureDeSeparation: string;
  private heureDeSeparationIsNight = false;
  public displayWeekReport: any;
  public sortBy: number;
  public mode: boolean;

  public colorBrightDarker = 90;
  public finJourneeActivite: any;
  public debutJourneeActivite: any;

  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[] = [];
  public clone = rfdc();

  public managersAndProdShifts: any = [];

  public currentDate = new Date();
  public download: string;

  /**
   * constructeur de la classe
   * @param decoupageHoraireService
   * @param shiftService
   * @param plgManagerService
   * @param dateService
   * @param planningSemaineService
   * @param datePipe
   * @param route
   * @param fileService
   * @param sanitizer
   * @param sharedRestaurantService
   */
  constructor(private decoupageHoraireService: DecoupageHoraireService,
              private planningService: PlanningEquipierService,
              private shiftService: ShiftService,
              private plgManagerService: PlanningManagerService,
              private dateService: DateService,
              private planningSemaineService: PlanningSemaineService, private datePipe: DatePipe, private route: ActivatedRoute, private fileService: FileService, private sanitizer: DomSanitizer, private sharedRestaurantService: SharedRestaurantService, private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
              private helperService: HelperService,
              private employeeService: EmployeeService,
              private contrainteSocialeService: ContrainteSocialeService,
              private brightnessColorShiftService: BrightnessColorShiftService,
              private paramNationauxService: ParamNationauxService,
              private notificationService: NotificationService,
              private parametreService: ParametreGlobalService,
              private rapportService: RapportService,
              private rhisTranslateService: RhisTranslateService,
              private languageService: LanguageStorageService) {
  }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    this.download = this.rhisTranslateService.translate('REPORT.DOWNLOAD');
    this.route.params.subscribe(params => {
      this.pdfSections = params['selectedSections'].split(',');
      this.date = params['date'];
      this.dateDecoupage = params['date'];
      this.heureDeSeparation = params['heureSeparation'] + ':' + params['minuteSeparation'];
      this.date = this.datePipe.transform(this.date, 'EEEE d MMMM y', null, this.languageService.getLanguageSettings().value);
      this.dateDecoupage = this.datePipe.transform(this.dateDecoupage, 'EEEE d MMMM y', null);
      this.displayWeekReport = JSON.parse(params['displayWeek']);
      this.sortBy = +params['sortBy'];
      this.mode = JSON.parse(params['mode']);
      this.getRestaurant();
      this.options_pdf = _.cloneDeep(GRIDSTER_OPTIONS);

    });
  }

  /**
   * Récupérer le temps planifié à afficher en face du nom de l'employé
   * @param employee employé
   * @param employeeType manager ou teamMember
   * @param index a
   */
  public getTempsPlanifiesAmPm(employee: EmployeeModel, employeeType: string, index: number, employee_arrays: any, teamMembersData: any, managers: any, managersData: any, removeNotActiveShifts?: boolean): { beforeHs: string, afterHs: string } {
    const positionHeureDeSeparation: number = this.convertStartTimeToPosition(this.heureDeSeparation,
      this.heureDeSeparationIsNight);
    let employeeShifts: GridsterItem[] = [];
    let beforeHeureDeSeparation = 0;
    let afterHeureDeSeparation = 0;
    if (employeeType === 'teamMember' && teamMembersData.length) {
      let yEmpl;
      if (employee.idEmployee == null) {
        yEmpl = employee.indexInRapport;
      } else {
        yEmpl = employee_arrays[index].findIndex(emp => emp.idEmployee === employee.idEmployee);
      }

      if (yEmpl) {
        employeeShifts = teamMembersData[index].filter((d: GridsterItem) => d && d.y && d.y === yEmpl);
      }
    }
    if (employeeType === 'manager' && managersData.length !== 0) {
      const yMgr = managers.findIndex(mgr => mgr.idEmployee === employee.idEmployee);
      if (yMgr) {
        employeeShifts = managersData.filter((d: GridsterItem) => d && d.y && d.y === yMgr);
      }
    }

    if (removeNotActiveShifts) {
      employeeShifts = employeeShifts.filter((value: GridsterItem) => !value.notActiveShift);
    }
    let pauseToRemove = 0;
    employeeShifts.forEach((item: GridsterItem) => {
      if (!item.acheval || (item.acheval && this.modeAffichage === 2) || (item.acheval && item.modifiable && this.modeAffichage === 1)) {
        if (item.pauseToRemove) {
          pauseToRemove += item.pauseToRemove;
        }
        //item.timeSubstruct/ 15 pour ajouter le reste de shift de j +1 dans le mode1 et le shift acheval
        // 15 la durée de chaque interval de temps
        const colsShift = this.modeAffichage === 1 && item.acheval && item.modifiable ? item.cols + (item.timeToSubstruct / 15) : item.cols;
        if (item.x + colsShift <= positionHeureDeSeparation) {
          beforeHeureDeSeparation = beforeHeureDeSeparation + colsShift * 15;
        }
        if (item.x >= positionHeureDeSeparation) {
          afterHeureDeSeparation = afterHeureDeSeparation + colsShift * 15;
        }
        if (item.x < positionHeureDeSeparation && item.x + colsShift > positionHeureDeSeparation) {
          beforeHeureDeSeparation = beforeHeureDeSeparation + (positionHeureDeSeparation - item.x) * 15;
          afterHeureDeSeparation = afterHeureDeSeparation + (item.x + colsShift - positionHeureDeSeparation) * 15;
        }
      }
    });
    if (beforeHeureDeSeparation >= afterHeureDeSeparation) {
      beforeHeureDeSeparation -= pauseToRemove;
    } else {
      afterHeureDeSeparation -= pauseToRemove;
    }

    return {
      beforeHs: this.convertMinutesToTime(beforeHeureDeSeparation),
      afterHs: this.convertMinutesToTime(afterHeureDeSeparation)
    };
  }

  /**
   * Récupérer le label à afficher en dessous du nom de l'employé
   * @param employee employé
   * @param employeeType manager ou teamMember
   * @param index
   */
  public getEmployeeShifts(employee: EmployeeModel, employeeType: string, index: number, employee_arrays: any, teamMembersData: any, managers: any, managersData: any): string {
    let employeeShiftsLabels: string[] = [];
    let shiftsTimeLabels: string;
    if (employeeType === 'teamMember') {
      const y = employee_arrays[index].indexOf(employee);
      employeeShiftsLabels = teamMembersData[index].filter((d: GridsterItem) => d.y === y)
        .map((d: GridsterItem) => d.timeLabel);
    }
    if (employeeType === 'manager') {
      const y = managers.indexOf(employee);
      employeeShiftsLabels = managersData.filter((d: GridsterItem) => d.y === y)
        .map((d: GridsterItem) => d.timeLabel);
    }
    if (employeeShiftsLabels && employeeShiftsLabels.length !== 0) {
      shiftsTimeLabels = employeeShiftsLabels.reduce((accumulator, currentValue) => accumulator + ' / ' + currentValue);
    }
    return shiftsTimeLabels;
  }

  /**
   * Récupérer le nombre total d'heures AM et le nombre total d'heures PM
   */
  public getHeuresAMPM(detailCa: any, employee_arrays: any, teamMembersData: any, managers: any, managersData: any, removeNotActiveShift: boolean, planifie?: boolean): { heuresAM: string, heuresPM: string, heures: string, moEquiMgrValue: string } {
    let heuresAM = 0;
    let heuresPM = 0;
    let heuresEquiper = 0;
    let heuresManager = 0;
    employee_arrays.forEach((ea: EmployeeModel[]) => {
      ea.forEach((e: EmployeeModel) => {
        if (e.idEmployee !== -1 && (e.idEmployee !== null || planifie)) {
          heuresAM = heuresAM + this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(e, 'teamMember',
            employee_arrays.indexOf(ea), employee_arrays, teamMembersData, null, null, removeNotActiveShift).beforeHs);

          heuresPM = heuresPM + this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(e, 'teamMember',
            employee_arrays.indexOf(ea), employee_arrays, teamMembersData, null, null, removeNotActiveShift).afterHs);
          heuresEquiper += (this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(e, 'teamMember',
            employee_arrays.indexOf(ea), employee_arrays, teamMembersData, null, null, removeNotActiveShift).beforeHs) +
            this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(e, 'teamMember',
              employee_arrays.indexOf(ea), employee_arrays, teamMembersData, null, null, removeNotActiveShift).afterHs)) / 60;
        }
      });
    });
    if (this.isSectionSelected('PM')) {
      managers.forEach((m: EmployeeModel) => {
        if (m.idEmployee !== -1 && (m.idEmployee !== null || planifie)) {
          heuresAM = heuresAM + this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(m, 'manager', null, null, null, managers, managersData, removeNotActiveShift).beforeHs);
          heuresPM = heuresPM + this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(m, 'manager', null, null, null, managers, managersData, removeNotActiveShift).afterHs);
          heuresManager += (this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(m, 'manager', null, null, null, managers, managersData, removeNotActiveShift).beforeHs) +
            this.convertTimeToMinutes(this.getTempsPlanifiesAmPm(m, 'manager', null, null, null, managers, managersData, removeNotActiveShift).afterHs)) / 60;
        }
      });
    }
    if (detailCa && detailCa.caValue) {
      const tauxEquiper = +((((heuresEquiper * this.restaurant.parametrePlanning.tauxMoyenEquipier) / +detailCa.caValue) * 100).toFixed(2));
      const tauxManager = +((((heuresManager * this.restaurant.parametrePlanning.tauxMoyenManager) / +detailCa.caValue) * 100).toFixed(2));
      this.detailCa.MoEquiMgrValue = (tauxEquiper + tauxManager).toFixed(2);
      if (planifie) {
        this.detailCa.Prod = ((+detailCa.caValue) / ((heuresAM + heuresPM) / 60)).toFixed(2);
      } else {
        this.detailCa.ProdPaye = ((+detailCa.caValue) / ((heuresAM + heuresPM) / 60)).toFixed(2);
      }
      if (planifie) {
        detailCa.Prod = this.detailCa.Prod;
      } else {
        detailCa.ProdPaye = this.detailCa.ProdPaye;
      }
    } else {
      this.detailCa.MoEquiMgrValue = '-';
      if (planifie) {
        this.detailCa.Prod = '0';
        detailCa.Prod = this.detailCa.Prod;
      } else {
        this.detailCa.ProdPaye = '0';
        detailCa.ProdPaye = this.detailCa.ProdPaye;
      }
    }
    detailCa.MoEquiMgrValue = this.detailCa.MoEquiMgrValue;
    // this.detailCa.MoEquiMgr = this.restaurant.parametrePlanning.tauxMoyenEquipier + this.restaurant.parametrePlanning.tauxMoyenManager;
    return {
      heuresAM: this.convertMinutesToTime(heuresAM),
      heuresPM: this.convertMinutesToTime(heuresPM),
      heures: this.convertMinutesToTime(heuresAM + heuresPM),
      moEquiMgrValue: detailCa.MoEquiMgrValue
    };
  }

  /**
   * Initialisation des grilles du PDF
   */
  public initGrids(dataElement: any): void {
    if (!this.sortBy) {
      this.sortEmployees(this.managers);
    } else {
      this.sortManagersShifts(this.managerShifts);
    }
    this.employeeItemHeight = '45px';
    if (this.isSectionSelected('PM')) {
      this.managers = this.buildEmployeeAxis(this.managers);
      dataElement.managers = this.managers;
      this.managers_l = this.managers.length;
      this.gridsterManagerHeight = (45 * this.managers.length).toString() + 'px';
      dataElement.gridsterManagerHeight = this.gridsterManagerHeight;
      this.setSignOfBreak(this.managerShifts, true);
      this.managersData = this.buildPdfPlanning(this.managers, this.managerShifts, true);
      dataElement.managersData = this.managersData;
      this.managerGridOptions = this.setOptions(this.managers);
      dataElement.managerGridOptions = this.managerGridOptions;
    }
    this.restaurantName = this.restaurant.libelle;
    this.employees_l = this.employees.length;
    if (this.mode) {
      this.getMaxPageForPortraitMode();
    } else {
      this.getMaxPageForPaysageMode();
    }
    let max_employees: number;
    if (this.pdfSections.includes('PM')) {
      max_employees = this.max_page - this.managers_l - 2;
    } else {
      max_employees = this.max_page;
    }
    this.employee_arrays = [];
    this.employee_arrays.push(this.employees.slice(0, max_employees));
    for (let i = max_employees; i < this.employees_l; i += this.max_page) {
      this.employee_arrays.push(this.employees.slice(i, i + this.max_page));
    }
    this.teamMembersData = [];
    this.teamMemberGridOptions = [];
    this.gridsterTmHeight = [];
    this.employee_arrays.forEach((ea: EmployeeModel[], indexEmployeList: number) => {
      // ea = this.buildEmployeeAxis(ea);
      // const shifts = this.listShift.filter((s: ShiftModel) => {
      //   if ((s.employee === null || s.employee.idEmployee === null)) {
      //     return true;
      //   } else if (ea.find((e: EmployeeModel) => s.employee && e.idEmployee === s.employee.idEmployee)) {
      //     return true;
      //   }
      //   return false;
      // });
      dataElement.employee_arrays = this.employee_arrays;
      let shifts: ShiftModel[] = [];
      let lastIndex = 0;

      this.employee_arrays.forEach((ea: EmployeeModel[]) => {
        shifts = [];
        if(this.sortBy){
          lastIndex = 0;
        }
        ea = this.buildEmployeeAxis(ea);
        if (ea.slice(1, ea.length).every(emp => !emp.idEmployee)) {
          while (shifts.length < ea.length - 1 && lastIndex < this.listShift.length) {
            if (this.listShift[lastIndex].employee === null || (this.listShift[lastIndex].employee && this.listShift[lastIndex].employee.idEmployee === null)) {
              if(this.teamMembersData.length && this.sortBy){
                if(!this.checkShiftNAExistance(this.teamMembersData, this.listShift[lastIndex].idShift)){
                 shifts.push(this.listShift[lastIndex]);
                }
              } else {
                shifts.push(this.listShift[lastIndex]);
              }
            }
            lastIndex++;
          }
        } else {
          while (lastIndex < this.listShift.length) {
            if (this.listShift[lastIndex].employee === null || (this.listShift[lastIndex].employee && this.listShift[lastIndex].employee.idEmployee === null)) {
              if(this.teamMembersData.length && this.sortBy){
                if(!this.checkShiftNAExistance(this.teamMembersData, this.listShift[lastIndex].idShift)){
                 shifts.push(this.listShift[lastIndex]);
                }
              } else {
                shifts.push(this.listShift[lastIndex]);
              }
            }

            lastIndex++;
          }
          ea.forEach((element: EmployeeModel) => {
            if (element.idEmployee) {
              shifts = shifts.concat(this.listShift.filter((sh: ShiftModel) => sh.employee && sh.employee.idEmployee === element.idEmployee));
            }
          });
        }
        this.setSignOfBreak(shifts);
        this.teamMembersData.push(this.buildPdfPlanning(ea, shifts, false));
      });
      dataElement.teamMembersData = this.teamMembersData;
      this.teamMemberGridOptions.push(this.setOptions(ea));
      dataElement.teamMemberGridOptions = this.teamMemberGridOptions;
      this.gridsterTmHeight.push((45 * ea.length).toString() + 'px');
      dataElement.gridsterTmHeight = this.gridsterTmHeight;
    });
    // Cas d'un rapport d'une journée vide
    if (dataElement.teamMembersData === undefined) {
      dataElement.teamMembersData = this.teamMembersData;
    }
    if (dataElement.employee_arrays === undefined) {
      dataElement.employee_arrays = this.employee_arrays;
    }
    setTimeout(() => this.setBarreHeureDeSeparation(), 100);

  }
  private checkShiftNAExistance(teamMembersData : any[], idShift: any): any{
    let elementFound = false;
      teamMembersData.forEach((element: any[])=> {
        elementFound = elementFound || (element.findIndex((item : any)=> item.id === idShift) !== -1);
      });
      return elementFound;
  }
  /**
   * Afficher uniquement les sections sélectionnées dans la pop-up de sélection
   * @param section code de la section
   */
  public isSectionSelected(section: string): boolean {
    return this.pdfSections && this.pdfSections.includes(section);
  }

  /**
   * Transformation en PDF
   */
  public async captureScreen(): Promise<any> {
    let pdf: any;
    if (this.mode) {
      pdf = new jspdf('p', 'mm', 'a4');
    } else {
      pdf = new jspdf('l', 'mm', 'a4');
    }
    this.notificationService.startLoader();

    for (let j = 0; j < this.dataTables.length; j++) {
      const data_page1 = document.getElementById('contentToConvert_page' + j);

      const dataUrl = await domtoimage.toPng(data_page1);
      const canvas = new Image();
      canvas.src = dataUrl;
      let imgWidth: any;
      let imgHeight: any;
      if (this.mode) {
        imgWidth = 194;
        imgHeight = +data_page1.offsetHeight * imgWidth / +data_page1.offsetWidth;
      } else {
        imgWidth = 270;
        imgHeight = 194;
      }
      const position = 0;
      pdf.addImage(canvas, 'PNG', 10, position, imgWidth, imgHeight);
      const translatePlanning = this.rhisTranslateService.translate('PLANNING_EQUIPIER.RESUME_JOURNALIER');
      if (this.dataTables[j].employee_arrays.length > 1) {
        pdf.addPage();
        for (let i = 1; i < this.dataTables[j].employee_arrays.length; i++) {
          const data_next = document.getElementById('contentToConvert_next_' + j + i);
          const data_dom = await domtoimage.toPng(data_next);
          const canvas_next = new Image();
          canvas_next.src = data_dom;
          let imgWidth_next: any;
          let imgHeight_next: any;
          if (this.mode) {
            imgWidth_next = 194;
            imgHeight_next = +data_next.offsetHeight * imgWidth / +data_next.offsetWidth;
          } else {
            imgWidth_next = 270;
            if ((i === this.dataTables[j].employee_arrays.length - 1)) {
              imgHeight_next = +data_next.offsetHeight * imgWidth_next / +data_next.offsetWidth;
            } else {
              imgHeight_next = 194;
            }
          }
          pdf.addImage(canvas_next, 'PNG', 10, 0, imgWidth_next, imgHeight_next);
          if ((i === this.dataTables[j].employee_arrays.length - 1) && (j === this.dataTables.length - 1)) {
            this.notificationService.stopLoader();
            pdf.save(translatePlanning + ' - ' + this.date + '.pdf');
          } else {
            pdf.addPage();
          }
        }
      } else {
        if (j === (this.dataTables.length - 1)) {
          this.notificationService.stopLoader();
          pdf.save(translatePlanning + ' - ' + this.date + '.pdf');
        } else {
          pdf.addPage();
        }
      }
    }
  }

  private getDecoupageHoraire(): void {
    this.requestDataForDecoupageFromMultipleSources().subscribe((res: { debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }) => {
      this.decoupageHoraireFinEtDebutActivity = res;
      const index = new Date(this.dateDecoupage).getDay();
      this.frConfig = this.dateService.getCalendarConfig(this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurantService.selectedRestaurant.parametreNationaux.premierJourSemaine));
      const dayName = this.dateService.convertDayNames(index);
      // const filteredDecoupageFin = Object.keys(res['finJournee']).filter(val => val.includes(dayName));
      // const filteredDecoupage = Object.keys(res['debutJournee']).filter(val => val.includes(dayName));
      const minDecoupage = this.getMaxDecoupageValue(this.decoupageHoraireFinEtDebutActivity, 'debut');
      const maxDecoupage = this.getMaxDecoupageValue(this.decoupageHoraireFinEtDebutActivity, 'fin');
      this.finJourneeActivite = {
        value: maxDecoupage[1],
        night: res.finJournee[maxDecoupage[0] + 'IsNight']
      };
      this.debutJourneeActivite = {
        value: minDecoupage[1],
        night: res.debutJournee[minDecoupage[0]+ 'IsNight']
      };

      this.getHours(this.debutJourneeActivite, this.finJourneeActivite);
      if (+this.heureDeSeparation.slice(0, 2) >= 0 && +this.heureDeSeparation.slice(0, 2) < +this.hours[0].slice(0, 2)) {
        this.heureDeSeparationIsNight = true;
      }
      this.setBarreHeureDeSeparation();
      this.getAllShiftsAndInintGrid();
    });
  }
  private getMaxDecoupageValue(list : any, debutFin: string): any{
    let decoupageValues : any;
    if(debutFin === 'debut'){
      decoupageValues = Object.entries(list.debutJournee);
    } else {
      decoupageValues = Object.entries(list.finJournee);
    }
     let res: any;
     if(decoupageValues && decoupageValues.length){
        res = decoupageValues.filter(element=> typeof element[1] === 'string').sort((objA, objB) =>{
        return this.dateService.setTimeFormatHHMM(objA[1]).getTime() - this.dateService.setTimeFormatHHMM(objB[1]).getTime()
      } );
      }

    res = res.filter(val=> val[0] !== 'uuid');
     if(debutFin === 'debut'){
      return res[0];
    } else {
      return res[res.length - 1];
    }
     }


  private getInactifEquipier(listShift: ShiftModel[], listEquipierActif: EmployeeModel[]): void {
    let employeHasContratActif: any;
    listShift.forEach((shift: ShiftModel) => {
      if (shift.employee) {
        const employeActif = listEquipierActif.find((equipier: EmployeeModel) =>
          equipier.idEmployee === shift.employee.idEmployee);
        this.dateService.setCorrectTimeToDisplayForShift(shift);
        if (employeActif) {
          if (employeActif.contrats && employeActif.contrats.length) {
            const employeeNew = {contrats: employeActif.contrats.filter(_=> true)} as EmployeeModel
            employeHasContratActif = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(shift.dateJournee))), true);
            let activeGroupeTravail;
            if (employeHasContratActif && employeHasContratActif.contrats && employeHasContratActif.contrats.length) {
              activeGroupeTravail = employeHasContratActif.contrats[0].groupeTravail;
            }
            if ((employeHasContratActif && !employeHasContratActif.contrats) || (activeGroupeTravail && !activeGroupeTravail.plgEquip)) {
              shift.employee.plgEquipier = false;
            }
          } else {
            shift.employee.plgEquipier = false;
          }
        } else {
          shift.employee.plgEquipier = false;
        }
      }
    });
  }

  /**
   *Lors d’un changement de groupe de travail ou d’une modification des types de plannings associés au groupe,
   * il faut garder et afficher l’historique des plannings
   */
  private getInactifManagerOrLeader(listShiftEquipeGestion: any[], listManagerLeaderActif: any[]) {
    let managerOrLeaderHasContratActif: any;
    listShiftEquipeGestion.forEach((planningManagerOrLeader: any) => {
      const managerOrLeaderActif = listManagerLeaderActif.find((managerOrLeader: any) =>
        managerOrLeader.idEmployee === planningManagerOrLeader.employee.idEmployee);
      if (managerOrLeaderActif) {
        if (managerOrLeaderActif.contrats && managerOrLeaderActif.contrats.length) {
          const employeeNew = this.clone(managerOrLeaderActif);
          managerOrLeaderHasContratActif = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(planningManagerOrLeader.dateJournee), true);
          let activeGroupeTravail;
          if (managerOrLeaderHasContratActif && managerOrLeaderHasContratActif.contrats && managerOrLeaderHasContratActif.contrats.length) {
            activeGroupeTravail = managerOrLeaderHasContratActif.contrats[0].groupeTravail;
          }
          if ((managerOrLeaderHasContratActif && !managerOrLeaderHasContratActif.contrats) || (activeGroupeTravail && (!activeGroupeTravail.plgMgr && !activeGroupeTravail.plgLeader))) {
            planningManagerOrLeader.employee.plgManagerOrLeader = false;
          } else {
            planningManagerOrLeader.employee.plgManagerOrLeader = true;
          }
        } else {
          planningManagerOrLeader.employee.plgManagerOrLeader = false;
        }
      } else {
        planningManagerOrLeader.employee.plgManagerOrLeader = false;
      }

    });

  }

  /**
   * Trier la liste des employés de l'équipe de gestion
   */
  public sortManagersShifts(listShiftManager: any[]): void {
    let sortedShift = [];
    const sortedManagers = [];
    listShiftManager.sort((shift1: ShiftModel, shift2: ShiftModel) => {
      this.dateService.formatNewOrUpdatedShiftDate(shift1);
      this.dateService.formatNewOrUpdatedShiftDate(shift2);
      if (moment(shift1.heureDebut).isAfter(shift2.heureDebut)) {
        return 1;
      } else if (moment(shift1.heureDebut).isBefore(shift2.heureDebut)) {
        return -1;
      } else {
        return 0;
      }
    });
    const listShiftToSort = this.shiftService.filterShiftsToSort(listShiftManager);
    listShiftToSort.forEach((plgManager: ShiftModel) => {
      this.dateService.formatNewOrUpdatedShiftDate(plgManager);
      sortedShift.push(plgManager);
      sortedShift = sortedShift.concat(listShiftManager.filter((element: ShiftModel) => element.employee.idEmployee === plgManager.employee.idEmployee && (element.idShift !== plgManager.idShift || (element.idShift === plgManager.idShift && !moment(element.heureDebut).isSame(plgManager.heureDebut)))));
    });
    listShiftToSort.forEach((plgManager: ShiftModel) => {
      if (!sortedManagers.find((manager: EmployeeModel) => plgManager.employee.idEmployee === manager.idEmployee)) {
        sortedManagers.push(plgManager.employee);
      }
    });
    sortedShift.forEach((shift: ShiftModel) => {
      shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
    });
    this.managerShifts = sortedShift;
    this.managers = sortedManagers;
  }

  /**
   * Trier la liste des employés polyvalents
   */
  public sortShifts(listShift: any[]): void {
    let sortedShift = [];
    this.shiftService.triShiftParHeureDebut(listShift);
    const listShiftToSort = this.shiftService.filterShiftsToSort(listShift);

    listShiftToSort.forEach((shift: ShiftModel) => {
      if (shift.employee && shift.employee.idEmployee !== null) {
        sortedShift.push(shift);
        sortedShift = sortedShift.concat(listShift.filter((element: ShiftModel) => element.employee && element.employee.idEmployee === shift.employee.idEmployee && element.idShift !== shift.idShift));
      } else if (shift.employee === null || (shift.employee && shift.employee.idEmployee === null)) {
        sortedShift.push(shift);
      }
    });
    const sortedEmployees = this.shiftService.getSortedEmployeeListFromSortedShifts(listShiftToSort);
    const employeeSortField = this.employees.find((employe: EmployeeModel) => employe && employe.idEmployee === -1);
    if (employeeSortField) {
      sortedEmployees.unshift(employeeSortField);
    }
    sortedShift.forEach((shift: ShiftModel) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);
      shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
    });
    this.employees = sortedEmployees;
    this.listShift = sortedShift;
  }

  /**
   * Cette méthode permet de générer un id pour un nouveau shift ajouté
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  private getReportDataPerWeek(): void {
    this.requestDataFromMultipleSourcesWeek().subscribe((data: any) => {

        this.addAChevalShifts(data.shiftByDate);
        data.shiftByDate.forEach((element: any, indexElement: number) => {
          if (this.modeAffichage === 2) {
            if (indexElement === 0 || indexElement === data.shiftByDate.length - 1) {
              this.listPreviousOrNextPlanningManager = data.listNextOrPreviousShiftOrManager.filter((value: any) => value.fromPlanningManager || value.fromPlanningLeader);
              this.listPreviousOrNextShift = data.listNextOrPreviousShiftOrManager.filter((value: any) => !value.fromPlanningManager && !value.fromPlanningLeader);
            } else {
              let listNextOrPrevious = this.clone(data.shiftByDate[indexElement - 1].shifts);
              listNextOrPrevious.concat(this.clone(data.shiftByDate[indexElement + 1].shifts));
              this.listPreviousOrNextPlanningManager = listNextOrPrevious.filter((value: any) => value.fromPlanningManager || value.fromPlanningLeader);
              this.listPreviousOrNextShift = listNextOrPrevious.filter((value: any) => !value.fromPlanningManager && !value.fromPlanningLeader);
            }
          }
          this.getInactifEquipier(element.shifts, data.employesList);
          this.getManagers(this.shiftService.filterShifts(element.managers, this.frConfig, this.decoupageHoraireFinEtDebutActivity, true));
          this.managersAndProdShifts = element.managers;
          this.managerShifts = element.shifts.filter((value: ShiftModel) => value.fromPlanningManager || value.fromPlanningLeader).filter(s => {
            const ids = this.managers.map(m => m.idEmployee);
            if (s.employee) {
              return ids.includes(s.employee.idEmployee);
            } else {
              return false;
            }
          });

          this.getInactifManagerOrLeader(this.managerShifts, data.listLeaderActif.concat(data.listManagerActif));
          this.managerShifts = this.shiftService.filterShifts(this.managerShifts, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
          this.managerShifts.forEach((sh: ShiftModel) => {
            sh.oldIdShift = sh.idShift;
            sh.idShift = this.makeString();
          });
          let shiftsWithoutEmployeeNumber = 0;
          this.employeesList = data.employesList;
          this.employees = [];
          this.listShift = element.shifts;
          this.listShift = this.listShift.filter((value: ShiftModel) => !value.fromPlanningManager && !value.fromPlanningLeader);
          this.listShift = this.shiftService.filterShifts(this.listShift, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
          this.listShift.forEach((shift: ShiftModel) => {
            if (shift.employee && !this.employees.find((employee: EmployeeModel) => shift.employee.idEmployee === employee.idEmployee)) {
              this.employees.push(shift.employee);
            }
            if (shift.employee === null) {
              shiftsWithoutEmployeeNumber = shiftsWithoutEmployeeNumber + 1;
            }
          });
          if (!this.sortBy) {
            this.sortEmployees(this.employees);
            for (let i = 0; i < shiftsWithoutEmployeeNumber; i++) {
              this.employees.unshift({
                idEmployee: null,
                hebdoPlanifie: null,
                nom: null,
                prenom: null,
                hebdoCourant: null,
                matricule: null,
                hasLaws: null,
                statut: null,
                disablePlanningManagerOrLeaderOrFixe: null
              });
            }
          } else {
            this.sortShifts(this.listShift);
          }

          this.formatShiftHoraire(this.managerShifts);
          this.formatShiftHoraire(this.listShift);

          this.detailCa = element.detailCAS;
          element.detailCa = this.detailCa;
          element.dateJour = this.datePipe.transform(element.dateJour, 'EEEE d MMMM y', null, this.languageService.getLanguageSettings().value);

          this.initGrids(element);
        });

        this.dataTables = data.shiftByDate;
      }
      , error => {
        console.log('error', error);
      });
  }

  /**
   * Mettre la barre de séparation AM/PM en gras après l'initialisation de la vue
   */
  private setBarreHeureDeSeparation(): void {
    const grids = document.getElementsByClassName('pdf-gridster-container');
    const gridsArray = Array.from(grids);
    gridsArray.forEach(ga => {
      const columns = ga.getElementsByClassName('gridster-column');
      let hdd_x = 0;
      if (this.hours && this.hours.length > 0) {
        hdd_x = +(this.hours[0].substring(0, 2));
      }
      let hds_x = +this.heureDeSeparation.slice(0, 2);
      if (hds_x < hdd_x) {
        hds_x += 24;
      }
      let x = ((hds_x - hdd_x) * 4);
      const nbrMinute = +this.heureDeSeparation.slice(3, 5);
      if (nbrMinute !== 0) {
        if (nbrMinute >= 15 && nbrMinute < 30) {
          x += 1;
        } else if (nbrMinute >= 30 && nbrMinute < 45) {
          x += 2;
        } else if (nbrMinute >= 45 && nbrMinute <= 59) {
          x += 3;
        }
      }
      const columnsArray = Array.from(columns);
      (columnsArray[columnsArray.length - 1] as HTMLElement).style.borderRight = '1px solid black';
      columnsArray.forEach(c => {
        if (columnsArray.indexOf(c) !== 0 && columnsArray.indexOf(c) === (x - 1)) {
          (c as HTMLElement).style.borderRight = '3px solid black';
        }
        if (columnsArray.indexOf(c) % 4 === 0) {
          (c as HTMLElement).style.borderLeft = '1px solid black';
        }
      });
    });

  }

  private formatShiftHoraire(listShift: any[]): void {
    listShift.forEach((shift: any) => {
      if (shift.heureDebut instanceof String || shift.heureFin instanceof String) {
        this.dateService.setCorrectTimeToDisplayForShift(shift);
      }
      if (shift.heureDebut instanceof Date) {
        shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      }
      if (shift.heureFin instanceof Date) {
        shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
      }
    });
  }

  /**
   * Calculer les heures à afficher sur l'axe du temps
   */
  private getHours(debutJourneeActivite: WorkingDayLimits, finJourneeActivite: WorkingDayLimits): void {
    this.hours = [];
    this.hours.push(debutJourneeActivite.value.slice(0, -3));
    const start = +debutJourneeActivite.value.slice(0, 2);
    const end = +finJourneeActivite.value.slice(0, 2);
    const endMinutesCells = +finJourneeActivite.value.slice(3, 5) / 15;

    if (!finJourneeActivite.night) {
      let hour = start + 1;
      while (hour < end) {
        if (hour < 10) {
          this.hours.push('0' + (hour).toString() + ':00');
        } else {
          this.hours.push((hour).toString() + ':00');
        }
        hour = hour + 1;
      }
    } else {
      for (let i = start + 1; i <= 23; i++) {
        if (i < 10) {
          this.hours.push('0' + i.toString() + ':00');
        } else {
          this.hours.push(i.toString() + ':00');
        }
      }
      for (let i = 0; i < end; i++) {
        if (i < 10) {
          this.hours.push('0' + i.toString() + ':00');
        } else {
          this.hours.push(i.toString() + ':00');
        }
      }
    }
    if (endMinutesCells) {
      this.hours.push((end).toString() + ':00');
    }
  }

  /**
   * Cette methode permet de retourner le découpage horaire d'un restaurant
   */
  private requestDataForDecoupageFromMultipleSources(): Observable<{ debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel }> {
    const response1 = this.decoupageHoraireService.getDebutJourneePhase();
    const response2 = this.decoupageHoraireService.getFinJourneePhase();
    return forkJoin({
      debutJournee: response1,
      finJournee: response2
    });
  }

  private getAllShiftsAndInintGrid(): void {
    if (this.displayWeekReport) {
      this.getReportDataPerWeek();
    } else {
      let shiftsWithoutEmployeeNumber = 0;
      this.requestDataFromMultipleSourcesDorDay().subscribe((data: any) => {
        if (this.isSectionSelected('PM')) {
          this.getManagers(this.shiftService.filterShifts(data.shiftsManagerByDate, this.frConfig, this.decoupageHoraireFinEtDebutActivity, true));
          this.managerShifts = data.shiftByDate.filter((value: ShiftModel) => value.fromPlanningManager || value.fromPlanningLeader).filter(s => {
            const ids = this.managers.map(m => m.idEmployee);
            if (s.employee) {
              return ids.includes(s.employee.idEmployee);
            } else {
              return false;
            }
          });
          this.getInactifManagerOrLeader(this.managerShifts, data.listLeaderActif.concat(data.listManagerActif));
          this.managerShifts = this.shiftService.filterShifts(this.managerShifts, this.frConfig, this.decoupageHoraireFinEtDebutActivity);
          this.managerShifts.forEach((sh: ShiftModel) => {
            sh.oldIdShift = sh.idShift;
            sh.idShift = this.makeString();
          });
        }
        data.shiftByDate.forEach((shift: ShiftModel) => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);
          if (shift.employee && ((shift.employee.contrats && shift.employee.contrats.length && !shift.employee.contrats[0].groupeTravail.plgEquip) || !shift.employee.contrats.length)) {
            shift.employee.plgEquipier = false;
          }
        });

        this.getInactifEquipier(data.shiftByDate, data.employesList);

        this.listShift = this.shiftService.filterShifts(data.shiftByDate.filter((value: ShiftModel) => !value.fromPlanningManager && !value.fromPlanningLeader), this.frConfig, this.decoupageHoraireFinEtDebutActivity);
        this.formatShiftHoraire(this.listShift);
        this.listShift = this.listShift.filter((value: ShiftModel) => !value.fromPlanningManager && !value.fromPlanningLeader);
        this.listShift.forEach((shift: ShiftModel) => {
          if (shift.employee && !this.employees.find((employee: EmployeeModel) => shift.employee.idEmployee === employee.idEmployee)) {
            this.employees.push(shift.employee);
          }
          if (shift.employee === null) {
            shiftsWithoutEmployeeNumber = shiftsWithoutEmployeeNumber + 1;
          }
        });
        if (!this.sortBy) {
          this.sortEmployees(this.employees);
          for (let i = 0; i < shiftsWithoutEmployeeNumber; i++) {
            this.employees.unshift({
              idEmployee: null,
              hebdoPlanifie: null,
              nom: null,
              prenom: null,
              hebdoCourant: null,
              matricule: null,
              hasLaws: null,
              statut: null,
              disablePlanningManagerOrLeaderOrFixe: null
            });
          }
        } else {
          this.sortShifts(this.listShift);
        }

        if (this.isSectionSelected('PM')) {
          this.managerShifts.forEach((value: any) => {
            if (!value.employee.plgManagerOrLeader) {
              value.notActifEquip = true;
            }
          });
        }
        if (this.modeAffichage === 2) {
          this.listPreviousOrNextPlanningManager = data.listPreviousNextShiftOrManager;
          this.listPreviousOrNextShift = data.listPreviousNextShiftOrManager;
        }
        this.detailCa = data.detailCA;
        data.detailCa = this.detailCa;
        this.employeesList = data.employesList;
        this.initGrids(data);
        data.dateJour = this.date;
        this.dataTables = [data];
      });
    }

  }

  private requestDataFromMultipleSourcesDorDay(): Observable<{ shiftByDate: ShiftModel[], shiftsManagerByDate?: PlanningManagerModel[], detailCA: DetailCA, employesList: EmployeeModel[] }> {
    const response1 = this.shiftService.getListShiftWithoutAbsence(this.dateDecoupage);
    const response2 = this.plgManagerService.getListPlanningLeaderAndManagerByIdRestaurantAndDateWithoutAbsence(new Date(this.dateDecoupage));
    const dateAsString = this.dateService.formatToShortDate(new Date(this.dateDecoupage));
    const response3 = this.rapportService.getRapportPlanningData(dateAsString, +this.heureDeSeparation.slice(0, 2), +this.heureDeSeparation.slice(3, 5), this.heureDeSeparationIsNight, this.isSectionSelected('PM'));
    // if this.displayWeekReport = false
    const response4 = this.employeeService.getListEmployeeActifForDailyReport(dateAsString, 0);
    const response5 = this.employeeService.findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(new Date(this.dateDecoupage), new Date(this.dateDecoupage), 0);
    const response6 = this.employeeService.findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(new Date(this.dateDecoupage), new Date(this.dateDecoupage), 1);
    const response7 = this.shiftService.getListShiftPreviousAndNextDayByRestaurantAndDateJourneeForJournalierReport(new Date(this.dateDecoupage));
    if (this.isSectionSelected('PM')) {
      return forkJoin({
        shiftByDate: response1,
        shiftsManagerByDate: response2,
        detailCA: response3,
        employesList: response4,
        listManagerActif: response5,
        listLeaderActif: response6,
        listPreviousNextShiftOrManager: response7,

      });
    } else {
      return forkJoin({
        shiftByDate: response1,
        detailCA: response3,
        employesList: response4,
        listPreviousNextShiftOrManager: response7,
      });
    }

  }

  /**
   * trier la liste des employées
   * @param items éléments de la liste
   */
  private sortEmployees(items: EmployeeModel[]): EmployeeModel[] {
    items.sort((a: EmployeeModel, b: EmployeeModel) => {
      if (a.prenom > b.prenom) {
        return 1;
      } else if (a.prenom < b.prenom) {
        return -1;
      } else {
        return 0;
      }
    });
    return items;
  }

  private requestDataFromMultipleSourcesWeek(): Observable<{ shiftByDate: ShiftModel[], employesList: EmployeeModel[] }> {
    const dateAsString = this.dateService.formatToShortDate(new Date(this.dateDecoupage));
    const response1 = this.rapportService.getRapportPlanningDataPerWeek(dateAsString, +this.heureDeSeparation.slice(0, 2), +this.heureDeSeparation.slice(3, 5), this.heureDeSeparationIsNight, this.isSectionSelected('PM'));
    // if this.displayWeekReport = true
    const response2 = this.employeeService.getListEmployeeActifForDailyReport(dateAsString, 1);
    const dateDebutSemaine = this.clone(new Date(this.dateDecoupage));
    const dateFinSemaine = new Date(dateDebutSemaine.setDate(dateDebutSemaine.getDate() + 6));
    const response3 = this.employeeService.findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(new Date(this.dateDecoupage), dateFinSemaine, 0);
    const response4 = this.employeeService.findAllEmployeActifWithGroupTravailsPlgMgrBetweenTwoDates(new Date(this.dateDecoupage), dateFinSemaine, 1);
    const response5 = this.shiftService.getListShiftPreviousAndNextDayByRestaurantAndDateJourneeForJournalierReportWeek(this.clone(new Date(this.dateDecoupage)));
    return forkJoin({
      shiftByDate: response1,
      employesList: response2,
      listManagerActif: response3,
      listLeaderActif: response4,
      listNextOrPreviousShiftOrManager: response5,
    });
  }

  private getTypeRestaurantImage(): void {
    this.fileService.getLogoByName(this.restaurant.typeRestaurant.pathLogo).subscribe((image: Blob) => {
      this.restaurantLogo = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image));
      this.getDecoupageHoraire();
    }, (err: any) => {
      this.restaurantLogo = null;
      this.getDecoupageHoraire();
    });
  }

  private getRestaurant(): void {
    if (this.sharedRestaurantService.selectedRestaurant && this.sharedRestaurantService.selectedRestaurant.typeRestaurant && this.sharedRestaurantService.selectedRestaurant.idRestaurant && this.sharedRestaurantService.selectedRestaurant.idRestaurant !== 0) {
      this.restaurant = this.sharedRestaurantService.selectedRestaurant;
      this.getParamNationauxByRestaurant();
    } else {
      this.sharedRestaurantService.getRestaurantByIdWithTypeRestaurant().subscribe(
        (data: RestaurantModel) => {
          this.sharedRestaurantService.selectedRestaurant = data;
          this.restaurant = this.sharedRestaurantService.selectedRestaurant;
          this.getParamNationauxByRestaurant();
        }, (err: any) => {
          console.log('error');
          console.log(err);
        }
      );
    }
  }

  /**
   * mettre les signe de pause
   * @param shifts
   * @param isManager
   */
  private setSignOfBreak(shifts: any, isManager?: boolean): void {
    let shiftDay = [];
    let listPreviousOrNextPlanningManagerOrShift;

    shifts.forEach((shift: any) => {
      this.dateService.setCorrectTimeToDisplayForShift(shift);

      if (shift.heureDebut instanceof Date) {
        shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      }
      if (shift.heureFin instanceof Date) {
        shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
      }
    });
    const listShifs = this.clone(shifts);
    this.employeesList.forEach((employeeDisplay: any) => {
      shiftDay = [];
      if (this.modeAffichage === 2) {
        if (isManager) {
          listPreviousOrNextPlanningManagerOrShift = this.listPreviousOrNextPlanningManager.filter((value: any) => value.employee && value.employee.idEmployee === employeeDisplay.idEmployee);
        } else {
          listPreviousOrNextPlanningManagerOrShift = this.listPreviousOrNextShift.filter((value: any) => value.employee && value.employee.idEmployee === employeeDisplay.idEmployee);
          ;
        }
      }
      if (employeeDisplay.contrats) {
        listShifs.forEach((shift: any) => {
          this.dateService.setCorrectTimeToDisplayForShift(shift);

          if (shift.employee && shift.employee.idEmployee === employeeDisplay.idEmployee
            && (!shift.acheval || (shift.acheval && this.modeAffichage === 2) || (shift.acheval && shift.modifiable && this.modeAffichage === 1))) {
            shiftDay.push(shift);
          }
        });
        if (shiftDay.length) {
          if (employeeDisplay.contrats.length > 1) {
            employeeDisplay = this.contrainteSocialeService.getContratByDay(employeeDisplay, new Date(JSON.parse(JSON.stringify(shiftDay[0].dateJournee))), true);
          }
          if (employeeDisplay.contrats) {
            const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeeDisplay);
            if (!employeeDisplay.hasLaws && employeeDisplay.contrats[0].groupeTravail.hasLaws) {
              employeeDisplay.loiEmployee = this.contrainteSocialeCoupureService.getLoiForEmployee(employeeDisplay, employeeDisplay.loiEmployee);
            }
            shiftDay.forEach((shift: any) => {
              if (shift.acheval) {
                shift.heureDebut = shift.heureDebutCheval;
                shift.heureFin = shift.heureFinCheval;
                if (!shift.modifiable) {
                  shift.dateJournee = new Date(shift.dateJournee.getTime() + (24 * 60 * 60 * 1000));

                }
              }
            });
            this.helperService.verificationContraintMaxShiftWithoutBreakInListShift(employeeDisplay.loiEmployee, employeeDisplay.contrats[0].tempsPartiel, employeeMineur, shiftDay);
            const totalDayWithBreak = this.shiftService.getDayTotalHoursForEmployee(shiftDay, employeeDisplay, this.paramNationaux, this.listOfBreakAndShift, this.modeAffichage, this.decoupageHoraireFinEtDebutActivity, this.frConfig, listPreviousOrNextPlanningManagerOrShift, true, true);
            let totalInDay = 0;
            shiftDay.forEach((item: any) => {
              totalInDay += this.dateService.getDiffHeure(item.heureFin, item.heureDebut);
              if (item.acheval && this.modeAffichage === 2) {
                totalInDay -= item.timeToSubstruct;
              }
            });
            shiftDay[0].pauseToRemove = totalInDay - totalDayWithBreak;
          }
        }
      }
    });
    listShifs.forEach((shift: any) => {
      shifts.forEach((shiftDisplay: any) => {
        if (!shiftDisplay.idShift) {
          shiftDisplay.idShift = shiftDisplay.idPlanningManager;
        }
        if (!shift.idShift) {
          shift.idShift = shift.idPlanningManager;
        }
        if (shiftDisplay.idShift === shift.idShift) {
          shiftDisplay.sign = shift.sign;
          shiftDisplay.pauseToRemove = shift.pauseToRemove ? shift.pauseToRemove : 0;
          if (shiftDisplay.acheval && shiftDisplay.modifiable && this.modeAffichage === 1) {
            const shiftCurrent = this.clone(shiftDisplay);
            this.dateService.setCorrectTimeToDisplayForShift(shiftCurrent);
            const totalInDayAcheval = this.dateService.getDiffHeure(shiftDisplay.heureFinCheval, shiftDisplay.heureDebutCheval);
            const totalInDayShift = this.dateService.getDiffHeure(shiftCurrent.heureFin, shiftCurrent.heureDebut);
            shiftDisplay.timeToSubstruct = totalInDayAcheval - totalInDayShift;
          }
          if (shiftDisplay.sign) {
            shiftDisplay.colorSign = this.brightnessColorShiftService.LightenDarkenColor(isManager ? '#c4c0c0' : shiftDisplay.positionTravail.couleur, this.colorBrightDarker);
          } else {
            if (isManager) {
              shiftDisplay.colorSign = '#c4c0c0';
            }

          }
        }
      });
    });
  }

  /**
   * Permet de grouper la loi  par employee ou groupe de trvail
   * @param: list
   * @param: keyGetter
   */
  private shifyByEmployee(key, list, map) {
    map.set(key, list);
    return map;
  }

  /**
   * Calculer le nombre maximum de lignes à mettre sur une page en fonction des sections sélectionnées pour mode paysage
   */
  private getMaxPageForPaysageMode(): void {
    if (!this.pdfSections.includes('VAMPM') && !this.pdfSections.includes('VTAC')
      && !this.pdfSections.includes('DP')) {
      this.max_page = 16;
    } else if ((this.pdfSections.includes('VAMPM') || this.pdfSections.includes('VTAC'))
      && !this.pdfSections.includes('DP')) {
      this.max_page = 15;
    } else if (this.pdfSections.includes('DP') && !this.pdfSections.includes('VAMPM')
      && !this.pdfSections.includes('VTAC')) {
      this.max_page = 13;
    } else if (this.pdfSections.includes('DP') && (this.pdfSections.includes('VAMPM')
      || this.pdfSections.includes('VTAC'))) {
      this.max_page = 14;
    }
  }

  /**
   * Calculer le nombre maximum de lignes à mettre sur une page en fonction des sections sélectionnées pour mode portrait
   */
  private getMaxPageForPortraitMode(): void {
    if (!this.pdfSections.includes('VAMPM') && !this.pdfSections.includes('VTAC')
      && !this.pdfSections.includes('DP')) {
      this.max_page = 37;
    } else if ((this.pdfSections.includes('VAMPM') || this.pdfSections.includes('VTAC'))
      && !this.pdfSections.includes('DP')) {
      this.max_page = 36;
    } else if (this.pdfSections.includes('DP') && !this.pdfSections.includes('VAMPM')
      && !this.pdfSections.includes('VTAC')) {
      this.max_page = 30;
    } else if (this.pdfSections.includes('DP') && (this.pdfSections.includes('VAMPM')
      || this.pdfSections.includes('VTAC'))) {
      this.max_page = 29;
    }
  }

  /**
   * Construction de la grille
   * @param employees liste des employées
   * @param shifts liste des shifts
   * @param isManager
   */
  private buildPdfPlanning(employees: EmployeeModel[], shifts: ShiftModel[] | PlanningManagerModel[], isManager: boolean): Array<GridsterItem> {
    let data: Array<GridsterItem> = [];
    // créer la grille
    data = this.buildShifts(shifts, employees, isManager).concat(this.buildTimeAxis());
    return data;
  }

  /**
   * Configuration des options de la grille
   * @param employees liste des employés
   */
  private setOptions(employees): GridsterConfig {
    const options: GridsterConfig = _.cloneDeep(this.options_pdf);
    options.minCols = this.hours.length * 4;
    options.maxCols = this.hours.length * 4;
    options.minRows = employees.length;
    options.maxRows = employees.length;
    if (options.api && options.api.optionsChanged) {
      options.api.optionsChanged();
    }
    return options;
  }

  /**
   * Construction de l'axe du temps
   */
  private buildTimeAxis(): Array<GridsterItem> {
    const data: Array<GridsterItem> = [];
    // Afficher l'axe du temps sur la grille
    let x = 0;
    this.hours.forEach(hour => {
      data.push({
        cols: 4,
        rows: 1,
        y: 0,
        x: x,
        color: '#f4f4f4',
        label: hour,
        dragEnabled: false,
        resizeEnabled: false,
        isheureDeDebut: this.hours.indexOf(hour) === 0
      });
      x = x + 4;
    });
    return data;
  }

  /**
   * Construction de l'axe des employées
   * @param employees liste des employées
   */
  private buildEmployeeAxis(employees: EmployeeModel[]): EmployeeModel[] {
    if (!employees.some(e => e.idEmployee === -1)) {
      const emptyEmployee: EmployeeModel = {
        nom: '',
        prenom: '',
        hebdoCourant: null,
        hebdoPlanifie: null,
        idEmployee: -1,
        matricule: '',
        disablePlanningManagerOrLeaderOrFixe: false,
        statut: false,
        hasLaws: false

      };
      employees.unshift(emptyEmployee);
    }
    return employees;
  }

  /**
   * Construction des item de la grille
   * @param shifts liste des shifts
   * @param employees liste des employés
   * @param isManager is manager's shift
   */
  private buildShifts(shifts: ShiftModel[] | PlanningManagerModel[], employees: EmployeeModel[], isManager: boolean): any {

    const nullEmployeesIndexes = [];
    employees.forEach((e: EmployeeModel) => {
      if (e && e.idEmployee === null) {
        e.indexInRapport = employees.indexOf(e);
        nullEmployeesIndexes.push(employees.indexOf(e));
      }
    });
    if (isManager) {
      return this.buildManagersShifts(shifts, nullEmployeesIndexes, employees);
    } else {
      return this.buildEmployeesShifts(shifts, nullEmployeesIndexes, employees);
    }
  }


  private buildManagersShifts(shifts: any, nullEmployeesIndexes: any, employees: EmployeeModel[]): any {
    const data = [];
    const shiftsWithoutEmployee = shifts.filter((s: ShiftModel) => s.employee === null);
    let y = 0;
    let i = nullEmployeesIndexes.length - shiftsWithoutEmployee.length;
    shifts.forEach((shift: any) => {
      if (shift.heureDebut instanceof Date) {
        shift.heureDebut = this.dateService.setStringFromDate(shift.heureDebut);
      }
      if (shift.heureFin instanceof Date) {
        shift.heureFin = this.dateService.setStringFromDate(shift.heureFin);
      }
      if (shift.employee) {
        const empl = employees.find(e => shift.employee.idEmployee === e.idEmployee);
        y = employees.indexOf(empl);
        if (shift.employee.hasOwnProperty('plgManagerOrLeader')) {
          data.push(
            {
              cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
              rows: 1,
              y: y,
              x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
              color: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? shift.positionTravail.couleur : '#c4c0c0') : this.getColorPositionTravail(shift),
              label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : (shift.periodeManager ? shift.periodeManager.libelle.toUpperCase() : this.getLibellePositionTravail(shift)),
              timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
              id: shift.idShift,
              sign: shift.sign,
              isShift: true,
              plgManagerOrLeader: true,
              dragEnabled: false,
              resizeEnabled: false,
              colorSign: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker) : shift.colorSign) : shift.colorSign,
              textColor: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0')) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0'),
              pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
              notActiveShift: shift.notActifEquip,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              timeToSubstruct: shift.timeToSubstruct,

            }
          );
        } else {
          data.push(
            {
              cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
              rows: 1,
              y: y,
              x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
              color: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? shift.positionTravail.couleur : '#c4c0c0') : this.getColorPositionTravail(shift),
              label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : (shift.periodeManager ? shift.periodeManager.libelle.toUpperCase() : this.getLibellePositionTravail(shift)),
              timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
              id: shift.idShift,
              sign: shift.sign,
              isShift: true,
              dragEnabled: false,
              resizeEnabled: false,
              colorSign: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker) : shift.colorSign) : shift.colorSign,
              textColor: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0')) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0'),
              pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              timeToSubstruct: shift.timeToSubstruct,

            }
          );
        }


      } else {
        y = nullEmployeesIndexes[i];
        i = i + 1;
        data.push(
          {
            cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
            rows: 1,
            y: y,
            x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
            color: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? shift.positionTravail.couleur : '#c4c0c0') : this.getColorPositionTravail(shift),
            label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : (shift.periodeManager ? shift.periodeManager.libelle.toUpperCase() : this.getLibellePositionTravail(shift)),
            timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
            id: shift.idShift,
            sign: shift.sign,
            isShift: true,
            dragEnabled: false,
            resizeEnabled: false,
            colorSign: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker) : shift.colorSign) : shift.colorSign,
            textColor: shift.positionTravail ? (shift.positionTravail.actifPositionTravail ? this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0')) : this.brightnessColorShiftService.codeColorTextShift('#c4c0c0'),
            pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
            acheval: shift.acheval,
            modifiable: shift.modifiable,
            timeToSubstruct: shift.timeToSubstruct,
          }
        );
      }

    });
    return data;
  }

  private buildEmployeesShifts(shifts: ShiftModel[], nullEmployeesIndexes: any, employees: EmployeeModel[]): any {
    const data = [];
    let y = 0;
    let i = 0;
    shifts.forEach((shift: ShiftModel) => {
      if (shift.employee) {
        const empl = employees.find(e => shift.employee.idEmployee === e.idEmployee);
        y = employees.indexOf(empl);
        if (shift.employee.hasOwnProperty('plgEquipier')) {
          data.push(
            {
              cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
              rows: 1,
              y: y,
              x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
              label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : 'PRODUCTIF',
              color: this.GREY,
              textColor: this.BLACK,
              timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
              id: shift.idShift,
              isShift: true,
              dragEnabled: false,
              resizeEnabled: false,
              sign: shift.sign,
              notPlgEquipier: true,
              colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
              pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
              notActiveShift: true,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              timeToSubstruct: shift.timeToSubstruct,
            }
          );
        } else {
          data.push(
            {
              cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
              rows: 1,
              y: y,
              x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
              color: shift.positionTravail.couleur,
              label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : 'PRODUCTIF',
              timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
              id: shift.idShift,
              isShift: true,
              dragEnabled: false,
              resizeEnabled: false,
              sign: shift.sign,
              colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
              textColor: this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur),
              pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              timeToSubstruct: shift.timeToSubstruct,
            }
          );
        }
      } else {
        y = nullEmployeesIndexes[i];
        i = i + 1;
        if (i <= nullEmployeesIndexes.length) {
          data.push(
            {
              cols: this.convertDurationToColsNumber(shift.heureDebut, shift.heureDebutIsNight, shift.heureFin, shift.heureFinIsNight),
              rows: 1,
              y: y,
              x: this.convertStartTimeToPosition(shift.heureDebut, shift.heureDebutIsNight),
              color: shift.positionTravail.couleur,
              label: shift.positionTravail ? shift.positionTravail.libelle.toUpperCase() : 'PRODUCTIF',
              timeLabel: shift.heureDebut.substring(0, 5) + ' - ' + shift.heureFin.substring(0, 5),
              id: shift.idShift,
              isShift: true,
              dragEnabled: false,
              resizeEnabled: false,
              sign: shift.sign,
              colorSign: this.brightnessColorShiftService.LightenDarkenColor(shift.positionTravail.couleur, this.colorBrightDarker),
              textColor: this.brightnessColorShiftService.codeColorTextShift(shift.positionTravail.couleur),
              pauseToRemove: shift.pauseToRemove ? shift.pauseToRemove : 0,
              acheval: shift.acheval,
              modifiable: shift.modifiable,
              timeToSubstruct: shift.timeToSubstruct,
            }
          );

        }
      }

    });
    return data;
  }

  /**
   * Récupérer la liste des managers
   */
  private getManagers(plgManagers: PlanningManagerModel[]): void {
    this.managers = [];
    plgManagers.forEach((plgManager: PlanningManagerModel) => {
      if (!this.managers.find((manager: EmployeeModel) => plgManager.managerOuLeader.idEmployee === manager.idEmployee)) {
        this.managers.push(plgManager.managerOuLeader);
      }
    });

  }

  /**
   * transformer l'heure de début d'un shift à une position sur la grille
   * @param startTime heure de début d'un shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   */
  private convertStartTimeToPosition(startTime: string, isStartTimeAtNight: boolean): number {
    return this.planningSemaineService.convertStartTimeToPosition(startTime, isStartTimeAtNight, +this.hours[0].slice(0, 2));
  }

  /**
   * convertir la durée d'un shift en nombre de colonnes de la grille
   * @param startTime heure de début du shift
   * @param isStartTimeAtNight l'heure de début du shift fait elle partie de la journée actuelle ou la journée suivante
   * @param endTime heure de fin du shift
   * @param isEndTimeAtNight l'heure de fin du shift fait elle partie de la journée actuelle ou la journée suivante
   */
  private convertDurationToColsNumber(startTime: string, isStartTimeAtNight: boolean, endTime: string, isEndTimeAtNight: boolean) {
    return this.planningSemaineService.convertDurationToColsNumber(startTime, isStartTimeAtNight, endTime, isEndTimeAtNight);
  }

  /**
   * Convertir des minutes en temps sous forme hh:mm
   * @param minutes minutes
   */
  private convertMinutesToTime(minutes: number): string {
    return this.planningSemaineService.convertMinutesToTime(minutes);
  }

  /**
   * Convertir le temps sous forme hh:mm en minutes
   * @param time temps
   */
  private convertTimeToMinutes(time: string): number {
    return this.planningSemaineService.convertTimeToMinutes(time);
  }

  /**
   * récuperer les parametres nantionaux
   */
  private getParamNationauxByRestaurant(): void {
    this.paramNationauxService.getParamNationauxByRestaurant().subscribe((data: ParametreNationauxModel) => {
        this.paramNationaux = data;
        this.sortBreakInParametresNationaux();
      this.getParamRestaurantByCodeNames();
        this.getTypeRestaurantImage();
      }
    );
  }

  private getParamRestaurantByCodeNames(): void {
    const codeNamesAsArray = [this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    this.parametreService.getParamRestaurantByCodeNames(codeNames).subscribe(
      (data: ParametreModel[]) => {
        this.getDisplayMode24H(data);
      }
    );
  }

  /**
   *get param PERFORM_MODE pour afficher productivité ou taux de MOE
   */
  public getDisplayMode24H(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      this.modeAffichage = +paramList[index].valeur;

    }
  }

  /**
   * Trie les shifts et leurs break de paramtres nationaux
   */
  private sortBreakInParametresNationaux(): void {
    if (this.paramNationaux.dureeShift1) {
      this.paramNationaux.dureeShift1 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift1);
    }
    if (this.paramNationaux.dureeShift2) {
      this.paramNationaux.dureeShift2 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift2);
    }
    if (this.paramNationaux.dureeShift3) {
      this.paramNationaux.dureeShift3 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeShift3);
    }
    if (this.paramNationaux.dureeBreak1) {
      this.paramNationaux.dureeBreak1 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak1);
    }
    if (this.paramNationaux.dureeBreak2) {
      this.paramNationaux.dureeBreak2 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak2);
    }
    if (this.paramNationaux.dureeBreak3) {
      this.paramNationaux.dureeBreak3 = this.dateService.setTimeFormatHHMM(this.paramNationaux.dureeBreak3);
    }
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift1, this.paramNationaux.dureeBreak1);
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift2, this.paramNationaux.dureeBreak2);
    this.setShiftAndBreakOfParmetreNationaux(this.paramNationaux.dureeShift3, this.paramNationaux.dureeBreak3);
    this.listOfBreakAndShift.sort(function (a: BreakAndShiftOfParametresNationauxModel, b: BreakAndShiftOfParametresNationauxModel) {
      if (a.break < b.break) {
        return -1;
      }
      if (a.break > b.break) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * ajouter des shifts et leures break
   ** @param :shift
   * @param :breakOfParmatre
   */
  private setShiftAndBreakOfParmetreNationaux(shift: Date, breakOfParmatre: Date): void {
    const breakAndShift = {} as BreakAndShiftOfParametresNationauxModel;
    if (shift) {
      breakAndShift.shift = shift;
    }
    if (breakOfParmatre) {
      breakAndShift.break = breakOfParmatre;
    }
    if (breakOfParmatre && shift) {
      this.listOfBreakAndShift.push(breakAndShift);
    }
  }

  private getLibellePositionTravail(shift: any): String {
    let libelleToReturn = 'PRODUCTIF';
    if (!shift.oldIdShift) {
      shift.oldIdShift = shift.idPlanningManager;
    }
    this.managersAndProdShifts.forEach((item: any) => {
      item.planningManagerProductif.forEach((itemProd: any) => {
        if (itemProd.idPlanningManagerProductif === shift.oldIdShift) {
          if (itemProd.positionTravail && itemProd.positionTravail.libelle) {
            libelleToReturn = (itemProd.positionTravail.libelle.toUpperCase());
          } else {
            libelleToReturn = (item.periodeManager ? item.periodeManager.libelle.toUpperCase() : 'PRODUCTIF');
          }
        }
      });
    });
    return libelleToReturn;
  }

  private getColorPositionTravail(shift: any): String {
    let colorToReturn = '#c4c0c0';
    if (!shift.oldIdShift) {
      shift.oldIdShift = shift.idPlanningManager;
    }
    this.managersAndProdShifts.forEach((item: any) => {
      item.planningManagerProductif.forEach((itemProd: any) => {
        if (itemProd.idPlanningManagerProductif === shift.oldIdShift) {
          if (itemProd.positionTravail && itemProd.positionTravail.couleur && itemProd.positionTravail.actifPositionTravail) {
            colorToReturn = itemProd.positionTravail.couleur;
          }
        }
      });
    });
    return colorToReturn;
  }

  private addAChevalShifts(val: any[]): void {
    val.forEach((item: any, index: number) => {
      if (index !== val.length - 1) {
        item.shifts.forEach((sh: ShiftModel) => {
          this.setAchevalToShiftOrManager(sh, val[index + 1].shifts);
        });
        item.managers.forEach((sh: ShiftModel) => {
          this.setAchevalToShiftOrManager(sh, val[index + 1].managers);
        });
      }
    });
  }

  private setAchevalToShiftOrManager(sh: any, val: any): void {
    if (sh.acheval && sh.modifiable) {
      const tmpShift = {...sh};
      tmpShift.heureDebut = tmpShift.heureDebutCheval;
      tmpShift.heureDebutIsNight = false;
      tmpShift.heureFin = tmpShift.heureFinCheval;
      tmpShift.heureFinIsNight = false;
      tmpShift.modifiable = false;
      const indexOfShiftAcheval = val.findIndex(shiftDisplay => shiftDisplay.idShift === sh.idShift && !shiftDisplay.modifiable);
      if (indexOfShiftAcheval !== -1) {
        val.splice(indexOfShiftAcheval, 1);
      }
      val.push(tmpShift);
    }
  }
}
