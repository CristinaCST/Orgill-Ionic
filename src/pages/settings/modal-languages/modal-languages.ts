import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-modal-languages',
  templateUrl: 'modal-languages.html'
})
export class ModalLanguagesPage {

  constructor(
    public translate: TranslateService,
    public view: ViewController) {

      const browserLanguage: string = translate.getBrowserLang();
      translate.setDefaultLang(browserLanguage);
  }

  public switchLanguage(language: string): void {
    this.translate.use(language);
  }

  public ionViewDidLoad(): void {
  }

  public closeModal(): void {
    this.view.dismiss();
  }

}
