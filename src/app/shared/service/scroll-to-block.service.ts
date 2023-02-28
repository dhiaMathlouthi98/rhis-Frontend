import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollToBlockService {

  constructor() {
  }

  /**
   * scroll to the target
   * @param : el
   */
  public scrollToError(el: Element): void {
    if (el) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  /**
   * scroll to selected element
   * @param : elementSelectionne
   */
  public scrollToElementHasError(elementSelectionne: string) {
    setTimeout(() => {
      const errorElementsUnicite = document.querySelectorAll(
        elementSelectionne);
      [].forEach.call(errorElementsUnicite, (node) => {
        this.scrollToError(errorElementsUnicite[0]);
      });
    }, 200);
  }

  /**
   * scroll to the third parent selected element
   * @param : elementSelectionne
   */
  public scrollToElementHasErrorThirdParent(elementSelectionne: string) {
    setTimeout(() => {
      const errorElementsUnicite = document.querySelectorAll(
        elementSelectionne);
      [].forEach.call(errorElementsUnicite, (node) => {
        this.scrollToError(errorElementsUnicite[0].parentElement.parentElement.parentElement);
      });
    }, 200);
  }

  /**
   * scroll to the third parent selected element
   * @param : elementSelectionne
   */
  public scrollToElementHasErrorOneParent(elementSelectionne: string) {
    setTimeout(() => {
      const errorElementsUnicite = document.querySelectorAll(
        elementSelectionne);
      [].forEach.call(errorElementsUnicite, (node) => {
        this.scrollToError(errorElementsUnicite[0].parentElement);
      });
    }, 200);
  }

}
