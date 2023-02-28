import {Component} from '@angular/core';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {ActivatedRoute, Router} from '@angular/router';
import {EmployeeService} from '../../service/employee.service';

@Component({
  selector: 'rhis-absence-conge-visite-medicale',
  templateUrl: './absence-conge-visite-medicale.component.html',
  styleUrls: ['./absence-conge-visite-medicale.component.scss']
})
export class AbsenceCongeVisiteMedicaleComponent {
  public idEmployee;
  public congeDisplayed = true;

  constructor(private sharedEmployeeService: SharedEmployeeService,
              private route: ActivatedRoute,
              private router: Router,
              private employeeService: EmployeeService) {
    this.route.parent.params.subscribe(params => this.idEmployee = params.idEmployee);
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation.extras.state && currentNavigation.extras.state.visiteMedicalDisplayed) {
      this.congeDisplayed = false;
    }
    this.route.parent.params.subscribe(params => {
      this.idEmployee = params.idEmployee;
      this.getIdEmployee();
    });
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
   * Cette methode permet de recuperer l'employee avec le badge
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.idEmployee).subscribe(
      (data: any) => {
        this.sharedEmployeeService.selectedEmployee = data;
        this.idEmployee = this.sharedEmployeeService.selectedEmployee.uuid;
      },
      (err: any) => {
        console.log('Erreuue au niveau de un employe ');
      }
    );
  }
}
