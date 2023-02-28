import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SharedModule} from './shared/shared.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ConfirmationService, MessageService} from 'primeng/api';
import {LoginComponent} from './authentication/login/login.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DatePipe} from '@angular/common';
import {AccessDeniedComponent} from './authentication/access-denied/access-denied.component';
import {TokenInterceptorService} from './shared/service/token-interceptor.service';
import {ConfigAssetLoaderService} from './shared/service/config-asset-loader.service';
import {LayoutModule} from './modules/layout/layout.module';
import {TableModule} from 'primeng/table';
import {CreatePasswordComponent} from './authentication/create-password/create-password.component';
import { LinkExpiredComponent } from './authentication/link-expired/link-expired.component';



export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AccessDeniedComponent,
    CreatePasswordComponent,
    LinkExpiredComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    TableModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    DragDropModule,
    LayoutModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigAssetLoaderService) => () => configService.loadConfigurations(),
      deps: [ConfigAssetLoaderService],
      multi: true
    },
    MessageService,
    ConfirmationService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
