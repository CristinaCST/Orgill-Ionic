import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {SQLite} from "@ionic-native/sqlite";
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {OneSignal} from '@ionic-native/onesignal';
import {SQLitePorter} from "@ionic-native/sqlite-porter";
import {Network} from '@ionic-native/network';
import {IonicStorageModule} from "@ionic/storage";
import {Badge} from '@ionic-native/badge';

//Environments
import {environment} from '@app/env';

//Modules
import {ComponentsModule} from "../components/components.module";

//Providers
import { ApiProvider } from "../providers/api/api";
import { CatalogsProvider } from '../providers/catalogs/catalogs';
import { DatabaseProvider } from '../providers/database/database';
import { TranslateProvider } from '../providers/translate/translate';
import { PopoversProvider } from "../providers/popovers/popovers";
import { ShoppingListsProvider } from '../providers/shopping-lists/shopping-lists';
import { ProgramProvider } from '../providers/program/program';
import { AuthProvider } from "../providers/auth/auth";
import { ProductProvider } from "../providers/product/product";
import { UserInfoProvider } from '../providers/user-info/user-info';
import { PurchasesProvider } from '../providers/purchases/purchases';
import { SessionValidatorProvider } from '../providers/session/sessionValidator';


//Services
import { NetworkService } from '../services/network/network';
import { OneSignalService } from '../services/onesignal/onesignal';
import { FlashDealService } from '../services/flashdeal/flashdeal';
import { NavigatorService } from '../services/navigator/navigator';
import { LoadingService } from '../services/loading/loading';
import { ScannerService } from '../services/scanner/scanner';

//Pages
import {MyApp} from './app.component';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {AboutPage} from "../pages/about/about";
import {ProductsPage} from "../pages/products/products";
import {ProductPage} from "../pages/product/product";
import {ProductDescriptionPage} from "../pages/product-description/product-description";
import {AddToShoppingListPage} from "../pages/add-to-shopping-list/add-to-shopping-list";
import {ScannerPage} from "../pages/scanner/scanner";
import {ShoppingListPage} from "../pages/shopping-list/shopping-list";
import {CustomerLocationPage} from "../pages/customer-location/customer-location";
import {OrderReviewPage} from "../pages/order-review/order-review";
import {OrderConfirmationPage} from "../pages/order-confirmation/order-confirmation";
import {ProductsSearchPage} from "../pages/products-search/products-search";
import {PurchaseDetailsPage} from "../pages/purchase-details/purchase-details";
import {PurchasesPage} from "../pages/purchases/purchases";

let pages = [MyApp,
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
  ProductsSearchPage,
  ScannerPage,
  PurchasesPage,
  PurchaseDetailsPage];


//Error Handlers
import { CustomErrorHandlerService } from "../services/error-handler/CustomErrorHandler";





const errorHandler = environment.production ? CustomErrorHandlerService : IonicErrorHandler;

@NgModule({
  declarations: pages,
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    ComponentsModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })],
  bootstrap: [IonicApp],
  entryComponents: pages,
  providers: [
    StatusBar,
    SplashScreen,
    SQLitePorter,
    SQLite,
    Network,
    AuthProvider,
    ApiProvider,
    LoadingService,
    TranslateProvider,
    PopoversProvider,
    CatalogsProvider,
    DatabaseProvider,
    ProgramProvider,
    ShoppingListsProvider,
    BarcodeScanner,
    ProductProvider,
    UserInfoProvider,
    PurchasesProvider,
    NetworkService,
    SessionValidatorProvider,
    OneSignalService,
    OneSignal,
    Badge,
    FlashDealService,
    NavigatorService,
    ScannerService,
    {provide: ErrorHandler, useClass: CustomErrorHandlerService}
  ]
})

export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
