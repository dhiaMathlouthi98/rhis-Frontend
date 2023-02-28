import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'rhis-indicateur-cout-employe',
  templateUrl: './indicateur-cout-employe.component.html',
  styleUrls: ['./indicateur-cout-employe.component.scss']
})
export class IndicateurCoutEmployeComponent implements OnInit {
  @Input() colorConfig;
  @Input() heuresSuppComp;
  @Input() loading;
  @Input() heuresSupp;
  constructor() { }
  ngOnInit() {
  }

  getFormattedNbOfHours(nbMinutes: number): string {
    const hours = Math.floor(nbMinutes / 60);
    let minutes = Math.floor(nbMinutes % 60).toString();
    if (minutes.length === 1) {
      minutes = minutes.concat('0');
    }
    return hours + 'h' + minutes;
  }
}
