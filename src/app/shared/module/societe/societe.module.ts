import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SocieteRoutingModule} from './societe-routing.module';
import {TypeRestaurantComponent} from './component/type-restaurant/type-restaurant.component';
import {AddRestaurantComponent} from './component/add-restaurant/add-restaurant.component';
import {FileUploadModule, InputSwitchModule} from 'primeng/primeng';
import {SharedModule} from '../../shared.module';
import {EspaceSocieteComponent} from './component/espace-societe/espace-societe.component';
import {AddSocieteComponent} from './component/add-societe/add-societe.component';
import {AddFormRestaurantComponent} from './component/add-form-restaurant/add-form-restaurant.component';
import {EditSocieteComponent} from './component/edit-societe/edit-societe.component';
import {AddFormSocieteComponent} from './component/add-form-societe/add-form-societe.component';
import {AddFormPrefectureComponent} from './component/add-form-prefecture/add-form-prefecture.component';
import {ListRestaurantsComponent} from './component/list-restaurants/list-restaurants.component';
import {ActionsRestaurantComponent} from './component/list-restaurants/actions-restaurant/actions-restaurant.component';
import {ListSocietesComponent} from './component/list-societes/list-societes.component';
import {ActionsSocieteComponent} from './component/list-societes/actions-societe/actions-societe.component';
import {ListRestaurantSocieteComponent} from './component/list-societes/list-restaurant-societe/list-restaurant-societe.component';
import {ListTypesRestaurantComponent} from './component/list-types-restaurant/list-types-restaurant.component';
import {ParamGlobauxModule} from '../params/param-globaux/param-globaux.module';

@NgModule({
  declarations: [
    TypeRestaurantComponent,
    AddRestaurantComponent,
    EspaceSocieteComponent,
    AddSocieteComponent,
    AddFormRestaurantComponent,
    EditSocieteComponent,
    AddFormSocieteComponent,
    AddFormPrefectureComponent,
    AddFormPrefectureComponent,
    ListRestaurantsComponent,
    ActionsRestaurantComponent,
    ListSocietesComponent,
    ActionsSocieteComponent,
    ListRestaurantSocieteComponent,
    ListTypesRestaurantComponent,
  ],
  imports: [
    CommonModule,
    SocieteRoutingModule,
    SharedModule,
    FileUploadModule,
    InputSwitchModule,
    ParamGlobauxModule
  ],
  exports: []
})
export class SocieteModule {
}
