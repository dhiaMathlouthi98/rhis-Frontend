import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {EmployeeService} from '../../service/employee.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {RhisRoutingService} from '../../../../../shared/service/rhis.routing.service';

@Component({
  selector: 'rhis-detail-employe',
  templateUrl: './detail-employe.component.html',
  styleUrls: ['./detail-employe.component.scss']
})
export class DetailEmployeComponent implements OnInit {
  public activeSection = 0;
  public sectionState = false;
  public listAllEmplyees: EmployeeModel[] = [];
  public selectedEmployee = this.sharedEmployeeService.selectedEmployee;

  public currentUrl: any;

  public sections = [
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.IONFORMATIO_PERSONNELLES'), path: 'infos'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.CONTRAT'), path: 'contrat'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.QUALIFICATIONS'), path: 'qualification'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.ABSENCES_CONGE'), path: 'absence-conge'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.INDISPONIBILITE'), path: 'indisponibilites'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.DISCIPLINE'), path: 'discipline'},
    {name: this.rhisTranslateService.translate('DETAIL_EMPLOYEE_SECTION.RAPPORT'), path: 'rapport'}
  ];
  public sectionsLabels: string[];

  public heightInterface: any;

  public listEmplyeesAreShown = false;
  public index;
  public tableStringUrl = [];

  public lastStringUrl: any;

  public idUser: any;

  public listOrdonneEmployee = [];

  public addBlockScrollDetail = false;

  constructor(private router: Router,
              public sharedEmployeeService: SharedEmployeeService,
              private rhisTranslateService: RhisTranslateService,
              private employeeService: EmployeeService,
              public rhisRouter: RhisRoutingService) {
    this.sectionsLabels = this.sections.map(section => section.path);
    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
      )
      .subscribe((e: NavigationEnd) => {
        this.currentUrl = router.url;
        this.tableStringUrl = this.currentUrl.split('/');
        this.lastStringUrl = this.tableStringUrl[this.tableStringUrl.length - 1];
        this.idUser = this.tableStringUrl[3];
        this.enableSelectedSection(e.urlAfterRedirects);
        if (this.lastStringUrl === 'qualification' ||
          this.lastStringUrl === 'absence-conge' ||
          this.lastStringUrl === 'contrat' ||
          this.lastStringUrl === 'infos' ||
          this.lastStringUrl === 'add') {
          this.addBlockScrollDetail = true;
        } else {
          this.addBlockScrollDetail = false;
        }
      });
  }

  public ngOnInit(): void {
    this.sharedEmployeeService.onToggleSectionsState().subscribe(this.toggleState);
    this.getAllActiveEmplyees();
  }

  /**
   * Change the state of section (disabled/enabled) to its opposite one
   */
  private toggleState() {
    this.sectionState = !this.sectionState;
  }

  /**
   * Get the first letters of the employee's firs/last name
   */
  public getFirstFullNameLetters(): string {
    const employee = this.sharedEmployeeService.selectedEmployee;
    return employee && employee.nom && employee.prenom ? (employee.nom.slice(0, 1) + employee.prenom.slice(0, 1)) : '';
  }

  /**
   * Set the selected section based on url
   * @param : url
   */
  private enableSelectedSection(url: string): void {
    if (this.index !== this.activeSection) {
      this.listEmplyeesAreShown = false;
    }
    this.index = this.sectionsLabels.findIndex((section: string) => url.includes(section));

    if (this.index !== -1) {
      this.setActive(this.index);
    } else if (url.includes('add')) {
      this.sectionState = true;
    }
  }

  setActive(i: number) {
    this.activeSection = i;
  }

  /**
   *récupération de toute la liste des employés dans un restaurant
   */
  private getAllActiveEmplyees() {
    this.employeeService.findActiveEmployeeByRestaurant().subscribe(
      (data: EmployeeModel[]) => {
        this.listAllEmplyees = data;
        //save list employees dans le sahred employee
        this.sharedEmployeeService.setListEmployeeDisplay(this.listAllEmplyees.sort((a, b) => (a.nom > b.nom) ? 1 : -1));
        this.sharedEmployeeService.listEmployeeDisplay.subscribe(employeeList => this.listOrdonneEmployee = employeeList);
        this.setDisplayedName();
      },
      (err: any) => {
        // TODO gestion erreur
        console.log(err);
      }
    );
  }

  private setDisplayedName() {
    this.listAllEmplyees.forEach(item => {
      item.displayedName = item.nom + ' ' + item.prenom;
    });
  }

  public showDetails() {
    this.listOrdonneEmployee.forEach((emp, index) => {
      if (emp.idEmployee === this.selectedEmployee.idEmployee) {
        this.selectedEmployee = emp;
      }
    });
    this.checkIfUserHasAMail();
    this.sharedEmployeeService.selectedEmployee = this.selectedEmployee;
    if (this.lastStringUrl === 'add') {
      this.lastStringUrl = 'infos';
    }
    const urlDetail = 'home/employee/' + this.selectedEmployee.uuid + '/detail/' + this.lastStringUrl;
    this.router.navigate([urlDetail]);
  }

  /**
   * ette methode permet d'afficher le champs mail vide
   */
  private checkIfUserHasAMail() {
    if (!this.selectedEmployee.email.includes('@')) {
      (this.selectedEmployee.email = '');
    }
  }
}
