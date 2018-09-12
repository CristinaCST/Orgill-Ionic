import {NgModule} from '@angular/core';
import {AppMenuComponent} from './app-menu/app-menu';
import {IonicModule, IonicPageModule} from "ionic-angular";

let components = [AppMenuComponent];

@NgModule({
  declarations: components,
  imports: [IonicModule, IonicPageModule.forChild(components)],
  exports: components
})

export class ComponentsModule {
}
