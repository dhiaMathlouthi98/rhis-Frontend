import {AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2} from '@angular/core';
import {GlobalSettingsService} from '../service/global-settings.service';

@Directive({
  selector: '[rhisWidthOnResize]'
})
export class WidthOnResizeDirective implements OnInit, AfterViewInit {
  @Output()
  public rhisWidthOnResize = new EventEmitter();
  public menuState = false;

  constructor(private globalSettingsService: GlobalSettingsService,
              private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    this.globalSettingsService.onToggleMenu().subscribe((menuState: boolean) => {
      this.menuState = menuState;
        this.sendWidth(600);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.sendWidth(0);
  }


  ngAfterViewInit() {
    this.sendWidth(200);
  }

  sendWidth(time: number): void {
    if (time) {
      setTimeout(() => {
        this.sendContainerWidth();
      }, time);
    } else {
      this.sendContainerWidth();
    }
  }

  private sendContainerWidth(): void {
    const sizeAsString = window.getComputedStyle(this.el.nativeElement).width;
    this.rhisWidthOnResize.emit(+sizeAsString.substr(0, sizeAsString.length - 2));
  }
}
