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
import { Events } from 'ionic-angular';
import { Moment } from 'moment';
import { DateTimeService } from '../../services/datetime/dateTimeService';

@Injectable()
export class AuthService {

  private user: User = new User();
  private firstAuthCheck: boolean = true;

  constructor(private readonly apiProvider: ApiService,
              private readonly navigatorService: NavigatorService,
              private readonly events: Events) {

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
    console.log("BA");
    if (this.user && this.user.userToken) {
      console.log("BA");
      return new Promise((resolve, reject) => {
        const params: any = { user_token: this.user.userToken };
        this.apiProvider.post(ConstantsURL.URL_USER_INFO, params).take(1).subscribe(response => {
          this.user = JSON.parse(response.d);
          this.user.userToken = params.user_token;
          this.events.publish(Constants.EVENT_AUTH);
          console.log("EVENT AUTH");
          console.log("REPSPONSE", response);
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

  public isValidSession(): boolean {
    if (!this.User) {
      return false;
    }
    const now: Moment = DateTimeService.getCurrentDateTime();
    const receivedTimestamp: string = this.User.time_stamp;
    const sessionTimestampWith4Days: Moment = DateTimeService.getTimeAfter4Days(receivedTimestamp);

    const status: boolean = sessionTimestampWith4Days.isSameOrAfter(now);
    if (!status) {
      this.logout(true);
      // this.events.publish(Constants.EVENT_LOGIN_EXPIRED); TODO: Wat was here?
    }
    if (this.firstAuthCheck) {
      this.events.publish(Constants.EVENT_AUTH); // Workaround since this service skips auth procedure
    }
    return status;
  }
}
