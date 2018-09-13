import {NgModule} from '@angular/core';
import {AppMenuComponent} from './app-menu/app-menu';
import {IonicModule, IonicPageModule} from "ionic-angular";
import {PopoverComponent} from "./popover/popover";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {createTranslateLoader} from "../app/app.module";

let components = [AppMenuComponent, PopoverComponent];

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
