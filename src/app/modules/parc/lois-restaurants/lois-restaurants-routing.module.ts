import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoisComponent} from './component/lois/lois.component';
import {AuthGuard} from '../../../authentication/guards/auth.guard';

const routes: Routes = [
    {path: '', component: LoisComponent, canActivate: [AuthGuard], data: {name: 'AffichageLoiRestaurantComponent'}}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoisRestaurantsRoutingModule {
}
