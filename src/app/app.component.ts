
import { Component } from '@angular/core';
import { App, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Catalog } from '../pages/catalog/catalog';
import { Login } from "../pages/login/login";
import { TranslateService } from '@ngx-translate/core';
import { DatabaseProvider } from "../providers/database/database";
import { NetworkService } from "../services/network/network";
import { OneSignalService } from '../services/onesignal/onesignal';
import { SessionValidatorProvider } from '../providers/session/sessionValidator';
import { NavigatorService } from '../services/navigator/navigator';
import * as Constants from "../util/constants";
import * as Strings from "../util/strings";
import { PopoversProvider } from '../providers/popovers/popovers';

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
    private oneSignalService: OneSignalService,
    private navigatorService: NavigatorService,
    private popoverProvider: PopoversProvider) {
    this.setAppLanguage();
    this.initializeApp();
  }

  initializeApp() {
    this.isLoading = true;

    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (!this.navigatorService.getNav().canGoBack()) {
          let content = {
            type: Constants.POPOVER_QUIT,
            title: Strings.GENERIC_MODAL_TITLE,
            message: Strings.APPLICATION_QUIT_MESSAGE,
            negativeButtonText: Strings.MODAL_BUTTON_NO,
            positiveButtonText: Strings.MODAL_BUTTON_YES
          }


          //TODO: Popover returns? Try to make the logic better? Instant return option
          this.popoverProvider.show(content).subscribe((result) => {
            if (result["optionSelected"] == "OK") {
              this.platform.exitApp();
            }
          });

        } else {
          this.navigatorService.pop();
        }
      });

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
