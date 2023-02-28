import {Directive, Host, HostListener, OnInit, Optional, Self} from '@angular/core';
import {Calendar} from 'primeng/calendar';
import {Subscription} from 'rxjs';
import * as moment from 'moment';

@Directive({
  selector: 'p-calendar [timeOnly]'
})
export class FormatTimeDirective implements OnInit {
  subscriptions: Subscription[];
  private val: String = '';
  private startPos: number;
  // Allow format time
  private regex: RegExp = new RegExp(/^\d{1,2}:?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home Delete left right
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];

  constructor(@Host() @Self() @Optional() private calendar: Calendar) {

    // Overwrite time formatter
    calendar.formatTime = (date: Date) => {
      const formattedTime = moment(date);
      // pour avoir toujours le bon format et ne pas avoir NaN dans le calendar si format invalid
      if (!formattedTime.isValid()) {
        this.calendar.value = new Date();
      }
      return formattedTime.format(`HH:mm`);
    };
  }

  ngOnInit() {
    // Subscribe input value change
    this.subscriptions = [
      // Calendar Input
      this.calendar.onSelect.subscribe(()  => this.calendar.updateModel(this.calendar.value)),
      // on close ou onClik out calendar
      this.calendar.onBlur.subscribe(() => {
        this.dateTransformer(this.calendar.inputfieldViewChild.nativeElement.value);
        this.calendar.onClose.emit();
      })
    ];
  }

  // transformer la date si valide en format hh:mm
  private dateTransformer(date: Date): void {
    if (date.toString() === '') {
      return;
    }
    this.calendar.value = new Date();
    const time = moment(date, 'hhmm');
    this.calendar.value.setTime(time);
    // Update input value
    this.calendar.updateModel(this.calendar.value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, home, Delete, left,  and right  keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const date: String = this.calendar.inputfieldViewChild.nativeElement.value.concat(event.key);
    if (date && !String(date).match(this.regex)) {
      event.preventDefault();
    }
  }

  // this to update field to 0 instead of an empty one
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const currentValue: string = this.calendar.inputfieldViewChild.nativeElement.value;
    if (currentValue === '') {
      this.calendar.inputfieldViewChild.nativeElement.value = '';
      this.calendar.inputfieldViewChild.nativeElement.dispatchEvent(new Event('input'));
    }
    if (this.val !== '') {
      const date: String = this.calendar.inputfieldViewChild.nativeElement.value.slice(0, this.startPos) + event.key + this.calendar.inputfieldViewChild.nativeElement.value.slice(this.startPos + this.val.length);
      if (date && !String(date).match(this.regex)) {
        event.preventDefault();
      } else {
        this.calendar.inputfieldViewChild.nativeElement.value = date;
      }
      this.val = '';
    }
  }

  @HostListener('select', ['$event'])
  onfg(event: KeyboardEvent) {
    if (this.calendar.inputfieldViewChild.nativeElement.selectionStart !== undefined) {
      this.startPos = this.calendar.inputfieldViewChild.nativeElement.selectionStart;
      const endPos = this.calendar.inputfieldViewChild.nativeElement.selectionEnd;
      this.val = this.calendar.inputfieldViewChild.nativeElement.value.substring(this.startPos, endPos);
    }
  }
}
