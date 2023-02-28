import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GuiAlarme} from '../../../../../shared/model/gui/gui.alarme';
import {AlarmeService} from '../../../../home/accueil/service/alarme.service';

@Component({
  selector: 'rhis-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input()
  public openedAlertes = false;

  @Output()
  public closeAlertes: EventEmitter<any> = new EventEmitter();

  @Output()
  public displayAllAlertEvent: EventEmitter<any> = new EventEmitter();

  public listAlerte: any = [];

  @Input()
  set initListeAlerte(listeAlerte: any) {
    this.listAlerte = listeAlerte;
  }

  constructor(private alarmeService: AlarmeService) {

  }

  ngOnInit() {
  }

  public hideAlertes() {
    this.closeAlertes.emit();
  }

  public displayAllAlerte() {
    this.alarmeService.nextCodeAlarmeToBeDisplayed('');
    this.displayAllAlertEvent.emit();
  }

  public displayAllDetailedAlerte(alarme: GuiAlarme) {
    this.alarmeService.nextCodeAlarmeToBeDisplayed(alarme.alarmeCodeName);
    this.displayAllAlertEvent.emit(alarme);
  }
}
