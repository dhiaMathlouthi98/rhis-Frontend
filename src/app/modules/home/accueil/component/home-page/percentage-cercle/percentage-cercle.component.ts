import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'rhis-percentage-cercle',
  templateUrl: './percentage-cercle.component.html',
  styleUrls: ['./percentage-cercle.component.scss']
})
export class PercentageCercleComponent implements OnInit {
  @Input() value: string;
  @Input() colors: string[];

  constructor() { }

  ngOnInit() {
  }


}
