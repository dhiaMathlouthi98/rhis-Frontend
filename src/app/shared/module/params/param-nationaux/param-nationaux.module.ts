import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametreNationauxComponent } from './components/parametre-restaurant/parametre-nationaux/parametre-nationaux.component';
import { ParametreRestaurantComponent } from './components/parametre-restaurant/parametre-restaurant.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ParamNationauxRoutingModule } from './param-nationaux-routing.module';

@NgModule({
  declarations: [ParametreNationauxComponent,
    ParametreRestaurantComponent],
  imports: [
    CommonModule,
    SharedModule,
    ParamNationauxRoutingModule
  ],
  exports:[
    ParametreNationauxComponent,
    ParametreRestaurantComponent
  ]
})
export class ParamNationauxModule { }
