import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[rhisViewMode]'
})
export class ViewModeDirective {

  constructor(public tpl: TemplateRef<any>) {
  }

}
