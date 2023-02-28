import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LoisRestaurantsRoutingModule} from './lois-restaurants-routing.module';
import {LoisComponent} from './component/lois/lois.component';
import {LoiRestaurantModule} from '../../../shared/module/params/loi-restaurant/loi-restaurant.module';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {OverlayPanelModule} from 'primeng/overlaypanel';

@NgModule({
    declarations: [LoisComponent],
    imports: [
        CommonModule,
        LoisRestaurantsRoutingModule,
        LoiRestaurantModule,
        TranslateModule,
        DropdownModule,
        FormsModule,
        SharedModule,
        OverlayPanelModule,
    ]
})
export class LoisRestaurantsModule {
}
