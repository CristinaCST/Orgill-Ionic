import {Component} from '@angular/core';
import {App} from "ionic-angular";
import {Login} from "../../pages/login/login";
import * as Constants from "../../util/constants";
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import {PopoversProvider} from "../../providers/popovers/popovers";
import "rxjs/add/operator/map";

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent {

  constructor(private app: App,
              private popoversProvider: PopoversProvider,
              private authServiceProvider: AuthServiceProvider) {

  }


  public logout() {

    let content = {
      type: Constants.POPOVER_LOGOUT,
      title: Constants.LOGOUT_TITLE,
      message: Constants.LOGOUT_MESSAGE,
      dismissButtonText: Constants.CANCEL,
      negativeButtonText: Constants.NO,
      positiveButtonText: Constants.OK
    };

    this.popoversProvider.show(content).map((data) => {
      if (data.type === Constants.POPOVER_LOGOUT) {
        if (data.optionSelected === "NO") {
          //TODO MAKE SERVICE FOR DELETE DATA
          this.authServiceProvider.logoutDeleteData();
        }
        this.authServiceProvider.logout();
        this.app.getActiveNav().setRoot(Login).then(() => console.log('To Login'));
      }
    });
  }
}
