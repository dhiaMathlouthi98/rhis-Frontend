import {Directive, HostListener} from '@angular/core';
import {EditableComponent} from '../component/config-list/editable/editable.component';

@Directive({
  selector: '[rhisEditableOnClick]'
})
export class EditableOnClickDirective {

  constructor(private editable: EditableComponent) {
  }

  /**
   * Turn to view mode when clicking the host element
   * @param event
   */
  @HostListener('click', ['$event'])
  onClick(event) {
    this.editable.toViewMode();
  }

}
