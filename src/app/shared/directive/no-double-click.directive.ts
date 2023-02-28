import {Directive, HostListener} from '@angular/core';
import {Router} from '@angular/router';

@Directive({
  selector: 'button , [imgDbleClicked]'
})
export class NoDoubleClickDirective {

  clicked = false;
  timeout: number;

  constructor(private router: Router) {
    // if (this.router.url.includes('planning-equipier')) {
    //   this.timeout = 100;
    // } else {
      this.timeout = 1500;
    // }

  }

  @HostListener('click', ['$event'])
  onClick(event: any) {
    if (!this.clicked) {
      this.clicked = true;
      setTimeout(() => this.clicked = false, this.timeout);
    } else {
      event.stopPropagation();
      event.preventDefault();
      event.cancelBubble = true;
      event.stopImmediatePropagation();
      event.emit();
    }
  }
}
