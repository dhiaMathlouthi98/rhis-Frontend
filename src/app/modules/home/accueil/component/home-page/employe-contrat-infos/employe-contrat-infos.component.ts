import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'rhis-employe-contrat-infos',
  templateUrl: './employe-contrat-infos.component.html',
  styleUrls: ['./employe-contrat-infos.component.scss']
})
export class EmployeContratInfosComponent {

  @Output()
  private seeActiveEmployees = new EventEmitter();

  @Input()
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

  /**
   * Emit event to redirect to list active employees
   */
  public seeListOfActiveEmployees() {
    this.seeActiveEmployees.emit();
  }
}
