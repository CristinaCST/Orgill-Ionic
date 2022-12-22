import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SavedDraftsPage } from '../../pages/ds-saved-drafts/saved-drafts';
import { NavigatorService } from '../../services/navigator/navigator';
import { DropshipService } from '../../services/dropship/dropship';
import { AuthService } from '../../services/auth/auth';
import { PopoversService, DefaultPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import { Login } from '../../pages/login/login';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { onlineDealerMarketCAD, onlineDealerMarketUS } from '../../util/constants-url';

@Component({
  selector: 'vendor-menu',
  templateUrl: 'vendor-menu.html'
})
export class VendorMenuComponent {
  constructor(
    public navigatorService: NavigatorService,
    private readonly popoversService: PopoversService,
    private readonly authService: AuthService,
    private readonly iab: InAppBrowser,
    private readonly dropshipService: DropshipService
  ) {}

  public goToSavedDrafts(): void {
    this.navigatorService.push(SavedDraftsPage);
  }

  public checkOrders(): void {
    this.iab.create(
      this.dropshipService.getUserDivision() === Constants.DS_FORM_LIST_TYPE_CA
        ? onlineDealerMarketCAD
        : onlineDealerMarketUS,
      '_system'
    );
  }

  public logout(): void {
    const content: PopoverContent = {
      type: Constants.POPOVER_LOGOUT,
      title: Strings.LOGOUT_TITLE,
      message: Strings.LOGOUT_MESSAGE,
      dismissButtonText: Strings.MODAL_BUTTON_CANCEL,
      positiveButtonText: Strings.MODAL_BUTTON_YES
    };

    this.popoversService.show(content).subscribe((data: DefaultPopoverResult) => {
      if (data.optionSelected === 'OK') {
        this.authService.logout();
        this.navigatorService.setRoot(Login).catch(err => console.error(err));
      }
    });
  }
}
