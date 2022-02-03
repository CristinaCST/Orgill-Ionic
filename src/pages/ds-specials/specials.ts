import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {
  DS_FORM_LIST_FORM_TYPE_DROPSHIP,
  DS_FORM_LIST_FORM_TYPE_PALLET,
  DS_FORM_LIST_FORM_TYPE_POG
} from '../../util/constants';
import * as Strings from '../../util/strings';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { LoadingService } from '../../services/loading/loading';
import { DropshipService } from '../../services/dropship/dropship';
import { TranslateWrapperService } from '../../services/translate/translate';
import { FormList, FormDetails } from '../../interfaces/response-body/dropship';
import { ShopItemsPage } from '../../pages/ds-shop-items/shop-items';

@Component({
  selector: 'page-specials',
  templateUrl: 'specials.html'
})
export class SpecialsPage implements OnInit {
  public categoryList: FormDetails[] = [];
  public isDropship: boolean = false;
  public pageTitle: string;
  public pageHeader: string;
  private readonly dropshipLoader: LoadingService;

  constructor(
    public loadingService: LoadingService,
    private readonly navParams: NavParams,
    private readonly navController: NavController,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader('Loading');
  }

  public ngOnInit(): void {
    this.dropshipLoader.show();

    const formtype: string = this.navParams.get('formtype');
    this.isDropship = formtype === DS_FORM_LIST_FORM_TYPE_DROPSHIP;

    this.fetchFormItems(formtype);

    this.translateHeaders(formtype);

    this.dropshipService.resetCart();
  }

  public goToShopItemsPage(data: FormDetails): void {
    this.navController.push(ShopItemsPage, { data, isDropship: this.isDropship });
  }

  private fetchFormItems(formtype: string): void {
    this.dropshipProvider
      .getFormList({ formtype, type: this.dropshipService.getUserDivision() })
      .subscribe(response => {
        const data: FormList[] = JSON.parse(response.d);

        if (!Boolean(data.length)) {
          this.dropshipLoader.hide();
        }

        data.forEach(form => {
          this.dropshipProvider.getFormDetails({ form_id: form.form_id }).subscribe(result => {
            this.categoryList.push(JSON.parse(result.d));

            this.dropshipLoader.hide();
          });
        });
      });
  }

  private translateHeaders(formtype: string): void {
    switch (formtype) {
      case DS_FORM_LIST_FORM_TYPE_DROPSHIP:
        this.pageTitle = this.translateProvider.translate(Strings.dropship_select_specials_dropship);
        this.pageHeader = this.translateProvider.translate(Strings.dropship_select_special_header);
        break;

      case DS_FORM_LIST_FORM_TYPE_PALLET:
        this.pageTitle = this.translateProvider.translate(Strings.dropship_select_specials_pallet);
        this.pageHeader = this.translateProvider.translate(Strings.dropship_pallet_specials_header);
        break;

      case DS_FORM_LIST_FORM_TYPE_POG:
        this.pageTitle = this.translateProvider.translate(Strings.dropship_select_specials_pog);
        this.pageHeader = this.translateProvider.translate(Strings.dropship_pog_specials_header);
        break;

      default:
        return;
    }
  }
}
