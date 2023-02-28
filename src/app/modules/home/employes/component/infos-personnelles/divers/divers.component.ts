import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AbstractValueAccessor, MakeProvider} from '../../../../../../shared/class/abstract-value.accessor';

@Component({
  selector: 'rhis-divers',
  templateUrl: './divers.component.html',
  styleUrls: ['./divers.component.scss'],
  providers: [...MakeProvider(DiversComponent)]
})
export class DiversComponent extends AbstractValueAccessor implements OnInit, OnChanges {
  @Input() listMoyenTransport;

  ngOnInit() {
    this.formGroup = new FormGroup(
      {
        moyenTransport: new FormControl('')
      });
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.listMoyenTransport) {
      this.listMoyenTransport = changes.listMoyenTransport.currentValue;
    }
  }
}
