import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { Badge } from '@ionic-native/badge';
import { Geolocation } from '@ionic-native/geolocation';
import { Page } from 'ionic-angular/navigation/nav-util';

// Modules
import { ComponentsModule } from '../components/components.module';

// Providers
import { ApiService } from '../services/api/api';
import { CatalogsProvider } from '../providers/catalogs/catalogs';
import { TranslateWrapperService } from '../services/translate/translate';
import { PopoversService } from '../services/popovers/popovers';
import { ShoppingListsProvider } from '../providers/shopping-lists/shopping-lists';
import { ProgramProvider } from '../providers/program/program';
import { AuthService } from '../services/auth/auth';
import { ProductProvider } from '../providers/product/product';
import { UserInfoService } from '../services/user-info/user-info';
import { PurchasesProvider } from '../providers/purchases/purchases';
import { ProductImageProvider } from '../providers/product-image/product-image';

// Helpers
import { CSSInjector } from '../helpers/css-injector';

// Interceptors
import { ErrorInterceptor } from '../interceptors/error-interceptor';

// Services
import { NetworkService } from '../services/network/network';
import { OneSignalService } from '../services/onesignal/onesignal';
import { HotDealsService } from '../services/hotdeals/hotdeals';
import { NavigatorService } from '../services/navigator/navigator';
import { LoadingService } from '../services/loading/loading';
import { ScannerService } from '../services/scanner/scanner';
import { PricingService } from '../services/pricing/pricing';
import { SearchService } from '../services/search/search';
import { ReloadService } from '../services/reload/reload';
import { ErrorScheduler } from '../services/error-scheduler/error-scheduler';

// Pages
import { MyApp } from './app.component';
import { Catalog } from '../pages/catalog/catalog';
import { Login } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { ProductsPage } from '../pages/products/products';
import { ProductPage } from '../pages/product/product';
import { ProductDescriptionPage } from '../pages/product-description/product-description';
import { AddToShoppingListPage } from '../pages/add-to-shopping-list/add-to-shopping-list';
import { ScannerPage } from '../pages/scanner/scanner';
import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { CustomerLocationPage } from '../pages/customer-location/customer-location';
import { OrderReviewPage } from '../pages/order-review/order-review';
import { OrderConfirmationPage } from '../pages/order-confirmation/order-confirmation';
import { ProductsSearchPage } from '../pages/products-search/products-search';
import { PurchaseDetailsPage } from '../pages/purchase-details/purchase-details';
import { PurchasesPage } from '../pages/purchases/purchases';
import { HotDealsPage } from '../pages/hot-deals/hot-deals';
import { SecureActionsService } from '../services/secure-actions/secure-actions';

const pages: Page[] = [MyApp,
               Catalog,
               Login,
               AboutPage,
               SettingsPage,
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
               PurchaseDetailsPage,
               HotDealsPage];


// Error Handlers
import { CustomErrorHandler } from '../services/error-handler/error-handler';

@NgModule({
  declarations: pages,
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      mode: 'md', scrollPadding: false,
      scrollAssist: false,
      autoFocusAssist: false,
      statusbarPadding: false
    }),
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
    Network,
    AuthService,
    ApiService,
    LoadingService,
    TranslateWrapperService,
    PopoversService,
    CatalogsProvider,
    ProgramProvider,
    ShoppingListsProvider,
    BarcodeScanner,
    ProductProvider,
    UserInfoService,
    PurchasesProvider,
    NetworkService,
    OneSignalService,
    OneSignal,
    Badge,
    HotDealsService,
    NavigatorService,
    ScannerService,
    PricingService,
    SearchService,
    ReloadService,
    ErrorScheduler,
    Geolocation,
    CSSInjector,
    ProductImageProvider,
    SecureActionsService,
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})

export class AppModule {}

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
