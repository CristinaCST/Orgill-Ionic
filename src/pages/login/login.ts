import {Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import {LoadingService} from "../../services/loading/loading";
import {TranslateWrapperService} from "../../services/translate/translate";
import {PopoversService} from "../../services/popovers/popovers";
import {Catalog} from "../catalog/catalog";
import { NavigatorService } from '../../services/navigator/navigator';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class Login {

  username: string;
  password: string;
  loginLoader: LoadingService;

  constructor(private navigatorService: NavigatorService,
              private authProvider: AuthService,
              private loadingService: LoadingService,
              private translateProvider: TranslateWrapperService,
              private popoversProvider: PopoversService,
              private secureActions: SecureActionsService) {

                this.loginLoader = this.loadingService.createLoader(this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_LOGIN));
  }

  login() {
    if (!this.isValidInput()) {
      return;
    }

    this.loginLoader.show();
    let loginRequest = {username: this.username, password: this.password};
    this.authProvider.login(loginRequest).subscribe(
      () => {
        this.authProvider.getUserInfo().then(() => {
          this.navigatorService.setRoot(Catalog).then(()=>{this.secureActions.executeQueue();}).catch(err => console.error(err));
          this.loginLoader.hide();
        });
      }, error => {
        console.error(error);
        this.loginLoader.hide();
        let content = this.popoversProvider.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_INVALID);
        this.popoversProvider.show(content);
      }
    );
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    let content = this.popoversProvider.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_REQUIRED);
    this.popoversProvider.show(content);
    return false;
  }

}
