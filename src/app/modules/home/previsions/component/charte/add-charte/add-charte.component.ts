import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'rhis-add-charte',
  templateUrl: './add-charte.component.html',
  styleUrls: ['./add-charte.component.scss']
})
export class AddCharteComponent implements OnInit {

  public title = '';

  public charteExistante;

  public libelleCharte = '';

  @Output()
  public addNewCharteEvent = new EventEmitter();

  @Input()
  set initTitle(title: string) {
    this.title = title;
  }

  @Input()
  set initExistanteCharte(charteExistante: boolean) {
    this.charteExistante = charteExistante;
  }

  constructor() {
  }

  ngOnInit() {
    this.libelleCharte = '';
    this.charteExistante = false;
  }

  public addNewCharte() {
    if (this.libelleCharte.trim().length !== 0) {
      this.addNewCharteEvent.emit(this.libelleCharte.trim());
    }
  }

}
