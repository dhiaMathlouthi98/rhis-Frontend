import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListRapportsComponent} from './components/list-rapports/list-rapports.component';
import {AffichageRapportsComponent} from './components/affichage-rapports/affichage-rapports.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';
import { GestionParametreEnvoiComponent } from 'src/app/modules/parc/generation-rapport-parc/gestion-parametre-envoi/gestion-parametre-envoi.component';


const routes: Routes = [
  {
    path: '', component: ListRapportsComponent,
    canActivate: [AuthGuard], data: {name: 'ListRapportsComponent'}
  },
  {
    path: 'display/:codeName', component: AffichageRapportsComponent
  },
  {
    path: 'display-list/:codeName', component: AffichageRapportsComponent
  },
  {
    path: 'display/:uuidRapport/param-envoi', component: GestionParametreEnvoiComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class RapportsRoutingModule {
}
