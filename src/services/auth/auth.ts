import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { LoginRequest } from '../../interfaces/request-body/login';
import { ApiService } from '../api/api';
import * as ConstantsURL from '../../util/constants-url';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import { User } from '../../interfaces/models/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { Events } from 'ionic-angular';
import { Moment } from 'moment';
import { DateTimeService } from '../../services/datetime/dateTimeService';

@Injectable()
export class AuthService {

  private user: User = new User();
  private secureActionsQueue: (() => any)[] = [];
  public authState: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private readonly apiProvider: ApiService,
              private readonly events: Events) {
    
      this.authState.subscribe(authOk => {
      if (authOk) {
        this.events.publish(Constants.EVENT_AUTH);
      }
    });
    this.user = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (this.user && this.isValidSession()) {
      this.authState.next(true);
    }
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
      //this.authState.next(true);
      console.log('set new user');
    });
  }

  public logout(expired: boolean = false): void {
    this.authState.next(false);
    this.user = undefined;
    LocalStorageHelper.removeFromLocalStorage(Constants.USER);
  }

  /**
   * Gets user info from the server
   */
  public getUserInfo(): Promise<User> {
    if (this.user && this.user.userToken) {
      return new Promise((resolve, reject) => {
        const params: any = { user_token: this.user.userToken };
        this.apiProvider.post(ConstantsURL.URL_USER_INFO, params).take(1).subscribe(response => {
          this.user = JSON.parse(response.d);
          this.user.userToken = params.user_token;
          this.authState.next(true);
          this.events.publish(Constants.EVENT_AUTH);
          this.executeQueue();
          LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
          resolve();
        }, error => {
          console.error(error);
          reject(error);
        });
      });
    }

    this.events.publish(Constants.EVENT_INVALID_AUTH);
  }

  public getRetailerType(): Promise<string> {
    return new Promise(resolve => {
      this.executeSecureAction(() => {
        let retailer_type: string = 'US';
        for (const division of Constants.ONE_SIGNAL_CANADA_USER_TYPES) {
          if (division === this.User.division) {
            retailer_type = 'CA';
            break;
          }
        }
        resolve(retailer_type);
      });
    });
  }

  public isValidSession(): boolean {
    if (!this.User) {
      return false;
    }
    const now: Moment = DateTimeService.getCurrentDateTime();
    const receivedTimestamp: string = this.User.time_stamp;
    const sessionTimestampWith4Days: Moment = DateTimeService.getTimeAfter4Days(receivedTimestamp);

    const status: boolean = sessionTimestampWith4Days.isSameOrAfter(now);

    if (status) {
      this.executeQueue();
      return status;
    }

    this.logout(true);
      // this.events.publish(Constants.EVENT_LOGIN_EXPIRED); TODO: Wat was here?
    
  }

  /**
   * Represents a way to execute code only when a user is logged in.
   * @param action 
   */
  public executeSecureAction(action: () => void): void {
    if (this.isValidSession()) {
      return action();
    }
    this.secureActionsQueue.push(action);
  }

  private executeQueue(): void {
    if (this.secureActionsQueue.length > 0) {
      this.secureActionsQueue.forEach(action => action());
      this.secureActionsQueue = [];
    }
  }

  /**
   * New promise that should fire when or if you are logged in. This should replace the secure actions queue to give more freedom
   * Only token is granted to be present when this method fires, userInfo may still need grabbing TODO: Check this.
   */

  public waitForAuth(): Observable<void> {
    return this.authState.filter(val => val).take(1).map((elem) => {
      console.log("ONLY 1");
      return;
     });
  }
}
