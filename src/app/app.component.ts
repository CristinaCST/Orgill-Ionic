import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {TranslateService} from '@ngx-translate/core';
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import * as Constants from '../util/constants';
import {DateTime} from "../providers/datetime/DateTime";
import {DatabaseProvider} from "../providers/database/database";
import {LoadingProvider} from "../providers/loading/loading";
import {TranslateProvider} from "../providers/translate/translate";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = Login;
  isLoading = true;
  static databaseProvider: DatabaseProvider;

  constructor(public platform: Platform,
              public statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              public databaseProvider: DatabaseProvider,
              private loading: LoadingProvider,
              private translateProvider: TranslateProvider) {

    MyApp.databaseProvider = this.databaseProvider;
    this.setAppLanguage();
    this.initializeApp();
  }

  initializeApp() {
    this.isLoading = true;
    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_LOGIN));
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkSession();

      MyApp.databaseProvider.getDatabaseState()
        .subscribe(isDatabaseOpen => {
          if (isDatabaseOpen) {
            this.loading.hideLoading();
            this.isLoading = false;
          }
        });

    });
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
