import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AbstractValueAccessor, MakeProvider} from '../../../../../../shared/class/abstract-value.accessor';

@Component({
  selector: 'rhis-infos-bancaires',
  templateUrl: './infos-bancaires.component.html',
  styleUrls: ['./infos-bancaires.component.scss'],
  providers: [...MakeProvider(InfosBancairesComponent)]
})
export class InfosBancairesComponent extends AbstractValueAccessor implements OnInit, OnChanges {
  @Input() unicite;

  ngOnInit() {
    this.formGroup = new FormGroup(
      {
        iban: new FormControl(''),
        bic: new FormControl('')
      });
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unicite) {
      this.unicite = changes.unicite.currentValue;
    }
  }
}
