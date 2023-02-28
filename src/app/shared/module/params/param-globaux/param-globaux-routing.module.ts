import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ParametreGlobauxComponent} from './parametre-globaux/parametre-globaux.component';
import {SavingDataGuard} from '../../../service/saving-data.guard';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'params',
    canDeactivate: [SavingDataGuard],
    canActivate: [AuthGuard],
    data: {name: 'ParametreGlobauxComponent'},
    component: ParametreGlobauxComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParamGlobauxRoutingModule {
}
