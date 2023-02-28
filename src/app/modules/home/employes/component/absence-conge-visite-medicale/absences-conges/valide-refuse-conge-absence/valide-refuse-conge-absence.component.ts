import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {StatusDemandeCongeEnumeration} from '../../../../../../../shared/model/enumeration/status.demande.conge.enumeration';
import {AbsenceCongeModel} from '../../../../../../../shared/model/absence.conge.model';

@Component({
  selector: 'rhis-valide-refus-conge-absence',
  templateUrl: './valide-refuse-conge-absence.component.html',
  styleUrls: ['./valide-refuse-conge-absence.component.scss']

})
export class ValideRefuseCongeAbsenceComponent implements OnInit, OnChanges {
  @Output()
  public closeEvent = new EventEmitter();
  @Output()
  public valideOrRefuseAbsenceEvent = new EventEmitter();
  @Input()
  public absence = {} as AbsenceCongeModel;
  public statusCongeNonValide: StatusDemandeCongeEnumeration = StatusDemandeCongeEnumeration.NON_VALIDE;
  public statusCongeValide: StatusDemandeCongeEnumeration = StatusDemandeCongeEnumeration.VALIDE;

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.absence) {
      this.absence = changes.absence.currentValue;
    }
  }

  public close() {
    this.closeEvent.emit();

  }

  /**
   * validate conge and absence
   */
  public validateAbsence() {
    this.absence.status = this.statusCongeValide;
    this.valideOrRefuseAbsenceEvent.emit(this.absence);
  }

  /**
   *refuse conge and absence
   */
  public refuseAbsence() {
    this.absence.status = this.statusCongeNonValide;
    this.valideOrRefuseAbsenceEvent.emit(this.absence);
  }


}
