import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[rhisResize]'
})
export class ResizeDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2) { }

  @HostListener('window:resize')
  public onResize() {
    this.resize();
  }

  private resize() {
    if (document.getElementById('menu').offsetWidth > 100) {
      window.innerWidth < 1371 ?
        this.renderer.addClass(this.el.nativeElement, 'responsive') : this.renderer.removeClass(this.el.nativeElement, 'responsive');
    } else {
      window.innerWidth < 1150 ?
        this.renderer.addClass(this.el.nativeElement, 'responsive') : this.renderer.removeClass(this.el.nativeElement, 'responsive');
    }
  }
}
