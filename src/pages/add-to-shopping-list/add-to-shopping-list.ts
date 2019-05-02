import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ItemProgram} from "../../interfaces/models/item-program";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Constants from "../../util/constants";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {LoadingProvider} from "../../providers/loading/loading";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProgramProvider} from "../../providers/program/program";
import {Subscription} from 'rxjs';

@Component({
  selector: 'page-add-to-shopping-list',
  templateUrl: 'add-to-shopping-list.html',
})
export class AddToShoppingListPage implements OnInit {

  private product: Product;
  private selectedProgram: ItemProgram;
  private quantity: number = 0;
  private productLists = [];
  private quantityItemPrice: number = 0;
  public isAddBtnDisabled: boolean = false;
  public shoppingLists = [];
  public listForm: FormGroup;
  public model: any = {};
  public isMarketOnlyProduct: boolean = false;
  public subscription: Subscription;
  public menuCustomButtons = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider,
              private formBuilder: FormBuilder,
              private loading: LoadingProvider,
              private programProvider: ProgramProvider) {
    this.menuCustomButtons.push({action: 'addList', icon: 'add'})
  }

  ngOnInit(): void {
    this.loading.presentSimpleLoading();
    this.product = this.navParams.get('product');
    this.selectedProgram = this.navParams.get('selectedProgram');
    this.quantity = this.navParams.get('quantity');
    this.quantityItemPrice = this.navParams.get('quantityItemPrice');

    this.listForm = this.formBuilder.group({
      listOptions: [this.model.listOptions, Validators.required],
    });

    this.initShoppingListInformation();
  }

  initShoppingListInformation() {
    Promise.all(
      [this.programProvider.isMarketOnlyProgram(this.selectedProgram.PROGRAM_NO),
        this.shoppingListsProvider.getShoppingListForProduct(this.product.SKU),
        this.shoppingListsProvider.getLocalShoppingLists()]
    ).then(([programData, productLists, shoppingLists]) => {
      this.setProductList(productLists);
      this.checkMarketOnlyProduct(programData);
      this.setAllShoppingList(shoppingLists);
      this.loading.hideLoading();
    }).catch(error => console.error(error));
  }

  setProductList(productLists) {
    for (let i = 0; i < productLists.rows.length; i++) {
      this.productLists[productLists.rows.item(i).id] = productLists.rows.item(i).id;
    }
  }

  checkMarketOnlyProduct(data) {
    if (data.rows.length > 0) {
      this.isMarketOnlyProduct = data.rows.item(0) === Constants.MARKET_ONLY_PROGRAM;
    }
    this.listForm.value.listOptions = data.rows.item(0) === Constants.MARKET_ONLY_PROGRAM ? Constants.MARKET_ONLY_LIST_ID : Constants.DEFAULT_LIST_ID;
    this.checkProductInList(this.listForm.value.listOptions);
  }

  setAllShoppingList(shoppingLists) {
    if (shoppingLists.rows.length) {
      for (let i = 0; i < shoppingLists.rows.length; i++) {
        let list: ShoppingList = {
          id: shoppingLists.rows.item(i).id,
          name: shoppingLists.rows.item(i).name,
          description: shoppingLists.rows.item(i).description
        };
        this.shoppingLists.push(list);
      }
    }
  }

  newShoppingList() {
    let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined,
      Constants.SAVE, Constants.CANCEL, undefined, Constants.POPOVER_NEW_SHOPPING_LIST);
    this.subscription = this.popoversProvider.show(content).subscribe(data => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          if (status === 'available') {
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).then(addedList => {
              let list: ShoppingList =
                {
                  id: addedList.insertId,
                  name: data.listName,
                  description: data.listDescription
                };
              this.shoppingLists.push(list);
              this.listForm.value.listOptions = list.id;
            });
          } else {
            let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
            this.popoversProvider.show(content);
          }
          this.subscription.unsubscribe();
        });
      }
    });
  }

  cancel() {
    this.navCtrl.pop().catch(err => console.error(err));
  }

  add() {
    if (!this.selectedProgram) {
      let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NO_PROGRAM_TITLE, Constants.SHOPPING_LIST_NO_PROGRAM_MESSAGE, undefined);
      this.popoversProvider.show(content);
      return;
    }

    this.saveItemToList();
  }

  saveItemToList() {
    let listItem: ShoppingListItem = {
      product: this.product,
      program_number: this.selectedProgram.PROGRAM_NO,
      item_price: this.quantityItemPrice,
      quantity: this.quantity
    };

    this.loading.presentSimpleLoading();
    this.shoppingListsProvider.addItemToShoppingList(this.listForm.value.listOptions, listItem).then(() => {
      this.loading.hideLoading();
      this.cancel();
    }).catch(error => console.error(error));
  }

  checkProductInList(listId: number) {
    if (this.productLists[listId] === listId) {
      this.isAddBtnDisabled = true;
      this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_EXISTING_PRODUCT));
    } else {
      this.isAddBtnDisabled = false;
    }
  }

  reset(content) {
    this.popoversProvider.show(content);
    this.isAddBtnDisabled = true;
    this.listForm.controls.listOptions.reset();
  }

  selectList(listId: number) {
    if (this.isMarketOnlyProduct === true && listId !== Constants.MARKET_ONLY_LIST_ID) {
      this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_MARKET_ONLY_PRODUCT));
    } else if (this.isMarketOnlyProduct === false && listId === Constants.MARKET_ONLY_LIST_ID) {
      this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_DEFAULT_PRODUCT));
    } else {
      this.checkProductInList(listId);
    }
  }
}
