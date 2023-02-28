import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../../../authentication/guards/auth.guard';
import {AffichageLoiRestaurantComponent} from './affichage-loi-restaurant/affichage-loi-restaurant.component';

const routes: Routes = [
    {
        path: '',
        component: AffichageLoiRestaurantComponent,
        canActivate: [AuthGuard], data: {name: 'AffichageLoiRestaurantComponent'}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoiRestaurantRoutingModule {
}
