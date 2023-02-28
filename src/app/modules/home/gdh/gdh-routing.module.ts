import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../../authentication/guards/auth.guard';
import {GdhComponent} from './gdh.component';

const routes: Routes = [
  {path: '', component: GdhComponent, canActivate: [AuthGuard], data: {name: 'GdhComponent'}}];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class GdhRoutingModule {
}
