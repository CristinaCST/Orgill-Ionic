import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { LoginRequest } from '../../interfaces/request-body/login';
import { ApiService } from '../api/api';
import * as ConstantsURL from '../../util/constants-url';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import { User } from '../../interfaces/models/user';
import { NavigatorService } from '../../services/navigator/navigator';
import { Login } from '../../pages/login/login';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {

  private user: User = new User();

  constructor(private readonly apiProvider: ApiService, private readonly navigatorService: NavigatorService) {
    this.user = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
  }

  private static encryption(password: string): string {
    return Md5.hashStr(password.toLowerCase()).toString();
  }

  public get User(): User {
    return this.user;
  }

  public get userToken(): string {
    return this.user.userToken;
  }

  public login(credentials: LoginRequest): Observable<void> {

    credentials.username = credentials.username.toLowerCase();
    credentials.password = AuthService.encryption(credentials.password);

    return this.apiProvider.post(ConstantsURL.URL_LOGIN, credentials).map(response => {
      this.user = { userToken: JSON.parse(response.d).User_Token };
    });
  }

  public logout(expired: boolean = false): void {
    LocalStorageHelper.removeFromLocalStorage(Constants.USER);
  }

  /**
   * Gets user info from the server
   */
  public getUserInfo(): Promise<User> {
    if (this.user && this.user.userToken) {
      return new Promise((resolve, reject) => {
        const params: any = { user_token: this.user.userToken };
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
    }
    // else
    this.navigatorService.setRoot(Login);
  }

  public getUserToken(): string {
    if (this.user) {
      return this.user.userToken;
    }
  }

  public getRetailerType(): string {
    let retailer_type: string = 'US';
    for (const division of Constants.ONE_SIGNAL_CANADA_USER_TYPES) {
        if (division === this.User.division) {
            retailer_type = 'CA';
            break;
        }
    }
    return retailer_type;
  }
}
