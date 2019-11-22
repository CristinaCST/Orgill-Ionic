import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ModalLanguagesPage } from './modal-languages';

@NgModule({
  declarations: [
    ModalLanguagesPage
  ],
  imports: [
    IonicPageModule.forChild(ModalLanguagesPage), TranslateModule
  ]
})
export class ModalLanguagesPageModule {}
