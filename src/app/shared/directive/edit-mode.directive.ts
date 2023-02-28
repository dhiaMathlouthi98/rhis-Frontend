import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[rhisEditMode]'
})
export class EditModeDirective {
  constructor(public tpl: TemplateRef<any>) { }
}
