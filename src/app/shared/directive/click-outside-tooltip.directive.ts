import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[rhisClickOutsideTooltip]'
})
export class ClickOutsideTooltipDirective {
  @Output()
  public rhisClickOutsideTooltip = new EventEmitter();
  private isClickedOutside = false;

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const event = this.elementRef.nativeElement.contains(targetElement);
    if (targetElement && !event) {
      if (this.isClickedOutside) {
        this.rhisClickOutsideTooltip.emit(event);
      } else {
        this.isClickedOutside = true;
      }
    } else {
      this.isClickedOutside = false;
    }
  }
}
