import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {MenubarModule} from 'primeng/menubar';
import {LayoutComponent} from './component/layout/layout.component';
import {HeaderComponent} from './component/header/header.component';
import {AlertComponent} from './component/header/alert/alert.component';
import {DisplayAllAlerteComponent} from './component/header/alert/display-all-alerte/display-all-alerte.component';
import {ContentComponent} from './component/content/content.component';
import {MenuComponent} from './component/menu/menu.component';
import {ProfilDetailsComponent} from './component/header/profil-details/profil-details.component';
import {FieldsetModule} from 'primeng/fieldset';
import {RestaurantsByUserComponent} from './component/header/listRestaurant/componenet/restaurants-by-user/restaurants-by-user.component';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    AlertComponent,
    MenuComponent,
    DisplayAllAlerteComponent,
    ContentComponent,
    ProfilDetailsComponent,
    RestaurantsByUserComponent
  ],
  imports: [
    SharedModule,
    LayoutRoutingModule,
    MenubarModule,
    FieldsetModule
  ],
  exports: [
    HeaderComponent,
    MenuComponent
  ]
})
export class LayoutModule {
}
