import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {Catalog} from '../pages/catalog/catalog';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AuthServiceProvider} from "../providers/authservice/authservice";
import {ApiProvider} from "../providers/api-provider";
import {LoginPage} from "../pages/login/login";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {LoadingProvider} from '../providers/loading/loading';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateProvider} from '../providers/translate/translate';
import {PopoversProvider} from '../providers/popovers/popovers';
import {ComponentsModule} from "../components/components.module";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Catalog,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ComponentsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Catalog,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PopoversProvider,
    AuthServiceProvider,
    ApiProvider,
    LoadingProvider,
    TranslateProvider
  ]
})


export class AppModule {
}


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
