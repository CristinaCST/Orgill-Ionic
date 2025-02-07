import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { LoginRequest } from '../../interfaces/request-body/login';
import { ApiService } from '../api/api';
import * as ConstantsURL from '../../util/constants-url';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import { User } from '../../interfaces/models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { Events } from 'ionic-angular';
import moment, { Moment } from 'moment';
import { DateTimeService } from '../../services/datetime/dateTimeService';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import * as Strings from '../../util/strings';
import { PopoversService, PopoverContent, CustomListPopoverResult } from '../../services/popovers/popovers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingService } from '../../services/loading/loading';
import {Login} from "../../pages/login/login";

@Injectable()
export class AuthService {
  private user: User = new User();
  public allowSwitch: string;
  public allowLanguageSwitchListener: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly apiProvider: ApiService,
    private readonly events: Events,
    private readonly secureActions: SecureActionsService,
    private readonly popoverService: PopoversService,
    private readonly iab: InAppBrowser
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
    credentials.user_name = credentials.user_name.toLowerCase();
    credentials.password = AuthService.encryption(credentials.password);

    return this.apiProvider.get(ConstantsURL.URL_LOGIN, credentials).map(response => {
      const data: { errCode: string; user_Token: string } = response;

      this.user = new User();
      this.user.user_Token = data.user_Token;

      if (data.errCode && data.errCode === 'Password has expired!') {
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
            next: (info: CustomListPopoverResult) => {
              if (info.optionSelected !== 'DISMISS') {
                return;
              }

              // redirect to orgill site
              this.iab.create('https://www.orgill.com/index.aspx?tab=8', '_system');
            },
            error(err: { message: string }): void {
              // handle error here
              console.error(err.message);
            },
            complete(): void {
              this.complete().exhaust();
            }
          });

        LoadingService.hideAll();
      }
    });
  }

  public logout(): void {
    this.secureActions.setAuthState(false);
    LocalStorageHelper.clearLocalStorage();
    LocalStorageHelper.removeFromLocalStorage(Constants.USER);
    (window as any).Android.clearWebViewDataOnLogout();
    (window as any).ios.clearWebViewDataOnLogout();
  }

  /**
   * Gets user info from the server
   */
  public getUserInfo(): Promise<User> {
    if (this.user && this.user.user_Token) {
      return new Promise((resolve, reject) => {
        const params: any = { user_token: this.user.user_Token };
        this.apiProvider.fetch(ConstantsURL.URL_USER_INFO, this.user.user_Token).subscribe(
          (response: any) => {
            this.user = response;
            this.user.user_Token = params.user_token;
            this.allowSwitch = response.division;
            this.allowLanguageSwitchListener.next(this.allowSwitch === '8');
            this.secureActions.setAuthState(true, this.user);
            this.events.publish(Constants.EVENT_AUTH);
            LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
            resolve(response);
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
    const receivedTimestamp: Moment = moment(this.User.time_stamp);
    const sessionTimestampWith4Days: Moment = DateTimeService.getTimeAfter4Days(receivedTimestamp);
    const status: boolean = sessionTimestampWith4Days.isSameOrAfter(now);

    if (status) {
      // this.executeQueue();
      return status;
    }

    const content: PopoverContent = this.popoverService.setContent(
      "The O ZONE",
      "Session expired"
    );
    this.popoverService.show(content);

    this.logout();
  }

  public getCurrentUser(): User {
    return this.User;
  }
}
