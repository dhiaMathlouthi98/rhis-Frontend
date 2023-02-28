import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {EmployeeDisponibiliteConge} from '../../../../../../shared/model/employee-disponibilite-conge';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {OverlayPanel} from 'primeng/primeng';

@Component({
  selector: 'rhis-actions-employe',
  templateUrl: './actions-employe.component.html',
  styleUrls: ['./actions-employe.component.scss']
})
export class ActionsEmployeComponent implements OnInit {
  private _disponibilites: EmployeeDisponibiliteConge;
  public showHide = false;
  @ViewChild(OverlayPanel) overlayPanel: OverlayPanel;
  private target;
  @Input()
  public set activated(value) {
    this.isActive = value;
  }

  @Input() nom: string;
  @Input() prenom: string;
  @Input() uuidEmployee: string;
  @Input() index: number;
  @Input() totalElement: number;

  @Input()
  public set disponibilites(dispos) {
    if (dispos) {
      this._disponibilites = dispos;
      setTimeout(_ => this.target ? this.overlayPanel.show(this.target) : null, 200);
    }
  }

  @Output() setStatut = new EventEmitter();
  @Output() getDisponibilites = new EventEmitter();

  public isActive: boolean;
  private ecran = 'ELE';
  constructor(private domControlService: DomControlService) {
  }

  ngOnInit() {
  }

  public switchState() {
    this.setStatut.emit(!this.isActive);
  }

  public showDisponibilites($event) {
    this.getDisponibilites.emit();
    this.target = event;
    this.showHide = !this.showHide;
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }
}
