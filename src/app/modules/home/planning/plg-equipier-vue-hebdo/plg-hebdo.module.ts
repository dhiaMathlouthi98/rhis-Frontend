import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '../../../../shared/shared.module';
import {InputSwitchModule} from 'primeng/primeng';
import {RapportsModule} from '../../../../shared/module/rapports/rapports.module';

@NgModule({
  declarations: [
    ],
  imports: [
    SharedModule,
    CommonModule,
    // ShiftImposeRoutingModule,
    InputSwitchModule,
    RapportsModule
  ]
})
export class PlgHebdoModuleModule { }
