import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
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
import { APIResponse } from '../../interfaces/response-body/response';
import { getNavParam } from '../../util/validatedNavParams';

@Component({
  selector: 'page-add-to-shopping-list',
  templateUrl: 'add-to-shopping-list.html'
})
export class AddToShoppingListPage implements OnInit {

  private product: Product;
  private selectedProgram: ItemProgram;
  private quantity: number = 0;
  private readonly productLists: ShoppingList[] = [];
  public isAddBtnDisabled: boolean = false;
  public shoppingLists: ShoppingList[] = [];
  public listForm: FormGroup;
  public model: any = {};
  public isMarketOnlyProduct: boolean = false;
  public subscription: Subscription;
  public menuCustomButtons: any[] = [];
  private loader: LoadingService;

  constructor(public navigatorService: NavigatorService,
              public navParams: NavParams,
              private readonly shoppingListsProvider: ShoppingListsProvider,
              private readonly popoversProvider: PopoversService,
              private readonly formBuilder: FormBuilder,
              private readonly loadingService: LoadingService,
              private readonly programProvider: ProgramProvider) {
    this.menuCustomButtons.push({ action: 'addList', icon: 'add' });
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

  public initShoppingListInformation(): void {
    // let subscription = Rx.Observable.forkJoin(this.programProvider.isMarketOnlyProgram(this.selectedProgram.PROGRAM_NO),
    //         this.shoppingListsProvider.getShoppingListForProduct(this.product.SKU),
    //         this.shoppingListsProvider.getLocalShoppingLists());
    // subscription.subscribe(args=>{
    //  this.setProductList(args[1]);
    //       this.checkMarketOnlyProduct(args[0);
    //       this.setAllShoppingList(args[2);
    //       this.loading.hideLoading();
    // })

    Promise.all(
      [this.programProvider.isMarketOnlyProgram(this.selectedProgram.PROGRAM_NO),
       this.shoppingListsProvider.getShoppingListsForProduct(this.product.SKU, this.selectedProgram.PROGRAM_NO),
       this.shoppingListsProvider.getAllShoppingLists()
        // , this.shoppingListsProvider.getLocalShoppingLists()
       ]
    ).then(([programData, productLists, shoppingLists]) => {
      // this.setProductList(productLists);
      productLists.subscribe(data => {
        console.log(' PRODUCT LISTS DATA: ', data);
        this.setProductList(data);
      });
      this.checkMarketOnlyProduct(programData);
      // this.setAllShoppingList(shoppingLists);
      shoppingLists.subscribe(data => {
        this.setAllShoppingList(data);
      });
      this.loader.hide();

    }).catch(error => console.error(error));
  }

  public setProductList(productLists: APIResponse): void {
    // for (let i = 0; i < productLists.rows.length; i++) {
    //   this.productLists[productLists.rows.item(i).id] = productLists.rows.item(i).id;
    // }
    const prodLists: ShoppingListItem[] = JSON.parse(productLists.d);
   // for (let i: number = 0; i < prodLists.length; i++) {
     // this.productLists[prodLists[i].shopping_list_id] = prodLists[i].id;]

    // TODO: Fix this
    console.log(this.productLists !== undefined);
    console.log(prodLists.length);
    //  }
  }

  public checkMarketOnlyProduct(data: any): void {
    const programType: { market_only: string } = data.rows.item(0);
    if (data.rows.length > 0) {
      this.isMarketOnlyProduct = programType.market_only === Constants.MARKET_ONLY_PROGRAM;
    }
    // this.listForm.value.listOptions = data.rows.item(0).market_only.toString() === Constants.MARKET_ONLY_PROGRAM ? Constants.MARKET_ONLY_LIST_ID : Constants.DEFAULT_LIST_ID;
    this.listForm.value.listOptions = programType.market_only === Constants.MARKET_ONLY_PROGRAM ? LocalStorageHelper.getFromLocalStorage(Constants.MARKET_ONLY_LIST_ID) : this.listForm.value.listOptions = LocalStorageHelper.getFromLocalStorage(Constants.DEFAULT_LIST_ID);

    this.checkProductInList(this.listForm.value.listOptions);
  }

  public setAllShoppingList(data: APIResponse): void {
    // if (shoppingLists.rows.length) {
    //   for (let i = 0; i < shoppingLists.rows.length; i++) {
    //     let list: ShoppingList = {
    //       ListID: shoppingLists.rows.item(i).id,
    //       ListName: shoppingLists.rows.item(i).name,
    //       ListDescription: shoppingLists.rows.item(i).description,
    //       ListType: shoppingLists.rows.item(i).listType
    //     };
    //     this.shoppingLists.push(list);
    //   }
    // }

    const shoppingLists: ShoppingListResponse[] = JSON.parse(data.d);
    const specialLists: ShoppingList[] = [];  // Can't use sort because 1 should be first, then 2 then 0.

    if (shoppingLists.length > 0) {
      for (const sList of shoppingLists) {
        const list: ShoppingList = {
          ListID: sList.shopping_list_id,
          ListName: sList.list_name,
          ListDescription: sList.list_description,
          ListType: sList.list_type
        };
        if (list.ListType === '1' || list.ListType === '2') { specialLists.push(list); } else {
          this.shoppingLists.push(list);
        }
      }
    }

    if (specialLists.length > 0) {
      specialLists.push(...this.shoppingLists);
      this.shoppingLists = specialLists;
    }
  }

  public newShoppingList(): void {
    const content: PopoverContent = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined,
      Strings.MODAL_BUTTON_SAVE, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_NEW_SHOPPING_LIST);
    this.subscription = this.popoversProvider.show(content).subscribe((data: CustomListPopoverResult) => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          data.type = data.type === 'default' ? Constants.CUSTOM_SHOPPING_LIST_TYPE : Constants.MARKET_ONLY_CUSTOM_TYPE;
          if (status === 'available') {
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).subscribe(resp => {
              const addedList: ShoppingListResponse = JSON.parse(resp.d)[0];
              const list: ShoppingList = {
                ListID: addedList.shopping_list_id,
                ListName: addedList.list_name,
                ListDescription: addedList.list_description,
                ListType: addedList.list_type
              };
              this.shoppingLists.push(list);
              this.listForm.value.listOptions = list.ListID;
            });
          } else {
            const modalContent: PopoverContent = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
            this.popoversProvider.show(modalContent);
          }
          this.subscription.unsubscribe();
        });
      }
    });
  }

  public cancel(): void {
    this.navigatorService.pop().catch(err => console.error(err));
  }

  public add(): void {
    if (!this.selectedProgram) {
      const content: PopoverContent = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NO_PROGRAM_TITLE, Strings.SHOPPING_LIST_NO_PROGRAM_MESSAGE, undefined);
      this.popoversProvider.show(content);
      return;
    }

    this.saveItemToList();
  }

  public saveItemToList(): void {
    const listItem: ShoppingListItem = {
      product: this.product,
      program_number: this.selectedProgram.PROGRAM_NO,
      item_price: parseFloat(this.selectedProgram.PRICE),
      quantity: this.quantity
    };

    this.loader.show();
    // TODO: UPDATE WHEN APIS ARE READY
    this.shoppingListsProvider.addItemToShoppingList(this.listForm.value.listOptions, listItem, this.listForm.value.listOptions.isMarketOnly).subscribe(() => {
      this.loader.hide();
      this.cancel();
    });
  }

  public checkProductInList(listId: number): void {
    this.shoppingListsProvider.checkProductInList(this.product.SKU, listId, this.selectedProgram.PROGRAM_NO).subscribe((data: APIResponse) => {
      const temp: string = JSON.parse(data.d).Status;
      const response: boolean = (temp === 'True');
      if (response) {
        this.isAddBtnDisabled = true;
        this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_EXISTING_PRODUCT));
      } else {
        this.isAddBtnDisabled = false;
      }
    });

  }

  public reset(content: PopoverContent): void {
    this.popoversProvider.show(content);
    this.isAddBtnDisabled = true;
    this.listForm.controls.listOptions.reset();
  }


  public selectList(selectedList: ShoppingList): void {
    if (this.isMarketOnlyProduct && ((selectedList.ListType.toString() !== Constants.MARKET_ONLY_LIST_TYPE) && (selectedList.ListType.toString() !== Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_MARKET_ONLY_PRODUCT));
    } else if (!this.isMarketOnlyProduct && ((selectedList.ListType.toString() === Constants.MARKET_ONLY_LIST_TYPE) || (selectedList.ListType.toString() === Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_DEFAULT_PRODUCT));

    } else {
      this.checkProductInList(selectedList.ListID);
    }
  }
}
