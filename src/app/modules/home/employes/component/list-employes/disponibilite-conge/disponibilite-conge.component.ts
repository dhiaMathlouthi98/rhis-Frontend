import {Component, Input, OnInit} from '@angular/core';
import {Disponibilite, EmployeeDisponibiliteConge} from '../../../../../../shared/model/employee-disponibilite-conge';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-disponibilite-conge',
  templateUrl: './disponibilite-conge.component.html',
  styleUrls: ['./disponibilite-conge.component.scss']
})
export class DisponibiliteCongeComponent implements OnInit {
  @Input() nom: string;
  @Input() prenom: string;
  @Input() uuidEmployee: string;

  @Input() set disponibilitesJournalieres(employeeDisponibiliteConge: EmployeeDisponibiliteConge) {
    this._employeeDisponibiliteConge = employeeDisponibiliteConge;
    if (employeeDisponibiliteConge) {
      this.disponibilitePaire = employeeDisponibiliteConge.disponibilites.filter(dispo => !dispo.odd);
      this.disponibiliteImpaire = employeeDisponibiliteConge.disponibilites.filter(dispo => dispo.odd);
    }
  }

  public disponibilitePaire: Disponibilite[] = [];
  public disponibiliteImpaire: Disponibilite[] = [];
  public _employeeDisponibiliteConge: EmployeeDisponibiliteConge;

  public paires: string;
  public impaires: string;

  constructor(public rhisRouter: RhisRoutingService,
              private rhisTranslateService: RhisTranslateService) {
  }

  ngOnInit(): void {
    this.paires = this.rhisTranslateService.translate('EMPLOYEE.PAIRES');
    this.impaires = this.rhisTranslateService.translate('EMPLOYEE.IMPAIRES');
  }
}
