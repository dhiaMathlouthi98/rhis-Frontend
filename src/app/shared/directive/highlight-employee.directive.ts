import {Directive, ElementRef, EventEmitter, Input, NgZone, Output, Renderer2} from '@angular/core';
import {fromEvent} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

@Directive({
  selector: '[rhisEmployeHighlight]'
})
export class HighlightEmployeeDirective {
  /**
  * Element html
  */
  private el: ElementRef;
  /**
  * L'utilisateur a cliqué sur le nom d'un employé
  */
  public cliskIsInside = false;
  /**
    * index de la ligne de l'employé sur lequel on a cliqué
    */
  @Input() rowIndex: number;
  /**
  * id de la grille
  */
  @Input() idGrid: number;
  /**
    * index de l'employé sur lequel on a cliqué
    */
  @Output() highlitedEmployeeIndex: EventEmitter<number> = new EventEmitter();

  constructor(private _el: ElementRef,
              private renderer: Renderer2,
              private ngZone: NgZone) {
      this.el = _el;
      const target = this.el.nativeElement;
      const clickEl$ = fromEvent(target, 'click');
      const clickDoc$ = fromEvent(document, 'click');
      clickEl$.pipe(
          tap((event: any) => {
              this.cliskIsInside = true;
              this.clickInside();
          })
      ).subscribe();
      clickDoc$
          .pipe(filter(event => this.cliskIsInside && (!this._el.nativeElement.contains(event.target))))
          .pipe(
              tap((event: any) => {
                  this.cliskIsInside = false;
                  this.clickout();
              })
          ).subscribe();
  }

    /**
   * Fonction appelé quand l'utilisateur clique sur le nom d'un employé
   */
    private clickInside() {
        this.ngZone.runOutsideAngular(() => {
            this.renderer.addClass(this.el.nativeElement, 'employee-name');
            const row1 = document.getElementById('day-gridster' + this.idGrid)
                .getElementsByClassName('gridster-row')[this.rowIndex * 3] as HTMLElement;
            row1.style.border = '1px solid #07c';
            row1.style.borderBottom = '0';
            row1.style.outline = 'none';
            const row2 = document.getElementById('day-gridster' + this.idGrid)
                .getElementsByClassName('gridster-row')[this.rowIndex * 3 + 1] as HTMLElement;
            row2.style.border = '1px solid #07c';
            row2.style.borderTop = '0';
            row2.style.outline = 'none';
            this.highlitedEmployeeIndex.emit(this.rowIndex);
        });
    }
  /**
 * Fonction appelé quand l'utilisateur clique à l'extérieur du nom de l'employé
 */
  private clickout() {
      this.ngZone.runOutsideAngular(() => {
          this.renderer.removeClass(this.el.nativeElement, 'employee-name');
          const row1 = document.getElementById('day-gridster' + this.idGrid)
              .getElementsByClassName('gridster-row')[this.rowIndex * 3] as HTMLElement;
          row1.style.border = '0';
          const row2 = document.getElementById('day-gridster' + this.idGrid)
              .getElementsByClassName('gridster-row')[this.rowIndex * 3 + 1] as HTMLElement;
          row2.style.border = '0';
      });
  }
}
