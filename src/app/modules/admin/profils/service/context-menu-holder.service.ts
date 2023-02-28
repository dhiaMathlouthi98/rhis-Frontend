import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuHolderService {

  constructor() { }
  contextMenu: any; // TODO set a type (HTMLElement?)

  getContextMenu() {
    return this.contextMenu;
  }

  setContextMenu(contextMenu: any) {
    this.contextMenu = contextMenu;
  }
}
