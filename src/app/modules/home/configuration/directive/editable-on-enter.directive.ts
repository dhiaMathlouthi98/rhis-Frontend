import {Directive, HostListener} from '@angular/core';
import {EditableComponent} from '../component/config-list/editable/editable.component';

@Directive({
  selector: '[rhisEditableOnEnter]'
})
export class EditableOnEnterDirective {
  constructor(private editable: EditableComponent) {
  }

  /**
   * set value to be updated on enter keyup
   */
  @HostListener('keyup.enter')
  onEnter() {
    this.editable.setValue();
  }
}
