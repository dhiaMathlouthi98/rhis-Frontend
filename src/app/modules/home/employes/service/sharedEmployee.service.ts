import {Injectable} from '@angular/core';
import {EmployeeModel} from '../../../../shared/model/employee.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedEmployeeService {

  selectedEmployee: EmployeeModel;
  private subject = new Subject<any>();

  private listEmployee = new BehaviorSubject([]);
  listEmployeeDisplay = this.listEmployee.asObservable();
  constructor() {
  }

  toggleSectionsState() {
    this.subject.next();
  }

  onToggleSectionsState(): Observable<any> {
    return this.subject.asObservable();
  }

  public setListEmployeeDisplay(listEmployee: EmployeeModel[]) {
    this.listEmployee.next(listEmployee);
  }


}
