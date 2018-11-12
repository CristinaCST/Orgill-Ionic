import {NgModule} from '@angular/core';
import {KeyboardDirective} from './keyboard/keyboard';
import {IonicModule, IonicPageModule} from "ionic-angular";

let directives = [KeyboardDirective];

@NgModule({
  declarations: directives,
  imports: [IonicModule, IonicPageModule.forChild(directives)],
  exports: directives
})
export class DirectivesModule {
}
