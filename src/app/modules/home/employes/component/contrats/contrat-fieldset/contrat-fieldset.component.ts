import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'rhis-contrat-fieldset',
  templateUrl: './contrat-fieldset.component.html',
  styleUrls: ['./contrat-fieldset.component.scss']
})
export class ContratFieldsetComponent implements OnInit, OnChanges {
  @Input()
  public sections: [{ sectionTitle: string, formControlName: string }];
  @Input()
  public title;
  @Input()
  public repartitionTime;
  @Input()repartitionTimeDefault;
  @Input() contratId;
  @Input() contratUpdateId;
  @Input() setValueContrat;
  @Output() fieldsetValue = new EventEmitter();
  public formGroup: FormGroup;
  @Input() isTotalHebdo = false;
  @Input()istotalHeuresEquals = true;
  @Input() ouvre;
  @Input() ouvrable;
  @Input()avenantId;
  @Input() avenantUpdateId;
  @Input() prefixId;
  public repartition = 0;
  constructor() {
  }

  public ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }
    if (changes.istotalHeuresEquals) {
      this.istotalHeuresEquals = changes.istotalHeuresEquals.currentValue;
    }
    if (changes.setValueContrat) {
      this.setValueContrat = changes.setValueContrat.currentValue;
    }
  }

}
