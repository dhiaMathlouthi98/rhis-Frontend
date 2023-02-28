import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {JourFeriesRoutingModule} from './jourFeries-routing.module';
import {ListJoursFeriesComponent} from './component/list-jours-feries.component';
import {SharedModule} from '../../../shared.module';

@NgModule({
  declarations: [ListJoursFeriesComponent],
  imports: [
    CommonModule,
    JourFeriesRoutingModule,
    SharedModule
  ],
  exports: [ListJoursFeriesComponent]
})
export class JourFeriesModule {
}
