import { Component } from '@angular/core';
import {IonicPage, Loading, NavController, NavParams} from 'ionic-angular';
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import {User} from "../../interfaces/models/user";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as Constants from  "../../util/constants";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  user : User;

  constructor(public navCtrl: NavController, public navParams: NavParams, private authService : AuthServiceProvider, private loading : LoadingProvider, private translateProvider: TranslateProvider) {
    this.user = new User();
  }

  login(){
    if (this.isValidInput() === false) {
      return;
    }

    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_LOGIN));
    const loginParams = {'username': this.user.user_name, 'password': this.user.password};

    this.authService.login(loginParams).subscribe(
      response => {
       this.onLoginSuccess(response);

      },
      errorResponse => {
        this.onLoginFailed(errorResponse);
      }
    );
  }

  private onLoginSuccess(response){
      this.user.userToken = JSON.parse(response.d)['User_Token'];
      LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
      this.loading.hideLoading();

  }

  private onLoginFailed(error){

  }




  private isValidInput(): boolean {

    if (this.user.user_name && this.user.password) {
      return true;
    }

    //TODO: add alert
    return false;
  }

}
