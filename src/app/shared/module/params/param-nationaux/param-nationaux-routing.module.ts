import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { SavingDataGuard } from 'src/app/shared/service/saving-data.guard';
import { ParametreRestaurantComponent } from './components/parametre-restaurant/parametre-restaurant.component';

const routes: Routes = [
   {
    path: '', component: ParametreRestaurantComponent ,
    canDeactivate: [SavingDataGuard],
    data: {name: 'ParametreRestaurantComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParamNationauxRoutingModule {
}
