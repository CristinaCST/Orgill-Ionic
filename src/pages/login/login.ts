import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth';
import * as Strings from '../../util/strings';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../../services/translate/translate';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { Catalog } from '../catalog/catalog';
import { NavigatorService } from '../../services/navigator/navigator';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import { TextInput } from 'ionic-angular';
import { OneSignalService } from '../../services/onesignal/onesignal';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class Login {

  public username: string;
  public password: string;
  public loginLoader: LoadingService;
  @ViewChild('passInput') private readonly passInput: TextInput;

  constructor(private readonly navigatorService: NavigatorService,
              private readonly authService: AuthService,
              private readonly loadingService: LoadingService,
              private readonly translateProvider: TranslateWrapperService,
              private readonly popoversService: PopoversService,
              private readonly secureActions: SecureActionsService,
              private readonly oneSignalService: OneSignalService) {

                this.loginLoader = this.loadingService.createLoader(this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_LOGIN));
  }

  public login(): void {
    if (!this.isValidInput()) {
      return;
    }

    this.loginLoader.show();
    const loginRequest: { username: string, password: string } = { username: this.username, password: this.password };
    this.authService.login(loginRequest).subscribe(
      () => {
        this.authService.getUserInfo().then(() => {
          this.navigatorService.setRoot(Catalog).then(() => {this.secureActions.executeQueue(); }).catch(err => console.error(err));
          this.loginLoader.hide();
        });
      }, error => {
        console.error(error);
        this.loginLoader.hide();
        const content: PopoverContent = this.popoversService.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_INVALID);
        this.popoversService.show(content);
      }
    );
  }


  private isValidInput(): boolean {

    if (this.username && this.password) {
      return true;
    }

    const content: PopoverContent = this.popoversService.setContent(Strings.LOGIN_ERROR_TITLE, Strings.LOGIN_ERROR_REQUIRED);
    this.popoversService.show(content);
    return false;
  }

  public focusPass(): void {
    this.passInput._jsSetFocus();
  }

}
