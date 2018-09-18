import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {TranslateService} from '@ngx-translate/core';
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import * as Constants from '../util/constants';
import {DateTime} from "../providers/datetime/DateTime";
import {DatabaseProvider} from "../providers/database/database";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Login;
  pages: Array<{ title: string, component: any }>;
  static databaseProvider: DatabaseProvider;


  constructor(public platform: Platform,
              public statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService, public databaseProvider: DatabaseProvider) {

    MyApp.databaseProvider = this.databaseProvider;
    this.setAppLanguage();
    this.initializeApp();

    this.pages = [
      {title: 'Home', component: HomePage},
      {title: 'Catalog', component: Catalog},
      {title: "Login", component: Login}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      MyApp.databaseProvider.getDatabaseState()
        .subscribe(isDatabaseOpen => {
          if (isDatabaseOpen) {
            this.checkSession();
          }
        });

    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }


  private setAppLanguage() {
    let language = navigator.language;
    if (language.includes("fr"))
      this.translate.setDefaultLang("fr");
    else this.translate.setDefaultLang("en");
  }

  private checkSession() {
    if (this.isValidSession() === true) {
      this.rootPage = Catalog;
    } else {
      this.rootPage = Login;
    }
  }

  private isValidSession(): boolean {

    if (LocalStorageHelper.hasKey(Constants.USER) === false) {
      return false;
    }
    const now = DateTime.getCurrentDateTime();
    const receivedTimestamp = (JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER)).time_stamp);
    const sessionTimestampWith4Days = DateTime.getTimeAfter4Days(receivedTimestamp);

    return sessionTimestampWith4Days.isSameOrAfter(now);
  }

}
