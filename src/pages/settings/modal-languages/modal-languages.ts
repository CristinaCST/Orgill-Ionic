import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { TranslateWrapperService } from '../../../services/translate/translate';
import {Storage} from "@ionic/storage";
import {LocalStorageHelper} from "../../../helpers/local-storage";

@IonicPage()
@Component({
  selector: 'page-modal-languages',
  templateUrl: 'modal-languages.html'
})
export class ModalLanguagesPage {
  constructor(
    public translate: TranslateService,
    public view: ViewController,
    public translateWrapper: TranslateWrapperService,

  ) {
    //const browserLanguage: string = localStorage.getItem('language') || translate.getBrowserLang();
    const browserLanguage: string = LocalStorageHelper.getFromLocalStorage('language') || translate.getBrowserLang();
    translate.setDefaultLang(browserLanguage);
  }

  public async switchLanguage(language: string): Promise<void> {
    this.translate.use(language);
    this.translateWrapper.shouldReloadPrograms = true;
    //localStorage.setItem('language', language);
    LocalStorageHelper.saveToLocalStorage('language', language);
  }

  public ionViewDidLoad(): void {}

  public closeModal(): void {
    this.view.dismiss();
  }
}
