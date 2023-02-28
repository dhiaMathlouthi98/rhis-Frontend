import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoiPaysComponent} from './component/loi-pays/loi-pays.component';
import {PeriodeManagerComponent} from './component/periode-manager/periode-manager.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: 'loi-restaurant',
    loadChildren: '../params/loi-restaurant/loi-restaurant.module#LoiRestaurantModule',
  },
  {
    path: 'loi-pays',
    component: LoiPaysComponent,
    canActivate: [AuthGuard], data: {name: 'LoiPaysComponent'}
  },
  {
    path: 'periode-manager',
    component: PeriodeManagerComponent,
    canActivate: [AuthGuard], data: {name: 'PeriodeManagerComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule {
}
