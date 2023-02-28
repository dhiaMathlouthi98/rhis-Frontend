import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './authentication/login/login.component';
import {AccessDeniedComponent} from './authentication/access-denied/access-denied.component';
import {CreatePasswordComponent} from './authentication/create-password/create-password.component';
import {LinkExpiredComponent} from './authentication/link-expired/link-expired.component';


const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: '', loadChildren: './modules/layout/layout.module#LayoutModule'},
  {path: 'forbidden', component: AccessDeniedComponent},
  {path: 'linkExpired', component: LinkExpiredComponent},
  {path: 'reset/:id', component: CreatePasswordComponent},
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
