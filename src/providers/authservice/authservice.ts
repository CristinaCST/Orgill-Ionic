import {Injectable} from '@angular/core';
import {Md5} from "ts-md5";
import {LoginRequest} from "../../interfaces/request-body/login-request";
import {ApiProvider} from "../api-provider";
import * as ConstantsURL from "../../util/constants-url";
import 'rxjs/add/operator/map';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as Constants from "../../util/constants";
import {User} from "../../interfaces/models/user";

@Injectable()
export class AuthServiceProvider {

  private user: User = new User();

  constructor(private apiProvider: ApiProvider) {
  }

  private static encryption(password) {
    return Md5.hashStr(password.toLowerCase()).toString();
  }

  login(credentials: LoginRequest) {

    credentials.username = credentials.username.toLowerCase();
    credentials.password = AuthServiceProvider.encryption(credentials.password);

    return this.apiProvider.post(ConstantsURL.URL_LOGIN, credentials).map(response => {
      console.log(response);
      this.user = {'userToken': JSON.parse(response.d)['User_Token']};
    });
  }

  logout() {
    LocalStorageHelper.removeFromLocalStorage(Constants.USER);
  }

  logoutDeleteData() {
  }

  getUserInfo() {
    return new Promise((resolve, reject) => {
      const params = {'user_token': this.user.userToken};
      this.apiProvider.post(ConstantsURL.URL_USER_INFO, params).subscribe(response => {
        this.user = JSON.parse(response.d);
        this.user.userToken = params.user_token;
        resolve();
        LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
      }, (error) => {
        console.error(error);
        reject(error);
      });
    });
  }

}
