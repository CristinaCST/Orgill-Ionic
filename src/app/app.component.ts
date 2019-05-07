<<<<<<< HEAD
import {Component} from '@angular/core';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {TranslateService} from '@ngx-translate/core';
import {DatabaseProvider} from "../providers/database/database";
import { NetworkService } from "../services/network/network";
import { OneSignalService } from '../services/onesignal/onesignal';
import { SessionValidatorProvider } from '../providers/session/sessionValidator';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  public rootPage: any;
  public isLoading = true;
  private openedFromNotification = false;

  constructor(public platform: Platform,
              public app: App,
              public statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              private databaseProvider: DatabaseProvider,
              private networkService: NetworkService,
              private sessionValidatorProvider: SessionValidatorProvider,
              private oneSignalService: OneSignalService) {
    this.setAppLanguage();
    this.initializeApp();
  }

  initializeApp() {
    this.isLoading = true;

    this.platform.ready().then(() => {
      this.oneSignalService.init();
      this.networkService.listenForNetworkEvents();
      this.statusBar.styleDefault();
      this.databaseProvider.getDatabaseState()
        .subscribe(isDatabaseOpen => {
          if (isDatabaseOpen) {
            this.checkSession();
          }
        });
    });
  }


  private setAppLanguage() {
    let language = navigator.language;
    if (language.includes("fr")) {
      this.translate.setDefaultLang("fr");
    }
    else {
      this.translate.setDefaultLang("en");
    }
  }

  stopLoading() {
    this.splashScreen.hide();
    this.isLoading = false;
  }

  private checkSession() {
    this.stopLoading();
    if (this.openedFromNotification) {

    }
    else if (this.sessionValidatorProvider.isValidSession() === true) {
      this.rootPage = Catalog;
    } else {
      this.rootPage = Login;
    }
  }
  

}
