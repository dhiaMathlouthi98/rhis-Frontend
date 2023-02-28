import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RapportRhRoutingModule} from './rapport-rh-routing.module';
import {RapportComponent} from './rapport/rapport.component';
import {SharedModule} from '../../../shared.module';
import {FileUploadModule, InputSwitchModule, ScrollPanelModule} from 'primeng/primeng';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxPrintModule} from 'ngx-print';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {RadioButtonModule} from 'primeng/radiobutton';

@NgModule({
  declarations: [RapportComponent],
  imports: [
    CommonModule,
    RapportRhRoutingModule,
    FileUploadModule,
    InputSwitchModule,
    SharedModule,
    PdfViewerModule,
    NgxPrintModule,
    OverlayPanelModule,
    FileUploadModule,
    RadioButtonModule,
    ScrollPanelModule
  ],
  exports: [RapportComponent]
})
export class RapportRhModule {
}
