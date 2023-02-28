import {Component, ContentChild, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';
import {ViewModeDirective} from '../../../../../../shared/directive/view-mode.directive';
import {EditModeDirective} from '../../../../../../shared/directive/edit-mode.directive';
import {fromEvent, Subject} from 'rxjs';
import {filter, switchMapTo, take} from 'rxjs/operators';

@Component({
  selector: 'rhis-editable',
  template: `
    <ng-container *ngTemplateOutlet="currentView"></ng-container>
  `
})
export class EditableComponent implements OnInit {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;
  @Output() update = new EventEmitter();
  @Output() setDefault = new EventEmitter();

  editMode = new Subject();
  editMode$ = this.editMode.asObservable();

  mode: 'view' | 'edit' = 'view';


  constructor(private host: ElementRef) {
  }

  ngOnInit() {
    this.viewModeHandler();
    this.editModeHandler();
  }

  /**
   * Set the Mode to the view one
   */
  public toViewMode() {
    this.mode = 'view';
  }

  /**
   * Send input value to be update and turn to view mode
   */
  public setValue() {
    this.update.next();
    this.toViewMode();
  }

  /**
   * get host DOM element of editable directive
   */
  private get element() {
    return this.host.nativeElement;
  }

  /**
   * Turn the mode to edit one when intercepting click event
   */
  private viewModeHandler() {
    fromEvent(this.element, 'click').pipe().subscribe(() => {
      this.mode = 'edit';
      this.editMode.next(true);
    });
  }

  /**
   * Turn the mode to view one when we click outside the host DOM element
   */
  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({target}) => this.element.contains(target) === false),
      take(1)
    );

    this.editMode$.pipe(
      switchMapTo(clickOutside$),
    ).subscribe(event => {
      this.setDefault.emit();
      this.toViewMode();
    });
  }

  /**
   * Get the current mode (view | edit)
   */
  public get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }
}
