
import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Catalog } from '../pages/catalog/catalog';
import { Login } from '../pages/login/login';
import { TranslateService } from '@ngx-translate/core';
import { NetworkService } from '../services/network/network';
import { OneSignalService } from '../services/onesignal/onesignal';
import { SessionValidatorService } from '../services/session/sessionValidator';
import { NavigatorService } from '../services/navigator/navigator';
import * as Constants from '../util/constants';
import * as Strings from '../util/strings';
import { PopoversService, DefaultPopoverResult, PopoverContent } from '../services/popovers/popovers';
import { LoadingService } from '../services/loading/loading';
import { CSSInjector } from '../helpers/css-injector';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  public rootPage: any;
  public isLoading: boolean = true;
  private readonly openedFromNotification: boolean = false;

  constructor(public platform: Platform,
              public statusBar: StatusBar,
              private readonly splashScreen: SplashScreen,
              private readonly translate: TranslateService,
              private readonly networkService: NetworkService,
              private readonly sessionValidatorProvider: SessionValidatorService,
              private readonly oneSignalService: OneSignalService,
              private readonly navigatorService: NavigatorService,
              private readonly popoverProvider: PopoversService,
              private readonly events: Events) {
    this.setAppLanguage().then(()=>{
      this.initializeApp();
    });
  }


  public scrollToElement(): void {
    document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
  }

  public initializeApp(): void {
    this.isLoading = true;

    this.events.subscribe(Constants.EVENT_SCROLL_INTO_VIEW, this.scrollToElement);

    this.platform.ready().then(() => {
      
      this.oneSignalService.init();

        CSSInjector.setHead();

        window.addEventListener('keyboardDidShow', (obj: Event & {keyboardHeight: number}) => {
          if (this.platform.is('android')) {
            CSSInjector.injectCSS('body.keyboard-is-open .scroll-content:not(.keyboard-immune){' + 'margin-bottom:' + obj.keyboardHeight + 'px!important;' + '}');
          } else {
            CSSInjector.injectCSS('body.keyboard-is-open .scroll-content:not(.keyboard-immune){' + 'margin-bottom:' + obj.keyboardHeight + 'px!important; padding-bottom:0px!important;' + '}');
          }
          document.body.classList.add('keyboard-is-open');
          this.scrollToElement();
        });

        window.addEventListener('keyboardDidHide', () => {
          document.body.classList.remove('keyboard-is-open');
        });

      this.navigatorService.initializeBackButton(() => {

        if (LoadingService.activeLoading) {
          return;
        }

        if (PopoversService.activeItem) {
          PopoversService.dismissCurrent();
          return;
        }

        if (this.platform.is('android') && !this.navigatorService.canGoBack) {
          const content: PopoverContent = {
            type: Constants.POPOVER_QUIT,
            title: Strings.GENERIC_MODAL_TITLE,
            message: Strings.APPLICATION_QUIT_MESSAGE,
            negativeButtonText: Strings.MODAL_BUTTON_NO,
            positiveButtonText: Strings.MODAL_BUTTON_YES
          };

          this.popoverProvider.show(content).subscribe((result: DefaultPopoverResult) => {
            if (result.optionSelected === 'OK') {
              this.platform.exitApp();
            }
          });

        } else {
          this.navigatorService.pop();
        }
      });

      this.networkService.listenForNetworkEvents();
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.statusBar.hide();
      this.checkSession();
      /*
      this.databaseProvider.getDatabaseState()
        .subscribe(isDatabaseOpen => {
          if (isDatabaseOpen) {
            this.checkSession();
          }
        });*/
    });
  }

  private setAppLanguage(): Promise<void>{
    const language: string = navigator.language;
    this.translate.setDefaultLang('en');
    if (language.includes('fr')) {
      return this.translate.use('fr').toPromise();
    } else {
      return this.translate.use('en').toPromise();
    }
  }

  public stopLoading(): void {
    this.splashScreen.hide();
    this.isLoading = false;
  }

  private checkSession(): void {
    this.stopLoading();
    if (!this.openedFromNotification && this.sessionValidatorProvider.isValidSession()) {
      this.rootPage = Catalog;
      this.navigatorService.initialRootPage(this.rootPage);
    } else {
      this.rootPage = Login;
      this.navigatorService.initialRootPage(this.rootPage);
    }

  }


}
