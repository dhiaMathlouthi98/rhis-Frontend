import {Component, ContentChild, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';
import {ViewModeDirective} from '../../../../../../../shared/directive/view-mode.directive';
import {EditModeDirective} from '../../../../../../../shared/directive/edit-mode.directive';
import {fromEvent, Subject} from 'rxjs';
import {filter, switchMapTo, take} from 'rxjs/operators';

@Component({
  selector: 'rhis-editable-decoupage-horaire',
  template: `
    <div class="hello" style="width: inherit">
      <ng-container *ngTemplateOutlet='currentView'></ng-container>
    </div>
  `
})
export class EditableDecoupageHoraireComponent implements OnInit {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;
  @Output() update = new EventEmitter();

  editMode = new Subject();
  editMode$ = this.editMode.asObservable();

  mode: 'view' | 'edit' = 'view';

  constructor(private host: ElementRef) {
  }

  ngOnInit() {
    this.viewModeHandler();
    this.editModeHandler();
  }

  toViewMode() {
    this.update.next();
    this.mode = 'view';
  }

  private get element() {
    return this.host.nativeElement;
  }

  private viewModeHandler() {
    fromEvent(this.element, 'click').pipe(
      // replace it with takewhile rxjs operator: the same job
      // untilDestroyed(this)
    ).subscribe(() => {
      this.mode = 'edit';
      this.editMode.next(true);
    });
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({target}) => this.element.contains(target) === false),
      take(1)
    );

    this.editMode$.pipe(
      switchMapTo(clickOutside$),
      // untilDestroyed(this)
    ).subscribe(event => this.toViewMode());
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

}

