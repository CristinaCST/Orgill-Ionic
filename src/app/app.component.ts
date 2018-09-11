import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { Catalog } from '../pages/catalog/catalog';
import {LoginPage} from "../pages/login/login";
import { TranslateService } from '@ngx-translate/core';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private translate: TranslateService) {
    this.setAppLanguage();
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Catalog', component: Catalog },
      { title : "Login", component: LoginPage}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }


  private setAppLanguage(){
      let language = navigator.language;
      if(language.includes("fr"))
        this.translate.setDefaultLang("fr");
      else this.translate.setDefaultLang("en");
  }
}
