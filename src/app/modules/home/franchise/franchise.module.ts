import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListFranchiseComponent} from './component/list-franchise/list-franchise.component';
import {FranchiseRoutingModule} from './franchise-routing.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {InputSwitchModule} from 'primeng/primeng';
import {ActionsFranchiseComponent} from './component/list-franchise/actions-franchise/actions-franchise.component';
import {ListRestaurantsFranchiseComponent} from './component/list-franchise/list-restaurants-franchise/list-restaurants-franchise.component';
import {AddFranchiseComponent} from './component/list-franchise/add-franchise/add-franchise.component';


@NgModule({
  declarations: [
    ListFranchiseComponent,
    ActionsFranchiseComponent,
    ListRestaurantsFranchiseComponent,
    AddFranchiseComponent
  ],
  imports: [
    CommonModule,
    FranchiseRoutingModule,
    SharedModule,
    InputSwitchModule
  ]
})
export class FranchiseModule {
}
