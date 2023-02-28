import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WordEditorComponent} from './component/word-editor/word-editor.component';
import {EditDocSpaceComponent} from './component/edit-doc-space/edit-doc-space.component';
import {AddReportComponent} from './component/add-report/add-report.component';

const routes: Routes = [
  {
    path: '',
    component: EditDocSpaceComponent,
    children: [
      {
        path: 'employee/:employeeUuid/report/:reportUuid',
        component: WordEditorComponent,
      }, {
        path: 'update/:restaurantUuid/report/:reportUuid',
        component: WordEditorComponent
      }, {
        path: 'newReport/:restaurantUuid',
        component: WordEditorComponent,
      },
      {
        path: 'employee/:employeeUuid/new',
        component: WordEditorComponent,
      },
      {
        path: '',
        component: AddReportComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditDocRhRoutingModule {
}
