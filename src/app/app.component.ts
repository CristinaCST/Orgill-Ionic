import {Component} from '@angular/core';
import {App, NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Catalog} from '../pages/catalog/catalog';
import {Login} from "../pages/login/login";
import {TranslateService} from '@ngx-translate/core';
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import * as Constants from '../util/constants';
import {DateTime} from "../providers/datetime/DateTime";
import {DatabaseProvider} from "../providers/database/database";
import {OneSignal} from '@ionic-native/onesignal';
import {FlashDealTestPage} from "../pages/flash-deal-test/flash-deal-test";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;
  isLoading = true;
  openedFromNotification = false;

  constructor(public platform: Platform,
              public app: App,
              public statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              private databaseProvider: DatabaseProvider,
              private oneSignal: OneSignal
  ) {

    this.setAppLanguage();
    this.initializeApp();
  }

  initializeApp() {
    //Notifications
    // this.oneSignal.promptLocation();
    // this.oneSignal.setLocationShared(true);

    // let notificationOpenedCallback = function (jsonData) {
    //   console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    // };
    //
    // window["plugins"].OneSignal
    //   .startInit("13626e23-946e-4a25-8713-05d4dee9f03b", "orgill-5a5ba")
    //   .handleNotificationOpened(notificationOpenedCallback)
    //   .endInit();


    this.isLoading = true;
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.oneSignal.setLocationShared(true);

      this.oneSignal.startInit('13626e23-946e-4a25-8713-05d4dee9f03b', 'orgill-5a5ba');

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log("NOTIFICATION RECEIVED", data);
        this.openedFromNotification = true;
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        console.log("NOTIFICATION opened", data);
        this.app.getRootNav().setRoot(FlashDealTestPage, {'data': data}).catch(err => console.error(err));
        this.openedFromNotification = true;

      });

      this.oneSignal.endInit();

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
    console.log("ENTERED CHECK SESSION..")
    this.stopLoading();
    if(this.openedFromNotification){

    }
    else  if (this.isValidSession() === true) {
      // this.app.getRootNavs()[0].setRoot(Catalog).then(() => {
      //   this.stopLoading();
      this.rootPage = Catalog;
      // })
    } else {
      this.rootPage = Login;
      // this.app.getRootNavs()[0].setRoot(Login).then(() => {
      //   this.stopLoading();
      // })
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
