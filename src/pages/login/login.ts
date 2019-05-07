import {Component} from '@angular/core';
import {NavController,} from 'ionic-angular';
import {AuthProvider} from "../../providers/auth/auth";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import {LoadingService} from "../../services/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {Catalog} from "../catalog/catalog";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class Login {

  username: string;
  password: string;
  loginLoader: LoadingService;

  constructor(private navCtrl: NavController,
              private authProvider: AuthProvider,
              private loadingService: LoadingService,
              private translateProvider: TranslateProvider,
              private popoversProvider: PopoversProvider) {

                this.loginLoader = this.loadingService.createLoader(this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_LOGIN));
  }

  login() {
    if (!this.isValidInput()) {
      return;
    }

    this.loginLoader.show();
    let loginRequest = {username: this.username, password: this.password};
    this.authProvider.login(loginRequest).subscribe(
      () => {
        this.authProvider.getUserInfo().then(() => {
          this.navCtrl.setRoot(Catalog).catch(err => console.error(err));
          this.loginLoader.hide();
        });
      }, error => {
        console.log(error);
        this.loginLoader.hide();
        let content = this.popoversProvider.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_INVALID);
        this.popoversProvider.show(content);
      }
    );
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    let content = this.popoversProvider.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_REQUIRED);
    this.popoversProvider.show(content);
    return false;
  }

}
