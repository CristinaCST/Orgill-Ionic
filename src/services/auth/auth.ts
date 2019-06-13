import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { LoginRequest } from '../../interfaces/request-body/login';
import { ApiService } from '../api/api';
import * as ConstantsURL from '../../util/constants-url';
import 'rxjs/add/operator/map';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import { User } from '../../interfaces/models/user';
import { NavigatorService } from '../../services/navigator/navigator';
import { Login } from '../../pages/login/login';

@Injectable()
export class AuthService {

  private user: User = new User();

  constructor(private apiProvider: ApiService, private navigatorService: NavigatorService) {
  }

  private static encryption(password) {
    return Md5.hashStr(password.toLowerCase()).toString();
  }

  public login(credentials: LoginRequest) {

    credentials.username = credentials.username.toLowerCase();
    credentials.password = AuthService.encryption(credentials.password);

    return this.apiProvider.post(ConstantsURL.URL_LOGIN, credentials).map(response => {
      this.user = { 'userToken': JSON.parse(response.d)['User_Token'] };
    });
  }

  public logout() {
    LocalStorageHelper.removeFromLocalStorage(Constants.USER);
  }

  public logoutDeleteData() {
  }

  /**
   * Gets user info from the server
   */
  public getUserInfo() {
    if (this.user && this.user.userToken) {
      return new Promise((resolve, reject) => {
        const params = { 'user_token': this.user.userToken };
        this.apiProvider.post(ConstantsURL.URL_USER_INFO, params).subscribe(response => {
          this.user = JSON.parse(response.d);
          this.user.userToken = params.user_token;
          LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
          resolve();
        }, error => {
          console.error(error);
          reject(error);
        });
      });
    } else {
      this.navigatorService.setRoot(Login);
    }
  }

  public getUserToken() {
    if (this.user) {
      return this.user.userToken;
    }
  }

}
