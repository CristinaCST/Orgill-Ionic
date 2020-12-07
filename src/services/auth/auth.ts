import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { LoginRequest } from '../../interfaces/request-body/login';
import { ApiService } from '../api/api';
import * as ConstantsURL from '../../util/constants-url';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import { User } from '../../interfaces/models/user';
import { BehaviorSubject, Observable } from 'rxjs';
// import { exhaust } from 'rxjs/operators';
import { Events } from 'ionic-angular';
import { Moment } from 'moment';
import { DateTimeService } from '../../services/datetime/dateTimeService';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import * as Strings from '../../util/strings';
import { PopoversService, PopoverContent, CustomListPopoverResult } from '../../services/popovers/popovers';

@Injectable()
export class AuthService {
  private user: User = new User();
  public allowSwitch: string;
  public allowLanguageSwitchListener: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly apiProvider: ApiService,
    private readonly events: Events,
    private readonly secureActions: SecureActionsService,
    private readonly popoverService: PopoversService
  ) {
    this.secureActions.authState.subscribe(authOk => {
      if (authOk) {
        this.events.publish(Constants.EVENT_AUTH);
      }
    });
    this.user = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (this.user && this.isValidSession()) {
      this.secureActions.setAuthState(true, this.user);
    }
  }

  private static encryption(password: string): string {
    return Md5.hashStr(password.toLowerCase()).toString();
  }

  private get User(): User {
    return this.user;
  }

  public login(credentials: LoginRequest): Observable<void> {
    credentials.username = credentials.username.toLowerCase();
    credentials.password = AuthService.encryption(credentials.password);

    return this.apiProvider.post(ConstantsURL.URL_LOGIN, credentials).map(response => {
      const data: { ErrCode: string; User_Token: string } = JSON.parse(response.d);

      this.user = { userToken: data.User_Token };

      if (data.ErrCode && data.ErrCode === 'Password has expired!') {
        const content: PopoverContent = this.popoverService.setContent(
          Strings.POPOVER_PASSWORD_EXPIRED_TITLE,
          Strings.POPOVER_PASSWORD_EXPIRED_MESSAGE,
          Strings.MODAL_BUTTON_TRY_AGAIN,
          Strings.MODAL_BUTTON_RESET_PASSWORD
        );

        this.popoverService
          .show(content)
          .first()
          .subscribe({
            next(info: CustomListPopoverResult): void {
              if (info.optionSelected !== 'DISMISS') {
                return;
              }

              // redirect to orgill site
              window.open('https://www.orgill.com/', '_system');
            },
            error(err: { message: string }): void {
              // handle error here
              console.error(err.message);
            },
            complete(): void {
              this.complete().exhaust();
            }
          });
      }
    });
  }

  public logout(expired: boolean = false): void {
    this.secureActions.setAuthState(false);
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
        this.apiProvider.post(ConstantsURL.URL_USER_INFO, params).subscribe(
          response => {
            this.user = JSON.parse(response.d);
            this.user.userToken = params.user_token;
            this.allowSwitch = JSON.parse(response.d).division;
            this.allowLanguageSwitchListener.next(this.allowSwitch === '8');
            this.secureActions.setAuthState(true, this.user);
            this.events.publish(Constants.EVENT_AUTH);
            LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
            resolve();
          },
          error => {
            console.error(error);
            reject(error);
          }
        );
      });
    }

    this.events.publish(Constants.EVENT_INVALID_AUTH);
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
      // this.executeQueue();
      return status;
    }

    const content: PopoverContent = this.popoverService.setContent(
      Strings.GENERIC_MODAL_TITLE,
      Strings.SESSION_EXPIRED
    );
    this.popoverService.show(content);

    this.logout(true);
  }
}
