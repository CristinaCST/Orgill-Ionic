import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalLanguagesPage } from './modal-languages';

@NgModule({
  declarations: [
    ModalLanguagesPage
  ],
  imports: [
    IonicPageModule.forChild(ModalLanguagesPage)
  ]
})
export class ModalLanguagesPageModule {}
