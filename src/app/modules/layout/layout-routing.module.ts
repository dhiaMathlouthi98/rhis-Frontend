import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './component/layout/layout.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'home', loadChildren: '../home/accueil/accueil.module#AccueilModule'},
      {path: 'admin', loadChildren: '../admin/admin.module#AdminModule'},
      {path: 'parc', loadChildren: '../parc/parc.module#ParcModule'},
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}
