import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, Content } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ShoppingListsProvider, ListType } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import { PopoversService, CustomListPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { LoadingService } from '../../services/loading/loading';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramProvider } from '../../providers/program/program';
import { Subscription } from 'rxjs';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavigatorService } from '../../services/navigator/navigator';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';
import { getNavParam } from '../../helpers/validatedNavParams';
import { NavbarCustomButton } from '../../interfaces/models/navbar-custom-button';

@Component({
  selector: 'page-add-to-shopping-list',
  templateUrl: 'add-to-shopping-list.html'
})
export class AddToShoppingListPage implements OnInit {
  private product: Product;
  private selectedProgram: ItemProgram;
  private quantity: number = 0;
  public isAddBtnDisabled: boolean = false;
  public shoppingLists: ShoppingList[] = [];
  public listForm: FormGroup;
  public model: any = {};
  public isMarketOnlyProduct: boolean = false;
  public subscription: Subscription;
  public menuCustomButtons: NavbarCustomButton[] = [];
  private firstValidListID: number;
  private loader: LoadingService;
  private lastValidList: ShoppingList;

  @ViewChild(Content) private readonly content: Content;

  constructor(
    public navigatorService: NavigatorService,
    public navParams: NavParams,
    private readonly shoppingListsProvider: ShoppingListsProvider,
    private readonly popoversService: PopoversService,
    private readonly formBuilder: FormBuilder,
    private readonly loadingService: LoadingService,
    private readonly programProvider: ProgramProvider
  ) {
    this.menuCustomButtons.push({ action: () => this.newShoppingList(), icon: 'add' });
  }

  public ngOnInit(): void {
    this.loader = this.loadingService.createLoader();
    this.loader.show();
    this.product = getNavParam(this.navParams, 'product', 'object');
    this.selectedProgram = getNavParam(this.navParams, 'selectedProgram', 'object');
    this.quantity = getNavParam(this.navParams, 'quantity', 'number');

    this.listForm = this.formBuilder.group({
      listOptions: [this.model.listOptions, Validators.required]
    });

    this.initShoppingListInformation();
  }

  private listIsNotSameType(list: ShoppingList): boolean {
    if (
      this.isMarketOnlyProduct &&
      (list.ListType === ListType.CustomRegular || list.ListType === ListType.DefaultRegular)
    ) {
      return true;
    }
    if (
      !this.isMarketOnlyProduct &&
      (list.ListType === ListType.CustomMarketOnly || list.ListType === ListType.DefaultMarketOnly)
    ) {
      return true;
    }
    return false;
  }

  public initShoppingListInformation(): void {
    this.programProvider
      .isMarketOnlyProgram(this.selectedProgram.program_no)
      .toPromise()
      .then(isMarketOnly => {
        this.isMarketOnlyProduct = isMarketOnly;
        this.checkMarketOnlyProduct(isMarketOnly);
        return this.shoppingListsProvider.getAllShoppingLists().toPromise();
      })
      .then((shoppingListsResponse: any) => {
        const shoppingLists: ShoppingListResponse[] = shoppingListsResponse;
        return this.setAllShoppingList(shoppingLists);
      })
      .then(() => {
        return this.shoppingListsProvider
          .getShoppingListsForProduct(this.product.sku, this.selectedProgram.program_no)
          .toPromise();
      })
      .then((productShoppingListsResponse: any) => {
        const productShoppingLists: ShoppingListResponse[] = productShoppingListsResponse;
        const virtualLists: ShoppingList[] = [...this.shoppingLists];

        for (let virtualListIndex: number = 0; virtualListIndex < virtualLists.length; virtualListIndex++) {
          let removed: boolean = false;
          for (let productListIndex: number = 0; productListIndex < productShoppingLists.length; productListIndex++) {
            if (virtualLists[virtualListIndex].ListID === productShoppingLists[productListIndex].shopping_list_id) {
              virtualLists.splice(virtualListIndex, 1);
              virtualListIndex--;
              productShoppingLists.splice(productListIndex, 1);
              productListIndex--;
              removed = true;
              break;
            }
          }
          if (!removed && this.listIsNotSameType(virtualLists[virtualListIndex])) {
            virtualLists.splice(virtualListIndex, 1);
            virtualListIndex--;
          }
        }

        if (virtualLists.length > 0) {
          this.isAddBtnDisabled = false;
          this.listForm.setValue({ listOptions: virtualLists[0].ListID });
          this.firstValidListID = virtualLists[0].ListID;
          this.scrollToList(this.firstValidListID);
        } else {
          this.listForm.setValue({ listOptions: '-1' });
          this.isAddBtnDisabled = true;
          const content: PopoverContent = this.popoversService.setContent(
            Strings.GENERIC_MODAL_TITLE,
            this.isMarketOnlyProduct ? Strings.NO_LISTS_FOR_MARKET_ONLY_PRODUCT : Strings.NO_LISTS_FOR_REGULAR_PRODUCT
          );
          this.popoversService.show(content);
        }
        this.loader.hide();
      })
      .catch(error => console.error(error));
  }

  public checkMarketOnlyProduct(isMarketOnly: boolean): void {
    this.listForm.value.listOptions = isMarketOnly
      ? LocalStorageHelper.getFromLocalStorage(Constants.MARKET_ONLY_LIST_ID)
      : (this.listForm.value.listOptions = LocalStorageHelper.getFromLocalStorage(Constants.DEFAULT_LIST_ID));
  }

  public setAllShoppingList(shoppingLists: ShoppingListResponse[]): Promise<void> {
    const specialLists: ShoppingList[] = []; // Can't use sort because 1 should be first, then 2 then 0.

    if (shoppingLists.length > 0) {
      for (const sList of shoppingLists) {
        const list: ShoppingList = {
          ListID: sList.shopping_list_id,
          ListName: sList.list_name,
          ListDescription: sList.list_description,
          ListType: sList.list_type
        };
        if (list.ListType === 1 || list.ListType === 2) {
          specialLists.push(list);
        } else {
          this.shoppingLists.push(list);
        }
      }
    }

    if (specialLists.length > 0) {
      specialLists.sort((listA, listB) => Number(listA.ListType) - Number(listB.ListType));
      specialLists.push(...this.shoppingLists);
      this.shoppingLists = specialLists;
    }

    return Promise.resolve();
  }

  public newShoppingList(): void {
    const content: PopoverContent = this.popoversService.setContent(
      Strings.SHOPPING_LIST_NEW_DIALOG_TITLE,
      undefined,
      Strings.MODAL_BUTTON_SAVE,
      Strings.MODAL_BUTTON_CANCEL,
      undefined,
      Constants.POPOVER_NEW_SHOPPING_LIST
    );
    this.popoversService
      .show(content)
      .take(1)
      .subscribe((data: CustomListPopoverResult) => {
        if (data && data.listName) {
          this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
            data.type =
              data.type === 'default' ? Constants.CUSTOM_LIST_DEFAULT_TYPE : Constants.CUSTOM_LIST_MARKET_TYPE;
            if (status === 'available') {
              this.shoppingListsProvider
                .createNewShoppingList(data.listName, data.listDescription, data.type)
                .subscribe((resp: any) => {
                  const list: ShoppingList = {
                    ListID: resp.shopping_list_id,
                    ListName: resp.list_name,
                    ListDescription: resp.list_description,
                    ListType: resp.list_type
                  };
                  this.shoppingLists.push(list);
                  this.selectList(list);
                });
            } else {
              const modalContent: PopoverContent = this.popoversService.setContent(
                Strings.GENERIC_MODAL_TITLE,
                Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR
              );
              this.popoversService.show(modalContent);
            }
          });
        }
      });
  }

  public cancel(): void {
    this.navigatorService.pop().catch(err => console.error(err));
  }

  public add(): void {
    if (!this.selectedProgram) {
      const content: PopoverContent = this.popoversService.setContent(
        Strings.SHOPPING_LIST_NO_PROGRAM_TITLE,
        Strings.SHOPPING_LIST_NO_PROGRAM_MESSAGE,
        undefined
      );
      this.popoversService.show(content);
      return;
    }

    this.saveItemToList();
  }

  public saveItemToList(): void {
    const listItem: ShoppingListItem = {
      product: this.product,
      program_number: this.selectedProgram.program_no || '0',
      item_price: parseFloat(this.selectedProgram.price),
      quantity: this.quantity
    };

    this.loader.show();
    this.shoppingListsProvider
      .addItemToShoppingList(this.listForm.value.listOptions, listItem, this.listForm.value.listOptions.isMarketOnly)
      .subscribe(() => {
        this.loader.hide();
        this.cancel();
      });
  }

  public checkProductInList(listId: number): void {
    this.shoppingListsProvider
      .checkProductInList(this.product.sku, listId, this.selectedProgram.program_no)
      .subscribe(({ status }: any) => {
        if (status) {
          this.isAddBtnDisabled = true;
          this.reset(
            this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_EXISTING_PRODUCT)
          );
        } else {
          this.listForm.value.listOptions = listId;
          this.isAddBtnDisabled = false;
        }
      });
  }

  public reset(content: PopoverContent): void {
    this.popoversService.show(content);
    this.isAddBtnDisabled = true;
    this.listForm.controls.listOptions.reset();
  }

  public selectList(selectedList: ShoppingList): void {
    if (!selectedList) {
      return;
    }

    const differentType: boolean = this.listIsNotSameType(selectedList);

    if (this.isMarketOnlyProduct && differentType) {
      this.reset(
        this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_MARKET_ONLY_PRODUCT)
      );
      this.seekValidList();
    } else if (!this.isMarketOnlyProduct && differentType) {
      this.seekValidList();
      this.reset(this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_DEFAULT_PRODUCT));
    } else {
      this.scrollToList(selectedList.ListID);
      this.lastValidList = selectedList;
      this.checkProductInList(selectedList.ListID);
      this.isAddBtnDisabled = false;
    }
  }

  private scrollToList(id: number): void {
    const element: any = document.getElementById(`${id}`);
    if (!element) {
      this.content.scrollToBottom();
    } else {
      this.content.scrollTo(0, element.offsetTop - 50);
    }
  }

  private seekValidList(): void {
    if (this.lastValidList !== undefined) {
      this.selectList(this.lastValidList);
      return;
    }

    if (this.firstValidListID) {
      this.selectList(this.shoppingLists.find(list => list.ListID === this.firstValidListID));
    }
  }
}
