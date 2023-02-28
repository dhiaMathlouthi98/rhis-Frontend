import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProfilsRoutingModule} from './profils-routing.module';
import {AddProfilGlobalComponent} from './componenet/add-profil-global/add-profil-global.component';
import {DroitProfilGlobalComponent} from './componenet/droit-profil-global/droit-profil-global.component';
import {TabViewModule} from 'primeng/tabview';
import {PickListModule} from 'primeng/picklist';
import {AffectationFranchiseComponent} from './componenet/affectation-franchise/affectation-franchise.component';
import {FieldsetModule} from 'primeng/fieldset';
import {AffectationAdministrateurComponent} from './componenet/affectation-administrateur/affectation-administrateur.component';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ListProfilGlobalComponent} from './componenet/list-profil-global/list-profil-global.component';
import {ListSocieteProfilComponent} from './componenet/list-profil-global/list-societe-profil/list-societe-profil.component';
import {ListRestaurantProfilComponent} from './componenet/list-profil-global/list-restaurant-profil/list-restaurant-profil.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SharedModule} from '../../../shared/shared.module';
import {ListProfilMobileComponent} from './componenet/list-profil-mobile/list-profil-mobile.component';


@NgModule({
  declarations: [AddProfilGlobalComponent, DroitProfilGlobalComponent,
    AffectationFranchiseComponent, AffectationAdministrateurComponent, ListProfilGlobalComponent,
    ListSocieteProfilComponent, ListRestaurantProfilComponent, ListProfilMobileComponent],
  imports: [
    CommonModule,
    ProfilsRoutingModule,
    TabViewModule,
    PickListModule,
    FieldsetModule,
    ScrollPanelModule,
    OverlayPanelModule,
    SharedModule
  ]
})
export class ProfilsModule {
}
