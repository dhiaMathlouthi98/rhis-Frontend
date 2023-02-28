import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditDocRhRoutingModule} from './edit-doc-rh-routing.module';
import {DocumentEditorContainerModule} from '@syncfusion/ej2-angular-documenteditor';
import {TreeViewModule} from '@syncfusion/ej2-angular-navigations';
import {WordEditorComponent} from './component/word-editor/word-editor.component';
import {DragAndDropDirective} from './directive/drag-and-drop.directive';
import {AddReportComponent} from './component/add-report/add-report.component';
import {MaskedTextBoxModule} from '@syncfusion/ej2-angular-inputs';
import {EditDocSpaceComponent} from './component/edit-doc-space/edit-doc-space.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SharedModule} from '../../../shared.module';

@NgModule({
  declarations: [
    WordEditorComponent,
    DragAndDropDirective,
    AddReportComponent,
    EditDocSpaceComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    EditDocRhRoutingModule,
    DocumentEditorContainerModule,
    TreeViewModule,
    MaskedTextBoxModule,
    OverlayPanelModule
  ]
})
export class EditDocRhModule {
}
