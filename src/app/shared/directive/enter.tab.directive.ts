import {AfterViewInit, Directive, ElementRef, QueryList, Renderer2, ViewChildren} from '@angular/core';

@Directive({
  selector: '[rhisEnterTab]',
})
export class EnterTabDirective implements AfterViewInit {
  @ViewChildren('value') controls: QueryList<any>;

  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    console.log(this.controls);
    this.controls.changes.subscribe(controls => {
      this.createKeydownEnter(controls);
    });
    if (this.controls.length) {
      this.createKeydownEnter(this.controls);
    }
  }

  private createKeydownEnter(querycontrols) {
    querycontrols.forEach(c => {
      this.renderer.listen(c.nativeElement, 'keydown.enter', (event) => {
        if (this.controls.last !== c) {
          const controls = querycontrols.toArray();
          const index = controls.findIndex(d => d !== c);
          if (index >= 0) {
            const nextControl = controls.find((n, i) => n && !n.nativeElement.attributes.disabled && i > index);
            if (nextControl) {
              nextControl.nativeElement.focus();
              event.preventDefault();
            }
          }
        }
      });
    });

  }


}
