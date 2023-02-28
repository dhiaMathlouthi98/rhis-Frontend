import {Directive, EventEmitter, HostBinding, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[rhisDragAndDrop]'
})
export class DragAndDropDirective {

  @Output()
  public fileUploaded = new EventEmitter<any>();
  @Output()
  public showExtraInfo = new EventEmitter<boolean>();
  @HostBinding('style.background-color') private background = '#f5fcff';
  @HostBinding('style.opacity') private opacity = '1';

  constructor() {
  }

  // Dragover listener
  @HostListener('dragover', ['$event'])
  onDragOver(evt): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#9ecbec';
    this.opacity = '0.8';
    this.showExtraInfo.emit(true);
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
    this.showExtraInfo.emit(false);
  }

  // Drop listener
  @HostListener('drop', ['$event'])
  public ondrop(evt): void {
    evt.preventDefault();
    evt.stopPropagation();
    const files: FileList = evt.dataTransfer.files;
    // Get just one file to upload
    const file = files.item(0);
    this.background = '#f5fcff';
    this.opacity = '1';
    this.fileUploaded.emit(file);
  }
}
