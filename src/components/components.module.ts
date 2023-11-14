import { NgModule } from '@angular/core';
import { AppMenuComponent } from './app-menu/app-menu';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { PopoverComponent } from './popover/popover';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../app/app.module';

// Pipes
import { PipesModule } from '../pipes/pipes.module';

// Components
import { NavbarComponent } from './navbar/navbar';
import { CustomShoppingListMenuComponent } from './custom-shopping-list-menu/custom-shopping-list-menu';
import { ProductComponent } from './product/product';
import { ProductPricingComponent } from './product-pricing/product-pricing';
import { ProductDetailsComponent } from './product-details/product-details';
import { ProductQuantityComponent } from './product-quantity/product-quantity';
import { ShoppingListProductComponent } from './shopping-list-product/shopping-list-product';
import { SearchBarComponent } from './searchBar/searchBar';
import { OrderItemComponent } from './order-item/order-item';
import { HotDealProductComponent } from './hot-deal-product/hot-deal-product';
import { PurchaseItemComponent } from './purchased-item/purchased-item';
import { HotDealComponent } from './hot-deal/hot-deal';
import { MoreOptionsComponent } from './more-options/more-options';
import { VendorMenuComponent } from './vendor-menu/vendor-menu';
import { CardComponent } from './ds-card/card';
import { CheckboxCardComponent } from './ds-checkbox-card/checkbox-card';
import { CheckoutOverlayComponent } from './ds-checkout-overlay/checkout-overlay';
import { VendorHeaderComponent } from './vendor-header/vendor-header';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header';
import { DashboardChartComponent } from './dashboard-chart/dashboard-chart';
import { DashboardTableComponent } from './dashboard-table/dashboard-table';
import { DashboardTrafficStatisticsComponent } from './dashboard-traffic-statistics/dashboard-traffic-statistics';
import { DashboardCalendarComponent } from './dashboard-calendar/dashboard-calendar';
import { DashboardSelectComponent } from './dashboard-select/dashboard-select';
import { DashboardStopsSelectComponent } from './dashboard-stops-select/dashboard-stops-select';
import { ProductPastPurchases } from './product-past-purchases/product-past-purchases';
import { TransportBugReport } from './transport-bug-report/transport-bug-report';

const components: any[] = [
  AppMenuComponent,
  PopoverComponent,
  NavbarComponent,
  SearchBarComponent,
  CustomShoppingListMenuComponent,
  ProductComponent,
  ProductPricingComponent,
  ProductDetailsComponent,
  ProductQuantityComponent,
  ShoppingListProductComponent,
  OrderItemComponent,
  HotDealProductComponent,
  PurchaseItemComponent,
  HotDealComponent,
  MoreOptionsComponent,
  VendorMenuComponent,
  CardComponent,
  CheckboxCardComponent,
  CheckoutOverlayComponent,
  VendorHeaderComponent,
  DashboardHeaderComponent,
  DashboardChartComponent,
  DashboardTableComponent,
  DashboardTrafficStatisticsComponent,
  DashboardCalendarComponent,
  DashboardSelectComponent,
  DashboardStopsSelectComponent,
  ProductPastPurchases,
  TransportBugReport
];

@NgModule({
  declarations: components,
  imports: [
    IonicModule,
    IonicPageModule.forChild(components),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),

    PipesModule
  ],
  exports: components
})
export class ComponentsModule {} //tslint:disable-line
