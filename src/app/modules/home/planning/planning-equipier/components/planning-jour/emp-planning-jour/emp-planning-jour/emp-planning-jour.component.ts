import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EmployeeModel} from '../../../../../../../../shared/model/employee.model';

@Component({
    selector: 'rhis-emp-planning-jour',
    templateUrl: './emp-planning-jour.component.html',
    styleUrls: ['./emp-planning-jour.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpPlanningJourComponent implements OnInit {
    @Input() employee;
    @Input() showTimeAxis;
    @Input() sortByEmployee;
    @Input() applyButtonPostStyle;
    @Input() idGrid;
    @Input() i;
    @Input() minimalDisplay;
    @Input() activLoaderIndex;
    @Input() activLoader;

    @Input() set newEmployeesToDisplay(employees) {
        this.employeesToDisplay = employees;
    }
    @Input() employeNotFound;
    @Input() selectedEmployee;
    @Input() longeurEmployee;
    @Input() tooltipStyleNomEmployee;
    @Input() totalHourEmployee;
    @Input() onCheckShiftNA;
    @Input() hebdoPlanifieToDisplay;
    @Input() hebdoCourant;

    @Output() onSortEmployees = new EventEmitter();
    @Output() onSortShifts = new EventEmitter();
    @Output() onReAssignEmployee = new EventEmitter();
    @Output() onHighlightEmployee = new EventEmitter();
    @Output() onShowOrHideToolTip = new EventEmitter();
    @Output() onGetNewEmployees = new EventEmitter();
    @Output() onConfirmAddEmployee = new EventEmitter();
    @Output() onOpenEmployeeWeeklyPlanning = new EventEmitter();
    @Output() onCloseEmployeeWeeklyPlanning = new EventEmitter();

    private employeeToAdd;
    private employeesToDisplay;
    constructor() {
    }

    ngOnInit() {
    }

    sortEmployees() {
        this.onSortEmployees.emit();
    }

    sortShifts() {
        this.onSortShifts.emit();
    }

    reAssignEmployee() {
        this.onReAssignEmployee.emit();
    }

    getNewEmployees() {
        this.onGetNewEmployees.emit(this.employeeToAdd);
    }

    confirmAddEmployee() {
        this.onConfirmAddEmployee.emit(this.employeeToAdd);
    }

    highlightEmployee(value: number, employee?: EmployeeModel) {
        this.onHighlightEmployee.emit({value, employee});
    }

    showOrHideToolTip() {
        this.onShowOrHideToolTip.emit();
    }

    openEmployeeWeeklyPlanning() {
        this.onOpenEmployeeWeeklyPlanning.emit();
    }

    closeEmployeeWeeklyPlanning() {
        this.onCloseEmployeeWeeklyPlanning.emit();
    }

}
