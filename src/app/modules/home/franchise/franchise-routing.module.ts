import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../../authentication/guards/auth.guard';
import { ListFranchiseComponent } from './component/list-franchise/list-franchise.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'space', canActivate: [AuthGuard]
  },
  {
    path: 'all',
    component: ListFranchiseComponent, canActivate: [AuthGuard], data: {name: 'ListFranchiseComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FranchiseRoutingModule {
}
