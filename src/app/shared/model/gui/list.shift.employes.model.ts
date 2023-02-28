import {ShiftModel} from '../shift.model';
import {EmployeeModel} from '../employee.model';

export class ListShiftsEmployes {

  public shiftsToAssign?: ShiftModel[] = [];
  public employeesShifts?: EmployeeModel[] = [];
  public listShiftUpdate?: ShiftModel[] = [];
}
