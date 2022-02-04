import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { FormDetails, SavedorderList } from '../../interfaces/response-body/dropship';
import { getNavParam } from '../../helpers/validatedNavParams';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { LoadingService } from '../../services/loading/loading';
import { ShopItemsPage } from '../../pages/ds-shop-items/shop-items';
import {
  DS_FORM_LIST_FORM_TYPE_DROPSHIP,
  DS_FORM_LIST_FORM_TYPE_PALLET,
  DS_FORM_LIST_FORM_TYPE_POG
} from '../../util/constants';
import { loading_text } from '../../util/strings';
import { TranslateWrapperService } from '../../services/translate/translate';

@Component({
  selector: 'page-saved-drafts',
  templateUrl: 'saved-drafts.html'
})
export class SavedDraftsPage implements OnInit {
  public savedorderList: SavedorderList[] = [];
  public savedDrafts: number = 0;
  private readonly dropshipLoader: LoadingService;

  constructor(
    public navParams: NavParams,
    public dropshipProvider: DropshipProvider,
    public loadingService: LoadingService,
    public navController: NavController,
    public events: Events,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(loading_text));

    events.subscribe('savedOrderDeleted', order_id => {
      if (!order_id) {
        return;
      }

      this.savedorderList = this.savedorderList.filter(item => item.order_id !== order_id);
      this.savedDrafts = this.savedorderList.length;
    });
  }

  public ngOnInit(): void {
    const navParams: string | undefined = getNavParam(this.navParams, 'savedorderList');

    if (navParams) {
      this.savedorderList = JSON.parse(navParams);
      this.savedDrafts = this.savedorderList.length;
    } else {
      this.dropshipLoader.show();

      this.dropshipProvider.getSavedorderList().subscribe(response => {
        const data: SavedorderList[] = JSON.parse(response.d);
        this.savedorderList = data;
        this.savedDrafts = data.length;
        this.dropshipLoader.hide();
      });
    }
  }

  public goToShopPage(order: SavedorderList): void {
    this.dropshipLoader.show();
    const isDropship: boolean = this.fetchFormType(order.form_type.toLowerCase()) === DS_FORM_LIST_FORM_TYPE_DROPSHIP;

    this.dropshipProvider.getFormDetails({ form_id: order.form_id }).subscribe(response => {
      this.dropshipLoader.hide();

      const categoryList: FormDetails = JSON.parse(response.d);

      this.navController.push(ShopItemsPage, { data: categoryList, savedOrder: order, isDropship });
    });
  }

  private fetchFormType(formtype: string): string {
    if (formtype.includes('planogram')) {
      return DS_FORM_LIST_FORM_TYPE_POG;
    }
    if (formtype.includes('pallet')) {
      return DS_FORM_LIST_FORM_TYPE_PALLET;
    }

    return DS_FORM_LIST_FORM_TYPE_DROPSHIP;
  }
}
