import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import * as Constants from "../../util/constants";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import {PopoversProvider} from "../../providers/popovers/popovers";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  username: string;
  password: string;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private authService: AuthServiceProvider,
              private loading: LoadingProvider,
              private translateProvider: TranslateProvider,
              private popoversProvider: PopoversProvider) {
  }

  login() {
    if (this.isValidInput() === false) {
      return;
    }

    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_LOGIN));

    let loginRequest = {username: this.username, password: this.password};

    this.authService.login(loginRequest).subscribe(
      () => {
        console.log('success');
        this.loading.hideLoading();
      }
      ,
      error => {
        console.error(error);
      }
    );
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    //TODO: add alert
    return false;
  }

}
