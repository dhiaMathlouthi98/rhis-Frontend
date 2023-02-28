import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ParamGlobauxRoutingModule} from './param-globaux-routing.module';
import {ParametreGlobauxComponent} from './parametre-globaux/parametre-globaux.component';
import {SharedModule} from '../../../shared.module';
import {FileUploadModule, InputSwitchModule} from 'primeng/primeng';

@NgModule({
  declarations: [ParametreGlobauxComponent],
  imports: [
    ParamGlobauxRoutingModule,
    CommonModule,
    SharedModule,
    FileUploadModule,
    InputSwitchModule
  ],
  exports: [
    ParametreGlobauxComponent
  ]
})
export class ParamGlobauxModule {
}
