import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[rhisRegexValidator]'
})
export class RegexValidatorDirective {
  // Allow decimal numbers
  private regex: RegExp;
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home Delete left right si on veut une valeur negative on ajoute -
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];

  @Input()
  public set regexValue(regexValue: string) {
    if (regexValue) {
      this.regex = new RegExp(regexValue);
    }
  }

  @Input()
  public set additionnalSpecialKeys(keys: string[]) {
    if (keys) {
      keys.forEach((key: string) => {
        this.specialKeys.push(key);
      });
    }
  }

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, home, Delete, left,  and right  keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  // this to update field to 0 instead of an empty one
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const current: string = this.el.nativeElement.value;
    if (current === '') {
      this.el.nativeElement.value = '';
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}
