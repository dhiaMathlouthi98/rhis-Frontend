import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Calendar} from 'primeng/primeng';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'rhis-calendar',
  templateUrl: './rhis-calendar.component.html',
  styleUrls: ['./rhis-calendar.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: RhisCalendarComponent,
    multi: true
  }]
})
export class RhisCalendarComponent implements ControlValueAccessor, OnChanges{
  public onChange: Function;
  public onTouched: () => void = () => {};
  @ViewChild('calendar') calendar: Calendar;
  @Input() model: Date;
  @Input() dataType: string;
  @Input() dateFormat: string;
  @Input() showIcon: boolean;
  @Input() minDate: string;
  @Input() maxDate: string;
  @Input() defaultDate: Date;
  @Input() placeholder: string;
  @Input() disabled: boolean;
  @Output() date: EventEmitter<string> = new EventEmitter<string>();
  @Input() appendTo;
  constructor() {
  }

  writeValue(date: string): void {
    this.model = date ? new Date(date): null;
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
     this.disabled = isDisabled;
  }

  public setDate(date: any) {
    this.onTouched();
    this.onChange(this.calendar.value);
    this.date.emit(this.calendar.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.minDate) {
      this.minDate = changes.minDate.currentValue;
    }
    if (changes.maxDate) {
      this.maxDate = changes.maxDate.currentValue;
    }
  }
}
