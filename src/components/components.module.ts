import { NgModule } from '@angular/core';
import { AppMenuComponent } from './app-menu/app-menu';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { PopoverComponent } from './popover/popover';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../app/app.module';

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

const components: any[] = [AppMenuComponent,
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
                    PurchaseItemComponent];

@NgModule({
  declarations: components,
  imports: [IonicModule, IonicPageModule.forChild(components), TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    }
  })],
  exports: components
})

export class ComponentsModule {} //tslint:disable-line
