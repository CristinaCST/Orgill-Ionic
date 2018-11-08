import {Component} from '@angular/core';
import {NavController,} from 'ionic-angular';
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import * as Constants from "../../util/constants";
import {LoadingProvider} from "../../providers/loading/loading";
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

  constructor(private navCtrl: NavController,
              private authService: AuthServiceProvider,
              private loading: LoadingProvider,
              private translateProvider: TranslateProvider,
              private popoversProvider: PopoversProvider) {
  }

  login() {
    if (!this.isValidInput()) {
      return;
    }

    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_LOGIN));
    let loginRequest = {username: this.username, password: this.password};
    this.authService.login(loginRequest).subscribe(
      () => {
        this.authService.getUserInfo().then(() => {
          this.navCtrl.setRoot(Catalog);
          this.loading.hideLoading();
        });
      }, error => {
        this.loading.hideLoading();
        let content = {title: Constants.LOGIN_ERROR_TITLE, message: Constants.LOGIN_ERROR_INVALID};
        this.popoversProvider.show(content);
      }
    );
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    let content = {
      title: Constants.LOGIN_ERROR_TITLE,
      message: Constants.LOGIN_ERROR_REQUIRED,
      positiveButtonText: Constants.OK
    };
    this.popoversProvider.show(content);
    return false;
  }

}
