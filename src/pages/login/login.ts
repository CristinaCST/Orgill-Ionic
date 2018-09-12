import {Component} from '@angular/core';
import {IonicPage, Loading, NavController, NavParams} from 'ionic-angular';
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import * as Constants from "../../util/constants";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import {LoginRequest} from "../../interfaces/request-body/login-request";
import {Catalog} from "../catalog/catalog";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class Login {

  username: string;
  password: string;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private authService: AuthServiceProvider,
              private loading: LoadingProvider,
              private translateProvider: TranslateProvider) {
  }

  login() {
    if (this.isValidInput() === false) {
      return;
    }

    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_LOGIN));

    let loginRequest = {username: this.username, password: this.password};

    this.authService.login(loginRequest).subscribe(
      () => {
        this.loading.hideLoading();
        this.authService.getUserInfo();
        this.navCtrl.setRoot(Catalog);
      }
      ,
      error => {
        //TODO: login failed popup
        console.error("something went wrong", error);
      }
    )
    ;
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    //TODO: add alert required username and password
    return false;
  }

}
