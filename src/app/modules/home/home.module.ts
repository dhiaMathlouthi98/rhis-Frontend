import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeRoutingModule} from './home-routing.module';
import {AccueilRoutingModule} from './accueil/accueil-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    AccueilRoutingModule,
  ]
})
export class HomeModule {
}
