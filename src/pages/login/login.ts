import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth';
import * as Strings from '../../util/strings';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../../services/translate/translate';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { NavigatorService } from '../../services/navigator/navigator';
import { TextInput } from 'ionic-angular';
import { LandingPage } from '../../pages/landing/landing';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class Login {
  public username: string;
  public password: string;
  public loginLoader: LoadingService;
  private showPassword: boolean = false;
  @ViewChild('passInput') private readonly passInput: TextInput;

  constructor(
    private readonly navigatorService: NavigatorService,
    private readonly authService: AuthService,
    private readonly loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService,
    private readonly popoversService: PopoversService
  ) {
    this.loginLoader = this.loadingService.createLoader(
      this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_LOGIN)
    );
  }

  public login(): void {
    if (!this.isValidInput()) {
      return;
    }

    // TODO: Refactor the auth logic wtf.
    this.loginLoader.show();
    const loginRequest: { username: string; password: string } = {
      username: this.username,
      password: this.password
    };
    this.authService.login(loginRequest).subscribe(
      () => {
        this.authService.getUserInfo().then(() => {
          this.navigatorService.setRoot(LandingPage);
          this.loginLoader.hide();
        });
      },
      error => {
        console.error(error);
        this.loginLoader.hide();
        const content: PopoverContent = this.popoversService.setContent(
          Strings.LOGIN_ERROR_TITLE,
          Strings.LOGIN_ERROR_INVALID
        );
        this.popoversService.show(content);
      }
    );
  }

  private isValidInput(): boolean {
    if (this.username && this.password) {
      return true;
    }

    const content: PopoverContent = this.popoversService.setContent(
      Strings.LOGIN_ERROR_TITLE,
      Strings.LOGIN_ERROR_REQUIRED
    );
    this.popoversService.show(content);
    return false;
  }

  public focusPass(): void {
    this.passInput._jsSetFocus();
  }

  public toggleShow(): void {
    this.showPassword = !this.showPassword;
    this.passInput.type = this.showPassword ? 'text' : 'password';

    this.focusPass();
  }
}
