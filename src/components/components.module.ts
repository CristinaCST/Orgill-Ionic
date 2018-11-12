import {NgModule} from '@angular/core';
import {AppMenuComponent} from './app-menu/app-menu';
import {IonicModule, IonicPageModule} from "ionic-angular";
import {PopoverComponent} from "./popover/popover";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {createTranslateLoader} from "../app/app.module";
import {NavbarComponent} from "./navbar/navbar";
import {CustomShoppingListMenuComponent} from "./custom-shopping-list-menu/custom-shopping-list-menu";
import {ProductComponent} from "./product/product";
import {ProductPricingComponent} from "./product-pricing/product-pricing";
import {ProductDetailsComponent} from "./product-details/product-details";
import {ProductQuantityComponent} from "./product-quantity/product-quantity";
import {ShoppingListProductComponent} from "./shopping-list-product/shopping-list-product";

let components = [AppMenuComponent,
  PopoverComponent,
  NavbarComponent,
  CustomShoppingListMenuComponent,
  ProductComponent,
  ProductPricingComponent,
  ProductDetailsComponent,
  ProductQuantityComponent,
  ShoppingListProductComponent];

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

export class ComponentsModule {
}
