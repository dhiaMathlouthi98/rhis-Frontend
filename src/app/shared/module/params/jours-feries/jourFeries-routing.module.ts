import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListJoursFeriesComponent} from './component/list-jours-feries.component';
import {SavingDataGuard} from '../../../service/saving-data.guard';

const routes: Routes = [
  {
    path: '',
    component: ListJoursFeriesComponent,
    canDeactivate: [SavingDataGuard],
    data: {name: 'ListJoursFeriesComponent'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourFeriesRoutingModule {

}
