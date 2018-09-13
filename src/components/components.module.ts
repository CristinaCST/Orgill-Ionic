import {NgModule} from '@angular/core';
import {PopoverComponent} from './popover/popover';
import {IonicModule, IonicPageModule} from 'ionic-angular';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {createTranslateLoader} from "../app/app.module";


const Components = [
  PopoverComponent
];

@NgModule({
  declarations: Components,
  imports: [IonicPageModule.forChild(Components), IonicModule, TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    }
  })],
  exports: Components
})

export class ComponentsModule {
}
