import { Component, OnInit, Input } from '@angular/core';
import { GuiEmployeePayeView, GuiEmployeePeriodView } from 'src/app/shared/model/gui/gdh-period-model';
import { RhisRoutingService } from 'src/app/shared/service/rhis.routing.service';

@Component({
  selector: 'rhis-employee-info-popover',
  templateUrl: './employee-info-popover.component.html',
  styleUrls: ['./employee-info-popover.component.scss']
})
export class EmployeeInfoPopoverComponent implements OnInit {
  @Input() employee: GuiEmployeePayeView | GuiEmployeePeriodView;
  @Input() selectedEmployeeUuId: string;

  constructor(public rhisRouter: RhisRoutingService) {
   }

  ngOnInit() {
  }

}
