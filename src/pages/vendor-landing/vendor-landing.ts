import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../services/loading/loading';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { AuthService } from '../../services/auth/auth';
import { NavigatorService } from '../../services/navigator/navigator';
import { SavedorderList } from '../../interfaces/response-body/dropship';
import { SavedDraftsPage } from '../../pages/ds-saved-drafts/saved-drafts';
import { CustomerInfoPage } from '../../pages/ds-customer-info/customer-info';
import { DS_FORM_LIST_TYPE_CA } from '../../util/constants';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DropshipService } from '../../services/dropship/dropship';
import { onlineDealerMarketCAD, onlineDealerMarketUS } from '../../util/constants-url';
import { TranslateWrapperService } from '../../services/translate/translate';
import { loading_text } from '../../util/strings';

@Component({
  selector: 'page-vendor-landing',
  templateUrl: 'vendor-landing.html'
})
export class VendorLandingPage implements OnInit {
  public vendorName: string;
  public savedDrafts: number = 0;
  private savedorderList: SavedorderList[];
  private readonly dropshipLoader: LoadingService;

  constructor(
    public dropshipProvider: DropshipProvider,
    public loadingService: LoadingService,
    public navigatorService: NavigatorService,
    private readonly dropshipService: DropshipService,
    private readonly authService: AuthService,
    private readonly iab: InAppBrowser,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(loading_text));
  }

  public ngOnInit(): void {
    this.vendorName = this.authService.getCurrentUser().user_name;

    this.dropshipLoader.show();

    this.dropshipProvider.getSavedorderList().subscribe(savedorderListString => {
      this.savedorderList = JSON.parse(savedorderListString.d);

      this.savedDrafts = this.savedorderList.length;

      this.dropshipLoader.hide();
    });
  }

  public goToPage(page: string): void {
    switch (page) {
      case 'savedDrafts':
        this.navigatorService.push(SavedDraftsPage, { savedorderList: JSON.stringify(this.savedorderList) });
        break;

      case 'newOrder':
        this.navigatorService.push(CustomerInfoPage);
        break;

      case 'ordersSubmitted':
        this.iab.create(
          this.dropshipService.getUserDivision() === DS_FORM_LIST_TYPE_CA
            ? onlineDealerMarketCAD
            : onlineDealerMarketUS,
          '_system'
        );
        break;

      default:
        return;
    }
  }
}
