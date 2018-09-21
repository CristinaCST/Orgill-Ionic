import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AuthServiceProvider} from "../providers/authservice/authservice";
import {ApiProvider} from "../providers/api-provider";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {LoadingProvider} from '../providers/loading/loading';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateProvider} from '../providers/translate/translate';
import {ComponentsModule} from "../components/components.module";
import {PopoversProvider} from "../providers/popovers/popovers";
import {AboutPage} from "../pages/about/about";
import {CatalogsProvider} from '../providers/catalogs/catalogs';
import {DatabaseProvider } from '../providers/database/database';
import {SQLitePorter} from "@ionic-native/sqlite-porter";
import {SQLite} from "@ionic-native/sqlite";
import {IonicStorageModule} from "@ionic/storage";
import {ProductsPage} from "../pages/products/products";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ScannerProvider } from '../providers/scanner/scanner';
import {ScannerPage} from "../pages/scanner/scanner";


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Catalog,
    Login,
    AboutPage,
    ProductsPage,
    ScannerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
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
    Login,
    AboutPage,
    ProductsPage, ScannerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    ApiProvider,
    LoadingProvider,
    TranslateProvider,
    PopoversProvider,
    CatalogsProvider,
    DatabaseProvider,
    SQLitePorter,
    SQLite,
    BarcodeScanner,
    ScannerProvider
  ]
})


export class AppModule {
}


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
