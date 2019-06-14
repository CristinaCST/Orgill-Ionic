import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import { PopoversService } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { LoadingService } from '../../services/loading/loading';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramProvider } from '../../providers/program/program';
import { Subscription } from 'rxjs';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'page-add-to-shopping-list',
  templateUrl: 'add-to-shopping-list.html'
})
export class AddToShoppingListPage implements OnInit {

  private product: Product;
  private selectedProgram: ItemProgram;
  private quantity: number = 0;
  private readonly productLists: ShoppingList[] = [];
  private quantityItemPrice: number = 0;
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
    this.product = this.navParams.get('product');
    this.selectedProgram = this.navParams.get('selectedProgram');
    this.quantity = this.navParams.get('quantity');
    this.quantityItemPrice = this.navParams.get('quantityItemPrice');

    this.listForm = this.formBuilder.group({
      listOptions: [this.model.listOptions, Validators.required]
    });

    this.initShoppingListInformation();
  }

  public initShoppingListInformation() {
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

  public setProductList(productLists) {
    // for (let i = 0; i < productLists.rows.length; i++) {
    //   this.productLists[productLists.rows.item(i).id] = productLists.rows.item(i).id;
    // }
    for (let i = 0; i < productLists.length; i++) {
      this.productLists[productLists[i].id] = productLists[i].id;
    }
  }

  public checkMarketOnlyProduct(data) {
    const programType = data.rows.item(0);
    if (data.rows.length > 0) {
      this.isMarketOnlyProduct = programType.market_only === Constants.MARKET_ONLY_PROGRAM;
    }
    // this.listForm.value.listOptions = data.rows.item(0).market_only.toString() === Constants.MARKET_ONLY_PROGRAM ? Constants.MARKET_ONLY_LIST_ID : Constants.DEFAULT_LIST_ID;
    this.listForm.value.listOptions = programType.market_only === Constants.MARKET_ONLY_PROGRAM ? LocalStorageHelper.getFromLocalStorage(Constants.MARKET_ONLY_LIST_ID) : this.listForm.value.listOptions = LocalStorageHelper.getFromLocalStorage(Constants.DEFAULT_LIST_ID);

    this.checkProductInList(this.listForm.value.listOptions);
  }

  public setAllShoppingList(data) {
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

    const shoppingLists = JSON.parse(data.d);
    const specialLists = [];  // Can't use sort because 1 should be first, then 2 then 0.

    if (shoppingLists.length) {
      for (let i = 0; i < shoppingLists.length; i++) {
        const list: ShoppingList = {
          ListID: shoppingLists[i].shopping_list_id,
          ListName: shoppingLists[i].list_name,
          ListDescription: shoppingLists[i].list_description,
          ListType: shoppingLists[i].list_type
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

  public newShoppingList() {
    const content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined,
      Strings.MODAL_BUTTON_SAVE, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_NEW_SHOPPING_LIST);
    this.subscription = this.popoversProvider.show(content).subscribe(data => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          data.type = data.type === 'default' ? Constants.CUSTOM_SHOPPING_LIST_TYPE : Constants.MARKET_ONLY_CUSTOM_TYPE;
          if (status === 'available') {
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).subscribe(resp => {
              const addedList = JSON.parse(resp.d)[0];
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
            const modalContent = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
            this.popoversProvider.show(modalContent);
          }
          this.subscription.unsubscribe();
        });
      }
    });
  }

  public cancel() {
    this.navigatorService.pop().catch(err => console.error(err));
  }

  public add() {
    if (!this.selectedProgram) {
      const content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NO_PROGRAM_TITLE, Strings.SHOPPING_LIST_NO_PROGRAM_MESSAGE, undefined);
      this.popoversProvider.show(content);
      return;
    }

    this.saveItemToList();
  }

  public saveItemToList() {
    const listItem: ShoppingListItem = {
      product: this.product,
      program_number: this.selectedProgram.PROGRAM_NO,
      item_price: this.quantityItemPrice,
      quantity: this.quantity
    };


    this.loader.show();
    // TODO: UPDATE WHEN APIS ARE READY
    this.shoppingListsProvider.addItemToShoppingList(this.listForm.value.listOptions, listItem, this.listForm.value.listOptions.isMarketOnly).subscribe(() => {
      this.loader.hide();
      this.cancel();
    });
  }

  public checkProductInList(listId: number) {
    this.shoppingListsProvider.checkProductInList(this.product.SKU, listId, this.selectedProgram.PROGRAM_NO).subscribe(data => {
      const temp = JSON.parse(data.d).Status;
      const response = (temp === 'True');
      if (response) {
        this.isAddBtnDisabled = true;
        this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_EXISTING_PRODUCT));
      } else {
        this.isAddBtnDisabled = false;
      }
    });

  }

  public reset(content) {
    this.popoversProvider.show(content);
    this.isAddBtnDisabled = true;
    this.listForm.controls.listOptions.reset();
  }


  public selectList(selectedList: ShoppingList) {
    if (this.isMarketOnlyProduct && ((selectedList.ListType.toString() !== Constants.MARKET_ONLY_LIST_TYPE) && (selectedList.ListType.toString() !== Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_MARKET_ONLY_PRODUCT));
    } else if (!this.isMarketOnlyProduct && ((selectedList.ListType.toString() === Constants.MARKET_ONLY_LIST_TYPE) || (selectedList.ListType.toString() === Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_DEFAULT_PRODUCT));

    } else {
      this.checkProductInList(selectedList.ListID);
    }
  }
}
