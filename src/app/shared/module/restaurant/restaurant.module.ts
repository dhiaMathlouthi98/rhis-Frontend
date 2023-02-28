import {NgModule} from '@angular/core';

import {RestaurantRoutingModule} from './restaurant-routing.module';
import {SharedModule} from '../../shared.module';
import {LoiPaysComponent} from './component/loi-pays/loi-pays.component';
import {PeriodeManagerComponent} from './component/periode-manager/periode-manager.component';
import {AddUpdatePeriodeManagerComponent} from './component/periode-manager/add-update-periode-manager/add-update-periode-manager.component';
import {ModificationLoiPaysComponent} from './component/loi-pays/modification-loi-pays/modification-loi-pays.component';

@NgModule({
  declarations: [LoiPaysComponent, PeriodeManagerComponent, AddUpdatePeriodeManagerComponent, ModificationLoiPaysComponent],
  imports: [
    SharedModule,
    RestaurantRoutingModule
  ]
})
export class RestaurantModule {
}
