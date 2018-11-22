import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {SQLite} from "@ionic-native/sqlite";
import {SQLitePorter} from "@ionic-native/sqlite-porter";

//Modules
import {ComponentsModule} from "../components/components.module";
import {DirectivesModule} from "../directives/directives.module";
import {IonicStorageModule} from "@ionic/storage";

//Providers
import {ApiProvider} from "../providers/api-provider";
import {CatalogsProvider} from '../providers/catalogs/catalogs';
import {DatabaseProvider} from '../providers/database/database';
import {TranslateProvider} from '../providers/translate/translate';
import {LoadingProvider} from '../providers/loading/loading';
import {PopoversProvider} from "../providers/popovers/popovers";
import {ShoppingListsProvider} from '../providers/shopping-lists/shopping-lists';
import {ProgramProvider} from '../providers/program/program';
import {AuthServiceProvider} from "../providers/authservice/authservice";

//Pages
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {AboutPage} from "../pages/about/about";
import {ProductsPage} from "../pages/products/products";
import {ProductPage} from "../pages/product/product";
import {ProductDescriptionPage} from "../pages/product-description/product-description";
import {AddToShoppingListPage} from "../pages/add-to-shopping-list/add-to-shopping-list";
import {ShoppingListPage} from "../pages/shopping-list/shopping-list";
import {UserInfoProvider} from '../providers/user-info/user-info';
import {CustomerLocationPage} from "../pages/customer-location/customer-location";
import {OrderReviewPage} from "../pages/order-review/order-review";
import {OrderConfirmationPage} from "../pages/order-confirmation/order-confirmation";
import {ProductsSearchPage} from "../pages/products-search/products-search";

let pages = [MyApp,
  HomePage,
  Catalog,
  Login,
  AboutPage,
  ProductsPage,
  ProductPage,
  ProductDescriptionPage,
  AddToShoppingListPage,
  ShoppingListPage,
  CustomerLocationPage,
  OrderReviewPage,
  OrderConfirmationPage,
  ProductsSearchPage];

@NgModule({
  declarations: pages,
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
    ComponentsModule,
    DirectivesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: pages,
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
    ProgramProvider,
    ShoppingListsProvider,
    UserInfoProvider
  ]
})


export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
